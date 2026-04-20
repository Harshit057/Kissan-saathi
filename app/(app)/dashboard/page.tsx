'use client';

import { useAuthStore } from '@/store/auth';
import { WEATHER_ICONS } from '@/lib/constants';

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock weather data
  const weather = {
    temp: 28,
    condition: 'clear',
    humidity: 65,
    windSpeed: 12,
    forecast: [
      { day: 'Tomorrow', high: 30, low: 24, condition: 'clear' },
      { day: 'Day After', high: 29, low: 23, condition: 'clouds' },
      { day: 'Next Day', high: 27, low: 22, condition: 'rain' },
    ]
  };

  // Mock stats
  const stats = [
    { label: 'Active Crops', value: user?.crops?.length || 0, icon: '🌾' },
    { label: 'Enrolled Schemes', value: 3, icon: '🏛️' },
    { label: 'Market Prices Updated', value: '2h ago', icon: '📈' },
    { label: 'AI Advice', value: 'New', icon: '💡' },
  ];

  // Mock mandi prices
  const mandiPrices = [
    { crop: 'Wheat', price: 2450, change: '+2.3%', trend: 'up' },
    { crop: 'Rice', price: 3200, change: '-1.5%', trend: 'down' },
    { crop: 'Cotton', price: 5800, change: '+0.8%', trend: 'up' },
    { crop: 'Sugarcane', price: 290, change: '-0.5%', trend: 'down' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-muted-text">{user?.state}, {user?.district}</p>
      </div>

      {/* Weather Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Today&apos;s Weather</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Weather */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-5xl font-bold text-primary">{weather.temp}°C</p>
                <p className="text-muted-text capitalize">{weather.condition}</p>
              </div>
              <div className="text-6xl">{WEATHER_ICONS[weather.condition] || '🌤️'}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-primary/20">
              <div>
                <p className="text-xs text-muted-text">Humidity</p>
                <p className="text-lg font-semibold text-foreground">{weather.humidity}%</p>
              </div>
              <div>
                <p className="text-xs text-muted-text">Wind Speed</p>
                <p className="text-lg font-semibold text-foreground">{weather.windSpeed} km/h</p>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="space-y-2">
            {weather.forecast.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{WEATHER_ICONS[day.condition]}</span>
                  <div>
                    <p className="font-medium text-foreground text-sm">{day.day}</p>
                    <p className="text-xs text-muted-text">{day.low}°C - {day.high}°C</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-muted-text capitalize">{day.condition}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm p-4 border border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-text font-medium mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
              <span className="text-3xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mandi Prices Ticker */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Market Prices</h2>
        
        <div className="space-y-2">
          {mandiPrices.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-medium text-foreground">{item.crop}</p>
                  <p className="text-sm text-muted-text">₹{item.price}/unit</p>
                </div>
              </div>
              <div className={`text-right font-medium text-sm ${item.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {item.trend === 'up' ? '↑' : '↓'} {item.change}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 py-2 text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors">
          View All Prices →
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <button className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors">
          Get AI Advice 💡
        </button>
        <button className="bg-accent hover:bg-accent-light text-white font-semibold py-3 rounded-lg transition-colors">
          Check Schemes 🏛️
        </button>
        <button className="border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-3 rounded-lg transition-colors">
          My Crops 🌾
        </button>
      </div>
    </div>
  );
}
