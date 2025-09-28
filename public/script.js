// Weather App with Enhanced Real API Integration
class WeatherApp {
  constructor() {
    // Location data matching the API coordinates
    this.locations = [
      { name: "Konopnica", key: "konopnica", lat: 51.221, lon: 18.5696 },
      { name: "Warszawa", key: "warszawa", lat: 52.2298, lon: 21.0118 },
      { name: "Wieluń", key: "wielun", lat: 51.3538, lon: 18.8236 },
    ]

    // Weather code mapping for Open-Meteo API
    this.weatherCodes = {
      0: { condition: "Słonecznie", description: "bezchmurne niebo", icon: "☀️" },
      1: { condition: "Przeważnie słonecznie", description: "głównie bezchmurnie", icon: "🌤️" },
      2: { condition: "Częściowo pochmurno", description: "częściowe zachmurzenie", icon: "⛅" },
      3: { condition: "Pochmurno", description: "zachmurzenie", icon: "☁️" },
      45: { condition: "Mgła", description: "mgła", icon: "🌫️" },
      48: { condition: "Szron", description: "osadzający się szron", icon: "🌫️" },
      51: { condition: "Mżawka", description: "lekka mżawka", icon: "🌦️" },
      53: { condition: "Mżawka", description: "umiarkowana mżawka", icon: "🌦️" },
      55: { condition: "Mżawka", description: "gęsta mżawka", icon: "🌦️" },
      61: { condition: "Deszcz", description: "lekki deszcz", icon: "🌧️" },
      63: { condition: "Deszcz", description: "umiarkowany deszcz", icon: "🌧️" },
      65: { condition: "Deszcz", description: "silny deszcz", icon: "🌧️" },
      71: { condition: "Śnieg", description: "lekki śnieg", icon: "❄️" },
      73: { condition: "Śnieg", description: "umiarkowany śnieg", icon: "❄️" },
      75: { condition: "Śnieg", description: "silny śnieg", icon: "❄️" },
      80: { condition: "Przelotne opady", description: "przelotne opady deszczu", icon: "🌦️" },
      81: { condition: "Przelotne opady", description: "umiarkowane przelotne opady", icon: "🌦️" },
      82: { condition: "Przelotne opady", description: "silne przelotne opady", icon: "🌦️" },
      85: { condition: "Przelotny śnieg", description: "lekki przelotny śnieg", icon: "🌨️" },
      86: { condition: "Przelotny śnieg", description: "silny przelotny śnieg", icon: "🌨️" },
      95: { condition: "Burza", description: "burza z piorunami", icon: "⛈️" },
      96: { condition: "Burza z gradem", description: "burza z lekkim gradem", icon: "⛈️" },
      99: { condition: "Burza z gradem", description: "burza z silnym gradem", icon: "⛈️" },
    }

    // App state
    this.currentView = "weather" // 'weather' or 'control'
    this.currentLocationIndex = 0
    this.isLoading = true
    this.apiCalls = Number.parseInt(localStorage.getItem("api_calls") || "0")
    this.lastApiReset = Number.parseInt(localStorage.getItem("api_last_reset") || Date.now().toString())
    this.maxApiCalls = 9000 // Stay under 10000 limit
    this.isOnline = navigator.onLine

    // Touch handling
    this.touchStart = null
    this.touchEnd = null
    this.minSwipeDistance = 50

    // Elements
    this.elements = {}

    this.init()
  }

  init() {
    this.cacheElements()
    this.setupEventListeners()
    this.checkApiRateLimit()
    this.showWeatherView()
    this.fetchWeatherData()
    this.setupAutoRefresh()
    this.updateCurrentTime()
    this.hideLoadingScreen()
  }

