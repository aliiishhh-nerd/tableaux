import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SEED_EVENTS, CURRENT_USER } from '../data/seed';
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
    // Load persisted user on init (restores logged-in state across refreshes)
    const [user, setUser] = useState(() => {
        const stored = loadFromStorage();
        return stored?.user || null;
    });

    // Load persisted events — merge seed with any user-created events
    const [events, setEvents] = useState(() => {
        const stored = loadFromStorage();
        if (!stored?.events) return SEED_EVENTS;
        // Merge: keep seed events intact, append any user-created events on top
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

    // Persist to localStorage whenever user, events, or following change
    useEffect(() => {
        saveToStorage({ user, events, following });
    }, [user, events, following]);

    const addToast = useCallback((msg, type = '') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    }, []);

    const login = useCallback(async (email, password, session) => {
        let authUser;
        if (session) {
            authUser = session.user;
        } else {
            const data = await supabaseSignIn(email, password);
            authUser = data.user;
        }
        let profile = {};
        try {
            profile = await getProfile(authUser.id);
        } catch (e) {
            profile = {};
        }
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
        // Clear only user data from storage, keep events
        try {
            const stored = loadFromStorage();
            if (stored) saveToStorage({ ...stored, user: null });
        } catch {}
    }, []);

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

    const rsvpEvent = useCallback((eventId, status) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            const guests = ev.guests.map(g => g.id === 'u1' ? { ...g, s: status } : g);
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

    const addPhoto = useCallback((eventId, photo) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            return { ...ev, photoGallery: [...(ev.photoGallery || []), photo] };
        }));
    }, []);

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

    const updateProfile = useCallback((patch) => {
        setUser(u => ({ ...u, ...patch }));
    }, []);

    return (
        <AppCtx.Provider value={{
            user, login, loginSocial, logout,
            events, createEvent, updateEvent, deleteEvent,
            rsvpEvent, claimPotluckItem, unclaimPotluckItem,
            addPhoto, addComment, pinQuote, updateProfile,
            following, setFollowing,
            toasts, addToast,
        }}>
            {children}
        </AppCtx.Provider>
    );
}

export function useApp() {
    return useContext(AppCtx);
}
