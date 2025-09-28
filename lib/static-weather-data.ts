export interface Location {
  name: string
  latitude: number
  longitude: number
  locationKey: string
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
  dayName: string
  maxTemp: number
  minTemp: number
  weatherCode: number
  icon: string
  condition: string
  sunrise: string
  sunset: string
  precipitation: number
  windSpeed: number
  humidity: number
  uvIndex: number
}

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
  minTemp?: number
  maxTemp?: number
  hourlyForecast?: HourlyWeather[]
  dailyForecast?: DailyWeather[]
}

export const locations: Location[] = [
  {
    name: "Konopnica",
    latitude: 51.2465,
    longitude: 18.4712,
    locationKey: "konopnica",
  },
  {
    name: "Wieluń",
    latitude: 51.2167,
    longitude: 18.5667,
    locationKey: "wielun",
  },
  {
    name: "Warszawa",
    latitude: 52.2297,
    longitude: 21.0122,
    locationKey: "warszawa",
  },
]

export const weatherCodeMap: Record<number, { condition: string; description: string; icon: string }> = {
  0: { condition: "Bezchmurnie", description: "czyste niebo", icon: "☀️" },
  1: { condition: "Przeważnie słonecznie", description: "głównie bezchmurnie", icon: "🌤️" },
  2: { condition: "Częściowo pochmurno", description: "częściowe zachmurzenie", icon: "⛅" },
  3: { condition: "Pochmurno", description: "zachmurzenie", icon: "☁️" },
  45: { condition: "Mgła", description: "mgła", icon: "🌫️" },
  48: { condition: "Szron", description: "osadzający się szron", icon: "🌫️" },
  51: { condition: "Mżawka", description: "lekka mżawka", icon: "🌦️" },
  53: { condition: "Mżawka", description: "umiarkowana mżawka", icon: "🌦️" },
  55: { condition: "Mżawka", description: "gęsta mżawka", icon: "🌦️" },
  56: { condition: "Marznąca mżawka", description: "lekka marznąca mżawka", icon: "🌨️" },
  57: { condition: "Marznąca mżawka", description: "gęsta marznąca mżawka", icon: "🌨️" },
  61: { condition: "Deszcz", description: "lekki deszcz", icon: "🌧️" },
  63: { condition: "Deszcz", description: "umiarkowany deszcz", icon: "🌧️" },
  65: { condition: "Deszcz", description: "silny deszcz", icon: "🌧️" },
  66: { condition: "Marznący deszcz", description: "lekki marznący deszcz", icon: "🌨️" },
  67: { condition: "Marznący deszcz", description: "silny marznący deszcz", icon: "🌨️" },
  71: { condition: "Śnieg", description: "lekki śnieg", icon: "❄️" },
  73: { condition: "Śnieg", description: "umiarkowany śnieg", icon: "❄️" },
  75: { condition: "Śnieg", description: "silny śnieg", icon: "❄️" },
  77: { condition: "Ziarna śniegu", description: "ziarna śniegu", icon: "❄️" },
  80: { condition: "Przelotne opady", description: "lekkie przelotne opady", icon: "🌦️" },
  81: { condition: "Przelotne opady", description: "umiarkowane przelotne opady", icon: "🌦️" },
  82: { condition: "Przelotne opady", description: "silne przelotne opady", icon: "🌦️" },
  85: { condition: "Opady śniegu", description: "lekkie opady śniegu", icon: "🌨️" },
  86: { condition: "Opady śniegu", description: "silne opady śniegu", icon: "🌨️" },
  95: { condition: "Burza", description: "burza", icon: "⛈️" },
  96: { condition: "Burza z gradem", description: "burza z lekkim gradem", icon: "⛈️" },
  99: { condition: "Burza z gradem", description: "burza z silnym gradem", icon: "⛈️" },
}

export const staticWeatherData: Record<string, WeatherData> = {
  konopnica: {
    location: "Konopnica",
    temperature: 18,
    humidity: 65,
    windSpeed: 12,
    condition: "Częściowo pochmurno",
    description: "częściowe zachmurzenie",
    icon: "⛅",
    timestamp: Date.now(),
    sunrise: "06:30",
    sunset: "19:45",
    pressure: 1013,
    visibility: 10,
    uvIndex: 4,
    feelsLike: 19,
    dewPoint: 12,
    minTemp: 14,
    maxTemp: 22,
    hourlyForecast: [],
    dailyForecast: [],
  },
  wielun: {
    location: "Wieluń",
    temperature: 20,
    humidity: 60,
    windSpeed: 8,
    condition: "Słonecznie",
    description: "czyste niebo",
    icon: "☀️",
    timestamp: Date.now(),
    sunrise: "06:28",
    sunset: "19:47",
    pressure: 1015,
    visibility: 15,
    uvIndex: 6,
    feelsLike: 21,
    dewPoint: 10,
    minTemp: 16,
    maxTemp: 24,
    hourlyForecast: [],
    dailyForecast: [],
  },
  warszawa: {
    location: "Warszawa",
    temperature: 16,
    humidity: 70,
    windSpeed: 15,
    condition: "Deszcz",
    description: "lekki deszcz",
    icon: "🌧️",
    timestamp: Date.now(),
    sunrise: "06:25",
    sunset: "19:50",
    pressure: 1010,
    visibility: 8,
    uvIndex: 2,
    feelsLike: 15,
    dewPoint: 11,
    minTemp: 12,
    maxTemp: 18,
    hourlyForecast: [],
    dailyForecast: [],
  },
}

export class APIRateLimit {
  private calls: number[] = []
  private readonly maxCalls = 10000
  private readonly timeWindow = 24 * 60 * 60 * 1000 // 24 hours

  canMakeCall(): boolean {
    this.cleanOldCalls()
    return this.calls.length < this.maxCalls
  }

  recordCall(): void {
    this.calls.push(Date.now())
  }

  private cleanOldCalls(): void {
    const now = Date.now()
    this.calls = this.calls.filter((callTime) => now - callTime < this.timeWindow)
  }

  getRemainingCalls(): number {
    this.cleanOldCalls()
    return Math.max(0, this.maxCalls - this.calls.length)
  }
}
