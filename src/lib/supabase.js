// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Disable gotrue's navigator.locks usage. It caused parallel data fetches
// (Promise.allSettled with 3-4 concurrent calls) to reject with
// "Lock was released because another request stole it". Single-tab usage
// + idempotent server-side refresh makes cross-tab races a non-concern here.
const noopLock = async (_name, _acquireTimeout, fn) => fn();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { lock: noopLock },
});

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signUp = async (email, password, fullName, handle) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, ...(handle ? { handle } : {}) } },
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const getProfile = async (userId) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
};

// Maps app field names to Supabase column names
export const updateProfile = async (userId, updates) => {
  const mapped = {};
  if (updates.name !== undefined)                 mapped.full_name = updates.name;
  if (updates.full_name !== undefined)             mapped.full_name = updates.full_name;
  if (updates.avatar !== undefined)               mapped.avatar_url = updates.avatar;
  if (updates.avatar_url !== undefined)           mapped.avatar_url = updates.avatar_url;
  if (updates.bio !== undefined)                  mapped.bio = updates.bio;
  if (updates.city !== undefined)                 mapped.city = updates.city;
  if (updates.website !== undefined)              mapped.website = updates.website;
  if (updates.handle !== undefined)               mapped.handle = updates.handle;
  if (updates.favoriteFood !== undefined)         mapped.favorite_food = updates.favoriteFood;
  if (updates.favoriteRestaurant !== undefined)   mapped.favorite_restaurant = updates.favoriteRestaurant;
  if (updates.dietaryRestrictions !== undefined)  mapped.dietary_restrictions = updates.dietaryRestrictions;
  if (Object.keys(mapped).length === 0) return null;
  const { data, error } = await supabase.from('profiles').update(mapped).eq('id', userId).select().single();
  if (error) throw error;
  return data;
};

// Returns ALL public published upcoming events — no city filter (no city column until migration).
// Explicitly filters is_public = true even though RLS allows it; belt-and-suspenders and it makes
// the query plan faster.
export const getPublicEvents = async ({ city } = {}) => {
  const today = new Date().toISOString().split('T')[0];
  // Include date polls (date IS NULL) AND upcoming events (date >= today).
  // PostgREST .or() takes a comma-separated list inside parentheses.
  let query = supabase
    .from('events')
    .select('*, host:profiles(id, full_name, avatar_url, username), rsvp_count:rsvps(count)')
    .eq('is_public', true)
    .eq('status', 'published')
    .or(`date.is.null,date.gte.${today}`)
    .order('date', { ascending: true, nullsFirst: false });
  if (city) query = query.eq('city', city);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getEventById = async (eventId) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, host:profiles(id, full_name, avatar_url, username, bio), rsvps(*, guest:profiles(id, full_name, avatar_url)), potluck_items(*), moments(*, author:profiles(id, full_name, avatar_url))')
    .eq('id', eventId)
    .single();
  if (error) throw error;
  return data;
};

