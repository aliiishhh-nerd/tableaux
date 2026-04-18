import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = 'TableFolk <noreply@tablefolk.club>'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const { email, city, intent } = await req.json()

    const cityNames: Record<string, string> = {
      chicago: 'Chicago', newyork: 'New York', losangeles: 'Los Angeles',
      sandiego: 'San Diego', seattle: 'Seattle', austin: 'Austin', other: 'your area'
    }
    const cityName = cityNames[city] || city || 'your area'

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>You're on the TableFolk waitlist</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif">
<div style="max-width:580px;margin:0 auto;padding:40px 20px">
  <div style="background:#faf8f4;border-radius:16px;overflow:hidden;border:1px solid rgba(90,70,160,0.12)">
    <div style="background:#1a1425;padding:40px 40px 32px;text-align:center">
      <div style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#faf8f4;letter-spacing:-.5px">
        Table<span style="color:#7c6fef;font-style:italic">Folk</span>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,.4);letter-spacing:1.5px;text-transform:uppercase;margin-top:8px">Your seat is reserved</div>
    </div>
    <div style="padding:44px 40px">
      <div style="font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#5b4de0;margin-bottom:18px">Welcome to the table</div>
      <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:400;line-height:1.2;color:#1a1425;margin-bottom:20px;letter-spacing:-.5px">
        You're on the<br><em style="font-style:italic;color:#5b4de0">TableFolk</em> waitlist
      </h1>
      <div style="display:inline-block;background:#f0eeff;border:1px solid rgba(91,77,224,.25);color:#3c3489;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;font-family:Helvetica Neue,Arial,sans-serif;margin-bottom:24px">
        📍 ${cityName}
      </div>
      <p style="font-size:15px;line-height:1.8;color:#4a4260;margin-bottom:20px;font-family:Helvetica Neue,Arial,sans-serif">
        We're so glad you're here. TableFolk is being built for people like you — food lovers who believe the best conversations happen around a table.
      </p>
      <div style="background:#f5f0e8;border-radius:12px;padding:24px;margin-bottom:24px">
        <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#8b7ea8;margin-bottom:16px;font-family:Helvetica Neue,Arial,sans-serif">What happens next</div>
        <div style="display:flex;gap:14px;margin-bottom:12px;align-items:flex-start">
          <div style="width:26px;height:26px;border-radius:50%;background:#5b4de0;color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:Helvetica Neue,Arial,sans-serif;line-height:26px;text-align:center">1</div>
          <div style="font-size:14px;line-height:1.6;color:#4a4260;font-family:Helvetica Neue,Arial,sans-serif"><strong style="color:#1a1425">We open city by city.</strong> Each city opens once we have enough members to create a real community around the table.</div>
        </div>
        <div style="display:flex;gap:14px;margin-bottom:12px;align-items:flex-start">
          <div style="width:26px;height:26px;border-radius:50%;background:#5b4de0;color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:Helvetica Neue,Arial,sans-serif;line-height:26px;text-align:center">2</div>
          <div style="font-size:14px;line-height:1.6;color:#4a4260;font-family:Helvetica Neue,Arial,sans-serif"><strong style="color:#1a1425">You'll be first.</strong> Waitlist members get early access before we open publicly.</div>
        </div>
        <div style="display:flex;gap:14px;align-items:flex-start">
          <div style="width:26px;height:26px;border-radius:50%;background:#5b4de0;color:white;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:Helvetica Neue,Arial,sans-serif;line-height:26px;text-align:center">3</div>
          <div style="font-size:14px;line-height:1.6;color:#4a4260;font-family:Helvetica Neue,Arial,sans-serif"><strong style="color:#1a1425">Host or attend — or both.</strong> From intimate dinner parties to curated supper clubs, TableFolk is for every kind of food lover.</div>
        </div>
      </div>
      <div style="border-left:3px solid #5b4de0;padding:16px 20px;background:#f0eeff;border-radius:0 10px 10px 0;margin-bottom:24px">
        <div style="font-size:15px;font-style:italic;color:#3c3489;line-height:1.7">"The best dinner parties aren't about the food — they're about the people who show up for it. TableFolk is how you find those people."</div>
        <div style="font-size:12px;color:#8b7ea8;margin-top:6px;font-family:Helvetica Neue,Arial,sans-serif">— The TableFolk Team</div>
      </div>
      <div style="text-align:center;margin:32px 0 24px">
        <a href="https://tablefolk.club" style="display:inline-block;background:#5b4de0;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:600;letter-spacing:.2px;font-family:Helvetica Neue,Arial,sans-serif">Visit tablefolk.club</a>
      </div>
    </div>
    <div style="padding:28px 40px;border-top:1px solid rgba(90,70,160,0.1);text-align:center">
      <div style="font-family:Georgia,serif;font-size:18px;color:#1a1425;margin-bottom:10px">Table<span style="color:#5b4de0;font-style:italic">Folk</span></div>
      <div style="font-size:12px;color:#8b7ea8;line-height:1.6;font-family:Helvetica Neue,Arial,sans-serif">
        Sent to ${email}<br>
        <a href="mailto:hello@tablefolk.club" style="color:#5b4de0;text-decoration:none">hello@tablefolk.club</a>
      </div>
    </div>
  </div>
</div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: "You're on the TableFolk waitlist 🎉",
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
