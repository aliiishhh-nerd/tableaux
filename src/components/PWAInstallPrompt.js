// src/components/PWAInstallPrompt.js
// Handles install prompts for Android (native) and iOS (manual instructions)

import React, { useState, useEffect } from 'react';
import {
  isPushSupported,
  getPermissionStatus,
  subscribeToPush,
} from '../services/pushNotifications';

// Detect iOS (no native install prompt support)
function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !window.MSStream
  );
}

// Detect if already installed as PWA (running in standalone mode)
function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null);   // Android deferred prompt
  const [showIOSHint, setShowIOSHint]     = useState(false);
  const [showAndroid, setShowAndroid]     = useState(false);
  const [pushStatus, setPushStatus]       = useState('default'); // default|granted|denied|unsupported
  const [dismissed, setDismissed]         = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isInStandaloneMode()) return;

    // Check if user already dismissed this session
    const wasDismissed = sessionStorage.getItem('tablefolk-pwa-dismissed');
    if (wasDismissed) return;

    // iOS — show manual instructions after a short delay
    if (isIOS()) {
      const timer = setTimeout(() => setShowIOSHint(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome — capture the native install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowAndroid(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    setPushStatus(getPermissionStatus());
  }, []);

  const handleAndroidInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log('[TableFolk PWA] Install outcome:', outcome);
    setInstallPrompt(null);
    setShowAndroid(false);
  };

  const handleDismiss = () => {
    setShowIOSHint(false);
    setShowAndroid(false);
    setDismissed(true);
    sessionStorage.setItem('tablefolk-pwa-dismissed', 'true');
  };

  const handleEnablePush = async () => {
    try {
      await subscribeToPush();
      setPushStatus('granted');
    } catch (err) {
      console.warn('[TableFolk Push]', err.message);
      setPushStatus(Notification.permission);
    }
  };

  if (dismissed) return null;

  return (
    <>
      {/* ── Android Install Banner ─────────────────────────────────── */}
      {showAndroid && (
        <div style={styles.banner}>
          <div style={styles.bannerContent}>
            <span style={styles.bannerIcon}>🍽️</span>
            <div style={styles.bannerText}>
              <strong style={styles.bannerTitle}>Add TableFolk to Home Screen</strong>
              <span style={styles.bannerSub}>Get the full app experience</span>
            </div>
          </div>
          <div style={styles.bannerActions}>
            <button style={styles.btnInstall} onClick={handleAndroidInstall}>
              Install
            </button>
            <button style={styles.btnDismiss} onClick={handleDismiss}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── iOS Install Instructions ───────────────────────────────── */}
      {showIOSHint && (
        <div style={styles.iosOverlay}>
          <div style={styles.iosCard}>
            <button style={styles.iosClose} onClick={handleDismiss}>✕</button>
            <div style={styles.iosIcon}>🍽️</div>
            <h3 style={styles.iosTitle}>Add TableFolk to Your Home Screen</h3>
            <p style={styles.iosSub}>Get the full app experience — no App Store needed.</p>
            <ol style={styles.iosList}>
              <li style={styles.iosStep}>
                Tap the <strong>Share</strong> button{' '}
                <span style={styles.iosEmoji}>⬆️</span> at the bottom of Safari
              </li>
              <li style={styles.iosStep}>
                Scroll down and tap{' '}
                <strong>"Add to Home Screen"</strong>{' '}
                <span style={styles.iosEmoji}>➕</span>
              </li>
              <li style={styles.iosStep}>
                Tap <strong>"Add"</strong> in the top right
              </li>
            </ol>
            <button style={styles.iosDone} onClick={handleDismiss}>
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Push Notification Prompt (shown after install or standalone) ── */}
      {isInStandaloneMode() &&
        isPushSupported() &&
        pushStatus === 'default' && (
          <div style={styles.pushBanner}>
            <div style={styles.bannerContent}>
              <span style={styles.bannerIcon}>🔔</span>
              <div style={styles.bannerText}>
                <strong style={styles.bannerTitle}>Enable Notifications</strong>
                <span style={styles.bannerSub}>Get alerts for invites & event updates</span>
              </div>
            </div>
            <div style={styles.bannerActions}>
              <button style={styles.btnInstall} onClick={handleEnablePush}>
                Enable
              </button>
              <button style={styles.btnDismiss} onClick={handleDismiss}>
                ✕
              </button>
            </div>
          </div>
        )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  banner: {
    position: 'fixed', bottom: 16, left: 16, right: 16,
    background: '#1E1C1A', border: '1px solid rgba(201,169,110,0.3)',
    borderRadius: 12, padding: '12px 16px', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
  },
  pushBanner: {
    position: 'fixed', bottom: 16, left: 16, right: 16,
    background: '#1E1C1A', border: '1px solid rgba(108,93,211,0.4)',
    borderRadius: 12, padding: '12px 16px', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
  },
  bannerContent: { display: 'flex', alignItems: 'center', gap: 12 },
  bannerIcon:    { fontSize: 28 },
  bannerText:    { display: 'flex', flexDirection: 'column' },
  bannerTitle:   { color: '#F0EBE3', fontSize: 14, fontWeight: 600 },
  bannerSub:     { color: '#A89880', fontSize: 12, marginTop: 2 },
  bannerActions: { display: 'flex', alignItems: 'center', gap: 8 },
  btnInstall: {
    background: '#6C5DD3', color: '#fff', border: 'none',
    borderRadius: 8, padding: '8px 16px', fontSize: 13,
    fontWeight: 600, cursor: 'pointer',
  },
  btnDismiss: {
    background: 'transparent', color: '#A89880', border: 'none',
    fontSize: 16, cursor: 'pointer', padding: '4px 8px',
  },
  // iOS overlay
  iosOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    zIndex: 9999, display: 'flex', alignItems: 'flex-end',
    justifyContent: 'center', padding: 16,
  },
  iosCard: {
    background: '#1E1C1A', borderRadius: 20, padding: 28,
    width: '100%', maxWidth: 400, position: 'relative',
    border: '1px solid rgba(201,169,110,0.2)',
    boxShadow: '0 -4px 40px rgba(0,0,0,0.6)',
  },
  iosClose: {
    position: 'absolute', top: 16, right: 16,
    background: 'rgba(255,255,255,0.1)', border: 'none',
    color: '#A89880', fontSize: 14, borderRadius: '50%',
    width: 28, height: 28, cursor: 'pointer',
  },
  iosIcon:  { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  iosTitle: {
    color: '#F0EBE3', fontSize: 18, fontWeight: 700,
    textAlign: 'center', marginBottom: 8,
  },
  iosSub: {
    color: '#A89880', fontSize: 14, textAlign: 'center',
    marginBottom: 20, lineHeight: 1.5,
  },
  iosList:  { paddingLeft: 20, margin: '0 0 24px' },
  iosStep:  { color: '#F0EBE3', fontSize: 14, marginBottom: 12, lineHeight: 1.5 },
  iosEmoji: { fontSize: 16 },
  iosDone: {
    width: '100%', background: '#6C5DD3', color: '#fff',
    border: 'none', borderRadius: 12, padding: '14px 0',
    fontSize: 16, fontWeight: 600, cursor: 'pointer',
  },
};
