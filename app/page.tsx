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
  ChevronLeft,
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
  Lightbulb,
  Power,
  Zap,
  Minus,
  Plus,
  Wifi,
  WifiOff,
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

// ── IR kody pilota ────────────────────────────────────────────────────────────
const IR_CODES: Record<string, number> = {
  ON:           0xFC03EF00,
  OFF:          0xFD02EF00,
  BRIGHTNESS_UP:0xFE01EF00,
  BRIGHTNESS_DOWN:0xFF00EF00,
  RED:          0xF807EF00,
  ORANGE:       0xF906EF00,
  YELLOW:       0xFA05EF00,
  WHITE:        0xFB04EF00,
  GREEN:        0xF40BEF00,
  TEAL:         0xF50AEF00,
  BLUE:         0xF609EF00,
  PURPLE:       0xF708EF00,
  PINK:         0xF00FEF00,
  WARM_WHITE:   0xF10EEF00,
  COOL_WHITE:   0xF20DEF00,
  LAVENDER:     0xF30CEF00,
  FLASH:        0xEC13EF00,
  STROBE:       0xED12EF00,
  FADE:         0xEE11EF00,
  SMOOTH:       0xEF10EF00,
  SPEED_UP:     0xE817EF00,
  SPEED_DOWN:   0xE916EF00,
  DIY1:         0xEA15EF00,
  DIY2:         0xEB14EF00,
}

// ── Typ widoku ────────────────────────────────────────────────────────────────
type View = "weather" | "control" | "led"

