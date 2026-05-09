import ExcelJS from 'exceljs';

async function generate() {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile('./Full_Schema_Total_Parity_Template (2).xlsx');

    function clearSheet(sheetName) {
        const sheet = workbook.getWorksheet(sheetName);
        if (sheet) {
            const rowCount = sheet.rowCount;
            for (let i = rowCount; i > 1; i--) {
                sheet.spliceRows(i, 1);
            }
        }
    }

    const sheets = [
        "Projects", "Developer", "Analysis", "Units", "Specifications", 
        "Amenities", "Landmarks", "Commercials", "Competitors", 
        "Connectivity", "Visits", "Leads", "Users", "Drafts"
    ];
    sheets.forEach(clearSheet);

    const projectsSheet = workbook.getWorksheet('Projects');
    const developerSheet = workbook.getWorksheet('Developer');
    const analysisSheet = workbook.getWorksheet('Analysis');
    const unitsSheet = workbook.getWorksheet('Units');
    const specsSheet = workbook.getWorksheet('Specifications');
    const amenitiesSheet = workbook.getWorksheet('Amenities');
    const landmarksSheet = workbook.getWorksheet('Landmarks');
    const commercialsSheet = workbook.getWorksheet('Commercials');
    const competitorsSheet = workbook.getWorksheet('Competitors');
    const connectivitySheet = workbook.getWorksheet('Connectivity');

    const projects = [
        {
            name: "Rainbow Mayfair", devName: "Rainbow Properties",
            location: "Hullahalli, Bengaluru", rera: "PRM/KA/RERA/1251/308/PR/190325/007593",
            type: "Villas", theme: "Lake-Facing Serenity", landArea: "4 Acre", phases: 2, units: 64,
            basePrice: 10200, openSpace: 60, clubhouse: "11,000 Sq.ft",
            distMainRoad: "1 Kms", distAirport: "45-60 km", distRailway: "Heelalige", distMetro: "Upcoming Namma Metro Yellow Line",
            floors: 3, unitsPerFloor: 1, towers: 1, constructionType: "Seismic-II zone compliant RCC framed structure",
            unitData: [
                { config: "4BHK", sba: 3923, uds: 2400 },
                { config: "4BHK", sba: 3959, uds: 2400 },
                { config: "4BHK", sba: 4894, uds: 2400 },
                { config: "5BHK", sba: 4836, uds: 2400 }
            ],
            pros: ["Lakefront living", "Vehicle-Free Zone", "Large UDS"],
            cons: ["Common wall structure", "Far from metro"], target_customer: "IT professionals, families"
        },
        {
            name: "SOBHA Neopolis", devName: "SOBHA Limited",
            location: "Panathur Main Road, ORR IT Corridor", rera: "PRM/KA/RERA/1251/446/PR/200923/006269",
            type: "Premium Residential Township", theme: "Greek / Santorini Theme", landArea: "25 Acres", phases: 5, units: 1875,
            basePrice: 12000, openSpace: 78, clubhouse: "77,850 sq ft",
            distMainRoad: "Immediate access", distAirport: "45-60 km", distRailway: "Heelalige", distMetro: "Metro Phase 2A/2B",
            floors: 18, unitsPerFloor: 8, towers: 19, constructionType: "RCC-framed high-rise structure",
            unitData: [
                { config: "1 BHK", sba: 660, carpet: 435, uds: null },
                { config: "3 BHK", sba: 1611, uds: null },
                { config: "4 BHK", sba: 2333, uds: null }
            ],
            pros: ["Theme: Greek Santorini", "3 Clubhouses", "Low Density"],
            cons: ["High pricing", "Traffic on Panathur road"], target_customer: "IT Professionals (VP/Director level)"
        },
        {
            name: "Godrej Woods", devName: "Godrej Properties Limited",
            location: "Thanisandra Main Road", rera: "PRM/KA/RERA/1251/472/PR/121125/008248",
            type: "High-Rise Residential Apartments", theme: "Forest-Themed", landArea: "7 Acres", phases: 1, units: 558,
            basePrice: 12000, openSpace: 76, clubhouse: "20,000 Sq. Ft.",
            distMainRoad: "0 km", distAirport: "25 mins", distRailway: "Yelahanka Junction", distMetro: "Upcoming Nagawara",
            floors: 13, unitsPerFloor: 5, towers: 10, constructionType: "RCC Framed Structure",
            unitData: [
                { config: "2 BHK", sba: 1242, uds: null },
                { config: "3 BHK Premium", sba: 1887, uds: null },
                { config: "3 BHK Luxe", sba: 2191, uds: null }
            ],
            pros: ["Forest Living", "Main Road Location"],
            cons: ["Small 2BHK size"], target_customer: "IT families"
        },
        {
            name: "Brigade Belvedere", devName: "Brigade Group",
            location: "Budigere Cross", rera: "PRM/KA/RERA/1251/446/PR/240326/008549",
            type: "Residential Apartments", theme: "Premium High-Rise Urban Living", landArea: "10.75 Acres", phases: 1, units: 1750,
            basePrice: 11761, openSpace: 81, clubhouse: "25,000 Sq.ft",
            distMainRoad: "0 km", distAirport: "25-30 km", distRailway: "KR Puram", distMetro: "KR Puram Metro",
            floors: 43, unitsPerFloor: 10, towers: 5, constructionType: "RCC High-rise",
            unitData: [
                { config: "1 BHK", sba: 715, uds: null },
                { config: "2 BHK", sba: 1111, uds: null },
                { config: "3 BHK", sba: 1720, uds: null }
            ],
            pros: ["High Rise 43 floors", "Large units", "Prime location"],
            cons: [], target_customer: "IT professionals, investors"
        },
        {
            name: "Bren Aspera", devName: "Bren Corporation Pvt. Ltd.",
            location: "Old Madras Road Corridor", rera: "PRM/KA/RERA/1251/310/PR/300622/005028",
            type: "Premium Residential Apartments", theme: "Premium Community Living", landArea: "4.39 Acres", phases: 1, units: 394,
            basePrice: 9800, openSpace: 60, clubhouse: "15,000 Sq.ft",
            distMainRoad: "0 km", distAirport: "27-32 km", distRailway: "KR Puram", distMetro: "KR Puram Metro",
            floors: 26, unitsPerFloor: 8, towers: 2, constructionType: "RCC (Aluminium Formwork)",
            unitData: [
                { config: "3 BHK", sba: 1389, uds: null }
            ],
            pros: ["Low density", "Established builder"],
            cons: ["Only 3BHK available"], target_customer: "IT Professionals + Investors"
        },
        {
            name: "Godrej Parkshire", devName: "Godrej Properties Ltd.",
            location: "Hoskote", rera: "PRM/KA/RERA/1250/304/PR/090126/008393",
            type: "Premium Residential Apartments", theme: "Nature-Themed High-Rise Living", landArea: "13.8 Acres", phases: 1, units: 1100,
            basePrice: 12300, openSpace: 80, clubhouse: "32,500 sq.ft",
            distMainRoad: "0 km", distAirport: "30-35 km", distRailway: "Whitefield", distMetro: "Whitefield Metro",
            floors: 28, unitsPerFloor: 8, towers: 5, constructionType: "RCC High-Rise Structure",
            unitData: [
                { config: "2 BHK", sba: 1063, uds: null },
                { config: "3 BHK", sba: 1510, uds: null }
            ],
            pros: ["Nature-Themed Township Living", "Godrej brand", "Large land parcel"],
            cons: ["Hoskote distance"], target_customer: "Investors, IT professionals"
        },
        {
            name: "Sattva Songbird", devName: "Sattva Group",
            location: "300 meters from Old Madras Road", rera: "PRM/KA/RERA/1251/310/PR/270326/008557",
            type: "Integrated Township", theme: "Nature-Themed Township Living", landArea: "16 Acres", phases: 2, units: 1679,
            basePrice: 10500, openSpace: 80, clubhouse: "100,000 sqft",
            distMainRoad: "0 km", distAirport: "25-30 km", distRailway: "KR Puram", distMetro: "KR Puram Metro",
            floors: 31, unitsPerFloor: 8, towers: 4, constructionType: "RCC / Shear Wall Structure",
            unitData: [
                { config: "1 BHK", sba: 753, uds: null },
                { config: "2 BHK", sba: 1268, uds: null },
                { config: "3 BHK", sba: 1733, uds: null },
                { config: "Row House", sba: 3336, uds: null }
            ],
            pros: ["16 Acres Township", "Sattva Brand", "STRR Growth"],
            cons: ["Long Timeline"], target_customer: "Investors + End Users"
        },
        {
            name: "SOBHA OneWorld", devName: "SOBHA Limited",
            location: "Old Madras Road", rera: "Pending",
            type: "Integrated Township", theme: "Next-generation integrated township", landArea: "48 Acres", phases: 1, units: 3484,
            basePrice: 11500, openSpace: 80, clubhouse: "50,000 sqft",
            distMainRoad: "0 km", distAirport: "30-35 km", distRailway: "KR Puram", distMetro: "Whitefield Metro",
            floors: 46, unitsPerFloor: 8, towers: 14, constructionType: "High-rise residential township",
            unitData: [
                { config: "1 BHK", sba: 734, uds: null },
                { config: "2 BHK", sba: 1063, uds: null },
                { config: "3 BHK", sba: 1510, uds: null },
                { config: "4 BHK", sba: 2096, uds: null }
            ],
            pros: ["SOBHA brand", "48-acre township", "Multiple unit options"],
            cons: ["Possession details not shared"], target_customer: "Investors, East Bengaluru buyers"
        }
    ];

    let uId = 1;
    for (const p of projects) {
        projectsSheet.addRow({
            project_name: p.name, created_by: "Admin", general_location: p.location,
            rera_registration_no: p.rera, property_type: p.type,
            project_theme: p.theme, total_land_area: p.landArea, total_phases: p.phases,
            total_units: p.units, pricemin: p.basePrice * 1000, pricemax: p.basePrice * 3000,
            projectstatus: "UnderConstruction"
        });

        developerSheet.addRow({ project_name: p.name, name: p.devName });
        
        connectivitySheet.addRow({
            project_name: p.name, distancetomainroad: p.distMainRoad, airportdistance: p.distAirport,
            railwaystationdistance: p.distRailway, metrostationdistance: p.distMetro
        });

        specsSheet.addRow({
            project_name: p.name, construction_type: p.constructionType, no_of_towers: p.towers,
            floors_per_tower: p.floors, units_per_floor: p.unitsPerFloor, open_space_pct: p.openSpace
        });

        amenitiesSheet.addRow({ project_name: p.name, category: "Clubhouse", name: "Main Clubhouse", size_specs: p.clubhouse });

        analysisSheet.addRow({
            project_name: p.name, pros: JSON.stringify(p.pros), cons: JSON.stringify(p.cons),
            target_customer: p.target_customer, usp: p.pros[0] || ""
        });

        for(const u of p.unitData) {
            unitsSheet.addRow({
                project_name: p.name, unitnumber: "U-" + (uId++), config: u.config, 
                actualsba: u.sba || null, carpetarea: u.carpet || null, udsarea: u.uds || null, 
                pricepersqft: p.basePrice, pricetotal: u.sba ? u.sba * p.basePrice : null, status: "Available"
            });
        }
    }

    await workbook.xlsx.writeFile('./Populated_Parity_Template.xlsx');
    console.log("File Populated_Parity_Template.xlsx generated successfully.");
}

generate().catch(console.error);
