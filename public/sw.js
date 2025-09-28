const CACHE_NAME = "panel-sterowania-v1.2"
const STATIC_CACHE = "static-v1.2"
const API_CACHE = "api-v1.2"

// Files to cache immediately
const STATIC_FILES = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/manifest.json",
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/offline.html",
]

// API endpoints to cache
const API_ENDPOINTS = ["https://api.open-meteo.com/v1/forecast"]

// Install event - cache static files
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...")

  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log("Service Worker: Caching static files")
        return cache.addAll(STATIC_FILES)
      }),
      caches.open(API_CACHE).then((cache) => {
        console.log("Service Worker: API cache ready")
        return cache
      }),
    ]).then(() => {
      console.log("Service Worker: Installation complete")
      return self.skipWaiting()
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
            if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              console.log("Service Worker: Deleting old cache:", cacheName)
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

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.hostname === "api.open-meteo.com") {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static files
  if (request.method === "GET") {
    event.respondWith(handleStaticRequest(request))
    return
  }
})

// Handle API requests with cache-first strategy for weather data
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  const url = new URL(request.url)

  // Create a cache key based on location parameters
  const lat = url.searchParams.get("latitude")
  const lon = url.searchParams.get("longitude")
  const cacheKey = `${url.origin}${url.pathname}?lat=${lat}&lon=${lon}`

  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful response for 30 minutes
      const responseClone = networkResponse.clone()
      const cacheResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          "sw-cache-time": Date.now().toString(),
          "sw-cache-expires": (Date.now() + 30 * 60 * 1000).toString(), // 30 minutes
        },
      })

      cache.put(cacheKey, cacheResponse)
      console.log("Service Worker: Cached API response for", cacheKey)

      return networkResponse
    }
  } catch (error) {
    console.log("Service Worker: Network failed for API request, trying cache")
  }

  // Network failed, try cache
  const cachedResponse = await cache.match(cacheKey)
  if (cachedResponse) {
    const cacheTime = cachedResponse.headers.get("sw-cache-time")
    const cacheExpires = cachedResponse.headers.get("sw-cache-expires")

    if (cacheTime && cacheExpires && Date.now() < Number.parseInt(cacheExpires)) {
      console.log("Service Worker: Serving cached API response for", cacheKey)
      return cachedResponse
    } else {
      console.log("Service Worker: Cached API response expired for", cacheKey)
    }
  }

  // No cache or expired, return error response
  return new Response(
    JSON.stringify({
      error: "Network unavailable and no cached data",
      offline: true,
      timestamp: Date.now(),
    }),
    {
      status: 503,
      statusText: "Service Unavailable",
      headers: {
        "Content-Type": "application/json",
        "sw-fallback": "true",
      },
    },
  )
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)

  // Try cache first
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    console.log("Service Worker: Serving from cache:", request.url)
    return cachedResponse
  }

  try {
    // Try network
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      // Cache successful response
      cache.put(request, networkResponse.clone())
      console.log("Service Worker: Cached static file:", request.url)
    }

    return networkResponse
  } catch (error) {
    console.log("Service Worker: Network failed for static request:", request.url)

    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const offlineResponse = await cache.match("/offline.html")
      if (offlineResponse) {
        return offlineResponse
      }
    }

    // Return a basic offline response
    return new Response("Offline - content not available", {
      status: 503,
      statusText: "Service Unavailable",
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}

// Handle background sync for API calls
self.addEventListener("sync", (event) => {
  if (event.tag === "weather-sync") {
    console.log("Service Worker: Background sync for weather data")
    event.waitUntil(syncWeatherData())
  }
})

// Sync weather data in background
async function syncWeatherData() {
  try {
    // Get stored locations from IndexedDB or localStorage
    const locations = [
      { lat: 51.221, lon: 18.5696 }, // Konopnica
      { lat: 52.2298, lon: 21.0118 }, // Warszawa
      { lat: 51.3538, lon: 18.8236 }, // Wieluń
    ]

    const cache = await caches.open(API_CACHE)

    for (const location of locations) {
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&daily=weather_code,sunrise,sunset,sunshine_duration&hourly=temperature_2m,relative_humidity_2m,rain,snowfall,surface_pressure,visibility,precipitation,wind_speed_10m&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto&forecast_days=1`

      try {
        const response = await fetch(apiUrl)
        if (response.ok) {
          const cacheKey = `https://api.open-meteo.com/v1/forecast?lat=${location.lat}&lon=${location.lon}`
          const cacheResponse = new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: {
              ...Object.fromEntries(response.headers.entries()),
              "sw-cache-time": Date.now().toString(),
              "sw-cache-expires": (Date.now() + 30 * 60 * 1000).toString(),
            },
          })

          await cache.put(cacheKey, cacheResponse)
          console.log("Service Worker: Background synced weather for", location)
        }
      } catch (error) {
        console.log("Service Worker: Background sync failed for", location, error)
      }
    }
  } catch (error) {
    console.log("Service Worker: Background sync error:", error)
  }
}

// Handle push notifications (for future use)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    console.log("Service Worker: Push notification received:", data)

    const options = {
      body: data.body || "Nowe dane pogodowe dostępne",
      icon: "/favicon-32x32.png",
      badge: "/favicon-16x16.png",
      tag: "weather-update",
      renotify: true,
      requireInteraction: false,
      actions: [
        {
          action: "view",
          title: "Zobacz pogodę",
        },
        {
          action: "dismiss",
          title: "Zamknij",
        },
      ],
    }

    event.waitUntil(self.registration.showNotification(data.title || "Panel Sterowania", options))
  }
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view") {
    event.waitUntil(clients.openWindow("/?view=weather"))
  }
})

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "weather-periodic-sync") {
    console.log("Service Worker: Periodic sync for weather data")
    event.waitUntil(syncWeatherData())
  }
})

// Message handling from main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "GET_CACHE_STATUS") {
    event.ports[0].postMessage({
      caches: [STATIC_CACHE, API_CACHE],
      version: "1.2",
    })
  }
})
