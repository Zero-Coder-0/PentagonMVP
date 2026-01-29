'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { 
  CheckCircle2, Zap, Droplets, LayoutTemplate, ShieldCheck, 
  MapPin, Download, FileText, ExternalLink, 
  Dumbbell, TreePine, Waves, Landmark, ShoppingBag, GraduationCap,
  Building2, Ruler, Compass, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useDashboard } from './page'

// Icon mapper for social infra
const INFRA_ICONS: any = {
  school: <GraduationCap className="w-4 h-4 text-indigo-500"/>,
  mall: <ShoppingBag className="w-4 h-4 text-pink-500"/>,
  metro: <Zap className="w-4 h-4 text-yellow-500"/>,
  default: <MapPin className="w-4 h-4 text-slate-400"/>
}

export default function MegaPopup() {
  const { hoveredRecId, properties, cancelHoverLeave, handleCardLeave, setSelectedId } = useDashboard()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const data = useMemo(() => 
    properties.find(p => p.id === hoveredRecId), 
    [hoveredRecId, properties]
  )
  
  // Reset carousel when property changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [hoveredRecId])

  if (!hoveredRecId || !data) return null

  // --- DATA NORMALIZATION ---
  
  // 1. Amenities: Flatten all categories
  const rawAmenities = data.amenities_detailed || {}
  const amenitiesList = Object.values(rawAmenities).flat().filter(item => typeof item === 'string')

  const infra = data.social_infra || {}
  const units = data.units_available || {}
  const media = data.media || { images: [], brochure: '', floor_plan: '' }
  const images = media.images && media.images.length > 0 ? media.images : []

  // Action Handlers (Preserved from Old Code)
  const handleDownload = (url?: string, type?: string) => {
    if (url) window.open(url, '_blank');
    else alert(`${type} not available for this property yet.`);
  }

  const handleMoreDetails = () => {
    setSelectedId(data.id); 
  }

  // Carousel Logic (New)
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  return (
    <div 
      className="absolute top-4 left-4 z-[1000] w-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in slide-in-from-left-4 duration-200"
      onMouseEnter={cancelHoverLeave}
      onMouseLeave={handleCardLeave}
    >
      {/* 1. Header Image Area (Carousel) */}
      <div className="h-40 relative bg-slate-200 group">
        {images.length > 0 ? (
          <>
            <img 
              src={images[currentImageIndex]} 
              alt={data.name} 
              className="w-full h-full object-cover transition-opacity duration-300" 
            />
            {/* Carousel Controls */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {/* Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <div 
                      key={idx} 
                      className={`w-1.5 h-1.5 rounded-full shadow-sm ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/60'}`} 
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
        )}
        
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
        
        {/* Title & Location */}
        <div className="absolute bottom-4 left-5 text-white pointer-events-none">
          <h2 className="text-2xl font-bold leading-none mb-1 shadow-black/50 drop-shadow-md">{data.name}</h2>
          <p className="text-sm opacity-95 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-yellow-400" /> {data.location_area}, {data.zone} Zone
          </p>
        </div>
        
        {/* Price & Status */}
        <div className="absolute bottom-4 right-5 flex flex-col items-end pointer-events-none">
           <span className="bg-white text-slate-900 px-3 py-1 rounded-lg text-sm font-bold shadow-md mb-1 border border-slate-100">
            {data.price_display}
           </span>
           <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm ${data.status === 'Ready' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
             {data.status}
           </span>
        </div>
      </div>

      {/* 2. Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        
        {/* A. Inventory Grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
             <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Inventory Status</h3>
             <span className="text-[10px] text-slate-500 font-medium">Live Updates</span>
          </div>
          {Object.keys(units).length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(units).map(([type, count]) => (
                <div key={type} className={`p-2 rounded border text-center ${Number(count) < 3 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="text-xs font-bold text-slate-700">{type}</div>
                  <div className={`text-sm font-bold ${Number(count) < 3 ? 'text-red-700' : 'text-slate-900'}`}>
                    {count} Units
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2">
               {data.configurations?.map((conf: string) => (
                 <span key={conf} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">{conf}</span>
               ))}
            </div>
          )}
        </section>

        {/* B. Key Highlights - UPDATED TO 3 COLUMNS */}
        <div className="grid grid-cols-3 gap-3">
          <InfoBadge icon={<ShieldCheck className="w-4 h-4 text-emerald-600"/>} label="RERA ID" value={data.rera_id || "Pending"} />
          <InfoBadge icon={<Building2 className="w-4 h-4 text-blue-600"/>} label="Floors" value={data.floor_levels || "G+?"} />
          <InfoBadge icon={<Ruler className="w-4 h-4 text-amber-500"/>} label="Size" value={data.sq_ft_range || "N/A"} />
          <InfoBadge icon={<Compass className="w-4 h-4 text-purple-500"/>} label="Facing" value={data.facing_direction || "Various"} />
          <InfoBadge icon={<LayoutTemplate className="w-4 h-4 text-cyan-500"/>} label="Ready In" value={data.completion_duration || "Ready"} />
        </div>

        {/* C. Amenities & Infra */}
        <div className="space-y-4">
           {/* Amenities Section */}
           {amenitiesList.length > 0 && (
             <div>
               <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amenities</h3>
               <div className="flex flex-wrap gap-2">
                 {amenitiesList.map((item: any, idx: number) => (
                   <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded text-xs text-slate-700 capitalize font-medium">
                     <CheckCircle2 className="w-3.5 h-3.5 text-green-600"/>
                     <span>{String(item)}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Location / Infra - UPDATED TO 3 COLUMNS */}
           {Object.keys(infra).length > 0 && (
             <div>
               <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nearby</h3>
               <div className="grid grid-cols-3 gap-2">
                  {Object.entries(infra).map(([key, val]) => (
                    <div key={key} className="flex flex-col p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="flex items-center gap-1.5 capitalize text-[10px] text-slate-500 mb-1 font-bold">
                        {INFRA_ICONS[key.toLowerCase()] || INFRA_ICONS.default} {key}
                      </span>
                      <span className="font-bold text-xs text-slate-900 truncate" title={String(val)}>{String(val)}</span>
                    </div>
                  ))}
               </div>
             </div>
           )}
        </div>
      </div>

      {/* 3. Footer Actions (Preserved from Old Code) */}
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

// Compact Info Badge for 3-Column Layout
function InfoBadge({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex flex-col p-2 bg-slate-50 rounded border border-slate-100 h-full justify-center">
        <div className="flex items-center gap-1.5 mb-1">
            {icon}
            <span className="text-[10px] text-slate-500 font-bold uppercase truncate">{label}</span>
        </div>
        <div className="text-sm font-bold text-slate-900 pl-0.5 truncate" title={String(value)}>{value}</div>
    </div>
  )
}
