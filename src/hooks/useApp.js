import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'tableaux_app_state';

// ── Local Storage Helpers ────────────────────────────────────
const loadFromStorage = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const saveToStorage = (data) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
};

// ── Hook ─────────────────────────────────────────────────────
export function useApp() {
    const navigate = useNavigate();
    
    // ── State ────────────────────────────────────────────────
    const [user, setUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Auth ─────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session?.user && mounted) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile && mounted) {
                        setUser({
                            id: session.user.id,
                            email: session.user.email,
                            ...profile
                        });
                    }
                }
            } catch (err) {
                console.error('Auth init error:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user && mounted) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile && mounted) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        ...profile
                    });
                }
            } else if (event === 'SIGNED_OUT' && mounted) {
                setUser(null);
            }
        });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, []);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setUser(null);
        try {
            const stored = loadFromStorage();
            if (stored) saveToStorage({ ...stored, user: null });
        } catch {}
        navigate('/auth');
    }, [navigate]);

    // ── Events ───────────────────────────────────
    useEffect(() => {
        const stored = loadFromStorage();
        if (stored?.events) {
            setEvents(stored.events);
        }
    }, []);

    const addEvent = useCallback((eventData) => {
        const newEvent = {
            id: `evt_${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...eventData
        };
        setEvents(prev => {
            const updated = [newEvent, ...prev];
            try {
                const stored = loadFromStorage() || {};
                saveToStorage({ ...stored, events: updated });
            } catch {}
            return updated;
        });
        return newEvent;
    }, []);

    // ── Profile ──────────────────────────────────
    const updateProfile = useCallback((updates) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            try {
                const stored = loadFromStorage() || {};
                saveToStorage({ ...stored, user: updated });
            } catch {}
            return updated;
        });
    }, []);

    // ── Toasts ───────────────────────────────────
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, msg: message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    // ── Friends ──────────────────────────────────
    useEffect(() => {
        const stored = loadFromStorage();
        if (stored?.friends) {
            setFriends(stored.friends);
        }
    }, []);

    const addFriend = useCallback((friend) => {
        setFriends(prev => {
            const updated = [...prev, friend];
            try {
                const stored = loadFromStorage() || {};
                saveToStorage({ ...stored, friends: updated });
            } catch {}
            return updated;
        });
    }, []);

    return {
        user,
        events,
        toasts,
        friends,
        loading,
        addEvent,
        updateProfile,
        addToast,
        logout,
        addFriend
    };
}
