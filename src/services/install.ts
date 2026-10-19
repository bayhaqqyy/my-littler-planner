/**
 * "Install app" helpers. Android/desktop Chrome fire `beforeinstallprompt`, which we keep
 * so a button can open the native install dialog. iOS has no such API: the only way is
 * Safari's Share → Add to Home Screen, so we show instructions instead.
 */
type PromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

let deferred: PromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as PromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => { deferred = null; notify(); });
}

export const canPromptInstall = () => !!deferred;
export const onInstallChange = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const { outcome } = await deferred.userChoice;
  deferred = null;
  notify();
  return outcome === 'accepted';
}

const ua = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent);
export const isIOSDevice = () => /iPad|iPhone|iPod/.test(ua()) || (/Macintosh/.test(ua()) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1);
export const isIOSSafari = () => isIOSDevice() && /Safari/.test(ua()) && !/CriOS|FxiOS|EdgiOS|OPiOS|GSA|Instagram|FBAN|FBAV|Line\//.test(ua());
export const isAndroid = () => /Android/i.test(ua());
export const isInAppBrowser = () => /Instagram|FBAN|FBAV|Line\/|TikTok|GSA/.test(ua());
export const isInstalled = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true);
