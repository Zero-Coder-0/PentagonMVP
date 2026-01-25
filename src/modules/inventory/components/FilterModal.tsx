import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { FilterCriteria, Zone } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: FilterCriteria;
  onUpdate: (c: FilterCriteria) => void;
  onReset: () => void;
}

export default function FilterModal({ isOpen, onClose, criteria, onUpdate, onReset }: FilterModalProps) {
  if (!isOpen) return null;

  // Safe check to prevent "undefined" errors if parent didn't pass criteria
  const safeCriteria = criteria || {
    status: [],
    zones: [],
    configurations: [],
    facing: [],
    minPrice: 0,
    maxPrice: 0,
    sqFtMin: 0,
    sqFtMax: 0,
    possessionYear: ''
  };

  const toggleArray = (field: keyof FilterCriteria, value: string) => {
    // Force cast to string[] because we know we are only calling this for array fields
    const current = (safeCriteria[field] as string[]) || [];
    
    const updated = current.includes(value)
      ? current.filter(i => i !== value)
      : [...current, value];
      
    onUpdate({ ...safeCriteria, [field]: updated });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">Filters</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          
          {/* 1. Property Status */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Property Status</h4>
            <div className="flex flex-wrap gap-2">
              {['Ready', 'Under Construction'].map(status => (
                <button
                  key={status}
                  onClick={() => toggleArray('status', status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    safeCriteria.status?.includes(status)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Zone */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Zone</h4>
            <div className="flex flex-wrap gap-2">
              {['North', 'South', 'East', 'West'].map(zone => (
                <button
                  key={zone}
                  onClick={() => toggleArray('zones', zone)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    safeCriteria.zones?.includes(zone as Zone)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </section>

          {/* 3. Budget Range */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Budget Range (₹)</h4>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input 
                  type="number" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                  placeholder="Min Price"
                  value={safeCriteria.minPrice || ''}
                  onChange={(e) => onUpdate({...safeCriteria, minPrice: Number(e.target.value)})}
                />
              </div>
              <span className="text-slate-300">-</span>
              <div className="flex-1">
                <input 
                  type="number" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
                  placeholder="Max Price"
                  value={safeCriteria.maxPrice || ''}
                  onChange={(e) => onUpdate({...safeCriteria, maxPrice: Number(e.target.value)})}
                />
              </div>
            </div>
          </section>

          {/* 4. Possession Year */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Possession By</h4>
            <div className="flex flex-wrap gap-2">
              {['2025', '2026', '2027', '2028', 'Ready'].map(year => (
                <button
                  key={year}
                  onClick={() => onUpdate({ ...safeCriteria, possessionYear: safeCriteria.possessionYear === year ? '' : year })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    safeCriteria.possessionYear === year
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </section>

          {/* 5. Configuration (UPDATED LIST) */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Configuration</h4>
            <div className="flex flex-wrap gap-2">
              {['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Duplex', 'Penthouse'].map(conf => (
                <button
                  key={conf}
                  onClick={() => toggleArray('configurations', conf)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    safeCriteria.configurations?.includes(conf)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>
          </section>

          {/* 6. Area */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Area (Sq. Ft)</h4>
            <div className="flex gap-4 items-center">
              <input 
                type="number" 
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm"
                placeholder="Min"
                value={safeCriteria.sqFtMin || ''}
                onChange={(e) => onUpdate({...safeCriteria, sqFtMin: Number(e.target.value)})}
              />
              <span className="text-slate-300">-</span>
              <input 
                type="number" 
                className="flex-1 p-2.5 border border-slate-300 rounded-lg text-sm"
                placeholder="Max"
                value={safeCriteria.sqFtMax || ''}
                onChange={(e) => onUpdate({...safeCriteria, sqFtMax: Number(e.target.value)})}
              />
            </div>
          </section>

          {/* 7. Facing */}
          <section>
            <h4 className="text-sm font-bold text-slate-900 uppercase mb-3">Facing</h4>
            <div className="grid grid-cols-2 gap-2">
              {['East', 'West', 'North', 'South', 'North-East'].map(face => (
                <label key={face} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input 
                    type="checkbox"
                    checked={safeCriteria.facing?.includes(face)}
                    onChange={() => toggleArray('facing', face)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{face}</span>
                </label>
              ))}
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={onReset}
            className="px-4 py-3 rounded-xl border border-slate-300 text-slate-600 font-bold flex items-center gap-2 hover:bg-white transition"
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition"
          >
            Show Results
          </button>
        </div>

      </div>
    </div>
  );
}
