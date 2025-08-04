/**
 * Service Worker for Panel Sterowania
 * Handles offline caching and background sync
 */

const CACHE_NAME = "panel-sterowania-v1.0.0"
const STATIC_CACHE_NAME = "panel-static-v1.0.0"
const DYNAMIC_CACHE_NAME = "panel-dynamic-v1.0.0"

// Files to cache immediately
const STATIC_FILES = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./offline.html",
  "./icons/icon-192x192.png",
  "./icons/icon-512x512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32x32.png",
  "./icons/favicon-16x16.png",
]

// Files to cache on demand
const DYNAMIC_FILES = ["./images/", "./icons/"]

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching static files")
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log("Service Worker: Static files cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Error caching static files", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external requests (like AccuWeather API)
  if (url.origin !== location.origin) {
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // Return cached version if available
      if (cachedResponse) {
        console.log("Service Worker: Serving from cache", request.url)
        return cachedResponse
      }

      // Otherwise fetch from network
      return fetch(request)
        .then((networkResponse) => {
          // Don't cache if not successful
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse
          }

          // Clone the response
          const responseToCache = networkResponse.clone()

          // Cache dynamic content
          if (shouldCacheDynamically(request.url)) {
            caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              console.log("Service Worker: Caching dynamic file", request.url)
              cache.put(request, responseToCache)
            })
          }

          return networkResponse
        })
        .catch(() => {
          // Network failed, try to serve offline page for navigation requests
          if (request.destination === "document") {
            return caches.match("./offline.html")
          }

          // For other requests, return a basic offline response
          return new Response("Offline", {
            status: 503,
            statusText: "Service Unavailable",
          })
        })
    }),
  )
})

// Background sync for weather data
self.addEventListener("sync", (event) => {
  console.log("Service Worker: Background sync", event.tag)

  if (event.tag === "weather-sync") {
    event.waitUntil(syncWeatherData())
  }
})

// Push notifications (for future use)
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push received", event)

  const options = {
    body: event.data ? event.data.text() : "Panel Sterowania - Nowa aktualizacja",
    icon: "./icons/icon-192x192.png",
    badge: "./icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Otwórz aplikację",
        icon: "./icons/icon-192x192.png",
      },
      {
        action: "close",
        title: "Zamknij",
        icon: "./icons/icon-192x192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Panel Sterowania", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification clicked", event)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("./"))
  }
})

// Helper functions
function shouldCacheDynamically(url) {
  return DYNAMIC_FILES.some((pattern) => url.includes(pattern))
}

async function syncWeatherData() {
  try {
    console.log("Service Worker: Syncing weather data...")

    // Get all clients
    const clients = await self.clients.matchAll()

    // Send message to clients to refresh weather data
    clients.forEach((client) => {
      client.postMessage({
        type: "WEATHER_SYNC",
        timestamp: Date.now(),
      })
    })

    console.log("Service Worker: Weather sync completed")
  } catch (error) {
    console.error("Service Worker: Weather sync failed", error)
  }
}

// Message handler for communication with main app
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CACHE_WEATHER_DATA") {
    // Cache weather data for offline use
    caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
      const response = new Response(JSON.stringify(event.data.weatherData), {
        headers: { "Content-Type": "application/json" },
      })
      return cache.put("./api/weather/current", response)
    })
  }
})

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  console.log("Service Worker: Periodic sync", event.tag)

  if (event.tag === "weather-update") {
    event.waitUntil(syncWeatherData())
  }
})

console.log("Service Worker: Script loaded")
