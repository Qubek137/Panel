export interface WeatherData {
  location: string
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  description: string
  icon: string
  timestamp: number
  sunrise?: string
  sunset?: string
  pressure?: number
  visibility?: number
  uvIndex?: number
  feelsLike?: number
  dewPoint?: number
  hourlyForecast?: HourlyWeather[]
  dailyForecast?: DailyWeather[]
}

export interface HourlyWeather {
  time: string
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  windDirection: number
  pressure: number
  visibility: number
  weatherCode: number
  icon: string
  condition: string
}

export interface DailyWeather {
  date: string
  maxTemp: number
  minTemp: number
  weatherCode: number
  icon: string
  condition: string
  sunrise: string
  sunset: string
  precipitation: number
  windSpeed: number
}

export interface Location {
  name: string
  locationKey: string
  latitude: number
  longitude: number
}

export const locations: Location[] = [
  { name: "Konopnica", locationKey: "konopnica", latitude: 51.221, longitude: 18.5696 },
  { name: "Warszawa", locationKey: "warszawa", latitude: 52.2298, longitude: 21.0118 },
  { name: "Wieluń", locationKey: "wielun", latitude: 51.3538, longitude: 18.8236 },
]

// Weather code mapping for Open-Meteo API
export const weatherCodeMap: Record<number, { condition: string; description: string; icon: string }> = {
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

// Wind direction mapping
export const windDirectionMap: Record<number, string> = {
  0: "N",
  45: "NE",
  90: "E",
  135: "SE",
  180: "S",
  225: "SW",
  270: "W",
  315: "NW",
}

export function getWindDirection(degrees: number): string {
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

// Fallback static data for offline mode
export const staticWeatherData: Record<string, WeatherData> = {
  konopnica: {
    location: "Konopnica",
    temperature: 18,
    humidity: 65,
    windSpeed: 12,
    condition: "Słonecznie",
    description: "bezchmurne niebo",
    icon: "☀️",
    timestamp: Date.now(),
    sunrise: "06:30",
    sunset: "19:45",
    pressure: 1013,
    visibility: 10000,
    uvIndex: 5,
    feelsLike: 20,
    dewPoint: 12,
  },
  warszawa: {
    location: "Warszawa",
    temperature: 20,
    humidity: 58,
    windSpeed: 8,
    condition: "Częściowo pochmurno",
    description: "częściowe zachmurzenie",
    icon: "⛅",
    timestamp: Date.now(),
    sunrise: "06:25",
    sunset: "19:50",
    pressure: 1015,
    visibility: 8000,
    uvIndex: 4,
    feelsLike: 22,
    dewPoint: 10,
  },
  wielun: {
    location: "Wieluń",
    temperature: 16,
    humidity: 72,
    windSpeed: 15,
    condition: "Pochmurno",
    description: "zachmurzenie",
    icon: "☁️",
    timestamp: Date.now(),
    sunrise: "06:35",
    sunset: "19:40",
    pressure: 1010,
    visibility: 6000,
    uvIndex: 2,
    feelsLike: 14,
    dewPoint: 11,
  },
}

// API rate limiting
export class APIRateLimit {
  private calls = 0
  private lastReset: number = Date.now()
  private readonly maxCalls: number = 9000 // Leave some buffer under 10000
  private readonly resetInterval: number = 24 * 60 * 60 * 1000 // 24 hours

  canMakeCall(): boolean {
    this.checkReset()
    return this.calls < this.maxCalls
  }

  recordCall(): void {
    this.calls++
    localStorage.setItem("api_calls", this.calls.toString())
    localStorage.setItem("api_last_reset", this.lastReset.toString())
  }

  private checkReset(): void {
    const now = Date.now()
    if (now - this.lastReset > this.resetInterval) {
      this.calls = 0
      this.lastReset = now
    } else {
      // Load from localStorage
      const savedCalls = localStorage.getItem("api_calls")
      const savedReset = localStorage.getItem("api_last_reset")
      if (savedCalls) this.calls = Number.parseInt(savedCalls)
      if (savedReset) this.lastReset = Number.parseInt(savedReset)
    }
  }

  getRemainingCalls(): number {
    this.checkReset()
    return Math.max(0, this.maxCalls - this.calls)
  }
}
