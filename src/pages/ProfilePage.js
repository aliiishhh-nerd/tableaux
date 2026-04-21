import React, { useState, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate } from '../data/utils';
import EventDetailModal from '../components/EventDetailModal';

import { supabase } from '../lib/supabase';

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram',   icon: '📸', prefix: 'instagram.com/', cls: 'social-btn-ig' },
  { key: 'tiktok',    label: 'TikTok',      icon: '🎵', prefix: 'tiktok.com/@',   cls: 'social-btn-tt' },
  { key: 'x',         label: 'X / Twitter', icon: '𝕏',  prefix: 'x.com/',         cls: 'social-btn-x'  },
  { key: 'substack',  label: 'Substack',    icon: '📬', prefix: '',               cls: ''              },
];

const DIETARY_OPTIONS = [
  'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Nut allergy',
  'Shellfish allergy', 'Halal', 'Kosher', 'Pescatarian', 'Keto', 'Low FODMAP', 'Other',
];

function EventThumb({ evt, size = 48 }) {
  const [imgFailed, setImgFailed] = useState(false);
  const cover = evt.cover || {};
  const hasImg = (cover.type === 'image' && cover.value) || evt.img;
  const imgSrc = cover.value || evt.img;
  const gradientBg = cover.type === 'gradient'
    ? cover.value
    : cover.type === 'emoji'
    ? (cover.bg || '#1A1A2E')
    : 'linear-gradient(135deg, #6C5DD3, #2D2550)';

  return (
    <div style={{ width: size, height: size, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: gradientBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4 }}>
      {hasImg && !imgFailed ? (
        <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgFailed(true)} />
      ) : cover.type === 'emoji' && cover.emoji ? (
        <span>{cover.emoji}</span>
      ) : (
        <span>🍽️</span>
      )}
    </div>
  );
}

function FriendButton({ userId, size = 'sm' }) {
  const { getFriendStatus, sendFriendRequest, removeFriend, acceptFriendRequest, addToast } = useApp();
  const status = getFriendStatus(userId);

  if (userId === 'u1') return null;

  if (status === 'accepted') {
    return (
      <button className={`btn btn-ghost btn-${size}`} onClick={(e) => { e.stopPropagation(); removeFriend(userId); addToast('Friend removed', ''); }} style={{ fontSize: 12 }}>
        ✓ Friends
      </button>
    );
  }

  if (status === 'pending') {
    return (
      <div style={{ display: 'flex', gap: 4 }}>
        <button className={`btn btn-primary btn-${size}`} onClick={(e) => { e.stopPropagation(); acceptFriendRequest(userId); addToast('Friend request accepted! 🎉', 'success'); }} style={{ fontSize: 12 }}>✓ Accept</button>
        <button className={`btn btn-ghost btn-${size}`} onClick={(e) => { e.stopPropagation(); removeFriend(userId); addToast('Request removed', ''); }} style={{ fontSize: 12 }}>✕</button>
      </div>
    );
  }

  return (
    <button className={`btn btn-primary btn-${size}`} onClick={(e) => { e.stopPropagation(); sendFriendRequest(userId); addToast('Friend request sent! 👋', 'success'); }} style={{ fontSize: 12 }}>
      + Add Friend
    </button>
  );
}

export { FriendButton };

