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
  amenities?: string[]; // Added this array
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
}