// ── Komponent LED ─────────────────────────────────────────────────────────────
function LEDPanel({ espIp, onBack }: { espIp: string; onBack: () => void }) {
  const [ledOn, setLedOn] = useState(true)
  const [activeColor, setActiveColor] = useState("WHITE")
  const [activeEffect, setActiveEffect] = useState<string | null>(null)
  const [brightness, setBrightness] = useState(50)
  const [sending, setSending] = useState(false)
  const [lastSent, setLastSent] = useState<string | null>(null)
  const [espOnline, setEspOnline] = useState<boolean | null>(null)

  // Sprawdź status ESP przy montowaniu
  useEffect(() => {
    if (!espIp) return
    fetch(`http://${espIp}/status`, { signal: AbortSignal.timeout(3000) })
      .then(r => r.ok ? setEspOnline(true) : setEspOnline(false))
      .catch(() => setEspOnline(false))
  }, [espIp])

  const sendIR = async (action: string) => {
    setSending(true)
    setLastSent(action)
    try {
      if (espIp) {
        await fetch(`http://${espIp}/ir`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: IR_CODES[action] }),
          signal: AbortSignal.timeout(3000),
        })
        setEspOnline(true)
      }
    } catch {
      setEspOnline(false)
    } finally {
      setSending(false)
    }
    if ("vibrate" in navigator) navigator.vibrate(40)
  }

  const handleColor = (color: string) => {
    setActiveColor(color)
    setActiveEffect(null)
    sendIR(color)
  }

  const handleEffect = (effect: string) => {
    setActiveEffect(effect)
    sendIR(effect)
  }

  const handleBrightness = (dir: "up" | "down") => {
    setBrightness(prev => Math.min(100, Math.max(0, prev + (dir === "up" ? 10 : -10))))
    sendIR(dir === "up" ? "BRIGHTNESS_UP" : "BRIGHTNESS_DOWN")
  }

  const colors = [
    { key: "RED",        label: "Czerwony",    bg: "bg-red-500",    ring: "ring-red-300" },
    { key: "ORANGE",     label: "Pomarańcz.",  bg: "bg-orange-400", ring: "ring-orange-300" },
    { key: "YELLOW",     label: "Żółty",       bg: "bg-yellow-400", ring: "ring-yellow-300" },
    { key: "WHITE",      label: "Biały",       bg: "bg-white border border-gray-300",      ring: "ring-gray-300" },
    { key: "GREEN",      label: "Zielony",     bg: "bg-green-500",  ring: "ring-green-300" },
    { key: "TEAL",       label: "Morski",      bg: "bg-teal-400",   ring: "ring-teal-300" },
    { key: "BLUE",       label: "Niebieski",   bg: "bg-blue-500",   ring: "ring-blue-300" },
    { key: "PURPLE",     label: "Fioletowy",   bg: "bg-purple-500", ring: "ring-purple-300" },
    { key: "PINK",       label: "Różowy",      bg: "bg-pink-400",   ring: "ring-pink-300" },
    { key: "WARM_WHITE", label: "Ciepła biel", bg: "bg-amber-200 border border-amber-300",  ring: "ring-amber-300" },
    { key: "COOL_WHITE", label: "Zimna biel",  bg: "bg-blue-100 border border-blue-200",   ring: "ring-blue-200" },
    { key: "LAVENDER",   label: "Lawendowy",   bg: "bg-purple-300", ring: "ring-purple-200" },
  ]

  const effects = [
    { key: "FLASH",  label: "Flash",  icon: "⚡" },
    { key: "STROBE", label: "Strobe", icon: "🔦" },
    { key: "FADE",   label: "Fade",   icon: "🌊" },
    { key: "SMOOTH", label: "Smooth", icon: "🌈" },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Panel</span>
        </button>
        <div className="flex items-center gap-2">
          <Lightbulb className={`w-5 h-5 ${ledOn ? "text-yellow-400" : "text-gray-600"}`} />
          <span className="text-white font-semibold text-lg">LED Strip</span>
        </div>
        <div className="flex items-center gap-1.5">
          {espOnline === true && <Wifi className="w-4 h-4 text-green-400" />}
          {espOnline === false && <WifiOff className="w-4 h-4 text-red-400" />}
          {espOnline === null && <div className="w-4 h-4 rounded-full border-2 border-gray-600 border-t-transparent animate-spin" />}
          <span className={`text-xs ${espOnline === true ? "text-green-400" : espOnline === false ? "text-red-400" : "text-gray-500"}`}>
            {espOnline === true ? "ESP OK" : espOnline === false ? "Brak" : "..."}
          </span>
        </div>
      </div>

      {/* ON / OFF + jasność */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => { setLedOn(true); sendIR("ON") }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
            ledOn ? "bg-yellow-400 text-gray-900 shadow-lg shadow-yellow-400/30" : "bg-gray-800 text-gray-400"
          }`}
        >
          <Power className="w-5 h-5" /> ON
        </button>
        <button
          onClick={() => { setLedOn(false); sendIR("OFF") }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all ${
            !ledOn ? "bg-gray-600 text-white shadow-lg" : "bg-gray-800 text-gray-400"
          }`}
        >
          <Power className="w-5 h-5" /> OFF
        </button>
      </div>

      {/* Jasność */}
      <div className="bg-gray-900 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400 text-sm font-medium">Jasność</span>
          <span className="text-white font-bold">{brightness}%</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleBrightness("down")}
            className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-gray-700 active:scale-95 transition-all"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gray-600 to-yellow-400 rounded-full transition-all duration-200"
              style={{ width: `${brightness}%` }}
            />
          </div>
          <button
            onClick={() => handleBrightness("up")}
            className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300 hover:bg-gray-700 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Kolory */}
      <div className="bg-gray-900 rounded-xl p-4">
        <span className="text-gray-400 text-sm font-medium block mb-3">Kolor</span>
        <div className="grid grid-cols-4 gap-3">
          {colors.map(c => (
            <button
              key={c.key}
              onClick={() => handleColor(c.key)}
              className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
                activeColor === c.key && !activeEffect ? "opacity-100" : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className={`w-12 h-12 rounded-full ${c.bg} transition-all ${
                activeColor === c.key && !activeEffect
                  ? `ring-2 ring-offset-2 ring-offset-gray-900 ${c.ring} scale-110`
                  : ""
              }`} />
              <span className="text-gray-400 text-xs text-center leading-tight">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Efekty */}
      <div className="bg-gray-900 rounded-xl p-4">
        <span className="text-gray-400 text-sm font-medium block mb-3">Efekty</span>
        <div className="grid grid-cols-4 gap-2">
          {effects.map(e => (
            <button
              key={e.key}
              onClick={() => handleEffect(e.key)}
              className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all active:scale-95 ${
                activeEffect === e.key
                  ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <span className="text-lg">{e.icon}</span>
              <span className="text-xs font-medium">{e.label}</span>
            </button>
          ))}
        </div>

        {/* Szybkość efektu */}
        {activeEffect && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-800">
            <span className="text-gray-500 text-xs">Szybkość</span>
            <button
              onClick={() => sendIR("SPEED_DOWN")}
              className="flex-1 py-2 bg-gray-800 rounded-lg text-gray-300 text-sm hover:bg-gray-700 active:scale-95 transition-all"
            >
              − Wolniej
            </button>
            <button
              onClick={() => sendIR("SPEED_UP")}
              className="flex-1 py-2 bg-gray-800 rounded-lg text-gray-300 text-sm hover:bg-gray-700 active:scale-95 transition-all"
            >
              + Szybciej
            </button>
          </div>
        )}
      </div>

      {/* Status wysyłania */}
      {sending && (
        <div className="text-center text-xs text-indigo-400 flex items-center justify-center gap-2">
          <Zap className="w-3 h-3 animate-pulse" />
          Wysyłam IR: {lastSent}
        </div>
      )}
      {!sending && lastSent && (
        <div className="text-center text-xs text-gray-600">Ostatnie: {lastSent}</div>
      )}
    </div>
  )
}

