import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/core/db/server';
import * as XLSX from 'xlsx'; // Now safe - installed from CDN

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate file
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Only Excel files (.xlsx, .xls) are supported' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Read Excel
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames.find(n => n === 'Property_Master_Data');

    if (!sheetName) {
      return NextResponse.json({ error: 'Property_Master_Data sheet not found' }, { status: 400 });
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: null, // CRITICAL: Prevents column shift on empty cells
      blankrows: false 
    });

    // Skip first 3 rows (header, types, example)
    const dataRows = rows.slice(3).filter(row => row && row.length > 0 && row[0]);

    if (dataRows.length === 0) {
      return NextResponse.json({ error: 'No data found. Fill at least one row.' }, { status: 400 });
    }

    if (dataRows.length > 100) {
      return NextResponse.json({ error: 'Maximum 100 properties per upload' }, { status: 400 });
    }

    const supabase = await createClient();
    const results = {
      total: dataRows.length,
      success: 0,
      failed: 0,
      errors: [] as Array<{ row: number; errors: string[] }>,
      projectIds: [] as string[]
    };

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = i + 4; // Excel row number

      try {
        const projectData = parseRow(row);

        // Validate required fields
        const validation = validateRow(projectData);
        if (!validation.valid) {
          results.failed++;
          results.errors.push({ row: rowNumber, errors: validation.errors });
          continue;
        }

        // Insert into 8 tables
        const projectId = await insertPropertyData(supabase, projectData);

        if (projectId) {
          results.success++;
          results.projectIds.push(projectId);
        } else {
          results.failed++;
          results.errors.push({ row: rowNumber, errors: ['Database insert failed'] });
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push({ row: rowNumber, errors: [error.message || 'Unknown error'] });
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Parse Excel row to structured data
function parseRow(row: any[]) {
  const get = (idx: number, def: any = null) => {
    const val = row[idx];
    return val !== undefined && val !== null && val !== '' ? val : def;
  };

  const num = (idx: number, def = 0) => parseFloat(get(idx, def)) || def;
  const int = (idx: number, def = 0) => parseInt(get(idx, def)) || def;

  return {
    project: {
      name: get(0, ''),
      developer: get(1, ''),
      rera_id: get(2),
      status: get(3, 'Under Construction'),
      zone: get(4, 'North'),
      region: get(5, ''),
      property_type: get(6),
      total_units: int(7),
      total_land_area: get(8),
      possession_date: get(9),
      floor_levels: get(10),
      open_space_percent: int(11),
      construction_technology: get(12),
      builder_grade: get(13),
      construction_type: get(14),
      address_line: get(15),
      lat: num(16, 12.9716),
      lng: num(17, 77.5946),
      price_min: int(18, 0),
      price_display: get(19, ''),
      price_per_sqft: get(20),
      onwards_pricing: get(21),
      specifications: {
        clubhouse_size: get(22),
        elevators_per_tower: get(23),
        payment_plan: get(24),
        floor_rise_charges: get(25),
        car_parking_cost: get(26),
        clubhouse_charges: get(27),
        infrastructure_charges: get(28),
        sinking_fund: get(29),
        facing_direction: get(30),
        completion_duration: get(31),
        maintenance_per_sqft: get(32),
        water_source: get(33),
        power_backup: get(34),
        security_features: get(35)
      },
      hero_image_url: get(36),
      brochure_url: get(37),
      marketing_kit_url: get(38)
    },
    units: parseUnits(row, get, int, num),
    analysis: parseAnalysis(row, get, num),
    amenities: parseAmenities(row, get),
    landmarks: parseLandmarks(row, get, num, int),
    location_advantages: parseLocationAdvantages(row, get, num, int),
    competitors: parseCompetitors(row, get, num),
    cost_extras: parseCostExtras(row, get, num)
  };
}

// Parse 6 unit configurations (cols 39-98)
function parseUnits(row: any[], get: any, int: any, num: any) {
  const units = [];
  for (let i = 0; i < 6; i++) {
    const base = 39 + i * 10;
    const type = get(base);
    if (type) {
      units.push({
        type,
        sba_sqft: int(base + 1),
        carpet_sqft: int(base + 2),
        uds_sqft: int(base + 3),
        base_price: int(base + 4),
        wc_count: int(base + 5),
        balcony_count: int(base + 6),
        facing_available: get(base + 7),
        plc_charges: int(base + 8),
        flooring_type: get(base + 9)
      });
    }
  }
  return units;
}

// Parse sales analysis (cols 99-118)
function parseAnalysis(row: any[], get: any, num: any) {
  const pros = [];
  for (let i = 0; i < 10; i++) {
    const pro = get(105 + i);
    if (pro) pros.push(pro);
  }

  const cons = [];
  for (let i = 0; i < 5; i++) {
    const con = get(115 + i);
    if (con) cons.push(con);
  }

  return {
    overall_rating: num(99),
    target_customer_profile: get(100, ''),
    closing_pitch: get(101, ''),
    usp: get(102),
    objection_handling: get(103),
    pros,
    cons
  };
}

// Parse 35 amenities (cols 119-223)
function parseAmenities(row: any[], get: any) {
  const amenities = [];
  for (let i = 0; i < 35; i++) {
    const base = 119 + i * 3;
    const name = get(base);
    if (name) {
      amenities.push({
        name,
        category: get(base + 1, 'General'),
        size_specs: get(base + 2)
      });
    }
  }
  return amenities;
}

// Parse 20 landmarks (cols 224-303)
function parseLandmarks(row: any[], get: any, num: any, int: any) {
  const landmarks = [];
  for (let i = 0; i < 20; i++) {
    const base = 224 + i * 4;
    const name = get(base);
    if (name) {
      landmarks.push({
        name,
        category: get(base + 1, ''),
        distance_km: num(base + 2),
        travel_time_mins: int(base + 3)
      });
    }
  }
  return landmarks;
}

// Parse 7 location advantages (cols 304-331)
function parseLocationAdvantages(row: any[], get: any, num: any, int: any) {
  const locAdvs = [];
  for (let i = 0; i < 7; i++) {
    const base = 304 + i * 4;
    const category = get(base);
    if (category) {
      locAdvs.push({
        category_name: category,
        details: get(base + 1, ''),
        distance_km: num(base + 2),
        travel_time_mins: int(base + 3)
      });
    }
  }
  return locAdvs;
}

// Parse 5 competitors (cols 332-356)
function parseCompetitors(row: any[], get: any, num: any) {
  const competitors = [];
  for (let i = 0; i < 5; i++) {
    const base = 332 + i * 5;
    const name = get(base);
    if (name) {
      competitors.push({
        competitor_name: name,
        competitor_price_range: get(base + 1, ''),
        distance_km: num(base + 2),
        similar_configs: get(base + 3),
        notes: get(base + 4)
      });
    }
  }
  return competitors;
}

// Parse 10 cost extras (cols 357-396)
function parseCostExtras(row: any[], get: any, num: any) {
  const costExtras = [];
  for (let i = 0; i < 10; i++) {
    const base = 357 + i * 4;
    const name = get(base);
    if (name) {
      costExtras.push({
        name,
        cost_type: get(base + 1, 'Fixed'),
        amount: num(base + 2),
        payment_milestone: get(base + 3)
      });
    }
  }
  return costExtras;
}

// Validate required fields
function validateRow(data: any) {
  const errors = [];
  if (!data.project.name) errors.push('Project name required');
  if (!data.project.developer) errors.push('Developer required');
  if (!data.project.region) errors.push('Region required');
  if (!data.project.price_display) errors.push('Price display required');
  if (data.project.price_min <= 0) errors.push('Price must be > 0');
  if (!data.analysis.target_customer_profile) errors.push('Target customer required');
  if (!data.analysis.closing_pitch) errors.push('Closing pitch required');
  if (data.project.lat < 12.5 || data.project.lat > 13.5) errors.push('Invalid latitude (Bangalore: 12.5-13.5)');
  if (data.project.lng < 77.0 || data.project.lng > 78.0) errors.push('Invalid longitude (Bangalore: 77.0-78.0)');

  return { valid: errors.length === 0, errors };
}

// Insert into 8 tables (OPTIMIZED with Promise.all)
async function insertPropertyData(supabase: any, data: any): Promise<string | null> {
  try {
    // 1. Insert project first
    const { data: project, error: pErr } = await supabase
      .from('projects')
      .insert(data.project)
      .select('id')
      .single();

    if (pErr) throw pErr;
    const pid = project.id;

    // 2. Parallel inserts for all sub-tables (FASTER!)
    await Promise.all([
      data.units.length > 0 &&
        supabase.from('project_units').insert(data.units.map((u: any) => ({ ...u, project_id: pid }))),
      
      supabase.from('project_analysis').insert({ ...data.analysis, project_id: pid }),
      
      data.amenities.length > 0 &&
        supabase.from('project_amenities').insert(data.amenities.map((a: any) => ({ ...a, project_id: pid }))),
      
      data.landmarks.length > 0 &&
        supabase.from('project_landmarks').insert(data.landmarks.map((l: any) => ({ ...l, project_id: pid }))),
      
      data.location_advantages.length > 0 &&
        supabase.from('project_location_advantages').insert(data.location_advantages.map((la: any, idx: number) => ({ ...la, project_id: pid, category_number: idx + 1 }))),
      
      data.competitors.length > 0 &&
        supabase.from('project_competitors').insert(data.competitors.map((c: any) => ({ ...c, project_id: pid }))),
      
      data.cost_extras.length > 0 &&
        supabase.from('project_cost_extras').insert(data.cost_extras.map((ce: any) => ({ ...ce, project_id: pid })))
    ]);

    return pid;
  } catch (error: any) {
    console.error('Insert error:', error);
    return null;
  }
}
