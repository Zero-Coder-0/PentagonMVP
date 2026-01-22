'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { FilterCriteria } from '../types';
import { useSchema } from '@/modules/core/context/SchemaContext';
import { FACING_OPTIONS } from '../data/filter-options';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterCriteria;
  onApply: (newFilters: FilterCriteria) => void;
}

export default function FilterModal({ isOpen, onClose, filters, onApply }: FilterModalProps) {
  const { schemaFields } = useSchema();
  
  const [localFilters, setLocalFilters] = useState<FilterCriteria>(filters);
  const [activeTab, setActiveTab] = useState<'basic' | 'dynamic'>('basic');

  useEffect(() => {
    if (isOpen) setLocalFilters(filters);
  }, [isOpen, filters]);

  const toggleDynamicFilter = (key: string) => {
    const currentDynamic = localFilters.dynamicFilters || {};
    const newValue = !currentDynamic[key];
    
    if (!newValue) {
      const { [key]: _, ...rest } = currentDynamic;
      setLocalFilters({ ...localFilters, dynamicFilters: rest });
    } else {
      setLocalFilters({
        ...localFilters,
        dynamicFilters: { ...currentDynamic, [key]: true }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Filter Inventory</h2>
            <p className="text-xs text-slate-500 mt-0.5">Refine your search results</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-4 text-sm font-semibold text-center transition-colors border-b-2 ${activeTab === 'basic' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Basic Config
          </button>
          <button
            onClick={() => setActiveTab('dynamic')}
            className={`flex-1 py-4 text-sm font-semibold text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${activeTab === 'dynamic' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/10' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Amenities & Features
            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {schemaFields.filter(f => f.isActive).length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="space-y-8">
              {/* Max Budget */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Max Budget (Cr)</label>
                <input 
                  type="range" min="0" max="10" step="0.5"
                  className="w-full accent-indigo-600 cursor-pointer"
                  value={localFilters.maxPrice || 5}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: parseFloat(e.target.value) })}
                />
                <div className="flex justify-between text-sm text-slate-500 font-medium">
                  <span>₹0 Cr</span>
                  <span className="text-indigo-600 font-bold">₹{localFilters.maxPrice || 5} Cr</span>
                  <span>₹10+ Cr</span>
                </div>
              </div>

              {/* Facing (UPDATED SECTION) */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Direction Facing</label>
                <div className="grid grid-cols-2 gap-3">
                  {FACING_OPTIONS.map((opt: any, idx: number) => {
                    // Handle both { label, value } objects AND simple strings
                    const value = typeof opt === 'string' ? opt : opt.value;
                    const label = typeof opt === 'string' ? opt : opt.label;
                    
                    // Fallback key if value is missing to prevent key errors
                    const uniqueKey = value || `facing-${idx}`;

                    // 1. SAFEGUARD: Ensure we are working with an array
                    const currentFacing = Array.isArray(localFilters.facing) 
                      ? localFilters.facing 
                      : []; 

                    return (
                      <label key={uniqueKey} className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${currentFacing.includes(value) 
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'}
                      `}>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={currentFacing.includes(value)}
                          onChange={(e) => {
                            // 2. LOGIC: Update as a clean string array using the normalized 'value'
                            const updated = e.target.checked 
                              ? [...currentFacing, value] 
                              : currentFacing.filter(x => x !== value);
                            
                            // 3. SET: Write back to state as string[]
                            setLocalFilters({ ...localFilters, facing: updated });
                          }}
                        />
                        <span className="text-sm font-medium">{label}</span>
                        {currentFacing.includes(value) && <Check className="w-4 h-4 ml-auto" />}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dynamic' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                These filters update in real-time from the Admin Panel.
              </div>
              <div className="grid grid-cols-1 gap-3">
                {schemaFields.filter(f => f.isActive && f.type === 'boolean').map(field => {
                    const isChecked = !!localFilters.dynamicFilters?.[field.key];
                    return (
                      <label key={field.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all group ${isChecked ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'border-slate-200 bg-white hover:border-indigo-300 text-slate-700'}`}>
                        <span className="font-medium">{field.label}</span>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isChecked ? 'bg-white border-transparent' : 'border-slate-300 bg-slate-50 group-hover:border-indigo-400'}`}>
                          {isChecked && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleDynamicFilter(field.key)} />
                      </label>
                    );
                })}
              </div>
              {schemaFields.filter(f => f.isActive && f.type === 'boolean').length === 0 && (
                <div className="text-center py-10 text-slate-400">
                  <p>No special features configured.</p>
                  <p className="text-xs mt-1">Go to Admin  Schema Builder to add some.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-lg transition-all">Cancel</button>
          <button onClick={() => { onApply(localFilters); onClose(); }} className="px-8 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 rounded-lg transition-all active:scale-95">Apply Filters</button>
        </div>
      </div>
    </div>
  );
}
