import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

// Helper to parse worksheet
function parseWorksheet(worksheet: ExcelJS.Worksheet): any[] {
  const rows: any[] = [];
  const headers: string[] = [];

  // Get headers from first row
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.value?.toString() || '';
  });

  // Parse data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header
    
    const rowData: any = {};
    let hasData = false;
    
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header && cell.value !== null && cell.value !== undefined) {
        rowData[header] = cell.value;
        hasData = true;
      }
    });
    
    if (hasData) {
      rows.push(rowData);
    }
  });

  return rows;
}

// POST: Upload and process file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse Excel/CSV
    const workbook = new ExcelJS.Workbook();
    let jsonData: any[] = [];
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      // Parse CSV
      const csvText = buffer.toString('utf-8');
      await workbook.csv.readFile(csvText);
      const worksheet = workbook.worksheets[0];
      jsonData = parseWorksheet(worksheet);
    } else {
      // Parse Excel
      await workbook.xlsx.load(buffer as any);
      const worksheet = workbook.worksheets[0];
      jsonData = parseWorksheet(worksheet);
    }

    if (jsonData.length === 0) {
      return NextResponse.json({ error: 'No data found in file' }, { status: 400 });
    }

    // Initialize Supabase with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const errors: Array<{ row: number; error: string }> = [];
    
    // Process each row
    const insertResults = await Promise.allSettled(
      jsonData.map(async (row: any, index: number) => {
        try {
          const projectData: any = {
            name: row['Project Name'],
            developer: row['Developer'],
            rera_id: row['RERA ID'] || null,
            status: row['Status'] || 'Under Construction',
            zone: row['Zone'] || 'North',
            region: row['Region'] || null,
            address_line: row['Address'] || null,
            lat: row['Latitude'] ? parseFloat(String(row['Latitude'])) : 12.9716,
            lng: row['Longitude'] ? parseFloat(String(row['Longitude'])) : 77.5946,
            price_display: row['Price Display'] || null,
            price_min: row['Price Min'] ? parseFloat(String(row['Price Min'])) : null,
            price_max: row['Price Max'] ? parseFloat(String(row['Price Max'])) : null,
            price_per_sqft: row['Price per SqFt'] || null,
            total_units: row['Total Units'] ? parseInt(String(row['Total Units'])) : null,
            total_land_area: row['Land Area'] || null,
            property_type: row['Property Type'] || null,
            builder_grade: row['Builder Grade'] || null,
            construction_technology: row['Construction Technology'] || null,
            open_space_percent: row['Open Space %'] ? parseInt(String(row['Open Space %'])) : null,
            structure_details: row['Structure Details'] || null,
            floor_levels: row['Floor Levels'] || null,
            clubhouse_size: row['Clubhouse Size'] || null,
            possession_date: row['Possession Date'] || null,
            completion_duration: row['Completion Duration'] || null,
            payment_plan: row['Payment Plan'] || null,
            floor_rise_charges: row['Floor Rise Charges'] || null,
            car_parking_cost: row['Car Parking Cost'] || null,
            facing_direction: row['Facing Direction'] || null
          };

          // Validate required fields
          if (!projectData.name || !projectData.developer) {
            throw new Error('Missing required fields: Project Name and Developer');
          }

          // Insert to Supabase
          const { data, error } = await supabase
            .from('projects')
            .insert(projectData)
            .select()
            .single();

          if (error) throw error;

          return { 
            success: true, 
            project: projectData.name,
            id: data.id 
          };
        } catch (err: any) {
          errors.push({ 
            row: index + 2, 
            error: err.message 
          });
          throw err;
        }
      })
    );

    const successful = insertResults.filter(r => r.status === 'fulfilled').length;
    const failed = insertResults.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      total: jsonData.length,
      successful,
      failed,
      errors
    });

  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ 
      error: error.message || 'Unknown error occurred' 
    }, { status: 500 });
  }
}

