'use client'

import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

// Define Map inline to isolate issues from other components
const Map = dynamic(
  async () => {
    const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet')
    const L = await import('leaflet')

    // Fix Icons for Debug Page
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41], 
      iconAnchor: [12, 41]
    })
    L.Marker.prototype.options.icon = DefaultIcon

    return function DebugMap() {
      return (
        <div style={{ width: '100%', height: '100%', background: '#e5e7eb' }}>
          <MapContainer 
            center={[12.9716, 77.5946]} 
            zoom={12} 
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[12.9716, 77.5946]}>
              <Popup>Debug Map Works!</Popup>
            </Marker>
          </MapContainer>
        </div>
      )
    }
  },
  { ssr: false, loading: () => <p>Loading Map...</p> }
)

export default function DebugPage() {
  return (
    // RAW CSS LAYOUT - Bypasses Tailwind completely
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: '1fr 300px', 
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden'
    }}>
      
      {/* Column 1: Map */}
      <div style={{ position: 'relative', borderRight: '2px solid black' }}>
        <Map />
      </div>

      {/* Column 2: Sidebar */}
      <div style={{ padding: '20px', background: '#f0f0f0' }}>
        <h1>Debug Panel</h1>
        <p>If you see this side-by-side with the map, the Layout is FIXED.</p>
        <p>If the map is gray/blank, check your internet or console for 404s.</p>
      </div>

    </div>
  )
}
