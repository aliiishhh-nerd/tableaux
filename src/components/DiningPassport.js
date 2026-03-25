import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';

const QUOTES = [
  { text: 'The ornament of a house is the friends who frequent it.', attr: 'Ralph Waldo Emerson' },
  { text: 'One cannot think well, love well, sleep well, if one has not dined well.', attr: 'Virginia Woolf' },
  { text: 'Eating is a necessity but cooking is an art.', attr: 'Unknown' },
  { text: 'Food is our common ground, a universal experience.', attr: 'James Beard' },
  { text: 'At a dinner party one should eat wisely but not too well, and talk well but not too wisely.', attr: 'W. Somerset Maugham' },
  { text: 'Sharing food with another human being is an intimate act that should not be indulged in lightly.', attr: 'M.F.K. Fisher' },
];

const STAT_MODULES = [
  { id: 'cuisines',   label: 'Top cuisines',     icon: '🍽' },
  { id: 'events',     label: 'Event type freq.',  icon: '📅' },
  { id: 'friends',    label: 'Top dining friends',icon: '👥' },
];

const EVENT_TYPE_DATA = [
  { type: 'Dinner Party',   count: 6, color: 'var(--indigo)' },
  { type: 'Supper Club',    count: 4, color: 'var(--teal)' },
  { type: 'Potluck',        count: 3, color: 'var(--amber)' },
  { type: 'Restaurant',     count: 2, color: 'var(--coral)' },
];

const FOOD_IMGS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=70',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=70',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=70',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=70',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=70',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&q=70',
];

function AnimatedNumber({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setVal(Math.round((step / steps) * target));
      if (step >= steps) clearInterval(iv);
    }, interval);
    return () => clearInterval(iv);
  }, [target, duration]);

  return <span>{val}</span>;
}

