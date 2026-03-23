import React, { createContext, useContext, useState } from 'react';
import { SEED_EVENTS, SEED_INVITES, SEED_IMAGES, SEED_PLACES } from '../data/seed';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [invites, setInvites] = useState(SEED_INVITES);
  const [profile, setProfile] = useState({
    name: 'Ada Devereux', location: 'Chicago, IL',
    bio: 'Lover of long dinners, natural wine, and good conversation. Hosting since 2019.',
    prefs: ['Italian', 'French', 'Japanese', 'Natural wine'],
    privacy: 'Public', role: 'Both',
  });

  function signIn(email) {
    const parts = email.split('@')[0].split('.');
    setUser({ name: parts.map(p => p[0].toUpperCase() + p.slice(1)).join(' '), email });
  }
  function signUp(first, last, email) {
    const name = `${first} ${last}`;
    setUser({ name, email });
    setProfile(p => ({ ...p, name }));
  }
  function signOut() { setUser(null); }

  function saveEvent(ev) {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === ev.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = ev; return next; }
      return [...prev, ev];
    });
  }
  function approveGuest(eventId, name) {
    setEvents(prev => prev.map(e => e.id !== eventId ? e : {
      ...e, guests: e.guests.map(g => g.n === name ? { ...g, s: 'approved' } : g)
    }));
  }
  function denyGuest(eventId, name) {
    setEvents(prev => prev.map(e => e.id !== eventId ? e : {
      ...e, guests: e.guests.filter(g => g.n !== name)
    }));
  }
  function requestJoin(eventId, userName) {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      if (e.guests.some(g => g.n === userName)) return e;
      return { ...e, guests: [...e.guests, { n: userName, s: 'pending' }] };
    }));
  }
  function addPotluckItem(eventId, item, by) {
    setEvents(prev => prev.map(e => e.id !== eventId ? e : {
      ...e, pot: [...e.pot, { item, by }]
    }));
  }

  function acceptInvite(id) { setInvites(prev => prev.map(i => i.id === id ? { ...i, s: 'approved' } : i)); }
  function declineInvite(id) { setInvites(prev => prev.filter(i => i.id !== id)); }

  const pendingInvites = invites.filter(i => i.s === 'pending').length;

  return (
    <AppContext.Provider value={{
      user, signIn, signUp, signOut,
      events, saveEvent, approveGuest, denyGuest, requestJoin, addPotluckItem,
      invites, acceptInvite, declineInvite, pendingInvites,
      profile, setProfile,
      IMAGES: SEED_IMAGES,
      PLACES: SEED_PLACES,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
