'use client'

import { InventoryItem } from '../types'

interface ProjectListProps {
  properties: InventoryItem[];
  onSelect: (id: string) => void;
}

export function ProjectList({ properties, onSelect }: ProjectListProps) {
  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto h-full">
      {properties.map((prop) => (
        <div 
          key={prop.id}
          onClick={() => onSelect(prop.id)}
          className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900">{prop.name}</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600">
              {prop.configuration}
            </span>
          </div>
          
          <p className="text-sm text-gray-500 mt-1">{prop.location}</p>
          
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-medium text-blue-600">
              {prop.price}
            </span>
            {prop.distance && (
              <span className="text-xs text-gray-400">
                {prop.distance.toFixed(1)} km away
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
