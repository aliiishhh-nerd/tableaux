import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime } from '../data/utils';
import { FRIENDS_ACTIVITY, USERS } from '../data/seed';
import EventDetailModal from '../components/EventDetailModal';

export default function FeedPage() {
  const { events } = useApp();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [dismissedBanners, setDismissedBanners] = useState([]);

  const upcoming = events.filter(e => !e.isEnded && !e.isPast && !e.isInvitedTo);
  const filters = [
    { key: 'all', label: '✨ All' },
    { key: 'Dinner Party', label: 'Dinner Party' },
    { key: 'Supper Club', label: 'Supper Club' },
    { key: 'Potluck', label: 'Potluck' },
    { key: 'Cooking Class', label: 'Cooking Class' },
  ];

  const filtered = upcoming.filter(e => filter === 'all' || e.type === filter);

  // Post-event notifications: ended events within last 48h with gallery
  const recentEnded = events.filter(e =>
    e.isEnded && e.galleryEnabled && !dismissedBanners.includes(e.id)
  ).slice(0, 1);

  const stats = [
    { icon: '🗓️', val: upcoming.length,                                label: 'Upcoming' },
    { icon: '👥', val: 48,                                              label: 'In Network' },
    { icon: '🥂', val: events.filter(e => e.isEnded || e.isPast).length, label: 'Past Dinners' },
    { icon: '🌍', val: 7,                                               label: 'Passport' },
  ];

  return (
    <main className="page-content">
      {/* Stats */}
      <div className="stat-cards">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Post-event notification banners */}
      {recentEnded.map(evt => (
        <PostEventBanner
          key={evt.id}
          event={evt}
          onView={() => setSelected(evt)}
          onDismiss={() => setDismissedBanners(d => [...d, evt.id])}
        />
      ))}

      {/* Main layout: feed + sidebar */}
      <div className="feed-layout">
        {/* Left: filters + cards */}
        <div>
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
              <div className="empty-title">No events yet</div>
              <div className="empty-sub">Be the first to host a dinner in your network.</div>
            </div>
          ) : (
            <div className="feed-grid">
              {filtered.map(evt => (
                <EventCard key={evt.id} event={evt} onClick={() => setSelected(evt)} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Friends Activity */}
        <div>
          <div className="card">
            <div style={{ padding: '14px 14px 0' }}>
              <div className="sec-title">Friends Activity</div>
            </div>
            <div style={{ padding: '4px 14px 14px' }}>
              {FRIENDS_ACTIVITY.map(act => {
                const u = USERS.find(x => x.id === act.userId);
                return (
                  <div key={act.id} className="activity-item">
                    <div className={`av av-sm av-${u?.color || 'indigo'} av-link`} title={`View ${act.userName}'s profile`}>
                      {u ? u.initials : act.userName[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="activity-text">
                        <strong>{act.userName}</strong> {act.action}{' '}
                        <strong onClick={() => {
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
    <div className="post-event-banner" onClick={onView}>
      <div className="post-event-banner-icon">
        {photoCount > 0 ? '📸' : '🎉'}
      </div>
      <div className="post-event-banner-text">
        <div className="post-event-banner-title">
          {event.title} just wrapped up
        </div>
        <div className="post-event-banner-sub">
          {photoCount > 0
            ? `${photoCount} photo${photoCount !== 1 ? 's' : ''} have been shared from the evening. Add yours!`
            : 'The dinner is over — be the first to share your photos!'}
        </div>
      </div>
      <button
        className="post-event-banner-cta"
        onClick={e => { e.stopPropagation(); onView(); }}
      >
        {photoCount > 0 ? 'See Photos' : 'Add Photos'}
      </button>
      <button
        onClick={e => { e.stopPropagation(); onDismiss(); }}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16, padding: '4px', flexShrink: 0, lineHeight: 1 }}
        title="Dismiss"
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

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-card-cover" style={coverStyle}>
        {hasImg && (
          <img src={cover.value || event.img} alt={event.title} loading="lazy" />
        )}
        {!hasImg && cover.type === 'emoji' && (
          <div className="event-card-cover-emoji">{cover.emoji}</div>
        )}
        <div className="event-card-badges">
          <span className="chip chip-indigo" style={{ background: 'rgba(108,93,211,.85)', color: 'white' }}>
            {event.type}
          </span>
          {event.vis === 'Public' && (
            <span className="chip" style={{ background: 'rgba(46,196,182,.85)', color: 'white' }}>Public</span>
          )}
        </div>
      </div>

      <div className="event-card-body">
        <div className="event-card-title">{event.title}</div>
        <div className="event-card-meta">
          <span>📅 {fmtDate(event.date)}</span>
          <span>🕖 {fmtTime(event.time)}</span>
          <span>📍 {event.loc}</span>
        </div>
        <div className="progress-bar">
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
