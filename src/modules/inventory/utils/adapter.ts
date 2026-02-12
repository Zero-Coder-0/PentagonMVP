// src/modules/inventory/utils/adapter.ts
// Adapters to transform database models to UI-friendly formats
// Updated to match REAL_ESTATE_SCHEMA_FINAL.sql

import {
  Project,
  ProjectFull,
  Unit,
  Developer,
  ProjectAnalysis,
} from '../types-v7';

// =====================================================
// PROJECT ADAPTER (DB → UI)
// =====================================================

/**
 * Transforms raw database project to UI-friendly format
 */
export function adaptProjectForUI(project: any): ProjectFull {
  return {
    // Basic fields
    id: project.id,
    project_name: project.project_name,
    slug: project.slug,
    developer_id: project.developer_id,
    
    // Geolocation
    latitude: parseFloat(project.latitude),
    longitude: parseFloat(project.longitude),
    
    // Address
    address_line: project.address_line,
    region: project.region,
    city: project.city || 'Bengaluru',
    pincode: project.pincode,
    
    // Zone & Status
    bangalore_zone: project.bangalore_zone,
    project_status: project.project_status,
    possession_date: project.possession_date,
    
    // Property Details
    property_type: project.property_type,
    total_land_area: project.total_land_area,
    total_units: project.total_units,
    number_of_phases: project.number_of_phases,
    current_phase_under_sale: project.current_phase_under_sale,
    floor_levels: project.floor_levels,
    construction_type: project.construction_type,
    construction_technology: project.construction_technology,
    elevators_per_tower: project.elevators_per_tower,
    open_space_percent: project.open_space_percent,
    project_theme: project.project_theme,
    usp: project.usp,
    rera_registration_no: project.rera_registration_no,
    
    // CACHED FIELDS (from triggers)
    price_min: project.price_min,
    price_max: project.price_max,
    price_display: project.price_display,
    price_per_sqft: project.price_per_sqft,
    onwards_pricing: project.onwards_pricing,
    configurations: project.configurations || [],
    
    // Clubhouse
    clubhouse_size: project.clubhouse_size,
    clubhouse_charges: project.clubhouse_charges,
    
    // Costs
    payment_plan: project.payment_plan,
    floor_rise_charges: project.floor_rise_charges,
    car_parking_cost: project.car_parking_cost,
    infrastructure_charges: project.infrastructure_charges,
    sinking_fund: project.sinking_fund,
    maintenance_charges: project.maintenance_charges,
    
    // Gallery Images (cached array)
    gallery_images: project.gallery_images || [],
    
    // JSONB Fields
    specifications: project.specifications || {},
    custom_amenities: project.custom_amenities || {},
    nearby_summary: project.nearby_summary || {},
    
    // WhatsApp Pitch
    whatsapp_pitch_headline: project.whatsapp_pitch_headline,
    whatsapp_pitch_highlights: project.whatsapp_pitch_highlights || [],
    whatsapp_pitch_cta: project.whatsapp_pitch_cta,
    
    // Builder Grade
    builder_grade: project.builder_grade,
    
    // Media
    hero_image_url: project.hero_image_url,
    brochure_url: project.brochure_url,
    marketing_kit_url: project.marketing_kit_url,
    
    // Metadata
    created_at: project.created_at,
    updated_at: project.updated_at,
    created_by: project.created_by,
    
    // Joined data (if available)
    developer: project.developer ? adaptDeveloperForUI(project.developer) : undefined,
    units: project.units ? project.units.map(adaptUnitForUI) : [],
    unit_templates: project.unit_templates || [],
    analysis: project.analysis ? adaptAnalysisForUI(project.analysis) : undefined,
    amenities: project.amenities || [],
    landmarks: project.landmarks || [],
    competitors: project.competitors || [],
    it_parks: project.it_parks || [],
    schools: project.schools || [],
    hospitals: project.hospitals || [],
    malls: project.malls || [],
  };
}

// =====================================================
// DEVELOPER ADAPTER
// =====================================================

export function adaptDeveloperForUI(developer: any): Developer {
  return {
    id: developer.id,
    developer_name: developer.developer_name,
    slug: developer.slug,
    builder_grade: developer.builder_grade,
    established_year: developer.established_year,
    headquarters_location: developer.headquarters_location,
    gst_number: developer.gst_number,
    rera_registration: developer.rera_registration,
    office_address: developer.office_address,
    office_phone: developer.office_phone,
    office_email: developer.office_email,
    website_url: developer.website_url,
    years_in_market: developer.years_in_market,
    total_completed_projects: developer.total_completed_projects,
    reputation_score: developer.reputation_score,
    financial_strength: developer.financial_strength,
    construction_quality: developer.construction_quality,
    customer_feedback: developer.customer_feedback,
    logo_url: developer.logo_url,
    created_at: developer.created_at,
    updated_at: developer.updated_at,
  };
}

