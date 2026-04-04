'use client';

import React, { useState } from 'react';
import { useDashboard } from './page';
import { 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon, 
  MessageCircle, 
  BookOpen, 
  Download,
  Info,
  DollarSign,
  Maximize2
} from 'lucide-react';

// Global Booking Form Link
const GLOBAL_BOOKING_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform";

function ActionButton({ icon, tooltip, onClick, compact }: { icon: React.ReactNode, tooltip: string, onClick: (e: React.MouseEvent) => void, compact?: boolean }) {
  return (
    <div className="relative group/btn">
      <button 
        onClick={onClick}
        className={`flex items-center justify-center rounded-[20px] bg-white/90 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-300 transform active:scale-95 hover:scale-110 ${compact ? 'w-11 h-11' : 'w-14 h-14'}`}
      >
        {icon}
      </button>
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {tooltip}
      </div>
    </div>
  );
}

export default function ImageSection() {
  const { displayedProperties, selectedId, selectedFullProject, leftColumnWidth, setWhatsAppModalOpen } = useDashboard();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const property = displayedProperties.find(p => p.id === selectedId);
  const fullProperty = selectedFullProject;

  if (!property) {
    return (
      <div className="h-full w-full bg-slate-900 flex items-center justify-center rounded-2xl border border-slate-800">
        <div className="text-center text-slate-500">
          <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
          <p className="text-sm font-medium">Select a property to view imagery</p>
        </div>
      </div>
    );
  }

  const images = fullProperty?.images && fullProperty.images.length > 0 
    ? fullProperty.images 
    : [property.hero_image].filter(Boolean) as string[];

  const hasMultipleImages = images.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWhatsAppModalOpen(true);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(GLOBAL_BOOKING_FORM_URL, '_blank');
  };

  const handleBrochureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fullProperty?.brochure_url) {
      window.open(fullProperty.brochure_url, '_blank');
    } else {
      alert("Brochure not available for this project yet.");
    }
  };

  // Compact Mode Detection for Badges
  const isCompact = leftColumnWidth < 30;

  return (
    <div className="h-full w-full relative group overflow-hidden bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl">
      
      {/* MAIN IMAGE OR FALLBACK */}
      <div className="h-full w-full relative">
        {images.length > 0 ? (
          <>
            <img 
              src={images[currentImageIndex]} 
              alt={property.project_name}
              className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
            />
            {/* VIGNETTE & OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

            {/* CORNER OVERLAY: CONFIGURATIONS (LEFT BOTTOM) */}
            <div className={`absolute bottom-6 left-6 z-20 flex flex-col gap-2 transition-all duration-300 ${isCompact ? 'scale-90 origin-bottom-left' : ''}`}>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                  <Info size={20} />
                </div>
                {!isCompact && (
                  <div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Configurations</p>
                    <p className="text-sm font-black text-white">{property.configurations?.join(', ') || 'Available'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* CORNER OVERLAY: PRICE (RIGHT BOTTOM) */}
            <div className={`absolute z-20 flex flex-col gap-2 transition-all duration-300 ${isCompact ? 'bottom-20 left-6 scale-90 origin-bottom-left' : 'bottom-6 right-6 scale-100 origin-bottom-right'}`}>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                {!isCompact && (
                  <div>
                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Price Range</p>
                    <p className="text-sm font-black text-white">{property.pricedisplay || 'On Request'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER ACTION BAND */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center gap-4">
              <ActionButton 
                icon={<MessageCircle size={28} className="text-[#25D366]" />} 
                tooltip="WhatsApp Specialist" 
                onClick={handleWhatsAppClick}
                compact={isCompact}
              />
              <ActionButton 
                icon={<BookOpen size={28} className="text-blue-500" />} 
                tooltip="Book Site Visit" 
                onClick={handleBookingClick}
                compact={isCompact}
              />
              <ActionButton 
                icon={<Download size={28} className="text-slate-700" />} 
                tooltip="Download Brochure" 
                onClick={handleBrochureClick}
                compact={isCompact}
              />
            </div>

            {/* NAV ARROWS */}
            {hasMultipleImages && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all z-20 opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all z-20 opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* IMAGE COUNTER INDICATORS */}
            {hasMultipleImages && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-sm rounded-full z-20">
                {images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-5 shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/30'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white bg-slate-800">
            <ImageIcon size={32} className="mb-2 opacity-30 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Visuals</p>
          </div>
        )}
      </div>
    </div>
  );
}
