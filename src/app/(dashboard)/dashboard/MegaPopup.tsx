'use client'

import React, { useMemo } from 'react'
import { CheckCircle2, Zap, Droplets, LayoutTemplate, ShieldCheck, MapPin, Bus, School, ShoppingBag, Landmark } from 'lucide-react'
import { useDashboard } from './page'

export default function MegaPopup() {
  // Use the new smart handlers to keep the popup alive or close it
  const { hoveredRecId, properties, cancelHoverLeave, handleCardLeave } = useDashboard()

  const data = useMemo(() => 
    properties.find(p => p.id === hoveredRecId), 
    [hoveredRecId, properties]
  )

  if (!hoveredRecId || !data) return null

  // Helper to safely access dynamic fields if they exist, or fallback
  const specs = (data as any).specifications || {}
  const amenitiesDetailed = (data as any).amenities_detailed || {}
  const socialInfra = (data as any).social_infra || (data.nearby_locations ? transformNearby(data.nearby_locations) : {})

  return (
    <div 
      className="absolute top-4 left-4 z-[1000] w-[450px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-left-4 duration-200"
      // --- THE BRIDGE LOGIC ---
      onMouseEnter={cancelHoverLeave} // Mouse on popup -> Cancel the "leave" timer
      onMouseLeave={handleCardLeave}  // Mouse leaves popup -> Start the "leave" timer (300ms)
      // ------------------------
    >
      {/* Header Image Area */}
      <div className="h-32 bg-slate-100 relative bg-[url('https://images.unsplash.com/photo-1600596542815-27b88e365298?auto=format&fit=crop&w=800')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h2 className="text-xl font-bold leading-none mb-1">{data.name}</h2>
          <p className="text-sm opacity-90 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {data.location_area}, {data.zone} Zone
          </p>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-slate-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
          {data.price_display}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* Key Highlights */}
        <div className="grid grid-cols-2 gap-3">
          <InfoBadge icon={<ShieldCheck className="w-4 h-4 text-emerald-600"/>} label="RERA ID" value={(data as any).rera_id || "PRM/KA/RERA/..."} />
          <InfoBadge icon={<LayoutTemplate className="w-4 h-4 text-blue-600"/>} label="Possession" value={data.completion_duration || "Ready"} />
          <InfoBadge icon={<Zap className="w-4 h-4 text-amber-500"/>} label="Power" value="100% DG Backup" />
          <InfoBadge icon={<Droplets className="w-4 h-4 text-cyan-500"/>} label="Water" value="Cauvery + Bore" />
        </div>

        {/* Specifications (Dynamic JSON) */}
        {Object.keys(specs).length > 0 ? (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Building Specs</h3>
            <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-100">
              {Object.entries(specs).map(([key, val]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-slate-500 capitalize">{key.replace('_', ' ')}</span>
                  <span className="font-medium text-slate-800 text-right">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Fallback if specifications JSON is missing */
          <div className="grid grid-cols-2 gap-3">
             <InfoBadge icon={null} label="Config" value={data.configurations} />
             <InfoBadge icon={null} label="Floors" value={data.floor_levels || 'N/A'} />
          </div>
        )}

        {/* Detailed Amenities Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Premium Amenities</h3>
          <div className="flex flex-wrap gap-2">
             {/* Combine all amenity categories for display */}
             {Object.keys(amenitiesDetailed).length > 0 ? (
               Object.values(amenitiesDetailed).flat().map((item: any, i) => (
                 <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100 flex items-center gap-1.5">
                   <CheckCircle2 className="w-3 h-3" /> {item}
                 </span>
               ))
             ) : (
                /* Fallback to simple amenities array */
                (data.amenities || []).map((item, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-md border border-slate-100">
                    {item}
                  </span>
                ))
             )}
          </div>
        </div>

        {/* Nearby Infrastructure */}
        <div>
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Location Advantage</h3>
           <div className="space-y-3">
              {Object.keys(socialInfra).length > 0 ? (
                Object.entries(socialInfra).map(([key, val]) => (
                   <div key={key} className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        {getIconForKey(key)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{key.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500">{String(val)}</p>
                      </div>
                   </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">Location data loading...</p>
              )}
           </div>
        </div>

      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
        <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors">
          Download Brochure
        </button>
        <button className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold transition-colors">
          View Floor Plan
        </button>
      </div>
    </div>
  )
}

// Sub-components for cleaner code
const InfoBadge = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-0.5">{label}</p>
      <p className="text-xs font-bold text-slate-800 truncate">{value}</p>
    </div>
  </div>
)

const getIconForKey = (key: string) => {
  if (key.includes('metro') || key.includes('bus')) return <Bus className="w-4 h-4 text-slate-600"/>
  if (key.includes('school') || key.includes('college')) return <School className="w-4 h-4 text-slate-600"/>
  if (key.includes('mall') || key.includes('market')) return <ShoppingBag className="w-4 h-4 text-slate-600"/>
  if (key.includes('temple') || key.includes('worship')) return <Landmark className="w-4 h-4 text-slate-600"/>
  return <MapPin className="w-4 h-4 text-slate-600"/>
}

// Fallback helper to convert old nearby_locations format if needed
function transformNearby(nearby: Record<string, string>) {
  return nearby;
}
