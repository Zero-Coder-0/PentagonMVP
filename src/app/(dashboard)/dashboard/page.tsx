'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import LocationSearch from '@/modules/map-engine/components/LocationSearch'
import { MOCK_INVENTORY } from '@/modules/inventory/data/mock'
import { GeoCalc } from '@/modules/map-engine/utils/geo-calc'

// Dynamically import map (No SSR)
const LeafletMap = dynamic(
  () => import('@/modules/map-engine/components/LeafletMap'),
  { ssr: false, loading: () => <div style={{height: '100%', width: '100%', background: '#eee'}}>Loading Map...</div> }
)

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; displayName: string } | null>(null)

  // Filter & Sort Logic
  const displayedProperties = useMemo(() => {
    let items = [...MOCK_INVENTORY]
    if (userLocation) {
      items = items.map(item => ({
        ...item,
        distance: GeoCalc.getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      }))
      items.sort((a: any, b: any) => a.distance - b.distance)
    }
    return items
  }, [userLocation])

  const selectedProp = displayedProperties.find(p => p.id === selectedId)
  const mapCenter: [number, number] | undefined = userLocation ? [userLocation.lat, userLocation.lng] : undefined

  // ==================================================================================
  // CRITICAL FIX: HARDCODED STYLES TO FORCE LAYOUT
  // Tailwind classes are removed from the wrapper to guarantee grid works
  // ==================================================================================
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 300px 350px', // Map | List | Details
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      fontFamily: 'sans-serif' // Fallback font
    }}>
      
      {/* COLUMN 1: MAP */}
      <div style={{ position: 'relative', height: '100%', width: '100%', borderRight: '1px solid #ccc' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <LeafletMap 
            items={displayedProperties} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
            center={mapCenter}
          />
        </div>
        
        {/* Floating Search Status */}
        {userLocation && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50px',
            zIndex: 1000,
            background: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
             📍 Center: {userLocation.displayName}
          </div>
        )}
      </div>

      {/* COLUMN 2: LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRight: '1px solid #ccc' }}>
        <LocationSearch onLocationSelect={setUserLocation} />
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {displayedProperties.map((prop: any) => (
            <div 
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              style={{
                padding: '16px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                background: selectedId === prop.id ? '#e6f0ff' : 'white',
                borderLeft: selectedId === prop.id ? '4px solid #0066ff' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{prop.name}</h3>
                {prop.distance !== undefined && (
                  <span style={{ fontSize: '12px', color: 'green', background: '#e6fffa', padding: '2px 5px', borderRadius: '4px' }}>
                    {prop.distance} km
                  </span>
                )}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666' }}>{prop.location}</p>
              <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: '500', color: '#0066ff' }}>{prop.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 3: DETAILS */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', overflowY: 'auto' }}>
        {selectedProp ? (
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{selectedProp.name}</h2>
            {selectedProp.distance !== undefined && (
               <div style={{ marginBottom: '16px', fontSize: '14px', color: '#555' }}>
                 Distance: <strong>{selectedProp.distance} km</strong>
               </div>
            )}
            
            <div style={{ marginBottom: '16px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>Price</p>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{selectedProp.price}</p>
            </div>
            
             <div style={{ marginBottom: '16px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>Configuration</p>
              <p style={{ margin: 0, fontSize: '18px' }}>{selectedProp.configuration}</p>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            <p>Select a property to view details</p>
          </div>
        )}
      </div>

    </div>
  )
}
