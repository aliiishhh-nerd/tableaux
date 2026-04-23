import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation, Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useRealtime } from '../hooks/useRealtime';
import AuthPage from '../pages/AuthPage';
import FeedPage from '../pages/FeedPage';
import EventsPage from '../pages/EventsPage';
import InvitesPage from '../pages/InvitesPage';
import ProfilePage from '../pages/ProfilePage';
import BlogPage from '../pages/BlogPage';
import FAQPage from '../pages/FAQPage';
import TermsPage from '../pages/TermsPage';
import PrivacyPage from '../pages/PrivacyPage';
import LandingPage from '../pages/LandingPage';
import EmptyStatePage from '../pages/EmptyStatePage';
import CreateEventModal from './CreateEventModal';

const NAV = [
  { to: '/feed',    icon: '🏠', label: 'Explore'      },
  { to: '/events',  icon: '🗓️', label: 'My Events'    },
  { to: '/invites', icon: '✉️', label: 'Invitations'  },
  { to: '/blog',    icon: '📝', label: 'Fork & Story' },
];
const NAV_MOBILE = [
  { to: '/feed',    icon: '🏠', label: 'Explore'      },
  { to: '/events',  icon: '🗓️', label: 'My Events'    },
  { to: '/invites', icon: '✉️', label: 'Invitations'  },
  { to: '/blog',    icon: '📝', label: 'Stories'      },
];

