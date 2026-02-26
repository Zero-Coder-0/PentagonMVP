/*'use client'

import React from 'react'
import { FilterCriteria } from '../types'

interface PropertyFiltersProps {
  filters: FilterCriteria;
  onChange: (newFilters: FilterCriteria) => void;
}

export default function PropertyFilters({ filters, onChange }: PropertyFiltersProps) {
  
  const handleBhkChange = (bhk: string) => {
    const current = filters.configurations || [];
    const updated = current.includes(bhk)
      ? current.filter(c => c !== bhk) // Remove if exists
      : [...current, bhk]; // Add if not exists
    onChange({ ...filters, configurations: updated });
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onChange({ ...filters, priceRange: undefined });
      return;
    }
    const [min, max] = val.split('-').map(Number);
    onChange({ ...filters, priceRange: { min, max } });
  }

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid #eee', background: '#f9fafb', display: 'flex', gap: '10px', overflowX: 'auto', whiteSpace: 'nowrap', alignItems: 'center' }}>
      
      {/* 1. BHK Filter (Multi-select style) *///}
     /* <div style={{ display: 'flex', gap: '4px' }}>
        {['2BHK', '3BHK', '4BHK'].map(bhk => (
          <button
            key={bhk}
            onClick={() => handleBhkChange(bhk)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              borderRadius: '999px',
              border: filters.configurations?.includes(bhk) ? '1px solid #2563eb' : '1px solid #d1d5db',
              background: filters.configurations?.includes(bhk) ? '#2563eb' : 'white',
              color: filters.configurations?.includes(bhk) ? 'white' : '#374151',
              cursor: 'pointer'
            }}
          >
            {bhk}
          </button>
        ))}
      </div>

      <div style={{ width: '1px', height: '20px', background: '#d1d5db', margin: '0 4px' }}></div>

      {/* 2. Budget Filter (Dropdown) *///}
   /*   <select 
        onChange={handlePriceChange}
        style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
      >
        <option value="">Any Price</option>
        <option value="0-6000000">Under 60L</option>
        <option value="6000000-10000000">60L - 1 Cr</option>
        <option value="10000000-20000000">1 Cr - 2 Cr</option>
        <option value="20000000-100000000">2 Cr+</option>
      </select>

      /*{/* 3. Facing Filter (Simple Toggle for now) *///}
  /*    <select 
        onChange={(e) => onChange({ ...filters, facing: e.target.value ? { mainDoor: [e.target.value] } : undefined })}
        style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}
      >
        <option value="">Any Facing</option>
        <option value="East">East Facing</option>
        <option value="West">West Facing</option>
        <option value="North">North Facing</option>
      </select>
    </div>
  )
}

*/
