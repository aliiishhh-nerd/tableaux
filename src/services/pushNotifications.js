// src/services/pushNotifications.js
// TableFolk Push Notification Service
//
// SETUP REQUIRED:
// 1. Generate VAPID keys: npx web-push generate-vapid-keys
// 2. Set REACT_APP_VAPID_PUBLIC_KEY in your .env file
// 3. Add the private key to your backend / Netlify environment variables

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

// Convert VAPID key from base64 to Uint8Array (required by browser API)
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Check if push notifications are supported and permission is granted
export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getPermissionStatus() {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

// Request permission and subscribe to push notifications
export async function subscribeToPush() {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported on this device.');
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('[TableFolk Push] REACT_APP_VAPID_PUBLIC_KEY not set. Push notifications disabled.');
    throw new Error('Push notifications are not configured yet.');
  }

  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Notification permission denied.');
  }

  // Get the active service worker registration
  const registration = await navigator.serviceWorker.ready;

  // Check for existing subscription
  let subscription = await registration.pushManager.getSubscription();

  // Create new subscription if none exists
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  }

  console.log('[TableFolk Push] Subscribed:', subscription);

  // TODO: Send subscription to your backend to store it
  // await saveSubscriptionToBackend(subscription);

  return subscription;
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush() {
  if (!isPushSupported()) return false;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    const result = await subscription.unsubscribe();
    console.log('[TableFolk Push] Unsubscribed:', result);

    // TODO: Remove subscription from your backend
    // await removeSubscriptionFromBackend(subscription);

    return result;
  }

  return false;
}

// Get current subscription (null if not subscribed)
export async function getPushSubscription() {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

// ─── Notification Types for TableFolk ──────────────────────────────────────────
// These map to the push payload format your backend should send

export const NOTIFICATION_TYPES = {
  INVITE_RECEIVED: 'invite_received',     // Someone invited you to an event
  INVITE_ACCEPTED: 'invite_accepted',     // Your invite was accepted
  INVITE_DECLINED: 'invite_declined',     // Your invite was declined
  EVENT_REMINDER: 'event_reminder',       // Event is tomorrow / tonight
  NEW_GUEST: 'new_guest',                 // New guest requested to join
  POTLUCK_UPDATED: 'potluck_updated',     // Someone added a dish
  EVENT_UPDATED: 'event_updated',         // Host changed event details
  EVENT_CANCELLED: 'event_cancelled',     // Host cancelled the event
};

// Example payload shape your backend should send:
// {
//   title: "New Invitation",
//   body: "Marcus T. invited you to Midsummer Feast",
//   icon: "/icons/icon-192x192.png",
//   image: "https://...",              // optional event image
//   url: "/?page=invites",             // where to navigate on click
//   type: "invite_received",
//   requireInteraction: false,
//   actions: [
//     { action: "accept", title: "Accept" },
//     { action: "decline", title: "Decline" }
//   ]
// }
