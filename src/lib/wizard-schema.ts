import { z } from 'zod';
import {
  PROJECT_STATUS_VALUES,
  CITY_ZONES,
  PROPERTY_TYPES,
  BUILDER_GRADES,
  CONSTRUCTION_TYPES,
  POSSESSION_MONTHS,
  UNIT_STATUS_VALUES,
  UNIT_VARIANTS,
  UNIT_FACINGS,
  BATHROOM_COUNTS,
  BALCONY_COUNTS,
  WATER_SOURCES,
  AMENITY_CATEGORIES,
  LANDMARK_CATEGORIES,
  BHK_CONFIGS,
  PAYMENT_MILESTONES,
  COST_TYPES,
  FLOORING_TYPES,
  COUNTERTOP_TYPES,
  POWER_BACKUP_OPTIONS,
  GAS_PIPELINE_OPTIONS,
} from './project-constants';

// ============================================================================
// WIZARD FLAT SCHEMA — The single source of truth for all wizard form state.
// All keys map directly to Prisma column names on the corresponding models.
// Arrays (amenities, commercials, landmarks, units) use z.array(z.object(...)).
// ============================================================================

// --- Sub-object schemas for array fields ---

// Helper to cleanly parse optional numbers from React Hook Form (handles "", NaN)
const optNum = z.coerce.number().catch(undefined).optional();

export const unitSchema = z.object({
  id: z.string().optional(),
  unitnumber: z.string().optional(),
  phase: z.string().optional(),
  config: z.preprocess((val) => val === "" ? undefined : val, z.enum(BHK_CONFIGS as any).optional()),
  type: z.preprocess((val) => val === "" ? undefined : val, z.enum(UNIT_VARIANTS as any).optional()),
  floornumber: optNum,
  tower: z.string().optional(),
  actualsba: optNum,
  carpetarea: optNum,
  udsarea: optNum,
  facing: z.preprocess((val) => val === "" ? undefined : val, z.enum(UNIT_FACINGS as any).optional()),
  wccount: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const s = String(val);
    if (s === '6') return '6+';
    return s;
  }, z.enum(BATHROOM_COUNTS as any).optional()),
  balconycount: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    const s = String(val);
    if (s === '5') return '5+';
    return s;
  }, z.enum(BALCONY_COUNTS as any).optional()),
  pricepersqft: optNum,
  pricetotal: optNum,
  status: z.preprocess((val) => val === "" ? undefined : val, z.enum(UNIT_STATUS_VALUES as any).optional()),
});

export const amenitySchema = z.object({
  id: z.string().optional(),
  category: z.preprocess((val) => val === "" ? undefined : val, z.enum(AMENITY_CATEGORIES as any).optional()),
  name: z.string().optional(),
  description: z.string().optional(),
  size_specs: z.string().optional(),
});

export const landmarkSchema = z.object({
  id: z.string().optional(),
  category: z.preprocess((val) => val === "" ? undefined : val, z.enum(LANDMARK_CATEGORIES as any).optional()),
  name: z.string().optional(),
  distance_km: z.string().optional(),
  travel_time: z.string().optional(),
});

export const commercialSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  amount: optNum,
  cost_type: z.preprocess((val) => val === "" ? undefined : val, z.enum(COST_TYPES as any).optional()),
  payment_milestone: z.preprocess((val) => val === "" ? undefined : val, z.enum(PAYMENT_MILESTONES as any).optional()),
});

export const competitorSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  price_range: z.string().optional(),
});

// --- Core flat wizard schema ---

