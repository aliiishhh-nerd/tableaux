import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate } from '../data/utils';
import EventDetailModal from '../components/EventDetailModal';

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram',  icon: '📸', prefix: 'instagram.com/', cls: 'social-btn-ig' },
  { key: 'tiktok',    label: 'TikTok',     icon: '🎵', prefix: 'tiktok.com/@',   cls: 'social-btn-tt' },
  { key: 'x',         label: 'X / Twitter',icon: '𝕏',  prefix: 'x.com/',         cls: 'social-btn-x' },
  { key: 'substack',  label: 'Substack',   icon: '📬', prefix: '',               cls: '' },
];

export default function ProfilePage() {
  const { user, events, updateProfile, logout, addToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tab, setTab] = useState('events');
  const [draft, setDraft] = useState(null);

  if (!user) return null;

  const hostedEvents = events.filter(e => e.mine);
  const passportEvents = events.filter(e => e.isEnded || e.isPast).slice(0, 7);

  function startEdit() {
    setDraft({
      name: user.name,
      handle: user.handle || '',
      bio: user.bio || '',
      socials: { ...user.socials },
    });
    setEditing(true);
  }

  function saveEdit() {
    updateProfile({
      name: draft.name,
      handle: draft.handle,
      bio: draft.bio,
      initials: draft.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      socials: draft.socials,
    });
    setEditing(false);
    addToast('Profile updated ✓', 'success');
  }

  const activeSocials = SOCIAL_PLATFORMS.filter(p => user.socials?.[p.key]);

  return (
    <main className="page-content">
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-hero-inner">
          <div className={`av av-xl av-${user.color || 'indigo'}`}>{user.initials}</div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{user.name}</div>
            <div className="profile-handle">{user.handle || '@' + user.name.toLowerCase().replace(/\s/g, '')}</div>
            {user.bio && <div className="profile-bio">{user.bio}</div>}

            <div className="profile-stats">
              <div>
                <div className="profile-stat-val">{hostedEvents.length}</div>
                <div className="profile-stat-label">Events Hosted</div>
              </div>
              <div>
                <div className="profile-stat-val">{user.friendsCount || 48}</div>
                <div className="profile-stat-label">Friends</div>
              </div>
              <div>
                <div className="profile-stat-val">{passportEvents.length}</div>
                <div className="profile-stat-label">Dining Passport</div>
              </div>
            </div>

            {/* Social links */}
            {activeSocials.length > 0 && (
              <div className="profile-social">
                {activeSocials.map(p => (
                  <a
                    key={p.key}
                    href={`https://${p.prefix}${user.socials[p.key]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`social-btn ${p.cls}`}
                  >
                    <span>{p.icon}</span>
                    @{user.socials[p.key]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button className="btn btn-ghost btn-sm" onClick={startEdit}>✏️ Edit Profile</button>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--coral)' }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
          🗓️ Events ({hostedEvents.length})
        </button>
        <button className={`tab-btn ${tab === 'passport' ? 'active' : ''}`} onClick={() => setTab('passport')}>
          🌍 Dining Passport
        </button>
        <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
          ⚙️ Settings
        </button>
      </div>

      {/* Events tab */}
      {tab === 'events' && (
        <div>
          {hostedEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🗓️</div>
              <div className="empty-title">No events yet</div>
              <div className="empty-sub">Head to My Events to host your first dinner.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hostedEvents.map(evt => (
                <div
                  key={evt.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer', boxShadow: 'var(--shadow)' }}
                  onClick={() => setSelectedEvent(evt)}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {evt.img || evt.cover?.value ? <img src={evt.cover?.value || evt.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{evt.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>{fmtDate(evt.date)} · {evt.guests?.length || 0} guests</div>
                  </div>
                  <span className={`chip ${evt.isEnded || evt.isPast ? 'chip-gray' : 'chip-teal'}`}>
                    {evt.isEnded || evt.isPast ? 'Ended' : 'Upcoming'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Passport tab */}
      {tab === 'passport' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 16, lineHeight: 1.6 }}>
            Your dining passport tracks every memorable meal and event you've hosted or attended. Each stamp is a story.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
            {passportEvents.map((evt, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 12, overflow: 'hidden',
                border: '1px solid var(--border)', boxShadow: 'var(--shadow)', cursor: 'pointer',
              }} onClick={() => setSelectedEvent(evt)}>
                <div style={{ height: 80, background: 'var(--indigo)', overflow: 'hidden' }}>
                  {evt.img && <img src={evt.cover?.value || evt.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 2 }}>{evt.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{fmtDate(evt.date)}</div>
                </div>
              </div>
            ))}
            {/* Empty stamps */}
            {Array.from({ length: Math.max(0, 8 - passportEvents.length) }).map((_, i) => (
              <div key={'empty-' + i} style={{
                background: 'var(--page)', borderRadius: 12,
                border: '2px dashed var(--border)', height: 120,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: 'var(--border)',
              }}>🍽️</div>
            ))}
          </div>
        </div>
      )}

      {/* Settings / Edit profile */}
      {tab === 'settings' && (
        <div style={{ maxWidth: 480 }}>
          <div className="card card-pad">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Profile Information</div>

            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input className="form-input" value={user.name} onChange={() => {}} onFocus={startEdit} readOnly={!editing} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Handle</label>
              <input className="form-input" value={user.handle || ''} readOnly placeholder="@yourhandle" />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-textarea" value={user.bio || ''} readOnly placeholder="Tell people about your food story..." style={{ minHeight: 70 }} />
            </div>

            <div style={{ fontWeight: 700, fontSize: 14, margin: '20px 0 12px', color: 'var(--ink)' }}>🔗 Social Accounts</div>
            {SOCIAL_PLATFORMS.map(p => (
              <div key={p.key} className="form-group">
                <label className="form-label">{p.icon} {p.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.prefix && <span style={{ fontSize: 13, color: 'var(--ink3)', whiteSpace: 'nowrap' }}>{p.prefix}</span>}
                  <input className="form-input" value={user.socials?.[p.key] || ''} readOnly placeholder={`your${p.key}handle`} />
                </div>
              </div>
            ))}

            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={startEdit}>
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && draft && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(false)}>
          <div className="modal">
            <div className="modal-head">
              <h2>Edit Profile</h2>
              <button className="modal-x" onClick={() => setEditing(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-input" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Handle</label>
                <input className="form-input" value={draft.handle} onChange={e => setDraft(d => ({ ...d, handle: e.target.value }))} placeholder="@yourhandle" />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} placeholder="Your food story..." />
              </div>

              <div style={{ fontWeight: 700, fontSize: 14, margin: '16px 0 12px', color: 'var(--ink)' }}>🔗 Social Accounts</div>
              {SOCIAL_PLATFORMS.map(p => (
                <div key={p.key} className="form-group">
                  <label className="form-label">{p.icon} {p.label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.prefix && <span style={{ fontSize: 12, color: 'var(--ink3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.prefix}</span>}
                    <input
                      className="form-input"
                      value={draft.socials?.[p.key] || ''}
                      onChange={e => setDraft(d => ({ ...d, socials: { ...d.socials, [p.key]: e.target.value } }))}
                      placeholder={`your${p.key}handle`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </main>
  );
}
