// supabase/functions/send-welcome-email/index.ts
// Triggered by a Supabase Auth webhook on user signup
// Sends a welcome / getting-started email via Resend

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = 'hello@tablefolk.club';
const FROM_NAME = 'TableFolk';

// Inline the welcome email HTML here (trimmed for Edge Function size limits)
// Full HTML is in welcome-email.html — paste it into the WELCOME_HTML constant below
const WELCOME_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to TableFolk</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f5f3ef; font-family: Arial, Helvetica, sans-serif; color: #1a1425; }
  .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
  .header { background: #1a1425; padding: 32px 40px; text-align: center; }
  .logo { font-size: 24px; font-weight: 800; color: #ffffff; }
  .logo span { color: #9b8fe8; }
  .hero { padding: 40px; border-bottom: 1px solid #f0edf7; }
  .hero h1 { font-size: 24px; font-weight: 800; color: #1a1425; margin-bottom: 12px; }
  .hero p { font-size: 15px; color: #6b6080; line-height: 1.7; }
  .section { padding: 32px 40px; border-bottom: 1px solid #f0edf7; }
  .path-card { background: #faf8ff; border: 1.5px solid #e8e3f8; border-radius: 12px; padding: 24px; margin-bottom: 12px; }
  .path-title { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
  .path-desc { font-size: 14px; color: #6b6080; line-height: 1.6; margin-bottom: 16px; }
  .btn { display: inline-block; padding: 13px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; }
  .btn-primary { background: #6c5dd3; color: #ffffff; }
  .btn-secondary { background: #f0edf7; color: #6c5dd3; }
  .footer { padding: 24px 40px; text-align: center; background: #f5f3ef; }
  .footer p { font-size: 12px; color: #9b8899; line-height: 1.7; }
  .footer a { color: #6c5dd3; text-decoration: none; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header"><div class="logo">Table<span>Folk</span></div></div>
  <div class="hero">
    <p style="font-size:32px;margin-bottom:16px;">🍽️</p>
    <h1>Your seat at the table is ready.</h1>
    <p>Welcome to TableFolk — the place where food lovers host, discover, and attend intimate dining experiences. Here's how to get started.</p>
  </div>
  <div class="section">
    <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#9b8fe8;margin-bottom:20px;">Choose your path</p>
    <div class="path-card">
      <p style="font-size:28px;margin-bottom:12px;">👨‍🍳</p>
      <div class="path-title">I want to host an event</div>
      <div class="path-desc">Turn your dining room into a supper club, organize a potluck, or pull together a restaurant group.</div>
      <p style="font-size:13px;color:#4a3f6b;line-height:1.7;margin-bottom:16px;">
        → Go to <strong>My Events</strong> and tap <strong>+ New Event</strong><br/>
        → Choose your event type and set your date<br/>
        → Set visibility: Public, Friends Only, or Invite Only<br/>
        → Publish and approve guest RSVPs
      </p>
      <a href="https://tablefolk.club/events" class="btn btn-primary">Create your first event →</a>
    </div>
    <div class="path-card">
      <p style="font-size:28px;margin-bottom:12px;">🥂</p>
      <div class="path-title">I want to find a dinner</div>
      <div class="path-desc">Discover intimate events near you and meet people who love food as much as you do.</div>
      <p style="font-size:13px;color:#4a3f6b;line-height:1.7;margin-bottom:16px;">
        → Go to <strong>Explore</strong> to browse events in your city<br/>
        → Tap <strong>Request to join</strong> on any public event<br/>
        → The host reviews your profile and confirms your spot<br/>
        → After the event, post a Moment to stamp your Dining Passport
      </p>
      <a href="https://tablefolk.club/feed" class="btn btn-secondary">Explore events near you →</a>
    </div>
  </div>
  <div class="section" style="border-bottom:none;">
    <div style="background:#f0edf7;border-radius:10px;padding:16px 20px;">
      <p style="font-size:13px;color:#4a3f6b;line-height:1.6;">
        <strong style="color:#6c5dd3;">💡 First-timer tip:</strong> The best TableFolk hosts start small — 6 to 8 guests, one cuisine they love, and a menu they've cooked before. The intimacy is the point.
      </p>
    </div>
  </div>
  <div class="footer">
    <p>Questions? <a href="mailto:hello@tablefolk.club">hello@tablefolk.club</a></p>
    <p style="margin-top:8px;"><a href="https://tablefolk.club/terms">Terms</a> &nbsp;·&nbsp; <a href="https://tablefolk.club/privacy">Privacy</a> &nbsp;·&nbsp; <a href="https://tablefolk.club/faq">Help</a></p>
    <p style="margin-top:12px;color:#c4b8c8;">© 2026 TableFolk · You're receiving this because you just joined.</p>
  </div>
</div>
</body>
</html>`;

serve(async (req: Request) => {
  try {
    const body = await req.json();

    // Supabase Auth webhook sends user data in body.record
    const user = body.record || body.user || body;
    const email = user.email;
    const name = user.raw_user_meta_data?.full_name || user.email?.split('@')[0] || 'there';

    if (!email) {
      return new Response(JSON.stringify({ error: 'No email in payload' }), { status: 400 });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not set' }), { status: 500 });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [email],
        subject: `Welcome to TableFolk, ${name} 🍽️`,
        html: WELCOME_HTML.replace('there', name),
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
