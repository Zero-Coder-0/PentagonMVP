import { z } from 'zod'

// 1. Define the Perfect DB Shape
export const PropertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  developer: z.string().optional(),
  location_area: z.string().optional(),
  zone: z.enum(['North', 'South', 'East', 'West']).default('North'),
  lat: z.number().default(12.9716),
  lng: z.number().default(77.5946),
  status: z.enum(['Ready', 'Under Construction']).default('Under Construction'),
  price_value: z.number().default(0),
  price_display: z.string().optional(),
  configurations: z.array(z.string()).default([]),
  completion_duration: z.string().optional(),
  
  // --- NEW FIELDS ---
  rera_id: z.string().optional(),
  price_per_sqft: z.number().optional(),
  sq_ft_range: z.string().optional(),
  floor_levels: z.string().optional(),
  facing_direction: z.string().optional(),
  balcony_count: z.number().optional(),
  completion_date: z.string().optional(),
  // ------------------
  
  // JSONB Fields
  media: z.object({
    images: z.array(z.string()).default([]),
    floor_plan: z.string().optional(),
    brochure: z.string().optional()
  }).default({}),
  
  social_infra: z.record(z.any()).default({}), 
  
  // FIXED: Allow ANY structure for amenities (list, wellness, sports, etc.)
  amenities_detailed: z.record(z.any()).default({ list: [] }),
  
  units_available: z.record(z.any()).default({}), 

  // Catch-All
  specs: z.record(z.any()).default({}), 
  
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
})

// 2. Map Column Names
const EXCEL_FIELD_MAPPING: Record<string, string> = {
  "Property Name": "name", "name": "name",
  "Developer": "developer", "developer": "developer",
  "Zone": "zone", "zone": "zone",
  "Location Area": "location_area", "location_area": "location_area", "Location": "location_area",
  "Latitude": "lat", "lat": "lat",
  "Longitude": "lng", "lng": "lng",
  "Price Value": "price_value", "price_value": "price_value", "Sort Price": "price_value",
  "Price Display": "price_display", "price_display": "price_display", "Price": "price_display",
  "Status": "status", "status": "status",
  "Configurations": "configurations", "configurations": "configurations",
  "Completion": "completion_duration", "Completion Duration": "completion_duration",
  "Contact Person": "contact_person", "contact_person": "contact_person",
  "Contact Phone": "contact_phone", "contact_phone": "contact_phone",
  
  // --- NEW MAPPINGS ---
  "RERA ID": "rera_id", "rera_id": "rera_id",
  "Price Per Sqft": "price_per_sqft", "price_per_sqft": "price_per_sqft",
  "Sq Ft Range": "sq_ft_range", "sq_ft_range": "sq_ft_range",
  "Floor Levels": "floor_levels", "floor_levels": "floor_levels",
  "Facing Direction": "facing_direction", "facing_direction": "facing_direction",
  "Balcony Count": "balcony_count", "balcony_count": "balcony_count",
  "Completion Date": "completion_date", "completion_date": "completion_date",
  // --------------------

  "Units Available": "units_available", "units_available": "units_available",
  "Amenities": "amenities_detailed", "amenities_detailed": "amenities_detailed",
  "Nearby Locations": "social_infra", "social_infra": "social_infra",
  "media": "media",
  "specs": "specs"
}

// 3. The Master Parser
export function parsePropertyInput(input: any) {
  console.log("PARSER: Starting row...", input?.name || "No Name");

  try {
      // A. Normalize Keys
      let normalizedInput = normalizeKeys(input);
      console.log("PARSER: Normalized keys:", Object.keys(normalizedInput));
      
      delete normalizedInput.id;
      delete normalizedInput.created_at;
      delete normalizedInput.updated_at;

      // B. Convert Types
      convertTypes(normalizedInput);
      console.log("PARSER: Types converted.");

      // C. Update Core Fields List
      const coreFields = [
        'name', 'developer', 'location_area', 'zone', 'lat', 'lng', 
        'status', 'price_value', 'price_display', 'configurations', 
        'completion_duration', 'contact_person', 'contact_phone',
        'media', 'social_infra', 'amenities_detailed', 'units_available',
        'rera_id', 'price_per_sqft', 'sq_ft_range', 'floor_levels', 
        'facing_direction', 'balcony_count', 'completion_date'
      ];

      const cleanData: any = {};
      const extraFields: any = {};

      Object.keys(normalizedInput).forEach(key => {
        if (!coreFields.includes(key) && normalizedInput[key] === "") return;

        if (coreFields.includes(key)) {
          cleanData[key] = normalizedInput[key];
        } else {
          extraFields[key] = normalizedInput[key];
        }
      });

      cleanData.specs = { ...extraFields, ...(normalizedInput.specs || {}) };
      
      console.log("PARSER: Ready to Zod Parse...", cleanData);
      
      // D. Validate
      const result = PropertySchema.parse(cleanData);
      console.log("PARSER: Zod Success!");
      return result;

  } catch (err) {
      console.error("PARSER CRASHED HERE:", err);
      throw err;
  }
}

function normalizeKeys(obj: any) {
  const result: any = {};
  Object.keys(obj).forEach(key => {
    const cleanKey = key.trim();
    const dbField = EXCEL_FIELD_MAPPING[cleanKey] || cleanKey;
    result[dbField] = obj[key];
  });
  return result;
}

function convertTypes(data: any) {
  // 1. Numbers
  const numberFields = ['lat', 'lng', 'price_value', 'price_per_sqft', 'balcony_count'];
  numberFields.forEach(field => {
    if (data[field] === "" || data[field] === undefined) {
      data[field] = 0; 
    } else if (typeof data[field] === 'string') {
      const val = parseFloat(data[field]);
      data[field] = isNaN(val) ? 0 : val;
    }
  });

  // 2. JSON Objects
  const jsonFields = ['media', 'social_infra', 'amenities_detailed', 'specs', 'units_available'];
  jsonFields.forEach(field => {
    if (!data[field] || data[field] === "") {
      data[field] = {}; 
      return;
    }
    if (typeof data[field] === 'string') {
      try {
        let cleanStr = data[field].trim();
        if (cleanStr.startsWith('"""') && cleanStr.endsWith('"""')) cleanStr = cleanStr.slice(3, -3);
        else if (cleanStr.startsWith('"') && cleanStr.endsWith('"')) cleanStr = cleanStr.slice(1, -1).replace(/""/g, '"');
        data[field] = JSON.parse(cleanStr);
      } catch (e) {
        console.warn(`JSON Parse failed for ${field}:`, data[field]);
        data[field] = {}; 
      }
    }
  });

  // 3. Arrays
  if (!data.configurations || data.configurations === "") {
    data.configurations = [];
  } 
  else if (typeof data.configurations === 'string') {
    let str = data.configurations.trim();
    if (str.startsWith('[') && str.endsWith(']')) {
       try { str = str.replace(/""/g, '"'); data.configurations = JSON.parse(str); } catch { data.configurations = []; }
    } else {
       data.configurations = str.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    }
  }

  // 4. Dates (Fix for Postgres "invalid input syntax for type date: ''")
  const dateFields = ['completion_date'];
  dateFields.forEach(field => {
    if (data[field] === "") {
      data[field] = undefined; // Force NULL in DB
      delete data[field]; // Remove key entirely so Supabase ignores it
    }
  });
}
