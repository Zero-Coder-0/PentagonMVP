// src/modules/inventory/utils/filter-engine.ts
// Client-side filtering logic for properties
// Updated to match REAL_ESTATE_SCHEMA_FINAL.sql

import {
  ProjectFull,
  FilterCriteria,
  BangaloreZone,
  ProjectStatus,
  BuilderGrade,
} from '../types-v7';

// =====================================================
// MAIN FILTER FUNCTION
// =====================================================

export function filterProjects(
  projects: ProjectFull[],
  filters: FilterCriteria
): ProjectFull[] {
  if (!projects || projects.length === 0) return [];

  let filtered = [...projects];

  // =====================================================
  // FILTER: Project Status
  // =====================================================
  if (filters.status && filters.status.length > 0) {
    filtered = filtered.filter((p) =>
      filters.status?.includes(p.project_status as ProjectStatus)
    );
  }

  // =====================================================
  // FILTER: Zones
  // =====================================================
  if (filters.zones && filters.zones.length > 0) {
    filtered = filtered.filter((p) =>
      filters.zones?.includes(p.bangalore_zone as BangaloreZone)
    );
  }

  // =====================================================
  // FILTER: Regions
  // =====================================================
  if (filters.regions && filters.regions.length > 0) {
    filtered = filtered.filter((p) =>
      p.region ? filters.regions?.includes(p.region) : false
    );
  }

  // =====================================================
  // FILTER: Price Range (using cached price_min/price_max)
  // =====================================================
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    filtered = filtered.filter(
      (p) => (p.price_min || 0) >= filters.minPrice!
    );
  }

  if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
    filtered = filtered.filter(
      (p) => (p.price_max || Infinity) <= filters.maxPrice!
    );
  }

  // =====================================================
  // FILTER: Area Range (sqft)
  // =====================================================
  if (filters.minSqft !== undefined && filters.minSqft > 0) {
    filtered = filtered.filter((p) => {
      // Check if any unit meets the area requirement
      return p.units?.some((u) => (u.actual_sba || 0) >= filters.minSqft!);
    });
  }

  if (filters.maxSqft !== undefined && filters.maxSqft > 0) {
    filtered = filtered.filter((p) => {
      return p.units?.some((u) => (u.actual_sba || 0) <= filters.maxSqft!);
    });
  }

  // =====================================================
  // FILTER: Configurations (using cached array)
  // =====================================================
  if (filters.configurations && filters.configurations.length > 0) {
    filtered = filtered.filter((p) => {
      if (!p.configurations || p.configurations.length === 0) return false;
      
      // Check if any filter config matches project configs
      return filters.configurations?.some((fc) =>
        p.configurations?.includes(fc)
      );
    });
  }

  // =====================================================
  // FILTER: Developers
  // =====================================================
  if (filters.developer_ids && filters.developer_ids.length > 0) {
    filtered = filtered.filter((p) =>
      p.developer_id ? filters.developer_ids?.includes(p.developer_id) : false
    );
  }

  // =====================================================
  // FILTER: Builder Grade
  // =====================================================
  if (filters.builder_grades && filters.builder_grades.length > 0) {
    filtered = filtered.filter((p) =>
      p.builder_grade
        ? filters.builder_grades?.includes(p.builder_grade as BuilderGrade)
        : false
    );
  }

  // =====================================================
  // FILTER: Property Types
  // =====================================================
  if (filters.property_types && filters.property_types.length > 0) {
    filtered = filtered.filter((p) =>
      p.property_type ? filters.property_types?.includes(p.property_type) : false
    );
  }

  // =====================================================
  // FILTER: Possession Year
  // =====================================================
  if (filters.possession_year) {
    filtered = filtered.filter((p) => {
      if (!p.possession_date) return false;
      const year = new Date(p.possession_date).getFullYear().toString();
      return year === filters.possession_year;
    });
  }

  // =====================================================
  // FILTER: Required Amenities
  // =====================================================
  if (filters.required_amenities && filters.required_amenities.length > 0) {
    filtered = filtered.filter((p) => {
      if (!p.amenities || p.amenities.length === 0) return false;

      // Get all amenity IDs for this project
      const projectAmenityIds = p.amenities.map((a) => a.amenity_id);

      // Check if all required amenities are present
      return filters.required_amenities?.every((reqId) =>
        projectAmenityIds.includes(reqId)
      );
    });
  }

  return filtered;
}

// =====================================================
// SORT FUNCTIONS
// =====================================================

export type SortOption =
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'oldest'
  | 'name-asc'
  | 'name-desc'
  | 'possession-asc'
  | 'possession-desc';

