import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';

const ACTIVITY = [
  { av: 'MT', col: 'av-teal',   bg: 'var(--teal-light)',  icon: '⊞', text: '<strong>Marcus T.</strong> published a new potluck — Spring Potluck in the Garden', t: '2h ago' },
  { av: 'SM', col: 'av-coral',  bg: 'var(--coral-light)', icon: '◈', text: '<strong>Sophie M.</strong> is hosting Provençal Cuisine — 3 spots left', t: '5h ago' },
  { av: 'EV', col: 'av-amber',  bg: 'var(--amber-light)', icon: '✉', text: '<strong>Elena V.</strong> invited you to Rooftop Tapas Night', t: 'Yesterday' },
  { av: 'RK', col: 'av-indigo', bg: 'var(--indigo-light)',icon: '◉', text: '<strong>Raj K.</strong> RSVP\'d yes to your Midsummer Feast', t: '2 days ago' },
];

export default function FeedPage({ onOpenCreate, onOpenEdit }) {
  const { events, pendingInvites } = useApp();
  const [detailEvent, setDetailEvent] = useState(null);
  const pub = events.filter(e => e.vis === 'Public' || e.vis === 'Request-only');
  const totalGuests = events.reduce((a, e) => a + e.guests.filter(g => g.s === 'approved').length, 0);
  const myEvents = events.filter(e => e.mine).length;

  return (
    <>
      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--indigo-light)' }}>📅</div>
          <div>
            <div className="stat-num">{pub.length}</div>
            <div className="stat-label">Public Events</div>
            <div className="stat-delta up">↑ 2 this week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--teal-light)' }}>◉</div>
          <div>
            <div className="stat-num">{totalGuests}</div>
            <div className="stat-label">Total Guests</div>
            <div className="stat-delta up">↑ 4 new</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--amber-light)' }}>✉</div>
          <div>
            <div className="stat-num">{pendingInvites}</div>
            <div className="stat-label">Pending Invites</div>
            <div className="stat-delta neu">Awaiting response</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--coral-light)' }}>◈</div>
          <div>
            <div className="stat-num">{myEvents}</div>
            <div className="stat-label">Your Events</div>
            <div className="stat-delta up">↑ 1 upcoming</div>
          </div>
        </div>
      </div>

      {/* Event grid header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div className="sec-label" style={{ margin: 0 }}>Public Events Near You</div>
        <button className="btn btn-primary btn-sm" onClick={onOpenCreate}>＋ Host an Event</button>
      </div>

      <div className="ev-grid" style={{ marginBottom: 28 }}>
        {pub.map(e => <EventCard key={e.id} event={e} onClick={() => setDetailEvent(e)} />)}
      </div>

      {/* Activity feed */}
      <div className="card card-p">
        <div className="card-header">
          <div>
            <div className="card-title">Friend Activity</div>
            <div className="card-sub">Recent updates from your network</div>
          </div>
        </div>
        {ACTIVITY.map((a, i) => (
          <div key={i} className="act-item">
            <div className="act-icon" style={{ background: a.bg }}>{a.icon}</div>
            <div>
              <div className="act-text" dangerouslySetInnerHTML={{ __html: a.text }} />
              <div className="act-time">{a.t}</div>
            </div>
          </div>
        ))}
      </div>

      {detailEvent && (
        <EventDetailModal
          event={detailEvent}
          onClose={() => setDetailEvent(null)}
          onOpenEdit={id => { setDetailEvent(null); onOpenEdit(id); }}
        />
      )}
    </>
  );
}
