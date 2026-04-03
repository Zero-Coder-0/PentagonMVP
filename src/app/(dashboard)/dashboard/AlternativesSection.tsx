'use client';

import { useDashboard } from './page';
import { AlternativesTab } from './MegaPopup/AlternativesTab';
import type { ProjectFullV7 } from '@/modules/inventory/types-v7';

export default function AlternativesSection() {
  const { selectedId, selectedFullProject } = useDashboard();

  const property = selectedFullProject;

  if (!selectedId || !property) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-slate-900 font-bold text-sm mb-1">No Property Selected</h3>
          <p className="text-slate-500 text-xs">
            Select a property to view alternatives
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-slate-200 bg-white">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <div className="w-5 h-5 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Smart Alternatives
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Similar properties in the area
        </p>
      </div>

      {/* Alternatives Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-3">
        <AlternativesTab property={property as ProjectFullV7} />
      </div>
    </div>
  );
}
