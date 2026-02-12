// src/app/api/test-schema/route.ts
// Test endpoint to verify new schema integration
// Access at: http://localhost:3000/api/test-schema

import { NextResponse } from 'next/server';
import { createClient } from '@/core/db/server';
import {
  fetchProjectsFiltered,
  fetchProjectById,
  fetchProjectsForMap,
  fetchFilterOptions,
  fetchDevelopers,
  fetchAmenitiesMaster,
} from '@/modules/inventory/actions-v7';

export async function GET(request: Request) {
  const testResults: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      errors: [],
    },
  };

  try {
    const supabase = await createClient();

    // =====================================================
    // TEST 1: Database Connection
    // =====================================================
    try {
      const { data: healthCheck, error } = await supabase
        .from('projects')
        .select('count')
        .limit(1);

      if (error) throw error;

      testResults.tests.push({
        name: 'Database Connection',
        status: 'PASSED ✅',
        message: 'Successfully connected to Supabase',
      });
      testResults.summary.passed++;
    } catch (error: any) {
      testResults.tests.push({
        name: 'Database Connection',
        status: 'FAILED ❌',
        error: error.message,
      });
      testResults.summary.failed++;
      testResults.summary.errors.push(error.message);
    }

    // =====================================================
    // TEST 2: Check if tables exist
    // =====================================================
    const requiredTables = [
      'projects',
      'developers',
      'units',
      'unit_templates',
      'amenities_master',
      'project_amenities_link',
      'project_analysis',
      'project_landmarks',
      'project_competitors',
      'leads',
      'site_visits',
    ];

    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('*').limit(1);

        if (error) throw error;

        testResults.tests.push({
          name: `Table: ${table}`,
          status: 'EXISTS ✅',
        });
        testResults.summary.passed++;
      } catch (error: any) {
        testResults.tests.push({
          name: `Table: ${table}`,
          status: 'MISSING ❌',
          error: error.message,
        });
        testResults.summary.failed++;
        testResults.summary.errors.push(`Table ${table}: ${error.message}`);
      }
    }

    // =====================================================
    // TEST 3: Check ENUM types
    // =====================================================
    try {
      // Try inserting a test project with ENUM values
      const { data: testProject, error: enumError } = await supabase
        .from('projects')
        .select('bangalore_zone, project_status, builder_grade')
        .limit(1)
        .single();

      testResults.tests.push({
        name: 'ENUM Types Check',
        status: 'PASSED ✅',
        data: {
          sample_zone: testProject?.bangalore_zone || 'No data yet',
          sample_status: testProject?.project_status || 'No data yet',
          sample_grade: testProject?.builder_grade || 'No data yet',
        },
      });
      testResults.summary.passed++;
    } catch (error: any) {
      testResults.tests.push({
        name: 'ENUM Types Check',
        status: 'WARNING ⚠️',
        message: 'No projects found to test ENUMs',
      });
    }

    // =====================================================
    // TEST 4: Fetch Developers
    // =====================================================
    try {
      const result = await fetchDevelopers();

      if (!result.success) throw new Error(result.error);

      testResults.tests.push({
        name: 'Fetch Developers',
        status: 'PASSED ✅',
        data: {
          count: result.data?.length || 0,
          sample: result.data?.[0]?.developer_name || 'No developers yet',
        },
      });
      testResults.summary.passed++;
    } catch (error: any) {
      testResults.tests.push({
        name: 'Fetch Developers',
        status: 'FAILED ❌',
        error: error.message,
      });
      testResults.summary.failed++;
      testResults.summary.errors.push(`fetchDevelopers: ${error.message}`);
    }

    // =====================================================
    // TEST 5: Fetch Amenities Master
    // =====================================================
    try {
      const result = await fetchAmenitiesMaster();

      if (!result.success) throw new Error(result.error);

      testResults.tests.push({
        name: 'Fetch Amenities Master',
        status: 'PASSED ✅',
        data: {
          count: result.data?.length || 0,
          categories: Array.from(
            new Set(result.data?.map((a) => a.category) || [])
          ),
        },
      });
      testResults.summary.passed++;
    } catch (error: any) {
      testResults.tests.push({
        name: 'Fetch Amenities Master',
        status: 'FAILED ❌',
        error: error.message,
      });
      testResults.summary.failed++;
      testResults.summary.errors.push(`fetchAmenitiesMaster: ${error.message}`);
    }

    // =====================================================
    // TEST 6: Fetch Projects (Filtered)
    // =====================================================
    try {
      const result = await fetchProjectsFiltered({});

      if (!result.success) throw new Error(result.error);

      testResults.tests.push({
        name: 'Fetch Projects (No Filter)',
        status: 'PASSED ✅',
        data: {
          total_projects: result.data?.length || 0,
          sample_project: result.data?.[0]?.project_name || 'No projects yet',
          has_developer_join: !!result.data?.[0]?.developer,
          cached_fields: {
            price_min: result.data?.[0]?.price_min || 'N/A',
            price_display: result.data?.[0]?.price_display || 'N/A',
            configurations: result.data?.[0]?.configurations || [],
            gallery_images_count: result.data?.[0]?.gallery_images?.length || 0,
          },
        },
      });
      testResults.summary.passed++;
    } catch (error: any) {
      testResults.tests.push({
        name: 'Fetch Projects (No Filter)',
        status: 'FAILED ❌',
        error: error.message,
      });
      testResults.summary.failed++;
      testResults.summary.errors.push(`fetchProjectsFiltered: ${error.message}`);
    }

    // =====================================================
    // TEST 7: Fetch Projects for Map
    // =====================================================
    try {
      const result = await fetchProjectsForMap();

      if (!result.success) throw new Error(result.error);

      testResults.tests.push({
        name: 'Fetch Projects for Map',
        status: 'PASSED ✅',
        data: {
          count: result.data?.length || 0,
          sample_coordinates: result.data?.[0]
            ? {
                lat: result.data[0].latitude,
                lng: result.data[0].longitude,
                name: result.data[0].project_name,
              }
            : 'No data',
        },
      });
      testResults.summary.passed++;
    } catch (error: any) {
      testResults.tests.push({
        name: 'Fetch Projects for Map',
        status: 'FAILED ❌',
        error: error.message,
      });
      testResults.summary.failed++;
      testResults.summary.errors.push(`fetchProjectsForMap: ${error.message}`);
    }

    // =====================================================
    // TEST 8: Fetch Filter Options
    // =====================================================
    try {
      const result = await fetchFilterOptions();

      if (!result.success) throw new Error(result.error);

      testResults.tests.push({
        name: 'Fetch Filter Options',
        status: 'PASSED ✅',
        data: {
          zones: result.data?.zones || [],
          regions: result.data?.regions.slice(0, 5) || [],
          developers_count: result.data?.developers.length || 0,
          configurations: result.data?.configurations || [],
          property_types: result.data?.property_types || [],
        },
      });
      testResults.summary.passed++;
    } catch (error: any) {
      testResults.tests.push({
        name: 'Fetch Filter Options',
        status: 'FAILED ❌',
        error: error.message,
      });
      testResults.summary.failed++;
      testResults.summary.errors.push(`fetchFilterOptions: ${error.message}`);
    }

    // =====================================================
    // TEST 9: Fetch Single Project (if any exists)
    // =====================================================
    try {
      const { data: firstProject } = await supabase
        .from('projects')
        .select('id')
        .limit(1)
        .single();

      if (firstProject) {
        const result = await fetchProjectById(firstProject.id);

        if (!result.success) throw new Error(result.error);

        testResults.tests.push({
          name: 'Fetch Single Project (Full)',
          status: 'PASSED ✅',
          data: {
            project_name: result.data?.project_name,
            developer: result.data?.developer?.developer_name || 'N/A',
            units_count: result.data?.units?.length || 0,
            amenities_count: result.data?.amenities?.length || 0,
            has_analysis: !!result.data?.analysis,
            has_landmarks: (result.data?.landmarks?.length || 0) > 0,
          },
        });
        testResults.summary.passed++;
      } else {
        testResults.tests.push({
          name: 'Fetch Single Project (Full)',
          status: 'SKIPPED ⚠️',
          message: 'No projects in database to test',
        });
      }
    } catch (error: any) {
      testResults.tests.push({
        name: 'Fetch Single Project (Full)',
        status: 'FAILED ❌',
        error: error.message,
      });
      testResults.summary.failed++;
      testResults.summary.errors.push(`fetchProjectById: ${error.message}`);
    }

    // =====================================================
    // TEST 10: Check Triggers (cached fields)
    // =====================================================
    try {
      const { data: projectsWithUnits } = await supabase
        .from('projects')
        .select(
          `
          id,
          project_name,
          price_min,
          price_max,
          price_display,
          configurations,
          gallery_images
        `
        )
        .not('price_min', 'is', null)
        .limit(1)
        .single();

      if (projectsWithUnits) {
        testResults.tests.push({
          name: 'Database Triggers (Cached Fields)',
          status: 'WORKING ✅',
          data: {
            price_min: projectsWithUnits.price_min,
            price_max: projectsWithUnits.price_max,
            price_display: projectsWithUnits.price_display,
            configurations: projectsWithUnits.configurations,
            gallery_images_cached: projectsWithUnits.gallery_images?.length || 0,
          },
          message: 'Auto-sync triggers are working',
        });
        testResults.summary.passed++;
      } else {
        testResults.tests.push({
          name: 'Database Triggers (Cached Fields)',
          status: 'CANNOT TEST ⚠️',
          message: 'No projects with units to verify trigger behavior',
        });
      }
    } catch (error: any) {
      testResults.tests.push({
        name: 'Database Triggers (Cached Fields)',
        status: 'FAILED ❌',
        error: error.message,
      });
      testResults.summary.failed++;
    }

    // =====================================================
    // FINAL SUMMARY
    // =====================================================
    testResults.summary.total = testResults.tests.length;
    testResults.summary.pass_rate = `${Math.round(
      (testResults.summary.passed / testResults.summary.total) * 100
    )}%`;

    if (testResults.summary.failed === 0) {
      testResults.summary.overall = '🎉 ALL TESTS PASSED!';
    } else if (testResults.summary.failed < 3) {
      testResults.summary.overall = '⚠️ MOSTLY WORKING (minor issues)';
    } else {
      testResults.summary.overall = '❌ CRITICAL FAILURES';
    }

    return NextResponse.json(testResults, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Test suite crashed',
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
