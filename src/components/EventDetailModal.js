import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, avColor } from '../data/utils';

export default function EventDetailModal({ event: e, onClose, onOpenEdit }) {
  const { approveGuest, denyGuest, requestJoin, addPotluckItem, profile } = useApp();
  const [tab, setTab] = useState('overview');
  const [potInput, setPotInput] = useState('');

  const att = e.guests.filter(g => g.s === 'approved');
  const pend = e.guests.filter(g => g.s === 'pending');
  const isPot = e.type === 'Potluck';
  const isHost = e.mine;

  function handleAddPot() {
    if (!potInput.trim()) return;
    addPotluckItem(e.id, potInput.trim(), profile.name);
    setPotInput('');
  }

  return (
    <div className="modal-overlay" onClick={e2 => e2.target === e2.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ padding: 0 }}>
        {/* Hero */}
        <div className="det-hero">
          {e.img && <img src={e.img} alt={e.title} />}
          <div className="det-hero-bg" style={{ background: e.invBg || '#6C5DD3' }} />
          <div className="det-hero-ov" />
          <div className="det-hero-content">
            <div className="det-eyebrow">{e.invH || "You're Invited"} · {e.type}</div>
            <div className="det-title">{e.title}</div>
            <div className="det-chips">
              <div className="det-chip">📅 {fmtDate(e.date)} · {e.time}</div>
              <div className="det-chip">📍 {e.loc}</div>
              <div className="det-chip">👤 {e.host}</div>
              <div className="det-chip">{e.vis}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '6px 12px', color: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✕ Close</button>
        </div>

        {/* Tabs */}
        <div className="det-tabs">
          {['overview', 'guests', isPot && 'potluck'].filter(Boolean).map(t => (
            <div key={t} className={`det-tab ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
              {t === 'overview' ? 'Overview' : t === 'guests' ? `Guests (${e.guests.length})` : 'Potluck'}
            </div>
          ))}
        </div>

        {/* Panels */}
        {tab === 'overview' && (
          <div className="det-panel">
            <div className="sec-label">About this event</div>
            <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.75, marginBottom: 20 }}>
              {e.desc || 'No description yet.'}
            </p>

            {e.addr && (
              <>
                <div className="divider" />
                <div className="sec-label">Location</div>
                <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 16, marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>📍 {e.loc}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 12 }}>{e.addr}</div>
                  <div className="map-btns">
                    <a className="map-btn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.loc + ' ' + e.addr)}`} target="_blank" rel="noopener noreferrer">🗺 Google Maps</a>
                    <a className="map-btn" href={`https://maps.apple.com/?q=${encodeURIComponent(e.loc)}&address=${encodeURIComponent(e.addr)}`} target="_blank" rel="noopener noreferrer">🍎 Apple Maps</a>
                  </div>
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
              {isHost
                ? <button className="btn btn-outline" onClick={() => { onClose(); onOpenEdit(e.id); }}>✏ Edit Event</button>
                : <button className="btn btn-primary" onClick={() => requestJoin(e.id, profile.name)}>Request to Join</button>
              }
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
                  <div className={`av av-sm ${avColor(i)}`}>{g.n.split(' ').map(x => x[0]).join('')}</div>
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
                      <div className={`av av-sm ${avColor(i + 4)}`}>{g.n.split(' ').map(x => x[0]).join('')}</div>
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
              <input
                className="form-input" style={{ flex: 1 }}
                placeholder="What will you bring?"
                value={potInput}
                onChange={e2 => setPotInput(e2.target.value)}
                onKeyDown={e2 => e2.key === 'Enter' && handleAddPot()}
              />
              <button className="btn btn-primary btn-sm" onClick={handleAddPot}>Add Item</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
