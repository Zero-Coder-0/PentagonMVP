// src/lib/excel_parser.ts
// Excel Parser for Property Bulk Upload
// Updated to match REAL_ESTATE_SCHEMA_FINAL.sql

import {
  ProjectFull,
  BangaloreZone,
  ProjectStatus,
  BuilderGrade,
  Unit,
  ProjectAnalysis,
  ProjectLandmark,
  ProjectCompetitor,
} from '@/modules/inventory/types-v7';

// =====================================================
// PROJECT INSERT DATA TYPE (without auto-generated fields)
// =====================================================

export type ProjectInsertData = Omit<ProjectFull, 'id' | 'created_at' | 'updated_at' | 'created_by'> & {
  units?: Array<Omit<Unit, 'id' | 'project_id' | 'created_at' | 'updated_at'>>;
  analysis?: Omit<ProjectAnalysis, 'id' | 'project_id' | 'created_at'>;
  landmarks?: Array<Omit<ProjectLandmark, 'id' | 'project_id' | 'created_at'>>;
  competitors?: Array<Omit<ProjectCompetitor, 'id' | 'project_id' | 'created_at'>>;
};

// =====================================================
// PARSED PROPERTY DATA INTERFACE
// =====================================================

export interface ParsedPropertyData {
  project: {
    project_name: string;
    developer_name: string;
    rera_registration_no?: string;
    project_status?: ProjectStatus;
    bangalore_zone?: BangaloreZone;
    region: string;
    property_type?: string;
    total_units?: number;
    total_land_area?: string;
    possession_date?: string;
    floor_levels?: string;
    open_space_percent?: number;
    construction_technology?: string;
    builder_grade?: BuilderGrade;
    construction_type?: string;
    address_line?: string;
    latitude: number;
    longitude: number;
    price_min?: number;
    price_display?: string;
    price_per_sqft?: string;
    onwards_pricing?: string;
    specifications?: any;
    hero_image_url?: string;
    brochure_url?: string;
    marketing_kit_url?: string;
  };
  units: Array<{
    config_type: string;
    actual_sba: number;
    actual_carpet_area: number;
    uds_area?: number;
    price_total: number;
    wc_count?: number;
    balcony_count?: number;
    facing_available?: string[];
    plc_charges?: number;
    flooring_type?: string;
    power_load_kw?: number;
    is_available?: boolean;
  }>;
  analysis: {
    overall_rating?: number;
    target_customer_profile: string;
    closing_pitch: string;
    usp?: string;
    objection_handling?: string;
    pros: string[];
    cons: string[];
    competitor_names?: string[];
  };
  amenities: Array<{
    name: string;
    category: string;
    size_specs?: string;
  }>;
  landmarks: Array<{
    name: string;
    category: string;
    distance_km: number;
    travel_time_mins?: number;
  }>;
  locationAdvantages: Array<{
    category_name: string;
    details: string;
    distance_km?: number;
    travel_time_mins?: number;
  }>;
  competitors: Array<{
    competitor_name: string;
    competitor_price_range: string;
    distance_km?: number;
    similar_configs?: string[];
    notes?: string;
  }>;
  costExtras: Array<{
    name: string;
    cost_type: 'Fixed' | 'Percentage' | 'Per SqFt';
    amount: number;
    payment_milestone?: string;
  }>;
}

// =====================================================
// PARSE EXCEL ROW TO PROPERTY DATA
// =====================================================

/**
 * Parses a single Excel row into structured property data
 * @param row - Array of cell values from Excel
 * @returns ParsedPropertyData object
 */
