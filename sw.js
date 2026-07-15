const CACHE_NAME = 'magic-ball-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './game.html',
    './favicon.ico',
    './manifest.json'
];

// Установка: кэшируем основные файлы
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Активация: очищаем старые кэши, если имя изменилось
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Перехват запросов: сначала кэш, потом сеть (для офлайн-работы)
self.addEventListener('fetch', (event) => {
    // Не перехватываем запросы к Википедии, они всегда должны идти в сеть
    if (event.request.url.includes('wikipedia.org')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Если есть в кэше - отдаем, иначе делаем запрос в сеть
            return response || fetch(event.request);
        }).catch(() => {
            // Если сеть недоступна и нет в кэше, отдаем заглушку (опционально)
            return new Response('Офлайн-режим активен. Проверьте подключение.');
        })
    );
});