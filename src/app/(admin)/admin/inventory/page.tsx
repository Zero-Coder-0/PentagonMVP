// src/app/(admin)/admin/inventory/page.tsx
import { createClient } from '@/core/db/server';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import BulkPropertyUpload from '@/components/admin/BulkPropertyUpload';
import PropertyCard from '@/components/admin/PropertyCard';

export default async function InventoryPage() {
  const supabase = await createClient();

  // Fetch live properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
          <p className="text-slate-500">
            Manage all {properties?.length || 0} active properties visible to sales.
          </p>
        </div>
        <Link 
          href="/admin/inventory/new" 
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add Manually
        </Link>
      </div>

      {/* Bulk Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <BulkPropertyUpload />
        </div>
        <div className="md:col-span-2">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800 h-full">
            <h4 className="font-bold mb-2">CSV Format Guide</h4>
            <p className="text-sm">
              <strong>Required:</strong> Property Name, Price, Location<br/>
              <strong>Smart Import:</strong> Any extra columns (e.g., "Roof Type", "Facing") 
              will be automatically saved to the "specs" JSON field.
            </p>
          </div>
        </div>
      </div>

      {/* Properties Grid - Using PropertyCard Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((prop) => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>

      {/* Empty State */}
      {(!properties || properties.length === 0) && (
        <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50">
          <p className="text-slate-500 mb-4">No properties found. Upload your first property!</p>
          <Link 
            href="/admin/inventory/new"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800"
          >
            <Plus size={20} />
            Add First Property
          </Link>
        </div>
      )}
    </div>
  );
}
