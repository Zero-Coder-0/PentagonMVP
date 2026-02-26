// ============================================================================
// project-constants.ts
// THE SINGLE SOURCE OF TRUTH for all filterable / selectable values.
//
// Import from here in:
//   - Dashboard filter panels (DashboardNavbar, FilterModal)
//   - Filter engine (filter-engine.ts)
//   - Types (types-v7.ts)
//   - Wizard dropdowns / selects
//
// Adding a new status? Add it here once. It propagates everywhere.
// ============================================================================

// ─── Project Status ──────────────────────────────────────────────────────────

export const PROJECT_STATUSES = {
    UnderConstruction: {
        value: 'UnderConstruction',
        label: 'Under Construction',
        color: 'amber',
        filterLabel: 'Under Construction',
    },
    ReadyToMove: {
        value: 'ReadyToMove',
        label: 'Ready to Move',
        color: 'green',
        filterLabel: 'Ready to Move',
    },
    NewLaunch: {
        value: 'NewLaunch',
        label: 'New Launch',
        color: 'blue',
        filterLabel: 'New Launch',
    },
    Completed: {
        value: 'Completed',
        label: 'Completed',
        color: 'slate',
        filterLabel: 'Completed',
    },
} as const;

export const PROJECT_STATUS_VALUES = Object.values(PROJECT_STATUSES).map((s) => s.value);
export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];

// ─── City Zones ───────────────────────────────────────────────────────────────

export const CITY_ZONES = ['North', 'South', 'East', 'West', 'Central', 'North-East', 'North-West', 'South-East', 'South-West'] as const;
export type CityZone = (typeof CITY_ZONES)[number];

// ─── BHK / Configurations ────────────────────────────────────────────────────

export const BHK_CONFIGS = ['1BHK', '2BHK', '3BHK', '4BHK', '5BHK', 'Studio'] as const;
export type BhkConfig = (typeof BHK_CONFIGS)[number];

// ─── Property Types ───────────────────────────────────────────────────────────

export const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Penthouse', 'Duplex', 'Commercial', 'Row House'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

// Combined: BHK + property types (used in "Configuration" filter which covers both)
export const ALL_CONFIGS = [...BHK_CONFIGS, ...PROPERTY_TYPES] as const;

// ─── Unit Facing ──────────────────────────────────────────────────────────────

export const UNIT_FACINGS = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West', 'Garden Facing', 'Pool Facing'] as const;
export type UnitFacing = (typeof UNIT_FACINGS)[number];

// ─── Unit Variants / Luxe ───────────────────────────────────────────────────

export const UNIT_VARIANTS = ['Standard', 'Premium', 'Luxe', 'Super Luxe', 'Ultra Luxe'] as const;
export type UnitVariant = (typeof UNIT_VARIANTS)[number];

// ─── Bathroom Counts ──────────────────────────────────────────────────────────

export const BATHROOM_COUNTS = ['1', '2', '3', '4', '5', '6+'] as const;
export type BathroomCount = (typeof BATHROOM_COUNTS)[number];

// ─── Balcony Counts ───────────────────────────────────────────────────────────

export const BALCONY_COUNTS = ['0', '1', '2', '3', '4', '5+'] as const;
export type BalconyCount = (typeof BALCONY_COUNTS)[number];

// ─── Builder Grades ───────────────────────────────────────────────────────────

export const BUILDER_GRADES = ['A+', 'A', 'B', 'C'] as const;
export type BuilderGrade = (typeof BUILDER_GRADES)[number];

// ─── Unit Statuses ────────────────────────────────────────────────────────────

export const UNIT_STATUSES = {
    Available: { value: 'Available', label: 'Available', color: 'green' },
    Sold: { value: 'Sold', label: 'Sold', color: 'red' },
    BuilderHold: { value: 'Builder Hold', label: 'Builder Hold', color: 'amber' },
    CPHold: { value: 'CP Hold', label: 'CP Hold', color: 'yellow' },
    Blocked: { value: 'Blocked', label: 'Blocked', color: 'slate' },
} as const;

export const UNIT_STATUS_VALUES = Object.values(UNIT_STATUSES).map((s) => s.value);
export type UnitStatus = (typeof UNIT_STATUS_VALUES)[number];

