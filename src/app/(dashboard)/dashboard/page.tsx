'use client'

import React, { createContext, useState, useMemo, useContext, useRef, useEffect } from 'react'
import styles from './Dashboard.module.css'
import MapContainer from './MapContainer'
import PropertyListContainer from './PropertyListContainer' 
import MegaPopup from './MegaPopup'
import SearchBar from './SearchBar'

import { Property, FilterCriteria } from '@/modules/inventory/types';
import { filterProperties } from '@/modules/inventory/utils/filter-engine';
import { getProjectsV7 } from '@/modules/inventory/actions-v7';

interface DashboardContextType {
  properties: Property[]
  displayedProperties: Property[]
  filters: FilterCriteria
  setFilters: (filters: FilterCriteria) => void
  resetFilters: () => void;
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  hoveredListId: string | null
  setHoveredListId: (id: string | null) => void
  hoveredRecId: string | null
  setHoveredRecId: (id: string | null) => void
  handleCardEnter: (id: string) => void
  handleCardLeave: () => void
  cancelHoverLeave: () => void
  handlePinClick: (id: string) => void 
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
  const [properties, setProperties] = useState<Property[]>([])

  const initialFilters: FilterCriteria = {
    status: [],           
    minPrice: 0,
    maxPrice: 0,
    configurations: [],   
    zones: [],            
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const data = await getProjectsV7();
        if (data) {
          setProperties(data);
        }
      } catch (error) {
        console.error('Failed to fetch properties via V7:', error);
      }
    }
    fetchProperties();
  }, [])

  const displayedProperties = useMemo(() => {
    let items = filterProperties(properties, filters);
    if (userLocation) {
      items = items.map((item: Property) => ({
        ...item,
        distance: getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      })).sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
    }
    return items
  }, [properties, userLocation, filters])

  const handleCardEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setHoveredRecId(id)
  }

  const handleCardLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRecId(null)
    }, 300)
  }

  const cancelHoverLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
  }

  const handlePinClick = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setSelectedId(id)
    setHoveredRecId(id)
  }

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
        
        {/* LEFT SIDE: Search Bar + Map */}
        <div className="relative h-full w-full flex flex-col overflow-hidden bg-slate-50">
          
          {/* Search Bar Container (Fixed at Top) */}
          <SearchBar />
          
          {/* Map Container (Takes Remaining Space) */}
          <div className="flex-1 relative p-3">
            <MapContainer />
            <MegaPopup /> 
          </div>
          
        </div>

        {/* RIGHT SIDE: Property List */}
        <PropertyListContainer />

      </div>
    </DashboardContext.Provider>
  )
}

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
