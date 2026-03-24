import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, avColor } from '../data/utils';
import PollsPanel from './PollsPanel';
import CohostsPanel from './CohostsPanel';
import { CalendarExportButtons } from '../data/calendarExport';
import MusicPanel from './MusicPanel';
import GalleryPanel from './GalleryPanel';
import DiningPassport from './DiningPassport';

export default function EventDetailModal({ event: e, onClose, onOpenEdit }) {
  const { approveGuest, denyGuest, requestJoin, addPotluckItem, profile } = useApp();
  const [tab, setTab] = useState('overview');
  const [potInput, setPotInput] = useState('');

  const att = e.guests.filter(g => g.s === 'approved');
  const pend = e.guests.filter(g => g.s === 'pending');
  const isPot = e.type === 'Potluck';
  const isHost = e.mine;
  const polls = e.polls || [];
  const cohosts = e.cohosts || [];
  const visibleCohosts = cohosts.filter(c => c.permissions?.showOnPage);

  function handleAddPot() {
    if (!potInput.trim()) return;
    addPotluckItem(e.id, potInput.trim(), profile.name);
    setPotInput('');
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'guests',   label: 'Guests (' + e.guests.length + ')' },
    ...(isPot ? [{ id: 'potluck', label: 'Potluck' }] : []),
    { id: 'polls',    label: 'Polls' + (polls.length > 0 ? ' (' + polls.length + ')' : '') },
    { id: 'music',    label: 'Music' },
    { id: 'photos',   label: 'Photos' + ((e.gallery?.photos || []).filter(p => p.status === 'approved').length > 0 ? ' (' + (e.gallery?.photos || []).filter(p => p.status === 'approved').length + ')' : '') },
    { id: 'passport', label: 'Passport' },
    { id: 'cohosts',  label: 'Co-hosts' + (cohosts.length > 0 ? ' (' + cohosts.length + ')' : '') },
  ];

  return (
    <div className="modal-overlay" onClick={e2 => e2.target === e2.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ padding: 0 }}>

        <div className="det-hero">
          {e.img && <img src={e.img} alt={e.title} />}
          <div className="det-hero-bg" style={{ background: e.invBg || '#6C5DD3' }} />
          <div className="det-hero-ov" />
          <div className="det-hero-content">
            <div className="det-eyebrow">{e.invH || "You're Invited"} · {e.type}</div>
            <div className="det-title">{e.title}</div>
            {visibleCohosts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>Hosted with</span>
                {visibleCohosts.map(c => (
                  <span key={c.name} style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)', fontSize: 11, color: 'white', fontWeight: 600 }}>{c.name}</span>
                ))}
              </div>
            )}
            <div className="det-chips">
              <div className="det-chip">📅 {fmtDate(e.date)} · {e.time}</div>
              <div className="det-chip">📍 {e.loc}</div>
              <div className="det-chip">👤 {e.host}</div>
              <div className="det-chip">{e.vis}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✕ Close</button>
        </div>

        <div className="det-tabs" style={{ overflowX: 'auto' }}>
          {tabs.map(t => (
            <div key={t.id} className={'det-tab' + (tab === t.id ? ' on' : '')} onClick={() => setTab(t.id)}>
              {t.label}
            </div>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="det-panel">
            <div className="sec-label">About this event</div>
            <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.75, marginBottom: 20 }}>
              {e.desc || 'No description yet.'}
            </p>
            {e.addr && (
              <React.Fragment>
                <div className="divider" />
                <div className="sec-label">Location</div>
                <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>📍 {e.loc}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 12 }}>{e.addr}</div>
                  <div className="map-btns">
                    <a className="map-btn" href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(e.loc + ' ' + e.addr)} target="_blank" rel="noopener noreferrer">🗺 Google Maps</a>
                    <a className="map-btn" href={'https://maps.apple.com/?q=' + encodeURIComponent(e.loc) + '&address=' + encodeURIComponent(e.addr)} target="_blank" rel="noopener noreferrer">🍎 Apple Maps</a>
                  </div>
                </div>
              </React.Fragment>
            )}
            {polls.length > 0 && (
              <React.Fragment>
                <div className="divider" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div className="sec-label" style={{ margin: 0 }}>Active Polls</div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('polls')}>View all →</button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {polls.map(poll => {
                    const icon = poll.type === 'date' ? '📅' : poll.type === 'food' ? '🍽' : '🍷';
                    const totalVotes = (poll.options || []).filter(o => o.status === 'active').reduce((s, o) => s + (o.votes ? o.votes.length : 0), 0);
                    return (
                      <div key={poll.id} onClick={() => setTab('polls')} style={{ padding: '8px 14px', borderRadius: 'var(--r)', background: 'var(--indigo-light)', border: '1px solid var(--indigo-mid)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--indigo)' }}>
                        {icon} {poll.question} · {totalVotes} vote{totalVotes !== 1 ? 's' : ''}{poll.locked ? ' · ✅ Decided' : ''}
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            )}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
              {isHost
                ? <button className="btn btn-outline" onClick={() => { onClose(); onOpenEdit(e.id); }}>✏ Edit Event</button>
                : <button className="btn btn-primary" onClick={() => requestJoin(e.id, profile.name)}>Request to Join</button>
              }
              <CalendarExportButtons event={e} compact={true} />
              <button className="btn btn-ghost" onClick={onClose}>Close</button>
            </div>
          </div>
        )}

        {tab === 'guests' && (
          <div className="det-panel">
            <div className="sec-label">{att.length} Attending · {pend.length} Pending · {e.cap - att.length} Spots Left</div>
            {att.map((g, i) => (
              <div key={g.n} className="p-row">
                <div className="p-left">
                  <div className={'av av-sm ' + avColor(i)}>{g.n.split(' ').map(x => x[0]).join('')}</div>
                  <div><div className="p-name">{g.n}</div></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)' }} />
                  <span style={{ fontSize: 11, color: 'var(--ink2)', fontWeight: 500 }}>Attending</span>
                </div>
              </div>
            ))}
            {pend.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div className="sec-label">Pending Approval</div>
                {pend.map((g, i) => (
                  <div key={g.n} className="p-row">
                    <div className="p-left">
                      <div className={'av av-sm ' + avColor(i + 4)}>{g.n.split(' ').map(x => x[0]).join('')}</div>
                      <div>
                        <div className="p-name">{g.n}</div>
                        <div className="p-sub">Requested to join</div>
                      </div>
                    </div>
                    {isHost
                      ? <div style={{ display: 'flex', gap: 7 }}>
                          <button className="btn btn-danger btn-sm" onClick={() => denyGuest(e.id, g.n)}>Deny</button>
                          <button className="btn btn-primary btn-sm" onClick={() => approveGuest(e.id, g.n)}>Approve</button>
                        </div>
                      : <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--amber)' }} />
                          <span style={{ fontSize: 11, color: 'var(--ink2)', fontWeight: 500 }}>Pending</span>
                        </div>
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'potluck' && isPot && (
          <div className="det-panel">
            <div className="sec-label">{e.pot.length} Items Pledged</div>
            {e.pot.map((p, i) => (
              <div key={i} className="pot-row">
                <div className="pot-icon">🍽</div>
                <div>
                  <div className="pot-name">{p.item}</div>
                  <div className="pot-by">Brought by {p.by}</div>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input className="form-input" style={{ flex: 1 }} placeholder="What will you bring?"
                value={potInput} onChange={e2 => setPotInput(e2.target.value)}
                onKeyDown={e2 => e2.key === 'Enter' && handleAddPot()} />
              <button className="btn btn-primary btn-sm" onClick={handleAddPot}>Add Item</button>
            </div>
          </div>
        )}

        {tab === 'polls' && (
          <div className="det-panel">
            <PollsPanel event={e} isHost={isHost} userName={profile.name} />
          </div>
        )}

        {tab === 'music' && (
          <div className="det-panel">
            <MusicPanel event={e} isHost={isHost} />
          </div>
        )}

        {tab === 'photos' && (
          <div className="det-panel">
            <GalleryPanel event={e} isHost={isHost} />
          </div>
        )}

        {tab === 'passport' && (
          <div className="det-panel">
            <DiningPassport userName={profile.name} />
          </div>
        )}

        {tab === 'cohosts' && (
          <div className="det-panel">
            <CohostsPanel event={e} isHost={isHost} />
          </div>
        )}

      </div>
    </div>
  );
}
