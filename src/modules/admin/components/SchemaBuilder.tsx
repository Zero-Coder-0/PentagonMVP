"use client";
import React, { useState } from 'react';
import { useSchema } from '@/modules/core/context/SchemaContext';
import { Plus, Trash2, Database } from 'lucide-react';

export default function SchemaBuilder() {
  const { amenities, addAmenity, removeAmenity } = useSchema();
  const [newFeature, setNewFeature] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeature.trim()) {
      addAmenity(newFeature.trim());
      setNewFeature("");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Dynamic Schema Engine
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Add new property features/tags here. These will instantly appear in the 
            Sales Dashboard filters and Property Upload forms.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium border border-blue-100">
          Live Updates Enabled
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleAdd} className="flex gap-3 mb-8 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Feature Name</label>
          <input 
            type="text" 
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="e.g. Robo Taxi Parking, Helipad"
            className="w-full px-4 py-2 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-48">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Data Type</label>
          <select disabled className="w-full px-4 py-2 rounded border border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed">
            <option>Boolean (Yes/No)</option>
          </select>
        </div>
        <div className="flex items-end">
          <button 
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Add Feature
          </button>
        </div>
      </form>

      {/* Active Schema List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Active Amenities ({amenities.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {amenities.map((item) => (
            <div key={item} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded hover:border-blue-300 group transition-all">
              <span className="text-slate-700 font-medium">{item}</span>
              <button 
                onClick={() => removeAmenity(item)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Remove from Schema"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
