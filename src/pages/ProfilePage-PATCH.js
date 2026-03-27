// ─── PROFILEPAGE PATCH INSTRUCTIONS ───────────────────────────────────────────
//
// STEP 1: Add this EventCover helper function to ProfilePage.js
// Paste it AFTER the import lines and BEFORE the export default function
//
// STEP 2: Find every place in ProfilePage.js that renders an event thumbnail
// and replace it with <EventCover event={e} />
// Look for patterns like:
//   <div className="event-row-cover"><img src={...} /></div>
// Replace with:
//   <EventCover event={e} />
//
// ─────────────────────────────────────────────────────────────────────────────

function EventCover({ event, className = 'event-row-cover' }) {
  const cover = event.cover || {};
  const hasImage = (cover.type === 'image' && cover.value) || event.img;
  const isEmoji = cover.type === 'emoji';
  const isGradient = cover.type === 'gradient';

  const bg = isGradient
    ? cover.value
    : isEmoji
    ? (cover.bg || '#1A1A2E')
    : hasImage
    ? '#1A1A2E'
    : 'var(--indigo)';

  return (
    <div className={className} style={{ background: bg, position: 'relative', overflow: 'hidden' }}>
      {hasImage && (
        <img
          src={cover.value || event.img}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      {isEmoji && !hasImage && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>
          {cover.emoji}
        </div>
      )}
    </div>
  );
}
