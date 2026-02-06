'use server'

import { createClient } from '@/core/db/server';
import { ProjectFullV7 } from '@/modules/inventory/types-v7';

// This is your function, saved in the right place
export async function uploadBulkProjects(projects: ProjectFullV7[]) {
  const supabase = await createClient();
  const results = { success: 0, failed: 0, errors: [] as string[] };

  console.log(`Starting Bulk Upload for ${projects.length} projects...`);

  for (const p of projects) {
    try {
      // 1. Insert Project (The Parent)
      const { data: projData, error: projError } = await supabase
        .from('projects')
        .insert({
          name: p.name,
          developer: p.developer,
          rera_id: p.rera_id,
          status: p.status,
          zone: p.zone,
          region: p.region,
          address_line: p.address_line,
          lat: p.lat,
          lng: p.lng,
          total_land_area: p.total_land_area,
          total_units: p.total_units,
          possession_date: p.possession_date,
          construction_technology: p.construction_technology,
          open_space_percent: p.open_space_percent,
          structure_details: p.structure_details,
          hero_image_url: p.hero_image_url,
          brochure_url: p.brochure_url,
          marketing_kit_url: p.marketing_kit_url,
          specifications: (p as any).specifications || {} // Uses your new column
        })
        .select('id')
        .single();

      if (projError) throw new Error(`Project ${p.name}: ${projError.message}`);
      const projectId = projData.id;

      // 2. Insert Analysis
      if (p.analysis) {
        await supabase.from('project_analysis').insert({
          project_id: projectId,
          overall_rating: p.analysis.overall_rating,
          pros: p.analysis.pros,
          cons: p.analysis.cons,
          target_customer_profile: p.analysis.target_customer_profile,
          closing_pitch: p.analysis.closing_pitch,
          objection_handling: p.analysis.objection_handling,
          competitor_names: p.analysis.competitor_names
        });
      }

      // 3. Insert Units
      if (p.units?.length) {
        const units = p.units.map(u => ({
          project_id: projectId,
          type: u.type,
          facing: u.facing,
          sba_sqft: u.sba_sqft,
          carpet_sqft: u.carpet_sqft,
          uds_sqft: u.uds_sqft,
          base_price: u.base_price,
          flooring_type: u.flooring_type,
          power_load_kw: u.power_load_kw,
          is_available: u.is_available,
          unit_specs: (u as any).unit_specs || {} // Uses your new column
        }));
        await supabase.from('project_units').insert(units);
      }

      // 4. Insert Amenities
      if (p.amenities?.length) {
        const amenities = p.amenities.map(a => ({
          project_id: projectId,
          category: a.category,
          name: a.name,
          size_specs: a.size_specs
        }));
        await supabase.from('project_amenities').insert(amenities);
      }

      // 5. Insert Landmarks
      if (p.landmarks?.length) {
        const landmarks = p.landmarks.map(l => ({
          project_id: projectId,
          category: l.category,
          name: l.name,
          distance_km: l.distance_km,
          travel_time_mins: l.travel_time_mins
        }));
        await supabase.from('project_landmarks').insert(landmarks);
      }

      // 6. Insert Cost Extras
      if (p.cost_extras?.length) {
        const extras = p.cost_extras.map(c => ({
          project_id: projectId,
          name: c.name,
          cost_type: c.cost_type,
          amount: c.amount,
          payment_milestone: c.payment_milestone
        }));
        await supabase.from('project_cost_extras').insert(extras);
      }

      results.success++;
      
    } catch (e: any) {
      console.error(e);
      results.failed++;
      results.errors.push(e.message);
    }
  }

  return results;
}