  cacheElements() {
    this.elements = {
      loadingScreen: document.getElementById("loading-screen"),
      weatherView: document.getElementById("weather-view"),
      controlView: document.getElementById("control-view"),
      weatherLoading: document.getElementById("weather-loading"),
      weatherData: document.getElementById("weather-data"),
      weatherError: document.getElementById("weather-error"),
      locationName: document.getElementById("location-name"),
      weatherIcon: document.getElementById("weather-icon"),
      temperature: document.getElementById("temperature"),
      condition: document.getElementById("condition"),
      description: document.getElementById("description"),
      humidity: document.getElementById("humidity"),
      windSpeed: document.getElementById("wind-speed"),
      sunrise: document.getElementById("sunrise"),
      sunset: document.getElementById("sunset"),
      pressure: document.getElementById("pressure"),
      visibility: document.getElementById("visibility"),
      uvIndex: document.getElementById("uv-index"),
      feelsLike: document.getElementById("feels-like"),
      dewPoint: document.getElementById("dew-point"),
      hourlyList: document.getElementById("hourly-list"),
      dailyList: document.getElementById("daily-list"),
      lastUpdate: document.getElementById("last-update"),
      apiError: document.getElementById("api-error"),
      retryWeather: document.getElementById("retry-weather"),
      connectionStatus: document.getElementById("connection-status"),
      statusText: document.getElementById("status-text"),
      currentTimeDisplay: document.getElementById("current-time"),
      indicators: document.querySelectorAll(".indicator"),
      controlButtons: document.querySelectorAll(".control-button"),
    }
  }

