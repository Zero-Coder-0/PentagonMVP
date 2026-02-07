'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ProjectV7 {
  id: string;
  name: string;
  developer: string;
  rera_id?: string;
  status: string;
  zone: string;
  region?: string;
  address_line?: string;
  lat?: number;
  lng?: number;
  price_display?: string;
  total_land_area?: string;
  total_units?: number;
  possession_date?: string;
  construction_technology?: string;
  open_space_percent?: number;
  structure_details?: string;
  hero_image_url?: string;
  brochure_url?: string;
  marketing_kit_url?: string;
  property_type?: string;
  floor_levels?: string;
  clubhouse_size?: string;
  builder_grade?: string;
  construction_type?: string;
  elevators_per_tower?: string;
  payment_plan?: string;
  floor_rise_charges?: string;
  car_parking_cost?: string;
  clubhouse_charges?: string;
  infrastructure_charges?: string;
  sinking_fund?: string;
  price_per_sqft?: string;
  facing_direction?: string;
  completion_duration?: string;
}

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
}

interface ProjectAmenity {
  id?: string;
  category?: string;
  name: string;
  size_specs?: string;
}

interface ProjectLandmark {
  id?: string;
  category?: string;
  name: string;
  distance_km?: number;
  travel_time_mins?: number;
}

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const [project, setProject] = useState<ProjectV7>({
    id: projectId,
    name: '',
    developer: '',
    status: 'Under Construction',
    zone: 'North'
  });

  const [units, setUnits] = useState<ProjectUnit[]>([]);
  const [amenities, setAmenities] = useState<ProjectAmenity[]>([]);
  const [landmarks, setLandmarks] = useState<ProjectLandmark[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    try {
      setLoading(true);

      // Load project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Load units
      const { data: unitsData } = await supabase
        .from('project_units')
        .select('*')
        .eq('project_id', projectId);
      setUnits(unitsData || []);

      // Load amenities
      const { data: amenitiesData } = await supabase
        .from('project_amenities')
        .select('*')
        .eq('project_id', projectId);
      setAmenities(amenitiesData || []);

      // Load landmarks
      const { data: landmarksData } = await supabase
        .from('project_landmarks')
        .select('*')
        .eq('project_id', projectId);
      setLandmarks(landmarksData || []);

    } catch (err: any) {
      alert('Error loading project: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProject() {
    if (!project.name || !project.developer) {
      alert('Please fill in Name and Developer');
      return;
    }

    try {
      setSaving(true);

      // Update project
      const { error: projectError } = await supabase
        .from('projects')
        .update(project)
        .eq('id', projectId);

      if (projectError) throw projectError;

      // Save units
      for (const unit of units) {
        if (unit.id) {
          // Update existing
          await supabase
            .from('project_units')
            .update(unit)
            .eq('id', unit.id);
        } else {
          // Insert new
          await supabase
            .from('project_units')
            .insert({ ...unit, project_id: projectId });
        }
      }

      // Save amenities
      for (const amenity of amenities) {
        if (amenity.id) {
          await supabase
            .from('project_amenities')
            .update(amenity)
            .eq('id', amenity.id);
        } else {
          await supabase
            .from('project_amenities')
            .insert({ ...amenity, project_id: projectId });
        }
      }

      // Save landmarks
      for (const landmark of landmarks) {
        if (landmark.id) {
          await supabase
            .from('project_landmarks')
            .update(landmark)
            .eq('id', landmark.id);
        } else {
          await supabase
            .from('project_landmarks')
            .insert({ ...landmark, project_id: projectId });
        }
      }

      alert('✅ Project saved successfully!');
      router.push('/admin/inventory');
    } catch (err: any) {
      alert('Error saving: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function addUnit() {
    setUnits([...units, {
      type: '2BHK',
      is_available: true,
      base_price: 0
    }]);
  }

  function removeUnit(index: number) {
    const unit = units[index];
    if (unit.id) {
      // Delete from database
      supabase.from('project_units').delete().eq('id', unit.id).then(() => {
        setUnits(units.filter((_, i) => i !== index));
      });
    } else {
      setUnits(units.filter((_, i) => i !== index));
    }
  }

  function addAmenity() {
    setAmenities([...amenities, { name: '', category: 'Sports' }]);
  }

  function removeAmenity(index: number) {
    const amenity = amenities[index];
    if (amenity.id) {
      supabase.from('project_amenities').delete().eq('id', amenity.id).then(() => {
        setAmenities(amenities.filter((_, i) => i !== index));
      });
    } else {
      setAmenities(amenities.filter((_, i) => i !== index));
    }
  }

  function addLandmark() {
    setLandmarks([...landmarks, { name: '', category: 'School' }]);
  }

  function removeLandmark(index: number) {
    const landmark = landmarks[index];
    if (landmark.id) {
      supabase.from('project_landmarks').delete().eq('id', landmark.id).then(() => {
        setLandmarks(landmarks.filter((_, i) => i !== index));
      });
    } else {
      setLandmarks(landmarks.filter((_, i) => i !== index));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin/inventory" className="text-blue-600 hover:underline mb-2 inline-block">
              ← Back to Inventory
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Edit Project</h1>
            <p className="text-slate-500">{project.name}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin/inventory')}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProject}
              disabled={saving}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                saving
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'basic', label: '📝 Basic Info', count: null },
                { id: 'units', label: '🏠 Units', count: units.length },
                { id: 'amenities', label: '🎾 Amenities', count: amenities.length },
                { id: 'landmarks', label: '📍 Landmarks', count: landmarks.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => setProject({ ...project, name: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Sobha Neopolis"
                    />
                  </div>

                  {/* Developer */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Developer *
                    </label>
                    <input
                      type="text"
                      value={project.developer}
                      onChange={(e) => setProject({ ...project, developer: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Sobha Ltd"
                    />
                  </div>

                  {/* RERA ID */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      RERA ID
                    </label>
                    <input
                      type="text"
                      value={project.rera_id || ''}
                      onChange={(e) => setProject({ ...project, rera_id: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="PRM/KA/RERA/..."
                    />
                  </div>

                  {/* Zone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Zone *
                    </label>
                    <select
                      value={project.zone}
                      onChange={(e) => setProject({ ...project, zone: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Region / Area
                    </label>
                    <input
                      type="text"
                      value={project.region || ''}
                      onChange={(e) => setProject({ ...project, region: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Panathur, Whitefield"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={project.status}
                      onChange={(e) => setProject({ ...project, status: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Pre-Launch">Pre-Launch</option>
                      <option value="Under Construction">Under Construction</option>
                      <option value="Ready">Ready</option>
                    </select>
                  </div>

                  {/* Price Display */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price Display
                    </label>
                    <input
                      type="text"
                      value={project.price_display || ''}
                      onChange={(e) => setProject({ ...project, price_display: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ₹1.2 Cr"
                    />
                  </div>

                  {/* Total Units */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Total Units
                    </label>
                    <input
                      type="number"
                      value={project.total_units || ''}
                      onChange={(e) => setProject({ ...project, total_units: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={project.total_land_area || ''}
                      onChange={(e) => setProject({ ...project, total_land_area: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 25 Acres"
                    />
                  </div>

                  {/* Open Space % */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Open Space %
                    </label>
                    <input
                      type="number"
                      value={project.open_space_percent || ''}
                      onChange={(e) => setProject({ ...project, open_space_percent: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 70"
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
                      value={project.structure_details || ''}
                      onChange={(e) => setProject({ ...project, structure_details: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 2B+G+18"
                    />
                  </div>

                  {/* Completion Duration */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Completion Duration
                    </label>
                    <input
                      type="text"
                      value={project.completion_duration || ''}
                      onChange={(e) => setProject({ ...project, completion_duration: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Q4 2027"
                    />
                  </div>

                  {/* Hero Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hero Image URL
                    </label>
                    <input
                      type="text"
                      value={project.hero_image_url || ''}
                      onChange={(e) => setProject({ ...project, hero_image_url: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Address
                    </label>
                    <textarea
                      value={project.address_line || ''}
                      onChange={(e) => setProject({ ...project, address_line: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Full address..."
                    />
                  </div>

                  {/* Latitude */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={project.lat || ''}
                      onChange={(e) => setProject({ ...project, lat: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="12.9716"
                    />
                  </div>

                  {/* Longitude */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={project.lng || ''}
                      onChange={(e) => setProject({ ...project, lng: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="77.5946"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UNITS TAB */}
            {activeTab === 'units' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Property Units</h3>
                  <button
                    onClick={addUnit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    + Add Unit
                  </button>
                </div>

                {units.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-500 mb-4">No units added yet</p>
                    <button
                      onClick={addUnit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      + Add First Unit
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {units.map((unit, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-slate-900">Unit #{index + 1}</h4>
                          <button
                            onClick={() => removeUnit(index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Type</label>
                            <input
                              type="text"
                              value={unit.type}
                              onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].type = e.target.value;
                                setUnits(newUnits);
                              }}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="2BHK"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">SBA (sqft)</label>
                            <input
                              type="number"
                              value={unit.sba_sqft || ''}
                              onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].sba_sqft = parseInt(e.target.value) || 0;
                                setUnits(newUnits);
                              }}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="1200"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Carpet (sqft)</label>
                            <input
                              type="number"
                              value={unit.carpet_sqft || ''}
                              onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].carpet_sqft = parseInt(e.target.value) || 0;
                                setUnits(newUnits);
                              }}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Base Price (₹)</label>
                            <input
                              type="number"
                              value={unit.base_price || ''}
                              onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].base_price = parseInt(e.target.value) || 0;
                                setUnits(newUnits);
                              }}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="12000000"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Facing</label>
                            <input
                              type="text"
                              value={unit.facing || ''}
                              onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].facing = e.target.value;
                                setUnits(newUnits);
                              }}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="East"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">WC Count</label>
                            <input
                              type="number"
                              value={unit.wc_count || ''}
                              onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].wc_count = parseInt(e.target.value) || 0;
                                setUnits(newUnits);
                              }}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="2"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Balconies</label>
                            <input
                              type="number"
                              value={unit.balcony_count || ''}
                              onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].balcony_count = parseInt(e.target.value) || 0;
                                setUnits(newUnits);
                              }}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              placeholder="2"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">Available</label>
                            <select
                              value={unit.is_available ? 'true' : 'false'}
                              onChange={(e) => {
                                const newUnits = [...units];
                                newUnits[index].is_available = e.target.value === 'true';
                                setUnits(newUnits);
                              }}
                              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* AMENITIES TAB */}
            {activeTab === 'amenities' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Amenities</h3>
                  <button
                    onClick={addAmenity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    + Add Amenity
                  </button>
                </div>

                {amenities.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-500 mb-4">No amenities added yet</p>
                    <button
                      onClick={addAmenity}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      + Add First Amenity
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Category</label>
                              <select
                                value={amenity.category || 'Sports'}
                                onChange={(e) => {
                                  const newAmenities = [...amenities];
                                  newAmenities[index].category = e.target.value;
                                  setAmenities(newAmenities);
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              >
                                <option value="Sports">Sports</option>
                                <option value="Leisure">Leisure</option>
                                <option value="Wellness">Wellness</option>
                                <option value="Kids">Kids</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Green">Green</option>
                                <option value="Security">Security</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Name</label>
                              <input
                                type="text"
                                value={amenity.name}
                                onChange={(e) => {
                                  const newAmenities = [...amenities];
                                  newAmenities[index].name = e.target.value;
                                  setAmenities(newAmenities);
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                                placeholder="Swimming Pool"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Size/Specs</label>
                              <input
                                type="text"
                                value={amenity.size_specs || ''}
                                onChange={(e) => {
                                  const newAmenities = [...amenities];
                                  newAmenities[index].size_specs = e.target.value;
                                  setAmenities(newAmenities);
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
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

            {/* LANDMARKS TAB */}
            {activeTab === 'landmarks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Nearby Landmarks</h3>
                  <button
                    onClick={addLandmark}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    + Add Landmark
                  </button>
                </div>

                {landmarks.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-500 mb-4">No landmarks added yet</p>
                    <button
                      onClick={addLandmark}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      + Add First Landmark
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {landmarks.map((landmark, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white">
                        <div className="flex gap-4 items-start">
                          <div className="flex-1 grid grid-cols-4 gap-3">
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Category</label>
                              <select
                                value={landmark.category || 'School'}
                                onChange={(e) => {
                                  const newLandmarks = [...landmarks];
                                  newLandmarks[index].category = e.target.value;
                                  setLandmarks(newLandmarks);
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                              >
                                <option value="School">School</option>
                                <option value="Hospital">Hospital</option>
                                <option value="Shopping">Shopping</option>
                                <option value="IT Park">IT Park</option>
                                <option value="Transport">Transport</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Name</label>
                              <input
                                type="text"
                                value={landmark.name}
                                onChange={(e) => {
                                  const newLandmarks = [...landmarks];
                                  newLandmarks[index].name = e.target.value;
                                  setLandmarks(newLandmarks);
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                                placeholder="DPS School"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Distance (km)</label>
                              <input
                                type="number"
                                step="0.1"
                                value={landmark.distance_km || ''}
                                onChange={(e) => {
                                  const newLandmarks = [...landmarks];
                                  newLandmarks[index].distance_km = parseFloat(e.target.value) || 0;
                                  setLandmarks(newLandmarks);
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                                placeholder="2.5"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-slate-600 mb-1">Time (mins)</label>
                              <input
                                type="number"
                                value={landmark.travel_time_mins || ''}
                                onChange={(e) => {
                                  const newLandmarks = [...landmarks];
                                  newLandmarks[index].travel_time_mins = parseInt(e.target.value) || 0;
                                  setLandmarks(newLandmarks);
                                }}
                                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
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
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <p className="text-slate-600">
              Make sure all required fields (*) are filled before saving
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/inventory')}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                disabled={saving}
                className={`px-8 py-3 rounded-lg font-medium transition ${
                  saving
                    ? 'bg-slate-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {saving ? '⏳ Saving All Changes...' : '💾 Save All Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
