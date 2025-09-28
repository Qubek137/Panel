import { TrendingDown, TrendingUp, Droplets, Wind, Gauge, Eye, Sunrise, Sunset, Thermometer, Sun } from "lucide-react"

const WeatherPage = ({ weather }) => {
  return (
    <div className="p-6">
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
          <span className="text-6xl">{weather.icon || "❓"}</span>
          <span className="text-7xl font-bold text-gray-800">{weather.temperature || 0}°C</span>
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

      {/* Enhanced weather parameters with 3 columns */}
      <div className="grid grid-cols-3 gap-3 text-xl mb-3">
        <div className="flex items-center gap-2 justify-center bg-blue-100 rounded-lg p-4 border border-blue-200">
          <Droplets className="w-7 h-7 text-blue-600" />
          <span className="text-gray-800 font-bold">{weather.humidity || 0}%</span>
        </div>
        <div className="flex items-center gap-2 justify-center bg-gray-100 rounded-lg p-4 border border-gray-200">
          <Wind className="w-7 h-7 text-gray-600" />
          <span className="text-gray-800 font-bold">{weather.windSpeed || 0} km/h</span>
        </div>
        {weather.feelsLike !== undefined && (
          <div className="flex items-center gap-2 justify-center bg-orange-100 rounded-lg p-4 border border-orange-200">
            <Thermometer className="w-7 h-7 text-orange-600" />
            <span className="text-gray-800 font-bold">{weather.feelsLike}°C</span>
          </div>
        )}
        {weather.pressure !== undefined && (
          <div className="flex items-center gap-2 justify-center bg-purple-100 rounded-lg p-4 border border-purple-200">
            <Gauge className="w-7 h-7 text-purple-600" />
            <span className="text-gray-800 font-bold">{weather.pressure} hPa</span>
          </div>
        )}
        {weather.visibility !== undefined && (
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

      {/* Condition and Description */}
      <div className="space-y-2 mb-3">
        <p className="text-2xl text-gray-700 font-medium">{weather.condition || "Nieznane"}</p>
        <p className="text-lg text-gray-600 capitalize">{weather.description || "brak danych"}</p>
      </div>

      {/* Sun Times */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sunrise className="w-7 h-7 text-orange-300 mr-2" />
              <span className="text-xl font-bold text-white">Wschód</span>
            </div>
            <span className="text-xl font-bold text-white">{weather.sunrise}</span>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sunset className="w-7 h-7 text-red-300 mr-2" />
              <span className="text-xl font-bold text-white">Zachód</span>
            </div>
            <span className="text-xl font-bold text-white">{weather.sunset}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeatherPage
