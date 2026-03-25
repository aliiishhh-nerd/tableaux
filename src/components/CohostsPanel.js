import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { avColor } from '../data/utils';

const DEFAULT_PERMS = { edit: true, approveGuests: true, showOnPage: true };

// ─── Permission Toggle Row ────────────────────────────────────────────────────
function PermToggle({ label, hint, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{hint}</div>
      </div>
      <div onClick={() => onChange(!value)}
        style={{ width: 38, height: 21, borderRadius: 11, background: value ? 'var(--indigo)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0, marginTop: 2 }}>
        <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: value ? 20 : 3, transition: 'left .2s' }} />
      </div>
    </div>
  );
}

// ─── Add Cohost Modal ─────────────────────────────────────────────────────────
function AddCohostModal({ eventId, onClose }) {
  const { addCohost } = useApp();
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [perms, setPerms] = useState({ ...DEFAULT_PERMS });

  function save() {
    if (!name.trim()) { alert('Please enter a name.'); return; }
    addCohost(eventId, { name: name.trim(), email: email.trim(), permissions: perms });
    onClose();
  }

  function setP(key, val) { setPerms(p => ({ ...p, [key]: val })); }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,20,45,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, width: 480, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(17,20,45,0.18)' }}>
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Add a Co-host</div>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--page)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: 'var(--ink2)' }}>✕</div>
        </div>
        <div style={{ padding: '20px 28px' }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" placeholder="Co-host name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional — to notify them)</span></label>
            <input className="form-input" type="email" placeholder="cohost@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div style={{ marginTop: 8 }}>
            <label className="form-label" style={{ marginBottom: 4 }}>Permissions</label>
            <div style={{ background: 'var(--page)', borderRadius: 'var(--r2)', padding: '4px 16px', border: '1px solid var(--border)' }}>
              <PermToggle
                label="Can edit event details"
                hint="Co-host can update title, description, date, and location"
                value={perms.edit}
                onChange={v => setP('edit', v)}
              />
              <PermToggle
                label="Can approve or deny guests"
                hint="Co-host can manage the guest list and pending requests"
                value={perms.approveGuests}
                onChange={v => setP('approveGuests', v)}
              />
              <PermToggle
                label="Show on event page"
                hint="Co-host name appears alongside yours on the invitation"
                value={perms.showOnPage}
                onChange={v => setP('showOnPage', v)}
              />
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Add Co-host</button>
        </div>
      </div>
    </div>
  );
}

