import React, { useState, useRef } from 'react';
import { useApp } from '../hooks/useApp';

const POLL_TYPES = [
  { id: 'date',       icon: '📅', label: 'Date poll',       hint: 'Vote on date & time options' },
  { id: 'food',       icon: '🍽', label: 'Food poll',       hint: 'Vote on cuisine or menu style' },
  { id: 'drink',      icon: '🍷', label: 'Drinks poll',     hint: 'Vote on wine, cocktails, mocktails' },
  { id: 'restaurant', icon: '🗺', label: 'Restaurant poll', hint: 'Vote on where to dine out' },
];

const FOOD_PRESETS   = ['Italian','Japanese','Thai','Mexican','Mediterranean','Korean BBQ','Indian','French','Vegan / plant-based','Seafood'];
const DRINK_PRESETS  = ['Natural wine','Craft cocktails','Beer & cider','Non-alcoholic / mocktails','Sake','Champagne','Mezcal & tequila','BYO'];

// ── Curated Chicago restaurant data with ratings ───────────────────────────────
const RESTAURANT_DB = [
  { name: 'Alinea',                  addr: '1723 N Halsted St, Chicago',   rating: 4.8, type: 'Contemporary', price: '$$$$', phone: '312-867-0110' },
  { name: 'Avec',                    addr: '615 W Randolph St, Chicago',    rating: 4.6, type: 'Mediterranean', price: '$$$',  phone: '312-377-2002' },
  { name: 'Girl & the Goat',         addr: '800 W Randolph St, Chicago',    rating: 4.5, type: 'American',      price: '$$$',  phone: '312-492-6262' },
  { name: 'Gibsons Bar & Steakhouse',addr: '1028 N Rush St, Chicago',       rating: 4.6, type: 'Steakhouse',    price: '$$$$', phone: '312-266-8999' },
  { name: 'The Purple Pig',          addr: '500 N Michigan Ave, Chicago',   rating: 4.5, type: 'Mediterranean', price: '$$',   phone: '312-464-1744' },
  { name: 'Smyth',                   addr: '177 N Ada St, Chicago',         rating: 4.7, type: 'Contemporary',  price: '$$$$', phone: '773-913-3773' },
  { name: 'Nobu Chicago',            addr: '155 N Wacker Dr, Chicago',      rating: 4.5, type: 'Japanese',      price: '$$$$', phone: '312-888-4962' },
  { name: 'RPM Italian',             addr: '52 W Illinois St, Chicago',     rating: 4.4, type: 'Italian',       price: '$$$',  phone: '312-222-1888' },
  { name: 'Au Cheval',               addr: '800 W Randolph St, Chicago',    rating: 4.4, type: 'American',      price: '$$',   phone: '312-929-4580' },
  { name: 'Monteverde',              addr: '1020 W Madison St, Chicago',    rating: 4.6, type: 'Italian',       price: '$$$',  phone: '312-888-3041' },
  { name: 'Boka',                    addr: '1729 N Halsted St, Chicago',    rating: 4.5, type: 'Contemporary',  price: '$$$$', phone: '312-337-6070' },
  { name: 'Oriole',                  addr: '661 W Walnut St, Chicago',      rating: 4.8, type: 'Contemporary',  price: '$$$$', phone: '312-877-5339' },
  { name: 'Roister',                 addr: '951 W Fulton Market, Chicago',  rating: 4.4, type: 'American',      price: '$$$',  phone: '312-733-6900' },
  { name: 'GT Fish & Oyster',        addr: '531 N Wells St, Chicago',       rating: 4.4, type: 'Seafood',       price: '$$$',  phone: '312-929-3501' },
  { name: 'Andros Taverna',          addr: '2542 N Milwaukee Ave, Chicago', rating: 4.5, type: 'Greek',         price: '$$$',  phone: '773-697-4234' },
];

function tzLabel(tz) {
  try {
    const now = new Date();
    const offset = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' })
      .formatToParts(now).find(p => p.type === 'timeZoneName')?.value || '';
    return tz.replace('_', ' ').split('/').slice(-1)[0].replace('_', ' ') + ' (' + offset + ')';
  } catch { return tz; }
}

