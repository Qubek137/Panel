/**
 * Panel Sterowania - Main Application Script
 * Mobilny panel sterowania z pogodą dla regionu Wieluń
 */

// Application State
const AppState = {
  currentView: "weather", // 'weather' or 'control'
  currentLocationIndex: 0,
  weatherData: null,
  isLoading: false,
  isOffline: false,
  touchStart: null,
  touchEnd: null,
  lastWeatherUpdate: null,
}

// Configuration
const Config = {
  minSwipeDistance: 50,
  weatherUpdateInterval: 5 * 60 * 1000, // 5 minutes
  hapticPatterns: {
    short: 50,
    medium: [50, 30, 50],
    long: [100, 50, 100],
  },
  locations: [
    { name: "Wieluń Piaski", locationKey: "2747373" },
    { name: "Konopnica", locationKey: "2747374" },
    { name: "Wieluń", locationKey: "315078" },
    { name: "Łódź", locationKey: "274231" },
    { name: "Warszawa", locationKey: "274663" },
  ],
}

// Static Weather Data (for offline mode)
const StaticWeatherData = {
  2747373: [
    {
      location: "Wieluń Piaski",
      temperature: 12,
      humidity: 68,
      windSpeed: 15,
      condition: "Częściowe zachmurzenie",
      description: "częściowe zachmurzenie z przejaśnieniami",
    },
    {
      location: "Wieluń Piaski",
      temperature: 8,
      humidity: 75,
      windSpeed: 12,
      condition: "Pochmurno",
      description: "pochmurno z możliwością opadów",
    },
  ],
  2747374: [
    {
      location: "Konopnica",
      temperature: 10,
      humidity: 72,
      windSpeed: 18,
      condition: "Deszcz",
      description: "lekki deszcz",
    },
  ],
  315078: [
    {
      location: "Wieluń",
      temperature: 15,
      humidity: 55,
      windSpeed: 12,
      condition: "Słonecznie",
      description: "słonecznie z niewielkim wiatrem",
    },
  ],
  274231: [
    {
      location: "Łódź",
      temperature: 16,
      humidity: 50,
      windSpeed: 14,
      condition: "Słonecznie",
      description: "pogodnie i ciepło",
    },
  ],
  274663: [
    {
      location: "Warszawa",
      temperature: 17,
      humidity: 48,
      windSpeed: 11,
      condition: "Słonecznie",
      description: "słonecznie i przyjemnie",
    },
  ],
}

// Utility Functions
const Utils = {
  // Haptic feedback
  triggerHaptic(pattern = Config.hapticPatterns.short) {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  },

  // Format time
  formatTime(date = new Date()) {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  },

  // Get random weather data
  getRandomWeatherData(locationKey) {
    const locationData = StaticWeatherData[locationKey]
    if (!locationData || locationData.length === 0) {
      return {
        location: "Nieznana lokalizacja",
        temperature: 15,
        humidity: 60,
        windSpeed: 10,
        condition: "Słonecznie",
        description: "pogodnie",
      }
    }

    const randomIndex = Math.floor(Math.random() * locationData.length)
    const baseData = locationData[randomIndex]

    // Add time-based temperature variation
    const hour = new Date().getHours()
    let temperatureModifier = 0

    if (hour >= 6 && hour < 12) {
      temperatureModifier = Math.floor(Math.random() * 3)
    } else if (hour >= 12 && hour < 18) {
      temperatureModifier = Math.floor(Math.random() * 5) + 2
    } else if (hour >= 18 && hour < 22) {
      temperatureModifier = Math.floor(Math.random() * 2)
    } else {
      temperatureModifier = -Math.floor(Math.random() * 3)
    }

    return {
      ...baseData,
      temperature: Math.max(baseData.temperature + temperatureModifier, -10),
      timestamp: Date.now(),
    }
  },

  // Debounce function
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Check if online
  isOnline() {
    return navigator.onLine
  },

  // Lazy load images
  lazyLoadImages() {
    const images = document.querySelectorAll("img[data-src]")
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove("lazy")
          imageObserver.unobserve(img)
        }
      })
    })

    images.forEach((img) => imageObserver.observe(img))
  },
}

