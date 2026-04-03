'use client';

import { useDashboard } from './page';
import { Image as ImageIcon, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ImageSection() {
  const { displayedProperties, selectedId, selectedFullProject } = useDashboard();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const property = displayedProperties.find(p => p.id === selectedId);

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedId]);

  if (!property) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center z-10 max-w-xs mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon size={20} />
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-1">No Property Selected</h3>
          <p className="text-slate-500 text-xs">
            Select a property to view images
          </p>
        </div>
      </div>
    );
  }

  // Build deduplicated image list: hero_image first, then any additional images from DB
  const images = Array.from(new Set([
    ...(property.hero_image ? [property.hero_image] : []),
    ...((property as any).images ?? []),
  ])).filter(Boolean) as string[];

  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden relative group">

      {/* Main Image Area - Scaled down for this section */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={`${property.project_name} - View ${currentImageIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

            {/* Top Bar: Property Name & Status */}
            <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-10">
              <div>
                <h2 className="text-white font-bold text-sm leading-tight shadow-sm drop-shadow-md truncate">
                  {property.project_name}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[8px] uppercase font-bold tracking-wider rounded">
                    {property.projectstatus ?? 'Under Construction'}
                  </span>
                </div>
              </div>

              <button className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-1 rounded-full backdrop-blur-sm transition">
                <Maximize2 size={14} />
              </button>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <div className="flex items-center justify-between">
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-2 py-1 border border-white/20">
                  <p className="text-slate-300 text-[8px] uppercase tracking-wide font-medium">Price</p>
                  <p className="text-white font-bold text-xs truncate">
                    {property.pricedisplay}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg px-2 py-1 border border-white/20">
                  <p className="text-slate-300 text-[8px] uppercase tracking-wide font-medium">Configs</p>
                  <p className="text-white font-bold text-xs truncate">
                    {property.configurations?.join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full transition border border-white/10 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1.5 rounded-full transition border border-white/10 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <ImageIcon size={32} className="mb-2 opacity-50" />
            <p className="text-xs">No images available</p>
          </div>
        )}
      </div>

      {/* Thumbnails (Only if multiple) */}
      {hasMultipleImages && (
        <div className="flex-shrink-0 bg-slate-900 p-2 border-t border-white/10">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 relative w-12 h-10 rounded overflow-hidden transition-all ${currentImageIndex === idx
                  ? 'ring-2 ring-blue-500 opacity-100 scale-105'
                  : 'opacity-50 hover:opacity-100'
                  }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
