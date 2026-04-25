import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { useOpenEventFromQuery } from '../hooks/useOpenEventFromQuery';
import { fmtDate, fmtTime, getEventMonthsAgo, getEventYear } from '../data/utils';
import EventDetailModal from '../components/EventDetailModal';
import CreateEventModal from '../components/CreateEventModal';

const EVENT_TYPES = ['All', 'Dinner Party', 'Other', 'Potluck', 'Restaurant', 'Supper Club', 'Tasting'];

export default function EventsPage() {
  const { events, deleteEvent, addToast } = useApp();
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [pastFilter, setPastFilter] = useState('3mo');
  const [typeFilter, setTypeFilter] = useState('All');
  const [upcomingSearch, setUpcomingSearch] = useState('');
  const [pastSearch, setPastSearch] = useState('');
  const [fabVisible, setFabVisible] = useState(true);
  const topBtnRef = useRef(null);
  useOpenEventFromQuery(events, setSelected);

  // Upcoming = events I host OR events I accepted an invite to
  // Past = events I hosted (accepted past events covered by wrap-ups flow later)
  const myUser = useApp().user;
  const upcoming = events.filter(e => {
    if (e.isEnded || e.isPast || e.isExample) return false;
    if (e.mine) return true;
    if (e.isInvitedTo) {
      const g = (e.guests || []).find(x => x.id === myUser?.id);
      if (g && g.s === 'approved') return true;
    }
    return false;
  });
  const mine = events.filter(e => e.mine);
  const past = mine.filter(e => (e.isEnded || e.isPast) && !e.isExample);
  const examplePast = mine.filter(e => (e.isEnded || e.isPast) && e.isExample);

  // Auto-open past section if user only has example past events (no real ones yet)
  const hasOnlyExamplePast = past.length === 0 && examplePast.length > 0;
  const [pastOpen, setPastOpen] = useState(hasOnlyExamplePast);

  useEffect(() => {
    if (hasOnlyExamplePast) setPastOpen(true);
  }, [hasOnlyExamplePast]);

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
    if (pastFilter === 'examples') return examplePast;
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

  // Real past events filtered normally; example past always appended when section is open
  const filteredPast = filterPast(past).filter(e =>
    !pastSearch ||
    e.title.toLowerCase().includes(pastSearch.toLowerCase()) ||
    (e.loc || '').toLowerCase().includes(pastSearch.toLowerCase())
  );

  // Combined list: real past events first, example past events appended
  const allDisplayPast = [
    ...filteredPast,
    ...examplePast.filter(e =>
      !pastSearch ||
      e.title.toLowerCase().includes(pastSearch.toLowerCase()) ||
      (e.loc || '').toLowerCase().includes(pastSearch.toLowerCase())
    ),
  ];

  const totalPastCount = past.length + examplePast.length;

  return (
    <main className="page-content">
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

      {/* Past Events — real + example combined */}
      {totalPastCount > 0 && (
        <div className="past-events-section">
          <div className="past-events-header" onClick={() => setPastOpen(o => !o)}>
            <div className="sec-title">Past Events</div>
            <span className="chip chip-gray">{totalPastCount}</span>
            {examplePast.length > 0 && past.length === 0 && (
              <span style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 6,
                background: '#FAEEDA',
                color: '#854F0B',
                fontWeight: 500,
                marginLeft: 4,
              }}>
                Example
              </span>
            )}
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

              {/* Only show time filters if there are real past events */}
              {past.length > 0 && (
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
              )}

              {/* Example events notice when no real past events */}
              {past.length === 0 && examplePast.length > 0 && (
                <div style={{
                  fontSize: 12,
                  color: '#854F0B',
                  background: '#FAEEDA',
                  border: '0.5px solid #FAC775',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 10,
                  lineHeight: 1.5,
                }}>
                  ✦ This is an example of what your past events will look like — with Moments, photos, and Passport stamps after an event ends.
                </div>
              )}

              {allDisplayPast.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--ink2)', fontSize: 14 }}>No events in this period.</div>
              ) : (
                <div className="events-list">
                  {allDisplayPast.map(evt => (
                    <EventRow
                      key={evt.id}
                      event={evt}
                      onClick={() => setSelected(evt)}
                      past
                      isExample={!!evt.isExample}
                    />
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

function EventRow({ event, onClick, onEdit, onDelete, past, isExample }) {
  const cover = event.cover || {};
  const hasImg = cover.type === 'image' || event.img;

  return (
    <div
      className="event-row"
      onClick={onClick}
      style={past ? { opacity: isExample ? 0.75 : 0.8 } : {}}
    >
      <div className="event-row-cover" style={!hasImg ? { background: cover.gradient || cover.value || 'var(--indigo)' } : {}}>
        {hasImg
          ? <img src={cover.value || event.img} alt={event.title} />
          : <span>{cover.emoji || '🍽️'}</span>}
      </div>
      <div className="event-row-info">
        <div className="event-row-title" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {event.title}
          {isExample && (
            <span style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 5,
              background: '#FAEEDA',
              color: '#854F0B',
              fontWeight: 500,
              lineHeight: 1.4,
            }}>
              Example
            </span>
          )}
        </div>
        <div className="event-row-meta">
          <span>📅 {fmtDate(event.date)}</span>
          <span>🕖 {fmtTime(event.time)}</span>
          {(event.loc || event.location) && <span>📍 {event.loc || event.location}</span>}
          <span className="chip chip-gray" style={{ padding: '2px 8px' }}>
            {event.type ? event.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim() : ''}
          </span>
          {(event.isEnded || event.isPast) && (
            <span className="chip chip-gray" style={{ padding: '2px 8px' }}>Ended</span>
          )}
        </div>
      </div>
      <div className="event-row-actions" onClick={e => e.stopPropagation()}>
        {!past && !isExample && onDelete && (
          <button className="btn btn-ghost btn-sm" onClick={onDelete} style={{ color: 'var(--coral)' }}>🗑️</button>
        )}
        {event.mine && !isExample && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ fontSize: 11, padding: '3px 8px', color: 'var(--indigo)', border: '1px solid var(--indigo-light)' }}
            onClick={e => { e.stopPropagation(); onClick(); }}
            title="Host tools"
          >
            🛠️ Host
          </button>
        )}
        {isExample && (
          <span style={{
            fontSize: 10,
            padding: '3px 9px',
            borderRadius: 6,
            background: 'var(--surface)',
            color: 'var(--ink3)',
            border: '0.5px solid var(--border)',
          }}>
            View →
          </span>
        )}
      </div>
    </div>
  );
}
