import React, { useState, useEffect } from 'react';
import API from '../services/api';
import WeatherCard from '../components/weather/WeatherCard';
import Loader from '../components/common/Loader';
import { CloudSun, Search, MapPin } from 'lucide-react';

export default function WeatherPage() {
  const [city, setCity] = useState('Manali');
  const [searchCity, setSearchCity] = useState('Manali');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather(city);
  }, [city]);

  const fetchWeather = async (target) => {
    setLoading(true);
    try {
      const res = await API.get(`/destinations/${target}/weather`);
      setWeatherData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      setCity(searchCity);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Real-Time Forecasts</span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">Destination Weather Guide</h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Check weather conditions, wind speeds, humidity percentages, and 5-day forecasts before embarking on your trip.
        </p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto pt-4 flex gap-2">
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Enter city (e.g. Goa, Leh, Kashmir)"
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 shadow-sm font-semibold"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl text-sm transition-all shadow-md shadow-emerald-500/20"
          >
            Check
          </button>
        </form>
      </div>

      {loading ? <Loader message="Fetching forecast..." /> : <WeatherCard weatherData={weatherData} />}
    </div>
  );
}
