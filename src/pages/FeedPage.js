import React, { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime } from '../data/utils';
import { FRIENDS_ACTIVITY, USERS } from '../data/seed';
import EventDetailModal from '../components/EventDetailModal';

const CITIES = [
  { key: 'auto',    label: '📍 Near Me' },
  { key: 'chicago', label: 'Chicago' },
  { key: 'austin',  label: 'Austin' },
  { key: 'la',      label: 'Los Angeles' },
  { key: 'seattle', label: 'Seattle' },
  { key: 'all',     label: 'All Cities' },
];

const CITY_KEYWORDS = {
  chicago: ['chicago', 'lincoln park', 'river north', 'wicker park', 'hyde park', 'lakeview', 'il'],
  austin:  ['austin', 'tx', 'texas'],
  la:      ['los angeles', 'la', 'california', 'ca', 'venice', 'silverlake', 'hollywood'],
  seattle: ['seattle', 'wa', 'washington', 'capitol hill', 'ballard'],
};

// Event type pill config — distinct colors per type
const TYPE_PILLS = {
  'Dinner Party': { bg: 'rgba(108,93,211,.85)',  label: '🍷 Dinner Party' },
  'Supper Club':  { bg: 'rgba(212,175,55,.9)',   label: '✨ Supper Club'  },
  'Potluck':      { bg: 'rgba(46,196,182,.85)',  label: '🥘 Potluck'      },
  'Cooking Class':{ bg: 'rgba(255,107,107,.85)', label: '👨‍🍳 Cooking Class' },
  'Wine Tasting': { bg: 'rgba(135,93,155,.85)',  label: '🍷 Wine Tasting' },
  'Pop-Up':       { bg: 'rgba(255,179,71,.9)',   label: '⚡ Pop-Up'       },
};

function detectCity() {
  return 'chicago';
}

function eventMatchesCity(event, cityKey) {
  if (cityKey === 'all' || cityKey === 'auto') return true;
  const keywords = CITY_KEYWORDS[cityKey] || [];
  const haystack = (event.loc + ' ' + (event.addr || '')).toLowerCase();
  return keywords.some(k => haystack.includes(k));
}

