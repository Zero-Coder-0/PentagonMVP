'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { useDashboard } from './page'

const LeafletMap = dynamic(
  () => import('@/modules/map-engine/components/LeafletMap'),
  { 
    ssr: false, 
    loading: () => (
      <div className="h-full w-full bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-300">
        <div className="text-slate-500 text-sm font-medium">Loading Map...</div>
      </div>
    ) 
  }
)

export default function MapContainer() {
  const { 
    displayedProperties, 
    selectedId, 
    handlePinClick, 
    userLocation, 
    setUserLocation,
    mapBounds,
    setMapBounds
  } = useDashboard()

  const handleLocationUpdate = (lat: number, lng: number, name: string) => {
    setUserLocation({ lat, lng, displayName: name })
    setMapBounds([
      [lat - 0.03, lng - 0.03], 
      [lat + 0.03, lng + 0.03]
    ])
  }

  const handleSeedReset = () => {
    setUserLocation(null);
    setMapBounds(undefined);
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-300 shadow-lg">
      <LeafletMap 
        items={displayedProperties}
        selectedId={selectedId}
        onSelect={handlePinClick} 
        onMarkerDbClick={handleLocationUpdate}
        onSeedReset={handleSeedReset}
        center={userLocation ? [userLocation.lat, userLocation.lng] : undefined}
        bounds={mapBounds}
      />
    </div>
  )
}
