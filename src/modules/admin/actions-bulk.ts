// src/modules/admin/actions-bulk.ts
// Server actions for bulk property upload operations
// Updated to match REAL_ESTATE_SCHEMA_FINAL.sql

'use server';

import { createClient } from '@/core/db/server';
import { ProjectFull } from '@/modules/inventory/types-v7';
import { revalidatePath } from 'next/cache';

// =====================================================
// BULK UPLOAD PROJECTS
// =====================================================

export async function uploadBulkProjects(
  projects: ProjectFull[]
): Promise<{
  success: number;
  failed: number;
  errors: Array<{ project: string; error: string }>;
  message: string;
}> {
  const supabase = await createClient();
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ project: string; error: string }>,
  };

  console.log(`Starting bulk upload for ${projects.length} projects...`);

  for (const projectData of projects) {
    try {
      // =====================================================
      // 1. Handle Developer (lookup or create)
      // =====================================================
      let developerId: string | null = null;

      if (projectData.developer_id) {
        developerId = projectData.developer_id;
      } else if (projectData.developer?.developer_name) {
        // Check if developer exists
        const { data: existingDev } = await supabase
          .from('developers')
          .select('id')
          .eq('developer_name', projectData.developer.developer_name)
          .single();

        if (existingDev) {
          developerId = existingDev.id;
        } else {
          // Create new developer
          const { data: newDev, error: devError } = await supabase
            .from('developers')
            .insert({
              developer_name: projectData.developer.developer_name,
              builder_grade: projectData.developer.builder_grade,
              logo_url: projectData.developer.logo_url,
              reputation_score: projectData.developer.reputation_score,
            })
            .select('id')
            .single();

          if (devError) {
            throw new Error(`Developer creation failed: ${devError.message}`);
          }
          developerId = newDev.id;
        }
      }

      // =====================================================
      // 2. Insert Project
      // =====================================================
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          project_name: projectData.project_name,
          slug: projectData.slug || projectData.project_name.toLowerCase().replace(/\s+/g, '-'),
          developer_id: developerId,
          
          // Geolocation (MANDATORY)
          latitude: projectData.latitude,
          longitude: projectData.longitude,
          
          // Address
          address_line: projectData.address_line,
          region: projectData.region,
          city: projectData.city || 'Bengaluru',
          pincode: projectData.pincode,
          
          // Zone & Status
          bangalore_zone: projectData.bangalore_zone,
          project_status: projectData.project_status || 'DRAFT',
          possession_date: projectData.possession_date,
          
          // Property Details
          property_type: projectData.property_type,
          total_land_area: projectData.total_land_area,
          total_units: projectData.total_units,
          number_of_phases: projectData.number_of_phases,
          current_phase_under_sale: projectData.current_phase_under_sale,
          floor_levels: projectData.floor_levels,
          construction_type: projectData.construction_type,
          construction_technology: projectData.construction_technology,
          elevators_per_tower: projectData.elevators_per_tower,
          open_space_percent: projectData.open_space_percent,
          project_theme: projectData.project_theme,
          usp: projectData.usp,
          rera_registration_no: projectData.rera_registration_no,
          
          // Clubhouse
          clubhouse_size: projectData.clubhouse_size,
          clubhouse_charges: projectData.clubhouse_charges,
          
          // Costs
          payment_plan: projectData.payment_plan,
          floor_rise_charges: projectData.floor_rise_charges,
          car_parking_cost: projectData.car_parking_cost,
          infrastructure_charges: projectData.infrastructure_charges,
          sinking_fund: projectData.sinking_fund,
          maintenance_charges: projectData.maintenance_charges,
          
          // JSONB
          specifications: projectData.specifications || {},
          custom_amenities: projectData.custom_amenities || {},
          
          // WhatsApp Pitch
          whatsapp_pitch_headline: projectData.whatsapp_pitch_headline,
          whatsapp_pitch_highlights: projectData.whatsapp_pitch_highlights,
          whatsapp_pitch_cta: projectData.whatsapp_pitch_cta,
          
          // Builder Grade
          builder_grade: projectData.builder_grade,
          
          // Media
          hero_image_url: projectData.hero_image_url,
          brochure_url: projectData.brochure_url,
          marketing_kit_url: projectData.marketing_kit_url,
          
          // Audit
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select('id')
        .single();

      if (projectError) {
        throw new Error(`Project insert failed: ${projectError.message}`);
      }

      const projectId = project.id;

      // =====================================================
      // 3. Insert Unit Templates (parallel)
      // =====================================================
      const insertPromises = [];

      if (projectData.unit_templates && projectData.unit_templates.length > 0) {
        const templates = projectData.unit_templates.map((t) => ({
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

        insertPromises.push(
          supabase.from('unit_templates').insert(templates)
        );
      }

      // =====================================================
      // 4. Insert Units
      // =====================================================
      if (projectData.units && projectData.units.length > 0) {
        const units = projectData.units.map((u) => ({
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

        insertPromises.push(supabase.from('units').insert(units));
      }

      // =====================================================
      // 5. Insert Project Analysis
      // =====================================================
      if (projectData.analysis) {
        insertPromises.push(
          supabase.from('project_analysis').insert({
            project_id: projectId,
            overall_rating: projectData.analysis.overall_rating,
            pros: projectData.analysis.pros,
            cons: projectData.analysis.cons,
            target_customer_profile: projectData.analysis.target_customer_profile,
            closing_pitch: projectData.analysis.closing_pitch,
            objection_handling: projectData.analysis.objection_handling,
            competitor_names: projectData.analysis.competitor_names,
            usp: projectData.analysis.usp,
          })
        );
      }

      // =====================================================
      // 6. Insert Amenities Link
      // =====================================================
      if (projectData.amenities && projectData.amenities.length > 0) {
        const amenityLinks = projectData.amenities.map((a) => ({
          project_id: projectId,
          amenity_id: a.amenity_id,
          custom_description: a.custom_description,
          size_specs: a.size_specs,
          quantity: a.quantity || 1,
        }));

        insertPromises.push(
          supabase.from('project_amenities_link').insert(amenityLinks)
        );
      }

      // =====================================================
      // 7. Insert Landmarks
      // =====================================================
      if (projectData.landmarks && projectData.landmarks.length > 0) {
        const landmarks = projectData.landmarks.map((l) => ({
          project_id: projectId,
          category: l.category,
          name: l.name,
          distance_km: l.distance_km,
          travel_time_mins: l.travel_time_mins,
        }));

        insertPromises.push(
          supabase.from('project_landmarks').insert(landmarks)
        );
      }

      // =====================================================
      // 8. Insert Competitors
      // =====================================================
      if (projectData.competitors && projectData.competitors.length > 0) {
        const competitors = projectData.competitors.map((c) => ({
          project_id: projectId,
          competitor_name: c.competitor_name,
          competitor_price_range: c.competitor_price_range,
          distance_km: c.distance_km,
          similar_configs: c.similar_configs,
          notes: c.notes,
        }));

        insertPromises.push(
          supabase.from('project_competitors').insert(competitors)
        );
      }

      // =====================================================
      // 9. Insert IT Parks
      // =====================================================
      if (projectData.it_parks && projectData.it_parks.length > 0) {
        const itParks = projectData.it_parks.map((p) => ({
          project_id: projectId,
          it_park_name: p.it_park_name,
          distance_km: p.distance_km,
          travel_time: p.travel_time,
        }));

        insertPromises.push(
          supabase.from('it_parks_proximity').insert(itParks)
        );
      }

      // =====================================================
      // 10. Insert Schools
      // =====================================================
      if (projectData.schools && projectData.schools.length > 0) {
        const schools = projectData.schools.map((s) => ({
          project_id: projectId,
          school_name: s.school_name,
          distance_km: s.distance_km,
          travel_time: s.travel_time,
        }));

        insertPromises.push(
          supabase.from('schools_nearby').insert(schools)
        );
      }

      // =====================================================
      // 11. Insert Hospitals
      // =====================================================
      if (projectData.hospitals && projectData.hospitals.length > 0) {
        const hospitals = projectData.hospitals.map((h) => ({
          project_id: projectId,
          hospital_name: h.hospital_name,
          distance_km: h.distance_km,
          travel_time: h.travel_time,
        }));

        insertPromises.push(
          supabase.from('hospitals_nearby').insert(hospitals)
        );
      }

      // =====================================================
      // 12. Insert Shopping Malls
      // =====================================================
      if (projectData.malls && projectData.malls.length > 0) {
        const malls = projectData.malls.map((m) => ({
          project_id: projectId,
          mall_name: m.mall_name,
          distance_km: m.distance_km,
          travel_time: m.travel_time,
        }));

        insertPromises.push(
          supabase.from('shopping_malls_nearby').insert(malls)
        );
      }

      // Execute all inserts in parallel
      await Promise.all(insertPromises);

      results.success++;
      console.log(`✓ Successfully inserted: ${projectData.project_name}`);
    } catch (error: any) {
      results.failed++;
      results.errors.push({
        project: projectData.project_name || 'Unknown',
        error: error.message,
      });
      console.error(`✗ Failed to insert: ${projectData.project_name}`, error.message);
    }
  }

  // Revalidate cache
  revalidatePath('/admin/inventory');
  revalidatePath('/dashboard');

  const message = `Bulk upload complete: ${results.success} succeeded, ${results.failed} failed`;
  console.log(message);

  return {
    ...results,
    message,
  };
}

// =====================================================
// BULK DELETE PROJECTS
// =====================================================

export async function bulkDeleteProjects(
  projectIds: string[]
): Promise<{
  success: number;
  failed: number;
  message: string;
}> {
  const supabase = await createClient();
  let success = 0;
  let failed = 0;

  for (const id of projectIds) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      
      if (error) throw error;
      success++;
    } catch (error) {
      failed++;
      console.error(`Failed to delete project ${id}:`, error);
    }
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/dashboard');

  return {
    success,
    failed,
    message: `Deleted ${success} projects, ${failed} failed`,
  };
}

// =====================================================
// BULK STATUS UPDATE
// =====================================================

export async function bulkUpdateStatus(
  projectIds: string[],
  newStatus: string
): Promise<{
  success: number;
  failed: number;
  message: string;
}> {
  const supabase = await createClient();
  let success = 0;
  let failed = 0;

  for (const id of projectIds) {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ project_status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      success++;
    } catch (error) {
      failed++;
      console.error(`Failed to update project ${id}:`, error);
    }
  }

  revalidatePath('/admin/inventory');
  revalidatePath('/dashboard');

  return {
    success,
    failed,
    message: `Updated ${success} projects to ${newStatus}, ${failed} failed`,
  };
}
