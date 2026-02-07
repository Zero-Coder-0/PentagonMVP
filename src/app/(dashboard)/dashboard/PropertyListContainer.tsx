'use client'

import { useDashboard } from './page';
import { MapPin, Home, Navigation } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function PropertyListContainer() {
  const { displayedProperties, selectedId, handleCardEnter, handleCardLeave, handlePinClick, userLocation } = useDashboard()
  const selectedRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected property
  useEffect(() => {
    if (selectedId && selectedRef.current && containerRef.current) {
      const container = containerRef.current;
      const selected = selectedRef.current;
      
      const containerHeight = container.clientHeight;
      const selectedTop = selected.offsetTop;
      const selectedHeight = selected.clientHeight;
      
      container.scrollTo({
        top: selectedTop - (containerHeight / 2) + (selectedHeight / 2),
        behavior: 'smooth'
      });
    }
  }, [selectedId]);

  return (
    <div className="h-full w-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">
      
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-900 text-base">
            Inventory ({displayedProperties.length})
          </h2>
          <button className="text-sm text-blue-700 font-semibold border border-blue-300 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition">
             Filters
          </button>
        </div>
      </div>

      {/* Scrollable List */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 bg-slate-50"
      >
        {displayedProperties.map((property) => (
           <div 
             key={property.id}
             ref={selectedId === property.id ? selectedRef : null}
             onMouseEnter={() => handleCardEnter(property.id)}
             onMouseLeave={handleCardLeave}
             onClick={() => handlePinClick(property.id)}
             className={`cursor-pointer transition-all bg-white rounded-2xl p-3 border ${
               selectedId === property.id 
                 ? 'border-blue-500 shadow-lg shadow-blue-100' 
                 : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
             }`}
           >
             <div className="flex gap-3">
                {/* Thumbnail */}
                <div className={`w-16 h-16 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border ${
                  selectedId === property.id ? 'border-blue-400' : 'border-slate-200'
                }`}>
                   {property.media?.images?.[0] ? (
                      <img 
                        src={property.media.images[0]} 
                        alt={property.name} 
                        className="w-full h-full object-cover" 
                      />
                   ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Home size={20} />
                      </div>
                   )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                     <h3 className={`font-bold text-sm truncate ${
                       selectedId === property.id ? 'text-blue-900' : 'text-slate-900'
                     }`}>
                       {property.name}
                     </h3>
                     
                     {/* Selected Badge - Subtle */}
                     {selectedId === property.id && (
                       <span className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                         ✓
                       </span>
                     )}
                   </div>
                   
                   {/* Location with Distance */}
                   <div className="flex items-center gap-2 mb-2">
                     <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={10} />
                        <span className="truncate">{property.location_area}</span>
                     </div>
                     
                     {/* Distance Badge */}
                     {userLocation && property.distance !== undefined && (
                       <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                         selectedId === property.id 
                           ? 'bg-blue-600 text-white' 
                           : 'bg-blue-50 text-blue-700 border border-blue-200'
                       }`}>
                         <Navigation size={10} />
                         <span>{property.distance.toFixed(1)} km</span>
                       </div>
                     )}
                   </div>
                   
                   <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-green-700">
                        {property.price_display}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        selectedId === property.id 
                          ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {property.configurations?.[0]}
                      </span>
                   </div>
                </div>
             </div>
           </div>
        ))}
        
        {displayedProperties.length === 0 && (
           <div className="text-center text-slate-400 mt-20 text-sm">
             <Home size={48} className="mx-auto mb-3 text-slate-300" />
             <p className="text-slate-600 font-medium">No properties found</p>
           </div>
        )}
      </div>
    </div>
  )
}
