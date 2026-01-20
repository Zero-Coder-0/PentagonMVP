import { InventoryItem, FilterCriteria } from '../types';

// ==========================================
// 1. CONSTANTS & TYPES
// ==========================================
type FacingType = 'North' | 'South' | 'East' | 'West' | 'North-East' | 'North-West' | 'South-East' | 'South-West';

export interface ComplexFilterRules {
  priceRange?: { min: number; max: number }; // Absolute range
  smartPriceMatch?: { targetPrice: number; variancePercent: number }; // +/- 20% logic
  configurations?: string[]; // ['2BHK', '3BHK']
  facing?: {
    mainDoor?: FacingType[];
    balcony?: FacingType[];
  };
  amenities?: string[];
  maxDistanceKm?: number;
}

// ==========================================
// 2. THE FILTER ENGINE
// ==========================================
export const FilterEngine = {
  /**
   * Main entry point to filter the inventory list
   */
  apply: (items: InventoryItem[], rules: ComplexFilterRules, userLocation?: { lat: number; lng: number }): InventoryItem[] => {
    return items.filter(item => {
      // 1. Price Range (+/- 20% or absolute)
      if (!checkPrice(item, rules)) return false;

      // 2. Configuration (BHK)
      if (!checkConfig(item, rules)) return false;

      // 3. Facing (Complex Rules)
      if (!checkFacing(item, rules)) return false;

      // 4. Distance (if user searched a location)
      if (userLocation && rules.maxDistanceKm) {
        if (!checkDistance(item, userLocation, rules.maxDistanceKm)) return false;
      }

      return true;
    });
  },

  /**
   * Generates recommendations based on a selected item
   * Logic: Nearby + Price +/- 20% + Same Config
   */
  getRecommendations: (selectedItem: InventoryItem, allItems: InventoryItem[]): InventoryItem[] => {
    const rules: ComplexFilterRules = {
      smartPriceMatch: { targetPrice: selectedItem.priceValue, variancePercent: 20 },
      configurations: [selectedItem.configuration], // e.g., '3BHK'
      // We can add distance logic here later
    };

    return allItems
      .filter(item => item.id !== selectedItem.id) // Exclude self
      .filter(item => FilterEngine.apply([item], rules).length > 0)
      .slice(0, 3); // Return top 3
  }
};

// ==========================================
// 3. INTERNAL HELPER FUNCTIONS
// ==========================================

const checkPrice = (item: InventoryItem, rules: ComplexFilterRules): boolean => {
  // Logic for +/- 20%
  if (rules.smartPriceMatch) {
    const { targetPrice, variancePercent } = rules.smartPriceMatch;
    const min = targetPrice * (1 - variancePercent / 100);
    const max = targetPrice * (1 + variancePercent / 100);
    return item.priceValue >= min && item.priceValue <= max;
  }
  
  // Logic for Absolute Range
  if (rules.priceRange) {
    return item.priceValue >= rules.priceRange.min && item.priceValue <= rules.priceRange.max;
  }
  return true;
};

const checkConfig = (item: InventoryItem, rules: ComplexFilterRules): boolean => {
  if (!rules.configurations || rules.configurations.length === 0) return true;
  return rules.configurations.includes(item.configuration);
};

const checkFacing = (item: InventoryItem, rules: ComplexFilterRules): boolean => {
  if (!rules.facing) return true;

  // Check Door Facing
  if (rules.facing.mainDoor && rules.facing.mainDoor.length > 0) {
    if (!rules.facing.mainDoor.includes(item.facing.door as FacingType)) return false;
  }

  // Check Balcony Facing
  if (rules.facing.balcony && rules.facing.balcony.length > 0) {
    if (!rules.facing.balcony.includes(item.facing.balcony as FacingType)) return false;
  }

  return true;
};

// Placeholder for Haversine check (we will import the real math next)
const checkDistance = (item: InventoryItem, userLoc: {lat: number, lng: number}, maxKm: number): boolean => {
  // We will plug in the geo-calc utility here
  return true; 
};
