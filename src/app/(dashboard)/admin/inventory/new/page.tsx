'use client';

import React, { useState } from 'react';
import { Save, MapPin, Image as ImageIcon, FileText, CheckCircle, UploadCloud } from 'lucide-react';
import { useSchema } from '@/modules/core/context/SchemaContext';
// import { supabase } from '@/core/db/supabase'; // Uncomment when connecting to real DB

// --- TYPE DEFINITIONS FOR THE FORM ---
type FormData = {
  // Basic
  name: string;
  developer: string;
  status: 'Ready' | 'Under Construction';
  priceDisplay: string;
  priceValue: number;
  
  // Location
  locationArea: string;
  zone: 'North' | 'South' | 'East' | 'West';
  lat: number;
  lng: number;

  // Specs (The 50+ Fields Container)
  specs: {
    reraNo?: string;
    totalLandArea?: string;
    totalUnits?: string;
    possessionDate?: string;
    constructionType?: string;
    flooring?: string;
    waterSource?: string;
  };
  
  // Dynamic Features
  features: Record<string, boolean>;
  
  // Media
  imageUrls: string[];
};

const INITIAL_DATA: FormData = {
  name: '', developer: '', status: 'Under Construction', priceDisplay: '', priceValue: 0,
  locationArea: '', zone: 'North', lat: 12.9716, lng: 77.5946,
  specs: {}, features: {}, imageUrls: []
};

