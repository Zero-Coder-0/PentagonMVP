export type Zone = 'North' | 'South' | 'East' | 'West';

export interface InventoryItem {
  id: string;
  name: string;
  location: string;
  zone: Zone;
  lat: number;
  lng: number;
  price: string;
  priceValue: number;
  configuration: string;
  facingDir?: string;
  distance?: number; 

  // Fields that were causing "Property does not exist" errors
  status?: string; // Changed to string to allow loose matching
  unitsAvailable?: Record<string, number>;
  totalUnits?: number;
  completionDate?: string;
  amenities?: string[];
  sqFt?: number;
  features?: Record<string, any>; // <--- This fixes the mock.ts errors
  
  // Legacy support
  facing?: { door: string; balcony: string; };
}

export interface FilterCriteria {
  // Fields that were causing "Property does not exist" errors
  dynamicFilters?: Record<string, any>; // <--- This fixes FilterModal errors
  
  // Standard filters
  configurations?: string[];
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  zones?: string[];
  amenities?: string[];
  sqFtMin?: number;
  sqFtMax?: number;
  
  // Allow facing to be EITHER an array OR an object to stop the conflict
  facing?: string[] | { mainDoor?: string[] }; 
  priceRange?: { min: number; max: number };
}
