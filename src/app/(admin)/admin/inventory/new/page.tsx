'use client';

import React from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectWizardV7 from '@/components/admin/ProjectWizard';

export default function AdminNewPropertyPage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleAdminSubmit(projectData: any) {
    try {
      // Step 1: Insert main project data
      const { data: newProject, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          developer: projectData.developer,
          rera_id: projectData.rera_id,
          status: projectData.status,
          zone: projectData.zone,
          region: projectData.region,
          address_line: projectData.address_line,
          lat: projectData.lat,
          lng: projectData.lng,
          price_display: projectData.price_display,
          price_min: projectData.price_min,
          price_max: projectData.price_max,
          total_land_area: projectData.total_land_area,
          total_units: projectData.total_units,
          possession_date: projectData.possession_date,
          construction_technology: projectData.construction_technology,
          open_space_percent: projectData.open_space_percent,
          structure_details: projectData.structure_details,
          hero_image_url: projectData.hero_image_url,
          brochure_url: projectData.brochure_url,
          marketing_kit_url: projectData.marketing_kit_url,
          property_type: projectData.property_type,
          floor_levels: projectData.floor_levels,
          clubhouse_size: projectData.clubhouse_size,
          builder_grade: projectData.builder_grade,
          construction_type: projectData.construction_type,
          elevators_per_tower: projectData.elevators_per_tower,
          payment_plan: projectData.payment_plan,
          price_per_sqft: projectData.price_per_sqft,
          facing_direction: projectData.facing_direction,
          completion_duration: projectData.completion_duration,
          floor_rise_charges: projectData.floor_rise_charges,
          car_parking_cost: projectData.car_parking_cost,
          clubhouse_charges: projectData.clubhouse_charges,
          infrastructure_charges: projectData.infrastructure_charges,
          sinking_fund: projectData.sinking_fund
        })
        .select()
        .single();

      if (projectError) throw projectError;

      const projectId = newProject.id;

      // Step 2: Insert Units
      if (projectData.units && projectData.units.length > 0) {
        const unitsToInsert = projectData.units.map((unit: any) => ({
          project_id: projectId,
          type: unit.type,
          facing: unit.facing,
          sba_sqft: unit.sba_sqft,
          carpet_sqft: unit.carpet_sqft,
          uds_sqft: unit.uds_sqft,
          base_price: unit.base_price,
          flooring_type: unit.flooring_type,
          power_load_kw: unit.power_load_kw,
          is_available: unit.is_available,
          wc_count: unit.wc_count,
          balcony_count: unit.balcony_count,
          tower: unit.tower,
          floor_number: unit.floor_number
        }));

        const { error: unitsError } = await supabase
          .from('project_units')
          .insert(unitsToInsert);

        if (unitsError) {
          console.error('Error inserting units:', unitsError);
          // Don't throw, just log
        }
      }

      // Step 3: Insert Amenities
      if (projectData.amenities && projectData.amenities.length > 0) {
        const amenitiesToInsert = projectData.amenities.map((amenity: any) => ({
          project_id: projectId,
          category: amenity.category,
          name: amenity.name,
          size_specs: amenity.size_specs,
          description: amenity.description
        }));

        const { error: amenitiesError } = await supabase
          .from('project_amenities')
          .insert(amenitiesToInsert);

        if (amenitiesError) {
          console.error('Error inserting amenities:', amenitiesError);
        }
      }

      // Step 4: Insert Landmarks
      if (projectData.landmarks && projectData.landmarks.length > 0) {
        const landmarksToInsert = projectData.landmarks.map((landmark: any) => ({
          project_id: projectId,
          category: landmark.category,
          name: landmark.name,
          distance_km: landmark.distance_km,
          travel_time_mins: landmark.travel_time_mins,
          description: landmark.description
        }));

        const { error: landmarksError } = await supabase
          .from('project_landmarks')
          .insert(landmarksToInsert);

        if (landmarksError) {
          console.error('Error inserting landmarks:', landmarksError);
        }
      }

      // Step 5: Insert Cost Extras
      if (projectData.cost_extras && projectData.cost_extras.length > 0) {
        const costExtrasToInsert = projectData.cost_extras.map((cost: any) => ({
          project_id: projectId,
          item_name: cost.item_name,
          cost_amount: cost.cost_amount,
          cost_type: cost.cost_type,
          description: cost.description
        }));

        const { error: costExtrasError } = await supabase
          .from('project_cost_extras')
          .insert(costExtrasToInsert);

        if (costExtrasError) {
          console.error('Error inserting cost extras:', costExtrasError);
        }
      }

      alert(
        `✅ PROJECT PUBLISHED SUCCESSFULLY!\n\n` +
        `📋 Project Details:\n` +
        `• Name: ${projectData.name}\n` +
        `• Developer: ${projectData.developer}\n` +
        `• Project ID: ${projectId}\n\n` +
        `📊 Data Inserted:\n` +
        `• Units: ${projectData.units?.length || 0}\n` +
        `• Amenities: ${projectData.amenities?.length || 0}\n` +
        `• Landmarks: ${projectData.landmarks?.length || 0}\n` +
        `• Cost Items: ${projectData.cost_extras?.length || 0}\n\n` +
        `The project is now LIVE and visible to all users!`
      );

      router.push('/admin/inventory');
    } catch (err: any) {
      alert('❌ Error publishing project: ' + err.message);
      console.error('Publish error:', err);
      throw err;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/inventory" className="text-blue-600 hover:underline mb-2 inline-block text-sm">
            ← Back to Inventory
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Add New Property</h1>
          <p className="text-lg text-slate-600 mt-2">
            Admin Upload - Published directly to live database without approval
          </p>
        </div>

        {/* Admin Privilege Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">👑</div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900 text-lg mb-2">Admin Privileges</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✅ Your submission will be published <strong>IMMEDIATELY</strong></li>
                <li>✅ No approval workflow needed</li>
                <li>✅ Project will be instantly visible to all users</li>
                <li>✅ You can edit or delete anytime from inventory</li>
              </ul>
              <p className="text-green-700 font-medium mt-3">
                💡 Fill in all details carefully - this goes live instantly!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-2xl font-bold text-slate-900">8 Steps</p>
            <p className="text-sm text-slate-500">Complete wizard</p>
          </div>
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="text-3xl mb-2">🏠</div>
            <p className="text-2xl font-bold text-slate-900">Multiple Units</p>
            <p className="text-sm text-slate-500">Add all unit types</p>
          </div>
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="text-3xl mb-2">🎾</div>
            <p className="text-2xl font-bold text-slate-900">Amenities</p>
            <p className="text-sm text-slate-500">List all facilities</p>
          </div>
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="text-2xl font-bold text-slate-900">Location</p>
            <p className="text-sm text-slate-500">Pin exact position</p>
          </div>
        </div>

        {/* Wizard Component */}
        <ProjectWizardV7
          onSubmit={handleAdminSubmit}
          submitButtonText="✅ Publish Project"
          submitButtonColor="bg-green-600 hover:bg-green-700"
          isAdmin={true}
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 text-lg mb-2">📚 Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-semibold mb-1">✅ Required Fields:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Project Name & Developer</li>
                <li>Zone & Region</li>
                <li>Location (Lat/Lng)</li>
                <li>At least one unit type</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">💡 Recommendations:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Add 3-5 unit configurations</li>
                <li>List 10+ amenities</li>
                <li>Include 5+ landmarks</li>
                <li>Upload high-res images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
