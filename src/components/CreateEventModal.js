import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { SEED_IMAGES, GRADIENT_COVERS } from '../data/seed';
import { EmojiTrigger } from './EmojiPicker';

const EVENT_TYPES = ['Dinner Party', 'Potluck', 'Restaurant', 'Supper Club', 'Tasting', 'Brunch', 'Other'];
const EVENT_TYPE_ICONS = { 'Dinner Party': '🍷', 'Potluck': '🥘', 'Restaurant': '🍽️', 'Supper Club': '🕯️', 'Tasting': '🍾', 'Brunch': '🥐', 'Other': '🎉' };
const VISIBILITY = ['Public', 'Friends Only', 'Invite Only'];
const DRESS_CODES = ['No dress code', 'Smart Casual', 'Cocktail Attire', 'Black Tie', 'Themed — see description'];
const POTLUCK_CATS = [
  { key: 'food', label: '🍽️ Food', placeholder: 'e.g. Lasagna, Salad' },
  { key: 'drinks', label: '🥂 Drinks', placeholder: 'e.g. Wine, Cider' },
  { key: 'other', label: '🧺 Other', placeholder: 'e.g. Candles, Napkins' },
];
const PAIRING_OPTIONS = [
  { key: 'wine', label: 'Wine', icon: '🍷' }, { key: 'cocktail', label: 'Cocktail', icon: '🍸' },
  { key: 'beer', label: 'Beer', icon: '🍺' }, { key: 'whiskey', label: 'Whiskey', icon: '🥃' },
  { key: 'brandy', label: 'Brandy', icon: '🫗' }, { key: 'cognac', label: 'Cognac', icon: '🥂' },
  { key: 'other', label: 'Other', icon: '🍶' },
];
const PLAYLIST_PLATFORMS = [
  { key: 'spotify', label: 'Spotify', icon: '🎵', placeholder: 'https://open.spotify.com/playlist/...' },
  { key: 'apple', label: 'Apple Music', icon: '🎶', placeholder: 'https://music.apple.com/playlist/...' },
  { key: 'youtube', label: 'YouTube', icon: '▶️', placeholder: 'https://youtube.com/playlist/...' },
  { key: 'soundcloud', label: 'SoundCloud', icon: '🔊', placeholder: 'https://soundcloud.com/...' },
];
const PRESET_COLORS = ['#6C5DD3','#2EC4B6','#D4AF37','#E94560','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#1A1A2E','#2D2550'];
const DEFAULT_POTLUCK = { items: [
  { id: 'pi-1', cat: 'food', emoji: '🍽️', name: 'Main Dish', claimedBy: null, claimerName: null },
  { id: 'pi-2', cat: 'food', emoji: '🥗', name: 'Salad', claimedBy: null, claimerName: null },
  { id: 'pi-3', cat: 'drinks', emoji: '🍷', name: 'Wine', claimedBy: null, claimerName: null },
  { id: 'pi-4', cat: 'other', emoji: '🧺', name: 'Utensils', claimedBy: null, claimerName: null },
]};
const DEFAULT_SUPPER_CLUB = { hostNote: '', pairing: 'wine', courses: [
  { num: 1, name: '', desc: '', pairing: '' },
  { num: 2, name: '', desc: '', pairing: '' },
  { num: 3, name: '', desc: '', pairing: '' },
  { num: 4, name: '', desc: '', pairing: '' },
  { num: 5, name: '', desc: '', pairing: '' },
]};
const TASTING_OPTIONS = ['Wine','Champagne','Cognac','Whiskey','Cocktails','Mocktails','Beer & Cider','Sake','Tequila'];

