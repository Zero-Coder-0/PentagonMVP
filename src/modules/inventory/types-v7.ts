// src/modules/inventory/types-v7.ts
// Type definitions matching REAL_ESTATE_SCHEMA_FINAL.sql

// =====================================================
// ENUMS (matching PostgreSQL ENUMs from schema)
// =====================================================

export type UserRole = 
  | 'Super Admin' 
  | 'Admin' 
  | 'Manager' 
  | 'Sales Executive' 
  | 'Vendor';

export type ProjectStatus = 
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'Pre-Launch'
  | 'Under Construction'
  | 'Nearing Completion'
  | 'Ready to Move'
  | 'Sold Out';

export type BangaloreZone = 
  | 'North' 
  | 'South' 
  | 'East' 
  | 'West' 
  | 'Central';

export type BuilderGrade = 
  | 'A+' | 'A' | 'A-'
  | 'B+' | 'B' | 'B-'
  | 'C+' | 'C' | 'C-'
  | 'D+' | 'D' | 'D-'
  | 'F';

export type UnitStatus = 
  | 'Available' 
  | 'Blocked' 
  | 'Sold' 
  | 'Reserved' 
  | 'Resale';

export type LeadStatus = 
  | 'New'
  | 'Contacted'
  | 'Site Visit Booked'
  | 'Site Visit Done'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export type VisitStatus = 
  | 'Confirmed' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Rescheduled' 
  | 'No Show';

// =====================================================
// MASTER TABLES
// =====================================================

export interface Developer {
  id?: string;
  developer_name: string;
  slug?: string;
  builder_grade?: BuilderGrade;
  established_year?: number;
  headquarters_location?: string;
  gst_number?: string;
  rera_registration?: string;
  office_address?: string;
  office_phone?: string;
  office_email?: string;
  website_url?: string;
  years_in_market?: number;
  total_completed_projects?: number;
  reputation_score?: number;
  financial_strength?: string;
  construction_quality?: string;
  customer_feedback?: string;
  logo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AmenityMaster {
  id?: string;
  amenity_name: string;
  category?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
}

// =====================================================
// PROJECTS TABLE (Main)
// =====================================================

export interface Project {
  id?: string;
  project_name: string;
  slug?: string;
  developer_id?: string; // FK to developers table
  
  // Geolocation (MANDATORY)
  latitude: number;
  longitude: number;
  
  // Address
  address_line?: string;
  region?: string;
  city?: string;
  pincode?: string;
  
  // Zone
  bangalore_zone?: BangaloreZone;
  
  // Status
  project_status?: ProjectStatus;
  possession_date?: string; // ISO date
  
  // Property Details
  property_type?: string;
  total_land_area?: string;
  total_units?: number;
  number_of_phases?: number;
  current_phase_under_sale?: string;
  floor_levels?: string;
  construction_type?: string;
  construction_technology?: string;
  elevators_per_tower?: string;
  open_space_percent?: number;
  project_theme?: string;
  usp?: string;
  rera_registration_no?: string;
  
  // CACHED FIELDS (auto-updated by triggers)
  price_min?: number;
  price_max?: number;
  price_display?: string;
  price_per_sqft?: string;
  onwards_pricing?: string;
  configurations?: string[]; // Array: ['2BHK', '3BHK']
  
  // Clubhouse
  clubhouse_size?: string;
  clubhouse_charges?: string;
  
  // Costs
  payment_plan?: string;
  floor_rise_charges?: string;
  car_parking_cost?: string;
  infrastructure_charges?: string;
  sinking_fund?: string;
  maintenance_charges?: string;
  
  // Gallery Images (cached for map popups)
  gallery_images?: string[]; // Array of URLs
  
  // Flexible Specs (JSONB)
  specifications?: Record<string, any>;
  
  // Custom Amenities (JSONB)
  custom_amenities?: Record<string, any>;
  
  // Nearby Summary (cached JSONB)
  nearby_summary?: {
    schools?: Array<{ name: string; distance: string }>;
    hospitals?: Array<{ name: string; distance: string }>;
    malls?: Array<{ name: string; distance: string }>;
    it_parks?: Array<{ name: string; distance: string }>;
  };
  
  // WhatsApp Pitch
  whatsapp_pitch_headline?: string;
  whatsapp_pitch_highlights?: string[];
  whatsapp_pitch_cta?: string;
  
  // Builder Grade (can override developer's grade)
  builder_grade?: BuilderGrade;
  
  // Media
  hero_image_url?: string;
  brochure_url?: string;
  marketing_kit_url?: string;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// =====================================================
// UNIT TEMPLATES
// =====================================================

export interface UnitTemplate {
  id?: string;
  project_id: string;
  template_name: string; // e.g., "Tower A - 2BHK Premium"
  config_type: string; // '2BHK', '3BHK', '4BHK'
  
  // Standard Areas
  std_super_built_up_area?: number;
  std_carpet_area?: number;
  std_balcony_area?: number;
  std_terrace_area?: number;
  std_garden_area?: number;
  std_uds_area?: number;
  
  wc_count?: number;
  balcony_count?: number;
  
  // Standard Pricing
  std_base_price?: number;
  std_price_per_sqft?: number;
  
  // Specs (JSONB)
  specifications?: Record<string, any>;
  room_dimensions?: Record<string, any>;
  
  description?: string;
  unit_strengths?: string;
  unit_drawbacks?: string;
  vastu_compliance?: string;
  ventilation_quality?: string;
  
