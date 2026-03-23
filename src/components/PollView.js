import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';

const TYPE_META = {
  date:  { icon: '📅', color: 'var(--indigo)',      bg: 'var(--indigo-light)' },
  food:  { icon: '🍽',  color: '#D94545',             bg: 'var(--coral-light)' },
  drink: { icon: '🍷',  color: '#07A87B',             bg: 'var(--teal-light)' },
};

function fmtDate(d) {
  try { return new Date(d + 'T12:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }); }
  catch { return d; }
}

export default function PollView({ event, isHost }) {
  const { votePoll, suggestPollOption, reviewPollSuggestion, lockPoll } = useApp();
  const { profile } = useApp();
  const [suggestInputs, setSuggestInputs] = useState({});
  const [showSuggestFor, setShowSuggestFor] = useState(null);

  const polls = event.polls || [];
  if (polls.length === 0) return (
    <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink3)', fontSize: 13 }}>
      No polls yet.{isHost ? ' Add one when editing this event.' : ''}
    </div>
  );

  function handleVote(pollId, optId) {
    if (!event.polls.find(p => p.id === pollId)?.locked) {
      votePoll(event.id, pollId, optId, profile.name);
    }
  }

  function handleSuggest(pollId) {
    const val = suggestInputs[pollId]?.trim();
    if (!val) return;
    suggestPollOption(event.id, pollId, val, profile.name);
    setSuggestInputs(s => ({ ...s, [pollId]: '' }));
    setShowSuggestFor(null);
  }

  function handleLock(pollId, optId) {
    if (window.confirm('Lock this poll and set the winner? This cannot be undone.')) {
      lockPoll(event.id, pollId, optId);
    }
  }

  return (
    <div>
      {polls.map(poll => {
        const meta = TYPE_META[poll.type] || TYPE_META.food;
        const activeOpts = poll.options.filter(o => o.status === 'active');
        const pendingOpts = poll.options.filter(o => o.status === 'pending');
        const totalVotes = activeOpts.reduce((sum, o) => sum + o.votes.length, 0);
        const winner = poll.winner ? poll.options.find(o => o.id === poll.winner) : null;

        return (
          <div key={poll.id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 20, marginBottom: 16 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {meta.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.1px' }}>{poll.question}</div>
                <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>
                  {poll.locked ? '🔒 Locked' : `${totalVotes} vote${totalVotes !== 1 ? 's' : ''} · ${activeOpts.length} options`}
                  {poll.allowSuggestions && !poll.locked && ' · Suggestions welcome'}
                </div>
              </div>
              {poll.locked && winner && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'var(--teal-light)', color: '#07A87B' }}>✓ Decided</span>
              )}
            </div>

            {/* Winner banner */}
            {poll.locked && winner && (
              <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-mid, #9FE1CB)', borderRadius: 'var(--r)', padding: '10px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>🎉</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#07A87B' }}>
                    {poll.type === 'date' ? fmtDate(winner.label) : winner.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#07A87B', opacity: .8 }}>Selected by host · {winner.votes.length} vote{winner.votes.length !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )}

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeOpts.map(opt => {
                const pct = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
                const voted = opt.votes.includes(profile.name);
                const isWinner = poll.winner === opt.id;

                return (
                  <div key={opt.id}
                    onClick={() => !poll.locked && handleVote(poll.id, opt.id)}
                    style={{ position: 'relative', border: `1.5px solid ${voted ? meta.color : 'var(--border)'}`, borderRadius: 'var(--r)', padding: '10px 14px', cursor: poll.locked ? 'default' : 'pointer', overflow: 'hidden', transition: 'border-color .15s', background: isWinner ? meta.bg : 'white' }}>
                    {/* Progress fill */}
                    <div style={{ position: 'absolute', inset: 0, background: meta.bg, width: `${pct}%`, opacity: voted ? .35 : .18, transition: 'width .4s', borderRadius: 'var(--r)', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${voted ? meta.color : 'var(--border)'}`, background: voted ? meta.color : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                          {voted && <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'white' }} />}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: voted ? 600 : 400, color: 'var(--ink)' }}>
                          {poll.type === 'date' ? fmtDate(opt.label) : opt.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>{pct}%</span>
                        <span style={{ fontSize: 11, color: 'var(--ink3)' }}>{opt.votes.length} vote{opt.votes.length !== 1 ? 's' : ''}</span>
                        {isHost && !poll.locked && (
                          <button onClick={e => { e.stopPropagation(); handleLock(poll.id, opt.id); }}
                            style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'white', color: 'var(--ink2)', cursor: 'pointer', fontWeight: 600, marginLeft: 4 }}>
                            Lock ✓
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Host: pending suggestions */}
            {isHost && pendingOpts.length > 0 && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>
                  ⏳ {pendingOpts.length} pending suggestion{pendingOpts.length !== 1 ? 's' : ''}
                </div>
                {pendingOpts.map(opt => (
                  <div key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--amber-light)', border: '1px solid rgba(255,171,0,.25)', borderRadius: 'var(--r)', marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{poll.type === 'date' ? fmtDate(opt.label) : opt.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink3)', marginLeft: 8 }}>suggested by {opt.suggestedBy}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => reviewPollSuggestion(event.id, poll.id, opt.id, false)}
                        style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(255,107,107,.4)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                      <button onClick={() => reviewPollSuggestion(event.id, poll.id, opt.id, true)}
                        style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, border: '1px solid rgba(10,207,151,.4)', background: 'white', color: '#07A87B', cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Guest: suggest option */}
            {poll.allowSuggestions && !poll.locked && !isHost && (
              <div style={{ marginTop: 12 }}>
                {showSuggestFor === poll.id ? (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="form-input" style={{ flex: 1, fontSize: 12, padding: '7px 10px' }}
                      placeholder={poll.type === 'date' ? 'Suggest another date...' : 'Suggest an option...'}
                      value={suggestInputs[poll.id] || ''}
                      onChange={e => setSuggestInputs(s => ({ ...s, [poll.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleSuggest(poll.id)}
                    />
                    <button className="btn btn-ghost btn-sm" onClick={() => handleSuggest(poll.id)}>Submit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowSuggestFor(null)}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setShowSuggestFor(poll.id)}
                    style={{ fontSize: 12, fontWeight: 600, color: meta.color, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    + Suggest an option
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
