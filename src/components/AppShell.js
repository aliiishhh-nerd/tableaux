import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation, Link, useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import AuthPage from '../pages/AuthPage';
import { supabase } from '../lib/supabase';
import FeedPage from '../pages/FeedPage';
import EventsPage from '../pages/EventsPage';
import InvitesPage from '../pages/InvitesPage';
import ProfilePage from '../pages/ProfilePage';
import BlogPage from '../pages/BlogPage';
import FAQPage from '../pages/FAQPage';
import LandingPage from '../pages/LandingPage';
import EmptyStatePage from '../pages/EmptyStatePage';
import CreateEventModal from './CreateEventModal';

const NAV = [
  { to: '/feed',    icon: '🏠', label: 'Explore'      },
  { to: '/events',  icon: '🗓️', label: 'My Events'    },
  { to: '/invites', icon: '✉️', label: 'Invitations'  },
  { to: '/blog',    icon: '📝', label: 'Fork & Story' },
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
        <button className="btn btn-primary" onClick={() => navigate('/')}>Back to Tableaux</button>
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
            Create a free Tableaux account to RSVP, see the full address, and connect with your host.
          </div>
          <button
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 15, padding: '14px', borderRadius: 12 }}
            onClick={() => navigate('/auth')}
          >
            Join Tableaux to RSVP
          </button>
          <div style={{ marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
            Already have an account? <span style={{ color: 'rgba(255,255,255,.8)', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/auth')}>Sign in</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user, events, toasts } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const location = useLocation();

  // Public routes — no login required
  if (location.pathname === '/') {
    if (!user) return <LandingPage />;
  }
  if (!user && location.pathname.startsWith('/blog')) return <BlogPage />;
  if (!user && location.pathname.startsWith('/faq')) return <FAQPage />;
  if (!user && location.pathname.startsWith('/e/')) return <PublicEventWrapper />;
  // /auth route — sign out existing session and show login
  if (location.pathname === '/auth') {
    if (user) {
      supabase.auth.signOut();
      return <AuthPage />;
    }
    return <AuthPage />;
  }
  if (!user) return <AuthPage />;

  const invitePending = events.filter(
    e => e.isInvitedTo && e.guests?.find(g => g.id === 'u1' && g.s === 'pending')
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
            <div className="logo-icon">🍽️</div>
            <div className="logo-text">Table<span>aux</span></div>
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
            © {new Date().getFullYear()} Tableaux. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <Link to="/blog" style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Fork & Story</Link>
            <Link to="/faq"  style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Help & FAQ</Link>
            <a href="mailto:hello@tableaux.app" style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Contact</a>
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
        {NAV.map(n => (
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
  if (path.startsWith('/blog'))    return { title: 'Fork & Story', sub: 'Stories & Recipes from Tableaux' };
  if (path.startsWith('/faq'))     return { title: 'Help & FAQ',   sub: 'Everything you need to know' };
  if (path.startsWith('/e/'))      return { title: 'Event Preview', sub: null };
  return { title: 'Explore', sub: 'Intimate dining near you' };
}
