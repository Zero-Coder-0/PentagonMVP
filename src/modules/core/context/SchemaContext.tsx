'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of a dynamic field
export type SchemaField = {
  id: string;
  label: string;      // e.g., "Robo Taxi Parking"
  key: string;        // e.g., "robo_taxi_parking"
  type: 'boolean' | 'text' | 'number' | 'select';
  isActive: boolean;
  options?: string[]; // For select dropdowns
};

type SchemaContextType = {
  // 👇 ADDED: The specific arrays your FilterModal needs
  amenities: string[];
  projectStatus: string[];
  
  // Existing functionality
  schemaFields: SchemaField[];
  addField: (field: Omit<SchemaField, 'id' | 'isActive'>) => void;
  toggleField: (id: string) => void;
  removeField: (id: string) => void;
  isLoading: boolean; // Useful for loading states
};

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

// Initial default fields
const DEFAULT_FIELDS: SchemaField[] = [
  { id: '1', label: 'Metro Connectivity', key: 'metro_connected', type: 'boolean', isActive: true },
  { id: '2', label: 'EV Charging Station', key: 'ev_charging', type: 'boolean', isActive: true },
];

export function SchemaProvider({ children }: { children: React.ReactNode }) {
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>(DEFAULT_FIELDS);
  
  // 👇 ADDED: State for the missing properties
  const [amenities, setAmenities] = useState<string[]>([]);
  const [projectStatus, setProjectStatus] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pentagon_schema_v1');
    if (saved) {
      try {
        setSchemaFields(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load schema", e);
      }
    }
    
    // 👇 ADDED: Load amenities/status (Hardcoded for now, fetch from DB later)
    setAmenities([
      "Swimming Pool", "Gym", "Clubhouse", "Park", "Security",
      "Power Backup", "Parking", "Elevator", "Vastu Compliant"
    ]);
    setProjectStatus([
      "Ready", "Under Construction", "New Launch"
    ]);
    setIsLoading(false);
    
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('pentagon_schema_v1', JSON.stringify(schemaFields));
  }, [schemaFields]);

  const addField = (field: Omit<SchemaField, 'id' | 'isActive'>) => {
    const newField: SchemaField = {
      ...field,
      id: Math.random().toString(36).substr(2, 9),
      isActive: true,
    };
    setSchemaFields((prev) => [...prev, newField]);
  };

  const toggleField = (id: string) => {
    setSchemaFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
    );
  };

  const removeField = (id: string) => {
    setSchemaFields((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <SchemaContext.Provider value={{ 
      amenities, 
      projectStatus, 
      schemaFields, 
      addField, 
      toggleField, 
      removeField,
      isLoading 
    }}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema() {
  const context = useContext(SchemaContext);
  if (!context) throw new Error('useSchema must be used within a SchemaProvider');
  return context;
}
