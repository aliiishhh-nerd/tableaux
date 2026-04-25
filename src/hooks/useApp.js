import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SEED_EVENTS, CURRENT_USER, SEED_FRIENDSHIPS } from '../data/seed';
import {
  signIn as supabaseSignIn, getProfile,
  createEvent as sbCreateEvent,
  getHostEvents,
  getPublicEvents,
  createRsvp, getGuestRsvps, updateRsvpStatus,
  addMoment as sbAddMoment,
  updateProfile as sbUpdateProfile,
  getFriendships, sendFriendRequestDb, acceptFriendRequestDb, removeFriendDb,
} from '../lib/supabase';

const AppCtx = createContext(null);

const STORAGE_KEY = 'tablefolk_state_v1';

function isRealUser(u) {
  return !!(u && u.id && typeof u.id === 'string' && !u.id.startsWith('u'));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveToStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const DB_TO_UI_EVENT_TYPE = {
  'dinner_party':      'Dinner Party',
  'potluck':           'Potluck',
  'supper_club':       'Supper Club',
  'brunch':            'Brunch',
  'cooking_class':     'Cooking Class',
  'restaurant_outing': 'Restaurant',
  'restaurant':        'Restaurant',
  'tasting':           'Tasting',
  'other':             'Other',
};
function displayEventType(dbValue) {
  if (!dbValue) return 'Dinner Party';
  return DB_TO_UI_EVENT_TYPE[dbValue] || dbValue;
}

const VIS_MAP = {
  'Public':       'public',
  'public':       'public',
  'Friends Only': 'friendsOnly',
  'friendsOnly':  'friendsOnly',
  'friends_only': 'friendsOnly',
  'Invite Only':  'inviteOnly',
  'inviteOnly':   'inviteOnly',
  'invite_only':  'inviteOnly',
};
function normalizeVisibility(rawVis, isPublic) {
  if (rawVis && VIS_MAP[rawVis]) return VIS_MAP[rawVis];
  if (rawVis && VIS_MAP[rawVis.trim()]) return VIS_MAP[rawVis.trim()];
  return isPublic ? 'public' : 'inviteOnly';
}

function normalizeSupabaseEvent(ev, currentUser) {
  const rsvps = ev.rsvps || [];
  const guests = rsvps.map(r => ({
    id: r.guest_id,
    rsvpId: r.id,
    n: r.guest?.full_name || 'Guest',
    s: r.status || 'pending',
    initials: (r.guest?.full_name || 'G').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    color: 'indigo',
    dietaryNote: r.message || '',
  }));
  const vis = normalizeVisibility(ev.visibility, ev.is_public);
  const coverType = ev.cover_type || (ev.cover_gradient ? 'gradient' : (ev.cover_emoji ? 'emoji' : 'gradient'));
  const coverValue = ev.cover_value || ev.cover_gradient || 'linear-gradient(135deg, #6C5DD3, #2D2550)';
  return {
    id: ev.id,
    title: ev.title || '',
    type: displayEventType(ev.event_type || ev.type),
    date: ev.date ? ev.date.split('T')[0] : null,
    time: ev.time || '',
    loc: ev.location_name || ev.location || ev.loc || '',
    addr: ev.location_address || ev.address || ev.addr || '',
    addrHidden: ev.addr_hidden ?? true,
    cap: ev.capacity || 10,
    vis,
    desc: ev.description || '',
    dressCode: ev.dress_code || '',
    cover: { type: coverType, value: coverValue, emoji: ev.cover_emoji || null },
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

  const [events, setEvents] = useState(() => {
    const stored = loadFromStorage();
    if (isRealUser(stored?.user)) {
      if (stored?.events && stored.events.length > 0) return stored.events;
      return SEED_EVENTS.filter(e => e.isExample).map(e => ({ ...e, mine: false }));
    }
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
    if (isRealUser(stored?.user)) return stored?.friends || [];
    if (!stored?.friends) return SEED_FRIENDSHIPS;
    const storedIds = stored.friends.map(f => f.userId);
    const seedNotInStored = SEED_FRIENDSHIPS.filter(sf => !storedIds.includes(sf.userId));
    return [...stored.friends, ...seedNotInStored];
  });

  const [followedHosts, setFollowedHosts] = useState(() => {
    const stored = loadFromStorage();
    return stored?.followedHosts || [];
  });

  // Tick counter bumped whenever the tab regains visibility. Used as
  // a dep on the load effect to force a fresh data pull after the user
  // has been away (e.g., approving RSVPs in another account/tab).
  const [refreshTick, setRefreshTick] = useState(0);

  const addToast = useCallback((msg, type = '') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 5000);
  }, []);

  useEffect(() => {
    if (!isRealUser(user)) return;
    const loadAllData = async () => {
      try {
        const [hosted, rsvpd, publicEvts, friendshipsData] = await Promise.allSettled([
          getHostEvents(user.id),
          getGuestRsvps(user.id),
          getPublicEvents({}),
          getFriendships(user.id),
        ]);

        console.log('[Supabase load] hosted:', hosted.status, hosted.status === 'fulfilled' ? (hosted.value?.length || 0) + ' events' : hosted.reason?.message);
        console.log('[Supabase load] rsvps:', rsvpd.status, rsvpd.status === 'fulfilled' ? (rsvpd.value?.length || 0) + ' rsvps' : rsvpd.reason?.message);
        console.log('[Supabase load] public:', publicEvts.status, publicEvts.status === 'fulfilled' ? (publicEvts.value?.length || 0) + ' public events' : publicEvts.reason?.message);
        console.log('[Supabase load] friends:', friendshipsData.status, friendshipsData.status === 'fulfilled' ? (friendshipsData.value?.length || 0) + ' friendships' : friendshipsData.reason?.message);

        const hostedEvents = (hosted.status === 'fulfilled' ? hosted.value : [])
          .map(ev => ({ ...normalizeSupabaseEvent(ev, user), mine: true }));

        // getGuestRsvps doesn't nest rsvps on the joined event, so guests comes back [].
        // Inject the current user with their own rsvpId + status so myGuest() lookups work.
        const attendingEvents = (rsvpd.status === 'fulfilled' ? rsvpd.value : [])
          .filter(r => r.event)
          .map(r => {
            const base = normalizeSupabaseEvent(r.event, user);
            const me = {
              id: user.id,
              rsvpId: r.id,
              n: user.name || 'You',
              s: r.status || 'pending',
              initials: user.initials || 'U',
              color: 'indigo',
              dietaryNote: r.message || '',
            };
            const others = (base.guests || []).filter(g => g.id !== user.id);
            return { ...base, guests: [...others, me], isInvitedTo: true, mine: false };
          });

        const publicEvents = (publicEvts.status === 'fulfilled' ? publicEvts.value : [])
          .map(ev => normalizeSupabaseEvent(ev, user))
          .filter(ev => ev.hostId !== user.id);

        const exampleSeedEvents = SEED_EVENTS.filter(e => e.isExample).map(e => ({ ...e, mine: false }));

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

        // Derive notifications from loaded data.
        // Host: every pending RSVP on my events -> "someone wants to join"
        // Guest: my RSVPs that are now approved -> "you were approved"
        const hostNotifs = hostedEvents.flatMap(ev =>
          (ev.guests || [])
            .filter(g => g.s === 'pending' && g.id !== user.id)
            .map(g => ({
              id: 'rsvp-req-' + ev.id + '-' + g.id,
              type: 'rsvp_request',
              message: (g.n || 'Someone') + ' requested to join ' + ev.title,
              eventId: ev.id,
              read: false,
              createdAt: new Date().toISOString(),
            }))
        );
        const guestNotifs = attendingEvents
          .filter(ev => (ev.guests || []).find(g => g.id === user.id && g.s === 'approved'))
          .map(ev => ({
            id: 'rsvp-approved-' + ev.id,
            type: 'rsvp_approved',
            message: 'You were approved for ' + ev.title,
            eventId: ev.id,
            read: false,
            createdAt: new Date().toISOString(),
          }));
        setNotifications([...hostNotifs, ...guestNotifs]);
      } catch (err) {
        console.error('[Supabase load] top-level error:', err);
        addToast('Data load failed — some info may be stale', 'error');
      }
    };
    loadAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, refreshTick]);

  // Refresh from DB whenever the tab becomes visible again. Covers
  // the common case where Alicia switches to Test3's incognito window,
  // does something, and switches back to Test1 expecting fresh state.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') setRefreshTick(t => t + 1);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  useEffect(() => {
    saveToStorage({ user, events, following, friends, followedHosts });
  }, [user, events, following, friends, followedHosts]);

  const login = useCallback(async (email, password, session) => {
    let authUser;
    if (session) authUser = session.user;
    else {
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
    if (isRealUser(newUser)) setFriends([]);
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
    setEvents(SEED_EVENTS.filter(e => e.isExample));
    setFriends([]);
    setNotifications([]);
  }, []);

  const createEvent = useCallback(async (evt) => {
    const localId = 'evt-user-' + Date.now();
    const visStr = evt.vis || 'inviteOnly';
    const isPublic = visStr === 'Public' || visStr === 'public' || evt.isPublic === true || evt.is_public === true;
    const newEvt = {
      ...evt, id: localId, mine: true,
      hostId: user?.id || 'u1', host: user?.name || CURRENT_USER.name,
      guests: [], photoGallery: [], eventComments: [], pinnedQuotes: [],
      isEnded: false, isExample: false, experienceTags: evt.experienceTags || [],
    };
    setEvents(e => [newEvt, ...e]);
    if (isRealUser(user)) {
      const payload = {
        title: evt.title, type: evt.type,
        date: evt.date || null, time: evt.time || null,
        location: evt.loc || evt.location || '',
        address: evt.addr || '',
        addr_hidden: evt.addrHidden ?? true,
        capacity: evt.cap || 10,
        visibility: visStr, is_public: isPublic,
        description: evt.desc || '',
        dress_code: evt.dressCode || '',
        cover_type: evt.cover?.type || 'gradient',
        cover_value: evt.cover?.value || '',
        cover_emoji: evt.cover?.emoji || null,
        host_id: user.id, status: 'published',
        city: user.city || 'Chicago',
      };
      console.log('[createEvent] sending to Supabase:', payload);
      try {
        const created = await sbCreateEvent(payload);
        console.log('[createEvent] Supabase response:', created);
        if (created?.id) {
          setEvents(e => e.map(ev => ev.id === localId ? { ...ev, id: created.id } : ev));
          addToast('Event saved \u2713', 'success');
        } else {
          addToast('Event saved locally \u2014 database did not confirm the write', 'error');
        }
      } catch (err) {
        console.error('[createEvent] Supabase error:', err);
        addToast('Database save failed: ' + (err?.message || 'unknown'), 'error');
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

  function approveRSVP(eventId, guestId, guestName, rsvpId) {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      return { ...ev, guests: (ev.guests || []).map(x => x.id === guestId ? { ...x, s: 'approved' } : x) };
    }));
    if (rsvpId && isRealUser(user)) {
      updateRsvpStatus(rsvpId, 'approved').catch(err => {
        console.error('[approveRSVP] DB update failed:', err);
        addToast('Approve failed to save: ' + (err?.message || 'unknown'), 'error');
      });
    } else if (!rsvpId && isRealUser(user)) {
      console.warn('[approveRSVP] no rsvpId passed for guest', guestId);
    }
    addNotification(makeNotif('rsvp_approved', guestName + ' approved for your event', eventId));
    addToast(guestName + ' approved 🎉', 'success');
  }

  function declineRSVP(eventId, guestId, guestName, rsvpId) {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      return { ...ev, guests: (ev.guests || []).map(x => x.id === guestId ? { ...x, s: 'declined' } : x) };
    }));
    if (rsvpId && isRealUser(user)) {
      updateRsvpStatus(rsvpId, 'declined').catch(err => {
        console.error('[declineRSVP] DB update failed:', err);
        addToast('Decline failed to save: ' + (err?.message || 'unknown'), 'error');
      });
    } else if (!rsvpId && isRealUser(user)) {
      console.warn('[declineRSVP] no rsvpId passed for guest', guestId);
    }
    addToast(guestName + ' declined', 'info');
  }

  function reviveRSVP(eventId, guestId, guestName, rsvpId) {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      return { ...ev, guests: (ev.guests || []).map(x => x.id === guestId ? { ...x, s: 'approved' } : x) };
    }));
    if (rsvpId && isRealUser(user)) {
      updateRsvpStatus(rsvpId, 'approved').catch(err => {
        console.error('[reviveRSVP] DB update failed:', err);
        addToast('Accept failed to save: ' + (err?.message || 'unknown'), 'error');
      });
    } else if (!rsvpId && isRealUser(user)) {
      console.warn('[reviveRSVP] no rsvpId passed for guest', guestId);
    }
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
        await createRsvp(eventId, user.id, dietaryNote || '', status);
      } catch (err) {
        console.error('[rsvpEvent] Supabase rsvp failed:', err);
        addToast('RSVP failed to save: ' + (err?.message || 'unknown'), 'error');
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
      try { await sbAddMoment(eventId, user.id, null, comment.text || comment); }
      catch (err) { console.warn('Supabase addMoment failed:', err.message); }
    }
  }, [user]);

  const pinQuote = useCallback((eventId, commentId) => {
    setEvents(e => e.map(ev => {
      if (ev.id !== eventId) return ev;
      const alreadyPinned = (ev.pinnedQuotes || []).includes(commentId);
      return { ...ev, pinnedQuotes: alreadyPinned ? ev.pinnedQuotes.filter(id => id !== commentId) : [...(ev.pinnedQuotes || []), commentId] };
    }));
  }, []);

  const updateProfile = useCallback(async (patch) => {
    setUser(u => ({ ...u, ...patch }));
    if (isRealUser(user)) {
      try { await sbUpdateProfile(user.id, patch); }
      catch (err) { console.warn('Supabase updateProfile failed:', err.message); }
    }
  }, [user]);

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
