// supabase/functions/send-rsvp-email/index.ts
// Triggered by a Supabase Database Webhook on rsvps UPDATE.
// Sends an RSVP-approval email via Resend with a deep-link CTA back
// to the event modal at /invites?openEvent=<eventId>.
//
// Webhook auth: shared secret in X-Webhook-Secret header, compared
// against WEBHOOK_SECRET env var. Function deployed --no-verify-jwt.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET') ?? '';
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

serve(async (req: Request) => {
  try {
    // Shared-secret webhook auth — fail fast before any DB lookup.
    if (!WEBHOOK_SECRET) {
      console.error('WEBHOOK_SECRET not set');
      return new Response(JSON.stringify({ error: 'WEBHOOK_SECRET not set' }), { status: 500 });
    }
    if (req.headers.get('X-Webhook-Secret') !== WEBHOOK_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await req.json();

    // Database Webhook payload shape:
    // { type: 'UPDATE', table: 'rsvps', record: {...new}, old_record: {...old}, schema: 'public' }
    const newRow = body.record || body.new || body;
    const oldRow = body.old_record || body.old || {};

    // Only act on transitions TO 'approved'.
    if (newRow?.status !== 'approved') {
      return new Response(JSON.stringify({ skipped: 'not approved' }), { status: 200 });
    }
    if (oldRow?.status === 'approved') {
      return new Response(JSON.stringify({ skipped: 'already approved' }), { status: 200 });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), { status: 500 });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Supabase admin creds not set' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Guest email — profiles table doesn't carry email; use auth admin API.
    const { data: guestUser, error: guestErr } = await supabase.auth.admin.getUserById(newRow.guest_id);
    if (guestErr || !guestUser?.user?.email) {
      console.error('guest lookup failed:', guestErr);
      return new Response(JSON.stringify({ error: 'guest not found' }), { status: 500 });
    }
    const guestEmail = guestUser.user.email;

    // Event + host name in a single query via PostgREST embedding.
    const { data: event, error: evErr } = await supabase
      .from('events')
      .select('id, title, date, host:profiles!host_id(full_name)')
      .eq('id', newRow.event_id)
      .single();
    if (evErr || !event) {
      console.error('event lookup failed:', evErr);
      return new Response(JSON.stringify({ error: 'event not found' }), { status: 500 });
    }

    // Defensive host shape — PostgREST many-to-one usually returns an object,
    // but some supabase-js versions return a one-element array. Handle both.
    const host = (event as { host: unknown }).host as { full_name?: string } | { full_name?: string }[] | null;
    const hostName = (Array.isArray(host) ? host[0]?.full_name : host?.full_name) || 'your host';

    const eventTitle = event.title || 'an event';
    const eventDate = event.date
      ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : 'a date soon';
    const ctaUrl = `https://tablefolk.club/invites?openEvent=${encodeURIComponent(event.id)}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>You're going to ${escapeHtml(eventTitle)}</title>
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
    <span class="emoji">🥂</span>
    <h1>You're in.</h1>
    <p><strong>${escapeHtml(hostName)}</strong> confirmed your RSVP for <strong>${escapeHtml(eventTitle)}</strong> on <strong>${escapeHtml(eventDate)}</strong>.</p>
  </div>
  <div class="cta-section">
    <a href="${ctaUrl}" class="btn">View event details →</a>
  </div>
  <div class="footer">
    <p>Questions? <a href="mailto:hello@tablefolk.club">hello@tablefolk.club</a></p>
    <p style="margin-top:12px;color:#c4b8c8;">© 2026 TableFolk</p>
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
        to: [guestEmail],
        subject: `You're going to ${eventTitle} 🎉`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend error:', data);
      return new Response(JSON.stringify({ error: data }), { status: res.status });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), { status: 200 });

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
