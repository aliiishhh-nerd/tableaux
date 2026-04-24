import React from 'react';
import * as Sentry from '@sentry/react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('TableFolk ErrorBoundary caught:', error, info);
    Sentry.captureException(error, {
      extra: { componentStack: info?.componentStack },
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#faf8f4', padding: 24,
        fontFamily: 'DM Sans, sans-serif',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍽️</div>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: 32, fontWeight: 600, color: '#1a1425',
            marginBottom: 12, letterSpacing: '-0.5px',
          }}>Something went wrong</h1>
          <p style={{ fontSize: 15, color: '#4a4260', lineHeight: 1.7, marginBottom: 28 }}>
            We hit an unexpected snag. Your data is safe — try refreshing the page.
            If the issue persists, email us at{' '}
            <a href="mailto:hello@tablefolk.club" style={{ color: '#5b4de0' }}>
              hello@tablefolk.club
            </a>
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px', background: '#5b4de0', color: 'white',
              border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Refresh page
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{
              marginTop: 24, textAlign: 'left', fontSize: 11,
              background: '#f0eeff', padding: 16, borderRadius: 8,
              overflow: 'auto', color: '#3c3489', maxHeight: 200,
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
