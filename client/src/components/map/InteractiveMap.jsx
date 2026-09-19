import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom Map Marker Icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -34],
});

export default function InteractiveMap({ lat = 32.2432, lng = 77.1892, name = 'Manali', markers = [] }) {
  const mapCenter = [lat, lng];

  const defaultMarkers = markers.length > 0 ? markers : [
    { id: 1, name: `${name} Center`, lat, lng, description: 'Town hub & local bazaar' },
    { id: 2, name: 'Solang Valley Resort', lat: lat + 0.03, lng: lng + 0.02, description: 'Luxury mountain resort' },
    { id: 3, name: 'Cafe 1947', lat: lat - 0.01, lng: lng - 0.01, description: 'Famous riverfront cafe' },
  ];

  return (
    <div className="w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-xl relative z-0">
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {defaultMarkers.map((m) => (
          <Marker key={m.id || m.name} position={[m.lat, m.lng]} icon={customIcon}>
            <Popup className="rounded-xl">
              <div className="p-1 text-slate-900">
                <h4 className="font-extrabold text-sm mb-0.5">{m.name}</h4>
                <p className="text-xs text-slate-600 mb-2">{m.description || 'Popular tourist spot'}</p>
                <button
                  onClick={() => alert(`Directions to ${m.name}`)}
                  className="w-full px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
