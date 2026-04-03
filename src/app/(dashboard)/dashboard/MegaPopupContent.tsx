'use client';

import React, { useState } from 'react';
import { useDashboard } from './page';
import { MegaPopupHeader } from './MegaPopup/Header';
import { MegaPopupContentTabs } from './MegaPopupContentTabs';
import { OverviewTab } from './MegaPopup/OverviewTab';
import { UnitsTab } from './MegaPopup/UnitsTab';
import { AmenitiesTab } from './MegaPopup/AmenitiesTab';
import { LocationTab } from './MegaPopup/LocationTab';
import { SpecsTab } from './MegaPopup/SpecsTab';
import { PricingTab } from './MegaPopup/PricingTab';
import { X, MessageCircle, FileText, CalendarRange } from 'lucide-react';
import { generateWhatsAppTemplate } from './MegaPopup/whatsapp-template';
import type { ProjectFullV7 } from '@/modules/inventory/types-v7';

type TabType = 'overview' | 'units' | 'amenities' | 'location' | 'specs' | 'pricing';

// EDIT THIS: Global Booking Form Link for the "Book Form" button
const GLOBAL_BOOKING_FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform";

export default function MegaPopupContent() {
  const { selectedId, selectedFullProject } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // WhatsApp Modal State
  const [showWaModal, setShowWaModal] = useState(false);
  const [waName, setWaName] = useState('');
  const [waMobile, setWaMobile] = useState('');
  const [waCopied, setWaCopied] = useState(false);

  const property = selectedFullProject;

  const handleCopyWhatsApp = () => {
    if (!waName || !waMobile || !property) {
      alert("Please enter both Name and Mobile Number");
      return;
    }
    const template = generateWhatsAppTemplate(property as ProjectFullV7, { name: waName, mobile: waMobile });
    navigator.clipboard.writeText(template).then(() => {
      setWaCopied(true);
      setTimeout(() => setWaCopied(false), 2000);
    });
  };

  const handleBookForm = () => {
    window.open(GLOBAL_BOOKING_FORM_URL, '_blank');
  };

  const handleDownload = () => {
    if (property && (property as any).brochure_url) {
      window.open((property as any).brochure_url, '_blank');
    } else {
      alert("Brochure URL is not available for this project. Please add it via the edit wizard.");
    }
  };

  if (!selectedId || !property) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-slate-900 font-bold text-lg mb-2">No Property Selected</h3>
          <p className="text-slate-500 text-sm">
            Select a property from the map or list to view its details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full w-full flex flex-col bg-white overflow-hidden">
        <MegaPopupHeader property={property as ProjectFullV7} onClose={() => {}} />
        <MegaPopupContentTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
          {activeTab === 'overview' && <OverviewTab property={property as ProjectFullV7} />}
          {activeTab === 'units' && <UnitsTab property={property as ProjectFullV7} />}
          {activeTab === 'amenities' && <AmenitiesTab property={property as ProjectFullV7} />}
          {activeTab === 'location' && <LocationTab property={property as ProjectFullV7} />}
          {activeTab === 'specs' && <SpecsTab property={property as ProjectFullV7} />}
          {activeTab === 'pricing' && <PricingTab property={property as ProjectFullV7} />}
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex justify-between items-center flex-shrink-0">
          <div className="text-slate-400 text-xs font-medium">
            ID: {property.id.slice(0, 8).toUpperCase()}
          </div>
          <div className="flex gap-2">
            <button onClick={handleBookForm} className="text-slate-700 bg-white border-2 border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition">
              <CalendarRange size={14} className="text-blue-600" /> Book
            </button>
            <button onClick={() => setShowWaModal(true)} className="text-white bg-[#25D366] hover:bg-[#1ebd5b] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition">
              <MessageCircle size={14} /> WhatsApp
            </button>
            <button onClick={handleDownload} className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition">
              <FileText size={14} /> Brochure
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Capture Modal */}
      {showWaModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[1000] flex items-center justify-center backdrop-blur-sm" onClick={() => setShowWaModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-[90vw] border border-slate-100" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <MessageCircle className="text-[#25D366]" /> Share via WhatsApp
              </h3>
              <button onClick={() => setShowWaModal(false)} className="text-slate-400 hover:text-slate-700 transition">
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Enter your sales details to generate a customized property template for <strong>{property.project_name}</strong>.
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
                className={`w-full py-3.5 rounded-xl font-bold text-white transition-all mt-4 flex justify-center items-center gap-2 shadow-lg ${waCopied ? 'bg-slate-800' : 'bg-[#25D366] hover:bg-[#1ebd5b]'}`}
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
