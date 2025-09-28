// Weather App JavaScript
class WeatherApp {
  constructor() {
    this.weatherData = [
      {
        id: 1,
        location: "Wieluń",
        temperature: 18,
        description: "częściowo pochmurno",
        icon: "⛅",
        humidity: 65,
        windSpeed: 12,
        pressure: 1013,
        visibility: 10,
      },
      {
        id: 2,
        location: "Częstochowa",
        temperature: 20,
        description: "słonecznie",
        icon: "☀️",
        humidity: 45,
        windSpeed: 8,
        pressure: 1015,
        visibility: 15,
      },
      {
        id: 3,
        location: "Kalisz",
        temperature: 16,
        description: "deszczowo",
        icon: "🌧️",
        humidity: 85,
        windSpeed: 15,
        pressure: 1008,
        visibility: 8,
      },
      {
        id: 4,
        location: "Łódź",
        temperature: 19,
        description: "pochmurno",
        icon: "☁️",
        humidity: 70,
        windSpeed: 10,
        pressure: 1011,
        visibility: 12,
      },
      {
        id: 5,
        location: "Sieradz",
        temperature: 17,
        description: "mgliście",
        icon: "🌫️",
        humidity: 90,
        windSpeed: 5,
        pressure: 1009,
        visibility: 5,
      },
    ]

    this.controlStates = {
      lighting: false,
      temperature: 22,
      security: true,
      ventilation: "auto",
      energy: 85,
      water: "ok",
    }

    this.lastUpdate = null
    this.updateInterval = null
    this.deferredPrompt = null

    this.init()
  }

  init() {
    this.setupEventListeners()
    this.renderWeather()
    this.updateControlStates()
    this.startAutoUpdate()
    this.hideLoadingScreen()
    this.setupPWA()
    this.setupHapticFeedback()
  }

