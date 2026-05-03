'use client';

import { X, MapPin } from 'lucide-react';
import type { ProjectV7 } from '@/modules/inventory/types-v7';

const getHeaderData = (property: ProjectV7) => {
  const pFull = property as any; // Cast to access full fields
  const validRegion = [pFull.region, property.address_line].find(x => x && x !== 'Unknown');
  const validCity = [pFull.city, pFull.district].find(x => x && x !== 'Unknown');
  const locationParts = [validRegion, validCity].filter(Boolean);

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
      <div className="px-4 py-2">
        <div className="flex justify-between items-center">
          
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-slate-900 truncate">{data.name}</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase border border-blue-200">
                {data.status}
              </span>
              {data.grade && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 uppercase border border-purple-200">
                  Grade {data.grade}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap mt-0.5">
              <div className="flex items-center gap-1">
                <MapPin size={10} />
                <span className="truncate max-w-[300px]">{data.address}</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="font-mono text-[10px]">RERA: {data.rera}</span>
            </div>
          </div>

          <div className="text-right flex-shrink-0 flex items-center gap-4">
            <div>
              <div className="text-lg font-bold text-green-700 leading-none">{data.price}</div>
              <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Onwards</div>
            </div>
            
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-50 hover:bg-slate-200 rounded-full transition text-slate-400 hover:text-slate-700 border border-slate-200"
            >
              <X size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
