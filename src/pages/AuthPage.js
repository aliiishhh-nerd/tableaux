import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { useNavigate } from 'react-router-dom';
import { signUp as supabaseSignUp } from '../lib/supabase';

export default function AuthPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [handle, setHandle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const signUpData = await supabaseSignUp(email, password, name || email.split('@')[0], handle.trim() || undefined);
        // Supabase v2 enumeration protection: a duplicate email returns a
        // success-shaped response with user.identities = []. Detect and
        // surface the real error so the user isn't told to check an inbox
        // for an email that won't arrive.
        if (signUpData.user && (!signUpData.user.identities || signUpData.user.identities.length === 0)) {
          setError('An account with this email already exists. Try signing in instead.');
          setLoading(false);
          return;
        }
        if (signUpData.user && !signUpData.session) {
          setSuccess('Account created! Check your email to confirm, then sign in.');
          setMode('login');
          setLoading(false);
          return;
        }
        // Auto-confirmed — fall through to login
      }
      if (mode === '_unused') {
        await login(email, password);
        navigate('/feed');
      } else {
        const ok = await login(email, password);
        if (ok) {
          navigate('/feed');
        } else {
          setError('Login failed. Please check your email and password.');
        }
      }
    } catch (err) {
      // Handle specific error messages
      if (err.message?.includes('Email not confirmed')) {
        setError('Welcome to TableFolk! We sent a confirmation link to ' + email + '. Please check your inbox and click the link to activate your account.');
      } else if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message?.includes('User already registered')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas)', padding: 20 }}>
      <div style={{ maxWidth: 400, width: '100%', background: 'var(--panel)', padding: 40, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className={mode === 'signup' ? 'logo-text' : undefined} style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
            {mode === 'login' ? 'Welcome back' : <>Join Table<span>Folk</span></>}
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink2)' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--stroke)', marginBottom: 12, fontSize: 14, fontFamily: 'inherit' }}
            />
          )}
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="@handle (optional)"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              pattern="^[a-zA-Z0-9_-]{3,30}$"
              title="3–30 characters: letters, numbers, hyphens, underscores"
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
              style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--stroke)', marginBottom: 12, fontSize: 14, fontFamily: 'inherit' }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--stroke)', marginBottom: 12, fontSize: 14, fontFamily: 'inherit' }}
          />
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
              style={{ width: '100%', padding: '12px 44px 12px 16px', borderRadius: 8, border: '1px solid var(--stroke)', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--ink3)', display: 'flex', alignItems: 'center' }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>
          
          {success && <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 10, textAlign: "center", padding: "10px 14px", background: "var(--teal-light,#e6faf8)", borderRadius: 8 }}>{success}</div>}
          {error && (
            <div style={{ padding: '8px 12px', background: 'rgba(220,38,38,0.1)', color: '#dc2626', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              background: loading ? 'var(--ink3)' : 'var(--indigo)', 
              color: 'white', 
              border: 'none', 
              borderRadius: 8, 
              fontSize: 14, 
              fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer', 
              fontFamily: 'inherit',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : (mode === 'login' ? 'Sign in' : 'Sign up')}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink2)', marginBottom: 16 }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setName(''); setHandle(''); }}
                style={{ color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setName(''); setHandle(''); }}
                style={{ color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}
              >
                Sign in
              </button>
            </>
          )}
        </div>


      </div>
    </div>
  );
}