export const getHostEvents = async (hostId) => {
  const { data, error } = await supabase
    .from('events')
    .select('*, rsvps(*, guest:profiles(id, full_name, avatar_url))')
    .eq('host_id', hostId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
};

// UI visibility labels (as sent by the select element) -> canonical storage value.
// Canonical = the lowercase enum FeedPage filters on: 'public' | 'friendsOnly' | 'inviteOnly'.
// Accept legacy / variant spellings too so any caller shape works.
const VISIBILITY_MAP = {
  'Public':       'public',
  'public':       'public',
  'Friends Only': 'friendsOnly',
  'friendsOnly':  'friendsOnly',
  'friends_only': 'friendsOnly',
  'Invite Only':  'inviteOnly',
  'inviteOnly':   'inviteOnly',
  'invite_only':  'inviteOnly',
};
function normalizeVisibility(v) {
  if (!v) return 'inviteOnly';
  return VISIBILITY_MAP[v] || VISIBILITY_MAP[v.trim()] || 'inviteOnly';
}

// Translates the app's event shape to the actual DB column names.
// Accepts whatever useApp sends; filters to only known columns.

// UI event type labels -> DB enum values
// DB allows: dinner_party, potluck, supper_club, brunch, cooking_class,
//            restaurant_outing, restaurant, tasting, other
const EVENT_TYPE_MAP = {
  'Dinner Party':     'dinner_party',
  'dinner_party':     'dinner_party',
  'Potluck':          'potluck',
  'potluck':          'potluck',
  'Supper Club':      'supper_club',
  'supper_club':      'supper_club',
  'Brunch':           'brunch',
  'brunch':           'brunch',
  'Cooking Class':    'cooking_class',
  'cooking_class':    'cooking_class',
  'Restaurant':       'restaurant',
  'restaurant':       'restaurant',
  'Restaurant Outing':'restaurant_outing',
  'restaurant_outing':'restaurant_outing',
  'Tasting':          'tasting',
  'tasting':          'tasting',
  'Other':            'other',
  'other':            'other',
};
function normalizeEventType(t) {
  if (!t) return 'other';
  return EVENT_TYPE_MAP[t] || EVENT_TYPE_MAP[t.trim()] || 'other';
}

function mapEventToDb(evt) {
  const out = {};
  // Required / always-present
  if (evt.title !== undefined)            out.title = evt.title;
  if (evt.host_id !== undefined)          out.host_id = evt.host_id;
  if (evt.description !== undefined)      out.description = evt.description;
  if (evt.status !== undefined)           out.status = evt.status;
  if (evt.is_public !== undefined)        out.is_public = evt.is_public;

  // Type — app uses `type`, DB uses `event_type`, with strict check constraint
  if (evt.type !== undefined)             out.event_type = normalizeEventType(evt.type);
  if (evt.event_type !== undefined)       out.event_type = normalizeEventType(evt.event_type);

  // Location — app uses `location`/`address`, DB uses `location_name`/`location_address`
  if (evt.location !== undefined)         out.location_name = evt.location;
  if (evt.location_name !== undefined)    out.location_name = evt.location_name;
  if (evt.address !== undefined)          out.location_address = evt.address;
  if (evt.location_address !== undefined) out.location_address = evt.location_address;

  // Date / time
  if (evt.date !== undefined)             out.date = evt.date;
  if (evt.time !== undefined)             out.time = evt.time;

  // Capacity
  if (evt.capacity !== undefined)         out.capacity = evt.capacity;

  // Cover
  if (evt.cover_emoji !== undefined)      out.cover_emoji = evt.cover_emoji;
  if (evt.cover_gradient !== undefined)   out.cover_gradient = evt.cover_gradient;
  if (evt.cover_type !== undefined)       out.cover_type = evt.cover_type;
  if (evt.cover_value !== undefined)      out.cover_value = evt.cover_value;

  // Post-migration columns
  if (evt.addr_hidden !== undefined)      out.addr_hidden = evt.addr_hidden;
  if (evt.dress_code !== undefined)       out.dress_code = evt.dress_code;
  if (evt.visibility !== undefined)       out.visibility = normalizeVisibility(evt.visibility);
  if (evt.city !== undefined)             out.city = evt.city;

  return out;
}

export const createEvent = async (eventData) => {
  const payload = mapEventToDb(eventData);
  console.log('[supabase.createEvent] payload:', payload);
  const { data, error } = await supabase.from('events').insert(payload).select().single();
  if (error) {
    console.error('[supabase.createEvent] ERROR:', error);
    throw error;
  }
  console.log('[supabase.createEvent] success:', data);
  return data;
};

export const updateEvent = async (eventId, updates) => {
  const payload = mapEventToDb(updates);
  const { data, error } = await supabase
    .from('events')
    .update(payload)
    .eq('id', eventId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const createRsvp = async (eventId, guestId, message = '', status = 'pending') => {
  const { data, error } = await supabase
    .from('rsvps')
    .upsert({ event_id: eventId, guest_id: guestId, message, status }, { onConflict: 'event_id,guest_id' })
    .select().single();
  if (error) throw error;
  return data;
};

export const updateRsvpStatus = async (rsvpId, status) => {
  const { data, error } = await supabase.from('rsvps').update({ status }).eq('id', rsvpId).select().single();
  if (error) throw error;
  return data;
};

export const getGuestRsvps = async (guestId) => {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*, event:events(*, host:profiles(id, full_name, avatar_url))')
    .eq('guest_id', guestId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

// ============================================================
// Functions referenced by useApp.js that may or may not exist here.
// Re-export stubs if missing so imports don't break.
// ============================================================
export const addMoment = async (eventId, authorId, imageUrl, caption) => {
  const { data, error } = await supabase
    .from('moments')
    .insert({ event_id: eventId, author_id: authorId, image_url: imageUrl, caption })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getFriendships = async (userId) => {
  const { data, error } = await supabase
    .from('friendships')
    .select('*, friend:profiles!friendships_friend_id_fkey(id, full_name, avatar_url)')
    .eq('user_id', userId);
  // Table may not exist yet — treat as empty, don't crash.
  if (error) {
    console.warn('[getFriendships] error:', error.message);
    return [];
  }
  return data || [];
};

export const sendFriendRequestDb = async (userId, friendId) => {
  const { data, error } = await supabase
    .from('friendships')
    .insert({ user_id: userId, friend_id: friendId, status: 'pending' })
    .select()
    .single();
  if (error) { console.warn('[sendFriendRequestDb]', error.message); return null; }
  return data;
};

export const acceptFriendRequestDb = async (userId, friendId) => {
  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .match({ user_id: friendId, friend_id: userId })
    .select()
    .single();
  if (error) { console.warn('[acceptFriendRequestDb]', error.message); return null; }
  return data;
};

export const removeFriendDb = async (userId, friendId) => {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
  if (error) { console.warn('[removeFriendDb]', error.message); return null; }
  return true;
};
