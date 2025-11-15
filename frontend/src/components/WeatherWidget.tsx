import { Card } from "./ui/card";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";

interface WeatherWidgetProps {
  className?: string;
}

export function WeatherWidget({ className }: WeatherWidgetProps) {
  // Mock weather data
  const weather = {
    temp: 72,
    condition: "Partly Cloudy",
    location: "San Francisco, CA",
    humidity: 65,
    wind: 12,
    high: 78,
    low: 64,
  };

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "Sunny":
        return <Sun className="w-16 h-16 text-yellow-500" />;
      case "Rainy":
        return <CloudRain className="w-16 h-16 text-blue-500" />;
      default:
        return <Cloud className="w-16 h-16 text-gray-400" />;
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-4">
        <div>
          <h2 className="text-gray-500 mb-1">Weather</h2>
          <p className="text-sm text-gray-400">{weather.location}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="text-5xl">{weather.temp}°F</div>
            <p className="text-gray-500 mt-1">{weather.condition}</p>
          </div>
          <div>{getWeatherIcon()}</div>
        </div>

        <div className="flex gap-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{weather.wind} mph</span>
          </div>
          <div className="text-sm text-gray-600">
            H: {weather.high}° L: {weather.low}°
          </div>
          <div className="text-sm text-gray-600">
            Humidity: {weather.humidity}%
          </div>
        </div>
      </div>
    </Card>
  );
}
