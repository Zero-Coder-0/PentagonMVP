// src/modules/inventory/data/filter-options.ts
// Static filter options matching REAL_ESTATE_SCHEMA_FINAL.sql ENUMs

import {
  BangaloreZone,
  ProjectStatus,
  BuilderGrade,
  UnitStatus,
} from '../types-v7';

// =====================================================
// BANGALORE ZONES (matching bangalore_zone_enum)
// =====================================================

export const BANGALORE_ZONES: Array<{
  value: BangaloreZone;
  label: string;
  description?: string;
}> = [
  {
    value: 'North',
    label: 'North Bangalore',
    description: 'Hebbal, Yelahanka, Devanahalli',
  },
  {
    value: 'South',
    label: 'South Bangalore',
    description: 'Bannerghatta, Electronic City, HSR Layout',
  },
  {
    value: 'East',
    label: 'East Bangalore',
    description: 'Whitefield, Marathahalli, KR Puram',
  },
  {
    value: 'West',
    label: 'West Bangalore',
    description: 'Rajajinagar, Yeshwanthpur, Peenya',
  },
  {
    value: 'Central',
    label: 'Central Bangalore',
    description: 'MG Road, Indiranagar, Koramangala',
  },
];

// =====================================================
// PROJECT STATUS (matching project_status_enum)
// =====================================================

export const PROJECT_STATUSES: Array<{
  value: ProjectStatus;
  label: string;
  color: string;
  icon?: string;
}> = [
  {
    value: 'DRAFT',
    label: 'Draft',
    color: 'gray',
    icon: '📝',
  },
  {
    value: 'PENDING_APPROVAL',
    label: 'Pending Approval',
    color: 'yellow',
    icon: '⏳',
  },
  {
    value: 'Pre-Launch',
    label: 'Pre-Launch',
    color: 'blue',
    icon: '🚀',
  },
  {
    value: 'Under Construction',
    label: 'Under Construction',
    color: 'orange',
    icon: '🏗️',
  },
  {
    value: 'Nearing Completion',
    label: 'Nearing Completion',
    color: 'purple',
    icon: '🏘️',
  },
  {
    value: 'Ready to Move',
    label: 'Ready to Move',
    color: 'green',
    icon: '🏠',
  },
  {
    value: 'Sold Out',
    label: 'Sold Out',
    color: 'red',
    icon: '🔒',
  },
];

// =====================================================
// BUILDER GRADES (matching builder_grade_enum)
// =====================================================

export const BUILDER_GRADES: Array<{
  value: BuilderGrade;
  label: string;
  tier: 'Premium' | 'Mid-Tier' | 'Budget';
  description: string;
}> = [
  {
    value: 'A+',
    label: 'A+ Grade',
    tier: 'Premium',
    description: 'Top tier builders (Prestige, Sobha, Brigade)',
  },
  {
    value: 'A',
    label: 'A Grade',
    tier: 'Premium',
    description: 'Premium builders with strong reputation',
  },
  {
    value: 'A-',
    label: 'A- Grade',
    tier: 'Premium',
    description: 'Upper premium segment',
  },
  {
    value: 'B+',
    label: 'B+ Grade',
    tier: 'Mid-Tier',
    description: 'Established mid-tier builders',
  },
  {
    value: 'B',
    label: 'B Grade',
    tier: 'Mid-Tier',
    description: 'Reliable mid-segment builders',
  },
  {
    value: 'B-',
    label: 'B- Grade',
    tier: 'Mid-Tier',
    description: 'Entry-level mid-tier',
  },
  {
    value: 'C+',
    label: 'C+ Grade',
    tier: 'Budget',
    description: 'Upper budget segment',
  },
  {
    value: 'C',
    label: 'C Grade',
    tier: 'Budget',
    description: 'Budget builders',
  },
  {
    value: 'C-',
    label: 'C- Grade',
    tier: 'Budget',
    description: 'Lower budget segment',
  },
  {
    value: 'D+',
    label: 'D+ Grade',
    tier: 'Budget',
    description: 'Emerging builders',
  },
  {
    value: 'D',
    label: 'D Grade',
    tier: 'Budget',
    description: 'New or unverified builders',
  },
  {
    value: 'D-',
    label: 'D- Grade',
    tier: 'Budget',
    description: 'Limited track record',
  },
  {
    value: 'F',
    label: 'F Grade',
    tier: 'Budget',
    description: 'High risk / avoid',
  },
];

