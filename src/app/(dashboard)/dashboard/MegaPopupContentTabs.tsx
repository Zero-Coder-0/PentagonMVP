'use client';

import { Info, LayoutGrid, Sparkles, MapPin, Building2, IndianRupee } from 'lucide-react';

type TabType = 'overview' | 'units' | 'amenities' | 'location' | 'specs' | 'pricing';

interface Props {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function MegaPopupContentTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-slate-200 px-4">
      <div className="flex gap-3 overflow-x-auto">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => onTabChange('overview')}
          icon={<Info size={15} />}
          label="Overview"
        />
        <TabButton
          active={activeTab === 'units'}
          onClick={() => onTabChange('units')}
          icon={<LayoutGrid size={15} />}
          label="Units"
        />
        <TabButton
          active={activeTab === 'amenities'}
          onClick={() => onTabChange('amenities')}
          icon={<Sparkles size={15} />}
          label="Amenities"
        />
        <TabButton
          active={activeTab === 'location'}
          onClick={() => onTabChange('location')}
          icon={<MapPin size={15} />}
          label="Location"
        />
        <TabButton
          active={activeTab === 'specs'}
          onClick={() => onTabChange('specs')}
          icon={<Building2 size={15} />}
          label="Specs"
        />
        <TabButton
          active={activeTab === 'pricing'}
          onClick={() => onTabChange('pricing')}
          icon={<IndianRupee size={15} />}
          label="Pricing"
        />
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`pb-2 px-2 text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
    >
      {icon} {label}
    </button>
  );
}