  setupEventListeners() {
    // Touch events for swiping
    document.addEventListener("touchstart", this.handleTouchStart.bind(this), { passive: true })
    document.addEventListener("touchmove", this.handleTouchMove.bind(this), { passive: true })
    document.addEventListener("touchend", this.handleTouchEnd.bind(this), { passive: true })

    // Control buttons
    this.elements.controlButtons.forEach((button) => {
      button.addEventListener("click", this.handleControlClick.bind(this))
    })

    // Retry button
    if (this.elements.retryWeather) {
      this.elements.retryWeather.addEventListener("click", () => {
        this.fetchWeatherData()
      })
    }

    // Online/offline detection
    window.addEventListener("online", () => {
      this.isOnline = true
      this.updateConnectionStatus()
      this.fetchWeatherData()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
      this.updateConnectionStatus()
    })

    // Visibility change for auto-refresh
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.canMakeApiCall()) {
        this.fetchWeatherData()
      }
    })
  }

  handleTouchStart(e) {
    this.touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    this.touchEnd = null
  }

  handleTouchMove(e) {
    this.touchEnd = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }

  handleTouchEnd() {
    if (!this.touchStart || !this.touchEnd) return

    const distanceX = this.touchStart.x - this.touchEnd.x
    const distanceY = this.touchStart.y - this.touchEnd.y
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)

    if (isHorizontalSwipe) {
      const isLeftSwipe = distanceX > this.minSwipeDistance
      const isRightSwipe = distanceX < -this.minSwipeDistance

      if (isLeftSwipe && this.currentView === "weather") {
        this.triggerHaptic([50, 30, 50])
        this.showControlView()
      }
      if (isRightSwipe && this.currentView === "control") {
        this.triggerHaptic([50, 30, 50])
        this.showWeatherView()
      }
    } else {
      if (this.currentView === "weather") {
        const isUpSwipe = distanceY > this.minSwipeDistance
        const isDownSwipe = distanceY < -this.minSwipeDistance

        if (isUpSwipe) {
          this.currentLocationIndex = (this.currentLocationIndex - 1 + this.locations.length) % this.locations.length
          this.triggerHaptic([30, 50, 30])
          this.updateLocationIndicators()
          this.fetchWeatherData()
        }
        if (isDownSwipe) {
          this.currentLocationIndex = (this.currentLocationIndex + 1) % this.locations.length
          this.triggerHaptic([30, 50, 30])
          this.updateLocationIndicators()
          this.fetchWeatherData()
        }
      }
    }
  }

  handleControlClick(e) {
    const button = e.currentTarget
    const buttonId = button.dataset.id

    this.triggerHaptic([100, 50, 100])

    // Visual feedback
    button.style.transform = "scale(0.95)"
    setTimeout(() => {
      button.style.transform = ""
    }, 150)

    console.log(`Control button ${buttonId} pressed`)
  }

  triggerHaptic(pattern = 50) {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  showWeatherView() {
    this.currentView = "weather"
    this.elements.weatherView.classList.remove("hidden")
    this.elements.controlView.classList.add("hidden")
  }

  showControlView() {
    this.currentView = "control"
    this.elements.controlView.classList.remove("hidden")
    this.elements.weatherView.classList.add("hidden")
  }

  updateLocationIndicators() {
    this.elements.indicators.forEach((indicator, index) => {
      if (index === this.currentLocationIndex) {
        indicator.classList.add("active")
      } else {
        indicator.classList.remove("active")
      }
    })
  }

  updateCurrentTime() {
    const updateTime = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })

      if (this.elements.currentTimeDisplay) {
        this.elements.currentTimeDisplay.textContent = timeString
      }
    }

    // Update immediately
    updateTime()

    // Update every minute
    setInterval(updateTime, 60000)
  }

  checkApiRateLimit() {
    const now = Date.now()
    const dayInMs = 24 * 60 * 60 * 1000

    // Reset counter if more than 24 hours have passed
    if (now - this.lastApiReset > dayInMs) {
      this.apiCalls = 0
      this.lastApiReset = now
      localStorage.setItem("api_calls", "0")
      localStorage.setItem("api_last_reset", now.toString())
    }
  }

  canMakeApiCall() {
    return this.isOnline && this.apiCalls < this.maxApiCalls
  }

  recordApiCall() {
    this.apiCalls++
    localStorage.setItem("api_calls", this.apiCalls.toString())
  }

  updateConnectionStatus() {
    if (this.elements.connectionStatus) {
      if (this.isOnline) {
        this.elements.connectionStatus.classList.remove("offline")
        this.elements.connectionStatus.classList.add("online")
      } else {
        this.elements.connectionStatus.classList.remove("online")
        this.elements.connectionStatus.classList.add("offline")
      }
    }

    if (this.elements.statusText) {
      this.elements.statusText.textContent = this.isOnline ? "ONLINE" : "OFFLINE"
    }
  }

  async fetchWeatherData() {
    const location = this.locations[this.currentLocationIndex]

    this.showWeatherLoading()
    this.hideApiError()

    // Try to get cached data first
    const cachedData = this.getCachedWeatherData(location.key)
    if (cachedData && !this.canMakeApiCall()) {
      this.displayWeatherData(cachedData)
      this.showApiError("Używam danych z cache - limit API osiągnięty")
      return
    }

    if (!this.canMakeApiCall()) {
      this.displayWeatherData(this.getFallbackData(location))
      this.showApiError("Limit API osiągnięty - używam danych offline")
      return
    }

    try {
      // Enhanced API call with more parameters
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_1cm,soil_moisture_1_3cm,soil_moisture_3_9cm,soil_moisture_9_27cm,soil_moisture_27_81cm&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=auto&forecast_days=7`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      this.recordApiCall()

      const weatherData = this.processApiData(data, location)
      this.displayWeatherData(weatherData)
      this.cacheWeatherData(location.key, weatherData)
    } catch (error) {
      console.error("Weather API Error:", error)

      // Try cached data
      const cachedData = this.getCachedWeatherData(location.key)
      if (cachedData) {
        this.displayWeatherData(cachedData)
        this.showApiError("Błąd API - używam danych z cache")
      } else {
        this.displayWeatherData(this.getFallbackData(location))
        this.showApiError("Błąd API - używam danych offline")
      }
    }
  }

  processApiData(data, location) {
    const current = data.current
    const daily = data.daily
    const hourly = data.hourly

    const weatherCode = current.weather_code
    const weatherInfo = this.weatherCodes[weatherCode] || {
      condition: "Nieznane",
      description: "brak danych",
      icon: "❓",
    }

    // Process hourly forecast for next 24 hours
    const currentHour = new Date().getHours()
    const hourlyForecast = []

    for (let i = 0; i < 24; i++) {
      const hourIndex = currentHour + i
      if (hourIndex < hourly.time.length) {
        const hourWeatherCode = hourly.weather_code[hourIndex]
        const hourWeatherInfo = this.weatherCodes[hourWeatherCode] || {
          condition: "Nieznane",
          description: "brak danych",
          icon: "❓",
        }

        hourlyForecast.push({
          time: this.formatTime(hourly.time[hourIndex]),
          temperature: Math.round(hourly.temperature_2m[hourIndex]),
          humidity: hourly.relative_humidity_2m[hourIndex],
          precipitation: Math.round((hourly.precipitation[hourIndex] || 0) * 10) / 10,
          windSpeed: Math.round(hourly.wind_speed_10m[hourIndex] || 0),
          windDirection: hourly.wind_direction_10m[hourIndex] || 0,
          pressure: Math.round(hourly.pressure_msl[hourIndex] || 0),
          visibility: Math.round((hourly.visibility[hourIndex] || 0) / 1000),
          weatherCode: hourWeatherCode,
          icon: hourWeatherInfo.icon,
          condition: hourWeatherInfo.condition,
        })
      }
    }

    // Process daily forecast for next 7 days
    const dailyForecast = []
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const dayWeatherCode = daily.weather_code[i]
      const dayWeatherInfo = this.weatherCodes[dayWeatherCode] || {
        condition: "Nieznane",
        description: "brak danych",
        icon: "❓",
      }

      dailyForecast.push({
        date: this.formatDate(daily.time[i]),
        maxTemp: Math.round(daily.temperature_2m_max[i]),
        minTemp: Math.round(daily.temperature_2m_min[i]),
        weatherCode: dayWeatherCode,
        icon: dayWeatherInfo.icon,
        condition: dayWeatherInfo.condition,
        sunrise: this.formatTime(daily.sunrise[i]),
        sunset: this.formatTime(daily.sunset[i]),
        precipitation: Math.round((daily.precipitation_sum[i] || 0) * 10) / 10,
        windSpeed: Math.round(daily.wind_speed_10m_max[i] || 0),
        uvIndex: Math.round(daily.uv_index_max[i] || 0),
      })
    }

    return {
      location: location.name,
      temperature: Math.round(current.temperature_2m),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      windDirection: current.wind_direction_10m,
      condition: weatherInfo.condition,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      sunrise: this.formatTime(daily.sunrise[0]),
      sunset: this.formatTime(daily.sunset[0]),
      pressure: Math.round(current.pressure_msl || current.surface_pressure),
      visibility: Math.round((hourly.visibility[currentHour] || 10000) / 1000),
      uvIndex: Math.round(daily.uv_index_max[0] || 0),
      feelsLike: Math.round(current.apparent_temperature),
      dewPoint: Math.round(hourly.dew_point_2m[currentHour] || 0),
      cloudCover: current.cloud_cover || 0,
      precipitation: Math.round((current.precipitation || 0) * 10) / 10,
      hourlyForecast: hourlyForecast,
      dailyForecast: dailyForecast,
      timestamp: Date.now(),
    }
  }

  formatTime(isoString) {
    return new Date(isoString).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  formatDate(isoString) {
    return new Date(isoString).toLocaleDateString("pl-PL", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  getWindDirection(degrees) {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
    ]
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  displayWeatherData(weatherData) {
    // Basic weather info
    if (this.elements.locationName) {
      this.elements.locationName.textContent = weatherData.location
    }

    if (this.elements.weatherIcon) {
      this.elements.weatherIcon.textContent = weatherData.icon
    }

    if (this.elements.temperature) {
      this.elements.temperature.textContent = `${weatherData.temperature}°C`
    }

    if (this.elements.condition) {
      this.elements.condition.textContent = weatherData.condition
    }

    if (this.elements.description) {
      this.elements.description.textContent = weatherData.description
    }

    if (this.elements.humidity) {
      this.elements.humidity.textContent = `${weatherData.humidity}%`
    }

    if (this.elements.windSpeed) {
      const windDir = weatherData.windDirection ? this.getWindDirection(weatherData.windDirection) : ""
      this.elements.windSpeed.textContent = `${weatherData.windSpeed} km/h ${windDir}`.trim()
    }

    // Sun times
    if (this.elements.sunrise && weatherData.sunrise) {
      this.elements.sunrise.textContent = weatherData.sunrise
    }

    if (this.elements.sunset && weatherData.sunset) {
      this.elements.sunset.textContent = weatherData.sunset
    }

    // Extended weather details
    if (this.elements.pressure && weatherData.pressure) {
      this.elements.pressure.textContent = `${weatherData.pressure} hPa`
    }

    if (this.elements.visibility && weatherData.visibility) {
      this.elements.visibility.textContent = `${weatherData.visibility} km`
    }

    if (this.elements.uvIndex && weatherData.uvIndex !== undefined) {
      this.elements.uvIndex.textContent = weatherData.uvIndex.toString()
    }

    if (this.elements.feelsLike && weatherData.feelsLike) {
      this.elements.feelsLike.textContent = `${weatherData.feelsLike}°C`
    }

    if (this.elements.dewPoint && weatherData.dewPoint) {
      this.elements.dewPoint.textContent = `${weatherData.dewPoint}°C`
    }

    // Display hourly forecast (next 12 hours)
    if (this.elements.hourlyList && weatherData.hourlyForecast) {
      this.elements.hourlyList.innerHTML = ""
      weatherData.hourlyForecast.slice(0, 12).forEach((hour) => {
        const hourElement = document.createElement("div")
        hourElement.className = "hourly-item"
        hourElement.innerHTML = `
          <div class="hourly-time">${hour.time}</div>
          <div class="hourly-icon">${hour.icon}</div>
          <div class="hourly-temp">${hour.temperature}°</div>
          <div class="hourly-humidity">${hour.humidity}%</div>
          <div class="hourly-condition">${hour.condition}</div>
          <div class="hourly-wind">${hour.windSpeed} km/h</div>
        `
        this.elements.hourlyList.appendChild(hourElement)
      })
    }

    // Display daily forecast
    if (this.elements.dailyList && weatherData.dailyForecast) {
      this.elements.dailyList.innerHTML = ""
      weatherData.dailyForecast.forEach((day) => {
        const dayElement = document.createElement("div")
        dayElement.className = "daily-item"
        dayElement.innerHTML = `
          <div class="daily-date">${day.date}</div>
          <div class="daily-weather">
            <div class="daily-icon">${day.icon}</div>
            <div class="daily-condition">${day.condition}</div>
          </div>
          <div class="daily-temps">
            <span class="daily-max">${day.maxTemp}°</span>
            <span class="daily-min">${day.minTemp}°</span>
          </div>
        `
        this.elements.dailyList.appendChild(dayElement)
      })
    }

    if (this.elements.lastUpdate) {
      // Format time without seconds
      const timeString = new Date(weatherData.timestamp).toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      })
      this.elements.lastUpdate.textContent = `Ostatnia aktualizacja: ${timeString}`
    }

    this.showWeatherData()
  }

  showWeatherLoading() {
    if (this.elements.weatherLoading) {
      this.elements.weatherLoading.classList.remove("hidden")
    }
    if (this.elements.weatherData) {
      this.elements.weatherData.classList.add("hidden")
    }
    if (this.elements.weatherError) {
      this.elements.weatherError.classList.add("hidden")
    }
  }

  showWeatherData() {
    if (this.elements.weatherLoading) {
      this.elements.weatherLoading.classList.add("hidden")
    }
    if (this.elements.weatherData) {
      this.elements.weatherData.classList.remove("hidden")
    }
    if (this.elements.weatherError) {
      this.elements.weatherError.classList.add("hidden")
    }
  }

  showWeatherError() {
    if (this.elements.weatherLoading) {
      this.elements.weatherLoading.classList.add("hidden")
    }
    if (this.elements.weatherData) {
      this.elements.weatherData.classList.add("hidden")
    }
    if (this.elements.weatherError) {
      this.elements.weatherError.classList.remove("hidden")
    }
  }

  showApiError(message) {
    if (this.elements.apiError) {
      this.elements.apiError.textContent = message
      this.elements.apiError.classList.remove("hidden")
    }
  }

  hideApiError() {
    if (this.elements.apiError) {
      this.elements.apiError.classList.add("hidden")
    }
  }

  cacheWeatherData(locationKey, data) {
    const cacheKey = `weather_${locationKey}`
    const cacheData = {
      data: data,
      timestamp: Date.now(),
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  }

  getCachedWeatherData(locationKey) {
    const cacheKey = `weather_${locationKey}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      try {
        const cacheData = JSON.parse(cached)
        if (Date.now() < cacheData.expires) {
          return cacheData.data
        }
      } catch (e) {
        console.error("Error parsing cached data:", e)
      }
    }

    return null
  }

  getFallbackData(location) {
    // Enhanced static fallback data
    const fallbackData = {
      konopnica: {
        location: "Konopnica",
        temperature: 18,
        humidity: 65,
        windSpeed: 12,
        windDirection: 225,
        condition: "Słonecznie",
        description: "bezchmurne niebo",
        icon: "☀️",
        sunrise: "06:30",
        sunset: "19:45",
        pressure: 1013,
        visibility: 10,
        uvIndex: 5,
        feelsLike: 20,
        dewPoint: 12,
        cloudCover: 15,
        precipitation: 0,
        hourlyForecast: this.generateFallbackHourlyData(),
        dailyForecast: this.generateFallbackDailyData(),
        timestamp: Date.now(),
      },
      warszawa: {
        location: "Warszawa",
        temperature: 20,
        humidity: 58,
        windSpeed: 8,
        windDirection: 180,
        condition: "Częściowo pochmurno",
        description: "częściowe zachmurzenie",
        icon: "⛅",
        sunrise: "06:25",
        sunset: "19:50",
        pressure: 1015,
        visibility: 8,
        uvIndex: 4,
        feelsLike: 22,
        dewPoint: 10,
        cloudCover: 45,
        precipitation: 0,
        hourlyForecast: this.generateFallbackHourlyData(),
        dailyForecast: this.generateFallbackDailyData(),
        timestamp: Date.now(),
      },
      wielun: {
        location: "Wieluń",
        temperature: 16,
        humidity: 72,
        windSpeed: 15,
        windDirection: 270,
        condition: "Pochmurno",
        description: "zachmurzenie",
        icon: "☁️",
        sunrise: "06:35",
        sunset: "19:40",
        pressure: 1010,
        visibility: 6,
        uvIndex: 2,
        feelsLike: 14,
        dewPoint: 11,
        cloudCover: 85,
        precipitation: 0.2,
        hourlyForecast: this.generateFallbackHourlyData(),
        dailyForecast: this.generateFallbackDailyData(),
        timestamp: Date.now(),
      },
    }

    return fallbackData[location.key] || fallbackData.wielun
  }

  generateFallbackHourlyData() {
    const hours = []
    const baseTemp = 18
    const currentHour = new Date().getHours()

    for (let i = 0; i < 12; i++) {
      const hour = (currentHour + i) % 24
      const temp = baseTemp + Math.sin(((hour - 6) * Math.PI) / 12) * 5

      hours.push({
        time: `${hour.toString().padStart(2, "0")}:00`,
        temperature: Math.round(temp),
        humidity: 60 + Math.random() * 20,
        precipitation: Math.random() * 0.5,
        windSpeed: 8 + Math.random() * 10,
        windDirection: Math.random() * 360,
        pressure: 1010 + Math.random() * 10,
        visibility: 8 + Math.random() * 4,
        weatherCode: hour > 6 && hour < 19 ? 1 : 2,
        icon: hour > 6 && hour < 19 ? "🌤️" : "⛅",
        condition: hour > 6 && hour < 19 ? "Słonecznie" : "Pochmurno",
      })
    }

    return hours
  }

  generateFallbackDailyData() {
    const days = []
    const dayNames = ["Dzisiaj", "Jutro", "Śro", "Czw", "Pią", "Sob", "Nie"]
    const icons = ["☀️", "⛅", "☁️", "🌧️", "🌤️", "⛅", "☀️"]
    const conditions = [
      "Słonecznie",
      "Częściowo pochmurno",
      "Pochmurno",
      "Deszcz",
      "Słonecznie",
      "Częściowo pochmurno",
      "Słonecznie",
    ]

    for (let i = 0; i < 7; i++) {
      const maxTemp = 18 + Math.random() * 8
      const minTemp = maxTemp - 5 - Math.random() * 5

      days.push({
        date: dayNames[i] || `Dzień ${i + 1}`,
        maxTemp: Math.round(maxTemp),
        minTemp: Math.round(minTemp),
        weatherCode: i,
        icon: icons[i],
        condition: conditions[i],
        sunrise: "06:30",
        sunset: "19:45",
        precipitation: Math.random() * 2,
        windSpeed: 8 + Math.random() * 12,
        uvIndex: Math.round(Math.random() * 8),
      })
    }

    return days
  }

  setupAutoRefresh() {
    // Refresh every 10 minutes if we can make API calls
    setInterval(
      () => {
        if (!document.hidden && this.canMakeApiCall()) {
          this.fetchWeatherData()
        }
      },
      10 * 60 * 1000,
    ) // 10 minutes
  }

  hideLoadingScreen() {
    setTimeout(() => {
      if (this.elements.loadingScreen) {
        this.elements.loadingScreen.style.opacity = "0"
        setTimeout(() => {
          this.elements.loadingScreen.style.display = "none"
        }, 300)
      }
    }, 2000)
  }
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.weatherApp = new WeatherApp()

  // Service Worker registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration)

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content is available, refresh the page
                if (confirm("Nowa wersja aplikacji jest dostępna. Odświeżyć?")) {
                  window.location.reload()
                }
              }
            })
          })
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError)
        })
    })
  }

  // PWA install prompt
  let deferredPrompt
  const installButton = document.getElementById("install-button")

  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("PWA install prompt triggered")
    e.preventDefault()
    deferredPrompt = e

    if (installButton) {
      installButton.style.display = "block"
    }
  })

  if (installButton) {
    installButton.addEventListener("click", () => {
      if (deferredPrompt) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then((choiceResult) => {
          console.log(`PWA install outcome: ${choiceResult.outcome}`)
          deferredPrompt = null
          installButton.style.display = "none"
        })
      }
    })
  }

  // Handle app installed
  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed")
    if (installButton) {
      installButton.style.display = "none"
    }
  })

  // Background sync for weather data
  function requestBackgroundSync() {
    if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready
        .then((registration) => {
          return registration.sync.register("weather-sync")
        })
        .catch((error) => {
          console.error("Background sync registration failed:", error)
        })
    }
  }

  // Request sync every 30 minutes
  setInterval(requestBackgroundSync, 30 * 60 * 1000)

  // Push notifications setup
  async function setupPushNotifications() {
    if ("Notification" in window && "serviceWorker" in navigator) {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        console.log("Notification permission granted")

        // Subscribe to push notifications
        navigator.serviceWorker.ready
          .then((registration) => {
            return registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: null, // Add your VAPID key here
            })
          })
          .then((subscription) => {
            console.log("Push subscription:", subscription)
            // Send subscription to server
          })
          .catch((error) => {
            console.error("Push subscription failed:", error)
          })
      }
    }
  }

  // Initialize push notifications after user interaction
  document.addEventListener("click", setupPushNotifications, { once: true })

  // Performance monitoring
  function logPerformance() {
    if ("performance" in window) {
      window.addEventListener("load", () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType("navigation")[0]
          console.log("Performance metrics:", {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByType("paint").find((entry) => entry.name === "first-paint")?.startTime,
            firstContentfulPaint: performance
              .getEntriesByType("paint")
              .find((entry) => entry.name === "first-contentful-paint")?.startTime,
          })
        }, 0)
      })
    }
  }

  logPerformance()

  // Viewport height fix for mobile
  function setViewportHeight() {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty("--vh", `${vh}px`)
  }

  window.addEventListener("resize", setViewportHeight)
  setViewportHeight()

  // Touch event optimization
  document.addEventListener("touchstart", () => {}, { passive: true })
  document.addEventListener("touchmove", () => {}, { passive: true })

  // Prevent zoom on double tap
  let lastTouchEnd = 0
  document.addEventListener(
    "touchend",
    (event) => {
      const now = new Date().getTime()
      if (now - lastTouchEnd <= 300) {
        event.preventDefault()
      }
      lastTouchEnd = now
    },
    false,
  )
})

// Global error handling
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error)
})

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason)
  event.preventDefault()
})