// GET: Download template
export async function GET() {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Properties');

    // Define columns
    worksheet.columns = [
      { header: 'Project Name', key: 'name', width: 30 },
      { header: 'Developer', key: 'developer', width: 25 },
      { header: 'RERA ID', key: 'rera_id', width: 35 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Zone', key: 'zone', width: 15 },
      { header: 'Region', key: 'region', width: 20 },
      { header: 'Address', key: 'address', width: 40 },
      { header: 'Latitude', key: 'lat', width: 15 },
      { header: 'Longitude', key: 'lng', width: 15 },
      { header: 'Price Display', key: 'price_display', width: 20 },
      { header: 'Price Min', key: 'price_min', width: 15 },
      { header: 'Price Max', key: 'price_max', width: 15 },
      { header: 'Price per SqFt', key: 'price_per_sqft', width: 15 },
      { header: 'Total Units', key: 'total_units', width: 15 },
      { header: 'Land Area', key: 'land_area', width: 15 },
      { header: 'Property Type', key: 'property_type', width: 20 },
      { header: 'Builder Grade', key: 'builder_grade', width: 15 },
      { header: 'Open Space %', key: 'open_space', width: 15 },
      { header: 'Floor Levels', key: 'floor_levels', width: 15 },
      { header: 'Clubhouse Size', key: 'clubhouse_size', width: 20 },
      { header: 'Possession Date', key: 'possession_date', width: 20 },
      { header: 'Construction Technology', key: 'construction_tech', width: 30 },
      { header: 'Payment Plan', key: 'payment_plan', width: 25 },
      { header: 'Floor Rise Charges', key: 'floor_rise_charges', width: 25 },
      { header: 'Car Parking Cost', key: 'car_parking_cost', width: 25 },
      { header: 'Facing Direction', key: 'facing_direction', width: 20 }
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add sample data
    worksheet.addRow({
      name: 'Prestige Lakeside Habitat',
      developer: 'Prestige Group',
      rera_id: 'PRM/KA/RERA/1251/308/PR/170623/003370',
      status: 'Under Construction',
      zone: 'North',
      region: 'Whitefield',
      address: 'Varthur Main Road, Whitefield, Bangalore',
      lat: 12.9716,
      lng: 77.5946,
      price_display: '₹1.2 Cr onwards',
      price_min: 12000000,
      price_max: 25000000,
      price_per_sqft: '₹6,500',
      total_units: 500,
      land_area: '25 Acres',
      property_type: 'Apartments',
      builder_grade: 'Premium',
      open_space: 70,
      floor_levels: 'G+18',
      clubhouse_size: '25,000 sq.ft',
      possession_date: 'Dec 2027',
      construction_tech: 'Mivan Technology',
      payment_plan: 'Construction Linked (10-90)',
      floor_rise_charges: 'Rs 25-40/sqft/floor',
      car_parking_cost: 'Included',
      facing_direction: 'East, West, North'
    });

    worksheet.addRow({
      name: 'Brigade Eldorado',
      developer: 'Brigade Group',
      rera_id: 'PRM/KA/RERA/1251/309/PR/180924/002345',
      status: 'Ready',
      zone: 'East',
      region: 'Bagalur',
      address: 'Bagalur Main Road, North Bangalore',
      lat: 13.0827,
      lng: 77.6350,
      price_display: '₹85 Lakhs onwards',
      price_min: 8500000,
      price_max: 15000000,
      price_per_sqft: '₹4,800',
      total_units: 850,
      land_area: '35 Acres',
      property_type: 'Apartments',
      builder_grade: 'Mid-Segment',
      open_space: 75,
      floor_levels: 'G+14',
      clubhouse_size: '30,000 sq.ft',
      possession_date: 'Immediate',
      construction_tech: 'RCC Framed Structure',
      payment_plan: 'Subvention Scheme',
      floor_rise_charges: 'Rs 15-25/sqft/floor',
      car_parking_cost: 'Rs 2.5 Lakhs',
      facing_direction: 'North, South'
    });

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="bulk-upload-template.xlsx"'
      }
    });

  } catch (error: any) {
    console.error('Template generation error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate template' 
    }, { status: 500 });
  }
}
