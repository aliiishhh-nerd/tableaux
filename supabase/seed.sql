-- TableFolk Supabase seed
-- Run this in the SQL editor to set up the full schema

-- ── Waitlist ──────────────────────────────────────────────────────────
create table if not exists waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  city text,
  intent text,
  created_at timestamptz default now()
);
alter table waitlist enable row level security;
drop policy if exists "Anyone can insert waitlist" on waitlist;
create policy "Anyone can insert waitlist" on waitlist
  for insert with check (true);

-- ── Profiles ─────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid references auth.users(id) primary key,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  city text,
  website text,
  role text default 'guest',
  dietary_restrictions text[],
  hosted_count int default 0,
  attended_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
drop policy if exists "Public profiles are viewable" on profiles;
create policy "Public profiles are viewable" on profiles for select using (true);
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- ── Events ───────────────────────────────────────────────────────────
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  host_id uuid references profiles(id) on delete cascade,
  title text not null,
  type text not null default 'Dinner Party',
  date date,
  time text,
  location text,
  address text,
  addr_hidden boolean default true,
  city text,
  capacity int default 10,
  visibility text default 'inviteOnly',
  description text,
  dress_code text,
  cover_type text default 'gradient',
  cover_value text,
  cover_emoji text,
  menu jsonb,
  potluck jsonb,
  tasting jsonb,
  playlist jsonb,
  status text default 'published',
  is_ended boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table events enable row level security;
drop policy if exists "Public events viewable by all" on events;
create policy "Public events viewable by all" on events for select using (
  visibility = 'public' or host_id = auth.uid()
);
drop policy if exists "Hosts can insert events" on events;
create policy "Hosts can insert events" on events for insert with check (
  auth.uid() = host_id
);
drop policy if exists "Hosts can update own events" on events;
create policy "Hosts can update own events" on events for update using (
  auth.uid() = host_id
);

-- ── RSVPs ─────────────────────────────────────────────────────────────
create table if not exists rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  guest_id uuid references profiles(id) on delete cascade,
  status text default 'pending',
  message text,
  dietary_note text,
  created_at timestamptz default now(),
  unique(event_id, guest_id)
);
alter table rsvps enable row level security;
drop policy if exists "Guests can view own rsvps" on rsvps;
create policy "Guests can view own rsvps" on rsvps for select using (
  guest_id = auth.uid() or
  event_id in (select id from events where host_id = auth.uid())
);
drop policy if exists "Guests can insert rsvps" on rsvps;
create policy "Guests can insert rsvps" on rsvps for insert with check (
  auth.uid() = guest_id
);
drop policy if exists "Hosts can update rsvp status" on rsvps;
create policy "Hosts can update rsvp status" on rsvps for update using (
  event_id in (select id from events where host_id = auth.uid())
);

-- ── Passport stamps ───────────────────────────────────────────────────
create table if not exists passport_stamps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  event_id uuid references events(id) on delete cascade,
  awarded_at timestamptz default now(),
  unique(user_id, event_id)
);
alter table passport_stamps enable row level security;
drop policy if exists "Users can view own stamps" on passport_stamps;
create policy "Users can view own stamps" on passport_stamps for select using (
  user_id = auth.uid()
);

-- ── Moments (post-event comments) ────────────────────────────────────
create table if not exists moments (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade,
  author_id uuid references profiles(id) on delete cascade,
  text text,
  image_url text,
  caption text,
  is_pinned boolean default false,
  created_at timestamptz default now()
);
alter table moments enable row level security;
drop policy if exists "Moments viewable by event guests" on moments;
create policy "Moments viewable by event guests" on moments for select using (true);
drop policy if exists "Authors can insert moments" on moments;
create policy "Authors can insert moments" on moments for insert with check (
  auth.uid() = author_id
);

-- ── Auto-create profile on signup ─────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    split_part(new.email, '@', 1)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
