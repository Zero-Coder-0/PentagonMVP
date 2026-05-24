'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Bridge Function: Transforms ProjectWizard JSON output into 9 Prisma tables
 * Takes the nested "Project Orange" structure and denormalizes it into the schema
 */
export async function createProjectAction(wizardData: any) {
  try {
    // Transaction ensures ALL 9 tables populate or NONE do
    const result = await prisma.$transaction(async (tx: any) => {

      // Calculate configs and pricing upfront
      const unitsArray = wizardData.units || [];
      const configsMap = new Set<string>();
      let pMin: number | null = null;
      let pMax: number | null = null;

      unitsArray.forEach((u: any) => {
        if (u.config) configsMap.add(u.config);
        if (u.pricetotal) {
          const val = parseFloat(u.pricetotal.toString());
          if (!isNaN(val)) {
            if (pMin === null || val < pMin) pMin = val;
            if (pMax === null || val > pMax) pMax = val;
          }
        }
      });

      const uniqueConfigs = Array.from(configsMap);

      let priceDisplay = 'Price on Request';
      if (wizardData.pricing?.price_range) {
        priceDisplay = wizardData.pricing.price_range;
      } else if (pMin !== null && pMax !== null) {
        const formatToLakhsCr = (val: number) => {
          if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
          if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
          return `₹${val.toLocaleString()}`;
        };
        priceDisplay = pMin === pMax ? formatToLakhsCr(pMin) : `${formatToLakhsCr(pMin)} - ${formatToLakhsCr(pMax)}`;
      }

      // ============ 1. PROJECTS (Master Table) ============
      const newProject = await tx.project.create({
        data: {
          project_name: wizardData.name || wizardData.project_name,
          general_location: wizardData.location_data?.address?.general_location || wizardData.location || 'Unknown',
          address_line: wizardData.location_data?.address?.detailed_address || wizardData.address_line || '',
          district: wizardData.location_data?.address?.district || wizardData.district || 'Bengaluru',
          city: wizardData.location_data?.address?.city || 'Bengaluru',
          pincode: wizardData.location_data?.address?.pincode || '',
          region: wizardData.location_data?.address?.region || wizardData.region || '',
          city_zone: wizardData.location_data?.address?.zone || wizardData.zone || '',
          lat: wizardData.lat || wizardData.location_data?.coordinates?.lat || 12.9716,
          lng: wizardData.lng || wizardData.location_data?.coordinates?.lng || 77.5946,

          property_type: wizardData.property_type || '',
          projectstatus: wizardData.status || wizardData.projectstatus || 'UnderConstruction',
          possession_month: wizardData.possession_month || null,
          possession_year: wizardData.possession_year ? parseInt(wizardData.possession_year.toString()) : null,
          total_units: wizardData.total_units ? parseInt(wizardData.total_units.toString()) : null,

          total_phases: wizardData.total_phases ? parseInt(wizardData.total_phases.toString()) : null,
          project_theme: wizardData.project_theme || null,
          total_land_area: wizardData.total_land_area || null,
          current_phase_under_sale: wizardData.current_phase_under_sale || null,

          configurations: uniqueConfigs.length > 0 ? uniqueConfigs : [],
          pricemin: pMin,
          pricemax: pMax,
          pricedisplay: priceDisplay,

          hero_image: wizardData.media?.hero_image || wizardData.hero_image || null,
          images: wizardData.media?.images || wizardData.images || [],
          virtual_tour_url: wizardData.media?.virtual_tour || wizardData.virtual_tour_url || null,
          brochure_url: wizardData.media?.brochure || wizardData.brochure_url || null,
          payment_plan_type: wizardData.payment_plan_type || null,
          payment_plan_details: wizardData.payment_plan_details || null,
          floor_rise_charges: wizardData.floor_rise_charges || null,
          rera_registration_no: wizardData.rera_registration_no || null,
        }
      });

      const projectId = newProject.id;

      // ============ 2. PROJECT UNITS (Detailed Floor Plans & Inventory) ============
      if (wizardData.units?.length > 0) {
        await tx.projectUnit.createMany({
          data: wizardData.units.map((u: any) => {
            let phaseStr = (u.phase || '').trim();
            if (phaseStr && /^\d+$/.test(phaseStr)) {
                phaseStr = `Phase ${phaseStr}`;
            }
            return {
              project_id: projectId,
              unitnumber: phaseStr
                ? `${(u.unitnumber || '').trim()}(${phaseStr})`
                : (u.unitnumber || 'NA').trim(),
              floornumber: u.floornumber ? parseInt(u.floornumber.toString()) : null,
              config: u.config || null,
              type: u.type || null,
              actualsba: u.actualsba ? parseInt(u.actualsba.toString()) : null,
              carpetarea: u.carpetarea ? parseInt(u.carpetarea.toString()) : null,
              udsarea: u.udsarea ? parseInt(u.udsarea.toString()) : null,
              facing: u.facing || null,
              wccount: (u.wccount !== undefined && u.wccount !== null && u.wccount !== '') ? (u.wccount === '6+' ? 6 : parseInt(String(u.wccount), 10)) : null,
              balconycount: (u.balconycount !== undefined && u.balconycount !== null && u.balconycount !== '') ? (u.balconycount === '5+' ? 5 : parseInt(String(u.balconycount), 10)) : null,
              pricepersqft: u.pricepersqft ? parseInt(u.pricepersqft.toString()) : null,
              pricetotal: u.pricetotal ? parseFloat(u.pricetotal.toString()) : null,
              status: u.status || 'Available'
            };
          })
        });
      }

      // ============ 3. PROJECT SPECIFICATIONS (Removed duplicate conditional block) ============

      // ============ 4. PROJECT AMENITIES ============
      const amenitiesPayload: any[] = [];
      const amSource = wizardData.amenities_data || wizardData.amenities;

      if (Array.isArray(amSource)) {
        amSource.forEach((a: any) => {
          if (!a) return;
          amenitiesPayload.push({
            project_id: projectId,
            category: a.category || 'Other',
            name: a.amenity_name || a.facility_name || a.name || 'Unnamed Amenity',
            description: a.description || a.features || '',
            size_specs: a.size_specs || a.dimensions || '',
          });
        });
      } else if (typeof amSource === 'object' && amSource !== null) {
        // Handle nested categories
        ['pool', 'indoor', 'sports', 'outdoor', 'unique'].forEach(cat => {
          const items = amSource[cat];
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              if (item) {
                amenitiesPayload.push({
                  project_id: projectId,
                  category: cat,
                  name: item.amenity_name || item.facility_name || item.name || 'Unnamed Amenity',
                  description: item.description || item.features || '',
                  size_specs: item.size_specs || item.dimensions || '',
                });
              }
            });
          }
        });
      }

      if (amenitiesPayload.length > 0) {
        await tx.projectAmenity.createMany({ data: amenitiesPayload });
      }

      // ============ 5. PROJECT LANDMARKS ============
      const landmarksPayload: any[] = [];
      const lmSource = wizardData.location_data?.landmarks || wizardData.landmarks;

      if (Array.isArray(lmSource)) {
        lmSource.forEach((l: any) => {
          if (!l) return;
          landmarksPayload.push({
            project_id: projectId,
            category: l.category || 'Other',
            name: l.name || 'Landmark',
            distance_km: l.distance_km?.toString() || l.distance?.toString() || null,
            travel_time: l.travel_time || l.travel_time_mins ? `${l.travel_time_mins || l.travel_time} mins` : null,
          });
        });
      }

      if (landmarksPayload.length > 0) {
        await tx.projectLandmark.createMany({ data: landmarksPayload });
      }

      // ============ 6. PROJECT COMMERCIALS (Costs) ============
      const commercialsPayload: any[] = [];
      const cpSource = wizardData.pricing?.other_charges || wizardData.cost_extras || wizardData.commercials;

      if (Array.isArray(cpSource)) {
        cpSource.forEach((c: any) => {
          if (!c) return;
          commercialsPayload.push({
            project_id: projectId,
            name: c.name || c.item_name || 'Extra Cost',
            amount: c.amount || c.cost_amount ? parseFloat((c.amount || c.cost_amount).toString()) : null,
            cost_type: c.type || c.cost_type || 'Fixed',
            payment_milestone: c.milestone || c.payment_milestone || '',
          });
        });
      }

      if (commercialsPayload.length > 0) {
        await tx.projectCommercial.createMany({ data: commercialsPayload });
      }

      // ============ 7. PROJECT ANALYSIS (SWOT) & DEVELOPER & COMPETITORS ============

      // Developer
      const devSource = wizardData.market_analysis?.developer || wizardData.developer_info || {};
      if (devSource.name || wizardData.developer_name) {
        await tx.projectDeveloper.create({
          data: {
            project_id: projectId,
            name: devSource.name || wizardData.developer_name || null,
            buildergrade: devSource.buildergrade || wizardData.developer_buildergrade || 'A',
            reputation: devSource.reputation || wizardData.developer_reputation || '',
            years_in_market: (devSource.years_in_market || wizardData.developer_years_in_market) ? parseInt((devSource.years_in_market || wizardData.developer_years_in_market).toString()) : null,
            past_projects: devSource.past_projects || wizardData.developer_past_projects || '',
            financial_strength: devSource.financial_strength || wizardData.developer_financial_strength || '',
            corporate_rera: devSource.corporate_rera || wizardData.developer_corporate_rera || null,
            description: devSource.description || wizardData.developer_description || null,
            logo_url: devSource.logo_url || wizardData.developer_logo_url || null,
            website: devSource.website || wizardData.developer_website || null,
          }
        });
      }

      // Competitors
      const compSource = wizardData.market_analysis?.competitors || wizardData.competitors;
      if (Array.isArray(compSource) && compSource.length > 0) {
        await tx.projectCompetitor.createMany({
          data: compSource.filter(c => !!c).map((c: any) => ({
            project_id: projectId,
            name: c.name || 'Competitor',
            price_range: c.price_range || c.price || '',
          }))
        });
      }

      // Analysis
      const analysisSource = wizardData.market_analysis?.analysis || wizardData.analysis || wizardData;
      // We check if there's any analysis data explicitly provided, or if the root has pros/cons
      if (analysisSource.pros || analysisSource.cons || analysisSource.usp || analysisSource.closing_pitch) {
        const parseArray = (input: any) => Array.isArray(input) ? input : (typeof input === 'string' ? input.split(',').map(s => s.trim()) : []);
        await tx.projectAnalysis.create({
          data: {
            project_id: projectId,
            pros: parseArray(analysisSource.pros),
            cons: parseArray(analysisSource.cons),
            usp: analysisSource.usp || '',
            closing_pitch: analysisSource.closing_pitch || '',
            target_customer: analysisSource.target_customer || '',
            objection_handling: analysisSource.objection_handling || null,
            legal_notes: analysisSource.legal_notes || null,
            timeline_risk: analysisSource.timeline_risk || null,
            overall_rating: analysisSource.rating || analysisSource.overall_rating
              ? parseFloat((analysisSource.rating || analysisSource.overall_rating).toString())
              : null,
          }
        });
      }

      // Specifications
      await tx.projectSpecification.create({
        data: {
          project_id: projectId,
          no_of_towers: wizardData.no_of_towers ? parseInt(wizardData.no_of_towers.toString()) : null,
          floors_per_tower: wizardData.floors_per_tower ? parseInt(wizardData.floors_per_tower.toString()) : null,
          units_per_floor: wizardData.units_per_floor ? parseInt(wizardData.units_per_floor.toString()) : null,
          elevators_per_tower: wizardData.elevators_per_tower ? parseInt(wizardData.elevators_per_tower.toString()) : null,
          construction_type: wizardData.construction_type || null,
          structure_details: wizardData.structure_details || null,
          flooring_living_dining: wizardData.flooring_living_dining || null,
          flooring_master_bedroom: wizardData.flooring_master_bedroom || null,
          flooring_other_bedrooms: wizardData.flooring_other_bedrooms || null,
          kitchen_countertop: wizardData.kitchen_countertop || null,
          bathroom_sanitary_ware: wizardData.bathroom_sanitary_ware || null,
          bathroom_cp_fittings: wizardData.bathroom_cp_fittings || null,
          electrical_switches: wizardData.electrical_switches || null,
          main_door_specs: wizardData.main_door_specs || null,
          internal_doors_specs: wizardData.internal_doors_specs || null,
          power_backup: wizardData.power_backup || null,
          open_space_pct: wizardData.open_space_pct?.toString() || null,
          water_source: wizardData.water_source || null,
        }
      });

      // Connectivity
      if (wizardData.distancetomainroad || wizardData.airportdistance) {
        await tx.locationConnectivity.create({
          data: {
            project_id: projectId,
            distancetomainroad: wizardData.distancetomainroad || null,
            airportdistance: wizardData.airportdistance || null,
            railwaystationdistance: wizardData.railwaystationdistance || null,
            metrostationdistance: wizardData.metrostationdistance || null,
            busstopdistance: wizardData.busstopdistance || null,
          }
        })
      }

      return newProject;
    });

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    // @ts-ignore
    revalidateTag('projects');

    return {
      success: true,
      projectId: result.id,
      message: 'Project created successfully across 9 tables'
    };

  } catch (error: any) {
    console.error("❌ Failed to create project:", error);

    let errorMessage = error instanceof Error ? error.message : 'Database insertion failed';

    if (error?.code === 'P2002' && error?.meta?.target?.includes('project_name')) {
      errorMessage = `A project with the name "${wizardData.name || wizardData.project_name}" already exists. Please choose a different name.`;
    }

    return {
      success: false,
      error: errorMessage,
      projectId: null
    };
  }
}