// ── Główny komponent ──────────────────────────────────────────────────────────
export default function MobileControlPanel() {
  const [view, setView] = useState<View>("weather")
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
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [gradientIndex, setGradientIndex] = useState(0)
  const [isSwipeInProgress, setIsSwipeInProgress] = useState(false)
  const [espIp, setEspIp] = useState("192.168.1.100") // ← zmień na IP swojego ESP32
  const weatherCardRef = useRef<HTMLDivElement>(null)
  const apiRateLimit = useRef(new APIRateLimit())

  const testGradients = [
    "from-blue-400 via-blue-600 to-blue-800",
    "from-yellow-300 via-orange-500 to-red-600",
    "from-slate-600 via-gray-700 to-slate-800",
    "from-slate-200 via-gray-100 to-slate-300",
    "from-slate-400 via-blue-600 to-gray-800",
    "from-slate-800 via-purple-900 to-gray-900",
    "from-gray-800 via-slate-900 to-black",
    "from-pink-500 via-rose-500 to-red-500",
    "from-green-500 via-emerald-500 to-teal-500",
    "from-purple-400 via-violet-600 to-indigo-800",
  ]

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const triggerHaptic = (pattern: number | number[] = 50) => {
    if ("vibrate" in navigator) navigator.vibrate(pattern)
  }

  const cycleGradient = () => {
    const nextIndex = (gradientIndex + 1) % testGradients.length
    setGradientIndex(nextIndex)
    setBackgroundGradient(testGradients[nextIndex])
    triggerHaptic([100, 50, 100])
  }

  const getBackgroundGradient = (weatherData: WeatherData | null): string => {
    if (!weatherData) return "from-blue-400 via-blue-600 to-blue-800"
    const currentHour = new Date().getHours()
    const isNight = currentHour < 6 || currentHour > 20
    const condition = weatherData.condition.toLowerCase()
    if (isNight) return "from-gray-800 via-slate-900 to-black"
    if (condition.includes("słonecznie") || condition.includes("bezchmurnie")) return "from-yellow-300 via-orange-500 to-red-600"
    if (condition.includes("deszcz") || condition.includes("mżawka") || condition.includes("opady")) return "from-slate-600 via-gray-700 to-slate-800"
    if (condition.includes("śnieg") || condition.includes("szron")) return "from-slate-200 via-gray-100 to-slate-300"
    if (condition.includes("pochmurno") || condition.includes("zachmurzenie")) return "from-slate-400 via-blue-600 to-gray-800"
    if (condition.includes("burza")) return "from-slate-800 via-purple-900 to-gray-900"
    return "from-blue-400 via-blue-600 to-blue-800"
  }

  useEffect(() => {
    if (weather && gradientIndex === 0) setBackgroundGradient(getBackgroundGradient(weather))
  }, [weather])

  const minSwipeDistance = 60
  const maxVerticalDeviation = 40
  const maxHorizontalDeviation = 40

  const onTouchStart = (e: React.TouchEvent) => {
    if (weatherCardRef.current && weatherCardRef.current.contains(e.target as Node)) return
    setTouchEnd(null)
    setIsSwipeInProgress(false)
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY })
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY })
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isSwipeInProgress) return
    setIsSwipeInProgress(true)
    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const absDistanceX = Math.abs(distanceX)
    const absDistanceY = Math.abs(distanceY)
    const isHorizontalSwipe = absDistanceX > minSwipeDistance && absDistanceY < maxVerticalDeviation
    const isVerticalSwipe = absDistanceY > minSwipeDistance && absDistanceX < maxHorizontalDeviation

    if (isHorizontalSwipe) {
      if (distanceX > 0) {
        // swipe left — idź w prawo w hierarchii widoków
        if (view === "weather") { triggerHaptic([50, 30, 50]); setView("control") }
        else if (view === "control") { triggerHaptic([50, 30, 50]); setView("led") }
      } else {
        // swipe right — wróć
        if (view === "led") { triggerHaptic([50, 30, 50]); setView("control") }
        else if (view === "control") { triggerHaptic([50, 30, 50]); setView("weather") }
      }
    } else if (isVerticalSwipe && view === "weather") {
      if (distanceY > 0) setCurrentLocationIndex((prev) => (prev - 1 + locations.length) % locations.length)
      else setCurrentLocationIndex((prev) => (prev + 1) % locations.length)
      triggerHaptic([30, 50, 30])
    }

    setTimeout(() => setIsSwipeInProgress(false), 300)
  }

  const getDayName = (dateString: string): string => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (date.toDateString() === today.toDateString()) return "Dziś"
    if (date.toDateString() === tomorrow.toDateString()) return "Jutro"
    return date.toLocaleDateString("pl-PL", { weekday: "short" })
  }

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
          humidity: Math.round(dailyData.relative_humidity_2m?.[i] || 60),
          uvIndex: Math.round(dailyData.uv_index_max[i] || 0),
        })
      }
    }
    return dailyForecast
  }

  const fetchWeatherData = async (locationIndex: number) => {
    setLoading(true)
    setApiError(null)
    const location = locations[locationIndex]
    if (!apiRateLimit.current.canMakeCall()) {
      const cachedData = getCachedWeatherData(location.locationKey)
      if (cachedData) { setWeather(cachedData); setLoading(false); return }
    }
    try {
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_1cm,soil_moisture_1_3cm,soil_moisture_3_9cm,soil_moisture_9_27cm,soil_moisture_27_81cm&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=auto&forecast_days=7`
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error(`API Error: ${response.status}`)
      const data = await response.json()
      apiRateLimit.current.recordCall()
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
        visibility: Math.round((data.hourly.visibility[0] || 10000) / 1000),
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
      setApiError(error instanceof Error ? error.message : "Błąd pobierania danych")
      setIsOnline(false)
      const cachedData = getCachedWeatherData(location.locationKey)
      setWeather(cachedData || staticWeatherData[location.locationKey] || staticWeatherData.wielun)
    } finally {
      setLoading(false)
    }
  }

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

  const formatTime = (isoString: string): string =>
    new Date(isoString).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })

  const formatTimestamp = (timestamp: number): string =>
    new Date(timestamp).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })

  const formatCurrentTime = (date: Date): string =>
    date.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })

  const cacheWeatherData = (locationKey: string, data: WeatherData) => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem(`weather_${locationKey}`, JSON.stringify({ data, timestamp: Date.now(), expires: Date.now() + 30 * 60 * 1000 }))
    } catch {}
  }

  const getCachedWeatherData = (locationKey: string): WeatherData | null => {
    if (typeof window === "undefined") return null
    try {
      const cached = localStorage.getItem(`weather_${locationKey}`)
      if (cached) {
        const cacheData = JSON.parse(cached)
        if (Date.now() < cacheData.expires) return cacheData.data
      }
    } catch {}
    return null
  }

  useEffect(() => { fetchWeatherData(currentLocationIndex) }, [currentLocationIndex])
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && apiRateLimit.current.canMakeCall()) fetchWeatherData(currentLocationIndex)
    }, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [currentLocationIndex])
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => { window.removeEventListener("online", handleOnline); window.removeEventListener("offline", handleOffline) }
  }, [])

  // ── Widok LED ────────────────────────────────────────────────────────────────
  if (view === "led") {
    return (
      <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        <LEDPanel espIp={espIp} onBack={() => setView("control")} />
      </div>
    )
  }

  // ── Widok panelu kontrolnego ─────────────────────────────────────────────────
  if (view === "control") {
    const controlButtons = [
      { id: 1, label: "Oświetlenie", sub: "Panel 1", color: "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700", textColor: "text-white" },
      { id: 2, label: "Temperatura",  sub: "Panel 2", color: "bg-red-500 hover:bg-red-600 active:bg-red-700",    textColor: "text-white" },
      { id: 3, label: "Bezpieczeństwo", sub: "Panel 3", color: "bg-blue-500 hover:bg-blue-600 active:bg-blue-700",  textColor: "text-white" },
      { id: 4, label: "System Audio", sub: "Panel 4", color: "bg-green-500 hover:bg-green-600 active:bg-green-700",textColor: "text-white" },
      { id: 5, label: "Wentylacja",   sub: "Panel 5", color: "bg-purple-500 hover:bg-purple-600 active:bg-purple-700", textColor: "text-white" },
      { id: 6, label: "LED Strip",    sub: "Otwórz →", color: "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600", textColor: "text-white", isLed: true },
    ]

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
              onClick={() => {
                triggerHaptic([100, 50, 100])
                if (button.isLed) setView("led")
              }}
            >
              <div className="text-center">
                {button.isLed && <Lightbulb className="w-6 h-6 mx-auto mb-1" />}
                <div className="text-lg mb-1">{button.label}</div>
                <div className="text-sm opacity-80">{button.sub}</div>
              </div>
            </Button>
          ))}
        </div>
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    )
  }

  // ── Widok pogody ─────────────────────────────────────────────────────────────
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

      {/* Widok indicator dots (pogoda / panel / led) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {(["weather","control","led"] as View[]).map(v => (
          <div key={v} className={`w-2 h-2 rounded-full transition-all ${view === v ? "bg-white" : "bg-white/30"}`} />
        ))}
      </div>

      {/* Connection status */}
      <div className="absolute top-3 left-3 z-10">
        <div className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${isOnline ? "bg-green-500/80 text-white" : "bg-red-500/80 text-white"}`}>
          {isOnline ? "ONLINE" : "OFFLINE"}
        </div>
      </div>

      {/* Current time */}
      <div className="absolute top-3 right-3 text-white/90 text-2xl font-bold z-10 bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
        {currentTime ? formatCurrentTime(currentTime) : "--:--"}
      </div>

      {/* Gradient test button */}
      <div className="absolute bottom-20 left-6 z-10">
        <button
          onClick={cycleGradient}
          className="bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm text-white/70 p-3 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg border border-white/20"
          title={`Test Gradient (${gradientIndex + 1}/${testGradients.length})`}
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
        style={{ colorScheme: "light" }}
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

              <div className="flex items-center justify-center gap-4 mb-3">
                {weather.minTemp !== undefined && (
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 border border-blue-300 shadow-sm">
                    <div className="flex flex-col items-center gap-1">
                      <TrendingDown className="w-6 h-6 text-blue-600" />
                      <span className="text-xl font-bold text-blue-700">{weather.minTemp}°</span>
                      <span className="text-sm text-blue-600 font-medium">Min</span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-6xl">{weather.icon}</span>
                  <span className="text-7xl font-bold text-gray-800">{weather.temperature}°C</span>
                </div>
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

              {((weather.hourlyForecast && weather.hourlyForecast.length > 0) ||
                (weather.dailyForecast && weather.dailyForecast.length > 0)) && (
                <div className="mt-3">
                  <div className="flex gap-2 justify-center mb-3">
                    {weather.hourlyForecast && weather.hourlyForecast.length > 0 && (
                      <button
                        onClick={() => { setShowHourlyForecast(!showHourlyForecast); if (!showHourlyForecast) setShowDailyForecast(false) }}
                        className={`flex items-center gap-2 text-base font-medium transition-colors px-4 py-2 rounded-lg border ${showHourlyForecast ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-700 border-gray-200 hover:text-blue-600"}`}
                      >
                        <Clock className="w-5 h-5" />
                        <span>24h</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${showHourlyForecast ? "rotate-180" : ""}`} />
                      </button>
                    )}
                    {weather.dailyForecast && weather.dailyForecast.length > 0 && (
                      <button
                        onClick={() => { setShowDailyForecast(!showDailyForecast); if (!showDailyForecast) setShowHourlyForecast(false) }}
                        className={`flex items-center gap-2 text-base font-medium transition-colors px-4 py-2 rounded-lg border ${showDailyForecast ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-gray-100 text-gray-700 border-gray-200 hover:text-blue-600"}`}
                      >
                        <Calendar className="w-5 h-5" />
                        <span>7 dni</span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${showDailyForecast ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {showHourlyForecast && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                    {weather.hourlyForecast.slice(0, 12).map((hour, index) => (
                      <div key={index} className="flex-shrink-0 bg-white rounded-lg p-3 text-sm shadow-sm border border-gray-100 min-w-[120px]">
                        <div className="text-center space-y-2">
                          <div className="font-medium text-gray-800">{hour.time}</div>
                          <div className="text-3xl">{hour.icon}</div>
                          <div className="font-bold text-gray-800">{hour.temperature}°C</div>
                          <div className="flex items-center justify-center gap-1 text-blue-600">
                            <Droplets className="w-4 h-4" /><span>{hour.humidity}%</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Navigation className="w-4 h-4" style={{ transform: `rotate(${hour.windDirection}deg)` }} />
                            <span>{hour.windSpeed}</span>
                          </div>
                          {hour.precipitation > 0 && <div className="text-blue-700 font-medium">{hour.precipitation.toFixed(1)}mm</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDailyForecast && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 mb-3">
                  <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "thin" }}>
                    {weather.dailyForecast.map((day, index) => (
                      <div key={index} className="flex-shrink-0 bg-white rounded-lg p-3 text-sm shadow-sm border border-gray-100 min-w-[140px]">
                        <div className="text-center space-y-2">
                          <div className="font-medium text-gray-800">{day.dayName}</div>
                          <div className="text-3xl">{day.icon}</div>
                          <div className="text-sm text-gray-600 mb-1">{day.condition}</div>
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex items-center gap-1 text-red-600"><TrendingUp className="w-4 h-4" /><span className="font-bold">{day.maxTemp}°</span></div>
                            <div className="flex items-center gap-1 text-blue-600"><TrendingDown className="w-4 h-4" /><span className="font-medium">{day.minTemp}°</span></div>
                          </div>
                          <div className="flex items-center justify-center gap-1 text-gray-600"><Wind className="w-4 h-4" /><span>{day.windSpeed} km/h</span></div>
                          {day.precipitation > 0 && <div className="text-blue-700 font-medium">{day.precipitation.toFixed(1)}mm</div>}
                          <div className="flex items-center justify-center gap-1 text-yellow-600"><Sun className="w-4 h-4" /><span>UV {day.uvIndex}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 mt-4 text-center">
                Aktualizacja: {formatTimestamp(weather.timestamp)}
              </div>
              {apiError && (
                <div className="text-sm text-red-600 bg-red-50 rounded p-3 mt-2 border border-red-200">
                  <strong>Błąd:</strong> {apiError}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-600 py-8">
              <p className="text-lg">Błąd ładowania pogody</p>
              <button onClick={() => fetchWeatherData(currentLocationIndex)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors">
                Spróbuj ponownie
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
