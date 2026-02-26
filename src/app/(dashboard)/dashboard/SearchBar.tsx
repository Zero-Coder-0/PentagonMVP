'use client'

import React from 'react'
import { MapPin, X } from 'lucide-react'
import { useDashboard } from './page'
import LocationSearch from '@/modules/map-engine/components/LocationSearch'

const QUICK_LOCATIONS = [
  { name: 'Hebbal', lat: 13.0354, lng: 77.5988 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7500 },
  { name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
  { name: 'Sarjapur', lat: 12.9237, lng: 77.6547 },
]

export default function SearchBar() {
  const { setUserLocation, setMapBounds, userLocation } = useDashboard()

  const handleLocationUpdate = (lat: number, lng: number, name: string) => {
    setUserLocation({ lat, lng, displayName: name })
    setMapBounds([
      [lat - 0.03, lng - 0.03], 
      [lat + 0.03, lng + 0.03]
    ])
  }

  const handleClearLocation = () => {
    setUserLocation(null)
    setMapBounds(undefined)
  }

  return (
    <div className="flex-shrink-0 bg-white p-3 z-10 border-b border-slate-200">
      
      <div className="flex items-center gap-2">
        
        {/* LEFT: Quick Location Chips */}
        <div className="flex gap-2 flex-shrink-0">
          {QUICK_LOCATIONS.map(loc => (
            <button 
              key={loc.name}
              onClick={() => handleLocationUpdate(loc.lat, loc.lng, loc.name)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                userLocation?.displayName === loc.name
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-blue-400'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {loc.name}
            </button>
          ))}
        </div>

        {/* CENTER: Search Bar + Current Location Display */}
        <div className="flex-1 flex items-center gap-2">
          
          {/* Search Input */}
          <div className="flex-1 rounded-xl overflow-hidden border border-slate-300 shadow-sm">
            <LocationSearch 
              onLocationSelect={(lat, lng, label) => handleLocationUpdate(lat, lng, label)}
            />
          </div>

          {/* Current Location Badge with Clear */}
          {userLocation && (
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-300 px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-900">
                  {userLocation.displayName}
                </span>
              </div>
              <button 
                onClick={handleClearLocation}
                className="p-0.5 hover:bg-blue-200 rounded-lg transition"
                title="Clear location"
              >
                <X size={14} className="text-blue-700" />
              </button>
            </div>
          )}
          
        </div>

      </div>
      
    </div>
  )
}
