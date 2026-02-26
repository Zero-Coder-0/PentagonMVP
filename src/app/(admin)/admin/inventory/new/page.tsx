'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createProjectAction } from '@/modules/admin/actions-create-project';
import ProjectWizardV7 from '@/components/admin/ProjectWizard';

export default function AdminNewPropertyPage() {
  const router = useRouter();

  async function handleAdminSubmit(projectData: any) {
    try {
      console.log('📝 Submitting project data to Prisma bridge...', projectData);

      // Call the new bridge action that handles all 9 tables
      const result = await createProjectAction(projectData);

      if (result.success) {
        alert('✅ Project created successfully! ID: ' + result.projectId);
        router.push('/admin/inventory');
      } else {
        alert('❌ Error: ' + result.error);
        console.error('Project creation failed:', result.error);
      }
    } catch (err: any) {
      alert('❌ Unexpected error: ' + (err.message || 'Unknown error'));
      console.error('Submission error:', err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/inventory" className="text-blue-600 hover:underline mb-2 inline-block text-sm">
            ← Back to Inventory
          </Link>
          <h1 className="text-4xl font-bold text-slate-900">Add New Property</h1>
          <p className="text-lg text-slate-600 mt-2">
            Admin Upload - Published directly to live database without approval
          </p>
        </div>

        {/* Admin Privilege Banner */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-4xl">👑</div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900 text-lg mb-2">Admin Privileges</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✅ Your submission will be published <strong>IMMEDIATELY</strong></li>
                <li>✅ No approval workflow needed</li>
                <li>✅ Project will be instantly visible to all users</li>
                <li>✅ You can edit or delete anytime from inventory</li>
              </ul>
              <p className="text-green-700 font-medium mt-3">
                💡 Fill in all details carefully - this goes live instantly!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="text-3xl mb-2">📝</div>
            <p className="text-2xl font-bold text-slate-900">8 Steps</p>
            <p className="text-sm text-slate-500">Complete wizard</p>
          </div>
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="text-3xl mb-2">🏠</div>
            <p className="text-2xl font-bold text-slate-900">Multiple Units</p>
            <p className="text-sm text-slate-500">Add all unit types</p>
          </div>
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="text-3xl mb-2">🎾</div>
            <p className="text-2xl font-bold text-slate-900">Amenities</p>
            <p className="text-sm text-slate-500">List all facilities</p>
          </div>
          <div className="bg-white border-2 border-slate-200 rounded-lg p-4">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="text-2xl font-bold text-slate-900">Location</p>
            <p className="text-sm text-slate-500">Pin exact position</p>
          </div>
        </div>

        {/* Wizard Component */}
        <ProjectWizardV7
          userRole="tenant_admin"
          mode="admin_create"
        />

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 text-lg mb-2">📚 Best Practices</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-semibold mb-1">✅ Required Fields:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Project Name & Developer</li>
                <li>Zone & Region</li>
                <li>Location (Lat/Lng)</li>
                <li>At least one unit type</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">💡 Recommendations:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Add 3-5 unit configurations</li>
                <li>List 10+ amenities</li>
                <li>Include 5+ landmarks</li>
                <li>Upload high-res images</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
