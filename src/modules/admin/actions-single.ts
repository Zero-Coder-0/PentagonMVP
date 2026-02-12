// src/modules/admin/actions-single.ts
// Server actions for single property CRUD operations
// Updated to match REAL_ESTATE_SCHEMA_FINAL.sql

'use server';

import { createClient } from '@/core/db/server';
import { ProjectFull } from '@/modules/inventory/types-v7';
import { revalidatePath } from 'next/cache';

// =====================================================
// CREATE SINGLE PROJECT
// =====================================================

export async function createSingleProject(data: ProjectFull): Promise<{
  success: boolean;
  projectId?: string;
  message: string;
}> {
  try {
    const supabase = await createClient();

    // =====================================================
    // 1. Handle Developer (lookup or create)
    // =====================================================
    let developerId: string | null = null;

    if (data.developer_id) {
      // Developer ID provided directly
      developerId = data.developer_id;
    } else if (data.developer?.developer_name) {
      // Check if developer exists
      const { data: existingDev } = await supabase
        .from('developers')
        .select('id')
        .eq('developer_name', data.developer.developer_name)
        .single();

      if (existingDev) {
        developerId = existingDev.id;
      } else {
        // Create new developer
        const { data: newDev, error: devError } = await supabase
          .from('developers')
          .insert({
            developer_name: data.developer.developer_name,
            builder_grade: data.developer.builder_grade,
            logo_url: data.developer.logo_url,
          })
          .select('id')
          .single();

        if (devError) throw new Error(`Developer creation failed: ${devError.message}`);
        developerId = newDev.id;
      }
    }

    // =====================================================
    // 2. Insert Project (Main Table)
    // =====================================================
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        project_name: data.project_name,
        slug: data.slug || data.project_name.toLowerCase().replace(/\s+/g, '-'),
        developer_id: developerId,
        
        // Geolocation (MANDATORY)
        latitude: data.latitude,
        longitude: data.longitude,
        
        // Address
        address_line: data.address_line,
        region: data.region,
        city: data.city || 'Bengaluru',
        pincode: data.pincode,
        
        // Zone & Status
        bangalore_zone: data.bangalore_zone,
        project_status: data.project_status || 'DRAFT',
        possession_date: data.possession_date,
        
        // Property Details
        property_type: data.property_type,
        total_land_area: data.total_land_area,
        total_units: data.total_units,
        number_of_phases: data.number_of_phases,
        current_phase_under_sale: data.current_phase_under_sale,
        floor_levels: data.floor_levels,
        construction_type: data.construction_type,
        construction_technology: data.construction_technology,
        elevators_per_tower: data.elevators_per_tower,
        open_space_percent: data.open_space_percent,
        project_theme: data.project_theme,
        usp: data.usp,
        rera_registration_no: data.rera_registration_no,
        
        // Clubhouse
        clubhouse_size: data.clubhouse_size,
        clubhouse_charges: data.clubhouse_charges,
        
        // Costs
        payment_plan: data.payment_plan,
        floor_rise_charges: data.floor_rise_charges,
        car_parking_cost: data.car_parking_cost,
        infrastructure_charges: data.infrastructure_charges,
        sinking_fund: data.sinking_fund,
        maintenance_charges: data.maintenance_charges,
        
        // JSONB Fields
        specifications: data.specifications || {},
        custom_amenities: data.custom_amenities || {},
        
        // WhatsApp Pitch
        whatsapp_pitch_headline: data.whatsapp_pitch_headline,
        whatsapp_pitch_highlights: data.whatsapp_pitch_highlights,
        whatsapp_pitch_cta: data.whatsapp_pitch_cta,
        
        // Builder Grade
        builder_grade: data.builder_grade,
        
        // Media
        hero_image_url: data.hero_image_url,
        brochure_url: data.brochure_url,
        marketing_kit_url: data.marketing_kit_url,
        
        // Audit
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select('id')
      .single();

    if (projectError) {
      throw new Error(`Project creation failed: ${projectError.message}`);
    }

    const projectId = project.id;

    // =====================================================
    // 3. Insert Unit Templates (if provided)
    // =====================================================
    if (data.unit_templates && data.unit_templates.length > 0) {
      const templates = data.unit_templates.map((t) => ({
        project_id: projectId,
        template_name: t.template_name,
        config_type: t.config_type,
        std_super_built_up_area: t.std_super_built_up_area,
        std_carpet_area: t.std_carpet_area,
        std_balcony_area: t.std_balcony_area,
        std_terrace_area: t.std_terrace_area,
        std_garden_area: t.std_garden_area,
        std_uds_area: t.std_uds_area,
        wc_count: t.wc_count,
        balcony_count: t.balcony_count,
        std_base_price: t.std_base_price,
        std_price_per_sqft: t.std_price_per_sqft,
        specifications: t.specifications || {},
        room_dimensions: t.room_dimensions || {},
        description: t.description,
        unit_strengths: t.unit_strengths,
        unit_drawbacks: t.unit_drawbacks,
        vastu_compliance: t.vastu_compliance,
        ventilation_quality: t.ventilation_quality,
      }));

      const { error: templateError } = await supabase
        .from('unit_templates')
        .insert(templates);

      if (templateError) {
        console.error('Template insert error:', templateError);
      }
    }

    // =====================================================
    // 4. Insert Units (if provided)
    // =====================================================
    if (data.units && data.units.length > 0) {
      const units = data.units.map((u) => ({
        project_id: projectId,
        template_id: u.template_id,
        unit_number: u.unit_number,
        floor_number: u.floor_number,
        block_tower: u.block_tower,
        facing: u.facing,
        facing_available: u.facing_available,
        view_type: u.view_type,
        status: u.status || 'Available',
        is_available: u.is_available !== false,
        actual_sba: u.actual_sba,
        actual_carpet_area: u.actual_carpet_area,
        balcony_area: u.balcony_area,
        private_terrace_area: u.private_terrace_area,
        garden_area: u.garden_area,
        uds_area: u.uds_area,
        wc_count: u.wc_count,
        balcony_count: u.balcony_count,
        price_total: u.price_total,
        price_per_sqft: u.price_per_sqft,
        plc_charges: u.plc_charges,
        floor_rise_charges: u.floor_rise_charges,
        parking_charges: u.parking_charges,
        flooring_type: u.flooring_type,
        power_load_kw: u.power_load_kw,
        unit_specs: u.unit_specs || {},
        custom_features: u.custom_features || {},
        is_hot_selling: u.is_hot_selling || false,
        is_recommended: u.is_recommended || false,
        internal_notes: u.internal_notes,
      }));

      const { error: unitsError } = await supabase.from('units').insert(units);

      if (unitsError) {
        console.error('Units insert error:', unitsError);
      }
    }

    // =====================================================
    // 5. Insert Project Analysis (if provided)
    // =====================================================
    if (data.analysis) {
      const { error: analysisError } = await supabase
        .from('project_analysis')
        .insert({
          project_id: projectId,
          overall_rating: data.analysis.overall_rating,
          pros: data.analysis.pros,
          cons: data.analysis.cons,
          target_customer_profile: data.analysis.target_customer_profile,
          closing_pitch: data.analysis.closing_pitch,
          objection_handling: data.analysis.objection_handling,
          competitor_names: data.analysis.competitor_names,
          usp: data.analysis.usp,
        });

      if (analysisError) {
        console.error('Analysis insert error:', analysisError);
      }
    }

    // =====================================================
    // 6. Insert Amenities (Many-to-Many Link)
    // =====================================================
    if (data.amenities && data.amenities.length > 0) {
      const amenityLinks = data.amenities.map((a) => ({
        project_id: projectId,
        amenity_id: a.amenity_id,
        custom_description: a.custom_description,
        size_specs: a.size_specs,
        quantity: a.quantity || 1,
      }));

      const { error: amenitiesError } = await supabase
        .from('project_amenities_link')
        .insert(amenityLinks);

      if (amenitiesError) {
        console.error('Amenities insert error:', amenitiesError);
      }
    }

    // =====================================================
    // 7. Insert Landmarks (if provided)
    // =====================================================
    if (data.landmarks && data.landmarks.length > 0) {
      const landmarks = data.landmarks.map((l) => ({
        project_id: projectId,
        category: l.category,
        name: l.name,
        distance_km: l.distance_km,
        travel_time_mins: l.travel_time_mins,
      }));

      const { error: landmarksError } = await supabase
        .from('project_landmarks')
        .insert(landmarks);

      if (landmarksError) {
        console.error('Landmarks insert error:', landmarksError);
      }
    }

    // =====================================================
    // 8. Insert Competitors (if provided)
    // =====================================================
    if (data.competitors && data.competitors.length > 0) {
      const competitors = data.competitors.map((c) => ({
        project_id: projectId,
        competitor_name: c.competitor_name,
        competitor_price_range: c.competitor_price_range,
        distance_km: c.distance_km,
        similar_configs: c.similar_configs,
        notes: c.notes,
      }));

      const { error: competitorsError } = await supabase
        .from('project_competitors')
        .insert(competitors);

      if (competitorsError) {
        console.error('Competitors insert error:', competitorsError);
      }
    }

    // =====================================================
    // 9. Insert IT Parks (if provided)
    // =====================================================
    if (data.it_parks && data.it_parks.length > 0) {
      const itParks = data.it_parks.map((p) => ({
        project_id: projectId,
        it_park_name: p.it_park_name,
        distance_km: p.distance_km,
        travel_time: p.travel_time,
      }));

      const { error: itError } = await supabase
        .from('it_parks_proximity')
        .insert(itParks);

      if (itError) {
        console.error('IT Parks insert error:', itError);
      }
    }

    // =====================================================
    // 10. Insert Schools (if provided)
    // =====================================================
    if (data.schools && data.schools.length > 0) {
      const schools = data.schools.map((s) => ({
        project_id: projectId,
        school_name: s.school_name,
        distance_km: s.distance_km,
        travel_time: s.travel_time,
      }));

      const { error: schoolsError } = await supabase
        .from('schools_nearby')
        .insert(schools);

      if (schoolsError) {
        console.error('Schools insert error:', schoolsError);
      }
    }

    // =====================================================
    // 11. Insert Hospitals (if provided)
    // =====================================================
    if (data.hospitals && data.hospitals.length > 0) {
      const hospitals = data.hospitals.map((h) => ({
        project_id: projectId,
        hospital_name: h.hospital_name,
        distance_km: h.distance_km,
        travel_time: h.travel_time,
      }));

      const { error: hospitalsError } = await supabase
        .from('hospitals_nearby')
        .insert(hospitals);

      if (hospitalsError) {
        console.error('Hospitals insert error:', hospitalsError);
      }
    }

    // =====================================================
    // 12. Insert Shopping Malls (if provided)
    // =====================================================
    if (data.malls && data.malls.length > 0) {
      const malls = data.malls.map((m) => ({
        project_id: projectId,
        mall_name: m.mall_name,
        distance_km: m.distance_km,
        travel_time: m.travel_time,
      }));

      const { error: mallsError } = await supabase
        .from('shopping_malls_nearby')
        .insert(malls);

      if (mallsError) {
        console.error('Malls insert error:', mallsError);
      }
    }

    // Revalidate cache
    revalidatePath('/admin/inventory');
    revalidatePath('/dashboard');

    return {
      success: true,
      projectId,
      message: 'Project created successfully!',
    };
  } catch (error: any) {
    console.error('Create project error:', error);
    return {
      success: false,
      message: error.message || 'Failed to create project',
    };
  }
}

