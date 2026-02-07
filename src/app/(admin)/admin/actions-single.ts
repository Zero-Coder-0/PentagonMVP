// src/modules/admin/actions-single.ts
'use server';

import { createClient } from '@/core/db/server';
import { ProjectFullV7 } from '@/modules/inventory/types-v7';

export async function createSingleProject(data: ProjectFullV7) {
  try {
    const supabase = await createClient();

    // 1. Insert Project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        developer: data.developer,
        rera_id: data.rera_id,
        status: data.status,
        zone: data.zone,
        region: data.region,
        property_type: data.property_type,
        total_units: data.total_units,
        total_land_area: data.total_land_area,
        possession_date: data.possession_date,
        floor_levels: data.floor_levels,
        open_space_percent: data.open_space_percent,
        construction_technology: data.construction_technology,
        builder_grade: data.builder_grade,
        construction_type: data.construction_type,
        address_line: data.address_line,
        lat: data.lat,
        lng: data.lng,
        price_min: data.price_min,
        price_display: data.price_display,
        price_per_sqft: data.price_per_sqft,
        onwards_pricing: data.onwards_pricing,
        specifications: data.specifications,
        hero_image_url: data.hero_image_url,
        brochure_url: data.brochure_url,
        marketing_kit_url: data.marketing_kit_url,
      })
      .select('id')
      .single();

    if (projectError) throw projectError;
    const projectId = project.id;

    // 2. Parallel inserts for all sub-tables
    await Promise.all([
      // Units
      data.units && data.units.length > 0 &&
        supabase.from('project_units').insert(
          data.units.map(unit => ({
            project_id: projectId,
            type: unit.type,
            facing: unit.facing,
            sba_sqft: unit.sba_sqft,
            carpet_sqft: unit.carpet_sqft,
            uds_sqft: unit.uds_sqft,
            base_price: unit.base_price,
            wc_count: unit.wc_count,
            balcony_count: unit.balcony_count,
            facing_available: unit.facing_available,
            plc_charges: unit.plc_charges,
            flooring_type: unit.flooring_type,
            power_load_kw: unit.power_load_kw,
            is_available: unit.is_available,
          }))
        ),

      // Analysis
      data.analysis &&
        supabase.from('project_analysis').insert({
          project_id: projectId,
          overall_rating: data.analysis.overall_rating,
          target_customer_profile: data.analysis.target_customer_profile,
          closing_pitch: data.analysis.closing_pitch,
          usp: data.analysis.usp,
          objection_handling: data.analysis.objection_handling,
          pros: data.analysis.pros,
          cons: data.analysis.cons,
          competitor_names: data.analysis.competitor_names || [],
        }),

      // Amenities
      data.amenities && data.amenities.length > 0 &&
        supabase.from('project_amenities').insert(
          data.amenities.map(amenity => ({
            project_id: projectId,
            name: amenity.name,
            category: amenity.category,
            size_specs: amenity.size_specs,
          }))
        ),

      // Landmarks (if provided)
      data.landmarks && data.landmarks.length > 0 &&
        supabase.from('project_landmarks').insert(
          data.landmarks.map(landmark => ({
            project_id: projectId,
            name: landmark.name,
            category: landmark.category,
            distance_km: landmark.distance_km,
            travel_time_mins: landmark.travel_time_mins,
          }))
        ),
    ]);

    return { success: true, projectId, message: 'Project created successfully!' };
  } catch (error: any) {
    console.error('Create project error:', error);
    return { success: false, message: error.message || 'Failed to create project' };
  }
}
