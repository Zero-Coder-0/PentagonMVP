'use client'

import React, { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import LocationSearch from '@/modules/map-engine/components/LocationSearch'
import FilterModal from '@/modules/inventory/components/FilterModal'
import { MOCK_INVENTORY } from '@/modules/inventory/data/mock'
import { GeoCalc } from '@/modules/map-engine/utils/geo-calc'
import { FilterEngine } from '@/modules/inventory/utils/filter-engine'
import { FilterCriteria } from '@/modules/inventory/types'

// Map Import
const LeafletMap = dynamic(
  () => import('@/modules/map-engine/components/LeafletMap'),
  { ssr: false, loading: () => <div style={{height:'100%', background:'#eee', display:'flex', justifyContent:'center', alignItems:'center'}}>Loading Map Engine...</div> }
)

export default function DashboardPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; displayName: string } | null>(null)
  const [filters, setFilters] = useState<FilterCriteria>({})
  
  // Interactions
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [hoveredRecId, setHoveredRecId] = useState<string | null>(null) // For Right Panel Cards
  const [hoveredListId, setHoveredListId] = useState<string | null>(null) // For Middle Panel List (Mega Popup)
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | undefined>(undefined)

  // 1. FILTER & SEARCH LOGIC
  const displayedProperties = useMemo(() => {
    let items = [...MOCK_INVENTORY]
    items = FilterEngine.apply(items, filters);
    
    if (userLocation) {
      items = items.map(item => ({
        ...item,
        distance: GeoCalc.getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      }))
      items.sort((a: any, b: any) => a.distance - (b.distance || 0))
    }
    return items
  }, [userLocation, filters])

  // 2. SELECTED PROPERTY & SMART RANKING
  const selectedProp = useMemo(() => displayedProperties.find(p => p.id === selectedId), [selectedId, displayedProperties])
  const hoveredListProp = useMemo(() => displayedProperties.find(p => p.id === hoveredListId), [hoveredListId, displayedProperties])

  const similarProperties = useMemo(() => {
    if (!selectedProp) return []
    return MOCK_INVENTORY
      .filter(p => p.id !== selectedProp.id)
      .map(p => {
        let score = 0;
        const reasons: string[] = [];
        const dist = GeoCalc.getDistanceKm(selectedProp.lat, selectedProp.lng, p.lat, p.lng);
        
        if (dist < 5) { score += 40; reasons.push(`${dist}km away`); }
        else if (dist < 10) { score += 20; }

        const priceDiff = Math.abs(p.priceValue - selectedProp.priceValue);
        if ((priceDiff / selectedProp.priceValue) < 0.10) { score += 30; reasons.push('Same Price'); }
        if (p.configuration === selectedProp.configuration) { score += 30; reasons.push('Same Config'); }

        return { ...p, score, reasons, distFromSelected: dist };
      })
      .filter(p => p.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [selectedProp])

  // 3. HANDLERS
  const handleRecommendationClick = (recItem: any) => {
    setSelectedId(recItem.id);
    if (userLocation) {
      setMapBounds([
        [Math.min(userLocation.lat, recItem.lat), Math.min(userLocation.lng, recItem.lng)],
        [Math.max(userLocation.lat, recItem.lat), Math.max(userLocation.lng, recItem.lng)]
      ]);
    } else {
       setMapBounds(undefined);
    }
  };
  
  const copyToWhatsApp = () => {
    if (!selectedProp) return;
    const text = `*Project:* ${selectedProp.name}\n*Location:* ${selectedProp.location}\n*Price:* ${selectedProp.price}\n*Type:* ${selectedProp.configuration}\n*Status:* ${selectedProp.status || 'N/A'}\n\nBook site visit?`;
    navigator.clipboard.writeText(text);
    alert('Summary copied! Paste in WhatsApp.');
  }

  const mapCenter: [number, number] | undefined = userLocation ? [userLocation.lat, userLocation.lng] : undefined

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 320px 380px',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
      position: 'relative' // Needed for fixed popup positioning context
    }}>
      
      {/* ==================================================================================
          MEGA POPUP (NARROWER + SCROLLABLE)
          Position: Fixed Right Side (Over Details Panel)
          Width: 350px (Narrower)
          Height: 80vh (Taller)
      ================================================================================== */}
      {hoveredListProp && (
        <div style={{
          position: 'fixed',
          top: '10%',
          right: '20px', // Pushed to the right edge
          width: '350px', // NARROWER (Requested)
          maxHeight: '80vh', // TALLER (Requested)
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          border: '1px solid #e5e7eb',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' // Internal scroll handled by content div
        }}>
          {/* Header Image Area */}
          <div style={{ padding: '20px', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
             <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{hoveredListProp.name}</h2>
             <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {hoveredListProp.status === 'Ready' ? 'Ready to Move' : 'Under Construction'}
                </span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{hoveredListProp.price}</span>
             </div>
          </div>

          {/* SCROLLABLE CONTENT AREA */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
             
             {/* Key Specs */}
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Config</div>
                   <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{hoveredListProp.configuration}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Size</div>
                   <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{hoveredListProp.sqFt ? `${hoveredListProp.sqFt} sqft` : 'N/A'}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Zone</div>
                   <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{hoveredListProp.zone}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                   <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Facing</div>
                   <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{hoveredListProp.facingDir || 'Any'}</div>
                </div>
             </div>

             {/* Inventory Details */}
             <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                   Inventory Breakdown
                </h4>
                {hoveredListProp.status === 'Ready' ? (
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {Object.entries(hoveredListProp.unitsAvailable || {}).map(([type, count]) => (
                         <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px', background: '#f1f5f9', borderRadius: '6px' }}>
                           <span style={{ fontWeight: '500' }}>{type}</span>
                           <span style={{ fontWeight: 'bold', color: count > 0 ? '#16a34a' : '#ef4444' }}>{count} Units Left</span>
                         </div>
                      ))}
                   </div>
                ) : (
                   <div style={{ padding: '10px', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '6px' }}>
                      <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                         🏗️ Completion: <strong>{hoveredListProp.completionDate}</strong>
                      </p>
                      <p style={{ fontSize: '12px', color: '#92400e', margin: '4px 0 0 0' }}>
                         Total Project Units: <strong>{hoveredListProp.totalUnits}</strong>
                      </p>
                   </div>
                )}
             </div>

             {/* Amenities List */}
             <div>
                <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                   Premium Amenities
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                   {hoveredListProp.amenities?.map(am => (
                      <span key={am} style={{ fontSize: '11px', background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '4px 8px', borderRadius: '20px' }}>
                        {am}
                      </span>
                   ))}
                </div>
             </div>
          </div>
          
          {/* Footer Hint */}
          <div style={{ padding: '12px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
             Click property to view full details
          </div>
        </div>
      )}

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

      {/* COLUMN 2: LIST (FIXED SCROLL) */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'white', borderRight: '1px solid #ccc' }}>
        <LocationSearch onLocationSelect={setUserLocation} />
        
        {/* NEW SINGLE FILTER BUTTON */}
        <div style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
          <button 
            onClick={() => setIsFilterOpen(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f3f4f6', color: '#374151', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer' }}
          >
            <span>⚙️ Advanced Filters</span>
            {(filters.status || filters.priceRange) && (
              <span style={{ background: '#2563eb', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px' }}>Active</span>
            )}
          </button>
        </div>

        {/* MODAL */}
        <FilterModal 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)} 
          filters={filters} 
          onApply={setFilters} 
        />
        
        <div style={{ padding: '8px 16px', background: '#f8f9fa', fontSize: '11px', color: '#666', borderBottom: '1px solid #eee' }}>
          Found {displayedProperties.length} properties
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}> 
          {displayedProperties.map((prop: any) => (
            <div 
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              // HOVER TRIGGER FOR MEGA POPUP
              onMouseEnter={() => setHoveredListId(prop.id)}
              onMouseLeave={() => setHoveredListId(null)}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span style={{ fontWeight: '500', color: '#0066ff', fontSize: '14px' }}>{prop.price}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                   <span style={{ fontSize: '11px', background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{prop.configuration}</span>
                   {prop.status === 'Ready' && <span style={{ fontSize: '10px', background: '#dcfce7', color: '#166534', padding: '2px 4px', borderRadius: '4px' }}>RTM</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COLUMN 3: DETAILS (With Bubble Tab) */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'white', overflowY: 'auto' }}>
        {selectedProp ? (
          <div style={{ padding: '24px' }}>
            
            {/* Header & Actions */}
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>{selectedProp.name}</h2>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
               <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px' }}>{selectedProp.zone}</span>
               <span style={{ fontSize: '12px', background: selectedProp.status === 'Ready' ? '#dcfce7' : '#dbeafe', color: selectedProp.status === 'Ready' ? '#166534' : '#1e40af', padding: '4px 8px', borderRadius: '4px' }}>
                 {selectedProp.status || 'Ready'}
               </span>
            </div>
            
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>📍 {selectedProp.location}</p>

             {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              <button 
                onClick={copyToWhatsApp}
                style={{ background: '#25D366', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Copy for WhatsApp
              </button>
              <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                📅 Book Visit
              </button>
            </div>

            {/* Main Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>Price</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{selectedProp.price}</p>
              </div>
              <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', color: '#888' }}>Units</p>
                <p style={{ margin: 0, fontSize: '18px' }}>{selectedProp.totalUnits || 'N/A'}</p>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#444' }}>💡 Similar Nearby Options</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {similarProperties.map(sim => (
                  <div 
                    key={sim.id} 
                    onClick={() => handleRecommendationClick(sim)}
                    onMouseEnter={() => setHoveredRecId(sim.id)}
                    onMouseLeave={() => setHoveredRecId(null)}
                    style={{ position: 'relative', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
                      <span>{sim.name}</span>
                      <span style={{ color: '#0066ff' }}>{sim.price}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '6px 0' }}>
                      {sim.reasons.map((r: string) => (
                        <span key={r} style={{ fontSize: '10px', background: '#ecfdf5', color: '#047857', padding: '2px 6px', borderRadius: '4px' }}>{r}</span>
                      ))}
                    </div>

                    {hoveredRecId === sim.id && (
                      <div style={{
                        position: 'absolute', bottom: '105%', left: '-20px', width: '320px', background: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px', zIndex: 999,
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{sim.name} Quick View</span>
                          <span style={{ fontSize: '11px', background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Best Value</span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#555', marginBottom: '8px', lineHeight: '1.5' }}>
                           An excellent {sim.configuration} unit located in {sim.zone}. Features modern amenities like {sim.amenities?.join(', ') || 'Pool & Gym'}.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#444' }}>
                           <span style={{ display:'flex', alignItems:'center' }}>🚇 Metro (2km)</span>
                           <span style={{ display:'flex', alignItems:'center' }}>🛍️ Mall (5km)</span>
                        </div>
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #eee', fontSize: '11px', color: '#0066ff', fontWeight: 'bold', textAlign: 'right' }}>
                          Click to compare location 📍
                        </div>
                        <div style={{ position: 'absolute', bottom: '-8px', left: '40px', width: '16px', height: '16px', background: 'white', transform: 'rotate(45deg)', borderRight: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
