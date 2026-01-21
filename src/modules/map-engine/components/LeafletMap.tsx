'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { InventoryItem, Zone } from '@/modules/inventory/types'

// ==========================================
// 1. ICONS
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

const SearchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ==========================================
// 2. CONTROLLER (Now supports Bounds)
// ==========================================
const MapController = ({ 
  center, 
  zoom, 
  bounds 
}: { 
  center: [number, number] | null, 
  zoom: number,
  bounds?: [[number, number], [number, number]] | null 
}) => {
  const map = useMap();

  useEffect(() => {
    // Priority 1: Fit Bounds (Dual View)
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
      return;
    }

    // Priority 2: Fly to Center
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
function ResizeMap() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 100); }, [map]);
  return null;
}

interface LeafletMapProps {
  items: InventoryItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  center?: [number, number]; 
  bounds?: [[number, number], [number, number]]; // New Prop
}

const LeafletMap: React.FC<LeafletMapProps> = ({ items, selectedId, onSelect, center, bounds }) => {
  const mapCenter: [number, number] = center || [12.9716, 77.5946];

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
    >
      <ResizeMap />
      <MapController center={center ? mapCenter : null} zoom={12} bounds={bounds} />

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {center && (
        <>
          <Marker position={center} icon={SearchIcon}>
            <Popup>📍 <strong>Your Search Location</strong></Popup>
          </Marker>
          <Circle 
            center={center}
            radius={3000} 
            pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: 0.1, weight: 1 }} 
          />
        </>
      )}

      {items.map((item) => (
        <Marker 
          key={item.id} 
          position={[item.lat, item.lng]}
          icon={getIconForZone(item.zone)}
          eventHandlers={{ click: () => onSelect(item.id) }}
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
