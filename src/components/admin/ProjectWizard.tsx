'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const MapPickerWithSearch = dynamic(() => import('@/components/shared/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
      <p className="text-slate-500">Loading map...</p>
    </div>
  ),
});

// Interfaces
interface ProjectUnit {
  id?: string;
  type: string;
  facing?: string;
  sba_sqft?: number;
  carpet_sqft?: number;
  uds_sqft?: number;
  base_price?: number;
  flooring_type?: string;
  power_load_kw?: number;
  is_available: boolean;
  wc_count?: number;
  balcony_count?: number;
  tower?: string;
  floor_number?: number;
}

interface ProjectAmenity {
  id?: string;
  category: string;
  name: string;
  size_specs?: string;
  description?: string;
}

interface ProjectLandmark {
  id?: string;
  category: string;
  name: string;
  distance_km?: number;
  travel_time_mins?: number;
  description?: string;
}

interface CostExtra {
  id?: string;
  item_name: string;
  cost_amount?: number;
  cost_type?: string;
  description?: string;
}

interface ProjectData {
  // Basic Info
  name: string;
  developer: string;
  rera_id?: string;
  status: string;
  zone: string;
  region?: string;
  
  // Location
  address_line?: string;
  lat: number;
  lng: number;
  
  // Pricing
  price_display?: string;
  price_min?: number;
  price_max?: number;
  price_per_sqft?: string;
  
  // Project Details
  total_land_area?: string;
  total_units?: number;
  possession_date?: string;
  construction_technology?: string;
  open_space_percent?: number;
  structure_details?: string;
  hero_image_url?: string;
  brochure_url?: string;
  marketing_kit_url?: string;
  
  // Property Specifications
  property_type?: string;
  floor_levels?: string;
  clubhouse_size?: string;
  builder_grade?: string;
  construction_type?: string;
  elevators_per_tower?: string;
  
  // Financial Details
  payment_plan?: string;
  floor_rise_charges?: string;
  car_parking_cost?: string;
  clubhouse_charges?: string;
  infrastructure_charges?: string;
  sinking_fund?: string;
  
  // Additional
  facing_direction?: string;
  completion_duration?: string;
  configurations?: string[];
  
  // Arrays
  units?: ProjectUnit[];
  amenities?: ProjectAmenity[];
  landmarks?: ProjectLandmark[];
  cost_extras?: CostExtra[];
}

interface ProjectWizardV7Props {
  onSubmit: (data: ProjectData) => Promise<void>;
  submitButtonText?: string;
  submitButtonColor?: string;
  initialData?: Partial<ProjectData>;
  isAdmin?: boolean;
}

