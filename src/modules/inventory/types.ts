// src/modules/inventory/types.ts

export type Zone = 'North' | 'South' | 'East' | 'West'

export interface Property {
  id: string
  name: string
  developer?: string
  location_area: string
  zone: Zone
  lat: number
  lng: number
  
  status: 'Ready' | 'Under Construction'
  
  price_display: string
  price_value: number
  price_per_sqft?: number // <--- ADDED THIS FIELD
  
  configurations: string
  sq_ft_range?: string
  facing_direction?: string
  balcony_count?: number
  floor_levels?: string
  
  // JSONB / Complex
  units_available: Record<string, number>
  amenities?: string[]
  nearby_locations?: Record<string, string>
  
  // Contact
  contact_person?: string
  contact_phone?: string
  completion_duration?: string

  // UI Calculated
  distance?: number
  score?: number
  reasons?: string[]
  
  // New Rich Fields
  rera_id?: string
  specifications?: Record<string, string> // key-value pairs
  amenities_detailed?: {
    sports?: string[]
    leisure?: string[]
    wellness?: string[]
    worship?: string[]
    [key: string]: any
  }
  social_infra?: Record<string, string>
  images?: string[]
}


export interface FilterCriteria {
  status?: string
  maxPrice?: number
  configurations?: string[]
  facing?: string[]
  dynamicFilters?: Record<string, boolean>
  
  // Legacy/Future support
  minPrice?: number
  zones?: string[]
  sqFtMin?: number
  sqFtMax?: number
}
