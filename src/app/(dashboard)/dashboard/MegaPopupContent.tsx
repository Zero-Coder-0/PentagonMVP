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
import type { ProjectFullV7 } from '@/modules/inventory/types-v7';

type TabType = 'overview' | 'units' | 'amenities' | 'location' | 'specs' | 'pricing';

export default function MegaPopupContent() {
  const { selectedId, selectedFullProject } = useDashboard();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const property = selectedFullProject;

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
    </div>
  );
}
