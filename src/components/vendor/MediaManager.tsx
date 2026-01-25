'use client'
import React from 'react'
import { Plus, Trash2, Image as ImageIcon, FileText } from 'lucide-react'

interface MediaManagerProps {
  images: string[];
  floorPlan: string;
  onImagesChange: (urls: string[]) => void;
  onFloorPlanChange: (url: string) => void;
}

export default function MediaManager({ images, floorPlan, onImagesChange, onFloorPlanChange }: MediaManagerProps) {
  
  const addImage = () => {
    // Adds an empty string field for the user to paste a URL
    onImagesChange([...images, '']);
  };

  const updateImage = (index: number, val: string) => {
    const newImages = [...images];
    newImages[index] = val;
    onImagesChange(newImages);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-lg border border-slate-200">
      <h3 className="font-bold text-slate-700 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" /> Media & Assets
      </h3>

      {/* 1. Property Images */}
      <div className="bg-white p-4 rounded border border-slate-200 space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-600">Property Images (URLs)</label>
          <button 
            type="button" 
            onClick={addImage}
            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
          >
            <Plus size={12} /> Add Image Link
          </button>
        </div>
        
        <div className="space-y-2">
          {images.map((url, idx) => (
            <div key={idx} className="flex gap-2">
              <input 
                placeholder="https://example.com/image.jpg" 
                className="flex-1 p-2 border rounded text-xs"
                value={url}
                onChange={(e) => updateImage(idx, e.target.value)}
              />
              <button 
                type="button"
                onClick={() => removeImage(idx)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {images.length === 0 && <p className="text-xs text-slate-400 italic">No images added.</p>}
        </div>
      </div>

      {/* 2. Floor Plan */}
      <div className="bg-white p-4 rounded border border-slate-200 space-y-3">
        <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Floor Plan (URL)
        </label>
        <input 
          placeholder="https://example.com/floorplan.pdf" 
          className="w-full p-2 border rounded text-xs"
          value={floorPlan}
          onChange={(e) => onFloorPlanChange(e.target.value)}
        />
        <p className="text-[10px] text-slate-400">Paste a link to the floor plan PDF or Image.</p>
      </div>
    </div>
  )
}
