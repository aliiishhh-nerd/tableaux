import React, { useState, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { avColor } from '../data/utils';

const FOOD_IMGS = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=75',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=75',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=75',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=75',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=75',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=75',
  'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=75',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=75',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=75',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=75',
];

const DISH_TAGS    = ['Appetizer','Main course','Dessert','Wine','Cocktail','Charcuterie','Cheese','Bread','Soup','Salad'];
const STYLE_TAGS   = ['Plated','Flatlay','Family style','Tasting menu','Board','Overhead shot'];
const VIBE_TAGS    = ['Candlelit','Al fresco','Long table','Intimate','Festive','Outdoor'];
const QUALITY_TAGS = ['Fine dining','Casual','Home cooked','Street food','Farm to table'];

const GALLERY_NAME_SUGGESTIONS = [
  'An Evening to Remember',
  'Around the Table',
  'Flavors & Friends',
  'The Long Table',
  'A Night in the Kitchen',
  'Golden Hour Feast',
  'Supper Club Memories',
  'Good Food, Better Company',
];

function getAISuggestion(eventTitle, eventType) {
  const sugg = GALLERY_NAME_SUGGESTIONS;
  const hash = (eventTitle + eventType).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return [sugg[hash % sugg.length], sugg[(hash + 2) % sugg.length], sugg[(hash + 5) % sugg.length]];
}

function hours24FromEvent(eventDate, eventTime) {
  if (!eventDate) return null;
  const dt = new Date(eventDate + 'T' + (eventTime || '19:00'));
  dt.setHours(dt.getHours() + 24);
  return dt;
}

function windowStatus(event) {
  const close = hours24FromEvent(event.date, event.time);
  if (!close) return { open: false, label: 'No event date set' };
  const now = new Date();
  if (now < close) {
    const diff = close - now;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { open: true, label: h + 'h ' + m + 'm remaining', closeAt: close };
  }
  return { open: false, label: 'Closed ' + Math.floor((now - close) / 3600000) + 'h ago', closeAt: close };
}

function TagPill({ label, category, active, onClick, onRemove }) {
  const colors = {
    dish:    { bg: '#FFF7ED', color: '#9A3412', border: '#FDBA74' },
    style:   { bg: '#F0FDF4', color: '#166534', border: '#86EFAC' },
    vibe:    { bg: '#EFF6FF', color: '#1E40AF', border: '#93C5FD' },
    quality: { bg: '#FEFCE8', color: '#854D0E', border: '#FDE047' },
    person:  { bg: '#F5F3FF', color: '#5B21B6', border: '#C4B5FD' },
    custom:  { bg: 'var(--page)',   color: 'var(--ink2)',  border: 'var(--border)' },
  };
  const c = colors[category] || colors.custom;
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500,
      cursor: onClick ? 'pointer' : 'default', margin: '2px',
      background: active ? c.bg : 'white', color: active ? c.color : 'var(--ink3)',
      border: '1px solid ' + (active ? c.border : 'var(--border)'),
      transition: 'all .15s', opacity: active ? 1 : 0.7,
    }}>
      {label}
      {onRemove && <span onClick={e => { e.stopPropagation(); onRemove(); }} style={{ marginLeft: 2, opacity: 0.6, fontWeight: 700 }}>×</span>}
    </span>
  );
}

