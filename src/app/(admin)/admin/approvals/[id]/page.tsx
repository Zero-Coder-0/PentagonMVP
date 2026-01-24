import { createClient } from '@/core/db/server'; // Ensure this path is correct for your project
import { approveDraft, rejectDraft } from '@/modules/admin/actions';
import { ArrowLeft, CheckCircle, XCircle, MapPin, Building, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Define Props Type for Next.js 15+
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewDraftPage({ params }: PageProps) {
  // 1. CRITICAL FIX: Await params for Next.js 15 compatibility
  const resolvedParams = await params;
  const draftId = resolvedParams.id;

  const supabase = await createClient();
  
  // 2. Fetch with explicit error handling
  const { data: draft, error } = await supabase
    .from('property_drafts')
    .select('*, profiles(email)')
    .eq('id', draftId)
    .single();

  // 3. Robust Error UI
  if (error) {
    console.error("Supabase Error:", error);
    return (
      <div className="p-8 text-center max-w-4xl mx-auto mt-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Error Fetching Draft</h2>
        <p className="text-slate-500 mt-2">{error.message}</p>
        <div className="mt-4 p-4 bg-slate-100 rounded text-xs font-mono text-left inline-block">
           Requested ID: {draftId}
        </div>
      </div>
    );
  }

  if (!draft) return notFound();

  const data = draft.submission_data as any; // The JSON payload

  // Bind the ID to the server actions
  const approveAction = approveDraft.bind(null, draft.id);
  const rejectAction = rejectDraft.bind(null, draft.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/approvals" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Review Submission</h1>
            <p className="text-sm text-slate-500">
               Submitted by {draft.profiles?.email || 'Unknown User'}
               <span className="ml-2 font-mono text-xs text-slate-400">ID: {draft.id.slice(0, 8)}...</span>
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <form action={rejectAction}>
            <button className="flex items-center px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors">
              <XCircle size={18} className="mr-2" />
              Reject
            </button>
          </form>
          <form action={approveAction}>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors">
              <CheckCircle size={18} className="mr-2" />
              Approve & Publish
            </button>
          </form>
        </div>
      </div>

      {/* The Data "Paper" */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Top Section: Identity */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{data.name || 'Untitled Property'}</h2>
              <div className="flex items-center mt-2 text-slate-600 space-x-4 text-sm">
                <span className="flex items-center"><Building size={14} className="mr-1"/> {data.developer || 'Unknown Developer'}</span>
                <span className="flex items-center"><MapPin size={14} className="mr-1"/> {data.location_area || 'Unknown Loc'} ({data.zone})</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-700">{data.price_display || '₹ --'}</div>
              <div className="text-xs text-slate-500 uppercase font-medium tracking-wider">Estimated Price</div>
            </div>
          </div>
        </div>

        {/* Middle Section: Specs Grid */}
        <div className="p-6 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Configuration</h3>
            <dl className="space-y-3 text-sm">
              <Row label="Status" value={data.status} />
              <Row label="Units" value={Array.isArray(data.configurations) ? data.configurations.join(', ') : data.configurations} />
              <Row label="Floors" value={data.floor_levels} />
              <Row label="Completion" value={data.completion_duration} />
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Inventory Data</h3>
             {/* This visualizes the JSONB data */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                {JSON.stringify(data.units_available, null, 2)}
              </pre>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              *This JSON data will map to the <code>units_available</code> column.
            </p>
          </div>
        </div>

        {/* Bottom Section: Media Preview */}
        <div className="p-6 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Media Assets</h3>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {data.media?.images?.map((url: string, idx: number) => (
              <div key={idx} className="h-24 w-32 flex-shrink-0 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden relative">
                <img src={url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            ))}
            {(!data.media?.images || data.media.images.length === 0) && (
              <div className="text-sm text-slate-400 italic">No images uploaded</div>
            )}
          </div>
        </div>

        {/* Optional Debug Section (Collapsed by default) */}
        <div className="px-6 py-2 bg-slate-50 border-t border-slate-100">
             <details className="cursor-pointer">
                <summary className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Debug Full Payload</summary>
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(data, null, 2)}
                </pre>
             </details>
        </div>

      </div>
    </div>
  );
}

// Simple Helper Component
function Row({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value || '-'}</span>
    </div>
  );
}
