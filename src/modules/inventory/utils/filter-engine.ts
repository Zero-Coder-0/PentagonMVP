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

      // 4. Facing Check
      if (criteria.facing?.mainDoor && criteria.facing.mainDoor.length > 0) {
        const itemFacing = item.facingDir || 'East'; 
        if (!criteria.facing.mainDoor.includes(itemFacing)) return false;
      }

      return true;
    });
  }
};
