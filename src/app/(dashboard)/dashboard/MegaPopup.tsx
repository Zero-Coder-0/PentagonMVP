'use client'

import React from 'react'
import { X, Building2, Map as MapIcon, Calendar, User, Phone, Layers, CheckCircle2 } from 'lucide-react'
import { useDashboard } from './page'
import styles from './Dashboard.module.css'

// 1. Reusable Component for Specs to remove repetitive HTML
const SpecCard = ({ icon: Icon, label, value }: { icon?: any, label: string, value: string }) => (
  <div className={styles.specCard}>
    {Icon ? (
      <div className="flex items-center gap-2 text-slate-500 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase">{label}</span>
      </div>
    ) : (
      <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">{label}</div>
    )}
    <div className="font-bold text-slate-800 text-sm">{value}</div>
  </div>
)

export default function MegaPopup() {
  const { hoveredListId, properties, setHoveredListId } = useDashboard()
  
  const prop = React.useMemo(() => 
    properties.find(p => p.id === hoveredListId), 
    [hoveredListId, properties]
  )

  if (!prop) return null

  const unitsMap = prop.units_available || {}
  const nearbyMap = prop.nearby_locations || {}
  const amenitiesList = prop.amenities || []

  // 2. Data Definition for the loop (Easy to extend later)
  const specsList = [
    { icon: Layers, label: 'Configuration', value: prop.configurations },
    { icon: Building2, label: 'Floors', value: prop.floor_levels || 'G+12' },
    { label: 'Facing', value: prop.facing_direction || 'Any' },
    { label: 'Size Range', value: prop.sq_ft_range || 'N/A' }
  ]

  return (
    <div className={styles.megaPopup} onMouseLeave={() => setHoveredListId(null)}>
      {/* Header */}
      <div className={styles.megaHeader}>
        <div className="flex justify-between items-start">
          <div>
            <span className={styles.statusBadgeLight}>
              {prop.status === 'Ready' ? 'Ready to Move' : 'Under Construction'}
            </span>
            <h2 className="text-xl font-bold leading-tight">{prop.name}</h2>
            <p className="opacity-90 text-xs flex items-center gap-1 mt-1">
              <MapIcon className="w-3 h-3" /> {prop.location_area}
            </p>
          </div>
          <button onClick={() => setHoveredListId(null)} className={styles.closeBtn}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-4 flex justify-between items-end">
          <div className="text-2xl font-bold">{prop.price_display}</div>
          <div className="text-right">
             <div className="text-[10px] opacity-80 uppercase">Per Sq.Ft</div>
             <div className="font-semibold text-sm">₹{prop.price_per_sqft}/-</div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className={styles.scrollContent}>
        
        {/* Key Specs Grid - Refactored to Loop */}
        <div className="grid grid-cols-2 gap-3">
          {specsList.map((spec, i) => (
            <SpecCard key={i} {...spec} />
          ))}
        </div>

        {/* Availability Section */}
        <div>
          <h4 className={styles.sectionHeader}>Availability</h4>
          <div className="space-y-2">
            {Object.entries(unitsMap).length > 0 ? (
              Object.entries(unitsMap).map(([type, count]) => (
                <div key={type} className={styles.availabilityItem}>
                  <span className="font-semibold text-slate-700">{type}</span>
                  <span className={`font-bold ${Number(count) < 3 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {String(count)} Units Left
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">Availability data synced with builder</div>
            )}
          </div>
        </div>

        {/* Amenities Section */}
        <div>
          <h4 className={styles.sectionHeader}>Premium Amenities</h4>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((am) => (
              <span key={am} className={styles.amenityChip}>
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                {am}
              </span>
            ))}
          </div>
        </div>

        {/* Nearby Access Section */}
        <div>
           <h4 className={styles.sectionHeader}>Nearby Access</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(nearbyMap).map(([place, dist]) => (
              <div key={place} className={styles.nearbyItem}>
                <span className="text-slate-600 capitalize">{place.replace('_', ' ')}</span>
                <span className="font-bold text-slate-800">{String(dist)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={styles.contactFooter}>
           <div className="flex items-center gap-2 mb-1">
             <User className="w-3 h-3 text-slate-500" />
             <span className="text-xs font-bold text-slate-700">{prop.contact_person || 'Sales Desk'}</span>
           </div>
           <div className="flex items-center gap-2">
             <Phone className="w-3 h-3 text-slate-500" />
             <span className="text-xs font-bold text-slate-700">{prop.contact_phone}</span>
           </div>
           <div className="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-1">
             <Calendar className="w-3 h-3" />
             Completion: <span className="font-bold text-slate-700">{prop.completion_duration}</span>
           </div>
        </div>
      </div>
      
      <div className={styles.helperText}>
         Click card to view full details & share
      </div>
    </div>
  )
}
