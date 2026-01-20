export type Zone = 'North' | 'South' | 'East' | 'West';

export interface InventoryItem {
  id: string;
  name: string;
  location: string;
  zone: Zone; // Added Zone field
  lat: number;
  lng: number;
  price: string;
  priceValue: number; // Numeric value for calculation (e.g., 15000000)
  configuration: string; // '2BHK', '3BHK'
  facing?: {
    door: string;
    balcony: string;
  };
  // We will add more fields later as per PRD
}
