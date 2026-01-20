'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css' // FIX: Restores the map styles
import L from 'leaflet'

// FIX: Fixes missing default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png'
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png'
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Helper: Forces map to recalculate size when layout changes
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    // Wait for layout to settle, then invalidate size
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 100)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

// Helper: Flies to new center when selected
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 })
    }
  }, [center, map])
  return null
}

interface LeafletMapProps {
  items: any[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export default function LeafletMap({ items, selectedId, onSelect }: LeafletMapProps) {
  const selectedItem = items.find(item => item.id === selectedId)
  const center: [number, number] = selectedItem 
    ? [selectedItem.lat, selectedItem.lng] 
    : [12.9716, 77.5946] // Bangalore Center

  return (
    // FIX: "h-full" ensures it fills the parent container we made in page.tsx
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapResizer />
        <MapController center={selectedItem ? [selectedItem.lat, selectedItem.lng] : null} />

        {items.map((item) => (
          <Marker 
            key={item.id} 
            position={[item.lat, item.lng]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => onSelect(item.id),
            }}
          >
            <Popup>
              <div className="text-sm font-bold">{item.name}</div>
              <div className="text-xs">{item.price}</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
