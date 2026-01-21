'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import LocationSearch from '@/modules/map-engine/components/LocationSearch'
import PropertyFilters from '@/modules/inventory/components/PropertyFilters'
import { MOCK_INVENTORY } from '@/modules/inventory/data/mock'
import { GeoCalc } from '@/modules/map-engine/utils/geo-calc'
import { FilterEngine } from '@/modules/inventory/utils/filter-engine'
import { FilterCriteria } from '@/modules/inventory/types'

const LeafletMap = dynamic(
  () => import('@/modules/map-engine/components/LeafletMap'),
  { ssr: false, loading: () => <div style={{height:'100%', background:'#eee'}}>Loading Map...</div> }
)

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; displayName: string } | null>(null)
  const [filters, setFilters] = useState<FilterCriteria>({})
  
  // NEW: UI State
  const [hoveredRecId, setHoveredRecId] = useState<string | null>(null);
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | undefined>(undefined);

  // 1. FILTER & SEARCH LOGIC
  const displayedProperties = useMemo(() => {
    let items = [...MOCK_INVENTORY]
    items = FilterEngine.apply(items, filters);
    if (userLocation) {
      items = items.map(item => ({
        ...item,
        distance: GeoCalc.getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      }))
      items.sort((a: any, b: any) => a.distance - b.distance)
    }
    return items
  }, [userLocation, filters])

  // 2. SELECTED PROPERTY & SMART RANKING
  const selectedProp = useMemo(() => {
    return displayedProperties.find(p => p.id === selectedId)
  }, [selectedId, displayedProperties])

  const similarProperties = useMemo(() => {
    if (!selectedProp) return []
    
    // Scoring Logic
    const scored = MOCK_INVENTORY
      .filter(p => p.id !== selectedProp.id)
      .map(p => {
        let score = 0;
        const reasons: string[] = [];
        const dist = GeoCalc.getDistanceKm(selectedProp.lat, selectedProp.lng, p.lat, p.lng);
        
        // Distance Score
        if (dist < 5) { score += 40; reasons.push(`${dist}km away`); } 
        else if (dist < 10) { score += 20; reasons.push(`${dist}km away`); }

        // Price Score
        const priceDiff = Math.abs(p.priceValue - selectedProp.priceValue);
        const priceVariance = priceDiff / selectedProp.priceValue;
        if (priceVariance < 0.10) { score += 30; reasons.push('Same Price'); }
        else if (priceVariance < 0.20) { score += 15; }

        // Config Score
        if (p.configuration === selectedProp.configuration) { score += 30; reasons.push('Same Config'); }

        return { ...p, score, reasons, distFromSelected: dist };
      });

    return scored.filter(p => p.score >= 40).sort((a, b) => b.score - a.score).slice(0, 3);
  }, [selectedProp])

  // 3. HANDLERS
  const copyToWhatsApp = () => {
    if (!selectedProp) return;
    const text = `*Project:* ${selectedProp.name}\n*Location:* ${selectedProp.location}\n*Price:* ${selectedProp.price}\n*Type:* ${selectedProp.configuration}\n*Facing:* ${selectedProp.facingDir || 'N/A'}\n\nBook site visit?`;
    navigator.clipboard.writeText(text);
    alert('Summary copied! Paste in WhatsApp.');
  }

  // DUAL VIEW LOGIC
  const handleRecommendationClick = (recItem: any) => {
    setSelectedId(recItem.id);
    
    // If we have a search location, fit bounds to show BOTH Search + Recommendation
    if (userLocation) {
      const lat1 = userLocation.lat;
      const lng1 = userLocation.lng;
      const lat2 = recItem.lat;
      const lng2 = recItem.lng;
      
      setMapBounds([
        [Math.min(lat1, lat2), Math.min(lng1, lng2)], // SouthWest
        [Math.max(lat1, lat2), Math.max(lng1, lng2)]  // NorthEast
      ]);
    } else {
       // Reset bounds if no search, just rely on center
       setMapBounds(undefined);
    }
  };

  const mapCenter: [number, number] | undefined = userLocation ? [userLocation.lat, userLocation.lng] : undefined

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 300px 350px', height: '100vh', width: '100vw', overflow: 'hidden', fontFamily: 'sans-serif'
    }}>
      
      {/* COLUMN 1: MAP */}
      <div style={{ position: 'relative', height: '100%', borderRight: '1px solid #ccc' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <LeafletMap 
            items={displayedProperties} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
            center={mapCenter}
            bounds={mapBounds}
          />
        </div>
        {userLocation && (
          <div style={{ position: 'absolute', top: 10, left: 50, zIndex: 1000, background: 'white', padding: '5px 10px', borderRadius: 4, boxShadow: '0 2px 5px rgba(0,0,0,0.2)', fontSize: '12px', fontWeight: 'bold' }}>
             📍 Center: {userLocation.displayName}
          </div>
        )}
      </div>

      {/* COLUMN 2: LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderRight: '1px solid #ccc' }}>
        <LocationSearch onLocationSelect={setUserLocation} />
        <PropertyFilters filters={filters} onChange={setFilters} />
        <div style={{ padding: '8px 16px', background: '#f8f9fa', fontSize: '11px', color: '#666', borderBottom: '1px solid #eee' }}>
          Found {displayedProperties.length} properties
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {displayedProperties.map((prop: any) => (
            <div 
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              style={{
                padding: '16px', borderBottom: '1px solid #eee', cursor: 'pointer',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontWeight: '500', color: '#0066ff', fontSize: '14px' }}>{prop.price}</span>
                <span style={{ fontSize: '11px', background: '#eee', padding: '2px 6px', borderRadius: '10px' }}>{prop.configuration}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 3: DETAILS */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', overflowY: 'auto' }}>
        {selectedProp ? (
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
               <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', lineHeight: 1.2 }}>{selectedProp.name}</h2>
               <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '12px' }}>{selectedProp.zone}</span>
            </div>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>📍 {selectedProp.location}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              <button onClick={copyToWhatsApp} style={{ background: '#25D366', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                Copy for WhatsApp
              </button>
              <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                📅 Book Visit
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>Price</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{selectedProp.price}</p>
              </div>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>Config</p>
                <p style={{ margin: 0, fontSize: '18px' }}>{selectedProp.configuration}</p>
              </div>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>Facing</p>
                <p style={{ margin: 0, fontSize: '16px' }}>{selectedProp.facingDir || 'East'}</p>
              </div>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>Distance</p>
                <p style={{ margin: 0, fontSize: '16px' }}>{selectedProp.distance ? `${selectedProp.distance} km` : '-'}</p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#444' }}>💡 Smart Alternatives</h3>
              
              {similarProperties.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {similarProperties.map(sim => (
                    <div 
                      key={sim.id} 
                      onClick={() => handleRecommendationClick(sim)} // CLICK HANDLER
                      onMouseEnter={() => setHoveredRecId(sim.id)} // HOVER START
                      onMouseLeave={() => setHoveredRecId(null)}   // HOVER END
                      style={{ position: 'relative', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
                        <span>{sim.name}</span>
                        <span style={{ color: '#0066ff' }}>{sim.price}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '6px 0' }}>
                        {sim.reasons.map((r: string) => (
                          <span key={r} style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>{r}</span>
                        ))}
                      </div>

                      <div style={{ fontSize: '11px', color: '#666' }}>Features: {sim.amenities?.slice(0, 2).join(', ') || 'Standard'}</div>
                      
                      {/* BUBBLE TAB POPUP */}
                      {hoveredRecId === sim.id && (
                        <div style={{
                          position: 'absolute', bottom: '100%', left: '0', width: '280px', background: 'white',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderRadius: '8px', padding: '12px', zIndex: 50,
                          border: '1px solid #ddd', marginBottom: '10px'
                        }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#111' }}>✨ Why this matches?</h4>
                          <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.4', margin: 0 }}>
                            Located <strong>{sim.distFromSelected}km</strong> from selected. 
                            Includes {sim.amenities?.join(', ')}. 
                            Excellent {sim.configuration} option in {sim.zone} zone.
                          </p>
                          <div style={{ marginTop: '8px', fontSize: '11px', color: '#0066ff', fontWeight: 'bold' }}>Click to see relative location 📍</div>
                          <div style={{ position: 'absolute', bottom: '-6px', left: '20px', width: '10px', height: '10px', background: 'white', transform: 'rotate(45deg)', borderRight: '1px solid #ddd', borderBottom: '1px solid #ddd' }}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>No strong matches found nearby.</p>
              )}
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            <p>Select a property</p>
          </div>
        )}
      </div>
    </div>
  )
}
