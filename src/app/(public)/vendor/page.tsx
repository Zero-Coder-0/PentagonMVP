'use client';

import React from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import ProjectWizardV7 from '@/components/admin/ProjectWizard';

export default function VendorUploadPage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleVendorSubmit(projectData: any) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('❌ Please login first');
        router.push('/login');
        return;
      }

      // Prepare submission data for property_drafts
      const submissionData = {
        // Main project data
        name: projectData.name,
        developer: projectData.developer,
        rera_id: projectData.rera_id,
        status: projectData.status,
        zone: projectData.zone,
        region: projectData.region,
        address_line: projectData.address_line,
        lat: projectData.lat,
        lng: projectData.lng,
        price_display: projectData.price_display,
        price_min: projectData.price_min,
        price_max: projectData.price_max,
        price_per_sqft: projectData.price_per_sqft,
        total_land_area: projectData.total_land_area,
        total_units: projectData.total_units,
        possession_date: projectData.possession_date,
        construction_technology: projectData.construction_technology,
        open_space_percent: projectData.open_space_percent,
        structure_details: projectData.structure_details,
        hero_image_url: projectData.hero_image_url,
        brochure_url: projectData.brochure_url,
        marketing_kit_url: projectData.marketing_kit_url,
        property_type: projectData.property_type,
        floor_levels: projectData.floor_levels,
        clubhouse_size: projectData.clubhouse_size,
        builder_grade: projectData.builder_grade,
        construction_type: projectData.construction_type,
        elevators_per_tower: projectData.elevators_per_tower,
        payment_plan: projectData.payment_plan,
        floor_rise_charges: projectData.floor_rise_charges,
        car_parking_cost: projectData.car_parking_cost,
        clubhouse_charges: projectData.clubhouse_charges,
        infrastructure_charges: projectData.infrastructure_charges,
        sinking_fund: projectData.sinking_fund,
        facing_direction: projectData.facing_direction,
        completion_duration: projectData.completion_duration,
        configurations: projectData.configurations,
        
        // Nested data (stored in JSONB)
        units: projectData.units || [],
        amenities: projectData.amenities || [],
        landmarks: projectData.landmarks || [],
        cost_extras: projectData.cost_extras || []
      };

      // Insert to property_drafts
      const { data, error } = await supabase
        .from('property_drafts')
        .insert({
          vendor_id: user.id,
          submission_data: submissionData,
          status: 'pending',
          admin_notes: null
        })
        .select()
        .single();

      if (error) throw error;

      alert(
        `✅ SUBMISSION SUCCESSFUL!\n\n` +
        `Your project "${projectData.name}" has been submitted for approval.\n\n` +
        `📋 Submission Details:\n` +
        `• Project Name: ${projectData.name}\n` +
        `• Developer: ${projectData.developer}\n` +
        `• Units: ${projectData.units?.length || 0}\n` +
        `• Amenities: ${projectData.amenities?.length || 0}\n` +
        `• Landmarks: ${projectData.landmarks?.length || 0}\n\n` +
        `⏳ What's Next?\n` +
        `Our admin team will review your submission within 24-48 hours.\n` +
        `You will receive an email notification once it's approved or if any changes are needed.\n\n` +
        `Thank you for your submission!`
      );

      // Redirect to vendor dashboard
      router.push('/vendor/dashboard');
    } catch (err: any) {
      alert('❌ Error submitting: ' + err.message);
      console.error('Submission error:', err);
      throw err;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Submit New Property</h1>
          <p className="text-lg text-slate-600 mt-2">
            Fill in all the details below. Your submission will be reviewed by our admin team.
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📋</div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 text-lg mb-2">Submission Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Fill in all required fields marked with *</li>
                <li>✅ Add at least one unit type (2BHK, 3BHK, etc.)</li>
                <li>✅ Set accurate location on the map</li>
                <li>✅ Add amenities and nearby landmarks for better visibility</li>
                <li>✅ Upload high-quality images and brochures</li>
              </ul>
              <p className="text-blue-700 font-medium mt-3">
                ⏱️ Review Time: 24-48 hours | 📧 You'll be notified via email
              </p>
            </div>
          </div>
        </div>

        {/* Wizard Component */}
        <ProjectWizardV7
          onSubmit={handleVendorSubmit}
          submitButtonText="✅ Submit for Approval"
          submitButtonColor="bg-green-600 hover:bg-green-700"
          isAdmin={false}
        />

        {/* Help Section */}
        <div className="mt-8 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-900 text-lg mb-2">💡 Need Help?</h3>
          <p className="text-sm text-yellow-800 mb-3">
            Having trouble filling the form or uploading images? Contact our support team:
          </p>
          <div className="flex gap-4 text-sm">
            <a href="mailto:support@geoestate.com" className="text-blue-600 hover:underline font-medium">
              📧 support@geoestate.com
            </a>
            <a href="tel:+918012345678" className="text-blue-600 hover:underline font-medium">
              📞 +91 80123 45678
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
