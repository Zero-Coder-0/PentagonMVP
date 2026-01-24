'use client'

import React, { useState } from 'react'
import { Save, MapPin, Building, DollarSign } from 'lucide-react'
import { createClient } from '@/core/db/client'

// Initial State matching Hybrid Schema
const INITIAL_DATA = {
  name: '',
  developer: '',
  location_area: '',
  zone: 'North',
  lat: 12.9716,
  lng: 77.5946,
  status: 'Under Construction',
  price_display: '',
  price_value: 0,
  configurations: '2BHK, 3BHK',
  sq_ft_range: '1000-2000 sqft',
  facing_direction: 'East',
  balcony_count: 1,
  floor_levels: 'G+12',
  units_available: { "2BHK": 5, "3BHK": 5 }, // JSONB
  amenities: [] as string[], // Array
  nearby_locations: { "mall": "2km" }, // JSONB
  contact_person: '',
  contact_phone: '',
  completion_duration: 'Q4 2026'
}

export default function InventoryUploadPage() {
  const [form, setForm] = useState(INITIAL_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.from('properties').insert(form)

    if (error) {
      alert('Upload failed: ' + error.message)
    } else {
      alert('Property Added Successfully!')
      setForm(INITIAL_DATA)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Add New Property</h1>
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Admin Mode</span>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
        
        {/* Section 1: Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Name</label>
            <input 
              required
              className="w-full p-2 border border-slate-300 rounded"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g. Sobha Neopolis"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Developer</label>
            <input 
              className="w-full p-2 border border-slate-300 rounded"
              value={form.developer}
              onChange={e => setForm({...form, developer: e.target.value})}
              placeholder="e.g. Sobha Ltd"
            />
          </div>
        </div>

        {/* Section 2: Location & Map */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
           <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
             <MapPin className="w-4 h-4" /> Location Details
           </h3>
           <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Area Name</label>
                <input 
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                  value={form.location_area}
                  onChange={e => setForm({...form, location_area: e.target.value})}
                  placeholder="e.g. Panathur"
                />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zone</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded bg-white"
                  value={form.zone}
                  onChange={e => setForm({...form, zone: e.target.value})}
                >
                  <option>North</option>
                  <option>South</option>
                  <option>East</option>
                  <option>West</option>
                </select>
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lat</label>
                <input type="number" step="any" className="w-full p-2 border rounded" value={form.lat} onChange={e => setForm({...form, lat: parseFloat(e.target.value)})} />
             </div>
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Lng</label>
                <input type="number" step="any" className="w-full p-2 border rounded" value={form.lng} onChange={e => setForm({...form, lng: parseFloat(e.target.value)})} />
             </div>
           </div>
        </div>

        {/* Section 3: Pricing & Config */}
        <div className="grid grid-cols-3 gap-4">
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price Display</label>
              <input className="w-full p-2 border rounded" value={form.price_display} onChange={e => setForm({...form, price_display: e.target.value})} placeholder="e.g. 1.5 Cr" />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sort Value (Numeric)</label>
              <input type="number" className="w-full p-2 border rounded" value={form.price_value} onChange={e => setForm({...form, price_value: Number(e.target.value)})} />
           </div>
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Configs</label>
              <input className="w-full p-2 border rounded" value={form.configurations} onChange={e => setForm({...form, configurations: e.target.value})} placeholder="e.g. 2BHK, 3BHK" />
           </div>
        </div>

        {/* JSONB Fields (Simplified for MVP) */}
        <div>
           <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Units Available (JSON)</label>
           <textarea 
             className="w-full p-2 border border-slate-300 rounded text-xs font-mono h-20"
             value={JSON.stringify(form.units_available)}
             onChange={e => {
               try {
                 const parsed = JSON.parse(e.target.value)
                 setForm({...form, units_available: parsed})
               } catch {}
             }}
           />
           <p className="text-[10px] text-slate-400 mt-1">Edit as JSON: {"{\"2BHK\": 5}"}</p>
        </div>

        <div className="flex justify-end pt-6">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Publish Property'}
          </button>
        </div>

      </form>
    </div>
  )
}
