import React, { createContext, useContext, useState, useCallback } from 'react';
import { SEED_EVENTS, CURRENT_USER } from '../data/seed';
import { signIn as supabaseSignIn, getProfile, supabase } from '../lib/supabase';

const AppCtx = createContext(null);

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState(SEED_EVENTS);
    const [toasts, setToasts] = useState([]);
    const [following, setFollowing] = useState([]);

    const addToast = useCallback((msg, type = '') => {
        const id = Date.now();
        setToasts(t => [...t, { id, msg, type }]);
        setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    }, []);

    // login accepts either (email, password) or (email, null, session) for confirmation flow
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
        setUser({
            id: authUser.id,
            email: authUser.email,
            name: displayName,
            initials: displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            avatar: profile.avatar_url || null,
            role: profile.role || 'guest',
            city: profile.city || null,
            bio: profile.bio || null,
            hosted_count: profile.hosted_count || 0,
            attended_count: profile.attended_count || 0,
        });
        return true;
    }, []);

    const loginSocial = useCallback((provider) => {
        setUser({ ...CURRENT_USER, loginProvider: provider });
        return true;
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
    }, []);

    const createEvent = useCallback((evt) => {
        const newEvt = { ...evt, id: 'evt-' + Date.now(), mine: true, hostId: 'u1', host: CURRENT_USER.name, guests: [], photoGallery: [], isEnded: false };
        setEvents(e => [newEvt, ...e]);
        return newEvt;
    }, []);

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

    const updateProfile = useCallback((patch) => {
        setUser(u => ({ ...u, ...patch }));
    }, []);

    return (
        <AppCtx.Provider value={{
            user, login, loginSocial, logout,
            events, createEvent, updateEvent, deleteEvent,
            rsvpEvent, claimPotluckItem, unclaimPotluckItem,
            addPhoto, updateProfile,
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
