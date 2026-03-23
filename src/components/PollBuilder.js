import React, { useState } from 'react';

const POLL_TYPES = [
  { id: 'date',  icon: '📅', label: 'Date poll',   desc: 'Let guests vote on when to meet' },
  { id: 'food',  icon: '🍽',  label: 'Food poll',   desc: 'Vote on what to eat or cook' },
  { id: 'drink', icon: '🍷',  label: 'Drinks poll', desc: 'Vote on what to drink' },
];

const FOOD_PRESETS  = ['Italian', 'Japanese', 'Mexican', 'Thai', 'Mediterranean', 'Korean BBQ', 'Indian', 'French', 'American BBQ', 'Vegan / Plant-based'];
const DRINK_PRESETS = ['Natural wine', 'Craft cocktails', 'Beer & cider', 'Sake', 'Non-alcoholic', 'Champagne / Sparkling', 'Whiskey & spirits', 'Mezcal'];

function newOpt(label) { return { id: Date.now() + Math.random(), label, votes: [], status: 'active' }; }
function nextDay(offset) {
  const d = new Date(); d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
}

export default function PollBuilder({ polls, onChange }) {
  const [adding, setAdding] = useState(null); // null | 'date' | 'food' | 'drink'
  const [draft, setDraft] = useState({ question: '', options: [], allowSuggestions: true });
  const [customOpt, setCustomOpt] = useState('');

  function startAdding(type) {
    const defaults = {
      date:  { question: 'When works best for you?',    options: [newOpt(nextDay(7)), newOpt(nextDay(14))] },
      food:  { question: 'What should we eat?',          options: [] },
      drink: { question: 'What should we drink?',        options: [] },
    };
    setDraft({ ...defaults[type], type, allowSuggestions: true });
    setAdding(type);
    setCustomOpt('');
  }

  function addOption(label) {
    if (!label.trim()) return;
    setDraft(d => ({ ...d, options: [...d.options, newOpt(label.trim())] }));
    setCustomOpt('');
  }

  function removeOption(id) {
    setDraft(d => ({ ...d, options: d.options.filter(o => o.id !== id) }));
  }

  function updateDateOpt(id, val) {
    setDraft(d => ({ ...d, options: d.options.map(o => o.id === id ? { ...o, label: val } : o) }));
  }

  function confirmPoll() {
    if (draft.options.length < 2) { alert('Add at least 2 options.'); return; }
    const poll = { ...draft, id: Date.now(), locked: false, winner: null };
    onChange([...polls, poll]);
    setAdding(null);
  }

  function removePoll(id) { onChange(polls.filter(p => p.id !== id)); }

  const presets = adding === 'food' ? FOOD_PRESETS : adding === 'drink' ? DRINK_PRESETS : [];

  return (
    <div>
      {/* Existing polls summary */}
      {polls.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {polls.map(p => {
            const meta = POLL_TYPES.find(t => t.id === p.type);
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{meta?.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{p.question}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{p.options.length} options · {meta?.label}</div>
                  </div>
                </div>
                <button onClick={() => removePoll(p.id)} style={{ background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add poll type picker */}
      {!adding && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {POLL_TYPES.map(t => (
            <button key={t.id} onClick={() => startAdding(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 20, border: '1.5px solid var(--border)', background: 'white', color: 'var(--ink2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink2)'; }}>
              <span style={{ fontSize: 14 }}>{t.icon}</span> + {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Poll builder panel */}
      {adding && (
        <div style={{ background: 'var(--page)', border: '1.5px solid var(--border)', borderRadius: 'var(--r2)', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
              {POLL_TYPES.find(t => t.id === adding)?.icon} {POLL_TYPES.find(t => t.id === adding)?.label}
            </div>
            <button onClick={() => setAdding(null)} style={{ background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: 18 }}>×</button>
          </div>

          {/* Question */}
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Poll question</label>
            <input className="form-input" value={draft.question} onChange={e => setDraft(d => ({ ...d, question: e.target.value }))} />
          </div>

          {/* Options */}
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Options ({draft.options.length})</label>
            {draft.options.map((o, i) => (
              <div key={o.id} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                {adding === 'date' ? (
                  <input type="date" className="form-input" value={o.label} onChange={e => updateDateOpt(o.id, e.target.value)} style={{ flex: 1 }} />
                ) : (
                  <div style={{ flex: 1, padding: '9px 12px', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--ink)' }}>{o.label}</div>
                )}
                <button onClick={() => removeOption(o.id)} style={{ background: 'none', border: 'none', color: 'var(--ink3)', cursor: 'pointer', fontSize: 16, padding: '0 4px', flexShrink: 0 }}>×</button>
              </div>
            ))}

            {/* Presets for food/drink */}
            {presets.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Quick add</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {presets.filter(p => !draft.options.some(o => o.label === p)).map(p => (
                    <div key={p} onClick={() => addOption(p)} style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', background: 'white', fontSize: 12, cursor: 'pointer', color: 'var(--ink2)', transition: 'all .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--indigo)'; e.currentTarget.style.color = 'var(--indigo)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink2)'; }}>
                      + {p}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom option input */}
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" placeholder={adding === 'date' ? '' : 'Add a custom option...'} value={customOpt} onChange={e => setCustomOpt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addOption(customOpt)} style={{ flex: 1, display: adding === 'date' ? 'none' : undefined }} />
              {adding === 'date' && (
                <button onClick={() => addOption(nextDay(draft.options.length * 7 + 7))} className="btn btn-ghost btn-sm" style={{ whiteSpace: 'nowrap' }}>+ Add date</button>
              )}
              {adding !== 'date' && (
                <button onClick={() => addOption(customOpt)} className="btn btn-ghost btn-sm">Add</button>
              )}
            </div>
          </div>

          {/* Allow suggestions toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)', marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)' }}>Allow guest suggestions</div>
              <div style={{ fontSize: 11, color: 'var(--ink3)' }}>Guests can propose options — you approve or reject them</div>
            </div>
            <div onClick={() => setDraft(d => ({ ...d, allowSuggestions: !d.allowSuggestions }))}
              style={{ width: 40, height: 22, borderRadius: 11, background: draft.allowSuggestions ? 'var(--indigo)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 3, left: draft.allowSuggestions ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left .2s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
            <button className="btn btn-ghost" onClick={() => setAdding(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={confirmPoll}>Add Poll</button>
          </div>
        </div>
      )}
    </div>
  );
}
