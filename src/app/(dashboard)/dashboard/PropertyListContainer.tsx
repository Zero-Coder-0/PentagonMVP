'use client'

import { useDashboard } from './page';
import { MapPin, Home, Navigation, Check } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { getDistanceKm } from '@/lib/geo';

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

  // getDistanceKm is the shared Haversine util from @/lib/geo

  return (
    <div className="h-full w-full flex flex-col bg-white border-l border-slate-200 overflow-hidden">

      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-200 bg-white">
        <h2 className="font-bold text-slate-900 text-base">
          Inventory ({displayedProperties.length})
        </h2>
      </div>

      {/* Scrollable List */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 bg-slate-50"
      >
        {displayedProperties.map((property) => {
          const distance = userLocation ? getDistanceKm(
            userLocation.lat,
            userLocation.lng,
            property.lat ?? 0,
            property.lng ?? 0
          ) : undefined;

          const isSelected = selectedId === property.id;

          return (
            <div
              key={property.id}
              ref={isSelected ? selectedRef : null}
              onMouseEnter={() => handleCardEnter(property.id)}
              onMouseLeave={handleCardLeave}
              onClick={() => handlePinClick(property.id)}
              className={`cursor-pointer transition-all bg-white rounded-xl p-3 border ${isSelected
                ? 'border-blue-500 shadow-lg shadow-blue-100'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }`}
            >
              {/* Info Section (No Image) */}
              <div className="flex flex-col space-y-2">

                {/* ✅ Project Name */}
                <h3 className={`font-bold text-sm leading-tight line-clamp-2 ${isSelected ? 'text-blue-900' : 'text-slate-900'
                  }`}>
                  {property.project_name}
                </h3>

                {/* ✅ Location */}
                <div className="flex items-start gap-1 text-xs text-slate-500">
                  <MapPin size={11} className="flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-tight">
                    {property.address_line || property.region || property.city_zone || 'Bangalore'}
                  </span>
                </div>

                {/* ✅ Price + Distance + Selected Check */}
                <div className="flex items-center justify-between gap-2">

                  {/* Price */}
                  <div className="text-sm font-bold text-green-700 truncate flex-shrink">
                    {property.pricedisplay}
                  </div>

                  {/* Right side: Distance + Check */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Distance Badge */}
                    {userLocation && distance !== undefined && !isNaN(distance) && (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                        <Navigation size={10} />
                        <span>{distance.toFixed(1)}km</span>
                      </div>
                    )}

                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ Configurations */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {property.configurations && property.configurations.length > 0 ? (
                    property.configurations.slice(0, 2).map((config, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${isSelected
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                      >
                        {config}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Configs TBD
                    </span>
                  )}
                  {property.configurations && property.configurations.length > 2 && (
                    <span className="text-xs text-slate-500 font-medium">
                      +{property.configurations.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {displayedProperties.length === 0 && (
          <div className="text-center text-slate-400 mt-20 text-xs">
            <Home size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="text-slate-600 font-medium">No properties found</p>
          </div>
        )}
      </div>
    </div>
  )
}
