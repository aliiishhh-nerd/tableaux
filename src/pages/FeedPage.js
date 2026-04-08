import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { fmtDate, fmtTime } from '../data/utils';
import { FRIENDS_ACTIVITY, USERS } from '../data/seed';
import EventDetailModal from '../components/EventDetailModal';

const CITIES = [
  { key: 'chicago', label: 'Chicago'     },
  { key: 'austin',  label: 'Austin'      },
  { key: 'la',      label: 'Los Angeles' },
  { key: 'seattle', label: 'Seattle'     },
  { key: 'nyc',     label: 'New York'    },
  { key: 'all',     label: 'All Cities'  },
];

const CITY_NAMES = {
  chicago: 'Chicago', austin: 'Austin', la: 'Los Angeles', seattle: 'Seattle', nyc: 'New York',
};

const CITY_KEYWORDS = {
  chicago: ['chicago', 'lincoln park', 'river north', 'wicker park', 'hyde park', 'lakeview', 'logan square', 'il 6'],
  austin:  ['austin', ', tx', 'texas'],
  la:      ['los angeles', ', ca 9', 'venice', 'silverlake', 'hollywood', 'culver city'],
  seattle: ['seattle', ', wa', 'capitol hill', 'ballard', 'fremont'],
  nyc:     ['new york', ', ny', 'brooklyn', 'manhattan', 'queens'],
};

const EVENT_TYPES = [
  'Brunch', 'Dinner Party', 'Other', 'Potluck', 'Restaurant', 'Supper Club', 'Tasting',
];

const TYPE_PILLS = {
  'Brunch':       { bg: 'rgba(212,175,55,.85)',  label: '🥞 Brunch'        },
  'Dinner Party': { bg: 'rgba(108,93,211,.85)',  label: '🍷 Dinner Party'  },
  'Other':        { bg: 'rgba(100,100,100,.75)', label: '🍽️ Other'         },
  'Potluck':      { bg: 'rgba(46,196,182,.85)',  label: '🥘 Potluck'       },
  'Restaurant':   { bg: 'rgba(220,80,60,.85)',   label: '🏮 Restaurant'    },
  'Supper Club':  { bg: 'rgba(212,175,55,.9)',   label: '✨ Supper Club'   },
  'Tasting':      { bg: 'rgba(150,90,200,.85)',  label: '🍾 Tasting'       },
};

const EXPERIENCE_TAG_ICONS = {
  'Live Music': '🎵', 'Chef Demo': '👨‍🍳', 'Blind Tasting': '🫣', 'Outdoor': '🌿',
  'Themed Dress Code': '👗', 'Guest Speaker': '🎤', 'Sober-friendly': '🫧',
  'Plant-forward': '🥬', 'Wine Pairing': '🍷', 'Family-friendly': '👨‍👩‍👧',
};

function getCityFromProfile(user) {
  if (!user) return 'chicago';
  const city = (user.city || '').toLowerCase();
  if (city.includes('austin')) return 'austin';
  if (city.includes('los angeles') || city === 'la') return 'la';
  if (city.includes('seattle')) return 'seattle';
  if (city.includes('new york') || city === 'nyc') return 'nyc';
  if (city.includes('chicago')) return 'chicago';
  return 'chicago';
}

function eventMatchesCity(event, cityKey) {
  if (cityKey === 'all') return true;
  if (event.city) return event.city.toLowerCase() === cityKey.toLowerCase() ||
    (cityKey === 'la' && event.city.toLowerCase() === 'los angeles');
  const keywords = CITY_KEYWORDS[cityKey] || [];
  const haystack = ((event.loc || '') + ' ' + (event.addr || '')).toLowerCase();
  return keywords.some(k => haystack.includes(k));
}

