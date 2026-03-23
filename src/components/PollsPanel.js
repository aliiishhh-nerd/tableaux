import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';

const POLL_TYPES = [
  { id: 'date',  icon: '📅', label: 'Date poll',  hint: 'Let guests vote on the best date' },
  { id: 'food',  icon: '🍽', label: 'Food poll',  hint: 'Vote on cuisine or menu style' },
  { id: 'drink', icon: '🍷', label: 'Drinks poll', hint: 'Vote on wine, cocktails, or mocktails' },
];

const FOOD_PRESETS  = ['Italian','Japanese','Thai','Mexican','Mediterranean','Korean BBQ','Indian','French','Vegan / plant-based','Seafood'];
const DRINK_PRESETS = ['Natural wine','Craft cocktails','Beer & cider','Non-alcoholic / mocktails','Sake','Champagne','Mezcal & tequila','BYO'];

// ─── Create Poll Modal ────────────────────────────────────────────────────────
function CreatePollModal({ eventId, onClose }) {
  const { addPoll } = useApp();
  const [type, setType]           = useState('date');
  const [question, setQuestion]   = useState('');
  const [options, setOptions]     = useState(['', '']);
  const [allowSugg, setAllowSugg] = useState(true);

  function applyPreset(val) {
    setOptions(prev => prev[prev.length - 1] === '' ? [...prev.slice(0, -1), val] : [...prev, val]);
  }

  function save() {
    const filled = options.filter(o => o.trim());
    if (filled.length < 2) { alert('Add at least 2 options.'); return; }
    const defaultQ = type === 'date' ? "Which date works best?" : type === 'food' ? "What should we eat?" : "What should we drink?";
    addPoll(eventId, {
      type,
      question: question.trim() || defaultQ,
      options: filled.map((label, i) => ({ id: i + 1, label, votes: [], status: 'active' })),
      allowSuggestions: allowSugg,
    });
    onClose();
  }

  const presets = type === 'food' ? FOOD_PRESETS : type === 'drink' ? DRINK_PRESETS : [];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,20,45,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, width: 520, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(17,20,45,0.18)' }}>
        <div style={{ padding: '24px 28px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Add a Poll</div>
          <div onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--page)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: 'var(--ink2)' }}>✕</div>
        </div>
        <div style={{ padding: '20px 28px' }}>
          {/* Poll type */}
          <div className="form-group">
            <label className="form-label">Poll Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {POLL_TYPES.map(pt => (
                <div key={pt.id} onClick={() => { setType(pt.id); setOptions(['','']); setQuestion(''); }}
                  style={{ padding: '12px 10px', borderRadius: 12, border: `1.5px solid ${type === pt.id ? 'var(--indigo)' : 'var(--border)'}`, background: type === pt.id ? 'var(--indigo-light)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all .18s' }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{pt.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: type === pt.id ? 'var(--indigo)' : 'var(--ink)' }}>{pt.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink3)', marginTop: 2, lineHeight: 1.4 }}>{pt.hint}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="form-group">
            <label className="form-label">Question <span style={{ color: 'var(--ink3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
            <input className="form-input" value={question} onChange={e => setQuestion(e.target.value)}
              placeholder={type === 'date' ? "Which date works best?" : type === 'food' ? "What should we eat?" : "What should we drink?"} />
          </div>

          {/* Presets for food/drink */}
          {presets.length > 0 && (
            <div className="form-group">
              <label className="form-label">Quick Add</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {presets.map(p => (
                  <div key={p} onClick={() => applyPreset(p)}
                    style={{ padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 12, fontWeight: 500, cursor: 'pointer', color: 'var(--ink2)', background: 'white', transition: 'all .15s' }}
                    onMouseEnter={e => { e.target.style.borderColor = 'var(--indigo)'; e.target.style.color = 'var(--indigo)'; }}
                    onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--ink2)'; }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="form-group">
            <label className="form-label">Options</label>
            {options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="form-input" placeholder={type === 'date' ? `Date option ${i + 1} (e.g. Sat Apr 19)` : `Option ${i + 1}`}
                  value={opt} onChange={e => setOptions(prev => prev.map((o, j) => j === i ? e.target.value : o))} style={{ flex: 1 }} />
                {options.length > 2 && (
                  <button onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))}
                    style={{ padding: '0 12px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setOptions(prev => [...prev, ''])}
              style={{ padding: '7px 16px', borderRadius: 'var(--r)', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--ink2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, width: '100%' }}>
              + Add another option
            </button>
          </div>

          {/* Allow suggestions toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--page)', borderRadius: 'var(--r)', marginBottom: 4 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Allow guests to suggest options</div>
              <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>You can accept or reject suggestions before they go live</div>
            </div>
            <div onClick={() => setAllowSugg(v => !v)}
              style={{ width: 40, height: 22, borderRadius: 11, background: allowSugg ? 'var(--indigo)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: allowSugg ? 21 : 3, transition: 'left .2s' }} />
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>Add Poll</button>
        </div>
      </div>
    </div>
  );
}

// ─── Single Poll Card ─────────────────────────────────────────────────────────
function PollCard({ poll, eventId, isHost, userName }) {
  const { votePoll, suggestPollOption, reviewPollSuggestion, lockPoll, removePoll } = useApp();
  const [suggInput, setSuggInput] = useState('');
  const [showSugg, setShowSugg] = useState(false);

  const typeIcon = poll.type === 'date' ? '📅' : poll.type === 'food' ? '🍽' : '🍷';
  const activeOpts = (poll.options || []).filter(o => o.status === 'active');
  const pendingOpts = (poll.options || []).filter(o => o.status === 'pending');
  const totalVotes = activeOpts.reduce((sum, o) => sum + (o.votes?.length || 0), 0);

  const winnerOpt = poll.locked && poll.winner
    ? poll.options.find(o => o.id === poll.winner)
    : null;

  function handleSuggest() {
    if (!suggInput.trim()) return;
    suggestPollOption(eventId, poll.id, suggInput.trim(), userName);
    setSuggInput('');
    setShowSugg(false);
  }

  return (
    <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r2)', overflow: 'hidden', marginBottom: 14 }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{typeIcon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{poll.question}</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>
            {poll.locked ? '🔒 Decided' : `${totalVotes} vote${totalVotes !== 1 ? 's' : ''} · ${poll.allowSuggestions ? 'Suggestions allowed' : 'Host options only'}`}
          </div>
        </div>
        {isHost && !poll.locked && (
          <button onClick={() => removePoll(eventId, poll.id)}
            style={{ padding: '4px 10px', borderRadius: 'var(--r)', border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Remove</button>
        )}
      </div>

      {/* Winner banner */}
      {winnerOpt && (
        <div style={{ padding: '10px 18px', background: 'var(--teal-light)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>✅</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#07A87B' }}>Decided: {winnerOpt.label}</span>
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
            <div key={opt.id} onClick={() => !poll.locked && votePoll(eventId, poll.id, opt.id, userName)}
              style={{ marginBottom: 10, cursor: poll.locked ? 'default' : 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${voted ? 'var(--indigo)' : 'var(--border)'}`, background: voted ? 'var(--indigo)' : 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {voted && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isWinner ? 700 : 500, color: isWinner ? '#07A87B' : 'var(--ink)' }}>{opt.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: voted ? 'var(--indigo)' : 'var(--ink3)' }}>{count} · {pct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--page)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: isWinner ? 'var(--teal)' : voted ? 'var(--indigo)' : 'var(--indigo-mid)', borderRadius: 4, transition: 'width .4s' }} />
              </div>
              {/* Voter avatars */}
              {opt.votes?.length > 0 && (
                <div style={{ display: 'flex', gap: 3, marginTop: 5, flexWrap: 'wrap' }}>
                  {opt.votes.map((v, i) => (
                    <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--indigo-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: 'var(--indigo)', border: '1.5px solid white' }}>
                      {v.split(' ').map(x => x[0]).join('').slice(0, 2)}
                    </div>
                  ))}
                </div>
              )}
              {/* Host: lock this as winner */}
              {isHost && !poll.locked && count > 0 && (
                <button onClick={e => { e.stopPropagation(); lockPoll(eventId, poll.id, opt.id); }}
                  style={{ marginTop: 5, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'white', color: 'var(--ink2)', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
                  ✓ Pick this
                </button>
              )}
            </div>
          );
        })}

        {/* Pending suggestions (host review) */}
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

        {/* Suggest an option (guests) */}
        {!poll.locked && poll.allowSuggestions && !isHost && (
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

// ─── Polls Panel (used in EventDetailModal) ───────────────────────────────────
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
        {isHost && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Add Poll</button>
        )}
      </div>

      {polls.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--page)', borderRadius: 'var(--r2)', border: '1px dashed var(--border)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📊</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 4 }}>No polls yet</div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {isHost ? 'Add a date, food, or drinks poll to get input from your guests.' : 'The host hasn\'t added any polls yet.'}
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

// ─── Inline Poll Adder (used inside CreateEventModal) ─────────────────────────
export function InlinePollAdder({ polls = [], onAdd, onRemove }) {
  const [showCreate, setShowCreate] = useState(false);
  const [pendingPolls, setPendingPolls] = useState(polls);

  function handleAdd(poll) {
    const newPoll = { ...poll, id: Date.now(), locked: false, winner: null };
    const updated = [...pendingPolls, newPoll];
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
        const icon = poll.type === 'date' ? '📅' : poll.type === 'food' ? '🍽' : '🍷';
        return (
          <div key={poll.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r)', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{poll.question}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)' }}>{poll.options.length} options · {poll.allowSuggestions ? 'Guests can suggest' : 'Fixed options'}</div>
              </div>
            </div>
            <button onClick={() => handleRemove(poll.id)}
              style={{ padding: '4px 10px', borderRadius: 'var(--r)', border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Remove</button>
          </div>
        );
      })}
      <button onClick={() => setShowCreate(true)}
        style={{ width: '100%', padding: '9px 16px', borderRadius: 'var(--r)', border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--indigo)', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all .18s' }}>
        + Add a Poll
      </button>
      {showCreate && (
        <InlineCreateModal onSave={handleAdd} onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}

// Stripped-down create modal for use inside CreateEventModal
function InlineCreateModal({ onSave, onClose }) {
  const [type, setType]           = useState('date');
  const [question, setQuestion]   = useState('');
  const [options, setOptions]     = useState(['', '']);
  const [allowSugg, setAllowSugg] = useState(true);
  const presets = type === 'food' ? FOOD_PRESETS : type === 'drink' ? DRINK_PRESETS : [];

  function applyPreset(val) {
    setOptions(prev => prev[prev.length - 1] === '' ? [...prev.slice(0, -1), val] : [...prev, val]);
  }

  function save() {
    const filled = options.filter(o => o.trim());
    if (filled.length < 2) { alert('Add at least 2 options.'); return; }
    const defaultQ = type === 'date' ? "Which date works best?" : type === 'food' ? "What should we eat?" : "What should we drink?";
    onSave({
      type, question: question.trim() || defaultQ,
      options: filled.map((label, i) => ({ id: i + 1, label, votes: [], status: 'active' })),
      allowSuggestions: allowSugg,
    });
  }

  return (
    <div style={{ marginTop: 12, background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 18 }}>
      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Poll Type</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {POLL_TYPES.map(pt => (
            <div key={pt.id} onClick={() => { setType(pt.id); setOptions(['','']); setQuestion(''); }}
              style={{ flex: 1, padding: '8px 6px', borderRadius: 10, border: `1.5px solid ${type === pt.id ? 'var(--indigo)' : 'var(--border)'}`, background: type === pt.id ? 'var(--indigo-light)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all .18s' }}>
              <div style={{ fontSize: 16 }}>{pt.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: type === pt.id ? 'var(--indigo)' : 'var(--ink2)', marginTop: 3 }}>{pt.label.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Question</label>
        <input className="form-input" value={question} onChange={e => setQuestion(e.target.value)}
          placeholder={type === 'date' ? "Which date works best?" : type === 'food' ? "What should we eat?" : "What should we drink?"} />
      </div>
      {presets.length > 0 && (
        <div className="form-group" style={{ marginBottom: 14 }}>
          <label className="form-label">Quick Add</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {presets.map(p => (
              <div key={p} onClick={() => applyPreset(p)}
                style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid var(--border)', fontSize: 11, fontWeight: 500, cursor: 'pointer', color: 'var(--ink2)', background: 'white' }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="form-group" style={{ marginBottom: 14 }}>
        <label className="form-label">Options</label>
        {options.map((opt, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input className="form-input" placeholder={type === 'date' ? `Date option ${i + 1}` : `Option ${i + 1}`}
              value={opt} onChange={e => setOptions(prev => prev.map((o, j) => j === i ? e.target.value : o))} style={{ flex: 1 }} />
            {options.length > 2 && (
              <button onClick={() => setOptions(prev => prev.filter((_, j) => j !== i))}
                style={{ padding: '0 10px', borderRadius: 'var(--r)', border: '1px solid var(--border)', background: 'white', color: 'var(--coral)', cursor: 'pointer' }}>✕</button>
            )}
          </div>
        ))}
        <button onClick={() => setOptions(prev => [...prev, ''])}
          style={{ padding: '6px 14px', borderRadius: 'var(--r)', border: '1px dashed var(--border)', background: 'transparent', color: 'var(--ink2)', cursor: 'pointer', fontSize: 12, fontWeight: 600, width: '100%' }}>
          + Add option
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>Allow guest suggestions (you approve them)</div>
        <div onClick={() => setAllowSugg(v => !v)}
          style={{ width: 36, height: 20, borderRadius: 10, background: allowSugg ? 'var(--indigo)' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: allowSugg ? 19 : 3, transition: 'left .2s' }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary btn-sm" onClick={save}>Add Poll</button>
      </div>
    </div>
  );
}