// Weather Module
const Weather = {
  async fetchWeatherData(locationIndex) {
    const location = Config.locations[locationIndex]
    AppState.isLoading = true
    this.showLoading()

    try {
      // Try to fetch real weather data first
      if (Utils.isOnline()) {
        const apiKey = "demo_key" // Replace with actual API key
        const response = await fetch(
          `https://dataservice.accuweather.com/currentconditions/v1/${location.locationKey}?apikey=${apiKey}&language=pl&details=true`,
        )

        if (response.ok) {
          const data = await response.json()
          const currentWeather = data[0]

          AppState.weatherData = {
            location: location.name,
            temperature: Math.round(currentWeather.Temperature.Metric.Value),
            humidity: currentWeather.RelativeHumidity,
            windSpeed: Math.round(currentWeather.Wind.Speed.Metric.Value),
            condition: currentWeather.WeatherText,
            description: currentWeather.WeatherText.toLowerCase(),
            timestamp: Date.now(),
          }
        } else {
          throw new Error("API request failed")
        }
      } else {
        throw new Error("Offline mode")
      }
    } catch (error) {
      console.log("Using static weather data:", error.message)
      // Fallback to static data
      AppState.weatherData = Utils.getRandomWeatherData(location.locationKey)
    }

    AppState.isLoading = false
    AppState.lastWeatherUpdate = Date.now()
    this.displayWeatherData()
  },

  showLoading() {
    const loadingEl = document.getElementById("weather-loading")
    const dataEl = document.getElementById("weather-data")
    const errorEl = document.getElementById("weather-error")

    loadingEl.style.display = "block"
    dataEl.style.display = "none"
    errorEl.style.display = "none"
  },

  displayWeatherData() {
    const loadingEl = document.getElementById("weather-loading")
    const dataEl = document.getElementById("weather-data")
    const errorEl = document.getElementById("weather-error")

    if (AppState.weatherData) {
      // Update DOM elements
      document.getElementById("location-name").textContent = AppState.weatherData.location
      document.getElementById("temperature").textContent = `${AppState.weatherData.temperature}°C`
      document.getElementById("condition").textContent = AppState.weatherData.condition
      document.getElementById("description").textContent = AppState.weatherData.description
      document.getElementById("humidity").textContent = `${AppState.weatherData.humidity}%`
      document.getElementById("wind-speed").textContent = `${AppState.weatherData.windSpeed} km/h`

      if (AppState.weatherData.timestamp) {
        const updateTime = new Date(AppState.weatherData.timestamp)
        document.getElementById("last-update").textContent = Utils.formatTime(updateTime)
      }

      loadingEl.style.display = "none"
      dataEl.style.display = "block"
      errorEl.style.display = "none"
    } else {
      loadingEl.style.display = "none"
      dataEl.style.display = "none"
      errorEl.style.display = "block"
    }
  },

  updateLocationIndicators() {
    const indicators = document.querySelectorAll(".indicator")
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === AppState.currentLocationIndex)
    })
  },
}

// Touch Handler Module
const TouchHandler = {
  init() {
    const app = document.getElementById("app")
    app.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: true })
    app.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: true })
    app.addEventListener("touchend", this.handleTouchEnd.bind(this), { passive: true })
  },

  handleTouchStart(e) {
    AppState.touchEnd = null
    AppState.touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  },

  handleTouchMove(e) {
    AppState.touchEnd = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  },

  handleTouchEnd() {
    if (!AppState.touchStart || !AppState.touchEnd) return

    const distanceX = AppState.touchStart.x - AppState.touchEnd.x
    const distanceY = AppState.touchStart.y - AppState.touchEnd.y
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)

    if (isHorizontalSwipe) {
      const isLeftSwipe = distanceX > Config.minSwipeDistance
      const isRightSwipe = distanceX < -Config.minSwipeDistance

      if (isLeftSwipe && AppState.currentView === "weather") {
        Utils.triggerHaptic(Config.hapticPatterns.medium)
        ViewManager.switchToControl()
      }
      if (isRightSwipe && AppState.currentView === "control") {
        Utils.triggerHaptic(Config.hapticPatterns.medium)
        ViewManager.switchToWeather()
      }
    } else {
      if (AppState.currentView === "weather") {
        const isUpSwipe = distanceY > Config.minSwipeDistance
        const isDownSwipe = distanceY < -Config.minSwipeDistance

        if (isUpSwipe) {
          AppState.currentLocationIndex =
            (AppState.currentLocationIndex - 1 + Config.locations.length) % Config.locations.length
          Utils.triggerHaptic(Config.hapticPatterns.short)
          Weather.updateLocationIndicators()
          Weather.fetchWeatherData(AppState.currentLocationIndex)
        }
        if (isDownSwipe) {
          AppState.currentLocationIndex = (AppState.currentLocationIndex + 1) % Config.locations.length
          Utils.triggerHaptic(Config.hapticPatterns.short)
          Weather.updateLocationIndicators()
          Weather.fetchWeatherData(AppState.currentLocationIndex)
        }
      }
    }
  },
}

