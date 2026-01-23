import { InventoryItem, FilterCriteria } from '../types';

export const FilterEngine = {
  apply: (items: InventoryItem[], criteria: FilterCriteria): InventoryItem[] => {
    return items.filter(item => {
      // 1. Status Check
      if (criteria.status && item.status !== criteria.status) return false;

      // 2. BHK Check
      if (criteria.configurations && criteria.configurations.length > 0) {
        if (!criteria.configurations.includes(item.configuration)) return false;
      }

      // 3. Price Range Check
      if (criteria.priceRange) {
        if (item.priceValue < criteria.priceRange.min) return false;
        if (item.priceValue > criteria.priceRange.max) return false;
      }

      // 4. Facing Check - FIXED: Handle both array and object types
      if (criteria.facing) {
        const itemFacing = item.facingDir || 'East';
        
        // Check if facing is an array (simple string[])
        if (Array.isArray(criteria.facing)) {
          if (criteria.facing.length > 0 && !criteria.facing.includes(itemFacing)) {
            return false;
          }
        }
        // Check if facing is an object with mainDoor property
        else if (criteria.facing.mainDoor && criteria.facing.mainDoor.length > 0) {
          if (!criteria.facing.mainDoor.includes(itemFacing)) {
            return false;
          }
        }
      }

      return true;
    });
  }
};
