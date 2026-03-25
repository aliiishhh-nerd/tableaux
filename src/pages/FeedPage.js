import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime } from '../data/utils';
import { FRIENDS_ACTIVITY, USERS } from '../data/seed';
import EventDetailModal from '../components/EventDetailModal';

export default function FeedPage() {
  const { events } = useApp();
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');

  const upcoming = events.filter(e => !e.isEnded && !e.isPast && !e.isInvitedTo);
  const filters = ['all', 'Dinner Party', 'Supper Club', 'Potluck', 'Cooking Class'];

  const filtered = upcoming.filter(e => filter === 'all' || e.type === filter);

  const stats = [
    { icon: '🗓️', val: events.filter(e => !e.isEnded && !e.isPast).length, label: 'Upcoming Events' },
    { icon: '👥', val: 48, label: 'In Your Network' },
    { icon: '🥂', val: events.filter(e => e.isEnded || e.isPast).length, label: 'Past Dinners' },
    { icon: '🌍', val: 7, label: 'Dining Passport' },
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        {/* Main feed */}
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', overflowX: 'auto' }}>
            {filters.map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? '✨ All' : f}
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <div className="empty-title">No events yet</div>
              <div className="empty-sub">Be the first to host a dinner in your network.</div>
            </div>
          )}

          <div className="feed-grid">
            {filtered.map(evt => (
              <EventCard key={evt.id} event={evt} onClick={() => setSelected(evt)} />
            ))}
          </div>
        </div>

        {/* Sidebar: Friends Activity */}
        <div>
          <div className="card">
            <div style={{ padding: '16px 16px 0' }}>
              <div className="sec-title">Friends Activity</div>
            </div>
            <div style={{ padding: '0 16px 16px' }}>
              {FRIENDS_ACTIVITY.map(act => {
                const user = USERS.find(u => u.id === act.userId);
                return (
                  <div key={act.id} className="activity-item">
                    <a href="#!" style={{ textDecoration: 'none' }} title={`View ${act.userName}'s profile`}>
                      <div className={`av av-sm av-${user?.color || 'indigo'} av-link`}>
                        {user ? user.initials : act.userName[0]}
                      </div>
                    </a>
                    <div style={{ flex: 1 }}>
                      <div className="activity-text">
                        <strong>{act.userName}</strong> {act.action}{' '}
                        {act.targetId ? (
                          <strong onClick={() => {
                            const evt = events.find ? null : null;
                          }}>{act.target}</strong>
                        ) : <strong>{act.target}</strong>}
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

function EventCard({ event, onClick }) {
  const cover = event.cover || {};
  const hasImg = cover.type === 'image' || event.img;
  const coverStyle = !hasImg
    ? cover.type === 'gradient' ? { background: cover.value }
    : cover.type === 'emoji' ? { background: cover.bg || '#1A1A2E' }
    : { background: 'var(--indigo)' }
    : {};

  const approvedGuests = event.guests?.filter(g => g.s === 'approved') || [];

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-card-cover" style={coverStyle}>
        {hasImg && <img src={cover.value || event.img} alt={event.title} loading="lazy" />}
        {!hasImg && cover.type === 'emoji' && (
          <div className="event-card-cover-emoji">{cover.emoji}</div>
        )}
        <div className="event-card-badges">
          <span className="chip chip-indigo" style={{ background: 'rgba(108,93,211,0.85)', color: 'white' }}>{event.type}</span>
          {event.vis === 'Public' && <span className="chip" style={{ background: 'rgba(46,196,182,0.85)', color: 'white' }}>Public</span>}
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
            <div key={i} className={`av av-sm av-${g.color || 'indigo'}`}>{g.initials || g.n?.[0]}</div>
          ))}
          <span className="guests-count">{approvedGuests.length}/{event.cap} going</span>
        </div>
        <span className="chip chip-indigo">View →</span>
      </div>
    </div>
  );
}
