import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET(_req: NextRequest) {
    const workbook = new ExcelJS.Workbook();

    // ----- Projects -----
    const projects = workbook.addWorksheet('Projects');
    projects.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'created_by', key: 'created_by' },
        { header: 'general_location', key: 'general_location' },
        { header: 'address_line', key: 'address_line' },
        { header: 'district', key: 'district' },
        { header: 'lat', key: 'lat' },
        { header: 'lng', key: 'lng' },
        { header: 'total_land_area', key: 'total_land_area' },
        { header: 'total_phases', key: 'total_phases' },
        { header: 'project_theme', key: 'project_theme' },
        { header: 'projectstatus', key: 'projectstatus' },
        { header: 'possession_month', key: 'possession_month' },
        { header: 'possession_year', key: 'possession_year' },
        { header: 'slug', key: 'slug' },
        { header: 'city', key: 'city' },
        { header: 'pincode', key: 'pincode' },
        { header: 'region', key: 'region' },
        { header: 'city_zone', key: 'city_zone' },
        { header: 'property_type', key: 'property_type' },
        { header: 'current_phase_under_sale', key: 'current_phase_under_sale' },
        { header: 'total_units', key: 'total_units' },
        { header: 'pricedisplay', key: 'pricedisplay' },
        { header: 'pricemin', key: 'pricemin' },
        { header: 'pricemax', key: 'pricemax' },
        { header: 'payment_plan_type', key: 'payment_plan_type' },
        { header: 'payment_plan_details', key: 'payment_plan_details' },
        { header: 'floor_rise_charges', key: 'floor_rise_charges' },
        { header: 'configurations', key: 'configurations' },
        { header: 'hero_image', key: 'hero_image' },
        { header: 'images', key: 'images' },
        { header: 'virtual_tour_url', key: 'virtual_tour_url' },
        { header: 'brochure_url', key: 'brochure_url' },
        { header: 'rera_registration_no', key: 'rera_registration_no' }
    ];
    projects.addRow({
        project_name: 'Sample Super Project',
        general_location: 'City Center',
        address_line: '123 Main Street',
        district: 'Metropolis',
        lat: 12.9716,
        lng: 77.5946,
        total_land_area: '5 Acres',
        total_phases: 2,
        project_theme: 'Luxury',
        projectstatus: 'Under_Construction',
        possession_month: 'December',
        possession_year: 2026,
        slug: 'sample-super-project',
        city: 'Bengaluru',
        pincode: '560001',
        region: 'Central',
        city_zone: 'CBD',
        property_type: 'Apartment',
        current_phase_under_sale: 'Phase 1',
        total_units: 200,
        pricedisplay: '₹2.5 Cr',
        pricemin: 25000000,
        pricemax: 50000000,
        configurations: '3BHK, 4BHK',
        rera_registration_no: 'PRM/123/'
    });

    // ----- Developer -----
    const developer = workbook.addWorksheet('Developer');
    developer.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'name', key: 'name' },
        { header: 'logo_url', key: 'logo_url' },
        { header: 'website', key: 'website' },
        { header: 'buildergrade', key: 'buildergrade' },
        { header: 'corporate_rera', key: 'corporate_rera' },
        { header: 'description', key: 'description' },
        { header: 'reputation', key: 'reputation' },
        { header: 'years_in_market', key: 'years_in_market' },
        { header: 'past_projects', key: 'past_projects' },
        { header: 'financial_strength', key: 'financial_strength' }
    ];
    developer.addRow({
        project_name: 'Sample Super Project',
        name: 'Reliable Builders',
        website: 'https://reliable.example.com',
        buildergrade: 'A+',
        years_in_market: 25,
        past_projects: '50+ projects delivered',
        reputation: 'Excellent'
    });

    // ----- Analysis -----
    const analysis = workbook.addWorksheet('Analysis');
    analysis.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'pros', key: 'pros' },
        { header: 'cons', key: 'cons' },
        { header: 'usp', key: 'usp' },
        { header: 'usp_highlights', key: 'usp_highlights' },
        { header: 'closing_pitch', key: 'closing_pitch' },
        { header: 'target_customer', key: 'target_customer' },
        { header: 'objection_handling', key: 'objection_handling' },
        { header: 'legal_notes', key: 'legal_notes' },
        { header: 'timeline_risk', key: 'timeline_risk' },
        { header: 'overall_rating', key: 'overall_rating' }
    ];
    analysis.addRow({
        project_name: 'Sample Super Project',
        pros: 'Great Location, Good Amenities',
        cons: 'High Traffic Area',
        usp: 'Only project with 5 acre park in CBD',
        objection_handling: '{"Traffic": "Managed by 4-lane expansion"}',
        overall_rating: 4.8
    });

    // ----- Units -----
    const units = workbook.addWorksheet('Units');
    units.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'unitnumber', key: 'unitnumber' },
        { header: 'tower', key: 'tower' },
        { header: 'floornumber', key: 'floornumber' },
        { header: 'config', key: 'config' },
        { header: 'type', key: 'type' },
        { header: 'actualsba', key: 'actualsba' },
        { header: 'carpetarea', key: 'carpetarea' },
        { header: 'udsarea', key: 'udsarea' },
        { header: 'facing', key: 'facing' },
        { header: 'wccount', key: 'wccount' },
        { header: 'balconycount', key: 'balconycount' },
        { header: 'pricepersqft', key: 'pricepersqft' },
        { header: 'pricetotal', key: 'pricetotal' },
        { header: 'status', key: 'status' }
    ];
    units.addRow({
        project_name: 'Sample Super Project',
        unitnumber: 'A-101',
        tower: 'Tower A',
        floornumber: 1,
        config: '3BHK',
        type: 'Premium',
        actualsba: 1800,
        carpetarea: 1300,
        facing: 'East',
        wccount: 3,
        balconycount: 2,
        pricetotal: 25000000,
        status: 'Available'
    });

    // ----- Specifications -----
    const specs = workbook.addWorksheet('Specifications');
    specs.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'no_of_towers', key: 'no_of_towers' },
        { header: 'floors_per_tower', key: 'floors_per_tower' },
        { header: 'units_per_floor', key: 'units_per_floor' },
        { header: 'elevators_per_tower', key: 'elevators_per_tower' },
        { header: 'service_elevators_per_tower', key: 'service_elevators_per_tower' },
        { header: 'construction_type', key: 'construction_type' },
        { header: 'structure_details', key: 'structure_details' },
        { header: 'wall_finishing_interior', key: 'wall_finishing_interior' },
        { header: 'wall_finishing_exterior', key: 'wall_finishing_exterior' },
        { header: 'flooring_living_dining', key: 'flooring_living_dining' },
        { header: 'flooring_master_bedroom', key: 'flooring_master_bedroom' },
        { header: 'flooring_other_bedrooms', key: 'flooring_other_bedrooms' },
        { header: 'flooring_balcony_utility', key: 'flooring_balcony_utility' },
        { header: 'kitchen_countertop', key: 'kitchen_countertop' },
        { header: 'kitchen_sink_details', key: 'kitchen_sink_details' },
        { header: 'kitchen_dado_tiling', key: 'kitchen_dado_tiling' },
        { header: 'gas_pipeline_provision', key: 'gas_pipeline_provision' },
        { header: 'bathroom_sanitary_ware', key: 'bathroom_sanitary_ware' },
        { header: 'bathroom_cp_fittings', key: 'bathroom_cp_fittings' },
        { header: 'bathroom_dado_tiling', key: 'bathroom_dado_tiling' },
        { header: 'main_door_specs', key: 'main_door_specs' },
        { header: 'internal_doors_specs', key: 'internal_doors_specs' },
        { header: 'windows_specs', key: 'windows_specs' },
        { header: 'electrical_switches', key: 'electrical_switches' },
        { header: 'power_backup', key: 'power_backup' },
        { header: 'road_width', key: 'road_width' },
        { header: 'water_source', key: 'water_source' },
        { header: 'open_space_pct', key: 'open_space_pct' }
    ];
    specs.addRow({
        project_name: 'Sample Super Project',
        no_of_towers: 3,
        floors_per_tower: 20,
        construction_type: 'Mivan',
        flooring_living_dining: 'Italian Marble',
        power_backup: '100% DG'
    });

    // ----- Amenities -----
    const amenities = workbook.addWorksheet('Amenities');
    amenities.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'category', key: 'category' },
        { header: 'name', key: 'name' },
        { header: 'description', key: 'description' },
        { header: 'size_specs', key: 'size_specs' }
    ];
    amenities.addRow({
        project_name: 'Sample Super Project',
        category: 'Sports',
        name: 'Tennis Court',
        size_specs: 'Standard Size'
    });

    // ----- Landmarks -----
    const landmarks = workbook.addWorksheet('Landmarks');
    landmarks.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'category', key: 'category' },
        { header: 'name', key: 'name' },
        { header: 'distance_km', key: 'distance_km' },
        { header: 'travel_time', key: 'travel_time' }
    ];
    landmarks.addRow({
        project_name: 'Sample Super Project',
        category: 'Malls',
        name: 'City Mall',
        distance_km: '2',
        travel_time: '5 mins'
    });

    // ----- Commercials -----
    const commercials = workbook.addWorksheet('Commercials');
    commercials.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'name', key: 'name' },
        { header: 'amount', key: 'amount' },
        { header: 'cost_type', key: 'cost_type' },
        { header: 'payment_milestone', key: 'payment_milestone' }
    ];
    commercials.addRow({
        project_name: 'Sample Super Project',
        name: 'Corpus Fund',
        amount: 150000,
        cost_type: 'One-Time'
    });

    // ----- Competitors -----
    const competitors = workbook.addWorksheet('Competitors');
    competitors.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'name', key: 'name' },
        { header: 'price_range', key: 'price_range' }
    ];
    competitors.addRow({
        project_name: 'Sample Super Project',
        name: 'Rival Towers',
        price_range: '2.4 Cr - 4 Cr'
    });

    // ----- Connectivity -----
    const connectivity = workbook.addWorksheet('Connectivity');
    connectivity.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'distancetomainroad', key: 'distancetomainroad' },
        { header: 'airportdistance', key: 'airportdistance' },
        { header: 'railwaystationdistance', key: 'railwaystationdistance' },
        { header: 'metrostationdistance', key: 'metrostationdistance' },
        { header: 'busstopdistance', key: 'busstopdistance' }
    ];
    connectivity.addRow({
        project_name: 'Sample Super Project',
        distancetomainroad: '100m',
        airportdistance: '35km',
        metrostationdistance: '1km'
    });

    // ----- SiteVisits & Leads -----
    const visits = workbook.addWorksheet('Visits');
    visits.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'customer_name', key: 'customer_name' },
        { header: 'customer_phone', key: 'customer_phone' },
        { header: 'visit_date', key: 'visit_date' },
        { header: 'user_email', key: 'user_email' },
        { header: 'status', key: 'status' },
        { header: 'notes', key: 'notes' }
    ];
    visits.addRow({
        project_name: 'Sample Super Project',
        customer_name: 'John Doe',
        customer_phone: '9876543210',
        visit_date: new Date().toISOString(),
        user_email: 'salesman@example.com',
        status: 'Confirmed'
    });

    const leads = workbook.addWorksheet('Leads');
    leads.columns = [
        { header: 'project_name', key: 'project_name' },
        { header: 'name', key: 'name' },
        { header: 'email', key: 'email' },
        { header: 'phone', key: 'phone' },
        { header: 'status', key: 'status' },
        { header: 'assigned_to_email', key: 'assigned_to_email' }
    ];
    leads.addRow({
        project_name: 'Sample Super Project',
        name: 'Target Lead',
        email: 'lead@example.com',
        status: 'New',
        assigned_to_email: 'salesman@example.com'
    });

    // ----- Users (For 100% schema) -----
    const usersSheet = workbook.addWorksheet('Users');
    usersSheet.columns = [
        { header: 'email', key: 'email' },
        { header: 'fullname', key: 'fullname' },
        { header: 'role', key: 'role' },
        { header: 'is_active', key: 'is_active' }
    ];
    usersSheet.addRow({
        email: 'newadmin@example.com',
        fullname: 'New Admin',
        role: 'super_admin',
        is_active: 'TRUE'
    });
    usersSheet.addRow({
        email: 'salesman@example.com',
        fullname: 'Sales Executive',
        role: 'salesman',
        is_active: 'TRUE'
    });

    // ----- Drafts (For 100% schema) -----
    const draftsSheet = workbook.addWorksheet('Drafts');
    draftsSheet.columns = [
        { header: 'vendor_id', key: 'vendor_id' },
        { header: 'submission_data', key: 'submission_data' },
        { header: 'status', key: 'status' },
        { header: 'admin_notes', key: 'admin_notes' }
    ];
    draftsSheet.addRow({
        vendor_id: 'some-vendor-uuid',
        submission_data: '{"title": "Draft Property"}',
        status: 'pending'
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new NextResponse(buffer, {
        headers: {
            'Content-Type':
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="Full_Schema_Total_Parity_Template.xlsx"'
        }
    });
}
