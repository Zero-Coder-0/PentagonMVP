// src/modules/inventory/types-v7.ts

// 1. The Master Table: Projects
export interface ProjectV7 {
  id?: string; // Optional for new projects
  name: string;
  developer: string;
  rera_id: string | null;
  status: 'Pre-Launch' | 'Under Construction' | 'Ready';
  
  // Location
  zone: 'North' | 'South' | 'East' | 'West';
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
  possession_date: string; // ISO Date string
  construction_technology: string | null;
  open_space_percent: number | null;
  structure_details: string | null;

  // Assets
  hero_image_url: string | null;
  brochure_url: string | null;
  marketing_kit_url: string | null;
  
  // FIX: The Flexible Field is now explicitly defined
  specifications?: Record<string, any>; 
}


// 2. The Inventory: Units
export interface ProjectUnitV7 {
  // FIX: These are now Optional (?) so you can create a unit without an ID
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
  unit_specs?: Record<string, any>; // Support for extra unit details
}


// 3. Analysis & Pitch
export interface ProjectAnalysisV7 {
  overall_rating: number;
  pros: string[];
  cons: string[];
  target_customer_profile: string | null;
  closing_pitch: string | null;
  objection_handling: string | null; // <--- Included as requested
  competitor_names: string[];
}


// 4. Amenities
export interface ProjectAmenityV7 {
  category: string;    // "Sports", "Leisure"
  name: string;
  size_specs: string | null; // "20,000 sqft"
}


// 5. Landmarks
export interface ProjectLandmarkV7 {
  category: string;    // "School", "IT Park"
  name: string;
  distance_km: number;
  travel_time_mins: number | null;
}


// 6. Cost Extras (GST, Club, etc.)
export interface ProjectCostExtraV7 {
  name: string;
  cost_type: 'Fixed' | 'Percentage';
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
  cost_extras?: ProjectCostExtraV7[];
}
