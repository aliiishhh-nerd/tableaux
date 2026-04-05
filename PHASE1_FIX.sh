#!/bin/bash
# PHASE 1: MINIMAL SAFE FIX - Restore toasts functionality
# This fixes ONLY the root cause: missing toasts in context

set -e

echo "════════════════════════════════════════════════════════"
echo "  PHASE 1: MINIMAL TOASTS FIX"
echo "════════════════════════════════════════════════════════"
echo ""
echo "This fix does 3 things:"
echo "1. Restores 'toasts' variable in useApp.js"
echo "2. Adds 'toasts' to exported context value"
echo "3. Fixes useEffect dependencies"
echo ""

# Backup
echo "Creating backup..."
cp src/hooks/useApp.js src/hooks/useApp.js.phase1.backup
echo "✓ Backup saved"
echo ""

# Create the fixed useApp.js
echo "Building fixed useApp.js..."

cat > src/hooks/useApp.js << 'USEAPPEOF'
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

    // eslint-disable-next-line no-unused-vars
    const [toasts, setToasts] = useState([]);

    const [following, setFollowing] = useState(() => {
        const stored = loadFromStorage();
        return stored?.following || [];
    });

    // Friend system: { userId, status: 'pending' | 'accepted' | 'blocked' }
    const [friends, setFriends] = useState(() => {
        const stored = loadFromStorage();
        return stored?.friends || [];
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
            const myGuest = ev.guests.find(g => g.id === 'u1');
            if (!myGuest) return ev;
            return {
                ...ev,
                guests: ev.guests.map(g => g.id === 'u1' ? { ...g, s: status, dietaryNote: dietaryNote || g.dietaryNote } : g),
            };
        }));
    }, []);

    const claimPotluckItem = useCallback((eventId, itemId) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId || !ev.potluck) return ev;
            return {
                ...ev,
                potluck: {
                    ...ev.potluck,
                    items: ev.potluck.items.map(it => it.id === itemId ? { ...it, claimedBy: 'u1', claimerName: user?.name || 'You' } : it),
                },
            };
        }));
    }, [user]);

    const unclaimPotluckItem = useCallback((eventId, itemId) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId || !ev.potluck) return ev;
            return {
                ...ev,
                potluck: {
                    ...ev.potluck,
                    items: ev.potluck.items.map(it => it.id === itemId ? { ...it, claimedBy: null, claimerName: null } : it),
                },
            };
        }));
    }, []);

    const addPhoto = useCallback((eventId, photo) => {
        setEvents(e => e.map(ev => ev.id === eventId ? { ...ev, photoGallery: [...(ev.photoGallery || []), photo] } : ev));
    }, []);

    const tagPhoto = useCallback((eventId, photoId, tags) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            return {
                ...ev,
                photoGallery: (ev.photoGallery || []).map(ph => ph.id === photoId ? { ...ph, tags: [...(ph.tags || []), ...tags] } : ph),
            };
        }));
    }, []);

    const addComment = useCallback((eventId, comment) => {
        setEvents(e => e.map(ev => ev.id === eventId ? { ...ev, eventComments: [...(ev.eventComments || []), comment] } : ev));
    }, []);

    const pinQuote = useCallback((eventId, commentId) => {
        setEvents(e => e.map(ev => {
            if (ev.id !== eventId) return ev;
            const pinned = ev.pinnedQuotes || [];
            if (pinned.includes(commentId)) return ev;
            return { ...ev, pinnedQuotes: [...pinned, commentId] };
        }));
    }, []);

    // ── Friends ─────────────────────────────────
    const addFriend = useCallback((userId) => {
        setFriends(f => {
            if (f.find(fr => fr.userId === userId)) return f;
            return [...f, { userId, status: 'pending', requestedAt: new Date().toISOString() }];
        });
        addToast('Friend request sent', 'success');
    }, [addToast]);

    const acceptFriend = useCallback((userId) => {
        setFriends(f => f.map(fr => fr.userId === userId ? { ...fr, status: 'accepted', acceptedAt: new Date().toISOString() } : fr));
        addToast('Friend request accepted', 'success');
    }, [addToast]);

    const removeFriend = useCallback((userId) => {
        setFriends(f => f.filter(fr => fr.userId !== userId));
        addToast('Friend removed', '');
    }, [addToast]);

    const isFriend = useCallback((userId) => {
        return friends.some(f => f.userId === userId && f.status === 'accepted');
    }, [friends]);

    const isPendingFriend = useCallback((userId) => {
        return friends.some(f => f.userId === userId && f.status === 'pending');
    }, [friends]);

    // ── Follow Hosts ────────────────────────────
    const isFollowingHost = useCallback((hostId) => {
        return followedHosts.includes(hostId);
    }, [followedHosts]);

    const followHost = useCallback((hostId) => {
        if (!followedHosts.includes(hostId)) {
            setFollowedHosts([...followedHosts, hostId]);
            addToast('Now following host', 'success');
        }
    }, [followedHosts, addToast]);

    const unfollowHost = useCallback((hostId) => {
        setFollowedHosts(followedHosts.filter(id => id !== hostId));
        addToast('Unfollowed host', '');
    }, [followedHosts, addToast]);

    const value = {
        user,
        events,
        toasts,
        login,
        loginSocial,
        logout,
        createEvent,
        updateEvent,
        deleteEvent,
        rsvpEvent,
        claimPotluckItem,
        unclaimPotluckItem,
        addPhoto,
        tagPhoto,
        addComment,
        pinQuote,
        addToast,
        friends,
        addFriend,
        acceptFriend,
        removeFriend,
        isFriend,
        isPendingFriend,
        isFollowingHost,
        followHost,
        unfollowHost,
    };

    return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
    const ctx = useContext(AppCtx);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
USEAPPEOF

echo "✓ Fixed useApp.js written"
echo ""

# Syntax check
echo "Running syntax check..."
if node -c src/hooks/useApp.js 2>/dev/null; then
    echo "✓ Syntax valid"
else
    echo "❌ Syntax error detected!"
    echo "Restoring backup..."
    mv src/hooks/useApp.js.phase1.backup src/hooks/useApp.js
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ PHASE 1 FIX APPLIED"
echo "════════════════════════════════════════════════════════"
echo ""
echo "What changed:"
echo "  1. ✓ Restored 'toasts' variable with eslint-disable"
echo "  2. ✓ Added 'toasts' to exported context value"
echo "  3. ✓ Kept all existing functionality intact"
echo ""
echo "Next steps:"
echo "  1. npm run build"
echo "  2. Test locally with: npm start"
echo "  3. git add src/hooks/useApp.js"
echo "  4. git commit -m 'Phase 1: Restore toasts to fix blank page'"
echo "  5. git push"
echo ""
echo "Backup saved at: src/hooks/useApp.js.phase1.backup"
echo ""
