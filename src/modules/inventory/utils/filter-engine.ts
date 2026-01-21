import { InventoryItem, FilterCriteria } from '../types';

export const FilterEngine = {
  apply: (items: InventoryItem[], criteria: FilterCriteria): InventoryItem[] => {
    return items.filter(item => {
      // 1. BHK Check
      if (criteria.configurations && criteria.configurations.length > 0) {
        if (!criteria.configurations.includes(item.configuration)) return false;
      }

      // 2. Price Range Check
      if (criteria.priceRange) {
        if (item.priceValue < criteria.priceRange.min) return false;
        if (item.priceValue > criteria.priceRange.max) return false;
      }

      // 3. Facing Check (Main Door)
      if (criteria.facing?.mainDoor && criteria.facing.mainDoor.length > 0) {
        // Assume 'facing' property exists on item, default to 'East' if missing for MVP
        // In real app, item.facing would be an object or string
        const itemFacing = item.facingDir || 'East'; 
        if (!criteria.facing.mainDoor.includes(itemFacing)) return false;
      }

      return true;
    });
  }
};