const ANIMATION_CSS = `
@keyframes em-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}
@keyframes em-sway{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
@keyframes em-bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-9px)}70%{transform:translateY(-4px)}}
@keyframes em-wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-8deg) scale(1.1)}75%{transform:rotate(8deg) scale(1.1)}}
@keyframes em-float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.05)}}
@keyframes em-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
@keyframes em-pop{0%,100%{transform:scale(1)}30%{transform:scale(1.3)}60%{transform:scale(.95)}}
@keyframes em-sparkle{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.25) rotate(30deg)}}
.em-pulse{animation:em-pulse 1.8s ease-in-out infinite}
.em-sway{animation:em-sway 1.5s ease-in-out infinite}
.em-bounce{animation:em-bounce 1.3s ease infinite}
.em-wobble{animation:em-wobble 1.2s ease-in-out infinite}
.em-float{animation:em-float 2.2s ease-in-out infinite}
.em-spin{animation:em-spin 4s linear infinite}
.em-pop{animation:em-pop 1.6s ease infinite}
.em-sparkle{animation:em-sparkle 1.4s ease-in-out infinite}
`;
const EMOJI_ANIM_MAP = {
  '🍷':'pulse','🌿':'sway','🕯️':'bounce','🍜':'wobble','🥂':'float',
  '🌸':'sway','🍳':'spin','🎶':'sway','🫕':'wobble','🥘':'pulse',
  '🍾':'bounce','🧆':'pop','🥩':'float','✨':'sparkle','🍋':'spin',
  '🌶️':'wobble','🫙':'float','🍄':'bounce','🫐':'pop','🍯':'pulse',
  '🫒':'sway','🧇':'float','🎉':'sparkle','🌙':'float',
};
function newId() { return 'pi-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7); }

function ButtonGroup({ options, value, onChange, icons, cols }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + (cols || 4) + ', 1fr)', gap: 6 }}>
      {options.map(opt => {
        const isActive = value === opt;
        return (
          <button key={opt} onClick={() => onChange(opt)} style={{
            padding: '8px 6px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
            border: '1.5px solid ' + (isActive ? 'var(--indigo)' : 'var(--border)'),
            background: isActive ? 'var(--indigo-light)' : 'var(--surface)',
            color: isActive ? 'var(--indigo)' : 'var(--ink2)', fontWeight: isActive ? 700 : 500,
            fontSize: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, lineHeight: 1.3, textAlign: 'center',
          }}>
            {icons && <span style={{ fontSize: 16 }}>{icons[opt]}</span>}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function StyledSelect({ value, onChange, options, style }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      <select className="form-select" value={value} onChange={e => onChange(e.target.value)}
        style={{ width: '100%', appearance: 'none', WebkitAppearance: 'none', paddingRight: 42, cursor: 'pointer' }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', borderLeft: '1px solid var(--border)' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="var(--ink3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
    </div>
  );
}

function AddressAutocomplete({ value, onChange, onSelect }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);
  useEffect(() => {
    function handleClick(e) { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function calcPos() {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }

  function handleInput(e) {
    const val = e.target.value;
    setQuery(val); onChange(val); calcPos();
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setResults([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch('https://nominatim.openstreetmap.org/search?' + new URLSearchParams({ q: val, format: 'json', limit: 5, addressdetails: 1 }), { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();
        setResults(data);
        if (data.length > 0) { calcPos(); setOpen(true); }
      } catch { setResults([]); }
      setLoading(false);
    }, 400);
  }

  function handleSelect(item) {
    setQuery(item.display_name); onChange(item.display_name); onSelect && onSelect(item);
    setResults([]); setOpen(false);
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'relative' }}>
        <input ref={inputRef} className="form-input" value={query} onChange={handleInput}
          onFocus={() => { if (results.length > 0) { calcPos(); setOpen(true); } }}
          placeholder="Start typing an address..." autoComplete="off" />
        {loading && <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: 'var(--ink3)' }}>⏳</div>}
      </div>
      {open && results.length > 0 && (
        <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 99999, backgroundColor: '#ffffff', border: '1px solid #d0d0d0', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.20)', overflow: 'hidden', maxHeight: 260, overflowY: 'auto' }}>
          {results.map((item, i) => (
            <div key={i} onMouseDown={() => handleSelect(item)}
              style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: '#1a1a2e', backgroundColor: '#ffffff', borderBottom: i < results.length - 1 ? '1px solid #f0f0f0' : 'none', display: 'flex', gap: 8, alignItems: 'flex-start', lineHeight: 1.4 }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ede8ff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>📍</span>
              <span>{item.display_name}</span>
            </div>
          ))}
          <div style={{ padding: '6px 14px', fontSize: 10, color: '#999', backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0' }}>Address data © OpenStreetMap contributors</div>
        </div>
      )}
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  const [showCustom, setShowCustom] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {PRESET_COLORS.map(c => (
          <div key={c} onClick={() => onChange(c)} title={c}
            style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', background: c, border: value === c ? '3px solid var(--indigo)' : '2px solid transparent', outline: value === c ? '2px solid white' : 'none', outlineOffset: -4, transition: 'transform 0.1s', boxShadow: '0 1px 4px rgba(0,0,0,.15)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
        ))}
        <div onClick={() => setShowCustom(s => !s)} title="Custom color"
          style={{ width: 28, height: 28, borderRadius: 6, cursor: 'pointer', background: PRESET_COLORS.includes(value) ? 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)' : value, border: !PRESET_COLORS.includes(value) ? '3px solid var(--indigo)' : '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
          {PRESET_COLORS.includes(value) ? '+' : ''}
        </div>
      </div>
      {showCustom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
          <input type="color" value={value} onChange={e => onChange(e.target.value)} style={{ width: 40, height: 32, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }} />
          <input className="form-input" value={value} onChange={e => { const v = e.target.value; if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v); }} placeholder="#6C5DD3" style={{ width: 110, fontFamily: 'monospace', fontSize: 13 }} />
          <div style={{ width: 32, height: 32, borderRadius: 6, background: value, border: '1px solid var(--border)', flexShrink: 0 }} />
        </div>
      )}
    </div>
  );
}

function CrowdCheckSection({ dates, onChange }) {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('19:00');
  function addDate() {
    if (!newDate.trim()) return;
    const entry = { date: newDate, time: newTime };
    if (dates.some(x => x.date === newDate && x.time === newTime)) return;
    onChange([...dates, entry]);
    setNewDate(''); setNewTime('19:00');
  }
  function removeDate(i) { onChange(dates.filter((_, idx) => idx !== i)); }
  const fmtD = (d) => { try { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); } catch { return d; } };
  const fmtT = (t) => { try { const [h, m] = t.split(':'); const hr = parseInt(h); return (hr > 12 ? hr - 12 : hr || 12) + ':' + m + ' ' + (hr >= 12 ? 'PM' : 'AM'); } catch { return t; } };
  return (
    <div style={{ background: 'linear-gradient(135deg, #f0f4ff, #f8f0ff)', borderRadius: 12, padding: 16, border: '1px solid var(--indigo-light)', marginTop: 4 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>📅 When works for everyone?</div>
      <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 12, lineHeight: 1.5 }}>Add date and time options — guests vote on what works best.</div>
      {dates.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {dates.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--indigo-light)', border: '1.5px solid var(--indigo-mid)', borderRadius: 10, padding: '7px 12px' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--indigo)', flex: 1 }}>{fmtD(d.date)} · {fmtT(d.time)}</span>
              <button onClick={() => removeDate(i)} style={{ background: 'none', border: 'none', color: 'var(--indigo)', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input className="form-input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ flex: '1 1 140px', minWidth: 130 }} />
        <input className="form-input" type="time" value={newTime} onChange={e => setNewTime(e.target.value)} style={{ flex: '1 1 110px', minWidth: 100 }} />
        <button className="btn btn-ghost btn-sm" onClick={addDate} style={{ flexShrink: 0 }}>+ Add</button>
      </div>
      {dates.length === 0 && <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 8 }}>Add at least 2 options for a useful poll.</div>}
    </div>
  );
}

