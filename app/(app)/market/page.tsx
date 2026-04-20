'use client';

import { useState } from 'react';
import { CROPS } from '@/lib/constants';

interface PriceData {
  crop: string;
  currentPrice: number;
  previousPrice: number;
  lowestPrice: number;
  highestPrice: number;
  trend: 'up' | 'down' | 'stable';
  volume: number;
  mandi: string;
  updateTime: string;
}

export default function MarketPage() {
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [timeframe, setTimeframe] = useState('week');

  // Mock price data
  const priceData: PriceData[] = [
    {
      crop: 'Wheat',
      currentPrice: 2450,
      previousPrice: 2400,
      lowestPrice: 2350,
      highestPrice: 2500,
      trend: 'up',
      volume: 15000,
      mandi: 'Indore Mandi',
      updateTime: '2 hours ago'
    },
    {
      crop: 'Rice',
      currentPrice: 3200,
      previousPrice: 3250,
      lowestPrice: 3100,
      highestPrice: 3300,
      trend: 'down',
      volume: 12000,
      mandi: 'Chhattisgarh',
      updateTime: '1 hour ago'
    },
    {
      crop: 'Cotton',
      currentPrice: 5800,
      previousPrice: 5750,
      lowestPrice: 5600,
      highestPrice: 5900,
      trend: 'up',
      volume: 8000,
      mandi: 'Gujarat Mandi',
      updateTime: '3 hours ago'
    },
    {
      crop: 'Sugarcane',
      currentPrice: 290,
      previousPrice: 291,
      lowestPrice: 280,
      highestPrice: 295,
      trend: 'stable',
      volume: 20000,
      mandi: 'Karnataka',
      updateTime: '30 mins ago'
    },
  ];

  // Mock historical data for chart
  const chartData = [
    { date: 'Mon', price: 2420 },
    { date: 'Tue', price: 2410 },
    { date: 'Wed', price: 2430 },
    { date: 'Thu', price: 2400 },
    { date: 'Fri', price: 2440 },
    { date: 'Sat', price: 2445 },
    { date: 'Sun', price: 2450 },
  ];

  const selectedData = priceData.find(d => d.crop === selectedCrop);

  const priceChange = selectedData ? selectedData.currentPrice - selectedData.previousPrice : 0;
  const priceChangePercent = selectedData ? ((priceChange / selectedData.previousPrice) * 100).toFixed(2) : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Market Prices</h1>
        <p className="text-muted-text">Real-time prices from mandis across India</p>
      </div>

      {/* Crop Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-border p-4 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Select Crop</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {CROPS.slice(0, 12).map(crop => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`p-3 rounded-lg border-2 text-center font-medium transition-colors ${
                selectedCrop === crop
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border text-foreground hover:border-primary'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {selectedData && (
        <>
          {/* Current Price Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg shadow-sm border border-primary/20 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-muted-text text-sm mb-2">Current Price</p>
                <h2 className="text-4xl font-bold text-primary">₹{selectedData.currentPrice}</h2>
                <p className="text-sm text-muted-text mt-2">{selectedData.mandi}</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${priceChange > 0 ? 'text-green-600' : priceChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {priceChange > 0 ? '↑' : priceChange < 0 ? '↓' : '→'} {Math.abs(parseFloat(priceChangePercent.toString()))}%
                </p>
                <p className="text-sm text-muted-text">vs Previous Day</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-6 border-t border-primary/20">
              <div>
                <p className="text-xs text-muted-text mb-1">Previous</p>
                <p className="font-semibold text-foreground">₹{selectedData.previousPrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-text mb-1">High</p>
                <p className="font-semibold text-foreground">₹{selectedData.highestPrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-text mb-1">Low</p>
                <p className="font-semibold text-foreground">₹{selectedData.lowestPrice}</p>
              </div>
              <div>
                <p className="text-xs text-muted-text mb-1">Volume</p>
                <p className="font-semibold text-foreground">{(selectedData.volume / 1000).toFixed(0)}k</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Price Trend</h2>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                      timeframe === tf
                        ? 'bg-primary text-white'
                        : 'bg-muted text-foreground hover:bg-primary/10'
                    }`}
                  >
                    {tf.charAt(0).toUpperCase() + tf.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Simple Chart */}
            <div className="space-y-4">
              <div className="flex items-end justify-between h-48 gap-2 bg-muted/50 rounded-lg p-4">
                {chartData.map((data, idx) => {
                  const maxPrice = Math.max(...chartData.map(d => d.price));
                  const minPrice = Math.min(...chartData.map(d => d.price));
                  const range = maxPrice - minPrice;
                  const height = ((data.price - minPrice) / range) * 100;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center justify-end">
                      <div
                        className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary-dark"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                        title={`₹${data.price}`}
                      ></div>
                      <p className="text-xs text-muted-text mt-2">{data.date}</p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-xs text-muted-text">
                <span>₹{Math.min(...chartData.map(d => d.price))}</span>
                <span>₹{Math.max(...chartData.map(d => d.price))}</span>
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">All Crop Prices</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Crop</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Change</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Mandi</th>
                  </tr>
                </thead>
                <tbody>
                  {priceData.map(data => {
                    const change = data.currentPrice - data.previousPrice;
                    const changePercent = ((change / data.previousPrice) * 100).toFixed(2);
                    return (
                      <tr key={data.crop} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{data.crop}</td>
                        <td className="text-right py-3 px-4 text-foreground">₹{data.currentPrice}</td>
                        <td className={`text-right py-3 px-4 font-medium ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {changePercent}%
                        </td>
                        <td className="py-3 px-4 text-muted-text text-xs">{data.mandi}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
