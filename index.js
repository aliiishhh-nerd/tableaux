import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);

// Register the service worker for PWA support.
// Change to serviceWorkerRegistration.unregister() to opt out.
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('[Tableaux PWA] App is ready for offline use.');
  },
  onUpdate: (registration) => {
    // Optional: show a "New version available — refresh" toast here
    console.log('[Tableaux PWA] New version available. Refresh to update.');

    // Auto-activate the new service worker
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});