// =====================================================
// UPDATE PROJECT
// =====================================================

export async function updateProject(
  projectId: string,
  data: Partial<ProjectFull>
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();

    // Update main project table
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        project_name: data.project_name,
        latitude: data.latitude,
        longitude: data.longitude,
        address_line: data.address_line,
        region: data.region,
        bangalore_zone: data.bangalore_zone,
        project_status: data.project_status,
        possession_date: data.possession_date,
        property_type: data.property_type,
        total_land_area: data.total_land_area,
        total_units: data.total_units,
        builder_grade: data.builder_grade,
        hero_image_url: data.hero_image_url,
        brochure_url: data.brochure_url,
        specifications: data.specifications,
        custom_amenities: data.custom_amenities,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }

    // Revalidate cache
    revalidatePath(`/admin/inventory/${projectId}`);
    revalidatePath('/dashboard');

    return { success: true, message: 'Project updated successfully!' };
  } catch (error: any) {
    console.error('Update project error:', error);
    return { success: false, message: error.message };
  }
}

// =====================================================
// DELETE PROJECT
// =====================================================

export async function deleteProject(projectId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();

    // Delete project (CASCADE will handle related records)
    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    revalidatePath('/admin/inventory');
    revalidatePath('/dashboard');

    return { success: true, message: 'Project deleted successfully!' };
  } catch (error: any) {
    console.error('Delete project error:', error);
    return { success: false, message: error.message };
  }
}

// =====================================================
// CHANGE PROJECT STATUS
// =====================================================

export async function changeProjectStatus(
  projectId: string,
  newStatus: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('projects')
      .update({ project_status: newStatus })
      .eq('id', projectId);

    if (error) throw error;

    revalidatePath('/admin/inventory');
    revalidatePath('/dashboard');

    return { success: true, message: `Status changed to ${newStatus}` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