// =====================================================
// UNIT STATUS (matching unit_status_enum)
// =====================================================

export const UNIT_STATUSES: Array<{
  value: UnitStatus;
  label: string;
  color: string;
}> = [
  { value: 'Available', label: 'Available', color: 'green' },
  { value: 'Blocked', label: 'Blocked', color: 'yellow' },
  { value: 'Sold', label: 'Sold', color: 'red' },
  { value: 'Reserved', label: 'Reserved', color: 'blue' },
  { value: 'Resale', label: 'Resale', color: 'purple' },
];

// =====================================================
// CONFIGURATIONS (Common BHK types)
// =====================================================

export const CONFIGURATIONS = [
  { value: '1BHK', label: '1 BHK', icon: '🛏️' },
  { value: '1.5BHK', label: '1.5 BHK', icon: '🛏️' },
  { value: '2BHK', label: '2 BHK', icon: '🛏️🛏️' },
  { value: '2.5BHK', label: '2.5 BHK', icon: '🛏️🛏️' },
  { value: '3BHK', label: '3 BHK', icon: '🛏️🛏️🛏️' },
  { value: '3.5BHK', label: '3.5 BHK', icon: '🛏️🛏️🛏️' },
  { value: '4BHK', label: '4 BHK', icon: '🛏️🛏️🛏️🛏️' },
  { value: '5BHK', label: '5 BHK', icon: '🏠' },
  { value: '6BHK+', label: '6+ BHK', icon: '🏠' },
  { value: 'Penthouse', label: 'Penthouse', icon: '👑' },
  { value: 'Villa', label: 'Villa', icon: '🏡' },
  { value: 'Plot', label: 'Plot', icon: '📐' },
  { value: 'Studio', label: 'Studio', icon: '🏢' },
];

// =====================================================
// PROPERTY TYPES
// =====================================================

export const PROPERTY_TYPES = [
  { value: 'Apartment', label: 'Apartment', icon: '🏢' },
  { value: 'Villa', label: 'Villa', icon: '🏡' },
  { value: 'Row House', label: 'Row House', icon: '🏘️' },
  { value: 'Penthouse', label: 'Penthouse', icon: '👑' },
  { value: 'Independent House', label: 'Independent House', icon: '🏠' },
  { value: 'Plot', label: 'Plot', icon: '📐' },
  { value: 'Commercial', label: 'Commercial', icon: '🏪' },
  { value: 'Farmhouse', label: 'Farmhouse', icon: '🌾' },
];

// =====================================================
// PRICE RANGES
// =====================================================

export const PRICE_RANGES = [
  { label: 'Under 50L', min: 0, max: 5000000, value: '0-50L' },
  { label: '50L - 1Cr', min: 5000000, max: 10000000, value: '50L-1Cr' },
  { label: '1Cr - 2Cr', min: 10000000, max: 20000000, value: '1Cr-2Cr' },
  { label: '2Cr - 3Cr', min: 20000000, max: 30000000, value: '2Cr-3Cr' },
  { label: '3Cr - 5Cr', min: 30000000, max: 50000000, value: '3Cr-5Cr' },
  { label: '5Cr - 10Cr', min: 50000000, max: 100000000, value: '5Cr-10Cr' },
  { label: '10Cr+', min: 100000000, max: Infinity, value: '10Cr+' },
];

// =====================================================
// AREA RANGES (Square Feet)
// =====================================================

export const AREA_RANGES = [
  { label: 'Under 500 sqft', min: 0, max: 500, value: '0-500' },
  { label: '500 - 1000 sqft', min: 500, max: 1000, value: '500-1000' },
  { label: '1000 - 1500 sqft', min: 1000, max: 1500, value: '1000-1500' },
  { label: '1500 - 2000 sqft', min: 1500, max: 2000, value: '1500-2000' },
  { label: '2000 - 3000 sqft', min: 2000, max: 3000, value: '2000-3000' },
  { label: '3000 - 5000 sqft', min: 3000, max: 5000, value: '3000-5000' },
  { label: '5000+ sqft', min: 5000, max: Infinity, value: '5000+' },
];

// =====================================================
// POSSESSION TIMELINE
// =====================================================

export const POSSESSION_TIMELINES = [
  { value: 'immediate', label: 'Immediate', months: 0 },
  { value: '3months', label: 'Within 3 Months', months: 3 },
  { value: '6months', label: 'Within 6 Months', months: 6 },
  { value: '1year', label: 'Within 1 Year', months: 12 },
  { value: '2years', label: 'Within 2 Years', months: 24 },
  { value: '3years', label: 'Within 3 Years', months: 36 },
  { value: 'beyond', label: 'Beyond 3 Years', months: 999 },
];