// View Manager Module
const ViewManager = {
  switchToWeather() {
    AppState.currentView = "weather"
    document.getElementById("weather-view").classList.add("active")
    document.getElementById("control-view").classList.remove("active")
  },

  switchToControl() {
    AppState.currentView = "control"
    document.getElementById("weather-view").classList.remove("active")
    document.getElementById("control-view").classList.add("active")
  },
}

// Control Panel Module
const ControlPanel = {
  init() {
    const buttons = document.querySelectorAll(".control-button")
    buttons.forEach((button) => {
      button.addEventListener("click", this.handleButtonClick.bind(this))
    })

    // Retry button
    const retryButton = document.getElementById("retry-weather")
    if (retryButton) {
      retryButton.addEventListener("click", () => {
        Weather.fetchWeatherData(AppState.currentLocationIndex)
      })
    }
  },

  handleButtonClick(e) {
    const button = e.currentTarget
    const buttonId = button.dataset.button

    Utils.triggerHaptic(Config.hapticPatterns.long)

    // Visual feedback
    button.classList.add("pressed")
    setTimeout(() => {
      button.classList.remove("pressed")
    }, 200)

    // Add pulse animation
    button.classList.add("animate-pulse")
    setTimeout(() => {
      button.classList.remove("animate-pulse")
    }, 1000)

    console.log(`Control button ${buttonId} pressed`)

    // Here you can add actual control logic
    this.executeControlAction(buttonId)
  },

  executeControlAction(buttonId) {
    // Placeholder for actual control logic
    const actions = {
      1: () => console.log("Oświetlenie toggled"),
      2: () => console.log("Temperatura adjusted"),
      3: () => console.log("Bezpieczeństwo checked"),
      4: () => console.log("System Audio toggled"),
      5: () => console.log("Wentylacja adjusted"),
      6: () => console.log("Alarm triggered"),
    }

    if (actions[buttonId]) {
      actions[buttonId]()
    }
  },
}

// Time Module
const TimeManager = {
  init() {
    this.updateTime()
    setInterval(this.updateTime, 1000)
  },

  updateTime() {
    const timeElement = document.getElementById("current-time")
    if (timeElement) {
      timeElement.textContent = Utils.formatTime()
    }
  },
}

// Network Status Module
const NetworkStatus = {
  init() {
    window.addEventListener("online", this.handleOnline.bind(this))
    window.addEventListener("offline", this.handleOffline.bind(this))
    this.checkStatus()
  },

  handleOnline() {
    AppState.isOffline = false
    this.hideOfflineIndicator()
    // Refresh weather data when back online
    Weather.fetchWeatherData(AppState.currentLocationIndex)
  },

  handleOffline() {
    AppState.isOffline = true
    this.showOfflineIndicator()
  },

  checkStatus() {
    if (!Utils.isOnline()) {
      this.handleOffline()
    }
  },

  showOfflineIndicator() {
    const indicator = document.getElementById("offline-indicator")
    if (indicator) {
      indicator.style.display = "block"
    }
  },

  hideOfflineIndicator() {
    const indicator = document.getElementById("offline-indicator")
    if (indicator) {
      indicator.style.display = "none"
    }
  },
}

// App Initialization
const App = {
  init() {
    // Hide loading screen
    setTimeout(() => {
      document.getElementById("loading-screen").style.display = "none"
      document.getElementById("app").style.display = "block"
    }, 1000)

    // Initialize modules
    TouchHandler.init()
    ControlPanel.init()
    TimeManager.init()
    NetworkStatus.init()

    // Initialize weather view
    ViewManager.switchToWeather()
    Weather.updateLocationIndicators()
    Weather.fetchWeatherData(AppState.currentLocationIndex)

    // Set up auto-refresh for weather data
    setInterval(() => {
      if (AppState.currentView === "weather" && !AppState.isLoading) {
        Weather.fetchWeatherData(AppState.currentLocationIndex)
      }
    }, Config.weatherUpdateInterval)

    // Initialize lazy loading
    Utils.lazyLoadImages()

    console.log("Panel Sterowania initialized successfully")
  },
}

// Error Handler
window.addEventListener("error", (e) => {
  console.error("Application error:", e.error)
  // You can add error reporting here
})

// Unhandled promise rejection handler
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason)
  e.preventDefault()
})

// Initialize app when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", App.init)
} else {
  App.init()
}

// Export for debugging (optional)
if (typeof window !== "undefined") {
  window.PanelApp = {
    AppState,
    Config,
    Utils,
    Weather,
    ViewManager,
    ControlPanel,
  }
}