// ── Star Rating Display ──────────────────────────────────────────────────────
function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ fontSize: 12, color: '#F59E0B', letterSpacing: 1 }}>
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span style={{ color: 'var(--ink3)', fontWeight: 600, marginLeft: 4 }}>{rating}</span>
    </span>
  );
}

// ── Restaurant Search ────────────────────────────────────────────────────────
function RestaurantSearch({ onSelect }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);

  function search(val) {
    setQ(val);
    clearTimeout(timer.current);
    if (!val.trim()) { setResults([]); return; }
    timer.current = setTimeout(() => {
      const matches = RESTAURANT_DB.filter(r =>
        r.name.toLowerCase().includes(val.toLowerCase()) ||
        r.type.toLowerCase().includes(val.toLowerCase()) ||
        r.addr.toLowerCase().includes(val.toLowerCase())
      );
      setResults(matches.slice(0, 6));
    }, 180);
  }

  function copyAddr(r) {
    navigator.clipboard?.writeText(r.addr).catch(() => {});
    setCopied(r.name);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <input
        className="form-input"
        placeholder="Search restaurant name or cuisine..."
        value={q}
        onChange={e => search(e.target.value)}
        autoComplete="off"
      />
      {results.length > 0 && (
        <div style={{ marginTop: 8 }}>
          {results.map(r => (
            <div key={r.name} style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{r.name}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink3)', background: 'white', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)' }}>{r.price}</span>
                  <button onClick={() => onSelect(r)}
                    style={{ padding: '4px 12px', borderRadius: 20, background: 'var(--indigo)', border: 'none', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    + Add
                  </button>
                </div>
              </div>
              <Stars rating={r.rating} />
              <div style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--indigo-light)', color: 'var(--indigo)', padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{r.type}</span>
                <span>📍 {r.addr}</span>
                <button onClick={() => copyAddr(r)}
                  style={{ padding: '2px 8px', borderRadius: 4, background: copied === r.name ? 'var(--teal-light)' : 'white', border: '1px solid var(--border)', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: copied === r.name ? '#07A87B' : 'var(--ink2)' }}>
                  {copied === r.name ? '✓ Copied' : '📋 Copy address'}
                </button>
                <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(r.name + ' ' + r.addr)}
                  target="_blank" rel="noopener noreferrer"
                  style={{ padding: '2px 8px', borderRadius: 4, background: 'white', border: '1px solid var(--border)', fontSize: 10, fontWeight: 600, color: 'var(--sky)', textDecoration: 'none' }}>
                  🗺 Maps
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Date Option Builder ──────────────────────────────────────────────────────
function DateOptionBuilder({ options, onChange, timezone }) {
  function addDate() {
    onChange([...options, { date: '', time: '19:00', label: '' }]);
  }
  function removeDate(i) {
    onChange(options.filter((_, j) => j !== i));
  }
  function updateDate(i, field, val) {
    const updated = options.map((o, j) => j === i ? { ...o, [field]: val } : o);
    onChange(updated);
  }
  function formatLabel(d, t, tz) {
    if (!d) return '';
    try {
      const dt = new Date(d + 'T' + (t || '19:00'));
      const dateStr = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz });
      const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
      return dateStr + ' · ' + timeStr;
    } catch { return d; }
  }

  return (
    <div>
      {timezone && (
        <div style={{ fontSize: 11, color: 'var(--indigo)', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
          🕐 Times shown in {tzLabel(timezone)}
        </div>
      )}
      {options.map((opt, i) => (
        <div key={i} style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Option {i + 1}</div>
            {options.length > 2 && (
              <button onClick={() => removeDate(i)}
                style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>✕ Remove</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Date</label>
              <input type="date" className="form-input" value={opt.date} onChange={e => updateDate(i, 'date', e.target.value)} style={{ fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>Time</label>
              <input type="time" className="form-input" value={opt.time || '19:00'} onChange={e => updateDate(i, 'time', e.target.value)} style={{ fontSize: 13 }} />
            </div>
          </div>
          {opt.date && (
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: 'var(--indigo)', background: 'var(--indigo-light)', padding: '5px 10px', borderRadius: 6 }}>
              📅 {formatLabel(opt.date, opt.time, timezone)}
            </div>
          )}
        </div>
      ))}
      <button onClick={addDate}
        style={{ width: '100%', padding: '9px', borderRadius: 'var(--r)', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--indigo)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        + Add another date option
      </button>
    </div>
  );
}

// ── Create Poll Modal ────────────────────────────────────────────────────────
function CreatePollModal({ eventId, onClose }) {
  const { addPoll, profile } = useApp();
  const [type, setType]         = useState('date');
  const [question, setQuestion] = useState('');
  const [allowSugg, setAllowSugg] = useState(true);
  // date poll
  const [dateOptions, setDateOptions] = useState([
    { date: '', time: '19:00' },
    { date: '', time: '19:00' },
  ]);
  // food/drink poll
  const [textOptions, setTextOptions] = useState(['', '']);
  // restaurant poll
  const [restOptions, setRestOptions] = useState([]);

  const tz = profile?.timezone || 'America/Chicago';
  const presets = type === 'food' ? FOOD_PRESETS : type === 'drink' ? DRINK_PRESETS : [];

  function applyPreset(val) {
    setTextOptions(prev => prev[prev.length - 1] === '' ? [...prev.slice(0, -1), val] : [...prev, val]);
  }

  function addRestaurant(r) {
    if (restOptions.find(o => o.name === r.name)) return;
    setRestOptions(prev => [...prev, r]);
  }
  function removeRestaurant(name) {
    setRestOptions(prev => prev.filter(r => r.name !== name));
  }

  function formatDateLabel(d, t) {
    if (!d) return '';
    try {
      const dt = new Date(d + 'T' + (t || '19:00'));
      return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz }) +
             ' · ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
    } catch { return d; }
  }

  function save() {
    let builtOptions = [];
    if (type === 'date') {
      const filled = dateOptions.filter(o => o.date);
      if (filled.length < 2) { alert('Please add at least 2 date options.'); return; }
      builtOptions = filled.map((o, i) => ({
        id: i + 1, label: formatDateLabel(o.date, o.time),
        date: o.date, time: o.time, votes: [], status: 'active'
      }));
    } else if (type === 'restaurant') {
      if (restOptions.length < 2) { alert('Please add at least 2 restaurants.'); return; }
      builtOptions = restOptions.map((r, i) => ({
        id: i + 1, label: r.name, addr: r.addr, rating: r.rating,
        cuisine: r.type, price: r.price, votes: [], status: 'active'
      }));
    } else {
      const filled = textOptions.filter(o => o.trim());
      if (filled.length < 2) { alert('Please add at least 2 options.'); return; }
      builtOptions = filled.map((label, i) => ({ id: i + 1, label, votes: [], status: 'active' }));
    }
    const defaults = { date: 'Which date works best?', food: 'What should we eat?', drink: 'What should we drink?', restaurant: 'Where should we dine?' };
    addPoll(eventId, {
      type, question: question.trim() || defaults[type],
      options: builtOptions, allowSuggestions: allowSugg, timezone: tz,
    });
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,20,45,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, width: 540, maxWidth: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(17,20,45,0.18)' }}>
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Add a Poll</div>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--page)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: 'var(--ink2)' }}>✕</div>
        </div>

        <div style={{ padding: '20px 28px' }}>
          {/* Poll type selector */}
          <div className="form-group">
            <label className="form-label">Poll Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {POLL_TYPES.map(pt => (
                <div key={pt.id} onClick={() => { setType(pt.id); setQuestion(''); }}
                  style={{ padding: '12px 14px', borderRadius: 12, border: '1.5px solid ' + (type === pt.id ? 'var(--indigo)' : 'var(--border)'), background: type === pt.id ? 'var(--indigo-light)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .18s' }}>
                  <span style={{ fontSize: 22 }}>{pt.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: type === pt.id ? 'var(--indigo)' : 'var(--ink)' }}>{pt.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 1, lineHeight: 1.4 }}>{pt.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="form-group">
            <label className="form-label">Question <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input className="form-input" value={question} onChange={e => setQuestion(e.target.value)}
              placeholder={{ date: 'Which date works best?', food: 'What should we eat?', drink: 'What should we drink?', restaurant: 'Where should we dine?' }[type]} />
          </div>

          {/* DATE POLL */}
          {type === 'date' && (
            <div className="form-group">
              <label className="form-label">Date & Time Options</label>
              <DateOptionBuilder options={dateOptions} onChange={setDateOptions} timezone={tz} />
            </div>
          )}

          {/* FOOD / DRINK POLL */}
          {(type === 'food' || type === 'drink') && (
            <>
              {presets.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Quick Add</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {presets.map(p => (
                      <div key={p} onClick={() => applyPreset(p)}
                        style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--ink2)', background: 'white', transition: 'all .15s' }}>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Options</label>
                {textOptions.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input className="form-input" placeholder={'Option ' + (i + 1)} value={opt}
                      onChange={e => setTextOptions(prev => prev.map((o, j) => j === i ? e.target.value : o))} style={{ flex: 1 }} />
                    {textOptions.length > 2 && (
                      <button onClick={() => setTextOptions(prev => prev.filter((_, j) => j !== i))}
                        style={{ padding: '0 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'white', color: 'var(--coral)', cursor: 'pointer' }}>✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setTextOptions(prev => [...prev, ''])}
                  style={{ padding: '7px 16px', borderRadius: 'var(--r)', border: '1px dashed var(--border)', background: 'transparent', color: 'var(--ink2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, width: '100%' }}>
                  + Add another option
                </button>
              </div>
            </>
          )}

          {/* RESTAURANT POLL */}
          {type === 'restaurant' && (
            <div className="form-group">
              <label className="form-label">Search & Add Restaurants</label>
              <RestaurantSearch onSelect={addRestaurant} />
              {restOptions.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Added ({restOptions.length})
                  </div>
                  {restOptions.map(r => (
                    <div key={r.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--indigo-light)', border: '1px solid var(--indigo-mid)', borderRadius: 'var(--r)', marginBottom: 7 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--indigo)' }}>{r.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--indigo)', marginLeft: 8 }}>{r.rating}★ · {r.type}</span>
                      </div>
                      <button onClick={() => removeRestaurant(r.name)}
                        style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid rgba(108,93,211,0.3)', background: 'white', color: 'var(--indigo)', cursor: 'pointer', fontSize: 11 }}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Allow suggestions toggle (not for restaurant or date polls) */}
          {type !== 'restaurant' && type !== 'date' && (
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--page)', borderRadius: 'var(--r)', marginBottom: 4 }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Allow guests to suggest options</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>You can accept or reject suggestions before they go live</div>
              </div>
              <div onClick={() => setAllowSugg(v => !v)}
                style={{ width: 40, height: 22, borderRadius: 11, background: allowSugg ? 'var(--indigo)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0, marginTop: 2 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: allowSugg ? 21 : 3, transition: 'left .2s' }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, position: 'sticky', bottom: 0, background: 'white' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Add Poll</button>
        </div>
      </div>
    </div>
  );
}

// ── Single Poll Card ─────────────────────────────────────────────────────────
function PollCard({ poll, eventId, isHost, userName }) {
  const { votePoll, suggestPollOption, reviewPollSuggestion, lockPoll, removePoll, setPollSchedule, togglePollActive } = useApp();
  const [suggInput, setSuggInput] = useState('');
  const [showSugg, setShowSugg]   = useState(false);
  const [copied, setCopied]       = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(poll.endsAt ? poll.endsAt.split('T')[0] : '');
  const [scheduleTime, setScheduleTime] = useState(poll.endsAt ? poll.endsAt.split('T')[1]?.slice(0,5) : '23:59');

  const isActive = poll.active !== false; // default true
  const isExpired = poll.endsAt && new Date(poll.endsAt) < new Date();
  const isPaused = !isActive;
  const isRest = poll.type === 'restaurant';
  const typeIcon = { date: '📅', food: '🍽', drink: '🍷', restaurant: '🗺' }[poll.type] || '📊';
  const activeOpts = (poll.options || []).filter(o => o.status === 'active');
  const pendingOpts = (poll.options || []).filter(o => o.status === 'pending');
  const totalVotes = activeOpts.reduce((sum, o) => sum + (o.votes?.length || 0), 0);
  const winnerOpt = poll.locked && poll.winner ? poll.options.find(o => o.id === poll.winner) : null;

  const pollClosed = poll.locked || isExpired || isPaused;

  function saveSchedule() {
    const endsAt = scheduleDate ? scheduleDate + 'T' + (scheduleTime || '23:59') : null;
    setPollSchedule(eventId, poll.id, { endsAt });
    setShowSchedule(false);
  }
  function clearSchedule() {
    setPollSchedule(eventId, poll.id, { endsAt: null });
    setScheduleDate(''); setScheduleTime('23:59');
    setShowSchedule(false);
  }

  function fmtEndsAt(iso) {
    try {
      return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return iso; }
  }

  function copyAddr(r) {
    navigator.clipboard?.writeText(r.addr).catch(() => {});
    setCopied(r.label);
    setTimeout(() => setCopied(null), 2000);
  }
  function handleSuggest() {
    if (!suggInput.trim()) return;
    suggestPollOption(eventId, poll.id, suggInput.trim(), userName);
    setSuggInput(''); setShowSugg(false);
  }

  return (
    <div style={{ background: 'white', border: '1px solid ' + (isPaused ? 'var(--border)' : isExpired ? 'rgba(255,107,107,0.3)' : 'var(--border)'), borderRadius: 'var(--r2)', overflow: 'hidden', marginBottom: 14, opacity: isPaused ? 0.75 : 1 }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, marginTop: 1 }}>{typeIcon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{poll.question}</div>
            {isPaused && <span style={{ padding: '2px 8px', borderRadius: 20, background: 'var(--page)', border: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--ink3)' }}>⏸ Paused</span>}
            {isExpired && !poll.locked && <span style={{ padding: '2px 8px', borderRadius: 20, background: 'var(--coral-light)', border: '1px solid rgba(255,107,107,0.3)', fontSize: 10, fontWeight: 700, color: 'var(--coral)' }}>⏰ Expired</span>}
            {poll.locked && <span style={{ padding: '2px 8px', borderRadius: 20, background: 'var(--teal-light)', fontSize: 10, fontWeight: 700, color: '#07A87B' }}>🔒 Decided</span>}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink3)' }}>
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
            {poll.endsAt && !isExpired && !poll.locked && ' · Closes ' + fmtEndsAt(poll.endsAt)}
            {poll.timezone && !poll.locked && ' · ' + poll.timezone.split('/').slice(-1)[0].replace('_', ' ')}
          </div>
        </div>
        {/* Host controls */}
        {isHost && !poll.locked && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            {/* On/Off toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink3)' }}>{isActive ? 'On' : 'Off'}</span>
              <div onClick={() => togglePollActive(eventId, poll.id)}
                style={{ width: 36, height: 20, borderRadius: 10, background: isActive ? 'var(--teal)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: isActive ? 19 : 3, transition: 'left .2s' }} />
              </div>
            </div>
            {/* Schedule button */}
            <button onClick={() => setShowSchedule(v => !v)}
              style={{ padding: '4px 9px', borderRadius: 'var(--r)', border: '1px solid ' + (poll.endsAt ? 'var(--indigo)' : 'var(--border)'), background: poll.endsAt ? 'var(--indigo-light)' : 'white', color: poll.endsAt ? 'var(--indigo)' : 'var(--ink2)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
              ⏰ {poll.endsAt ? 'Scheduled' : 'Schedule'}
            </button>
            {/* Remove */}
            <button onClick={() => removePoll(eventId, poll.id)}
              style={{ padding: '4px 9px', borderRadius: 'var(--r)', border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>✕</button>
          </div>
        )}
      </div>

      {/* Schedule panel */}
      {isHost && showSchedule && !poll.locked && (
        <div style={{ padding: '14px 18px', background: 'var(--indigo-light)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo)', marginBottom: 10 }}>⏰ Poll End Date & Time</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>End Date</label>
              <input type="date" className="form-input" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ fontSize: 12 }} />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>End Time</label>
              <input type="time" className="form-input" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} style={{ fontSize: 12 }} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--indigo)', marginBottom: 10, opacity: 0.8 }}>
            Poll automatically closes and locks voting at this date and time.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={saveSchedule}>Save Schedule</button>
            {poll.endsAt && <button className="btn btn-ghost btn-sm" onClick={clearSchedule}>Clear</button>}
            <button className="btn btn-ghost btn-sm" onClick={() => setShowSchedule(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Winner banner */}
      {winnerOpt && (
        <div style={{ padding: '10px 18px', background: 'var(--teal-light)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#07A87B' }}>Decided: {winnerOpt.label}</span>
          {isRest && winnerOpt.addr && (
            <span style={{ fontSize: 12, color: 'var(--ink2)', marginLeft: 4 }}>· {winnerOpt.addr}</span>
          )}
        </div>
      )}

      {/* Closed / paused notice */}
      {(isPaused || isExpired) && !poll.locked && (
        <div style={{ padding: '8px 18px', background: isPaused ? 'var(--page)' : 'var(--coral-light)', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: isPaused ? 'var(--ink3)' : 'var(--coral)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isPaused ? '⏸ This poll is paused — voting temporarily disabled' : '⏰ This poll has ended — voting is now closed'}
        </div>
      )}

      {/* Options */}
      <div style={{ padding: '12px 18px' }}>
        {activeOpts.map(opt => {
          const count = opt.votes?.length || 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const voted = opt.votes?.includes(userName);
          const isWinner = poll.locked && poll.winner === opt.id;

          return (
            <div key={opt.id} style={{ marginBottom: 14 }}>
              <div onClick={() => !pollClosed && votePoll(eventId, poll.id, opt.id, userName)}
                style={{ cursor: pollClosed ? 'default' : 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: 1 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (voted ? 'var(--indigo)' : 'var(--border)'), background: voted ? 'var(--indigo)' : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                      {voted && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: isWinner ? 700 : 600, color: isWinner ? '#07A87B' : 'var(--ink)' }}>{opt.label}</div>
                      {/* Restaurant meta */}
                      {isRest && (
                        <div style={{ marginTop: 4 }}>
                          {opt.rating && <Stars rating={opt.rating} />}
                          {opt.cuisine && <span style={{ fontSize: 10, marginLeft: 6, background: 'var(--indigo-light)', color: 'var(--indigo)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{opt.cuisine}</span>}
                          {opt.price && <span style={{ fontSize: 11, color: 'var(--ink3)', marginLeft: 6, fontWeight: 600 }}>{opt.price}</span>}
                          {opt.addr && (
                            <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                              📍 {opt.addr}
                              <button onClick={e => { e.stopPropagation(); copyAddr(opt); }}
                                style={{ padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', background: 'white', fontSize: 10, fontWeight: 600, cursor: 'pointer', color: copied === opt.label ? '#07A87B' : 'var(--ink2)' }}>
                                {copied === opt.label ? '✓ Copied' : '📋 Copy'}
                              </button>
                              <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(opt.label + ' ' + opt.addr)}
                                target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                                style={{ padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)', background: 'white', fontSize: 10, fontWeight: 600, color: 'var(--sky)', textDecoration: 'none' }}>
                                🗺 Maps
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: voted ? 'var(--indigo)' : 'var(--ink3)', flexShrink: 0 }}>{count} · {pct}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--page)', borderRadius: 4, overflow: 'hidden', marginLeft: 26 }}>
                  <div style={{ height: '100%', width: pct + '%', background: isWinner ? 'var(--teal)' : voted ? 'var(--indigo)' : 'var(--indigo-mid)', borderRadius: 4, transition: 'width .4s' }} />
                </div>
                {opt.votes?.length > 0 && (
                  <div style={{ display: 'flex', gap: 3, marginTop: 5, marginLeft: 26, flexWrap: 'wrap' }}>
                    {opt.votes.map((v, i) => (
                      <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'var(--indigo)', border: '1.5px solid white' }}>
                        {v.split(' ').map(x => x[0]).join('').slice(0, 2)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {isHost && !pollClosed && count > 0 && (
                <button onClick={() => lockPoll(eventId, poll.id, opt.id)}
                  style={{ marginTop: 5, marginLeft: 26, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'white', color: 'var(--ink2)', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
                  ✓ Pick this
                </button>
              )}
            </div>
          );
        })}

        {/* Pending suggestions */}
        {isHost && pendingOpts.length > 0 && (
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--amber-light)', borderRadius: 'var(--r)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {pendingOpts.length} Guest Suggestion{pendingOpts.length > 1 ? 's' : ''} to Review
            </div>
            {pendingOpts.map(opt => (
              <div key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{opt.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink3)', marginLeft: 6 }}>by {opt.suggestedBy}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => reviewPollSuggestion(eventId, poll.id, opt.id, false)}
                    style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(255,107,107,0.4)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
                  <button onClick={() => reviewPollSuggestion(eventId, poll.id, opt.id, true)}
                    style={{ padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(10,207,151,0.4)', background: 'white', color: 'var(--teal)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Accept</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggest option */}
        {!pollClosed && poll.allowSuggestions && !isHost && poll.type !== 'restaurant' && poll.type !== 'date' && (
          <div style={{ marginTop: 10 }}>
            {showSugg ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '7px 10px' }}
                  placeholder="Suggest an option..." value={suggInput} onChange={e => setSuggInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSuggest()} autoFocus />
                <button className="btn btn-primary btn-sm" onClick={handleSuggest}>Send</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowSugg(false)}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowSugg(true)}
                style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--ink2)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                + Suggest an option
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Polls Panel ──────────────────────────────────────────────────────────────
export default function PollsPanel({ event, isHost, userName }) {
  const [showCreate, setShowCreate] = useState(false);
  const polls = event.polls || [];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="sec-label" style={{ margin: 0 }}>{polls.length} Active Poll{polls.length !== 1 ? 's' : ''}</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 3 }}>Results are visible to all guests</div>
        </div>
        {isHost && <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Add Poll</button>}
      </div>

      {polls.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--page)', borderRadius: 'var(--r2)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 4 }}>No polls yet</div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {isHost ? 'Add a date, food, drinks, or restaurant poll.' : 'The host hasn\'t added any polls yet.'}
          </div>
          {isHost && <button className="btn btn-primary btn-sm" style={{ marginTop: 14 }} onClick={() => setShowCreate(true)}>+ Add Poll</button>}
        </div>
      )}

      {polls.map(poll => (
        <PollCard key={poll.id} poll={poll} eventId={event.id} isHost={isHost} userName={userName} />
      ))}

      {showCreate && <CreatePollModal eventId={event.id} onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ── Inline Poll Adder (used inside CreateEventModal) ─────────────────────────
export function InlinePollAdder({ polls = [], onAdd, onRemove }) {
  const [showCreate, setShowCreate] = useState(false);
  const [pendingPolls, setPendingPolls] = useState(polls);
  const { profile } = useApp();

  function handleAdd(poll) {
    const np = { ...poll, id: Date.now(), locked: false, winner: null };
    const updated = [...pendingPolls, np];
    setPendingPolls(updated);
    onAdd(updated);
    setShowCreate(false);
  }

  function handleRemove(id) {
    const updated = pendingPolls.filter(p => p.id !== id);
    setPendingPolls(updated);
    onRemove(updated);
  }

  return (
    <div>
      {pendingPolls.map(poll => {
        const icon = { date: '📅', food: '🍽', drink: '🍷', restaurant: '🗺' }[poll.type] || '📊';
        return (
          <div key={poll.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{poll.question}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{poll.options.length} options</div>
              </div>
            </div>
            <button onClick={() => handleRemove(poll.id)}
              style={{ padding: '4px 10px', borderRadius: 'var(--r)', border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Remove</button>
          </div>
        );
      })}
      <button onClick={() => setShowCreate(true)}
        style={{ width: '100%', padding: '9px 16px', borderRadius: 'var(--r)', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--indigo)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        + Add a Poll
      </button>
      {showCreate && (
        <InlineCreateWrapper onSave={handleAdd} onClose={() => setShowCreate(false)} profile={profile} />
      )}
    </div>
  );
}

// Thin wrapper so InlinePollAdder can call CreatePollModal logic without context
function InlineCreateWrapper({ onSave, onClose, profile }) {
  const [type, setType]         = useState('date');
  const [question, setQuestion] = useState('');
  const [dateOptions, setDateOptions] = useState([{ date: '', time: '19:00' }, { date: '', time: '19:00' }]);
  const [textOptions, setTextOptions] = useState(['', '']);
  const [restOptions, setRestOptions] = useState([]);
  const tz = profile?.timezone || 'America/Chicago';
  const presets = type === 'food' ? FOOD_PRESETS : type === 'drink' ? DRINK_PRESETS : [];

  function formatDateLabel(d, t) {
    if (!d) return '';
    try {
      const dt = new Date(d + 'T' + (t || '19:00'));
      return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: tz }) +
             ' · ' + dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz });
    } catch { return d; }
  }

  function save() {
    let builtOptions = [];
    if (type === 'date') {
      const filled = dateOptions.filter(o => o.date);
      if (filled.length < 2) { alert('Add at least 2 date options.'); return; }
      builtOptions = filled.map((o, i) => ({ id: i+1, label: formatDateLabel(o.date, o.time), date: o.date, time: o.time, votes: [], status: 'active' }));
    } else if (type === 'restaurant') {
      if (restOptions.length < 2) { alert('Add at least 2 restaurants.'); return; }
      builtOptions = restOptions.map((r, i) => ({ id: i+1, label: r.name, addr: r.addr, rating: r.rating, cuisine: r.type, price: r.price, votes: [], status: 'active' }));
    } else {
      const filled = textOptions.filter(o => o.trim());
      if (filled.length < 2) { alert('Add at least 2 options.'); return; }
      builtOptions = filled.map((label, i) => ({ id: i+1, label, votes: [], status: 'active' }));
    }
    const defaults = { date: 'Which date works best?', food: 'What should we eat?', drink: 'What should we drink?', restaurant: 'Where should we dine?' };
    onSave({ type, question: question.trim() || defaults[type], options: builtOptions, allowSuggestions: true, timezone: tz });
    onClose();
  }

  return (
    <div style={{ marginTop: 12, background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Configure Poll</div>
        <div onClick={onClose} style={{ cursor: 'pointer', color: 'var(--ink3)', fontSize: 14 }}>✕</div>
      </div>
      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Poll Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
          {POLL_TYPES.map(pt => (
            <div key={pt.id} onClick={() => { setType(pt.id); setQuestion(''); }}
              style={{ padding: '8px 10px', borderRadius: 10, border: '1.5px solid ' + (type === pt.id ? 'var(--indigo)' : 'var(--border)'), background: type === pt.id ? 'var(--indigo-light)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all .18s' }}>
              <span style={{ fontSize: 16 }}>{pt.icon}</span>
              <div style={{ fontSize: 12, fontWeight: 700, color: type === pt.id ? 'var(--indigo)' : 'var(--ink)' }}>{pt.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Question (optional)</label>
        <input className="form-input" value={question} onChange={e => setQuestion(e.target.value)}
          placeholder={{ date: 'Which date works best?', food: 'What should we eat?', drink: 'What should we drink?', restaurant: 'Where should we dine?' }[type]} />
      </div>
      {type === 'date' && <DateOptionBuilder options={dateOptions} onChange={setDateOptions} timezone={tz} />}
      {(type === 'food' || type === 'drink') && (
        <>
          {presets.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>{presets.map(p => <div key={p} onClick={() => setTextOptions(prev => prev[prev.length-1]==='' ? [...prev.slice(0,-1),p] : [...prev,p])} style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 11, cursor: 'pointer', color: 'var(--ink2)', background: 'white' }}>{p}</div>)}</div>}
          {textOptions.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="form-input" placeholder={'Option ' + (i+1)} value={opt} onChange={e => setTextOptions(prev => prev.map((o,j) => j===i ? e.target.value : o))} style={{ flex: 1 }} />
              {textOptions.length > 2 && <button onClick={() => setTextOptions(prev => prev.filter((_,j) => j!==i))} style={{ padding: '0 10px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'white', color: 'var(--coral)', cursor: 'pointer' }}>✕</button>}
            </div>
          ))}
          <button onClick={() => setTextOptions(prev => [...prev,''])} style={{ padding: '6px', borderRadius: 'var(--r)', border: '1px dashed var(--border)', background: 'transparent', color: 'var(--ink2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, width: '100%', marginBottom: 10 }}>+ Add option</button>
        </>
      )}
      {type === 'restaurant' && (
        <div style={{ marginBottom: 10 }}>
          <RestaurantSearch onSelect={r => { if (!restOptions.find(o => o.name===r.name)) setRestOptions(prev => [...prev, r]); }} />
          {restOptions.map(r => (
            <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--indigo-light)', borderRadius: 6, marginTop: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo)' }}>{r.name} · {r.rating}★</span>
              <button onClick={() => setRestOptions(prev => prev.filter(x => x.name!==r.name))} style={{ padding: '2px 7px', borderRadius: 4, border: '1px solid rgba(108,93,211,0.3)', background: 'white', color: 'var(--indigo)', cursor: 'pointer', fontSize: 11 }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={save}>Add Poll</button>
      </div>
    </div>
  );
}
