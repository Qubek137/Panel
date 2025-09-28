"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Droplets,
  Wind,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Sun,
  Sunset,
  Clock,
  Eye,
  Gauge,
  Thermometer,
  Navigation,
  Palette,
  Calendar,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import {
  locations,
  weatherCodeMap,
  staticWeatherData,
  APIRateLimit,
  type WeatherData,
  type HourlyWeather,
  type DailyWeather,
} from "@/lib/static-weather-data"

export default function MobileControlPanel() {
  const [showWeather, setShowWeather] = useState(true)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [showHourlyForecast, setShowHourlyForecast] = useState(false)
  const [showDailyForecast, setShowDailyForecast] = useState(false)
  const [backgroundGradient, setBackgroundGradient] = useState("from-blue-400 via-blue-600 to-blue-800")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [gradientIndex, setGradientIndex] = useState(0)
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false)
  const weatherCardRef = useRef<HTMLDivElement>(null)
  const apiRateLimit = useRef(new APIRateLimit())

  // Test gradients array with improved contrast
  const testGradients = [
    "from-blue-400 via-blue-600 to-blue-800", // Default blue - improved contrast
    "from-yellow-300 via-orange-500 to-red-600", // Sunny - more vibrant
    "from-slate-600 via-gray-700 to-slate-800", // Rainy
    "from-slate-200 via-gray-100 to-slate-300", // Snowy
    "from-slate-400 via-blue-600 to-gray-800", // Cloudy - better contrast
    "from-slate-800 via-purple-900 to-gray-900", // Thunderstorm
    "from-gray-800 via-slate-900 to-black", // Night - improved contrast
    "from-pink-500 via-rose-500 to-red-500", // Test pink
    "from-green-500 via-emerald-500 to-teal-500", // Test green
    "from-purple-400 via-violet-600 to-indigo-800", // Test purple - better contrast
  ]

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  // Haptic feedback function
  const triggerHaptic = (pattern: number | number[] = 50) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Test function to cycle through gradients
  const cycleGradient = () => {
    const nextIndex = (gradientIndex + 1) % testGradients.length
    setGradientIndex(nextIndex)
    setBackgroundGradient(testGradients[nextIndex])
    triggerHaptic([100, 50, 100])
    console.log(`Gradient changed to: ${testGradients[nextIndex]} (${nextIndex + 1}/${testGradients.length})`)
  }

  // Get background gradient based on weather conditions and time
  const getBackgroundGradient = (weatherData: WeatherData | null): string => {
    if (!weatherData) return "from-blue-400 via-blue-600 to-blue-800"

    const currentHour = new Date().getHours()
    const isNight = currentHour < 6 || currentHour > 20
    const condition = weatherData.condition.toLowerCase()

    // Night time - dark gradient with better contrast
    if (isNight) {
      return "from-gray-800 via-slate-900 to-black"
    }

    // Sunny conditions - more vibrant gradient
    if (condition.includes("słonecznie") || condition.includes("bezchmurnie")) {
      return "from-yellow-300 via-orange-500 to-red-600"
    }

    // Rain conditions - dark gray gradient
    if (condition.includes("deszcz") || condition.includes("mżawka") || condition.includes("opady")) {
      return "from-slate-600 via-gray-700 to-slate-800"
    }

    // Snow conditions - light gray/white gradient
    if (condition.includes("śnieg") || condition.includes("szron")) {
      return "from-slate-200 via-gray-100 to-slate-300"
    }

    // Cloudy conditions - better contrast
    if (condition.includes("pochmurno") || condition.includes("zachmurzenie")) {
      return "from-slate-400 via-blue-600 to-gray-800"
    }

    // Thunderstorm - dramatic dark gradient
    if (condition.includes("burza")) {
      return "from-slate-800 via-purple-900 to-gray-900"
    }

    // Default enhanced blue gradient with better contrast
    return "from-blue-400 via-blue-600 to-blue-800"
  }

  // Update background when weather changes (but not when manually cycling)
  useEffect(() => {
    if (weather && gradientIndex === 0) {
      const newGradient = getBackgroundGradient(weather)
      setBackgroundGradient(newGradient)
    }
  }, [weather])

  // Improved swipe detection with better separation
  const minSwipeDistance = 60 // Increased for better detection
  const maxVerticalDeviation = 40 // Maximum vertical movement for horizontal swipe
  const maxHorizontalDeviation = 40 // Maximum horizontal movement for vertical swipe

  const onTouchStart = (e: React.TouchEvent) => {
    // Prevent if touch starts on the weather card
    if (weatherCardRef.current && weatherCardRef.current.contains(e.target as Node)) {
      return
    }

    setTouchEnd(null)
    setIsSwipeInProgress(false)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return

    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isSwipeInProgress) return

    setIsSwipeInProgress(true)

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const absDistanceX = Math.abs(distanceX)
    const absDistanceY = Math.abs(distanceY)

    // Determine if it's a horizontal or vertical swipe with stricter criteria
    const isHorizontalSwipe = absDistanceX > minSwipeDistance && absDistanceY < maxVerticalDeviation
    const isVerticalSwipe = absDistanceY > minSwipeDistance && absDistanceX < maxHorizontalDeviation

    if (isHorizontalSwipe) {
      const isLeftSwipe = distanceX > minSwipeDistance
      const isRightSwipe = distanceX < -minSwipeDistance

      if (isLeftSwipe && showWeather) {
        triggerHaptic([50, 30, 50])
        setShowWeather(false)
      }
      if (isRightSwipe && !showWeather) {
        triggerHaptic([50, 30, 50])
        setShowWeather(true)
      }
    } else if (isVerticalSwipe && showWeather) {
      const isUpSwipe = distanceY > minSwipeDistance
      const isDownSwipe = distanceY < -minSwipeDistance

      if (isUpSwipe) {
        setCurrentLocationIndex((prev) => (prev - 1 + locations.length) % locations.length)
        triggerHaptic([30, 50, 30])
      }
      if (isDownSwipe) {
        setCurrentLocationIndex((prev) => (prev + 1) % locations.length)
        triggerHaptic([30, 50, 30])
      }
    }

    // Reset swipe state after a delay
    setTimeout(() => {
      setIsSwipeInProgress(false)
    }, 300)
  }

  // Get day name from date string
  const getDayName = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Dziś"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Jutro"
    } else {
      return date.toLocaleDateString("pl-PL", { weekday: "short" })
    }
  }

  // Process daily forecast data
  const processDailyData = (dailyData: any): DailyWeather[] => {
    const dailyForecast = []

    for (let i = 0; i < 7; i++) {
      if (i < dailyData.time.length) {
        const weatherCode = dailyData.weather_code[i] || 0
        const date = dailyData.time[i]

        dailyForecast.push({
          date,
          dayName: getDayName(date),
          maxTemp: Math.round(dailyData.temperature_2m_max[i]),
          minTemp: Math.round(dailyData.temperature_2m_min[i]),
          weatherCode,
          icon: weatherCodeMap[weatherCode]?.icon || "❓",
          condition: weatherCodeMap[weatherCode]?.condition || "Nieznane",
          sunrise: formatTime(dailyData.sunrise[i]),
          sunset: formatTime(dailyData.sunset[i]),
          precipitation: dailyData.precipitation_sum[i] || 0,
          windSpeed: Math.round(dailyData.wind_speed_10m_max[i] || 0),
          humidity: Math.round(dailyData.relative_humidity_2m?.[i] || 60), // Fallback value
          uvIndex: Math.round(dailyData.uv_index_max[i] || 0),
        })
      }
    }

    return dailyForecast
  }

  // Fetch weather data from Open-Meteo API with enhanced parameters
  const fetchWeatherData = async (locationIndex: number) => {
    setLoading(true)
    setApiError(null)

    const location = locations[locationIndex]

    // Check if we can make API call
    if (!apiRateLimit.current.canMakeCall()) {
      console.warn("API rate limit reached, using cached data")
      const cachedData = getCachedWeatherData(location.locationKey)
      if (cachedData) {
        setWeather(cachedData)
        setLoading(false)
        return
      }
    }

    try {
      // Enhanced API call with more parameters
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_1cm,soil_moisture_1_3cm,soil_moisture_3_9cm,soil_moisture_9_27cm,soil_moisture_27_81cm&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=auto&forecast_days=7`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      apiRateLimit.current.recordCall()

      // Process API response with enhanced data
      const weatherData: WeatherData = {
        location: location.name,
        temperature: Math.round(data.current.temperature_2m),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        condition: weatherCodeMap[data.current.weather_code]?.condition || "Nieznane",
        description: weatherCodeMap[data.current.weather_code]?.description || "brak danych",
        icon: weatherCodeMap[data.current.weather_code]?.icon || "❓",
        timestamp: Date.now(),
        sunrise: formatTime(data.daily.sunrise[0]),
        sunset: formatTime(data.daily.sunset[0]),
        pressure: Math.round(data.current.pressure_msl || data.current.surface_pressure),
        visibility: Math.round((data.hourly.visibility[0] || 10000) / 1000), // Convert to km
        uvIndex: Math.round(data.daily.uv_index_max[0] || 0),
        feelsLike: Math.round(data.current.apparent_temperature),
        dewPoint: Math.round(data.hourly.dew_point_2m[0] || 0),
        minTemp: Math.round(data.daily.temperature_2m_min[0]),
        maxTemp: Math.round(data.daily.temperature_2m_max[0]),
        hourlyForecast: processHourlyData(data.hourly),
        dailyForecast: processDailyData(data.daily),
      }

      setWeather(weatherData)
      cacheWeatherData(location.locationKey, weatherData)
      setIsOnline(true)
    } catch (error) {
      console.error("Weather API Error:", error)
      setApiError(error instanceof Error ? error.message : "Błąd pobierania danych")
      setIsOnline(false)

      // Fallback to cached or static data
      const cachedData = getCachedWeatherData(location.locationKey)
      if (cachedData) {
        setWeather(cachedData)
      } else {
        setWeather(staticWeatherData[location.locationKey] || staticWeatherData.wielun)
      }
    } finally {
      setLoading(false)
    }
  }

  // Process hourly forecast data with enhanced parameters
  const processHourlyData = (hourlyData: any): HourlyWeather[] => {
    const next24Hours = []
    const currentHour = new Date().getHours()

    for (let i = 0; i < 24; i++) {
      const hourIndex = currentHour + i
      if (hourIndex < hourlyData.time.length) {
        const weatherCode = hourlyData.weather_code[hourIndex] || 0
        next24Hours.push({
          time: formatTime(hourlyData.time[hourIndex]),
          temperature: Math.round(hourlyData.temperature_2m[hourIndex]),
          humidity: hourlyData.relative_humidity_2m[hourIndex],
          precipitation: hourlyData.precipitation[hourIndex] || 0,
          windSpeed: Math.round(hourlyData.wind_speed_10m[hourIndex] || 0),
          windDirection: hourlyData.wind_direction_10m[hourIndex] || 0,
          pressure: Math.round(hourlyData.pressure_msl[hourIndex] || hourlyData.surface_pressure[hourIndex] || 1013),
          visibility: Math.round((hourlyData.visibility[hourIndex] || 10000) / 1000),
          weatherCode,
          icon: weatherCodeMap[weatherCode]?.icon || "❓",
          condition: weatherCodeMap[weatherCode]?.condition || "Nieznane",
        })
      }
    }

    return next24Hours
  }

  // Format ISO time to HH:MM
  const formatTime = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format timestamp without seconds
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format current time
  const formatCurrentTime = (date: Date): string => {
    return date.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Cache management
  const cacheWeatherData = (locationKey: string, data: WeatherData) => {
    if (typeof window === "undefined") return

    try {
      const cacheKey = `weather_${locationKey}`
      const cacheData = {
        data,
        timestamp: Date.now(),
        expires: Date.now() + 30 * 60 * 1000, // 30 minutes
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn("Failed to cache weather data:", error)
    }
  }

  const getCachedWeatherData = (locationKey: string): WeatherData | null => {
    if (typeof window === "undefined") return null

    try {
      const cacheKey = `weather_${locationKey}`
      const cached = localStorage.getItem(cacheKey)

      if (cached) {
        const cacheData = JSON.parse(cached)
        if (Date.now() < cacheData.expires) {
          return cacheData.data
        }
      }
    } catch (error) {
      console.warn("Failed to get cached weather data:", error)
    }

    return null
  }

  // Fetch weather data when location changes
  useEffect(() => {
    fetchWeatherData(currentLocationIndex)
  }, [currentLocationIndex])

  // Auto-refresh every 10 minutes (to stay under API limits)
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!document.hidden && apiRateLimit.current.canMakeCall()) {
          fetchWeatherData(currentLocationIndex)
        }
      },
      10 * 60 * 1000,
    ) // 10 minutes

    return () => clearInterval(interval)
  }, [currentLocationIndex])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const controlButtons = [
    {
      id: 1,
      label: "Oświetlenie",
      color: "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700",
      textColor: "text-white",
    },
    {
      id: 2,
      label: "Temperatura",
      color: "bg-red-500 hover:bg-red-600 active:bg-red-700",
      textColor: "text-white",
    },
    {
      id: 3,
      label: "Bezpieczeństwo",
      color: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",
      textColor: "text-white",
    },
    {
      id: 4,
      label: "System Audio",
      color: "bg-green-500 hover:bg-green-600 active:bg-green-700",
      textColor: "text-white",
    },
    {
      id: 5,
      label: "Wentylacja",
      color: "bg-purple-500 hover:bg-purple-600 active:bg-purple-700",
      textColor: "text-white",
    },
    {
      id: 6,
      label: "Test Gradient",
      color:
        "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 active:from-pink-700 active:to-purple-700",
      textColor: "text-white",
      isGradientTest: true,
    },
  ]

  const handleControlButtonClick = (button: any) => {
    triggerHaptic([100, 50, 100])

    if (button.isGradientTest) {
      cycleGradient()
    } else {
      console.log(`${button.label} pressed`)
    }

    const buttonElement = document.querySelector(`[data-button-id="${button.id}"]`)
    if (buttonElement) {
      buttonElement.classList.add("animate-pulse")
      setTimeout(() => {
        buttonElement.classList.remove("animate-pulse")
      }, 1000)
    }
  }

  if (showWeather) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${backgroundGradient} p-3 flex items-center justify-center relative overflow-hidden mobile-container transition-all duration-1000 ease-in-out`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Location indicators */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {locations.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentLocationIndex ? "bg-white shadow-lg" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Connection status */}
        <div className="absolute top-3 left-3 z-10">
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              isOnline ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
            }`}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </div>
        </div>

        {/* Current time - increased by 80% */}
        <div className="absolute top-3 right-3 text-white/90 text-2xl font-bold z-10 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
          {formatCurrentTime(currentTime)}
        </div>

        {/* Gradient test button - moved closer to center but still on side */}
        <div className="absolute bottom-20 left-6 z-10">
          <button
            onClick={cycleGradient}
            className="bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm text-white/70 p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border border-white/20"
            title={`Test Gradient Colors (${gradientIndex + 1}/${testGradients.length})`}
          >
            <Palette className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation arrows */}
        <div className="absolute left-1/2 top-14 transform -translate-x-1/2 text-white/70 z-10">
          <ChevronUp className="w-6 h-6 drop-shadow-lg" />
        </div>
        <div className="absolute left-1/2 bottom-14 transform -translate-x-1/2 text-white/70 z-10">
          <ChevronDown className="w-6 h-6 drop-shadow-lg" />
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 z-10">
          <ChevronRight className="w-6 h-6 drop-shadow-lg" />
        </div>

        <Card
          ref={weatherCardRef}
          className="w-full max-w-2xl bg-white shadow-2xl mx-2 weather-card max-h-[90vh] overflow-y-auto"
          style={{ colorScheme: "light" }} // Force light mode for the card
        >
          <CardContent className="p-3 bg-white">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-base">Pobieranie danych...</p>
              </div>
            ) : weather ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-gray-700 mb-6">
                  <MapPin className="w-6 h-6" />
                  <span className="text-2xl font-medium">{weather.location}</span>
                </div>

                {/* Current temperature with min/max on sides */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  {/* Min temperature table */}
                  {weather.minTemp !== undefined && (
                    <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 border border-blue-300 shadow-sm">
                      <div className="flex flex-col items-center gap-1">
                        <TrendingDown className="w-6 h-6 text-blue-600" />
                        <span className="text-xl font-bold text-blue-700">{weather.minTemp}°</span>
                        <span className="text-sm text-blue-600 font-medium">Min</span>
                      </div>
                    </div>
                  )}

                  {/* Current temperature in center */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-6xl">{weather.icon}</span>
                    <span className="text-7xl font-bold text-gray-800">{weather.temperature}°C</span>
                  </div>

                  {/* Max temperature table */}
                  {weather.maxTemp !== undefined && (
                    <div className="bg-gradient-to-br from-red-100 to-red-200 rounded-lg p-3 border border-red-300 shadow-sm">
                      <div className="flex flex-col items-center gap-1">
                        <TrendingUp className="w-6 h-6 text-red-600" />
                        <span className="text-xl font-bold text-red-700">{weather.maxTemp}°</span>
                        <span className="text-sm text-red-600 font-medium">Max</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-2xl text-gray-700 font-medium">{weather.condition}</p>
                  <p className="text-lg text-gray-600 capitalize">{weather.description}</p>
                </div>

                {/* Enhanced weather parameters with 3 columns */}
                <div className="grid grid-cols-3 gap-3 text-xl mb-3">
                  <div className="flex items-center gap-2 justify-center bg-blue-100 rounded-lg p-4 border border-blue-200">
                    <Droplets className="w-7 h-7 text-blue-600" />
                    <span className="text-gray-800 font-bold">{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center bg-gray-100 rounded-lg p-4 border border-gray-200">
                    <Wind className="w-7 h-7 text-gray-600" />
                    <span className="text-gray-800 font-bold">{weather.windSpeed} km/h</span>
                  </div>
                  {weather.feelsLike && (
                    <div className="flex items-center gap-2 justify-center bg-orange-100 rounded-lg p-4 border border-orange-200">
                      <Thermometer className="w-7 h-7 text-orange-600" />
                      <span className="text-gray-800 font-bold">{weather.feelsLike}°C</span>
                    </div>
                  )}
                  {weather.pressure && (
                    <div className="flex items-center gap-2 justify-center bg-purple-100 rounded-lg p-4 border border-purple-200">
                      <Gauge className="w-7 h-7 text-purple-600" />
                      <span className="text-gray-800 font-bold">{weather.pressure} hPa</span>
                    </div>
                  )}
                  {weather.visibility && (
                    <div className="flex items-center gap-2 justify-center bg-green-100 rounded-lg p-4 border border-green-200">
                      <Eye className="w-7 h-7 text-green-600" />
                      <span className="text-gray-800 font-bold">{weather.visibility} km</span>
                    </div>
                  )}
                  {weather.uvIndex !== undefined && (
                    <div className="flex items-center gap-2 justify-center bg-yellow-100 rounded-lg p-4 border border-yellow-200">
                      <Sun className="w-7 h-7 text-yellow-600" />
                      <span className="text-gray-800 font-bold">UV {weather.uvIndex}</span>
                    </div>
                  )}
                </div>

                {/* Sunrise/Sunset with improved styling */}
                {weather.sunrise && weather.sunset && (
                  <div className="grid grid-cols-2 gap-4 text-xl mb-3 bg-gradient-to-r from-orange-100 to-blue-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center gap-2 justify-center">
                      <Sun className="w-7 h-7 text-yellow-600" />
                      <span className="text-gray-800 font-bold">{weather.sunrise}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Sunset className="w-7 h-7 text-orange-600" />
                      <span className="text-gray-800 font-bold">{weather.sunset}</span>
                    </div>
                  </div>
                )}

                {/* Toggle forecast buttons side by side */}
                {((weather.hourlyForecast && weather.hourlyForecast.length > 0) ||
                  (weather.dailyForecast && weather.dailyForecast.length > 0)) && (
                  <div className="mt-3">
                    <div className="flex gap-2 justify-center mb-3">
                      {weather.hourlyForecast && weather.hourlyForecast.length > 0 && (
                        <button
                          onClick={() => {
                            setShowHourlyForecast(!showHourlyForecast)
                            if (!showHourlyForecast) setShowDailyForecast(false)
                          }}
                          className={`flex items-center gap-2 text-base font-medium transition-colors px-4 py-2 rounded-lg border ${
                            showHourlyForecast
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:text-blue-600"
                          }`}
                        >
                          <Clock className="w-5 h-5" />
                          <span>24h</span>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${showHourlyForecast ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                      {weather.dailyForecast && weather.dailyForecast.length > 0 && (
                        <button
                          onClick={() => {
                            setShowDailyForecast(!showDailyForecast)
                            if (!showDailyForecast) setShowHourlyForecast(false)
                          }}
                          className={`flex items-center gap-2 text-base font-medium transition-colors px-4 py-2 rounded-lg border ${
                            showDailyForecast
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:text-blue-600"
                          }`}
                        >
                          <Calendar className="w-5 h-5" />
                          <span>7 dni</span>
                          <ChevronDown
                            className={`w-5 h-5 transition-transform ${showDailyForecast ? "rotate-180" : ""}`}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Hourly forecast */}
                {showHourlyForecast && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                    {/* Horizontal scrollable forecast */}
                    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                      {weather.hourlyForecast.slice(0, 12).map((hour, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 bg-white rounded-lg p-3 text-sm shadow-sm border border-gray-100 min-w-[120px]"
                        >
                          <div className="text-center space-y-2">
                            <div className="font-medium text-gray-800">{hour.time}</div>
                            <div className="text-3xl" title={hour.condition}>
                              {hour.icon}
                            </div>
                            <div className="font-bold text-gray-800">{hour.temperature}°C</div>
                            <div className="flex items-center justify-center gap-1 text-blue-600">
                              <Droplets className="w-4 h-4" />
                              <span>{hour.humidity}%</span>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Navigation
                                className="w-4 h-4"
                                style={{ transform: `rotate(${hour.windDirection}deg)` }}
                              />
                              <span>{hour.windSpeed}</span>
                            </div>
                            {hour.precipitation > 0 && (
                              <div className="text-blue-700 font-medium">{hour.precipitation.toFixed(1)}mm</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Daily forecast */}
                {showDailyForecast && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                    {/* Horizontal scrollable daily forecast */}
                    <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                      {weather.dailyForecast.map((day, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 bg-white rounded-lg p-3 text-sm shadow-sm border border-gray-100 min-w-[140px]"
                        >
                          <div className="text-center space-y-2">
                            <div className="font-medium text-gray-800">{day.dayName}</div>
                            <div className="text-3xl" title={day.condition}>
                              {day.icon}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">{day.condition}</div>
                            <div className="flex items-center justify-center gap-2">
                              <div className="flex items-center gap-1 text-red-600">
                                <TrendingUp className="w-4 h-4" />
                                <span className="font-bold">{day.maxTemp}°</span>
                              </div>
                              <div className="flex items-center gap-1 text-blue-600">
                                <TrendingDown className="w-4 h-4" />
                                <span className="font-medium">{day.minTemp}°</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-gray-600">
                              <Wind className="w-4 h-4" />
                              <span>{day.windSpeed} km/h</span>
                            </div>
                            {day.precipitation > 0 && (
                              <div className="text-blue-700 font-medium">{day.precipitation.toFixed(1)}mm</div>
                            )}
                            <div className="flex items-center justify-center gap-1 text-yellow-600">
                              <Sun className="w-4 h-4" />
                              <span>UV {day.uvIndex}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp without frame - small text at bottom */}
                <div className="text-sm text-gray-500 mt-4 text-center">
                  Aktualizacja: {formatTimestamp(weather.timestamp)}
                </div>

                {/* Error message */}
                {apiError && (
                  <div className="text-sm text-red-600 bg-red-50 rounded p-3 mt-2 border border-red-200">
                    <strong>Błąd:</strong> {apiError}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                <p className="text-lg">Błąd ładowania pogody</p>
                <button
                  onClick={() => fetchWeatherData(currentLocationIndex)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
                >
                  Spróbuj ponownie
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gray-900 p-4 relative overflow-hidden mobile-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="h-full grid grid-cols-2 grid-rows-3 gap-4 control-grid">
        {controlButtons.map((button) => (
          <Button
            key={button.id}
            data-button-id={button.id}
            className={`${button.color} ${button.textColor} h-full text-base font-semibold rounded-lg shadow-md transition-all duration-150 transform hover:scale-105 active:scale-95 border border-white/20 animate-button control-button`}
            onClick={() => handleControlButtonClick(button)}
          >
            <div className="text-center">
              <div className="text-lg mb-1">
                {button.isGradientTest && <Palette className="w-5 h-5 mx-auto mb-1" />}
                {button.label}
              </div>
              <div className="text-sm opacity-80">
                {button.isGradientTest ? `Gradient ${gradientIndex + 1}/${testGradients.length}` : `Panel ${button.id}`}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Arrow indicator for going back to weather */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
        <ArrowLeft className="w-5 h-5" />
      </div>
    </div>
  )
}
