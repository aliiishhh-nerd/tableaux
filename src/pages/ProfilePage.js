import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate } from '../data/utils';
import EventDetailModal from '../components/EventDetailModal';
import { USERS } from '../data/seed';

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram',   icon: '📸', prefix: 'instagram.com/', cls: 'social-btn-ig' },
  { key: 'tiktok',    label: 'TikTok',      icon: '🎵', prefix: 'tiktok.com/@',   cls: 'social-btn-tt' },
  { key: 'x',         label: 'X / Twitter', icon: '𝕏',  prefix: 'x.com/',         cls: 'social-btn-x'  },
  { key: 'substack',  label: 'Substack',    icon: '📬', prefix: '',               cls: ''              },
];

export default function ProfilePage() {
  const { user, events, updateProfile, logout, addToast } = useApp();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tab, setTab] = useState('events');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [following, setFollowing] = useState([]);
  const [viewingUser, setViewingUser] = useState(null);

  if (!user) return null;

  const hostedEvents = events.filter(e => e.mine);
  const passportEvents = events.filter(e => (e.isEnded || e.isPast) && e.mine).slice(0, 8);

  function startEdit() {
    setDraft({
      name: user.name,
      handle: user.handle || '',
      bio: user.bio || '',
      website: user.website || '',
      socials: { ...user.socials },
    });
    setEditing(true);
  }

  function saveEdit() {
    updateProfile({
      name: draft.name,
      handle: draft.handle,
      bio: draft.bio,
      website: draft.website,
      initials: draft.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      socials: draft.socials,
    });
    setEditing(false);
    addToast('Profile updated ✓', 'success');
  }

  function toggleFollow(userId) {
    setFollowing(f => f.includes(userId) ? f.filter(id => id !== userId) : [...f, userId]);
    const u = USERS.find(u => u.id === userId);
    addToast(following.includes(userId) ? `Unfollowed ${u?.name}` : `Following ${u?.name} 🎉`, following.includes(userId) ? '' : 'success');
  }

  const activeSocials = SOCIAL_PLATFORMS.filter(p => user.socials?.[p.key]);

  if (viewingUser) {
    return <FriendProfile user={viewingUser} onBack={() => setViewingUser(null)} following={following} onToggleFollow={toggleFollow} events={events} />;
  }

  return (
    <main className="page-content">
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-hero-inner">
          <div className={`av av-xl av-${user.color || 'indigo'}`}>{user.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="profile-name">{user.name}</div>
            <div className="profile-handle">{user.handle || '@' + user.name.toLowerCase().replace(/\s/g, '')}</div>
            {user.bio && <div className="profile-bio">{user.bio}</div>}

            {/* Website link */}
            {user.website && (
              <a
                href={user.website.startsWith('http') ? user.website : 'https://' + user.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--indigo)', marginTop: 6, textDecoration: 'none', fontWeight: 500 }}
              >
                🔗 {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}

            <div className="profile-stats">
              <div><div className="profile-stat-val">{hostedEvents.length}</div><div className="profile-stat-label">Hosted</div></div>
              <div><div className="profile-stat-val">{user.friendsCount || 48}</div><div className="profile-stat-label">Friends</div></div>
              <div><div className="profile-stat-val">{following.length}</div><div className="profile-stat-label">Following</div></div>
              <div><div className="profile-stat-val">{passportEvents.length}</div><div className="profile-stat-label">Passport</div></div>
            </div>

            {activeSocials.length > 0 && (
              <div className="profile-social">
                {activeSocials.map(p => (
                  <a key={p.key} href={`https://${p.prefix}${user.socials[p.key]}`} target="_blank" rel="noopener noreferrer" className={`social-btn ${p.cls}`}>
                    <span>{p.icon}</span>@{user.socials[p.key]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={startEdit}>✏️ Edit Profile</button>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--coral)' }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>🗓️ Events ({hostedEvents.length})</button>
        <button className={`tab-btn ${tab === 'passport' ? 'active' : ''}`} onClick={() => setTab('passport')}>🌍 Passport</button>
        <button className={`tab-btn ${tab === 'friends' ? 'active' : ''}`} onClick={() => setTab('friends')}>👥 Friends ({USERS.filter(u => u.id !== 'u1').length})</button>
        <button className={`tab-btn ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>⚙️ Settings</button>
      </div>

      {/* Events */}
      {tab === 'events' && (
        <div>
          {hostedEvents.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🗓️</div><div className="empty-title">No events yet</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hostedEvents.map(evt => (
                <div key={evt.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer', boxShadow: 'var(--shadow)' }}
                  onClick={() => setSelectedEvent(evt)}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {(evt.cover?.value || evt.img) ? <img src={evt.cover?.value || evt.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍽️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>{fmtDate(evt.date)} · {evt.guests?.length || 0} guests</div>
                  </div>
                  <span className={`chip ${evt.isEnded || evt.isPast ? 'chip-gray' : 'chip-teal'}`}>{evt.isEnded || evt.isPast ? 'Ended' : 'Upcoming'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Passport */}
      {tab === 'passport' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 16, lineHeight: 1.6 }}>Each stamp is a story — every dinner you have hosted or attended.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {passportEvents.map((evt, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => setSelectedEvent(evt)}>
                <div style={{ height: 72, background: 'var(--indigo)', overflow: 'hidden' }}>
                  {(evt.cover?.value || evt.img) && <img src={evt.cover?.value || evt.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />}
                </div>
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 2 }}>{evt.title}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink3)' }}>{fmtDate(evt.date)}</div>
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 8 - passportEvents.length) }).map((_, i) => (
              <div key={'e-' + i} style={{ background: 'var(--page)', borderRadius: 12, border: '2px dashed var(--border)', height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--border)' }}>🍽️</div>
            ))}
          </div>
        </div>
      )}

      {/* Friends */}
      {tab === 'friends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {USERS.filter(u => u.id !== 'u1').map(friend => (
            <div key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div className={`av av-md av-${friend.color} av-link`} onClick={() => setViewingUser(friend)} title={`View ${friend.name}'s profile`}>{friend.initials}</div>
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setViewingUser(friend)}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{friend.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink2)' }}>{friend.handle}</div>
              </div>
              <button
                className={`follow-btn ${following.includes(friend.id) ? 'follow-btn-filled' : 'follow-btn-outline'}`}
                onClick={() => toggleFollow(friend.id)}
              >
                {following.includes(friend.id) ? '✓ Following' : '+ Follow'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div style={{ maxWidth: 480 }}>
          <div className="card card-pad">
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Profile Information</div>
            <div className="form-group"><label className="form-label">Display Name</label><input className="form-input" value={user.name} readOnly onClick={startEdit} placeholder="Your name" /></div>
            <div className="form-group"><label className="form-label">Handle</label><input className="form-input" value={user.handle || ''} readOnly placeholder="@yourhandle" /></div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={user.bio || ''} readOnly placeholder="Your food story..." style={{ minHeight: 70 }} /></div>
            <div className="form-group">
              <label className="form-label">🔗 Website</label>
              <input className="form-input" value={user.website || ''} readOnly placeholder="https://yourwebsite.com" onClick={startEdit} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, margin: '20px 0 12px' }}>🔗 Social Accounts</div>
            {SOCIAL_PLATFORMS.map(p => (
              <div key={p.key} className="form-group">
                <label className="form-label">{p.icon} {p.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.prefix && <span style={{ fontSize: 12, color: 'var(--ink3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.prefix}</span>}
                  <input className="form-input" value={user.socials?.[p.key] || ''} readOnly placeholder={`your${p.key}handle`} />
                </div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={startEdit}>✏️ Edit Profile</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editing && draft && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(false)}>
          <div className="modal">
            <div className="modal-head"><h2>Edit Profile</h2><button className="modal-x" onClick={() => setEditing(false)}>✕</button></div>
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
                <textarea className="form-textarea" value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">🔗 Website</label>
                <input
                  className="form-input"
                  value={draft.website}
                  onChange={e => setDraft(d => ({ ...d, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, margin: '16px 0 12px' }}>🔗 Social Accounts</div>
              {SOCIAL_PLATFORMS.map(p => (
                <div key={p.key} className="form-group">
                  <label className="form-label">{p.icon} {p.label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.prefix && <span style={{ fontSize: 12, color: 'var(--ink3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.prefix}</span>}
                    <input className="form-input" value={draft.socials?.[p.key] || ''} onChange={e => setDraft(d => ({ ...d, socials: { ...d.socials, [p.key]: e.target.value } }))} placeholder={`your${p.key}handle`} />
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

      {selectedEvent && <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </main>
  );
}

function FriendProfile({ user, onBack, following, onToggleFollow, events }) {
  const isFollowing = following.includes(user.id);
  const activeSocials = SOCIAL_PLATFORMS.filter(p => user.socials?.[p.key]);

  return (
    <main className="page-content">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>
      <div className="profile-hero">
        <div className="profile-hero-inner">
          <div className={`av av-xl av-${user.color || 'indigo'}`}>{user.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="profile-name">{user.name}</div>
            <div className="profile-handle">{user.handle}</div>
            {user.bio && <div className="profile-bio">{user.bio}</div>}
            {user.website && (
              <a
                href={user.website.startsWith('http') ? user.website : 'https://' + user.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--indigo)', marginTop: 6, textDecoration: 'none', fontWeight: 500 }}
              >
                🔗 {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {activeSocials.length > 0 && (
              <div className="profile-social" style={{ marginTop: 10 }}>
                {activeSocials.map(p => (
                  <a key={p.key} href={`https://${p.prefix || ''}${user.socials[p.key]}`} target="_blank" rel="noopener noreferrer" className={`social-btn ${p.cls}`}>
                    <span>{p.icon}</span>@{user.socials[p.key]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            className={`follow-btn ${isFollowing ? 'follow-btn-filled' : 'follow-btn-outline'}`}
            onClick={() => onToggleFollow(user.id)}
          >
            {isFollowing ? '✓ Following' : '+ Follow'}
          </button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink2)', padding: '12px 0' }}>
        {isFollowing
          ? `You are following ${user.name}. You will see their events in your feed.`
          : `Follow ${user.name} to see their upcoming dinners in your Discover feed.`}
      </div>
    </main>
  );
}
