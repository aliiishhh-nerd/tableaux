import React, { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './hooks/useApp';
import AppShell from './components/AppShell';
import { supabase } from './lib/supabase';

function AuthListener() {
  const { login } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        try {
          await login(session.user.email, null, session);
        } catch (e) {
          // session-based login failed silently
        }
        navigate('/feed');
      }
    });
    return () => subscription.unsubscribe();
  }, [login, navigate]);

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
