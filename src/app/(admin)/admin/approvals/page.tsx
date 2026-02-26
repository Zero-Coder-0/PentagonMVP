'use client';

import React, { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

interface PropertyDraft {
  id: string;
  vendor_id: string;
  submission_data: any;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  profiles?: {
    email: string;
  };
}

export default function ApprovalsPage() {
  const [drafts, setDrafts] = useState<PropertyDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadDrafts();
  }, [filter]);

  async function loadDrafts() {
    try {
      setLoading(true);

      const { fetchPropertyDrafts } = await import('@/app/actions/wizard-actions');
      const data = await fetchPropertyDrafts(filter);
      setDrafts(data || []);

    } catch (err: any) {
      console.error('Error loading drafts:', err);
      alert('Error loading submissions: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickApprove(draft: PropertyDraft) {
    const confirmed = confirm(
      `✅ QUICK APPROVE\n\n` +
      `Project: ${draft.submission_data.name || draft.submission_data.project_name}\n` +
      `Submitted by: ${draft.profiles?.email || 'Unknown'}\n\n` +
      `This will:\n` +
      `✓ Move the project to live database (Prisma)\n` +
      `✓ Mark draft as approved\n\n` +
      `Continue?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      // The backend action is universally built now, we just pass the raw form data and the ID
      // and let Prisma unroll everything properly instead of manually handling tuples.
      const { approveDraftToLive } = await import('@/app/actions/wizard-actions');

      const payloadWithMediaUrls = draft.submission_data;
      await approveDraftToLive(draft.id, payloadWithMediaUrls);

      alert('Project Approved & Published Live Successfully!');
      loadDrafts(); // Reload list
    } catch (err: any) {
      console.error('Migration Failed:', err);
      // Fallback alert for failed Prisma mappings which are safer than crashing db
      alert('Approval Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickReject(draft: PropertyDraft) {
    const reason = prompt('Enter rejection reason (optional):');

    const confirmed = confirm(
      `❌ REJECT SUBMISSION\n\n` +
      `Project: ${draft.submission_data.name}\n\n` +
      `This will mark the submission as rejected.\n` +
      `Continue?`
    );

    if (!confirmed) return;

    try {
      const { rejectPropertyDraft } = await import('@/app/actions/wizard-actions');
      await rejectPropertyDraft(draft.id, reason || 'Rejected by admin');

      alert('❌ Submission rejected');
      loadDrafts();
    } catch (err: any) {
      alert('Error rejecting: ' + err.message);
    }
  }

  async function handleDelete(draft: PropertyDraft) {
    const confirmed = confirm(
      `🗑️ DELETE DRAFT\n\n` +
      `Project: ${draft.submission_data.name || draft.submission_data.project_name || 'Unknown'}\n\n` +
      `This will permanently remove this submission from the drafts table. ` +
      (draft.status === 'approved' ? `(Note: The live project will NOT be deleted from the main inventory).\n` : `\n`) +
      `Continue?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const { deletePropertyDraft } = await import('@/app/actions/wizard-actions');
      await deletePropertyDraft(draft.id);

      alert('🗑️ Draft deleted successfully');
      loadDrafts(); // Reload list
    } catch (err: any) {
      console.error('Delete Failed:', err);
      alert('Error deleting draft: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Property Approvals</h1>
          <p className="text-slate-500 mt-1">
            Review and approve vendor submissions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6 flex gap-2">
          {[
            { key: 'pending', label: '⏳ Pending', count: drafts.filter(d => d.status === 'pending').length },
            { key: 'approved', label: '✅ Approved', count: drafts.filter(d => d.status === 'approved').length },
            { key: 'rejected', label: '❌ Rejected', count: drafts.filter(d => d.status === 'rejected').length },
            { key: 'all', label: '📋 All', count: drafts.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-500">Loading submissions...</p>
          </div>
        )}

        {/* Drafts List */}
        {!loading && (
          <>
            {drafts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No {filter !== 'all' ? filter : ''} submissions
                </h3>
                <p className="text-slate-500">
                  {filter === 'pending'
                    ? 'All caught up! No pending approvals.'
                    : 'No submissions in this category yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            {draft.submission_data.name || draft.submission_data.project_name || 'Unnamed Project'}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(draft.status)}`}>
                            {draft.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-1">
                          <strong>Developer:</strong> {draft.submission_data.developer || draft.submission_data.developer_name || 'N/A'}
                        </p>
                        <p className="text-slate-600 mb-1">
                          <strong>Zone:</strong> {draft.submission_data.zone || draft.submission_data.city_zone || 'N/A'} | <strong>Region:</strong> {draft.submission_data.region || 'N/A'}
                        </p>
                        <p className="text-sm text-slate-500 mb-1">
                          <strong>Submitted by:</strong> {draft.profiles?.email || 'Unknown vendor'}
                        </p>
                        <p className="text-sm text-slate-500">
                          <strong>Submitted on:</strong> {new Date(draft.created_at).toLocaleString()}
                        </p>
                        {draft.admin_notes && (
                          <p className="text-sm text-slate-600 mt-2 italic bg-slate-50 p-2 rounded">
                            <strong>Notes:</strong> {draft.admin_notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="font-semibold text-slate-900">{draft.submission_data.price_display || draft.submission_data.pricedisplay || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Total Units</p>
                        <p className="font-semibold text-slate-900">{draft.submission_data.total_units || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Land Area</p>
                        <p className="font-semibold text-slate-900">{draft.submission_data.total_land_area || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Completion</p>
                        <p className="font-semibold text-slate-900">{draft.submission_data.completion_duration || draft.submission_data.possession_year || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/approvals/${draft.id}`}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        📝 Review & Edit
                      </Link>

                      {draft.status !== 'pending' && (
                        <button
                          onClick={() => handleDelete(draft)}
                          className="px-6 py-2 bg-slate-100 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition font-medium"
                        >
                          🗑️ Delete Record
                        </button>
                      )}

                      {draft.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleQuickApprove(draft)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            ✅ Quick Approve
                          </button>
                          <button
                            onClick={() => handleQuickReject(draft)}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                          >
                            ❌ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
