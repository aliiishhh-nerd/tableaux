import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { initials } from '../data/utils';
import FeedPage from './FeedPage';
import EventsPage from './EventsPage';
import InvitesPage from './InvitesPage';
import ProfilePage from './ProfilePage';
import CreateEventModal from '../components/CreateEventModal';

const NAV = [
  { id: 'feed',    path: '/',        icon: '⊞', label: 'Feed',       section: 'Discover' },
  { id: 'create',  path: '/create',  icon: '＋', label: 'New Event',  section: 'Host' },
  { id: 'events',  path: '/events',  icon: '◫', label: 'My Events',  section: null },
  { id: 'invites', path: '/invites', icon: '✉', label: 'Invitations', section: 'You' },
  { id: 'profile', path: '/profile', icon: '◉', label: 'Profile',    section: null },
];

const PAGE_META = {
  '/':        { title: 'Discover',     sub: 'Upcoming dining experiences' },
  '/events':  { title: 'My Events',    sub: 'Events you are hosting' },
  '/invites': { title: 'Invitations',  sub: 'Your received invitations' },
  '/profile': { title: 'Profile',      sub: 'Your dining identity' },
  '/create':  { title: 'New Event',    sub: 'Fill in the details below' },
};

export default function AppShell() {
  const { user, pendingInvites } = useApp();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editEventId, setEditEventId] = useState(null);

  const meta = PAGE_META[pathname] || PAGE_META['/'];

  function goTo(path) {
    if (path === '/create') { setEditEventId(null); setShowCreate(true); }
    else navigate(path);
    setSidebarOpen(false);
  }

  function openEdit(id) { setEditEventId(id); setShowCreate(true); }

  const sectionMap = {};
  NAV.forEach(n => { if (n.section) sectionMap[n.id] = n.section; });

  let currentSection = null;
  const navItems = NAV.map(n => {
    const showSection = n.section && n.section !== currentSection;
    if (n.section) currentSection = n.section;
    return { ...n, showSection };
  });

  return (
    <div className="shell">
      {/* Sidebar overlay */}
      <div className={`sb-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sb-logo">
          <div className="sb-logo-mark">T</div>
          <div>
            <div className="sb-logo-name">Tableaux</div>
            <div className="sb-logo-sub">Social Dining</div>
          </div>
        </div>
        <div className="sb-scroll">
          {navItems.map(n => (
            <React.Fragment key={n.id}>
              {n.showSection && <div className="sb-section">{n.section}</div>}
              <div
                className={`sb-item ${pathname === n.path ? 'active' : ''}`}
                onClick={() => goTo(n.path)}
              >
                <span className="sb-icon">{n.icon}</span>
                {n.label}
                {n.id === 'invites' && pendingInvites > 0 && (
                  <span className="sb-badge">{pendingInvites}</span>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="sb-user">
          <div className="sb-user-inner" onClick={() => goTo('/profile')}>
            <div className="av av-sm av-indigo">{user ? initials(user.name) : 'AD'}</div>
            <div>
              <div className="sb-user-name">{user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]?.[0]}.</div>
              <div className="sb-user-role">Host · Guest</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="main-wrap">
        <div className="topnav">
          <div className="topnav-left">
            <div className="hamburger" onClick={() => setSidebarOpen(true)}>☰</div>
            <div className="page-title">
              <h1>{meta.title}</h1>
              <p>{meta.sub}</p>
            </div>
          </div>
          <div className="topnav-right">
            <div className="icon-btn" onClick={() => navigate('/invites')} style={{ position: 'relative' }}>
              <span>✉</span>
              {pendingInvites > 0 && <div className="notif-dot" />}
            </div>
            <div className="icon-btn" onClick={() => navigate('/profile')}><span>◉</span></div>
            <div className="av av-sm av-indigo" style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
              {user ? initials(user.name) : 'AD'}
            </div>
          </div>
        </div>

        <div className="page-body">
          <Routes>
            <Route path="/" element={<FeedPage onOpenCreate={() => { setEditEventId(null); setShowCreate(true); }} onOpenEdit={openEdit} />} />
            <Route path="/events" element={<EventsPage onOpenCreate={() => { setEditEventId(null); setShowCreate(true); }} onOpenEdit={openEdit} />} />
            <Route path="/invites" element={<InvitesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="mob-bar">
        {NAV.map(n => (
          <div
            key={n.id}
            className={`mob-item ${pathname === n.path ? 'active' : ''}`}
            onClick={() => goTo(n.path)}
          >
            <span className="mob-icon">{n.icon}</span>
            <span className="mob-label">{n.label.split(' ')[0]}</span>
            {n.id === 'invites' && pendingInvites > 0 && <div className="mob-dot" />}
          </div>
        ))}
      </div>

      {/* Create / Edit modal */}
      {showCreate && (
        <CreateEventModal
          editId={editEventId}
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); navigate('/events'); }}
        />
      )}
    </div>
  );
}
