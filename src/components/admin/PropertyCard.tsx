// src/components/admin/PropertyCard.tsx
/*'use client';

import { Edit2, Trash2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/core/db/client';
import { useRouter } from 'next/navigation';

interface PropertyCardProps {
  property: {
    id: string;
    name: string;
    location_area: string;
    zone: string;
    status: string;
    price_display?: string;
    media?: {
      images?: string[];
    };
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete "${property.name}"? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id);

      if (error) throw error;

      alert('✅ Property deleted successfully!');
      router.refresh(); // Reload the page to show updated list
    } catch (error: any) {
      alert(`❌ Delete failed: ${error.message}`);
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Image *//*}
      <div className="h-32 bg-slate-100 w-full rounded-t-xl relative overflow-hidden">
        {(property.media as any)?.images?.[0] ? (
          <img 
            src={(property.media as any).images[0]} 
            alt={property.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-700">
          {property.status}
        </div>
      </div>

      {/* Content *//*}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 truncate">{property.name}</h3>
        <div className="flex items-center text-slate-500 text-xs mt-1 mb-3">
          <MapPin size={12} className="mr-1" />
          {property.location_area}, {property.zone}
        </div>

        <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
          <div className="font-semibold text-slate-900">
            {property.price_display || '₹ --'}
          </div>
          <div className="flex space-x-2">
            <button 
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Edit property"
              onClick={() => alert('Edit functionality coming soon!')}
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete property"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
*/