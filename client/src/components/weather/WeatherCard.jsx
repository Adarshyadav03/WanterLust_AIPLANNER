import React from 'react';
import { Sun, Cloud, Wind, Droplets, CloudRain } from 'lucide-react';

export default function WeatherCard({ weatherData }) {
  const {
    city = 'Manali',
    temp = 12,
    condition = 'Partly Cloudy',
    humidity = 55,
    windSpeed = 14,
    forecast = [
      { day: 'Thu', temp: 14, condition: 'Sunny' },
      { day: 'Fri', temp: 10, condition: 'Cloudy' },
      { day: 'Sat', temp: 8, condition: 'Light Rain' },
      { day: 'Sun', temp: 11, condition: 'Clear' },
      { day: 'Mon', temp: 13, condition: 'Sunny' },
    ],
  } = weatherData || {};

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Weather Info</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">{city}</h2>
          <p className="text-slate-400 text-sm">{condition}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-5xl font-black text-white tracking-tight">{temp}°C</div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            {condition.toLowerCase().includes('rain') ? (
              <CloudRain className="w-8 h-8" />
            ) : condition.toLowerCase().includes('cloud') ? (
              <Cloud className="w-8 h-8" />
            ) : (
              <Sun className="w-8 h-8" />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Humidity</div>
            <div className="text-sm font-bold text-slate-200">{humidity}%</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Wind className="w-5 h-5 text-teal-400" />
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">Wind Speed</div>
            <div className="text-sm font-bold text-slate-200">{windSpeed} km/h</div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">5-Day Forecast</h4>
        <div className="grid grid-cols-5 gap-2 text-center">
          {forecast.map((f, i) => (
            <div key={i} className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/60">
              <div className="text-xs font-bold text-slate-400 mb-1">{f.day}</div>
              <div className="text-sm font-black text-emerald-400 mb-1">{f.temp}°C</div>
              <div className="text-[10px] text-slate-400 line-clamp-1">{f.condition}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
