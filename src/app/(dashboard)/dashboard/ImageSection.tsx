'use client';

import { useDashboard } from './page';
import { Image as ImageIcon, ChevronLeft, ChevronRight, MessageCircle, FileText, CalendarRange, Check } from 'lucide-react';
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

  const handleCopyWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!waName || !waMobile || !fullProperty) {
      alert("Please enter both Name and Mobile Number below first!");
      return;
    }
    const template = generateWhatsAppTemplate(fullProperty as ProjectFullV7, { name: waName, mobile: waMobile });
    navigator.clipboard.writeText(template).then(() => {
      setWaCopied(true);
      setTimeout(() => setWaCopied(false), 2000);
    });
  };

  const handleBookForm = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(GLOBAL_BOOKING_FORM_URL, '_blank');
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fullProperty && (fullProperty as any).brochure_url) {
      window.open((fullProperty as any).brochure_url, '_blank');
    } else {
      alert("Brochure URL is not available for this project.");
    }
  };

  if (!property) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden p-6">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center z-10 max-w-xs mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={28} />
          </div>
          <h3 className="text-slate-900 font-black text-sm mb-1 uppercase tracking-tight">No Selection</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Select a property from the map or list to interact
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
      
      {/* 1. Square Image Gallery Section with Floating Icons */}
      <div className="relative aspect-square w-full bg-slate-900 overflow-hidden group flex-shrink-0 border-b border-slate-100">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={`${property.project_name}`}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            
            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 translate-y-[-10px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <span className="bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-white/50">
                {property.project_name}
              </span>
            </div>

            {/* FLOATING ACTION BAND - CENTERED */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex gap-4 p-2.5 bg-white/10 backdrop-blur-xl rounded-[24px] border border-white/20 shadow-2xl translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-auto">
                <ActionButton 
                  icon={waCopied ? <Check size={20} className="text-white" /> : <MessageCircle size={20} className="text-[#25D366]" />} 
                  tooltip={waCopied ? "Template Copied!" : "Copy WhatsApp Template"}
                  onClick={handleCopyWhatsApp} 
                  active={waCopied}
                />
                <ActionButton 
                  icon={<CalendarRange size={20} className="text-blue-500" />} 
                  tooltip="Book Site Visit"
                  onClick={handleBookForm} 
                />
                <ActionButton 
                  icon={<FileText size={20} className="text-indigo-500" />} 
                  tooltip="Download Brochure"
                  onClick={handleDownload} 
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            {hasMultipleImages && (
              <>
                <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/10">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/10">
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Image Counter */}
            {hasMultipleImages && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 bg-black/20 backdrop-blur-sm rounded-full">
                {images.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-slate-100">
            <ImageIcon size={32} className="mb-2 opacity-30 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Visuals</p>
          </div>
        )}
      </div>

      {/* 2. Sharing Form Section - Below Square */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 flex flex-col">
        <div className="mb-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <div className="w-1 h-3 bg-blue-500 rounded-full" />
            Share Property Template
          </h3>
          <div className="space-y-3">
            <div className="group relative">
              <label className="absolute left-3 -top-2 px-1 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-0 group-focus-within:opacity-100 transition-opacity">Full Name</label>
              <input 
                type="text" 
                value={waName} 
                onChange={e => setWaName(e.target.value)} 
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" 
                placeholder="Ex. Rahul Sharma" 
              />
            </div>
            <div className="group relative">
              <label className="absolute left-3 -top-2 px-1 bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-tighter opacity-0 group-focus-within:opacity-100 transition-opacity">Mobile No</label>
              <input 
                type="tel" 
                value={waMobile} 
                onChange={e => setWaMobile(e.target.value)} 
                className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm" 
                placeholder="+91 91234 56789" 
              />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Status</span>
             <span className="text-[11px] font-bold text-slate-600">{property.projectstatus || 'Available'}</span>
          </div>
          <div className="flex flex-col items-end text-right">
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Starting At</span>
             <span className="text-sm font-black text-blue-600 tracking-tighter">{property.pricedisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, tooltip, onClick, active }: { icon: React.ReactNode, tooltip: string, onClick: (e: React.MouseEvent) => void, active?: boolean }) {
  return (
    <div className="relative group/btn">
      <button 
        onClick={onClick}
        className={`w-12 h-12 flex items-center justify-center rounded-[18px] transition-all duration-300 transform active:scale-90 hover:scale-110 shadow-xl border border-white/50 ${active ? 'bg-slate-900 border-slate-800' : 'bg-white hover:bg-slate-50'}`}
      >
        {icon}
      </button>
      
      {/* TOOLTIP */}
      <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-[10px] font-bold text-white whitespace-nowrap rounded-lg opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none scale-50 group-hover/btn:scale-100 origin-top shadow-2xl z-[100]">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-bottom-slate-900" />
        {tooltip}
      </div>
    </div>
  );
}
