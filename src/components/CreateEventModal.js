import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { SEED_IMAGES, GRADIENT_COVERS } from '../data/seed';
import { EmojiPresetsRow, EmojiTrigger } from './EmojiPicker';

const EVENT_TYPES = ['Dinner Party', 'Supper Club', 'Potluck'];
const VISIBILITY = ['Public', 'Friends Only', 'Invite Only'];
const DRESS_CODES = ['No dress code', 'Smart Casual', 'Cocktail Attire', 'Black Tie', 'Themed — see description'];
const POTLUCK_CATS = [
  { key: 'food',   label: '🍽️ Food',   placeholder: 'e.g. Lasagna, Salad' },
  { key: 'drinks', label: '🥂 Drinks', placeholder: 'e.g. Wine, Cider' },
  { key: 'other',  label: '🧺 Other',  placeholder: 'e.g. Candles, Napkins' },
];

const DEFAULT_POTLUCK = {
  items: [
    { id: 'pi-1', cat: 'food',   emoji: '🍽️', name: 'Main Dish',   claimedBy: null, claimerName: null },
    { id: 'pi-2', cat: 'food',   emoji: '🥗',  name: 'Salad',       claimedBy: null, claimerName: null },
    { id: 'pi-3', cat: 'drinks', emoji: '🍷',  name: 'Wine',        claimedBy: null, claimerName: null },
    { id: 'pi-4', cat: 'other',  emoji: '🧺',  name: 'Utensils',    claimedBy: null, claimerName: null },
  ],
};

const DEFAULT_SUPPER_CLUB = {
  hostNote: '',
  courses: [
    { num: 1, name: '', desc: '', wine: '' },
    { num: 2, name: '', desc: '', wine: '' },
    { num: 3, name: '', desc: '', wine: '' },
  ],
};

const PLAYLIST_PLATFORMS = [
  { key: 'spotify',    label: 'Spotify',     icon: '🎵', placeholder: 'https://open.spotify.com/playlist/...' },
  { key: 'apple',      label: 'Apple Music', icon: '🎶', placeholder: 'https://music.apple.com/playlist/...' },
  { key: 'youtube',    label: 'YouTube',     icon: '▶️', placeholder: 'https://youtube.com/playlist/...' },
  { key: 'soundcloud', label: 'SoundCloud',  icon: '🔊', placeholder: 'https://soundcloud.com/...' },
];

const PRESET_COLORS = [
  '#6C5DD3', '#2EC4B6', '#D4AF37', '#E94560', '#FF6B6B',
  '#4ECDC4', '#45B7D1', '#96CEB4', '#1A1A2E', '#2D2550',
];

function newId() { return 'pi-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); }

// Address autocomplete using Nominatim (free, no API key)
function AddressAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val);
    onChange(val);
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          'https://nominatim.openstreetmap.org/search?' +
          new URLSearchParams({ q: val, format: 'json', limit: 5, addressdetails: 1 }),
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setResults(data);
        setOpen(data.length > 0);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 400);
  }

  function handleSelect(item) {
    const displayName = item.display_name;
    setQuery(displayName);
    onChange(displayName);
    onSelect && onSelect(item);
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      <input
        className="form-input"
        value={query}
        onChange={handleInput}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder="Start typing an address..."
        autoComplete="off"
      />
      {loading && (
        <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--ink3)' }}>
          ⏳
        </div>
      )}
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)',
          zIndex: 1000, overflow: 'hidden',
        }}>
          {results.map((item, i) => (
            <div
              key={i}
              onMouseDown={() => handleSelect(item)}
              style={{
                padding: '9px 14px', fontSize: 13, cursor: 'pointer', color: 'var(--ink)',
                borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--indigo-light)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ flexShrink: 0, marginTop: 1 }}>📍</span>
              <span style={{ lineHeight: 1.4 }}>{item.display_name}</span>
            </div>
          ))}
          <div style={{ padding: '6px 14px', fontSize: 10, color: 'var(--ink3)', background: 'var(--page)', borderTop: '1px solid var(--border)' }}>
            Address data © OpenStreetMap contributors
          </div>
        </div>
      )}
    </div>
  );
}

