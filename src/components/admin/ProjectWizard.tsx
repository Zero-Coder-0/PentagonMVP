// src/components/admin/ProjectWizard.tsx
'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ProjectFullV7, ProjectUnitV7 } from '@/modules/inventory/types-v7';
import { createSingleProject } from '@/modules/admin/actions-single';
import LocationSearch from '@/modules/map-engine/components/LocationSearch';
import { createClient } from '@/core/db/client';
import { MapPin, Upload, FileText, Video, Building2, CheckCircle, AlertCircle, Save } from 'lucide-react';

// --- 1. DYNAMIC IMPORT FOR THE VISUAL MAP ---
const LocationPicker = dynamic(() => import('@/components/vendor/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Interactive Map...</div>
});

interface WizardProps {
  mode?: 'admin' | 'vendor';
}

export default function ProjectWizard({ mode = 'admin' }: WizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Rich State Management
  const [formData, setFormData] = useState<Partial<ProjectFullV7>>({
    zone: 'East',
    status: 'Under Construction',
    lat: 12.9716,
    lng: 77.5946,
    units: [],
    amenities: [],
    analysis: {
      overall_rating: 0,
      pros: [],
      cons: [],
      target_customer_profile: '',
      closing_pitch: '',
      objection_handling: '',
      competitor_names: []
    },
    specifications: {}
  });

  // --- HANDLERS ---
  const handleChange = (field: keyof ProjectFullV7, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value }
    }));
  };

  // 1. Handle Search Selection (Updates Text & Coords)
  const handleSearchSelect = (lat: number, lng: number, label: string) => {
    setFormData(prev => ({ 
      ...prev, 
      lat, 
      lng, 
      address_line: label 
    }));
  };

  // 2. Handle Map Pin Move (Updates Coords & Zone)
  const handleMapPinChange = (lat: number, lng: number, zone: string) => {
    setFormData(prev => ({ 
      ...prev, 
      lat, 
      lng, 
      zone: zone as any
    }));
  };

  // ✅ FIXED: Unit Logic with all required fields
  const addUnit = () => {
    const newUnit: ProjectUnitV7 = {
      type: '2BHK',
      facing: 'East',
      sba_sqft: 1000,
      carpet_sqft: 850,
      uds_sqft: 200,
      base_price: 5000000,
      is_available: true,
      flooring_type: 'Vitrified Tiles',
      power_load_kw: 3,
      // ✅ FIXED: Added missing fields
      wc_count: 2,
      balcony_count: 1,
      facing_available: ['East', 'West'], // ✅ Array, not string
      plc_charges: 50000
    };
    setFormData(prev => ({ ...prev, units: [...(prev.units || []), newUnit] }));
  };

  const updateUnit = (index: number, field: keyof ProjectUnitV7, value: any) => {
    const newUnits = [...(formData.units || [])];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setFormData(prev => ({ ...prev, units: newUnits }));
  };

  // --- PRE-DEFINED LISTS ---
  const AMENITY_OPTIONS = [
    { cat: 'Wellness', name: 'Swimming Pool' }, 
    { cat: 'Wellness', name: 'Gym' },
    { cat: 'Sports', name: 'Badminton Court' }, 
    { cat: 'Sports', name: 'Tennis Court' },
    { cat: 'Leisure', name: 'Clubhouse' }, 
    { cat: 'Leisure', name: 'Party Hall' },
    { cat: 'Nature', name: 'Park' }, 
    { cat: 'Safety', name: 'CCTV' }
  ];

  const toggleAmenity = (cat: string, name: string) => {
    const exists = formData.amenities?.find(a => a.name === name);
    if (exists) {
      setFormData(p => ({...p, amenities: p.amenities?.filter(a => a.name !== name)}));
    } else {
      setFormData(p => ({...p, amenities: [...(p.amenities || []), { category: cat, name, size_specs: '' }]}));
    }
  };

  // --- SUBMIT LOGIC ---
  const handleSubmit = async () => {
    if (!formData.name) {
      alert("Please enter a Project Name");
      setStep(1);
      return;
    }

    setLoading(true);

    if (mode === 'admin') {
      // ADMIN: Save directly to Live Database
      const result = await createSingleProject(formData as ProjectFullV7);
      if (result.success) {
        alert('Success! Project is live.');
        window.location.href = '/dashboard';
      } else {
        alert('Error: ' + result.message);
      }
    } else {
      // VENDOR: Save to Drafts Table
      const supabase = createClient();
      const { error } = await supabase.from('property_drafts').insert({
        submission_data: formData,
        status: 'pending'
      });

      if (error) {
        alert('Error submitting draft: ' + error.message);
      } else {
        window.location.search = '?success=true'; 
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden my-8 border border-slate-200">

      {/* Header */}
      <div className={`${mode === 'admin' ? 'bg-slate-900' : 'bg-indigo-700'} text-white p-6 flex justify-between items-center`}>
        <div>
          <h1 className="text-2xl font-bold">{mode === 'admin' ? 'New Project Wizard' : 'Vendor Submission Portal'}</h1>
          <p className="text-white/70 text-sm">{mode === 'admin' ? 'Live Database Integration' : 'Submit for Admin Approval'}</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm 
              ${step === i ? 'bg-white text-indigo-900' : step > i ? 'bg-green-400 text-white' : 'bg-black/30 text-white/50'}`}>
              {step > i ? <CheckCircle size={16} /> : i}
            </div>
          ))}
        </div>
      </div>

      <div className="p-8">

        {/* --- STEP 1: IDENTITY & VISUAL LOCATION --- */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
               <Building2 className="text-blue-600" /> Identity & Location
             </h2>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

               {/* Left: Form Fields */}
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-700">Project Name</label>
                   <input 
                     className="w-full border p-2 rounded focus:ring-2 ring-blue-500 outline-none" 
                     value={formData.name || ''} 
                     onChange={e => handleChange('name', e.target.value)} 
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-700">Developer Brand</label>
                   <input 
                     className="w-full border p-2 rounded" 
                     value={formData.developer || ''} 
                     onChange={e => handleChange('developer', e.target.value)} 
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">RERA ID</label>
                      <input 
                        className="w-full border p-2 rounded" 
                        value={formData.rera_id || ''} 
                        onChange={e => handleChange('rera_id', e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Status</label>
                      <select 
                        className="w-full border p-2 rounded" 
                        value={formData.status} 
                        onChange={e => handleChange('status', e.target.value)}
                      >
                        <option value="Pre-Launch">Pre-Launch</option>
                        <option value="Under Construction">Under Construction</option>
                        <option value="Ready">Ready</option>
                      </select>
                    </div>
                 </div>

                 {/* Auto-detected Info */}
                 <div className="bg-slate-50 p-3 rounded text-sm text-slate-600 grid grid-cols-2 gap-2 border">
                    <div>Lat: <span className="font-mono font-bold">{formData.lat?.toFixed(4)}</span></div>
                    <div>Lng: <span className="font-mono font-bold">{formData.lng?.toFixed(4)}</span></div>
                    <div className="col-span-2">Zone: <span className="font-bold text-blue-600">{formData.zone}</span></div>
                    <div className="col-span-2 text-xs text-slate-400 truncate">{formData.address_line}</div>
                 </div>
               </div>

               {/* Right: THE INTERACTIVE MAP */}
               <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Pin Location</label>

                  {/* 1. Search Bar */}
                  <div className="mb-2 relative z-10">
                    <LocationSearch onLocationSelect={handleSearchSelect} />
                  </div>

                  {/* 2. Visual Map */}
                  <div className="h-[350px] rounded-xl overflow-hidden border border-slate-300 shadow-inner relative z-0">
                    <LocationPicker 
                       onLocationChange={handleMapPinChange} 
                       lat={formData.lat} 
                       lng={formData.lng} 
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Search for an area, then drag the pin for precision.
                  </p>
               </div>

             </div>
          </div>
        )}

        {/* STEP 2: EXTENSIVE SPECS & ASSETS */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h2 className="text-xl font-bold flex items-center gap-2 border-b pb-2">
              <FileText className="text-blue-600" /> Specifications & Assets
            </h2>

            {/* Media Links */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Hero Image URL</label>
                 <div className="flex items-center border rounded overflow-hidden">
                    <span className="bg-slate-100 p-2 border-r"><Upload size={16} /></span>
                    <input 
                      className="w-full p-2 outline-none" 
                      placeholder="https://..." 
                      onChange={e => handleChange('hero_image_url', e.target.value)} 
                    />
                 </div>
              </div>
              <div className="col-span-1">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Brochure Link</label>
                 <div className="flex items-center border rounded overflow-hidden">
                    <span className="bg-slate-100 p-2 border-r"><FileText size={16} /></span>
                    <input 
                      className="w-full p-2 outline-none" 
                      placeholder="PDF URL" 
                      onChange={e => handleChange('brochure_url', e.target.value)} 
                    />
                 </div>
              </div>
              <div className="col-span-1">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Marketing Kit</label>
                 <div className="flex items-center border rounded overflow-hidden">
                    <span className="bg-slate-100 p-2 border-r"><Video size={16} /></span>
                    <input 
                      className="w-full p-2 outline-none" 
                      placeholder="Drive/Dropbox" 
                      onChange={e => handleChange('marketing_kit_url', e.target.value)} 
                    />
                 </div>
              </div>
            </div>

            {/* Physical Specs */}
            <div className="grid grid-cols-4 gap-4">
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Land Area</label>
                 <input 
                   className="w-full border p-2 rounded" 
                   placeholder="e.g. 5 Acres" 
                   onChange={e => handleChange('total_land_area', e.target.value)} 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Structure</label>
                 <input 
                   className="w-full border p-2 rounded" 
                   placeholder="G+20" 
                   onChange={e => handleChange('structure_details', e.target.value)} 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Open Space %</label>
                 <input 
                   type="number" 
                   className="w-full border p-2 rounded" 
                   placeholder="70" 
                   onChange={e => handleChange('open_space_percent', Number(e.target.value))} 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Possession</label>
                 <input 
                   type="date" 
                   className="w-full border p-2 rounded" 
                   onChange={e => handleChange('possession_date', e.target.value)} 
                 />
               </div>
            </div>

            {/* Flexible Specs & Amenities */}
            <div className="grid grid-cols-2 gap-8 pt-4">
              <div>
                <h3 className="font-semibold mb-3">Amenities (Multi-Select)</h3>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITY_OPTIONS.map(opt => {
                    const isSelected = formData.amenities?.some(a => a.name === opt.name);
                    return (
                      <button 
                        key={opt.name} 
                        onClick={() => toggleAmenity(opt.cat, opt.name)}
                        className={`text-sm p-2 rounded border text-left flex items-center gap-2
                          ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : ''}`}>
                          {isSelected && <CheckCircle size={12} className="text-white" />}
                        </div>
                        {opt.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Key Details (Flexible)</h3>
                <div className="space-y-2">
                   <input 
                     placeholder="Maintenance Cost (e.g. Rs 4/sqft)" 
                     className="w-full border p-2 rounded text-sm" 
                     onBlur={e => handleSpecChange('Maintenance', e.target.value)} 
                   />
                   <input 
                     placeholder="Approved Banks (SBI, HDFC)" 
                     className="w-full border p-2 rounded text-sm" 
                     onBlur={e => handleSpecChange('Banks', e.target.value)} 
                   />
                   <input 
                     placeholder="Legal Approval (BMRDA/RERA)" 
                     className="w-full border p-2 rounded text-sm" 
                     onBlur={e => handleSpecChange('Legal', e.target.value)} 
                   />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: UNITS (Inventory) */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
             <h2 className="text-xl font-bold flex items-center justify-between border-b pb-2">
              <span>Inventory Configuration</span>
              <button 
                onClick={addUnit} 
                className="bg-slate-900 text-white px-4 py-2 rounded text-sm hover:bg-slate-800"
              >
                + Add Configuration
              </button>
            </h2>

            <div className="space-y-3">
              {formData.units?.map((unit, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded border">
                  <span className="font-bold text-slate-400 w-6">#{idx+1}</span>
                  <div className="flex-1 grid grid-cols-6 gap-2">
                     <input 
                       placeholder="Type (3BHK)" 
                       value={unit.type} 
                       onChange={e => updateUnit(idx, 'type', e.target.value)} 
                       className="border p-2 rounded text-sm" 
                     />
                     <input 
                       placeholder="SBA (sqft)" 
                       type="number" 
                       value={unit.sba_sqft} 
                       onChange={e => updateUnit(idx, 'sba_sqft', Number(e.target.value))} 
                       className="border p-2 rounded text-sm" 
                     />
                     <input 
                       placeholder="Carpet" 
                       type="number" 
                       value={unit.carpet_sqft || ''} 
                       onChange={e => updateUnit(idx, 'carpet_sqft', Number(e.target.value))} 
                       className="border p-2 rounded text-sm" 
                     />
                     <input 
                       placeholder="Price (₹)" 
                       type="number" 
                       value={unit.base_price} 
                       onChange={e => updateUnit(idx, 'base_price', Number(e.target.value))} 
                       className="border p-2 rounded text-sm" 
                     />

                     {/* ✅ FIXED: facing_available as comma-separated input */}
                     <input 
                       placeholder="Facings (E, W, N)" 
                       value={Array.isArray(unit.facing_available) ? unit.facing_available.join(', ') : ''} 
                       onChange={e => updateUnit(idx, 'facing_available', e.target.value.split(',').map(s => s.trim()))} 
                       className="border p-2 rounded text-sm" 
                       title="Enter comma-separated values like: East, West, North"
                     />

                     <input 
                       placeholder="WC Count" 
                       type="number" 
                       value={unit.wc_count || ''} 
                       onChange={e => updateUnit(idx, 'wc_count', Number(e.target.value))} 
                       className="border p-2 rounded text-sm" 
                     />
                  </div>
                  <button 
                    className="text-red-500 hover:bg-red-50 p-2 rounded" 
                    onClick={() => {
                       const newUnits = formData.units?.filter((_, i) => i !== idx);
                       setFormData(p => ({...p, units: newUnits}));
                    }}
                  >
                    <AlertCircle size={18} />
                  </button>
                </div>
              ))}
              {formData.units?.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl text-slate-400">
                  Click "+ Add Configuration" to define unit types.
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: ANALYSIS */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold border-b pb-2">Sales Analysis & Pitch</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Target Customer Profile</label>
                    <textarea 
                      className="w-full border p-3 rounded h-24 focus:ring-2 ring-blue-500 outline-none" 
                      placeholder="e.g. Senior Tech Professionals working in Electronic City..."
                      onChange={e => setFormData(p => ({...p, analysis: {...p.analysis!, target_customer_profile: e.target.value}}))} 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Closing Pitch (The "Hook")</label>
                    <textarea 
                      className="w-full border p-3 rounded h-24 focus:ring-2 ring-blue-500 outline-none" 
                      placeholder="e.g. Own land (UDS) for the price of an apartment..."
                      onChange={e => setFormData(p => ({...p, analysis: {...p.analysis!, closing_pitch: e.target.value}}))} 
                    />
                 </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl space-y-4">
                 <h3 className="font-bold text-blue-900">Expert Rating</h3>
                 <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="0.1" 
                      className="flex-1"
                      onChange={e => setFormData(p => ({...p, analysis: {...p.analysis!, overall_rating: Number(e.target.value)}}))} 
                    />
                    <span className="text-2xl font-bold text-blue-600">{formData.analysis?.overall_rating || 0}/10</span>
                 </div>

                 <div>
                    <label className="block text-sm font-bold text-blue-800 mb-1">Pros (Comma Separated)</label>
                    <input 
                      className="w-full border p-2 rounded" 
                      placeholder="Pool, Lake View, Low Density" 
                      onBlur={e => setFormData(p => ({...p, analysis: {...p.analysis!, pros: e.target.value.split(',').map(s => s.trim())}}))} 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-blue-800 mb-1">Cons (Comma Separated)</label>
                    <input 
                      className="w-full border p-2 rounded" 
                      placeholder="Far from Metro, High Maintenance" 
                      onBlur={e => setFormData(p => ({...p, analysis: {...p.analysis!, cons: e.target.value.split(',').map(s => s.trim())}}))} 
                    />
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <button 
            disabled={step === 1} 
            onClick={() => setStep(s => s-1)} 
            className="px-6 py-2 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-50 font-medium"
          >
            Back
          </button>

          <div className="flex gap-2">
            {step < 4 ? (
              <button 
                onClick={() => setStep(s => s+1)} 
                className="px-8 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold shadow-lg shadow-slate-200"
              >
                Next Step
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className={`px-8 py-2.5 text-white rounded-lg font-bold flex items-center gap-2 ${mode === 'admin' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loading ? 'Submitting...' : mode === 'admin' ? '🚀 Launch Project' : '📩 Submit Draft'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
