// supabase/functions/send-event-invite/index.ts
// Sends a "You're invited" email to a single email address.
// Called by the client after a host publishes an event with email invites.
//
// Auth: deployed WITH JWT verification (i.e., NOT --no-verify-jwt). Supabase's
// gateway validates the caller's JWT before invoking. Inside, we additionally
// verify auth.uid() === event.host_id to prevent any logged-in user from
// spamming arbitrary events.
//
// Request body: { eventId: string, email: string, name?: string }

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const FROM_EMAIL = 'noreply@tablefolk.club';
const FROM_NAME = 'TableFolk';

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

serve(async (req: Request) => {
  // CORS preflight — browser sends OPTIONS before the actual POST
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
      console.error('Missing required environment variables');
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), { status: 500, headers: corsHeaders });
    }

    // 1) Identify the caller via the JWT in the Authorization header.
    //    The gateway has already verified the token's signature; we use it
    //    here to extract the user identity for the host-ownership check.
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: corsHeaders });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 401, headers: corsHeaders });
    }
    const callerId = userData.user.id;

    // 2) Parse + validate the body.
    let body: { eventId?: string; email?: string; name?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders });
    }
    const { eventId, email, name } = body;
    if (!eventId || typeof eventId !== 'string') {
      return new Response(JSON.stringify({ error: 'eventId required' }), { status: 400, headers: corsHeaders });
    }
    if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ error: 'valid email required' }), { status: 400, headers: corsHeaders });
    }

    // 3) Look up the event via service-role (bypasses RLS so we can verify
    //    ownership against any visibility, including private events).
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: event, error: evErr } = await adminClient
      .from('events')
      .select('id, title, date, city, host_id, host:profiles!host_id(full_name)')
      .eq('id', eventId)
      .single();
    if (evErr || !event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404, headers: corsHeaders });
    }

    // 4) Authorize — caller must be the event's host.
    if (event.host_id !== callerId) {
      return new Response(JSON.stringify({ error: 'Forbidden — not host' }), { status: 403, headers: corsHeaders });
    }

    // PostgREST many-to-one usually returns an object, but some supabase-js
    // versions return a one-element array. Handle both shapes.
    const hostField = (event as { host: unknown }).host as { full_name?: string } | { full_name?: string }[] | null;
    const hostName = (Array.isArray(hostField) ? hostField[0]?.full_name : hostField?.full_name) || 'A TableFolk host';

    const eventTitle = event.title || 'an event';
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'a date soon';
    const city = event.city || '';
    const ctaUrl = `https://tablefolk.club/e/${encodeURIComponent(event.id)}`;

    const subject = `${hostName} invited you to ${eventTitle} on TableFolk`;
    const leadCity = city ? ` in ${escapeHtml(city)}` : '';
    const lead = `<strong>${escapeHtml(hostName)}</strong> is hosting <strong>${escapeHtml(eventTitle)}</strong> on <strong>${escapeHtml(eventDate)}</strong>${leadCity}. You're invited.`;
    const recipientLine = name && typeof name === 'string' ? `Hi ${escapeHtml(name)},` : 'Hi,';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(subject)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f5f3ef; font-family: Arial, Helvetica, sans-serif; color: #1a1425; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
  .header { background: #1a1425; padding: 32px 40px; text-align: center; }
  .logo { font-size: 24px; font-weight: 800; color: #ffffff; }
  .logo span { color: #9b8fe8; }
  .hero { padding: 40px; text-align: center; }
  .hero .emoji { font-size: 32px; margin-bottom: 16px; display: block; }
  .hero h1 { font-size: 24px; font-weight: 800; color: #1a1425; margin-bottom: 16px; }
  .hero p { font-size: 15px; color: #6b6080; line-height: 1.7; }
  .cta-section { padding: 0 40px 40px; text-align: center; }
  .btn { display: inline-block; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; background: #6c5dd3; color: #ffffff; }
  .footer { padding: 24px 40px; text-align: center; background: #f5f3ef; }
  .footer p { font-size: 12px; color: #9b8899; line-height: 1.7; }
  .footer a { color: #6c5dd3; text-decoration: none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Table<span>Folk</span></div></div>
  <div class="hero">
    <span class="emoji">✉️</span>
    <h1>You're invited.</h1>
    <p>${recipientLine}</p>
    <p style="margin-top:12px;">${lead}</p>
  </div>
  <div class="cta-section">
    <a href="${ctaUrl}" class="btn">View Invitation</a>
  </div>
  <div class="footer">
    <p>You received this because someone invited you to their TableFolk event. No account required to view.</p>
    <p style="margin-top:12px;color:#c4b8c8;">© 2026 TableFolk · <a href="mailto:hello@tablefolk.club">hello@tablefolk.club</a></p>
  </div>
</div>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [email],
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', data);
      return new Response(JSON.stringify({ error: data }), { status: res.status, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('send-event-invite error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
