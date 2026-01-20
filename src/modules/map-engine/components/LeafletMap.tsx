'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { InventoryItem, Zone } from '@/modules/inventory/types'

// ==========================================
// 1. ICONS (Now includes a "Search" Icon)
// ==========================================
const getIconForZone = (zone: Zone) => {
  let color = 'blue';
  switch (zone) {
    case 'North': color = 'blue'; break;
    case 'South': color = 'green'; break;
    case 'East':  color = 'red'; break;
    case 'West':  color = 'gold'; break;
    default: color = 'blue';
  }
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

// Special Black Icon for User Search Location
const SearchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ==========================================
// 2. CONTROLLER (Faster Speed)
// ==========================================
const MapController = ({ center, zoom }: { center: [number, number] | null, zoom: number }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      // FIX: Faster animation (0.5s) for snappy feel
      map.flyTo(center, zoom, {
        animate: true,
        duration: 0.5 
      });
    }
  }, [center, zoom, map]);

  return null;
}

// ==========================================
// 3. RESIZE HELPER
// ==========================================
function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 100);
  }, [map]);
  return null;
}

// ==========================================
// 4. MAIN COMPONENT
// ==========================================
interface LeafletMapProps {
  items: InventoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  center?: [number, number]; 
}

const LeafletMap: React.FC<LeafletMapProps> = ({ items, selectedId, onSelect, center }) => {
  // Default: Bangalore Center
  const mapCenter: [number, number] = center || [12.9716, 77.5946];

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <ResizeMap />
      <MapController center={center ? mapCenter : null} zoom={12} />

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* 
         NEW: Search Location Marker 
         If a center is provided (search active), show a Black Pin + Circle 
      */}
      {center && (
        <>
          <Marker position={center} icon={SearchIcon}>
            <Popup>📍 <strong>Your Search Location</strong></Popup>
          </Marker>
          {/* Visual Circle Radius (3km) to show context */}
          <Circle 
            center={center}
            radius={3000} 
            pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: 0.1, weight: 1 }} 
          />
        </>
      )}

      {/* Property Inventory Markers */}
      {items.map((item) => (
        <Marker 
          key={item.id} 
          position={[item.lat, item.lng]}
          icon={getIconForZone(item.zone)}
          eventHandlers={{
            click: () => onSelect(item.id),
          }}
          opacity={selectedId === item.id ? 1.0 : 0.7}
        >
          <Popup>
            <div className="text-center">
              <strong>{item.name}</strong><br/>
              {item.location}<br/>
              <span className="text-blue-600 font-bold">{item.price}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default LeafletMap;
