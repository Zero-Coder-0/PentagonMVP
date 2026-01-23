'use client'
// Add useContext to imports
import React, { createContext, useState, useMemo, ReactNode, useContext } from 'react'

import { supabaseClient } from '@/core/db/client'
import styles from './Dashboard.module.css'
import MapContainer from './MapContainer'
import PropertyListContainer from './PropertyListContainer' 
import DetailContainer from './DetailContainer'
import MegaPopup from './MegaPopup'

// Types from your schema
export interface Property {
  id: string
  name: string
  developer?: string
  location_area: string
  zone: 'North' | 'South' | 'East' | 'West'
  lat: number
  lng: number
  status: 'Ready' | 'Under Construction'
  price_display: string
  price_value: number
  price_per_sqft:number
  configurations: string
  sq_ft_range?: string
  facing_direction?: string
  balcony_count?: number
  floor_levels?: string
  units_available: Record<string, number>
  amenities?: string[]
  nearby_locations?: Record<string, string>
  contact_person?: string
  contact_phone?: string
  completion_duration?: string
}

export interface FilterCriteria {
  status?: string
  maxPrice?: number
  configurations?: string[]
  facing?: string[]
  dynamicFilters?: Record<string, boolean>
}

interface DashboardContextType {
  properties: Property[]
  displayedProperties: Property[]
  filters: FilterCriteria
  setFilters: (filters: FilterCriteria) => void
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  hoveredListId: string | null
  setHoveredListId: (id: string | null) => void
  hoveredRecId: string | null
  setHoveredRecId: (id: string | null) => void
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
  const [filters, setFilters] = useState<FilterCriteria>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredListId, setHoveredListId] = useState<string | null>(null)
  const [hoveredRecId, setHoveredRecId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; displayName: string } | null>(null)
  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | undefined>(undefined)

  // Fetch real Supabase data
  React.useEffect(() => {
    async function fetchProperties() {
      const supabase = supabaseClient()
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (data) setProperties(data as Property[])
      if (error) console.error('Failed to fetch properties:', error)
    }
    fetchProperties()
  }, [])

  const displayedProperties = useMemo(() => {
    let items = properties.filter((item: Property) => {
      // Status
      if (filters.status && item.status !== filters.status) return false
      // Price (default 10Cr)
      const maxPriceVal = (filters.maxPrice || 10) * 10000000
      if (item.price_value! > maxPriceVal) return false
      // Configurations
      if (filters.configurations?.length) {
        if (!filters.configurations.includes(item.configurations)) return false
      }
      // Facing
      if (Array.isArray(filters.facing) && filters.facing.length) {
        if (!filters.facing.includes(item.facing_direction || '')) return false
      }
      return true
    })

    // Distance sort
    if (userLocation) {
      items = items.map((item: Property) => ({
        ...item,
        distance: getDistanceKm(userLocation.lat, userLocation.lng, item.lat, item.lng)
      })).sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0))
    }
    return items
  }, [properties, userLocation, filters])

  const value: DashboardContextType = {
    properties,
    displayedProperties,
    filters, setFilters,
    selectedId, setSelectedId,
    hoveredListId, setHoveredListId,
    hoveredRecId, setHoveredRecId,
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

// Haversine formula (from your geo-calc)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
