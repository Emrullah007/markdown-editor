/**
 * Service Worker for Markdown Editor PWA
 * Provides offline caching and background sync capabilities
 * @version 1.0.0
 */

const CACHE_NAME = 'markdown-editor-v1.2.1';
const STATIC_CACHE = 'markdown-editor-static-v1.2.1';
const DYNAMIC_CACHE = 'markdown-editor-dynamic-v1.2.1';

// Files to cache for offline use
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/markdown-parser.js',
    '/rich-text-editor.js',
    '/image-storage.js',
    '/history-manager.js',
    '/find-replace.js',
    '/pdf-export.js',
    '/syntax-highlighter.js',
    '/auto-pair.js',
    '/statistics-panel.js',
    '/templates.js',
    '/manifest.json'
];

// CDN resources to cache
const CDN_ASSETS = [
    'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
    'https://cdn.jsdelivr.net/npm/turndown@7.1.2/dist/turndown.js',
    'https://cdn.jsdelivr.net/npm/turndown-plugin-gfm@1.0.2/dist/turndown-plugin-gfm.js',
    'https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('[SW] Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            // Cache CDN assets
            caches.open(DYNAMIC_CACHE).then((cache) => {
                console.log('[SW] Caching CDN assets...');
                return Promise.all(
                    CDN_ASSETS.map((url) => {
                        return fetch(url)
                            .then((response) => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                            })
                            .catch((err) => {
                                console.warn(`[SW] Failed to cache CDN asset: ${url}`, err);
                            });
                    })
                );
            })
        ]).then(() => {
            console.log('[SW] Installation complete');
            return self.skipWaiting();
        })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => {
                        return name !== STATIC_CACHE && 
                               name !== DYNAMIC_CACHE &&
                               name.startsWith('markdown-editor-');
                    })
                    .map((name) => {
                        console.log(`[SW] Deleting old cache: ${name}`);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('[SW] Activation complete');
            return self.clients.claim();
        })
    );
});

/**
 * Fetch event - serve from cache with network fallback
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }
    
    // Skip Vercel analytics
    if (url.pathname.includes('_vercel') || url.hostname.includes('vercel')) {
        return;
    }
    
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            // Return cached response if available
            if (cachedResponse) {
                // Fetch in background to update cache (stale-while-revalidate)
                fetchAndUpdate(request);
                return cachedResponse;
            }
            
            // Otherwise fetch from network
            return fetchAndCache(request);
        }).catch(() => {
            // If both cache and network fail, show offline page for navigation requests
            if (request.mode === 'navigate') {
                return caches.match('/index.html');
            }
            
            // Return a placeholder for images
            if (request.destination === 'image') {
                return new Response(
                    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="10" y="50">Offline</text></svg>',
                    { headers: { 'Content-Type': 'image/svg+xml' } }
                );
            }
            
            return new Response('Offline', { status: 503 });
        })
    );
});

/**
 * Fetch from network and cache the response
 * @param {Request} request - The fetch request
 * @returns {Promise<Response>}
 */
async function fetchAndCache(request) {
    try {
        const response = await fetch(request);
        
        // Only cache successful responses
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('[SW] Fetch failed:', error);
        throw error;
    }
}

/**
 * Fetch and update cache in background
 * @param {Request} request - The fetch request
 */
async function fetchAndUpdate(request) {
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, response);
        }
    } catch (error) {
        // Silently fail - we already returned the cached version
        console.log('[SW] Background fetch failed:', error);
    }
}

/**
 * Handle messages from the main thread
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((names) => {
            return Promise.all(names.map((name) => caches.delete(name)));
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

/**
 * Background sync for saving content
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-content') {
        event.waitUntil(syncContent());
    }
});

/**
 * Sync content when back online
 */
async function syncContent() {
    // This would sync with a backend if we had one
    // For now, localStorage handles persistence
    console.log('[SW] Background sync triggered');
}

/**
 * Handle push notifications (for future use)
 */
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Markdown Editor', {
                body: data.body || 'You have a notification',
                icon: '/manifest.json',
                badge: '/manifest.json',
                data: data.data
            })
        );
    }
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Focus existing window or open new one
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
