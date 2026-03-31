import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🍷', title: 'Supper Clubs', desc: 'Multi-course dinners hosted by passionate home chefs. Ticketed, intimate, unforgettable.' },
  { icon: '🥘', title: 'Potlucks', desc: 'Collaborative meals where everyone brings a dish. Claim your item, show up, connect.' },
  { icon: '🕯️', title: 'Dinner Parties', desc: 'Curated guest lists, beautiful tables, meaningful conversation over a shared meal.' },
  { icon: '👨‍🍳', title: 'Cooking Classes', desc: 'Learn hands-on from local chefs and passionate cooks in a small group setting.' },
  { icon: '🍾', title: 'Wine Tastings', desc: 'Explore natural wines, pairings, and the stories behind each bottle.' },
  { icon: '⚡', title: 'Pop-Ups', desc: 'Spontaneous one-night experiences. Follow your favorite hosts to get first access.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Discover', desc: 'Browse events in your city filtered by type, date, and cuisine.' },
  { step: '02', title: 'Request a seat', desc: 'Send a request to the host. They review your profile and accept.' },
  { step: '03', title: 'Show up & connect', desc: 'Arrive, eat well, meet people who share your love of food.' },
];

const TESTIMONIALS = [
  { quote: "I've met more interesting people at Tableaux dinners than at any networking event.", name: 'Priya S.', role: 'Guest · Chicago', color: 'indigo' },
  { quote: "Hosting on Tableaux turned my dinner parties into a real community. The tools just work.", name: 'Marcus T.', role: 'Host · Austin', color: 'teal' },
  { quote: "Our brand reached 300 engaged food lovers in one month. Nothing else comes close.", name: 'Elena V.', role: 'Partner · Chicago', color: 'amber' },
];

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Nav */}
      <nav style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon">🍽️</div>
          <div className="logo-text">Table<span>aux</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/feed" className="btn btn-ghost btn-sm">Log in</Link>
          <Link to="/feed" className="btn btn-primary btn-sm">Join free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '72px 32px 64px', textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 20, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          🍴 Now in Chicago
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 20 }}>
          Dinner is better<br />when it's{' '}
          <span style={{ color: 'var(--indigo)' }}>personal</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
          Tableaux connects food lovers through intimate, hosted dining experiences — supper clubs, potlucks, dinner parties, and more.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link to="/feed" className="btn btn-primary" style={{ fontSize: 16, padding: '13px 28px' }}>Find a dinner →</Link>
          <Link to="/feed" className="btn btn-ghost" style={{ fontSize: 16, padding: '13px 28px' }}>Host a table</Link>
        </div>
        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ display: 'flex' }}>
            {['AL','MR','JW','SK','TC'].map((ini, i) => (
              <div key={i} className={`av av-sm av-${['indigo','teal','amber','coral','sage'][i]}`} style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid white' }}>{ini}</div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
            <strong style={{ color: 'var(--ink)' }}>2,400+</strong> diners in Chicago
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '64px 32px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 10 }}>Every kind of table</h2>
          <p style={{ fontSize: 16, color: 'var(--ink2)' }}>From casual potlucks to formal supper clubs — find the format that fits you.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
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
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)' }}>From discovery to dinner in three steps.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
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
      <section style={{ padding: '0 32px 72px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 10 }}>What people are saying</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="card" style={{ padding: '22px' }}>
              <div style={{ fontSize: 32, color: 'var(--indigo)', lineHeight: 1, marginBottom: 12 }}>"</div>
              <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7, marginBottom: 16, fontStyle: 'italic' }}>{t.quote}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={`av av-sm av-${t.color}`}>{t.name[0]}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Email CTA */}
      <section style={{ background: 'var(--indigo-light)', padding: '64px 32px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', marginBottom: 10, letterSpacing: '-0.4px' }}>Ready to find your table?</h2>
        <p style={{ fontSize: 15, color: 'var(--ink2)', marginBottom: 28 }}>Join 2,400+ diners already on Tableaux in Chicago.</p>
        {submitted ? (
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--indigo)' }}>🎉 You're on the list! We'll be in touch soon.</div>
        ) : (
          <div style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, minWidth: 200, fontSize: 16 }}
            />
            <button className="btn btn-primary" onClick={() => email && setSubmitted(true)}>
              Get early access →
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--ink)', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon" style={{ width: 28, height: 28, fontSize: 14 }}>🍽️</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Table<span style={{ color: 'var(--indigo-mid)' }}>aux</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/blog" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Blog</Link>
          <Link to="/faq"  style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Help</Link>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>About</span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>Privacy</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>© 2025 Tableaux</div>
      </footer>

    </div>
  );
}
