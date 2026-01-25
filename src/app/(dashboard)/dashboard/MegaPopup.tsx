'use client'

import React, { useMemo } from 'react'
import { 
  CheckCircle2, Zap, Droplets, LayoutTemplate, ShieldCheck, 
  MapPin, Download, FileText, ExternalLink, 
  Dumbbell, TreePine, Waves, Landmark, ShoppingBag, GraduationCap
} from 'lucide-react'
import { useDashboard } from './page'

// Icon mapper for amenities
const AMENITY_ICONS: any = {
  wellness: <Waves className="w-4 h-4 text-blue-500"/>,
  sports: <Dumbbell className="w-4 h-4 text-orange-500"/>,
  leisure: <TreePine className="w-4 h-4 text-green-500"/>,
  worship: <Landmark className="w-4 h-4 text-amber-500"/>,
  default: <CheckCircle2 className="w-4 h-4 text-slate-400"/>
}

// Icon mapper for social infra
const INFRA_ICONS: any = {
  school: <GraduationCap className="w-4 h-4 text-indigo-500"/>,
  mall: <ShoppingBag className="w-4 h-4 text-pink-500"/>,
  metro: <Zap className="w-4 h-4 text-yellow-500"/>,
  default: <MapPin className="w-4 h-4 text-slate-400"/>
}

export default function MegaPopup() {
  const { hoveredRecId, properties, cancelHoverLeave, handleCardLeave, setSelectedId } = useDashboard()

  const data = useMemo(() => 
    properties.find(p => p.id === hoveredRecId), 
    [hoveredRecId, properties]
  )

  if (!hoveredRecId || !data) return null

  // Safely access JSONB fields with fallbacks
  const amenities = data.amenities_detailed || {}
  const infra = data.social_infra || {}
  const units = data.units_available || {}
  const media = data.media || { images: [], brochure: '', floor_plan: '' }

  // Action Handlers
  const handleDownload = (url?: string, type?: string) => {
    if (url) window.open(url, '_blank');
    else alert(`${type} not available for this property yet.`);
  }

  const handleMoreDetails = () => {
    setSelectedId(data.id); // Opens the Right Panel
  }

  return (
    <div 
      className="absolute top-4 left-4 z-[1000] w-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-left-4 duration-200"
      onMouseEnter={cancelHoverLeave}
      onMouseLeave={handleCardLeave}
    >
      {/* 1. Header Image Area */}
      <div className="h-36 relative bg-slate-200">
        {media.images?.[0] ? (
          <img src={media.images[0]} alt={data.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute bottom-4 left-5 text-white">
          <h2 className="text-2xl font-bold leading-none mb-1">{data.name}</h2>
          <p className="text-sm opacity-90 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-yellow-400" /> {data.location_area}, {data.zone} Zone
          </p>
        </div>
        
        <div className="absolute bottom-4 right-5 flex flex-col items-end">
           <span className="bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-bold shadow-sm mb-1">
            {data.price_display}
           </span>
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${data.status === 'Ready' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
             {data.status}
           </span>
        </div>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* A. Inventory Grid (Sales Pitch Critical) */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Status</h3>
             <span className="text-[10px] text-slate-400">Live Updates</span>
          </div>
          {Object.keys(units).length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(units).map(([type, count]) => (
                <div key={type} className={`p-2 rounded border text-center ${count < 3 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-xs font-bold text-slate-700">{type}</div>
                  <div className={`text-sm font-bold ${count < 3 ? 'text-red-600' : 'text-slate-900'}`}>
                    {count} Units
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400 italic bg-slate-50 p-3 rounded text-center">
              Inventory data currently unavailable.
            </div>
          )}
        </section>

        {/* B. Key Highlights */}
        <div className="grid grid-cols-2 gap-3">
          <InfoBadge icon={<ShieldCheck className="w-4 h-4 text-emerald-600"/>} label="RERA ID" value={data.rera_id || "Pending"} />
          <InfoBadge icon={<LayoutTemplate className="w-4 h-4 text-blue-600"/>} label="Possession" value={data.completion_duration || "Ready"} />
          <InfoBadge icon={<Zap className="w-4 h-4 text-amber-500"/>} label="Power" value="100% Backup" />
          <InfoBadge icon={<Droplets className="w-4 h-4 text-cyan-500"/>} label="Water" value="Cauvery + Bore" />
        </div>

        {/* C. Amenities & Infra (Tabs Style) */}
        <div className="space-y-4">
           {/* Amenities */}
           {Object.keys(amenities).length > 0 && (
             <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Amenities</h3>
               <div className="flex flex-wrap gap-2">
                 {Object.entries(amenities).map(([category, items]: [string, any]) => (
                   items && items.length > 0 && (
                     <div key={category} className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-2 py-1 rounded text-xs text-slate-600 capitalize">
                       {AMENITY_ICONS[category] || AMENITY_ICONS.default}
                       <span>{items.join(', ')}</span>
                     </div>
                   )
                 ))}
               </div>
             </div>
           )}

           {/* Location / Infra */}
           {Object.keys(infra).length > 0 && (
             <div>
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nearby (Social Infra)</h3>
               <div className="grid grid-cols-2 gap-2">
                  {Object.entries(infra).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-100 pb-1">
                      <span className="flex items-center gap-1.5 capitalize">
                        {INFRA_ICONS[key.toLowerCase()] || INFRA_ICONS.default} {key}
                      </span>
                      <span className="font-bold">{String(val)}</span>
                    </div>
                  ))}
               </div>
             </div>
           )}
        </div>
      </div>

      {/* 3. Footer Actions */}
      <div className="p-4 border-t border-slate-100 bg-slate-50 grid grid-cols-2 gap-3">
         <div className="flex gap-2">
           <button 
             onClick={() => handleDownload(media.brochure, 'Brochure')}
             className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
             title="Download Brochure"
           >
             <Download className="w-3.5 h-3.5" /> Brochure
           </button>
           <button 
             onClick={() => handleDownload(media.floor_plan, 'Floor Plan')}
             className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition"
             title="View Floor Plan"
           >
             <FileText className="w-3.5 h-3.5" /> Plans
           </button>
         </div>
         
         <button 
           onClick={handleMoreDetails}
           className="flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-200"
         >
           More Details <ExternalLink className="w-3.5 h-3.5" />
         </button>
      </div>
    </div>
  )
}

// Helper Sub-component for badges
const InfoBadge = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
    <div className="shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 font-bold uppercase leading-tight">{label}</p>
      <p className="text-xs font-bold text-slate-800 truncate" title={value}>{value}</p>
    </div>
  </div>
)
