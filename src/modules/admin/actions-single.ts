'use server'

import { createClient } from '@/core/db/server';
import { ProjectFullV7 } from '@/modules/inventory/types-v7';

export async function createSingleProject(project: ProjectFullV7) {
  const supabase = await createClient();
  
  try {
    // 1. Insert Project (Parent)
    const { data: projData, error: projError } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        developer: project.developer,
        rera_id: project.rera_id,
        status: project.status,
        zone: project.zone,
        region: project.region,
        address_line: project.address_line,
        lat: project.lat,
        lng: project.lng,
        total_land_area: project.total_land_area,
        total_units: project.total_units,
        possession_date: project.possession_date,
        construction_technology: project.construction_technology,
        open_space_percent: project.open_space_percent,
        structure_details: project.structure_details,
        hero_image_url: project.hero_image_url,
        specifications: project.specifications || {}
      })
      .select('id')
      .single();

    if (projError) throw new Error(projError.message);
    const projectId = projData.id;

    // 2. Insert Units
    if (project.units?.length) {
      const units = project.units.map(u => ({
        project_id: projectId,
        type: u.type,
        facing: u.facing,
        sba_sqft: u.sba_sqft,
        uds_sqft: u.uds_sqft,
        base_price: u.base_price,
        is_available: u.is_available
      }));
      await supabase.from('project_units').insert(units);
    }

    // 3. Insert Amenities
    if (project.amenities?.length) {
      const amenities = project.amenities.map(a => ({
        project_id: projectId,
        category: a.category,
        name: a.name,
        size_specs: a.size_specs
      }));
      await supabase.from('project_amenities').insert(amenities);
    }

    // 4. Insert Analysis
    if (project.analysis) {
      await supabase.from('project_analysis').insert({
        project_id: projectId,
        overall_rating: project.analysis.overall_rating,
        pros: project.analysis.pros,
        cons: project.analysis.cons,
        target_customer_profile: project.analysis.target_customer_profile,
        closing_pitch: project.analysis.closing_pitch,
        objection_handling: project.analysis.objection_handling
      });
    }

    return { success: true, message: 'Project created successfully!' };

  } catch (error: any) {
    console.error('Create Project Error:', error);
    return { success: false, message: error.message };
  }
}
