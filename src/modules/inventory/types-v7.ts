// src/modules/inventory/types-v7.ts
export type Zone = 'North' | 'South' | 'East' | 'West';
// 1. The Master Table: Projects
export interface ProjectV7 {
  id?: string; // Optional for new projects
  created_at?: string; // ISO timestamp
  name: string;
  developer: string;
  rera_id: string | null;
  status: 'Pre-Launch' | 'Under Construction' | 'Ready';
  
  // Location
  zone: Zone;
  region: string;
  address_line: string | null;
  lat: number;
  lng: number;

  // Auto-calculated Marketing Info
  price_min?: number;
  price_display?: string;
  configurations?: string[]; // ["2BHK", "3BHK"]

  // Tech Specs
  total_land_area: string | null;
  total_units: number | null;
  possession_date: string | null; // ISO Date string
  construction_technology: string | null;
  open_space_percent: number | null;
  structure_details: string | null;

  // ========== NEW FIELDS FROM PDF ==========
  property_type: string | null;                    // Type of Development (Villas/Apartments/Township)
  floor_levels: string | null;                     // Towers & Structure (e.g., "2B+G+18")
  clubhouse_size: string | null;                   // Club House Total Sqft
  builder_grade: string | null;                    // Society Highlights: Builder Grade (Premium/Tier-1)
  construction_type: string | null;                // Society Highlights: Construction Type (RCC/Mivan)
  elevators_per_tower: string | null;              // Elevators Per Tower (e.g., "2 Passenger + 1 Service")
  payment_plan: string | null;                     // Payment Plan (Construction Linked/Flexible)
  floor_rise_charges: string | null;               // Floor Rise Charges (per floor increment)
  car_parking_cost: string | null;                 // Car Parking Cost (Included/Extra)
  clubhouse_charges: string | null;                // Clubhouse Charges (One-time/Free)
  infrastructure_charges: string | null;           // Infrastructure Development Charges
  sinking_fund: string | null;                     // Sinking Fund
  onwards_pricing: string | null;                  // Onwards Pricing (Starting price text)
  price_per_sqft: string | null;                   // Price per sqft (formatted)
  facing_direction: string | null;                 // Primary facing direction(s)
  completion_duration: string | null;              // e.g., "36 months" or "Ready to Move"

  // Assets
  hero_image_url: string | null;
  brochure_url: string | null;
  marketing_kit_url: string | null;
  
  // Flexible Field (explicitly defined)
  specifications?: Record<string, any>; 
}


// 2. The Inventory: Units
export interface ProjectUnitV7 {
  id?: string; 
  project_id?: string; 
  
  type: string;        // "3BHK Premium"
  facing: string | null;
  sba_sqft: number;
  carpet_sqft: number | null;
  uds_sqft: number | null;
  base_price: number;
  flooring_type: string | null;
  power_load_kw: number | null;
  is_available: boolean;
  
  // ========== NEW FIELDS FROM PDF ==========
  wc_count: number | null;                         // WC (Water Closets/Bathrooms)
  balcony_count: number | null;                    // BL (Balconies)
  facing_available: string[] | null;               // Facing Available (array of directions)
  plc_charges: number | null;                      // PLC (Preferred Location Charges)
  
  unit_specs?: Record<string, any>; // Support for extra unit details
}


// 3. Analysis & Pitch
export interface ProjectAnalysisV7 {
  id?: string;
  project_id?: string;
  overall_rating: number | null;
  pros: string[] | null;
  cons: string[] | null;
  target_customer_profile: string | null;
  closing_pitch: string | null;
  objection_handling: string | null;
  competitor_names: string[] | null;
  usp?: string;
}


// 4. Amenities
export interface ProjectAmenityV7 {
  id?: string;
  project_id?: string;
  category: string;    // "Sports", "Leisure"
  name: string;
  size_specs: string | null; // "20,000 sqft"
}


// 5. Landmarks (Original - kept for backward compatibility)
export interface ProjectLandmarkV7 {
  id?: string;
  project_id?: string;
  category: string;    // "School", "IT Park"
  name: string;
  distance_km: number;
  travel_time_mins: number | null;
}


// ========== NEW: Location Advantages (Numbered Categories) ==========
export interface ProjectLocationAdvantageV7 {
  id?: string;
  project_id?: string;
  category_number: number;                         // ①②③④⑤⑥⑦ (1-7)
  category_name: string;                           // Metro/Hospitals/Schools/Shopping/Business/Connectivity/Roads
  details: string;                                 // Description with distance/time
  distance_km: number | null;
  travel_time_mins: number | null;
  created_at?: string;
}


// ========== NEW: Competitor Projects ==========
export interface ProjectCompetitorV7 {
  id?: string;
  project_id?: string;
  competitor_name: string;                         // e.g., "Prestige Green Gables"
  competitor_price_range: string | null;           // e.g., "₹2.95 Cr - ₹5.0 Cr"
  distance_km: number | null;
  similar_configs: string[] | null;                // Overlapping BHK types
  notes: string | null;
  created_at?: string;
}


// 6. Cost Extras (GST, Club, etc.)
export interface ProjectCostExtraV7 {
  id?: string;
  project_id?: string;
  name: string;
  cost_type: 'Fixed' | 'Percentage' | string;
  amount: number;
  payment_milestone: string | null;
}


// === COMPOSITE TYPE FOR UI ===
// This is what we fetch from the DB (Project joined with children)
export interface ProjectFullV7 extends ProjectV7 {
  units?: ProjectUnitV7[]; // Optional to handle partial data during creation
  analysis?: ProjectAnalysisV7; // Optional because it might be null
  amenities?: ProjectAmenityV7[];
  landmarks?: ProjectLandmarkV7[];
  location_advantages?: ProjectLocationAdvantageV7[]; // NEW
  competitors?: ProjectCompetitorV7[]; // NEW
  cost_extras?: ProjectCostExtraV7[];
}


// === HELPER TYPE FOR MEGAPOPUP DATA ===
export interface MegaPopupDataV7 {
  project_data: ProjectV7;
  units_data: ProjectUnitV7[];
  location_advantages: ProjectLocationAdvantageV7[];
  competitors: ProjectCompetitorV7[];
  analysis: ProjectAnalysisV7 | null;
  amenities: ProjectAmenityV7[];
  cost_extras: ProjectCostExtraV7[];
}


// === FILTER CRITERIA (for filtering projects) ===
export interface FilterCriteriaV7 {
  status?: ('Pre-Launch' | 'Under Construction' | 'Ready')[];
  zones?: ('North' | 'South' | 'East' | 'West')[];
  configurations?: string[];
  minPrice?: number;
  maxPrice?: number;
  minSqft?: number;
  maxSqft?: number;
  developers?: string[];
  possession_year?: string;
  builder_grade?: string[];
  property_type?: string[];
}
