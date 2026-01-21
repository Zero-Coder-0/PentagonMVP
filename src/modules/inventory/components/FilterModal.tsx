'use client'

import React, { useState, useEffect } from 'react'
import { FilterCriteria } from '../types'
import { FACING_OPTIONS, AMENITY_OPTIONS, FURNITURE_OPTIONS } from '../data/filter-options' // Import config

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterCriteria;
  onApply: (newFilters: FilterCriteria) => void;
}

export default function FilterModal({ isOpen, onClose, filters, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterCriteria>(filters);
  const [activeTab, setActiveTab] = useState('basic'); // basic | facing | amenities

  // Reset local state when modal opens
  useEffect(() => {
    if(isOpen) setLocalFilters(filters);
  }, [isOpen, filters]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', width: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '16px', background: '#f9fafb', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#1f2937' }}>Advanced Filters</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>×</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          {['Basic', 'Facing & View', 'Amenities & Extras'].map((tab, idx) => {
             const key = ['basic', 'facing', 'amenities'][idx];
             const isActive = activeTab === key;
             return (
               <button 
                 key={key}
                 onClick={() => setActiveTab(key)}
                 style={{
                   flex: 1, padding: '12px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px',
                   background: isActive ? '#eff6ff' : 'white',
                   color: isActive ? '#2563eb' : '#6b7280',
                   border: 'none', borderBottom: isActive ? '2px solid #2563eb' : 'none',
                   cursor: 'pointer'
                 }}
               >
                 {tab}
               </button>
             )
          })}
        </div>

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* TAB 1: BASIC (Status, Budget, Config) */}
          {activeTab === 'basic' && (
            <>
              {/* Status Switch */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>Property Status</label>
                <div style={{ display: 'flex', background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
                  {['Ready', 'Under Construction'].map(status => (
                    <button
                      key={status}
                      onClick={() => setLocalFilters({ ...localFilters, status: status as any })}
                      style={{
                        flex: 1, padding: '8px', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        background: localFilters.status === status ? 'white' : 'transparent',
                        boxShadow: localFilters.status === status ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        color: localFilters.status === status ? '#2563eb' : '#6b7280'
                      }}
                    >
                      {status === 'Ready' ? 'Ready to Move' : 'Under Construction'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Logic */}
              {localFilters.status === 'Ready' && (
                 <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #d1fae5' }}>
                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#047857', marginBottom: '8px', marginTop: 0 }}>UNIT AVAILABILITY</p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                       {['1BHK', '2BHK', '3BHK', '4BHK'].map(bhk => (
                         <label key={bhk} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white', padding: '4px 12px', borderRadius: '4px', border: '1px solid #d1d5db', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                           <input type="checkbox" checked={localFilters.configurations?.includes(bhk) || false} onChange={(e) => {
                             const current = localFilters.configurations || [];
                             const updated = e.target.checked ? [...current, bhk] : current.filter(c => c !== bhk);
                             setLocalFilters({...localFilters, configurations: updated});
                           }} />
                           <span style={{ fontSize: '14px', fontWeight: '500' }}>{bhk}</span>
                         </label>
                       ))}
                    </div>
                 </div>
              )}

              {/* Budget Slider Placeholder */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280', marginBottom: '8px' }}>Budget Range</label>
                <select 
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white' }} 
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

          {/* TAB 2: FACING (Door, Balcony) */}
          {activeTab === 'facing' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Main Door */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>🚪 Main Door Facing</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {FACING_OPTIONS.slice(0, 4).map(dir => (
                    <label key={`door-${dir}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" onChange={(e) => {
                        const current = localFilters.facing?.mainDoor || [];
                        const updated = e.target.checked ? [...current, dir] : current.filter(d => d !== dir);
                        setLocalFilters({...localFilters, facing: { ...localFilters.facing, mainDoor: updated }});
                      }} />
                      <span style={{ fontSize: '14px', color: '#4b5563' }}>{dir}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Balcony */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>🌅 Balcony Facing</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {FACING_OPTIONS.slice(0, 4).map(dir => (
                    <label key={`balcony-${dir}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="checkbox" />
                      <span style={{ fontSize: '14px', color: '#4b5563' }}>{dir}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AMENITIES & EXTRAS */}
          {activeTab === 'amenities' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
               {/* Amenities Grid */}
               <div>
                 <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>Community Amenities</h4>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                   {AMENITY_OPTIONS.map(opt => (
                     <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                        <input type="checkbox" />
                        <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>{opt}</span>
                     </label>
                   ))}
                 </div>
               </div>

               {/* Furniture */}
               <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937', marginBottom: '12px' }}>Furnishing Status</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {FURNITURE_OPTIONS.map(opt => (
                       <button key={opt} style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '999px', fontSize: '12px', fontWeight: '500', background: 'white', cursor: 'pointer' }}>
                         {opt}
                       </button>
                    ))}
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ padding: '16px', background: '#f9fafb', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
          <button 
            onClick={() => setLocalFilters({})}
            style={{ fontSize: '12px', color: '#dc2626', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Reset All
          </button>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onClose} style={{ padding: '8px 16px', color: '#4b5563', fontWeight: '500', background: 'transparent', border: 'none', cursor: 'pointer' }}>Cancel</button>
            <button 
              onClick={() => { onApply(localFilters); onClose(); }} 
              style={{ padding: '8px 24px', background: '#2563eb', color: 'white', fontWeight: 'bold', borderRadius: '6px', border: 'none', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
            >
              Show Properties
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
