// src/modules/inventory/utils/filter-engine.ts

import { Property, FilterCriteria } from '../types';

export function filterProperties(properties: Property[], criteria: FilterCriteria): Property[] {
  return properties.filter((property) => {
    
    // 1. Status (Safe Check)
    // We check if criteria.status exists AND has length
    if (criteria.status?.length && !criteria.status.includes(property.status)) {
      return false;
    }

    // 2. Zones (Safe Check)
    if (criteria.zones?.length && !criteria.zones.includes(property.zone)) {
      return false;
    }

    // 3. Price Range
    // Treat undefined as 0
    const minPrice = criteria.minPrice || 0;
    const maxPrice = criteria.maxPrice || 0;

    if (minPrice > 0 && property.price_value < minPrice) return false;
    if (maxPrice > 0 && property.price_value > maxPrice) return false;

    // 4. Configurations (Overlap Check)
    if (criteria.configurations?.length) {
      // Check if property.configurations has ANY match with selected filters
      const hasMatch = property.configurations?.some(config => 
        criteria.configurations!.includes(config)
      );
      if (!hasMatch) return false;
    }

    // 5. Facing (Exact Match)
    if (criteria.facing?.length) {
      // If property has no facing data, or it doesn't match selected, return false
      if (!property.facing_direction || !criteria.facing.includes(property.facing_direction)) {
        return false;
      }
    }

    // 6. Possession Year (Substring Match)
    if (criteria.possessionYear) {
      if (!property.completion_duration?.includes(criteria.possessionYear)) {
        return false;
      }
    }

    // 7. Area (SBA) Range
    const minSqFt = criteria.sqFtMin || 0;
    const maxSqFt = criteria.sqFtMax || 0;

    if (minSqFt > 0 || maxSqFt > 0) {
      const { min, max } = parseSba(property.sq_ft_range);
      
      // If parsing failed (0,0), exclude the property
      if (min === 0 && max === 0) return false;

      if (minSqFt > 0 && max < minSqFt) return false; // Too small
      if (maxSqFt > 0 && min > maxSqFt) return false; // Too big
    }

    return true;
  });
}

// Helper: "1200-1800 sqft" -> { min: 1200, max: 1800 }
function parseSba(val?: string) {
  if (!val) return { min: 0, max: 0 };
  
  // Remove non-numeric characters except hyphen
  const nums = val.replace(/[^0-9-]/g, '').split('-').map(Number);
  
  if (nums.length === 2) return { min: nums[0], max: nums[1] };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  
  return { min: 0, max: 0 };
}
