'use client'
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getZoneFromCoordinates } from '@/modules/map-engine/utils/geo-zone'

// Fix for default markers
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconAnchor: [12, 41]
});

// Component to handle map clicks
function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map center programmatically
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13);
  }, [center, map]);
  return null;
}

interface LocationPickerProps {
  onLocationChange: (lat: number, lng: number, zone: string) => void;
}

export default function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([12.9716, 77.5946]);
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    const zone = getZoneFromCoordinates(lat, lng);
    onLocationChange(lat, lng, zone);
  };

  const searchPincode = async () => {
    if (!pincode) return;
    setLoading(true);
    try {
      // Free OpenStreetMap Geocoding
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${pincode}, Bangalore, India`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        handleSelect(lat, lng);
      } else {
        alert('Pincode not found!');
      }
    } catch (e) {
      alert('Error searching pincode');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input 
          type="text" 
          placeholder="Enter Pincode (e.g. 560066)" 
          className="border p-2 rounded flex-1"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
        />
        <button 
          onClick={searchPincode}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Find Location'}
        </button>
      </div>

      <div className="h-[300px] border rounded overflow-hidden relative z-0">
        <MapContainer center={position} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} icon={icon} />
          <MapEvents onLocationSelect={handleSelect} />
          <MapUpdater center={position} />
        </MapContainer>
      </div>
      
      <p className="text-xs text-slate-500">
        * Click anywhere on the map to pin the exact property location.
      </p>
    </div>
  );
}
