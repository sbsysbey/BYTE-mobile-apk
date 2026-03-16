// ══════════════════════════════════════════════════════
// BYTE ACADEMY — SERVICE WORKER  (PWA Offline Desteği)
// ══════════════════════════════════════════════════════
const CACHE = 'byte-v3';

const ASSETS = [
  '/',
  '/index.html',
  '/modul1.html',
  '/modul2.html',
  '/modul3.html',
  '/modul4.html',
  '/modul5.html',
  '/modul6.html',
  '/modul7.html',
  '/modul8.html',
  '/modul9.html',
  '/modul10.html',
  '/modul11.html',
  '/modul12.html',
  '/modul13.html',
  '/certificate.html',
  '/rehber.html',
  '/css/style.css',
  '/css/modules.css',
  '/css/smodules.css',
  '/js/app.js',
  '/js/index1.js',
  '/manifest.json',
  '/videos/byte1.png',
  '/videos/byte1.ico',
  '/videos/byte.gif'
];

// ── INSTALL: Tüm statik dosyaları önbelleğe al ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: Eski önbellekleri temizle ──────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: Önce önbellek, yoksa ağ ──────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Chrome extension isteklerini atla
  if (!e.request.url.startsWith('http')) return;

  const accept = e.request.headers.get('accept') || '';
  const url = new URL(e.request.url);
  const isDocument = e.request.mode === 'navigate' || accept.includes('text/html');
  const isStaticCode = /\.(js|css)$/i.test(url.pathname);

  if (isDocument || isStaticCode) {
    // Online iken en guncel kodu al, offline iken cache'e dus.
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200 && res.type !== 'opaque') {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(cached => {
            if (cached) return cached;
            if (isDocument) return caches.match('/index.html');
            return undefined;
          })
        )
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request)
        .then(res => {
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => {
          if (isDocument) {
            return caches.match('/index.html');
          }
        });
    })
  );
});
