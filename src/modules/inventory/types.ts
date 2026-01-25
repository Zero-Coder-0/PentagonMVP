// src/modules/inventory/types.ts

// --- Enums & Unions ---
export type Zone = 'North' | 'South' | 'East' | 'West';
export type PropertyStatus = 'Ready' | 'Under Construction';

// --- Main Entity Interface ---
// 1. Match the DB Schema EXACTLY + UI Extensions
export interface Property {
  // --- Identifiers & Location ---
  id: string;
  name: string;
  developer?: string;
  location_area: string;
  zone: Zone;
  lat: number;
  lng: number;



  totalUnits: number;
  priceRange: { };

  amenities: string[],
  
  // --- Pricing ---
  price_display: string;
  price_value: number;     // Numeric for sorting/filtering
  price_per_sqft?: number; // DB column: price_per_sqft

  // --- Status ---
  status: PropertyStatus;
  
  // --- Physical Specs ---
  configurations: string[]; // DB is text[]: ['2BHK', '3BHK']
  sq_ft_range?: string;     // DB is text: "1200-1500 sqft"
  
  // UPDATED: Matches 'facing_direction' column in DB (was previously confusingly named 'facing')
  facing_direction?: string;
  
  balcony_count?: number;
  floor_levels?: string;
  completion_duration?: string; // DB is text: "Q4 2026"
  rera_id?: string;

  // --- Rich Data (JSONB mappings) ---
  
  // Mapped from DB 'media' jsonb column
  media?: {
    images: string[];
    brochure?: string;   // URL to PDF
    floor_plan?: string; // URL to Image/PDF
  }; 
  
  // Mapped from DB 'specs' jsonb column
  // Keeping string | number to be safe with existing data
  specs?: Record<string, string | number>; 
  
  // Mapped from DB 'amenities_detailed' jsonb column
  amenities_detailed?: {
    sports?: string[];
    leisure?: string[];
    wellness?: string[];
    worship?: string[];
    security?: string[];
    [key: string]: any;
  };
  
  // Mapped from DB 'social_infra' jsonb column
  social_infra?: Record<string, string>;

  // Mapped from DB 'units_available' jsonb column
  units_available?: Record<string, number>;
  
  // --- Contact ---
  contact_person?: string;
  contact_phone?: string;

  // --- UI Only (Calculated on frontend, not in DB) ---
  distance?: number;        // Calculated via Haversine
  score?: number;           // For AI/Sorting logic
  reasons?: string[];       // Explanation for AI recommendation
  images?: string[];        // Helper accessor for media.images (legacy support)
}

// --- Filter Interfaces ---
// 2. Filter State Interface
export interface FilterCriteria {
  // Basic Filters
  status?: string[];        // Array for multi-select (e.g. ['Ready', 'Under Construction'])
  minPrice?: number;
  maxPrice?: number;
  configurations?: string[];
  zones?: Zone[];
  
  // Advanced Filters
  facing?: string[];        // UI filter often uses 'facing', mapped to 'facing_direction' in query
  sqFtMin?: number;         // Parsed from sq_ft_range
  sqFtMax?: number;
  possessionYear?: string;  // Filter by "2026" inside completion_duration
}



