'use client';

import { useDashboard } from './page';
import { Image as ImageIcon, ChevronLeft, ChevronRight, Maximize2, MessageCircle, FileText, CalendarRange } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateWhatsAppTemplate } from './MegaPopup/whatsapp-template';
import type { ProjectFullV7 } from '@/modules/inventory/types-v7';

// Global Booking Form Link
const GLOBAL_BOOKING_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform";

export default function ImageSection() {
  const { displayedProperties, selectedId, selectedFullProject } = useDashboard();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // WhatsApp State
  const [waName, setWaName] = useState('');
  const [waMobile, setWaMobile] = useState('');
  const [waCopied, setWaCopied] = useState(false);

  const property = displayedProperties.find(p => p.id === selectedId);
  const fullProperty = selectedFullProject;

  // Reset image index when property changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedId]);

  const handleCopyWhatsApp = () => {
    if (!waName || !waMobile || !fullProperty) {
      alert("Please enter both Name and Mobile Number");
      return;
    }
    const template = generateWhatsAppTemplate(fullProperty as ProjectFullV7, { name: waName, mobile: waMobile });
    navigator.clipboard.writeText(template).then(() => {
      setWaCopied(true);
      setTimeout(() => setWaCopied(false), 2000);
    });
  };

  const handleBookForm = () => {
    window.open(GLOBAL_BOOKING_FORM_URL, '_blank');
  };

  const handleDownload = () => {
    if (fullProperty && (fullProperty as any).brochure_url) {
      window.open((fullProperty as any).brochure_url, '_blank');
    } else {
      alert("Brochure URL is not available for this project.");
    }
  };

  if (!property) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center z-10 max-w-xs mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <ImageIcon size={20} />
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-1">No Property Selected</h3>
          <p className="text-slate-500 text-xs text-balance">
            Select a property to view images and sharing options
          </p>
        </div>
      </div>
    );
  }

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
    <div className="h-full w-full flex flex-col bg-white overflow-hidden relative">
      
      {/* 1. Image Gallery Section */}
      <div className="relative h-48 bg-slate-900 overflow-hidden group flex-shrink-0">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={`${property.project_name}`}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
            
            <div className="absolute top-0 left-0 right-0 p-2 flex justify-between items-start z-10">
              <h2 className="text-white font-bold text-xs truncate drop-shadow-md">
                {property.project_name}
              </h2>
            </div>

            {hasMultipleImages && (
              <>
                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1 rounded-full transition opacity-0 group-hover:opacity-100">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-1 rounded-full transition opacity-0 group-hover:opacity-100">
                  <ChevronRight size={14} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-100">
            <ImageIcon size={24} className="mb-1 opacity-50" />
            <p className="text-[10px]">No images</p>
          </div>
        )}
      </div>

      {/* 2. WhatsApp Form Section */}
      <div className="flex-1 p-3 overflow-y-auto bg-white flex flex-col gap-3">
        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <MessageCircle size={12} className="text-[#25D366]" /> Share Property
          </h3>
          <div className="space-y-2">
            <input 
              type="text" 
              value={waName} 
              onChange={e => setWaName(e.target.value)} 
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500/20 focus:border-[#25D366] outline-none transition" 
              placeholder="Your Name" 
            />
            <input 
              type="tel" 
              value={waMobile} 
              onChange={e => setWaMobile(e.target.value)} 
              className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-green-500/20 focus:border-[#25D366] outline-none transition" 
              placeholder="Mobile Number" 
            />
            <button
              onClick={handleCopyWhatsApp}
              disabled={!fullProperty}
              className={`w-full py-2 rounded-lg font-bold text-white text-[11px] transition-all flex justify-center items-center gap-1.5 shadow-sm ${waCopied ? 'bg-slate-800' : 'bg-[#25D366] hover:bg-[#1ebd5b] disabled:opacity-50'}`}
            >
              {waCopied ? '✓ Copied' : 'Copy WhatsApp Template'}
            </button>
          </div>
        </div>

        {/* 3. Quick Actions */}
        <div className="pt-2 border-t border-slate-100 mt-auto">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleBookForm} className="flex items-center justify-center gap-1.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-50 transition">
              <CalendarRange size={12} className="text-blue-600" /> Book
            </button>
            <button onClick={handleDownload} className="flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition shadow-sm">
              <FileText size={12} /> Brochure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