// =====================================================
// UNIT ADAPTER
// =====================================================

export function adaptUnitForUI(unit: any): Unit {
  return {
    id: unit.id,
    project_id: unit.project_id,
    template_id: unit.template_id,
    unit_number: unit.unit_number,
    floor_number: unit.floor_number,
    block_tower: unit.block_tower,
    facing: unit.facing,
    facing_available: unit.facing_available || [],
    view_type: unit.view_type,
    status: unit.status,
    is_available: unit.is_available !== false,
    actual_sba: unit.actual_sba,
    actual_carpet_area: unit.actual_carpet_area,
    balcony_area: unit.balcony_area,
    private_terrace_area: unit.private_terrace_area,
    garden_area: unit.garden_area,
    uds_area: unit.uds_area,
    wc_count: unit.wc_count,
    balcony_count: unit.balcony_count,
    price_total: unit.price_total,
    price_per_sqft: unit.price_per_sqft,
    plc_charges: unit.plc_charges,
    floor_rise_charges: unit.floor_rise_charges,
    parking_charges: unit.parking_charges,
    flooring_type: unit.flooring_type,
    power_load_kw: unit.power_load_kw,
    unit_specs: unit.unit_specs || {},
    custom_features: unit.custom_features || {},
    is_hot_selling: unit.is_hot_selling || false,
    is_recommended: unit.is_recommended || false,
    internal_notes: unit.internal_notes,
    created_at: unit.created_at,
    updated_at: unit.updated_at,
  };
}

// =====================================================
// ANALYSIS ADAPTER
// =====================================================

export function adaptAnalysisForUI(analysis: any): ProjectAnalysis {
  return {
    id: analysis.id,
    project_id: analysis.project_id,
    overall_rating: analysis.overall_rating,
    pros: analysis.pros || [],
    cons: analysis.cons || [],
    target_customer_profile: analysis.target_customer_profile,
    closing_pitch: analysis.closing_pitch,
    objection_handling: analysis.objection_handling,
    competitor_names: analysis.competitor_names || [],
    usp: analysis.usp,
    created_at: analysis.created_at,
  };
}

// =====================================================
// MAP MARKER ADAPTER (Lightweight for map display)
// =====================================================

export interface MapMarkerData {
  id: string;
  project_name: string;
  lat: number;
  lng: number;
  price_display: string;
  configurations: string[];
  hero_image_url?: string;
  gallery_images?: string[];
  developer_name?: string;
  zone?: string;
  region?: string;
  status?: string;
}

export function adaptProjectForMap(project: any): MapMarkerData {
  return {
    id: project.id,
    project_name: project.project_name,
    lat: parseFloat(project.latitude),
    lng: parseFloat(project.longitude),
    price_display: project.price_display || 'Price on Request',
    configurations: project.configurations || [],
    hero_image_url: project.hero_image_url,
    gallery_images: project.gallery_images || [],
    developer_name: project.developer?.developer_name || 'Unknown',
    zone: project.bangalore_zone,
    region: project.region,
    status: project.project_status,
  };
}

// =====================================================
// CARD DISPLAY ADAPTER (For property cards)
// =====================================================

export interface PropertyCardData {
  id: string;
  project_name: string;
  developer_name: string;
  developer_logo?: string;
  region: string;
  zone?: string;
  price_display: string;
  price_range: { min?: number; max?: number };
  configurations: string[];
  property_type?: string;
  possession_date?: string;
  hero_image_url?: string;
  total_units?: number;
  builder_grade?: string;
  status?: string;
  usp?: string;
  rera_no?: string;
}

export function adaptProjectForCard(project: any): PropertyCardData {
  return {
    id: project.id,
    project_name: project.project_name,
    developer_name: project.developer?.developer_name || 'Unknown Developer',
    developer_logo: project.developer?.logo_url,
    region: project.region || 'Bengaluru',
    zone: project.bangalore_zone,
    price_display: project.price_display || 'Price on Request',
    price_range: {
      min: project.price_min,
      max: project.price_max,
    },
    configurations: project.configurations || [],
    property_type: project.property_type,
    possession_date: project.possession_date,
    hero_image_url: project.hero_image_url,
    total_units: project.total_units,
    builder_grade: project.builder_grade,
    status: project.project_status,
    usp: project.usp,
    rera_no: project.rera_registration_no,
  };
}

