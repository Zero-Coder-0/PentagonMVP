import { createClient } from '@/core/db/server'; // Assumes you have a server client setup
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default async function ApprovalsPage() {
  const supabase = await createClient();
  
  // Fetch pending drafts
  const { data: drafts } = await supabase
    .from('property_drafts')
    .select('*, profiles(email)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pending Approvals</h2>
          <p className="text-slate-500">Review submissions from vendors before they go live.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Property Name</th>
              <th className="px-6 py-4 font-medium">Vendor</th>
              <th className="px-6 py-4 font-medium">Submitted</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drafts?.map((draft) => {
              const data = draft.submission_data as any; // Type assertion for JSONB
              return (
                <tr key={draft.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{data.name || 'Untitled Property'}</div>
                    <div className="text-xs text-slate-500">{data.location_area} • {data.zone}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {draft.profiles?.email || 'Unknown Vendor'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(draft.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Pending Review
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link 
                      href={`/admin/approvals/${draft.id}`}
                      className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition-colors"
                    >
                      <Eye size={14} className="mr-1.5" />
                      Review
                    </Link>
                  </td>
                </tr>
              );
            })}
            
            {(!drafts || drafts.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No pending drafts found. Good job!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
