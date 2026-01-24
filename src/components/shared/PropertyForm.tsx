'use client'

import { useActionState, useState } from 'react'; // Next.js 15 / React 19
import { submitDraft } from '@/modules/vendor/actions';
import { Plus, Trash2, Image as ImageIcon, Building2 } from 'lucide-react';

export default function PropertyForm() {
  // Server Action State (React 19)
  const [state, formAction, isPending] = useActionState(submitDraft, null);

  // Local State for Complex JSON Fields
  const [inventory, setInventory] = useState<{ type: string; count: number }[]>([
    { type: '2BHK', count: 10 },
  ]);
  const [images, setImages] = useState<string[]>(['']);

  // Helpers
  const addInventoryRow = () => setInventory([...inventory, { type: '3BHK', count: 0 }]);
  const removeInventoryRow = (idx: number) => setInventory(inventory.filter((_, i) => i !== idx));
  
  const updateInventory = (idx: number, field: 'type' | 'count', value: string | number) => {
    const newInv = [...inventory];
    newInv[idx] = { ...newInv[idx], [field]: value };
    setInventory(newInv);
  };

  const addImageRow = () => setImages([...images, '']);
  const updateImage = (idx: number, val: string) => {
    const newImg = [...images];
    newImg[idx] = val;
    setImages(newImg);
  };

  // Prepare Hidden JSON Strings for FormData
  const inventoryJson = JSON.stringify(
    inventory.reduce((acc, curr) => ({ ...acc, [curr.type]: curr.count }), {})
  );
  
  const configJson = JSON.stringify(inventory.map(i => i.type)); // Extract ["2BHK", "3BHK"]
  const mediaJson = JSON.stringify({ images: images.filter(url => url.length > 0) });

  return (
    <form action={formAction} className="space-y-8 max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      
      {/* 1. Identity Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center">
          <Building2 className="mr-2" size={20}/> Property Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700">Property Name</label>
            <input name="name" type="text" required placeholder="e.g. Sobha Neopolis" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Developer</label>
            <input name="developer" type="text" required placeholder="e.g. Sobha Ltd" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select name="status" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
              <option value="Under Construction">Under Construction</option>
              <option value="Ready">Ready to Move</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Location & Pricing */}
      <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
        <div>
          <label className="block text-sm font-medium text-slate-700">Location Area</label>
          <input name="location_area" type="text" required placeholder="e.g. Panathur" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Zone</label>
          <select name="zone" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
            <option value="North">North (Hebbal/Yelahanka)</option>
            <option value="South">South (Koramangala/JP Nagar)</option>
            <option value="East">East (Whitefield/Sarjapur)</option>
            <option value="West">West (Malleshwaram/RR Nagar)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Price (Numeric)</label>
          <input name="price_value" type="number" required placeholder="12000000" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
          <p className="text-xs text-slate-500 mt-1">Used for sorting.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Price Display</label>
          <input name="price_display" type="text" required placeholder="1.2 Cr" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
          <p className="text-xs text-slate-500 mt-1">Visible to users.</p>
        </div>
      </div>

      {/* 3. The Inventory Engine (Dynamic JSON) */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Inventory & Units</h3>
        <div className="bg-slate-50 p-4 rounded-lg space-y-3">
          {inventory.map((item, idx) => (
            <div key={idx} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Config</label>
                <input 
                  type="text" 
                  value={item.type} 
                  onChange={(e) => updateInventory(idx, 'type', e.target.value)}
                  className="w-full border p-2 rounded" 
                  placeholder="2BHK"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Count</label>
                <input 
                  type="number" 
                  value={item.count} 
                  onChange={(e) => updateInventory(idx, 'count', parseInt(e.target.value))}
                  className="w-full border p-2 rounded" 
                  placeholder="10"
                />
              </div>
              <button type="button" onClick={() => removeInventoryRow(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addInventoryRow} className="flex items-center text-sm text-blue-600 font-medium hover:underline mt-2">
            <Plus size={16} className="mr-1" /> Add Configuration
          </button>
        </div>
        {/* Hidden Inputs to Pass JSON to Server Action */}
        <input type="hidden" name="units_available" value={inventoryJson} />
        <input type="hidden" name="configurations" value={configJson} />
      </div>

      {/* 4. Media Section */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <ImageIcon className="mr-2" size={20}/> Images
        </h3>
        <div className="space-y-3">
          {images.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                type="text" 
                value={url} 
                onChange={(e) => updateImage(idx, e.target.value)}
                placeholder="Paste Image URL..." 
                className="flex-1 border p-2 rounded"
              />
            </div>
          ))}
          <button type="button" onClick={addImageRow} className="text-sm text-blue-600 font-medium hover:underline">
            + Add Another Image URL
          </button>
        </div>
         <input type="hidden" name="media" value={mediaJson} />
      </div>

      {/* 5. Submit Button */}
      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Submitting Draft...' : 'Submit Property for Approval'}
        </button>
        {state?.message && (
           <div className={`mt-4 p-3 rounded-lg text-sm ${state.message.includes('Success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
             {state.message}
           </div>
        )}
      </div>
    </form>
  );
}
