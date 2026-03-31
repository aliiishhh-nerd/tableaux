import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

export default function AuthPage() {
  const { login } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(email, password);
      if (ok) {
        navigate('/feed');
      } else {
        setError(
          mode === 'login'
            ? 'Invalid email or password. Try ada@tableaux.com / password'
            : 'Could not create account. Try logging in instead.'
        );
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="auth-screen" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--indigo-light, #F4F3FF)',
      padding: '24px 16px',
    }}>
      <div className="auth-card" style={{
        background: 'white',
        borderRadius: 20,
        padding: '36px 32px',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 4px 40px rgba(108,93,211,0.10)',
      }}>

        {/* Logo */}
        <div className="auth-logo">
          <div className="logo-icon">🍽️</div>
          <div className="logo-text" style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px' }}>
            Table<span style={{ color: 'var(--indigo)' }}>aux</span>
          </div>
        </div>

        {/* Title */}
        <div className="auth-title">
          {mode === 'login' ? 'Welcome back' : 'Join Tableaux'}
        </div>
        <div className="auth-sub">
          {mode === 'login'
            ? 'Sign in to discover and host intimate dining experiences.'
            : 'Create your account to start hosting and discovering dinners.'}
        </div>

        {/* Social login */}
        <button className="social-login-btn social-login-google">
          <span className="social-login-icon">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </span>
          Continue with Google
        </button>

        <button className="social-login-btn social-login-apple">
          <span className="social-login-icon" style={{ fontSize: 17 }}>🍎</span>
          Continue with Apple
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <div className="auth-divider-line" />
          <div className="auth-divider-text">or</div>
          <div className="auth-divider-line" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>

          {mode === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ fontSize: 16 }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ fontSize: 16 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ fontSize: 16, paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--ink3)', fontSize: 16, padding: 4,
                  display: 'flex', alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" style={{
              fontSize: 13, color: 'var(--coral, #e05c5c)',
              background: 'rgba(224,92,92,0.08)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 12,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', fontSize: 16, padding: '13px', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle mode */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--ink2)' }}>
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

        {/* Demo hint */}
        <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--ink3)' }}>
          Demo: ada@tableaux.com / password
        </div>

      </div>
    </div>
  );
}
