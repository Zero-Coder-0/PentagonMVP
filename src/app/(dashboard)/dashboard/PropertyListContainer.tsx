'use client'

import React, { useState } from 'react'
import { Filter, ArrowUpRight, MapPin, Bed } from 'lucide-react'
import { useDashboard } from './page' // Ensure this path matches where your context is
import { Property, FilterCriteria } from '@/modules/inventory/types'
import styles from './Dashboard.module.css'
import FilterModal from '@/modules/inventory/components/FilterModal'

export default function PropertyListContainer() {
  const { 
    displayedProperties, 
    selectedId, 
    setSelectedId, 
    // Smart handlers
    handleCardEnter,
    handleCardLeave,
    // Filter State from Context
    filters, // This matches 'criteria'
    setFilters // This matches 'onUpdateCriteria'
  } = useDashboard()

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Helper to reset filters to default state
  const handleResetFilters = () => {
    setFilters({
      status: [],
      minPrice: 0,
      maxPrice: 0,
      configurations: [],
      zones: [],
      facing: [],
      sqFtMin: 0,
      sqFtMax: 0,
      possessionYear: '',
    })
  }

  // Check if any filter is active for the UI badge
  const hasActiveFilters = 
    filters.status?.length > 0 || 
    filters.minPrice! > 0 || 
    filters.maxPrice! > 0 ||
    filters.configurations?.length! > 0 ||
    filters.zones?.length! > 0 ||
    filters.facing?.length! > 0 ||
    filters.possessionYear !== '';

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
          {hasActiveFilters && (
             <span className={styles.pulseDot} />
          )}
        </button>
      </div>

      {/* Scrollable List */}
      <div className={styles.scrollList}>
        {displayedProperties.length === 0 ? (
           <div className={styles.listEmptyState}>
             No properties found matching your criteria.
           </div>
        ) : (
          displayedProperties.map((prop: Property) => (
            <div 
              key={prop.id}
              onClick={() => setSelectedId(prop.id)}
              // --- Smart Handlers ---
              onMouseEnter={() => handleCardEnter(prop.id)}
              onMouseLeave={handleCardLeave}
              // ----------------------
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
                  <Bed className="w-3 h-3 inline mr-1"/>
                  {/* configurations is array, joining for display */}
                  {Array.isArray(prop.configurations) ? prop.configurations.join(', ') : prop.configurations}
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
        criteria={filters}          // Pass current context state
        onUpdate={setFilters}       // Pass context setter
        onReset={handleResetFilters} // Pass reset handler
      />
    </div>
  )
}
