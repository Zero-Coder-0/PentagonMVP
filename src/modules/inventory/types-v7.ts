// src/modules/inventory/types-v7.ts
//
// Types derived from project-constants.ts — never diverge from the DB values.
// ============================================================================

// Import all enum types from the single source of truth
import {
  ProjectStatus,
  CityZone,
  BuilderGrade,
  BhkConfig,
  UnitFacing,
  PropertyType,
  ConstructionType,
  UnitStatus,
  PossessionMonth,
  PossessionYear,
  UnitVariant,
  BathroomCount,
  BalconyCount,
  WaterSource,
  AmenityCategory,
  LandmarkCategory,
} from '@/lib/project-constants';

// Re-export them so other files can still import them from here
export type {
  ProjectStatus,
  CityZone,
  BuilderGrade,
  BhkConfig,
  UnitFacing,
  PropertyType,
  ConstructionType,
  UnitStatus,
  PossessionMonth,
  PossessionYear,
  UnitVariant,
  BathroomCount,
  BalconyCount,
  WaterSource,
  AmenityCategory,
  LandmarkCategory,
};

// ─── Light type for map pins + list cards ────────────────────────────────────
export interface ProjectV7 {
  id: string;
  project_name: string;
  projectstatus?: ProjectStatus;
  developer_buildergrade?: BuilderGrade;
  city_zone?: CityZone;
  property_type?: PropertyType;
  city?: string;
  slug?: string;
  general_location?: string;
  address_line?: string;
  district?: string;
  pincode?: string;
  possession_month?: PossessionMonth;
  possession_year?: PossessionYear;
  pricedisplay?: string;
  pricemin?: number;
  pricemax?: number;
  payment_plan_type?: string;
  payment_plan_details?: string;
  floor_rise_charges?: string;
  rera_registration_no?: string;
  region?: string;
  lat?: number;
  lng?: number;
  hero_image?: string;
  images?: string[];          // ← Added: full image gallery array from DB
  configurations?: string[];
  possession_date?: string;   // Derived field
  construction_type?: ConstructionType;
  units?: ProjectUnitV7[];    // ← Added for dashboard filtering
}

// ─── Full project (loaded on demand via getProjectByIdV7) ─────────────────────
export interface ProjectFullV7 extends ProjectV7 {
  total_land_area?: string;
  total_units?: number;
  total_phases?: number;
  project_theme?: string;
  current_phase_under_sale?: string;
  brochure_url?: string;
  virtual_tour_url?: string;

  // Developer
  developer_name?: string;
  developer_logo_url?: string;
  developer_website?: string;
  developer_description?: string;
  developer_reputation?: string;
  developer_years_in_market?: number;
  developer_past_projects?: string;
  developer_corporate_rera?: string;
  developer_financial_strength?: string;

  // Specs
  no_of_towers?: number;
  floors_per_tower?: number;
  units_per_floor?: number;
  elevators_per_tower?: number;
  service_elevators_per_tower?: number;
  construction_type?: ConstructionType;
  structure_details?: string;
  wall_finishing_interior?: string;
  wall_finishing_exterior?: string;
  flooring_living_dining?: string;
  flooring_master_bedroom?: string;
  flooring_other_bedrooms?: string;
  flooring_balcony_utility?: string;
  kitchen_countertop?: string;
  kitchen_sink_details?: string;
  kitchen_dado_tiling?: string;
  gas_pipeline_provision?: string;
  bathroom_sanitary_ware?: string;
  bathroom_cp_fittings?: string;
  bathroom_dado_tiling?: string;
  main_door_specs?: string;
  internal_doors_specs?: string;
  windows_specs?: string;
  electrical_switches?: string;
  power_backup?: string;
  road_width?: string;
  water_source?: WaterSource;
  open_space_pct?: string;

  // Analysis
  usp?: string;
  usp_highlights?: string[];
  closing_pitch?: string;
  target_customer?: string;
  objection_handling?: any;
  legal_notes?: string;
  timeline_risk?: string;
  overall_rating?: number;
  pros?: string[];
  cons?: string[];

  // Connectivity
  distancetomainroad?: string;
  airportdistance?: string;
  railwaystationdistance?: string;
  metrostationdistance?: string;
  busstopdistance?: string;

  // Arrays
  units: ProjectUnitV7[];
  amenities: ProjectAmenityV7[];
  landmarks: ProjectLandmarkV7[];
  commercials: ProjectCommercialV7[];
  competitors: ProjectCompetitorV7[];
}

export interface ProjectUnitV7 {
  id: string;
  unitnumber: string;
  floornumber?: number;
  type?: UnitVariant;
  config?: BhkConfig;
  tower?: string;
  actualsba?: number;
  carpetarea?: number;
  udsarea?: number;
  facing?: UnitFacing;
  balconycount?: BalconyCount;
  wccount?: BathroomCount;
  pricetotal?: number;
  pricepersqft?: number;
  status?: UnitStatus;
}

export interface ProjectAmenityV7 {
  id: string;
  category?: AmenityCategory;
  name?: string;
  description?: string;
  size_specs?: string;
}

export interface ProjectLandmarkV7 {
  id: string;
  category?: LandmarkCategory;
  name?: string;
  distance_km?: string;
  travel_time?: string;
}

export interface ProjectCommercialV7 {
  id: string;
  name?: string;
  amount?: number;
  cost_type?: string;
  payment_milestone?: string;
}

export interface ProjectCompetitorV7 {
  id: string;
  name?: string;
  price_range?: string;
}

// ─── Filter criteria type ─────────────────────────────────────────────────────
export interface FilterCriteriaV7 {
  status?: ProjectStatus[];
  city_zones?: CityZone[];
  minPrice?: number;
  maxPrice?: number;
  configurations?: string[];
  facing?: UnitFacing[];
  possessionYear?: string;
  amenities?: string[];
  technology?: string[];
  builderGrades?: BuilderGrade[];
  sqFtMin?: number;
  sqFtMax?: number;
  // Advanced Unit-Level Filters
  balconyCount?: BalconyCount[];
  bathroomCount?: BathroomCount[];
  unitVariant?: UnitVariant[];
  waterSource?: WaterSource[];
}