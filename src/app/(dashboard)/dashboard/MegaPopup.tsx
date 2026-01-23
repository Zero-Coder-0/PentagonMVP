'use client'

import React from 'react'
import { X, Building2, Map as MapIcon, Calendar, User, Phone, Layers, CheckCircle2 } from 'lucide-react'
import { useDashboard } from './page'
import styles from './Dashboard.module.css'

export default function MegaPopup() {
  const { hoveredListId, properties, setHoveredListId } = useDashboard()
  
  // Find property from shared context
  const prop = React.useMemo(() => 
    properties.find(p => p.id === hoveredListId), 
    [hoveredListId, properties]
  )

  if (!prop) return null

  // Safe parsing of JSONB fields (handles nulls)
  const unitsMap = prop.units_available || {}
  const nearbyMap = prop.nearby_locations || {}
  const amenitiesList = prop.amenities || []

  return (
    <div className={styles.megaPopup} onMouseLeave={() => setHoveredListId(null)}>
      {/* 1. Header with Gradient & Close */}
      <div className={styles.megaHeader}>
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">
              {prop.status === 'Ready' ? 'Ready to Move' : 'Under Construction'}
            </span>
            <h2 className="text-xl font-bold leading-tight">{prop.name}</h2>
            <p className="opacity-90 text-xs flex items-center gap-1 mt-1">
              <MapIcon className="w-3 h-3" /> {prop.location_area}
            </p>
          </div>
          <button 
            onClick={() => setHoveredListId(null)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
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

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
        
        {/* Key Specs Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase">Configuration</span>
            </div>
            <div className="font-bold text-slate-800 text-sm">{prop.configurations}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase">Floors</span>
            </div>
            <div className="font-bold text-slate-800 text-sm">{prop.floor_levels || 'G+12'}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
             <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Facing</div>
             <div className="font-bold text-slate-800 text-sm">{prop.facing_direction || 'Any'}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
             <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Size Range</div>
             <div className="font-bold text-slate-800 text-sm">{prop.sq_ft_range || 'N/A'}</div>
          </div>
        </div>

        {/* Inventory Breakdown (from JSONB) */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">
            Availability
          </h4>
          <div className="space-y-2">
            {Object.entries(unitsMap).length > 0 ? (
              Object.entries(unitsMap).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">{type}</span>
                  {/* FIX 1: Explicit String Casting */}
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

        {/* Amenities Chips */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">
            Premium Amenities
          </h4>
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((am) => (
              <span key={am} className="inline-flex items-center gap-1 text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-600 font-medium">
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                {am}
              </span>
            ))}
          </div>
        </div>

        {/* Nearby Locations (from JSONB) */}
        <div>
           <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">
            Nearby Access
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(nearbyMap).map(([place, dist]) => (
              <div key={place} className="flex justify-between text-xs bg-white p-2 rounded border border-slate-100">
                <span className="text-slate-600 capitalize">{place.replace('_', ' ')}</span>
                {/* FIX 2: Explicit String Casting */}
                <span className="font-bold text-slate-800">{String(dist)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info Footer */}
        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
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
      
      {/* Helper Text */}
      <div className="p-2 bg-slate-900 text-white text-[10px] text-center font-medium">
         Click card to view full details & share
      </div>
    </div>
  )
}
