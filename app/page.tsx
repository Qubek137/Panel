"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Thermometer, Droplets, Wind, ArrowLeft, ChevronUp, ChevronDown, ChevronRight } from "lucide-react"
import { locations, getWeatherWithTimeVariation, type WeatherData } from "@/lib/static-weather-data"

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

  // Funkcja do pobierania statycznych danych pogodowych
  const fetchStaticWeatherData = (locationIndex: number) => {
    setLoading(true)

    // Symuluj opóźnienie ładowania
    setTimeout(() => {
      const location = locations[locationIndex]
      const weatherData = getWeatherWithTimeVariation(location.locationKey)
      setWeather(weatherData)
      setLoading(false)
    }, 500)
  }

  // Pobierz dane pogodowe przy zmianie lokalizacji
  useEffect(() => {
    fetchStaticWeatherData(currentLocationIndex)
  }, [currentLocationIndex])

  // Auto-refresh co 5 minut (symulacja aktualizacji)
  useEffect(() => {
    const interval = setInterval(
      () => {
        fetchStaticWeatherData(currentLocationIndex)
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [currentLocationIndex])

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

    // Symulacja akcji - można rozszerzyć o rzeczywiste funkcjonalności
    console.log(`${button.label} pressed`)

    // Przykład: zmiana stanu przycisku (można dodać stan lokalny)
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
        className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4 flex items-center justify-center relative overflow-hidden mobile-container"
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
                index === currentLocationIndex ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Time display */}
        <div className="absolute top-4 right-4 text-white/90 text-lg font-medium z-10">
          {new Date().toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>

        {/* Navigation arrows */}
        <div className="absolute left-1/2 top-12 transform -translate-x-1/2 text-white/60 z-10">
          <ChevronUp className="w-5 h-5" />
        </div>
        <div className="absolute left-1/2 bottom-12 transform -translate-x-1/2 text-white/60 z-10">
          <ChevronDown className="w-5 h-5" />
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 z-10">
          <ChevronRight className="w-5 h-5" />
        </div>

        <Card
          ref={weatherCardRef}
          className="w-full max-w-sm bg-white/95 backdrop-blur-sm shadow-2xl mx-4 weather-card"
        >
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-base">Ładowanie...</p>
              </div>
            ) : weather ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg font-medium">{weather.location}</span>
                </div>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <Thermometer className="w-10 h-10 text-blue-600" />
                  <span className="text-5xl font-bold text-gray-800">{weather.temperature}°C</span>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-xl text-gray-700 font-medium">{weather.condition}</p>
                  <p className="text-base text-gray-600 capitalize">{weather.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-base">
                  <div className="flex items-center gap-2 justify-center">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Wind className="w-5 h-5 text-gray-500" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                </div>

                {/* Timestamp dla offline mode */}
                <div className="text-xs text-gray-400 mt-4">
                  Ostatnia aktualizacja: {new Date(weather.timestamp).toLocaleTimeString("pl-PL")}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-600 py-8">
                <p className="text-lg">Błąd ładowania pogody</p>
                <button
                  onClick={() => fetchStaticWeatherData(currentLocationIndex)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md text-sm"
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
