import React, { useState, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime } from '../data/utils';

export default function EventDetailModal({ event, onClose, onEdit }) {
  const { user, rsvpEvent, claimPotluckItem, unclaimPotluckItem, addPhoto, addToast } = useApp();
  const [tab, setTab] = useState(event.isEnded ? 'photos' : 'overview');
  const [uploading, setUploading] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef();

  if (!event) return null;

  const myGuest = event.guests?.find(g => g.id === 'u1');
  const isEnded = event.isEnded || false;
  const isHost = event.mine;
  const isInvited = event.isInvitedTo;
  const hasGallery = event.galleryEnabled && (isEnded || isHost);

  // Tabs available
  const tabs = [
    { key: 'overview', label: '📋 Overview' },
    ...(event.supperClub ? [{ key: 'menu', label: '🍽️ Menu' }] : []),
    ...(event.potluck ? [{ key: 'potluck', label: '🥘 Potluck' }] : []),
    { key: 'guests', label: `👥 Guests (${event.guests?.length || 0})` },
    ...(hasGallery ? [{ key: 'photos', label: `📸 Photos${event.photoGallery?.length ? ` (${event.photoGallery.length})` : ''}` }] : []),
  ];

  function handleUploadPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const photo = {
        id: 'ph-' + Date.now(),
        url: ev.target.result,
        tags: [],
        uploadedBy: 'u1',
        uploaderName: user?.name || 'You',
      };
      addPhoto(event.id, photo);
      addToast('Photo uploaded!', 'success');
      setUploading(false);
    };
    reader.readAsDataURL(file);
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
          {/* Always render a background first */}
          <div style={{ position: 'absolute', inset: 0, background: coverBg }} />
          {(cover.type === 'image' && cover.value) || event.img ? (
            <img
              src={cover.value || event.img}
              alt={event.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : cover.type === 'emoji' ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 72 }}>{cover.emoji}</span>
            </div>
          ) : null}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 60%)' }} />

          {/* Ended badge */}
          {isEnded && (
            <div style={{ position: 'absolute', top: 12, left: 12 }}>
              <span className="chip chip-gray" style={{ background: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(8px)' }}>
                ✓ Event Ended
              </span>
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
              <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* ---- OVERVIEW ---- */}
          {tab === 'overview' && (
            <div>
              {isEnded && (
                <div className="ended-event-banner" style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>🎉</span>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>This event has ended</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                      {event.photoGallery?.length
                        ? `${event.photoGallery.length} photos shared — check out the gallery!`
                        : 'Be the first to share photos from the evening.'}
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
                  { icon: '👤', val: event.host },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'var(--page)', borderRadius: 20,
                    padding: '5px 12px', fontSize: 13, color: 'var(--ink)',
                    border: '1px solid var(--border)',
                  }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span>{item.val}</span>
                  </div>
                ))}
              </div>

              {event.desc && (
                <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7, padding: '14px', background: 'var(--page)', borderRadius: 10 }}>
                  {event.desc}
                </div>
              )}

              {/* RSVP for invited users */}
              {isInvited && myGuest?.s === 'pending' && (
                <div style={{ marginTop: 16, padding: 16, border: '1.5px solid var(--indigo)', borderRadius: 12, background: 'var(--indigo-light)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--indigo)' }}>🎉 You're invited!</div>
                  <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 12 }}>Will you join {event.host} for {event.title}?</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => { rsvpEvent(event.id, 'approved'); addToast("You're going! 🎉", 'success'); }}>✓ Accept</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { rsvpEvent(event.id, 'declined'); addToast('RSVP declined', ''); }}>✕ Decline</button>
                  </div>
                </div>
              )}
              {isInvited && myGuest?.s === 'approved' && (
                <div style={{ marginTop: 16, padding: 12, background: 'var(--teal-light)', borderRadius: 10, fontSize: 13, color: '#07A87B', fontWeight: 600 }}>
                  ✓ You're going!
                </div>
              )}
            </div>
          )}

          {/* ---- SUPPER CLUB MENU ---- */}
          {tab === 'menu' && event.supperClub && (
            <div>
              {/* Host Note */}
              {event.supperClub.hostNote && (
                <div className="sc-host-note">
                  <div className="sc-host-note-label">✍️ A Note from the Host</div>
                  <div className="sc-host-note-text">"{event.supperClub.hostNote}"</div>
                </div>
              )}

              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🍽️ The Menu
              </div>
              {event.supperClub.courses?.map((course, i) => (
                <div key={i} className="sc-course" style={course.highlight ? { background: 'linear-gradient(90deg, var(--gold-light), transparent)', borderRadius: 10, padding: '14px', borderBottom: 'none', marginBottom: 6 } : {}}>
                  <div className="sc-course-num" style={course.highlight ? { background: 'var(--gold)', color: 'white' } : {}}>
                    {course.num}
                  </div>
                  <div className="sc-course-info">
                    <div className="sc-course-name">
                      {course.highlight && '⭐ '}{course.name}
                    </div>
                    <div className="sc-course-desc">{course.desc}</div>
                    {course.wine && (
                      <div className="sc-course-note">🍷 Paired with: {course.wine}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ---- POTLUCK ---- */}
          {tab === 'potluck' && event.potluck && (
            <PotluckTab event={event} onClaim={claimPotluckItem} onUnclaim={unclaimPotluckItem} addToast={addToast} />
          )}

          {/* ---- GUESTS ---- */}
          {tab === 'guests' && (
            <div>
              {event.guests?.length === 0 && (
                <div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No guests yet</div></div>
              )}
              {event.guests?.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div className={`av av-sm av-${g.color || 'indigo'}`}>{g.initials || g.n?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{g.n}</div>
                  </div>
                  <span className={`chip ${g.s === 'approved' ? 'chip-teal' : g.s === 'declined' ? 'chip-coral' : 'chip-amber'}`}>
                    {g.s === 'approved' ? '✓ Going' : g.s === 'declined' ? '✕ Declined' : '⏳ Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ---- PHOTOS ---- */}
          {tab === 'photos' && (
            <PhotoGalleryTab
              event={event}
              fileRef={fileRef}
              uploading={uploading}
              onUpload={handleUploadPhoto}
              lightbox={lightbox}
              setLightbox={setLightbox}
            />
          )}
        </div>

        {/* Footer */}
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {isHost && onEdit && (
            <button className="btn btn-primary" onClick={() => { onClose(); onEdit(event); }}>✏️ Edit Event</button>
          )}
        </div>

        {/* Hidden file input */}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadPhoto} />
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setLightbox(null)}>
          <div style={{ maxWidth: 700, width: '100%', position: 'relative' }}>
            <img src={lightbox.url} alt="" style={{ width: '100%', borderRadius: 12, objectFit: 'contain', maxHeight: '80vh' }} />
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {lightbox.tags?.map((tag, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '3px 10px', borderRadius: 20, fontSize: 12 }}>{tag}</span>
              ))}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 8 }}>📸 by {lightbox.uploaderName}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function PotluckTab({ event, onClaim, onUnclaim, addToast }) {
  const cats = { food: '🍽️ Food', drinks: '🥂 Drinks', other: '🧺 Other' };

  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 16 }}>
        Tap an unclaimed item to add your dish!
      </div>
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
                    {item.claimedBy === 'u1' && (
                      <button className="btn btn-ghost btn-sm potluck-item-btn" onClick={() => { onUnclaim(event.id, item.id); addToast('Item released', ''); }}>
                        Undo
                      </button>
                    )}
                  </>
                ) : (
                  <button className="btn btn-primary btn-sm potluck-item-btn" onClick={() => { onClaim(event.id, item.id); addToast("Item claimed! 🙌", 'success'); }}>
                    I'll bring it
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PhotoGalleryTab({ event, fileRef, uploading, onUpload, lightbox, setLightbox }) {
  const photos = event.photoGallery || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 14, color: 'var(--ink2)' }}>
          {photos.length > 0 ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} from the evening` : 'No photos yet — be the first to share!'}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ Uploading…' : '📸 Add Photos'}
        </button>
      </div>

      <div className="photo-gallery">
        {photos.map(ph => (
          <div key={ph.id} className="photo-thumb" onClick={() => setLightbox(ph)}>
            <img src={ph.url} alt="" />
            {ph.tags?.length > 0 && (
              <div className="photo-tag">{ph.tags[0]}{ph.tags.length > 1 ? ` +${ph.tags.length - 1}` : ''}</div>
            )}
          </div>
        ))}
        <div className="photo-thumb-add" onClick={() => fileRef.current?.click()}>
          <span style={{ fontSize: 24 }}>+</span>
          <span>Upload</span>
        </div>
      </div>

      {photos.length > 0 && (
        <div style={{ marginTop: 14, fontSize: 12, color: 'var(--ink3)', textAlign: 'center' }}>
          Tap any photo to view full size and tags
        </div>
      )}
    </div>
  );
}