export default function FeedPage() {
  const { events } = useApp();
  const [selected, setSelected]           = useState(null);
  const [filter, setFilter]               = useState('all');
  const [city, setCity]                   = useState(detectCity);
  const [dismissedBanners, setDismissedBanners] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('tableaux-dismissed-banners') || '[]');
    } catch { return []; }
  });
  const [showAllBanners, setShowAllBanners] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('tableaux-dismissed-banners', JSON.stringify(dismissedBanners));
  }, [dismissedBanners]);

  const upcoming = events.filter(e => !e.isEnded && !e.isPast && !e.isInvitedTo);

  const filters = [
    { key: 'all',           label: '✨ All'          },
    { key: 'Dinner Party',  label: '🍷 Dinner Party' },
    { key: 'Supper Club',   label: '✨ Supper Club'  },
    { key: 'Potluck',       label: '🥘 Potluck'      },
  ];

  const filtered = upcoming.filter(e => {
    const typeMatch = filter === 'all' || e.type === filter;
    const cityMatch = eventMatchesCity(e, city);
    return typeMatch && cityMatch;
  });

  // Post-event notification banners
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const allBanners = events.filter(e => {
    if (!e.isEnded || !e.galleryEnabled) return false;
    if (dismissedBanners.includes(e.id)) return false;
    if (e.endedAt && new Date(e.endedAt).getTime() < sevenDaysAgo) return false;
    return true;
  });
  const visibleBanners = showAllBanners ? allBanners : allBanners.slice(0, 1);
  const hiddenCount    = allBanners.length - 1;

  const stats = [
    { icon: '🗓️', color: 'purple', val: upcoming.length,                                 label: 'Upcoming',     badge: '+2 this month',   badgeColor: 'green' },
    { icon: '👥', color: 'teal',   val: 48,                                               label: 'In Network',   badge: 'Avg 7 per event', badgeColor: 'blue'  },
    { icon: '🥂', color: 'amber',  val: events.filter(e => e.isEnded || e.isPast).length, label: 'Past Dinners', badge: '92% accepted',    badgeColor: 'green' },
  ];

  return (
    <main className="page-content">
      {/* Stats row */}
      <div className="feed-top-grid">
        <div className="stat-cards feed-stat-cards">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className={`stat-icon-circle ${s.color}`}>{s.icon}</div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
              <span className={`stat-badge ${s.badgeColor}`}>{s.badge}</span>
            </div>
          ))}
        </div>

        {/* Friends Activity — mobile top card */}
        <div className="card feed-friends-card">
          <div style={{ padding: '14px 14px 0' }}>
            <div className="sec-title">Friends Activity</div>
          </div>
          <div style={{ padding: '4px 14px 14px', overflowY: 'auto', maxHeight: 160 }}>
            {FRIENDS_ACTIVITY.map(act => {
              const u = USERS.find(x => x.id === act.userId);
              return (
                <div key={act.id} className="activity-item">
                  <div className={`av av-sm av-${u?.color || 'indigo'} av-link`}>
                    {u ? u.initials : act.userName[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="activity-text">
                      <strong>{act.userName}</strong> {act.action}{' '}
                      <strong style={{ cursor: 'pointer' }} onClick={() => {
                        const ev = events.find(e => e.id === act.targetId);
                        if (ev) setSelected(ev);
                      }}>{act.target}</strong>
                      {' '}{act.emoji}
                    </div>
                    <div className="activity-time">{act.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Post-event notification banners */}
      {allBanners.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {visibleBanners.map(evt => (
            <PostEventBanner
              key={evt.id}
              event={evt}
              onView={() => setSelected(evt)}
              onDismiss={() => setDismissedBanners(d => [...d, evt.id])}
            />
          ))}
          {!showAllBanners && hiddenCount > 0 && (
            <button
              onClick={() => setShowAllBanners(true)}
              style={{
                width: '100%', padding: '8px', marginTop: 4,
                background: 'var(--indigo-light)', border: '1px solid var(--indigo-mid)',
                borderRadius: 10, fontSize: 13, color: 'var(--indigo)',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              +{hiddenCount} more wrap-up{hiddenCount !== 1 ? 's' : ''} — tap to view
            </button>
          )}
        </div>
      )}

      {/* Main layout */}
      <div className="feed-layout">
        <div>
          {/* City filter row */}
          <div className="filter-row" style={{ marginBottom: 8 }}>
            {CITIES.map(c => (
              <button
                key={c.key}
                className={`filter-btn ${city === c.key ? 'active' : ''}`}
                onClick={() => setCity(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Event type filter row */}
          <div className="filter-row" style={{ marginBottom: 14 }}>
            {filters.map(f => (
              <button
                key={f.key}
                className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <div className="empty-title">No events in this area</div>
              <div className="empty-sub">Try switching cities or browsing all events.</div>
            </div>
          ) : (
            <div className="feed-grid">
              {filtered.map(evt => (
                <EventCard key={evt.id} event={evt} onClick={() => setSelected(evt)} />
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar: Friends Activity (desktop only) */}
        <div className="feed-sidebar-activity">
          <div className="card">
            <div style={{ padding: '14px 14px 0' }}>
              <div className="sec-title">Friends Activity</div>
            </div>
            <div style={{ padding: '4px 14px 14px' }}>
              {FRIENDS_ACTIVITY.map(act => {
                const u = USERS.find(x => x.id === act.userId);
                return (
                  <div key={act.id} className="activity-item">
                    <div className={`av av-sm av-${u?.color || 'indigo'} av-link`}>
                      {u ? u.initials : act.userName[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="activity-text">
                        <strong>{act.userName}</strong> {act.action}{' '}
                        <strong style={{ cursor: 'pointer' }} onClick={() => {
                          const ev = events.find(e => e.id === act.targetId);
                          if (ev) setSelected(ev);
                        }}>{act.target}</strong>
                        {' '}{act.emoji}
                      </div>
                      <div className="activity-time">{act.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <EventDetailModal event={selected} onClose={() => setSelected(null)} />
      )}
    </main>
  );
}

function PostEventBanner({ event, onView, onDismiss }) {
  const photoCount = event.photoGallery?.length || 0;
  return (
    <div className="post-event-banner" onClick={onView} style={{ marginBottom: 6 }}>
      <div className="post-event-banner-icon">{photoCount > 0 ? '📸' : '🎉'}</div>
      <div className="post-event-banner-text">
        <div className="post-event-banner-title">{event.title} just wrapped up</div>
        <div className="post-event-banner-sub">
          {photoCount > 0
            ? `${photoCount} photo${photoCount !== 1 ? 's' : ''} shared — add yours!`
            : 'Be the first to share photos from the evening!'}
        </div>
      </div>
      <button className="post-event-banner-cta" onClick={e => { e.stopPropagation(); onView(); }}>
        {photoCount > 0 ? 'See Photos' : 'Add Photos'}
      </button>
      <button
        onClick={e => { e.stopPropagation(); onDismiss(); }}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16, padding: '4px', flexShrink: 0, lineHeight: 1 }}
      >✕</button>
    </div>
  );
}

function EventCard({ event, onClick }) {
  const cover = event.cover || {};
  const hasImg = cover.type === 'image' || event.img;
  const coverStyle = !hasImg
    ? cover.type === 'gradient'
      ? { background: cover.value }
      : cover.type === 'emoji'
        ? { background: cover.bg || '#1A1A2E' }
        : { background: 'var(--indigo)' }
    : {};

  const approvedGuests = event.guests?.filter(g => g.s === 'approved') || [];
  const pillConfig = TYPE_PILLS[event.type] || { bg: 'rgba(108,93,211,.85)', label: event.type };

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-card-cover" style={coverStyle}>
        {hasImg && <img src={cover.value || event.img} alt={event.title} loading="lazy" />}
        {!hasImg && cover.type === 'emoji' && (
          <div className="event-card-cover-emoji">{cover.emoji}</div>
        )}
        <div className="event-card-badges">
          {/* Distinct colored pill per event type */}
          <span className="chip" style={{ background: pillConfig.bg, color: 'white', fontWeight: 700 }}>
            {pillConfig.label}
          </span>
          {event.vis === 'Public' && (
            <span className="chip" style={{ background: 'rgba(255,255,255,.25)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.3)' }}>
              Public
            </span>
          )}
        </div>
      </div>
      {/* Center-aligned card body */}
      <div className="event-card-body" style={{ textAlign: 'center' }}>
        <div className="event-card-title">{event.title}</div>
        <div className="event-card-meta" style={{ alignItems: 'center' }}>
          <span>📅 {fmtDate(event.date)}</span>
          <span>🕖 {fmtTime(event.time)}</span>
          <span>📍 {event.loc}</span>
        </div>
        <div className="progress-bar" style={{ margin: '8px auto 0' }}>
          <div className="progress-fill" style={{ width: `${Math.min(100, (approvedGuests.length / event.cap) * 100)}%` }} />
        </div>
      </div>
      <div className="event-card-foot">
        <div className="guests-row">
          {approvedGuests.slice(0, 4).map((g, i) => (
            <div key={i} className={`av av-sm av-${g.color || 'indigo'}`}>
              {g.initials || g.n?.[0]}
            </div>
          ))}
          <span className="guests-count">{approvedGuests.length}/{event.cap}</span>
        </div>
        <span className="chip chip-indigo">View →</span>
      </div>
    </div>
  );
}
