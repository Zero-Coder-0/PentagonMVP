// src/lib/validation/bulkSchemas.ts
import { z } from 'zod';

// Helper for fields that can be null in Excel but should be treated as optional strings
const optString = z.preprocess(val => val === null ? undefined : val, z.string().optional());
const optNumber = z.preprocess(val => (val === null || val === undefined || val === '') ? undefined : Number(val), z.number().optional());
// Helper to parse comma‑separated strings into string arrays, also handling nulls
const csvString = z.preprocess(val => val === null ? undefined : val, z.string().optional())
    .transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []);

export const ProjectSchema = z.object({
    project_name: z.string(),
    created_by: optString,
    general_location: optString,
    address_line: optString,
    district: optString,
    lat: optNumber,
    lng: optNumber,
    total_land_area: optString,
    total_phases: optNumber,
    project_theme: optString,
    projectstatus: optString,
    possession_month: optString,
    possession_year: optNumber,
    slug: optString,
    city: optString,
    pincode: optString,
    region: optString,
    city_zone: optString,
    property_type: optString,
    current_phase_under_sale: optString,
    total_units: optNumber,
    pricedisplay: optString,
    pricemin: optNumber,
    pricemax: optNumber,
    payment_plan_type: optString,
    payment_plan_details: optString,
    floor_rise_charges: optString,
    configurations: csvString,
    hero_image: optString,
    images: csvString,
    virtual_tour_url: optString,
    brochure_url: optString,
    rera_registration_no: optString
});

export const ProjectDeveloperSchema = z.object({
    project_name: z.string(),
    name: optString,
    logo_url: optString,
    website: optString,
    buildergrade: optString,
    corporate_rera: optString,
    description: optString,
    reputation: optString,
    years_in_market: optNumber,
    past_projects: optString,
    financial_strength: optString
});

export const ProjectAnalysisSchema = z.object({
    project_name: z.string(),
    pros: csvString,
    cons: csvString,
    usp: optString,
    usp_highlights: csvString,
    closing_pitch: optString,
    target_customer: optString,
    objection_handling: optString, // could be json string
    legal_notes: optString,
    timeline_risk: optString,
    overall_rating: optNumber,
});

export const ProjectUnitSchema = z.object({
    project_name: z.string(),
    unitnumber: z.string(),
    tower: optString,
    floornumber: optNumber,
    config: optString,
    type: optString,
    actualsba: optNumber,
    carpetarea: optNumber,
    udsarea: optNumber,
    facing: optString,
    wccount: optNumber,
    balconycount: optNumber,
    pricepersqft: optNumber,
    pricetotal: optNumber,
    status: optString
});

export const ProjectSpecificationSchema = z.object({
    project_name: z.string(),
    no_of_towers: optNumber,
    floors_per_tower: optNumber,
    units_per_floor: optNumber,
    elevators_per_tower: optNumber,
    service_elevators_per_tower: optNumber,
    construction_type: optString,
    structure_details: optString,
    wall_finishing_interior: optString,
    wall_finishing_exterior: optString,
    flooring_living_dining: optString,
    flooring_master_bedroom: optString,
    flooring_other_bedrooms: optString,
    flooring_balcony_utility: optString,
    kitchen_countertop: optString,
    kitchen_sink_details: optString,
    kitchen_dado_tiling: optString,
    gas_pipeline_provision: optString,
    bathroom_sanitary_ware: optString,
    bathroom_cp_fittings: optString,
    bathroom_dado_tiling: optString,
    main_door_specs: optString,
    internal_doors_specs: optString,
    windows_specs: optString,
    electrical_switches: optString,
    power_backup: optString,
    road_width: optString,
    water_source: optString,
    open_space_pct: optString
});

export const ProjectAmenitySchema = z.object({
    project_name: z.string(),
    category: optString,
    name: optString,
    description: optString,
    size_specs: optString
});

export const ProjectLandmarkSchema = z.object({
    project_name: z.string(),
    category: optString,
    name: optString,
    distance_km: optString,
    travel_time: optString
});

export const ProjectCommercialSchema = z.object({
    project_name: z.string(),
    name: optString,
    amount: optNumber,
    cost_type: optString,
    payment_milestone: optString
});

export const ProjectCompetitorSchema = z.object({
    project_name: z.string(),
    name: optString,
    price_range: optString
});

export const LocationConnectivitySchema = z.object({
    project_name: z.string(),
    distancetomainroad: optString,
    airportdistance: optString,
    railwaystationdistance: optString,
    metrostationdistance: optString,
    busstopdistance: optString
});

export const SiteVisitSchema = z.object({
    project_name: z.string(),
    customer_name: z.string(),
    customer_phone: z.string(),
    visit_date: z.string(),
    user_id: optString,
    user_email: optString,
    status: optString,
    notes: optString
});

export const LeadSchema = z.object({
    project_name: z.string(),
    name: optString,
    email: optString,
    phone: optString,
    status: optString,
    assigned_to: optString,
    assigned_to_email: optString
});

export const UserSchema = z.object({
    email: z.string().email(),
    fullname: optString,
    role: z.enum(['super_admin', 'tenant_admin', 'salesman', 'vendor']).optional(),
    is_active: z.preprocess(val => val === 'TRUE' || val === true, z.boolean().optional())
});

export const PropertyDraftSchema = z.object({
    vendor_id: z.string(),
    submission_data: z.string(),
    status: optString,
    admin_notes: optString
});