// Inline hex color picker with preset swatches + custom input
function ColorPicker({ value, onChange, label }) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {PRESET_COLORS.map(c => (
          <div
            key={c}
            onClick={() => onChange(c)}
            title={c}
            style={{
              width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
              background: c,
              border: value === c ? '3px solid var(--indigo)' : '2px solid transparent',
              outline: value === c ? '2px solid white' : 'none',
              outlineOffset: -4,
              transition: 'transform 0.1s',
              boxShadow: '0 1px 4px rgba(0,0,0,.15)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ))}
        <div
          onClick={() => setShowCustom(s => !s)}
          title="Custom color"
          style={{
            width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
            background: PRESET_COLORS.includes(value) ? 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' : value,
            border: !PRESET_COLORS.includes(value) ? '3px solid var(--indigo)' : '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14,
          }}
        >
          {PRESET_COLORS.includes(value) ? '＋' : ''}
        </div>
      </div>
      {showCustom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width: 40, height: 32, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }}
          />
          <input
            className="form-input"
            value={value}
            onChange={e => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
            }}
            placeholder="#6C5DD3"
            style={{ width: 110, fontFamily: 'monospace', fontSize: 13 }}
          />
          <div style={{ width: 32, height: 32, borderRadius: 6, background: value, border: '1px solid var(--border)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--ink3)' }}>Preview</span>
        </div>
      )}
    </div>
  );
}

