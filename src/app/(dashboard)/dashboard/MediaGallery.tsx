'use client';

import { useDashboard } from './page';
import { Image as ImageIcon, Home, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function MediaGallery() {
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center z-10 max-w-sm mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={32} />
          </div>
          <h3 className="text-slate-900 font-bold text-lg mb-2">No Property Selected</h3>
          <p className="text-slate-500 text-sm">
            Select a property from the map or list to view its gallery and details.
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

  // If we want to simulate a gallery for the "Project Orange" (which we know has data), we could check configs
  // But let's stick to the data we have.

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

      {/* 1. Main Image Area - Takes full remaining height minus thumbnails */}
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
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10">
              <div>
                <h2 className="text-white font-bold text-xl leading-tight shadow-sm drop-shadow-md">
                  {property.project_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] uppercase font-bold tracking-wider rounded">
                    {property.projectstatus ?? 'Under Construction'}
                  </span>
                  <span className="text-slate-200 text-xs flex items-center gap-1 drop-shadow-sm">
                    <Home size={10} />
                    {selectedFullProject?.developer_name || 'Unknown Developer'}
                  </span>
                </div>
              </div>

              <button className="text-white/80 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-sm transition">
                <Maximize2 size={18} />
              </button>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <p className="text-slate-300 text-xs uppercase tracking-wide font-medium mb-1">Price</p>
                  <p className="text-white font-bold text-lg">{property.pricedisplay}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <p className="text-slate-300 text-xs uppercase tracking-wide font-medium mb-1">Configs</p>
                  <p className="text-white font-bold text-sm truncate">
                    {property.configurations?.join(', ') || 'N/A'}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
                  <p className="text-slate-300 text-xs uppercase tracking-wide font-medium mb-1">Zone</p>
                  <p className="text-white font-bold text-sm">{property.city_zone}</p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition border border-white/10 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-3 rounded-full transition border border-white/10 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <ImageIcon size={48} className="mb-4 opacity-50" />
            <p>No images available for this property</p>
          </div>
        )}
      </div>

      {/* 2. Thumbnails (Only if multiple) */}
      {hasMultipleImages && (
        <div className="flex-shrink-0 bg-slate-900 p-4 border-t border-white/10">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 relative w-20 h-16 rounded-lg overflow-hidden transition-all ${currentImageIndex === idx
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