// =====================================================
// FACING OPTIONS
// =====================================================

export const FACING_OPTIONS = [
  { value: 'North', label: 'North Facing', icon: '⬆️' },
  { value: 'South', label: 'South Facing', icon: '⬇️' },
  { value: 'East', label: 'East Facing', icon: '➡️' },
  { value: 'West', label: 'West Facing', icon: '⬅️' },
  { value: 'North-East', label: 'North-East', icon: '↗️' },
  { value: 'North-West', label: 'North-West', icon: '↖️' },
  { value: 'South-East', label: 'South-East', icon: '↘️' },
  { value: 'South-West', label: 'South-West', icon: '↙️' },
];

// =====================================================
// AMENITY CATEGORIES (from amenities_master)
// =====================================================

export const AMENITY_CATEGORIES = [
  { value: 'Outdoor', label: 'Outdoor Amenities', icon: '🌳' },
  { value: 'Indoor', label: 'Indoor Amenities', icon: '🏠' },
  { value: 'Sports', label: 'Sports Facilities', icon: '⚽' },
  { value: 'Security', label: 'Security Features', icon: '🔒' },
  { value: 'Unique', label: 'Unique Amenities', icon: '⭐' },
];

// =====================================================
// POPULAR AMENITIES (for quick filters)
// =====================================================

export const POPULAR_AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Clubhouse',
  'Kids Play Area',
  'Indoor Badminton Court',
  'Basketball Court',
  'Tennis Court',
  'Jogging Track',
  '24/7 Security',
  'CCTV Surveillance',
  'EV Charging Stations',
  'Power Backup',
];

// =====================================================
// SORT OPTIONS
// =====================================================

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', icon: '🆕' },
  { value: 'price-asc', label: 'Price: Low to High', icon: '💰' },
  { value: 'price-desc', label: 'Price: High to Low', icon: '💎' },
  { value: 'name-asc', label: 'Name: A to Z', icon: '🔤' },
  { value: 'name-desc', label: 'Name: Z to A', icon: '🔡' },
  { value: 'possession-asc', label: 'Possession: Earliest', icon: '📅' },
  { value: 'possession-desc', label: 'Possession: Latest', icon: '📆' },
];

// =====================================================
// POPULAR REGIONS (South Bangalore focus)
// =====================================================

export const POPULAR_REGIONS = [
  // South
  'Bannerghatta Road',
  'Electronic City',
  'HSR Layout',
  'Sarjapur Road',
  'Whitefield',
  'Marathahalli',
  'Hennur Road',
  'Bellandur',
  'Bommanahalli',
  
  // North
  'Hebbal',
  'Yelahanka',
  'Devanahalli',
  
  // East
  'KR Puram',
  'Old Airport Road',
  
  // West
  'Rajajinagar',
  'Yeshwanthpur',
  'Peenya',
  
  // Central
  'Koramangala',
  'Indiranagar',
  'Jayanagar',
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export function getZoneLabel(zone?: BangaloreZone): string {
  if (!zone) return 'Unknown Zone';
  const found = BANGALORE_ZONES.find((z) => z.value === zone);
  return found?.label || zone;
}

export function getStatusLabel(status?: ProjectStatus): string {
  if (!status) return 'Unknown Status';
  const found = PROJECT_STATUSES.find((s) => s.value === status);
  return found?.label || status;
}

export function getStatusColor(status?: ProjectStatus): string {
  if (!status) return 'gray';
  const found = PROJECT_STATUSES.find((s) => s.value === status);
  return found?.color || 'gray';
}

export function getBuilderGradeLabel(grade?: BuilderGrade): string {
  if (!grade) return 'Not Rated';
  const found = BUILDER_GRADES.find((g) => g.value === grade);
  return found?.label || grade;
}

export function getBuilderGradeTier(
  grade?: BuilderGrade
): 'Premium' | 'Mid-Tier' | 'Budget' | 'Unknown' {
  if (!grade) return 'Unknown';
  const found = BUILDER_GRADES.find((g) => g.value === grade);
  return found?.tier || 'Unknown';
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

export function formatArea(sqft: number): string {
  return `${sqft.toLocaleString('en-IN')} sqft`;
}
