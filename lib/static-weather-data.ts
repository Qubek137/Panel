export interface WeatherData {
  location: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  description: string
  icon: string
  timestamp: number
}

export interface Location {
  name: string
  locationKey: string
}

export const locations: Location[] = [
  { name: "Wieluń Piaski", locationKey: "2747373" },
  { name: "Konopnica", locationKey: "2747374" },
  { name: "Wieluń", locationKey: "315078" },
  { name: "Łódź", locationKey: "274231" },
  { name: "Warszawa", locationKey: "274663" },
]

// Statyczne dane pogodowe - symulują różne warunki pogodowe
export const staticWeatherData: Record<string, WeatherData[]> = {
  "2747373": [
    // Wieluń Piaski
    {
      location: "Wieluń Piaski",
      temperature: 12,
      humidity: 68,
      windSpeed: 15,
      condition: "Częściowe zachmurzenie",
      description: "częściowe zachmurzenie z przejaśnieniami",
      icon: "partly-cloudy",
      timestamp: Date.now(),
    },
    {
      location: "Wieluń Piaski",
      temperature: 8,
      humidity: 75,
      windSpeed: 12,
      condition: "Pochmurno",
      description: "pochmurno z możliwością opadów",
      icon: "cloudy",
      timestamp: Date.now(),
    },
    {
      location: "Wieluń Piaski",
      temperature: 18,
      humidity: 45,
      windSpeed: 8,
      condition: "Słonecznie",
      description: "słonecznie i ciepło",
      icon: "sunny",
      timestamp: Date.now(),
    },
  ],
  "2747374": [
    // Konopnica
    {
      location: "Konopnica",
      temperature: 10,
      humidity: 72,
      windSpeed: 18,
      condition: "Deszcz",
      description: "lekki deszcz",
      icon: "rainy",
      timestamp: Date.now(),
    },
    {
      location: "Konopnica",
      temperature: 14,
      humidity: 60,
      windSpeed: 10,
      condition: "Częściowe zachmurzenie",
      description: "zmienne zachmurzenie",
      icon: "partly-cloudy",
      timestamp: Date.now(),
    },
  ],
  "315078": [
    // Wieluń
    {
      location: "Wieluń",
      temperature: 15,
      humidity: 55,
      windSpeed: 12,
      condition: "Słonecznie",
      description: "słonecznie z niewielkim wiatrem",
      icon: "sunny",
      timestamp: Date.now(),
    },
    {
      location: "Wieluń",
      temperature: 6,
      humidity: 85,
      windSpeed: 20,
      condition: "Mgła",
      description: "gęsta mgła rano",
      icon: "foggy",
      timestamp: Date.now(),
    },
  ],
  "274231": [
    // Łódź
    {
      location: "Łódź",
      temperature: 16,
      humidity: 50,
      windSpeed: 14,
      condition: "Słonecznie",
      description: "pogodnie i ciepło",
      icon: "sunny",
      timestamp: Date.now(),
    },
    {
      location: "Łódź",
      temperature: 9,
      humidity: 78,
      windSpeed: 16,
      condition: "Pochmurno",
      description: "pochmurno z przelotnymi opadami",
      icon: "cloudy",
      timestamp: Date.now(),
    },
  ],
  "274663": [
    // Warszawa
    {
      location: "Warszawa",
      temperature: 17,
      humidity: 48,
      windSpeed: 11,
      condition: "Słonecznie",
      description: "słonecznie i przyjemnie",
      icon: "sunny",
      timestamp: Date.now(),
    },
    {
      location: "Warszawa",
      temperature: 11,
      humidity: 70,
      windSpeed: 13,
      condition: "Częściowe zachmurzenie",
      description: "zmienne zachmurzenie",
      icon: "partly-cloudy",
      timestamp: Date.now(),
    },
  ],
}

// Funkcja do pobierania losowych danych pogodowych dla lokalizacji
export function getStaticWeatherData(locationKey: string): WeatherData {
  const locationData = staticWeatherData[locationKey]
  if (!locationData || locationData.length === 0) {
    // Fallback data
    return {
      location: "Nieznana lokalizacja",
      temperature: 15,
      humidity: 60,
      windSpeed: 10,
      condition: "Słonecznie",
      description: "pogodnie",
      icon: "sunny",
      timestamp: Date.now(),
    }
  }

  // Zwróć losowy element z dostępnych danych
  const randomIndex = Math.floor(Math.random() * locationData.length)
  return {
    ...locationData[randomIndex],
    timestamp: Date.now(),
  }
}

// Funkcja do symulacji zmiany pogody w czasie
export function getWeatherWithTimeVariation(locationKey: string): WeatherData {
  const baseData = getStaticWeatherData(locationKey)
  const hour = new Date().getHours()

  // Symuluj zmiany temperatury w ciągu dnia
  let temperatureModifier = 0
  if (hour >= 6 && hour < 12) {
    temperatureModifier = Math.floor(Math.random() * 3) // Rano: +0 do +2°C
  } else if (hour >= 12 && hour < 18) {
    temperatureModifier = Math.floor(Math.random() * 5) + 2 // Popołudnie: +2 do +6°C
  } else if (hour >= 18 && hour < 22) {
    temperatureModifier = Math.floor(Math.random() * 2) // Wieczór: +0 do +1°C
  } else {
    temperatureModifier = -Math.floor(Math.random() * 3) // Noc: -2 do 0°C
  }

  return {
    ...baseData,
    temperature: Math.max(baseData.temperature + temperatureModifier, -10),
    timestamp: Date.now(),
  }
}
