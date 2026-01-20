'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// ==========================================
// 1. DYNAMIC MAP COMPONENT (Internal Definition)
// ==========================================
const MapComponent = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Popup, useMap } = await import('react-leaflet')
    const L = await import('leaflet')

    // FIX: Default Icons
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    })
    L.Marker.prototype.options.icon = DefaultIcon

    // HELPER: Resize Trigger
    function ResizeMap() {
      const map = useMap()
      useEffect(() => {
        setTimeout(() => map.invalidateSize(), 100)
      }, [map])
      return null
    }

    // ACTUAL MAP RENDER
    return function InternalMap({ points, onSelect }: any) {
      return (
        <MapContainer
          center={[12.9716, 77.5946]}
          zoom={11}
          style={{ height: '100%', width: '100%' }} // Critical: 100% of parent
        >
          <ResizeMap />
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p: any) => (
            <Marker 
              key={p.id} 
              position={[p.lat, p.lng]}
              eventHandlers={{ click: () => onSelect(p.id) }}
            >
              <Popup>{p.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )
    }
  },
  { 
    ssr: false, // DISABLE SSR
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        Loading Map Engine...
      </div>
    )
  }
)

// ==========================================
// 2. MOCK DATA
// ==========================================
const MOCK_DATA = [
  { id: '1', name: 'Prestige Golfshire', location: 'Nandi Hills', lat: 13.1986, lng: 77.6727, price: '1.5 Cr' },
  { id: '2', name: 'Sobha Dream Acres', location: 'Panathur', lat: 12.9366, lng: 77.7289, price: '85 L' },
  { id: '3', name: 'Brigade Meadows', location: 'Kanakapura', lat: 12.8242, lng: 77.5144, price: '65 L' },
]

// ==========================================
// 3. MAIN DASHBOARD PAGE (The Layout)
// ==========================================
export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedProp = MOCK_DATA.find(p => p.id === selectedId)

  return (
    // MASTER LAYOUT: CSS Grid (Force 3 Columns)
    // using inline styles to guarantee it works even if Tailwind breaks
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 300px 350px', // Map | List | Details
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#f3f4f6'
    }}>
      
      {/* COLUMN 1: MAP (Takes remaining space) */}
      <div style={{ position: 'relative', height: '100%', borderRight: '1px solid #ddd' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <MapComponent points={MOCK_DATA} onSelect={setSelectedId} />
        </div>
      </div>

      {/* COLUMN 2: PROPERTY LIST (Fixed 300px) */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white', borderRight: '1px solid #ddd' }}>
        <div className="p-4 border-b bg-gray-50 font-bold">PROPERTIES</div>
        <div className="flex-1 overflow-y-auto">
          {MOCK_DATA.map(prop => (
            <div 
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedId === prop.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
            >
              <h3 className="font-bold text-sm">{prop.name}</h3>
              <p className="text-xs text-gray-500">{prop.location}</p>
              <p className="text-sm font-medium text-blue-600 mt-1">{prop.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 3: DETAILS PANEL (Fixed 350px) */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'white' }}>
        {selectedProp ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{selectedProp.name}</h2>
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded inline-block text-sm mb-4">
              Available Now
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-xs text-gray-500 uppercase">Price</p>
                <p className="text-xl font-bold">{selectedProp.price}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-xs text-gray-500 uppercase">Location</p>
                <p className="text-lg">{selectedProp.location}</p>
              </div>
              
              <button 
                className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition-colors"
                onClick={() => alert('Booking flow...')}
              >
                Book Site Visit
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
            <div className="text-4xl mb-2">👈</div>
            <p>Select a property from the list to view full details here.</p>
          </div>
        )}
      </div>

    </div>
  )
}
