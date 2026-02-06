import { createClient } from '@/core/db/server';
import { Edit2, Trash2, MapPin } from 'lucide-react';
import BulkPropertyUpload from '@/components/admin/BulkPropertyUpload';
import Link from 'next/link'; // UPDATED: Added import

export default async function InventoryPage() {
  const supabase = await createClient();
  
  // Fetch live properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Inventory Management</h2>
          <p className="text-slate-500">Manage all {properties?.length || 0} active properties visible to sales.</p>
        </div>
        {/* UPDATED: Replaced static button with Link to Wizard */}
        <Link 
          href="/admin/inventory/new" 
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <span>+ Add Manually</span>
        </Link>
      </div>

       {/* The Bulk Upload Section */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
             <BulkPropertyUpload />
          </div>
          <div className="md:col-span-2">
             <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-800 h-full">
                <h4 className="font-bold mb-2">CSV Format Guide</h4>
                <p className="text-sm">
                  <strong>Required:</strong> Property Name, Price, Location<br/>
                  <strong>Smart Import:</strong> Any extra columns (e.g., "Roof Type", "Facing") will be automatically saved to the "specs" JSON field.
                </p>
             </div>
          </div>
       </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((prop) => (
          <div key={prop.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-32 bg-slate-100 w-full rounded-t-xl relative overflow-hidden">
               {/* Image Placeholder - Reads from your JSONB media */}
               {(prop.media as any)?.images?.[0] ? (
                  <img src={(prop.media as any).images[0]} alt={prop.name} className="w-full h-full object-cover" />
               ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">No Image</div>
               )}
               <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700">
                 {prop.status}
               </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-bold text-slate-900 truncate">{prop.name}</h3>
              <div className="flex items-center text-slate-500 text-xs mt-1 mb-3">
                <MapPin size={12} className="mr-1" />
                {prop.location_area}, {prop.zone}
              </div>
              
              <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                <div className="font-semibold text-slate-900">
                  {prop.price_display || '₹ --'}
                </div>
                <div className="flex space-x-2">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
