import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime } from '../data/utils';
import { FriendButton } from '../pages/ProfilePage';

function downloadICS(event) {
  const pad = n => String(n).padStart(2, "0");
  const toICS = (ds, ts) => { if (!ds) return ""; const d = new Date(ds + "T" + (ts||"19:00") + ":00"); return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+"T"+pad(d.getHours())+pad(d.getMinutes())+"00"; };
  const start = toICS(event.date, event.time);
  const p = (event.time||"19:00").split(":"); const endHr = String(parseInt(p[0])+2).padStart(2,"0")+":"+p[1];
  const end = toICS(event.date, endHr);
  const ics = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Tableaux//EN","BEGIN:VEVENT","DTSTART:"+start,"DTEND:"+end,"SUMMARY:"+(event.title||"Tableaux Event"),"DESCRIPTION:"+(event.desc||"").replace(/\n/g,"\\n"),"LOCATION:"+(event.addr||event.loc||""),"UID:tableaux-"+event.id+"@tableaux.app","END:VEVENT","END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics],{type:"text/calendar"}); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=(event.title||"event").replace(/\s+/g,"-")+".ics"; a.click(); URL.revokeObjectURL(url);
}


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
  const { events, user, rsvpEvent, claimPotluckItem, unclaimPotluckItem, addPhoto, tagPhoto, addToast, addComment, pinQuote, approveRSVP, declineRSVP, reviveRSVP, updateEvent } = useApp();
  // Read the CURRENT event from useApp so RSVP approvals, decluttering,
  // and status changes reflect immediately. The `event` prop is a React
  // state snapshot from click time and goes stale when useApp mutates.
  // eslint-disable-next-line no-param-reassign
  event = events.find(e => e.id === event?.id) || event;
  const [tab, setTab] = useState(event.isEnded ? 'photos' : 'overview');
  const [editConfirm, setEditConfirm] = React.useState(null);
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [reminders, setReminders] = useState({ '2d': false, '24h': true, 'dof': false });
  const [reminderSaved, setReminderSaved] = useState(false);
  const [nudgeSent, setNudgeSent] = useState({});
  const [dietaryNote, setDietaryNote] = useState('');
  const [taggingPhoto, setTaggingPhoto] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const fileRef = useRef();
  const [withdrawArmed, setWithdrawArmed] = useState(false);
  const withdrawTimerRef = useRef(null);
  useEffect(() => {
    return () => {
      if (withdrawTimerRef.current) clearTimeout(withdrawTimerRef.current);
    };
  }, []);

  if (!event) return null;
  // Wrap onEdit to show confirm modal if event has confirmed guests
  function handleEditClick() {
    const confirmedGuests = (event.guests || []).filter(g => g.s === 'approved');
    if (confirmedGuests.length > 0 && onEdit) {
      setEditConfirm(true);
    } else if (onEdit) {
      onEdit(event);
    }
  }

  const myGuest = event.guests?.find(g => g.id === (user?.id || 'u1'));
  const isEnded = event.isEnded || false;
  const isHost  = event.mine;
  const isInvited = event.isInvitedTo;
  const hasGallery = event.galleryEnabled && (isEnded || isHost);
  const myComment = event.eventComments?.find(c => c.userId === 'u1');
  const passportStamped = myComment?.passportStamped;
  const isConfirmed = myGuest?.s === 'approved';
  const isConfirmedGuest = isConfirmed;
  const showFullAddr = !event.addrHidden || isHost || isConfirmedGuest || event.type === 'Restaurant' || getVis(event) === 'public';
  function getVis(e) {
    const raw = (e.vis || e.visibility || '').toLowerCase().replace(/\s/g, '');
    if (raw === 'public') return 'public';
    if (raw === 'friendsonly') return 'friendsOnly';
    return 'inviteOnly';
  }
  const addrHidden = (event.addrHidden || getVis(event) === 'public') && !isHost && !isConfirmed && !showFullAddr;
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

  function handleWithdrawClick() {
    if (withdrawArmed) {
      // Second tap — execute the withdrawal.
      if (withdrawTimerRef.current) clearTimeout(withdrawTimerRef.current);
      withdrawTimerRef.current = null;
      setWithdrawArmed(false);
      rsvpEvent(event.id, 'declined');
      addToast('RSVP withdrawn', '');
    } else {
      // First tap — arm + 4s auto-revert.
      setWithdrawArmed(true);
      if (withdrawTimerRef.current) clearTimeout(withdrawTimerRef.current);
      withdrawTimerRef.current = setTimeout(() => {
        setWithdrawArmed(false);
        withdrawTimerRef.current = null;
      }, 4000);
    }
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
    <>
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

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--page)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: 'var(--ink)', border: '1px solid var(--border)' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M5 1v4M11 1v4M2 7h12"/></svg>
                  {event.isTBD ? 'Date TBD' : event.useCrowdCheck ? 'Vote pending' : (fmtDate(event.date) || 'Date TBD')}
                </div>
                {/* Time */}
                {!event.isTBD && !event.useCrowdCheck && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--page)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: 'var(--ink)', border: '1px solid var(--border)' }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3.5l2.5 1.5"/></svg>
                    {fmtTime(event.time) || ''}
                  </div>
                )}
                {/* Location — neighborhood only */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--page)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: 'var(--ink)', border: '1px solid var(--border)' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z"/><circle cx="8" cy="6" r="1.5"/></svg>
                  {event.loc}
                </div>
                {/* Capacity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--page)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: 'var(--ink)', border: '1px solid var(--border)' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-3 2.2-5 5-5"/><circle cx="11.5" cy="9" r="2"/><path d="M9 14c0-2 1-3 2.5-3s2.5 1 2.5 3"/></svg>
                  {(event.guests?.filter(g => g.s === 'approved') || []).length} / {event.cap}
                </div>
                {/* Visibility badge */}
                {(() => {
                  const vis = getVis(event);
                  const cfg = vis === 'public'
                    ? { bg: '#E3FBF3', color: '#085041', border: '#5DCAA5', label: 'Public' }
                    : vis === 'friendsOnly'
                    ? { bg: 'var(--amber-light)', color: '#633806', border: '#EF9F27', label: 'Friends Only' }
                    : { bg: 'var(--indigo-light)', color: '#3C3489', border: 'var(--indigo-mid)', label: 'Invite Only' };
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: cfg.bg, borderRadius: 20, padding: '5px 12px', fontSize: 13, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        {vis === 'public'
                          ? <><circle cx="8" cy="8" r="6.5"/><path d="M8 1.5c-2 2-3 4-3 6.5s1 4.5 3 6.5M8 1.5c2 2 3 4 3 6.5s-1 4.5-3 6.5M1.5 8h13"/></>
                          : vis === 'friendsOnly'
                          ? <><circle cx="6" cy="5" r="2.5"/><path d="M1 13c0-3 2.2-5 5-5"/><circle cx="11.5" cy="9" r="2"/><path d="M9 14c0-2 1-3 2.5-3s2.5 1 2.5 3"/></>
                          : <><rect x="4" y="7" width="8" height="7" rx="1"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2"/></>
                        }
                      </svg>
                      {cfg.label}
                    </div>
                  );
                })()}
                {/* Host */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--page)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: 'var(--ink)', border: '1px solid var(--border)' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5.5" r="2.5"/><path d="M3 13c0-2.8 2.2-5 5-5s5 2.2 5 5"/></svg>
                  {event.host}
                </div>
                {/* Dress code — clothing icon */}
                {event.dressCode && event.dressCode !== 'No dress code' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--page)', borderRadius: 20, padding: '5px 12px', fontSize: 13, color: 'var(--ink)', border: '1px solid var(--border)' }}>
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 5l3-3 2 1.5c0 1-.9 1.5-2 1.5v7h8V5c-1.1 0-2-.5-2-1.5L12 2l3 3-2 1.5V14H3V6.5L1 5z"/></svg>
                    {event.dressCode}
                  </div>
                )}
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
                    {!isHost && isConfirmed && event.addrHidden && getVis(event) !== 'public' && (
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
                            {/* Public RSVP */}
              {(() => {
                const vis = (event.vis || event.visibility || '').toLowerCase().replace(/\s/g, '');
                const isPublicEvent = vis === 'public' && !event.isExample;
                if (!isPublicEvent || isHost) return null;
                // Stay visible during 'pending' so the guest sees
                // "Request sent — waiting for host approval". Hide once
                // approved or declined (status shows in blocks below).
                if (myGuest && myGuest.s !== 'pending') return null;
                return <PublicRSVPBlock event={event} addToast={addToast} rsvpEvent={rsvpEvent} user={user} />;
              })()}
              {isInvited && myGuest?.s === 'pending' && getVis(event) !== 'public' && (
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
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', color: withdrawArmed ? 'var(--coral)' : 'var(--ink3)' }}
                      onClick={handleWithdrawClick}
                    >
                      {withdrawArmed ? '✕ Tap again to confirm' : 'Can no longer make it'}
                    </button>
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
              isHost={isHost} addToast={addToast}
              onPin={typeof pinQuote === 'function' ? (id) => { pinQuote(event.id, id); addToast('Quote pinned! It will appear on the event overview.', 'success'); } : null} />
          )}

          {/* HOST TOOLS */}
          {tab === 'host-tools' && isHost && (
            <HostToolsTab event={event} reminders={reminders} setReminders={setReminders}
              reminderSaved={reminderSaved} onSaveReminders={handleSaveReminders}
              nudgeSent={nudgeSent} onNudge={handleNudge} onCopyLink={handleCopyLink} onShare={handleShare} addToast={addToast} approveRSVP={approveRSVP} declineRSVP={declineRSVP} reviveRSVP={reviveRSVP} />
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => downloadICS(event)} style={{ fontSize: 13 }}>📅 Add to Calendar</button>
            {isHost && onEdit && <button className="btn btn-primary" onClick={handleEditClick}>✏️ Edit Event</button>}
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
    {editConfirm && (
      <EditConfirmModal
        event={event}
        onClose={() => setEditConfirm(null)}
        onConfirm={({ notifyGuests }) => {
          setEditConfirm(null);
          if (updateEvent && notifyGuests) {
            addToast('Guests will be notified of your changes', 'success');
          }
          onClose();
          if (onEdit) onEdit(event);
        }}
      />
    )}
  </>
  );
}

// ── Sub-components (same structure, updated) ──

function HostToolsTab({ event, reminders, setReminders, reminderSaved, onSaveReminders, nudgeSent, onNudge, onCopyLink, onShare, addToast, approveRSVP, declineRSVP, reviveRSVP }) {
  const pendingGuests  = (event.guests || []).filter(g => g.s === 'pending');
  const approvedGuests = (event.guests || []).filter(g => g.s === 'approved');
  const declinedGuests = (event.guests || []).filter(g => g.s === 'declined');

  return (
    <div>
      {pendingGuests.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>New requests</span>
            <span style={{ background: 'var(--indigo)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>{pendingGuests.length}</span>
          </div>
          {pendingGuests.map(g => (
            <div key={g.id} style={{ background: 'var(--indigo-light)', border: '1px solid var(--indigo)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div className={'av av-sm av-' + (g.color || 'indigo')}>{g.initials || (g.n || '?')[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{g.n || g.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)' }}>Requested to join</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: 'var(--amber-light)', color: '#633806', border: '0.5px solid var(--amber)' }}>Requested</span>
              </div>
              <div style={{ display: 'flex', gap: 7 }}>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: 12, padding: '7px 0', minHeight: 36 }} onClick={() => approveRSVP && approveRSVP(event.id, g.id, g.n || g.name, g.rsvpId)}>Approve</button>
                <button className="btn" style={{ flex: 1, fontSize: 12, padding: '7px 0', minHeight: 36, background: '#FFEDED', color: 'var(--coral)', border: '1px solid #FFEDED' }} onClick={() => declineRSVP && declineRSVP(event.id, g.id, g.n || g.name, g.rsvpId)}>Decline</button>
              </div>
            </div>
          ))}
          <div style={{ height: '0.5px', background: 'var(--border)', margin: '14px 0' }} />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Approved &middot; {approvedGuests.length}</div>
        {approvedGuests.length === 0
          ? <div style={{ fontSize: 13, color: 'var(--ink3)' }}>No confirmed guests yet</div>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {approvedGuests.map(g => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className={'av av-sm av-' + (g.color || 'indigo')}>{g.initials || (g.n || '?')[0]}</div>
                  <div style={{ flex: 1, fontSize: 13 }}>{g.n || g.name}</div>
                  <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: 'var(--teal-light)', color: 'var(--teal)', border: '0.5px solid var(--teal)' }}>Going</span>
                </div>
              ))}
            </div>
        }
      </div>

      {declinedGuests.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 14 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Declined requests</span>
            <span style={{ fontSize: 11, color: 'var(--ink3)' }}>(host can accept later)</span>
          </div>
          {declinedGuests.map(g => (
            <div key={g.id} style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div className="av av-sm" style={{ background: 'var(--border)', color: 'var(--ink3)' }}>{g.initials || (g.n || '?')[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{g.n || g.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)' }}>Declined &middot; cannot request again</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: '#FFEDED', color: 'var(--coral)', border: '0.5px solid #FFEDED' }}>Declined</span>
              </div>
              <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px', minHeight: 34 }} onClick={() => reviveRSVP && reviveRSVP(event.id, g.id, g.n || g.name, g.rsvpId)}>Accept after all</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsTab({ event, user, myComment, passportStamped, commentText, setCommentText, onSubmit, isHost, onPin, addToast }) {
  const comments = event.eventComments || [];
  const pinnedIds = event.pinnedQuotes || [];
  const [reactions, setReactions] = React.useState({});
  const [photoCount, setPhotoCount] = React.useState(0);
  const photoRef = React.useRef();
  const MAX_GUEST_PHOTOS = 5;
  const PROMPT_CHIPS = [
    'The dish that surprised me most was...',
    'What I will remember most from tonight...',
    'A conversation that stayed with me...',
    'If I could bottle one moment it would be...',
    'The pairing that changed my mind about...',
    'I came not knowing anyone and left feeling...',
  ];
  const INLINE_EMOJI = ['😍','🍷','👏','🥹','✨','🔥','🫶','🌿','🥂','🍜'];

  if (!event.isEnded && !isHost) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Moments open when the event starts</div>
        <div style={{ fontSize: 13, color: 'var(--ink2)', lineHeight: 1.6 }}>
          Come back on {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'event day'} to share a Moment with fellow guests.
        </div>
      </div>
    );
  }

  function toggleReaction(commentId, type) {
    setReactions(prev => {
      const key = commentId + '-' + type;
      const defaults = { heart: { count: 2, active: false }, cheers: { count: 1, active: false } };
      const current = prev[key] || defaults[type];
      return { ...prev, [key]: { count: current.active ? current.count - 1 : current.count + 1, active: !current.active } };
    });
  }

  function getReaction(commentId, type) {
    const key = commentId + '-' + type;
    const defaults = { heart: { count: 2, active: false }, cheers: { count: 1, active: false } };
    return reactions[key] || defaults[type];
  }

  function addEmoji(em) { setCommentText(prev => prev + em); }
  function applyPrompt(p) { setCommentText(p); }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (photoCount + files.length > MAX_GUEST_PHOTOS) {
      if (typeof addToast === 'function') addToast('Max ' + MAX_GUEST_PHOTOS + ' photos allowed', 'error');
      return;
    }
    setPhotoCount(prev => prev + files.length);
    if (typeof addToast === 'function') addToast(files.length + ' photo' + (files.length > 1 ? 's' : '') + ' added!', 'success');
  }

  return (
    <div>
      {!myComment && (
        <div style={{ background: 'var(--indigo, #6c5dd3)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>🎫</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'white', marginBottom: 2, fontSize: 14 }}>Complete your Dining Passport stamp</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', lineHeight: 1.5 }}>Share a moment to stamp your passport and unlock all event photos.</div>
          </div>
        </div>
      )}

      {!myComment ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>How was your {getTimeOfDay(event.time)}?</div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 5 }}>Need a nudge? Tap a prompt:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {PROMPT_CHIPS.map(p => (
                <button key={p} onClick={() => applyPrompt(p)} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, border: '1px solid var(--border)', background: 'var(--page)', color: 'var(--ink2)', cursor: 'pointer' }}>{p.length > 30 ? p.slice(0, 28) + '...' : p}</button>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <textarea className="form-textarea" value={commentText} onChange={e => setCommentText(e.target.value)}
              placeholder={'Share what made this ' + getMealName(event) + ' special...'} style={{ minHeight: 90, marginBottom: 0, paddingBottom: 36 }} />
            <div style={{ position: 'absolute', bottom: 8, left: 10, display: 'flex', gap: 3 }}>
              {INLINE_EMOJI.map(em => (
                <button key={em} onClick={() => addEmoji(em)} style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: '2px 3px' }}>{em}</button>
              ))}
            </div>
          </div>
          {event.isEnded && !isHost && (
            <div style={{ marginBottom: 10 }}>
              <input ref={photoRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handlePhotoUpload} />
              <button onClick={() => photoRef.current && photoRef.current.click()} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--page)', fontSize: 12, cursor: 'pointer', color: 'var(--ink2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                📷 Add photos {photoCount > 0 ? '(' + photoCount + '/' + MAX_GUEST_PHOTOS + ')' : '(up to ' + MAX_GUEST_PHOTOS + ')'}
              </button>
              <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 4 }}>Max {MAX_GUEST_PHOTOS} photos · 10MB each · JPEG, PNG, HEIC</div>
            </div>
          )}
          <button className="btn btn-primary btn-full" onClick={onSubmit} disabled={!commentText.trim()}>Share my moment & stamp passport 🎫</button>
        </div>
      ) : (
        <div style={{ background: 'var(--teal-light)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>✓</span>
          <div><div style={{ fontSize: 13, fontWeight: 700, color: '#07A87B' }}>Passport stamped!</div><div style={{ fontSize: 12, color: 'var(--ink2)' }}>Thanks for sharing your moment.</div></div>
        </div>
      )}

      {comments.length > 0 && <div style={{ height: '0.5px', background: 'var(--border)', marginBottom: 12 }} />}

      {comments.length === 0 ? (
        <div className="empty-state" style={{ padding: '24px 0' }}><div className="empty-icon">💬</div><div className="empty-title">No moments shared yet</div><div className="empty-sub">Be the first to share how the evening went.</div></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {comments.map((c, ci) => {
            const isPinned = pinnedIds.includes(c.id);
            const qStyle = isPinned ? QUOTE_STYLES[ci % QUOTE_STYLES.length] : null;
            const heart = getReaction(c.id, 'heart');
            const cheers = getReaction(c.id, 'cheers');
            return (
              <div key={c.id} style={{ background: qStyle ? qStyle.bg : 'var(--page)', borderRadius: 12, padding: '12px 14px', border: qStyle ? (qStyle.border || 'none') : '1px solid var(--border)', color: qStyle ? qStyle.color : 'var(--ink)', position: 'relative', animation: isPinned ? 'fadeSlideIn 0.4s ease ' + (ci * 0.08) + 's both' : 'none' }}>
                {isPinned && <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, opacity: 0.7 }}>📌 Pinned quote</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div className={'av av-sm av-' + c.color} style={isPinned ? { border: '2px solid rgba(255,255,255,0.3)' } : {}}>{c.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.userName}</div>
                    {c.passportStamped && <div style={{ fontSize: 10, color: isPinned ? 'rgba(255,255,255,.7)' : 'var(--teal)', fontWeight: 600 }}>🎫 Passport stamped</div>}
                  </div>
                  {isHost && onPin && !isPinned && (
                    <button onClick={() => onPin(c.id)} style={{ marginLeft: 'auto', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 9px', fontSize: 11, fontWeight: 600, color: 'var(--ink2)', cursor: 'pointer' }}>Pin quote</button>
                  )}
                </div>
                {isPinned && <div style={{ fontSize: 30, opacity: 0.12, position: 'absolute', top: 6, right: 14, fontFamily: 'serif' }}>"</div>}
                <div style={{ fontSize: 13, lineHeight: 1.6, fontStyle: isPinned ? 'italic' : 'normal', marginBottom: 10 }}>{isPinned ? '"' + c.text + '"' : c.text}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleReaction(c.id, 'heart')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 12, border: '1px solid ' + (heart.active ? 'var(--coral)' : 'var(--border)'), background: heart.active ? 'var(--coral-light)' : 'var(--page)', color: heart.active ? 'var(--coral)' : 'var(--ink2)', cursor: 'pointer' }}>
                    <span style={{ fontSize: 13 }}>❤️</span> {heart.count}
                  </button>
                  <button onClick={() => toggleReaction(c.id, 'cheers')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 20, fontSize: 12, border: '1px solid ' + (cheers.active ? 'var(--amber)' : 'var(--border)'), background: cheers.active ? 'var(--amber-light)' : 'var(--page)', color: cheers.active ? 'var(--amber)' : 'var(--ink2)', cursor: 'pointer' }}>
                    <span style={{ fontSize: 13 }}>🥂</span> {cheers.count}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <style>{"@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }"}</style>
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

// ── EditConfirmModal ──────────────────────────────────────
function EditConfirmModal({ event, onClose, onConfirm }) {
  const [notifyGuests, setNotifyGuests] = React.useState(true);
  const [quietly, setQuietly] = React.useState(false);
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(26,20,37,.6)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#faf8f4',borderRadius:16,padding:28,maxWidth:420,width:'100%',boxShadow:'0 20px 60px rgba(26,20,37,.25)' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18 }}>
          <div style={{ fontSize:16,fontWeight:700,color:'var(--ink)' }}>Save changes to event?</div>
          <button onClick={onClose} style={{ background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--ink3)',lineHeight:1 }}>×</button>
        </div>
        <p style={{ fontSize:13,color:'var(--ink2)',marginBottom:20,lineHeight:1.6,fontFamily:'var(--sans)' }}>
          You have confirmed guests. Let them know what changed so no one is caught off guard.
        </p>
        <div style={{ background:'var(--page)',borderRadius:10,padding:14,marginBottom:18 }}>
          <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer',marginBottom:12 }}>
            <input type="checkbox" checked={notifyGuests} onChange={e => setNotifyGuests(e.target.checked)}
              style={{ width:16,height:16,accentColor:'var(--indigo)' }} />
            <span style={{ fontSize:13,fontWeight:600,color:'var(--ink)',fontFamily:'var(--sans)' }}>Notify confirmed guests by email</span>
          </label>
          <label style={{ display:'flex',alignItems:'center',gap:10,cursor:'pointer' }}>
            <input type="checkbox" checked={quietly} onChange={e => setQuietly(e.target.checked)}
              style={{ width:16,height:16,accentColor:'var(--indigo)' }} />
            <span style={{ fontSize:13,color:'var(--ink2)',fontFamily:'var(--sans)' }}>Save quietly — minor fix, no need to alert guests</span>
          </label>
        </div>
        {notifyGuests && !quietly && (
          <div style={{ fontSize:12,color:'var(--ink3)',background:'var(--indigo-light)',borderRadius:8,padding:'10px 12px',marginBottom:18,fontFamily:'var(--sans)',lineHeight:1.5 }}>
            ✉️ Guests will receive an update email with what changed and an option to withdraw their RSVP if needed.
          </div>
        )}
        <div style={{ display:'flex',gap:10 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
          <button onClick={() => onConfirm({ notifyGuests: notifyGuests && !quietly })} className="btn btn-primary" style={{ flex:2 }}>
            Save {quietly ? 'quietly' : notifyGuests ? '& notify guests' : 'without notifying'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PublicRSVPBlock({ event, addToast, rsvpEvent, user }) {
  const [state, setState] = React.useState('idle');
  const alreadyPending = event.guests?.some(g => g.id === user?.id && g.s === 'pending');
  const displayState = alreadyPending ? 'pending' : state;
  function handleRequest() {
    if (displayState === 'pending') return;
    if (typeof rsvpEvent === 'function') rsvpEvent(event.id, 'pending');
    setState('pending');
    addToast('Request sent! The host will review your RSVP. 🎉', 'success');
  }
  return (
    <div style={{ marginTop: 16, padding: 16, border: '1.5px solid var(--indigo)', borderRadius: 12, background: 'var(--indigo-light)' }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--indigo)', fontSize: 15 }}>🌍 Public event — open to join</div>
      <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 14, lineHeight: 1.5 }}>Request to join {event.host ? event.host + 's' : 'this'} event. The host will review and confirm your spot.</div>
      {displayState === 'pending' ? (
        <div style={{ padding: '11px 16px', background: 'var(--teal-light)', borderRadius: 10, fontSize: 14, color: 'var(--teal)', fontWeight: 600 }}>✓ Request sent — waiting for host approval</div>
      ) : (
        <button className="btn btn-primary btn-full" style={{ fontSize: 15, padding: '12px 0' }} onClick={handleRequest}>Request to join</button>
      )}
    </div>
  );
}
