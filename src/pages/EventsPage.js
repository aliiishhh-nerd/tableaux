import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime, getEventMonthsAgo, getEventYear } from '../data/utils';
import EventDetailModal from '../components/EventDetailModal';
import CreateEventModal from '../components/CreateEventModal';

const EVENT_TYPES = ['All', 'Dinner Party', 'Other', 'Potluck', 'Restaurant', 'Supper Club', 'Tasting'];

export default function EventsPage() {
  const { events, deleteEvent, addToast } = useApp();
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);
  const [pastFilter, setPastFilter] = useState('3mo');
  const [typeFilter, setTypeFilter] = useState('All');
  const [upcomingSearch, setUpcomingSearch] = useState('');
  const [pastSearch, setPastSearch] = useState('');
  const [fabVisible, setFabVisible] = useState(true);
  const topBtnRef = useRef(null);

  const mine = events.filter(e => e.mine);
  const upcoming = mine.filter(e => !e.isEnded && !e.isPast);
  const past = mine.filter(e => e.isEnded || e.isPast);

  // Hide top New Event button when user scrolls down (FAB takes over)
  useEffect(() => {
    const onScroll = () => setFabVisible(window.scrollY < 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function filterPast(evts) {
    if (pastFilter === '3mo') return evts.filter(e => getEventMonthsAgo(e) <= 3);
    if (pastFilter === '6mo') return evts.filter(e => getEventMonthsAgo(e) <= 6);
    if (pastFilter === '1y')  return evts.filter(e => getEventMonthsAgo(e) <= 12);
    if (pastFilter === '2y')  return evts.filter(e => getEventMonthsAgo(e) <= 24);
    return evts.filter(e => String(getEventYear(e)) === pastFilter);
  }

  const years = [...new Set(past.map(e => getEventYear(e)))].sort((a, b) => b - a);
  const pastFilters = [
    { key: '3mo', label: 'Last 3 months' },
    { key: '6mo', label: 'Last 6 months' },
    { key: '1y',  label: 'Last year'     },
    ...years.map(y => ({ key: String(y), label: String(y) })),
  ];

  const displayUpcoming = upcoming
    .filter(e => typeFilter === 'All' || e.type === typeFilter)
    .filter(e => !upcomingSearch ||
      e.title.toLowerCase().includes(upcomingSearch.toLowerCase()) ||
      (e.loc || '').toLowerCase().includes(upcomingSearch.toLowerCase())
    );

  const filteredPast = filterPast(past).filter(e =>
    !pastSearch ||
    e.title.toLowerCase().includes(pastSearch.toLowerCase()) ||
    (e.loc || '').toLowerCase().includes(pastSearch.toLowerCase())
  );

  return (
    <main className="page-content">
      {/* Top New Event button — only visible when at top of page */}
      {fabVisible && (
        <div ref={topBtnRef} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <button className="btn btn-primary" onClick={() => setCreating(true)}>
            + New Event
          </button>
        </div>
      )}

      {/* Upcoming */}
      <div style={{ marginBottom: 32 }}>
        <div className="sec-header" style={{ marginBottom: 6 }}>
          <div>
            <div className="sec-title">Upcoming Events</div>
            <div className="sec-sub">{upcoming.length} event{upcoming.length !== 1 ? 's' : ''} scheduled</div>
          </div>
        </div>

        {/* Search + type filter */}
        <div style={{ marginBottom: 10 }}>
          <input
            value={upcomingSearch}
            onChange={e => setUpcomingSearch(e.target.value)}
            placeholder="🔍 Search upcoming events..."
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: '8px 16px',
              fontSize: 13,
              outline: 'none',
              background: 'var(--surface)',
              color: 'var(--ink)',
              marginBottom: 8,
            }}
          />
          <div className="events-toolbar" style={{ flexWrap: 'wrap', gap: 6 }}>
            {EVENT_TYPES.map(t => (
              <button key={t} className={`filter-btn ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {displayUpcoming.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗓️</div>
            <div className="empty-title">No upcoming events</div>
            <div className="empty-sub">Host your next dinner or gathering.</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setCreating(true)}>
              Create an Event
            </button>
          </div>
        ) : (
          <div className="events-list">
            {displayUpcoming.map(evt => (
              <EventRow
                key={evt.id}
                event={evt}
                onClick={() => setSelected(evt)}
                onEdit={() => setEditing(evt)}
                onDelete={() => { deleteEvent(evt.id); addToast('Event deleted', ''); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      {past.length > 0 && (
        <div className="past-events-section">
          <div className="past-events-header" onClick={() => setPastOpen(o => !o)}>
            <div className="sec-title">Past Events</div>
            <span className="chip chip-gray">{past.length}</span>
            <span className={`past-events-toggle ${pastOpen ? 'open' : ''}`}>▶</span>
          </div>

          {pastOpen && (
            <>
              <div style={{ marginBottom: 8 }}>
                <input
                  value={pastSearch}
                  onChange={e => setPastSearch(e.target.value)}
                  placeholder="🔍 Search past events..."
                  style={{
                    width: '100%',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '8px 16px',
                    fontSize: 13,
                    outline: 'none',
                    background: 'var(--surface)',
                    color: 'var(--ink)',
                    marginBottom: 8,
                  }}
                />
              </div>
              <div className="past-filter-row">
                {pastFilters.map(f => (
                  <button
                    key={f.key}
                    className={`past-filter-btn ${pastFilter === f.key ? 'active' : ''}`}
                    onClick={() => setPastFilter(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredPast.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--ink2)', fontSize: 14 }}>No events in this period.</div>
              ) : (
                <div className="events-list">
                  {filteredPast.map(evt => (
                    <EventRow key={evt.id} event={evt} onClick={() => setSelected(evt)} past />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {selected && (
        <EventDetailModal
          event={selected}
          onClose={() => setSelected(null)}
          onEdit={(e) => { setEditing(e); setSelected(null); }}
        />
      )}
      {(editing || creating) && (
        <CreateEventModal
          event={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </main>
  );
}

function EventRow({ event, onClick, onEdit, onDelete, past }) {
  const cover = event.cover || {};
  const hasImg = cover.type === 'image' || event.img;

  return (
    <div className="event-row" onClick={onClick} style={past ? { opacity: 0.8 } : {}}>
      <div className="event-row-cover" style={!hasImg ? { background: cover.gradient || cover.value || 'var(--indigo)' } : {}}>
        {hasImg
          ? <img src={cover.value || event.img} alt={event.title} />
          : <span>{cover.emoji || '🍽️'}</span>}
      </div>
      <div className="event-row-info">
        <div className="event-row-title">{event.title}</div>
        <div className="event-row-meta">
          <span>📅 {fmtDate(event.date)}</span>
          <span>🕖 {fmtTime(event.time)}</span>
          {(event.loc || event.location) && <span>📍 {event.loc || event.location}</span>}
          <span className="chip chip-gray" style={{ padding: '2px 8px' }}>{event.type ? event.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim() : ''}</span>
          {(event.isEnded || event.isPast) && (
            <span className="chip chip-gray" style={{ padding: '2px 8px' }}>Ended</span>
          )}
        </div>
      </div>
      <div className="event-row-actions" onClick={e => e.stopPropagation()}>
        {!past && onDelete && <button className="btn btn-ghost btn-sm" onClick={onDelete} style={{ color: 'var(--coral)' }}>🗑️</button>}
        {event.mine && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 11, padding: '3px 8px', color: 'var(--indigo)', border: '1px solid var(--indigo-light)' }}
            onClick={e => { e.stopPropagation(); onClick(); }}
            title="Host tools"
          >
            🛠️ Host
          </button>
        )}
      </div>
    </div>
  );
}
