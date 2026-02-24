/* sw.js */
const CACHE_NAME = 'sac-app-v1';

// 앱 설치 시 기본 파일 캐싱 (저장)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './',
                './index.html',
                './auth.js',
                './manifest.json'
            ]);
        })
    );
});

// 오프라인 상태이거나 네트워크가 느릴 때 캐시된 화면 보여주기
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});