import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';

// ── Helpers ──────────────────────────────────────────────────────────────────
function extractSpotifyId(url) {
  // Handles: https://open.spotify.com/playlist/37i9dQZEVXb...
  const m = url.match(/spotify\.com\/(playlist|album|track)\/([a-zA-Z0-9]+)/);
  return m ? { type: m[1], id: m[2] } : null;
}

function detectMusicPlatform(url) {
  if (!url) return null;
  if (url.includes('spotify.com')) return 'spotify';
  if (url.includes('music.apple.com')) return 'apple';
  if (url.includes('soundcloud.com')) return 'soundcloud';
  return 'link';
}

function platformMeta(platform) {
  return {
    spotify:    { label: 'Spotify',     icon: '🎵', color: '#1DB954', bg: '#E8FAF0' },
    apple:      { label: 'Apple Music', icon: '🎶', color: '#FC3C44', bg: '#FEF0F0' },
    soundcloud: { label: 'SoundCloud',  icon: '🔊', color: '#FF5500', bg: '#FFF1EB' },
    link:       { label: 'Music Link',  icon: '🎧', color: 'var(--indigo)', bg: 'var(--indigo-light)' },
  }[platform] || { label: 'Music', icon: '🎧', color: 'var(--indigo)', bg: 'var(--indigo-light)' };
}

// ── Spotify Embed ─────────────────────────────────────────────────────────────
function SpotifyEmbed({ url }) {
  const info = extractSpotifyId(url);
  if (!info) return null;
  const embedUrl = 'https://open.spotify.com/embed/' + info.type + '/' + info.id + '?utm_source=generator&theme=0';
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="352"
      frameBorder="0"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      style={{ borderRadius: 12 }}
      title="Spotify Playlist"
    />
  );
}

// ── Apple Music Embed ─────────────────────────────────────────────────────────
function AppleMusicEmbed({ url }) {
  // Convert share URL to embed URL
  // e.g. https://music.apple.com/us/playlist/... → https://embed.music.apple.com/us/playlist/...
  const embedUrl = url.replace('music.apple.com', 'embed.music.apple.com');
  return (
    <iframe
      src={embedUrl}
      width="100%"
      height="450"
      frameBorder="0"
      allow="autoplay *; encrypted-media *; fullscreen *"
      sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
      style={{ borderRadius: 12, overflow: 'hidden', background: 'transparent' }}
      title="Apple Music Playlist"
    />
  );
}

// ── SoundCloud Embed ──────────────────────────────────────────────────────────
function SoundCloudEmbed({ url }) {
  const embedUrl = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) +
    '&color=%236C5DD3&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=true&visual=true';
  return (
    <iframe
      width="100%"
      height="300"
      frameBorder="0"
      src={embedUrl}
      style={{ borderRadius: 12 }}
      title="SoundCloud"
    />
  );
}

// ── Song Suggestion Row ───────────────────────────────────────────────────────
function SuggestionRow({ sugg, isHost, onApprove, onReject }) {
  const statusColor = sugg.status === 'approved' ? 'var(--teal)' : sugg.status === 'rejected' ? 'var(--coral)' : 'var(--amber)';
  const statusLabel = sugg.status === 'approved' ? '✓ Added' : sugg.status === 'rejected' ? '✕ Rejected' : 'Pending';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--page)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎵</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sugg.title}</div>
        <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{sugg.artist} · suggested by {sugg.suggestedBy}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {sugg.status === 'pending' && isHost ? (
          <>
            <button onClick={onReject}
              style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(255,107,107,0.3)', background: 'white', color: 'var(--coral)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Reject</button>
            <button onClick={onApprove}
              style={{ padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(10,207,151,0.4)', background: 'white', color: 'var(--teal)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Approve</button>
          </>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 600, color: statusColor, background: 'white', border: '1px solid currentColor', padding: '3px 8px', borderRadius: 20 }}>{statusLabel}</span>
        )}
      </div>
    </div>
  );
}