function PhotoCard({ photo, isHost, eventGuests, onUpdate, onSetHighlight, isHighlight }) {
  const [showTagPanel, setShowTagPanel] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const tags = photo.tags || [];
  const guestTags = photo.guestTags || [];
  const categoryTags = tags.filter(t => t.category !== 'person');
  const catCount = categoryTags.length;

  function toggleCatTag(label, category) {
    const exists = tags.find(t => t.label === label && t.category === category);
    if (exists) {
      onUpdate({ ...photo, tags: tags.filter(t => !(t.label === label && t.category === category)) });
    } else {
      if (catCount >= 10) return;
      onUpdate({ ...photo, tags: [...tags, { label, category }] });
    }
  }

  function toggleGuestTag(name) {
    const exists = guestTags.includes(name);
    onUpdate({ ...photo, guestTags: exists ? guestTags.filter(n => n !== name) : [...guestTags, name] });
  }

  function addCustomTag() {
    const val = customTagInput.trim();
    if (!val || catCount >= 10) return;
    onUpdate({ ...photo, tags: [...tags, { label: val, category: 'custom' }] });
    setCustomTagInput('');
  }

  function removeTag(label, category) {
    onUpdate({ ...photo, tags: tags.filter(t => !(t.label === label && t.category === category)) });
  }

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ position: 'relative' }}>
        <img src={photo.src} alt={photo.caption || ''} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} loading="lazy" />
        {isHighlight && (
          <div style={{ position: 'absolute', top: 8, left: 8, background: '#FEF9C3', color: '#713F12', padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
            ★ Event highlight
          </div>
        )}
        {photo.late && (
          <div style={{ position: 'absolute', top: 8, right: 8, background: '#FEE2E2', color: '#991B1B', padding: '3px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700 }}>
            Late submission
          </div>
        )}
      </div>
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Added by {photo.uploadedBy}</div>
            {photo.caption && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{photo.caption}</div>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {isHost && (
              <button onClick={() => onSetHighlight(photo.id)}
                style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid ' + (isHighlight ? '#FDE047' : 'var(--border)'), background: isHighlight ? '#FEF9C3' : 'white', color: isHighlight ? '#713F12' : 'var(--ink3)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                {isHighlight ? '★ Highlight' : '☆ Set highlight'}
              </button>
            )}
            <button onClick={() => setShowTagPanel(v => !v)}
              style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', background: showTagPanel ? 'var(--indigo-light)' : 'white', color: showTagPanel ? 'var(--indigo)' : 'var(--ink2)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
              {showTagPanel ? 'Done' : '+ Tag'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: showTagPanel ? 8 : 0 }}>
          {tags.map((t, i) => (
            <TagPill key={i} label={t.label} category={t.category} active={true} onRemove={() => removeTag(t.label, t.category)} />
          ))}
          {guestTags.map((n, i) => (
            <TagPill key={'g' + i} label={n} category="person" active={true} onRemove={() => toggleGuestTag(n)} />
          ))}
        </div>

        {showTagPanel && (
          <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: 12, marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Category tags</span>
              <span style={{ fontSize: 11, color: catCount >= 10 ? 'var(--coral)' : 'var(--ink3)', fontWeight: 600 }}>{catCount}/10</span>
            </div>

            {[['Dish', DISH_TAGS, 'dish'], ['Style', STYLE_TAGS, 'style'], ['Vibe', VIBE_TAGS, 'vibe'], ['Quality', QUALITY_TAGS, 'quality']].map(([label, list, cat]) => (
              <div key={cat} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {list.map(tag => (
                    <TagPill key={tag} label={tag} category={cat} active={tags.some(t => t.label === tag && t.category === cat)}
                      onClick={() => toggleCatTag(tag, cat)} />
                  ))}
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Custom tag</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input className="form-input" value={customTagInput} onChange={e => setCustomTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                  placeholder="Type a custom tag..." style={{ flex: 1, fontSize: 12, padding: '5px 10px' }}
                  disabled={catCount >= 10} />
                <button className="btn btn-primary btn-sm" onClick={addCustomTag} disabled={catCount >= 10}>Add</button>
              </div>
              {catCount >= 10 && <div style={{ fontSize: 10, color: 'var(--coral)', marginTop: 3 }}>Max 10 category tags reached</div>}
            </div>

            {eventGuests.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--ink3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Tag guests (unlimited)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {eventGuests.map(g => (
                    <TagPill key={g} label={g} category="person" active={guestTags.includes(g)} onClick={() => toggleGuestTag(g)} />
                  ))}
                </div>
                <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 4 }}>Tagged guests can show this photo in their Dining Passport</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MasonryLayout({ photos, isHost, eventGuests, onUpdate, highlightId, onSetHighlight }) {
  const left = photos.filter((_, i) => i % 2 === 0);
  const right = photos.filter((_, i) => i % 2 !== 0);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <div>{left.map(p => <PhotoCard key={p.id} photo={p} isHost={isHost} eventGuests={eventGuests} onUpdate={onUpdate} isHighlight={highlightId === p.id} onSetHighlight={onSetHighlight} />)}</div>
      <div>{right.map(p => <PhotoCard key={p.id} photo={p} isHost={isHost} eventGuests={eventGuests} onUpdate={onUpdate} isHighlight={highlightId === p.id} onSetHighlight={onSetHighlight} />)}</div>
    </div>
  );
}

function EditorialLayout({ photos, isHost, eventGuests, onUpdate, highlightId, onSetHighlight }) {
  const hero = photos.find(p => p.id === highlightId) || photos[0];
  const rest = photos.filter(p => !hero || p.id !== hero.id);
  if (!hero) return <div style={{ color: 'var(--ink3)', textAlign: 'center', padding: 32 }}>No photos yet.</div>;
  return (
    <div>
      <div style={{ position: 'relative', borderRadius: 'var(--r2)', overflow: 'hidden', marginBottom: 10 }}>
        <img src={hero.src} alt="" style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
        {highlightId === hero.id && <div style={{ position: 'absolute', top: 10, left: 10, background: '#FEF9C3', color: '#713F12', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>★ Event highlight</div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 }}>
        {rest.slice(0, 8).map(p => (
          <div key={p.id} style={{ borderRadius: 'var(--r)', overflow: 'hidden', height: 100, position: 'relative', cursor: 'pointer' }}>
            <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        {photos.map(p => <PhotoCard key={p.id} photo={p} isHost={isHost} eventGuests={eventGuests} onUpdate={onUpdate} isHighlight={highlightId === p.id} onSetHighlight={onSetHighlight} />)}
      </div>
    </div>
  );
}

function TimelineLayout({ photos, isHost, eventGuests, onUpdate, highlightId, onSetHighlight }) {
  const courses = ['Aperitivo', 'First course', 'Main course', 'Dessert', 'After dinner'];
  const courseColors = ['#FDBA74', '#86EFAC', '#93C5FD', '#F9A8D4', '#C4B5FD'];
  const grouped = {};
  photos.forEach((p, i) => {
    const course = p.course || courses[Math.min(i % courses.length, courses.length - 1)];
    if (!grouped[course]) grouped[course] = [];
    grouped[course].push(p);
  });
  return (
    <div>
      {courses.filter(c => grouped[c]).map((course, ci) => (
        <div key={course} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: courseColors[ci], flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{course}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {grouped[course].map(p => (
              <div key={p.id} style={{ flexShrink: 0, width: 140, height: 110, borderRadius: 'var(--r)', overflow: 'hidden', position: 'relative', cursor: 'pointer' }}>
                <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                {highlightId === p.id && <div style={{ position: 'absolute', top: 4, left: 4, background: '#FEF9C3', color: '#713F12', padding: '2px 6px', borderRadius: 20, fontSize: 9, fontWeight: 700 }}>★</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 8 }}>
        {photos.map(p => <PhotoCard key={p.id} photo={p} isHost={isHost} eventGuests={eventGuests} onUpdate={onUpdate} isHighlight={highlightId === p.id} onSetHighlight={onSetHighlight} />)}
      </div>
    </div>
  );
}

export default function GalleryPanel({ event, isHost }) {
  const { saveEvent, profile } = useApp();
  const gallery = event.gallery || {
    name: '', layout: 'masonry', visibility: 'Public',
    photos: [], highlightId: null, windowExtended: false,
  };

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState(gallery.name || '');
  const [showSugg, setShowSugg]       = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const fileRef = useRef(null);

  const winStatus = windowStatus(event);
  const suggestions = getAISuggestion(event.title, event.type);
  const eventGuests = (event.guests || []).filter(g => g.s === 'approved').map(g => g.n);

  const pendingLate = (gallery.photos || []).filter(p => p.status === 'pending');
  const approvedPhotos = (gallery.photos || []).filter(p => p.status !== 'pending');

  const grouped = {};
  pendingLate.forEach(p => {
    if (!grouped[p.uploadedBy]) grouped[p.uploadedBy] = [];
    grouped[p.uploadedBy].push(p);
  });

  function updateGallery(patch) {
    saveEvent({ ...event, gallery: { ...gallery, ...patch } });
  }

  function updatePhoto(updated) {
    updateGallery({ photos: gallery.photos.map(p => p.id === updated.id ? updated : p) });
  }

  function saveName() {
    updateGallery({ name: nameInput.trim() });
    setEditingName(false);
    setShowSugg(false);
  }

  function handleFiles(files) {
    const newPhotos = Array.from(files).map((file, i) => {
      const idx = (gallery.photos.length + i) % FOOD_IMGS.length;
      const isLate = !winStatus.open;
      return {
        id: Date.now() + i, src: FOOD_IMGS[idx],
        uploadedBy: profile.name, caption: '',
        tags: [], guestTags: [], course: null,
        late: isLate, status: isLate ? 'pending' : 'approved',
        uploadedAt: new Date().toISOString(),
      };
    });
    updateGallery({ photos: [...gallery.photos, ...newPhotos] });
  }

  function approvePhoto(photoId) {
    updateGallery({ photos: gallery.photos.map(p => p.id === photoId ? { ...p, status: 'approved', late: true } : p) });
  }
  function denyPhoto(photoId) {
    updateGallery({ photos: gallery.photos.filter(p => p.id !== photoId) });
  }
  function approveBatch(uploaderName) {
    updateGallery({ photos: gallery.photos.map(p => p.uploadedBy === uploaderName && p.status === 'pending' ? { ...p, status: 'approved', late: true } : p) });
  }
  function denyBatch(uploaderName) {
    updateGallery({ photos: gallery.photos.filter(p => !(p.uploadedBy === uploaderName && p.status === 'pending')) });
  }

  function filteredPhotos() {
    if (activeFilter === 'all') return approvedPhotos;
    if (activeFilter === 'highlight') return approvedPhotos.filter(p => p.id === gallery.highlightId);
    if (activeFilter === 'people') return approvedPhotos.filter(p => (p.guestTags || []).length > 0);
    return approvedPhotos.filter(p => (p.tags || []).some(t => t.category === activeFilter));
  }

  const displayed = filteredPhotos();

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editingName ? (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input className="form-input" value={nameInput} onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveName()} placeholder="Name this gallery..." style={{ flex: 1 }} autoFocus />
                <button className="btn btn-primary btn-sm" onClick={saveName}>Save</button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingName(false); setShowSugg(false); }}>Cancel</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--ink3)' }}>AI suggestions:</span>
                {suggestions.map(s => (
                  <span key={s} onClick={() => { setNameInput(s); setShowSugg(false); }}
                    style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid var(--indigo-mid)', background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{gallery.name || 'Event Gallery'}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{approvedPhotos.length} photo{approvedPhotos.length !== 1 ? 's' : ''}</div>
              </div>
              {isHost && (
                <button onClick={() => { setEditingName(true); setShowSugg(true); }}
                  style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'white', color: 'var(--ink2)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                  ✏ Rename
                </button>
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          {isHost && (
            <>
              <select className="form-input" value={gallery.visibility} onChange={e => updateGallery({ visibility: e.target.value })} style={{ fontSize: 12, padding: '5px 10px' }}>
                <option>Private</option>
                <option>Friends</option>
                <option>Public</option>
              </select>
              <select className="form-input" value={gallery.layout} onChange={e => updateGallery({ layout: e.target.value })} style={{ fontSize: 12, padding: '5px 10px' }}>
                <option value="masonry">Masonry</option>
                <option value="editorial">Editorial</option>
                <option value="timeline">Timeline</option>
              </select>
            </>
          )}
          <button className="btn btn-primary btn-sm" onClick={() => fileRef.current && fileRef.current.click()}>
            + Add photos
          </button>
          <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        </div>
      </div>

      <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: winStatus.open ? 'var(--teal)' : 'var(--coral)', flexShrink: 0 }} />
        <span style={{ color: 'var(--ink2)', fontWeight: 500 }}>Upload window {winStatus.open ? 'open' : 'closed'} — {winStatus.label}</span>
        {!winStatus.open && <span style={{ color: 'var(--ink3)', fontSize: 11, marginLeft: 4 }}>Late photos need host approval</span>}
        {isHost && winStatus.open && (
          <button onClick={() => updateGallery({ windowExtended: true })}
            style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'white', color: 'var(--ink2)', cursor: 'pointer', fontSize: 11 }}>
            Extend 24h
          </button>
        )}
      </div>

      {isHost && pendingLate.length > 0 && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--r2)', padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 10 }}>
            {pendingLate.length} late submission{pendingLate.length > 1 ? 's' : ''} awaiting approval
          </div>
          {Object.entries(grouped).map(([name, photos]) => (
            <div key={name} style={{ marginBottom: 10, background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: photos.length > 1 ? 8 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className={'av av-sm ' + avColor(0)}>{name.split(' ').map(x => x[0]).join('').slice(0, 2)}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{photos.length} photo{photos.length > 1 ? 's' : ''} submitted late</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {photos.length > 1 && (
                    <>
                      <button onClick={() => denyBatch(name)}
                        style={{ padding: '5px 12px', borderRadius: 'var(--r)', border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                        Deny all ({photos.length})
                      </button>
                      <button onClick={() => approveBatch(name)}
                        style={{ padding: '5px 12px', borderRadius: 'var(--r)', border: '1px solid rgba(10,207,151,0.4)', background: 'white', color: 'var(--teal)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                        Approve all ({photos.length})
                      </button>
                    </>
                  )}
                  {photos.length === 1 && (
                    <>
                      <button onClick={() => denyPhoto(photos[0].id)}
                        style={{ padding: '5px 12px', borderRadius: 'var(--r)', border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Deny</button>
                      <button onClick={() => approvePhoto(photos[0].id)}
                        style={{ padding: '5px 12px', borderRadius: 'var(--r)', border: '1px solid rgba(10,207,151,0.4)', background: 'white', color: 'var(--teal)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Approve</button>
                    </>
                  )}
                </div>
              </div>
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {photos.map(p => (
                    <div key={p.id} style={{ flex: '0 0 60px', height: 50, borderRadius: 6, overflow: 'hidden' }}>
                      <img src={p.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['all', 'All'], ['highlight', '★ Highlight'], ['dish', 'Dish'], ['style', 'Style'], ['vibe', 'Vibe'], ['quality', 'Quality'], ['people', 'People']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveFilter(val)}
            style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid ' + (activeFilter === val ? 'var(--indigo)' : 'var(--border)'), background: activeFilter === val ? 'var(--indigo-light)' : 'white', color: activeFilter === val ? 'var(--indigo)' : 'var(--ink2)', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      {displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--page)', borderRadius: 'var(--r2)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📷</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 4 }}>
            {activeFilter === 'all' ? 'No photos yet' : 'No photos with this filter'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {activeFilter === 'all' && (winStatus.open ? 'Add photos while the upload window is open.' : 'Upload window is closed. Late submissions need approval.')}
          </div>
        </div>
      )}

      {displayed.length > 0 && gallery.layout === 'masonry' && (
        <MasonryLayout photos={displayed} isHost={isHost} eventGuests={eventGuests}
          onUpdate={updatePhoto} highlightId={gallery.highlightId} onSetHighlight={id => updateGallery({ highlightId: id })} />
      )}
      {displayed.length > 0 && gallery.layout === 'editorial' && (
        <EditorialLayout photos={displayed} isHost={isHost} eventGuests={eventGuests}
          onUpdate={updatePhoto} highlightId={gallery.highlightId} onSetHighlight={id => updateGallery({ highlightId: id })} />
      )}
      {displayed.length > 0 && gallery.layout === 'timeline' && (
        <TimelineLayout photos={displayed} isHost={isHost} eventGuests={eventGuests}
          onUpdate={updatePhoto} highlightId={gallery.highlightId} onSetHighlight={id => updateGallery({ highlightId: id })} />
      )}
    </div>
  );
}
