import React, { useState, useRef, useEffect } from 'react';
import { EMOJI_CATEGORIES, EMOJI_PRESETS } from '../data/seed';

/**
 * EmojiPickerInline — full panel, always visible (for use inside a modal section)
 */
export function EmojiPickerInline({ onSelect }) {
  const [activeCat, setActiveCat] = useState(0);
  return (
    <div className="emoji-picker-panel" style={{ position: 'static', width: '100%', boxShadow: 'none', border: '1px solid var(--border)', animation: 'none' }}>
      <div className="emoji-categories">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={i}
            className={`emoji-cat-btn ${activeCat === i ? 'active' : ''}`}
            onMouseDown={e => { e.preventDefault(); setActiveCat(i); }}
            title={cat.name}
          >{cat.label}</button>
        ))}
      </div>
      <div className="emoji-grid">
        {EMOJI_CATEGORIES[activeCat].emojis.map((em, i) => (
          <button
            key={i}
            className="emoji-btn"
            onMouseDown={e => { e.preventDefault(); onSelect(em); }}
          >{em}</button>
        ))}
      </div>
    </div>
  );
}

/**
 * EmojiPresetsRow — preset row with "+" button that opens full picker dropdown
 */
export function EmojiPresetsRow({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <div className="emoji-presets">
        {EMOJI_PRESETS.map((em, i) => (
          <button
            key={i}
            className={`emoji-preset-btn ${selected === em ? 'selected' : ''}`}
            onMouseDown={e => { e.preventDefault(); onSelect(em); }}
          >{em}</button>
        ))}
        <button
          className="emoji-more-btn"
          onMouseDown={e => { e.preventDefault(); setOpen(o => !o); }}
          title="More emojis"
        >+ More</button>
      </div>

      {open && (
        <div className="emoji-picker-panel" style={{ left: 0, right: 'auto', top: '100%', marginTop: 4 }}>
          <div className="emoji-categories">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                className={`emoji-cat-btn ${activeCat === i ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); setActiveCat(i); }}
                title={cat.name}
              >{cat.label}</button>
            ))}
          </div>
          <div className="emoji-grid">
            {EMOJI_CATEGORIES[activeCat].emojis.map((em, i) => (
              <button
                key={i}
                className="emoji-btn"
                onMouseDown={e => { e.preventDefault(); onSelect(em); setOpen(false); }}
              >{em}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * EmojiTrigger — small 😊 button on input that opens picker
 */
export function EmojiTrigger({ onSelect, above }) {
  const [open, setOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
      <button
        type="button"
        className="emoji-trigger"
        style={{ position: 'static', transform: 'none', fontSize: 16, color: 'var(--ink3)' }}
        onMouseDown={e => { e.preventDefault(); setOpen(o => !o); }}
        title="Add emoji"
      >😊</button>

      {open && (
        <div className={`emoji-picker-panel ${above ? 'above' : ''}`}>
          <div className="emoji-categories">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                className={`emoji-cat-btn ${activeCat === i ? 'active' : ''}`}
                onMouseDown={e => { e.preventDefault(); setActiveCat(i); }}
                title={cat.name}
              >{cat.label}</button>
            ))}
          </div>
          <div className="emoji-grid">
            {EMOJI_CATEGORIES[activeCat].emojis.map((em, i) => (
              <button
                key={i}
                className="emoji-btn"
                onMouseDown={e => { e.preventDefault(); onSelect(em); setOpen(false); }}
              >{em}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmojiPresetsRow;
