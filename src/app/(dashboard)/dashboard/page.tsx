'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import LocationSearch from '@/modules/map-engine/components/LocationSearch'
import { MOCK_INVENTORY } from '@/modules/inventory/data/mock'
import { GeoCalc } from '@/modules/map-engine/utils/geo-calc'

// Dynamically import map (No SSR)
const LeafletMap = dynamic(
  () => import('@/modules/map-engine/components/LeafletMap'),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" /> }
)

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  
  // State for search
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; displayName: string } | null>(null)

  // FILTER & SORT LOGIC
  // If user searches a location, we calculate distance and sort by nearest
  const displayedProperties = useMemo(() => {
    let items = [...MOCK_INVENTORY]

    if (userLocation) {
      items = items.map(item => ({
        ...item,
        // Add a temporary 'distance' property for sorting/display
        distance: GeoCalc.getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      }))
      // Sort: Nearest first
      items.sort((a: any, b: any) => a.distance - b.distance)
    }

    return items
  }, [userLocation])

  const selectedProp = displayedProperties.find(p => p.id === selectedId)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 300px 350px',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      backgroundColor: '#f3f4f6'
    }}>
      
      {/* COLUMN 1: MAP */}
      <div className="relative h-full border-r border-gray-200">
        <div className="absolute inset-0">
          <LeafletMap 
            items={displayedProperties} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
        </div>
        
        {/* Floating Search Status (Optional visual feedback on map) */}
        {userLocation && (
          <div className="absolute top-4 left-14 z-[1000] bg-white px-3 py-1 rounded shadow-md text-xs font-bold text-gray-700">
             📍 Center: {userLocation.displayName}
          </div>
        )}
      </div>

      {/* COLUMN 2: LIST (Now with Search + Distances) */}
      <div className="flex flex-col h-full bg-white border-r border-gray-200">
        {/* Search Bar sits at top of list */}
        <LocationSearch onLocationSelect={setUserLocation} />
        
        <div className="flex-1 overflow-y-auto">
          {displayedProperties.map((prop: any) => (
            <div 
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedId === prop.id ? 'bg-blue-100 border-l-4 border-blue-500' : ''}`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm text-gray-800">{prop.name}</h3>
                {prop.distance !== undefined && (
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                    {prop.distance} km
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">{prop.location}</p>
              <p className="text-sm font-medium text-blue-600 mt-1">{prop.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 3: DETAILS */}
      <div className="flex flex-col h-full bg-white">
        {selectedProp ? (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">{selectedProp.name}</h2>
            {/* Show distance here too if search is active */}
            {selectedProp.distance !== undefined && (
               <div className="mb-4 text-sm text-gray-600">
                 Distance from {userLocation?.displayName}: <strong>{selectedProp.distance} km</strong>
               </div>
            )}
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-xs text-gray-500 uppercase">Price</p>
                <p className="text-xl font-bold text-gray-900">{selectedProp.price}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-xs text-gray-500 uppercase">Configuration</p>
                <p className="text-lg text-gray-900">{selectedProp.configuration}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
            <p>Select a property</p>
          </div>
        )}
      </div>

    </div>
  )
}
