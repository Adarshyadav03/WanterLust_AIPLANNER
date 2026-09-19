import React, { useState } from 'react';
import InteractiveMap from '../components/map/InteractiveMap';
import { MapPin, Search, Navigation, Hotel, Utensils, Camera } from 'lucide-react';

export default function InteractiveMapPage() {
  const [selectedCity, setSelectedCity] = useState('Manali');
  const [lat, setLat] = useState(32.2432);
  const [lng, setLng] = useState(77.1892);

  const cityCoordinates = {
    Manali: { lat: 32.2432, lng: 77.1892 },
    Goa: { lat: 15.2993, lng: 74.124 },
    Kerala: { lat: 9.4981, lng: 76.3388 },
    Ladakh: { lat: 34.1526, lng: 77.5771 },
    Jaipur: { lat: 26.9124, lng: 75.7873 },
    Rishikesh: { lat: 30.0869, lng: 78.2676 },
  };

  const handleCityChange = (c) => {
    setSelectedCity(c);
    if (cityCoordinates[c]) {
      setLat(cityCoordinates[c].lat);
      setLng(cityCoordinates[c].lng);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl text-center space-y-3 text-white">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Geo-Spatial Discovery</span>
        <h1 className="text-3xl sm:text-4xl font-black">Interactive Destination Map</h1>
        <p className="text-slate-400 text-xs max-w-lg mx-auto">
          Explore hotels, restaurants, activity centers, and landmark attractions with custom interactive markers.
        </p>

        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {Object.keys(cityCoordinates).map((c) => (
            <button
              key={c}
              onClick={() => handleCityChange(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCity === c ? 'bg-emerald-500 text-slate-950 font-black shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-600" /> Showing Markers for {selectedCity}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">Leaflet OpenStreetMap API</span>
        </div>

        <InteractiveMap lat={lat} lng={lng} name={selectedCity} />
      </div>
    </div>
  );
}