// =====================================================
// WHATSAPP MESSAGE ADAPTER
// =====================================================

export function generateWhatsAppMessage(project: ProjectFull): string {
  const headline = project.whatsapp_pitch_headline || `🏠 ${project.project_name}`;
  const developer = project.developer?.developer_name || 'Premium Developer';
  const location = `📍 ${project.region}, ${project.bangalore_zone || ''} Bangalore`;
  const price = `💰 ${project.price_display || 'Contact for Price'}`;
  const configs = project.configurations?.length
    ? `🛏️ ${project.configurations.join(', ')}`
    : '';
  const possession = project.possession_date
    ? `📅 Possession: ${new Date(project.possession_date).getFullYear()}`
    : '';
  
  const highlights = project.whatsapp_pitch_highlights?.length
    ? '\n\n✨ *Highlights:*\n' + project.whatsapp_pitch_highlights.map((h) => `• ${h}`).join('\n')
    : '';
  
  const cta = project.whatsapp_pitch_cta || '📞 Call now for site visit!';

  return `
*${headline}*

by ${developer}
${location}
${price}
${configs}
${possession}
${highlights}

${cta}
  `.trim();
}

// =====================================================
// SUMMARY STATISTICS ADAPTER
// =====================================================

export interface ProjectSummaryStats {
  total_projects: number;
  total_units: number;
  avg_price?: number;
  zones_covered: string[];
  developers_count: number;
  configurations_available: string[];
}

export function calculateProjectStats(projects: ProjectFull[]): ProjectSummaryStats {
  const totalUnits = projects.reduce((sum, p) => sum + (p.total_units || 0), 0);
  
  const pricesArray = projects
    .map((p) => p.price_min)
    .filter((p): p is number => p != null && p > 0);
  const avgPrice = pricesArray.length
    ? pricesArray.reduce((sum, p) => sum + p, 0) / pricesArray.length
    : undefined;
  
  const zones = Array.from(new Set(projects.map((p) => p.bangalore_zone).filter(Boolean)));
  const developers = Array.from(new Set(projects.map((p) => p.developer_id).filter(Boolean)));
  
  const allConfigs = projects.flatMap((p) => p.configurations || []);
  const uniqueConfigs = Array.from(new Set(allConfigs));

  return {
    total_projects: projects.length,
    total_units: totalUnits,
    avg_price: avgPrice,
    zones_covered: zones as string[],
    developers_count: developers.length,
    configurations_available: uniqueConfigs,
  };
}

// =====================================================
// FILTER SUMMARY ADAPTER
// =====================================================

export interface FilterSummary {
  applied_filters: number;
  results_count: number;
  price_range?: { min?: number; max?: number };
  zones?: string[];
  configurations?: string[];
}

export function summarizeFilters(
  projects: ProjectFull[],
  activeFilters: any
): FilterSummary {
  const appliedFiltersCount = Object.values(activeFilters).filter((v) => {
    if (Array.isArray(v)) return v.length > 0;
    return v != null && v !== '';
  }).length;

  const prices = projects
    .flatMap((p) => [p.price_min, p.price_max])
    .filter((p): p is number => p != null && p > 0);
  
  const priceRange = prices.length
    ? { min: Math.min(...prices), max: Math.max(...prices) }
    : undefined;

  const zones = Array.from(new Set(projects.map((p) => p.bangalore_zone).filter(Boolean)));
  const configs = Array.from(new Set(projects.flatMap((p) => p.configurations || [])));

  return {
    applied_filters: appliedFiltersCount,
    results_count: projects.length,
    price_range: priceRange,
    zones: zones as string[],
    configurations: configs,
  };
}

// =====================================================
// EXPORT/DOWNLOAD ADAPTER (CSV format)
// =====================================================

export function adaptProjectsForCSVExport(projects: ProjectFull[]): string {
  const headers = [
    'Project Name',
    'Developer',
    'Region',
    'Zone',
    'Price',
    'Configurations',
    'Total Units',
    'Possession',
    'Status',
    'RERA No',
  ];

  const rows = projects.map((p) => [
    p.project_name,
    p.developer?.developer_name || '',
    p.region || '',
    p.bangalore_zone || '',
    p.price_display || '',
    p.configurations?.join(', ') || '',
    p.total_units?.toString() || '',
    p.possession_date || '',
    p.project_status || '',
    p.rera_registration_no || '',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}