export default function ProfilePage() {
  const { user, events, updateProfile, logout, addToast, friends } = useApp();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tab, setTab] = useState('events');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  // Photo upload
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoRef = useRef(null);

  // Email update
  const [emailDraft, setEmailDraft] = useState('');
  const [emailStatus, setEmailStatus] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const hostedEvents = events.filter(e => e.mine);
  const passportEvents = events.filter(e => (e.isEnded || e.isPast) && e.mine).slice(0, 8);

  // ── Photo upload ──
  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { addToast('Photo must be under 10MB', 'error'); return; }
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = (ev) => {
        updateProfile({ avatar: ev.target.result });
        addToast('Photo updated ✓', 'success');
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      addToast('Upload failed — try again', 'error');
      setUploadingPhoto(false);
    }
  }

  // ── Email update ──
  async function handleEmailUpdate() {
    if (!emailDraft || !emailDraft.includes('@')) { setEmailStatus('error'); return; }
    setEmailLoading(true);
    setEmailStatus(null);
    try {
      const { error } = await supabase.auth.updateUser({ email: emailDraft });
      if (error) throw error;
      setEmailStatus('sent');
      addToast('Confirmation sent to new email ✓', 'success');
    } catch {
      setEmailStatus('error');
      addToast('Could not update email — try again', 'error');
    } finally {
      setEmailLoading(false);
    }
  }

  // ── Delete account ──
  async function handleDeleteAccount() {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await supabase.auth.signOut();
      logout();
      addToast('Account deleted', '');
    } catch {
      addToast('Could not delete account — contact support', 'error');
      setDeleting(false);
    }
  }

  function startEdit() {
    setDraft({
      name: user.name, handle: user.handle || '', bio: user.bio || '',
      website: user.website || '', socials: { ...user.socials },
      favoriteFood: user.favoriteFood || '',
      favoriteRestaurant: user.favoriteRestaurant || '',
      dietaryRestrictions: [...(user.dietaryRestrictions || [])],
    });
    setEditing(true);
  }

  function saveEdit() {
    updateProfile({
      name: draft.name, handle: draft.handle, bio: draft.bio, website: draft.website,
      initials: draft.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      socials: draft.socials,
      favoriteFood: draft.favoriteFood,
      favoriteRestaurant: draft.favoriteRestaurant,
      dietaryRestrictions: draft.dietaryRestrictions,
    });
    setEditing(false);
    addToast('Profile updated ✓', 'success');
  }

  function toggleDietary(item) {
    setDraft(d => {
      const has = d.dietaryRestrictions.includes(item);
      return { ...d, dietaryRestrictions: has ? d.dietaryRestrictions.filter(x => x !== item) : [...d.dietaryRestrictions, item] };
    });
  }

  const activeSocials = SOCIAL_PLATFORMS.filter(p => user.socials?.[p.key]);

  if (viewingUser) return <FriendProfile user={viewingUser} onBack={() => setViewingUser(null)} />;

  return (
    <main className="page-content">
      <div className="profile-hero">
        <div className="profile-hero-inner">
          {/* Avatar with photo upload overlay */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
            ) : (
              <div className={'av av-xl av-' + (user.color || 'indigo')}>{user.initials}</div>
            )}
            <button
              onClick={() => photoRef.current?.click()}
              disabled={uploadingPhoto}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--indigo)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}
              title="Change photo"
            >
              {uploadingPhoto ? '⏳' : '📷'}
            </button>
            <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/heic,image/webp" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="profile-name">{user.name}</div>
            <div className="profile-handle">{user.handle || '@' + user.name.toLowerCase().replace(/\s/g, '')}</div>
            {user.bio && <div className="profile-bio">{user.bio}</div>}
            {user.website && (
              <a href={user.website.startsWith('http') ? user.website : 'https://' + user.website} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--indigo)', marginTop: 6, textDecoration: 'none', fontWeight: 500 }}>
                🔗 {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <div className="profile-stats">
              <div><div className="profile-stat-val">{hostedEvents.length}</div><div className="profile-stat-label">Hosted</div></div>
              <div><div className="profile-stat-val">{friends.filter(f => f.status === 'accepted').length}</div><div className="profile-stat-label">Friends</div></div>
              <div><div className="profile-stat-val">{passportEvents.length}</div><div className="profile-stat-label">Passport</div></div>
            </div>

            {(user.favoriteFood || user.favoriteRestaurant || (user.dietaryRestrictions && user.dietaryRestrictions.length > 0)) && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {user.favoriteFood && <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'var(--amber-light)', color: '#B87A00', border: '1px solid #F0D78C' }}>🍜 {user.favoriteFood}</span>}
                {user.favoriteRestaurant && <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'var(--teal-light)', color: '#07A87B', border: '1px solid #A7E8D2' }}>🏮 {user.favoriteRestaurant}</span>}
                {(user.dietaryRestrictions || []).map(d => (
                  <span key={d} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'var(--coral-light)', color: '#D94545', border: '1px solid #F5B8B8' }}>⚠️ {d}</span>
                ))}
              </div>
            )}

            {activeSocials.length > 0 && (
              <div className="profile-social">
                {activeSocials.map(p => (
                  <a key={p.key} href={'https://' + p.prefix + user.socials[p.key]} target="_blank" rel="noopener noreferrer" className={'social-btn ' + p.cls}>
                    <span>{p.icon}</span>@{user.socials[p.key]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--coral)' }}>Sign Out</button>
        </div>
      </div>

      <div className="tabs">
        <button className={'tab-btn ' + (tab === 'events' ? 'active' : '')} onClick={() => setTab('events')}>🗓️ Events ({hostedEvents.length})</button>
        <button className={'tab-btn ' + (tab === 'passport' ? 'active' : '')} onClick={() => setTab('passport')}>🌍 Passport</button>
        <button className={'tab-btn ' + (tab === 'friends' ? 'active' : '')} onClick={() => setTab('friends')}>👥 Friends ({friends.filter(f => f.status === 'accepted').length})</button>
        <button className={'tab-btn ' + (tab === 'settings' ? 'active' : '')} onClick={() => setTab('settings')}>⚙️ Settings & Profile</button>
      </div>

      {tab === 'events' && (
        <div>
          {hostedEvents.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">🗓️</div><div className="empty-title">No events yet</div></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hostedEvents.map(evt => (
                <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer', boxShadow: 'var(--shadow)' }} onClick={() => setSelectedEvent(evt)}>
                  <EventThumb evt={evt} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{evt.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>{fmtDate(evt.date)} · {evt.guests?.length || 0} guests</div>
                  </div>
                  <span className={'chip ' + (evt.isEnded || evt.isPast ? 'chip-gray' : 'chip-teal')}>{evt.isEnded || evt.isPast ? 'Ended' : 'Upcoming'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'passport' && (
        <div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 16, lineHeight: 1.6 }}>Each stamp is a story — every dinner you have hosted or attended.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {passportEvents.map((evt, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', cursor: 'pointer' }} onClick={() => setSelectedEvent(evt)}>
                <div style={{ height: 72, overflow: 'hidden' }}><EventThumb evt={evt} size={72} /></div>
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

      {tab === 'friends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {friends.filter(f => f.status === 'accepted').length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No friends yet</div><div className="empty-sub">Connect with people you meet at events.</div></div>
          ) : friends.filter(f => f.status === 'accepted').map(friend => (
            <div key={friend.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div className="av av-md av-indigo">{(friend.name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{friend.name || 'TableFolk Member'}</div>
              </div>
              <FriendButton userId={friend.userId} />
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div style={{ maxWidth: 480 }}>

          {/* Profile photo */}
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Profile Photo</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
              ) : (
                <div className={'av av-xl av-' + (user.color || 'indigo')} style={{ width: 64, height: 64, fontSize: 22 }}>{user.initials}</div>
              )}
              <div>
                <button className="btn btn-ghost btn-sm" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}>
                  {uploadingPhoto ? 'Uploading...' : '📷 Upload photo'}
                </button>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>JPEG, PNG, or HEIC · max 10MB</div>
                {user.avatar && (
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--coral)', marginTop: 6, fontSize: 11 }} onClick={() => { updateProfile({ avatar: null }); addToast('Photo removed', ''); }}>
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Profile info */}
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Profile Information</div>
            <div className="form-group"><label className="form-label">Display Name</label><input className="form-input" value={user.name} readOnly onClick={startEdit} placeholder="Your name" /></div>
            <div className="form-group"><label className="form-label">Handle</label><input className="form-input" value={user.handle || ''} readOnly placeholder="@yourhandle" /></div>
            <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={user.bio || ''} readOnly placeholder="Your food story..." style={{ minHeight: 70 }} /></div>
            <div className="form-group"><label className="form-label">🔗 Website</label><input className="form-input" value={user.website || ''} readOnly placeholder="https://yourwebsite.com" onClick={startEdit} /></div>
            <div style={{ fontWeight: 700, fontSize: 14, margin: '20px 0 12px' }}>🍜 Foodie Facts</div>
            <div className="form-group"><label className="form-label">Favorite Food</label><input className="form-input" value={user.favoriteFood || ''} readOnly placeholder="e.g. Sichuan Dan Dan Noodles" onClick={startEdit} /></div>
            <div className="form-group"><label className="form-label">Favorite Restaurant</label><input className="form-input" value={user.favoriteRestaurant || ''} readOnly placeholder="e.g. Alinea, Chicago" onClick={startEdit} /></div>
            <div className="form-group">
              <label className="form-label">Dietary Restrictions</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(user.dietaryRestrictions || []).length > 0 ? user.dietaryRestrictions.map(d => (
                  <span key={d} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: 'var(--coral-light)', color: '#D94545' }}>⚠️ {d}</span>
                )) : <span style={{ fontSize: 12, color: 'var(--ink3)' }}>None set</span>}
              </div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, margin: '20px 0 12px' }}>🔗 Social Accounts</div>
            {SOCIAL_PLATFORMS.map(p => (
              <div key={p.key} className="form-group">
                <label className="form-label">{p.icon} {p.label}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {p.prefix && <span style={{ fontSize: 12, color: 'var(--ink3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.prefix}</span>}
                  <input className="form-input" value={user.socials?.[p.key] || ''} readOnly placeholder={'your' + p.key + 'handle'} />
                </div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={startEdit}>✏️ Edit Profile</button>
          </div>

          {/* Email update */}
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Email Address</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 14 }}>
              Current: <strong>{user.email || 'not set'}</strong>. A confirmation link will be sent to your new address.
            </div>
            <div className="form-group">
              <label className="form-label">New email address</label>
              <input
                className="form-input"
                type="email"
                value={emailDraft}
                onChange={e => { setEmailDraft(e.target.value); setEmailStatus(null); }}
                placeholder="new@email.com"
              />
            </div>
            {emailStatus === 'sent' && (
              <div style={{ fontSize: 12, color: 'var(--teal)', background: 'var(--teal-light)', padding: '8px 12px', borderRadius: 8, marginBottom: 10 }}>
                ✓ Confirmation email sent — check your inbox to confirm the change.
              </div>
            )}
            {emailStatus === 'error' && (
              <div style={{ fontSize: 12, color: 'var(--coral)', background: 'var(--coral-light)', padding: '8px 12px', borderRadius: 8, marginBottom: 10 }}>
                Could not update email. Check the address and try again.
              </div>
            )}
            <button className="btn btn-primary btn-sm" onClick={handleEmailUpdate} disabled={emailLoading || !emailDraft}>
              {emailLoading ? 'Sending...' : 'Update email'}
            </button>
          </div>

          {/* Connected accounts */}
          <div className="card card-pad" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>Connected Accounts</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 14 }}>Sign in faster by connecting a social account.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn btn-ghost"
                style={{ justifyContent: 'flex-start', gap: 10, fontSize: 13 }}
                onClick={async () => {
                  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/profile' } });
                  if (error) addToast('Could not connect Google', 'error');
                }}
              >
                <span style={{ fontSize: 16 }}>G</span> Connect with Google
              </button>
              <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 8 }}>Instagram and Facebook login coming soon.</div>
          </div>
          </div>

          {/* Danger zone — delete account */}
          <div className="card card-pad" style={{ border: '1px solid #F5B8B8', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#D94545', marginBottom: 4 }}>Delete Account</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 14, lineHeight: 1.6 }}>
              Permanently deletes your account, profile, and all hosted events. This cannot be undone.
            </div>
            {!showDeleteConfirm ? (
              <button className="btn btn-ghost btn-sm" style={{ color: '#D94545', borderColor: '#F5B8B8' }} onClick={() => setShowDeleteConfirm(true)}>
                Delete my account
              </button>
            ) : (
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 8 }}>
                  Type <strong>DELETE</strong> to confirm:
                </div>
                <input
                  className="form-input"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  style={{ marginBottom: 10, borderColor: '#F5B8B8' }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}>Cancel</button>
                  <button
                    className="btn btn-sm"
                    style={{ background: '#D94545', color: 'white', border: 'none' }}
                    disabled={deleteConfirmText !== 'DELETE' || deleting}
                    onClick={handleDeleteAccount}
                  >
                    {deleting ? 'Deleting...' : 'Permanently delete'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Edit modal */}
      {editing && draft && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditing(false)}>
          <div className="modal">
            <div className="modal-head"><h2>Edit Profile</h2><button className="modal-x" onClick={() => setEditing(false)}>✕</button></div>
            <div className="modal-body">
              {/* Photo upload in edit modal */}
              <div className="form-group">
                <label className="form-label">Profile Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {user.avatar
                    ? <img src={user.avatar} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                    : <div className={'av av-md av-' + (user.color || 'indigo')}>{user.initials}</div>
                  }
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}>
                    {uploadingPhoto ? 'Uploading...' : '📷 Change photo'}
                  </button>
                </div>
              </div>
              <div className="form-group"><label className="form-label">Display Name</label><input className="form-input" value={draft.name} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Handle</label><input className="form-input" value={draft.handle} onChange={e => setDraft(d => ({ ...d, handle: e.target.value }))} placeholder="@yourhandle" /></div>
              <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" value={draft.bio} onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">🔗 Website</label><input className="form-input" value={draft.website} onChange={e => setDraft(d => ({ ...d, website: e.target.value }))} placeholder="https://yourwebsite.com" /></div>
              <div style={{ fontWeight: 700, fontSize: 14, margin: '16px 0 12px' }}>🍜 Foodie Facts</div>
              <div className="form-group"><label className="form-label">Favorite Food</label><input className="form-input" value={draft.favoriteFood} onChange={e => setDraft(d => ({ ...d, favoriteFood: e.target.value }))} placeholder="e.g. Sichuan Dan Dan Noodles" /></div>
              <div className="form-group"><label className="form-label">Favorite Restaurant</label><input className="form-input" value={draft.favoriteRestaurant} onChange={e => setDraft(d => ({ ...d, favoriteRestaurant: e.target.value }))} placeholder="e.g. Alinea, Chicago" /></div>
              <div className="form-group">
                <label className="form-label">Dietary Restrictions</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {DIETARY_OPTIONS.map(opt => {
                    const active = draft.dietaryRestrictions.includes(opt);
                    return (
                      <button key={opt} type="button" onClick={() => toggleDietary(opt)} style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', border: `1.5px solid ${active ? 'var(--coral)' : 'var(--border)'}`, background: active ? 'var(--coral-light)' : 'var(--page)', color: active ? '#D94545' : 'var(--ink2)', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
                        {active ? '✓ ' : ''}{opt}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, margin: '16px 0 12px' }}>🔗 Social Accounts</div>
              {SOCIAL_PLATFORMS.map(p => (
                <div key={p.key} className="form-group">
                  <label className="form-label">{p.icon} {p.label}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.prefix && <span style={{ fontSize: 12, color: 'var(--ink3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{p.prefix}</span>}
                    <input className="form-input" value={draft.socials?.[p.key] || ''} onChange={e => setDraft(d => ({ ...d, socials: { ...d.socials, [p.key]: e.target.value } }))} placeholder={'your' + p.key + 'handle'} />
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

function FriendProfile({ user: friendUser, onBack }) {
  const { events } = useApp();
  const hostedByThem = events.filter(e => e.hostId === friendUser.id && !e.mine);
  const activeSocials = SOCIAL_PLATFORMS.filter(p => friendUser.socials?.[p.key]);

  return (
    <main className="page-content">
      <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>
      <div className="profile-hero">
        <div className="profile-hero-inner">
          <div className={'av av-xl av-' + (friendUser.color || 'indigo')}>{friendUser.initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="profile-name">{friendUser.name}</div>
            <div className="profile-handle">{friendUser.handle}</div>
            {friendUser.bio && <div className="profile-bio">{friendUser.bio}</div>}
            {friendUser.website && (
              <a href={friendUser.website.startsWith('http') ? friendUser.website : 'https://' + friendUser.website} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--indigo)', marginTop: 6, textDecoration: 'none', fontWeight: 500 }}>
                🔗 {friendUser.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {activeSocials.length > 0 && (
              <div className="profile-social" style={{ marginTop: 10 }}>
                {activeSocials.map(p => (
                  <a key={p.key} href={'https://' + (p.prefix || '') + friendUser.socials[p.key]} target="_blank" rel="noopener noreferrer" className={'social-btn ' + p.cls}>
                    <span>{p.icon}</span>@{friendUser.socials[p.key]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <FriendButton userId={friendUser.id} />
        </div>
      </div>
      {hostedByThem.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>Upcoming events by {friendUser.name}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {hostedByThem.filter(e => !e.isEnded && !e.isPast).map(evt => (
              <div key={evt.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'white', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 20 }}>🗓️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>{evt.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{fmtDate(evt.date)} · {evt.loc}</div>
                </div>
                <span className="chip chip-indigo" style={{ fontSize: 11 }}>{evt.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