export default function ProjectWizardV7({
  onSubmit,
  submitButtonText = '✅ Submit',
  submitButtonColor = 'bg-green-600 hover:bg-green-700',
  initialData,
  isAdmin = false
}: ProjectWizardV7Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    developer: '',
    status: 'Under Construction',
    zone: 'North',
    lat: 12.9716,
    lng: 77.5946,
    units: [],
    amenities: [],
    landmarks: [],
    cost_extras: [],
    configurations: [],
    ...initialData
  });

  const steps = [
    { num: 1, label: 'Basic Info', icon: '📝' },
    { num: 2, label: 'Location', icon: '📍' },
    { num: 3, label: 'Units', icon: '🏠' },
    { num: 4, label: 'Pricing', icon: '💰' },
    { num: 5, label: 'Amenities', icon: '🎾' },
    { num: 6, label: 'Landmarks', icon: '🗺️' },
    { num: 7, label: 'Details', icon: '📊' },
    { num: 8, label: 'Review', icon: '👀' }
  ];

  // Unit Management
  const addUnit = () => {
    setProjectData({
      ...projectData,
      units: [...(projectData.units || []), {
        type: '2BHK',
        is_available: true,
        base_price: 0
      }]
    });
  };

  const updateUnit = (index: number, field: string, value: any) => {
    const newUnits = [...(projectData.units || [])];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setProjectData({ ...projectData, units: newUnits });
  };

  const removeUnit = (index: number) => {
    const newUnits = (projectData.units || []).filter((_, i) => i !== index);
    setProjectData({ ...projectData, units: newUnits });
  };

  // Amenity Management
  const addAmenity = () => {
    setProjectData({
      ...projectData,
      amenities: [...(projectData.amenities || []), {
        category: 'Sports',
        name: ''
      }]
    });
  };

  const updateAmenity = (index: number, field: string, value: any) => {
    const newAmenities = [...(projectData.amenities || [])];
    newAmenities[index] = { ...newAmenities[index], [field]: value };
    setProjectData({ ...projectData, amenities: newAmenities });
  };

  const removeAmenity = (index: number) => {
    const newAmenities = (projectData.amenities || []).filter((_, i) => i !== index);
    setProjectData({ ...projectData, amenities: newAmenities });
  };

  // Landmark Management
  const addLandmark = () => {
    setProjectData({
      ...projectData,
      landmarks: [...(projectData.landmarks || []), {
        category: 'School',
        name: ''
      }]
    });
  };

  const updateLandmark = (index: number, field: string, value: any) => {
    const newLandmarks = [...(projectData.landmarks || [])];
    newLandmarks[index] = { ...newLandmarks[index], [field]: value };
    setProjectData({ ...projectData, landmarks: newLandmarks });
  };

  const removeLandmark = (index: number) => {
    const newLandmarks = (projectData.landmarks || []).filter((_, i) => i !== index);
    setProjectData({ ...projectData, landmarks: newLandmarks });
  };

  // Cost Extra Management
  const addCostExtra = () => {
    setProjectData({
      ...projectData,
      cost_extras: [...(projectData.cost_extras || []), {
        item_name: '',
        cost_type: 'Fixed'
      }]
    });
  };

  const updateCostExtra = (index: number, field: string, value: any) => {
    const newCostExtras = [...(projectData.cost_extras || [])];
    newCostExtras[index] = { ...newCostExtras[index], [field]: value };
    setProjectData({ ...projectData, cost_extras: newCostExtras });
  };

  const removeCostExtra = (index: number) => {
    const newCostExtras = (projectData.cost_extras || []).filter((_, i) => i !== index);
    setProjectData({ ...projectData, cost_extras: newCostExtras });
  };

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setProjectData({
      ...projectData,
      lat,
      lng,
      address_line: address || projectData.address_line
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!projectData.name || !projectData.developer) {
      alert('❌ Please fill in Project Name and Developer');
      return;
    }

    if (!projectData.lat || !projectData.lng) {
      alert('❌ Please set location on the map');
      return;
    }

    if (!projectData.units || projectData.units.length === 0) {
      const addUnits = confirm('⚠️ No units added. Continue without units?');
      if (!addUnits) return;
    }

    setSubmitting(true);
    try {
      await onSubmit(projectData);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <button
                onClick={() => setCurrentStep(step.num)}
                className={`flex flex-col items-center ${
                  currentStep >= step.num ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition ${
                    currentStep >= step.num
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step.icon}
                </div>
                <p className={`text-xs mt-2 font-medium ${
                  currentStep >= step.num ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.label}
                </p>
              </button>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 ${
                  currentStep > step.num ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-sm p-8">
        {/* STEP 1: BASIC INFO */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📝 Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Name * <span className="text-red-500">Required</span>
                </label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                  placeholder="e.g., Prestige Lakeside Habitat"
                />
              </div>

              {/* Developer */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Developer / Builder * <span className="text-red-500">Required</span>
                </label>
                <input
                  type="text"
                  value={projectData.developer}
                  onChange={(e) => setProjectData({ ...projectData, developer: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Prestige Group"
                />
              </div>

              {/* RERA ID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  RERA Registration Number
                </label>
                <input
                  type="text"
                  value={projectData.rera_id || ''}
                  onChange={(e) => setProjectData({ ...projectData, rera_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="PRM/KA/RERA/1234/5678/PROJ/0123456"
                />
              </div>

              {/* Zone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Zone / Direction *
                </label>
                <select
                  value={projectData.zone}
                  onChange={(e) => setProjectData({ ...projectData, zone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="North">🧭 North Bangalore</option>
                  <option value="South">🌏 South Bangalore</option>
                  <option value="East">🌅 East Bangalore</option>
                  <option value="West">🌇 West Bangalore</option>
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Area / Region
                </label>
                <input
                  type="text"
                  value={projectData.region || ''}
                  onChange={(e) => setProjectData({ ...projectData, region: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Whitefield, Hebbal, Koramangala"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project Status *
                </label>
                <select
                  value={projectData.status}
                  onChange={(e) => setProjectData({ ...projectData, status: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pre-Launch">🚀 Pre-Launch</option>
                  <option value="Under Construction">🚧 Under Construction</option>
                  <option value="Ready">✅ Ready to Move</option>
                </select>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Property Type
                </label>
                <select
                  value={projectData.property_type || ''}
                  onChange={(e) => setProjectData({ ...projectData, property_type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="Apartments">🏢 Apartments</option>
                  <option value="Villas">🏡 Villas</option>
                  <option value="Plots">📐 Plots</option>
                  <option value="Row Houses">🏘️ Row Houses</option>
                  <option value="Penthouse">🏙️ Penthouse</option>
                </select>
              </div>

              {/* Builder Grade */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Builder Grade
                </label>
                <select
                  value={projectData.builder_grade || ''}
                  onChange={(e) => setProjectData({ ...projectData, builder_grade: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Grade</option>
                  <option value="Luxury">⭐ Luxury</option>
                  <option value="Premium">💎 Premium</option>
                  <option value="Mid-Segment">🏠 Mid-Segment</option>
                  <option value="Affordable">💰 Affordable</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: LOCATION */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📍 Location Details</h2>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Address
              </label>
              <textarea
                value={projectData.address_line || ''}
                onChange={(e) => setProjectData({ ...projectData, address_line: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter complete address with landmarks..."
              />
            </div>

            {/* Map Picker */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Set Property Location on Map * <span className="text-red-500">Required</span>
              </label>
              <MapPickerWithSearch
                lat={projectData.lat}
                lng={projectData.lng}
                onLocationChange={handleLocationChange}
              />
            </div>
          </div>
        )}

        {/* STEP 3: UNITS */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">🏠 Property Units</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Add all unit types available in this project (2BHK, 3BHK, etc.)
                </p>
              </div>
              <button
                onClick={addUnit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Add Unit Type
              </button>
            </div>

            {(!projectData.units || projectData.units.length === 0) ? (
              <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No units added yet</h3>
                <p className="text-slate-500 mb-6">Add unit types like 2BHK, 3BHK, Penthouse, etc.</p>
                <button
                  onClick={addUnit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  + Add First Unit
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projectData.units.map((unit, index) => (
                  <div key={index} className="border-2 border-slate-200 rounded-lg p-6 bg-slate-50">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-lg text-slate-900">Unit #{index + 1}</h4>
                      <button
                        onClick={() => removeUnit(index)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        🗑️ Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Unit Type *</label>
                        <input
                          type="text"
                          value={unit.type}
                          onChange={(e) => updateUnit(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="e.g., 2BHK, 3BHK, 4BHK"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Tower</label>
                        <input
                          type="text"
                          value={unit.tower || ''}
                          onChange={(e) => updateUnit(index, 'tower', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="e.g., Tower A"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Floor Number</label>
                        <input
                          type="number"
                          value={unit.floor_number || ''}
                          onChange={(e) => updateUnit(index, 'floor_number', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="e.g., 5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">SBA (Super Built-up) sqft</label>
                        <input
                          type="number"
                          value={unit.sba_sqft || ''}
                          onChange={(e) => updateUnit(index, 'sba_sqft', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="1200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Carpet Area sqft</label>
                        <input
                          type="number"
                          value={unit.carpet_sqft || ''}
                          onChange={(e) => updateUnit(index, 'carpet_sqft', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">UDS (Undivided Share) sqft</label>
                        <input
                          type="number"
                          value={unit.uds_sqft || ''}
                          onChange={(e) => updateUnit(index, 'uds_sqft', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Base Price (₹)</label>
                        <input
                          type="number"
                          value={unit.base_price || ''}
                          onChange={(e) => updateUnit(index, 'base_price', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="12000000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Facing</label>
                        <select
                          value={unit.facing || ''}
                          onChange={(e) => updateUnit(index, 'facing', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="">Select Facing</option>
                          <option value="East">East</option>
                          <option value="West">West</option>
                          <option value="North">North</option>
                          <option value="South">South</option>
                          <option value="North-East">North-East</option>
                          <option value="North-West">North-West</option>
                          <option value="South-East">South-East</option>
                          <option value="South-West">South-West</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Flooring Type</label>
                        <input
                          type="text"
                          value={unit.flooring_type || ''}
                          onChange={(e) => updateUnit(index, 'flooring_type', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="e.g., Vitrified tiles"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">WC Count</label>
                        <input
                          type="number"
                          value={unit.wc_count || ''}
                          onChange={(e) => updateUnit(index, 'wc_count', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Balcony Count</label>
                        <input
                          type="number"
                          value={unit.balcony_count || ''}
                          onChange={(e) => updateUnit(index, 'balcony_count', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Power Load (KW)</label>
                        <input
                          type="number"
                          value={unit.power_load_kw || ''}
                          onChange={(e) => updateUnit(index, 'power_load_kw', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Availability</label>
                        <select
                          value={unit.is_available ? 'true' : 'false'}
                          onChange={(e) => updateUnit(index, 'is_available', e.target.value === 'true')}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                        >
                          <option value="true">✅ Available</option>
                          <option value="false">❌ Sold Out</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: PRICING & COSTS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">💰 Pricing & Cost Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price Display */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price Display Text
                </label>
                <input
                  type="text"
                  value={projectData.price_display || ''}
                  onChange={(e) => setProjectData({ ...projectData, price_display: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ₹1.2 Cr onwards"
                />
              </div>

              {/* Price per sqft */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price per Sq.Ft
                </label>
                <input
                  type="text"
                  value={projectData.price_per_sqft || ''}
                  onChange={(e) => setProjectData({ ...projectData, price_per_sqft: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., ₹6,500/sqft"
                />
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Minimum Price (₹)
                </label>
                <input
                  type="number"
                  value={projectData.price_min || ''}
                  onChange={(e) => setProjectData({ ...projectData, price_min: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="10000000"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum Price (₹)
                </label>
                <input
                  type="number"
                  value={projectData.price_max || ''}
                  onChange={(e) => setProjectData({ ...projectData, price_max: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25000000"
                />
              </div>

              {/* Payment Plan */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Payment Plan
                </label>
                <input
                  type="text"
                  value={projectData.payment_plan || ''}
                  onChange={(e) => setProjectData({ ...projectData, payment_plan: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10-20-70, Construction Linked"
                />
              </div>
            </div>

            {/* Additional Costs Section */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">Additional Costs & Charges</h3>
                <button
                  onClick={addCostExtra}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                >
                  + Add Cost Item
                </button>
              </div>

              {/* Quick Cost Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Floor Rise Charges</label>
                  <input
                    type="text"
                    value={projectData.floor_rise_charges || ''}
                    onChange={(e) => setProjectData({ ...projectData, floor_rise_charges: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="e.g., ₹50/sqft/floor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Car Parking Cost</label>
                  <input
                    type="text"
                    value={projectData.car_parking_cost || ''}
                    onChange={(e) => setProjectData({ ...projectData, car_parking_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="e.g., ₹3 Lakhs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Clubhouse Charges</label>
                  <input
                    type="text"
                    value={projectData.clubhouse_charges || ''}
                    onChange={(e) => setProjectData({ ...projectData, clubhouse_charges: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="e.g., ₹2 Lakhs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Infrastructure Charges</label>
                  <input
                    type="text"
                    value={projectData.infrastructure_charges || ''}
                    onChange={(e) => setProjectData({ ...projectData, infrastructure_charges: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="e.g., ₹1.5 Lakhs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Sinking Fund</label>
                  <input
                    type="text"
                    value={projectData.sinking_fund || ''}
                    onChange={(e) => setProjectData({ ...projectData, sinking_fund: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    placeholder="e.g., ₹50,000"
                  />
                </div>
              </div>

              {/* Dynamic Cost Extras */}
              {projectData.cost_extras && projectData.cost_extras.length > 0 && (
                <div className="space-y-3">
                  {projectData.cost_extras.map((cost, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                      <div className="flex gap-4 items-start">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Item Name</label>
                            <input
                              type="text"
                              value={cost.item_name}
                              onChange={(e) => updateCostExtra(index, 'item_name', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="e.g., Maintenance Deposit"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Amount (₹)</label>
                            <input
                              type="number"
                              value={cost.cost_amount || ''}
                              onChange={(e) => updateCostExtra(index, 'cost_amount', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="100000"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Type</label>
                            <select
                              value={cost.cost_type || 'Fixed'}
                              onChange={(e) => updateCostExtra(index, 'cost_type', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                            >
                              <option value="Fixed">Fixed</option>
                              <option value="Per SqFt">Per SqFt</option>
                              <option value="Percentage">Percentage</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCostExtra(index)}
                          className="text-red-600 hover:text-red-800 text-sm mt-5"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: AMENITIES */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">🎾 Amenities & Facilities</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Add all amenities available in the project
                </p>
              </div>
              <button
                onClick={addAmenity}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Add Amenity
              </button>
            </div>

            {(!projectData.amenities || projectData.amenities.length === 0) ? (
              <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <div className="text-6xl mb-4">🎾</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No amenities added yet</h3>
                <p className="text-slate-500 mb-6">Add amenities like swimming pool, gym, clubhouse, etc.</p>
                <button
                  onClick={addAmenity}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  + Add First Amenity
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projectData.amenities.map((amenity, index) => (
                  <div key={index} className="border-2 border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                          <select
                            value={amenity.category}
                            onChange={(e) => updateAmenity(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          >
                            <option value="Sports">🏀 Sports</option>
                            <option value="Leisure">🎮 Leisure</option>
                            <option value="Wellness">🧘 Wellness</option>
                            <option value="Kids">👶 Kids</option>
                            <option value="Utilities">🔧 Utilities</option>
                            <option value="Green">🌳 Green Spaces</option>
                            <option value="Security">🔒 Security</option>
                            <option value="Social">👥 Social</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                          <input
                            type="text"
                            value={amenity.name}
                            onChange={(e) => updateAmenity(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="Swimming Pool"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Size/Specs</label>
                          <input
                            type="text"
                            value={amenity.size_specs || ''}
                            onChange={(e) => updateAmenity(index, 'size_specs', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="50m x 25m"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeAmenity(index)}
                        className="text-red-600 hover:text-red-800 text-sm mt-5"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 6: LANDMARKS */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">🗺️ Nearby Landmarks</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Add nearby schools, hospitals, malls, IT parks, etc.
                </p>
              </div>
              <button
                onClick={addLandmark}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                + Add Landmark
              </button>
            </div>

            {(!projectData.landmarks || projectData.landmarks.length === 0) ? (
              <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No landmarks added yet</h3>
                <p className="text-slate-500 mb-6">Add nearby locations that matter to buyers</p>
                <button
                  onClick={addLandmark}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  + Add First Landmark
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {projectData.landmarks.map((landmark, index) => (
                  <div key={index} className="border-2 border-slate-200 rounded-lg p-4 bg-white">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                          <select
                            value={landmark.category}
                            onChange={(e) => updateLandmark(index, 'category', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                          >
                            <option value="School">🏫 School</option>
                            <option value="Hospital">🏥 Hospital</option>
                            <option value="Shopping">🛒 Shopping</option>
                            <option value="IT Park">💼 IT Park</option>
                            <option value="Transport">🚇 Transport</option>
                            <option value="Entertainment">🎭 Entertainment</option>
                            <option value="Restaurant">🍽️ Restaurant</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                          <input
                            type="text"
                            value={landmark.name}
                            onChange={(e) => updateLandmark(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="DPS School"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Distance (km)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={landmark.distance_km || ''}
                            onChange={(e) => updateLandmark(index, 'distance_km', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="2.5"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Time (mins)</label>
                          <input
                            type="number"
                            value={landmark.travel_time_mins || ''}
                            onChange={(e) => updateLandmark(index, 'travel_time_mins', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                            placeholder="10"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeLandmark(index)}
                        className="text-red-600 hover:text-red-800 text-sm mt-5"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 7: ADDITIONAL DETAILS */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">📊 Additional Project Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Units */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Units
                </label>
                <input
                  type="number"
                  value={projectData.total_units || ''}
                  onChange={(e) => setProjectData({ ...projectData, total_units: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 500"
                />
              </div>

              {/* Land Area */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Land Area
                </label>
                <input
                  type="text"
                  value={projectData.total_land_area || ''}
                  onChange={(e) => setProjectData({ ...projectData, total_land_area: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 25 Acres"
                />
              </div>

              {/* Open Space % */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Open Space Percentage
                </label>
                <input
                  type="number"
                  value={projectData.open_space_percent || ''}
                  onChange={(e) => setProjectData({ ...projectData, open_space_percent: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 70%"
                  min="0"
                  max="100"
                />
              </div>

              {/* Structure Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Structure Details
                </label>
                <input
                  type="text"
                  value={projectData.structure_details || ''}
                  onChange={(e) => setProjectData({ ...projectData, structure_details: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2B+G+18 Floors"
                />
              </div>

              {/* Floor Levels */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Floor Levels
                </label>
                <input
                  type="text"
                  value={projectData.floor_levels || ''}
                  onChange={(e) => setProjectData({ ...projectData, floor_levels: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., G+18"
                />
              </div>

              {/* Clubhouse Size */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Clubhouse Size
                </label>
                <input
                  type="text"
                  value={projectData.clubhouse_size || ''}
                  onChange={(e) => setProjectData({ ...projectData, clubhouse_size: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 25,000 sq.ft"
                />
              </div>

              {/* Elevators per Tower */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Elevators per Tower
                </label>
                <input
                  type="text"
                  value={projectData.elevators_per_tower || ''}
                  onChange={(e) => setProjectData({ ...projectData, elevators_per_tower: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 4 (2 Service + 2 Passenger)"
                />
              </div>

              {/* Facing Direction */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Main Facing Direction
                </label>
                <input
                  type="text"
                  value={projectData.facing_direction || ''}
                  onChange={(e) => setProjectData({ ...projectData, facing_direction: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., East, North-East"
                />
              </div>

              {/* Possession Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Possession Date
                </label>
                <input
                  type="text"
                  value={projectData.possession_date || ''}
                  onChange={(e) => setProjectData({ ...projectData, possession_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Dec 2027"
                />
              </div>

              {/* Completion Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expected Completion
                </label>
                <input
                  type="text"
                  value={projectData.completion_duration || ''}
                  onChange={(e) => setProjectData({ ...projectData, completion_duration: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Q4 2027"
                />
              </div>

              {/* Construction Technology */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Construction Technology
                </label>
                <input
                  type="text"
                  value={projectData.construction_technology || ''}
                  onChange={(e) => setProjectData({ ...projectData, construction_technology: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., RCC Framed Structure, Mivan Technology"
                />
              </div>

              {/* Construction Type */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Construction Type Details
                </label>
                <input
                  type="text"
                  value={projectData.construction_type || ''}
                  onChange={(e) => setProjectData({ ...projectData, construction_type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Aluminum Formwork, Shear Wall Technology"
                />
              </div>

              {/* Hero Image URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hero Image URL
                </label>
                <input
                  type="text"
                  value={projectData.hero_image_url || ''}
                  onChange={(e) => setProjectData({ ...projectData, hero_image_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              {/* Brochure URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Brochure URL
                </label>
                <input
                  type="text"
                  value={projectData.brochure_url || ''}
                  onChange={(e) => setProjectData({ ...projectData, brochure_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              {/* Marketing Kit URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Marketing Kit URL
                </label>
                <input
                  type="text"
                  value={projectData.marketing_kit_url || ''}
                  onChange={(e) => setProjectData({ ...projectData, marketing_kit_url: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: REVIEW & SUBMIT */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">👀 Review & Submit</h2>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-blue-900 mb-2">📋 Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 font-medium">Project Name</p>
                  <p className="text-blue-900 font-bold">{projectData.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Developer</p>
                  <p className="text-blue-900 font-bold">{projectData.developer || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Zone</p>
                  <p className="text-blue-900 font-bold">{projectData.zone}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Status</p>
                  <p className="text-blue-900 font-bold">{projectData.status}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Units Added</p>
                  <p className="text-blue-900 font-bold">{projectData.units?.length || 0}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Amenities</p>
                  <p className="text-blue-900 font-bold">{projectData.amenities?.length || 0}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Landmarks</p>
                  <p className="text-blue-900 font-bold">{projectData.landmarks?.length || 0}</p>
                </div>
                <div>
                  <p className="text-blue-700 font-medium">Location</p>
                  <p className="text-blue-900 font-bold">
                    {projectData.lat && projectData.lng ? '✅ Set' : '❌ Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Review */}
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h4 className="font-bold text-slate-900 mb-3">📝 Basic Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p><strong>Name:</strong> {projectData.name}</p>
                  <p><strong>Developer:</strong> {projectData.developer}</p>
                  <p><strong>RERA:</strong> {projectData.rera_id || 'N/A'}</p>
                  <p><strong>Region:</strong> {projectData.region || 'N/A'}</p>
                  <p><strong>Property Type:</strong> {projectData.property_type || 'N/A'}</p>
                  <p><strong>Builder Grade:</strong> {projectData.builder_grade || 'N/A'}</p>
                </div>
              </div>

              {/* Units */}
              {projectData.units && projectData.units.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-3">🏠 Units ({projectData.units.length})</h4>
                  <div className="space-y-2">
                    {projectData.units.map((unit, idx) => (
                      <p key={idx} className="text-sm">
                        <strong>{unit.type}</strong> - SBA: {unit.sba_sqft}sqft, 
                        Price: ₹{unit.base_price?.toLocaleString()}, 
                        Facing: {unit.facing || 'N/A'}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {projectData.amenities && projectData.amenities.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-3">🎾 Amenities ({projectData.amenities.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {projectData.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {amenity.name} ({amenity.category})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Landmarks */}
              {projectData.landmarks && projectData.landmarks.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <h4 className="font-bold text-slate-900 mb-3">🗺️ Landmarks ({projectData.landmarks.length})</h4>
                  <div className="space-y-2">
                    {projectData.landmarks.map((landmark, idx) => (
                      <p key={idx} className="text-sm">
                        <strong>{landmark.name}</strong> ({landmark.category}) - 
                        {landmark.distance_km}km, {landmark.travel_time_mins} mins
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Warnings */}
            <div className="space-y-3">
              {!projectData.name && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  ⚠️ <strong>Warning:</strong> Project Name is required
                </div>
              )}
              {!projectData.developer && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  ⚠️ <strong>Warning:</strong> Developer is required
                </div>
              )}
              {(!projectData.lat || !projectData.lng) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  ⚠️ <strong>Warning:</strong> Location is not set
                </div>
              )}
              {(!projectData.units || projectData.units.length === 0) && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                  ⚠️ <strong>Note:</strong> No units added. Consider adding unit details.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 border-t-2 border-slate-200 mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              currentStep === 1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-slate-600 text-white hover:bg-slate-700'
            }`}
          >
            ← Previous
          </button>

          <div className="text-center">
            <p className="text-sm text-slate-500">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-8 py-3 rounded-lg font-medium transition ${
                submitting
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : `${submitButtonColor} text-white`
              }`}
            >
              {submitting ? '⏳ Submitting...' : submitButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
