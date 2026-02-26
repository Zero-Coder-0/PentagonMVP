'use client';

import { MapPin, Clock, Navigation } from 'lucide-react';
import type { ProjectFullV7, ProjectV7 } from '@/modules/inventory/types-v7';

const getLocationData = (property: ProjectFullV7) => ({
  landmarks: (property.landmarks || []).map(l => ({
    name: l.name,
    category: l.category,
    distance: l.distance_km,
    travelTime: l.travel_time
  })),
  competitors: (property.competitors || []).map(c => ({
    name: c.name,
    priceRange: c.price_range
  }))
});

interface Props {
  property: ProjectFullV7;
}

export function LocationTab({ property }: Props) {
  const { landmarks, competitors } = getLocationData(property);

  return (
    <div className="space-y-4">
      {/* Primary Location Summary */}
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
          <Navigation size={16} className="text-blue-600" /> Primary Location
        </h3>
        <p className="text-sm font-medium text-slate-800 mb-1">
          {property.address_line || property.general_location || 'Address not specified'}
        </p>
        <div className="flex gap-2 text-xs font-bold text-blue-700 mt-2">
          {property.city_zone && <span className="px-2 py-1 bg-white border border-blue-200 rounded shrink-0">{property.city_zone}</span>}
          {property.region && <span className="px-2 py-1 bg-white border border-blue-200 rounded shrink-0">{property.region}</span>}
          {property.city && <span className="px-2 py-1 bg-white border border-blue-200 rounded shrink-0">{property.city}</span>}
        </div>
      </div>

      {(property.distancetomainroad || property.airportdistance || property.railwaystationdistance || property.metrostationdistance || property.busstopdistance) && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-indigo-600" /> Key Connectivity
          </h3>
          <div className="flex flex-wrap gap-3">
            {property.distancetomainroad && (
              <div className="bg-indigo-50 border border-indigo-100 rounded px-3 py-2 flex-1 min-w-[120px]">
                <p className="text-[10px] text-indigo-600 uppercase font-bold">Main Road</p>
                <p className="font-semibold text-indigo-900 text-sm">{property.distancetomainroad}</p>
              </div>
            )}
            {property.airportdistance && (
              <div className="bg-indigo-50 border border-indigo-100 rounded px-3 py-2 flex-1 min-w-[120px]">
                <p className="text-[10px] text-indigo-600 uppercase font-bold">Airport</p>
                <p className="font-semibold text-indigo-900 text-sm">{property.airportdistance}</p>
              </div>
            )}
            {property.railwaystationdistance && (
              <div className="bg-indigo-50 border border-indigo-100 rounded px-3 py-2 flex-1 min-w-[120px]">
                <p className="text-[10px] text-indigo-600 uppercase font-bold">Railway</p>
                <p className="font-semibold text-indigo-900 text-sm">{property.railwaystationdistance}</p>
              </div>
            )}
            {property.metrostationdistance && (
              <div className="bg-indigo-50 border border-indigo-100 rounded px-3 py-2 flex-1 min-w-[120px]">
                <p className="text-[10px] text-indigo-600 uppercase font-bold">Metro</p>
                <p className="font-semibold text-indigo-900 text-sm">{property.metrostationdistance}</p>
              </div>
            )}
            {property.busstopdistance && (
              <div className="bg-indigo-50 border border-indigo-100 rounded px-3 py-2 flex-1 min-w-[120px]">
                <p className="text-[10px] text-indigo-600 uppercase font-bold">Bus Stop</p>
                <p className="font-semibold text-indigo-900 text-sm">{property.busstopdistance}</p>
              </div>
            )}
          </div>
        </div>
      )}
      {landmarks.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-blue-600" /> Nearby Landmarks
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {landmarks.map((landmark, i) => (
              <div key={i} className="p-2 bg-blue-50 rounded border border-blue-100 flex justify-between">
                <div>
                  <div className="font-bold text-sm text-blue-900">{landmark.name}</div>
                  {landmark.category && <div className="text-xs text-blue-600">{landmark.category}</div>}
                </div>
                {landmark.distance && (
                  <div className="text-right">
                    <div className="font-bold text-sm text-blue-800">{(landmark.distance ?? '').toString().replace(/km/ig, '').trim()} km</div>
                    {landmark.travelTime && <div className="text-xs text-blue-600">{(landmark.travelTime ?? '').toString().replace(/mins?/ig, '').trim()} mins</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {competitors.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <MapPin size={16} className="text-orange-600" /> Competitors
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {competitors.map((comp, i) => (
              <div key={i} className="p-2 bg-orange-50 rounded border border-orange-100">
                <div className="font-bold text-sm text-orange-900">{comp.name}</div>
                {comp.priceRange && <div className="text-[10px] text-orange-700">{comp.priceRange}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
