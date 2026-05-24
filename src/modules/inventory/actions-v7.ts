'use server';

import { prisma } from '@/lib/prisma';
import { unstable_cache as cache, revalidatePath, revalidateTag } from 'next/cache';

import type {
  ProjectV7,
  ProjectFullV7,
  FilterCriteriaV7,
  CityZone,
  ProjectStatus,
  ProjectUnitV7,
  ProjectAmenityV7,
  ProjectLandmarkV7,
  ProjectCommercialV7,
  ProjectCompetitorV7,
} from './types-v7';

// Helper to serialize Prisma objects (Date → ISO string, Decimal → number, etc.)
function serialize<T>(obj: any): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) {
    return obj.map(item => serialize(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    if (obj instanceof Date) return obj.toISOString() as unknown as T;
    if (typeof obj.toNumber === 'function') return obj.toNumber() as unknown as T;
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = serialize(obj[key]);
      }
    }
    return newObj as T;
  }
  return obj as T;
}

// ============================================
// READ OPERATIONS (CACHED)
// ============================================

export const getAllProjectsV7 = cache(
  async (filters?: FilterCriteriaV7): Promise<ProjectV7[]> => {
    try {
      const where: any = {};

      if (filters?.city_zones?.length) {
        where.OR = filters.city_zones.map(z => ({
          OR: [
            { city_zone: z },
            { general_location: z },
          ],
        }));
      }

      // Add more filters later (status, price range, possession, etc.)
      // if (filters?.status?.length) where.projectstatus = { in: filters.status };
      // etc.

      const projects = await prisma.project.findMany({
        where,
        select: {
          id: true,
          project_name: true,
          general_location: true,
          address_line: true,
          city_zone: true,
          lat: true,
          lng: true,
          projectstatus: true,
          pricedisplay: true,
          pricemin: true,
          pricemax: true,
          payment_plan_type: true,
          payment_plan_details: true,
          floor_rise_charges: true,
          rera_registration_no: true,
          hero_image: true,
          possession_month: true,
          possession_year: true,
          configurations: true,
          created_at: true,
          projectunits: {
            select: {
              config: true,
              type: true,
              facing: true,
              balconycount: true,
              wccount: true,
              status: true,
            }
          },
          developer: {
            select: {
              buildergrade: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
      });

      return projects.map(p => ({
        id: p.id,
        project_name: p.project_name,
        projectstatus: p.projectstatus ?? 'UnderConstruction',
        developer_buildergrade: p.developer?.buildergrade ?? undefined,
        city_zone: p.city_zone ?? undefined,
        region: p.general_location ?? p.city_zone ?? undefined,
        address_line: p.address_line ?? undefined,
        lat: p.lat ? Number(p.lat) : undefined,
        lng: p.lng ? Number(p.lng) : undefined,
        pricedisplay: p.pricedisplay ?? 'Price on Request',
        pricemin: p.pricemin ? Number(p.pricemin) : undefined,
        pricemax: p.pricemax ? Number(p.pricemax) : undefined,
        payment_plan_type: p.payment_plan_type ?? undefined,
        payment_plan_details: p.payment_plan_details ?? undefined,
        floor_rise_charges: p.floor_rise_charges ?? undefined,
        rera_registration_no: p.rera_registration_no ?? undefined,
        hero_image: p.hero_image ?? undefined,
        possession_date: p.possession_month && p.possession_year
          ? `${p.possession_month} ${p.possession_year}`
          : p.possession_year
            ? String(p.possession_year)
            : undefined,
        configurations: p.configurations ?? [],
        units: p.projectunits.map(u => ({
          config: u.config ?? undefined,
          type: u.type ?? undefined,
          facing: u.facing ?? undefined,
          balconycount: u.balconycount !== null ? (u.balconycount >= 5 ? '5+' : String(u.balconycount)) : undefined,
          wccount: u.wccount !== null ? (u.wccount >= 6 ? '6+' : String(u.wccount)) : undefined,
          status: u.status ?? undefined,
        })) as ProjectUnitV7[],
      })) as ProjectV7[];
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      return [];
    }
  },
  ['all-projects-v7'],
  { revalidate: 300, tags: ['projects'] }
);

export const getProjectByIdV7 = cache(
  async (projectId: string): Promise<ProjectFullV7 | null> => {
    try {
      const p = await prisma.project.findUnique({
        where: { id: projectId },
        include: {
          projectunits: true,
          amenities: true,
          landmarks: true,
          commercials: true,
          analysis: true,
          developer: true,
          competitors: true,
          specs: true,
          connectivity: true,
        },
      });

      if (!p) return null;

      const units = p.projectunits.map(u => ({
        id: u.id,
        unitnumber: u.unitnumber,
        floornumber: u.floornumber ?? undefined,
        type: u.type ?? undefined,
        config: u.config ?? undefined,
        tower: u.tower ?? undefined,
        status: u.status ?? undefined,
        actualsba: u.actualsba ?? undefined,
        carpetarea: u.carpetarea ?? undefined,
        udsarea: u.udsarea ?? undefined,
        facing: u.facing ?? undefined,
        balconycount: u.balconycount !== null ? (u.balconycount >= 5 ? '5+' : String(u.balconycount)) : undefined,
        wccount: u.wccount !== null ? (u.wccount >= 6 ? '6+' : String(u.wccount)) : undefined,
        pricetotal: u.pricetotal ? Number(u.pricetotal) : undefined,
        pricepersqft: u.pricepersqft ?? undefined,
      })) as ProjectUnitV7[];

      const priceMinStored = p.pricemin ? Number(p.pricemin) : null;
      const priceMaxStored = p.pricemax ? Number(p.pricemax) : null;

      const computedMin = units.length > 0
        ? Math.min(...units.map(u => u.pricetotal ?? Infinity))
        : null;
      const computedMax = units.length > 0
        ? Math.max(...units.map(u => u.pricetotal ?? -Infinity))
        : null;

      const finalMin = priceMinStored ?? (computedMin !== Infinity ? computedMin : undefined);
      const finalMax = priceMaxStored ?? (computedMax !== -Infinity ? computedMax : undefined);

      return {
        // Base ProjectV7
        id: p.id,
        project_name: p.project_name,
        projectstatus: p.projectstatus ?? 'UnderConstruction',
        developer_buildergrade: p.developer?.buildergrade ?? undefined,
        city_zone: p.city_zone ?? undefined,
        region: p.general_location ?? p.city_zone ?? undefined,
        address_line: p.address_line ?? undefined,
        lat: p.lat ? Number(p.lat) : undefined,
        lng: p.lng ? Number(p.lng) : undefined,
        pricedisplay: p.pricedisplay ?? 'Price on Request',
        pricemin: finalMin,
        pricemax: finalMax,
        payment_plan_type: p.payment_plan_type ?? undefined,
        payment_plan_details: p.payment_plan_details ?? undefined,
        floor_rise_charges: p.floor_rise_charges ?? undefined,
        rera_registration_no: p.rera_registration_no ?? undefined,
        hero_image: p.hero_image ?? undefined,
        possession_date: p.possession_month && p.possession_year
          ? `${p.possession_month} ${p.possession_year}`
          : p.possession_year
            ? String(p.possession_year)
            : undefined,
        configurations: p.configurations ?? [],

        // ProjectFullV7 Extras
        total_land_area: p.total_land_area ?? undefined,
        total_units: units.length,
        total_phases: p.total_phases ?? undefined,
        project_theme: p.project_theme ?? undefined,
        current_phase_under_sale: p.current_phase_under_sale ?? undefined,
        brochure_url: p.brochure_url ?? undefined,
        virtual_tour_url: p.virtual_tour_url ?? undefined,

        // Developer
        developer_name: p.developer?.name ?? undefined,
        developer_logo_url: p.developer?.logo_url ?? undefined,
        developer_website: p.developer?.website ?? undefined,
        developer_description: p.developer?.description ?? undefined,
        developer_reputation: p.developer?.reputation ?? undefined,
        developer_years_in_market: p.developer?.years_in_market ?? undefined,
        developer_past_projects: p.developer?.past_projects ?? undefined,
        developer_corporate_rera: p.developer?.corporate_rera ?? undefined,
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
        objection_handling: p.analysis?.objection_handling ?? undefined,
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
        units,
        amenities: serialize(p.amenities) as ProjectAmenityV7[],
        landmarks: serialize(p.landmarks) as ProjectLandmarkV7[],
        commercials: serialize(p.commercials) as ProjectCommercialV7[],
        competitors: serialize(p.competitors) as ProjectCompetitorV7[],
      } as ProjectFullV7;
    } catch (error) {
      console.error('Failed to fetch project by ID:', error);
      return null;
    }
  },
  ['project-by-id-v7'],
  { revalidate: 300, tags: ['projects'] }
);

export const getMapProjectsV7 = cache(
  async (): Promise<ProjectV7[]> => {
    try {
      const projects = await prisma.project.findMany({
        where: {
          lat: { not: null },
          lng: { not: null },
        },
        select: {
          id: true,
          project_name: true,
          general_location: true,
          city_zone: true,
          property_type: true,
          lat: true,
          lng: true,
          projectstatus: true,
          pricedisplay: true,
          pricemin: true,
          pricemax: true,
          hero_image: true,
          possession_month: true,
          possession_year: true,
          configurations: true,
          specs: {
            select: { construction_type: true },
          },
          projectunits: {
            select: {
              config: true,
              type: true,
              facing: true,
              balconycount: true,
              wccount: true,
              status: true,
            }
          },
          developer: {
            select: {
              buildergrade: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
      });

      return projects.map(p => ({
        id: p.id,
        project_name: p.project_name,
        projectstatus: p.projectstatus ?? 'UnderConstruction',
        developer_buildergrade: p.developer?.buildergrade ?? undefined,
        city_zone: p.city_zone ?? undefined,
        region: p.general_location ?? p.city_zone ?? undefined,
        address_line: undefined, // Map projects don't need address
        lat: Number(p.lat),
        lng: Number(p.lng),
        pricedisplay: p.pricedisplay ?? 'Price on Request',
        pricemin: p.pricemin ? Number(p.pricemin) : undefined,
        pricemax: p.pricemax ? Number(p.pricemax) : undefined,
        payment_plan_type: undefined,
        payment_plan_details: undefined,
        floor_rise_charges: undefined,
        rera_registration_no: undefined,
        hero_image: p.hero_image ?? undefined,
        possession_date: p.possession_month && p.possession_year
          ? `${p.possession_month} ${p.possession_year}`
          : p.possession_year
            ? String(p.possession_year)
            : undefined,
        configurations: p.configurations ?? [],
        units: p.projectunits.map(u => ({
          config: u.config ?? undefined,
          type: u.type ?? undefined,
          facing: u.facing ?? undefined,
          balconycount: u.balconycount !== null ? (u.balconycount >= 5 ? '5+' : String(u.balconycount)) : undefined,
          wccount: u.wccount !== null ? (u.wccount >= 6 ? '6+' : String(u.wccount)) : undefined,
          status: u.status ?? undefined,
        })) as ProjectUnitV7[],
      })) as ProjectV7[];
    } catch (error) {
      console.error('Error fetching map projects:', error);
      return [];
    }
  },
  ['map-projects-v7'],
  { revalidate: 300, tags: ['projects'] }
);

export const getFilterOptionsV7 = cache(
  async () => {
    try {
      const [zones, statuses, grades, years, types, configsResult] = await Promise.all([
        prisma.project.findMany({
          where: { city_zone: { not: null } },
          select: { city_zone: true },
          distinct: ['city_zone'],
        }),
        prisma.project.findMany({
          where: { projectstatus: { not: null } },
          select: { projectstatus: true },
          distinct: ['projectstatus'],
        }),
        prisma.projectDeveloper.findMany({
          where: { buildergrade: { not: null } },
          select: { buildergrade: true },
          distinct: ['buildergrade'],
        }),
        prisma.project.findMany({
          where: { possession_year: { not: null } },
          select: { possession_year: true },
          distinct: ['possession_year'],
        }),
        prisma.project.findMany({
          where: { property_type: { not: null } },
          select: { property_type: true },
          distinct: ['property_type'],
        }),
        prisma.projectUnit.groupBy({
          by: ['config'],
          where: { config: { not: null } },
          _count: { config: true },
        }),
      ]);

      const uniqueZones = Array.from(new Set([...['North', 'South', 'East', 'West'], ...zones.map(z => z.city_zone).filter(Boolean)])) as CityZone[];
      const uniqueStatuses = Array.from(new Set([...['Pre-Launch', 'Under Construction', 'Nearing Completion', 'Ready to Move', 'Sold Out'], ...statuses.map(s => s.projectstatus).filter(Boolean)]));
      const uniqueGrades = Array.from(new Set([...['A+', 'A', 'A-', 'B+', 'B'], ...grades.map(g => g.buildergrade).filter(Boolean)]));
      const uniqueYears = years.map(y => y.possession_year).filter(Boolean);
      const uniquePropertyTypes = Array.from(new Set([...['Apartments', 'Villas', 'Plots', 'Row Houses', 'Penthouse'], ...types.map(t => t.property_type).filter(Boolean)])) as string[];

      const uniqueConfigs = configsResult.map(c => c.config).filter(Boolean);
      const dbBhks = uniqueConfigs.filter(c => c?.toLowerCase().includes('bhk'));
      const finalBhks = Array.from(new Set([...['1BHK', '2BHK', '3BHK', '4BHK', '5BHK'], ...dbBhks]));
      const oldTypes = uniqueConfigs.filter(c => c && !c.toLowerCase().includes('bhk'));
      const finalTypes = Array.from(new Set([...uniquePropertyTypes, ...oldTypes]));

      return {
        city_zones: uniqueZones,
        statuses: uniqueStatuses,
        builderGrades: uniqueGrades,
        possessionYears: uniqueYears,
        configurations: {
          bhk: finalBhks,
          types: finalTypes,
        },
        technologies: ['Mivan', 'RCC', 'Precast', 'Other'],
      };
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      return {
        zones: [],
        statuses: [],
        configurations: { bhk: [], types: [] },
        builderGrades: [],
        possessionYears: [],
        technologies: [],
      };
    }
  }
);

export const getAllDevelopersV7 = cache(
  async () => {
    try {
      return await prisma.projectDeveloper.findMany({
        select: {
          id: true,
          project_id: true,
          name: true,
          reputation: true,
          buildergrade: true,
          logo_url: true,
          years_in_market: true,
          corporate_rera: true,
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Failed to fetch developers:', error);
      return [];
    }
  }
);

export async function searchProjectsV7(searchTerm: string) {
  const term = searchTerm?.trim();
  if (!term) return [];

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { project_name: { contains: term, mode: 'insensitive' } },
          { general_location: { contains: term, mode: 'insensitive' } },
          { city_zone: { contains: term, mode: 'insensitive' } },
          { address_line: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        project_name: true,
        general_location: true,
        address_line: true,
        lat: true,
        lng: true,
        projectstatus: true,
        pricedisplay: true,
        hero_image: true,
        pricemin: true,
        pricemax: true,
      },
      orderBy: { created_at: 'desc' },
      take: 10,
    });

    return projects.map(p => serialize({
      id: p.id,
      project_name: p.project_name,
      region: p.general_location,
      lat: p.lat ? Number(p.lat) : undefined,
      lng: p.lng ? Number(p.lng) : undefined,
      projectstatus: p.projectstatus,
      pricedisplay: p.pricedisplay,
      hero_image: p.hero_image,
      pricemin: p.pricemin ? Number(p.pricemin) : undefined,
      pricemax: p.pricemax ? Number(p.pricemax) : undefined,
    }));
  } catch (error) {
    console.error('Failed to search projects:', error);
    return [];
  }
}

// Cache invalidation helpers
export async function invalidateProjectCache(projectId?: string) {
  // @ts-ignore
  revalidateTag('projects');
  revalidatePath('/dashboard');
  if (projectId) {
    revalidatePath(`/admin/inventory/${projectId}`);
  }
}

export async function invalidateMasterDataCache() {
  // @ts-ignore
  revalidateTag('projects');
  revalidatePath('/dashboard');
  revalidatePath('/admin');
}