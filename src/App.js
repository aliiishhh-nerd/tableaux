import React, { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import AppShell from './components/AppShell';
import { supabase } from './lib/supabase';

function AuthListener() {
  const { login, logout } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // On mount: check for an existing session without going through onAuthStateChange
    // This avoids the Supabase lock deadlock caused by calling getProfile() inside the listener
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        try {
          await login(session.user.email, null, session);
        } catch (e) {
          // Session restore failed — user stays logged out
        }
      }
    });

    // Listen only for NEW sign-in events (not INITIAL_SESSION which causes the lock)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await login(session.user.email, null, session);
        } catch (e) {
          // silent
        }
        navigate('/feed');
      }
      if (event === 'SIGNED_OUT') {
        logout();
        navigate('/');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [login, logout, navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AuthListener />
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
