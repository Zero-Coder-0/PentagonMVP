'use client';

import React, { useState } from 'react';
import { useSchema, SchemaField } from '@/modules/core/context/SchemaContext';
import { Plus, Trash2, ToggleLeft, ToggleRight, Database } from 'lucide-react';

export default function SchemaBuilder() {
  const { schemaFields, addField, toggleField, removeField } = useSchema();
  
  // Local form state
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<SchemaField['type']>('boolean');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel) return;
    
    // Auto-generate a snake_case key from the label
    const generatedKey = newLabel.toLowerCase().replace(/\s+/g, '_');
    
    addField({
      label: newLabel,
      key: generatedKey,
      type: newType,
    });
    
    setNewLabel('');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Dynamic Property Schema
        </h2>
        <p className="text-sm text-slate-500">
          Add new features to the property database. These will instantly appear in the Sales Filters.
        </p>
      </div>

      {/* 1. Add New Field Form */}
      <form onSubmit={handleAdd} className="flex gap-4 items-end mb-8 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-700 mb-1">Feature Name</label>
          <input 
            type="text" 
            placeholder="e.g. Robo Taxi Parking" 
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
          />
        </div>
        
        <div className="w-40">
          <label className="block text-xs font-medium text-slate-700 mb-1">Data Type</label>
          <select 
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={newType}
            onChange={(e) => setNewType(e.target.value as any)}
          >
            <option value="boolean">Yes/No Flag</option>
            <option value="text">Text Input</option>
            <option value="number">Number</option>
          </select>
        </div>

        <button 
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Field
        </button>
      </form>

      {/* 2. Active Schema List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Database Columns</h3>
        
        {schemaFields.length === 0 && (
          <div className="text-center py-8 text-slate-400 italic text-sm">No custom fields defined yet.</div>
        )}

        {schemaFields.map((field) => (
          <div key={field.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:border-slate-300 transition-all bg-white group">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${field.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
              <div>
                <p className="font-medium text-slate-800 text-sm">{field.label}</p>
                <code className="text-xs text-slate-400 bg-slate-50 px-1 py-0.5 rounded">db_column: {field.key}</code>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                {field.type}
              </span>
              
              <button 
                onClick={() => toggleField(field.id)}
                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                title="Toggle Active Status"
              >
                {field.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
              
              <button 
                onClick={() => removeField(field.id)}
                className="p-2 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Field"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
