'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon paths (run once)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface MapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
}

function LocationMarker({ lat, lng, onLocationChange }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([lat, lng]);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
      map.flyTo([lat, lng], map.getZoom());
    },
  });

  useEffect(() => {
    setPosition([lat, lng]);
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return position ? <Marker position={position} /> : null;
}

interface MapPickerWithSearchProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

function MapPickerWithSearch({ lat, lng, onLocationChange }: MapPickerWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [manualLat, setManualLat] = useState(lat.toString());
  const [manualLng, setManualLng] = useState(lng.toString());

  useEffect(() => {
    setManualLat(lat.toFixed(6));
    setManualLng(lng.toFixed(6));
  }, [lat, lng]);

  async function handleSearch() {
    if (!searchQuery.trim()) {
      alert('Please enter a location or pincode');
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery + ', Bangalore, Karnataka, India'
        )}&format=json&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        onLocationChange(parseFloat(lat), parseFloat(lon), display_name);
        alert(`✅ Location found: ${display_name}`);
      } else {
        alert('❌ Location not found. Try a different search term or pincode.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('❌ Error searching location. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  function handleManualUpdate() {
    const newLat = parseFloat(manualLat);
    const newLng = parseFloat(manualLng);

    if (isNaN(newLat) || isNaN(newLng)) {
      alert('❌ Please enter valid latitude and longitude');
      return;
    }

    if (newLat < -90 || newLat > 90 || newLng < -180 || newLng > 180) {
      alert('❌ Latitude must be between -90 and 90, Longitude between -180 and 180');
      return;
    }

    onLocationChange(newLat, newLng);
    alert('✅ Location updated!');
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          🔍 Search Location by Address or Pincode
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Whitefield, Bangalore or 560066"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              searching
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {searching ? '⏳ Searching...' : '🔍 Search'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          💡 Try: "Whitefield", "Koramangala", "560066", or any Bangalore location
        </p>
      </div>

      {/* Manual Lat/Lng Editor */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          ✏️ Or Enter Coordinates Manually
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="12.971599"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="77.594566"
            />
          </div>
        </div>
        <button
          onClick={handleManualUpdate}
          className="mt-2 w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium"
        >
          📍 Update Location
        </button>
      </div>

      {/* Map */}
      <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
        <div className="bg-slate-700 text-white px-4 py-2 text-sm font-medium">
          🗺️ Click anywhere on the map to set location
        </div>
        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer
            center={[lat, lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker lat={lat} lng={lng} onLocationChange={onLocationChange} />
          </MapContainer>
        </div>
      </div>

      {/* Current Coordinates Display */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-800">
          <strong>📍 Current Location:</strong> Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
}

export default MapPickerWithSearch;
