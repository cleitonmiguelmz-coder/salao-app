// Service worker do SALAO: a app abre mesmo sem rede e as fotos actualizam-se sozinhas.
const CACHE = 'salao-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)))
  self.skipWaiting()
})
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()))
})
self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return
  if (r.mode === 'navigate') {
    e.respondWith(
      fetch(r).then((res) => { const cp = res.clone(); caches.open(CACHE).then((c) => c.put('/index.html', cp)); return res })
        .catch(() => caches.match('/index.html'))
    )
    return
  }
  e.respondWith(
    caches.match(r).then((hit) => {
      const net = fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(r, cp)) } return res }).catch(() => hit)
      return hit || net
    })
  )
})
