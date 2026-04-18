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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        await supabaseSignUp(email, password, name);
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
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
            {mode === 'login' ? 'Welcome back' : 'Join TableFolk'}
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
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
            required
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--stroke)', marginBottom: 12, fontSize: 14, fontFamily: 'inherit' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={6}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--stroke)', marginBottom: 16, fontSize: 14, fontFamily: 'inherit' }}
          />
          
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
                onClick={() => { setMode('signup'); setError(''); setName(''); }}
                style={{ color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setName(''); }}
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