// ─── Cohost Card ──────────────────────────────────────────────────────────────
function CohostCard({ cohost, eventId, index, isOwner }) {
  const { updateCohostPermissions, removeCohost } = useApp();
  const [expanded, setExpanded] = useState(false);
  const perms = cohost.permissions || DEFAULT_PERMS;

  function setP(key, val) {
    updateCohostPermissions(eventId, cohost.name, { [key]: val });
  }

  const activePerms = Object.entries(perms).filter(([, v]) => v).length;

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className={`av av-sm ${avColor(index + 1)}`}>
          {cohost.name.split(' ').map(x => x[0]).join('').slice(0, 2)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{cohost.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>
            {cohost.email || 'No email set'} · {activePerms} permission{activePerms !== 1 ? 's' : ''} active
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isOwner && (
            <>
              <button onClick={() => setExpanded(v => !v)}
                style={{ padding: '5px 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'white', color: 'var(--ink2)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                {expanded ? 'Done' : 'Edit'}
              </button>
              <button onClick={() => removeCohost(eventId, cohost.name)}
                style={{ padding: '5px 12px', borderRadius: 'var(--r)', border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                Remove
              </button>
            </>
          )}
        </div>
      </div>

      {/* Permission badges (collapsed) */}
      {!expanded && (
        <div style={{ padding: '0 18px 14px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {perms.edit && <span style={{ padding: '3px 9px', borderRadius: 20, background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 10, fontWeight: 600 }}>Can edit</span>}
          {perms.approveGuests && <span style={{ padding: '3px 9px', borderRadius: 20, background: 'var(--teal-light)', color: '#07A87B', fontSize: 10, fontWeight: 600 }}>Manages guests</span>}
          {perms.showOnPage && <span style={{ padding: '3px 9px', borderRadius: 20, background: 'var(--amber-light)', color: '#C67C00', fontSize: 10, fontWeight: 600 }}>On invitation</span>}
        </div>
      )}

      {/* Expanded permissions editor */}
      {expanded && isOwner && (
        <div style={{ padding: '0 18px 18px' }}>
          <div style={{ background: 'var(--page)', borderRadius: 'var(--r2)', padding: '4px 16px', border: '1px solid var(--border)' }}>
            <PermToggle label="Can edit event details" hint="Update title, description, date, and location" value={perms.edit} onChange={v => setP('edit', v)} />
            <PermToggle label="Can approve or deny guests" hint="Manage guest list and pending requests" value={perms.approveGuests} onChange={v => setP('approveGuests', v)} />
            <PermToggle label="Show on event page" hint="Name appears on the invitation alongside yours" value={perms.showOnPage} onChange={v => setP('showOnPage', v)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cohosts Panel (used in EventDetailModal) ─────────────────────────────────
export default function CohostsPanel({ event, isHost }) {
  const [showAdd, setShowAdd] = useState(false);
  const cohosts = event.cohosts || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="sec-label" style={{ margin: 0 }}>{cohosts.length} Co-host{cohosts.length !== 1 ? 's' : ''}</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 3 }}>Co-hosts share event management responsibilities</div>
        </div>
        {isHost && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Co-host</button>
        )}
      </div>

      {/* Primary host */}
      <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '14px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="av av-sm av-indigo">{event.host.split(' ').map(x => x[0]).join('').slice(0, 2)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{event.host}</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>Event creator · Full access</div>
        </div>
        <span style={{ padding: '3px 10px', borderRadius: 20, background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 10, fontWeight: 700 }}>Host</span>
      </div>

      {cohosts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '24px 20px', background: 'var(--page)', borderRadius: 'var(--r2)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: 26, marginBottom: 8 }}>👥</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 4 }}>No co-hosts yet</div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {isHost ? 'Add a co-host to share event management.' : 'Only the primary host is managing this event.'}
          </div>
          {isHost && <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => setShowAdd(true)}>+ Add Co-host</button>}
        </div>
      )}

      {cohosts.map((c, i) => (
        <CohostCard key={c.name} cohost={c} eventId={event.id} index={i} isOwner={isHost} />
      ))}

      {showAdd && <AddCohostModal eventId={event.id} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

// ─── Inline Cohost Adder (used inside CreateEventModal) ───────────────────────
export function InlineCohostAdder({ cohosts = [], onChange }) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [perms, setPerms] = useState({ ...DEFAULT_PERMS });

  function addLocal() {
    if (!name.trim()) return;
    const updated = [...cohosts, { name: name.trim(), email: email.trim(), permissions: { ...perms } }];
    onChange(updated);
    setName(''); setEmail(''); setPerms({ ...DEFAULT_PERMS }); setShowAdd(false);
  }

  function removeLocal(n) { onChange(cohosts.filter(c => c.name !== n)); }
  function setP(key, val) { setPerms(p => ({ ...p, [key]: val })); }

  return (
    <div>
      {cohosts.map((c, i) => (
        <div key={c.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className={`av av-sm ${avColor(i + 1)}`}>{c.name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
              <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
                {[c.permissions?.edit && 'Can edit', c.permissions?.approveGuests && 'Manages guests', c.permissions?.showOnPage && 'On page'].filter(Boolean).join(' · ')}
              </div>
            </div>
          </div>
          <button onClick={() => removeLocal(c.name)}
            style={{ padding: '4px 10px', borderRadius: 'var(--r)', border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Remove</button>
        </div>
      ))}

      {showAdd ? (
        <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 16, marginBottom: 8 }}>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="Co-host name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email (optional)</label>
              <input className="form-input" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
          </div>
          <label className="form-label">Permissions</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {[
              { key: 'edit',           label: 'Can edit' },
              { key: 'approveGuests',  label: 'Manages guests' },
              { key: 'showOnPage',     label: 'Show on invitation' },
            ].map(p => (
              <div key={p.key} onClick={() => setP(p.key, !perms[p.key])}
                style={{ padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${perms[p.key] ? 'var(--indigo)' : 'var(--border)'}`, background: perms[p.key] ? 'var(--indigo-light)' : 'white', color: perms[p.key] ? 'var(--indigo)' : 'var(--ink2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}>
                {perms[p.key] ? '✓ ' : ''}{p.label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={addLocal}>Add Co-host</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)}
          style={{ width: '100%', padding: '9px 16px', borderRadius: 'var(--r)', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--indigo)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          + Add a Co-host
        </button>
      )}
    </div>
  );
}
