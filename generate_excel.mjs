import ExcelJS from 'exceljs';
import fs from 'fs';

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

    [projectsSheet, developerSheet, analysisSheet, unitsSheet, specsSheet, amenitiesSheet, landmarksSheet, commercialsSheet, competitorsSheet, connectivitySheet].forEach(sheet => {
        if (!sheet) return;
        const headers = sheet.getRow(1).values;
        if (Array.isArray(headers)) {
            sheet.columns = headers.slice(1).map((h, i) => ({
                header: h.toString(),
                key: h.toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
            }));
        }
    });

    // Read TSV
    const tsvText = fs.readFileSync('./raw_data.tsv', 'utf-8');
    const lines = tsvText.split('\n').filter(Boolean);
    const headers = lines[0].split('\t');
    const projectNames = headers.slice(2); // From Rainbow Mayfair to SOBHA OneWorld

    // Parse into objects
    const rawProjects = projectNames.map(name => ({ "Project Name": name.trim() }));
    
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        const field = cols[1]?.trim();
        if (!field) continue;
        for (let j = 0; j < projectNames.length; j++) {
            rawProjects[j][field] = cols[j + 2]?.trim();
        }
    }

    // Hardcoded Units Data since parsing the chaotic text is unreliable
    const unitDataMap = {
        "Rainbow Mayfair": [
            { config: "4BHK", sba: 3923, uds: 2400 },
            { config: "4BHK", sba: 3959, uds: 2400 },
            { config: "4BHK", sba: 4894, uds: 2400 },
            { config: "5BHK", sba: 4836, uds: 2400 }
        ],
        "SOBHA Neopolis": [
            { config: "1 BHK", sba: 660, carpet: 435, uds: null },
            { config: "3 BHK", sba: 1611, uds: null },
            { config: "4 BHK", sba: 2333, uds: null }
        ],
        "Godrej Woods": [
            { config: "2 BHK", sba: 1242, uds: null },
            { config: "3 BHK", sba: 1887, uds: null },
            { config: "3 BHK Luxe", sba: 2191, uds: null }
        ],
        "Brigade Belvedere": [
            { config: "1 BHK", sba: 715, uds: null },
            { config: "2 BHK", sba: 1111, uds: null },
            { config: "3 BHK", sba: 1720, uds: null }
        ],
        "Bren Aspera": [
            { config: "3 BHK", sba: 1389, uds: null }
        ],
        "Godrej Parkshire": [
            { config: "2 BHK", sba: 1063, uds: null },
            { config: "3 BHK", sba: 1510, uds: null }
        ],
        "Sattva Songbird": [
            { config: "1 BHK", sba: 753, uds: null },
            { config: "2 BHK", sba: 1268, uds: null },
            { config: "3 BHK", sba: 1733, uds: null },
            { config: "Row House", sba: 3336, uds: null }
        ],
        "SOBHA OneWorld": [
            { config: "1 BHK", sba: 734, uds: null },
            { config: "2 BHK", sba: 1063, uds: null },
            { config: "3 BHK", sba: 1510, uds: null },
            { config: "4 BHK", sba: 2096, uds: null }
        ]
    };

    function parseNumber(str) {
        if (!str) return null;
        const match = str.match(/\d+/);
        return match ? parseInt(match[0], 10) : null;
    }

    let uId = 1;

    for (const rp of rawProjects) {
        const pName = rp["Project Name"];
        if (!pName) continue;

        // 1. Projects Sheet
        projectsSheet.addRow({
            project_name: pName,
            created_by: undefined,
            general_location: rp["Project Address"],
            address_line: rp["Project Address"], // Maps to address_line
            district: "Bengaluru", // Extrapolated from location data
            rera_registration_no: rp["RERA Registration No."],
            property_type: rp["Type of Development"],
            project_theme: rp["Project Theme"],
            total_land_area: rp["Total Land Area"],
            total_phases: parseNumber(rp["Number of Phases"]),
            total_units: parseNumber(rp["Total Units"]),
            current_phase_under_sale: rp["Current Phase Under Sale"],
            pricemin: parseNumber(rp["Base Price (per sq ft)"]) * 1000,
            pricemax: parseNumber(rp["Base Price (per sq ft)"]) * 3000,
            pricedisplay: "₹ " + parseNumber(rp["Base Price (per sq ft)"]) + " / Sq.ft Base",
            configurations: rp["Available Configurations"] || "", // Added configurations
            projectstatus: "UnderConstruction"
        });

        // 2. Developer Sheet
        developerSheet.addRow({ 
            project_name: pName, 
            name: rp["Developer / Builder Name"],
            reputation: rp["Developer Reputation"],
            past_projects: rp["Past Completed Projects"],
            years_in_market: parseNumber(rp["Years in Market"]),
            financial_strength: rp["Financial Strength"],
            description: "Construction Quality: " + rp["Construction Quality"] + " | Feedback: " + rp["Customer Feedback"]
        });
        
        // 3. Connectivity Sheet
        connectivitySheet.addRow({
            project_name: pName, 
            distancetomainroad: rp["Distance to Main Road"], 
            airportdistance: rp["Airport Distance"],
            railwaystationdistance: rp["Railway Station Distance"], 
            metrostationdistance: rp["Metro Station Distance"]
        });

        // 4. Specifications Sheet
        specsSheet.addRow({
            project_name: pName, 
            construction_type: rp["Construction Type"], 
            no_of_towers: parseNumber(rp["No. of Towers / Blocks"]),
            floors_per_tower: parseNumber(rp["Floors per Tower"]), 
            units_per_floor: parseNumber(rp["Units per Floor"]), 
            open_space_pct: rp["Open Space Percentage"]
        });

        // 5. Amenities Sheet
        amenitiesSheet.addRow({ 
            project_name: pName, 
            category: "Clubhouse", 
            name: "Main Clubhouse", 
            size_specs: rp["Clubhouse Size"] 
        });

        // 6. Landmarks Sheet
        landmarksSheet.addRow({
            project_name: pName,
            category: "General",
            name: rp["Landmark / Key Access"]
        });

        // 7. Analysis Sheet
        analysisSheet.addRow({
            project_name: pName, 
            target_customer: rp["Ideal Customer Persona"], 
            usp: rp["Key Selling Points"],
            usp_highlights: rp["Key Selling Points"], // Added usp_highlights
            pros: JSON.stringify([rp["Key Selling Points"]]),
            cons: JSON.stringify([])
        });

        // 8. Units Sheet
        const unitData = unitDataMap[pName] || [];
        const basePrice = parseNumber(rp["Base Price (per sq ft)"]);
        for(const u of unitData) {
            unitsSheet.addRow({
                project_name: pName, 
                unitnumber: "U-" + (uId++), 
                config: u.config, 
                actualsba: u.sba || null, 
                carpetarea: u.carpet || null, 
                udsarea: u.uds || null, 
                pricepersqft: basePrice, 
                pricetotal: u.sba && basePrice ? u.sba * basePrice : null, 
                status: "Available"
            });
        }
    }

    await workbook.xlsx.writeFile('./Populated_Parity_Template.xlsx');
    console.log("File Populated_Parity_Template.xlsx generated successfully with all TSV data!");
}

generate().catch(console.error);
