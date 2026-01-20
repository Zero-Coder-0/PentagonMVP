'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapViewProps, ZoneColor } from '../types'
import { useEffect } from 'react'

// Fix Icons
const createColorIcon = (color: ZoneColor) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color: ${color === 'red' ? '#ef4444' : '#3b82f6'}; width: 1.2rem; height: 1.2rem; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// Resizer component to fix gray tiles
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 200)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

export default function LeafletMap({ points, center, zoom }: MapViewProps) {
  return (
    // FIX: height must be 100% to fill the grid cell, NOT 100vh
    <div className="w-full h-full relative isolate">
       <MapContainer 
         center={center || [12.9716, 77.5946]} 
         zoom={zoom || 11} 
         style={{ height: '100%', width: '100%', background: '#e5e7eb' }} 
       >
         <MapResizer />
         <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
         />
         {points.map((point) => (
          <Marker 
            key={point.id} 
            position={[point.lat, point.lng]}
            icon={createColorIcon(point.color)}
          >
            <Popup>{point.title}</Popup>
          </Marker>
        ))}
       </MapContainer>
    </div>
  )
}
