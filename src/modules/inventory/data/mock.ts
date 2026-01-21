import { InventoryItem } from '../types';

export const MOCK_INVENTORY: InventoryItem[] = [
  // NORTH ZONE
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
    facingDir: 'East',
    amenities: ['Golf Course', 'Pool', 'Clubhouse'] 
  },
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
    facingDir: 'North',
    amenities: ['Private Pool', 'Gym', 'Concierge'] 
  },
  { 
    id: '102', 
    name: 'Godrej Reserve', 
    location: 'Devanahalli', 
    zone: 'North', 
    lat: 13.2250, 
    lng: 77.7000, 
    price: '1.2 Cr', 
    priceValue: 12000000,
    configuration: '3BHK',
    facingDir: 'East',
    amenities: ['Park', 'Security'] 
  },

  // EAST ZONE
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
    facingDir: 'East',
    amenities: ['Metro Nearby', 'Pool']
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
    facingDir: 'West',
    amenities: ['Mall Nearby', 'Gym']
  },

  // SOUTH ZONE
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
    facingDir: 'North',
    amenities: ['School Bus', 'Gardens']
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
    facingDir: 'East',
    amenities: ['View', 'Clubhouse']
  }
];
