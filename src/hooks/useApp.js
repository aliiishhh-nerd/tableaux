import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SEED_EVENTS, CURRENT_USER, SEED_FRIENDSHIPS } from '../data/seed';
import { signIn as supabaseSignIn, getProfile, supabase } from '../lib/supabase';

const AppCtx = createContext(null);

const STORAGE_KEY = 'tableaux_state_v1';

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
    } catch {
        // Storage full or unavailable — fail silently
    }
}

export function AppProvider({ children }) {
    const [user, setUser] = useState(() => {
        const stored = loadFromStorage();
        return stored?.user || null;
    });

    const [events, setEvents] = useState(() => {
        const stored = loadFromStorage();
        if (!stored?.events) return SEED_EVENTS;
        const userCreated = stored.events.filter(e => e.id.startsWith('evt-') && !SEED_EVENTS.find(s => s.id === e.id));
        const seedWithUpdates = SEED_EVENTS.map(seed => {
            const stored_evt = stored.events.find(s => s.id === seed.id);
            return stored_evt || seed;
        });
        return [...userCreated, ...seedWithUpdates];
    });

    const [toasts, setToasts] = useState([]);

    const [following, setFollowing] = useState(() => {
        const stored = loadFromStorage();
        return stored?.following || [];
    });

    // Friend system: { userId, status: 'pending' | 'accepted' | 'blocked' }
    const [friends, setFriends] = useState(() => {
        const stored = loadFromStorage();
        return stored?.friends || SEED_FRIENDSHIPS;
    });

    // Hosts the current user follows (by hostId)
    const [followedHosts, setFollowedHosts] = useState(() => {
        const stored = loadFromStorage();
        return stored?.followedHosts || [];
    });

    // Persist all state
    useEffect(() => {
        saveToStorage({ user, events, following, friends, followedHosts });
    }, [user, events, following, friends, followedHosts]);

    const addToast = useCallback((msg, type = '') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    }, []);

    // ── Auth ──────────────────────────────────────
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
            city: profile.city || null,
            bio: profile.bio || null,
            website: profile.website || null,
            hosted_count: profile.hosted_count || 0,
            attended_count: profile.attended_count || 0,
            // Dietary & foodie info
            favoriteFood: profile.favoriteFood || '',
            favoriteRestaurant: profile.favoriteRestaurant || '',
            dietaryRestrictions: profile.dietaryRestrictions || [],
        };
        setUser(newUser);
        return true;
    }, []);

    const loginSocial = useCallback((provider) => {
        setUser({ ...CURRENT_USER, loginProvider: provider });
        return true;
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        try {
            const stored = loadFromStorage();
            if (stored) saveToStorage({ ...stored, user: null });
        } catch {}
    }, []);

    // ── Events ───────────────────────────────────
    const createEvent = useCallback((evt) => {
        const newEvt = {
            ...evt,
            id: 'evt-user-' + Date.now(),
            mine: true,
            hostId: user?.id || 'u1',
            host: user?.name || CURRENT_USER.name,
            guests: [],
            photoGallery: [],
            eventComments: [],
            pinnedQuotes: [],
            isEnded: false,
            experienceTags: evt.experienceTags || [],
        };
        setEvents(e => [newEvt, ...e]);
        return newEvt;
    }, [user]);

    const updateEvent = useCallback((id, patch) => {
        setEvents(e => e.map(ev => ev.id === id ? { ...ev, ...patch } : ev));
    }, []);

    const deleteEvent = useCallback((id) => {
        setEvents(e => e.filter(ev => ev.id !== id));
    }, []);

    const rsvpEvent = useCallback((eventId, status, dietaryNote) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            const guests = ev.guests.map(g =>
                g.id === 'u1' ? { ...g, s: status, dietaryNote: dietaryNote || g.dietaryNote || '' } : g
            );
            return { ...ev, guests };
        }));
    }, []);

    const claimPotluckItem = useCallback((eventId, itemId) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId || !ev.potluck) return ev;
            const items = ev.potluck.items.map(it =>
                it.id === itemId ? { ...it, claimedBy: 'u1', claimerName: user?.name || 'You' } : it
            );
            return { ...ev, potluck: { ...ev.potluck, items } };
        }));
    }, [user]);

    const unclaimPotluckItem = useCallback((eventId, itemId) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId || !ev.potluck) return ev;
            const items = ev.potluck.items.map(it =>
                it.id === itemId ? { ...it, claimedBy: null, claimerName: null } : it
            );
            return { ...ev, potluck: { ...ev.potluck, items } };
        }));
    }, []);

    // ── Photos with tagging ──────────────────────
    const addPhoto = useCallback((eventId, photo) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            return { ...ev, photoGallery: [...(ev.photoGallery || []), photo] };
        }));
    }, []);

    const tagPhoto = useCallback((eventId, photoId, tags) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            const gallery = (ev.photoGallery || []).map(ph =>
                ph.id === photoId ? { ...ph, tags: [...new Set([...(ph.tags || []), ...tags])] } : ph
            );
            return { ...ev, photoGallery: gallery };
        }));
    }, []);

    const removePhotoTag = useCallback((eventId, photoId, tag) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            const gallery = (ev.photoGallery || []).map(ph =>
                ph.id === photoId ? { ...ph, tags: (ph.tags || []).filter(t => t !== tag) } : ph
            );
            return { ...ev, photoGallery: gallery };
        }));
    }, []);

    // ── Comments & Quotes ────────────────────────
    const addComment = useCallback((eventId, comment) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            return { ...ev, eventComments: [...(ev.eventComments || []), comment] };
        }));
    }, []);

    const pinQuote = useCallback((eventId, commentId) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            const alreadyPinned = (ev.pinnedQuotes || []).includes(commentId);
            return {
                ...ev,
                pinnedQuotes: alreadyPinned
                    ? ev.pinnedQuotes.filter(id => id !== commentId)
                    : [...(ev.pinnedQuotes || []), commentId],
            };
        }));
    }, []);

    // ── Profile ──────────────────────────────────
    const updateProfile = useCallback((patch) => {
        setUser(u => ({ ...u, ...patch }));
    }, []);

    // ── Friend System ────────────────────────────
    const sendFriendRequest = useCallback((userId) => {
        setFriends(f => {
            if (f.find(fr => fr.userId === userId)) return f;
            return [...f, { userId, status: 'pending', sentAt: new Date().toISOString() }];
        });
    }, []);

    const acceptFriendRequest = useCallback((userId) => {
        setFriends(f => f.map(fr => fr.userId === userId ? { ...fr, status: 'accepted' } : fr));
    }, []);

    const removeFriend = useCallback((userId) => {
        setFriends(f => f.filter(fr => fr.userId !== userId));
    }, []);

    const getFriendStatus = useCallback((userId) => {
        const fr = friends.find(f => f.userId === userId);
        return fr ? fr.status : null;
    }, [friends]);

    // ── Follow Host ──────────────────────────────
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
            // Friend system
            friends, sendFriendRequest, acceptFriendRequest, removeFriend, getFriendStatus,
            // Follow host
            followedHosts, followHost, unfollowHost, isFollowingHost,
            toasts, addToast,
        }}>
            {children}
        </AppCtx.Provider>
    );
}

export function useApp() {
    return useContext(AppCtx);
}
