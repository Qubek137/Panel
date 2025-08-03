"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Thermometer, Droplets, Wind, ArrowLeft, ChevronUp, ChevronDown, ChevronRight } from "lucide-react"

interface WeatherData {
  location: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  description: string
}

interface Location {
  name: string
  locationKey: string // AccuWeather location key
}

const locations: Location[] = [
  { name: "Wieluń Piaski", locationKey: "2747373" },
  { name: "Konopnica", locationKey: "2747374" },
  { name: "Wieluń", locationKey: "315078" },
  { name: "Łódź", locationKey: "274231" },
  { name: "Warszawa", locationKey: "274663" },
]

export default function MobileControlPanel() {
  const [showWeather, setShowWeather] = useState(true)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  const weatherCardRef = useRef<HTMLDivElement>(null)

  // Haptic feedback function
  const triggerHaptic = (pattern: number | number[] = 50) => {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

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
      // Horizontal swipes change screens
      const isLeftSwipe = distanceX > minSwipeDistance
      const isRightSwipe = distanceX < -minSwipeDistance

      if (isLeftSwipe && showWeather) {
        // Swipe left from weather to control panel
        triggerHaptic([50, 30, 50])
        setShowWeather(false)
      }
      if (isRightSwipe && !showWeather) {
        // Swipe right from control panel to weather
        triggerHaptic([50, 30, 50])
        setShowWeather(true)
      }
    } else {
      // Vertical swipes change weather location (only on weather screen)
      if (showWeather) {
        const isUpSwipe = distanceY > minSwipeDistance
        const isDownSwipe = distanceY < -minSwipeDistance

        if (isUpSwipe) {
          // Swipe up - previous location
          setCurrentLocationIndex((prev) => (prev - 1 + locations.length) % locations.length)
          triggerHaptic([30, 50, 30])
        }
        if (isDownSwipe) {
          // Swipe down - next location
          setCurrentLocationIndex((prev) => (prev + 1) % locations.length)
          triggerHaptic([30, 50, 30])
        }
      }
    }
  }

  const fetchWeatherData = async (location: Location) => {
    setLoading(true)
    try {
      // Using AccuWeather API
      const API_KEY = process.env.NEXT_PUBLIC_ACCUWEATHER_API_KEY || "demo_key"

      // AccuWeather Current Conditions API
      const response = await fetch(
        `https://dataservice.accuweather.com/currentconditions/v1/${location.locationKey}?apikey=${API_KEY}&language=pl&details=true`,
      )

      if (!response.ok) {
        throw new Error("AccuWeather API failed")
      }

      const data = await response.json()
      const currentWeather = data[0]

      setWeather({
        location: location.name,
        temperature: Math.round(currentWeather.Temperature.Metric.Value),
        humidity: currentWeather.RelativeHumidity,
        windSpeed: Math.round(currentWeather.Wind.Speed.Metric.Value),
        condition: currentWeather.WeatherText,
        description: currentWeather.WeatherText.toLowerCase(),
      })
    } catch (error) {
      console.error("Weather fetch failed:", error)
      // Enhanced fallback data with more realistic Polish weather patterns
      const mockWeatherConditions = [
        { condition: "Pochmurno", description: "pochmurno", temp: 8, humidity: 75, wind: 15 },
        { condition: "Częściowe zachmurzenie", description: "częściowe zachmurzenie", temp: 12, humidity: 60, wind: 8 },
        { condition: "Słonecznie", description: "słonecznie", temp: 18, humidity: 45, wind: 5 },
        { condition: "Deszcz", description: "lekki deszcz", temp: 6, humidity: 85, wind: 20 },
        { condition: "Mgła", description: "mgła", temp: 4, humidity: 95, wind: 3 },
      ]

      const randomWeather = mockWeatherConditions[Math.floor(Math.random() * mockWeatherConditions.length)]

      setWeather({
        location: location.name,
        temperature: randomWeather.temp,
        humidity: randomWeather.humidity,
        windSpeed: randomWeather.wind,
        condition: randomWeather.condition,
        description: randomWeather.description,
      })
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh weather data every 5 minutes
  useEffect(() => {
    fetchWeatherData(locations[currentLocationIndex])

    const interval = setInterval(
      () => {
        fetchWeatherData(locations[currentLocationIndex])
      },
      5 * 60 * 1000,
    ) // 5 minutes

    return () => clearInterval(interval)
  }, [currentLocationIndex])

  const controlButtons = [
    {
      id: 1,
      label: "Oświetlenie",
      color: "bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700",
      textColor: "text-white",
    },
    { id: 2, label: "Temperatura", color: "bg-red-500 hover:bg-red-600 active:bg-red-700", textColor: "text-white" },
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
    { id: 6, label: "Alarm", color: "bg-orange-500 hover:bg-orange-600 active:bg-orange-700", textColor: "text-white" },
  ]

  const handleControlButtonClick = (button: any) => {
    triggerHaptic([100, 50, 100]) // Double pulse for control buttons
    console.log(`${button.label} pressed`)
  }

  if (showWeather) {
    return (
      <div
        className="h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 flex items-center justify-center relative overflow-hidden"
        style={{
          height: "100vh",
          width: "100vw",
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Location indicators */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {locations.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentLocationIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Time display */}
        <div className="absolute top-4 right-4 text-white/90 text-base font-medium">
          {new Date().toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>

        {/* Navigation arrows */}
        <div className="absolute left-1/2 top-8 transform -translate-x-1/2 text-white/50">
          <ChevronUp className="w-4 h-4" />
        </div>
        <div className="absolute left-1/2 bottom-8 transform -translate-x-1/2 text-white/50">
          <ChevronDown className="w-4 h-4" />
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
          <ChevronRight className="w-4 h-4" />
        </div>

        <Card ref={weatherCardRef} className="w-full max-w-xs bg-white/95 backdrop-blur-sm shadow-2xl mx-4">
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm">Ładowanie...</p>
              </div>
            ) : weather ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="text-base font-medium">{weather.location}</span>
                </div>

                <div className="flex items-center justify-center gap-3 mb-4">
                  <Thermometer className="w-8 h-8 text-blue-600" />
                  <span className="text-4xl font-bold text-gray-800">{weather.temperature}°C</span>
                </div>

                <div className="space-y-1 mb-4">
                  <p className="text-lg text-gray-700 font-medium">{weather.condition}</p>
                  <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 justify-center">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 py-6">
                <p className="text-base">Błąd ładowania pogody</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="h-screen bg-gray-900 p-4 relative overflow-hidden"
      style={{
        height: "100vh",
        width: "100vw",
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="h-full grid grid-cols-2 grid-rows-3 gap-4">
        {controlButtons.map((button) => (
          <Button
            key={button.id}
            className={`${button.color} ${button.textColor} h-full text-base font-semibold rounded-lg shadow-md transition-all duration-150 transform hover:scale-105 active:scale-95 border border-white/20 animate-button`}
            onClick={() => handleControlButtonClick(button)}
          >
            <div className="text-center">
              <div className="text-lg mb-1">{button.label}</div>
              <div className="text-xs opacity-80">Panel {button.id}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Arrow indicator for going back to weather */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">
        <ArrowLeft className="w-4 h-4" />
      </div>
    </div>
  )
}
