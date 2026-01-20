import { InventoryItem } from '../types';

export const MOCK_INVENTORY: InventoryItem[] = [
  { 
    id: '1', 
    name: 'Prestige Golfshire', 
    location: 'Nandi Hills', 
    zone: 'North', // Blue Pin
    lat: 13.1986, 
    lng: 77.6727, 
    price: '1.5 Cr', 
    priceValue: 15000000,
    configuration: '4BHK',
    facing: { door: 'North', balcony: 'East' }
  },
  { 
    id: '2', 
    name: 'Sobha Dream Acres', 
    location: 'Panathur', 
    zone: 'East', // Red Pin
    lat: 12.9366, 
    lng: 77.7289, 
    price: '85 L', 
    priceValue: 8500000,
    configuration: '2BHK',
    facing: { door: 'East', balcony: 'West' }
  },
  { 
    id: '3', 
    name: 'Brigade Meadows', 
    location: 'Kanakapura', 
    zone: 'South', // Green Pin
    lat: 12.8242, 
    lng: 77.5144, 
    price: '65 L', 
    priceValue: 6500000,
    configuration: '2BHK',
    facing: { door: 'South', balcony: 'North' }
  },
];
