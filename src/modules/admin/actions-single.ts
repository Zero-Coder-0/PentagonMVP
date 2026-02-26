'use server'

import { prisma } from '@/lib/prisma';

export async function createSingleProject(project: any) {
  try {
    // 2. Map status string → Prisma enum
    const statusMap: Record<string, any> = {
      'Pre-Launch': 'Pre_Launch',
      'Under Construction': 'Under_Construction',
      'Nearing Completion': 'Nearing_Completion',
      'Ready to Move': 'Ready_to_Move',
      'Sold Out': 'Sold_Out',
      'DRAFT': 'DRAFT'
    };

    // 3. Insert Main Project (Prisma model: Project → table: projects)
    const proj = await prisma.project.create({
      data: {
        project_name: project.name,
        general_location: project.location || '',
        address_line: project.address_line || '',
        district: project.district || 'Bengaluru',
        lat: project.lat || 12.9716,
        lng: project.lng || 77.5946,
        // technical_specs and other specs logic handled via ProjectSpecification now
      }
    });

    const projectId = proj.id;

    // 4. Units → ProjectUnit (Prisma model)
    if (project.units?.length) {
      await prisma.projectUnit.createMany({
        data: project.units.map((u: any, index: number) => ({
          project_id: projectId,
          unitnumber: u.unit_number || u.template_name || `Unit-${index + 1}`,
          config: u.type || u.config || 'Unknown',
          type: u.variant || u.type || 'Standard',
          actualsba: u.sba_sqft ? parseInt(u.sba_sqft.toString()) : null,
          carpetarea: u.carpet_sqft ? parseInt(u.carpet_sqft.toString()) : null,
          wccount: u.wc_count ? parseInt(u.wc_count.toString()) : null,
          balconycount: u.balcony_count ? parseInt(u.balcony_count.toString()) : null,
          pricepersqft: u.price_per_sqft ? parseInt(u.price_per_sqft.toString()) : null,
          pricetotal: u.base_price ? parseFloat(u.base_price.toString()) : null,
          facing: u.facing || null,
        }))
      });
    }

    // 5. Amenities → projectAmenities (Prisma model: ProjectAmenity)
    if (project.amenities?.length) {
      await prisma.projectAmenity.createMany({
        data: project.amenities.map((a: any) => ({
          project_id: projectId,
          category: a.category || 'General',
          name: a.name,
          size_specs: a.size_specs || null,
        }))
      });
    }

    // 6. Landmarks → projectLandmarks (Prisma model: ProjectLandmark)
    if (project.landmarks?.length) {
      await prisma.projectLandmark.createMany({
        data: project.landmarks.map((l: any) => ({
          project_id: projectId,
          category: l.category,
          name: l.name,
          distance_km: l.distance_km?.toString() || null,
          travel_time: l.travel_time_mins ? `${l.travel_time_mins} mins` : null,
        }))
      });
    }

    // 7. Analysis → projectAnalysis (Prisma model: ProjectAnalysis)
    if (project.market_analysis || project.analysis) {
      const ma = project.market_analysis || project.analysis;
      await prisma.projectAnalysis.create({
        data: {
          project_id: projectId,
          pros: Array.isArray(ma.pros) ? ma.pros : (ma.pros ? [ma.pros] : []),
          cons: Array.isArray(ma.cons) ? ma.cons : (ma.cons ? [ma.cons] : []),
          usp: ma.usp || '',
          closing_pitch: ma.closing_pitch || '',
          target_customer: ma.target_customer_profile || '',
          objection_handling: ma.objection_handling || '',
          overall_rating: ma.overall_rating ? parseFloat(ma.overall_rating.toString()) : null,
        }
      });
    }

    // 8. Competitors → projectCompetitors
    if (project.competitors?.length) {
      await prisma.projectCompetitor.createMany({
        data: project.competitors.map((c: any) => ({
          project_id: projectId,
          name: c.name,
          price_range: c.price_range || '',
        }))
      });
    }

    // 9. Cost Extras → projectCommercial
    if (project.cost_extras?.length) {
      await prisma.projectCommercial.createMany({
        data: project.cost_extras.map((ce: any) => ({
          project_id: projectId,
          name: ce.item_name,
          amount: ce.cost_amount ? parseFloat(ce.cost_amount.toString()) : null,
          cost_type: ce.cost_type || 'Fixed',
          payment_milestone: ce.payment_milestone || null,
        }))
      });
    }

    return { success: true, message: `Project "${project.name}" created successfully!` };

  } catch (error: any) {
    console.error('Create Project Error:', error);
    return { success: false, message: error.message };
  }
}