export function sortProjects(
  projects: ProjectFull[],
  sortBy: SortOption
): ProjectFull[] {
  const sorted = [...projects];

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => (a.price_min || 0) - (b.price_min || 0));

    case 'price-desc':
      return sorted.sort((a, b) => (b.price_max || 0) - (a.price_max || 0));

    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      );

    case 'oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.created_at || 0).getTime() -
          new Date(b.created_at || 0).getTime()
      );

    case 'name-asc':
      return sorted.sort((a, b) =>
        a.project_name.localeCompare(b.project_name)
      );

    case 'name-desc':
      return sorted.sort((a, b) =>
        b.project_name.localeCompare(a.project_name)
      );

    case 'possession-asc':
      return sorted.sort((a, b) => {
        if (!a.possession_date) return 1;
        if (!b.possession_date) return -1;
        return (
          new Date(a.possession_date).getTime() -
          new Date(b.possession_date).getTime()
        );
      });

    case 'possession-desc':
      return sorted.sort((a, b) => {
        if (!a.possession_date) return 1;
        if (!b.possession_date) return -1;
        return (
          new Date(b.possession_date).getTime() -
          new Date(a.possession_date).getTime()
        );
      });

    default:
      return sorted;
  }
}

// =====================================================
// SEARCH FUNCTION (Client-side text search)
// =====================================================

export function searchProjectsByText(
  projects: ProjectFull[],
  searchTerm: string
): ProjectFull[] {
  if (!searchTerm || searchTerm.trim() === '') return projects;

  const term = searchTerm.toLowerCase().trim();

  return projects.filter((p) => {
    // Search in project name
    if (p.project_name?.toLowerCase().includes(term)) return true;

    // Search in developer name
    if (p.developer?.developer_name?.toLowerCase().includes(term)) return true;

    // Search in region
    if (p.region?.toLowerCase().includes(term)) return true;

    // Search in address
    if (p.address_line?.toLowerCase().includes(term)) return true;

    // Search in configurations
    if (p.configurations?.some((c) => c.toLowerCase().includes(term)))
      return true;

    return false;
  });
}

// =====================================================
// FILTER COUNTER (shows active filter count)
// =====================================================

export function countActiveFilters(filters: FilterCriteria): number {
  let count = 0;

  if (filters.status && filters.status.length > 0) count++;
  if (filters.zones && filters.zones.length > 0) count++;
  if (filters.regions && filters.regions.length > 0) count++;
  if (filters.configurations && filters.configurations.length > 0) count++;
  if (filters.developers && filters.developers.length > 0) count++;
  if (filters.developer_ids && filters.developer_ids.length > 0) count++;
  if (filters.builder_grades && filters.builder_grades.length > 0) count++;
  if (filters.property_types && filters.property_types.length > 0) count++;
  if (filters.minPrice !== undefined && filters.minPrice > 0) count++;
  if (filters.maxPrice !== undefined && filters.maxPrice > 0) count++;
  if (filters.minSqft !== undefined && filters.minSqft > 0) count++;
  if (filters.maxSqft !== undefined && filters.maxSqft > 0) count++;
  if (filters.possession_year) count++;
  if (filters.required_amenities && filters.required_amenities.length > 0)
    count++;

  return count;
}

// =====================================================
// RESET FILTERS
// =====================================================

export function getEmptyFilters(): FilterCriteria {
  return {
    status: [],
    zones: [],
    regions: [],
    configurations: [],
    developers: [],
    developer_ids: [],
    builder_grades: [],
    property_types: [],
    minPrice: undefined,
    maxPrice: undefined,
    minSqft: undefined,
    maxSqft: undefined,
    possession_year: undefined,
    required_amenities: [],
  };
}

// =====================================================
// PRICE RANGE HELPERS
// =====================================================

export const PRICE_RANGES = [
  { label: 'Under 50L', min: 0, max: 5000000 },
  { label: '50L - 1Cr', min: 5000000, max: 10000000 },
  { label: '1Cr - 2Cr', min: 10000000, max: 20000000 },
  { label: '2Cr - 3Cr', min: 20000000, max: 30000000 },
  { label: '3Cr - 5Cr', min: 30000000, max: 50000000 },
  { label: '5Cr - 10Cr', min: 50000000, max: 100000000 },
  { label: 'Above 10Cr', min: 100000000, max: Infinity },
];

export function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
}

// =====================================================
// AREA RANGE HELPERS
// =====================================================

export const AREA_RANGES = [
  { label: 'Under 500 sqft', min: 0, max: 500 },
  { label: '500 - 1000 sqft', min: 500, max: 1000 },
  { label: '1000 - 1500 sqft', min: 1000, max: 1500 },
  { label: '1500 - 2000 sqft', min: 1500, max: 2000 },
  { label: '2000 - 3000 sqft', min: 2000, max: 3000 },
  { label: '3000 - 5000 sqft', min: 3000, max: 5000 },
  { label: 'Above 5000 sqft', min: 5000, max: Infinity },
];

// =====================================================
// FILTER VALIDATION
// =====================================================

export function validateFilters(filters: FilterCriteria): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Price validation
  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice
  ) {
    errors.push('Minimum price cannot be greater than maximum price');
  }

  // Area validation
  if (
    filters.minSqft !== undefined &&
    filters.maxSqft !== undefined &&
    filters.minSqft > filters.maxSqft
  ) {
    errors.push('Minimum area cannot be greater than maximum area');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
