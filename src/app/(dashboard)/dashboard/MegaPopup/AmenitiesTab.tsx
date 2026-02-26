'use client';

import { Sparkles } from 'lucide-react';
import type { ProjectFullV7, ProjectV7 } from '@/modules/inventory/types-v7';

const getAmenitiesData = (property: ProjectFullV7) =>
  (property.amenities || []).map(a => ({
    name: a.name,
    category: a.category
  }));

interface Props {
  property: ProjectFullV7;
}

export function AmenitiesTab({ property }: Props) {
  const amenities = getAmenitiesData(property);

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-purple-600" /> All Amenities ({amenities.length})
      </h3>
      {amenities.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {amenities.map((amenity, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100 hover:border-purple-200">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-slate-700 truncate">{amenity.name}</div>
                {amenity.category && <div className="text-xs text-slate-500">{amenity.category}</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 italic text-sm">No amenities listed.</p>
      )}
    </div>
  );
}
