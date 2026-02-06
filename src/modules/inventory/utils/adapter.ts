// src/modules/inventory/utils/adapter.ts

import { Property } from '../types'; 
import { ProjectFullV7 } from '../types-v7';

export function adaptProjectToProperty(project: ProjectFullV7): Property {

  console.log(`Adapting Project: ${project.name}`);
  console.log(`- Units found: ${project.units?.length}`);

  // 1. Calculate SBA Range safely
  // If no units exist, default to 0
  const sbaValues = project.units?.map(u => u.sba_sqft).filter(Boolean) || [];
  const minSba = sbaValues.length ? Math.min(...sbaValues) : 0;
  const maxSba = sbaValues.length ? Math.max(...sbaValues) : 0;
  // Use safety fallback string from your requested update
  const sqFtRange = minSba === maxSba && minSba !== 0 ? `${minSba} sqft` : 
                    (sbaValues.length > 0 ? `${minSba}-${maxSba} sqft` : 'Check Details');

  // 2. Map Amenities to Old JSON Structure
  // We group V7 amenities by category to match V3 'amenities_detailed'
  const amenitiesMap: Record<string, string[]> = {};
  if (project.amenities) {
    project.amenities.forEach(a => {
      const cat = a.category.toLowerCase();
      if (!amenitiesMap[cat]) amenitiesMap[cat] = [];
      amenitiesMap[cat].push(a.name);
    });
  }

  // 3. Map Landmarks to Old Social Infra
  const infraMap: Record<string, string> = {};
  if (project.landmarks) {
    project.landmarks.forEach(l => {
      infraMap[l.category] = `${l.distance_km} km`;
    });
  }

  // 4. Return the Old "Property" Shape
  return {
    id: project.id,
    name: project.name || 'Unnamed Project',
    developer: project.developer || 'Unknown',
    rera_id: project.rera_id || '',
    
    // --- SAFETY FIX STARTS HERE ---
    // If lat/lng are NULL in DB, use 0 to prevent Map Crash
    lat: project.lat ?? 0, 
    lng: project.lng ?? 0,
    
    // Force the specific string type to match the Enum in Property type, default to 'East' if missing
    zone: (project.zone as 'North' | 'South' | 'East' | 'West') || 'East',
    location_area: project.region || '',
    // --- SAFETY FIX ENDS HERE ---

    // NEW V7 Field Mapping
    totalUnits: project.units?.length || 0,
    priceRange: {}, // Placeholder
    amenities: project.amenities?.map(a => a.name) || [],

    // Pricing
    price_value: project.price_min || 0,
    price_display: project.price_display || 'Price on Request',
    price_per_sqft: 0, 

    // Status Compatibility
    status: project.status === 'Ready' ? 'Ready' : 'Under Construction',
    
    // Specs
    configurations: project.configurations || [],
    sq_ft_range: sqFtRange,
    floor_levels: project.structure_details || '',
    facing_direction: project.units?.[0]?.facing || '', 
    balcony_count: 0, 
    completion_date: project.possession_date || '',
    completion_duration: project.possession_date 
      ? new Date(project.possession_date).getFullYear().toString() 
      : '',
    
    // PACKING RICH DATA FOR MEGAPOPUP
    specs: {
      // 1. Physical Specs
      "Structure": project.structure_details || 'N/A',
      "Tech": project.construction_technology || 'N/A',
      "Open Space": project.open_space_percent ? `${project.open_space_percent}%` : 'N/A',
      "Land Area": project.total_land_area || 'N/A',
      
      // 2. The Flexible Specs (Safe Spread)
      // Note: Cast to 'any' to access 'specifications' if it was removed from ProjectV7 type definition but exists in DB return
      ...((project as any).specifications || {}),

      // 3. Analysis (SAFELY FLATTENED)
      // FIX: Added ( ... || [] ) before .join() to prevent crash
      ...(project.analysis ? {
        "⭐ Rating": project.analysis.overall_rating ? `${project.analysis.overall_rating}/10` : 'N/A',
        "✅ Pros": (project.analysis.pros || []).join(", "), 
        "❌ Cons": (project.analysis.cons || []).join(", "),
        "🎯 Target": project.analysis.target_customer_profile || '',
        "💡 Pitch": project.analysis.closing_pitch || ''
      } : {}),
      
      // 4. Cost Extras (Safe Map)
      ...(project.cost_extras ? {
        "💰 Extra Costs": (project.cost_extras || [])
          .map(c => `${c.name}: ${c.amount}`)
          .join(" | ")
      } : {})
    },

    // Media
    media: {
      images: project.hero_image_url ? [project.hero_image_url] : [],
      brochure: project.brochure_url || '',
      floor_plan: ''
    },
    
    // Detailed mappings for UI compatibility (kept safe)
    amenities_detailed: amenitiesMap, 
    social_infra: infraMap,
    
    // Units available count (Simple aggregation for UI)
    units_available: (project.units || []).reduce((acc, unit) => {
      acc[unit.type] = (acc[unit.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    // Contact
    contact_person: 'Sales Team', 
    contact_phone: '',
    
    // Metadata (Required by Type)
    created_at: new Date().toISOString(), 
    updated_at: new Date().toISOString(),

    // ATTACH THE RAW DATA
    // We attach the full V7 object here so UI components can access new fields (like 'analysis', 'units' detailed info) directly if needed.
    _raw_v7: project 
  } as Property & { _raw_v7: ProjectFullV7 }; // Cast to include _raw_v7 if not in type
}
