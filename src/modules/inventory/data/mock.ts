import { InventoryItem } from '../types';

export const MOCK_INVENTORY: InventoryItem[] = [
  // READY TO MOVE EXAMPLES
  { 
    id: '1', 
    name: 'Prestige Golfshire', 
    location: 'Nandi Hills', 
    zone: 'North', 
    lat: 13.1986, 
    lng: 77.6727, 
    price: '1.5 Cr', 
    priceValue: 15000000,
    configuration: '4BHK',
    status: 'Ready', 
    unitsAvailable: { '4BHK': 5, '3BHK': 0 }, 
    totalUnits: 200,
    amenities: ['Golf Course', 'Pool', 'Clubhouse'],
    facingDir: 'East',
    // ADDED FEATURES HERE
    features: { 'ev_charging': true, 'clubhouse': true } 
  },
  { 
    id: '2', 
    name: 'Sobha Dream Acres', 
    location: 'Panathur', 
    zone: 'East', 
    lat: 12.9366, 
    lng: 77.7289, 
    price: '85 L', 
    priceValue: 8500000,
    configuration: '2BHK',
    status: 'Ready',
    unitsAvailable: { '2BHK': 12, '1BHK': 4 },
    totalUnits: 1500,
    amenities: ['Metro', 'Clubhouse'],
    facingDir: 'East',
    // ADDED FEATURES HERE
    features: { 'metro_connected': true, 'clubhouse': true }
  },
  { 
    id: '3', 
    name: 'Brigade Meadows', 
    location: 'Kanakapura', 
    zone: 'South', 
    lat: 12.8242, 
    lng: 77.5144, 
    price: '65 L', 
    priceValue: 6500000,
    configuration: '2BHK',
    status: 'Ready',
    totalUnits: 600,
    amenities: ['School Bus', 'Gardens'],
    facingDir: 'North',
    // ADDED FEATURES HERE
    features: { 'garden_view': true }
  },

  // UNDER CONSTRUCTION EXAMPLES
  { 
    id: '101', 
    name: 'Embassy Boulevard', 
    location: 'Yelahanka', 
    zone: 'North', 
    lat: 13.1006, 
    lng: 77.5963, 
    price: '1.8 Cr', 
    priceValue: 18000000,
    configuration: '4BHK',
    status: 'Under Construction', 
    completionDate: '2027',
    totalUnits: 500, 
    amenities: ['Private Pool', 'Concierge'],
    facingDir: 'North',
    // ADDED FEATURES HERE
    features: { 'ev_charging': true, 'private_pool': true }
  },
  { 
    id: '201', 
    name: 'Assetz Marq', 
    location: 'Whitefield', 
    zone: 'East', 
    lat: 12.9719, 
    lng: 77.7500, 
    price: '95 L', 
    priceValue: 9500000,
    configuration: '3BHK',
    status: 'Under Construction',
    completionDate: '2026',
    totalUnits: 800,
    amenities: ['Mall', 'Gym'],
    facingDir: 'West',
    // ADDED FEATURES HERE
    features: { 'gym': true }
  },
  { 
    id: '301', 
    name: 'Purva Highland', 
    location: 'Kanakapura', 
    zone: 'South', 
    lat: 12.8542, 
    lng: 77.5344, 
    price: '72 L', 
    priceValue: 7200000,
    configuration: '2BHK',
    status: 'Under Construction',
    totalUnits: 900,
    amenities: ['View', 'Clubhouse'],
    facingDir: 'East',
    // ADDED FEATURES HERE
    features: { 'hill_view': true, 'clubhouse': true }
  }
];