// Public event preview page — no login required
function PublicEventPage() {
  const { id } = useParams();
  const { events } = useApp();
  const navigate = useNavigate();
  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--page)', flexDirection: 'column', gap: 16, padding: 24,
      }}>
        <div style={{ fontSize: 48 }}>🍽️</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>Event not found</div>
        <div style={{ fontSize: 14, color: 'var(--ink2)', textAlign: 'center' }}>
          This event may have ended or the link may be incorrect.
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to TableFolk</button>
      </div>
    );
  }

  const cover = event.cover || {};
  const coverBg = cover.type === 'gradient' ? cover.value
    : cover.type === 'emoji' ? (cover.bg || '#1A1A2E')
    : 'linear-gradient(135deg, #1A1A2E, #2D2550)';

  const approvedGuests = event.guests?.filter(g => g.s === 'approved') || [];
  const fillPct = Math.min(100, (approvedGuests.length / (event.cap || 1)) * 100);
  const spotsLeft = (event.cap || 0) - approvedGuests.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--page)' }}>
      {/* Header bar */}
      <div style={{
        padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 20 }}>🍽️</div>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>Table<span style={{ color: 'var(--indigo)' }}>aux</span></div>
        </Link>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>
          Sign in to RSVP
        </button>
      </div>

      {/* Cover hero */}
      <div style={{ height: 260, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: coverBg }} />
        {cover.type === 'image' && cover.value ? (
          <img src={cover.value} alt={event.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
        ) : cover.type === 'emoji' ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 90 }}>{cover.emoji}</span>
          </div>
        ) : null}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span className="chip chip-indigo" style={{ background: 'rgba(108,93,211,0.85)', color: 'white' }}>{event.type}</span>
            {event.vis === 'Public' && <span className="chip" style={{ background: 'rgba(255,255,255,.2)', color: 'white', backdropFilter: 'blur(4px)' }}>Public</span>}
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, lineHeight: 1.2, margin: 0 }}>{event.title}</h1>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px 48px' }}>

        {/* Key details */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {[
            { icon: '📅', val: event.date ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '' },
            { icon: '🕖', val: event.time ? (() => { const [h,m] = event.time.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; })() : '' },
            { icon: '📍', val: event.loc },
            { icon: '👔', val: event.dressCode || 'No dress code' },
            { icon: '👤', val: `Hosted by ${event.host}` },
          ].filter(item => item.val).map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface)', borderRadius: 20, padding: '6px 14px', fontSize: 13, color: 'var(--ink)', border: '1px solid var(--border)' }}>
              <span>{item.icon}</span>
              <span>{item.val}</span>
            </div>
          ))}
        </div>

        {/* Address blur */}
        <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🗺️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', marginBottom: 2 }}>Address</div>
              <div style={{ fontSize: 13, color: 'var(--ink2)', fontStyle: 'italic' }}>
                {event.loc || 'Location hidden'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 4 }}>
                🔒 Exact address shared after your RSVP is confirmed
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.desc && (
          <div style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.8, marginBottom: 20, padding: '16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            {event.desc}
          </div>
        )}

        {/* Capacity bar */}
        <div style={{ marginBottom: 24, padding: '14px 16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
              {approvedGuests.length} attending
            </span>
            <span style={{ color: spotsLeft <= 3 ? 'var(--coral)' : 'var(--ink3)', fontWeight: spotsLeft <= 3 ? 700 : 400 }}>
              {spotsLeft > 0 ? `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} left` : 'Full'}
            </span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${fillPct}%`, background: spotsLeft <= 3 ? 'var(--coral)' : undefined }} />
          </div>
        </div>

        {/* Blurred teaser if description is long */}
        {event.supperClub && (
          <div style={{ marginBottom: 24, padding: '16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 12 }}>🍽️ Multi-course Menu</div>
            <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
              {event.supperClub.courses?.slice(0, 2).map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--indigo-light)', color: 'var(--indigo)', fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.num}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name || 'Course details hidden'}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink2)' }}>{c.desc || 'Sign in to see full menu'}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(2px)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>🔒</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Sign in to see the full menu</div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #1A1A2E, #2D2550)',
          borderRadius: 16, padding: '24px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🍽️</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: 'white', marginBottom: 6 }}>Want to join?</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', marginBottom: 20, lineHeight: 1.5 }}>
            Create a free TableFolk account to RSVP, see the full address, and connect with your host.
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 15, padding: '14px', borderRadius: 12 }}
            onClick={() => navigate('/auth')}
          >
            Join TableFolk to RSVP
          </button>
          <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
            Already have an account? <span style={{ color: 'rgba(255,255,255,.8)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/auth')}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}


function NotifBell({ notifications, unreadCount, markAllNotifsRead, markNotifRead, onNotifClick }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();
  React.useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(o => !o); if (!open) markAllNotifsRead(); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
        aria-label={'Notifications' + (unreadCount > 0 ? ', ' + unreadCount + ' unread' : '')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
        {unreadCount > 0 && (
          <span style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: 'var(--coral, #FF6B6B)', color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid var(--white, #fff)' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: 38, width: 300, background: 'var(--white, #fff)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,.14)', border: '1px solid var(--border, #e5e7eb)', zIndex: 9999, overflow: 'hidden' }}>
          <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>Notifications</div>
          {(!notifications || notifications.length === 0) ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 13, color: 'var(--ink3)' }}>No notifications yet</div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {notifications.slice(0, 20).map(n => (
                <div key={n.id} onClick={() => { markNotifRead(n.id); if (onNotifClick) onNotifClick(n); }}
                  style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'var(--indigo-light, #f0eeff)', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 2 }}>{new Date(n.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                  </div>
                  {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--indigo)', flexShrink: 0, marginTop: 4 }} />}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export default function AppShell() {
  const { user, events, setEvents, toasts, notifications, markNotifRead, markAllNotifsRead, addToast, addNotification } = useApp();
  useRealtime({ user, addToast, addNotification, setEvents });
  const unreadCount = (notifications || []).filter(n => !n.read).length;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  React.useEffect(() => {
    const handler = () => setCreatingEvent(true);
    window.addEventListener('tablefolk:createEvent', handler);
    return () => window.removeEventListener('tablefolk:createEvent', handler);
  }, []);
  const location = useLocation();

  // Public routes — no login required
  if (location.pathname === '/') {
    if (!user) return <LandingPage />;
  }
  if (!user && location.pathname.startsWith('/blog')) return <BlogPage />;
  if (!user && location.pathname.startsWith('/faq')) return <FAQPage />;
  if (!user && location.pathname.startsWith('/terms')) return <TermsPage />;
  if (!user && location.pathname.startsWith('/privacy')) return <PrivacyPage />;
  if (!user && location.pathname.startsWith('/e/')) return <PublicEventWrapper />;
  if (!user) return <AuthPage />;

  const invitePending = events.filter(
    e => e.isInvitedTo && e.guests?.find(g => g.id === user.id && g.s === 'pending')
  ).length;

  const hasAnyActivity = events.some(e => e.mine || e.isInvitedTo);
  const isNewUser = !hasAnyActivity;

  const pageInfo = getPageInfo(location.pathname);

  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Link to="/feed" className="logo-mark" onClick={() => setSidebarOpen(false)}>
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="28" height="28" rx="8" fill="#5b4de0"/>
                <circle cx="14" cy="11" r="4" stroke="white" strokeWidth="1.6" fill="none"/>
                <path d="M7 22c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                <path d="M10 11.5c0 0 1-3 4-3s4 3 4 3" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity="0.5" fill="none"/>
              </svg>
            </div>
            <div className="logo-text">Table<span>Folk</span></div>
          </Link>
        </div>

        <nav className="sb-nav">
          <div className="sb-section">
            <div className="sb-section-label">Menu</div>
            {NAV.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sb-icon">{n.icon}</span>
                {n.label}
                {n.to === '/invites' && invitePending > 0 && (
                  <span className="sb-badge">{invitePending}</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <Link
            to="/faq"
            style={{ fontSize: 12, color: 'var(--ink3)', display: 'block', marginBottom: 6, textDecoration: 'none' }}
            onClick={() => setSidebarOpen(false)}
          >
            ❓ Help & FAQ
          </Link>
          <Link
            to="/blog"
            style={{ fontSize: 12, color: 'var(--ink3)', display: 'block', textDecoration: 'none' }}
            onClick={() => setSidebarOpen(false)}
          >
            📝 Fork & Story
          </Link>
        </div>

        <div className="sb-user">
          <Link to="/profile" className="sb-user-inner" onClick={() => setSidebarOpen(false)}>
            <div className={`av av-sm av-${user.color || 'indigo'}`}>{user.initials}</div>
            <div>
              <div className="sb-user-name">{user.name}</div>
              <div className="sb-user-role">{user.handle}</div>
            </div>
          </Link>
        </div>
      </aside>

      <div className="main-wrap">
        <header className="topnav">
          <div className="topnav-left">
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <div className="page-title">
              <h1>{pageInfo.title}</h1>
              {pageInfo.sub && <p>{pageInfo.sub}</p>}
            </div>
          </div>
          <div className="topnav-right">
            <Link to="/invites" className="icon-btn always-show" title="Invitations" style={{ position: 'relative' }}>
              ✉️{invitePending > 0 && <span className="notif-dot" />}
            </Link>
            <NotifBell notifications={notifications || []} unreadCount={unreadCount} markAllNotifsRead={markAllNotifsRead} markNotifRead={markNotifRead} onNotifClick={(n) => {
              // Route by notification type. rsvp_request = host got a request -> My Events
              // rsvp_approved = guest was approved -> Invitations > Accepted tab
              if (n.type === 'rsvp_request') window.location.href = '/events';
              else if (n.type === 'rsvp_approved') window.location.href = '/invites';
            }} />
            <Link to="/profile" className="topnav-avatar-link" title="My Profile">
              <div className={`av av-sm av-${user.color || 'indigo'}`}>{user.initials}</div>
            </Link>
          </div>
        </header>

        <Routes>
          <Route path="/"           element={isNewUser ? <EmptyStatePage onCreateEvent={() => setCreatingEvent(true)} onBrowse={() => {}} /> : <FeedPage />} />
          <Route path="/feed"       element={isNewUser ? <EmptyStatePage onCreateEvent={() => setCreatingEvent(true)} onBrowse={() => {}} /> : <FeedPage />} />
          <Route path="/events"     element={<EventsPage />} />
          <Route path="/invites"    element={<InvitesPage />} />
          <Route path="/profile"    element={<ProfilePage />} />
          <Route path="/blog"       element={<BlogPage />} />
          <Route path="/faq"        element={<FAQPage />} />
          <Route path="/terms"       element={<TermsPage />} />
          <Route path="/privacy"     element={<PrivacyPage />} />
          <Route path="/e/:id"      element={<PublicEventPage />} />
        </Routes>

        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '24px 24px 80px',
          marginTop: 40,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
            © {new Date().getFullYear()} TableFolk. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/blog" style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Fork & Story</Link>
            <Link to="/faq"  style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Help & FAQ</Link>
            <a href="mailto:hello@tablefolk.app" style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Contact</a>
          </div>
        </footer>
      </div>

      <button
        className="fab"
        onClick={() => setCreatingEvent(true)}
        aria-label="Host a dinner"
        style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 200,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--indigo)', color: 'white',
          border: 'none', cursor: 'pointer', fontSize: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(108,93,211,0.45)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        🍴
      </button>

      <nav className="mobile-nav">
        {NAV_MOBILE.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">
              {n.icon}
              {n.to === '/invites' && invitePending > 0 && (
                <span className="mobile-nav-badge">{invitePending}</span>
              )}
            </span>
            {n.label}
          </NavLink>
        ))}
        <button
          className="mobile-nav-btn"
          onClick={() => setCreatingEvent(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span className="mobile-nav-icon" style={{ fontSize: 22 }}>＋</span>
          Host
        </button>
        <Link to="/profile" className="mobile-nav-btn">
          <div className={`av av-sm av-${user.color || 'indigo'}`} style={{ width: 26, height: 26, fontSize: 9 }}>{user.initials}</div>
          Me
        </Link>
      </nav>

      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type ? 'toast-' + t.type : ''}`}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : '💬'} {t.msg}
          </div>
        ))}
      </div>

      {creatingEvent && <CreateEventModal onClose={() => setCreatingEvent(false)} />}
    </div>
  );
}

// Wrapper so PublicEventPage has access to useApp even when user is not logged in
function PublicEventWrapper() {
  return <PublicEventPage />;
}

function getPageInfo(path) {
  if (path.startsWith('/events'))  return { title: 'My Events',    sub: null };
  if (path.startsWith('/invites')) return { title: 'Invitations',  sub: null };
  if (path.startsWith('/profile')) return { title: 'My Profile',   sub: null };
  if (path.startsWith('/blog'))    return { title: 'Fork & Story', sub: 'Stories & Recipes from TableFolk' };
  if (path.startsWith('/faq'))     return { title: 'Help & FAQ',   sub: 'Everything you need to know' };
  if (path.startsWith('/e/'))      return { title: 'Event Preview', sub: null };
  return { title: 'Explore', sub: 'Intimate dining near you' };
}
