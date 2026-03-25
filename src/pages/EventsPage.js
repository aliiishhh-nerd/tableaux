import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime, getEventMonthsAgo, getEventYear } from '../data/utils';
import EventDetailModal from '../components/EventDetailModal';
import CreateEventModal from '../components/CreateEventModal';

export default function EventsPage() {
  const { events, deleteEvent, addToast } = useApp();
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [pastOpen, setPastOpen] = useState(false);
  const [pastFilter, setPastFilter] = useState('3mo'); // '3mo' | '6mo' | '1y' | '2y' | year string

  // My events only
  const mine = events.filter(e => e.mine);
  const upcoming = mine.filter(e => !e.isEnded && !e.isPast);
  const past = mine.filter(e => e.isEnded || e.isPast);

  // Filter past events
  function filterPast(evts) {
    if (pastFilter === '3mo') return evts.filter(e => getEventMonthsAgo(e) <= 3);
    if (pastFilter === '6mo') return evts.filter(e => getEventMonthsAgo(e) <= 6);
    if (pastFilter === '1y') return evts.filter(e => getEventMonthsAgo(e) <= 12);
    if (pastFilter === '2y') return evts.filter(e => getEventMonthsAgo(e) <= 24);
    // Year filter
    return evts.filter(e => String(getEventYear(e)) === pastFilter);
  }

  // Get distinct years
  const years = [...new Set(past.map(e => getEventYear(e)))].sort((a, b) => b - a);
  const pastFilters = [
    { key: '3mo', label: 'Last 3 months' },
    { key: '6mo', label: 'Last 6 months' },
    { key: '1y', label: 'Last year' },
    ...years.map(y => ({ key: String(y), label: String(y) })),
  ];

  const filteredPast = filterPast(past);

  const upcomingTypes = ['All', 'Dinner Party', 'Supper Club', 'Potluck', 'Cooking Class'];
  const [typeFilter, setTypeFilter] = useState('All');
  const displayUpcoming = upcoming.filter(e => typeFilter === 'All' || e.type === typeFilter);

  return (
    <main className="page-content">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setCreating(true)}>
          + New Event
        </button>
      </div>

      {/* Upcoming */}
      <div style={{ marginBottom: 28 }}>
        <div className="sec-header">
          <div>
            <div className="sec-title">Upcoming Events</div>
            <div className="sec-sub">{upcoming.length} event{upcoming.length !== 1 ? 's' : ''} scheduled</div>
          </div>
        </div>

        {/* Type filter */}
        <div className="events-toolbar">
          {upcomingTypes.map(t => (
            <button key={t} className={`filter-btn ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>
              {t}
            </button>
          ))}
        </div>

        {displayUpcoming.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🗓️</div>
            <div className="empty-title">No upcoming events</div>
            <div className="empty-sub">Host your next dinner or gathering.</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setCreating(true)}>Create an Event</button>
          </div>
        ) : (
          <div className="events-list">
            {displayUpcoming.map(evt => (
              <EventRow key={evt.id} event={evt} onClick={() => setSelected(evt)} onEdit={() => setEditing(evt)} onDelete={() => { deleteEvent(evt.id); addToast('Event deleted', ''); }} />
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
              <div className="past-filter-row">
                {pastFilters.map(f => (
                  <button key={f.key} className={`past-filter-btn ${pastFilter === f.key ? 'active' : ''}`} onClick={() => setPastFilter(f.key)}>
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
      <div className="event-row-cover" style={!hasImg ? { background: cover.value || 'var(--indigo)' } : {}}>
        {hasImg
          ? <img src={cover.value || event.img} alt={event.title} />
          : <span>{cover.emoji || '🍽️'}</span>}
      </div>
      <div className="event-row-info">
        <div className="event-row-title">{event.title}</div>
        <div className="event-row-meta">
          <span>📅 {fmtDate(event.date)}</span>
          <span>🕖 {fmtTime(event.time)}</span>
          {event.loc && <span>📍 {event.loc}</span>}
          <span className="chip chip-gray" style={{ padding: '2px 8px' }}>{event.type}</span>
          {(event.isEnded || event.isPast) && <span className="chip chip-gray" style={{ padding: '2px 8px' }}>Ended</span>}
        </div>
      </div>
      {!past && (
        <div className="event-row-actions" onClick={e => e.stopPropagation()}>
          {onEdit && <button className="btn btn-ghost btn-sm" onClick={onEdit}>✏️</button>}
          {onDelete && <button className="btn btn-ghost btn-sm" onClick={onDelete} style={{ color: 'var(--coral)' }}>🗑️</button>}
        </div>
      )}
    </div>
  );
}
