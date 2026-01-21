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
  configuration: string; // '2BHK', '3BHK'
  facingDir?: string; // 'East', 'West'
  distance?: number; 

  
  // NEW FIELDS FOR MEGA FILTER
  status?: 'Ready' | 'Under Construction';
  unitsAvailable?: Record<string, number>; // { '2BHK': 5 }
  totalUnits?: number;
  completionDate?: string;
  amenities?: string[];
  sqFt?: number;
  
  // Legacy fields if needed
  facing?: {
    door: string;
    balcony: string;
  };
}

export interface FilterCriteria {
  configurations?: string[]; // ['2BHK']
  priceRange?: { min: number; max: number };
  facing?: { mainDoor?: string[] };
  minPrice?: number;
  maxPrice?: number;
  zones?: string[];              // FIX: This solves the error           // Added for completio





  // NEW FILTER CRITERIA
  status?: 'Ready' | 'Under Construction';
  sqFtMin?: number;
  sqFtMax?: number;
}
