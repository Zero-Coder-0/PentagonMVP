'use client'
import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

// Defined types for your JSONB structure
type InfraCategory = 'transport' | 'education' | 'food' | 'health';
type InfraItem = { name: string; distance: string; type: string };

interface NearbyInfraFormProps {
  value: Record<InfraCategory, InfraItem[]>;
  onChange: (val: Record<InfraCategory, InfraItem[]>) => void;
}

const CATEGORIES: {key: InfraCategory, label: string}[] = [
  { key: 'transport', label: 'Transportation (Metro, Bus, Airport)' },
  { key: 'education', label: 'Education (Schools, Colleges)' },
  { key: 'food', label: 'Food & Hangouts (Restaurants, Markets)' },
  { key: 'health', label: 'Health & Safety (Hospitals, Police)' }
];

export default function NearbyInfraForm({ value, onChange }: NearbyInfraFormProps) {
  
  const addItem = (category: InfraCategory) => {
    const newItem: InfraItem = { name: '', distance: '', type: '' };
    onChange({
      ...value,
      [category]: [...(value[category] || []), newItem]
    });
  };

  const updateItem = (category: InfraCategory, index: number, field: keyof InfraItem, val: string) => {
    const list = [...(value[category] || [])];
    list[index] = { ...list[index], [field]: val };
    onChange({ ...value, [category]: list });
  };

  const removeItem = (category: InfraCategory, index: number) => {
    const list = [...(value[category] || [])];
    list.splice(index, 1);
    onChange({ ...value, [category]: list });
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
      <h3 className="font-bold text-slate-700">Nearby Infrastructure</h3>
      
      {CATEGORIES.map((cat) => (
        <div key={cat.key} className="bg-white p-4 rounded border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm text-slate-600">{cat.label}</h4>
            <button 
              type="button" 
              onClick={() => addItem(cat.key)}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
            >
              <Plus size={12} /> Add
            </button>
          </div>

          <div className="space-y-2">
            {(value[cat.key] || []).map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input 
                  placeholder="Name (e.g. DPS School)" 
                  className="flex-1 p-2 border rounded text-xs"
                  value={item.name}
                  onChange={(e) => updateItem(cat.key, idx, 'name', e.target.value)}
                />
                <input 
                  placeholder="Type (e.g. School)" 
                  className="w-24 p-2 border rounded text-xs"
                  value={item.type}
                  onChange={(e) => updateItem(cat.key, idx, 'type', e.target.value)}
                />
                <input 
                  placeholder="Dist (e.g. 2km)" 
                  className="w-20 p-2 border rounded text-xs"
                  value={item.distance}
                  onChange={(e) => updateItem(cat.key, idx, 'distance', e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => removeItem(cat.key, idx)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {(value[cat.key] || []).length === 0 && (
              <p className="text-xs text-slate-400 italic">No items added.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
