import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation, Link } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import AuthPage from '../pages/AuthPage';
import FeedPage from '../pages/FeedPage';
import EventsPage from '../pages/EventsPage';
import InvitesPage from '../pages/InvitesPage';
import ProfilePage from '../pages/ProfilePage';
import BlogPage from '../pages/BlogPage';

const NAV = [
  { to: '/feed',    icon: '🏠', label: 'Discover' },
  { to: '/events',  icon: '🗓️', label: 'My Events' },
  { to: '/invites', icon: '✉️', label: 'Invitations' },
  { to: '/blog',    icon: '📝', label: 'The Table' },
];

export default function AppShell() {
  const { user, events, toasts } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!user) return <AuthPage />;

  const invitePending = events.filter(
    e => e.isInvitedTo && e.guests?.find(g => g.id === 'u1' && g.s === 'pending')
  ).length;

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

          <div className="sb-section" style={{ marginTop: 8 }}>
            <NavLink
              className={({ isActive }) => `sb-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sb-icon">🤝</span>
            </NavLink>
          </div>
        </nav>

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
              ✉️
              {invitePending > 0 && <span className="notif-dot" />}
            </Link>
            <Link to="/profile" className="topnav-avatar-link" title="My Profile">
              <div className={`av av-sm av-${user.color || 'indigo'}`}>{user.initials}</div>
            </Link>
          </div>
        </header>

        <Routes>
          <Route path="/"        element={<FeedPage />} />
          <Route path="/feed"    element={<FeedPage />} />
          <Route path="/events"  element={<EventsPage />} />
          <Route path="/invites" element={<InvitesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/blog"    element={<BlogPage />} />
        </Routes>
      </div>

      {/* Mobile bottom nav */}
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
          <div className={`av av-sm av-${user.color || 'indigo'}`} style={{ width: 26, height: 26, fontSize: 9 }}>
            {user.initials}
          </div>
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
    </div>
  );
}

function getPageInfo(path) {
  if (path.startsWith('/events'))  return { title: 'My Events',    sub: null };
  if (path.startsWith('/invites')) return { title: 'Invitations',  sub: null };
  if (path.startsWith('/profile')) return { title: 'My Profile',   sub: null };
  if (path.startsWith('/blog'))    return { title: 'The Table',    sub: 'Stories & Recipes from Tableaux' };
  return { title: 'Discover', sub: "What's happening around you" };
}