export default function FeedPage() {
  const navigate = useNavigate();
  const { events, user, isFollowingHost, friends } = useApp();
  const [selected, setSelected]   = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [city, setCity]           = useState(() => 'auto');
  const [citySearch, setCitySearch] = useState('');
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const [dismissedBanners, setDismissedBanners] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('tableaux-dismissed-banners') || '[]'); }
    catch { return []; }
  });
  const [showBanners, setShowBanners] = useState(false);
  const citySearchRef = useRef(null);

  const profileCity = getCityFromProfile(user);
  const resolvedCity = city === 'auto' ? profileCity : city;

  useEffect(() => {
    sessionStorage.setItem('tableaux-dismissed-banners', JSON.stringify(dismissedBanners));
  }, [dismissedBanners]);

  useEffect(() => {
    if (showCitySearch && citySearchRef.current) citySearchRef.current.focus();
  }, [showCitySearch]);

  const upcoming = events.filter(e => !e.isEnded && !e.isPast && !e.isInvitedTo);

  const searchedCity = (() => {
    if (!citySearch) return null;
    const q = citySearch.toLowerCase();
    const match = CITIES.find(c => c.label.toLowerCase().includes(q) || c.key.toLowerCase().includes(q));
    return match ? match.key : 'none';
  })();

  const activeCity = citySearch ? searchedCity : resolvedCity;

  const typeFilters = [
    { key: 'all', label: '✨ All' },
    ...EVENT_TYPES.map(t => ({ key: t, label: (TYPE_PILLS[t] || {}).label || t })),
  ];

  const filtered = upcoming.filter(e => {
    const typeMatch = typeFilter === 'all' || e.type === typeFilter;
    const cityMatch = activeCity === 'all' || activeCity === 'none'
      ? activeCity !== 'none'
      : eventMatchesCity(e, activeCity);
    return typeMatch && cityMatch;
  });

  const noResultsForSearch = citySearch && searchedCity === 'none';

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const allBanners = events.filter(e => {
    if (!e.isEnded || !e.galleryEnabled) return false;
    if (dismissedBanners.includes(e.id)) return false;
    if (e.endedAt && new Date(e.endedAt).getTime() < sevenDaysAgo) return false;
    return true;
  });

  const stats = [
    { icon: '🗓️', color: 'purple', val: upcoming.length, label: 'Upcoming', badge: '+2 this month', badgeColor: 'green', dark: false, action: () => navigate('/events') },
    { icon: '👥', color: 'teal', val: friends.filter(f => f.status === 'accepted').length, label: 'In Network', badge: 'Avg 7 per event', badgeColor: 'blue', dark: false, action: () => navigate('/profile') },
    { icon: '🥂', color: 'amber', val: events.filter(e => e.isEnded || e.isPast).length, label: 'Past Dinners', badge: '92% accepted', badgeColor: 'green', dark: false, action: () => navigate('/events') },
    { icon: '🔔', color: 'coral', val: allBanners.length, label: 'Wrap-ups',
      badge: allBanners.length > 0 ? 'tap to view' : 'all clear',
      badgeColor: allBanners.length > 0 ? 'amber' : 'green',
      dark: allBanners.length > 0, action: () => setShowBanners(b => !b) },
  ];

  const nearMeLabel = city === 'auto'
    ? `📍 Near Me · ${CITY_NAMES[profileCity] || 'Chicago'}`
    : '📍 Near Me';

  return (
    <main className="page-content">
      <div className="feed-stat-cards" style={{ marginBottom: 20 }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card stat-card-centered" onClick={s.action || undefined}
            style={s.action ? { cursor: 'pointer', ...(s.dark ? { background: '#1A1A2E', border: '1px solid #2D2550' } : {}) } : {}}>
            <div className={`stat-icon-circle ${s.color}`} style={s.dark ? { background: 'rgba(255,255,255,.12)' } : {}}>{s.icon}</div>
            <div className="stat-val" style={s.dark ? { color: 'white' } : {}}>{s.val}</div>
            <div className="stat-label" style={s.dark ? { color: 'rgba(255,255,255,.6)' } : {}}>{s.label}</div>
            <span className={`stat-badge ${s.badgeColor}`} style={s.dark ? { background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.85)' } : {}}>{s.badge}</span>
          </div>
        ))}
      </div>

      {showBanners && allBanners.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          {allBanners.map(evt => (
            <PostEventBanner key={evt.id} event={evt}
              onView={() => { setSelected(evt); setShowBanners(false); }}
              onDismiss={() => setDismissedBanners(d => [...d, evt.id])} />
          ))}
        </div>
      )}

      <div className="feed-layout">
        <div>
          {/* City filter row */}
          <div className="filter-row" style={{ marginBottom: 8, alignItems: 'center' }}>
            <button className={`filter-btn-nearme ${city === 'auto' && !citySearch ? 'active' : ''}`}
              onClick={() => { setCity('auto'); setCitySearch(''); setShowCitySearch(false); }}>
              {nearMeLabel}
            </button>
            {showCitySearch ? (
              <input ref={citySearchRef} value={citySearch} onChange={e => setCitySearch(e.target.value)}
                onBlur={() => { if (!citySearch) setShowCitySearch(false); }} placeholder="Search city..."
                style={{ border: '1px solid var(--indigo)', borderRadius: 20, padding: '5px 14px', fontSize: 13, outline: 'none', width: 140 }} />
            ) : (
              CITIES.map(c => (
                <button key={c.key} className={`filter-btn ${resolvedCity === c.key && city !== 'auto' && !citySearch ? 'active' : ''}`}
                  onClick={() => { setCity(c.key); setCitySearch(''); }}>{c.label}</button>
              ))
            )}
            <button className="filter-btn" onClick={() => setShowCitySearch(s => !s)} title="Search city" style={{ padding: '5px 10px' }}>🔍</button>
          </div>

          {noResultsForSearch && (
            <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 8, padding: '6px 12px', background: 'var(--indigo-light)', borderRadius: 8 }}>
              No events found for "{citySearch}". Showing closest available cities.
            </div>
          )}

          {/* Event type filter */}
          <div className="filter-row" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
            {typeFilters.map(f => (
              <button key={f.key} className={`filter-btn ${typeFilter === f.key ? 'active' : ''}`} onClick={() => setTypeFilter(f.key)}>{f.label}</button>
            ))}
          </div>

          {/* Event search */}
          <div style={{ marginBottom: 14 }}>
            <input value={eventSearch} onChange={e => setEventSearch(e.target.value)} placeholder="🔍 Search events..."
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 20, padding: '8px 16px', fontSize: 13, outline: 'none', background: 'var(--surface)', color: 'var(--ink)' }} />
          </div>

          {(() => {
            const displayEvents = eventSearch
              ? filtered.filter(e =>
                  e.title.toLowerCase().includes(eventSearch.toLowerCase()) ||
                  (e.loc || '').toLowerCase().includes(eventSearch.toLowerCase()) ||
                  (e.type || '').toLowerCase().includes(eventSearch.toLowerCase()) ||
                  (e.experienceTags || []).some(t => t.toLowerCase().includes(eventSearch.toLowerCase()))
                )
              : noResultsForSearch ? upcoming.slice(0, 6) : filtered;

            return displayEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🍽️</div>
                <div className="empty-title">No events found</div>
                <div className="empty-sub">Try a different city or event type.</div>
              </div>
            ) : (
              <div className="feed-grid">
                {displayEvents.map(evt => (
                  <EventCard key={evt.id} event={evt} onClick={() => setSelected(evt)} isFollowingHost={isFollowingHost(evt.hostId)} />
                ))}
              </div>
            );
          })()}
        </div>

        <div className="feed-sidebar">
          <div className="card feed-activity-card">
            <div style={{ padding: '14px 14px 0' }}>
              <div className="sec-title">Friends Activity</div>
            </div>
            <div style={{ padding: '4px 14px', flex: 1 }}>
              {FRIENDS_ACTIVITY.map(act => {
                const u = USERS.find(x => x.id === act.userId);
                return (
                  <div key={act.id} className="activity-item">
                    <div style={{ position: 'relative' }}>
                      <div className={`av av-sm av-${u?.color || 'indigo'} av-link`}>
                        {u ? u.initials : act.userName[0]}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="activity-text">
                        <strong>{act.userName}</strong> {act.action}{' '}
                        <strong style={{ cursor: 'pointer' }} onClick={() => {
                          const ev = events.find(e => e.id === act.targetId);
                          if (ev) setSelected(ev);
                        }}>{act.target}</strong>
                        {' '}{act.emoji}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="activity-time">{act.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="invite-friend-cta">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ display: 'flex' }}>
                  {['AL','MR','JW'].map((ini, i) => (
                    <div key={i} className={`av av-sm av-${['indigo','teal','amber'][i]}`}
                      style={{ marginLeft: i > 0 ? -8 : 0, border: '2px solid white', zIndex: 3 - i }}>{ini}</div>
                  ))}
                  <div className="av av-sm" style={{ marginLeft: -8, background: 'var(--border)', color: 'var(--ink3)', border: '2px solid white', fontSize: 14, zIndex: 0 }}>+</div>
                </div>
                <div>
                  <div className="invite-friend-title">Invite friends</div>
                  <div className="invite-friend-sub">Good meals are better shared</div>
                </div>
              </div>
              <button className="btn btn-primary btn-full btn-sm"
                onClick={() => {
                  const url = window.location.origin + '/feed';
                  if (navigator.share) {
                    navigator.share({ title: 'Join me on Tableaux', text: 'Discover intimate dining experiences near you.', url });
                  } else {
                    navigator.clipboard?.writeText(url).catch(() => {});
                    window.alert('Invite link copied to clipboard!');
                  }
                }}>📨 Send Invite</button>
            </div>
          </div>
        </div>
      </div>

      {selected && <EventDetailModal event={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function PostEventBanner({ event, onView, onDismiss }) {
  const photoCount = event.photoGallery?.length || 0;
  return (
    <div className="post-event-banner" onClick={onView} style={{ marginBottom: 6 }}>
      <div className="post-event-banner-icon">{photoCount > 0 ? '📸' : '🎉'}</div>
      <div className="post-event-banner-text">
        <div className="post-event-banner-title">{event.title} just wrapped up</div>
        <div className="post-event-banner-sub">{photoCount > 0 ? `${photoCount} photo${photoCount !== 1 ? 's' : ''} shared — add yours!` : 'Be the first to share photos from the evening!'}</div>
      </div>
      <button className="post-event-banner-cta" onClick={e => { e.stopPropagation(); onView(); }}>{photoCount > 0 ? 'See Photos' : 'Add Photos'}</button>
      <button onClick={e => { e.stopPropagation(); onDismiss(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer', fontSize: 16, padding: '4px', flexShrink: 0, lineHeight: 1 }}>✕</button>
    </div>
  );
}

function EventCard({ event, onClick, isFollowingHost }) {
  const cover = event.cover || {};
  const hasImg = cover.type === 'image' || event.img;
  const coverBg = cover.type === 'gradient' ? cover.value
    : cover.type === 'emoji' ? (cover.gradient || cover.bg || '#1A1A2E') : 'var(--indigo)';
  const coverStyle = !hasImg ? { background: coverBg } : {};
  const approvedGuests = event.guests?.filter(g => g.s === 'approved') || [];
  const pillConfig = TYPE_PILLS[event.type] || { bg: 'rgba(108,93,211,.85)', label: event.type };
  const expTags = event.experienceTags || [];

  return (
    <div className="event-card" onClick={onClick}>
      <div className="event-card-cover" style={coverStyle}>
        {hasImg && <img src={cover.value || event.img} alt={event.title} loading="lazy" />}
        {!hasImg && cover.type === 'emoji' && <div className="event-card-cover-emoji">{cover.emoji}</div>}
        <div className="event-card-badges">
          <span className="chip" style={{ background: pillConfig.bg, color: 'white', fontWeight: 700 }}>{pillConfig.label}</span>
          {event.vis === 'Public' && (
            <span className="chip" style={{ background: 'rgba(255,255,255,.22)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.3)' }}>Public</span>
          )}
          {isFollowingHost && (
            <span className="chip" style={{ background: 'rgba(255,255,255,.22)', color: 'white', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,.3)' }}>🔔 Following</span>
          )}
        </div>
      </div>
      <div className="event-card-body">
        <div className="event-card-title">{event.title}</div>
        <div className="event-card-meta">
          <span>📅 {fmtDate(event.date)}</span>
          <span>🕖 {fmtTime(event.time)}</span>
          <span>📍 {event.loc}</span>
        </div>
        {/* Experience tags */}
        {expTags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {expTags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: 'var(--indigo-light)', color: 'var(--indigo)', fontWeight: 600 }}>
                {EXPERIENCE_TAG_ICONS[tag] || '🏷️'} {tag}
              </span>
            ))}
            {expTags.length > 3 && (
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: 'var(--page)', color: 'var(--ink3)' }}>+{expTags.length - 3}</span>
            )}
          </div>
        )}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.min(100, (approvedGuests.length / event.cap) * 100)}%` }} />
        </div>
      </div>
      <div className="event-card-foot">
        <div className="guests-row">
          {approvedGuests.slice(0, 4).map((g, i) => (
            <div key={i} className={`av av-sm av-${g.color || 'indigo'}`}>{g.initials || g.n?.[0]}</div>
          ))}
          <span className="guests-count">{approvedGuests.length}/{event.cap}</span>
        </div>
        <span className="chip chip-indigo">View →</span>
      </div>
    </div>
  );
}
