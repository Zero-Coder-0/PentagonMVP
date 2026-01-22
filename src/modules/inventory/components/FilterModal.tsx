'use client'

import React, { useState, useEffect } from 'react'
import { FilterCriteria } from '../types'
// 👇 Logic preserved: We keep Facing/Furniture as they likely aren't in the schema yet
import { FACING_OPTIONS, FURNITURE_OPTIONS } from '../data/filter-options' 
// 👇 New Feature: Dynamic Schema Context
import { useSchema } from "@/modules/core/context/SchemaContext"

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterCriteria;
  onApply: (newFilters: FilterCriteria) => void;
}

export default function FilterModal({ isOpen, onClose, filters, onApply }: FilterModalProps) {
  // 👇 Hook: Get dynamic data
  const { amenities: dynamicAmenities, projectStatus: dynamicStatus } = useSchema();
  
  const [localFilters, setLocalFilters] = useState<FilterCriteria>(filters);
  const [activeTab, setActiveTab] = useState('basic'); // basic | facing | amenities

  // Reset local state when modal opens
  useEffect(() => {
    if(isOpen) setLocalFilters(filters);
  }, [isOpen, filters]);

  if (!isOpen) return null;

  return (
    // 👇 UI: Converted to Tailwind (from New Code style)
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Advanced Filters</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {['Basic', 'Facing & View', 'Amenities & Extras'].map((tab, idx) => {
             const key = ['basic', 'facing', 'amenities'][idx];
             const isActive = activeTab === key;
             return (
               <button 
                 key={key}
                 onClick={() => setActiveTab(key)}
                 className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors
                   ${isActive 
                     ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                     : 'bg-white text-slate-500 hover:bg-slate-50 border-b-2 border-transparent'
                   }`}
               >
                 {tab}
               </button>
             )
          })}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          {/* TAB 1: BASIC (Dynamic Status, Budget, Config) */}
          {activeTab === 'basic' && (
            <>
              {/* Status Switch - Dynamic Data */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Property Status</label>
                <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-lg">
                  {dynamicStatus.map(status => {
                    const isSelected = localFilters.status === status;
                    return (
                      <button
                        key={status}
                        onClick={() => setLocalFilters({ ...localFilters, status: status as any })}
                        className={`flex-1 py-2 px-4 text-sm font-bold rounded-md transition-all shadow-sm
                          ${isSelected 
                            ? 'bg-white text-blue-600 shadow-md' 
                            : 'bg-transparent text-slate-500 hover:text-slate-700'
                          }`}
                      >
                        {status}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Logic: Only show Unit Availability if status contains "Ready" */}
              {localFilters.status?.includes('Ready') && (
                 <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-700 mb-2 uppercase">Unit Availability</p>
                    <div className="flex gap-2">
                       {['1BHK', '2BHK', '3BHK', '4BHK'].map(bhk => (
                         <label key={bhk} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded border border-slate-200 cursor-pointer hover:border-emerald-300 transition-colors shadow-sm">
                           <input 
                             type="checkbox" 
                             className="accent-emerald-600"
                             checked={localFilters.configurations?.includes(bhk) || false} 
                             onChange={(e) => {
                               const current = localFilters.configurations || [];
                               const updated = e.target.checked ? [...current, bhk] : current.filter(c => c !== bhk);
                               setLocalFilters({...localFilters, configurations: updated});
                             }} 
                           />
                           <span className="text-sm font-medium text-slate-700">{bhk}</span>
                         </label>
                       ))}
                    </div>
                 </div>
              )}

              {/* Budget Slider Placeholder */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Budget Range</label>
                <select 
                  className="w-full p-2.5 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => {
                    if(!e.target.value) { setLocalFilters({...localFilters, priceRange: undefined}); return; }
                    const [min, max] = e.target.value.split('-').map(Number);
                    setLocalFilters({...localFilters, priceRange: {min, max}});
                  }}
                >
                  <option value="">Any Budget</option>
                  <option value="0-8000000">Under 80 Lakhs</option>
                  <option value="8000000-15000000">80L - 1.5 Cr</option>
                  <option value="15000000-30000000">1.5 Cr - 3 Cr</option>
                  <option value="30000000-100000000">3 Cr+</option>
                </select>
              </div>
            </>
          )}

          {/* TAB 2: FACING (Door, Balcony) - Preserved from Old Code */}
          {activeTab === 'facing' && (
            <div className="grid grid-cols-2 gap-6">
              {/* Main Door */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">🚪 Main Door Facing</h4>
                <div className="flex flex-col gap-2">
                  {FACING_OPTIONS.slice(0, 4).map(dir => (
                    <label key={`door-${dir}`} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          const current = localFilters.facing?.mainDoor || [];
                          const updated = e.target.checked ? [...current, dir] : current.filter(d => d !== dir);
                          setLocalFilters({...localFilters, facing: { ...localFilters.facing, mainDoor: updated }});
                        }} 
                      />
                      <span className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors">{dir}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Balcony */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">🌅 Balcony Facing</h4>
                <div className="flex flex-col gap-2">
                  {FACING_OPTIONS.slice(0, 4).map(dir => (
                    <label key={`balcony-${dir}`} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-slate-600 group-hover:text-blue-600 transition-colors">{dir}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMENITIES & EXTRAS - Merged Dynamic Data */}
          {activeTab === 'amenities' && (
            <div className="flex flex-col gap-6">
               {/* Amenities Grid - Dynamic */}
               <div>
                 <h4 className="text-sm font-bold text-slate-800 mb-3">Community Amenities</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                   {dynamicAmenities.map(amenity => (
                     <label 
                       key={amenity} 
                       className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all
                         ${localFilters.amenities?.includes(amenity)
                           ? "border-blue-500 bg-blue-50"
                           : "border-slate-200 bg-slate-50 hover:border-slate-300"
                         }`}
                     >
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          checked={localFilters.amenities?.includes(amenity) || false}
                          onChange={(e) => {
                            const current = localFilters.amenities || [];
                            const updated = e.target.checked ? [...current, amenity] : current.filter(a => a !== amenity);
                            setLocalFilters({...localFilters, amenities: updated});
                          }}
                        />
                        <span className="text-xs font-medium text-slate-700">{amenity}</span>
                     </label>
                   ))}
                 </div>
               </div>

               {/* Furniture - Static Preserved */}
               <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3">Furnishing Status</h4>
                  <div className="flex gap-2">
                    {FURNITURE_OPTIONS.map(opt => (
                       <button 
                        key={opt} 
                        className="px-4 py-1.5 border border-slate-300 rounded-full text-xs font-medium bg-white hover:bg-slate-50 transition-colors"
                       >
                         {opt}
                       </button>
                    ))}
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button 
            onClick={() => setLocalFilters({})}
            className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors"
          >
            Reset All
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => { onApply(localFilters); onClose(); }} 
              className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow hover:bg-blue-700 transition-all active:scale-95"
            >
              Show Properties
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
