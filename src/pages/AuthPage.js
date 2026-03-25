import React, { useState } from 'react';
import { useApp } from '../hooks/useApp';

export default function AuthPage() {
  const { signIn, signUp } = useApp();
  const [tab, setTab] = useState('in');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [role, setRole] = useState('Host events');

  function handleSignIn(e) {
    e.preventDefault();
    signIn(email || 'ada@tableaux.com');
  }
  function handleSignUp(e) {
    e.preventDefault();
    signUp(first || 'Ada', last || 'Lovelace', email || 'ada@example.com');
  }

  return (
    <div className="auth-shell">
      <div className="auth-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 17, color: 'white' }}>T</div>
          <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Tableaux</span>
        </div>
        <h1>Dining, made social.</h1>
        <p>Host beautiful dinner parties, potlucks, and restaurant evenings — and discover the ones worth attending.</p>
        {[
          ['◈', 'Trusted social dining profiles'],
          ['✦', 'Beautiful customizable invitations'],
          ['⊞', 'Potluck coordination built in'],
          ['◎', 'Maps integration for restaurants'],
        ].map(([icon, text]) => (
          <div key={text} className="auth-feat">
            <div className="auth-feat-icon">{icon}</div>
            {text}
          </div>
        ))}
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>{tab === 'in' ? 'Welcome back' : 'Create your account'}</h2>
          <div className="auth-sub">{tab === 'in' ? 'Sign in to your Tableaux account' : 'Join the dining community'}</div>

          <div className="auth-tabs">
            <div className={`auth-tab ${tab === 'in' ? 'on' : ''}`} onClick={() => setTab('in')}>Sign In</div>
            <div className={`auth-tab ${tab === 'up' ? 'on' : ''}`} onClick={() => setTab('up')}>Register</div>
          </div>

          {tab === 'in' ? (
            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-full">Sign In</button>
              <div className="auth-note">Demo: any email + password works</div>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" placeholder="Ada" value={first} onChange={e => setFirst(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" placeholder="Lovelace" value={last} onChange={e => setLast(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">I want to</label>
                <div className="pill-row">
                  {['Host events', 'Attend events', 'Both'].map(r => (
                    <div key={r} className={`pill ${role === r ? 'on' : ''}`} onClick={() => setRole(r)}>{r}</div>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">Create Account</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
