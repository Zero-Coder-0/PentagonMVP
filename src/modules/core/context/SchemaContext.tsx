"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Default / Initial Options (Simulating filter-options.ts)
const INITIAL_AMENITIES = [
  "Swimming Pool", "Gym", "Clubhouse", "Metro Connected", 
  "Mall Nearby", "Power Backup", "Gated Security", "Children Park"
];
const INITIAL_PROJECT_STATUS = ["Under Construction", "Ready to Move"];

interface SchemaContextType {
  amenities: string[];
  projectStatus: string[];
  addAmenity: (name: string) => void;
  removeAmenity: (name: string) => void;
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

export function SchemaProvider({ children }: { children: ReactNode }) {
  const [amenities, setAmenities] = useState<string[]>(INITIAL_AMENITIES);
  const [projectStatus] = useState<string[]>(INITIAL_PROJECT_STATUS);

  const addAmenity = (name: string) => {
    if (!amenities.includes(name)) {
      setAmenities([...amenities, name]);
    }
  };

  const removeAmenity = (name: string) => {
    setAmenities(amenities.filter((item) => item !== name));
  };

  return (
    <SchemaContext.Provider value={{ amenities, projectStatus, addAmenity, removeAmenity }}>
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema() {
  const context = useContext(SchemaContext);
  if (!context) throw new Error("useSchema must be used within a SchemaProvider");
  return context;
}
