import { createClient } from '@/core/db/client';

export default async function AdminDashboard() {
  const supabase = createClient();

  // Parallel fetching for speed
  const [props, drafts, visits] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact' }),
    supabase.from('property_drafts').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('site_visits').select('id', { count: 'exact' }).eq('status', 'Scheduled'),
  ]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-slate-900">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Live Properties" value={props.count || 0} color="blue" />
        <StatCard title="Pending Approvals" value={drafts.count || 0} color="amber" />
        <StatCard title="Scheduled Visits" value={visits.count || 0} color="green" />
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
        <h3 className="font-bold text-blue-900 mb-2">Development Mode Active</h3>
        <p className="text-sm text-blue-700">
          You are bypassing <code>proxy.ts</code>. Direct database access is enabled. 
          Navigate to <strong>/admin/inventory</strong> to edit live data or <strong>/admin/approvals</strong> to process drafts.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color: 'blue' | 'amber' | 'green' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className={`p-6 rounded-xl border ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="text-4xl font-bold mt-2">{value}</p>
    </div>
  );
}
