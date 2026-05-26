'use client';

import { Home } from 'lucide-react';
import { useMemo } from 'react';
import type { ProjectFullV7, ProjectV7 } from '@/modules/inventory/types-v7';

// ✅ Helper to safely format price (uses real column names)
const formatPrice = (unit: any) => {
  const price = unit.pricetotal || 0;
  if (!price) return 'Call for Price';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString()}`;
};

interface Props {
  property: ProjectFullV7;
}

export function UnitsTab({ property }: Props) {
  // ✅ Memoize and sort units alphanumerically by unit number (natural sorting: A1, A2, A3...)
  const sortedUnits = useMemo(() => {
    if (!property.units || property.units.length === 0) return [];
    return [...property.units].sort((a, b) => {
      const aNo = a.unitnumber || '';
      const bNo = b.unitnumber || '';
      return aNo.localeCompare(bNo, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [property.units]);

  const summary = useMemo(() => {
    const configs = Array.from(new Set(sortedUnits.map((u) => u.config).filter(Boolean)));
    return configs.map((config) => ({
      config,
      count: sortedUnits.filter((u) => u.config === config).length,
    }));
  }, [sortedUnits]);

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Project Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm mt-2">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Project Theme</p>
            <p className="font-bold text-slate-800">{property.project_theme || 'Standard'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Land Area</p>
            <p className="font-bold text-slate-800">{property.total_land_area || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Phases</p>
            <p className="font-bold text-slate-800">{property.total_phases || 1}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Units for Whole Project</p>
            <p className="font-bold text-slate-800">{property.total_units || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Selling Phase</p>
            <p className="font-bold text-slate-800">{property.current_phase_under_sale || 'Phase 1'}</p>
          </div>
        </div>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50">
        <div className="flex justify-between items-start mb-4">
          <span className="flex items-center gap-2 font-bold text-slate-700"><Home size={16} /> Unit Inventory</span>
          <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500 shadow-sm">
            {sortedUnits.length} Total Units
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {summary.map((s) => (
            <div key={s.config} className="bg-white p-2 rounded border border-slate-200 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">{s.config}</div>
              <div className="text-sm font-bold text-slate-700">{s.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2">Config/Type</th>
              <th className="px-3 py-2">Tower/Unit</th>
              <th className="px-3 py-2">Areas (SBA / Carpet / UDS)</th>
              <th className="px-3 py-2 text-center">Facing</th>
              <th className="px-3 py-2 text-center">Bath/Balc</th>
              <th className="px-3 py-2 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedUnits.map((u, i) => {
              const rawUnitNo = u.unitnumber || '';
              const match = rawUnitNo.match(/^([^(]+)(?:\(([^)]+)\))?$/);
              const parsedUnitNo = match ? match[1].trim() : rawUnitNo;
              const parsedPhase = match && match[2] ? match[2].trim() : undefined;

              return (
              <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-3 py-3">
                  <div className="font-bold text-slate-800">{u.config || 'Unknown BHK'}</div>
                  <div className="text-xs text-slate-500">{u.type || 'Standard'}</div>
                </td>
                <td className="px-3 py-3 text-xs">
                  <div className="font-mono font-medium text-slate-700 flex items-center gap-1.5">
                    Unit: <span className="font-bold text-slate-900">{parsedUnitNo}</span>
                    {parsedPhase && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-sans font-bold text-[9px] uppercase tracking-wider border border-blue-100">
                        {parsedPhase}
                      </span>
                    )}
                  </div>
                  {(u.tower || u.floornumber) && (
                    <div className="text-slate-500 mt-0.5">
                      {u.tower ? `Tower ${u.tower}` : ''} {u.floornumber ? `| Floor ${u.floornumber}` : ''}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-xs">
                  <div className="flex flex-col gap-0.5">
                    {u.actualsba ? <div><span className="font-medium text-slate-700">SBA:</span> {u.actualsba} sqft</div> : null}
                    {u.carpetarea ? <div className="text-slate-500"><span className="font-medium">Carpet:</span> {u.carpetarea} sqft</div> : null}
                    {u.udsarea ? <div className="text-slate-500"><span className="font-medium">UDS:</span> {u.udsarea} sqft</div> : null}
                    {!u.actualsba && !u.carpetarea && !u.udsarea && <span className="text-slate-400">Area Not Specified</span>}
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  {u.facing ? (
                    <span className="px-2 py-1 rounded-md bg-white border border-slate-200 text-xs shadow-sm text-slate-600 font-medium">
                      {u.facing}
                    </span>
                  ) : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-3 py-3 text-center text-xs text-slate-600">
                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    {u.wccount ? <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">{u.wccount} Bath</span> : null}
                    {u.balconycount ? <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{u.balconycount} Balc</span> : null}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="font-bold text-blue-700 text-base">{formatPrice(u)}</div>
                  {u.pricepersqft ? <div className="text-[10px] text-slate-500 mt-0.5">₹{u.pricepersqft.toLocaleString()}/sqft</div> : null}
                </td>
              </tr>
              );
            })}
            {sortedUnits.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400 bg-slate-50">
                  <div className="text-3xl mb-2">🏢</div>
                  <div className="font-medium text-slate-600">No unit data available</div>
                  <div className="text-xs mt-1">Please add units to this project via the edit wizard.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
