// src/modules/inventory/utils/filter-engine.ts
//
// Robust filter engine — uses project-constants for type safety and
// case-insensitive normalization so DB data casing never breaks filters.
// ============================================================================

import type { ProjectV7, FilterCriteriaV7 } from '../types-v7';
import { normalize } from '@/lib/project-constants';
import { formatDistanceKm } from '@/lib/geo';

export function filterProjects(
  projects: ProjectV7[],
  criteria: FilterCriteriaV7
): ProjectV7[] {
  return projects.filter((project) => {
    // Guard against invalid project data
    if (!project || !project.id) return false;

    // 1. Status — case-insensitive, so "underconstruction" matches "UnderConstruction"
    if (criteria.status?.length) {
      const projectStatus = normalize(project.projectstatus || '');
      const hasMatch = criteria.status.some(
        (s) => normalize(s) === projectStatus
      );
      if (!hasMatch) return false;
    }

    // 2. City Zone — case-insensitive
    if (criteria.city_zones?.length) {
      const projectZone = normalize(project.city_zone || '');
      const hasMatch = criteria.city_zones.some(
        (z) => normalize(z) === projectZone
      );
      if (!hasMatch) return false;
    }

    // 3. Price Range — inclusive overlap check
    const filterMin = criteria.minPrice || 0;
    const filterMax = criteria.maxPrice || 0;
    const projectMin = project.pricemin || 0;
    const projectMax = project.pricemax || 0;

    // Project price range must overlap with filter range
    if (filterMin > 0 && projectMax > 0 && projectMax < filterMin) return false;
    if (filterMax > 0 && projectMin > 0 && projectMin > filterMax) return false;

    // 4. Configurations — partial match (project may have 2BHK+3BHK, filter for 2BHK should match)
    if (criteria.configurations?.length) {
      const itemConfigs = (project.configurations || []).map(normalize);
      const itemPropType = normalize(project.property_type || '');

      const hasMatch = criteria.configurations.some((filterConfig) => {
        const fc = normalize(filterConfig);
        return itemConfigs.includes(fc) || itemPropType === fc;
      });
      if (!hasMatch) return false;
    }

    // 5. Builder Grade — case-insensitive
    if (criteria.builderGrades?.length) {
      const projectGrade = normalize(project.developer_buildergrade || '');
      const hasMatch = criteria.builderGrades.some(
        (g) => normalize(g) === projectGrade
      );
      if (!hasMatch) return false;
    }

    // 6. Possession Year & Month
    if (criteria.possessionYear) {
      const [filterYear, filterMonth] = criteria.possessionYear.split('-');

      if (filterYear) {
        const matchesYear = project.possession_year === Number(filterYear) ||
          (project.possession_date && project.possession_date.includes(filterYear));
        if (!matchesYear) return false;
      }

      if (filterMonth) {
        const matchesMonth = (project.possession_month && normalize(project.possession_month) === normalize(filterMonth)) ||
          (project.possession_date && normalize(project.possession_date).includes(normalize(filterMonth)));
        if (!matchesMonth) return false;
      }
    }

    // 7. Advanced Unit Filters (Facing, Balcony, Bath, Variant) — Holistic Check
    const hasUnitFilters =
      (criteria.facing?.length ?? 0) > 0 ||
      (criteria.balconyCount?.length ?? 0) > 0 ||
      (criteria.bathroomCount?.length ?? 0) > 0 ||
      (criteria.unitVariant?.length ?? 0) > 0;

    if (hasUnitFilters) {
      if (!project.units?.length) return false; // Must have units to match unit filters

      const hasMatchingUnit = project.units.some(unit => {
        // Each unit must satisfy ALL active unit-level filters
        if (criteria.facing?.length && (!unit.facing || !criteria.facing.some(f => normalize(f) === normalize(unit.facing || '')))) return false;
        if (criteria.balconyCount?.length && (!unit.balconycount || !criteria.balconyCount.some(bc => normalize(bc) === normalize(unit.balconycount)))) return false;
        if (criteria.bathroomCount?.length && (!unit.wccount || !criteria.bathroomCount.some(wc => normalize(wc) === normalize(unit.wccount)))) return false;
        if (criteria.unitVariant?.length && (!unit.type || !criteria.unitVariant.some(uv => normalize(uv) === normalize(unit.type || '')))) return false;
        return true;
      });

      if (!hasMatchingUnit) return false;
    }

    // 8. Area / Sq Ft (Deep unit-level check)
    if (criteria.sqFtMin || criteria.sqFtMax) {
      if (project.units?.length) {
        const minSq = criteria.sqFtMin || 0;
        const maxSq = criteria.sqFtMax || Infinity;

        const hasMatchingArea = project.units.some(u => {
          const area = u.actualsba || u.carpetarea || 0;
          return (area > 0) && (area >= minSq) && (area <= maxSq);
        });

        if (!hasMatchingArea) return false;
      }
    }

    return true;
  });
}

// Re-export for backward compatibility
export const applyFilters = filterProjects;

// ─── Price formatting ─────────────────────────────────────────────────────────

/** Format a raw price number to Indian locale string, e.g. 15000000 → "₹1.50 Cr" */
export function formatPrice(price?: number | null): string {
  if (!price) return 'Price on Request';
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(2)} Cr`;
  if (price >= 100_000) return `₹${(price / 100_000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

// Re-export geo util so existing imports from filter-engine keep working
export { formatDistanceKm as formatDistance };
