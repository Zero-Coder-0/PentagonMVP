// src/modules/inventory/types.ts

export interface Property {
  id: string
  name: string
  developer: string
  location_area: string
  zone: 'North' | 'South' | 'East' | 'West'
  lat: number
  lng: number
  price_display: string
  price_per_sqft?: string
  price_value?: number // Added for compatibility
  sq_ft_range?: string
  configurations?: string[]
  status?: 'Pre-Launch' | 'Under Construction' | 'Ready'
  rera_id?: string
  property_type?: string // Added
  floor_levels?: string
  facing_direction?: string
  completion_date?: string
  completion_duration?: string
  
  // For map/list display
  distance?: number
  
  // Amenities
  amenities?: string[] // For backward compatibility
  amenities_detailed?: Record<string, string[]>
  totalUnits?: number // Added for compatibility
  priceRange?: string // Added for compatibility
  
  // Social Infrastructure
  social_infra?: Record<string, string>
  
  // Specs (flexible object)
  specs?: Record<string, any>
  
  // Media
  media?: {
    images?: string[]
    floor_plan?: string
    videos?: string[]
  }
  
  // Raw data for detailed views
  units?: any[]
  competitors?: any[]
}

export interface FilterCriteria {
  status?: string[]
  minPrice?: number
  maxPrice?: number
  configurations?: string[]
  zones?: string[]
  facing?: string[]
  sqFtMin?: number
  sqFtMax?: number
  possessionYear?: string
}
