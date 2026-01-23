'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Navigation } from 'lucide-react' // Search is now inside LocationSearch
import { useDashboard } from './page'
import styles from './Dashboard.module.css'
import LocationSearch from '@/modules/map-engine/components/LocationSearch'

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

  // Handle Location Selection (from Search or Chips)
  const handleLocationUpdate = (lat: number, lng: number, name: string) => {
    setUserLocation({ lat, lng, displayName: name })
    // Zoom in slightly when a specific location is chosen
    setMapBounds([
      [lat - 0.03, lng - 0.03], 
      [lat + 0.03, lng + 0.03]
    ])
  }

  return (
    <div className={styles.mapContainer}>
      {/* Floating Search Bar */}
      <div className={styles.searchWrapper}>
        
        {/* Replaced manual input with smart LocationSearch */}
        <div className="w-full relative shadow-lg rounded-xl">
           <LocationSearch 
             onLocationSelect={(lat, lng, label) => handleLocationUpdate(lat, lng, label)}
           />
        </div>

        {/* Quick Chips */}
        <div className={styles.chipContainer}>
          {QUICK_LOCATIONS.map(loc => (
            <button 
              key={loc.name}
              onClick={() => handleLocationUpdate(loc.lat, loc.lng, loc.name)}
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
