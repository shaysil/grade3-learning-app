const CACHE_NAME = 'grade3-cache-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/words_he.json'
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)))
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  // try cache-first for same-origin assets and json/audio
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
        if (resp && resp.status === 200) {
          const copy = resp.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy))
        }
        return resp
      }).catch(()=>caches.match('/')))
    )
  }
})