export default function CreateEventModal({ event, onClose }) {
  const { createEvent, updateEvent, addToast, user } = useApp();
  const isEdit = !!event;
  const [form, setForm] = useState({
    title: event?.title || '', type: event?.type || 'Dinner Party',
    date: event?.date || '', time: event?.time || '19:00',
    loc: event?.loc || '', addr: event?.addr || '', addrHidden: event?.addrHidden ?? true,
    cap: event?.cap || 10, vis: event?.vis || 'Invite Only',
    desc: event?.desc || '', dressCode: event?.dressCode || 'No dress code',
    invH: event?.invH || "You're Invited", invBg: event?.invBg || '#6C5DD3',
    galleryEnabled: event?.galleryEnabled ?? true,
    seriesName: event?.seriesName || '', seriesVolume: event?.seriesVolume || 1,
    playlistLinks: event?.playlist_links || PLAYLIST_PLATFORMS.map(p => ({
      platform: p.key,
      enabled: event?.playlist?.platform === p.key && !!event?.playlist?.url,
      url: event?.playlist?.platform === p.key ? (event?.playlist?.url || '') : '',
    })),
    crowdCheckDates: event?.crowdCheckDates || [], useCrowdCheck: event?.useCrowdCheck ?? false,
    isPaid: !!event?.price,
    price: event?.price || '',
    paymentMethods: event?.payment_methods || [
      { type: 'venmo', enabled: false, handle: user?.venmo_handle || '' },
      { type: 'zelle', enabled: false, contact: user?.zelle_contact || '' },
      { type: 'cash',  enabled: false },
    ],
    paymentNotes: event?.payment_notes || '',
    // Step 3 (Serve) form-state-only fields — not persisted to DB yet.
    menuCourses: event?.menuCourses || [
      { course: 'starter', name: '', desc: '' },
      { course: 'main', name: '', desc: '' },
      { course: 'dessert', name: '', desc: '' },
    ],
    dietaryNotes: event?.dietaryNotes || '',
    hostNote: event?.hostNote || '',
    otherNotes: event?.otherNotes || '',
    notificationPrefs: event?.notification_prefs || { rsvpApproved: true, reminder24h: true, morningOf: false },
  });
  const [cover, setCover] = useState(event?.cover || { type: 'gradient', value: GRADIENT_COVERS[0].value });
  const [coverTab, setCoverTab] = useState(event?.cover?.type === 'image' ? 'image' : event?.cover?.type === 'emoji' ? 'emoji' : 'gradient');
  const [customHex, setCustomHex] = useState('');
  const [potluckItems, setPotluckItems] = useState(event?.potluck?.items || DEFAULT_POTLUCK.items);
  const [scData, setScData] = useState(event?.supperClub || DEFAULT_SUPPER_CLUB);
  const [newItemText, setNewItemText] = useState({ food: '', drinks: '', other: '' });
  const newItemEmoji = { food: '🍽️', drinks: '🥂', other: '🧺' };
  const isPotluck = form.type === 'Potluck';
  const isSupperClub = form.type === 'Supper Club';
  const isTasting = form.type === 'Tasting';
  const skipsServe = form.type === 'Restaurant' || form.type === 'Brunch';
  const [step, setStep] = React.useState(1);
  const [tastingItems, setTastingItems] = React.useState(event?.tasting?.items || []);
  const [selectedFriends, setSelectedFriends] = React.useState([]);
  const [emailInvites, setEmailInvites] = React.useState([]);
  const [newEmail, setNewEmail] = React.useState('');
  const [friendSearch, setFriendSearch] = React.useState('');
  const { friends } = useApp();
  const availableFriends = (friends || []).filter(f => f && f.name && f.status === 'accepted');
  const filteredFriends = friendSearch ? availableFriends.filter(f => f.name.toLowerCase().includes(friendSearch.toLowerCase())) : availableFriends;
  function toggleFriend(uid) { setSelectedFriends(prev => prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]); }
  function addEmail() {
    if (!newEmail || !newEmail.includes('@')) { addToast('Please enter a valid email', 'error'); return; }
    if (emailInvites.includes(newEmail)) { addToast('Already added', 'error'); return; }
    setEmailInvites(prev => [...prev, newEmail]); setNewEmail('');
  }
  function toggleTasting(item) { setTastingItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]); }
  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }
  function appendToField(field, emoji) { setForm(f => ({ ...f, [field]: (f[field] || '') + emoji })); }
  function togglePlaylistLink(platform) {
    setForm(f => ({ ...f, playlistLinks: f.playlistLinks.map(p => p.platform === platform ? { ...p, enabled: !p.enabled } : p) }));
  }
  function setPlaylistLinkUrl(platform, url) {
    setForm(f => ({ ...f, playlistLinks: f.playlistLinks.map(p => p.platform === platform ? { ...p, url } : p) }));
  }
  function togglePaymentMethod(type) {
    setForm(f => ({
      ...f,
      paymentMethods: f.paymentMethods.map(m => m.type === type ? { ...m, enabled: !m.enabled } : m),
    }));
  }
  function setPaymentMethod(type, key, val) {
    setForm(f => ({
      ...f,
      paymentMethods: f.paymentMethods.map(m => m.type === type ? { ...m, [key]: val } : m),
    }));
  }
  function updateMenuCourse(i, key, val) {
    setForm(f => ({
      ...f,
      menuCourses: f.menuCourses.map((c, j) => j === i ? { ...c, [key]: val } : c),
    }));
  }
  function setNotifPref(key, val) {
    setForm(f => ({ ...f, notificationPrefs: { ...f.notificationPrefs, [key]: val } }));
  }
  function handleAddressSelect(item) {
    const addr = item.address || {};
    const nb = addr.neighbourhood || addr.suburb || addr.quarter || '';
    const city = addr.city || addr.town || addr.village || '';
    if (!form.loc && (nb || city)) set('loc', [nb, city].filter(Boolean).join(', '));
  }
  function buildPayload() {
    const enabledPlaylists = form.playlistLinks
      .filter(p => p.enabled && p.url?.trim())
      .map(p => ({ platform: p.platform, url: p.url.trim() }));
    return {
      ...form,
      cover,
      potluck: isPotluck ? { items: potluckItems } : null,
      supperClub: isSupperClub ? scData : null,
      tasting: isTasting ? { items: tastingItems } : null,
      playlist_links: enabledPlaylists,
      playlist: enabledPlaylists[0] || null,
      price: form.isPaid ? parseFloat(form.price) : null,
      payment_methods: form.isPaid ? form.paymentMethods.filter(m => m.enabled) : null,
      payment_notes: form.isPaid ? form.paymentNotes : null,
      notification_prefs: form.notificationPrefs,
      invites: [
        ...selectedFriends.map(uid => { const f = (friends||[]).find(f=>f.userId===uid); return {userId:uid,name:f?.name||'Friend'}; }),
        ...emailInvites.map(e=>({email:e,name:e.split('@')[0]})),
      ],
    };
  }
  function handleSubmit() {
    // TODO: invite gate — skip if user.is_founding_member === true
    if (!form.title.trim()) { addToast('Event title is required', 'error'); return; }
    if (!form.useCrowdCheck && !form.date) { addToast('Please set a date', 'error'); return; }
    const payload = buildPayload();
    if (isEdit) { updateEvent(event.id, payload); addToast('Event updated ✓', 'success'); }
    else { createEvent(payload); addToast('Event created! 🎉', 'success'); }
    onClose();
  }
  function handleSaveDraft() {
    if (!form.title.trim()) { addToast('Event title is required', 'error'); return; }
    const payload = { ...buildPayload(), status: 'draft' };
    if (isEdit) { updateEvent(event.id, payload); addToast('Draft saved ✓', 'success'); }
    else { createEvent(payload); addToast('Draft saved ✓', 'success'); }
    onClose();
  }
  function addPotluckItem(cat) {
    const text = newItemText[cat]?.trim();
    if (!text) return;
    setPotluckItems(items => [...items, { id: newId(), cat, emoji: newItemEmoji[cat], name: text, claimedBy: null, claimerName: null }]);
    setNewItemText(t => ({ ...t, [cat]: '' }));
  }
  function removePotluckItem(id) { setPotluckItems(items => items.filter(it => it.id !== id)); }
  function updateCourse(i, key, val) { setScData(d => ({ ...d, courses: d.courses.map((c, j) => j === i ? { ...c, [key]: val } : c) })); }
  function addCourse() { setScData(d => ({ ...d, courses: [...d.courses, { num: d.courses.length + 1, name: '', desc: '', pairing: '' }] })); }
  function removeCourse(i) { setScData(d => ({ ...d, courses: d.courses.filter((_, j) => j !== i).map((c, j) => ({ ...c, num: j + 1 })) })); }
  const pairingLabel = PAIRING_OPTIONS.find(p => p.key === scData.pairing)?.label || 'Wine';
  const pairingIcon = PAIRING_OPTIONS.find(p => p.key === scData.pairing)?.icon || '🍷';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ maxWidth: 660 }}>
        <div className="modal-head"><h2>{isEdit ? 'Edit Event' : 'Create Event'}</h2><button className="modal-x" onClick={onClose}>✕</button></div>
        <style>{ANIMATION_CSS}</style>
        {/* Step indicator */}
        <div style={{ display: 'flex', padding: '12px 24px', borderBottom: '1px solid var(--border)', gap: 0 }}>
          {[{s:1,label:'Gather'},{s:2,label:'Style'},{s:3,label:'Serve'},{s:4,label:'Settle'}].map(({s,label},i) => {
            const active = step === s; const done = step > s;
            const skipped = s === 3 && skipsServe;
            return (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, opacity: skipped ? 0.5 : 1 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, background: done ? 'var(--teal)' : active ? 'var(--indigo)' : 'var(--border)', color: (done||active) ? 'white' : 'var(--ink3)' }}>{done ? '✓' : s}</div>
                  <span style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? 'var(--ink)' : 'var(--ink3)', whiteSpace: 'nowrap', textDecoration: skipped ? 'line-through' : 'none' }}>{skipped ? `${label} (skipped)` : label}</span>
                </div>
                {i < 3 && <div style={{ flex: '0 0 20px', height: 2, background: step > s ? 'var(--teal)' : 'var(--border)', alignSelf: 'center', margin: '0 2px', borderRadius: 2 }} />}
              </React.Fragment>
            );
          })}
        </div>
        <div className="modal-body">
        {step === 1 && <>
          <div className="form-group">
            <label className="form-label">Event Title</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. An Evening of Provençal Cuisine" style={{ flex: 1 }} />
              <EmojiTrigger onSelect={em => appendToField('title', em)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <ButtonGroup options={EVENT_TYPES} value={form.type} onChange={val => set('type', val)} icons={EVENT_TYPE_ICONS} cols={4} />
          </div>
          <div className="form-group">
            <label className="form-label">Visibility</label>
            <StyledSelect value={form.vis} onChange={val => set('vis', val)} options={VISIBILITY} />
          </div>
          {isSupperClub && (
            <div className="form-row">
              <div className="form-group"><label className="form-label">Series Name</label><input className="form-input" value={form.seriesName} onChange={e => set('seriesName', e.target.value)} placeholder="e.g. Terroir Supper Club" /></div>
              <div className="form-group"><label className="form-label">Volume #</label><input className="form-input" type="number" min={1} value={form.seriesVolume} onChange={e => set('seriesVolume', parseInt(e.target.value) || 1)} /></div>
            </div>
          )}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Date & Time</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{form.useCrowdCheck ? '📅 Poll guests' : '📅 Set a Date / Time'}</span>
                <div onClick={() => set('useCrowdCheck', !form.useCrowdCheck)} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, background: form.useCrowdCheck ? 'var(--indigo)' : 'var(--border)', position: 'relative' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: 'white', position: 'absolute', top: 3, transition: 'left 0.2s', left: form.useCrowdCheck ? 19 : 3, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                </div>
              </div>
            </div>
            {form.useCrowdCheck ? (
              <CrowdCheckSection dates={form.crowdCheckDates} onChange={dates => set('crowdCheckDates', dates)} />
            ) : (
              <div className="form-row" style={{ marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}><input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
                <div className="form-group" style={{ marginBottom: 0 }}><input className="form-input" type="time" value={form.time} onChange={e => set('time', e.target.value)} /></div>
              </div>
            )}
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Location Name</label><input className="form-input" value={form.loc} onChange={e => set('loc', e.target.value)} placeholder="Venue or neighborhood" /></div>
            <div className="form-group"><label className="form-label">Capacity</label><input className="form-input" type="number" min={1} max={200} value={form.cap} onChange={e => set('cap', parseInt(e.target.value) || 1)} /></div>
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label className="form-label" style={{ margin: 0 }}>Full Address</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--ink2)' }}>{form.addrHidden ? '🔒 Hidden until RSVP confirmed' : '👁 Visible to all guests'}</span>
                <div onClick={() => set('addrHidden', !form.addrHidden)} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, position: 'relative', background: form.addrHidden ? 'var(--indigo)' : 'var(--border)' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: 'white', position: 'absolute', top: 3, transition: 'left 0.2s', left: form.addrHidden ? 19 : 3, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                </div>
              </div>
            </div>
            <AddressAutocomplete value={form.addr} onChange={val => set('addr', val)} onSelect={handleAddressSelect} />
            {form.addrHidden && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--ink3)', display: 'flex', alignItems: 'center', gap: 5 }}>🔐 Guests see only your location name until their RSVP is accepted.</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <textarea className="form-textarea" value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="Tell guests what to expect..." style={{ flex: 1 }} />
              <EmojiTrigger onSelect={em => appendToField('desc', em)} above />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--page)', borderRadius: 10, marginTop: 8 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>📸 Photo Gallery</div>
              <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 2 }}>Allow guests to upload and share photos after the event</div>
            </div>
            <div style={{ width: 44, height: 24, borderRadius: 12, background: form.galleryEnabled ? 'var(--indigo)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => set('galleryEnabled', !form.galleryEnabled)}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: 'white', position: 'absolute', top: 3, transition: 'left 0.2s', left: form.galleryEnabled ? 23 : 3, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </div>
          </div>
          <div style={{ background: 'var(--page)', borderRadius: 10, padding: '14px 16px', marginTop: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 4 }}>🔔 Guest notifications</div>
            <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 12 }}>Automatically notify guests:</div>
            {[
              { key: 'rsvpApproved', label: 'RSVP approved', sub: 'Guest gets a confirmation when you approve them' },
              { key: 'reminder24h', label: '24-hour reminder', sub: 'Reminder email the day before the event' },
              { key: 'morningOf', label: 'Morning-of reminder', sub: 'Day-of reminder email for confirmed guests' },
            ].map(({ key, label, sub }, i, arr) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: i === 0 ? 0 : 10, paddingBottom: i === arr.length - 1 ? 0 : 10, borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--ink)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{sub}</div>
                </div>
                <div onClick={() => setNotifPref(key, !form.notificationPrefs[key])} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, background: form.notificationPrefs[key] ? 'var(--indigo)' : 'var(--border)', position: 'relative' }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: 'white', position: 'absolute', top: 3, transition: 'left 0.2s', left: form.notificationPrefs[key] ? 19 : 3, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                </div>
              </div>
            ))}
          </div>
        </>}

        {/* ── STEP 2: INVITES ── */}
        {step === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">Cover</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                {['gradient','emoji','image'].map(t => (
                  <button key={t} className={'filter-btn ' + (coverTab === t ? 'active' : '')} style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setCoverTab(t)}>
                    {t === 'gradient' ? '🎨 Gradient' : t === 'emoji' ? '✨ Emoji' : '📷 Photo'}
                  </button>
                ))}
              </div>
              {coverTab === 'gradient' && (
                <div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                    {GRADIENT_COVERS.filter(g => g.label && g.value && g.value.startsWith('linear-gradient')).map(g => (
                      <div key={g.label} title={g.label} onClick={() => { setCover({ type: 'gradient', value: g.value }); setCustomHex(''); }}
                        style={{ width: 44, height: 44, borderRadius: 10, cursor: 'pointer', background: g.value, border: cover.value === g.value && !customHex ? '3px solid var(--indigo)' : '3px solid transparent', flexShrink: 0 }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: customHex ? 'linear-gradient(135deg, #111, ' + customHex + ')' : 'conic-gradient(red,yellow,lime,cyan,blue,magenta,red)', border: customHex ? '3px solid var(--indigo)' : '2px solid var(--border)', flexShrink: 0 }} />
                    <input className="form-input" value={customHex} onChange={e => { const v = e.target.value; setCustomHex(v); if (/^#[0-9A-Fa-f]{6}$/.test(v)) setCover({ type: 'gradient', value: 'linear-gradient(135deg, #111, ' + v + ')' }); }} placeholder="Custom hex e.g. #FF6B6B" style={{ flex: 1, fontFamily: 'monospace', fontSize: 13 }} maxLength={7} />
                  </div>
                </div>
              )}
              {coverTab === 'emoji' && (
                <div>
                  <div style={{ marginBottom: 8, fontSize: 13, color: 'var(--ink2)' }}>Pick a background color, then an animated icon:</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
                    {GRADIENT_COVERS.map(g => (
                      <div key={g.label} onClick={() => setCover(c => ({ ...c, type: 'emoji', bg: g.value }))}
                        style={{ width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', background: g.value, border: cover.bg === g.value ? '3px solid var(--indigo)' : '2px solid transparent', flexShrink: 0 }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {Object.keys(EMOJI_ANIM_MAP).map(em => {
                      const anim = EMOJI_ANIM_MAP[em];
                      const isSelected = cover.emoji === em;
                      return (
                        <button key={em} onClick={() => setCover(c => ({ ...c, type: 'emoji', emoji: em, bg: c.bg || '#1A1A2E' }))}
                          style={{ width: 44, height: 44, borderRadius: 10, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--page)', border: isSelected ? '2.5px solid var(--indigo)' : '1px solid var(--border)' }}>
                          <span className={isSelected ? 'em-' + anim : ''} style={{ display: 'inline-block' }}>{em}</span>
                        </button>
                      );
                    })}
                  </div>
                  {cover.emoji && (
                    <div style={{ width: 80, height: 80, borderRadius: 12, background: cover.bg || '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                      <span className={'em-' + (EMOJI_ANIM_MAP[cover.emoji] || 'pulse')} style={{ display: 'inline-block' }}>{cover.emoji}</span>
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
            <div className="form-row">
              <div className="form-group"><label className="form-label">Dress Code</label><StyledSelect value={form.dressCode} onChange={val => set('dressCode', val)} options={DRESS_CODES} /></div>
              <div className="form-group" />
            </div>
            <div className="form-group">
              <label className="form-label">Invitation Header</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="form-input" value={form.invH} onChange={e => set('invH', e.target.value)} placeholder="You're Invited!" style={{ flex: 1 }} />
                <EmojiTrigger onSelect={em => appendToField('invH', em)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Invitation Accent Color</label>
              <ColorPicker value={form.invBg} onChange={val => set('invBg', val)} />
              <div style={{ marginTop: 10, borderRadius: 10, background: form.invBg, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>✉️</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,.3)' }}>{form.invH || "You're Invited"}</span>
              </div>
            </div>
            <div style={{ background: 'var(--page)', borderRadius: 10, padding: '14px 16px', marginTop: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>🎵 Event Playlist</div>
              {PLAYLIST_PLATFORMS.map((p, i, arr) => {
                const link = form.playlistLinks.find(l => l.platform === p.key) || { enabled: false, url: '' };
                return (
                  <div key={p.key} style={{ paddingTop: i === 0 ? 0 : 10, paddingBottom: i === arr.length - 1 ? 0 : 10, borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: 13, color: 'var(--ink)' }}>{p.icon} {p.label}</div>
                      <div onClick={() => togglePlaylistLink(p.key)} style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, background: link.enabled ? 'var(--indigo)' : 'var(--border)', position: 'relative' }}>
                        <div style={{ width: 14, height: 14, borderRadius: 7, background: 'white', position: 'absolute', top: 3, transition: 'left 0.2s', left: link.enabled ? 19 : 3, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                      </div>
                    </div>
                    {link.enabled && (
                      <div style={{ marginTop: 8 }}>
                        <input className="form-input" value={link.url} onChange={e => setPlaylistLinkUrl(p.key, e.target.value)} placeholder={p.placeholder} />
                        {link.url?.trim() && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 5 }}>✓ Shown to guests</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="form-group">
              <label className="form-label">Personal Message <span style={{ fontWeight: 400, color: 'var(--ink3)', fontSize: 12 }}>(Optional)</span></label>
              <textarea className="form-textarea" value={form.personalMessage || ''} onChange={e => set('personalMessage', e.target.value)} placeholder="Looking forward to seeing you! 🍷" style={{ minHeight: 70 }} />
            </div>
            {availableFriends.length > 0 && (
              <div className="form-group">
                <label className="form-label">Invite Friends <span style={{ fontWeight: 400, color: 'var(--ink3)', fontSize: 12 }}>(Optional)</span></label>
                <input className="form-input" value={friendSearch} onChange={e => setFriendSearch(e.target.value)} placeholder="🔍 Search friends..." style={{ marginBottom: 10 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: 220, overflowY: 'auto' }}>
                  {filteredFriends.map(f => (
                    <label key={f.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: selectedFriends.includes(f.userId) ? '2px solid var(--indigo)' : '1px solid var(--border)', borderRadius: 12, cursor: 'pointer', background: selectedFriends.includes(f.userId) ? 'var(--indigo-light)' : 'var(--surface)', minHeight: 52 }} onClick={() => toggleFriend(f.userId)}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--indigo)', fontSize: 13, flexShrink: 0 }}>{f.initials || f.name?.[0]}</div>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 500, fontSize: 14 }}>{f.name}</div><div style={{ fontSize: 12, color: 'var(--ink3)' }}>{f.handle || ''}</div></div>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: selectedFriends.includes(f.userId) ? 'var(--indigo)' : 'transparent', border: '2px solid ' + (selectedFriends.includes(f.userId) ? 'var(--indigo)' : 'var(--border)'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, flexShrink: 0 }}>{selectedFriends.includes(f.userId) ? '✓' : ''}</div>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Invite by Email</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input className="form-input" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEmail()} placeholder="friend@email.com" style={{ flex: 1 }} />
                <button className="btn btn-ghost btn-sm" onClick={addEmail} style={{ flexShrink: 0 }}>+ Add</button>
              </div>
              {emailInvites.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {emailInvites.map(em => (
                    <span key={em} style={{ padding: '6px 11px', background: 'var(--indigo-light)', border: '1px solid var(--indigo)', borderRadius: 20, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                      {em}<button onClick={() => setEmailInvites(prev => prev.filter(e => e !== em))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: 'var(--indigo)', padding: 0 }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: SERVE — food details by event type ── */}
        {step === 3 && (
          <div>
            {skipsServe && (
              <div style={{ padding: 24, textAlign: 'center', background: 'var(--page)', borderRadius: 12, color: 'var(--ink2)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{form.type === 'Brunch' ? '🥐' : '🍽️'}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--ink)' }}>No food details needed</div>
                <div style={{ fontSize: 13 }}>For {form.type} events, the food is handled at the venue. Tap Next to settle pricing.</div>
              </div>
            )}

            {form.type === 'Dinner Party' && (
              <div style={{ background: 'linear-gradient(135deg, #1A1A2E08, #2D255008)', borderRadius: 12, padding: 16, border: '1px solid var(--indigo-light)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>🍽️ Menu</div>
                {form.menuCourses.map((c, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 10, padding: 12, marginBottom: 8, border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', marginBottom: 8, textTransform: 'capitalize' }}>{c.course}</div>
                    <div className="form-group" style={{ marginBottom: 8 }}>
                      <input className="form-input" value={c.name} onChange={e => updateMenuCourse(i, 'name', e.target.value)} placeholder="Dish name" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <input className="form-input" value={c.desc} onChange={e => updateMenuCourse(i, 'desc', e.target.value)} placeholder="Brief description" />
                    </div>
                  </div>
                ))}
                <div className="form-group" style={{ marginTop: 12 }}>
                  <label className="form-label">Dietary notes <span style={{ fontWeight: 400, color: 'var(--ink3)', fontSize: 12 }}>(optional)</span></label>
                  <textarea className="form-textarea" value={form.dietaryNotes} onChange={e => set('dietaryNotes', e.target.value)} placeholder="Any allergies or dietary restrictions to flag for guests..." style={{ minHeight: 70 }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Host note <span style={{ fontWeight: 400, color: 'var(--ink3)', fontSize: 12 }}>(shown to guests, optional)</span></label>
                  <textarea className="form-textarea" value={form.hostNote} onChange={e => set('hostNote', e.target.value)} placeholder="Share what inspired this menu..." style={{ minHeight: 70 }} />
                </div>
              </div>
            )}

            {isSupperClub && (
              <div style={{ background: 'linear-gradient(135deg, #1A1A2E08, #2D255008)', borderRadius: 12, padding: 16, border: '1px solid var(--indigo-light)', marginTop: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>🍽️ Supper Club Menu</div>
                <div className="form-group">
                  <label className="form-label">Host Note (shown to guests)</label>
                  <textarea className="form-textarea" value={scData.hostNote} onChange={e => setScData(d => ({ ...d, hostNote: e.target.value }))} placeholder="Share your inspiration..." style={{ minHeight: 70 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pairing Style</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {PAIRING_OPTIONS.map(p => (
                      <button key={p.key} onClick={() => setScData(d => ({ ...d, pairing: p.key }))} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1.5px solid ' + (scData.pairing === p.key ? 'var(--indigo)' : 'var(--border)'), background: scData.pairing === p.key ? 'var(--indigo-light)' : 'var(--surface)', color: scData.pairing === p.key ? 'var(--indigo)' : 'var(--ink2)', fontWeight: scData.pairing === p.key ? 700 : 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {p.icon} {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                {scData.courses.map((course, i) => (
                  <div key={i} style={{ background: 'white', borderRadius: 10, padding: '12px', marginBottom: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--indigo-light)', color: 'var(--indigo)', fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{course.num}</div>
                      <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)' }}>Course {course.num}</span>
                      <button style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--coral)', cursor: 'pointer', fontSize: 14 }} onClick={() => removeCourse(i)}>✕</button>
                    </div>
                    <div className="form-row" style={{ marginBottom: 0 }}>
                      <div className="form-group" style={{ marginBottom: 8 }}><label className="form-label">Dish Name</label><input className="form-input" value={course.name} onChange={e => updateCourse(i, 'name', e.target.value)} placeholder="e.g. Boeuf Bourguignon" /></div>
                      <div className="form-group" style={{ marginBottom: 8 }}><label className="form-label">{pairingIcon} {pairingLabel} Pairing <span style={{ fontWeight: 400, fontSize: 11, color: 'var(--ink3)' }}>(optional)</span></label><input className="form-input" value={course.pairing || course.wine || ''} onChange={e => updateCourse(i, 'pairing', e.target.value)} placeholder={pairingLabel === 'Wine' ? 'e.g. Pinot Noir 2019' : pairingLabel + ' pairing...'} /></div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Description</label><input className="form-input" value={course.desc} onChange={e => updateCourse(i, 'desc', e.target.value)} placeholder="Short dish description..." /></div>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm" onClick={addCourse} style={{ width: '100%', borderStyle: 'dashed' }}>+ Add Course</button>
              </div>
            )}

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
                          <span>{item.emoji}</span><span style={{ flex: 1, fontSize: 13 }}>{item.name}</span>
                          <button style={{ background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: 13 }} onClick={() => removePotluckItem(item.id)}>✕</button>
                        </div>
                      ))}
                      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                        <input className="form-input" style={{ flex: 1, padding: '7px 10px', fontSize: 13 }} value={newItemText[cat.key]} onChange={e => setNewItemText(t => ({ ...t, [cat.key]: e.target.value }))} placeholder={cat.placeholder} onKeyDown={e => e.key === 'Enter' && addPotluckItem(cat.key)} />
                        <button className="btn btn-ghost btn-sm" onClick={() => addPotluckItem(cat.key)}>+ Add</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {isTasting && (
              <div style={{ background: 'var(--page)', border: '1px solid var(--indigo-light)', borderRadius: 12, padding: 16, marginTop: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 10 }}>🍾 What are we tasting?</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {TASTING_OPTIONS.map(item => (
                    <button key={item} onClick={() => toggleTasting(item)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: tastingItems.includes(item) ? '1.5px solid var(--indigo)' : '1px solid var(--border)', background: tastingItems.includes(item) ? 'var(--indigo-light)' : 'transparent', color: tastingItems.includes(item) ? 'var(--indigo)' : 'var(--ink2)', fontWeight: tastingItems.includes(item) ? 600 : 400, minHeight: 36 }}>{item}</button>
                  ))}
                </div>
              </div>
            )}

            {form.type === 'Other' && (
              <div className="form-group">
                <label className="form-label">Notes <span style={{ fontWeight: 400, color: 'var(--ink3)', fontSize: 12 }}>(optional)</span></label>
                <textarea className="form-textarea" value={form.otherNotes} onChange={e => set('otherNotes', e.target.value)} placeholder="Anything you want guests to know about food..." style={{ minHeight: 70 }} />
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: SETTLE — pricing + payment methods ── */}
        {step === 4 && (
          <div>
            {/* Review summary (moved from former step 3) */}
            <div style={{ background: 'var(--page)', padding: 18, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{form.title}</div>
              <div style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>
                {form.date && <div>📅 {form.date} at {form.time}</div>}
                {form.useCrowdCheck && <div>📅 Letting guests vote on date</div>}
                {form.loc && <div>📍 {form.loc}</div>}
                <div>🎉 {form.type}</div>
                {form.dressCode && form.dressCode !== 'No dress code' && <div>👔 {form.dressCode}</div>}
                <div>{form.vis === 'Public' ? '🌍 Public' : form.vis === 'Friends Only' ? '👥 Friends Only' : '🔒 Invite Only'}</div>
                <div>👥 Max {form.cap} guests</div>
              </div>
            </div>
            {(selectedFriends.length > 0 || emailInvites.length > 0) && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Inviting {selectedFriends.length + emailInvites.length} guest{selectedFriends.length + emailInvites.length !== 1 ? 's' : ''}</div>
                <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
                  {selectedFriends.map(uid => (friends||[]).find(f=>f.userId===uid)?.name).filter(Boolean).join(', ')}
                  {selectedFriends.length > 0 && emailInvites.length > 0 && ', '}
                  {emailInvites.join(', ')}
                </div>
              </div>
            )}

            {/* Free / Paid toggle */}
            <div className="form-group">
              <label className="form-label">Pricing</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => set('isPaid', false)}
                  className={'filter-btn ' + (!form.isPaid ? 'active' : '')}
                  style={{ flex: 1, padding: '12px', fontSize: 14, minHeight: 48 }}>
                  🆓 Free event
                </button>
                <button onClick={() => set('isPaid', true)}
                  className={'filter-btn ' + (form.isPaid ? 'active' : '')}
                  style={{ flex: 1, padding: '12px', fontSize: 14, minHeight: 48 }}>
                  💵 Paid event
                </button>
              </div>
            </div>

            {form.isPaid && (
              <>
                {/* Price */}
                <div className="form-group">
                  <label className="form-label">Price per guest</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18, color: 'var(--ink2)', fontWeight: 600 }}>$</span>
                    <input className="form-input" type="number" min="0" step="0.01"
                      value={form.price} onChange={e => set('price', e.target.value)}
                      placeholder="0.00" style={{ flex: 1 }} />
                    <span style={{ fontSize: 13, color: 'var(--ink3)' }}>USD</span>
                  </div>
                </div>

                {/* Payment methods — three independent toggles */}
                <div className="form-group">
                  <label className="form-label">Accepted payment methods</label>
                  <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 10, lineHeight: 1.5 }}>
                    Pick one or more. Guests pay you directly — TableFolk doesn't process payments.
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Venmo */}
                    {(() => {
                      const m = form.paymentMethods.find(p => p.type === 'venmo') || { enabled: false, handle: '' };
                      const fromProfile = !!user?.venmo_handle && m.handle === user.venmo_handle;
                      return (
                        <div style={{ border: '1px solid ' + (m.enabled ? 'var(--indigo)' : 'var(--border)'), borderRadius: 10, padding: 12, background: m.enabled ? 'var(--indigo-light)' : 'var(--surface)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!m.enabled} onChange={() => togglePaymentMethod('venmo')} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                            <span style={{ fontSize: 18 }}>💸</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>Venmo</span>
                          </label>
                          {m.enabled && (
                            <div style={{ marginTop: 10 }}>
                              <input className="form-input" value={m.handle || ''}
                                onChange={e => setPaymentMethod('venmo', 'handle', e.target.value)}
                                placeholder="@username" style={{ fontSize: 13 }} />
                              {fromProfile && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>✓ Saved from profile</div>}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Zelle */}
                    {(() => {
                      const m = form.paymentMethods.find(p => p.type === 'zelle') || { enabled: false, contact: '' };
                      const fromProfile = !!user?.zelle_contact && m.contact === user.zelle_contact;
                      return (
                        <div style={{ border: '1px solid ' + (m.enabled ? 'var(--indigo)' : 'var(--border)'), borderRadius: 10, padding: 12, background: m.enabled ? 'var(--indigo-light)' : 'var(--surface)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!m.enabled} onChange={() => togglePaymentMethod('zelle')} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                            <span style={{ fontSize: 18 }}>📱</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>Zelle</span>
                          </label>
                          {m.enabled && (
                            <div style={{ marginTop: 10 }}>
                              <input className="form-input" value={m.contact || ''}
                                onChange={e => setPaymentMethod('zelle', 'contact', e.target.value)}
                                placeholder="email or phone" style={{ fontSize: 13 }} />
                              {fromProfile && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>✓ Saved from profile</div>}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Cash */}
                    {(() => {
                      const m = form.paymentMethods.find(p => p.type === 'cash') || { enabled: false };
                      return (
                        <div style={{ border: '1px solid ' + (m.enabled ? 'var(--indigo)' : 'var(--border)'), borderRadius: 10, padding: 12, background: m.enabled ? 'var(--indigo-light)' : 'var(--surface)' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!m.enabled} onChange={() => togglePaymentMethod('cash')} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                            <span style={{ fontSize: 18 }}>💵</span>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>Cash at event</span>
                          </label>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Payment notes */}
                <div className="form-group">
                  <label className="form-label">Payment notes <span style={{ fontWeight: 400, color: 'var(--ink3)', fontSize: 12 }}>(optional)</span></label>
                  <textarea className="form-textarea" value={form.paymentNotes}
                    onChange={e => set('paymentNotes', e.target.value)}
                    placeholder="e.g. Pay before the event, or settle at the door."
                    style={{ minHeight: 70 }} />
                </div>
              </>
            )}
          </div>
        )}

        </div>
        <div className="modal-foot">
          {step > 1 && <button className="btn btn-ghost" onClick={() => {
            if (step === 4 && skipsServe) { setStep(2); return; }
            setStep(s => s - 1);
          }}>← Back</button>}
          {step === 1 && <button className="btn btn-ghost" onClick={onClose}>Cancel</button>}
          {step === 2 && <button className="btn btn-ghost" onClick={() => setStep(skipsServe ? 4 : 3)}>Skip</button>}
          {step < 4
            ? <button className="btn btn-primary" onClick={() => {
                if (step === 1) {
                  if (!form.title.trim()) { addToast('Event title is required', 'error'); return; }
                  if (!form.useCrowdCheck && !form.date) { addToast('Please set a date', 'error'); return; }
                }
                if (step === 2 && skipsServe) { setStep(4); return; }
                setStep(s => s + 1);
              }}>Next →</button>
            : <>
                <button className="btn btn-ghost" onClick={handleSaveDraft}>Save Draft</button>
                <button className="btn btn-primary" onClick={handleSubmit}>{isEdit ? 'Save Changes' : '🎉 Publish Event'}</button>
              </>
          }
        </div>
      </div>
    </div>
  );
}
