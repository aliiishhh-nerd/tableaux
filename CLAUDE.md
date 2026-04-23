# TableFolk — Project Briefing for Claude Code

## What this is

TableFolk (previously "Tableaux") is a social dining PWA for discovering and hosting intimate dining experiences — supper clubs, potlucks, dinner parties. Live at **tablefolk.club**. Founder: Alicia. Solo engineering team (Alicia + Claude).

**Scale target:** 1,000 users by end of 2026. Architecture decisions are evaluated against this, not enterprise scale.

## Stack

- React 18 SPA (Create React App)
- Supabase (auth + Postgres + Edge Functions + Realtime)
- Netlify (auto-deploy from GitHub `main` branch)
- Cloudflare (DNS + domain)
- Resend (transactional email via `noreply@tablefolk.club`)
- Make (waitlist webhook → Google Sheet sync)
- GA4 (`G-XX5382DHWQ`) on all HTML pages

**Supabase project ID:** `jrwugzljctnvcodvlvqf`
**Netlify site:** `mellifluous-biscochitos-743c75.netlify.app`
**Repo:** `github.com/aliiishhh-nerd/tableaux`, local `~/tableaux`

**localStorage keys:**
- `sb-jrwugzljctnvcodvlvqf-auth-token` — Supabase auth
- `tablefolk_state_v1` — app state (events, user, notifications, etc.)

## Operating principles (learned the hard way)

1. **Diagnose before patching.** Never propose a code change without first understanding the mechanism causing the bug. If you can't explain why the bug occurs, you're not ready to fix it. Read the relevant files with `Read`, grep for related patterns, form a concrete theory, confirm with Alicia, then patch.

2. **Show mockups / describe changes before writing UI code.** For any user-visible change, describe or sketch the change in chat first. Alicia approves direction before implementation.

3. **One testable change per commit.** Do not bundle unrelated fixes. Each commit should be independently revertible. Recent deploy history showed ~10 commits touching RSVP — that's a signal to slow down, not a precedent to continue.

4. **Never rewrite whole files unless creating them.** Always read the current file contents, target exact strings with safety checks. When using `Edit`, match unique substrings and verify the edit lands before moving on.

5. **React 18 concurrent-mode gotcha.** `setState` functional updaters (`setEvents(prev => { ... })`) run deferred in batched mode. Do NOT write code like:
   ```js
   let x = null;
   setState(prev => { x = prev.something; ... });
   if (x) doThing(x);  // x is still null here!
   ```
   This pattern was the root cause of the approval-persistence bug (Apr 22). Take values as parameters or `useRef` for stable reads.

6. **Supabase Realtime does not support SQL subqueries in filter clauses.** A filter like `filter: 'event_id=in.(select id from events where host_id=eq.${x})'` silently fails — the subscription never fires. Use no filter + in-callback checks instead. RLS enforces access.

7. **Seed users vs real users.** Seed user IDs start with `u` (e.g. `u1`, `u2`). Real user IDs are UUIDs. The helper `isRealUser(user)` gates DB calls — seed users never hit Supabase. Preserve this when editing auth/data flow.

8. **RLS rules on rsvps:** hosts can UPDATE status; guests can INSERT+SELECT their own. DELETE on rsvps is blocked for guests. Any code attempting DELETE as a guest will silently 403.

9. **Lint-gate before push.** `CI=true npx eslint --max-warnings 0 <edited-files>` then `CI=true npm run build`. Never push without both passing — Netlify build minutes are not free.

10. **Single-line terminal commands when demonstrating.** Alicia finds multi-line commands confusing in terminal output.

11. **`tablefolk_state_v1` is not the source of truth.** DB is. After making changes, verify via direct PostgREST queries, not just `localStorage.getItem`.

## Current priorities (Phase 1.5 — Stabilization)

Do not start Phase 2 features until these land:

