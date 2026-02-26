'use client';

import { X, MapPin } from 'lucide-react';
import type { ProjectV7 } from '@/modules/inventory/types-v7';

const getHeaderData = (property: ProjectV7) => {
  const pFull = property as any; // Cast to access full fields
  const locationParts = [pFull.region || property.address_line, pFull.city || pFull.district].filter(Boolean);

  return {
    name: property.project_name,
    status: property.projectstatus || 'Under Construction',
    grade: property.developer_buildergrade,
    price: property.pricedisplay,
    address: locationParts.join(', ') || 'Bangalore',
    rera: property.rera_registration_no || pFull.rera_registration_no || 'N/A',
    developer: pFull.developer_name || 'Unknown Developer',
    theme: pFull.project_theme,
    heroImage: property.hero_image || pFull.hero_image,
  };
};

interface Props {
  property: ProjectV7;
  onClose: () => void;
}

export function MegaPopupHeader({ property, onClose }: Props) {
  const data = getHeaderData(property);

  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-200">
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start mb-3">
          {data.heroImage && (
            <div className="w-20 h-20 rounded-xl mr-4 bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 shadow-sm">
              <img src={data.heroImage} className="w-full h-full object-cover" alt={data.name} />
            </div>
          )}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-2xl font-bold text-slate-900 truncate">{data.name}</h2>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase border border-blue-200">
                {data.status}
              </span>
              {data.grade && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700 uppercase border border-purple-200">
                  Grade {data.grade}
                </span>
              )}
              {data.theme && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 uppercase border border-amber-200 truncate max-w-[200px]">
                  {data.theme}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap mt-1.5">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span className="truncate max-w-[400px]">{data.address}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="font-mono">RERA: {data.rera}</span>
              {data.developer && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="font-semibold">By {data.developer}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-bold text-green-700">{data.price}</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Onwards</div>
          </div>

          <button
            onClick={onClose}
            className="ml-5 p-2 bg-slate-50 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-700 border border-slate-200"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
