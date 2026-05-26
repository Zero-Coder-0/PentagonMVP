'use client';

import { useState, useMemo } from 'react';
import { Home } from 'lucide-react';
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
  // Local Filter States
  const [selectedConfig, setSelectedConfig] = useState<string>('All');
  const [selectedTower, setSelectedTower] = useState<string>('All');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

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

  // Extract unique towers
  const towers = useMemo(() => {
    const list = Array.from(new Set(sortedUnits.map((u) => u.tower).filter(Boolean)));
    return ['All', ...list];
  }, [sortedUnits]);

  // Local Filter logic
  const filteredUnits = useMemo(() => {
    return sortedUnits.filter((u) => {
      // 1. Config Filter
      if (selectedConfig !== 'All' && u.config !== selectedConfig) return false;

      // 2. Tower Filter
      if (selectedTower !== 'All' && u.tower !== selectedTower) return false;

      // 3. Price Filter
      const price = u.pricetotal ? Number(u.pricetotal) : 0;
      if (minPrice && price < Number(minPrice)) return false;
      if (maxPrice && price > Number(maxPrice)) return false;

      return true;
    });
  }, [sortedUnits, selectedConfig, selectedTower, minPrice, maxPrice]);

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
          <span className="text-xs font-semibold bg-white px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 shadow-sm">
            {filteredUnits.length === sortedUnits.length 
              ? `${sortedUnits.length} Total Units` 
              : `Showing ${filteredUnits.length} of ${sortedUnits.length} Units`}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.map((s) => {
            const isActive = selectedConfig === s.config;
            return (
              <button 
                key={s.config} 
                onClick={() => setSelectedConfig(isActive ? 'All' : s.config)}
                className={`min-w-[90px] p-2 rounded-lg border text-center transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md font-semibold transform scale-105' 
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50/30'
                }`}
              >
                <div className={`text-[9px] uppercase font-black tracking-wider ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>{s.config}</div>
                <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-700'}`}>{s.count} Units</div>
              </button>
            );
          })}
        </div>

        {/* Sleek inline filters */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <span>Filter Unit Details:</span>
          </div>
          
          {/* Tower Selector */}
          {towers.length > 2 && (
            <select
              value={selectedTower}
              onChange={(e) => setSelectedTower(e.target.value)}
              className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition cursor-pointer"
            >
              <option value="All">All Towers</option>
              {towers.filter(t => t !== 'All').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}

          {/* Min Price */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Min Price (₹)</span>
            <input
              type="number"
              placeholder="e.g. 6000000"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-28 text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
            />
          </div>

          {/* Max Price */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Max Price (₹)</span>
            <input
              type="number"
              placeholder="e.g. 20000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28 text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 placeholder-slate-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition"
            />
          </div>

          {/* Reset Filters */}
          {(selectedConfig !== 'All' || selectedTower !== 'All' || minPrice || maxPrice) && (
            <button
              onClick={() => {
                setSelectedConfig('All');
                setSelectedTower('All');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition cursor-pointer"
            >
              Clear Filters
            </button>
          )}
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
            {filteredUnits.map((u, i) => {
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
            {sortedUnits.length > 0 && filteredUnits.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400 bg-slate-50">
                  <div className="text-2xl mb-2">🔍</div>
                  <div className="font-medium text-slate-600">No units match your selected filters</div>
                  <button 
                    onClick={() => {
                      setSelectedConfig('All');
                      setSelectedTower('All');
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold underline mt-2 cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