export default function DiningPassport({ userName }) {
  const { events, profile, setProfile } = useApp();
  const passport = profile.passport || { optedIn: false, activeModules: ['cuisines'], customized: false };

  const attended = events.filter(e => e.guests && e.guests.some(g => g.n === (userName || profile.name) && g.s === 'approved'));
  const hosted   = events.filter(e => e.mine);
  const allPhotos = events.flatMap(e => (e.gallery?.photos || []).filter(p => p.uploadedBy === (userName || profile.name)));
  const quote = QUOTES[attended.length % QUOTES.length];

  function updatePassport(patch) {
    setProfile(p => ({ ...p, passport: { ...passport, ...patch } }));
  }

  function toggleModule(id) {
    const mods = passport.activeModules || [];
    const next = mods.includes(id) ? mods.filter(m => m !== id) : [...mods, id];
    if (next.length === 0) return;
    updatePassport({ activeModules: next, customized: true });
  }

  if (!passport.optedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--page)', borderRadius: 'var(--r2)', border: '1px dashed var(--border)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Your Dining Passport</div>
        <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 20, maxWidth: 320, margin: '0 auto 20px' }}>
          Your personal record of every dinner, supper club, and potluck you've attended. Opt in to start building yours.
        </div>
        <button className="btn btn-primary" onClick={() => updatePassport({ optedIn: true })}>
          Create my Dining Passport
        </button>
      </div>
    );
  }

  const totalCount = attended.length + hosted.length;
  const isRecent  = totalCount > 0;
  const congrats  = hosted.length > 0
    ? 'You hosted ' + hosted.length + ' event' + (hosted.length > 1 ? 's' : '') + ' this year'
    : attended.length > 0
    ? 'You attended ' + attended.length + ' dinner' + (attended.length > 1 ? 's' : '') + ' with real people'
    : 'Welcome to Tableaux';

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="sec-label" style={{ margin: 0 }}>Dining Passport</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 3 }}>{profile.name}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => updatePassport({ customizing: !passport.customizing })}>
            {passport.customizing ? 'Done' : '⚙ Customize'}
          </button>
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--coral)', fontSize: 11 }} onClick={() => updatePassport({ optedIn: false })}>
            Opt out
          </button>
        </div>
      </div>

      {passport.customizing && (
        <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)', marginBottom: 8 }}>Choose what to display</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {STAT_MODULES.map(m => {
              const on = (passport.activeModules || ['cuisines']).includes(m.id);
              return (
                <div key={m.id} onClick={() => toggleModule(m.id)}
                  style={{ padding: '8px 14px', borderRadius: 'var(--r)', border: '1.5px solid ' + (on ? 'var(--indigo)' : 'var(--border)'), background: on ? 'var(--indigo-light)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .15s' }}>
                  <span style={{ fontSize: 16 }}>{m.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: on ? 'var(--indigo)' : 'var(--ink2)' }}>{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isRecent && (
        <div style={{ background: 'var(--teal-light)', border: '1px solid rgba(10,207,151,0.2)', borderRadius: 'var(--r2)', padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🎉</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#085041' }}>{congrats}!</div>
            <div style={{ fontSize: 11, color: '#0F6E56', marginTop: 2 }}>That's real people, real food, real connection.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 16 }}>
        {[
          { num: attended.length + hosted.length, label: 'Events' },
          { num: hosted.length, label: 'Hosted' },
          { num: allPhotos.length, label: 'Photos' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--page)', borderRadius: 'var(--r)', padding: '14px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--indigo)' }}>
              <AnimatedNumber target={s.num} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 3, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {(passport.activeModules || ['cuisines']).includes('cuisines') && (
        <div style={{ marginBottom: 16 }}>
          <div className="sec-label">Top cuisines</div>
          {profile.prefs && profile.prefs.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.prefs.map((p, i) => (
                <span key={p} style={{ padding: '5px 12px', borderRadius: 20, background: 'var(--indigo-light)', color: 'var(--indigo)', border: '1px solid var(--indigo-mid)', fontSize: 12, fontWeight: 600, opacity: 1 - i * 0.08 }}>
                  {p}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--ink3)' }}>No food preferences set yet. Add them in your profile.</div>
          )}
        </div>
      )}

      {(passport.activeModules || []).includes('events') && (
        <div style={{ marginBottom: 16 }}>
          <div className="sec-label">Event type frequency</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EVENT_TYPE_DATA.map(item => (
              <div key={item.type} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 110, fontSize: 12, color: 'var(--ink2)', fontWeight: 500, flexShrink: 0 }}>{item.type}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--page)', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ height: '100%', width: Math.round((item.count / 6) * 100) + '%', background: item.color, borderRadius: 4, transition: 'width .8s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', width: 12, textAlign: 'right', flexShrink: 0 }}>{item.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(passport.activeModules || []).includes('friends') && (
        <div style={{ marginBottom: 16 }}>
          <div className="sec-label">Top dining friends</div>
          {events.flatMap(e => (e.guests || []).filter(g => g.s === 'approved' && g.n !== (userName || profile.name)).map(g => g.n))
            .reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {})
            && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(
                events.flatMap(e => (e.guests || []).filter(g => g.s === 'approved' && g.n !== (userName || profile.name)).map(g => g.n))
                  .reduce((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {})
              ).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([name, count], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--indigo)', flexShrink: 0 }}>
                    {name.split(' ').map(x => x[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{count} event{count !== 1 ? 's' : ''} together</div>
                </div>
              ))}
              {Object.keys(events.flatMap(e => (e.guests || []).filter(g => g.s === 'approved').map(g => g.n)).reduce((a, n) => { a[n] = 1; return a; }, {})).length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>Attend events with friends to see them here.</div>
              )}
            </div>
          )}
        </div>
      )}

      {allPhotos.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="sec-label">Your photos</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 4 }}>
            {FOOD_IMGS.slice(0, 6).map((src, i) => (
              <div key={i} style={{ height: 56, borderRadius: 'var(--r)', overflow: 'hidden' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ borderLeft: '3px solid var(--indigo)', paddingLeft: 14, marginTop: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6, fontStyle: 'italic' }}>"{quote.text}"</div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 5 }}>— {quote.attr}</div>
      </div>
    </div>
  );
}
