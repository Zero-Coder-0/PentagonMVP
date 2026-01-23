'use client'

import React from 'react'
// Add MapPin to imports
import { Filter, Home, ArrowUpRight, MapPin } from 'lucide-react'
import { useDashboard, Property } from './page'
import styles from './Dashboard.module.css'
import FilterModal from '@/modules/inventory/components/FilterModal' // Ensure this exists or mock it

export default function PropertyListContainer() {
  const { 
    displayedProperties, 
    selectedId, 
    setSelectedId, 
    setHoveredListId,
    filters,
    setFilters
  } = useDashboard()

  const [isFilterOpen, setIsFilterOpen] = React.useState(false)

  return (
    <div className={styles.listContainer}>
      {/* List Header */}
      <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800 text-lg">Inventory</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
            {displayedProperties.length}
          </span>
        </div>

        {/* Filter Trigger Button */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-300 border-dashed text-slate-600 py-2.5 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all text-sm font-semibold group"
        >
          <Filter className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Advanced Filters</span>
          {(filters.status || filters.maxPrice) && (
             <span className="w-2 h-2 bg-blue-500 rounded-full ml-1 animate-pulse" />
          )}
        </button>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {displayedProperties.length === 0 ? (
           <div className="p-8 text-center text-slate-400 text-sm">
             No properties found in this area.
           </div>
        ) : (
          displayedProperties.map((prop: Property) => (
            <div 
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              onMouseEnter={() => setHoveredListId(prop.id)}
              onMouseLeave={() => setHoveredListId(null)}
              className={`
                p-5 border-b border-slate-100 cursor-pointer transition-all duration-200 relative group
                ${selectedId === prop.id ? 'bg-blue-50/80 border-l-4 border-l-blue-600' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}
              `}
            >
              {/* Card Content */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 group-hover:text-blue-700 transition-colors">
                    {prop.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {prop.location_area}
                  </p>
                </div>
                <div className="text-right">
                   <span className="block font-bold text-blue-600 text-sm">{prop.price_display}</span>
                   {(prop as any).distance && (
                     <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded ml-auto inline-block mt-1">
                       {Math.round((prop as any).distance * 10) / 10} km
                     </span>
                   )}
                </div>
              </div>

              {/* Bottom Tags */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                  {prop.configurations}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded border ${
                  prop.status === 'Ready' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {prop.status === 'Ready' ? 'Ready to Move' : 'Under Const.'}
                </span>
              </div>
              
              {/* Hover Hint */}
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filter Modal Injection */}
      <FilterModal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        filters={filters} 
        onApply={setFilters} 
      />
    </div>
  )
}
