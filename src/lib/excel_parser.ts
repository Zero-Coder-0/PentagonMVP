// src/lib/excel-parser.ts
/**
 * Excel Parser for GeoEstate Property Bulk Upload
 * Parses the 397-column Excel template into database-ready objects
 */

export interface ParsedPropertyData {
  project: {
    name: string;
    developer: string;
    rera_id?: string;
    status: 'Pre-Launch' | 'Under Construction' | 'Ready';
    zone: 'North' | 'South' | 'East' | 'West';
    region: string;
    property_type?: string;
    total_units?: number;
    total_land_area?: string;
    possession_date?: string;
    floor_levels?: string;
    open_space_percent?: number;
    construction_technology?: string;
    builder_grade?: string;
    construction_type?: string;
    address_line?: string;
    lat: number;
    lng: number;
    price_min: number;
    price_display: string;
    price_per_sqft?: string;
    onwards_pricing?: string;
    specifications?: any;
    hero_image_url?: string;
    brochure_url?: string;
    marketing_kit_url?: string;
  };
  units: Array<{
    type: string;
    sba_sqft: number;
    carpet_sqft: number;
    uds_sqft?: number;
    base_price: number;
    wc_count?: number;
    balcony_count?: number;
    facing_available?: string;
    plc_charges?: number;
    flooring_type?: string;
  }>;
  analysis: {
    overall_rating?: number;
    target_customer_profile: string;
    closing_pitch: string;
    usp?: string;
    objection_handling?: string;
    pros: string[];
    cons: string[];
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
  location_advantages: Array<{
    category_name: string;
    details: string;
    distance_km?: number;
    travel_time_mins?: number;
  }>;
  competitors: Array<{
    competitor_name: string;
    competitor_price_range: string;
    distance_km?: number;
    similar_configs?: string;
    notes?: string;
  }>;
  cost_extras: Array<{
    name: string;
    cost_type: 'Fixed' | 'Percentage' | 'Per SqFt';
    amount: number;
    payment_milestone?: string;
  }>;
}

/**
 * Parse a single row from Excel to PropertyData
 * Row structure based on GeoEstate_Property_Master_Template.xlsx
 */
export function parseExcelRow(row: any[]): ParsedPropertyData {
  // Helper function to safely get value
  const get = (index: number, defaultValue: any = null) => {
    const val = row[index];
    return val !== undefined && val !== null && val !== '' ? val : defaultValue;
  };

  // Helper to parse number
  const num = (index: number, defaultValue: number = 0) => {
    const val = get(index);
    return val ? parseFloat(val) : defaultValue;
  };

  // Helper to parse int
  const int = (index: number, defaultValue: number = 0) => {
    const val = get(index);
    return val ? parseInt(val) : defaultValue;
  };

  const data: ParsedPropertyData = {
    // ========== PROJECT (Columns 0-38) ==========
    project: {
      // Basic Info (0-14)
      name: get(0, ''),
      developer: get(1, ''),
      rera_id: get(2),
      status: get(3, 'Under Construction') as any,
      zone: get(4, 'North') as any,
      region: get(5, ''),
      property_type: get(6),
      total_units: int(7),
      total_land_area: get(8),
      possession_date: get(9),
      floor_levels: get(10),
      open_space_percent: int(11),
      construction_technology: get(12),
      builder_grade: get(13),
      construction_type: get(14),

      // Location (15-17)
      address_line: get(15),
      lat: num(16, 12.9716),
      lng: num(17, 77.5946),

      // Pricing (18-21)
      price_min: int(18, 0),
      price_display: get(19, ''),
      price_per_sqft: get(20),
      onwards_pricing: get(21),

      // Specifications (22-35)
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

    // ========== UNIT CONFIGURATIONS (Columns 39-98, 6 configs × 10 fields) ==========
    units: [],

    // ========== SALES INTELLIGENCE (Columns 99-118) ==========
    analysis: {
      overall_rating: num(99),
      target_customer_profile: get(100, ''),
      closing_pitch: get(101, ''),
      usp: get(102),
      objection_handling: get(103),
      pros: [],
      cons: [],
    },

    // ========== AMENITIES (Columns 119-223, 35 slots × 3 fields) ==========
    amenities: [],

    // ========== LANDMARKS (Columns 224-303, 20 slots × 4 fields) ==========
    landmarks: [],

    // ========== LOCATION ADVANTAGES (Columns 304-331, 7 categories × 4 fields) ==========
    location_advantages: [],

    // ========== COMPETITORS (Columns 332-356, 5 slots × 5 fields) ==========
    competitors: [],

    // ========== COST EXTRAS (Columns 357-396, 10 items × 4 fields) ==========
    cost_extras: [],
  };

  // Parse 6 Unit Configurations (columns 39-98)
  for (let i = 0; i < 6; i++) {
    const base = 39 + i * 10;
    const type = get(base);

    if (type) {
      data.units.push({
        type,
        sba_sqft: int(base + 1),
        carpet_sqft: int(base + 2),
        uds_sqft: int(base + 3),
        base_price: int(base + 4),
        wc_count: int(base + 5),
        balcony_count: int(base + 6),
        facing_available: get(base + 7),
        plc_charges: int(base + 8),
        flooring_type: get(base + 9),
      });
    }
  }

  // Parse 10 Pros (columns 105-114)
  for (let i = 0; i < 10; i++) {
    const pro = get(105 + i);
    if (pro) data.analysis.pros.push(pro);
  }

  // Parse 5 Cons (columns 115-119)
  for (let i = 0; i < 5; i++) {
    const con = get(115 + i);
    if (con) data.analysis.cons.push(con);
  }

  // Parse 35 Amenities (columns 119-223)
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

  // Parse 20 Landmarks (columns 224-303)
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

  // Parse 7 Location Advantages (columns 304-331)
  for (let i = 0; i < 7; i++) {
    const base = 304 + i * 4;
    const category = get(base);

    if (category) {
      data.location_advantages.push({
        category_name: category,
        details: get(base + 1, ''),
        distance_km: num(base + 2),
        travel_time_mins: int(base + 3),
      });
    }
  }

  // Parse 5 Competitors (columns 332-356)
  for (let i = 0; i < 5; i++) {
    const base = 332 + i * 5;
    const name = get(base);

    if (name) {
      data.competitors.push({
        competitor_name: name,
        competitor_price_range: get(base + 1, ''),
        distance_km: num(base + 2),
        similar_configs: get(base + 3),
        notes: get(base + 4),
      });
    }
  }

  // Parse 10 Cost Extras (columns 357-396)
  for (let i = 0; i < 10; i++) {
    const base = 357 + i * 4;
    const name = get(base);

    if (name) {
      data.cost_extras.push({
        name,
        cost_type: get(base + 1, 'Fixed') as any,
        amount: num(base + 2),
        payment_milestone: get(base + 3),
      });
    }
  }

  return data;
}

/**
 * Validate parsed data before inserting into database
 */
export function validatePropertyData(data: ParsedPropertyData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!data.project.name) errors.push('Project name is required');
  if (!data.project.developer) errors.push('Developer name is required');
  if (!data.project.region) errors.push('Region is required');
  if (!data.project.price_display) errors.push('Price display is required');
  if (data.project.price_min <= 0) errors.push('Price must be greater than 0');
  if (!data.project.lat || !data.project.lng) errors.push('Latitude and Longitude are required');
  if (!data.analysis.target_customer_profile) errors.push('Target customer profile is required');
  if (!data.analysis.closing_pitch) errors.push('Closing pitch is required');

  // Coordinate validation (Bangalore bounds)
  if (data.project.lat < 12.5 || data.project.lat > 13.5) {
    errors.push('Latitude must be between 12.5 and 13.5 (Bangalore)');
  }
  if (data.project.lng < 77.0 || data.project.lng > 78.0) {
    errors.push('Longitude must be between 77.0 and 78.0 (Bangalore)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
