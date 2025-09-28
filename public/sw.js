const CACHE_NAME = "weather-app-v1.2.0"
const urlsToCache = [
  "/",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching files")
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log("Service Worker: Installation complete")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error)
      }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker: Activation complete")
        return self.clients.claim()
      }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip external API requests for weather data
  if (event.request.url.includes("api.open-meteo.com")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      if (response) {
        console.log("Service Worker: Serving from cache", event.request.url)
        return response
      }

      console.log("Service Worker: Fetching from network", event.request.url)
      return fetch(event.request)
        .then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === "document") {
            return caches.match("/offline.html")
          }
        })
    }),
  )
})

// Background sync for weather data
self.addEventListener("sync", (event) => {
  if (event.tag === "weather-sync") {
    console.log("Service Worker: Background sync for weather data")
    event.waitUntil(syncWeatherData())
  }
})

// Push notification handler
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push notification received")

  const options = {
    body: event.data ? event.data.text() : "Nowe dane pogodowe dostępne",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Zobacz pogodę",
        icon: "/icons/icon-192x192.png",
      },
      {
        action: "close",
        title: "Zamknij",
        icon: "/icons/icon-192x192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Panel Sterowania - Pogoda", options))
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click received")

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  } else if (event.action === "close") {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(clients.openWindow("/"))
  }
})

// Sync weather data function
async function syncWeatherData() {
  try {
    console.log("Service Worker: Syncing weather data in background")

    // Get cached locations
    const locations = [
      { name: "Konopnica", latitude: 51.221, longitude: 18.5696 },
      { name: "Warszawa", latitude: 52.2298, longitude: 21.0118 },
      { name: "Wieluń", latitude: 51.3538, longitude: 18.8236 },
    ]

    // Sync data for each location
    for (const location of locations) {
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto&forecast_days=1`

      try {
        const response = await fetch(apiUrl)
        if (response.ok) {
          const data = await response.json()

          // Store in cache
          const cache = await caches.open(CACHE_NAME)
          await cache.put(`weather-${location.name.toLowerCase()}`, new Response(JSON.stringify(data)))

          console.log(`Service Worker: Weather data synced for ${location.name}`)
        }
      } catch (error) {
        console.error(`Service Worker: Failed to sync weather for ${location.name}`, error)
      }
    }
  } catch (error) {
    console.error("Service Worker: Background sync failed", error)
  }
}

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  console.log("Service Worker: Message received", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "SYNC_WEATHER") {
    // Register background sync
    self.registration.sync.register("weather-sync")
  }
})

// Error handler
self.addEventListener("error", (event) => {
  console.error("Service Worker: Error occurred", event.error)
})

// Unhandled rejection handler
self.addEventListener("unhandledrejection", (event) => {
  console.error("Service Worker: Unhandled promise rejection", event.reason)
})
