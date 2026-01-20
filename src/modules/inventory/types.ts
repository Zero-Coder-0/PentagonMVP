export interface Property {
  id: string;
  name: string;
  location_name: string;
  price_min: number;
  configurations: string[]; // e.g., ["2BHK", "3BHK"]
  lat: number;
  lng: number;
  zone: 'North' | 'South' | 'East' | 'West';
  distance_km?: number; // Calculated field
}
