'use client'

import React, { useState, use } from 'react' // Import use
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { createClient } from '@/core/db/client'
import NearbyInfraForm from '@/components/vendor/NearbyInfraForm'
import { Save, CheckCircle2 } from 'lucide-react'

// Load map dynamically to avoid SSR issues
const LocationPicker = dynamic(() => import('@/components/vendor/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-slate-100 animate-pulse rounded">Loading Maps...</div>
})

const AMENITIES_LIST = [
  "Swimming Pool", "Gym", "Clubhouse", "Kids Play Area", 
  "Tennis Court", "Cricket Pitch", "Jogging Track", "Party Hall", 
  "24/7 Security", "Power Backup", "CCTV", "Amphitheatre"
];

// --- 1. Property Form Component (Extracted Logic) ---
function PropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    developer: '',
    price_display: '',
    price_value: 0,
    configurations: '', 
    completion_duration: '', 
    lat: 12.9716,
    lng: 77.5946,
    zone: 'North', 
    contact_person: '',
    contact_phone: '',
    
    // Complex Fields
    amenities: [] as string[],
    nearby_locations: {
      transport: [],
      education: [],
      food: [],
      health: []
    }
  });

  const handleLocationChange = (lat: number, lng: number, zone: string) => {
    setFormData(prev => ({ ...prev, lat, lng, zone }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists 
          ? prev.amenities.filter(a => a !== amenity)
          : [...prev.amenities, amenity]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    
    const { error } = await supabase.from('property_drafts').insert({
      submission_data: formData,
      status: 'pending'
    });

    if (error) {
      alert('Error submitting property: ' + error.message);
      setLoading(false);
    } else {
      // Navigate to success state
      router.push('?success=true');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* Basic Info */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Basic Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <input 
            required placeholder="Property Name *" 
            className="p-3 border rounded"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
          <input 
            required placeholder="Developer Name *" 
            className="p-3 border rounded"
            value={formData.developer}
            onChange={e => setFormData({...formData, developer: e.target.value})}
          />
          <input 
            required placeholder="Price Display (e.g. 1.5 Cr) *" 
            className="p-3 border rounded"
            value={formData.price_display}
            onChange={e => setFormData({...formData, price_display: e.target.value})}
          />
           <input 
            required type="number" placeholder="Numeric Price (for sorting)" 
            className="p-3 border rounded"
            value={formData.price_value || ''}
            onChange={e => setFormData({...formData, price_value: Number(e.target.value)})}
          />
          <input 
            placeholder="Configurations (e.g. 2BHK, 3BHK)" 
            className="p-3 border rounded"
            value={formData.configurations}
            onChange={e => setFormData({...formData, configurations: e.target.value})}
          />
           <input 
            placeholder="Completion Date (e.g. Q4 2026)" 
            className="p-3 border rounded"
            value={formData.completion_duration}
            onChange={e => setFormData({...formData, completion_duration: e.target.value})}
          />
        </div>
      </section>

      {/* Location & Zone */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-bold">Location</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gray-100`}>
            Detected Zone: <span className="text-blue-600">{formData.zone}</span>
          </span>
        </div>
        
        <LocationPicker onLocationChange={handleLocationChange} />
        
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 bg-slate-50 p-3 rounded">
          <p>Latitude: {formData.lat.toFixed(4)}</p>
          <p>Longitude: {formData.lng.toFixed(4)}</p>
        </div>
      </section>

      {/* Amenities */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Property Amenities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITIES_LIST.map(amenity => (
            <label key={amenity} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
              <input 
                type="checkbox" 
                checked={formData.amenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-slate-700">{amenity}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Nearby Infra */}
      <NearbyInfraForm 
        value={formData.nearby_locations}
        onChange={(val) => setFormData({...formData, nearby_locations: val})}
      />

      {/* Contact Info */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold border-b pb-2">Contact Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <input 
            placeholder="Contact Person Name" 
            className="p-3 border rounded"
            value={formData.contact_person}
            onChange={e => setFormData({...formData, contact_person: e.target.value})}
          />
          <input 
            placeholder="Phone Number" 
            className="p-3 border rounded"
            value={formData.contact_phone}
            onChange={e => setFormData({...formData, contact_phone: e.target.value})}
          />
        </div>
      </section>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors flex justify-center items-center gap-2"
      >
        <Save />
        {loading ? 'Submitting...' : 'Submit Property for Review'}
      </button>

    </form>
  )
}

// --- 2. Main Page Wrapper ---
// Note the type change: searchParams is now a Promise<...>
export default function VendorPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ success?: string }> 
}) {
  // Unwrap the promise using React.use()
  const params = use(searchParams);
  const isSuccess = params.success === 'true';
  const router = useRouter(); 

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Submission Received!</h2>
          <p className="text-slate-500">
            Your property draft has been sent to the Tenant Admin. You will be notified once it is approved and live.
          </p>
          <button 
            onClick={() => router.push('?')} 
            className="block w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Vendor Submission Portal</h1>
        <p className="text-slate-600 mt-2">Submit your property details. Admins will review before publishing.</p>
      </div>
      <div className="max-w-3xl mx-auto">
        <PropertyForm />
      </div>
    </div>
  );
}
