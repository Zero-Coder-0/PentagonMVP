'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Property } from './types'
import { ProjectFullV7 } from './types-v7'

async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Handle cookie setting errors
          }
        },
      },
    }
  )
}

export async function getProjectsV7(): Promise<Property[]> {
  const supabase = await createClient()

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')

  if (projectsError) {
    console.error('Error fetching projects:', projectsError)
    return []
  }

  if (!projects || projects.length === 0) {
    return []
  }

  // Fetch related data for all projects
  const projectIds = projects.map(p => p.id)

  const [
    { data: units },
    { data: analysis },
    { data: amenities },
    { data: landmarks },
    { data: locationAdvantages },
    { data: competitors },
    { data: costExtras }
  ] = await Promise.all([
    supabase.from('project_units').select('*').in('project_id', projectIds),
    supabase.from('project_analysis').select('*').in('project_id', projectIds),
    supabase.from('project_amenities').select('*').in('project_id', projectIds),
    supabase.from('project_landmarks').select('*').in('project_id', projectIds),
    supabase.from('project_location_advantages').select('*').in('project_id', projectIds),
    supabase.from('project_competitors').select('*').in('project_id', projectIds),
    supabase.from('project_cost_extras').select('*').in('project_id', projectIds)
  ])

  // Map to Property format
  return projects.map(project => {
    const projectUnits = units?.filter(u => u.project_id === project.id) || []
    const projectAnalysis = analysis?.find(a => a.project_id === project.id)
    const projectAmenities = amenities?.filter(a => a.project_id === project.id) || []
    const projectLandmarks = landmarks?.filter(l => l.project_id === project.id) || []
    const projectLocationAdvantages = locationAdvantages?.filter(la => la.project_id === project.id) || []
    const projectCompetitors = competitors?.filter(c => c.project_id === project.id) || []
    const projectCostExtras = costExtras?.filter(ce => ce.project_id === project.id) || []

    // Group amenities by category
    const amenitiesDetailed: Record<string, string[]> = {}
    projectAmenities.forEach(amenity => {
      if (!amenitiesDetailed[amenity.category]) {
        amenitiesDetailed[amenity.category] = []
      }
      amenitiesDetailed[amenity.category].push(amenity.name)
    })

    // Build social_infra from location advantages and landmarks
    const socialInfra: Record<string, string> = {}
    projectLocationAdvantages.forEach(la => {
      socialInfra[la.category_name] = la.details
    })

    // Get configurations from units or project
    const configurations = projectUnits.length > 0
      ? [...new Set(projectUnits.map(u => u.type))]
      : project.configurations || []

    // Calculate price range
    const prices = projectUnits.map(u => u.base_price).filter(p => p > 0)
    const minPrice = prices.length > 0 ? Math.min(...prices) : project.price_min || 0
    const maxPrice = prices.length > 0 ? Math.max(...prices) : project.price_min || 0
    const sqFtRange = projectUnits.length > 0
      ? `${Math.min(...projectUnits.map(u => u.sba_sqft))}-${Math.max(...projectUnits.map(u => u.sba_sqft))} sqft`
      : 'N/A'

    // Flatten amenities for simple list
    const amenitiesList = Object.values(amenitiesDetailed).flat()

    const property: Property = {
      id: project.id,
      name: project.name,
      developer: project.developer,
      location_area: project.region,
      zone: project.zone,
      lat: project.lat,
      lng: project.lng,
      price_display: project.price_display || formatPrice(minPrice),
      price_per_sqft: project.price_per_sqft || 'N/A',
      price_value: minPrice,
      sq_ft_range: sqFtRange,
      configurations,
      status: project.status,
      rera_id: project.rera_id,
      property_type: project.property_type,
      floor_levels: project.floor_levels,
      facing_direction: project.facing_direction,
      completion_date: project.possession_date,
      completion_duration: project.completion_duration,
      
      // For compatibility
      totalUnits: project.total_units,
      priceRange: `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`,
      
      // Amenities
      amenities: amenitiesList,
      amenities_detailed: amenitiesDetailed,
      
      // Social Infrastructure
      social_infra: socialInfra,
      
      // Specs with sales_analysis included
      specs: {
        ...project.specifications,
        'Type of Development': project.property_type,
        'Total Land Area': project.total_land_area,
        'Total Units': project.total_units,
        'Open Space %': project.open_space_percent ? `${project.open_space_percent}%` : null,
        'Builder Grade': project.builder_grade,
        'Construction Type': project.construction_type,
        'Elevators per Tower': project.elevators_per_tower,
        'Payment Plan': project.payment_plan,
        'Clubhouse Size': project.clubhouse_size,
        'Floor Rise Charges': project.floor_rise_charges,
        'Car Parking Cost': project.car_parking_cost,
        Maintenance: project.specifications?.Maintenance,
        
        // IMPORTANT: Add sales_analysis to specs
        sales_analysis: projectAnalysis ? {
          overall_rating: projectAnalysis.overall_rating,
          pros: projectAnalysis.pros,
          cons: projectAnalysis.cons,
          whom_to_target: projectAnalysis.target_customer_profile,
          pitch_angle: projectAnalysis.closing_pitch,
          usp: projectAnalysis.pros?.slice(0, 3).join(', '),
          objection_handling: projectAnalysis.objection_handling,
          competitor_names: projectAnalysis.competitor_names
        } : null,
        
        // Add cost_extras
        cost_extras: projectCostExtras.map(ce => ({
          name: ce.name,
          cost_type: ce.cost_type,
          amount: ce.amount,
          payment_milestone: ce.payment_milestone
        }))
      },
      
      // Media placeholder
      media: {
        images: project.hero_image_url ? [project.hero_image_url] : [],
        floor_plan: project.brochure_url,
        videos: []
      },
      
      // Store raw units data for future use
      units: projectUnits,
      competitors: projectCompetitors
    }

    return property
  })
}

function formatPrice(price: number): string {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`
  }
  return `₹${price.toLocaleString()}`
}
