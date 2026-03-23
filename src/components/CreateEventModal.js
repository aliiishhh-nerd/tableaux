import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../hooks/useApp';
import { nextDate } from '../data/utils';
import ImagePickerModal from './ImagePickerModal';
import { InlinePollAdder } from './PollsPanel';
import { InlineCohostAdder } from './CohostsPanel';
import { InlineMusicAdder } from './MusicPanel';

const SWATCH_COLORS = ['#6C5DD3','#FF6B6B','#0ACF97','#FFAB00','#4DABF7','#11142D'];
const EVENT_TYPES = ['Dinner Party','Potluck','Restaurant','Brunch'];

export default function CreateEventModal({ editId, onClose, onSaved }) {
  const { events, saveEvent, profile, PLACES, IMAGES } = useApp();
  const editing = editId ? events.find(e => e.id === editId) : null;

  const [title, setTitle]       = useState(editing?.title || '');
  const [type, setType]         = useState(editing?.type || 'Dinner Party');
  const [date, setDate]         = useState(editing?.date || nextDate());
  const [time, setTime]         = useState(editing?.time || '19:00');
  const [loc, setLoc]           = useState(editing?.loc || '');
  const [addr, setAddr]         = useState(editing?.addr || '');
  const [cap, setCap]           = useState(editing?.cap || '');
  const [vis, setVis]           = useState(editing?.vis || 'Public');
  const [desc, setDesc]         = useState(editing?.desc || '');
  const [invHeader, setInvHeader] = useState(editing?.invH || "You're Invited");
  const [invBg, setInvBg]       = useState(editing?.invBg || '#6C5DD3');
  const [invImg, setInvImg]     = useState(editing?.img || '');
  const [invFont, setInvFont]   = useState('sans');
  const [polls, setPolls]       = useState(editing?.polls || []);
  const [cohosts, setCohosts]   = useState(editing?.cohosts || []);
  const [musicUrl, setMusicUrl] = useState(editing?.music?.url || '');
  const [acResults, setAcResults] = useState([]);
  const [showAc, setShowAc]     = useState(false);
  const [showImgPicker, setShowImgPicker] = useState(false);
  const acTimer = useRef(null);

  useEffect(() => {
    if (editing?.addr) setAddr(editing.addr);
  }, [editing]);

  function handleLocInput(v) {
    setLoc(v);
    setAddr('');
    clearTimeout(acTimer.current);
    if (v.length < 2) { setShowAc(false); return; }
    acTimer.current = setTimeout(() => {
      const q = v.toLowerCase();
      const hits = PLACES.filter(p => p.n.toLowerCase().includes(q) || p.a.toLowerCase().includes(q));
      setAcResults(hits);
      setShowAc(hits.length > 0);
    }, 200);
  }

  function selectPlace(p) {
    setLoc(p.n);
    setAddr(p.a);
    setShowAc(false);
  }

  function handleSave() {
    if (!title.trim()) { alert('Please enter an event title.'); return; }
    const ev = {
      id: editId || Date.now(),
      title: title.trim(), type, date, time,
      loc: loc || 'TBD', addr,
      cap: parseInt(cap) || 8, vis, desc,
      host: profile.name, mine: true,
      img: invImg || IMAGES[0].u,
      invH: invHeader, invBg,
      guests: editing ? editing.guests : [],
      pot: editing ? editing.pot : [],
      polls,
      cohosts,
      music: { url: musicUrl, suggestions: editing?.music?.suggestions || [] },
    };
    saveEvent(ev);
    onSaved();
  }

  const gmUrl = addr ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc + ' ' + addr)}` : null;
  const amUrl = addr ? `https://maps.apple.com/?q=${encodeURIComponent(loc)}&address=${encodeURIComponent(addr)}` : null;

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal modal-lg">
          <div className="modal-head">
            <h2>{editId ? 'Edit Event' : 'Host a New Event'}</h2>
            <div className="modal-x" onClick={onClose}>✕</div>
          </div>

          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input className="form-input" placeholder="An Evening of Italian Classics" value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {/* Type */}
            <div className="form-group">
              <label className="form-label">Event Type</label>
              <div className="pill-row">
                {EVENT_TYPES.map(t => (
                  <div key={t} className={`pill ${type === t ? 'on' : ''}`} onClick={() => setType(t)}>{t}</div>
                ))}
              </div>
            </div>

            {/* Date + Time */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input className="form-input" type="time" value={time} onChange={e => setTime(e.target.value)} />
              </div>
            </div>

            {/* Location with autocomplete */}
            <div className="form-group">
              <label className="form-label">Location</label>
              <div className="ac-wrap">
                <input
                  className="form-input"
                  placeholder="Restaurant name or address..."
                  value={loc}
                  onChange={e => handleLocInput(e.target.value)}
                  onBlur={() => setTimeout(() => setShowAc(false), 200)}
                  autoComplete="off"
                />
                {showAc && (
                  <div className="ac-list">
                    {acResults.map(p => (
                      <div key={p.n} className="ac-item" onClick={() => selectPlace(p)}>
                        <span style={{ color: 'var(--indigo)', fontSize: 14, marginTop: 2 }}>📍</span>
                        <div>
                          <div className="ac-name">{p.n}</div>
                          <div className="ac-addr">{p.a}</div>
                        </div>
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

            {/* Capacity + Visibility */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input className="form-input" type="number" placeholder="8" min="2" max="200" value={cap} onChange={e => setCap(e.target.value)} />
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
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" placeholder="Set the scene — the mood, the menu, the dress code..." value={desc} onChange={e => setDesc(e.target.value)} />
            </div>

            {/* MUSIC PLAYLIST */}
            <div style={{ marginTop: 24 }}>
              <label className="form-label" style={{ marginBottom: 10 }}>🎵 Music Playlist <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <InlineMusicAdder musicUrl={musicUrl} onChange={setMusicUrl} />
            </div>

            {/* POLLS */}
            <div style={{ marginTop: 24 }}>
              <label className="form-label" style={{ marginBottom: 12 }}>📊 Polls <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <InlinePollAdder polls={polls} onAdd={setPolls} onRemove={setPolls} />
            </div>

            {/* CO-HOSTS */}
            <div style={{ marginTop: 24 }}>
              <label className="form-label" style={{ marginBottom: 12 }}>👥 Co-hosts <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
              <InlineCohostAdder cohosts={cohosts} onChange={setCohosts} />
            </div>

            {/* INVITATION EDITOR */}
            <div style={{ marginTop: 24 }}>
              <label className="form-label" style={{ marginBottom: 12 }}>✦ Invitation Design</label>
              <div className="inv-wrap">
                {/* Preview hero */}
                <div className="inv-hero">
                  {invImg && <img src={invImg} alt="cover" />}
                  <div style={{ position: 'absolute', inset: 0, background: invImg ? 'transparent' : invBg, transition: 'background 0.35s' }} />
                  <div className="inv-hero-overlay" />
                  <div className="inv-hero-content">
                    <div className="inv-eyebrow">{type}</div>
                    <div className="inv-title-preview" style={{ fontFamily: invFont === 'serif' ? 'Georgia, serif' : 'var(--font)' }}>
                      {title || 'Your Event Title'}
                    </div>
                  </div>
                  <button className="inv-change-btn" onClick={() => setShowImgPicker(true)}>🖼 Change Image</button>
                </div>

                {/* Body preview */}
                <div className="inv-body-preview">
                  <div className="inv-body-h">{invHeader}</div>
                  <div className="inv-body-p">{desc || 'Add a description to personalize your invitation...'}</div>
                </div>

                {/* Controls */}
                <div className="inv-controls">
                  <div className="ctrl-group">
                    <div className="ctrl-label">Header Text</div>
                    <input
                      className="form-input"
                      value={invHeader}
                      onChange={e => setInvHeader(e.target.value)}
                      style={{ padding: '7px 10px', fontSize: 12, width: 180 }}
                    />
                  </div>
                  <div className="ctrl-group">
                    <div className="ctrl-label">Cover Color</div>
                    <div className="swatches">
                      {SWATCH_COLORS.map(c => (
                        <div
                          key={c}
                          className={`swatch ${invBg === c && !invImg ? 'on' : ''}`}
                          style={{ background: c }}
                          onClick={() => { setInvBg(c); setInvImg(''); }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="ctrl-group">
                    <div className="ctrl-label">Title Font</div>
                    <div className="font-btns">
                      <div className={`font-btn ${invFont === 'sans' ? 'on' : ''}`} onClick={() => setInvFont('sans')}>Sans</div>
                      <div className={`font-btn ${invFont === 'serif' ? 'on' : ''}`} style={{ fontFamily: 'Georgia' }} onClick={() => setInvFont('serif')}>Serif</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── POLLS ── */}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>Polls</label>
                <span style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>Optional — date, food, or drinks</span>
              </div>
              <InlinePollAdder polls={polls} onAdd={setPolls} onRemove={setPolls} />
            </div>

            {/* ── CO-HOSTS ── */}
            <div style={{ marginTop: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <label className="form-label" style={{ margin: 0 }}>Co-hosts</label>
                <span style={{ fontSize: 11, color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>Optional — set permissions per co-host</span>
              </div>
              <InlineCohostAdder cohosts={cohosts} onChange={setCohosts} />
            </div>
          </div>

          <div className="modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              {editId ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </div>
      </div>

      {showImgPicker && (
        <ImagePickerModal
          currentImg={invImg}
          onSelect={url => { setInvImg(url); setShowImgPicker(false); }}
          onClose={() => setShowImgPicker(false)}
        />
      )}
    </>
  );
}
