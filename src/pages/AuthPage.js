import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const { login, loginSocial } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/feed');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleSocial = (provider) => {
    loginSocial(provider);
    navigate('/feed');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas)', padding: 20 }}>
      <div style={{ maxWidth: 400, width: '100%', background: 'var(--panel)', padding: 40, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
            {mode === 'login' ? 'Welcome back' : 'Join Tableaux'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--ink2)' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account to get started'}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--stroke)', marginBottom: 12, fontSize: 14, fontFamily: 'inherit' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--stroke)', marginBottom: 16, fontSize: 14, fontFamily: 'inherit' }}
          />
          
          {error && (
            <div style={{ padding: '8px 12px', background: 'rgba(220,38,38,0.1)', color: '#dc2626', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{ width: '100%', padding: '12px 16px', background: 'var(--indigo)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink2)', marginBottom: 16 }}>
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                style={{ color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('login'); setError(''); }}
                style={{ color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' }}
              >
                Log in
              </button>
            </>
          )}
        </div>

        {/* Footer Links */}
        <div style={{ marginTop: 24, display: 'flex', gap: 20, justifyContent: 'center', fontSize: 13 }}>
          <a href="/blog" style={{ color: 'var(--ink2)', textDecoration: 'none' }}>Blog</a>
          <a href="/faq" style={{ color: 'var(--ink2)', textDecoration: 'none' }}>Help & FAQ</a>
          <a href="/about" style={{ color: 'var(--ink2)', textDecoration: 'none' }}>About</a>
        </div>

      </div>
    </div>
  );
}
