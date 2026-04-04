'use client';

import { useDashboard } from './page';
import { Image as ImageIcon, ChevronLeft, ChevronRight, MessageCircle, FileText, CalendarRange, Check, X, Building2, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { generateWhatsAppTemplate } from './MegaPopup/whatsapp-template';
import type { ProjectFullV7 } from '@/modules/inventory/types-v7';

// Global Booking Form Link
const GLOBAL_BOOKING_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform";

export default function ImageSection() {
  const { displayedProperties, selectedId, selectedFullProject, leftColumnWidth } = useDashboard();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      alert("Please enter both Name and Mobile Number!");
      return;
    }
    const template = generateWhatsAppTemplate(fullProperty as ProjectFullV7, { name: waName, mobile: waMobile });
    navigator.clipboard.writeText(template).then(() => {
      setWaCopied(true);
      setTimeout(() => {
        setWaCopied(false);
        setIsModalOpen(false);
      }, 2000);
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
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center max-w-xs mx-auto">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon size={28} />
          </div>
          <h3 className="text-slate-900 font-black text-sm mb-1 uppercase tracking-tight">No Selection</h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            Select a property to view visuals
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
    <div className="h-full w-full flex flex-col bg-slate-900 overflow-hidden relative">
      
      {/* 1. Main Image Section - Strict Containment */}
      <div className="relative h-full w-full bg-slate-900 overflow-hidden group">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={`${property.project_name}`}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
            
            {/* TOP BADGE: PROJECT NAME */}
            <div className="absolute top-4 left-4 z-20 transition-all duration-300 overflow-hidden max-w-[calc(100%-2rem)]">
              <span className="bg-white/10 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl border border-white/20 whitespace-nowrap block truncate">
                {property.project_name}
              </span>
            </div>

            {/* CENTER: FLOATING ACTION BAND */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className={`flex items-center bg-white/10 backdrop-blur-2xl rounded-[32px] border border-white/20 shadow-2xl translate-y-6 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-auto ${leftColumnWidth < 20 ? 'gap-2 p-2' : 'gap-4 p-3'}`}>
                <ActionButton 
                  icon={<MessageCircle size={leftColumnWidth < 20 ? 18 : 22} className="text-[#25D366]" />} 
                  tooltip="Copy Template"
                  onClick={() => setIsModalOpen(true)} 
                  compact={leftColumnWidth < 20}
                />
                <ActionButton 
                  icon={<CalendarRange size={leftColumnWidth < 20 ? 18 : 22} className="text-blue-400" />} 
                  tooltip="Book Site Visit"
                  onClick={handleBookForm} 
                  compact={leftColumnWidth < 20}
                />
                <ActionButton 
                  icon={<FileText size={leftColumnWidth < 20 ? 18 : 22} className="text-indigo-400" />} 
                  tooltip="Download Brochure"
                  onClick={handleDownload} 
                  compact={leftColumnWidth < 20}
                />
              </div>
            </div>

            {/* BOTTOM LEFT: CONFIGS */}
            <div className={`absolute bottom-4 left-4 z-20 transition-all duration-500 overflow-hidden group-hover:-translate-x-2 group-hover:opacity-0`}>
               <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center transition-all duration-300 ${leftColumnWidth < 30 ? 'px-2 py-2 gap-2' : 'px-4 py-2.5 gap-3'}`}>
                  <div className={`bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30 transition-all ${leftColumnWidth < 30 ? 'w-6 h-6' : 'w-8 h-8'}`}>
                    <Building2 size={leftColumnWidth < 30 ? 12 : 16} className="text-blue-400" />
                  </div>
                  <div className="flex flex-col">
                    {leftColumnWidth >= 30 && (
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Configuration</span>
                    )}
                    <span className={`font-bold text-white leading-tight whitespace-nowrap transition-all ${leftColumnWidth < 30 ? 'text-[10px]' : 'text-xs'}`}>
                      {property.configurations || '2 & 3 BHK'}
                    </span>
                  </div>
               </div>
            </div>

            {/* BOTTOM RIGHT: PRICE */}
            <div className={`absolute z-20 transition-all duration-500 overflow-hidden group-hover:translate-x-2 group-hover:opacity-0 ${leftColumnWidth < 30 ? 'bottom-16 left-4' : 'bottom-4 right-4'}`}>
               <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center transition-all duration-300 ${leftColumnWidth < 30 ? 'px-2 py-2 gap-2' : 'px-4 py-2.5 gap-3'}`}>
                  <div className="flex flex-col text-right">
                    {leftColumnWidth >= 30 && (
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-widest leading-none mb-0.5 whitespace-nowrap">Starting Range</span>
                    )}
                    <span className={`font-black text-white tracking-tighter whitespace-nowrap transition-all ${leftColumnWidth < 30 ? 'text-xs' : 'text-sm'}`}>
                      {property.pricedisplay}
                    </span>
                  </div>
                  <div className={`bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30 transition-all ${leftColumnWidth < 30 ? 'w-6 h-6' : 'w-8 h-8'}`}>
                    <Wallet size={leftColumnWidth < 30 ? 12 : 16} className="text-emerald-400" />
                  </div>
               </div>
            </div>

            {/* Navigation Buttons */}
            {hasMultipleImages && (
              <>
                <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/10">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 border border-white/10">
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Image Counter Indicators */}
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
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading High-Res Visuals</p>
          </div>
        )}
      </div>

      {/* WHATSAPP MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-50 text-[#25D366] rounded-full flex items-center justify-center mb-6">
              <MessageCircle size={32} />
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-2">Ready to Share!</h3>
            <p className="text-slate-500 text-sm mb-6 px-4">
              Enter your name and mobile number to generate your personalized WhatsApp template for <span className="font-bold text-slate-800">{property.project_name}</span>.
            </p>

            <div className="w-full space-y-4 mb-8">
               <div className="relative group">
                  <input 
                    type="text" 
                    value={waName} 
                    onChange={e => setWaName(e.target.value)} 
                    placeholder="Enter Full Name"
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  />
               </div>
               <div className="relative group">
                  <input 
                    type="tel" 
                    value={waMobile} 
                    onChange={e => setWaMobile(e.target.value)} 
                    placeholder="Enter Mobile Number"
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-6 font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                  />
               </div>
            </div>

            <div className="w-full flex gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-16 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleCopyWhatsApp}
                className={`flex-[2] h-16 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 uppercase tracking-widest ${waCopied ? 'bg-slate-900 text-white' : 'bg-[#25D366] text-white hover:bg-[#1ebd5b] shadow-xl shadow-green-200'}`}
              >
                {waCopied ? <><Check size={18} /> Copied!</> : 'Copy Template'}
              </button>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="mt-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ icon, tooltip, onClick, active, compact }: { icon: React.ReactNode, tooltip: string, onClick: (e: React.MouseEvent) => void, active?: boolean, compact?: boolean }) {
  return (
    <div className="relative group/btn">
      <button 
        onClick={onClick}
        className={`flex items-center justify-center rounded-[20px] transition-all duration-300 transform active:scale-90 hover:scale-110 shadow-2xl border border-white/20 ${active ? 'bg-white' : 'bg-white hover:shadow-white/20'} ${compact ? 'w-10 h-10' : 'w-14 h-14'}`}
      >
        {icon}
      </button>
      
      {/* TOOLTIP */}
      <div className={`absolute left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white text-[10px] font-black text-slate-900 whitespace-nowrap rounded-xl opacity-0 group-hover/btn:opacity-100 transition-all duration-300 pointer-events-none scale-50 group-hover/btn:scale-100 origin-bottom shadow-2xl z-[100] uppercase tracking-widest border border-slate-100 ${compact ? '-top-10' : '-top-12'}`}>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-white" />
        {tooltip}
      </div>
    </div>
  );
}
