'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapPickerWithSearch = dynamic(() => import('@/components/shared/MapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-slate-100 rounded-lg flex items-center justify-center">
      <p className="text-slate-500">Loading map...</p>
    </div>
  ),
});

interface PropertyDraft {
  id: string;
  vendor_id: string;
  submission_data: any;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  profiles?: {
    email: string;
    full_name?: string;
  };
}

export default function DraftReviewPage() {
  const params = useParams();
  const router = useRouter();
  const draftId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<PropertyDraft | null>(null);
  const [projectData, setProjectData] = useState<any>({});
  const [adminNotes, setAdminNotes] = useState('');
  const [activeTab, setActiveTab] = useState('basic');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadDraft();
  }, [draftId]);

  async function loadDraft() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('property_drafts')
        .select(`
          *,
          profiles:vendor_id (email, full_name)
        `)
        .eq('id', draftId)
        .single();

      if (error) throw error;

      setDraft(data);
      setProjectData(data.submission_data);
      setAdminNotes(data.admin_notes || '');
    } catch (err: any) {
      alert('Error loading draft: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('property_drafts')
        .update({
          submission_data: projectData,
          admin_notes: adminNotes
        })
        .eq('id', draftId);

      if (error) throw error;

      alert('✅ Changes saved successfully!');
    } catch (err: any) {
      alert('Error saving: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    if (!projectData.name || !projectData.developer) {
      alert('❌ Project Name and Developer are required');
      return;
    }

    const confirmed = confirm(
      `✅ APPROVE & PUBLISH\n\n` +
      `Project: ${projectData.name}\n` +
      `Developer: ${projectData.developer}\n\n` +
      `This will:\n` +
      `✓ Publish the project to live database\n` +
      `✓ Mark draft as approved\n` +
      `✓ Notify vendor of approval\n\n` +
      `Continue?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      // Insert to projects table
      const { data: newProject, error: insertError } = await supabase
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (insertError) throw insertError;

      // Update draft status
      const { error: updateError } = await supabase
        .from('property_drafts')
        .update({
          status: 'approved',
          admin_notes: adminNotes || 'Approved by admin'
        })
        .eq('id', draftId);

      if (updateError) throw updateError;

      alert(
        `✅ APPROVED!\n\n` +
        `Project "${projectData.name}" is now live!\n` +
        `Project ID: ${newProject.id}\n\n` +
        `Vendor will be notified.`
      );

      router.push('/admin/approvals');
    } catch (err: any) {
      alert('Error approving: ' + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    const reason = prompt('Enter rejection reason for vendor:');
    
    if (!reason) {
      alert('Please provide a rejection reason');
      return;
    }

    const confirmed = confirm(
      `❌ REJECT SUBMISSION\n\n` +
      `This will mark the submission as rejected.\n` +
      `Reason: ${reason}\n\n` +
      `Continue?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('property_drafts')
        .update({
          status: 'rejected',
          admin_notes: reason
        })
        .eq('id', draftId);

      if (error) throw error;

      alert('❌ Submission rejected. Vendor will be notified.');
      router.push('/admin/approvals');
    } catch (err: any) {
      alert('Error rejecting: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleLocationChange(lat: number, lng: number, address?: string) {
    setProjectData({
      ...projectData,
      lat,
      lng,
      address_line: address || projectData.address_line
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading draft...</p>
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-xl">Draft not found</p>
          <Link href="/admin/approvals" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Approvals
          </Link>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/approvals" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Back to Approvals
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Review Submission</h1>
              <p className="text-slate-500 mt-1">
                Submitted by {draft.profiles?.email || 'Unknown'} on {new Date(draft.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(draft.status)}`}>
              {draft.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving || draft.status !== 'pending'}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                saving || draft.status !== 'pending'
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>

            {draft.status === 'pending' && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    saving
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  ✅ Approve & Publish
                </button>

                <button
                  onClick={handleReject}
                  disabled={saving}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    saving
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  ❌ Reject
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'basic', label: '📝 Basic Info' },
                { id: 'location', label: '📍 Location' },
                { id: 'details', label: '📊 Details' },
                { id: 'notes', label: '📋 Admin Notes' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Project Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={projectData.name || ''}
                      onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                      placeholder="e.g., Prestige Lakeside Habitat"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Developer */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Developer / Builder *
                    </label>
                    <input
                      type="text"
                      value={projectData.developer || ''}
                      onChange={(e) => setProjectData({ ...projectData, developer: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Prestige Group"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* RERA ID */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      RERA Registration Number
                    </label>
                    <input
                      type="text"
                      value={projectData.rera_id || ''}
                      onChange={(e) => setProjectData({ ...projectData, rera_id: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="PRM/KA/RERA/..."
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Zone */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Zone / Direction *
                    </label>
                    <select
                      value={projectData.zone || 'North'}
                      onChange={(e) => setProjectData({ ...projectData, zone: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={draft.status !== 'pending'}
                    >
                      <option value="North">🧭 North Bangalore</option>
                      <option value="South">🌏 South Bangalore</option>
                      <option value="East">🌅 East Bangalore</option>
                      <option value="West">🌇 West Bangalore</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Project Status *
                    </label>
                    <select
                      value={projectData.status || 'Under Construction'}
                      onChange={(e) => setProjectData({ ...projectData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={draft.status !== 'pending'}
                    >
                      <option value="Pre-Launch">🚀 Pre-Launch</option>
                      <option value="Under Construction">🚧 Under Construction</option>
                      <option value="Ready">✅ Ready to Move</option>
                    </select>
                  </div>

                  {/* Region */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Area / Region
                    </label>
                    <input
                      type="text"
                      value={projectData.region || ''}
                      onChange={(e) => setProjectData({ ...projectData, region: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Whitefield"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Property Type
                    </label>
                    <input
                      type="text"
                      value={projectData.property_type || ''}
                      onChange={(e) => setProjectData({ ...projectData, property_type: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Apartments, Villas"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LOCATION TAB */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Address
                  </label>
                  <textarea
                    value={projectData.address_line || ''}
                    onChange={(e) => setProjectData({ ...projectData, address_line: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter complete address..."
                    disabled={draft.status !== 'pending'}
                  />
                </div>

                {/* Map Picker */}
                {draft.status === 'pending' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Set Property Location on Map *
                    </label>
                    <MapPickerWithSearch
                      lat={projectData.lat || 12.9716}
                      lng={projectData.lng || 77.5946}
                      onLocationChange={handleLocationChange}
                    />
                  </div>
                ) : (
                  <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Location:</strong> Lat: {projectData.lat?.toFixed(6)}, Lng: {projectData.lng?.toFixed(6)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Map editing is disabled for {draft.status} submissions
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* DETAILS TAB */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price Display */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Price Display
                    </label>
                    <input
                      type="text"
                      value={projectData.price_display || ''}
                      onChange={(e) => setProjectData({ ...projectData, price_display: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., ₹1.2 Cr onwards"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Total Units */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Total Units
                    </label>
                    <input
                      type="number"
                      value={projectData.total_units || ''}
                      onChange={(e) => setProjectData({ ...projectData, total_units: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Land Area */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Total Land Area
                    </label>
                    <input
                      type="text"
                      value={projectData.total_land_area || ''}
                      onChange={(e) => setProjectData({ ...projectData, total_land_area: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 25 Acres"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Open Space % */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Open Space Percentage
                    </label>
                    <input
                      type="number"
                      value={projectData.open_space_percent || ''}
                      onChange={(e) => setProjectData({ ...projectData, open_space_percent: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 70%"
                      min="0"
                      max="100"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Structure Details */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Structure Details
                    </label>
                    <input
                      type="text"
                      value={projectData.structure_details || ''}
                      onChange={(e) => setProjectData({ ...projectData, structure_details: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2B+G+18 Floors"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Completion Duration */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Expected Completion
                    </label>
                    <input
                      type="text"
                      value={projectData.completion_duration || ''}
                      onChange={(e) => setProjectData({ ...projectData, completion_duration: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Q4 2027"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>

                  {/* Construction Technology */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Construction Technology
                    </label>
                    <input
                      type="text"
                      value={projectData.construction_technology || ''}
                      onChange={(e) => setProjectData({ ...projectData, construction_technology: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., RCC Framed Structure, Mivan Technology"
                      disabled={draft.status !== 'pending'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ADMIN NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Admin Notes (Internal)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes for internal tracking or feedback to vendor..."
                    disabled={draft.status !== 'pending'}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    These notes will be visible to the vendor if you reject the submission.
                  </p>
                </div>

                {/* Submission History */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Submission History</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Submitted by:</strong> {draft.profiles?.email || 'Unknown'}</p>
                    <p><strong>Submitted on:</strong> {new Date(draft.created_at).toLocaleString()}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(draft.status)}`}>{draft.status}</span></p>
                    <p><strong>Draft ID:</strong> {draft.id}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Bar */}
        {draft.status === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center">
              <p className="text-slate-600">
                Review all tabs before approving. You can save changes without approving.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={saving}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    saving
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {saving ? '⏳ Saving...' : '💾 Save Changes'}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={saving}
                  className={`px-8 py-3 rounded-lg font-medium transition ${
                    saving
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  ✅ Approve & Publish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Already Processed Notice */}
        {draft.status !== 'pending' && (
          <div className={`rounded-lg p-4 ${
            draft.status === 'approved' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              draft.status === 'approved' ? 'text-green-800' : 'text-red-800'
            }`}>
              {draft.status === 'approved' 
                ? '✅ This submission has been approved and published.'
                : '❌ This submission has been rejected.'}
            </p>
            {draft.admin_notes && (
              <p className="text-sm mt-2 text-slate-700">
                <strong>Admin Notes:</strong> {draft.admin_notes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