export default function InventoryUploadPage() {
  const { schemaFields } = useSchema(); // <--- Connects to your Dynamic Admin Schema
  const [step, setStep] = useState<'basic' | 'specs' | 'media' | 'review'>('basic');
  const [form, setForm] = useState<FormData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- HANDLERS ---
  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  };

  const handleFeatureToggle = (key: string) => {
    setForm(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] }
    }));
  };

  const handleImageUpload = () => {
    // 🚀 IMGUR MOCK LOGIC
    // In production, you would use fetch('https://api.imgur.com/3/image', ...)
    const mockUrl = `https://picsum.photos/seed/${Math.random()}/800/600`;
    setForm(prev => ({ ...prev, imageUrls: [...prev.imageUrls, mockUrl] }));
    alert("Simulated upload to Imgur successful!");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    console.log("🚀 UPLOADING TO DB:", form);
    
    // SIMULATE DB DELAY
    await new Promise(r => setTimeout(r, 1500));
    
    // REAL CODE (When connected):
    // const { error } = await supabase.from('properties').insert({ ...mappedData });
    
    alert("Property Created Successfully!");
    setIsSubmitting(false);
    // Router.push('/dashboard')
  };

  // --- RENDER HELPERS ---
  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setStep(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
        step === id 
          ? 'border-indigo-600 text-indigo-700 bg-indigo-50' 
          : 'border-transparent text-slate-500 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto p-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Property</h1>
          <p className="text-slate-500">Vendor & Admin Console</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full border border-yellow-200">
             Draft Mode
           </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Wizard Tabs */}
        <div className="flex border-b border-slate-200">
          <TabButton id="basic" label="1. Basic Info" icon={FileText} />
          <TabButton id="specs" label="2. Detailed Specs" icon={CheckCircle} />
          <TabButton id="media" label="3. Media (Imgur)" icon={ImageIcon} />
          <TabButton id="review" label="4. Final Review" icon={Save} />
        </div>

        {/* --- STEP 1: BASIC INFO --- */}
        {step === 'basic' && (
          <div className="p-8 grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Project Name</label>
              <input 
                className="w-full p-2 border rounded font-bold text-slate-800"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. Sobha Neopolis"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Developer</label>
              <input 
                className="w-full p-2 border rounded"
                value={form.developer}
                onChange={e => handleChange('developer', e.target.value)}
                placeholder="e.g. Sobha Ltd"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Price</label>
              <input 
                className="w-full p-2 border rounded"
                value={form.priceDisplay}
                onChange={e => handleChange('priceDisplay', e.target.value)}
                placeholder="e.g. 1.2 Cr - 2.5 Cr"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sort Price (Numeric)</label>
              <input 
                type="number"
                className="w-full p-2 border rounded"
                value={form.priceValue}
                onChange={e => handleChange('priceValue', Number(e.target.value))}
                placeholder="e.g. 12000000"
              />
            </div>

            <div className="col-span-2 border-t border-slate-100 my-4"></div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Zone</label>
              <select 
                className="w-full p-2 border rounded"
                value={form.zone}
                onChange={e => handleChange('zone', e.target.value)}
              >
                <option value="North">North Bangalore</option>
                <option value="East">East Bangalore</option>
                <option value="South">South Bangalore</option>
                <option value="West">West Bangalore</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Area Name</label>
              <input 
                className="w-full p-2 border rounded"
                value={form.locationArea}
                onChange={e => handleChange('locationArea', e.target.value)}
                placeholder="e.g. Panathur Road"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Latitude</label>
              <input type="number" className="w-full p-2 border rounded" value={form.lat} onChange={e => handleChange('lat', Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Longitude</label>
              <input type="number" className="w-full p-2 border rounded" value={form.lng} onChange={e => handleChange('lng', Number(e.target.value))} />
            </div>
          </div>
        )}

        {/* --- STEP 2: SPECS & FEATURES --- */}
        {step === 'specs' && (
          <div className="p-8 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="font-bold text-lg mb-4 text-indigo-700">Project Details</h3>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {['reraNo', 'totalLandArea', 'totalUnits', 'possessionDate', 'constructionType', 'flooring'].map(field => (
                <div key={field}>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input 
                    className="w-full p-2 border rounded text-sm"
                    value={(form.specs as any)[field] || ''}
                    onChange={e => handleSpecChange(field, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <h3 className="font-bold text-lg mb-4 text-indigo-700 flex items-center gap-2">
               Dynamic Features 
               <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-normal">From Admin Schema</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-6 rounded-xl border border-slate-100">
               {schemaFields.filter(f => f.isActive).map(field => (
                 <label key={field.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors">
                    <input 
                      type="checkbox"
                      className="w-4 h-4 accent-indigo-600"
                      checked={!!form.features[field.key]}
                      onChange={() => handleFeatureToggle(field.key)}
                    />
                    <span className="text-sm font-medium text-slate-700">{field.label}</span>
                 </label>
               ))}
               
               {schemaFields.length === 0 && (
                 <div className="col-span-3 text-center text-slate-400 text-sm">
                   No dynamic fields configured. Go to Super Admin &gt Schema Builder.
                 </div>
               )}
            </div>
          </div>
        )}

        {/* --- STEP 3: MEDIA (IMGUR) --- */}
        {step === 'media' && (
          <div className="p-8 text-center animate-in fade-in slide-in-from-bottom-2">
             <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors cursor-pointer" onClick={handleImageUpload}>
                <UploadCloud className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="font-bold text-slate-700">Click to Upload Images</h3>
                <p className="text-sm text-slate-500 mt-2">Will be hosted on Imgur (Simulated)</p>
             </div>

             <div className="mt-8 grid grid-cols-4 gap-4">
               {form.imageUrls.map((url, idx) => (
                 <div key={idx} className="relative group aspect-video rounded-lg overflow-hidden border border-slate-200">
                    <img src={url} className="w-full h-full object-cover" />
                    <button className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">X</button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* --- STEP 4: REVIEW --- */}
        {step === 'review' && (
          <div className="p-8 animate-in fade-in slide-in-from-bottom-2">
             <h2 className="text-2xl font-bold text-slate-800 mb-6">Review & Publish</h2>
             
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                   <span className="text-slate-500">Project</span>
                   <span className="font-bold text-slate-800">{form.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                   <span className="text-slate-500">Price</span>
                   <span className="font-bold text-slate-800">{form.priceDisplay}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                   <span className="text-slate-500">Location</span>
                   <span className="font-bold text-slate-800">{form.locationArea} ({form.zone})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                   <span className="text-slate-500">Images</span>
                   <span className="font-bold text-slate-800">{form.imageUrls.length} uploaded</span>
                </div>
                <div className="flex justify-between pb-2">
                   <span className="text-slate-500">Dynamic Tags</span>
                   <div className="flex gap-1">
                      {Object.keys(form.features).filter(k => form.features[k]).map(k => (
                        <span key={k} className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{k}</span>
                      ))}
                   </div>
                </div>
             </div>

             <div className="mt-8 flex justify-end gap-4">
               <button 
                 onClick={() => setStep('media')}
                 className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-lg"
               >
                 Back
               </button>
               <button 
                 onClick={handleSubmit}
                 disabled={isSubmitting}
                 className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
               >
                 {isSubmitting ? 'Publishing...' : 'Publish to Live Database'}
               </button>
             </div>
          </div>
        )}

        {/* Navigation Footer (for first 3 steps) */}
        {step !== 'review' && (
           <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50">
              <button 
                onClick={() => {
                   if(step === 'basic') setStep('specs');
                   else if(step === 'specs') setStep('media');
                   else if(step === 'media') setStep('review');
                }}
                className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Next Step
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
