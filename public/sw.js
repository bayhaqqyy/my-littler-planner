/* My Little Planner service worker: offline app shell + Web Push reminders. */
const CACHE_VERSION = 'v5';
const SHELL_CACHE = `mlp-shell-${CACHE_VERSION}`;
const ASSET_CACHE = `mlp-assets-${CACHE_VERSION}`;
const CONFIG_CACHE = 'mlp-config';
const SOUNDS = ['remind-before', 'start-study', 'break', 'back-to-study', 'done'].map((n) => `/sounds/${n}.mp3`);
const SHELL = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/icon.svg', '/icons/badge-96.png', ...SOUNDS];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((c) => c.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, ASSET_CACHE, CONFIG_CACHE]);
    for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key);
    await self.clients.claim();
  })());
});

const isStaticAsset = (url) =>
  url.pathname.startsWith('/_expo/') ||
  url.pathname.startsWith('/assets/') ||
  url.pathname.startsWith('/icons/') ||
  /\.(?:js|css|ttf|otf|woff2?|png|jpg|jpeg|svg|ico|webp|json|mp3)$/.test(url.pathname);

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only same-origin requests are cached (Supabase and other APIs go straight to the network).
  if (url.origin !== self.location.origin) return;
  if (url.pathname === '/sw.js') return;

  if (req.mode === 'navigate') {
    // Network first, fall back to the cached shell when offline.
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(SHELL_CACHE)).put('/', res.clone());
        return res;
      } catch {
        return (await caches.match('/')) ?? Response.error();
      }
    })());
    return;
  }

  if (isStaticAsset(url)) {
    // Stale-while-revalidate.
    event.respondWith((async () => {
      const cache = await caches.open(ASSET_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
        .catch(() => undefined);
      if (cached) { event.waitUntil(network); return cached; }
      return (await network) ?? (await caches.match(req)) ?? Response.error();
    })());
  }
});

/* ---------- config from the page (snooze function URL) ---------- */

async function setConfig(cfg) {
  const cache = await caches.open(CONFIG_CACHE);
  await cache.put('/__mlp_config', new Response(JSON.stringify(cfg), { headers: { 'Content-Type': 'application/json' } }));
}

async function getConfig() {
  const res = await (await caches.open(CONFIG_CACHE)).match('/__mlp_config');
  return res ? res.json() : {};
}

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'config') event.waitUntil(getConfig().then((c) => setConfig({ ...c, snoozeUrl: msg.snoozeUrl })));
  if (msg.type === 'skip-waiting') self.skipWaiting();
});

/* ---------- push ---------- */

function actionsFor(kind) {
  if (kind && kind.startsWith('timer')) return [{ action: 'open', title: 'Buka timer' }];
  if (kind === 'deadline-before') return [{ action: 'start', title: 'Kerjakan sekarang' }, { action: 'done', title: 'Tandai selesai' }];
  if (kind === 'deadline-due') return [{ action: 'done', title: 'Tandai selesai' }, { action: 'reschedule', title: 'Jadwalkan ulang' }];
  if (kind === 'end') return [{ action: 'done', title: 'Tandai selesai' }, { action: 'snooze', title: 'Tunda 5 menit' }];
  return [{ action: 'start', title: 'Mulai sekarang' }, { action: 'snooze', title: 'Tunda 5 menit' }];
}

/* Each kind feels different on the phone: vibration pattern (Android) and whether it stays on screen. */
const STYLE = {
  before: { vibrate: [120, 80, 120], sticky: false },
  start: { vibrate: [300, 120, 300, 120, 300], sticky: true },
  snooze: { vibrate: [300, 120, 300, 120, 300], sticky: true },
  end: { vibrate: [500, 200, 500], sticky: true },
  'deadline-before': { vibrate: [200, 100, 200, 100, 200, 100, 200], sticky: true },
  'deadline-due': { vibrate: [600, 200, 600, 200, 600], sticky: true },
  'timer-break': { vibrate: [150, 100, 150, 100, 400], sticky: true },
  'timer-back': { vibrate: [200, 100, 200, 100, 200], sticky: true },
  'timer-end': { vibrate: [500, 200, 500], sticky: true },
};

self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { title: event.data && event.data.text() }; }
  const title = payload.title || 'My Little Planner';
  const data = payload.data || {};

  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const focused = wins.find((w) => w.focused && w.visibilityState === 'visible');
    // Safari (every iPhone browser, and Safari on Mac) revokes the push subscription after a few
    // pushes that don't show a notification, so there a notification is always shown.
    const ua = self.navigator.userAgent;
    const safari = /AppleWebKit/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua);
    if (focused && !safari && data.kind !== 'test') {
      // The open app shows its own cute banner + alarm sound.
      focused.postMessage({ type: 'reminder', title, body: payload.body, data });
      return;
    }
    const style = STYLE[data.kind] || STYLE.start;
    await self.registration.showNotification(title, {
      body: payload.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-96.png',
      tag: data.id || undefined,
      renotify: true,
      requireInteraction: style.sticky,
      vibrate: style.vibrate,
      timestamp: Date.now(),
      data,
      actions: actionsFor(data.kind),
    });
  })());
});

async function openOrFocus(path) {
  const target = new URL(path, self.location.origin).href;
  const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const w of wins) {
    if (new URL(w.url).origin === self.location.origin) {
      await w.focus();
      if ('navigate' in w) return w.navigate(target);
      w.postMessage({ type: 'navigate', url: path });
      return;
    }
  }
  return self.clients.openWindow(target);
}

self.addEventListener('notificationclick', (event) => {
  const n = event.notification;
  const data = n.data || {};
  const key = data.occurrenceKey || '';
  n.close();

  event.waitUntil((async () => {
    if (event.action === 'snooze') {
      const { snoozeUrl } = await getConfig();
      const sub = await self.registration.pushManager.getSubscription();
      if (snoozeUrl && sub) {
        try {
          await fetch(snoozeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'snooze', endpoint: sub.endpoint, occurrenceKey: key, title: n.title }),
          });
          return;
        } catch { /* offline: fall through and open the app */ }
      }
      return openOrFocus(`/timer?occ=${encodeURIComponent(key)}`);
    }
    if (event.action === 'done') return openOrFocus(`/?complete=${encodeURIComponent(key)}`);
    if (!event.action && (data.kind === 'deadline-before' || data.kind === 'deadline-due') && key) {
      // A plain tap on a deadline notification opens the task (never completes it by accident).
      const i = key.lastIndexOf('@');
      return openOrFocus(`/task/${encodeURIComponent(key.slice(0, i))}?date=${key.slice(i + 1)}`);
    }
    if (event.action === 'open') return openOrFocus('/timer');
    if (event.action === 'reschedule') {
      // key = `${taskId}@${date}` — task ids never contain '@', so split at the last one.
      const i = key.lastIndexOf('@');
      return openOrFocus(`/task/${encodeURIComponent(key.slice(0, i))}?date=${key.slice(i + 1)}&reschedule=1`);
    }
    if (event.action === 'start' || !data.url) return openOrFocus(`/timer?occ=${encodeURIComponent(key)}`);
    return openOrFocus(data.url);
  })());
});
