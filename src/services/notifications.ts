import { useStore } from '@/store/store';
import { uid } from './ids';

const VAPID = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;

export const isBrowser = typeof window !== 'undefined';
export const isIOS = () => isBrowser && /iPad|iPhone|iPod/.test(navigator.userAgent);
export const isStandalone = () =>
  isBrowser && (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);

export const notificationsSupported = () => isBrowser && 'Notification' in window && 'serviceWorker' in navigator;
export const pushSupported = () => notificationsSupported() && 'PushManager' in window && !!VAPID;

/** On iPhone, Web Push only works for home-screen web apps (iOS 16.4+). */
export const needsHomeScreenGuide = () => isIOS() && !isStandalone();

export function permission(): NotificationPermission | 'unsupported' {
  return notificationsSupported() ? Notification.permission : 'unsupported';
}

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/** Must be called from a user gesture (iOS requirement). */
export async function enableNotifications(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported';
  const result = await Notification.requestPermission();
  if (result === 'granted') await subscribePush().catch((e) => console.warn('push subscribe failed', e));
  return result;
}

export async function subscribePush() {
  if (!pushSupported() || Notification.permission !== 'granted') return;
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  sub ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID!) });
  const json = sub.toJSON();
  const st = useStore.getState();
  const existing = Object.values(st.pushSubs).find((p) => p.endpoint === sub!.endpoint);
  if (existing) return;
  st.savePushSub({
    id: uid(), endpoint: sub.endpoint, p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '',
    userAgent: navigator.userAgent, createdAt: new Date().toISOString(),
  });
}

/** True when this browser has a server push subscription (server sends reminders while closed). */
export async function hasPushSubscription(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration();
  return !!(await reg?.pushManager.getSubscription());
}

/** Local notification via the service worker (used while the tab is open but hidden). */
export async function showLocalNotification(title: string, body: string, data: Record<string, string>, actions: { action: string; title: string }[]) {
  if (permission() !== 'granted') return;
  const reg = await navigator.serviceWorker.getRegistration();
  const opts = { body, icon: '/icons/icon-192.png', badge: '/icons/badge-96.png', tag: data.id, data, actions, requireInteraction: true, vibrate: [300, 120, 300] } as NotificationOptions;
  if (reg) await reg.showNotification(title, opts);
  else new Notification(title, opts);
}

export function registerServiceWorker() {
  if (!isBrowser || !('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
  navigator.serviceWorker
    .register('/sw.js')
    .then(() => navigator.serviceWorker.ready)
    .then((reg) => {
      // The SW needs the snooze endpoint for the "Tunda 5 menit" notification action.
      const snoozeUrl = process.env.EXPO_PUBLIC_SNOOZE_URL;
      if (snoozeUrl) reg.active?.postMessage({ type: 'config', snoozeUrl });
      return subscribePush();
    })
    .catch((e) => console.warn('SW registration failed', e));
}

/** Endpoint of this browser's push subscription, if any. */
export async function currentPushEndpoint(): Promise<string | undefined> {
  if (!pushSupported()) return undefined;
  const reg = await navigator.serviceWorker.getRegistration();
  return (await reg?.pushManager.getSubscription())?.endpoint;
}
