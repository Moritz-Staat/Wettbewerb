import { getVapidKey, subscribePush } from '../api.js';
import { toast } from './toast.js';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function initPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('SW registered');

    // Check if already subscribed
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      console.log('Already subscribed to push');
      return;
    }

    // Get VAPID key
    const { publicKey } = await getVapidKey();
    if (!publicKey) {
      console.log('No VAPID key configured, push disabled');
      return;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return;
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    // Send subscription to backend
    await subscribePush(subscription.toJSON());
    toast('Benachrichtigungen aktiviert!');
  } catch (err) {
    console.error('Push init error:', err);
  }
}