export default function CreateEventModal({ event, onClose }) {
  const { createEvent, updateEvent, addToast } = useApp();
  const isEdit = !!event;

  const [form, setForm] = useState({
    title:          event?.title || '',
    type:           event?.type || 'Dinner Party',
    date:           event?.date || '',
    time:           event?.time || '19:00',
    loc:            event?.loc || '',
    addr:           event?.addr || '',
    addrHidden:     event?.addrHidden ?? true,
    cap:            event?.cap || 10,
    vis:            event?.vis || 'Invite Only',
    desc:           event?.desc || '',
    dressCode:      event?.dressCode || 'No dress code',
    invH:           event?.invH || "You're Invited",
    invBg:          event?.invBg || '#6C5DD3',
    galleryEnabled: event?.galleryEnabled ?? true,
    seriesName:     event?.seriesName || '',
    seriesVolume:   event?.seriesVolume || 1,
    playlist:       event?.playlist || { platform: 'spotify', url: '' },
  });

  const [cover, setCover] = useState(
    event?.cover || { type: 'gradient', value: GRADIENT_COVERS[0].value }
  );
  const [coverTab, setCoverTab] = useState(
    event?.cover?.type === 'image' ? 'image' : event?.cover?.type === 'emoji' ? 'emoji' : 'gradient'
  );

  const [potluckItems, setPotluckItems] = useState(event?.potluck?.items || DEFAULT_POTLUCK.items);
  const [scData, setScData] = useState(event?.supperClub || DEFAULT_SUPPER_CLUB);
  const [newItemText, setNewItemText] = useState({ food: '', drinks: '', other: '' });
  const newItemEmoji = { food: '🍽️', drinks: '🥂', other: '🧺' };

  const isPotluck    = form.type === 'Potluck';
  const isSupperClub = form.type === 'Supper Club';

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  function appendToField(field, emoji) {
    setForm(f => ({ ...f, [field]: (f[field] || '') + emoji }));
  }

  function setPlaylist(key, val) {
    setForm(f => ({ ...f, playlist: { ...f.playlist, [key]: val } }));
  }

  function handleAddressSelect(nominatimItem) {
    // Auto-populate loc with city/neighbourhood if empty
    const addr = nominatimItem.address || {};
    const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
    const city = addr.city || addr.town || addr.village || '';
    if (!form.loc && (neighborhood || city)) {
      set('loc', [neighborhood, city].filter(Boolean).join(', '));
    }
  }

  function handleSubmit() {
    if (!form.title.trim()) { addToast('Event title is required', 'error'); return; }
    if (!form.date) { addToast('Please set a date', 'error'); return; }

    const payload = {
      ...form,
      cover,
      potluck:    isPotluck    ? { items: potluckItems } : null,
      supperClub: isSupperClub ? scData                 : null,
      playlist:   form.playlist?.url?.trim() ? form.playlist : null,
    };

    if (isEdit) {
      updateEvent(event.id, payload);
      addToast('Event updated ✓', 'success');
    } else {
      createEvent(payload);
      addToast('Event created! 🎉', 'success');
    }
    onClose();
  }

  function addPotluckItem(cat) {
    const text = newItemText[cat]?.trim();
    if (!text) return;
    setPotluckItems(items => [...items, { id: newId(), cat, emoji: newItemEmoji[cat], name: text, claimedBy: null, claimerName: null }]);
    setNewItemText(t => ({ ...t, [cat]: '' }));
  }
  function removePotluckItem(id) { setPotluckItems(items => items.filter(it => it.id !== id)); }

  function updateCourse(i, key, val) {
    setScData(d => ({ ...d, courses: d.courses.map((c, j) => j === i ? { ...c, [key]: val } : c) }));
  }
  function addCourse() {
    setScData(d => ({ ...d, courses: [...d.courses, { num: d.courses.length + 1, name: '', desc: '', wine: '' }] }));
  }
  function removeCourse(i) {
    setScData(d => ({ ...d, courses: d.courses.filter((_, j) => j !== i).map((c, j) => ({ ...c, num: j + 1 })) }));
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ maxWidth: 660 }}>
        <div className="modal-head">
          <h2>{isEdit ? 'Edit Event' : 'Create Event'}</h2>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* COVER */}
          <div className="form-group">
            <label className="form-label">Cover</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {['gradient', 'emoji', 'image'].map(t => (
                <button key={t} className={`filter-btn ${coverTab === t ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setCoverTab(t)}>
                  {t === 'gradient' ? '🎨 Gradient' : t === 'emoji' ? '✨ Emoji' : '📷 Photo'}
                </button>
              ))}
            </div>

            {coverTab === 'gradient' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {GRADIENT_COVERS.map(g => (
                  <div key={g.label} title={g.label} onClick={() => setCover({ type: 'gradient', value: g.value })}
                    style={{ width: 44, height: 44, borderRadius: 10, cursor: 'pointer', background: g.value, border: cover.value === g.value ? '3px solid var(--indigo)' : '3px solid transparent', transition: 'border-color 0.15s' }} />
                ))}
              </div>
            )}

            {coverTab === 'emoji' && (
              <div>
                <div style={{ marginBottom: 10, fontSize: 13, color: 'var(--ink2)' }}>Select an emoji for your animated cover:</div>
                <EmojiPresetsRow selected={cover.emoji} onSelect={em => setCover(c => ({ ...c, type: 'emoji', emoji: em, bg: c.bg || '#1A1A2E' }))} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                  <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Background:</label>
                  {GRADIENT_COVERS.slice(0, 5).map(g => (
                    <div key={g.label} onClick={() => setCover(c => ({ ...c, bg: g.value }))}
                      style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', background: g.value, border: cover.bg === g.value ? '2px solid var(--indigo)' : '2px solid transparent' }} />
                  ))}
                </div>
                {cover.emoji && (
                  <div style={{ marginTop: 10, width: 80, height: 80, borderRadius: 12, background: cover.bg || '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                    {cover.emoji}
                  </div>
                )}
              </div>
            )}

            {coverTab === 'image' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {SEED_IMAGES.map(img => (
                  <div key={img.u} onClick={() => setCover({ type: 'image', value: img.u })}
                    style={{ aspectRatio: '4/3', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', border: cover.value === img.u ? '3px solid var(--indigo)' : '3px solid transparent' }}>
                    <img src={img.u} alt={img.l} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="divider" />

          {/* BASICS */}
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. An Evening of Provençal Cuisine" style={{ flex: 1 }} />
              <EmojiTrigger onSelect={em => appendToField('title', em)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Event Type</label>
              <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Visibility</label>
              <select className="form-select" value={form.vis} onChange={e => set('vis', e.target.value)}>
                {VISIBILITY.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>

          {/* Supper Club series fields */}
          {isSupperClub && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Series Name</label>
                <input className="form-input" value={form.seriesName} onChange={e => set('seriesName', e.target.value)} placeholder="e.g. Terroir Supper Club" />
              </div>
              <div className="form-group">
                <label className="form-label">Volume #</label>
                <input className="form-input" type="number" min={1} value={form.seriesVolume} onChange={e => set('seriesVolume', parseInt(e.target.value) || 1)} />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input className="form-input" type="time" value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location Name</label>
              <input className="form-input" value={form.loc} onChange={e => set('loc', e.target.value)} placeholder="Venue or neighborhood" />
            </div>
            <div className="form-group">
              <label className="form-label">Capacity</label>
              <input className="form-input" type="number" min={1} max={200} value={form.cap} onChange={e => set('cap', parseInt(e.target.value) || 1)} />
            </div>
          </div>

          {/* ADDRESS with autocomplete + hide toggle */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Full Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--ink2)' }}>
                  {form.addrHidden ? '🔒 Hidden until RSVP confirmed' : '👁 Visible to all guests'}
                </span>
                <div
                  onClick={() => set('addrHidden', !form.addrHidden)}
                  style={{
                    width: 36, height: 20, borderRadius: 10,
                    background: form.addrHidden ? 'var(--indigo)' : 'var(--border)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    width: 14, height: 14, borderRadius: 7, background: 'white',
                    position: 'absolute', top: 3, left: form.addrHidden ? 19 : 3,
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  }} />
                </div>
              </div>
            </div>
            <AddressAutocomplete
              value={form.addr}
              onChange={val => set('addr', val)}
              onSelect={handleAddressSelect}
            />
            {form.addrHidden && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--ink3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>🔐</span>
                Guests will see only your location name until their RSVP is accepted.
              </div>
            )}
          </div>

          {/* Dress Code */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Dress Code</label>
              <select className="form-select" value={form.dressCode} onChange={e => set('dressCode', e.target.value)}>
                {DRESS_CODES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group" />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <textarea className="form-textarea" value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Tell guests what to expect..." style={{ flex: 1 }} />
              <EmojiTrigger onSelect={em => appendToField('desc', em)} above />
            </div>
          </div>

          {/* INVITATION */}
          <div className="form-group">
            <label className="form-label">Invitation Header</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="form-input" value={form.invH} onChange={e => set('invH', e.target.value)} placeholder="You're Invited!" style={{ flex: 1 }} />
              <EmojiTrigger onSelect={em => appendToField('invH', em)} />
            </div>
          </div>

          {/* INVITATION COLOR — hex picker */}
          <div className="form-group">
            <label className="form-label">Invitation Accent Color</label>
            <ColorPicker value={form.invBg} onChange={val => set('invBg', val)} />
            <div style={{ marginTop: 10, borderRadius: 10, background: form.invBg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>✉️</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,.3)' }}>{form.invH || "You're Invited"}</span>
            </div>
          </div>

          {/* PLAYLIST */}
          <div className="form-group">
            <label className="form-label">🎵 Event Playlist <span style={{ fontWeight: 400, color: 'var(--ink3)', fontSize: 12 }}>(optional)</span></label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {PLAYLIST_PLATFORMS.map(p => (
                <button
                  key={p.key}
                  className={`filter-btn ${form.playlist?.platform === p.key ? 'active' : ''}`}
                  style={{ padding: '5px 12px', fontSize: 12 }}
                  onClick={() => setPlaylist('platform', p.key)}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
            <input
              className="form-input"
              value={form.playlist?.url || ''}
              onChange={e => setPlaylist('url', e.target.value)}
              placeholder={PLAYLIST_PLATFORMS.find(p => p.key === form.playlist?.platform)?.placeholder || 'Paste playlist link...'}
            />
            {form.playlist?.url?.trim() && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>✓</span> Playlist will be shown to guests on the event page
              </div>
            )}
          </div>

          {/* SUPPER CLUB TEMPLATE */}
          {isSupperClub && (
            <div style={{ background: 'linear-gradient(135deg, #1A1A2E08, #2D255008)', borderRadius: 12, padding: 16, border: '1px solid var(--indigo-light)', marginTop: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>🍽️ Supper Club Menu</div>
              <div className="form-group">
                <label className="form-label">Host Note (shown to guests)</label>
                <textarea className="form-textarea" value={scData.hostNote} onChange={e => setScData(d => ({ ...d, hostNote: e.target.value }))} placeholder="Share your inspiration, a personal note, or cooking tips..." style={{ minHeight: 70 }} />
              </div>
              {scData.courses.map((course, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 10, padding: '12px', marginBottom: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--indigo-light)', color: 'var(--indigo)', fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{course.num}</div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>Course {course.num}</span>
                    <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: 14 }} onClick={() => removeCourse(i)}>✕</button>
                  </div>
                  <div className="form-row" style={{ marginBottom: 0 }}>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label">Dish Name</label>
                      <input className="form-input" value={course.name} onChange={e => updateCourse(i, 'name', e.target.value)} placeholder="e.g. Boeuf Bourguignon" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <label className="form-label">Wine Pairing (optional)</label>
                      <input className="form-input" value={course.wine} onChange={e => updateCourse(i, 'wine', e.target.value)} placeholder="e.g. Pinot Noir 2019" />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Description</label>
                    <input className="form-input" value={course.desc} onChange={e => updateCourse(i, 'desc', e.target.value)} placeholder="Short dish description..." />
                  </div>
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={addCourse} style={{ width: '100%', borderStyle: 'dashed' }}>+ Add Course</button>
            </div>
          )}

          {/* POTLUCK TEMPLATE */}
          {isPotluck && (
            <div style={{ background: 'linear-gradient(135deg, var(--amber-light), #FFF9F0)', borderRadius: 12, padding: 16, border: '1px solid #FFD080', marginTop: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#7A5000', marginBottom: 12 }}>🥘 Potluck Items</div>
              {POTLUCK_CATS.map(cat => {
                const catItems = potluckItems.filter(it => it.cat === cat.key);
                return (
                  <div key={cat.key} style={{ marginBottom: 16 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--ink2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cat.label}</div>
                    {catItems.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'white', borderRadius: 8, marginBottom: 4, border: '1px solid var(--border)' }}>
                        <span>{item.emoji}</span>
                        <span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
                        <button style={{ background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: 13 }} onClick={() => removePotluckItem(item.id)}>✕</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <input className="form-input" style={{ flex: 1, padding: '7px 10px', fontSize: 13 }} value={newItemText[cat.key]}
                        onChange={e => setNewItemText(t => ({ ...t, [cat.key]: e.target.value }))}
                        placeholder={cat.placeholder} onKeyDown={e => e.key === 'Enter' && addPotluckItem(cat.key)} />
                      <button className="btn btn-ghost btn-sm" onClick={() => addPotluckItem(cat.key)}>+ Add</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PHOTO GALLERY TOGGLE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--page)', borderRadius: 10, marginTop: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>📸 Photo Gallery</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>Allow guests to upload and share photos after the event</div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: form.galleryEnabled ? 'var(--indigo)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }}
              onClick={() => set('galleryEnabled', !form.galleryEnabled)}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 3, transition: 'left 0.2s', left: form.galleryEnabled ? 23 : 3, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{isEdit ? 'Save Changes' : '🎉 Publish Event'}</button>
        </div>
      </div>
    </div>
  );
}
