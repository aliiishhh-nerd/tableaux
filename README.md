# Tableaux — Social Dining Platform

A full-featured social dining web app built with React. Mobile-optimized, deployable to Netlify in minutes.

---

## Features

- **Auth** — Sign in / register with role selection
- **Feed** — Discover public events, stat cards, friend activity
- **Event Cards** — Photo covers, capacity progress bars, guest pips
- **Event Detail** — Tabbed view: overview, guests, potluck
- **Host / Edit Events** — Full form with live invitation preview
- **Invitation Designer** — Custom header text, cover color swatches, font picker, image picker
- **Maps Integration** — Restaurant autocomplete → Google Maps + Apple Maps links
- **Guest Management** — Approve / deny requests as host
- **Potluck Coordination** — Add items, see full pledge list
- **Invitations Inbox** — Accept / decline received invitations
- **Profile** — Editable bio, preferences, privacy settings
- **Mobile Optimized** — Bottom nav bar, collapsible sidebar, responsive grid at all breakpoints

---

## Tech Stack

- React 18
- React Router v6
- CSS custom properties (no CSS framework)
- Context API for global state

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 16+ ([download](https://nodejs.org))
- npm (comes with Node)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm start
```

The app opens at `http://localhost:3000`. Any file change hot-reloads automatically.

---

## Deploy to Netlify

### Option A — Drag & Drop (fastest, no account needed for testing)

```bash
# Build the production bundle
npm run build
```

Then go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag the `build/` folder onto the page. Your app is live instantly.

### Option B — GitHub + Netlify (recommended for ongoing use)

1. **Push to GitHub**

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create tableaux --public --push
# or use GitHub Desktop / github.com to create and push
```

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click **"Add new site" → "Import an existing project"**
   - Choose **GitHub** and select your `tableaux` repo

3. **Build settings** (auto-detected, but verify):
   | Setting | Value |
   |---------|-------|
   | Build command | `npm run build` |
   | Publish directory | `build` |

4. Click **"Deploy site"**

Netlify auto-deploys every time you push to `main`. Every pull request gets its own preview URL.

### Option C — Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Build + deploy
npm run build
netlify deploy --prod --dir=build
```

---

## Project Structure

```
tableaux/
├── public/
│   └── index.html
├── src/
│   ├── App.js                  # Root with BrowserRouter + AppProvider
│   ├── index.js                # React entry point
│   ├── index.css               # All styles (CSS variables, responsive)
│   ├── data/
│   │   ├── seed.js             # Sample events, invites, images, places
│   │   └── utils.js            # Date formatting, color helpers
│   ├── hooks/
│   │   └── useApp.js           # Global state context (events, auth, invites)
│   ├── pages/
│   │   ├── AuthPage.js         # Sign in / register
│   │   ├── FeedPage.js         # Discover feed + stat cards
│   │   ├── EventsPage.js       # My hosted events
│   │   ├── InvitesPage.js      # Received invitations
│   │   ├── ProfilePage.js      # User profile
│   │   └── Pages.js            # All page components (source)
│   └── components/
│       ├── AppShell.js         # Sidebar + topnav + mobile bar + routing
│       ├── EventCard.js        # Reusable event card with progress bar
│       ├── EventDetailModal.js # Tabbed event detail (overview/guests/potluck)
│       ├── CreateEventModal.js # Create/edit form with invitation editor
│       └── ImagePickerModal.js # Cover image selection + upload
├── netlify.toml                # Build config + SPA redirect rule
└── package.json
```

---

## Adding a Backend (Next Steps)

The app currently uses in-memory React state. To persist data across sessions and users:

### Recommended: Supabase (free tier)

1. Create a free project at [supabase.com](https://supabase.com)
2. Run the schema below in the SQL editor:

```sql
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text,
  date date,
  time time,
  location text,
  address text,
  capacity int,
  visibility text,
  description text,
  host_id uuid references auth.users,
  image_url text,
  inv_header text,
  inv_bg text,
  created_at timestamptz default now()
);

create table guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events,
  user_id uuid references auth.users,
  status text default 'pending'
);

create table potluck_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events,
  item text,
  brought_by text
);
```

3. Install the client: `npm install @supabase/supabase-js`
4. Replace the context functions in `useApp.js` with Supabase queries

### Environment Variables for Netlify

In Netlify dashboard → Site settings → Environment variables:

```
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

---

## Customization

### Colors
All colors are CSS variables in `src/index.css` under `:root`. Change `--indigo` to rebrand the primary accent color throughout the entire app.

### Restaurant Data
The autocomplete list lives in `src/data/seed.js` → `SEED_PLACES`. Replace with a Google Places API call for live search:
```
GET https://maps.googleapis.com/maps/api/place/autocomplete/json
  ?input=<query>&types=restaurant&key=<YOUR_API_KEY>
```

### Stock Photos
Cover images are sourced from Unsplash. Swap the URLs in `src/data/seed.js` → `SEED_IMAGES`.

---

## Free Tier Limits (Netlify)

| Resource | Free limit |
|----------|-----------|
| Bandwidth | 100 GB/month |
| Build minutes | 300/month |
| Deploys | Unlimited |
| Custom domain | ✓ Free |
| HTTPS | ✓ Automatic |
| Commercial use | ✓ Allowed |

> If you exceed the free limits, your site is paused until the next billing cycle. Upgrade to Pro ($19/month) for 1 TB bandwidth and 25K build minutes.

---

## License

MIT — use freely for personal or commercial projects.
