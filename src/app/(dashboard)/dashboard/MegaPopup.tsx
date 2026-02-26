'use client';

import React, { useState } from 'react';
import { useDashboard } from './page';
import { X, MessageCircle, FileText, CalendarRange } from 'lucide-react';
import type { ProjectFullV7 } from '@/modules/inventory/types-v7';
import { MegaPopupHeader } from './MegaPopup/Header';
import { MegaPopupTabs } from './MegaPopup/Tabs';
import { OverviewTab } from './MegaPopup/OverviewTab';
import { UnitsTab } from './MegaPopup/UnitsTab';
import { AmenitiesTab } from './MegaPopup/AmenitiesTab';
import { LocationTab } from './MegaPopup/LocationTab';
import { SpecsTab } from './MegaPopup/SpecsTab';
import { PricingTab } from './MegaPopup/PricingTab';
import { AlternativesTab } from './MegaPopup/AlternativesTab';
import { generateWhatsAppTemplate } from './MegaPopup/whatsapp-template';

type TabType = 'overview' | 'units' | 'amenities' | 'location' | 'specs' | 'pricing' | 'alternatives';

// EDIT THIS: Global Booking Form Link for the "Book Form" button
const GLOBAL_BOOKING_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform";

export default function MegaPopup() {
  const { hoveredRecId, displayedProperties, setHoveredRecId, cancelHoverLeave } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // WhatsApp Modal State
  const [showWaModal, setShowWaModal] = useState(false);
  const [waName, setWaName] = useState('');
  const [waMobile, setWaMobile] = useState('');
  const [waCopied, setWaCopied] = useState(false);

  const { selectedFullProject } = useDashboard();
  const property = selectedFullProject || displayedProperties.find(p => p.id === hoveredRecId) as ProjectFullV7 | undefined;

  if (!hoveredRecId || !property) return null;

  const handleCopyWhatsApp = () => {
    if (!waName || !waMobile) {
      alert("Please enter both Name and Mobile Number");
      return;
    }
    const template = generateWhatsAppTemplate(property, { name: waName, mobile: waMobile });
    navigator.clipboard.writeText(template).then(() => {
      setWaCopied(true);
      setTimeout(() => setWaCopied(false), 2000);
    });
  };

  const handleBookForm = () => {
    window.open(GLOBAL_BOOKING_FORM_URL, '_blank');
  };

  const handleDownload = () => {
    if (property.brochure_url) {
      window.open(property.brochure_url, '_blank');
    } else {
      alert("Brochure URL is not available for this project. Please add it via the edit wizard.");
    }
  };

  return (
    <>
      <div
        className="fixed left-0 top-[57px] w-[75vw] max-w-[1400px] bottom-0 bg-white rounded-r-xl shadow-2xl z-[999] flex flex-col overflow-hidden animate-in slide-in-from-left duration-300 border-r border-slate-300"
        onMouseEnter={cancelHoverLeave}
        onMouseLeave={() => { }}
        onClick={(e) => e.stopPropagation()}
      >
        <MegaPopupHeader property={property} onClose={() => setHoveredRecId(null)} />
        <MegaPopupTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {activeTab === 'overview' && <OverviewTab property={property} />}
          {activeTab === 'units' && <UnitsTab property={property} />}
          {activeTab === 'amenities' && <AmenitiesTab property={property} />}
          {activeTab === 'location' && <LocationTab property={property} />}
          {activeTab === 'specs' && <SpecsTab property={property} />}
          {activeTab === 'pricing' && <PricingTab property={property} />}
          {activeTab === 'alternatives' && <AlternativesTab property={property} />}
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center flex-shrink-0">
          <div className="text-slate-400 text-sm font-medium">
            Project ID: {property.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="flex gap-3">
            <button onClick={handleBookForm} className="text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm">
              <CalendarRange size={18} className="text-blue-600" /> Book Form
            </button>
            <button onClick={() => setShowWaModal(true)} className="text-white bg-[#25D366] hover:bg-[#1ebd5b] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm">
              <MessageCircle size={18} /> WhatsApp Share
            </button>
            <button onClick={handleDownload} className="text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition shadow-sm">
              <FileText size={18} /> Download Brochure
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Capture Modal */}
      {showWaModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[1000] flex items-center justify-center backdrop-blur-sm animate-in fade-in" onClick={() => setShowWaModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw] border border-slate-100 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <MessageCircle className="text-[#25D366]" /> Share via WhatsApp
              </h3>
              <button onClick={() => setShowWaModal(false)} className="text-slate-400 hover:text-slate-700 transition">
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Enter your sales details to generate a customized property template for <strong>{property.project_name}</strong>. The formatted message will be copied to your clipboard.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Name</label>
                <input type="text" value={waName} onChange={e => setWaName(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-[#25D366] transition" placeholder="e.g. Rahul Sharma" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Mobile Number</label>
                <input type="tel" value={waMobile} onChange={e => setWaMobile(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-[#25D366] transition" placeholder="+91 98765 43210" />
              </div>

              <button
                onClick={handleCopyWhatsApp}
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all mt-4 flex justify-center items-center gap-2 shadow-lg ${waCopied ? 'bg-slate-800 shadow-slate-900/20 scale-[0.98]' : 'bg-[#25D366] hover:bg-[#1ebd5b] shadow-green-600/30 hover:-translate-y-0.5'}`}
              >
                {waCopied ? '✓ Copied to Clipboard!' : 'Copy Message Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