  setupEventListeners() {
    // Refresh weather button
    const refreshBtn = document.getElementById("refresh-weather")
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => this.refreshWeather())
    }

    // Control buttons
    const controlButtons = document.querySelectorAll(".control-btn")
    controlButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleControlAction(e))
    })

    // Install button
    const installBtn = document.getElementById("install-btn")
    if (installBtn) {
      installBtn.addEventListener("click", () => this.installApp())
    }

    // PWA install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showInstallButton()
    })

    // Handle app installed
    window.addEventListener("appinstalled", () => {
      this.hideInstallButton()
      this.showToast("Aplikacja została zainstalowana!", "success")
    })

    // Handle online/offline status
    window.addEventListener("online", () => this.updateConnectionStatus(true))
    window.addEventListener("offline", () => this.updateConnectionStatus(false))

    // Handle visibility change for auto-refresh
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.refreshWeather()
      }
    })
  }

  hideLoadingScreen() {
    setTimeout(() => {
      const loadingScreen = document.getElementById("loading-screen")
      const app = document.getElementById("app")

      if (loadingScreen && app) {
        loadingScreen.style.opacity = "0"
        setTimeout(() => {
          loadingScreen.style.display = "none"
          app.style.display = "flex"
          app.style.opacity = "0"
          setTimeout(() => {
            app.style.opacity = "1"
            app.style.transition = "opacity 0.3s ease"
          }, 50)
        }, 300)
      }
    }, 1500)
  }

  renderWeather() {
    const weatherGrid = document.getElementById("weather-grid")
    if (!weatherGrid) return

    weatherGrid.innerHTML = ""

    this.weatherData.forEach((weather) => {
      const weatherCard = this.createWeatherCard(weather)
      weatherGrid.appendChild(weatherCard)
    })

    this.updateLastUpdateTime()
  }

  createWeatherCard(weather) {
    const card = document.createElement("div")
    card.className = "weather-card"
    card.innerHTML = `
            <div class="weather-header">
                <div class="weather-location">${weather.location}</div>
                <div class="weather-icon">${weather.icon}</div>
            </div>
            <div class="weather-temp">${weather.temperature}°C</div>
            <div class="weather-description">${weather.description}</div>
            <div class="weather-details">
                <div class="weather-detail">
                    <span class="weather-detail-label">Wilgotność</span>
                    <span class="weather-detail-value">${weather.humidity}%</span>
                </div>
                <div class="weather-detail">
                    <span class="weather-detail-label">Wiatr</span>
                    <span class="weather-detail-value">${weather.windSpeed} km/h</span>
                </div>
                <div class="weather-detail">
                    <span class="weather-detail-label">Ciśnienie</span>
                    <span class="weather-detail-value">${weather.pressure} hPa</span>
                </div>
                <div class="weather-detail">
                    <span class="weather-detail-label">Widoczność</span>
                    <span class="weather-detail-value">${weather.visibility} km</span>
                </div>
            </div>
        `

    return card
  }

  refreshWeather() {
    this.triggerHapticFeedback()

    // Simulate weather data update
    this.weatherData = this.weatherData.map((weather) => ({
      ...weather,
      temperature: weather.temperature + (Math.random() - 0.5) * 4,
      humidity: Math.max(20, Math.min(100, weather.humidity + (Math.random() - 0.5) * 20)),
      windSpeed: Math.max(0, weather.windSpeed + (Math.random() - 0.5) * 10),
      pressure: weather.pressure + (Math.random() - 0.5) * 20,
    }))

    this.renderWeather()
    this.showToast("Dane pogodowe zostały odświeżone", "success")

    // Animate refresh button
    const refreshBtn = document.getElementById("refresh-weather")
    if (refreshBtn) {
      refreshBtn.style.transform = "rotate(360deg)"
      setTimeout(() => {
        refreshBtn.style.transform = ""
      }, 500)
    }
  }

  handleControlAction(event) {
    const button = event.currentTarget
    const action = button.dataset.action

    this.triggerHapticFeedback()

    // Toggle button state
    button.classList.toggle("active")

    // Update control state
    switch (action) {
      case "lighting":
        this.controlStates.lighting = !this.controlStates.lighting
        this.updateControlStatus("lighting-status", this.controlStates.lighting ? "ON" : "OFF")
        break
      case "temperature":
        this.controlStates.temperature = this.controlStates.temperature === 22 ? 25 : 22
        this.updateControlStatus("temperature-status", `${this.controlStates.temperature}°C`)
        break
      case "security":
        this.controlStates.security = !this.controlStates.security
        this.updateControlStatus("security-status", this.controlStates.security ? "AKTYWNE" : "NIEAKTYWNE")
        break
      case "ventilation":
        this.controlStates.ventilation = this.controlStates.ventilation === "auto" ? "manual" : "auto"
        this.updateControlStatus("ventilation-status", this.controlStates.ventilation.toUpperCase())
        break
      case "energy":
        this.controlStates.energy = this.controlStates.energy === 85 ? 92 : 85
        this.updateControlStatus("energy-status", `${this.controlStates.energy}%`)
        break
      case "water":
        this.controlStates.water = this.controlStates.water === "ok" ? "low" : "ok"
        this.updateControlStatus("water-status", this.controlStates.water.toUpperCase())
        break
    }

    this.showToast(
      `${this.getActionName(action)} zostało ${button.classList.contains("active") ? "włączone" : "wyłączone"}`,
      "success",
    )
    this.updateControlStatusText()
  }

  getActionName(action) {
    const names = {
      lighting: "Oświetlenie",
      temperature: "Kontrola temperatury",
      security: "System bezpieczeństwa",
      ventilation: "Wentylacja",
      energy: "Zarządzanie energią",
      water: "System wodny",
    }
    return names[action] || action
  }

  updateControlStatus(elementId, value) {
    const element = document.getElementById(elementId)
    if (element) {
      element.textContent = value
    }
  }

  updateControlStates() {
    // Initialize control button states
    Object.keys(this.controlStates).forEach((key) => {
      const button = document.querySelector(`[data-action="${key}"]`)
      if (button && (key === "security" || key === "lighting")) {
        if (this.controlStates[key]) {
          button.classList.add("active")
        }
      }
    })

    this.updateControlStatusText()
  }

  updateControlStatusText() {
    const activeControls = Object.keys(this.controlStates).filter((key) => {
      const state = this.controlStates[key]
      return state === true || (typeof state === "string" && state !== "ok")
    })

    const statusElement = document.getElementById("control-status")
    if (statusElement) {
      statusElement.textContent = activeControls.length > 0 ? `Aktywne: ${activeControls.length}` : "Gotowy"
    }
  }

  updateLastUpdateTime() {
    this.lastUpdate = new Date()
    const lastUpdateElement = document.getElementById("last-update")
    if (lastUpdateElement) {
      lastUpdateElement.textContent = `Ostatnia aktualizacja: ${this.formatTime(this.lastUpdate)}`
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  startAutoUpdate() {
    // Update weather every 5 minutes
    this.updateInterval = setInterval(
      () => {
        if (!document.hidden) {
          this.refreshWeather()
        }
      },
      5 * 60 * 1000,
    )
  }

  updateConnectionStatus(isOnline) {
    const statusElement = document.getElementById("connection-status")
    if (statusElement) {
      statusElement.textContent = isOnline ? "ONLINE" : "OFFLINE"
      statusElement.className = `status-indicator ${isOnline ? "online" : "offline"}`
    }

    if (isOnline) {
      this.showToast("Połączenie przywrócone", "success")
    } else {
      this.showToast("Tryb offline - aplikacja działa lokalnie", "warning")
    }
  }

  setupPWA() {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      this.hideInstallButton()
    }

    // Update connection status
    this.updateConnectionStatus(navigator.onLine)
  }

  showInstallButton() {
    const installBtn = document.getElementById("install-btn")
    if (installBtn) {
      installBtn.style.display = "flex"
    }
  }

  hideInstallButton() {
    const installBtn = document.getElementById("install-btn")
    if (installBtn) {
      installBtn.style.display = "none"
    }
  }

  async installApp() {
    if (!this.deferredPrompt) return

    this.deferredPrompt.prompt()
    const { outcome } = await this.deferredPrompt.userChoice

    if (outcome === "accepted") {
      this.showToast("Instalowanie aplikacji...", "success")
    }

    this.deferredPrompt = null
    this.hideInstallButton()
  }

  setupHapticFeedback() {
    // Check if device supports haptic feedback
    this.hasHapticFeedback = "vibrate" in navigator
  }

  triggerHapticFeedback() {
    if (this.hasHapticFeedback) {
      navigator.vibrate(50) // Short vibration
    }
  }

  showToast(message, type = "info", duration = 3000) {
    const toastContainer = document.getElementById("toast-container")
    if (!toastContainer) return

    const toast = document.createElement("div")
    toast.className = `toast ${type}`

    const title =
      type === "success" ? "Sukces" : type === "error" ? "Błąd" : type === "warning" ? "Uwaga" : "Informacja"

    toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        `

    toastContainer.appendChild(toast)

    // Auto remove toast
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = "0"
        toast.style.transform = "translateX(100%)"
        setTimeout(() => {
          toast.remove()
        }, 300)
      }
    }, duration)

    // Click to dismiss
    toast.addEventListener("click", () => {
      toast.style.opacity = "0"
      toast.style.transform = "translateX(100%)"
      setTimeout(() => {
        toast.remove()
      }, 300)
    })
  }

  // Cleanup method
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
  }
}

// Lazy loading for images
class LazyImageLoader {
  constructor() {
    this.images = document.querySelectorAll("img[data-src]")
    this.imageObserver = null
    this.init()
  }

  init() {
    if ("IntersectionObserver" in window) {
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage(entry.target)
            this.imageObserver.unobserve(entry.target)
          }
        })
      })

      this.images.forEach((img) => this.imageObserver.observe(img))
    } else {
      // Fallback for older browsers
      this.images.forEach((img) => this.loadImage(img))
    }
  }

  loadImage(img) {
    const src = img.dataset.src
    if (src) {
      img.src = src
      img.classList.add("loaded")
      img.removeAttribute("data-src")
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {}
    this.init()
  }

  init() {
    // Monitor page load performance
    window.addEventListener("load", () => {
      this.measurePageLoad()
    })

    // Monitor user interactions
    this.measureUserInteractions()
  }

  measurePageLoad() {
    if ("performance" in window) {
      const navigation = performance.getEntriesByType("navigation")[0]
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        this.metrics.firstPaint = performance
          .getEntriesByType("paint")
          .find((entry) => entry.name === "first-paint")?.startTime

        console.log("Performance Metrics:", this.metrics)
      }
    }
  }

  measureUserInteractions() {
    let interactionCount = 0
    ;["click", "touch", "keydown"].forEach((eventType) => {
      document.addEventListener(
        eventType,
        () => {
          interactionCount++
        },
        { passive: true },
      )
    })

    // Log interaction count every minute
    setInterval(() => {
      if (interactionCount > 0) {
        console.log(`User interactions in last minute: ${interactionCount}`)
        interactionCount = 0
      }
    }, 60000)
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize main app
  window.weatherApp = new WeatherApp()

  // Initialize lazy loading
  window.lazyLoader = new LazyImageLoader()

  // Initialize performance monitoring
  window.performanceMonitor = new PerformanceMonitor()

  // Global error handling
  window.addEventListener("error", (event) => {
    console.error("Global error:", event.error)
    if (window.weatherApp) {
      window.weatherApp.showToast("Wystąpił błąd aplikacji", "error")
    }
  })

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason)
    if (window.weatherApp) {
      window.weatherApp.showToast("Wystąpił błąd aplikacji", "error")
    }
  })
})

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (window.weatherApp) {
    window.weatherApp.destroy()
  }
})
