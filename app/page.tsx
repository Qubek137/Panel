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
} from "lucide-react"
import {
  locations,
  weatherCodeMap,
  staticWeatherData,
  APIRateLimit,
  type WeatherData,
  type HourlyWeather,
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
  const [backgroundGradient, setBackgroundGradient] = useState("from-blue-500 via-blue-600 to-blue-700")
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherCardRef = useRef<HTMLDivElement>(null)
  const apiRateLimit = useRef(new APIRateLimit())

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

  // Get background gradient based on weather conditions and time
  const getBackgroundGradient = (weatherData: WeatherData | null): string => {
    if (!weatherData) return "from-blue-500 via-blue-600 to-blue-700"

    const currentHour = new Date().getHours()
    const isNight = currentHour < 6 || currentHour > 20
    const condition = weatherData.condition.toLowerCase()

    // Night time - dark gradient
    if (isNight) {
      return "from-gray-900 via-slate-900 to-black"
    }

    // Sunny conditions - bright yellow/orange gradient
    if (condition.includes("słonecznie") || condition.includes("bezchmurnie")) {
      return "from-yellow-400 via-amber-500 to-orange-500"
    }

    // Rain conditions - dark gray gradient
    if (condition.includes("deszcz") || condition.includes("mżawka") || condition.includes("opady")) {
      return "from-slate-600 via-gray-700 to-slate-800"
    }

    // Snow conditions - light gray/white gradient
    if (condition.includes("śnieg") || condition.includes("szron")) {
      return "from-slate-200 via-gray-100 to-slate-300"
    }

    // Cloudy conditions - blue-gray gradient
    if (condition.includes("pochmurno") || condition.includes("zachmurzenie")) {
      return "from-slate-500 via-blue-500 to-gray-600"
    }

    // Thunderstorm - dramatic dark gradient
    if (condition.includes("burza")) {
      return "from-slate-800 via-purple-900 to-gray-900"
    }

    // Default enhanced blue gradient
    return "from-blue-500 via-blue-600 to-blue-700"
  }

  // Update background when weather changes
  useEffect(() => {
    if (weather) {
      const newGradient = getBackgroundGradient(weather)
      setBackgroundGradient(newGradient)
    }
  }, [weather])

  // Swipe detection
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)

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
    } else {
      if (showWeather) {
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
    }
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
        hourlyForecast: processHourlyData(data.hourly),
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
      label: "Alarm",
      color: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
      textColor: "text-white",
    },
  ]

  const handleControlButtonClick = (button: any) => {
    triggerHaptic([100, 50, 100])
    console.log(`${button.label} pressed`)

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
        className={`min-h-screen bg-gradient-to-br ${backgroundGradient} p-4 flex items-center justify-center relative overflow-hidden mobile-container transition-all duration-1000 ease-in-out`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Location indicators */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
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
        <div className="absolute top-4 left-4 z-10">
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
              isOnline ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"
            }`}
          >
            {isOnline ? "ONLINE" : "OFFLINE"}
          </div>
        </div>

        {/* Current time */}
        <div className="absolute top-4 right-4 text-white/90 text-lg font-bold z-10 bg-black/20 px-3 py-2 rounded-full backdrop-blur-sm">
          {formatCurrentTime(currentTime)}
        </div>

        {/* Navigation arrows */}
        <div className="absolute left-1/2 top-12 transform -translate-x-1/2 text-white/70 z-10">
          <ChevronUp className="w-5 h-5 drop-shadow-lg" />
        </div>
        <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 text-white/70 z-10">
          <ChevronDown className="w-5 h-5 drop-shadow-lg" />
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 z-10">
          <ChevronRight className="w-5 h-5 drop-shadow-lg" />
        </div>

        <Card
          ref={weatherCardRef}
          className="w-full max-w-sm bg-white/95 backdrop-blur-sm shadow-2xl mx-4 weather-card max-h-[90vh] overflow-y-auto"
        >
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-base">Pobieranie danych...</p>
              </div>
            ) : weather ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg font-medium">{weather.location}</span>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-4xl">{weather.icon}</span>
                  <span className="text-5xl font-bold text-gray-800">{weather.temperature}°C</span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xl text-gray-700 font-medium">{weather.condition}</p>
                  <p className="text-base text-gray-600 capitalize">{weather.description}</p>
                </div>

                {/* Enhanced weather parameters */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="flex items-center gap-2 justify-center bg-blue-50 rounded-lg p-2">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center bg-gray-50 rounded-lg p-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                  {weather.feelsLike && (
                    <div className="flex items-center gap-2 justify-center bg-orange-50 rounded-lg p-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span>{weather.feelsLike}°C</span>
                    </div>
                  )}
                  {weather.pressure && (
                    <div className="flex items-center gap-2 justify-center bg-purple-50 rounded-lg p-2">
                      <Gauge className="w-4 h-4 text-purple-500" />
                      <span>{weather.pressure} hPa</span>
                    </div>
                  )}
                  {weather.visibility && (
                    <div className="flex items-center gap-2 justify-center bg-green-50 rounded-lg p-2">
                      <Eye className="w-4 h-4 text-green-500" />
                      <span>{weather.visibility} km</span>
                    </div>
                  )}
                  {weather.uvIndex !== undefined && (
                    <div className="flex items-center gap-2 justify-center bg-yellow-50 rounded-lg p-2">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span>UV {weather.uvIndex}</span>
                    </div>
                  )}
                </div>

                {/* Sunrise/Sunset */}
                {weather.sunrise && weather.sunset && (
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-gradient-to-r from-orange-50 to-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 justify-center">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <span>{weather.sunrise}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Sunset className="w-4 h-4 text-orange-500" />
                      <span>{weather.sunset}</span>
                    </div>
                  </div>
                )}

                {/* Toggle hourly forecast */}
                {weather.hourlyForecast && weather.hourlyForecast.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowHourlyForecast(!showHourlyForecast)}
                      className="flex items-center gap-2 mb-2 mx-auto text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Prognoza 24h</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${showHourlyForecast ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showHourlyForecast && (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {weather.hourlyForecast.slice(0, 12).map((hour, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium min-w-[40px]">{hour.time}</span>
                              <span className="text-lg" title={hour.condition}>
                                {hour.icon}
                              </span>
                              <span className="text-xs text-gray-500 hidden sm:block">{hour.condition}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-800">{hour.temperature}°C</span>
                              <div className="flex items-center gap-1 text-blue-500">
                                <Droplets className="w-3 h-3" />
                                <span>{hour.humidity}%</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-500">
                                <Navigation
                                  className="w-3 h-3"
                                  style={{ transform: `rotate(${hour.windDirection}deg)` }}
                                />
                                <span>{hour.windSpeed}</span>
                              </div>
                              {hour.precipitation > 0 && (
                                <span className="text-blue-600 font-medium">{hour.precipitation.toFixed(1)}mm</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Error message */}
                {apiError && (
                  <div className="text-xs text-red-500 bg-red-50 rounded p-2 mt-2 border border-red-200">
                    {apiError}
                  </div>
                )}

                {/* Timestamp without seconds */}
                <div className="text-xs text-gray-400 mt-4">
                  Ostatnia aktualizacja: {formatTimestamp(weather.timestamp)}
                </div>
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
              <div className="text-lg mb-1">{button.label}</div>
              <div className="text-sm opacity-80">Panel {button.id}</div>
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
