import React, { useState, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime } from '../data/utils';
import { FriendButton } from '../pages/ProfilePage';

// Helper functions for dynamic language based on event type & time
function getTimeOfDay(eventTime) {
  if (!eventTime) return 'time';
  const hour = parseInt(eventTime.split(':')[0]);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

function getMealName(event) {
  const type = event.type;
  const hour = event.time ? parseInt(event.time.split(':')[0]) : 19;
  
  // Explicit event types
  if (type === 'Brunch') return 'brunch';
  if (type === 'Potluck') return 'potluck';
  if (type === 'Supper Club') return 'dinner';
  if (type === 'Tasting') return 'tasting';
  
  // Time-based for generic types
  if (hour >= 5 && hour < 12) return 'breakfast';
  if (hour >= 12 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 18) return 'gathering';
  return 'dinner';
}

const REMINDER_OPTIONS = [
  { key: '2d',  label: '2 days before',  icon: '📅', desc: 'Give guests plenty of notice' },
  { key: '24h', label: '24 hours before', icon: '⏰', desc: 'A friendly day-before heads up' },
  { key: 'dof', label: 'Day of event',    icon: '🔔', desc: 'Morning of — get them hyped' },
];

const PLATFORM_ICONS = {
  spotify:    { icon: '🎵', label: 'Spotify',     color: '#1DB954' },
  apple:      { icon: '🎶', label: 'Apple Music', color: '#FC3C44' },
  youtube:    { icon: '▶️', label: 'YouTube',     color: '#FF0000' },
  soundcloud: { icon: '🔊', label: 'SoundCloud',  color: '#FF5500' },
};

const EXPERIENCE_TAG_ICONS = {
  'Live Music': '🎵', 'Chef Demo': '👨‍🍳', 'Blind Tasting': '🫣', 'Outdoor': '🌿',
  'Themed Dress Code': '👗', 'Guest Speaker': '🎤', 'Sober-friendly': '🫧',
  'Plant-forward': '🥬', 'Wine Pairing': '🍷', 'Family-friendly': '👨‍👩‍👧',
};

const QUOTE_STYLES = [
  { bg: 'linear-gradient(135deg, #6C5DD3, #8B7CF6)', color: '#fff', border: 'none' },
  { bg: 'linear-gradient(135deg, #FF6B6B, #FFB347)', color: '#fff', border: 'none' },
  { bg: 'linear-gradient(135deg, #2EC4B6, #87BBA2)', color: '#fff', border: 'none' },
  { bg: 'linear-gradient(135deg, #D4AF37, #E8C84A)', color: '#1A1A2E', border: 'none' },
  { bg: 'var(--page)', color: 'var(--ink)', border: '2px solid var(--indigo)' },
];

export default function EventDetailModal({ event, onClose, onEdit }) {
  const { user, rsvpEvent, claimPotluckItem, unclaimPotluckItem, addPhoto, tagPhoto, addToast, addComment, pinQuote } = useApp();
  const [tab, setTab] = useState(event.isEnded ? 'photos' : 'overview');
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [reminders, setReminders] = useState({ '2d': false, '24h': true, 'dof': false });
  const [reminderSaved, setReminderSaved] = useState(false);
  const [nudgeSent, setNudgeSent] = useState({});
  const [showFullAddr] = useState(false);
  const [dietaryNote, setDietaryNote] = useState('');
  const [taggingPhoto, setTaggingPhoto] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [showingInvites] = useState(false);
  const fileRef = useRef();

  if (!event) return null;

  const myGuest = event.guests?.find(g => g.id === 'u1');
  const isEnded = event.isEnded || false;
  const isHost  = event.mine;
  const isInvited = event.isInvitedTo;
  const hasGallery = event.galleryEnabled && (isEnded || isHost);
  const myComment = event.eventComments?.find(c => c.userId === 'u1');
  const passportStamped = myComment?.passportStamped;
  const isConfirmed = myGuest?.s === 'approved';
  const addrHidden = event.addrHidden && !isHost && !isConfirmed && !showFullAddr;
  const pendingGuests = event.guests?.filter(g => g.s === 'pending') || [];

  // Dietary alerts for host
  const guestsWithDietary = event.guests?.filter(g => g.dietaryNote && g.s === 'approved') || [];

  const tabs = [
    { key: 'overview', label: '📋 Overview' },
    ...(event.supperClub ? [{ key: 'menu', label: '🍽️ Menu' }] : []),
    ...(event.potluck    ? [{ key: 'potluck', label: '🥘 Potluck' }] : []),
    { key: 'guests', label: `👥 Guests (${event.guests?.length || 0})` },
    ...(hasGallery ? [{ key: 'photos', label: `📸 Photos${event.photoGallery?.length ? ` (${event.photoGallery.length})` : ''}` }] : []),
    ...(isEnded ? [{ key: 'comments', label: `💬 Moments${event.eventComments?.length ? ` (${event.eventComments.length})` : ''}` }] : []),
    ...(isHost ? [{ key: 'host-tools', label: `🛠️ Host Tools${pendingGuests.length > 0 ? ` · ${pendingGuests.length}` : ''}` }] : []),
  ];

  function handleUploadPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const photoId = 'ph-' + Date.now();
      addPhoto(event.id, { id: photoId, url: ev.target.result, tags: [], uploadedBy: 'u1', uploaderName: user?.name || 'You' });
      addToast('Photo uploaded! Tap it to add tags.', 'success');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function handleAddTag() {
    if (!tagInput.trim() || !taggingPhoto) return;
    tagPhoto(event.id, taggingPhoto, [tagInput.trim()]);
    setTagInput('');
    addToast('Tag added!', 'success');
  }

  function handleSubmitComment() {
    if (!commentText.trim()) return;
    if (typeof addComment === 'function') {
      addComment(event.id, {
        id: 'ec-' + Date.now(),
        userId: 'u1',
        userName: user?.name || 'Ada Chen',
        initials: user?.initials || 'AC',
        color: user?.color || 'indigo',
        text: commentText.trim(),
        createdAt: new Date().toISOString(),
        passportStamped: true,
      });
    }
    setCommentText('');
    addToast('Moment shared! Your Dining Passport stamp is complete. 🗺️', 'success');
  }

  function handleSaveReminders() {
    setReminderSaved(true);
    const active = REMINDER_OPTIONS.filter(r => reminders[r.key]).map(r => r.label);
    if (active.length === 0) addToast('Reminders cleared', '');
    else addToast(`Reminders set: ${active.join(', ')} ✓`, 'success');
  }

  function handleNudge(guestId, guestName) {
    setNudgeSent(s => ({ ...s, [guestId]: true }));
    addToast(`Nudge sent to ${guestName} 👋`, 'success');
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/e/${event.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => addToast('Event link copied! 🔗', 'success'));
    } else { window.prompt('Copy this link:', url); }
  }

  function handleShare() {
    const url = `${window.location.origin}/e/${event.id}`;
    if (navigator.share) {
      navigator.share({ title: event.title, text: `Join me at ${event.title} on Tableaux`, url });
    } else { handleCopyLink(); }
  }

  const cover = event.cover || {};
  const coverBg = cover.type === 'gradient' ? cover.value
    : cover.type === 'emoji' ? (cover.bg || '#1A1A2E')
    : (cover.type === 'image' || event.img) ? '#1A1A2E'
    : 'linear-gradient(135deg, #1A1A2E, #2D2550)';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        {/* Cover */}
        <div style={{ height: 180, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ position: 'absolute', inset: 0, background: coverBg }} />
          {(cover.type === 'image' && cover.value) || event.img ? (
            <img src={cover.value || event.img} alt={event.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
          ) : cover.type === 'emoji' ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 72 }}>{cover.emoji}</span>
            </div>
          ) : null}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)' }} />
          {isEnded && (
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <span className="chip chip-gray" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(8px)' }}>✓ Event Ended</span>
            </div>
          )}
          <button className="modal-x" onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white' }}>✕</button>
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <span className="chip chip-indigo" style={{ background: 'rgba(108,93,211,0.85)', color: 'white' }}>{event.type}</span>
              {event.seriesName && <span className="chip" style={{ background: 'rgba(212,175,55,0.85)', color: 'white' }}>Vol. {event.seriesVolume}</span>}
            </div>
            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{event.title}</h2>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, overflowX: 'auto' }}>
          <div className="tabs" style={{ marginBottom: 0, flexWrap: 'nowrap' }}>
            {tabs.map(t => (
              <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>

        <div className="modal-body">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div>
              {isEnded && (
                <div className="ended-event-banner" style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>🎉</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>This event has ended</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      {event.photoGallery?.length ? `${event.photoGallery.length} photos shared — check out the gallery!` : 'Share your memories in the Moments tab.'}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {[
                  { icon: '📅', val: fmtDate(event.date) },
                  { icon: '🕖', val: fmtTime(event.time) },
                  { icon: '📍', val: event.loc },
                  { icon: '👥', val: `${event.guests?.length || 0} / ${event.cap}` },
                  { icon: '🔒', val: event.vis },
                  { icon: '👔', val: event.dressCode || 'No dress code' },
                  { icon: '👤', val: event.host },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--page)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: 'var(--ink)', border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Experience tags */}
              {(event.experienceTags || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {event.experienceTags.map(tag => (
                    <span key={tag} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: 'var(--indigo-light)', color: 'var(--indigo)', fontWeight: 600, border: '1px solid var(--indigo-mid)' }}>
                      {EXPERIENCE_TAG_ICONS[tag] || '🏷️'} {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Address */}
              {event.addr && (
                <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--page)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>🗺️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', marginBottom: 2 }}>Address</div>
                      {addrHidden ? (
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--ink2)', fontStyle: 'italic' }}>{event.loc || 'Location hidden'}</div>
                          <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 4 }}>🔒 Full address revealed after RSVP is confirmed</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{event.addr}</div>
                      )}
                    </div>
                    {!isHost && isConfirmed && event.addrHidden && (
                      <span className="chip chip-teal" style={{ fontSize: 11 }}>✓ Unlocked</span>
                    )}
                  </div>
                </div>
              )}

              {/* Playlist */}
              {event.playlist?.url && (
                <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--page)', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: PLATFORM_ICONS[event.playlist.platform]?.color || 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {PLATFORM_ICONS[event.playlist.platform]?.icon || '🎵'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', marginBottom: 2 }}>{PLATFORM_ICONS[event.playlist.platform]?.label || 'Playlist'} · Tonight's Vibe</div>
                    <div style={{ fontSize: 13, color: 'var(--indigo)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.playlist.url}</div>
                  </div>
                  <a href={event.playlist.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>Listen →</a>
                </div>
              )}

              {event.desc && (
                <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7, padding: '14px', background: 'var(--page)', borderRadius: 10, marginBottom: 16 }}>{event.desc}</div>
              )}

              {/* Pinned quotes — animated cards */}
              {event.pinnedQuotes?.length > 0 && event.eventComments?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink3)', marginBottom: 8 }}>What guests said</div>
                  {event.pinnedQuotes.map((qid, qi) => {
                    const q = event.eventComments.find(c => c.id === qid);
                    if (!q) return null;
                    const style = QUOTE_STYLES[qi % QUOTE_STYLES.length];
                    return (
                      <div key={qid} style={{
                        background: style.bg, borderRadius: 16, padding: '18px 20px', marginBottom: 10,
                        border: style.border || 'none', color: style.color,
                        animation: `fadeSlideIn 0.4s ease ${qi * 0.1}s both`,
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{ fontSize: 36, opacity: 0.15, position: 'absolute', top: 8, left: 14, fontFamily: 'serif' }}>"</div>
                        <div style={{ fontSize: 15, lineHeight: 1.6, fontStyle: 'italic', marginBottom: 10, position: 'relative', zIndex: 1 }}>"{q.text}"</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, position: 'relative', zIndex: 1 }}>
                          <div className={`av av-sm av-${q.color}`} style={{ border: '2px solid rgba(255,255,255,0.3)' }}>{q.initials}</div>
                          <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.9 }}>{q.userName}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* RSVP with dietary note */}
              {isInvited && myGuest?.s === 'pending' && (
                <div style={{ marginTop: 16, padding: 16, border: '1.5px solid var(--indigo)', borderRadius: 12, background: 'var(--indigo-light)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--indigo)' }}>You are invited!</div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 12 }}>Will you join {event.host} for {event.title}?</div>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label" style={{ fontSize: 12 }}>⚠️ Any dietary restrictions or notes for the host?</label>
                    <input className="form-input" value={dietaryNote} onChange={e => setDietaryNote(e.target.value)}
                      placeholder="e.g. Vegetarian, nut allergy, no shellfish..."
                      style={{ fontSize: 13 }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => { rsvpEvent(event.id, 'approved', dietaryNote); addToast("You're going! 🎉", 'success'); }}>✓ Accept</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { rsvpEvent(event.id, 'declined'); addToast('RSVP declined', ''); }}>✕ Decline</button>
                  </div>
                </div>
              )}
              {isInvited && myGuest?.s === 'approved' && (
                <div>
                  <div style={{ marginTop: 16, padding: 12, background: 'var(--teal-light)', borderRadius: 10, fontSize: 13, color: '#07A87B', fontWeight: 600 }}>✓ You are going!</div>
                  {/* Reminder scheduler */}
                  <div style={{ marginTop: 12, padding: '14px 16px', background: 'var(--page)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>🔔 Event Reminders</div>
                    <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 12 }}>Choose when to receive reminders.</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                      {REMINDER_OPTIONS.map(r => (
                        <div key={r.key} onClick={() => { setReminders(prev => ({ ...prev, [r.key]: !prev[r.key] })); setReminderSaved(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: reminders[r.key] ? 'var(--indigo-light)' : 'var(--surface)', borderRadius: 10, border: `1.5px solid ${reminders[r.key] ? 'var(--indigo-mid)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                          <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                          <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: reminders[r.key] ? 'var(--indigo)' : 'var(--ink)' }}>{r.label}</div><div style={{ fontSize: 11, color: 'var(--ink3)' }}>{r.desc}</div></div>
                          <div style={{ width: 20, height: 20, borderRadius: 5, background: reminders[r.key] ? 'var(--indigo)' : 'transparent', border: `2px solid ${reminders[r.key] ? 'var(--indigo)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}>{reminders[r.key] ? '✓' : ''}</div>
                        </div>
                      ))}
                    </div>
                    <button className={`btn btn-sm ${reminderSaved ? 'btn-ghost' : 'btn-primary'}`} style={{ width: '100%' }} onClick={handleSaveReminders}>{reminderSaved ? '✓ Reminders saved' : 'Save reminders'}</button>
                  </div>
                </div>
              )}
              {isInvited && myGuest?.s === 'declined' && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--coral-light)', borderRadius: 10, fontSize: 13, color: '#D94545', fontWeight: 600 }}>✕ You declined this invitation</div>
              )}
            </div>
          )}

          {/* MENU */}
          {tab === 'menu' && event.supperClub && (
            <div>
              {event.supperClub.hostNote && (
                <div className="sc-host-note"><div className="sc-host-note-label">A Note from the Host</div><div className="sc-host-note-text">"{event.supperClub.hostNote}"</div></div>
              )}
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>The Menu</div>
              {event.supperClub.courses?.map((course, i) => (
                <div key={i} className="sc-course" style={course.highlight ? { background: 'linear-gradient(90deg, var(--gold-light), transparent)', borderRadius: 10, padding: '14px', borderBottom: 'none', marginBottom: 6 } : {}}>
                  <div className="sc-course-num" style={course.highlight ? { background: 'var(--gold)', color: 'white' } : {}}>{course.num}</div>
                  <div className="sc-course-info">
                    <div className="sc-course-name">{course.highlight && '⭐ '}{course.name}</div>
                    <div className="sc-course-desc">{course.desc}</div>
                    {course.wine && <div className="sc-course-note">🍷 Paired with: {course.wine}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* POTLUCK */}
          {tab === 'potluck' && event.potluck && (
            <PotluckTab event={event} myGuest={myGuest} onClaim={claimPotluckItem} onUnclaim={unclaimPotluckItem} addToast={addToast} />
          )}

          {/* GUESTS — with friend buttons and dietary indicators */}
          {tab === 'guests' && (
            <div>
              {/* Dietary alert for host */}
              {isHost && guestsWithDietary.length > 0 && (
                <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--amber-light)', borderRadius: 10, border: '1px solid #F0D78C' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#B87A00', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    ⚠️ Dietary Notes from Guests
                  </div>
                  {guestsWithDietary.map((g, i) => (
                    <div key={i} style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 4 }}>
                      <strong>{g.n}:</strong> {g.dietaryNote}
                    </div>
                  ))}
                </div>
              )}

              {event.guests?.length === 0 && <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No guests yet</div></div>}
              {event.guests?.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className={`av av-sm av-${g.color || 'indigo'}`}>{g.initials || g.n?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{g.n}</div>
                    {g.dietaryNote && isHost && (
                      <div style={{ fontSize: 11, color: '#B87A00', marginTop: 2 }}>⚠️ {g.dietaryNote}</div>
                    )}
                  </div>
                  <FriendButton userId={g.id} size="sm" />
                  <span className={`chip ${g.s === 'approved' ? 'chip-teal' : g.s === 'declined' ? 'chip-coral' : 'chip-amber'}`}>
                    {g.s === 'approved' ? '✓ Going' : g.s === 'declined' ? '✕ Declined' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* PHOTOS — with tagging */}
          {tab === 'photos' && (
            <PhotoGalleryTab event={event} fileRef={fileRef} uploading={uploading} onUpload={handleUploadPhoto}
              lightbox={lightbox} setLightbox={setLightbox}
              taggingPhoto={taggingPhoto} setTaggingPhoto={setTaggingPhoto}
              tagInput={tagInput} setTagInput={setTagInput} onAddTag={handleAddTag} />
          )}

          {/* COMMENTS / MOMENTS — with animated quote cards */}
          {tab === 'comments' && (
            <CommentsTab event={event} user={user} myComment={myComment} passportStamped={passportStamped}
              commentText={commentText} setCommentText={setCommentText} onSubmit={handleSubmitComment}
              isHost={isHost}
              onPin={typeof pinQuote === 'function' ? (id) => { pinQuote(event.id, id); addToast('Quote pinned! It will appear on the event overview.', 'success'); } : null} />
          )}

          {/* HOST TOOLS */}
          {tab === 'host-tools' && isHost && (
            <HostToolsTab event={event} reminders={reminders} setReminders={setReminders}
              reminderSaved={reminderSaved} onSaveReminders={handleSaveReminders}
              nudgeSent={nudgeSent} onNudge={handleNudge} onCopyLink={handleCopyLink} onShare={handleShare} addToast={addToast} />
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {isHost && onEdit && <button className="btn btn-primary" onClick={() => { onClose(); onEdit(event); }}>✏️ Edit Event</button>}
          </div>
        </div>

        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadPhoto} />
      </div>

      {/* Invite Guests Modal */}

      {/* Lightbox with tagging */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => { setLightbox(null); setTaggingPhoto(null); }}>
          <div style={{ maxWidth: 700, width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt="" style={{ width: '100%', borderRadius: 12, objectFit: 'contain', maxHeight: '70vh' }} />
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {lightbox.tags?.map((tag, i) => <span key={i} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{tag}</span>)}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 }}>by {lightbox.uploaderName}</div>
            {/* Tag input in lightbox */}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { handleAddTag(); } }}
                placeholder="Add a tag (person, dish, moment)..."
                style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none' }}
                onClick={() => setTaggingPhoto(lightbox.id)}
              />
              <button onClick={() => { setTaggingPhoto(lightbox.id); handleAddTag(); }}
                style={{ padding: '8px 16px', borderRadius: 8, background: 'var(--indigo)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13 }}>Tag</button>
            </div>
            <button onClick={() => { setLightbox(null); setTaggingPhoto(null); }}
              style={{ position: 'absolute', top: -10, right: -10, background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        </div>
      )}

      {/* CSS for animated quote cards */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components (same structure, updated) ──

function HostToolsTab({ event, reminders, setReminders, reminderSaved, onSaveReminders, nudgeSent, onNudge, onCopyLink, onShare, addToast }) {
  const pendingGuests = event.guests?.filter(g => g.s === 'pending') || [];
  const approvedGuests = event.guests?.filter(g => g.s === 'approved') || [];
  const publicUrl = `${window.location.origin}/e/${event.id}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--page)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>👋</span> Pending RSVPs
          {pendingGuests.length > 0 && <span style={{ background: 'var(--amber)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{pendingGuests.length}</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 12 }}>Send a friendly nudge to guests who haven't responded yet.</div>
        {pendingGuests.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>✓ All guests have responded</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingGuests.map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div className={`av av-sm av-${g.color || 'indigo'}`}>{g.initials || g.n?.[0]}</div>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13 }}>{g.n}</div><div style={{ fontSize: 11, color: 'var(--ink3)' }}>Invited · no response</div></div>
                {nudgeSent[g.id] ? <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>✓ Nudged</span>
                  : <button className="btn btn-ghost btn-sm" onClick={() => onNudge(g.id, g.n)} style={{ fontSize: 12 }}>👋 Nudge</button>}
              </div>
            ))}
            <button className="btn btn-primary btn-sm" style={{ marginTop: 4 }}
              onClick={() => { pendingGuests.forEach(g => { if (!nudgeSent[g.id]) onNudge(g.id, g.n); }); }}>👋 Nudge all</button>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--page)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>🔔 Guest Reminder Schedule</div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 12 }}>Auto-send reminders to {approvedGuests.length} confirmed guests.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
          {REMINDER_OPTIONS.map(r => (
            <div key={r.key} onClick={() => setReminders(prev => ({ ...prev, [r.key]: !prev[r.key] }))}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: reminders[r.key] ? 'var(--indigo-light)' : 'var(--surface)', borderRadius: 10, border: `1.5px solid ${reminders[r.key] ? 'var(--indigo-mid)' : 'var(--border)'}`, cursor: 'pointer' }}>
              <span style={{ fontSize: 18 }}>{r.icon}</span>
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: reminders[r.key] ? 'var(--indigo)' : 'var(--ink)' }}>{r.label}</div><div style={{ fontSize: 11, color: 'var(--ink3)' }}>{r.desc}</div></div>
              <div style={{ width: 20, height: 20, borderRadius: 5, background: reminders[r.key] ? 'var(--indigo)' : 'transparent', border: `2px solid ${reminders[r.key] ? 'var(--indigo)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>{reminders[r.key] ? '✓' : ''}</div>
            </div>
          ))}
        </div>
        <button className={`btn btn-sm ${reminderSaved ? 'btn-ghost' : 'btn-primary'}`} style={{ width: '100%' }} onClick={onSaveReminders}>{reminderSaved ? '✓ Saved' : 'Save schedule'}</button>
      </div>

      <div style={{ background: 'var(--page)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>🔗 Share Event</div>
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 12 }}>Address stays hidden until you accept their RSVP.</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--ink2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{publicUrl}</span>
          <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0, fontSize: 12 }} onClick={onCopyLink}>Copy</button>
        </div>
        <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={onShare}>📨 Share Event Link</button>
      </div>

      <div style={{ background: 'var(--page)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>📊 Guest Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'Going', val: approvedGuests.length, color: 'var(--teal)', bg: 'var(--teal-light)' },
            { label: 'Pending', val: pendingGuests.length, color: '#B87A00', bg: 'var(--amber-light)' },
            { label: 'Declined', val: event.guests?.filter(g => g.s === 'declined').length || 0, color: '#D94545', bg: 'var(--coral-light)' },
          ].map((stat, i) => (
            <div key={i} style={{ background: stat.bg, borderRadius: 10, padding: '12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.val}</div>
              <div style={{ fontSize: 11, color: stat.color, fontWeight: 600, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink3)', marginBottom: 4 }}><span>Capacity</span><span>{approvedGuests.length} / {event.cap}</span></div>
          <div className="progress-bar" style={{ height: 8 }}><div className="progress-fill" style={{ width: `${Math.min(100, (approvedGuests.length / event.cap) * 100)}%` }} /></div>
        </div>
      </div>
    </div>
  );
}

function CommentsTab({ event, user, myComment, passportStamped, commentText, setCommentText, onSubmit, isHost, onPin }) {
  const comments = event.eventComments || [];
  const pinnedIds = event.pinnedQuotes || [];

  return (
    <div>
      {!myComment && (
        <div style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D2550)', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>🗺️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'white', marginBottom: 4, fontSize: 14 }}>Complete your Dining Passport stamp</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>Share a moment to stamp your passport and unlock all event photos.</div>
          </div>
        </div>
      )}
      {!myComment ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>
            How was your {getTimeOfDay(event.time)}?
          </div>
          <textarea className="form-textarea" value={commentText} onChange={e => setCommentText(e.target.value)}
            placeholder={`Share what made this ${getMealName(event)} special...`} style={{ minHeight: 90, marginBottom: 10 }} />
          <button className="btn btn-primary btn-full" onClick={onSubmit} disabled={!commentText.trim()}>Share my moment & stamp passport 🗺️</button>
        </div>
      ) : (
        <div style={{ background: 'var(--teal-light)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>✓</span>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: '#07A87B' }}>Passport stamped!</div><div style={{ fontSize: 12, color: 'var(--ink2)' }}>Thanks for sharing your moment.</div></div>
        </div>
      )}

      {comments.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-icon">💬</div><div className="empty-title">No moments shared yet</div><div className="empty-sub">Be the first to share how the evening went.</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map((c, ci) => {
            const isPinned = pinnedIds.includes(c.id);
            const style = isPinned ? QUOTE_STYLES[ci % QUOTE_STYLES.length] : null;
            return (
              <div key={c.id} style={{
                background: style ? style.bg : 'var(--page)', borderRadius: 12, padding: '12px 14px',
                border: style ? (style.border || 'none') : '1px solid var(--border)',
                color: style ? style.color : 'var(--ink)',
                position: 'relative',
                animation: isPinned ? `fadeSlideIn 0.4s ease ${ci * 0.08}s both` : 'none',
              }}>
                {isPinned && (
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, opacity: 0.7 }}>📌 Pinned quote</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div className={`av av-sm av-${c.color}`} style={isPinned ? { border: '2px solid rgba(255,255,255,0.3)' } : {}}>{c.initials}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.userName}</div>
                    {c.passportStamped && <div style={{ fontSize: 10, color: isPinned ? 'rgba(255,255,255,.7)' : 'var(--teal)', fontWeight: 600 }}>🗺️ Passport stamped</div>}
                  </div>
                  {isHost && onPin && !isPinned && (
                    <button onClick={() => onPin(c.id)}
                      style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 600, color: 'var(--ink2)', cursor: 'pointer' }}>Pin quote</button>
                  )}
                </div>
                {isPinned && <div style={{ fontSize: 30, opacity: 0.12, position: 'absolute', top: 6, right: 14, fontFamily: 'serif' }}>"</div>}
                <div style={{ fontSize: 13, lineHeight: 1.6, fontStyle: isPinned ? 'italic' : 'normal' }}>{isPinned ? `"${c.text}"` : c.text}</div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

function PotluckTab({ event, myGuest, onClaim, onUnclaim, addToast }) {
  const isApproved = myGuest && myGuest.s === 'approved';
  const cats = { food: '🍽️ Food', drinks: '🥂 Drinks', other: '🧺 Other' };
  
  return (
    <div>
      {!isApproved && (
        <div style={{ 
          padding: '12px 16px', 
          background: 'var(--amber-light)', 
          border: '1px solid #F0D78C', 
          borderRadius: 10, 
          marginBottom: 16,
          fontSize: 13,
          color: '#B87A00'
        }}>
          ⚠️ You must be accepted to this event before claiming items
        </div>
      )}
      <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 16 }}>Tap an unclaimed item to add your dish!</div>
      {Object.entries(cats).map(([catKey, catLabel]) => {
        const items = event.potluck.items.filter(it => it.cat === catKey);
        if (!items.length) return null;
        return (
          <div key={catKey} className="potluck-category">
            <div className="potluck-cat-title">{catLabel}</div>
            {items.map(item => (
              <div key={item.id} className={`potluck-item ${item.claimedBy ? 'claimed' : ''}`}>
                <span style={{ fontSize: 20 }}>{item.emoji}</span>
                <div className="potluck-item-name">{item.name}</div>
                {item.claimedBy ? (
                  <>
                    <span className="potluck-item-claimant">✓ {item.claimerName}</span>
                    {item.claimedBy === 'u1' && <button className="btn btn-ghost btn-sm potluck-item-btn" onClick={() => { onUnclaim(event.id, item.id); addToast('Item released', ''); }}>Undo</button>}
                  </>
                ) : isApproved ? (
                  <button 
                    className="btn btn-primary btn-sm potluck-item-btn" 
                    onClick={() => { 
                      onClaim(event.id, item.id); 
                      addToast("Item claimed! 🙌", 'success'); 
                    }}
                  >
                    I'll bring it
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--ink3)', fontStyle: 'italic' }}>
                    Accept invite to claim
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PhotoGalleryTab({ event, fileRef, uploading, onUpload, lightbox, setLightbox, taggingPhoto, setTaggingPhoto, tagInput, setTagInput, onAddTag }) {
  const photos = event.photoGallery || [];
  const myComment = event.eventComments?.find(c => c.userId === 'u1');
  const photosLocked = !myComment && photos.length > 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 14, color: 'var(--ink2)' }}>
          {photos.length > 0 ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} from the evening` : 'No photos yet — be the first to share!'}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ Uploading...' : '📸 Add Photos'}
        </button>
      </div>

      {photosLocked && (
        <div style={{ background: 'var(--indigo-light)', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid var(--indigo-mid)' }}>
          <span style={{ fontSize: 20 }}>🔓</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--indigo)', marginBottom: 2 }}>Share a moment to unlock all photos</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)' }}>Leave a comment in Moments tab to see the full gallery.</div>
          </div>
        </div>
      )}

      <div className="photo-gallery">
        {(photosLocked ? photos.slice(0, 1) : photos).map(ph => (
          <div key={ph.id} className="photo-thumb" onClick={() => !photosLocked && setLightbox(ph)}
            style={{ position: 'relative' }}>
            <img src={ph.url} alt="" style={{ filter: photosLocked ? 'blur(8px)' : 'none', transition: 'filter 0.3s' }} />
            {ph.tags?.length > 0 && !photosLocked && (
              <div className="photo-tag">{ph.tags[0]}{ph.tags.length > 1 ? ` +${ph.tags.length - 1}` : ''}</div>
            )}
            {/* Inline tag button */}
            {!photosLocked && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightbox(ph); setTaggingPhoto(ph.id); }}
                style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', fontSize: 11, padding: '3px 8px', borderRadius: 12, cursor: 'pointer', backdropFilter: 'blur(4px)' }}
              >
                🏷️ Tag
              </button>
            )}
          </div>
        ))}
        {photosLocked && photos.length > 1 && (
          <div className="photo-thumb" style={{ background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 20 }}>🔒</span>
            <span style={{ fontSize: 11, color: 'var(--indigo)', fontWeight: 600 }}>+{photos.length - 1} more</span>
          </div>
        )}
        <div className="photo-thumb-add" onClick={() => fileRef.current?.click()}>
          <span style={{ fontSize: 24 }}>+</span>
          <span>Upload</span>
        </div>
      </div>

      {photos.length > 0 && !photosLocked && (
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink3)', textAlign: 'center' }}>Tap any photo to view full size and add tags</div>
      )}
    </div>
  );
}
