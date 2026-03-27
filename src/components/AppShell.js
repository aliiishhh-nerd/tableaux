import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

import FeedPage from '../pages/FeedPage';
import EventsPage from '../pages/EventsPage';
import InvitesPage from '../pages/InvitesPage';
import ProfilePage from '../pages/ProfilePage';
import BlogPage from '../pages/BlogPage';
import PartnerPage from '../pages/PartnerPage';
import CreateEventModal from './CreateEventModal';

const NAV = [
  { id: 'feed',    path: '/',        icon: '⊞', label: 'Discover',    section: 'Menu' },
  { id: 'events',  path: '/events',  icon: '◫', label: 'My Events',   section: null },
  { id: 'invites', path: '/invites', icon: '✉', label: 'Invitations', section: null },
  { id: 'blog',    path: '/blog',    icon: '✏️', label: 'The Table',   section: null },
  { id: 'profile', path: '/profile', icon: '◉', label: 'Me',          section: null },
  // Partner hidden for now — uncomment to re-enable:
  // { id: 'partner', path: '/partner', icon: '🤝', label: 'Partner with Us', section: 'For Brands' },
];

const MOBILE_NAV = [
  { id: 'feed',    path: '/',        icon: '🏠', label: 'Discover'    },
  { id: 'events',  path: '/events',  icon: '📅', label: 'My Events'   },
  { id: 'invites', path: '/invites', icon: '✉️', label: 'Invitations' },
  { id: 'blog',    path: '/blog',    icon: '✏️', label: 'The Table'   },
  { id: 'profile', path: '/profile', icon: '👤', label: 'Me'          },
];

const PAGE_META = {
  '/':        { title: 'Discover',     sub: 'What\'s happening around you' },
  '/events':  { title: 'My Events',    sub: 'Events you are hosting' },
  '/invites': { title: 'Invitations',  sub: 'Your received invitations' },
  '/blog':    { title: 'The Table',    sub: 'Stories, tips & dining culture' },
  '/profile': { title: 'My Profile',   sub: 'Your dining identity' },
  '/partner': { title: 'Partner with Us', sub: 'Grow with the Tableaux community' },
};

export default function AppShell() {
  const { profile, pendingInvites } = useApp();
  const navigate   = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreate, setShowCreate]   = useState(false);
  const [editEventId, setEditEventId] = useState(null);

  const meta = PAGE_META[pathname] || PAGE_META['/'];

  function goTo(path) {
    navigate(path);
    setSidebarOpen(false);
  }

  // Build nav with section headers
  let currentSection = null;
  const navItems = NAV.map(n => {
    const showSection = n.section && n.section !== currentSection;
    if (n.section) currentSection = n.section;
    return { ...n, showSection };
  });

  function openEdit(id) {
    setEditEventId(id);
    setShowCreate(true);
  }

  const userInitials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AC';

  return (
    <div className="shell">
      {/* Sidebar overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-dot">T</div>
            <div>
              <div className="logo-name">Tableaux</div>
              <div className="logo-tag">Social Dining</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(n => (
            <React.Fragment key={n.id}>
              {n.showSection && (
                <div className="nav-section">{n.section}</div>
              )}
              <div
                className={`nav-item ${pathname === n.path ? 'active' : ''}`}
                onClick={() => goTo(n.path)}
              >
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
                {n.id === 'invites' && pendingInvites > 0 && (
                  <span className="nav-badge">{pendingInvites}</span>
                )}
              </div>
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-primary btn-sm btn-full" onClick={() => { setEditEventId(null); setShowCreate(true); setSidebarOpen(false); }}>
            + New Event
          </button>
          <div className="sidebar-user" onClick={() => goTo('/profile')} style={{ cursor: 'pointer', marginTop: 12 }}>
            <div className="av av-sm av-indigo">{userInitials}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{profile?.name || 'Ada Chen'}</div>
              <div style={{ fontSize: 11, color: 'var(--ink2)' }}>@{(profile?.name || 'adachen').toLowerCase().replace(/\s+/g, '')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-wrap">
        {/* Top nav */}
        <header className="topnav">
          <button className="hamburger icon-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <div className="page-title">
            <h1>{meta.title}</h1>
            <p>{meta.sub}</p>
          </div>
          <div className="topnav-right">
            <button className="icon-btn always-show" onClick={() => goTo('/invites')} style={{ position: 'relative' }}>
              ✉
              {pendingInvites > 0 && (
                <span className="notif-dot">{pendingInvites}</span>
              )}
            </button>
            <div className="av av-sm av-indigo always-show" onClick={() => goTo('/profile')} style={{ cursor: 'pointer' }}>
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page routes */}
        <Routes>
          <Route path="/"        element={<FeedPage onEditEvent={openEdit} />} />
          <Route path="/events"  element={<EventsPage onEditEvent={openEdit} />} />
          <Route path="/invites" element={<InvitesPage />} />
          <Route path="/blog"    element={<BlogPage />} />
          <Route path="/profile" element={<ProfilePage onEditEvent={openEdit} />} />
          <Route path="/partner" element={<PartnerPage />} />
          <Route path="*"        element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Mobile bottom nav — Partner hidden */}
      <nav className="mobile-nav">
        {MOBILE_NAV.map(n => (
          <button
            key={n.id}
            className={`mobile-nav-btn ${pathname === n.path ? 'active' : ''}`}
            onClick={() => goTo(n.path)}
          >
            <span className="mobile-nav-icon">
              {n.icon}
              {n.id === 'invites' && pendingInvites > 0 && (
                <span className="notif-dot">{pendingInvites}</span>
              )}
            </span>
            <span className="mobile-nav-label">{n.label}</span>
          </button>
        ))}
      </nav>

      {/* Create / Edit Event modal */}
      {showCreate && (
        <CreateEventModal
          eventId={editEventId}
          onClose={() => { setShowCreate(false); setEditEventId(null); }}
        />
      )}
    </div>
  );
}
