'use client'

import React from 'react'
import { Filter, Home, ArrowUpRight, MapPin } from 'lucide-react'
import { useDashboard, Property } from './page'
import styles from './Dashboard.module.css'
import FilterModal from '@/modules/inventory/components/FilterModal'

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
      <div className={styles.listHeader}>
        <div className={styles.headerTitleRow}>
          <h2 className="font-bold text-slate-800 text-lg">Inventory</h2>
          <span className={styles.countBadge}>
            {displayedProperties.length}
          </span>
        </div>

        {/* Filter Trigger Button */}
        <button 
          onClick={() => setIsFilterOpen(true)}
          className={styles.filterBtn}
        >
          <Filter className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Advanced Filters</span>
          {(filters.status || filters.maxPrice) && (
             <span className={styles.pulseDot} />
          )}
        </button>
      </div>

      {/* Scrollable List */}
      <div className={styles.scrollList}>
        {displayedProperties.length === 0 ? (
           <div className={styles.listEmptyState}>
             No properties found in this area.
           </div>
        ) : (
          displayedProperties.map((prop: Property) => (
            <div 
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              onMouseEnter={() => setHoveredListId(prop.id)}
              onMouseLeave={() => setHoveredListId(null)}
              className={`${styles.propertyCard} ${selectedId === prop.id ? styles.propertyCardSelected : styles.propertyCardDefault}`}
            >
              {/* Card Content */}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className={styles.cardTitle}>
                    {prop.name}
                  </h3>
                  <p className={styles.cardLocation}>
                    <MapPin className="w-3 h-3" />
                    {prop.location_area}
                  </p>
                </div>
                <div className="text-right">
                   <span className={styles.cardPrice}>{prop.price_display}</span>
                   {(prop as any).distance && (
                     <span className={styles.distanceBadge}>
                       {Math.round((prop as any).distance * 10) / 10} km
                     </span>
                   )}
                </div>
              </div>

              {/* Bottom Tags */}
              <div className="flex items-center gap-2 mt-3">
                <span className={styles.configTag}>
                  {prop.configurations}
                </span>
                <span className={`${styles.statusTag} ${prop.status === 'Ready' ? styles.statusReady : styles.statusConstruction}`}>
                  {prop.status === 'Ready' ? 'Ready to Move' : 'Under Const.'}
                </span>
              </div>
              
              {/* Hover Hint */}
              <div className={styles.hoverHint}>
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
