import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { nextDate } from '../data/utils';
import ImagePickerModal from './ImagePickerModal';
import { InlinePollAdder } from './PollsPanel';
import { InlineCohostAdder } from './CohostsPanel';
import { InlineMusicAdder } from './MusicPanel';

const EVENT_TYPES = [
  { id: 'Dinner Party', icon: '🍽', label: 'Dinner party', special: null },
  { id: 'Potluck',      icon: '🥘', label: 'Potluck',      special: 'pot' },
  { id: 'Restaurant',  icon: '🏛', label: 'Restaurant',   special: null },
  { id: 'Supper Club', icon: '🍷', label: 'Supper club',  special: 'series', sub: 'Series support' },
  { id: 'Pop-up',      icon: '✨', label: 'Pop-up',        special: null },
  { id: 'Open-ended',  icon: '✦', label: 'Open-ended',   special: null, sub: 'No fixed format' },
];

const GRADIENTS = [
  { label: 'Indigo',          value: '#6C5DD3' },
  { label: 'Midnight indigo', value: 'linear-gradient(135deg,#1a1a2e,#7F77DD)' },
  { label: 'Forest dusk',     value: 'linear-gradient(135deg,#0d1b2a,#1d9e75)' },
  { label: 'Amber evening',   value: 'linear-gradient(135deg,#2d1b00,#c8860a)' },
  { label: 'Rose noir',       value: 'linear-gradient(135deg,#1a0a2e,#d4537e)' },
  { label: 'Ember',           value: 'linear-gradient(135deg,#11142D,#D85A30)' },
  { label: 'Garden',          value: 'linear-gradient(180deg,#0ACF97,#0d3b2e)' },
  { label: 'Coral',           value: '#FF6B6B' },
  { label: 'Obsidian',        value: '#11142D' },
];

const POTLUCK_FOOD = ['🥗 Salad','🍞 Bread','🧀 Cheese','🍷 Wine','🥘 Main dish','🍰 Dessert','🥬 Side dish','🫙 Condiments'];
const POTLUCK_CUTLERY = ['🍽 Plates','🥄 Cutlery','🥂 Glasses','🧻 Napkins','🪑 Extra chair'];
const POTLUCK_OTHER = ['🎵 Speaker','🕯 Candles','🌸 Flowers','🎲 Games'];

const FIELD_EMOJIS = {
  title:    ['🌿','🕯','✨','🍽','🥂','🌙','⭐','🎩','👑','🫒','🌾','🍾','🫶','🥘','🍷'],
  loc:      ['📍','🏛','🏠','🌿','🌊','🏔','🍽','🍷','✨','🕯','🎪','🌙','🌾','🫶'],
  desc:     ['🕯','🌿','🍽','✨','🥂','🌙','⭐','🎩','🫒','🌾','🍾','🫶','🥘','🍷','👨‍🍳'],
};

function EmojiPicker({ field, onPick }) {
  return (
    <div className="emoji-picker-wrap" style={{
      position: 'absolute', right: 0, top: '100%', zIndex: 30, marginTop: 4,
      background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r2)',
      padding: 8, display: 'flex', flexWrap: 'wrap', gap: 4, width: 210,
      boxShadow: '0 8px 24px rgba(17,20,45,0.1)',
    }}>
      {(FIELD_EMOJIS[field] || []).map(em => (
        <span key={em} onMouseDown={e => { e.preventDefault(); onPick(em); }}
          style={{ fontSize: 16, padding: 4, borderRadius: 4, cursor: 'pointer', lineHeight: 1 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--page)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          {em}
        </span>
      ))}
    </div>
  );
}

function Toggle({ label, sub, on, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!on)}
        style={{ width: 38, height: 22, borderRadius: 11, background: on ? 'var(--indigo)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0, marginTop: 2 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: on ? 19 : 3, transition: 'left .2s' }} />
      </div>
    </div>
  );
}

