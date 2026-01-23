'use client'

import React from 'react'
import { X, Filter } from 'lucide-react'
import { FilterCriteria } from '@/app/(dashboard)/dashboard/page'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterCriteria
  onApply: (f: FilterCriteria) => void
}

export default function FilterModal({ isOpen, onClose, filters, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = React.useState<FilterCriteria>(filters)

  // Sync when opening
  React.useEffect(() => {
    if (isOpen) setLocalFilters(filters)
  }, [isOpen, filters])

  if (!isOpen) return null

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const toggleConfig = (val: string) => {
    const current = localFilters.configurations || []
    const next = current.includes(val) 
      ? current.filter(c => c !== val) 
      : [...current, val]
    setLocalFilters({ ...localFilters, configurations: next })
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            Advanced Filters
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* 1. Status */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Project Status</label>
            <div className="grid grid-cols-2 gap-3">
              {['Ready', 'Under Construction'].map(status => (
                <button
                  key={status}
                  onClick={() => setLocalFilters({ ...localFilters, status: localFilters.status === status ? undefined : status })}
                  className={`py-2 px-3 rounded-lg text-sm font-semibold border transition-all ${
                    localFilters.status === status 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-100' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {status === 'Ready' ? 'Ready to Move' : 'Under Construction'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Budget Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Budget</label>
              <span className="text-sm font-bold text-blue-600">{localFilters.maxPrice || 10} Cr</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="20" 
              step="0.5"
              value={localFilters.maxPrice || 10}
              onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>50L</span>
              <span>20Cr+</span>
            </div>
          </div>

          {/* 3. Configurations */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Configurations</label>
            <div className="flex flex-wrap gap-2">
              {['1BHK', '2BHK', '3BHK', '4BHK', 'Villa'].map(conf => (
                <button
                  key={conf}
                  onClick={() => toggleConfig(conf)}
                  className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    localFilters.configurations?.includes(conf)
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {conf}
                </button>
              ))}
            </div>
          </div>
          
          {/* 4. Facing (New Schema Field) */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Facing</label>
            <select 
               className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
               onChange={(e) => setLocalFilters({ ...localFilters, facing: e.target.value ? [e.target.value] : [] })}
               value={localFilters.facing?.[0] || ''}
            >
               <option value="">Any Direction</option>
               <option value="North">North Facing</option>
               <option value="East">East Facing</option>
               <option value="West">West Facing</option>
               <option value="South">South Facing</option>
            </select>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={() => setLocalFilters({})}
            className="flex-1 py-3 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-lg transition-colors"
          >
            Reset
          </button>
          <button 
            onClick={handleApply}
            className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            Apply Filters
          </button>
        </div>

      </div>
    </div>
  )
}