export function parseExcelRow(row: any[]): ParsedPropertyData {
  // Helper: Safely get value from row
  const get = (index: number, defaultValue: any = null): any => {
    const val = row[index];
    return val !== undefined && val !== null && val !== '' ? val : defaultValue;
  };

  // Helper: Parse number
  const num = (index: number, defaultValue: number = 0): number => {
    const val = get(index);
    return val ? parseFloat(val) : defaultValue;
  };

  // Helper: Parse integer
  const int = (index: number, defaultValue: number = 0): number => {
    const val = get(index);
    return val ? parseInt(val) : defaultValue;
  };

  // Helper: Parse ENUM (with fallback)
  const parseEnum = <T>(value: any, validValues: T[], defaultValue: T): T => {
    if (!value) return defaultValue;
    const match = validValues.find((v) => v === value);
    return match || defaultValue;
  };

  const data: ParsedPropertyData = {
    // =====================================================
    // PROJECT (Columns 0-38)
    // =====================================================
    project: {
      // Basic Info (0-14)
      project_name: get(0, ''),
      developer_name: get(1, ''),
      rera_registration_no: get(2),
      project_status: parseEnum<ProjectStatus>(
        get(3),
        ['DRAFT', 'PENDING_APPROVAL', 'Pre-Launch', 'Under Construction', 'Nearing Completion', 'Ready to Move', 'Sold Out'],
        'Under Construction'
      ),
      bangalore_zone: parseEnum<BangaloreZone>(
        get(4),
        ['North', 'South', 'East', 'West', 'Central'],
        'South'
      ),
      region: get(5, ''),
      property_type: get(6),
      total_units: int(7),
      total_land_area: get(8),
      possession_date: get(9),
      floor_levels: get(10),
      open_space_percent: int(11),
      construction_technology: get(12),
      builder_grade: parseEnum<BuilderGrade>(
        get(13),
        ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'],
        'B'
      ),
      construction_type: get(14),

      // Location (15-17)
      address_line: get(15),
      latitude: num(16, 12.9716), // Default to Bangalore center
      longitude: num(17, 77.5946),

      // Pricing (18-21)
      price_min: int(18, 0),
      price_display: get(19),
      price_per_sqft: get(20),
      onwards_pricing: get(21),

      // Specifications (22-35) - Store as JSONB
      specifications: {
        clubhouse_size: get(22),
        elevators_per_tower: get(23),
        payment_plan: get(24),
        floor_rise_charges: get(25),
        car_parking_cost: get(26),
        clubhouse_charges: get(27),
        infrastructure_charges: get(28),
        sinking_fund: get(29),
        facing_direction: get(30),
        completion_duration: get(31),
        maintenance_per_sqft: get(32),
        water_source: get(33),
        power_backup: get(34),
        security_features: get(35),
      },

      // Media (36-38)
      hero_image_url: get(36),
      brochure_url: get(37),
      marketing_kit_url: get(38),
    },

    // =====================================================
    // UNIT CONFIGURATIONS (Columns 39-98)
    // 6 configs × 10 fields = 60 columns
    // =====================================================
    units: [],

    // =====================================================
    // SALES INTELLIGENCE (Columns 99-118)
    // =====================================================
    analysis: {
      overall_rating: num(99),
      target_customer_profile: get(100, ''),
      closing_pitch: get(101, ''),
      usp: get(102),
      objection_handling: get(103),
      pros: [],
      cons: [],
      competitor_names: [],
    },

    // =====================================================
    // AMENITIES (Columns 119-223)
    // 35 slots × 3 fields = 105 columns
    // =====================================================
    amenities: [],

    // =====================================================
    // LANDMARKS (Columns 224-303)
    // 20 slots × 4 fields = 80 columns
    // =====================================================
    landmarks: [],

    // =====================================================
    // LOCATION ADVANTAGES (Columns 304-331)
    // 7 categories × 4 fields = 28 columns
    // =====================================================
    locationAdvantages: [],

    // =====================================================
    // COMPETITORS (Columns 332-356)
    // 5 slots × 5 fields = 25 columns
    // =====================================================
    competitors: [],

    // =====================================================
    // COST EXTRAS (Columns 357-396)
    // 10 items × 4 fields = 40 columns
    // =====================================================
    costExtras: [],
  };

  // =====================================================
  // PARSE 6 UNIT CONFIGURATIONS (columns 39-98)
  // =====================================================
  for (let i = 0; i < 6; i++) {
    const base = 39 + i * 10;
    const configType = get(base);

    if (configType) {
      data.units.push({
        config_type: configType,
        actual_sba: int(base + 1),
        actual_carpet_area: int(base + 2),
        uds_area: int(base + 3),
        price_total: int(base + 4),
        wc_count: int(base + 5),
        balcony_count: int(base + 6),
        facing_available: get(base + 7)?.split(',').map((f: string) => f.trim()),
        plc_charges: int(base + 8),
        flooring_type: get(base + 9),
      });
    }
  }

  // =====================================================
  // PARSE 10 PROS (columns 105-114)
  // =====================================================
  for (let i = 0; i < 10; i++) {
    const pro = get(105 + i);
    if (pro) data.analysis.pros.push(pro);
  }

  // =====================================================
  // PARSE 5 CONS (columns 115-119)
  // =====================================================
  for (let i = 0; i < 5; i++) {
    const con = get(115 + i);
    if (con) data.analysis.cons.push(con);
  }

  // =====================================================
  // PARSE 35 AMENITIES (columns 119-223)
  // =====================================================
  for (let i = 0; i < 35; i++) {
    const base = 119 + i * 3;
    const name = get(base);

    if (name) {
      data.amenities.push({
        name,
        category: get(base + 1, 'General'),
        size_specs: get(base + 2),
      });
    }
  }

  // =====================================================
  // PARSE 20 LANDMARKS (columns 224-303)
  // =====================================================
  for (let i = 0; i < 20; i++) {
    const base = 224 + i * 4;
    const name = get(base);

    if (name) {
      data.landmarks.push({
        name,
        category: get(base + 1, ''),
        distance_km: num(base + 2),
        travel_time_mins: int(base + 3),
      });
    }
  }

  // =====================================================
  // PARSE 7 LOCATION ADVANTAGES (columns 304-331)
  // =====================================================
  for (let i = 0; i < 7; i++) {
    const base = 304 + i * 4;
    const category = get(base);

    if (category) {
      data.locationAdvantages.push({
        category_name: category,
        details: get(base + 1, ''),
        distance_km: num(base + 2),
        travel_time_mins: int(base + 3),
      });
    }
  }

  // =====================================================
  // PARSE 5 COMPETITORS (columns 332-356)
  // =====================================================
  for (let i = 0; i < 5; i++) {
    const base = 332 + i * 5;
    const name = get(base);

    if (name) {
      data.competitors.push({
        competitor_name: name,
        competitor_price_range: get(base + 1, ''),
        distance_km: num(base + 2),
        similar_configs: get(base + 3)?.split(',').map((c: string) => c.trim()),
        notes: get(base + 4),
      });
    }
  }

  // =====================================================
  // PARSE 10 COST EXTRAS (columns 357-396)
  // =====================================================
  for (let i = 0; i < 10; i++) {
    const base = 357 + i * 4;
    const name = get(base);

    if (name) {
      data.costExtras.push({
        name,
        cost_type: get(base + 1, 'Fixed') as any,
        amount: num(base + 2),
        payment_milestone: get(base + 3),
      });
    }
  }

  return data;
}

