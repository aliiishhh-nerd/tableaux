import React, { useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import AppShell from './components/AppShell';
import { supabase } from './lib/supabase';

function AuthListener() {
  const { login, logout } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    // Guard against concurrent login() calls — the form and the listener can both fire
    let loggingIn = false;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted || loggingIn) return;
      if (session?.user) {
        // Only auto-restore if NOT on the auth page — if user is on /auth they want to sign in fresh
        if (window.location.pathname === '/auth') {
          // Clear stale session so the form login works cleanly
          await supabase.auth.signOut();
          return;
        }
        loggingIn = true;
        try {
          await login(session.user.email, null, session);
        } catch (e) {
          // Session restore failed — user stays logged out
        } finally {
          loggingIn = false;
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        // Skip if already handling a login to prevent double-call deadlock
        if (loggingIn) return;
        loggingIn = true;
        try {
          await login(session.user.email, null, session);
        } catch (e) {
          // silent
        } finally {
          loggingIn = false;
        }
        navigate('/feed');
      }
      if (event === 'SIGNED_OUT') {
        logout();
        navigate('/auth');
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
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AuthListener />
          <AppShell />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
