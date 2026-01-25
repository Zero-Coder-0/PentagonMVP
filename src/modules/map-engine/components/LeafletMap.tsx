'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Property, Zone } from '@/modules/inventory/types' // Using your correct types

// ==========================================
// 1. ICONS
// ==========================================
const getIconForZone = (zone: Zone, isSelected: boolean) => {
  let color = 'blue';
  switch (zone) {
    case 'North': color = 'blue'; break;
    case 'South': color = 'green'; break;
    case 'East':  color = 'red'; break;
    case 'West':  color = 'gold'; break;
    default: color = 'blue';
  }

  // Use a slightly larger icon if selected
  const size = isSelected ? [35, 56] : [25, 41];
  const anchor = isSelected ? [17, 56] : [12, 41];

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: size as L.PointTuple,
    iconAnchor: anchor as L.PointTuple,
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
// 2. CONTROLLER (Supports Bounds & Center)
// ==========================================
const MapController = ({ 
  center, 
  zoom, 
  bounds 
}: { 
  center: [number, number] | null, 
  zoom: number,
  bounds?: [[number, number], [number, number]] | undefined
}) => {
  const map = useMap();

  useEffect(() => {
    // Priority 1: Fit Bounds (e.g., when a search location is selected)
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
  items: Property[]; // Using Property type
  selectedId: string | null;
  onSelect: (id: string) => void;
  center?: [number, number]; 
  bounds?: [[number, number], [number, number]]; 
}

const LeafletMap: React.FC<LeafletMapProps> = ({ items, selectedId, onSelect, center, bounds }) => {
  const mapCenter: [number, number] = center || [12.9716, 77.5946];

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false} // Disable default top-left controls if you want
    >
      <ResizeMap />
      <MapController center={center ? mapCenter : null} zoom={12} bounds={bounds} />

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User Search Location Marker */}
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

      {/* Property Markers */}
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        return (
          <Marker 
            key={item.id} 
            position={[item.lat, item.lng]}
            icon={getIconForZone(item.zone, isSelected)}
            eventHandlers={{ 
              click: () => onSelect(item.id) 
            }}
            opacity={selectedId === item.id ? 1.0 : 0.8}
            zIndexOffset={isSelected ? 1000 : 0} // Selected pin always on top
          >
            {/* Optional: Remove Popup if you rely solely on MegaPopup */}
            {/* 
            <Popup>
              <div className="text-center">
                <strong>{item.name}</strong><br/>
                {item.location_area}<br/>
                <span className="text-blue-600 font-bold">{item.price_display}</span>
              </div>
            </Popup> 
            */}
          </Marker>
        )
      })}
    </MapContainer>
  )
}

export default LeafletMap;
