// src/modules/inventory/actions-v7.ts
// Server actions for fetching and filtering properties (READ operations)
// Updated to match REAL_ESTATE_SCHEMA_FINAL.sql

'use server';

import { createClient } from '@/core/db/server';
import {
  Project,
  ProjectFull,
  FilterCriteria,
  ProjectStatus,
  BangaloreZone,
} from './types-v7';

// =====================================================
// FETCH ALL PROJECTS (with filters)
// =====================================================

export async function fetchProjectsFiltered(
  filters?: FilterCriteria
): Promise<{ success: boolean; data?: ProjectFull[]; error?: string }> {
  try {
    const supabase = await createClient();

    // Start query
    let query = supabase
      .from('projects')
      .select(
        `
        *,
        developer:developers(
          id,
          developer_name,
          builder_grade,
          logo_url,
          reputation_score
        )
      `
      )
      .order('created_at', { ascending: false });

    // =====================================================
    // FILTER: Project Status (hide DRAFT/PENDING from public)
    // =====================================================
    
    // Check user role
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.user_metadata?.role === 'Super Admin' || 
                    user?.user_metadata?.role === 'Admin' ||
                    user?.user_metadata?.role === 'Manager';

    if (!isAdmin) {
      // Public users: only show live projects
      query = query.not('project_status', 'in', '("DRAFT","PENDING_APPROVAL")');
    } else if (filters?.status && filters.status.length > 0) {
      // Admin with status filter
      query = query.in('project_status', filters.status);
    }

    // =====================================================
    // FILTER: Zones
    // =====================================================
    if (filters?.zones && filters.zones.length > 0) {
      query = query.in('bangalore_zone', filters.zones);
    }

    // =====================================================
    // FILTER: Regions
    // =====================================================
    if (filters?.regions && filters.regions.length > 0) {
      query = query.in('region', filters.regions);
    }

    // =====================================================
    // FILTER: Price Range (using cached price_min/price_max)
    // =====================================================
    if (filters?.minPrice !== undefined && filters.minPrice > 0) {
      query = query.gte('price_min', filters.minPrice);
    }
    if (filters?.maxPrice !== undefined && filters.maxPrice > 0) {
      query = query.lte('price_max', filters.maxPrice);
    }

    // =====================================================
    // FILTER: Developer IDs
    // =====================================================
    if (filters?.developer_ids && filters.developer_ids.length > 0) {
      query = query.in('developer_id', filters.developer_ids);
    }

    // =====================================================
    // FILTER: Builder Grade
    // =====================================================
    if (filters?.builder_grades && filters.builder_grades.length > 0) {
      query = query.in('builder_grade', filters.builder_grades);
    }

    // =====================================================
    // FILTER: Property Types
    // =====================================================
    if (filters?.property_types && filters.property_types.length > 0) {
      query = query.in('property_type', filters.property_types);
    }

    // =====================================================
    // FILTER: Configurations (uses cached array)
    // =====================================================
    if (filters?.configurations && filters.configurations.length > 0) {
      // PostgreSQL array overlap operator
      query = query.overlaps('configurations', filters.configurations);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Fetch projects error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ProjectFull[] };
  } catch (error: any) {
    console.error('Fetch projects exception:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// FETCH SINGLE PROJECT BY ID (with all relationships)
// =====================================================

export async function fetchProjectById(
  projectId: string
): Promise<{ success: boolean; data?: ProjectFull; error?: string }> {
  try {
    const supabase = await createClient();

    // Fetch project with developer
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(
        `
        *,
        developer:developers(*)
      `
      )
      .eq('id', projectId)
      .single();

    if (projectError) {
      return { success: false, error: projectError.message };
    }

    // Fetch related data in parallel
    const [
      { data: units },
      { data: templates },
      { data: analysis },
      { data: amenityLinks },
      { data: landmarks },
      { data: competitors },
      { data: itParks },
      { data: schools },
      { data: hospitals },
      { data: malls },
    ] = await Promise.all([
      supabase.from('units').select('*').eq('project_id', projectId),
      supabase.from('unit_templates').select('*').eq('project_id', projectId),
      supabase.from('project_analysis').select('*').eq('project_id', projectId).single(),
      supabase
        .from('project_amenities_link')
        .select(
          `
          *,
          amenity:amenities_master(amenity_name, category)
        `
        )
        .eq('project_id', projectId),
      supabase.from('project_landmarks').select('*').eq('project_id', projectId),
      supabase.from('project_competitors').select('*').eq('project_id', projectId),
      supabase.from('it_parks_proximity').select('*').eq('project_id', projectId),
      supabase.from('schools_nearby').select('*').eq('project_id', projectId),
      supabase.from('hospitals_nearby').select('*').eq('project_id', projectId),
      supabase.from('shopping_malls_nearby').select('*').eq('project_id', projectId),
    ]);

    const fullProject: ProjectFull = {
      ...project,
      units: units || [],
      unit_templates: templates || [],
      analysis: analysis || undefined,
      amenities: amenityLinks || [],
      landmarks: landmarks || [],
      competitors: competitors || [],
      it_parks: itParks || [],
      schools: schools || [],
      hospitals: hospitals || [],
      malls: malls || [],
    };

    return { success: true, data: fullProject };
  } catch (error: any) {
    console.error('Fetch project by ID error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// FETCH PROJECTS FOR MAP (lightweight, only needed fields)
// =====================================================

export async function fetchProjectsForMap(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    project_name: string;
    latitude: number;
    longitude: number;
    bangalore_zone?: BangaloreZone;
    price_display?: string;
    configurations?: string[];
    hero_image_url?: string;
    gallery_images?: string[];
    developer_name?: string;
    project_status?: ProjectStatus;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.user_metadata?.role === 'Super Admin' || 
                    user?.user_metadata?.role === 'Admin' ||
                    user?.user_metadata?.role === 'Manager';

    let query = supabase
      .from('projects')
      .select(
        `
        id,
        project_name,
        latitude,
        longitude,
        bangalore_zone,
        price_display,
        configurations,
        hero_image_url,
        gallery_images,
        project_status,
        developer:developers(developer_name)
      `
      );

    // Filter out drafts for non-admins
    if (!isAdmin) {
      query = query.not('project_status', 'in', '("DRAFT","PENDING_APPROVAL")');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch map projects error:', error);
      return { success: false, error: error.message };
    }

    // Flatten developer name
    const flatData = data?.map((p: any) => ({
      ...p,
      developer_name: p.developer?.developer_name || 'Unknown Developer',
    }));

    return { success: true, data: flatData };
  } catch (error: any) {
    console.error('Fetch map projects exception:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// FETCH FILTER OPTIONS (for dropdowns)
// =====================================================

export async function fetchFilterOptions(): Promise<{
  success: boolean;
  data?: {
    zones: BangaloreZone[];
    regions: string[];
    developers: Array<{ id: string; name: string }>;
    configurations: string[];
    property_types: string[];
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Fetch distinct values
    const [
      { data: projects },
      { data: developers },
    ] = await Promise.all([
      supabase
        .from('projects')
        .select('bangalore_zone, region, property_type, configurations')
        .not('project_status', 'in', '("DRAFT","PENDING_APPROVAL")'),
      supabase.from('developers').select('id, developer_name').eq('is_active', true),
    ]);

    // Extract unique values
    const zones = Array.from(
      new Set(
        projects
          ?.map((p) => p.bangalore_zone)
          .filter((z): z is BangaloreZone => z != null)
      )
    );

    const regions = Array.from(
      new Set(
        projects?.map((p) => p.region).filter((r): r is string => r != null && r !== '')
      )
    );

    const propertyTypes = Array.from(
      new Set(
        projects
          ?.map((p) => p.property_type)
          .filter((pt): pt is string => pt != null && pt !== '')
      )
    );

    // Flatten configurations array
    const allConfigs = projects?.flatMap((p) => p.configurations || []) || [];
    const configurations = Array.from(new Set(allConfigs));

    const developersList =
      developers?.map((d) => ({
        id: d.id,
        name: d.developer_name,
      })) || [];

    return {
      success: true,
      data: {
        zones,
        regions,
        developers: developersList,
        configurations,
        property_types: propertyTypes,
      },
    };
  } catch (error: any) {
    console.error('Fetch filter options error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// FETCH AMENITIES MASTER LIST
// =====================================================

export async function fetchAmenitiesMaster(): Promise<{
  success: boolean;
  data?: Array<{ id: string; amenity_name: string; category: string }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('amenities_master')
      .select('id, amenity_name, category')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Fetch amenities error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// FETCH DEVELOPERS LIST
// =====================================================

export async function fetchDevelopers(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    developer_name: string;
    builder_grade?: string;
    logo_url?: string;
  }>;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('developers')
      .select('id, developer_name, builder_grade, logo_url')
      .order('developer_name', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Fetch developers error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// SEARCH PROJECTS BY NAME OR DEVELOPER
// =====================================================

export async function searchProjects(
  searchTerm: string
): Promise<{ success: boolean; data?: ProjectFull[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('projects')
      .select(
        `
        *,
        developer:developers(developer_name, builder_grade)
      `
      )
      .or(`project_name.ilike.%${searchTerm}%,region.ilike.%${searchTerm}%`)
      .not('project_status', 'in', '("DRAFT","PENDING_APPROVAL")')
      .limit(20);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as ProjectFull[] };
  } catch (error: any) {
    console.error('Search projects error:', error);
    return { success: false, error: error.message };
  }
}

// =====================================================
// FETCH UNITS FOR A PROJECT
// =====================================================

export async function fetchUnitsByProject(
  projectId: string,
  filters?: {
    config_type?: string;
    min_price?: number;
    max_price?: number;
    facing?: string;
    status?: string;
  }
): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('units')
      .select(
        `
        *,
        template:unit_templates(template_name, config_type)
      `
      )
      .eq('project_id', projectId);

    // Apply filters
    if (filters?.config_type) {
      query = query.eq('template.config_type', filters.config_type);
    }
    if (filters?.min_price) {
      query = query.gte('price_total', filters.min_price);
    }
    if (filters?.max_price) {
      query = query.lte('price_total', filters.max_price);
    }
    if (filters?.facing) {
      query = query.eq('facing', filters.facing);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Fetch units error:', error);
    return { success: false, error: error.message };
  }
}
