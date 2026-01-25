'use client'

import React, { createContext, useState, useMemo, useContext, useRef, useEffect } from 'react'
import { supabaseClient } from '@/core/db/client' // Ensure this path is correct for your project
import styles from './Dashboard.module.css'
import MapContainer from './MapContainer'
import PropertyListContainer from './PropertyListContainer' 
import DetailContainer from './DetailContainer'
import MegaPopup from './MegaPopup'

// --- 1. Imports from Modules ---
import { Property, FilterCriteria } from '@/modules/inventory/types';
import { filterProperties } from '@/modules/inventory/utils/filter-engine';

// --- 2. Types & Context ---

interface DashboardContextType {
  // Data & State
  properties: Property[]
  displayedProperties: Property[]
  filters: FilterCriteria
  setFilters: (filters: FilterCriteria) => void
  resetFilters: () => void;

  // Selection & Hover
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  hoveredListId: string | null
  setHoveredListId: (id: string | null) => void
  hoveredRecId: string | null
  setHoveredRecId: (id: string | null) => void
  
  // "Bridge" Logic
  handleCardEnter: (id: string) => void
  handleCardLeave: () => void
  cancelHoverLeave: () => void
  handlePinClick: (id: string) => void 

  // Map State
  userLocation: { lat: number; lng: number; displayName: string } | null
  setUserLocation: (location: any) => void
  mapBounds?: [[number, number], [number, number]]
  setMapBounds: (bounds?: [[number, number], [number, number]]) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) throw new Error('useDashboard must be used within DashboardProvider')
  return context
}

export default function DashboardPage() {
  // State
  const [properties, setProperties] = useState<Property[]>([])

  // --- Robust Filter Initialization ---
  const initialFilters: FilterCriteria = {
    // Basic Fields
    status: [],           
    minPrice: 0,
    maxPrice: 0,
    configurations: [],   
    zones: [],            
    
    // Advanced Fields
    facing: [],           
    sqFtMin: 0,
    sqFtMax: 0,
    possessionYear: '',
  }

  const [filters, setFilters] = useState<FilterCriteria>(initialFilters)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredListId, setHoveredListId] = useState<string | null>(null)
  const [hoveredRecId, setHoveredRecId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; displayName: string } | null>(null)
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | undefined>(undefined)

  // Ref for the "Sticky" bridge logic
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // --- 3. Data Fetching (Integrated from Old Code) ---
  useEffect(() => {
    async function fetchProperties() {
      // Create client (Assuming supabaseClient is a factory function based on your new code)
      const supabase = supabaseClient() 
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        // MAP DB COLUMNS TO UI TYPES
        // This fixes the mismatch between DB 'facing_direction' and UI 'facing'
        const mappedProperties = data.map((item: any) => ({
          ...item,
          // DB has 'facing_direction' (string), UI wants 'facing' (string[] for filters)
          // We wrap the single string in an array so the filter engine works correctly
          facing: item.facing_direction ? [item.facing_direction] : [],
          
          // Ensure other new fields like 'media' or 'amenities_detailed' are passed through
          media: item.media || { images: [] },
          amenities_detailed: item.amenities_detailed || {},
        })) as Property[]

        setProperties(mappedProperties)
      }
      
      if (error) console.error('Failed to fetch properties:', error)
    }

    fetchProperties()
  }, [])


  // --- 4. Refactored Filtering Logic ---
  const displayedProperties = useMemo(() => {
    // Use the imported filter engine
    let items = filterProperties(properties, filters);

    // Keep existing Distance sort logic
    if (userLocation) {
      items = items.map((item: Property) => ({
        ...item,
        distance: getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      })).sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
    }
    return items
  }, [properties, userLocation, filters])


  // --- New "Bridge" Handlers ---

  // 1. Enter: Show immediately, clear any hide timers
  const handleCardEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setHoveredRecId(id)
  }

  // 2. Leave: Wait 300ms before hiding
  const handleCardLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRecId(null)
    }, 300)
  }

  // 3. Popup Enter: Cancel the hide timer (keep it open)
  const cancelHoverLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }

  // 4. Map Pin Click: Highlight and Open Popup immediately
  const handlePinClick = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setSelectedId(id)      // Highlights the list item
    setHoveredRecId(id)    // Opens the MegaPopup
  }

  // Helper to reset filters
  const resetFilters = () => {
    setFilters(initialFilters)
  }

  const value: DashboardContextType = {
    properties,
    displayedProperties,
    filters, setFilters,
    resetFilters,
    
    selectedId, setSelectedId,
    hoveredListId, setHoveredListId,
    hoveredRecId, setHoveredRecId,
    
    // Handlers
    handleCardEnter, 
    handleCardLeave, 
    cancelHoverLeave,
    handlePinClick, 

    userLocation, setUserLocation,
    mapBounds, setMapBounds
  }

  return (
    <DashboardContext.Provider value={value}>
      <div className={styles.dashboardGrid}>
        <MapContainer />
        <PropertyListContainer />
        <DetailContainer />
        <MegaPopup />
      </div>
    </DashboardContext.Provider>
  )
}

// Helper: Haversine formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