export default function CreateEventModal({ editId, onClose, onSaved }) {
  const { events, saveEvent, profile, PLACES, IMAGES } = useApp();
  const editing = editId ? events.find(e => e.id === editId) : null;

  const [title, setTitle]         = useState(editing?.title || '');
  const [type, setType]           = useState(editing?.type || 'Dinner Party');
  const [date, setDate]           = useState(editing?.date || nextDate());
  const [time, setTime]           = useState(editing?.time || '19:00');
  const [dateTbd, setDateTbd]     = useState(false);
  const [openCap, setOpenCap]     = useState(false);
  const [loc, setLoc]             = useState(editing?.loc || '');
  const [addr, setAddr]           = useState(editing?.addr || '');
  const [cap, setCap]             = useState(editing?.cap || '');
  const [vis, setVis]             = useState(editing?.vis || 'Public');
  const [desc, setDesc]           = useState(editing?.desc || '');
  const [invHeader, setInvHeader] = useState(editing?.invH || "You're Invited");
  const [coverBg, setCoverBg]     = useState(editing?.invBg || '#6C5DD3');
  const [coverEmoji, setCoverEmoji] = useState(editing?.coverEmoji || '');
  const [coverMode, setCoverMode] = useState(editing?.coverEmoji ? 'emoji' : 'solid');
  const [customEmoji, setCustomEmoji] = useState('');
  const [invImg, setInvImg]       = useState(editing?.img || '');
  const [polls, setPolls]         = useState(editing?.polls || []);
  const [cohosts, setCohosts]     = useState(editing?.cohosts || []);
  const [musicUrl, setMusicUrl]   = useState(editing?.music?.url || '');
  const [seriesName, setSeriesName] = useState(editing?.series?.name || '');
  const [seriesVol, setSeriesVol]   = useState(editing?.series?.vol || '');
  const [potItems, setPotItems]   = useState(
    editing?.potItems || [...POTLUCK_FOOD.slice(0, 2), ...POTLUCK_CUTLERY.slice(0, 0)]
  );
  const [customPotInput, setCustomPotInput] = useState('');
  const [galleryEnabled, setGalleryEnabled] = useState(editing?.gallery?.enabled || false);
  const [galleryLayout, setGalleryLayout]   = useState(editing?.gallery?.layout || 'masonry');
  const [galleryVis, setGalleryVis]         = useState(editing?.gallery?.visibility || 'Public');
  const [acResults, setAcResults] = useState([]);
  const [showAc, setShowAc]       = useState(false);
  const [showImgPicker, setShowImgPicker] = useState(false);
  const [activePicker, setActivePicker]   = useState(null);
  const acTimer = useRef(null);

  const typeSpec = EVENT_TYPES.find(t => t.id === type);

  useEffect(() => {
    if (editing?.addr) setAddr(editing.addr);
  }, [editing]);

  useEffect(() => {
    function handler(e) {
      if (!e.target.closest('.emoji-picker-wrap')) setActivePicker(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleLocInput(v) {
    setLoc(v); setAddr('');
    clearTimeout(acTimer.current);
    if (v.length < 2) { setShowAc(false); return; }
    acTimer.current = setTimeout(() => {
      const q = v.toLowerCase();
      const hits = PLACES.filter(p => p.n.toLowerCase().includes(q) || p.a.toLowerCase().includes(q));
      setAcResults(hits); setShowAc(hits.length > 0);
    }, 200);
  }

  function pickGradient(g) {
    setCoverBg(g.value); setCoverMode('solid'); setCoverEmoji(''); setCustomEmoji('');
    // Picking a gradient clears any emoji overlay
  }

  function pickEmoji(em) {
    setCoverEmoji(em); setCoverMode('emoji'); setCustomEmoji('');
    // coverBg intentionally kept — emoji overlays on top of gradient
  }

  function onCustomEmojiInput(v) {
    setCustomEmoji(v);
    if (v.trim()) { setCoverEmoji(v.trim()); setCoverMode('emoji'); }
    // gradient background preserved — emoji overlays on top
  }

  function togglePotItem(item) {
    setPotItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  }

  function addCustomPot() {
    const v = customPotInput.trim();
    if (!v) return;
    setPotItems(prev => prev.includes(v) ? prev : [...prev, v]);
    setCustomPotInput('');
  }

  function appendEmoji(field, em) {
    if (field === 'title') setTitle(t => t + em);
    if (field === 'loc')   setLoc(l => l + em);
    if (field === 'desc')  setDesc(d => d + em);
    setActivePicker(null);
  }

  function handleSave() {
    if (!title.trim()) { alert('Please enter an event title.'); return; }
    const ev = {
      id: editId || Date.now(),
      title: title.trim(), type, date: dateTbd ? '' : date, time: dateTbd ? '' : time,
      loc: loc || 'TBD', addr,
      cap: openCap ? 999 : (parseInt(cap) || 8), vis, desc,
      host: profile.name, mine: true,
      img: invImg || (coverMode === 'emoji' ? '' : IMAGES[0].u),
      invH: invHeader, invBg: coverBg,
      coverEmoji: coverMode === 'emoji' ? coverEmoji : '',
      guests: editing ? editing.guests : [],
      pot: editing ? editing.pot : [],
      polls, cohosts,
      music: { url: musicUrl, suggestions: editing?.music?.suggestions || [] },
      series: typeSpec?.special === 'series' && seriesName ? { name: seriesName, vol: seriesVol } : null,
      potItems: typeSpec?.special === 'pot' ? potItems : [],
      gallery: { enabled: galleryEnabled, layout: galleryLayout, visibility: galleryVis },
    };
    saveEvent(ev); onSaved();
  }

  const gmUrl = addr ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(loc + ' ' + addr) : null;
  const amUrl = addr ? 'https://maps.apple.com/?q=' + encodeURIComponent(loc) + '&address=' + encodeURIComponent(addr) : null;

  const coverStyle = { background: coverBg };

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ width: '100%', maxWidth: 820, padding: 0, maxHeight: '94vh', display: 'flex', flexDirection: 'column' }}>

          <div className="modal-head" style={{ padding: '18px 28px', flexShrink: 0 }}>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {editId ? 'Edit Event' : 'Host a New Event'}
                {typeSpec?.special === 'series' && (
                  <span style={{ padding: '2px 10px', borderRadius: 20, background: 'var(--indigo-light)', color: 'var(--indigo)', fontSize: 11, fontWeight: 600, border: '1px solid var(--indigo-mid)' }}>Series</span>
                )}
              </h2>
            </div>
            <div className="modal-x" onClick={onClose}>✕</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', flex: 1, overflow: 'hidden' }}>

            {/* ── FORM COLUMN ── */}
            <div style={{ padding: '20px 28px', overflowY: 'auto', borderRight: '1px solid var(--border)' }}>

              {/* Event type grid */}
              <div className="form-group">
                <label className="form-label">What are you hosting?</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {EVENT_TYPES.map(t => (
                    <div key={t.id} onClick={() => setType(t.id)}
                      style={{ padding: '10px 8px', borderRadius: 'var(--r)', border: '1.5px solid ' + (type === t.id ? 'var(--indigo)' : 'var(--border)'), background: type === t.id ? 'var(--indigo-light)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                      <div style={{ fontSize: 20, marginBottom: 3 }}>{t.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: type === t.id ? 'var(--indigo)' : 'var(--ink)' }}>{t.label}</div>
                      {t.sub && <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 1 }}>{t.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Supper Club Series section */}
              {typeSpec?.special === 'series' && (
                <div style={{ background: 'var(--indigo-light)', border: '1px solid var(--indigo-mid)', borderRadius: 'var(--r2)', padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo)', marginBottom: 10 }}>🍷 Supper Club Series</div>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Series name</label>
                      <input className="form-input" placeholder="The Long Table" value={seriesName} onChange={e => setSeriesName(e.target.value)} style={{ background: 'white' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Volume no.</label>
                      <input className="form-input" type="number" placeholder="1" min="1" value={seriesVol} onChange={e => setSeriesVol(e.target.value)} style={{ background: 'white' }} />
                    </div>
                  </div>
                </div>
              )}

              {/* Potluck section */}
              {typeSpec?.special === 'pot' && (
                <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>🥘 What should guests bring?</div>
                  {[['Food & dishes', POTLUCK_FOOD], ['Cutlery & supplies', POTLUCK_CUTLERY], ['Other', POTLUCK_OTHER]].map(([catLabel, items]) => (
                    <div key={catLabel} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{catLabel}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {items.map(item => (
                          <div key={item} onClick={() => togglePotItem(item)}
                            style={{ padding: '4px 11px', borderRadius: 20, border: '1px solid ' + (potItems.includes(item) ? 'var(--indigo)' : 'var(--border)'), background: potItems.includes(item) ? 'var(--indigo-light)' : 'white', color: potItems.includes(item) ? 'var(--indigo)' : 'var(--ink2)', fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'all .15s' }}>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <input className="form-input" placeholder="Add your own item..." value={customPotInput} onChange={e => setCustomPotInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomPot()} style={{ flex: 1, fontSize: 12 }} />
                    <button className="btn btn-ghost btn-sm" onClick={addCustomPot}>+ Add</button>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 6 }}>Attendees can claim items or bring their own when RSVPing</div>
                </div>
              )}

              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 16px' }} />

              {/* Title with emoji picker */}
              <div className="form-group emoji-picker-wrap" style={{ position: 'relative' }}>
                <label className="form-label">Event title</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" placeholder="An Evening of Provençal Cuisine" value={title} onChange={e => setTitle(e.target.value)} style={{ paddingRight: 36 }} />
                  <button type="button" onClick={() => setActivePicker(activePicker === 'title' ? null : 'title')}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: activePicker === 'title' ? 1 : 0.4, lineHeight: 1, padding: 0 }}>☺</button>
                  {activePicker === 'title' && <EmojiPicker field="title" onPick={em => appendEmoji('title', em)} />}
                </div>
              </div>

              {/* Date + Time */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date {dateTbd && <span style={{ color: 'var(--indigo)', fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(using date poll)</span>}</label>
                  <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} disabled={dateTbd} style={{ opacity: dateTbd ? 0.4 : 1 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} disabled={dateTbd} style={{ opacity: dateTbd ? 0.4 : 1 }} />
                </div>
              </div>

              {/* Location */}
              <div className="form-group emoji-picker-wrap" style={{ position: 'relative' }}>
                <label className="form-label">Venue or address</label>
                <div className="ac-wrap" style={{ position: 'relative' }}>
                  <div style={{ position: 'relative' }}>
                    <input className="form-input" placeholder="Restaurant name or private address..." value={loc} onChange={e => handleLocInput(e.target.value)} onBlur={() => setTimeout(() => setShowAc(false), 200)} autoComplete="off" style={{ paddingRight: 36 }} />
                    <button type="button" onClick={() => setActivePicker(activePicker === 'loc' ? null : 'loc')}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: activePicker === 'loc' ? 1 : 0.4, lineHeight: 1, padding: 0 }}>☺</button>
                    {activePicker === 'loc' && <EmojiPicker field="loc" onPick={em => appendEmoji('loc', em)} />}
                  </div>
                  {showAc && (
                    <div className="ac-list">
                      {acResults.map(p => (
                        <div key={p.n} className="ac-item" onClick={() => { setLoc(p.n); setAddr(p.a); setShowAc(false); }}>
                          <span style={{ color: 'var(--indigo)', fontSize: 14 }}>📍</span>
                          <div><div className="ac-name">{p.n}</div><div className="ac-addr">{p.a}</div></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {addr && (
                  <div className="map-btns">
                    <span style={{ fontSize: 11, color: 'var(--ink3)', alignSelf: 'center' }}>Open in:</span>
                    <a className="map-btn" href={gmUrl} target="_blank" rel="noopener noreferrer">🗺 Google Maps</a>
                    <a className="map-btn" href={amUrl} target="_blank" rel="noopener noreferrer">🍎 Apple Maps</a>
                  </div>
                )}
              </div>

              {/* Cap + Vis */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Capacity {openCap && <span style={{ color: 'var(--indigo)', fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(open)</span>}</label>
                  <input className="form-input" type="number" placeholder="8" min="1" max="500" value={cap} onChange={e => setCap(e.target.value)} disabled={openCap} style={{ opacity: openCap ? 0.4 : 1 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Visibility</label>
                  <select className="form-input" value={vis} onChange={e => setVis(e.target.value)}>
                    <option>Public</option>
                    <option>Request-only</option>
                    <option>Friends-only</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="form-group emoji-picker-wrap" style={{ position: 'relative' }}>
                <label className="form-label">Description</label>
                <div style={{ position: 'relative' }}>
                  <textarea className="form-input" placeholder="Set the scene — the mood, the menu, the dress code..." value={desc} onChange={e => setDesc(e.target.value)} style={{ paddingRight: 36 }} />
                  <button type="button" onClick={() => setActivePicker(activePicker === 'desc' ? null : 'desc')}
                    style={{ position: 'absolute', right: 10, top: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, opacity: activePicker === 'desc' ? 1 : 0.4, lineHeight: 1, padding: 0 }}>☺</button>
                  {activePicker === 'desc' && <EmojiPicker field="desc" onPick={em => appendEmoji('desc', em)} />}
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 20px' }} />

              {/* Music */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 8 }}>🎵 Music playlist <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <InlineMusicAdder musicUrl={musicUrl} onChange={setMusicUrl} />
              </div>

              {/* Polls */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 8 }}>📊 Polls <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <InlinePollAdder polls={polls} onAdd={setPolls} onRemove={setPolls} />
              </div>

              {/* Co-hosts */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 8 }}>👥 Co-hosts <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                <InlineCohostAdder cohosts={cohosts} onChange={setCohosts} />
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 20px' }} />

              {/* Cover design */}
              <div style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ marginBottom: 10 }}>🎨 Cover design</label>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Gradients & solids</div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
                  {GRADIENTS.map((g, i) => (
                    <div key={i} onClick={() => pickGradient(g)}
                      title={g.label}
                      style={{ width: 32, height: 32, borderRadius: 8, background: g.value, cursor: 'pointer', border: '2px solid ' + (coverMode !== 'emoji' && coverBg === g.value ? 'var(--ink)' : 'transparent'), flexShrink: 0, transition: 'all .15s', transform: coverMode !== 'emoji' && coverBg === g.value ? 'scale(1.12)' : 'scale(1)' }} />
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>Animated emoji</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  {EMOJI_PRESETS.map((em, i) => (
                    <span key={i} onClick={() => pickEmoji(em)}
                      style={{ fontSize: 22, padding: 5, borderRadius: 8, cursor: 'pointer', border: '2px solid ' + (coverMode === 'emoji' && coverEmoji === em && !customEmoji ? 'var(--indigo)' : 'transparent'), background: coverMode === 'emoji' && coverEmoji === em && !customEmoji ? 'var(--indigo-light)' : 'transparent', transition: 'all .15s', lineHeight: 1 }}>
                      {em}
                    </span>
                  ))}
                  <input
                    type="text" maxLength={2}
                    placeholder="+"
                    value={customEmoji}
                    onChange={e => onCustomEmojiInput(e.target.value)}
                    title="Type any emoji"
                    style={{ width: 44, height: 38, borderRadius: 8, border: '1px solid ' + (customEmoji ? 'var(--indigo)' : 'var(--border)'), fontSize: 22, textAlign: 'center', background: customEmoji ? 'var(--indigo-light)' : 'white', color: 'var(--ink)', outline: 'none', cursor: 'text', fontFamily: 'inherit', padding: 0 }}
                  />
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '8px 0 20px' }} />

              {/* Gallery toggle */}
              <div style={{ marginBottom: 8 }}>
                <label className="form-label" style={{ marginBottom: 8 }}>📷 Photo gallery</label>
                <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: '10px 14px' }}>
                  <Toggle label="Enable photo gallery" sub="Guests can upload photos within 24h of the event" on={galleryEnabled} onChange={setGalleryEnabled} />
                  {galleryEnabled && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', marginBottom: 5 }}>Layout</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {['masonry','editorial','timeline'].map(l => (
                              <div key={l} onClick={() => setGalleryLayout(l)}
                                style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid ' + (galleryLayout === l ? 'var(--indigo)' : 'var(--border)'), background: galleryLayout === l ? 'var(--indigo-light)' : 'white', color: galleryLayout === l ? 'var(--indigo)' : 'var(--ink2)', fontSize: 12, cursor: 'pointer', fontWeight: 500, textTransform: 'capitalize', transition: 'all .15s' }}>
                                {l.charAt(0).toUpperCase() + l.slice(1)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', marginBottom: 5 }}>Who can see it</div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {['Public','Friends','Private'].map(v => (
                              <div key={v} onClick={() => setGalleryVis(v)}
                                style={{ padding: '4px 12px', borderRadius: 20, border: '1px solid ' + (galleryVis === v ? 'var(--indigo)' : 'var(--border)'), background: galleryVis === v ? 'var(--indigo-light)' : 'white', color: galleryVis === v ? 'var(--indigo)' : 'var(--ink2)', fontSize: 12, cursor: 'pointer', fontWeight: 500, transition: 'all .15s' }}>
                                {v}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* ── PREVIEW COLUMN ── */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--page)', overflowY: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live preview</div>

              {/* Cover preview */}
              <div style={{ borderRadius: 'var(--r2)', overflow: 'hidden', height: 150, position: 'relative', flexShrink: 0, ...coverStyle }}>
                {invImg && <img src={invImg} alt="cover" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                {coverMode === 'emoji' && coverEmoji && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}
                    className="cover-emoji-anim">
                    {coverEmoji}
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,20,45,0.7) 0%, transparent 55%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.65)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>{type}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'white', lineHeight: 1.25 }}>{title || 'Your Event Title'}</div>
                </div>
                <button onClick={() => setShowImgPicker(true)}
                  style={{ position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: 'var(--r)', background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.3)', color: 'white', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
                  🖼 Photo
                </button>
              </div>

              {/* Meta preview */}
              <div style={{ background: 'white', borderRadius: 'var(--r2)', padding: '10px 12px', fontSize: 12 }}>
                <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{title || 'Your Event Title'}</div>
                {!dateTbd && date && <div style={{ color: 'var(--ink2)', marginBottom: 3 }}>📅 {new Date(date + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {time}</div>}
                {dateTbd && <div style={{ color: 'var(--indigo)', marginBottom: 3, fontSize: 11 }}>📅 Date TBD — using date poll</div>}
                {loc && <div style={{ color: 'var(--ink2)', marginBottom: 3 }}>📍 {loc}</div>}
                {desc && <div style={{ color: 'var(--ink3)', marginTop: 4, lineHeight: 1.5 }}>{desc.slice(0, 80)}{desc.length > 80 ? '…' : ''}</div>}
              </div>

              {/* Quick toggles */}
              <div style={{ background: 'white', borderRadius: 'var(--r2)', padding: '8px 12px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Quick toggles</div>
                <Toggle label="Date TBD" sub="Use a date poll instead" on={dateTbd} onChange={setDateTbd} />
                <div style={{ borderBottom: 'none' }}>
                  <Toggle label="Open capacity" sub="No seat limit" on={openCap} onChange={setOpenCap} />
                </div>
              </div>

              {/* Header text */}
              <div style={{ background: 'white', borderRadius: 'var(--r2)', padding: '8px 12px' }}>
                <label className="form-label" style={{ marginBottom: 5 }}>Invitation header</label>
                <input className="form-input" value={invHeader} onChange={e => setInvHeader(e.target.value)} style={{ fontSize: 12, padding: '6px 10px' }} />
              </div>
            </div>

          </div>

          <div className="modal-foot" style={{ flexShrink: 0 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editId ? 'Save Changes' : (typeSpec?.special === 'series' ? 'Publish Series Event' : 'Publish Event')}
            </button>
          </div>

        </div>
      </div>

      {showImgPicker && (
        <ImagePickerModal
          currentImg={invImg}
          onSelect={url => { setInvImg(url); setCoverMode('solid'); setShowImgPicker(false); }}
          onClose={() => setShowImgPicker(false)}
        />
      )}
    </>
  );
}
