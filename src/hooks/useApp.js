import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SEED_EVENTS, CURRENT_USER } from '../data/seed';
import {
  signIn as supabaseSignIn, getProfile,
  createEvent as sbCreateEvent,
  getHostEvents,
  getPublicEvents,
  createRsvp, getGuestRsvps,
  addMoment as sbAddMoment,
  updateProfile as sbUpdateProfile,
  getFriendships, sendFriendRequestDb, acceptFriendRequestDb, removeFriendDb,
} from '../lib/supabase';

const AppCtx = createContext(null);

const STORAGE_KEY = 'tablefolk_state_v1';

// A "real" user is one authenticated through Supabase — their id is a UUID,
// not a seed id like 'u1'..'u12'. Every seed/demo path is gated on this.
function isRealUser(u) {
  return !!(u && u.id && typeof u.id === 'string' && !u.id.startsWith('u'));
}

// Only the 3 isExample seed events ship for anon / logged-out state.
// Everything else is real-user data via Supabase.
function exampleSeedsOnly() {
  return SEED_EVENTS.filter(e => e.isExample);
}

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

// Translate a DB row to the app's in-memory event shape.
// Reads from the REAL schema column names (location_name, location_address, event_type, etc.)
// Also accepts a few legacy fields for resilience.
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
  const vis = ev.visibility || (ev.is_public ? 'Public' : 'inviteOnly');
  const coverType =
    ev.cover_type ||
    (ev.cover_gradient ? 'gradient' : (ev.cover_emoji ? 'emoji' : 'gradient'));
  const coverValue =
    ev.cover_value ||
    ev.cover_gradient ||
    'linear-gradient(135deg, #6C5DD3, #2D2550)';
  return {
    id: ev.id,
    title: ev.title || '',
    type: ev.event_type || ev.type || 'Dinner Party',
    date: ev.date ? ev.date.split('T')[0] : null,
    time: ev.time || '',
    loc: ev.location_name || ev.location || ev.loc || '',
    addr: ev.location_address || ev.address || ev.addr || '',
    addrHidden: ev.addr_hidden ?? true,
    cap: ev.capacity || 10,
    vis,
    desc: ev.description || '',
    dressCode: ev.dress_code || '',
    cover: {
      type: coverType,
      value: coverValue,
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

  // EVENTS initial state:
  //   - Real user restored from storage: use their persisted events; DB load refreshes
  //   - Anon or seed demo user: show ONLY example seeds (no fake data bloat)
  const [events, setEvents] = useState(() => {
    const stored = loadFromStorage();
    if (isRealUser(stored?.user)) {
      if (stored?.events && stored.events.length > 0) return stored.events;
      return exampleSeedsOnly();
    }
    if (stored?.events && stored.events.length > 0) return stored.events;
    // Anon state: examples only, not the whole SEED_EVENTS bucket
    return exampleSeedsOnly();
  });

  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [following, setFollowing] = useState(() => {
    const stored = loadFromStorage();
    return stored?.following || [];
  });

  // FRIENDS initial state:
  //   - Real user: never inject SEED_FRIENDSHIPS. Start empty; DB load populates.
  //   - Anon / seed demo user: empty too now (removed seed friends for clean anon UX)
  const [friends, setFriends] = useState(() => {
    const stored = loadFromStorage();
    if (isRealUser(stored?.user)) return stored?.friends || [];
    return [];
  });

  const [followedHosts, setFollowedHosts] = useState(() => {
    const stored = loadFromStorage();
    return stored?.followedHosts || [];
  });

  const addToast = useCallback((msg, type = '') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // ── Load all data from Supabase when user logs in ─────────────────────────
  useEffect(() => {
    if (!isRealUser(user)) return;

    const loadAllData = async () => {
      try {
        // NOTE: passing undefined for city — no city column yet (pre-migration).
        // Post-migration we can re-enable city filter by passing user.city here.
        const [hosted, rsvpd, publicEvts, friendshipsData] = await Promise.allSettled([
          getHostEvents(user.id),
          getGuestRsvps(user.id),
          getPublicEvents({}), // <-- no city filter
          getFriendships(user.id),
        ]);

        console.log('[Supabase load] hosted:', hosted.status,
          hosted.status === 'fulfilled' ? (hosted.value?.length || 0) + ' events' : hosted.reason?.message);
        console.log('[Supabase load] rsvps:', rsvpd.status,
          rsvpd.status === 'fulfilled' ? (rsvpd.value?.length || 0) + ' rsvps' : rsvpd.reason?.message);
        console.log('[Supabase load] public:', publicEvts.status,
          publicEvts.status === 'fulfilled' ? (publicEvts.value?.length || 0) + ' public events' : publicEvts.reason?.message);
        console.log('[Supabase load] friends:', friendshipsData.status,
          friendshipsData.status === 'fulfilled' ? (friendshipsData.value?.length || 0) + ' friendships' : friendshipsData.reason?.message);

        const hostedEvents = (hosted.status === 'fulfilled' ? hosted.value : [])
          .map(ev => ({ ...normalizeSupabaseEvent(ev, user), mine: true }));

        const attendingEvents = (rsvpd.status === 'fulfilled' ? rsvpd.value : [])
          .filter(r => r.event)
          .map(r => ({ ...normalizeSupabaseEvent(r.event, user), isInvitedTo: true, mine: false }));

        const publicEvents = (publicEvts.status === 'fulfilled' ? publicEvts.value : [])
          .map(ev => normalizeSupabaseEvent(ev, user))
          .filter(ev => ev.hostId !== user.id);

        const exampleSeedEvents = exampleSeedsOnly();

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

        setEvents(merged);

        if (friendshipsData.status === 'fulfilled') {
          const dbFriends = (friendshipsData.value || []).map(f => ({
            userId: f.friend_id,
            status: f.status,
            name: f.friend?.full_name || '',
            acceptedAt: f.created_at,
          }));
          setFriends(dbFriends);
        } else {
          setFriends([]);
        }
      } catch (err) {
        console.error('[Supabase load] top-level error:', err);
        addToast('Data load failed — some info may be stale', 'error');
      }
    };

    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Persist state to localStorage ────────────────────────────────────────
  useEffect(() => {
    saveToStorage({ user, events, following, friends, followedHosts });
  }, [user, events, following, friends, followedHosts]);

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
    if (isRealUser(newUser)) {
      setFriends([]);
    }
    setUser(newUser);
    return true;
  }, []);

  const loginSocial = useCallback((provider) => {
    setUser({ ...CURRENT_USER, loginProvider: provider });
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setEvents(exampleSeedsOnly());
    setFriends([]);
  }, []);

  // ── Events ────────────────────────────────────────────────────────────────
  const createEvent = useCallback(async (evt) => {
    const localId = 'evt-user-' + Date.now();
    const visStr = evt.vis || 'inviteOnly';
    const isPublic = visStr === 'Public' || visStr === 'public' || evt.isPublic === true || evt.is_public === true;

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

    if (isRealUser(user)) {
      // Payload uses APP field names; mapEventToDb() in supabase.js translates to DB columns.
      const payload = {
        title: evt.title,
        type: evt.type,                               // -> event_type
        date: evt.date || null,
        time: evt.time || null,
        location: evt.loc || evt.location || '',      // -> location_name
        address: evt.addr || evt.address || '',       // -> location_address
        addr_hidden: evt.addrHidden ?? true,
        capacity: evt.cap || 10,
        visibility: visStr,
        is_public: isPublic,
        description: evt.desc || '',
        dress_code: evt.dressCode || '',
        cover_type: evt.cover?.type || 'gradient',
        cover_value: evt.cover?.value || '',
        cover_emoji: evt.cover?.emoji || null,
        cover_gradient: evt.cover?.type === 'gradient' ? evt.cover?.value : null,
        host_id: user.id,
        status: 'published',
        city: user.city || 'Chicago',
      };
      try {
        const created = await sbCreateEvent(payload);
        if (created?.id) {
          setEvents(e => e.map(ev => ev.id === localId ? { ...ev, id: created.id } : ev));
          addToast('Event published ✓', 'success');
        } else {
          addToast('Event saved locally — DB did not confirm', 'error');
        }
      } catch (err) {
        const msg = err?.message || err?.error_description || err?.hint || 'Unknown Supabase error';
        console.error('[createEvent] FAILED:', err);
        addToast('Database save failed: ' + msg, 'error');
      }
    }
    return newEvt;
  }, [user, addToast]);

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
      return { ...ev, guests: updatedGuests, isInvitedTo: status !== 'declined' ? true : ev.isInvitedTo };
    }));
    if (isRealUser(user)) {
      try {
        await createRsvp(eventId, user.id, dietaryNote || '');
        addToast('RSVP sent ✓', 'success');
      } catch (err) {
        console.error('[rsvpEvent] FAILED:', err);
        addToast('RSVP failed: ' + (err?.message || 'unknown'), 'error');
      }
    }
  }, [user, addToast]);

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

  const addComment = useCallback(async (eventId, comment) => {
    setEvents(e => e.map(ev => ev.id !== eventId ? ev : { ...ev, eventComments: [...(ev.eventComments || []), comment] }));
    if (isRealUser(user)) {
      try {
        await sbAddMoment(eventId, user.id, null, comment.text || comment);
      } catch (err) {
        console.warn('Supabase addMoment failed:', err.message);
      }
    }
  }, [user]);

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
    if (isRealUser(user)) {
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
    if (isRealUser(user)) {
      try { await sendFriendRequestDb(user.id, userId); } catch (err) { console.warn('Friend request failed:', err.message); }
    }
  }, [user]);

  const acceptFriendRequest = useCallback(async (userId) => {
    setFriends(f => f.map(fr => fr.userId === userId ? { ...fr, status: 'accepted' } : fr));
    if (isRealUser(user)) {
      try { await acceptFriendRequestDb(user.id, userId); } catch (err) { console.warn('Accept friend failed:', err.message); }
    }
  }, [user]);

  const removeFriend = useCallback(async (userId) => {
    setFriends(f => f.filter(fr => fr.userId !== userId));
    if (isRealUser(user)) {
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
      notifications, markNotifRead, markAllNotifsRead, addNotification,
      approveRSVP, declineRSVP, reviveRSVP, setEvents,
    }}>
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  return useContext(AppCtx);
}