export const projectWizardSchema = z.object({

  // ─── Project Core (maps to Project model) ───────────────────────────────
  project_name: z.string().min(1, 'Project name is required'),
  property_type: z.preprocess((val) => val === "" ? undefined : val, z.enum(PROPERTY_TYPES as any).optional()),
  projectstatus: z.preprocess((val) => val === "" ? undefined : val, z.enum(PROJECT_STATUS_VALUES as any).optional()),
  city: z.string().optional(),

  city_zone: z.preprocess((val) => val === "" ? undefined : val, z.enum(CITY_ZONES as any).optional()),
  region: z.string().optional(),
  general_location: z.string().optional(),
  address_line: z.string().optional(),
  district: z.string().optional(),
  pincode: z.string().optional(),
  lat: optNum,
  lng: optNum,
  slug: z.string().optional(),
  total_land_area: z.string().optional(),
  total_units: optNum,
  total_phases: optNum,
  project_theme: z.string().optional(),
  current_phase_under_sale: z.string().optional(),
  possession_month: z.preprocess((val) => val === "" ? undefined : val, z.enum(POSSESSION_MONTHS as any).optional()),
  possession_year: optNum,
  pricedisplay: z.string().optional(),
  pricemin: optNum,
  pricemax: optNum,
  configurations: z.array(z.string()).optional(),
  hero_image: z.string().optional(),
  images: z.array(z.string()).optional(),
  virtual_tour_url: z.string().optional(),
  brochure_url: z.string().optional(),

  // ─── ProjectDeveloper fields (namespaced with developer_) ────────────────
  developer_name: z.string().optional(),
  developer_logo_url: z.string().optional(),
  developer_website: z.string().optional(),
  developer_buildergrade: z.preprocess((val) => val === "" ? undefined : val, z.enum(BUILDER_GRADES as any).optional()),
  developer_corporate_rera: z.string().optional(),
  developer_description: z.string().optional(),
  developer_reputation: z.string().optional(),
  developer_years_in_market: optNum,
  developer_past_projects: z.string().optional(),
  developer_financial_strength: z.string().optional(),

  // ─── ProjectSpecification fields ─────────────────────────────────────────
  no_of_towers: optNum,
  floors_per_tower: optNum,
  units_per_floor: optNum,
  elevators_per_tower: optNum,
  service_elevators_per_tower: optNum,
  construction_type: z.preprocess((val) => val === "" ? undefined : val, z.enum(CONSTRUCTION_TYPES as any).optional()),
  structure_details: z.string().optional(),
  wall_finishing_interior: z.string().optional(),
  wall_finishing_exterior: z.string().optional(),
  flooring_living_dining: z.preprocess((val) => val === "" ? undefined : val, z.enum(FLOORING_TYPES as any).optional()),
  flooring_master_bedroom: z.preprocess((val) => val === "" ? undefined : val, z.enum(FLOORING_TYPES as any).optional()),
  flooring_other_bedrooms: z.preprocess((val) => val === "" ? undefined : val, z.enum(FLOORING_TYPES as any).optional()),
  flooring_balcony_utility: z.preprocess((val) => val === "" ? undefined : val, z.enum(FLOORING_TYPES as any).optional()),
  kitchen_countertop: z.preprocess((val) => val === "" ? undefined : val, z.enum(COUNTERTOP_TYPES as any).optional()),
  kitchen_sink_details: z.string().optional(),
  kitchen_dado_tiling: z.string().optional(),
  gas_pipeline_provision: z.preprocess((val) => val === "" ? undefined : val, z.enum(GAS_PIPELINE_OPTIONS as any).optional()),
  bathroom_sanitary_ware: z.string().optional(),
  bathroom_cp_fittings: z.string().optional(),
  bathroom_dado_tiling: z.string().optional(),
  main_door_specs: z.string().optional(),
  internal_doors_specs: z.string().optional(),
  windows_specs: z.string().optional(),
  electrical_switches: z.string().optional(),
  power_backup: z.preprocess((val) => val === "" ? undefined : val, z.enum(POWER_BACKUP_OPTIONS as any).optional()),
  road_width: z.string().optional(),
  water_source: z.preprocess((val) => val === "" ? undefined : val, z.enum(WATER_SOURCES as any).optional()),
  open_space_pct: z.string().optional(),

  // ─── ProjectAnalysis fields ───────────────────────────────────────────────
  usp: z.string().optional(),
  usp_highlights: z.array(z.string()).optional(),
  closing_pitch: z.string().optional(),
  target_customer: z.string().optional(),
  objection_handling: z.string().optional(),   // stored as JSON string
  legal_notes: z.string().optional(),
  timeline_risk: z.string().optional(),
  overall_rating: optNum,
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),

  // ─── LocationConnectivity fields ─────────────────────────────────────────
  distancetomainroad: z.string().optional(),
  airportdistance: z.string().optional(),
  railwaystationdistance: z.string().optional(),
  metrostationdistance: z.string().optional(),
  busstopdistance: z.string().optional(),

  // ─── Dynamic Arrays (saved directly as JSON in PropertyDraft) ────────────
  units: z.array(unitSchema).optional(),
  amenities: z.array(amenitySchema).optional(),
  landmarks: z.array(landmarkSchema).optional(),
  commercials: z.array(commercialSchema).optional(),
  competitors: z.array(competitorSchema).optional(),

  // ─── Misc pricing fields (non-relational, stored on project or analysis) ─
  payment_plan_type: z.string().optional(),
  payment_plan_details: z.string().optional(),
  floor_rise_charges: z.string().optional(),
  rera_registration_no: z.string().optional(),     // project-level RERA
});

