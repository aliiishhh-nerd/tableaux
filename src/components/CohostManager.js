import React, { useState } from 'react';
import { avColor } from '../data/utils';

const PERM_LABELS = {
  edit:           { label: 'Can edit event',         desc: 'Title, date, description, image' },
  approveGuests:  { label: 'Can manage guests',       desc: 'Approve or deny RSVP requests' },
  showOnPage:     { label: 'Shown on invitation',     desc: 'Avatar + name appear on event page' },
};

function initials(name) {
  const p = name.trim().split(' ');
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
}

export default function CohostManager({ cohosts = [], onChange }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [editingPerms, setEditingPerms] = useState(null); // cohostName

  function addCohost() {
    if (!form.name.trim()) { alert('Please enter a name.'); return; }
    if (cohosts.some(c => c.name === form.name.trim())) { alert('This person is already a co-host.'); return; }
    const cohost = {
      name: form.name.trim(),
      email: form.email.trim(),
      permissions: { edit: false, approveGuests: false, showOnPage: false },
    };
    onChange([...cohosts, cohost]);
    setForm({ name: '', email: '' });
    setAdding(false);
  }

  function removeCohost(name) {
    onChange(cohosts.filter(c => c.name !== name));
    if (editingPerms === name) setEditingPerms(null);
  }

  function togglePerm(cohostName, perm) {
    onChange(cohosts.map(c =>
      c.name !== cohostName ? c : { ...c, permissions: { ...c.permissions, [perm]: !c.permissions[perm] } }
    ));
  }

  return (
    <div>
      {/* Existing cohosts */}
      {cohosts.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {cohosts.map((c, i) => {
            const activePerms = Object.entries(c.permissions).filter(([, v]) => v).map(([k]) => PERM_LABELS[k]?.label);
            return (
              <div key={c.name}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 6 }}>
                  <div className={`av av-sm ${avColor(i)}`}>{initials(c.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {activePerms.length > 0 ? activePerms.join(' · ') : 'No permissions set'}
                    </div>
                  </div>
                  <button onClick={() => setEditingPerms(editingPerms === c.name ? null : c.name)}
                    style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: editingPerms === c.name ? 'var(--indigo-light)' : 'white', color: editingPerms === c.name ? 'var(--indigo)' : 'var(--ink2)', cursor: 'pointer', fontWeight: 600 }}>
                    Permissions
                  </button>
                  <button onClick={() => removeCohost(c.name)} style={{ background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: 16, padding: '0 2px' }}>×</button>
                </div>

                {/* Permissions panel */}
                {editingPerms === c.name && (
                  <div style={{ margin: '-4px 0 8px 0', padding: '14px 16px', background: 'var(--indigo-light)', border: '1px solid rgba(108,93,211,.2)', borderRadius: '0 0 var(--r) var(--r)' }}>
                    {Object.entries(PERM_LABELS).map(([key, meta]) => (
                      <div key={key} onClick={() => togglePerm(c.name, key)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(108,93,211,.12)', cursor: 'pointer' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>{meta.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink2)' }}>{meta.desc}</div>
                        </div>
                        <div style={{ width: 38, height: 21, borderRadius: 11, background: c.permissions[key] ? 'var(--indigo)' : 'rgba(108,93,211,.2)', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                          <div style={{ position: 'absolute', top: 2.5, left: c.permissions[key] ? 19 : 2.5, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add co-host form */}
      {adding ? (
        <div style={{ background: 'var(--page)', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Add a co-host</div>
          <div className="form-row" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Name</label>
              <input className="form-input" placeholder="Full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email (optional)</label>
              <input className="form-input" type="email" placeholder="they@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 12 }}>You can set their permissions after adding them.</div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setAdding(false); setForm({ name: '', email: '' }); }}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={addCohost}>Add Co-host</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 20, border: '1.5px solid var(--border)', background: 'white', color: 'var(--ink2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink2)'; }}>
          + Add co-host
        </button>
      )}
    </div>
  );
}
