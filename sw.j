const CACHE_NAME = 'app-static-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // 对 API 请求不拦截（由 app.js 处理）
  if (event.request.url.includes('fakestoreapi.com')) {
    return;
  }

  // 静态资源走缓存优先
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
