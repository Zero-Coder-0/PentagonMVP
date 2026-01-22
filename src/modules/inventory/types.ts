export interface InventoryItem {
  id: string;
  name: string;          // Was 'title' in old type, but 'name' in mock
  
  // Location (Flat structure to match mock.ts)
  lat: number;
  lng: number;
  location: string;      // Text location e.g. "Whitefield"
  zone: string;          // "North", "East", etc.

  // Pricing
  price: string;         // Display price e.g. "1.5 Cr"
  priceValue: number;    // Numeric for filtering e.g. 15000000

  // Configuration & Status
  configuration: string; // e.g. "3BHK"
  status: 'Ready' | 'Under Construction'; 
  
  // Details
  sqFt?: number;         // Optional
  totalUnits?: number;   // Optional
  unitsAvailable?: Record<string, number>; // e.g. { '3BHK': 5 }
  completionDate?: string; // e.g. "2027"

  // Features
  amenities: string[];
  facingDir: string;     // Matches 'facingDir' in mock.ts
  
  // Dynamic Bag (For your Admin Schema features)
  features?: Record<string, any>;
}

export interface FilterCriteria {
  maxPrice?: number;     // Changed from priceRange object to simple max
  configurations?: string[];
  status?: string;
  facing?: string[];     // Array of strings
  dynamicFilters?: Record<string, any>;
}
