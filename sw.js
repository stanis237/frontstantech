/* ==========================================================================
   STANTECH - Service Worker (PWA & Cache Hors-Ligne)
   ========================================================================== */

const CACHE_NAME = 'stantech-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './services.html',
  './realisations.html',
  './applications.html',
  './boutique.html',
  './produit.html',
  './panier.html',
  './a-propos.html',
  './contact.html',
  './css/style.css',
  './css/responsive.css',
  './js/config.js',
  './js/api.js',
  './js/main.js',
  './js/lucide.min.js',
  './images/logo.png',
  './images/logos.png',
  './images/logo_stantech_fond_blanc_9x16.png'
];

// Installation : Mise en cache des ressources statiques
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activation : Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes : Réseau d'abord, secours sur le cache
self.addEventListener('fetch', (event) => {
  // On ne met pas en cache les requêtes API dynamiques (laisser le réseau agir)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Met en cache une copie de la réponse fraîche
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // En cas de perte de connexion réseau, renvoyer la ressource du cache
        return caches.match(event.request);
      })
  );
});
