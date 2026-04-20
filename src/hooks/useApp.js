import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SEED_EVENTS, CURRENT_USER, SEED_FRIENDSHIPS } from '../data/seed';
import {
  signIn as supabaseSignIn, getProfile,
  createEvent as sbCreateEvent,
  getHostEvents,
  getPublicEvents,
  createRsvp, getGuestRsvps,
  updateProfile as sbUpdateProfile,
  getFriendships, sendFriendRequestDb, acceptFriendRequestDb, removeFriendDb,
} from '../lib/supabase';

const AppCtx = createContext(null);

const STORAGE_KEY = 'tablefolk_state_v1';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// Normalize a Supabase event row to the app's event shape
function normalizeSupabaseEvent(ev, currentUser) {
  const rsvps = ev.rsvps || [];
  const guests = rsvps.map(r => ({
    id: r.guest_id,
    n: r.guest?.full_name || 'Guest',
    s: r.status || 'pending',
    initials: (r.guest?.full_name || 'G').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    color: 'indigo',
    dietaryNote: r.message || '',
  }));
  return {
    id: ev.id,
    title: ev.title || '',
    type: ev.type || 'Dinner Party',
    date: ev.date ? ev.date.split('T')[0] : null,
    time: ev.time || '',
    loc: ev.location || ev.loc || '',
    addr: ev.address || ev.addr || '',
    addrHidden: ev.addr_hidden ?? true,
    cap: ev.capacity || 10,
    vis: ev.visibility || 'inviteOnly',
    desc: ev.description || '',
    dressCode: ev.dress_code || '',
    cover: {
      type: ev.cover_type || 'gradient',
      value: ev.cover_value || 'linear-gradient(135deg, #6C5DD3, #2D2550)',
      emoji: ev.cover_emoji || null,
    },
    host: ev.host?.full_name || (currentUser ? currentUser.name : 'Host'),
    hostId: ev.host_id || (currentUser ? currentUser.id : null),
    mine: currentUser ? ev.host_id === currentUser.id : false,
    guests,
    photoGallery: [],
    eventComments: [],
    pinnedQuotes: [],
    isEnded: ev.status === 'ended' || false,
    isPast: ev.date ? new Date(ev.date) < new Date(new Date().toDateString()) : false,
    galleryEnabled: true,
    photoGalleryEnabled: false,
    city: ev.city || '',
    status: ev.status || 'published',
    isExample: false,
  };
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = loadFromStorage();
    return stored?.user || null;
  });

  // Start with seed events — replaced by Supabase data after login
  const [events, setEvents] = useState(() => {
    const stored = loadFromStorage();
    if (stored?.events && stored.events.length > 0) return stored.events;
    return SEED_EVENTS;
  });

  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [following, setFollowing] = useState(() => {
    const stored = loadFromStorage();
    return stored?.following || [];
  });

  const [friends, setFriends] = useState(() => {
    const stored = loadFromStorage();
    if (!stored?.friends) return SEED_FRIENDSHIPS;
    const storedIds = stored.friends.map(f => f.userId);
    const seedNotInStored = SEED_FRIENDSHIPS.filter(sf => !storedIds.includes(sf.userId));
    return [...stored.friends, ...seedNotInStored];
  });

  const [followedHosts, setFollowedHosts] = useState(() => {
    const stored = loadFromStorage();
    return stored?.followedHosts || [];
  });

  // ── Load all data from Supabase when user logs in ─────────────────────────
  useEffect(() => {
    if (!user?.id || user.id.startsWith('u')) return; // skip seed users

    const loadAllData = async () => {
      try {
        // Load hosted events, guest RSVPs, public feed events, and friendships in parallel
        const [hosted, rsvpd, publicEvts, friendshipsData] = await Promise.allSettled([
          getHostEvents(user.id),
          getGuestRsvps(user.id),
          getPublicEvents({ city: user.city || 'Chicago' }),
          getFriendships(user.id),
        ]);

        const hostedEvents = (hosted.status === 'fulfilled' ? hosted.value : [])
          .map(ev => ({ ...normalizeSupabaseEvent(ev, user), mine: true }));

        const attendingEvents = (rsvpd.status === 'fulfilled' ? rsvpd.value : [])
          .filter(r => r.event)
          .map(r => ({ ...normalizeSupabaseEvent(r.event, user), isInvitedTo: true, mine: false }));

        const publicEvents = (publicEvts.status === 'fulfilled' ? publicEvts.value : [])
          .map(ev => normalizeSupabaseEvent(ev, user))
          .filter(ev => ev.hostId !== user.id); // exclude own events (already in hosted)

        // Keep example seed events, discard non-example seed events
        const exampleSeedEvents = SEED_EVENTS.filter(e => e.isExample);

        // Deduplicate by id — real events take priority
        const uniquePublic = publicEvents.filter(e =>
          !hostedEvents.find(h => h.id === e.id) &&
          !attendingEvents.find(a => a.id === e.id)
        );

        const merged = [
          ...hostedEvents,
          ...attendingEvents,
          ...uniquePublic,
          ...exampleSeedEvents,
        ];

        setEvents(merged.length > exampleSeedEvents.length ? merged : [...merged, ...SEED_EVENTS.filter(e => !e.isExample)]);

        // Load friendships
        if (friendshipsData.status === 'fulfilled' && friendshipsData.value.length > 0) {
          const dbFriends = friendshipsData.value.map(f => ({
            userId: f.friend_id,
            status: f.status,
            name: f.friend?.full_name || '',
            acceptedAt: f.created_at,
          }));
          setFriends(dbFriends);
        }

      } catch (err) {
        console.warn('Supabase data load failed, using local:', err.message);
      }
    };

    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Persist state to localStorage ────────────────────────────────────────
  useEffect(() => {
    saveToStorage({ user, events, following, friends, followedHosts });
  }, [user, events, following, friends, followedHosts]);

  const addToast = useCallback((msg, type = '') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password, session) => {
    let authUser;
    if (session) {
      authUser = session.user;
    } else {
      const data = await supabaseSignIn(email, password);
      authUser = data.user;
    }
    let profile = {};
    try { profile = await getProfile(authUser.id); } catch { profile = {}; }
    const displayName = profile.full_name || authUser.user_metadata?.full_name || email.split('@')[0];
    const newUser = {
      id: authUser.id,
      email: authUser.email,
      name: displayName,
      initials: displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      avatar: profile.avatar_url || null,
      role: profile.role || 'guest',
      city: profile.city || 'Chicago',
      bio: profile.bio || null,
      website: profile.website || null,
      handle: profile.handle || null,
      hosted_count: profile.hosted_count || 0,
      attended_count: profile.attended_count || 0,
      favoriteFood: profile.favorite_food || '',
      favoriteRestaurant: profile.favorite_restaurant || '',
      dietaryRestrictions: profile.dietary_restrictions || [],
      color: 'indigo',
    };
    setUser(newUser);
    return true;
  }, []);

  const loginSocial = useCallback((provider) => {
    setUser({ ...CURRENT_USER, loginProvider: provider });
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    // Clear persisted state so next login starts fresh
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    // Reset to seed events for logged-out state
    setEvents(SEED_EVENTS);
    setFriends(SEED_FRIENDSHIPS);
  }, []);

  // ── Events ────────────────────────────────────────────────────────────────
  const createEvent = useCallback(async (evt) => {
    const localId = 'evt-user-' + Date.now();
    const newEvt = {
      ...evt,
      id: localId,
      mine: true,
      hostId: user?.id || 'u1',
      host: user?.name || CURRENT_USER.name,
      guests: [],
      photoGallery: [],
      eventComments: [],
      pinnedQuotes: [],
      isEnded: false,
      isExample: false,
      experienceTags: evt.experienceTags || [],
    };
    setEvents(e => [newEvt, ...e]);

    if (user?.id && !user.id.startsWith('u')) {
      try {
        const created = await sbCreateEvent({
          title: evt.title,
          type: evt.type,
          date: evt.date || null,
          time: evt.time || null,
          location: evt.loc || evt.location || '',
          address: evt.addr || '',
          addr_hidden: evt.addrHidden ?? true,
          capacity: evt.cap || 10,
          visibility: evt.vis || 'inviteOnly',
          description: evt.desc || '',
          dress_code: evt.dressCode || '',
          cover_type: evt.cover?.type || 'gradient',
          cover_value: evt.cover?.value || '',
          cover_emoji: evt.cover?.emoji || null,
          host_id: user.id,
          status: 'published',
          city: user.city || 'Chicago',
        });
        // Replace local ID with real Supabase ID
        if (created?.id) {
          setEvents(e => e.map(ev => ev.id === localId ? { ...ev, id: created.id } : ev));
        }
      } catch (err) {
        console.warn('Supabase createEvent failed, using local:', err.message);
      }
    }
    return newEvt;
  }, [user]);

  const updateEvent = useCallback((id, patch) => {
    setEvents(e => e.map(ev => ev.id === id ? { ...ev, ...patch } : ev));
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents(e => e.filter(ev => ev.id !== id));
  }, []);

  function makeNotif(type, message, eventId) {
    return { id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), type, message, eventId, read: false, createdAt: new Date().toISOString() };
  }
  function addNotification(notif) { setNotifications(prev => [notif, ...prev.slice(0, 49)]); }
  function markNotifRead(notifId) { setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n)); }
  function markAllNotifsRead() { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }

  function approveRSVP(eventId, guestId, guestName) {
    setEvents(prev => prev.map(ev => ev.id !== eventId ? ev : {
      ...ev, guests: (ev.guests || []).map(g => g.id === guestId ? { ...g, s: 'approved' } : g)
    }));
    addNotification(makeNotif('rsvp_approved', guestName + ' approved for your event', eventId));
    addToast(guestName + ' approved 🎉', 'success');
  }

  function declineRSVP(eventId, guestId, guestName) {
    setEvents(prev => prev.map(ev => ev.id !== eventId ? ev : {
      ...ev, guests: (ev.guests || []).map(g => g.id === guestId ? { ...g, s: 'declined' } : g)
    }));
    addToast(guestName + ' declined', 'info');
  }

  function reviveRSVP(eventId, guestId, guestName) {
    setEvents(prev => prev.map(ev => ev.id !== eventId ? ev : {
      ...ev, guests: (ev.guests || []).map(g => g.id === guestId ? { ...g, s: 'approved' } : g)
    }));
    addNotification(makeNotif('rsvp_approved', guestName + ' accepted after all', eventId));
    addToast(guestName + ' accepted 🎉', 'success');
  }

  const rsvpEvent = useCallback(async (eventId, status, dietaryNote) => {
    setEvents(e => e.map(ev => {
      if (ev.id !== eventId) return ev;
      const userId = user?.id || 'u1';
      const existing = (ev.guests || []).find(g => g.id === userId);
      const updatedGuests = existing
        ? ev.guests.map(g => g.id === userId ? { ...g, s: status, dietaryNote: dietaryNote || g.dietaryNote || '' } : g)
        : [...(ev.guests || []), { id: userId, n: user?.name || 'You', s: status, initials: user?.initials || 'U', color: 'indigo', dietaryNote: dietaryNote || '' }];
      return { ...ev, guests: updatedGuests };
    }));
    if (user?.id && !user.id.startsWith('u')) {
      try {
        await createRsvp(eventId, user.id, dietaryNote || '');
      } catch (err) {
        console.warn('Supabase rsvp failed:', err.message);
      }
    }
  }, [user]);

  const claimPotluckItem = useCallback((eventId, itemId) => {
    setEvents(e => e.map(ev => {
      if (ev.id !== eventId || !ev.potluck) return ev;
      return { ...ev, potluck: { ...ev.potluck, items: ev.potluck.items.map(it => it.id === itemId ? { ...it, claimedBy: user?.id || 'u1', claimerName: user?.name || 'You' } : it) } };
    }));
  }, [user]);

  const unclaimPotluckItem = useCallback((eventId, itemId) => {
    setEvents(e => e.map(ev => {
      if (ev.id !== eventId || !ev.potluck) return ev;
      return { ...ev, potluck: { ...ev.potluck, items: ev.potluck.items.map(it => it.id === itemId ? { ...it, claimedBy: null, claimerName: null } : it) } };
    }));
  }, []);

  const addPhoto = useCallback((eventId, photo) => {
    setEvents(e => e.map(ev => ev.id !== eventId ? ev : { ...ev, photoGallery: [...(ev.photoGallery || []), photo] }));
  }, []);

  const tagPhoto = useCallback((eventId, photoId, tags) => {
    setEvents(e => e.map(ev => {
      if (ev.id !== eventId) return ev;
      return { ...ev, photoGallery: (ev.photoGallery || []).map(ph => ph.id === photoId ? { ...ph, tags: [...new Set([...(ph.tags || []), ...tags])] } : ph) };
    }));
  }, []);

  const removePhotoTag = useCallback((eventId, photoId, tag) => {
    setEvents(e => e.map(ev => {
      if (ev.id !== eventId) return ev;
      return { ...ev, photoGallery: (ev.photoGallery || []).map(ph => ph.id === photoId ? { ...ph, tags: (ph.tags || []).filter(t => t !== tag) } : ph) };
    }));
  }, []);

  const addComment = useCallback((eventId, comment) => {
    setEvents(e => e.map(ev => ev.id !== eventId ? ev : { ...ev, eventComments: [...(ev.eventComments || []), comment] }));
  }, []);

  const pinQuote = useCallback((eventId, commentId) => {
    setEvents(e => e.map(ev => {
      if (ev.id !== eventId) return ev;
      const alreadyPinned = (ev.pinnedQuotes || []).includes(commentId);
      return { ...ev, pinnedQuotes: alreadyPinned ? ev.pinnedQuotes.filter(id => id !== commentId) : [...(ev.pinnedQuotes || []), commentId] };
    }));
  }, []);

  // ── Profile ───────────────────────────────────────────────────────────────
  const updateProfile = useCallback(async (patch) => {
    setUser(u => ({ ...u, ...patch }));
    if (user?.id && !user.id.startsWith('u')) {
      try {
        await sbUpdateProfile(user.id, patch);
      } catch (err) {
        console.warn('Supabase updateProfile failed:', err.message);
      }
    }
  }, [user]);

  // ── Friends ───────────────────────────────────────────────────────────────
  const sendFriendRequest = useCallback(async (userId) => {
    setFriends(f => {
      if (f.find(fr => fr.userId === userId)) return f;
      return [...f, { userId, status: 'pending', sentAt: new Date().toISOString() }];
    });
    if (user?.id && !user.id.startsWith('u')) {
      try { await sendFriendRequestDb(user.id, userId); } catch (err) { console.warn('Friend request failed:', err.message); }
    }
  }, [user]);

  const acceptFriendRequest = useCallback(async (userId) => {
    setFriends(f => f.map(fr => fr.userId === userId ? { ...fr, status: 'accepted' } : fr));
    if (user?.id && !user.id.startsWith('u')) {
      try { await acceptFriendRequestDb(user.id, userId); } catch (err) { console.warn('Accept friend failed:', err.message); }
    }
  }, [user]);

  const removeFriend = useCallback(async (userId) => {
    setFriends(f => f.filter(fr => fr.userId !== userId));
    if (user?.id && !user.id.startsWith('u')) {
      try { await removeFriendDb(user.id, userId); } catch (err) { console.warn('Remove friend failed:', err.message); }
    }
  }, [user]);

  const getFriendStatus = useCallback((userId) => {
    const fr = friends.find(f => f.userId === userId);
    return fr ? fr.status : null;
  }, [friends]);

  const inviteGuests = useCallback((eventId, invites) => {
    setEvents(e => e.map(ev => {
      if (ev.id !== eventId) return ev;
      const newInvites = invites.map(inv => ({
        id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        recipientId: inv.userId || null,
        recipientEmail: inv.email || null,
        recipientName: inv.name,
        status: inv.userId ? 'pending' : 'sent',
        invitedAt: new Date().toISOString(),
        message: inv.message || null,
      }));
      return { ...ev, invites: [...(ev.invites || []), ...newInvites] };
    }));
  }, []);

  const followHost = useCallback((hostId) => {
    setFollowedHosts(h => h.includes(hostId) ? h : [...h, hostId]);
  }, []);

  const unfollowHost = useCallback((hostId) => {
    setFollowedHosts(h => h.filter(id => id !== hostId));
  }, []);

  const isFollowingHost = useCallback((hostId) => {
    return followedHosts.includes(hostId);
  }, [followedHosts]);

  return (
    <AppCtx.Provider value={{
      user, login, loginSocial, logout,
      events, createEvent, updateEvent, deleteEvent,
      rsvpEvent, claimPotluckItem, unclaimPotluckItem,
      addPhoto, tagPhoto, removePhotoTag,
      addComment, pinQuote, updateProfile,
      following, setFollowing,
      friends, sendFriendRequest, acceptFriendRequest, removeFriend, getFriendStatus,
      inviteGuests,
      followedHosts, followHost, unfollowHost, isFollowingHost,
      toasts, addToast,
      notifications, markNotifRead, markAllNotifsRead,
      approveRSVP, declineRSVP, reviveRSVP,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  return useContext(AppCtx);
}
