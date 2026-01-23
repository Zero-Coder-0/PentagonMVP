'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Search, MapPin, Navigation } from 'lucide-react'
import { useDashboard } from './page'
import styles from './Dashboard.module.css'

// Dynamic import for Leaflet (No SSR)
const LeafletMap = dynamic(
  () => import('@/modules/map-engine/components/LeafletMap'),
  { ssr: false, loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div> }
)

const QUICK_LOCATIONS = [
  { name: 'Hebbal', lat: 13.0354, lng: 77.5988 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  { name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
  { name: 'Sarjapur', lat: 12.9237, lng: 77.6547 },
]

export default function MapContainer() {
  const { 
    displayedProperties, 
    selectedId, 
    setSelectedId, 
    userLocation, 
    setUserLocation,
    mapBounds,
    setMapBounds
  } = useDashboard()

  const [searchQuery, setSearchQuery] = useState('')

  // Handle Quick Location Click
  const handleQuickLoc = (loc: { lat: number; lng: number; name: string }) => {
    setUserLocation({ lat: loc.lat, lng: loc.lng, displayName: loc.name })
    setMapBounds([
      [loc.lat - 0.05, loc.lng - 0.05], 
      [loc.lat + 0.05, loc.lng + 0.05]
    ])
  }

  return (
    <div className={styles.mapContainer}>
      {/* Floating Search Bar */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchBar}>
          <Search className="w-5 h-5 text-slate-400 my-auto ml-2" />
          <input 
            className={styles.searchInput}
            placeholder="Search location (e.g. Indiranagar)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && alert('Implement Google Places API here')}
          />
          <button className={styles.navButton}>
            <Navigation className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Chips */}
        <div className={styles.chipContainer}>
          {QUICK_LOCATIONS.map(loc => (
            <button 
              key={loc.name}
              onClick={() => handleQuickLoc(loc)}
              className={styles.chip}
            >
              <MapPin className="w-3 h-3" />
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Map Instance */}
      <LeafletMap 
        items={displayedProperties}
        selectedId={selectedId}
        onSelect={setSelectedId}
        center={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
        bounds={mapBounds}
      />
    </div>
  )
}
