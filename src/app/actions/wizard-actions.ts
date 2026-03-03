'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/core/db/server';
import { WizardFormData } from '@/lib/wizard-schema';

// ============================================================================
// AUTH HELPER — Always fetch real role from DB, never trust client props
// ============================================================================

export async function getVerifiedUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Unauthorized: Not authenticated');


    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, role: true, is_active: true },
    });
    if (!dbUser) throw new Error('Unauthorized: User not found in database');
    if (!dbUser.is_active) throw new Error('Unauthorized: Account is not active');
    return dbUser;
}
// Duplicate auth helper removed

function requireRole(userRole: UserRole, allowed: UserRole[]) {
    if (!allowed.includes(userRole)) {
        throw new Error(`Forbidden: Role '${userRole}' is not permitted for this action`);
    }
}

// ============================================================================
// ACTION A: upsertDraft
// Allowed: vendor, salesman
// Saves/updates flat JSON payload to PropertyDraft table
// ============================================================================

export async function upsertDraft(
    formData: WizardFormData,
    draftId?: string,
): Promise<{ success: boolean; draftId: string }> {
    const user = await getVerifiedUser();
    requireRole(user.role, [UserRole.vendor, UserRole.salesman, UserRole.tenant_admin, UserRole.super_admin]);

    if (draftId) {
        // Edit mode — verify draft belongs to user and is still pending
        const draft = await prisma.propertyDraft.findUnique({ where: { id: draftId } });
        if (!draft) throw new Error('Draft not found');
        if (draft.vendor_id !== user.id) throw new Error('Forbidden: Not your draft');
        if (draft.status === 'approved') {
            throw new Error('Locked: This draft has already been approved and cannot be edited');
        }

        const updated = await prisma.propertyDraft.update({
            where: { id: draftId },
            data: { submission_data: formData as any },
        });
        revalidatePath('/vendor/drafts');
        return { success: true, draftId: updated.id };
    }

    // Create mode
    const draft = await prisma.propertyDraft.create({
        data: {
            vendor_id: user.id,
            submission_data: formData as any,
            status: 'pending',
        },
    });
    revalidatePath('/vendor/drafts');
    return { success: true, draftId: draft.id };
}

// ============================================================================
// ACTION A.5: fetchPropertyDrafts
// Allowed: tenant_admin, super_admin, vendor
// Fetches list of drafts safely via Prisma bypassing RLS
// ============================================================================

export async function fetchPropertyDrafts(filterStatus: string = 'all') {
    const user = await getVerifiedUser();

    // Vendors only see their own drafts. Admins see all.
    const isVendor = user.role === UserRole.vendor;

    const where: any = {};
    if (filterStatus !== 'all') {
        where.status = filterStatus;
    }
    if (isVendor) {
        where.vendor_id = user.id;
    }

    const drafts = await prisma.propertyDraft.findMany({
        where,
        orderBy: { created_at: 'desc' },
    });

    // Map Prisma result back to the frontend's expected PropertyDraft shape
    return drafts.map((d: any) => ({
        id: d.id,
        vendor_id: d.vendor_id,
        submission_data: d.submission_data,
        status: d.status,
        admin_notes: d.admin_notes,
        created_at: d.created_at.toISOString(),
        vendor_profile: {
            email: d.vendor?.email || 'Unknown'
        }
    }));
}

// ============================================================================
// ACTION B: approveDraftToLive
// Allowed: tenant_admin, super_admin
// Maps flat draft JSON → nested Prisma create, marks draft "approved"
// ============================================================================

