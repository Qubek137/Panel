import { TrendingDown, TrendingUp, Droplets, Wind, Gauge, Eye, Sunrise, Sunset } from "lucide-react"

const WeatherPage = ({ weatherData }) => {
  return (
    <div className="p-6">
      {/* Temperature Section - 3 columns */}
      <div className="grid grid-cols-3 gap-2 items-center mb-6">
        {/* Min Temperature */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/30 border border-blue-400/30 rounded-lg p-3 text-center shadow-sm">
          <div className="flex items-center justify-center mb-1">
            <TrendingDown className="w-5 h-5 text-blue-400 mr-1" />
            <span className="text-sm text-blue-200">Min</span>
          </div>
          <div className="text-xl font-bold text-white">{weatherData.dailyForecast?.[0]?.minTemp || "--"}°</div>
        </div>

        {/* Current Temperature */}
        <div className="text-center">
          <div className="text-7xl font-bold text-white mb-2">{weatherData.temperature}°C</div>
          <div className="text-6xl mb-2">{weatherData.icon}</div>
        </div>

        {/* Max Temperature */}
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/30 border border-red-400/30 rounded-lg p-3 text-center shadow-sm">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="w-5 h-5 text-red-400 mr-1" />
            <span className="text-sm text-red-200">Max</span>
          </div>
          <div className="text-xl font-bold text-white">{weatherData.dailyForecast?.[0]?.maxTemp || "--"}°</div>
        </div>
      </div>

      {/* Weather Parameters */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Droplets className="w-7 h-7 text-blue-300 mr-2" />
              <span className="text-xl font-bold text-white">Wilgotność</span>
            </div>
            <span className="text-xl font-bold text-white">{weatherData.humidity}%</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wind className="w-7 h-7 text-green-300 mr-2" />
              <span className="text-xl font-bold text-white">Wiatr</span>
            </div>
            <span className="text-xl font-bold text-white">{weatherData.windSpeed} km/h</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Gauge className="w-7 h-7 text-purple-300 mr-2" />
              <span className="text-xl font-bold text-white">Ciśnienie</span>
            </div>
            <span className="text-xl font-bold text-white">{weatherData.pressure} hPa</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="w-7 h-7 text-cyan-300 mr-2" />
              <span className="text-xl font-bold text-white">Widoczność</span>
            </div>
            <span className="text-xl font-bold text-white">{weatherData.visibility} km</span>
          </div>
        </div>
      </div>

      {/* Sun Times */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sunrise className="w-7 h-7 text-orange-300 mr-2" />
              <span className="text-xl font-bold text-white">Wschód</span>
            </div>
            <span className="text-xl font-bold text-white">{weatherData.sunrise}</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sunset className="w-7 h-7 text-red-300 mr-2" />
              <span className="text-xl font-bold text-white">Zachód</span>
            </div>
            <span className="text-xl font-bold text-white">{weatherData.sunset}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherPage
