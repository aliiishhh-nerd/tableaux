import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🥞', title: 'Brunch',       desc: 'Leisurely late-morning gatherings with friends. Mimosas, good food, unhurried conversation.' },
  { icon: '🕯️', title: 'Dinner Party', desc: 'Curated guest lists, beautiful tables, meaningful conversation over a shared meal.' },
  { icon: '🥘', title: 'Potluck',      desc: 'Collaborative meals where everyone brings a dish. Claim your item, show up, connect.' },
  { icon: '🏮', title: 'Restaurant',   desc: 'Group reservations and private dining experiences at restaurants worth gathering around.' },
  { icon: '🍷', title: 'Supper Club',  desc: 'Multi-course meals hosted by passionate home chefs. Ticketed, intimate, unforgettable.' },
  { icon: '🍽️', title: 'Other',        desc: 'One-of-a-kind experiences that don\'t fit a category. The best meals rarely do.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Discover',          desc: 'Browse events near you filtered by type, date, and cuisine.' },
  { step: '02', title: 'Request a seat',    desc: 'Send a request to the host. They review your profile and accept.' },
  { step: '03', title: 'Show up & connect', desc: 'Arrive, eat well, meet people who share your love of food.' },
];

const TESTIMONIALS = [
  { quote: "I've met more interesting people at TableFolk gatherings than at any networking event.", name: 'Priya S.',  role: 'Guest',   color: 'indigo' },
  { quote: "Hosting on TableFolk turned my dinner parties into a real community. The tools just work.",  name: 'Marcus T.', role: 'Host',    color: 'teal'   },
  { quote: "Our brand reached 300 engaged food lovers in one month. Nothing else comes close.",         name: 'Elena V.',  role: 'Partner', color: 'amber' },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [cityName, setCityName] = useState('');

  // Auto-detect user's city for a personalized touch
  useEffect(() => {
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
              );
              const data = await res.json();
              const city = data?.address?.city || data?.address?.town || data?.address?.village || '';
              if (city) setCityName(city);
            } catch {
              // Geocoding failed — stay generic
            }
          },
          () => { /* Permission denied — stay generic */ },
          { timeout: 5000 }
        );
      }
    } catch {
      // Geolocation not available
    }
  }, []);

  const greeting = cityName ? `Now available in ${cityName}` : 'Available everywhere';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="#5b4de0"/>
              <circle cx="14" cy="11" r="4" stroke="white" strokeWidth="1.6" fill="none"/>
              <path d="M7 22c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            </svg>
          </div>
          <div className="logo-text">Table<span>Folk</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/blog" className="btn btn-ghost btn-sm">Fork & Story</Link>
          <Link to="/feed" className="btn btn-ghost btn-sm">Log in</Link>
          <Link to="/feed" className="btn btn-primary btn-sm">Join free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '72px 32px 64px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          🍴 {greeting}
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
          Every meal is better<br />when it's{' '}
          <span style={{ color: 'var(--indigo)' }}>shared</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 540, margin: '0 auto 36px' }}>
          TableFolk brings people together around food — with friends, loved ones, and community members you haven't met yet. Host and discover supper clubs, potlucks, brunches, and more.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link to="/feed" className="btn btn-primary" style={{ fontSize: 16, padding: '13px 28px' }}>Explore events →</Link>
          <Link to="/feed" className="btn btn-ghost"   style={{ fontSize: 16, padding: '13px 28px' }}>Host a table</Link>
        </div>
        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ display: 'flex' }}>
            {['AL','MR','JW','SK','TC'].map((ini, i) => (
              <div key={i} className={`av av-sm av-${['indigo','teal','amber','coral','sage'][i]}`} style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid white' }}>{ini}</div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
            <strong style={{ color: 'var(--ink)' }}>2,400+</strong> food lovers and counting
          </div>
        </div>
      </section>

      {/* Features — event types (Tasting removed) */}
      <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 10 }}>Every kind of table</h2>
          <p style={{ fontSize: 16, color: 'var(--ink2)' }}>From casual potlucks to intimate supper clubs — find the format that fits you.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{ padding: '20px 22px' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D2550)', padding: '72px 32px', margin: '0 0 64px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', marginBottom: 10 }}>How it works</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)' }}>From discovery to the table in three steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'rgba(255,255,255,.15)', letterSpacing: '-1px', marginBottom: 12 }}>{s.step}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '64px 32px', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px' }}>What people are saying</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={`av av-sm av-${t.color}`}>{t.name.split(' ').map(w => w[0]).join('')}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink3)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Email CTA */}
      <section style={{ padding: '64px 32px 80px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>
          Ready to find your table?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink2)', marginBottom: 28 }}>
          Join thousands of food lovers discovering intimate dining experiences near them.
        </p>
        {submitted ? (
          <div style={{ fontSize: 16, color: 'var(--teal)', fontWeight: 600 }}>✓ You're on the list! We'll be in touch.</div>
        ) : (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ padding: '11px 16px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14, width: 260, outline: 'none' }}
            />
            <button
              className="btn btn-primary"
              onClick={() => { if (email) setSubmitted(true); }}
              style={{ padding: '11px 22px' }}
            >
              Get early access
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--ink3)' }}>© {new Date().getFullYear()} TableFolk</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/blog" style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Fork & Story</Link>
          <Link to="/faq"  style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>FAQ</Link>
          <a href="mailto:hello@tablefolk.app" style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>
    </div>
  );
}