export type WizardFormData = z.infer<typeof projectWizardSchema>;

// Default empty state for the wizard
export const defaultWizardValues: WizardFormData = {
  // 📋 Basic Info
  project_name: 'Prestige Lakeside Habitat',
  property_type: 'Apartment',
  projectstatus: 'UnderConstruction',
  rera_registration_no: 'PRM/KA/RERA/1251/446/PR/170915/000210',
  slug: 'prestige-lakeside-habitat',
  total_land_area: '102 Acres',
  total_units: 3426,
  total_phases: 2,
  current_phase_under_sale: 'Phase 2',
  project_theme: 'Disney Themed Luxury Township',
  region: 'Whitefield',
  general_location: 'Near Hope Farm Junction',
  possession_month: 'Dec',
  possession_year: 2026,

  // 📍 Location
  city_zone: 'East',
  city: 'Bengaluru',
  address_line: 'Varthur Main Road, Whitefield, Bengaluru, Karnataka 560087',
  district: 'Bengaluru Urban',
  pincode: '560087',
  lat: 12.9538,
  lng: 77.7471,

  // 🏠 Units
  units: [
    { config: '2BHK', type: 'Standard', unitnumber: 'A-101', tower: 'Tower A', floornumber: 5, actualsba: 1216, carpetarea: 850, udsarea: 450, pricepersqft: 8500, pricetotal: 10336000, status: 'Available', facing: 'East', wccount: '2', balconycount: '1' },
    { config: '3BHK', type: 'Premium', unitnumber: 'B-502', tower: 'Tower B', floornumber: 12, actualsba: 1657, carpetarea: 1150, udsarea: 600, pricepersqft: 9500, pricetotal: 15741500, status: 'Available', facing: 'North', wccount: '3', balconycount: '2' },
  ],

  // 💰 Pricing
  pricedisplay: '₹1.03Cr - 1.57Cr',
  pricemin: 10336000,
  pricemax: 15741500,
  payment_plan_type: '20:80 Subvention Scheme',
  payment_plan_details: 'Pay 20% now and nothing until possession. Bank funds the 80% with No EMI till handover.',
  floor_rise_charges: '₹50 per sqft per floor from 4th floor onwards',

  commercials: [
    // Pre-filled examples
    { name: 'Covered Car Parking', amount: 350000, cost_type: 'Mandatory', payment_milestone: 'Booking' },
    { name: 'Clubhouse Membership', amount: 250000, cost_type: 'Mandatory', payment_milestone: 'Possession' },
    { name: 'BESCOM / BWSSB Charges', amount: 150000, cost_type: 'Government Tax', payment_milestone: 'Possession' },
    // Empty placeholders for user to fill
    { name: 'Gas Connection / Reticulated Piping', amount: undefined, cost_type: 'Mandatory' },
    { name: 'Generator / Power Backup Charges', amount: undefined, cost_type: 'Mandatory' },
    { name: 'Infrastructure Development Charges', amount: undefined, cost_type: 'Mandatory' },
    { name: 'Advance Maintenance (12 Months)', amount: undefined, cost_type: 'Maintenance' },
    { name: 'Sinking Fund / Corpus Fund', amount: undefined, cost_type: 'Maintenance' },
    { name: 'Property Assessment & Sub-Numbering', amount: undefined, cost_type: 'Government Tax' },
    { name: 'Legal & Documentation Fees', amount: undefined, cost_type: 'Mandatory' },
    { name: 'GST', amount: undefined, cost_type: 'Government Tax' },
    { name: 'Stamp Duty & Registration', amount: undefined, cost_type: 'Government Tax' },
    { name: 'TDS (1% for >50L)', amount: undefined, cost_type: 'Government Tax' },
  ],

  // 🎾 Amenities
  amenities: [
    // Pre-filled examples (Original Mock Data)
    { category: 'Sports & Fitness', name: 'Cricket Pitch', description: 'Net practice area with bowling machine', size_specs: '20m x 5m' },
    { category: 'Clubhouse', name: 'Olympic Size Pool', description: 'Temperature controlled pool for all seasons', size_specs: '50m x 25m' },
    { category: 'Leisure & Social', name: 'Mini Theatre', description: 'Plush seating with Dolby Atmos', size_specs: '40 Seater' },

    // Extended List (Placeholders based on your requirements)
    // Clubhouse
    { category: 'Clubhouse', name: 'Clubhouse Infrastructure', description: '' },
    
    // Sports & Fitness
    { category: 'Sports & Fitness', name: 'Gymnasium & Yoga Area', description: '' },
    { category: 'Sports & Fitness', name: 'Indoor Spa & Sauna', description: '' },
    { category: 'Sports & Fitness', name: 'Squash Court', description: '' },
    { category: 'Sports & Fitness', name: 'Table Tennis & Billiards', description: '' },
    { category: 'Sports & Fitness', name: 'Indoor Badminton Courts', description: '' },
    { category: 'Sports & Fitness', name: 'Indoor Pickleball Court', description: '' },
    { category: 'Sports & Fitness', name: 'Multi-purpose Playground (Football/Cricket)', description: '' },
    { category: 'Sports & Fitness', name: 'Outdoor Skating Rink', description: '' },
    { category: 'Sports & Fitness', name: 'Outdoor Gym Station', description: '' },
    { category: 'Sports & Fitness', name: 'Volleyball / Play Courts', description: '' },
    
    // Leisure & Social
    { category: 'Leisure & Social', name: 'Convention Hall / Multi-purpose Hall', description: '' },
    { category: 'Leisure & Social', name: 'Open-air Sports Bar', description: '' },
    { category: 'Leisure & Social', name: 'Amphitheatre (Open Air Theatre)', description: '' },
    { category: 'Leisure & Social', name: 'Party Lawn', description: '' },
    
    // Nature & Outdoors
    { category: 'Nature & Outdoors', name: 'Landscaped Gardens', description: '' },
    { category: 'Nature & Outdoors', name: 'Reflexology Path', description: '' },
    { category: 'Nature & Outdoors', name: 'Jogging / Pedestrian Track', description: '' },
    
    // Kids & Seniors
    { category: 'Kids & Seniors', name: 'Children’s Play Area & Sandpit', description: '' },
    { category: 'Kids & Seniors', name: 'Toddlers Play Area', description: '' },
    { category: 'Kids & Seniors', name: 'Toddler Cycling Track', description: '' },
    { category: 'Kids & Seniors', name: 'Senior Citizens Court', description: '' },
    { category: 'Kids & Seniors', name: 'Pet Play Park', description: '' },
    { category: 'Kids & Seniors', name: 'Pet Wash Area', description: '' },

    // Security & Utilities (Placeholders)
    { category: 'Security & Utilities', name: '24/7 CCTV Surveillance', description: '' },
    { category: 'Security & Utilities', name: 'Water Treatment Plant (WTP)', description: '' },
    { category: 'Security & Utilities', name: 'Sewage Treatment Plant (STP)', description: '' },
  ],

  // 🗺️ Landmarks
  landmarks: [
    { category: 'Education', name: 'The Deens Academy', distance_km: '1.2 km', travel_time: '5 mins' },
    { category: 'Healthcare', name: 'Manipal Hospital', distance_km: '2.5 km', travel_time: '10 mins' },
    { category: 'Transport & Hubs', name: 'Hope Farm Station', distance_km: '3.0 km', travel_time: '12 mins' },
  ],

  // ⚙️ Technical Specs
  no_of_towers: 24,
  floors_per_tower: 18,
  units_per_floor: 4,
  elevators_per_tower: 3,
  service_elevators_per_tower: 1,
  construction_type: 'Mivan',
  structure_details: 'Seismic Zone II compliant RCC framed structure',
  wall_finishing_interior: 'Premium Acrylic Emulsion Paint',
  wall_finishing_exterior: 'Weather proof textured paint',
  flooring_living_dining: 'Imported Marble',
  flooring_master_bedroom: 'Laminated Wooden',
  flooring_other_bedrooms: 'Vitrified Tiles',
  flooring_balcony_utility: 'Anti-skid Ceramic',
  kitchen_countertop: 'Black Granite',
  kitchen_sink_details: 'Stainless steel sink with double drain board',
  kitchen_dado_tiling: 'Glazed Ceramic tiles up to 2 feet above counter',
  bathroom_sanitary_ware: 'Kohler or equivalent premium brand',
  bathroom_cp_fittings: 'Jaquar or equivalent concealed fittings',
  bathroom_dado_tiling: 'Designer Ceramic tiles up to false ceiling',
  main_door_specs: '8 feet high Teak wood frame with flush shutter',
  internal_doors_specs: '7 feet high Hardwood frame with laminate finish',
  windows_specs: '3-track UPVC sliding windows with mosquito mesh',
  electrical_switches: 'Modular switches (Legrand/Schneider)',
  power_backup: '100% DG Backup',
  gas_pipeline_provision: 'Piped Gas Connection',
  water_source: 'Kaveri',
  open_space_pct: '80%',
  road_width: '80ft wide main approach',

  // 📊 Analysis
  usp: 'Sprawling 102-acre township with a 30-acre natural lake on site and Disney themed landscaping.',
  usp_highlights: ['Disney themed landscaping', '80% Open Space', '30-Acre Natural Lake', 'Smart Home Automation Integration'],
  closing_pitch: 'A perfect blend of luxury and nature in the heart of the Whitefield IT corridor, offering robust appreciation potential.',
  target_customer: 'IT Professionals, HNIs, and NRI Investors',
  overall_rating: 4.8,
  timeline_risk: 'Low - Structure completed, finishing work in progress.',
  legal_notes: 'Clear A-Khata, BBMP Approved, RERA Registered layout.',
  objection_handling: 'High price is justified by the unmatched 102 acre lakefront township amenities. Surrounding local builders cannot offer this lifestyle.',
  pros: ['Prime location in Whitefield', 'Reputed Grade A+ builder', 'Extensive open green spaces and natural lake'],
  cons: ['High traffic during peak hours on Varthur road', 'Premium pricing compared to surrounding localized standalone buildings'],

  // 🏢 Developer
  developer_name: 'Prestige Group',
  developer_logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&q=80',
  developer_buildergrade: 'A',
  developer_website: 'https://www.prestigeconstructions.com',
  developer_years_in_market: 35,
  developer_corporate_rera: 'PRM/KA/RERA/1251/446/PR/170915/000001',
  developer_reputation: 'Highly Trusted, Premium Luxury',
  developer_past_projects: '250+ Projects delivered across South India',
  developer_financial_strength: 'Publicly Listed, High Liquidity, Debt-Free Execution',
  developer_description: 'Prestige Group has firmly established itself as one of the leading and most successful developers of real estate in India by imprinting its indelible mark across all asset classes.',

  // 👥 Competitors
  competitors: [
    { name: 'Sobha Dream Acres', price_range: '₹1.1Cr - 2.2Cr' },
    { name: 'Brigade Cornerstone Utopia', price_range: '₹95L - 1.8Cr' }
  ],

  // 📸 Media
  hero_image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
  images: [
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1000'
  ],
  virtual_tour_url: 'https://my.matterport.com/show/?m=123456789',
  brochure_url: 'https://example.com/prestige-brochure.pdf',

  configurations: ['2BHK', '3BHK'],
};