// ─── Construction Technologies ────────────────────────────────────────────────

export const CONSTRUCTION_TYPES = ['Mivan', 'RCC Frame', 'Precast', 'Steel Frame', 'Load Bearing', 'SBA', 'Hybrid'] as const;
export type ConstructionType = (typeof CONSTRUCTION_TYPES)[number];

// ─── Water Sources ────────────────────────────────────────────────────────────

export const WATER_SOURCES = ['Borewell', 'Kaveri', 'Both', 'Tanker', 'BWSSB'] as const;
export type WaterSource = (typeof WATER_SOURCES)[number];

// ─── Amenity Categories ───────────────────────────────────────────────────────

export const AMENITY_CATEGORIES = ['Clubhouse', 'Sports & Fitness', 'Leisure & Social', 'Nature & Outdoors', 'Security & Utilities', 'Kids & Seniors'] as const;
export type AmenityCategory = (typeof AMENITY_CATEGORIES)[number];

// ─── Landmark Categories ──────────────────────────────────────────────────────

export const LANDMARK_CATEGORIES = ['Education', 'Healthcare', 'Shopping & Malls', 'Transport & Hubs', 'Parks & Recreations', 'Business Parks'] as const;
export type LandmarkCategory = (typeof LANDMARK_CATEGORIES)[number];

// ─── Possession Months ────────────────────────────────────────────────────────

export const POSSESSION_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;
export type PossessionMonth = (typeof POSSESSION_MONTHS)[number];

// ─── Possession Years ─────────────────────────────────────────────────────────

export const POSSESSION_YEARS = [2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033] as const;
export type PossessionYear = (typeof POSSESSION_YEARS)[number];

// ─── Price Bands (for quick-select budgets) ───────────────────────────────────

export const PRICE_BANDS = [
    { label: 'Under 50L', min: 0, max: 5_000_000 },
    { label: '50L – 75L', min: 5_000_000, max: 7_500_000 },
    { label: '75L – 1Cr', min: 7_500_000, max: 10_000_000 },
    { label: '1Cr – 1.5Cr', min: 10_000_000, max: 15_000_000 },
    { label: '1.5Cr – 2Cr', min: 15_000_000, max: 20_000_000 },
    { label: '2Cr – 3Cr', min: 20_000_000, max: 30_000_000 },
    { label: '3Cr+', min: 30_000_000, max: 0 },
] as const;

// ─── Detailed Technical & Commercial Enums ────────────────────────────────────

export const PAYMENT_MILESTONES = ['Booking', 'Agreement', 'Foundation', 'Slab Casting', 'Brickwork', 'Flooring', 'Possession', 'Registration', 'Other'] as const;
export type PaymentMilestone = (typeof PAYMENT_MILESTONES)[number];

export const COST_TYPES = ['Mandatory', 'Optional', 'Refundable Deposit', 'Government Tax', 'Maintenance'] as const;
export type CostType = (typeof COST_TYPES)[number];

export const FLOORING_TYPES = ['Vitrified Tiles', 'Laminated Wooden', 'Imported Marble', 'Ceramic Tiles', 'Anti-skid Ceramic', 'Granite', 'IPS / Concrete'] as const;
export type FlooringType = (typeof FLOORING_TYPES)[number];

export const COUNTERTOP_TYPES = ['Black Granite', 'Quartz', 'Imported Marble', 'Corian / Acrylic', 'No Countertop (Provision Only)'] as const;
export type CountertopType = (typeof COUNTERTOP_TYPES)[number];

export const POWER_BACKUP_OPTIONS = ['100% DG Backup', '1 KW / Unit + Common Areas', 'Common Areas Only', 'Inverter Provision', 'None'] as const;
export type PowerBackupOption = (typeof POWER_BACKUP_OPTIONS)[number];

export const GAS_PIPELINE_OPTIONS = ['Piped Gas Connection', 'Provision Provided', 'Not Available'] as const;
export type GasPipelineOption = (typeof GAS_PIPELINE_OPTIONS)[number];

// ─── Normalizer (used by filter engine) ──────────────────────────────────────
// Handles case mismatches & extra whitespace coming from DB
export function normalize(value: string | null | undefined): string {
    if (!value) return '';
    return value.trim().toLowerCase();
}