  created_at?: string;
}

// =====================================================
// UNITS TABLE
// =====================================================

export interface Unit {
  id?: string;
  project_id: string;
  template_id?: string; // FK to unit_templates
  
  unit_number: string; // e.g., "A-101"
  floor_number?: number;
  block_tower?: string;
  facing?: string;
  facing_available?: string[];
  view_type?: string;
  
  // Status
  status?: UnitStatus;
  is_available?: boolean;
  
  // Actual Areas (can differ from template)
  actual_sba?: number;
  actual_carpet_area?: number;
  balcony_area?: number;
  private_terrace_area?: number;
  garden_area?: number;
  uds_area?: number;
  
  wc_count?: number;
  balcony_count?: number;
  
  // Pricing
  price_total: number;
  price_per_sqft?: number;
  plc_charges?: number;
  floor_rise_charges?: number;
  parking_charges?: number;
  
  flooring_type?: string;
  power_load_kw?: number;
  
  // Custom Fields (JSONB)
  unit_specs?: Record<string, any>;
  custom_features?: Record<string, any>;
  
  is_hot_selling?: boolean;
  is_recommended?: boolean;
  internal_notes?: string;
  
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// PROJECT AMENITIES (Many-to-Many Link)
// =====================================================

export interface ProjectAmenityLink {
  id?: string;
  project_id: string;
  amenity_id: string; // FK to amenities_master
  custom_description?: string;
  size_specs?: string;
  quantity?: number;
}

// =====================================================
// ANALYSIS & SALES STRATEGY
// =====================================================

export interface ProjectAnalysis {
  id?: string;
  project_id: string;
  overall_rating?: number;
  pros?: string[];
  cons?: string[];
  target_customer_profile?: string;
  closing_pitch?: string;
  objection_handling?: string;
  competitor_names?: string[];
  usp?: string;
  created_at?: string;
}

// =====================================================
// NEARBY INFRASTRUCTURE
// =====================================================

export interface ITParkProximity {
  id?: string;
  project_id: string;
  it_park_name: string;
  distance_km?: string;
  travel_time?: string;
  created_at?: string;
}

export interface SchoolNearby {
  id?: string;
  project_id: string;
  school_name: string;
  distance_km?: string;
  travel_time?: string;
  created_at?: string;
}

export interface HospitalNearby {
  id?: string;
  project_id: string;
  hospital_name: string;
  distance_km?: string;
  travel_time?: string;
  created_at?: string;
}

export interface ShoppingMallNearby {
  id?: string;
  project_id: string;
  mall_name: string;
  distance_km?: string;
  travel_time?: string;
  created_at?: string;
}

export interface ProjectLandmark {
  id?: string;
  project_id: string;
  category: string;
  name: string;
  distance_km?: number;
  travel_time_mins?: number;
  created_at?: string;
}

// =====================================================
// COMPETITORS
// =====================================================

export interface ProjectCompetitor {
  id?: string;
  project_id: string;
  competitor_name: string;
  competitor_price_range?: string;
  distance_km?: number;
  similar_configs?: string[];
  notes?: string;
  created_at?: string;
}

// =====================================================
// LEADS & SITE VISITS
// =====================================================

export interface Lead {
  id?: string;
  phone_number: string;
  customer_name?: string;
  email?: string;
  lead_source?: string;
  lead_status?: LeadStatus;
  budget_min?: number;
  budget_max?: number;
  preferred_locations?: string;
  preferred_config?: string;
  assigned_to?: string;
  last_contacted?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteVisit {
  id?: string;
  project_id: string;
  unit_id?: string;
  lead_id: string;
  customer_name: string;
  customer_phone: string;
  visit_date: string; // DATE
  visit_time?: string; // TIME
  visit_status?: VisitStatus;
  seller_confirmation_status?: 'Pending' | 'Confirmed' | 'Declined';
  visit_notes?: string;
  feedback?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

// =====================================================
// COMPOSITE TYPES FOR UI
// =====================================================

export interface ProjectFull extends Project {
  // Joined data
  developer?: Developer;
  units?: Unit[];
  unit_templates?: UnitTemplate[];
  analysis?: ProjectAnalysis;
  amenities?: ProjectAmenityLink[];
  landmarks?: ProjectLandmark[];
  competitors?: ProjectCompetitor[];
  it_parks?: ITParkProximity[];
  schools?: SchoolNearby[];
  hospitals?: HospitalNearby[];
  malls?: ShoppingMallNearby[];
}

// =====================================================
// FILTER CRITERIA
// =====================================================

export interface FilterCriteria {
  // Status
  status?: ProjectStatus[];
  
  // Location
  zones?: BangaloreZone[];
  regions?: string[];
  
  // Configuration
  configurations?: string[];
  
  // Price Range
  minPrice?: number;
  maxPrice?: number;
  
  // Area Range
  minSqft?: number;
  maxSqft?: number;
  
  // Developer
  developers?: string[];
  developer_ids?: string[];
  
  // Possession
  possession_year?: string;
  
  // Builder Grade
  builder_grades?: BuilderGrade[];
  
  // Property Type
  property_types?: string[];
  
  // Amenities
  required_amenities?: string[];
}

// =====================================================
// PROPERTY DRAFTS (Vendor Submissions)
// =====================================================

export interface PropertyDraft {
  id?: string;
  vendor_id?: string;
  submission_data: ProjectFull; // JSONB containing full project data
  status?: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at?: string;
}