1. **Decline-on-host regression** — Test1 declines a guest → refresh → guest reappears in "New requests" with Approve/Decline buttons. DB-persist behavior unknown. Hypothesis: the events loader filters `status != 'declined'` when hydrating guest list. Diagnose before patching.
2. **Channel 1 realtime** — Host tab open, guest RSVPs to event. Test5 case took 30+ min to surface on Test1's view; no toast fired. My Apr 22 patch removed the broken SQL subquery filter but the subscription still doesn't deliver INSERT events in useful time. Needs client-side subscription-state instrumentation.
3. **Guest count on event detail modal** — shows `1/10` even with 4 approved guests. Probably reads a cached field instead of computing from `guests` array. First file to check: `src/components/EventDetailModal.js`.
4. **Revoke exposed Resend API key.** In Resend dashboard: generate new key, then on CLI: `supabase secrets set RESEND_API_KEY=<new-key>`.
5. **Integration test** for RSVP happy path (Vitest + Supabase test client). Smallest viable safety net.
6. **Sentry** (free tier) for client error tracking.
7. **Remove fake stat cards** on FeedPage (`+2 this month`, `92% accepted`, `AL MR JW` placeholder avatars) until they compute from real data.
8. **Fix example events `mine: true` hardcode** — real users see seed events as "their events".

## Phase 2 — deferred until 1.5 is done

- Email confirmation on approval (Resend Edge Function)
- Guest-side "Can no longer make it" / withdraw RSVP button
- Notification deep-links to events
- Public events visible in Explore after RSVP with Going/Pending chip
- CreateEventModal 3-step flow restore
- Moments wiring to Supabase
- Address-hidden-on-public-events bug
- **Stripe** — deliberately last. Do not touch money until integration test passes 3 consecutive deploys.

## Test accounts (already provisioned)

All passwords: `alicia1`

| Email | Name | UUID | Role |
|---|---|---|---|
| `hello+test1@tablefolk.club` | Test1 | `4ef11fc7-f592-42a0-98e8-9def487a1324` | Host of test event |
| `hello+test2@tablefolk.club` | Test2 | `253eaedc-c931-428e-a632-6c699a83f057` | Guest |
| `hello+test3@tablefolk.club` | Test3 | `d1933a51-794e-4f5c-948b-7a9977030531` | Guest |
| `hello+test4@tablefolk.club` | Test4 | `122bb462-2540-4412-90d9-01127d79caa2` | Guest |
| `hello+test5@tablefolk.club` | Test5 | `1d657f12-9281-42c6-aba6-9f6bc06c1e3a` | Guest |

**Test event:** `e328a440-96e8-4799-9995-6e103d9d1c04` — "Test 1 – Dinner Party – Public – Poll" (Public, Chicago, date-TBD poll).

## DB schema essentials

- `events` — id, host_id, title, event_type, city, time, addr_hidden, dress_code, cover_type, cover_value, visibility, date (nullable for polls)
- `rsvps` — id, event_id, guest_id, status (`pending`|`approved`|`declined`), message, created_at. **No `updated_at` column.**
- `profiles` — id, full_name, email, etc.

`event_type` uses an enum check constraint — translate UI labels before insert (see `src/lib/supabase.js`).
`visibility` is normalized lowercase in DB (`public`|`friends`|`invite_only`); UI uses title case. Map via `VIS_MAP`.

## Deploy workflow

1. Read the file you're about to edit with `Read`.
2. Make the change with `Edit` (target a unique substring, not line numbers).
3. Run `CI=true npx eslint --max-warnings 0 <edited-files>` — fix warnings.
4. Run `CI=true npm run build` — must compile cleanly.
5. Commit with a specific message describing the one change, e.g. `Fix guest count on EventDetailModal (compute from guests array)`. Don't bundle.
6. `git push origin main`. Netlify auto-deploys in 90–120 seconds.
7. Verify on `tablefolk.club` — bundle hash should change. Hard-refresh to bust cache.

## Files I shouldn't touch without approval

- Anything in `supabase/migrations/` — migrations run in production DB already. Alicia runs SQL changes through the Supabase SQL editor, not CI.
- `netlify.toml`, `.env.production` — infrastructure. Propose changes, don't make them.
- `CLAUDE.md`, `DEPLOY_CHECKLIST.md` — documents. Alicia updates these; if you think they need changes, say so.

## When I'm stuck

Say so clearly. Do not guess. Surface the specific file/function/mechanism you don't understand and ask. The Apr 20–22 approval bug cost three sessions because guesses compounded — that mistake is not repeatable.

---

_Last updated: 2026-04-23_
