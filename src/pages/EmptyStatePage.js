import React from 'react';
import { Link } from 'react-router-dom';

const SUGGESTED_EVENTS = [
  { id: 'se1', title: 'River North Supper Club', type: 'Supper Club', date: 'Sat Apr 12', loc: 'River North, Chicago', emoji: '🍷', bg: '#2D2550', cap: 8, filled: 5 },
  { id: 'se2', title: 'Wicker Park Potluck', type: 'Potluck', date: 'Sun Apr 20', loc: 'Wicker Park, Chicago', emoji: '🥘', bg: '#1A3A2E', cap: 12, filled: 7 },
  { id: 'se3', title: 'Hyde Park Dinner Party', type: 'Dinner Party', date: 'Fri Apr 25', loc: 'Hyde Park, Chicago', emoji: '🕯️', bg: '#2A1A1A', cap: 6, filled: 3 },
];

const GHOST_FRIENDS = [
  { initials: '?', color: 'border' },
  { initials: '?', color: 'border' },
  { initials: '?', color: 'border' },
];

export default function EmptyStatePage({ onCreateEvent, onBrowse }) {
  return (
    <main className="page-content">
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1A2E 0%, #2D2550 60%, #3D1F4A 100%)',
        borderRadius: 20, padding: '32px 28px', marginBottom: 24,
        position: 'relative', overflow: 'hidden', textAlign: 'center',
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: '-0.4px', lineHeight: 1.2 }}>
            Welcome to Tableaux
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, maxWidth: 420, margin: '0 auto 24px' }}>
            Discover intimate dining experiences around you, or host your own table. Every great meal starts with an invitation.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={onCreateEvent}>🍴 Host a dinner</button>
            <button className="btn" style={{ background: 'rgba(255,255,255,.12)', color: 'white', border: '1px solid rgba(255,255,255,.25)' }} onClick={onBrowse}>
              Browse events →
            </button>
          </div>
        </div>
      </div>

      {/* Getting started guide */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 20 }}>
        <div className="sec-title" style={{ marginBottom: 16 }}>Get started in 3 steps</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { step: '1', icon: '👤', title: 'Complete your profile', desc: 'Add a photo and your food preferences so hosts know who you are.', cta: 'Go to profile', to: '/profile' },
            { step: '2', icon: '🔍', title: 'Discover events', desc: 'Browse supper clubs, potlucks, and dinner parties near you.', cta: 'Browse now', to: '/feed' },
            { step: '3', icon: '🍴', title: 'Host your first table', desc: 'Create an event and invite friends or open it to your network.', cta: 'Create event', action: onCreateEvent },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.step}</div>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5, flex: 1 }}>{s.desc}</div>
              {s.to
                ? <Link to={s.to} className="btn btn-ghost btn-sm" style={{ marginTop: 4, textDecoration: 'none' }}>{s.cta}</Link>
                : <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }} onClick={s.action}>{s.cta}</button>
              }
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>
        {/* Suggested public events */}
        <div>
          <div className="sec-header">
            <div>
              <div className="sec-title">Happening near you</div>
              <div className="sec-sub">Public events you can join right now</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SUGGESTED_EVENTS.map(evt => (
              <div key={evt.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', cursor: 'pointer' }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: evt.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                  {evt.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{evt.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>📅 {evt.date}</span>
                    <span>📍 {evt.loc}</span>
                    <span className="chip chip-gray" style={{ padding: '1px 7px' }}>{evt.type}</span>
                  </div>
                  <div className="progress-bar" style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: `${(evt.filled / evt.cap) * 100}%` }} />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>Request →</button>
              </div>
            ))}
          </div>
        </div>

        {/* Friends panel — ghost state + invite CTA */}
        <div>
          <div className="card" style={{ overflow: 'visible' }}>
            <div style={{ padding: '14px 14px 0' }}>
              <div className="sec-title">Friends Activity</div>
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: -8, marginBottom: 14 }}>
                {GHOST_FRIENDS.map((f, i) => (
                  <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--border)', border: '2px solid white', marginLeft: i > 0 ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--ink3)' }}>
                    ?
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>No friends yet</div>
                <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5 }}>Invite friends to see their dining activity and discover events together.</div>
              </div>
            </div>
            <div className="invite-friend-cta">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 28 }}>👋</div>
                <div>
                  <div className="invite-friend-title">Invite your people</div>
                  <div className="invite-friend-sub">They'll see your events too</div>
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-sm">📨 Send Invite</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