// =====================================================
// VALIDATE PARSED DATA
// =====================================================

export function validatePropertyData(data: ParsedPropertyData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Required fields
  if (!data.project.project_name) {
    errors.push('Project name is required');
  }
  if (!data.project.developer_name) {
    errors.push('Developer name is required');
  }
  if (!data.project.region) {
    errors.push('Region is required');
  }
  if (!data.project.price_display) {
    errors.push('Price display is required');
  }
  if (data.project.price_min === 0) {
    errors.push('Price must be greater than 0');
  }
  if (!data.project.latitude || !data.project.longitude) {
    errors.push('Latitude and Longitude are required');
  }
  if (!data.analysis.target_customer_profile) {
    errors.push('Target customer profile is required');
  }
  if (!data.analysis.closing_pitch) {
    errors.push('Closing pitch is required');
  }

  // Coordinate validation (Bangalore bounds)
  if (data.project.latitude < 12.5 || data.project.latitude > 13.5) {
    errors.push('Latitude must be between 12.5 and 13.5 (Bangalore)');
  }
  if (data.project.longitude < 77.0 || data.project.longitude > 78.0) {
    errors.push('Longitude must be between 77.0 and 78.0 (Bangalore)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// CONVERT PARSED DATA TO ProjectFull (without IDs)
// =====================================================

export function convertToProjectFull(data: ParsedPropertyData): ProjectInsertData {
  return {
    project_name: data.project.project_name,
    latitude: data.project.latitude,
    longitude: data.project.longitude,
    address_line: data.project.address_line,
    region: data.project.region,
    bangalore_zone: data.project.bangalore_zone,
    project_status: data.project.project_status,
    possession_date: data.project.possession_date,
    property_type: data.project.property_type,
    total_land_area: data.project.total_land_area,
    total_units: data.project.total_units,
    floor_levels: data.project.floor_levels,
    open_space_percent: data.project.open_space_percent,
    construction_technology: data.project.construction_technology,
    construction_type: data.project.construction_type,
    builder_grade: data.project.builder_grade,
    rera_registration_no: data.project.rera_registration_no,
    specifications: data.project.specifications,
    hero_image_url: data.project.hero_image_url,
    brochure_url: data.project.brochure_url,
    marketing_kit_url: data.project.marketing_kit_url,
    
    // Developer (will be looked up or created)
    developer: {
      developer_name: data.project.developer_name,
      builder_grade: data.project.builder_grade,
    },
    
    // Units (without project_id - will be added during insertion)
    units: data.units.map((u) => ({
      unit_number: `${u.config_type}-AUTO`,
      actual_sba: u.actual_sba,
      actual_carpet_area: u.actual_carpet_area,
      uds_area: u.uds_area,
      price_total: u.price_total,
      wc_count: u.wc_count,
      balcony_count: u.balcony_count,
      facing_available: u.facing_available,
      plc_charges: u.plc_charges,
      flooring_type: u.flooring_type,
      power_load_kw: u.power_load_kw,
      is_available: u.is_available !== false,
      status: 'Available',
    })),
    
    // Analysis (without project_id)
    analysis: {
      overall_rating: data.analysis.overall_rating,
      pros: data.analysis.pros,
      cons: data.analysis.cons,
      target_customer_profile: data.analysis.target_customer_profile,
      closing_pitch: data.analysis.closing_pitch,
      usp: data.analysis.usp,
      objection_handling: data.analysis.objection_handling,
      competitor_names: data.analysis.competitor_names,
    },
    
    // Landmarks (without project_id)
    landmarks: data.landmarks.map((l) => ({
      name: l.name,
      category: l.category,
      distance_km: l.distance_km,
      travel_time_mins: l.travel_time_mins,
    })),
    
    // Competitors (without project_id)
    competitors: data.competitors.map((c) => ({
      competitor_name: c.competitor_name,
      competitor_price_range: c.competitor_price_range,
      distance_km: c.distance_km,
      similar_configs: c.similar_configs,
      notes: c.notes,
    })),
  };
}
