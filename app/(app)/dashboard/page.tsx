'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useFarmerStore } from '@/store/farmer';
import { WEATHER_ICONS } from '@/lib/constants';
import { marketService } from '@/lib/apiServices';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { crops, isLoading, fetchCrops } = useFarmerStore();
  const [mandiPrices, setMandiPrices] = useState<any[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);

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

  // Fetch crops and mandi prices
  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        try {
          // Fetch farmer's crops
          await fetchCrops(user.id);
        } catch (error) {
          console.error('Error fetching crops:', error);
        }

        try {
          // Fetch mandi prices for common crops
          const prices = await marketService.getMandiPrices({
            crop_name: 'wheat',
            state: user.state || 'Punjab'
          });
          
          if (Array.isArray(prices)) {
            setMandiPrices(prices.slice(0, 4));
          }
        } catch (error) {
          console.error('Error fetching prices:', error);
          // Use default prices if API fails
          setMandiPrices([
            { crop_name: 'Wheat', price_per_kg: 2450, price_change_percent: 2.3 },
            { crop_name: 'Rice', price_per_kg: 3200, price_change_percent: -1.5 },
            { crop_name: 'Cotton', price_per_kg: 5800, price_change_percent: 0.8 },
            { crop_name: 'Sugarcane', price_per_kg: 290, price_change_percent: -0.5 },
          ]);
        } finally {
          setPricesLoading(false);
        }
      }
    };

    loadData();
  }, [user?.id, fetchCrops, user?.state]);

  // Calculate stats
  const activeCrops = crops.filter(c => c.status === 'ready').length;
  const readyCrops = crops.filter(c => c.status === 'ready').length;
  const totalCrops = crops.length;

  const stats = [
    { label: 'Total Crops', value: totalCrops, icon: '🌾' },
    { label: 'Ready for Sale', value: readyCrops, icon: '📦' },
    { label: 'Growing', value: crops.filter(c => c.status === 'growing').length, icon: '🌱' },
    { label: 'Markets', value: 'Active', icon: '📈' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-text">Stay updated with your farm activities and market prices</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-text">Loading your dashboard...</span>
        </div>
      ) : (
        <>
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
              <div key={idx} className="bg-white rounded-lg shadow-sm p-4 border border-border hover:shadow-md transition-shadow">
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

          {/* Your Crops Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Your Crops</h2>
              <Link href="/crops">
                <button className="text-sm text-primary hover:underline font-medium">View All →</button>
              </Link>
            </div>

            {crops.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-text mb-4">No crops yet. Start by adding your first crop!</p>
                <Link href="/crops/new">
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Add Your First Crop
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {crops.slice(0, 3).map((crop) => (
                  <div key={crop.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">{crop.crop_name}</p>
                        <p className="text-xs text-muted-text">{crop.variety}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        crop.status === 'ready' ? 'bg-green-100 text-green-800' :
                        crop.status === 'growing' ? 'bg-blue-100 text-blue-800' :
                        crop.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {crop.status.charAt(0).toUpperCase() + crop.status.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-text">
                        <span className="font-medium text-foreground">{crop.quantity_kg} kg</span> at ₹{crop.price_per_kg}/kg
                      </p>
                      <p className="text-xs text-muted-text">
                        {crop.harvest_date ? `Harvest: ${new Date(crop.harvest_date).toLocaleDateString()}` : 'No harvest date'}
                      </p>
                    </div>
                    <Link href={`/crops/${crop.id}`}>
                      <button className="w-full mt-3 py-2 text-xs text-primary font-medium border border-primary rounded hover:bg-primary/5 transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mandi Prices Ticker */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Market Prices</h2>
              <Link href="/market">
                <button className="text-sm text-primary hover:underline font-medium">View All →</button>
              </Link>
            </div>
            
            {pricesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                <span className="text-muted-text">Loading prices...</span>
              </div>
            ) : (
              <div className="space-y-2">
                {mandiPrices.map((item, idx) => {
                  const change = item.price_change_percent || 0;
                  const cropName = item.crop_name || item.crop;
                  const price = item.price_per_kg || item.price;
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📊</span>
                        <div>
                          <p className="font-medium text-foreground">{cropName}</p>
                          <p className="text-sm text-muted-text">₹{price}/unit</p>
                        </div>
                      </div>
                      <div className={`text-right font-medium text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-4 gap-4">
            <Link href="/crops/new">
              <button className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors">
                Add Crop 🌾
              </button>
            </Link>
            <Link href="/chat">
              <button className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-3 rounded-lg transition-colors">
                Ask AI 💡
              </button>
            </Link>
            <Link href="/schemes">
              <button className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-3 rounded-lg transition-colors">
                Schemes 🏛️
              </button>
            </Link>
            <Link href="/crop-advisor">
              <button className="w-full border-2 border-accent text-accent hover:bg-accent/5 font-semibold py-3 rounded-lg transition-colors">
                Advisor 🌿
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