export async function rejectPropertyDraft(draftId: string, reason?: string) {
    const user = await getVerifiedUser();
    requireRole(user.role, [UserRole.tenant_admin, UserRole.super_admin]);

    const draft = await prisma.propertyDraft.findUnique({ where: { id: draftId } });
    if (!draft) throw new Error('Draft not found');
    if (draft.status !== 'pending') throw new Error(`Cannot reject a draft that is already ${draft.status}`);

    const updated = await prisma.propertyDraft.update({
        where: { id: draftId },
        data: {
            status: 'rejected',
            admin_notes: reason || 'Rejected by admin'
        },
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/vendor/drafts');

    return { success: true, draftId: updated.id };
}

// ============================================================================
// ACTION B.2: deletePropertyDraft
// Allowed: tenant_admin, super_admin
// Safely removes a draft from the database.
// ============================================================================

export async function deletePropertyDraft(draftId: string) {
    const user = await getVerifiedUser();
    requireRole(user.role, [UserRole.tenant_admin, UserRole.super_admin]);

    const draft = await prisma.propertyDraft.findUnique({ where: { id: draftId } });
    if (!draft) throw new Error('Draft not found');

    await prisma.propertyDraft.delete({
        where: { id: draftId },
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/vendor/drafts');

    return { success: true, draftId };
}

// ============================================================================
// ACTION C: approveDraftToLive
// Allowed: tenant_admin, super_admin
// Maps flat draft JSON → nested Prisma create, marks draft "approved"
// ============================================================================

export async function approveDraftToLive(
    draftId: string,
    flatFormData: WizardFormData,
): Promise<{ success: boolean; projectId: string }> {
    const user = await getVerifiedUser();
    requireRole(user.role, [UserRole.tenant_admin, UserRole.super_admin]);

    const draft = await prisma.propertyDraft.findUnique({ where: { id: draftId } });
    if (!draft) throw new Error('Draft not found');
    if (draft.status === 'approved') throw new Error('Draft already approved');

    // ── Mapper: flat → nested Prisma create ──────────────────────────────────
    const dbUserExists = await prisma.user.findUnique({ where: { id: user.id } });

    const project = await prisma.project.create({
        data: {
            project_name: flatFormData.project_name,
            property_type: flatFormData.property_type,
            projectstatus: flatFormData.projectstatus,
            city: flatFormData.city,
            city_zone: flatFormData.city_zone,
            region: flatFormData.region,
            general_location: flatFormData.general_location,
            address_line: flatFormData.address_line,
            district: flatFormData.district,
            pincode: flatFormData.pincode,
            lat: flatFormData.lat,
            lng: flatFormData.lng,
            slug: flatFormData.slug,
            total_land_area: flatFormData.total_land_area,
            total_units: flatFormData.total_units,
            total_phases: flatFormData.total_phases,
            project_theme: flatFormData.project_theme,
            current_phase_under_sale: flatFormData.current_phase_under_sale,
            possession_month: flatFormData.possession_month,
            possession_year: flatFormData.possession_year,
            pricedisplay: flatFormData.pricedisplay,
            pricemin: flatFormData.pricemin,
            pricemax: flatFormData.pricemax,
            payment_plan_type: flatFormData.payment_plan_type,
            payment_plan_details: flatFormData.payment_plan_details,
            floor_rise_charges: flatFormData.floor_rise_charges,
            configurations: flatFormData.configurations ?? [],
            hero_image: flatFormData.hero_image,
            images: flatFormData.images ?? [],
            virtual_tour_url: flatFormData.virtual_tour_url,
            brochure_url: flatFormData.brochure_url,
            rera_registration_no: flatFormData.rera_registration_no,
            created_by: dbUserExists ? user.id : null,

            // ── Developer relation ────────────────────────────────────────────────
            ...(flatFormData.developer_name ? {
                developer: {
                    create: {
                        name: flatFormData.developer_name,
                        logo_url: flatFormData.developer_logo_url,
                        website: flatFormData.developer_website,
                        buildergrade: flatFormData.developer_buildergrade,
                        corporate_rera: flatFormData.developer_corporate_rera,
                        description: flatFormData.developer_description,
                        reputation: flatFormData.developer_reputation,
                        years_in_market: flatFormData.developer_years_in_market,
                        past_projects: flatFormData.developer_past_projects,
                        financial_strength: flatFormData.developer_financial_strength,
                    },
                },
            } : {}),

            // ── Specs relation ────────────────────────────────────────────────────
            specs: {
                create: {
                    no_of_towers: flatFormData.no_of_towers,
                    floors_per_tower: flatFormData.floors_per_tower,
                    units_per_floor: flatFormData.units_per_floor,
                    elevators_per_tower: flatFormData.elevators_per_tower,
                    service_elevators_per_tower: flatFormData.service_elevators_per_tower,
                    construction_type: flatFormData.construction_type,
                    structure_details: flatFormData.structure_details,
                    wall_finishing_interior: flatFormData.wall_finishing_interior,
                    wall_finishing_exterior: flatFormData.wall_finishing_exterior,
                    flooring_living_dining: flatFormData.flooring_living_dining,
                    flooring_master_bedroom: flatFormData.flooring_master_bedroom,
                    flooring_other_bedrooms: flatFormData.flooring_other_bedrooms,
                    flooring_balcony_utility: flatFormData.flooring_balcony_utility,
                    kitchen_countertop: flatFormData.kitchen_countertop,
                    kitchen_sink_details: flatFormData.kitchen_sink_details,
                    kitchen_dado_tiling: flatFormData.kitchen_dado_tiling,
                    gas_pipeline_provision: flatFormData.gas_pipeline_provision,
                    bathroom_sanitary_ware: flatFormData.bathroom_sanitary_ware,
                    bathroom_cp_fittings: flatFormData.bathroom_cp_fittings,
                    bathroom_dado_tiling: flatFormData.bathroom_dado_tiling,
                    main_door_specs: flatFormData.main_door_specs,
                    internal_doors_specs: flatFormData.internal_doors_specs,
                    windows_specs: flatFormData.windows_specs,
                    electrical_switches: flatFormData.electrical_switches,
                    power_backup: flatFormData.power_backup,
                    road_width: flatFormData.road_width,
                    water_source: flatFormData.water_source,
                    open_space_pct: flatFormData.open_space_pct,
                },
            },

            // ── Analysis relation ─────────────────────────────────────────────────
            analysis: {
                create: {
                    usp: flatFormData.usp,
                    usp_highlights: flatFormData.usp_highlights ?? [],
                    closing_pitch: flatFormData.closing_pitch,
                    target_customer: flatFormData.target_customer,
                    objection_handling: flatFormData.objection_handling
                        ? JSON.parse(flatFormData.objection_handling)
                        : undefined,
                    legal_notes: flatFormData.legal_notes,
                    timeline_risk: flatFormData.timeline_risk,
                    overall_rating: flatFormData.overall_rating,
                    pros: flatFormData.pros ?? [],
                    cons: flatFormData.cons ?? [],
                },
            },

            // ── Connectivity relation ─────────────────────────────────────────────
            connectivity: {
                create: {
                    distancetomainroad: flatFormData.distancetomainroad,
                    airportdistance: flatFormData.airportdistance,
                    railwaystationdistance: flatFormData.railwaystationdistance,
                    metrostationdistance: flatFormData.metrostationdistance,
                    busstopdistance: flatFormData.busstopdistance,
                },
            },

            // ── Amenities (array) ─────────────────────────────────────────────────
            ...(flatFormData.amenities?.length ? {
                amenities: {
                    create: flatFormData.amenities.map(a => ({
                        category: a.category,
                        name: a.name,
                        description: a.description,
                        size_specs: a.size_specs,
                    })),
                },
            } : {}),

            // ── Commercials (array) ───────────────────────────────────────────────
            ...(flatFormData.commercials?.length ? {
                commercials: {
                    create: flatFormData.commercials.map(c => ({
                        name: c.name,
                        amount: c.amount,
                        cost_type: c.cost_type,
                        payment_milestone: c.payment_milestone,
                    })),
                },
            } : {}),

            // ── Landmarks (array) ─────────────────────────────────────────────────
            ...(flatFormData.landmarks?.length ? {
                landmarks: {
                    create: flatFormData.landmarks.map(l => ({
                        category: l.category,
                        name: l.name,
                        distance_km: l.distance_km,
                        travel_time: l.travel_time,
                    })),
                },
            } : {}),

            // ── Competitors (array) ───────────────────────────────────────────────
            ...(flatFormData.competitors?.length ? {
                competitors: {
                    create: flatFormData.competitors.map(c => ({
                        name: c.name,
                        price_range: c.price_range,
                    })),
                },
            } : {}),

            // ── Units (array) ─────────────────────────────────────────────────────
            ...(flatFormData.units?.length ? {
                projectunits: {
                    create: flatFormData.units.map(u => ({
                        unitnumber: u.unitnumber,
                        tower: u.tower,
                        config: u.config,
                        type: u.type,
                        floornumber: u.floornumber,
                        actualsba: u.actualsba,
                        carpetarea: u.carpetarea,
                        udsarea: u.udsarea,
                        facing: u.facing,
                        wccount: u.wccount,
                        balconycount: u.balconycount,
                        pricepersqft: u.pricepersqft,
                        pricetotal: u.pricetotal,
                        status: u.status ?? 'Available',
                    })),
                },
            } : {}),
        },
    });

    // Mark draft as approved
    await prisma.propertyDraft.update({
        where: { id: draftId },
        data: { status: 'approved' },
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/inventory');
    return { success: true, projectId: project.id };
}

// ============================================================================
// ACTION C: updateLiveProject
// Allowed: tenant_admin, super_admin
// Maps flat form data to live Prisma upsert/update on all relations
// ============================================================================

export async function updateLiveProject(
    projectId: string,
    flatFormData: WizardFormData,
): Promise<{ success: boolean }> {
    const user = await getVerifiedUser();
    requireRole(user.role, [UserRole.tenant_admin, UserRole.super_admin]);

    // Update base project fields
    await prisma.project.update({
        where: { id: projectId },
        data: {
            project_name: flatFormData.project_name,
            property_type: flatFormData.property_type,
            projectstatus: flatFormData.projectstatus,
            city: flatFormData.city,
            city_zone: flatFormData.city_zone,
            region: flatFormData.region,
            general_location: flatFormData.general_location,
            address_line: flatFormData.address_line,
            district: flatFormData.district,
            pincode: flatFormData.pincode,
            lat: flatFormData.lat,
            lng: flatFormData.lng,
            total_land_area: flatFormData.total_land_area,
            total_units: flatFormData.total_units,
            total_phases: flatFormData.total_phases,
            project_theme: flatFormData.project_theme,
            possession_month: flatFormData.possession_month,
            possession_year: flatFormData.possession_year,
            pricedisplay: flatFormData.pricedisplay,
            pricemin: flatFormData.pricemin,
            pricemax: flatFormData.pricemax,
            payment_plan_type: flatFormData.payment_plan_type,
            payment_plan_details: flatFormData.payment_plan_details,
            floor_rise_charges: flatFormData.floor_rise_charges,
            configurations: flatFormData.configurations ?? [],
            hero_image: flatFormData.hero_image,
            images: flatFormData.images ?? [],
            virtual_tour_url: flatFormData.virtual_tour_url,
            brochure_url: flatFormData.brochure_url,
            rera_registration_no: flatFormData.rera_registration_no,
        },
    });

    // Upsert developer
    if (flatFormData.developer_name) {
        await prisma.projectDeveloper.upsert({
            where: { project_id: projectId },
            update: {
                name: flatFormData.developer_name,
                logo_url: flatFormData.developer_logo_url,
                website: flatFormData.developer_website,
                buildergrade: flatFormData.developer_buildergrade,
                corporate_rera: flatFormData.developer_corporate_rera,
                description: flatFormData.developer_description,
                reputation: flatFormData.developer_reputation,
                years_in_market: flatFormData.developer_years_in_market,
                past_projects: flatFormData.developer_past_projects,
                financial_strength: flatFormData.developer_financial_strength,
            },
            create: {
                project_id: projectId,
                name: flatFormData.developer_name,
                logo_url: flatFormData.developer_logo_url,
                website: flatFormData.developer_website,
                buildergrade: flatFormData.developer_buildergrade,
                corporate_rera: flatFormData.developer_corporate_rera,
                description: flatFormData.developer_description,
                reputation: flatFormData.developer_reputation,
                years_in_market: flatFormData.developer_years_in_market,
                past_projects: flatFormData.developer_past_projects,
                financial_strength: flatFormData.developer_financial_strength,
            },
        });
    }

    // Upsert specs
    await prisma.projectSpecification.upsert({
        where: { project_id: projectId },
        update: {
            no_of_towers: flatFormData.no_of_towers,
            floors_per_tower: flatFormData.floors_per_tower,
            units_per_floor: flatFormData.units_per_floor,
            elevators_per_tower: flatFormData.elevators_per_tower,
            service_elevators_per_tower: flatFormData.service_elevators_per_tower,
            construction_type: flatFormData.construction_type,
            structure_details: flatFormData.structure_details,
            wall_finishing_interior: flatFormData.wall_finishing_interior,
            wall_finishing_exterior: flatFormData.wall_finishing_exterior,
            flooring_living_dining: flatFormData.flooring_living_dining,
            flooring_master_bedroom: flatFormData.flooring_master_bedroom,
            flooring_other_bedrooms: flatFormData.flooring_other_bedrooms,
            flooring_balcony_utility: flatFormData.flooring_balcony_utility,
            kitchen_countertop: flatFormData.kitchen_countertop,
            kitchen_sink_details: flatFormData.kitchen_sink_details,
            kitchen_dado_tiling: flatFormData.kitchen_dado_tiling,
            gas_pipeline_provision: flatFormData.gas_pipeline_provision,
            bathroom_sanitary_ware: flatFormData.bathroom_sanitary_ware,
            bathroom_cp_fittings: flatFormData.bathroom_cp_fittings,
            bathroom_dado_tiling: flatFormData.bathroom_dado_tiling,
            main_door_specs: flatFormData.main_door_specs,
            internal_doors_specs: flatFormData.internal_doors_specs,
            windows_specs: flatFormData.windows_specs,
            electrical_switches: flatFormData.electrical_switches,
            power_backup: flatFormData.power_backup,
            road_width: flatFormData.road_width,
            water_source: flatFormData.water_source,
            open_space_pct: flatFormData.open_space_pct,
        },
        create: {
            project_id: projectId,
            no_of_towers: flatFormData.no_of_towers,
            floors_per_tower: flatFormData.floors_per_tower,
            units_per_floor: flatFormData.units_per_floor,
            elevators_per_tower: flatFormData.elevators_per_tower,
            service_elevators_per_tower: flatFormData.service_elevators_per_tower,
            construction_type: flatFormData.construction_type,
            structure_details: flatFormData.structure_details,
            wall_finishing_interior: flatFormData.wall_finishing_interior,
            wall_finishing_exterior: flatFormData.wall_finishing_exterior,
            flooring_living_dining: flatFormData.flooring_living_dining,
            flooring_master_bedroom: flatFormData.flooring_master_bedroom,
            flooring_other_bedrooms: flatFormData.flooring_other_bedrooms,
            flooring_balcony_utility: flatFormData.flooring_balcony_utility,
            kitchen_countertop: flatFormData.kitchen_countertop,
            kitchen_sink_details: flatFormData.kitchen_sink_details,
            kitchen_dado_tiling: flatFormData.kitchen_dado_tiling,
            gas_pipeline_provision: flatFormData.gas_pipeline_provision,
            bathroom_sanitary_ware: flatFormData.bathroom_sanitary_ware,
            bathroom_cp_fittings: flatFormData.bathroom_cp_fittings,
            bathroom_dado_tiling: flatFormData.bathroom_dado_tiling,
            main_door_specs: flatFormData.main_door_specs,
            internal_doors_specs: flatFormData.internal_doors_specs,
            windows_specs: flatFormData.windows_specs,
            electrical_switches: flatFormData.electrical_switches,
            power_backup: flatFormData.power_backup,
            road_width: flatFormData.road_width,
            water_source: flatFormData.water_source,
            open_space_pct: flatFormData.open_space_pct,
        },
    });

    // Upsert analysis
    await prisma.projectAnalysis.upsert({
        where: { project_id: projectId },
        update: {
            usp: flatFormData.usp,
            usp_highlights: flatFormData.usp_highlights ?? [],
            closing_pitch: flatFormData.closing_pitch,
            target_customer: flatFormData.target_customer,
            objection_handling: flatFormData.objection_handling ? JSON.parse(flatFormData.objection_handling) : undefined,
            legal_notes: flatFormData.legal_notes,
            timeline_risk: flatFormData.timeline_risk,
            overall_rating: flatFormData.overall_rating,
            pros: flatFormData.pros ?? [],
            cons: flatFormData.cons ?? [],
        },
        create: {
            project_id: projectId,
            usp: flatFormData.usp,
            usp_highlights: flatFormData.usp_highlights ?? [],
            closing_pitch: flatFormData.closing_pitch,
            target_customer: flatFormData.target_customer,
            objection_handling: flatFormData.objection_handling ? JSON.parse(flatFormData.objection_handling) : undefined,
            legal_notes: flatFormData.legal_notes,
            timeline_risk: flatFormData.timeline_risk,
            overall_rating: flatFormData.overall_rating,
            pros: flatFormData.pros ?? [],
            cons: flatFormData.cons ?? [],
        },
    });

    // Upsert connectivity
    await prisma.locationConnectivity.upsert({
        where: { project_id: projectId },
        update: {
            distancetomainroad: flatFormData.distancetomainroad,
            airportdistance: flatFormData.airportdistance,
            railwaystationdistance: flatFormData.railwaystationdistance,
            metrostationdistance: flatFormData.metrostationdistance,
            busstopdistance: flatFormData.busstopdistance,
        },
        create: {
            project_id: projectId,
            distancetomainroad: flatFormData.distancetomainroad,
            airportdistance: flatFormData.airportdistance,
            railwaystationdistance: flatFormData.railwaystationdistance,
            metrostationdistance: flatFormData.metrostationdistance,
            busstopdistance: flatFormData.busstopdistance,
        },
    });

    // Replace arrays (delete existing, re-create)
    await prisma.projectAmenity.deleteMany({ where: { project_id: projectId } });
    if (flatFormData.amenities?.length) {
        await prisma.projectAmenity.createMany({
            data: flatFormData.amenities.map(a => ({
                project_id: projectId,
                category: a.category,
                name: a.name,
                description: a.description,
                size_specs: a.size_specs,
            })),
        });
    }

    await prisma.projectCommercial.deleteMany({ where: { project_id: projectId } });
    if (flatFormData.commercials?.length) {
        await prisma.projectCommercial.createMany({
            data: flatFormData.commercials.map(c => ({
                project_id: projectId,
                name: c.name,
                amount: c.amount,
                cost_type: c.cost_type,
                payment_milestone: c.payment_milestone,
            })),
        });
    }

    await prisma.projectLandmark.deleteMany({ where: { project_id: projectId } });
    if (flatFormData.landmarks?.length) {
        await prisma.projectLandmark.createMany({
            data: flatFormData.landmarks.map(l => ({
                project_id: projectId,
                category: l.category,
                name: l.name,
                distance_km: l.distance_km,
                travel_time: l.travel_time,
            })),
        });
    }

    await prisma.projectCompetitor.deleteMany({ where: { project_id: projectId } });
    if (flatFormData.competitors?.length) {
        await prisma.projectCompetitor.createMany({
            data: flatFormData.competitors.map(c => ({
                project_id: projectId,
                name: c.name,
                price_range: c.price_range,
            })),
        });
    }

    revalidatePath(`/admin/inventory/${projectId}`);
    return { success: true };
}

// ============================================================================
// HELPER: flattenLiveProjectForWizard
// Converts a deeply nested Prisma project record back to flat WizardFormData
// Used by the admin "edit live" route to pre-populate the wizard
// ============================================================================

type PrismaProjectFull = Awaited<ReturnType<typeof fetchFullProject>>;

async function fetchFullProject(id: string) {
    return prisma.project.findUnique({
        where: { id },
        include: {
            developer: true,
            specs: true,
            analysis: true,
            connectivity: true,
            amenities: true,
            commercials: true,
            landmarks: true,
            competitors: true,
            projectunits: true,
        },
    });
}

export async function flattenLiveProjectForWizard(projectId: string): Promise<WizardFormData | null> {
    const p = await fetchFullProject(projectId);
    if (!p) return null;

    return {
        // Core project
        project_name: p.project_name,
        property_type: p.property_type ?? undefined,
        projectstatus: p.projectstatus ?? undefined,
        city: p.city ?? undefined,
        city_zone: (p as any).city_zone ?? undefined,
        region: p.region ?? undefined,
        general_location: p.general_location ?? undefined,
        address_line: p.address_line ?? undefined,
        district: p.district ?? undefined,
        pincode: p.pincode ?? undefined,
        lat: p.lat ?? undefined,
        lng: p.lng ?? undefined,
        slug: p.slug ?? undefined,
        total_land_area: p.total_land_area ?? undefined,
        total_units: p.total_units ?? undefined,
        total_phases: p.total_phases ?? undefined,
        project_theme: p.project_theme ?? undefined,
        current_phase_under_sale: p.current_phase_under_sale ?? undefined,
        possession_month: p.possession_month ?? undefined,
        possession_year: p.possession_year ?? undefined,
        pricedisplay: p.pricedisplay ?? undefined,
        pricemin: p.pricemin ? Number(p.pricemin) : undefined,
        pricemax: p.pricemax ? Number(p.pricemax) : undefined,
        payment_plan_type: (p as any).payment_plan_type ?? undefined,
        payment_plan_details: (p as any).payment_plan_details ?? undefined,
        floor_rise_charges: (p as any).floor_rise_charges ?? undefined,
        configurations: p.configurations,
        hero_image: p.hero_image ?? undefined,
        images: p.images,
        virtual_tour_url: p.virtual_tour_url ?? undefined,
        brochure_url: p.brochure_url ?? undefined,
        rera_registration_no: (p as any).rera_registration_no ?? undefined,

        // Developer
        developer_name: p.developer?.name ?? undefined,
        developer_logo_url: p.developer?.logo_url ?? undefined,
        developer_website: p.developer?.website ?? undefined,
        developer_buildergrade: p.developer?.buildergrade ?? undefined,
        developer_corporate_rera: p.developer?.corporate_rera ?? undefined,
        developer_description: p.developer?.description ?? undefined,
        developer_reputation: p.developer?.reputation ?? undefined,
        developer_years_in_market: p.developer?.years_in_market ?? undefined,
        developer_past_projects: p.developer?.past_projects ?? undefined,
        developer_financial_strength: p.developer?.financial_strength ?? undefined,

        // Specs
        no_of_towers: p.specs?.no_of_towers ?? undefined,
        floors_per_tower: p.specs?.floors_per_tower ?? undefined,
        units_per_floor: p.specs?.units_per_floor ?? undefined,
        elevators_per_tower: p.specs?.elevators_per_tower ?? undefined,
        service_elevators_per_tower: p.specs?.service_elevators_per_tower ?? undefined,
        construction_type: p.specs?.construction_type ?? undefined,
        structure_details: p.specs?.structure_details ?? undefined,
        wall_finishing_interior: p.specs?.wall_finishing_interior ?? undefined,
        wall_finishing_exterior: p.specs?.wall_finishing_exterior ?? undefined,
        flooring_living_dining: p.specs?.flooring_living_dining ?? undefined,
        flooring_master_bedroom: p.specs?.flooring_master_bedroom ?? undefined,
        flooring_other_bedrooms: p.specs?.flooring_other_bedrooms ?? undefined,
        flooring_balcony_utility: p.specs?.flooring_balcony_utility ?? undefined,
        kitchen_countertop: p.specs?.kitchen_countertop ?? undefined,
        kitchen_sink_details: p.specs?.kitchen_sink_details ?? undefined,
        kitchen_dado_tiling: p.specs?.kitchen_dado_tiling ?? undefined,
        gas_pipeline_provision: p.specs?.gas_pipeline_provision ?? undefined,
        bathroom_sanitary_ware: p.specs?.bathroom_sanitary_ware ?? undefined,
        bathroom_cp_fittings: p.specs?.bathroom_cp_fittings ?? undefined,
        bathroom_dado_tiling: p.specs?.bathroom_dado_tiling ?? undefined,
        main_door_specs: p.specs?.main_door_specs ?? undefined,
        internal_doors_specs: p.specs?.internal_doors_specs ?? undefined,
        windows_specs: p.specs?.windows_specs ?? undefined,
        electrical_switches: p.specs?.electrical_switches ?? undefined,
        power_backup: p.specs?.power_backup ?? undefined,
        road_width: p.specs?.road_width ?? undefined,
        water_source: p.specs?.water_source ?? undefined,
        open_space_pct: p.specs?.open_space_pct ?? undefined,

        // Analysis
        usp: p.analysis?.usp ?? undefined,
        usp_highlights: p.analysis?.usp_highlights ?? [],
        closing_pitch: p.analysis?.closing_pitch ?? undefined,
        target_customer: p.analysis?.target_customer ?? undefined,
        objection_handling: p.analysis?.objection_handling
            ? JSON.stringify(p.analysis.objection_handling)
            : undefined,
        legal_notes: p.analysis?.legal_notes ?? undefined,
        timeline_risk: p.analysis?.timeline_risk ?? undefined,
        overall_rating: p.analysis?.overall_rating ? Number(p.analysis.overall_rating) : undefined,
        pros: p.analysis?.pros ?? [],
        cons: p.analysis?.cons ?? [],

        // Connectivity
        distancetomainroad: p.connectivity?.distancetomainroad ?? undefined,
        airportdistance: p.connectivity?.airportdistance ?? undefined,
        railwaystationdistance: p.connectivity?.railwaystationdistance ?? undefined,
        metrostationdistance: p.connectivity?.metrostationdistance ?? undefined,
        busstopdistance: p.connectivity?.busstopdistance ?? undefined,

        // Arrays
        amenities: p.amenities.map(a => ({
            id: a.id,
            category: a.category ?? undefined,
            name: a.name ?? undefined,
            description: a.description ?? undefined,
            size_specs: a.size_specs ?? undefined,
        })),
        commercials: p.commercials.map(c => ({
            id: c.id,
            name: c.name ?? undefined,
            amount: c.amount ? Number(c.amount) : undefined,
            cost_type: c.cost_type ?? undefined,
            payment_milestone: c.payment_milestone ?? undefined,
        })),
        landmarks: p.landmarks.map(l => ({
            id: l.id,
            category: l.category ?? undefined,
            name: l.name ?? undefined,
            distance_km: l.distance_km ?? undefined,
            travel_time: l.travel_time ?? undefined,
        })),
        competitors: p.competitors.map(c => ({
            id: c.id,
            name: c.name ?? undefined,
            price_range: c.price_range ?? undefined,
        })),
        units: p.projectunits.map(u => ({
            id: u.id,
            unitnumber: u.unitnumber,
            tower: typeof (u as any).tower === 'string' ? (u as any).tower : undefined,
            config: u.config ?? undefined,
            type: u.type ?? undefined,
            floornumber: u.floornumber ?? undefined,
            actualsba: u.actualsba ?? undefined,
            carpetarea: u.carpetarea ?? undefined,
            udsarea: u.udsarea ?? undefined,
            facing: u.facing ?? undefined,
            wccount: u.wccount ?? undefined,
            balconycount: u.balconycount ?? undefined,
            pricepersqft: u.pricepersqft ?? undefined,
            pricetotal: u.pricetotal ? Number(u.pricetotal) : undefined,
            status: u.status ?? undefined,
        })),
    };
}