// ── Music Panel (used in EventDetailModal) ────────────────────────────────────
export default function MusicPanel({ event, isHost }) {
  const { saveEvent } = useApp();
  const { profile } = useApp();
  const [showAddLink, setShowAddLink] = useState(false);
  const [linkInput, setLinkInput]     = useState(event.musicUrl || '');
  const [songTitle, setSongTitle]     = useState('');
  const [songArtist, setSongArtist]   = useState('');
  const [showSuggest, setShowSuggest] = useState(false);

  const music = event.music || { url: '', suggestions: [] };
  const platform = detectMusicPlatform(music.url);
  const meta = platform ? platformMeta(platform) : null;
  const approved = (music.suggestions || []).filter(s => s.status === 'approved');
  const pending  = (music.suggestions || []).filter(s => s.status === 'pending');

  function saveUrl() {
    saveEvent({ ...event, music: { ...music, url: linkInput.trim() } });
    setShowAddLink(false);
  }

  function suggestSong() {
    if (!songTitle.trim()) return;
    const newSugg = {
      id: Date.now(), title: songTitle.trim(), artist: songArtist.trim() || 'Unknown artist',
      suggestedBy: profile.name, status: 'pending',
    };
    saveEvent({ ...event, music: { ...music, suggestions: [...(music.suggestions || []), newSugg] } });
    setSongTitle(''); setSongArtist(''); setShowSuggest(false);
  }

  function updateSuggestion(id, status) {
    saveEvent({
      ...event,
      music: {
        ...music,
        suggestions: (music.suggestions || []).map(s => s.id === id ? { ...s, status } : s)
      }
    });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="sec-label" style={{ margin: 0 }}>Event Playlist</div>
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 3 }}>Stream music and collect song suggestions from guests</div>
        </div>
        {isHost && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddLink(v => !v)}>
            {music.url ? '✏ Edit Link' : '+ Add Playlist'}
          </button>
        )}
      </div>

      {/* Add/edit URL */}
      {isHost && showAddLink && (
        <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 16, marginBottom: 16 }}>
          <label className="form-label">Playlist URL</label>
          <input
            className="form-input"
            placeholder="Paste Spotify, Apple Music, or SoundCloud playlist URL..."
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 10, lineHeight: 1.6 }}>
            <strong>Spotify:</strong> Share → Copy Link on any playlist<br />
            <strong>Apple Music:</strong> Share → Copy Link<br />
            <strong>SoundCloud:</strong> Share → Copy Link
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddLink(false)}>Cancel</button>
            <button className="btn btn-primary btn-sm" onClick={saveUrl}>Save Playlist</button>
          </div>
        </div>
      )}

      {/* No playlist yet */}
      {!music.url && !showAddLink && (
        <div style={{ textAlign: 'center', padding: '32px 20px', background: 'var(--page)', borderRadius: 'var(--r2)', border: '1px dashed var(--border)', marginBottom: 16 }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🎵</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', marginBottom: 4 }}>No playlist yet</div>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            {isHost ? 'Add a Spotify, Apple Music, or SoundCloud playlist link to set the vibe.' : 'The host hasn\'t added a playlist yet.'}
          </div>
        </div>
      )}

      {/* Platform badge + embed */}
      {music.url && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ padding: '4px 12px', borderRadius: 20, background: meta?.bg, color: meta?.color, fontSize: 12, fontWeight: 700 }}>
              {meta?.icon} {meta?.label}
            </span>
            <a href={music.url} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 11, color: 'var(--ink3)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Open in app ↗
            </a>
          </div>

          {platform === 'spotify'    && <SpotifyEmbed url={music.url} />}
          {platform === 'apple'      && <AppleMusicEmbed url={music.url} />}
          {platform === 'soundcloud' && <SoundCloudEmbed url={music.url} />}
          {platform === 'link' && (
            <a href={music.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--indigo-light)', borderRadius: 'var(--r2)', textDecoration: 'none' }}>
              <span style={{ fontSize: 28 }}>🎧</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--indigo)' }}>Open Playlist</div>
                <div style={{ fontSize: 11, color: 'var(--indigo)', opacity: 0.8, marginTop: 2 }}>{music.url}</div>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Song suggestions */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
            Song Suggestions
            {pending.length > 0 && isHost && (
              <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 20, background: 'var(--amber-light)', color: 'var(--amber)', fontSize: 11, fontWeight: 600 }}>
                {pending.length} pending
              </span>
            )}
          </div>
          <button
            onClick={() => setShowSuggest(v => !v)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid var(--indigo)', background: showSuggest ? 'var(--indigo)' : 'white', color: showSuggest ? 'white' : 'var(--indigo)', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all .18s' }}>
            {showSuggest ? 'Cancel' : '+ Suggest a Song'}
          </button>
        </div>

        {/* Suggest form */}
        {showSuggest && (
          <div style={{ background: 'var(--page)', border: '1px solid var(--border)', borderRadius: 'var(--r2)', padding: 16, marginBottom: 14 }}>
            <div className="form-row" style={{ marginBottom: 10 }}>
              <div>
                <label className="form-label">Song Title</label>
                <input className="form-input" placeholder="e.g. La Vie en Rose" value={songTitle} onChange={e => setSongTitle(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Artist</label>
                <input className="form-input" placeholder="e.g. Édith Piaf" value={songArtist} onChange={e => setSongArtist(e.target.value)} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 10 }}>
              The host will review your suggestion before it appears on the playlist.
            </div>
            <button className="btn btn-primary btn-sm" onClick={suggestSong}>Submit Suggestion</button>
          </div>
        )}

        {/* Approved songs */}
        {approved.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              ✓ Added to Playlist ({approved.length})
            </div>
            {approved.map(s => (
              <SuggestionRow key={s.id} sugg={s} isHost={isHost}
                onApprove={() => updateSuggestion(s.id, 'approved')}
                onReject={() => updateSuggestion(s.id, 'rejected')} />
            ))}
          </div>
        )}

        {/* Pending (host only) */}
        {isHost && pending.length > 0 && (
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'var(--amber-light)', borderRadius: 'var(--r2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              {pending.length} Suggestion{pending.length > 1 ? 's' : ''} Awaiting Review
            </div>
            {pending.map(s => (
              <SuggestionRow key={s.id} sugg={s} isHost={isHost}
                onApprove={() => updateSuggestion(s.id, 'approved')}
                onReject={() => updateSuggestion(s.id, 'rejected')} />
            ))}
          </div>
        )}

        {approved.length === 0 && pending.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', background: 'var(--page)', borderRadius: 'var(--r)', border: '1px dashed var(--border)', fontSize: 12, color: 'var(--ink3)' }}>
            No song suggestions yet. Be the first to suggest one!
          </div>
        )}
      </div>
    </div>
  );
}

// ── Inline Music Link Adder (used in CreateEventModal) ────────────────────────
export function InlineMusicAdder({ musicUrl = '', onChange }) {
  const [url, setUrl] = useState(musicUrl);
  const platform = detectMusicPlatform(url);
  const meta = platform ? platformMeta(platform) : null;

  function handleChange(v) {
    setUrl(v);
    onChange(v);
  }

  return (
    <div>
      <input
        className="form-input"
        placeholder="Paste Spotify, Apple Music, or SoundCloud playlist URL (optional)..."
        value={url}
        onChange={e => handleChange(e.target.value)}
      />
      {meta && url && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{ padding: '3px 10px', borderRadius: 20, background: meta.bg, color: meta.color, fontSize: 11, fontWeight: 700 }}>
            {meta.icon} {meta.label} detected
          </span>
          <span style={{ fontSize: 11, color: 'var(--ink3)' }}>Guests can suggest songs on this playlist</span>
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 8, lineHeight: 1.6 }}>
        Supports Spotify, Apple Music, and SoundCloud. Guests can suggest songs — you approve before they appear.
      </div>
    </div>
  );
}
