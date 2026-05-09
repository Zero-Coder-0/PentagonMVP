import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/core/db/server';
import ExcelJS from 'exceljs';
import { createLiveProjectDirectly } from '@/app/actions/wizard-actions';
import { WizardFormData } from '@/lib/wizard-schema';
import { prisma } from '@/lib/prisma';

// Helper to parse worksheet
function parseWorksheet(worksheet: ExcelJS.Worksheet): any[] {
    const rows: any[] = [];
    const headers: string[] = [];

    // Get headers from first row
    worksheet.getRow(1).eachCell((cell, colNumber) => {
        headers[colNumber - 1] = cell.value?.toString().trim() || '';
    });

    // Parse data rows
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const rowData: any = {};
        let hasData = false;

        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber - 1];
            if (header && cell.value !== null && cell.value !== undefined) {
                // If it's a formula, take the result
                rowData[header] = typeof cell.value === 'object' && 'result' in cell.value
                    ? cell.value.result
                    : cell.value;
                hasData = true;
            }
        });

        if (hasData) {
            rows.push(rowData);
        }
    });

    return rows;
}

function tryParseJSON(val: any) {
    if (typeof val !== 'string') return val;
    try { return JSON.parse(val); } catch { return val; }
}

// POST: Upload and process file
export async function POST(request: NextRequest) {
    try {
        // Auth check - strictly only for authenticated users
        const authClient = await createClient();
        const { data: { session } } = await authClient.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer as any);

        const projectMap: Record<string, Partial<WizardFormData>> = {};

        // 1. Projects Sheet
        const projectsSheet = workbook.getWorksheet('Projects');
        if (projectsSheet) {
            const rows = parseWorksheet(projectsSheet);
            for (const row of rows) {
                const pName = row['project_name']?.toString().trim();
                if (!pName) continue;
                
                projectMap[pName] = {
                    project_name: pName,
                    property_type: row['property_type'],
                    projectstatus: row['projectstatus'] || 'UnderConstruction',
                    city: row['city'],
                    city_zone: row['city_zone'],
                    region: row['region'],
                    general_location: row['general_location'],
                    address_line: row['address_line'],
                    district: row['district'],
                    pincode: row['pincode'],
                    lat: row['lat'] ? parseFloat(row['lat']) : null,
                    lng: row['lng'] ? parseFloat(row['lng']) : null,
                    slug: row['slug'],
                    total_land_area: row['total_land_area'],
                    total_units: row['total_units'] ? parseInt(row['total_units']) : null,
                    total_phases: row['total_phases'] ? parseInt(row['total_phases']) : null,
                    project_theme: row['project_theme'],
                    current_phase_under_sale: row['current_phase_under_sale']?.toString(),
                    possession_month: row['possession_month'],
                    possession_year: row['possession_year'] ? parseInt(row['possession_year']) : null,
                    pricedisplay: row['pricedisplay'],
                    pricemin: row['pricemin'] ? parseFloat(row['pricemin']) : null,
                    pricemax: row['pricemax'] ? parseFloat(row['pricemax']) : null,
                    payment_plan_type: row['payment_plan_type'],
                    payment_plan_details: row['payment_plan_details'],
                    floor_rise_charges: row['floor_rise_charges'],
                    configurations: typeof row['configurations'] === 'string' ? row['configurations'].split(',').map((s: string) => s.trim()) : tryParseJSON(row['configurations']),
                    hero_image: row['hero_image'],
                    images: tryParseJSON(row['images']) || [],
                    virtual_tour_url: row['virtual_tour_url'],
                    brochure_url: row['brochure_url'],
                    rera_registration_no: row['rera_registration_no'],
                    amenities: [],
                    commercials: [],
                    landmarks: [],
                    competitors: [],
                    units: []
                };
            }
        }

        // 2. Developer Sheet
        const devSheet = workbook.getWorksheet('Developer');
        if (devSheet) {
            for (const row of parseWorksheet(devSheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].developer_name = row['name'];
                    projectMap[pName].developer_logo_url = row['logo_url'];
                    projectMap[pName].developer_website = row['website'];
                    projectMap[pName].developer_buildergrade = row['buildergrade'];
                    projectMap[pName].developer_corporate_rera = row['corporate_rera'];
                    projectMap[pName].developer_description = row['description'];
                    projectMap[pName].developer_reputation = row['reputation'];
                    projectMap[pName].developer_years_in_market = row['years_in_market'] ? parseInt(row['years_in_market']) : undefined;
                    projectMap[pName].developer_past_projects = tryParseJSON(row['past_projects']);
                    projectMap[pName].developer_financial_strength = row['financial_strength'];
                }
            }
        }

        // 3. Specifications Sheet
        const specsSheet = workbook.getWorksheet('Specifications');
        if (specsSheet) {
            for (const row of parseWorksheet(specsSheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].no_of_towers = row['no_of_towers'] ? parseInt(row['no_of_towers']) : undefined;
                    projectMap[pName].floors_per_tower = row['floors_per_tower'] ? parseInt(row['floors_per_tower']) : undefined;
                    projectMap[pName].units_per_floor = row['units_per_floor'] ? parseInt(row['units_per_floor']) : undefined;
                    projectMap[pName].elevators_per_tower = row['elevators_per_tower'] ? parseInt(row['elevators_per_tower']) : undefined;
                    projectMap[pName].service_elevators_per_tower = row['service_elevators_per_tower'] ? parseInt(row['service_elevators_per_tower']) : undefined;
                    projectMap[pName].construction_type = row['construction_type'];
                    projectMap[pName].structure_details = row['structure_details'];
                    projectMap[pName].wall_finishing_interior = row['wall_finishing_interior'];
                    projectMap[pName].wall_finishing_exterior = row['wall_finishing_exterior'];
                    projectMap[pName].flooring_living_dining = row['flooring_living_dining'];
                    projectMap[pName].flooring_master_bedroom = row['flooring_master_bedroom'];
                    projectMap[pName].flooring_other_bedrooms = row['flooring_other_bedrooms'];
                    projectMap[pName].flooring_balcony_utility = row['flooring_balcony_utility'];
                    projectMap[pName].kitchen_countertop = row['kitchen_countertop'];
                    projectMap[pName].kitchen_sink_details = row['kitchen_sink_details'];
                    projectMap[pName].kitchen_dado_tiling = row['kitchen_dado_tiling'];
                    projectMap[pName].gas_pipeline_provision = row['gas_pipeline_provision'] === true || row['gas_pipeline_provision'] === 'true';
                    projectMap[pName].bathroom_sanitary_ware = row['bathroom_sanitary_ware'];
                    projectMap[pName].bathroom_cp_fittings = row['bathroom_cp_fittings'];
                    projectMap[pName].bathroom_dado_tiling = row['bathroom_dado_tiling'];
                    projectMap[pName].main_door_specs = row['main_door_specs'];
                    projectMap[pName].internal_doors_specs = row['internal_doors_specs'];
                    projectMap[pName].windows_specs = row['windows_specs'];
                    projectMap[pName].electrical_switches = row['electrical_switches'];
                    projectMap[pName].power_backup = row['power_backup'];
                    projectMap[pName].road_width = row['road_width'] ? row['road_width'].toString() : undefined;
                    projectMap[pName].water_source = row['water_source'];
                    projectMap[pName].open_space_pct = row['open_space_pct'] ? row['open_space_pct'].toString() : undefined;
                }
            }
        }

        // 4. Analysis Sheet
        const analysisSheet = workbook.getWorksheet('Analysis');
        if (analysisSheet) {
            for (const row of parseWorksheet(analysisSheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].usp = row['usp'];
                    projectMap[pName].usp_highlights = tryParseJSON(row['usp_highlights']) || [];
                    projectMap[pName].closing_pitch = row['closing_pitch'];
                    projectMap[pName].target_customer = row['target_customer'];
                    projectMap[pName].objection_handling = tryParseJSON(row['objection_handling']);
                    projectMap[pName].legal_notes = row['legal_notes'];
                    projectMap[pName].timeline_risk = row['timeline_risk'];
                    projectMap[pName].overall_rating = row['overall_rating'] ? parseFloat(row['overall_rating']) : undefined;
                    projectMap[pName].pros = tryParseJSON(row['pros']) || [];
                    projectMap[pName].cons = tryParseJSON(row['cons']) || [];
                }
            }
        }

        // 5. Connectivity Sheet
        const connectivitySheet = workbook.getWorksheet('Connectivity');
        if (connectivitySheet) {
            for (const row of parseWorksheet(connectivitySheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].distancetomainroad = row['distancetomainroad'];
                    projectMap[pName].airportdistance = row['airportdistance'];
                    projectMap[pName].railwaystationdistance = row['railwaystationdistance'];
                    projectMap[pName].metrostationdistance = row['metrostationdistance'];
                    projectMap[pName].busstopdistance = row['busstopdistance'];
                }
            }
        }

        // Arrays (Amenities, Commercials, Landmarks, Competitors, Units)
        const amenitiesSheet = workbook.getWorksheet('Amenities');
        if (amenitiesSheet) {
            for (const row of parseWorksheet(amenitiesSheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].amenities!.push({
                        category: row['category'],
                        name: row['name'],
                        description: row['description'],
                        size_specs: row['size_specs']
                    });
                }
            }
        }

        const commercialsSheet = workbook.getWorksheet('Commercials');
        if (commercialsSheet) {
            for (const row of parseWorksheet(commercialsSheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].commercials!.push({
                        name: row['name'],
                        amount: row['amount'] ? parseFloat(row['amount']) : 0,
                        cost_type: row['cost_type'],
                        payment_milestone: row['payment_milestone']
                    });
                }
            }
        }

        const landmarksSheet = workbook.getWorksheet('Landmarks');
        if (landmarksSheet) {
            for (const row of parseWorksheet(landmarksSheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].landmarks!.push({
                        category: row['category'],
                        name: row['name'],
                        distance_km: row['distance_km'] ? row['distance_km'].toString() : undefined,
                        travel_time: row['travel_time']
                    });
                }
            }
        }

        const competitorsSheet = workbook.getWorksheet('Competitors');
        if (competitorsSheet) {
            for (const row of parseWorksheet(competitorsSheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].competitors!.push({
                        name: row['name'],
                        price_range: row['price_range']
                    });
                }
            }
        }

        const unitsSheet = workbook.getWorksheet('Units');
        if (unitsSheet) {
            for (const row of parseWorksheet(unitsSheet)) {
                const pName = row['project_name']?.toString().trim();
                if (pName && projectMap[pName]) {
                    projectMap[pName].units!.push({
                        unitnumber: row['unitnumber'],
                        tower: row['tower'],
                        config: row['config'],
                        type: row['type'],
                        floornumber: row['floornumber'] ? parseInt(row['floornumber']) : undefined,
                        actualsba: row['actualsba'] ? parseFloat(row['actualsba']) : undefined,
                        carpetarea: row['carpetarea'] ? parseFloat(row['carpetarea']) : undefined,
                        udsarea: row['udsarea'] ? parseFloat(row['udsarea']) : undefined,
                        facing: row['facing'],
                        wccount: row['wccount'] ? parseInt(row['wccount']) : undefined,
                        balconycount: row['balconycount'] ? parseInt(row['balconycount']) : undefined,
                        pricepersqft: row['pricepersqft'] ? parseFloat(row['pricepersqft']) : undefined,
                        pricetotal: row['pricetotal'] ? parseFloat(row['pricetotal']) : undefined,
                        status: row['status'] || 'Available'
                    });
                }
            }
        }

        const errors: Array<{ project: string; error: string }> = [];
        const skipped: Array<{ project: string; reason: string }> = [];
        let successful = 0;

        // Process all projects
        const projectNames = Object.keys(projectMap);
        if (projectNames.length === 0) {
            return NextResponse.json({ error: 'No valid projects found in the Projects sheet' }, { status: 400 });
        }

        // Verify user from DB
        const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } });

        for (const pName of projectNames) {
            try {
                // Check if project exists
                const existing = await prisma.project.findFirst({
                    where: { project_name: pName }
                });

                if (existing) {
                    skipped.push({ project: pName, reason: `Project with name "${pName}" already exists.` });
                    continue;
                }

                // Insert to database using the wizard's exact nested schema generator
                const flatData = projectMap[pName] as WizardFormData;
                await createLiveProjectDirectly(flatData, dbUser ? dbUser.id : null);
                successful++;

            } catch (err: any) {
                console.error(`Error processing project ${pName}:`, err);
                errors.push({
                    project: pName,
                    error: err.message
                });
            }
        }

        return NextResponse.json({
            total: projectNames.length,
            successful,
            skipped: skipped.length,
            failed: errors.length,
            skippedDetails: skipped,
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
    // Ideally this would return the static 14-sheet template.
    // For now, redirect or return error because generating 14 sheets in code is massive.
    // Assuming the user already has the template downloaded.
    return NextResponse.json({
        message: 'Please use the Full_Schema_Total_Parity_Template.xlsx provided separately.'
    }, { status: 200 });
}
