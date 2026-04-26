// netlify/edge-functions/event-og.ts
// Intercepts requests to /e/:id and injects per-event OG / Twitter meta
// tags into the static index.html before serving. Scrapers (Twitter,
// Facebook, iMessage, Slack, etc.) don't run JS, so without this they
// only see the site-default tags from index.html — every event share
// preview would look identical.
//
// Falls through unmodified when:
//   - id isn't a valid UUID
//   - REACT_APP_SUPABASE_* env vars aren't set
//   - Supabase fetch fails (network, timeout, 404)
//   - Event doesn't exist or RLS blocks it (private events return [])
//   - Response isn't HTML
//
// Uses anon key — relies on existing RLS that allows anon SELECT for
// visibility='public' events. Private events naturally fall back to
// the default site tags, so no private event details leak to scrapers.

import type { Config } from "@netlify/edge-functions";

const escapeHtml = (s: string): string =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async (request, context) => {
  // Pull the static index.html that Netlify would have served.
  const response = await context.next();
  if (!response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }

  // Extract id from /e/<id>
  const url = new URL(request.url);
  const id = url.pathname.replace(/^\/e\//, "").split("/")[0];
  if (!UUID_RE.test(id)) return response;

  // Env (set in Netlify dashboard; same vars CRA uses at build time)
  const SUPABASE_URL = Deno.env.get("REACT_APP_SUPABASE_URL") ?? "";
  const ANON = Deno.env.get("REACT_APP_SUPABASE_ANON_KEY") ?? "";
  if (!SUPABASE_URL || !ANON) return response;

  // Fetch the event via PostgREST. RLS lets anon read visibility='public'
  // events; private events return an empty array and we fall through.
  let events: any[];
  try {
    const dbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/events?select=id,title,description,date,cover_type,cover_value,host:profiles!host_id(full_name)&id=eq.${encodeURIComponent(id)}&limit=1`,
      { headers: { apikey: ANON, Authorization: `Bearer ${ANON}` } }
    );
    if (!dbRes.ok) return response;
    events = await dbRes.json();
  } catch {
    return response;
  }
  if (!Array.isArray(events) || events.length === 0) return response;
  const event = events[0];

  // Image: reuse cover_value if it's an actual image URL; else default.
  const ogImage =
    event.cover_type === "image" && event.cover_value
      ? event.cover_value
      : "https://tablefolk.club/og-image.png";

  // Description: "Friday, April 25 · with Alicia" — date and/or host,
  // joined with a middle dot. Fall back to a generic line if neither.
  const date = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";
  const hostField = event.host;
  const hostName =
    (Array.isArray(hostField) ? hostField[0]?.full_name : hostField?.full_name) ||
    "";
  const description =
    [date, hostName && `with ${hostName}`].filter(Boolean).join(" · ") ||
    "A TableFolk event";

  const title = `${event.title || "Event"} — TableFolk`;
  const eventUrl = `https://tablefolk.club/e/${event.id}`;

  const html = await response.text();
  const modified = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta property="og:title" content="[^"]*"\s*\/?>/g,
      `<meta property="og:title" content="${escapeHtml(title)}"/>`
    )
    .replace(
      /<meta property="og:description" content="[^"]*"\s*\/?>/g,
      `<meta property="og:description" content="${escapeHtml(description)}"/>`
    )
    .replace(
      /<meta property="og:image" content="[^"]*"\s*\/?>/g,
      `<meta property="og:image" content="${escapeHtml(ogImage)}"/>`
    )
    .replace(
      /<meta property="og:url" content="[^"]*"\s*\/?>/g,
      `<meta property="og:url" content="${escapeHtml(eventUrl)}"/>`
    )
    .replace(
      /<meta name="twitter:title" content="[^"]*"\s*\/?>/g,
      `<meta name="twitter:title" content="${escapeHtml(title)}"/>`
    )
    .replace(
      /<meta name="twitter:description" content="[^"]*"\s*\/?>/g,
      `<meta name="twitter:description" content="${escapeHtml(description)}"/>`
    )
    .replace(
      /<meta name="twitter:image" content="[^"]*"\s*\/?>/g,
      `<meta name="twitter:image" content="${escapeHtml(ogImage)}"/>`
    );

  return new Response(modified, response);
};

export const config: Config = { path: "/e/:id" };
