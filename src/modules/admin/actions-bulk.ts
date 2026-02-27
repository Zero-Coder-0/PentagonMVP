// src/modules/admin/actions-bulk.ts
'use server';

import * as BulkSchemas from '@/lib/validation/bulkSchemas';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export type BulkUploadResult = {
  success: number;
  failed: number;
  errors: string[];
};

export async function uploadFullSchema(data: { projects: any[], users?: any[], drafts?: any[] }): Promise<BulkUploadResult> {
  const { projects = [], users = [], drafts = [] } = data;
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  try {
    // 1. Process Users First (so they can be linked to projects/visits)
    for (const user of users) {
      try {
        const { email, ...rest } = BulkSchemas.UserSchema.parse(user);
        await prisma.user.upsert({
          where: { email },
          update: rest as any,
          create: { email, ...rest } as any
        });
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`User ${user.email || 'unknown'} failed: ${err.message}`);
      }
    }

    // 2. Process Drafts
    for (const draft of drafts) {
      try {
        const parsed = BulkSchemas.PropertyDraftSchema.parse(draft);
        let subData = parsed.submission_data;
        if (typeof subData === 'string') {
          try { subData = JSON.parse(subData); } catch (e) { /* ignore */ }
        }
        await prisma.propertyDraft.create({
          data: {
            vendor_id: parsed.vendor_id,
            submission_data: subData as any,
            status: parsed.status || 'pending',
            admin_notes: parsed.admin_notes
          }
        });
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Draft failed: ${err.message}`);
      }
    }

    // 3. Process Projects (Main course)
    for (const project of projects) {
      try {
        // 3.1 Validate core project data
        const coreDataRaw = BulkSchemas.ProjectSchema.parse(project);
        let createdBy = coreDataRaw.created_by;

        // If created_by is an email, resolve it
        if (createdBy && createdBy.includes('@')) {
          const u = await prisma.user.findUnique({ where: { email: createdBy } });
          if (u) createdBy = u.id;
        }

        const coreData = { ...coreDataRaw, created_by: createdBy };

        if (!coreData.project_name) {
          throw new Error('Project Name is missing or invalid.');
        }

        // 3.2 Extract/validate relations
        const units = Array.isArray(project.units)
          ? project.units.map((u: any) => { const { project_name, ...rest } = BulkSchemas.ProjectUnitSchema.parse(u); return rest; })
          : [];

        const amenities = Array.isArray(project.amenities)
          ? project.amenities.map((a: any) => { const { project_name, ...rest } = BulkSchemas.ProjectAmenitySchema.parse(a); return rest; })
          : [];

        const landmarks = Array.isArray(project.landmarks)
          ? project.landmarks.map((l: any) => { const { project_name, ...rest } = BulkSchemas.ProjectLandmarkSchema.parse(l); return rest; })
          : [];

        const commercials = Array.isArray(project.commercials)
          ? project.commercials.map((c: any) => { const { project_name, ...rest } = BulkSchemas.ProjectCommercialSchema.parse(c); return rest; })
          : [];

        const competitors = Array.isArray(project.competitors)
          ? project.competitors.map((c: any) => { const { project_name, ...rest } = BulkSchemas.ProjectCompetitorSchema.parse(c); return rest; })
          : [];

        const visits = Array.isArray(project.visits)
          ? await Promise.all(project.visits.map(async (v: any) => {
            const { project_name, user_email, ...rest } = BulkSchemas.SiteVisitSchema.parse(v);
            let uid = rest.user_id;
            if (!uid && user_email) {
              const u = await prisma.user.findUnique({ where: { email: user_email } });
              if (u) uid = u.id;
            }
            if (!uid) throw new Error(`User ${user_email || 'unknown'} not found for SiteVisit by ${rest.customer_name}`);
            return { ...rest, user_id: uid };
          })) : [];

        const leads = Array.isArray(project.leads)
          ? await Promise.all(project.leads.map(async (l: any) => {
            const { project_name, assigned_to_email, ...rest } = BulkSchemas.LeadSchema.parse(l);
            let uid = rest.assigned_to;
            if (!uid && assigned_to_email) {
              const u = await prisma.user.findUnique({ where: { email: assigned_to_email } });
              if (u) uid = u.id;
            }
            return { ...rest, assigned_to: uid };
          })) : [];

        let developer = undefined;
        if (project.developer && Object.keys(project.developer).length > 0) {
          const { project_name, ...rest } = BulkSchemas.ProjectDeveloperSchema.parse(project.developer);
          developer = rest;
        }

        let analysis = undefined;
        if (project.analysis && Object.keys(project.analysis).length > 0) {
          const { project_name, ...rest } = BulkSchemas.ProjectAnalysisSchema.parse(project.analysis);
          if (rest.objection_handling && typeof rest.objection_handling === 'string') {
            try { rest.objection_handling = JSON.parse(rest.objection_handling); } catch (e) { /* ignore */ }
          }
          analysis = rest;
        }

        let specifications = undefined;
        if (project.specifications && Object.keys(project.specifications).length > 0) {
          const { project_name, ...rest } = BulkSchemas.ProjectSpecificationSchema.parse(project.specifications);
          specifications = rest;
        }

        let connectivity = undefined;
        if (project.connectivity && Object.keys(project.connectivity).length > 0) {
          const { project_name, ...rest } = BulkSchemas.LocationConnectivitySchema.parse(project.connectivity);
          connectivity = rest;
        }

        // 3.3 Atomic Project Upsert
        await prisma.$transaction(async (tx) => {
          await tx.project.upsert({
            where: { project_name: coreData.project_name },
            update: {
              ...coreData,
              projectunits: { deleteMany: {}, create: units },
              amenities: { deleteMany: {}, create: amenities },
              landmarks: { deleteMany: {}, create: landmarks },
              commercials: { deleteMany: {}, create: commercials },
              competitors: { deleteMany: {}, create: competitors },
              visits: { deleteMany: {}, create: visits },
              leads: { deleteMany: {}, create: leads },

              ...(developer && { developer: { upsert: { create: developer, update: developer } } }),
              ...(analysis && { analysis: { upsert: { create: analysis, update: analysis } } }),
              ...(specifications && { specs: { upsert: { create: specifications, update: specifications } } }),
              ...(connectivity && { connectivity: { upsert: { create: connectivity, update: connectivity } } })
            } as any,
            create: {
              ...coreData,
              projectunits: { create: units },
              amenities: { create: amenities },
              landmarks: { create: landmarks },
              commercials: { create: commercials },
              competitors: { create: competitors },
              visits: { create: visits },
              leads: { create: leads },

              ...(developer && { developer: { create: developer } }),
              ...(analysis && { analysis: { create: analysis } }),
              ...(specifications && { specs: { create: specifications } }),
              ...(connectivity && { connectivity: { create: connectivity } })
            } as any,
          });
        });

        successCount++;
      } catch (err: any) {
        failedCount++;
        if (err.issues) {
          const firstErr = err.issues[0];
          errors.push(`Project format error for ${project.project_name || 'unknown'}: ${firstErr.path.join('.')} - ${firstErr.message}`);
        } else {
          errors.push(`Project database error for ${project.project_name || 'unknown'}: ${err.message}`);
        }
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/inventory');

    return { success: successCount, failed: failedCount, errors };

  } catch (error: any) {
    console.error('Full schema upload failed:', error);
    return {
      success: successCount,
      failed: failedCount + projects.length + users.length + drafts.length,
      errors: [error.message || 'Fatal error']
    };
  }
}

// Keep the old name for backward compatibility if needed, but proxy to new
export async function uploadBulkProjects(projects: any[]): Promise<BulkUploadResult> {
  return uploadFullSchema({ projects });
}

export async function deleteBulkProjects(projectIds: string[]) {
  try {
    await prisma.project.deleteMany({
      where: { id: { in: projectIds } }
    });
    revalidatePath('/dashboard');
    revalidatePath('/admin/inventory');
    return { success: true, message: `Deleted ${projectIds.length} projects` };
  } catch (error: any) {
    console.error('Bulk delete failed:', error);
    return { success: false, message: error.message || 'Delete failed' };
  }
}

export async function deleteProject(projectId: string) {
  try {
    await prisma.project.delete({ where: { id: projectId } });
    revalidatePath('/dashboard');
    revalidatePath('/admin/inventory');
    return { success: true, message: 'Project deleted successfully' };
  } catch (error: any) {
    console.error('Delete project failed:', error);
    return { success: false, message: error.message || 'Delete failed' };
  }
}

export async function getInventoryProjects(filter?: { zone?: string; status?: string; search?: string }) {
  try {
    const where: any = {};
    if (filter?.zone) where.city_zone = filter.zone;
    if (filter?.status) where.projectstatus = filter.status;
    if (filter?.search) {
      where.OR = [
        { project_name: { contains: filter.search, mode: 'insensitive' } },
        { region: { contains: filter.search, mode: 'insensitive' } },
        { developer: { name: { contains: filter.search, mode: 'insensitive' } } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      select: {
        id: true,
        project_name: true,
        city_zone: true,
        region: true,
        projectstatus: true,
        pricedisplay: true,
        pricemin: true,
        configurations: true,
        created_at: true,
        hero_image: true,
        developer: { select: { name: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    return {
      success: true,
      data: projects.map(p => ({
        id: p.id,
        project_name: p.project_name || 'Unnamed Project',
        bangalore_zone: p.city_zone || '',
        region: p.region || '',
        project_status: p.projectstatus || 'Under Construction',
        price_display: p.pricedisplay || 'Price on Request',
        price_min: p.pricemin ? Number(p.pricemin) : 0,
        configurations: p.configurations || [],
        created_at: p.created_at.toISOString(),
        hero_image_url: p.hero_image || undefined,
        developer: { developer_name: p.developer?.name || 'Unknown' }
      }))
    };
  } catch (err: any) {
    return { success: false, message: err.message, data: [] };
  }
}
