'use client';

import React, {
  createContext,
  useState,
  useMemo,
  useContext,
  useRef,
  useEffect,
} from 'react';

import MapContainer from './MapContainer';
import PropertyListContainer from './PropertyListContainer';
import MegaPopup from './MegaPopup';
import MegaPopupContent from './MegaPopupContent';
import ImageSection from './ImageSection';
import AlternativesSection from './AlternativesSection';
import ColumnResizer from './ColumnResizer';
import DashboardNavbar from './DashboardNavbar';
import MediaGallery from './MediaGallery';

import type { ProjectFullV7, ProjectV7, FilterCriteriaV7 } from '@/modules/inventory/types-v7';
import {
  getMapProjectsV7 as getMapProjects,
  getFilterOptionsV7, getProjectByIdV7
} from '@/modules/inventory/actions-v7';
import { getDistanceKm } from '@/lib/geo';
import { applyFilters } from '@/modules/inventory/utils/filter-engine';



interface DashboardContextType {
  properties: ProjectV7[];
  displayedProperties: ProjectV7[];
  filterOptions: any;

  filters: FilterCriteriaV7;
  setFilters: (filters: FilterCriteriaV7) => void;
  resetFilters: () => void;

  selectedId: string | null;
  setSelectedId: (id: string | null) => void;

  hoveredListId: string | null;
  setHoveredListId: (id: string | null) => void;

  hoveredRecId: string | null;
  setHoveredRecId: (id: string | null) => void;

  handleCardEnter: (id: string) => void;
  handleCardLeave: () => void;
  cancelHoverLeave: () => void;

  handlePinClick: (id: string) => void;

  userLocation: { lat: number; lng: number; displayName: string } | null;
  setUserLocation: (location: any) => void;

  mapBounds?: [[number, number], [number, number]];
  setMapBounds: (bounds?: [[number, number], [number, number]]) => void;

  selectedFullProject: ProjectFullV7 | null;
  setSelectedFullProject: (project: ProjectFullV7 | null) => void;

  leftColumnWidth: number;
  setLeftColumnWidth: (width: number) => void;

  isWhatsAppModalOpen: boolean;
  setWhatsAppModalOpen: (open: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<ProjectV7[]>([]);
  const [selectedFullProject, setSelectedFullProject] = useState<ProjectFullV7 | null>(null);
  const [leftColumnWidth, setLeftColumnWidth] = useState(20);
  const [middleColumnWidth, setMiddleColumnWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [isWhatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const initialFilters: FilterCriteriaV7 = {
    status: [],
    minPrice: 0,
    maxPrice: 0,
    configurations: [],
    city_zones: [],
    facing: [],
    sqFtMin: 0,
    sqFtMax: 0,
    possessionYear: '',
    amenities: [],
    technology: [],
    builderGrades: [],
    balconyCount: [],
    bathroomCount: [],
    unitVariant: [],
  };

  const [filters, setFilters] = useState<FilterCriteriaV7>(initialFilters);
  const [filterOptions, setFilterOptions] = useState<any>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredListId, setHoveredListId] = useState<string | null>(null);
  const [hoveredRecId, setHoveredRecId] = useState<string | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    displayName: string;
  } | null>(null);

  const [mapBounds, setMapBounds] = useState<[[number, number], [number, number]] | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectsData, optionsData] = await Promise.all([
          getMapProjects(),
          getFilterOptionsV7()
        ]);
        setProperties(projectsData);
        setFilterOptions(optionsData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    }
    fetchData();
  }, []);

  const displayedProperties = useMemo(() => {
    // Guard against invalid data
    if (!Array.isArray(properties)) return [];
    
    // 1. Apply robust, case-insensitive filter engine
    let items = applyFilters(properties, filters);

    // 2. Apply proximity sorting if user location is known
    if (userLocation) {
      items = items
        .map((item) => ({
          ...item,
          distance: getDistanceKm(userLocation.lat, userLocation.lng, item.lat || 0, item.lng || 0),
        }))
        .sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));
    }

    return items;
  }, [properties, filters, userLocation]);

  // Hook to automatically zoom the map out to fit all remaining properties when filters change
  const filterKey = JSON.stringify(filters);
  useEffect(() => {
    setSelectedId(null);
    setSelectedFullProject(null);
    setHoveredRecId(null);

    if (!displayedProperties || displayedProperties.length === 0) return;

    const validLocs = displayedProperties.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number');
    if (validLocs.length > 0) {
      const minLat = Math.min(...validLocs.map((p) => p.lat as number));
      const maxLat = Math.max(...validLocs.map((p) => p.lat as number));
      const minLng = Math.min(...validLocs.map((p) => p.lng as number));
      const maxLng = Math.max(...validLocs.map((p) => p.lng as number));

      // Check if bounds actually changed before setting to avoid re-renders during resize
      const newBounds = [
        [minLat === maxLat ? minLat - 0.02 : minLat, minLng === maxLng ? minLng - 0.02 : minLng],
        [minLat === maxLat ? maxLat + 0.02 : maxLat, maxLng === maxLng ? maxLng + 0.02 : maxLng],
      ] as [[number, number], [number, number]];

      if (!mapBounds || 
          mapBounds[0][0] !== newBounds[0][0] || 
          mapBounds[1][0] !== newBounds[1][0]) {
        setMapBounds(newBounds);
      }
    }
  }, [filterKey, displayedProperties]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show popup shell immediately, but only hit the DB after 300ms pause
  // This prevents network spam when users quickly drag the mouse across the list
  const handleCardEnter = (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredRecId(id); // Popup shell appears instantly
    hoverTimeoutRef.current = setTimeout(async () => {
      const full = await getProjectByIdV7(id); // DB fetch only on genuine hover
      setSelectedFullProject(full);
    }, 300);
  };

  // 1s grace period before hiding popup (lets user move mouse to the popup itself)
  const handleCardLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredRecId(null);
    }, 1000);
  };

  // Cancel hide timer when mouse enters the popup panel
  const cancelHoverLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handlePinClick = async (id: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setSelectedId(id);
    setHoveredRecId(id);
    const full = await getProjectByIdV7(id);
    setSelectedFullProject(full);
  };


  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const value: DashboardContextType = {
    properties,
    displayedProperties,
    filterOptions,
    filters,
    setFilters,
    resetFilters,
    selectedId,
    setSelectedId,
    hoveredListId,
    setHoveredListId,
    hoveredRecId,
    setHoveredRecId,
    handleCardEnter,
    handleCardLeave,
    cancelHoverLeave,
    handlePinClick,
    userLocation,
    setUserLocation,
    mapBounds,
    setMapBounds,
    filtersOpen,
    setFiltersOpen,
    selectedFullProject,
    setSelectedFullProject,
    leftColumnWidth,
    setLeftColumnWidth,
    isWhatsAppModalOpen,
    setWhatsAppModalOpen,
  };

  return (
    <DashboardContext.Provider value={value}>
      <div className="h-screen w-full flex overflow-hidden bg-slate-50 select-none">
        
        {/* LEFT COLUMN - Map + Images/WhatsApp */}
        <div 
          className="relative h-full bg-white border-r border-slate-200 z-0 flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: `${leftColumnWidth}%` }}
        >
          {/* MAP - Top section */}
          <div className="flex-[3] relative border-b-2 border-slate-200 min-h-0">
            <MapContainer />
            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-black text-slate-400 uppercase tracking-tighter border border-slate-200 shadow-sm z-10">
              Interactive Map
            </div>
          </div>
          
          {/* IMAGE SECTION - Bottom section (No internal scroll per user request) */}
          <div className="flex-[2] bg-slate-900 border-t border-slate-200 relative min-h-0 overflow-hidden">
            <ImageSection />
          </div>
        </div>

        {/* First Resizer (Left -> Middle) */}
        <ColumnResizer 
          onResize={(newWidth) => {
            // User requested max 60% for left section
            const limitedL = Math.min(Math.max(10, newWidth), 60);
            setLeftColumnWidth(limitedL);
          }}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />

        {/* MIDDLE COLUMN - Navbar + MegaPopup Content */}
        <div 
          className="relative h-full bg-white border-r border-slate-200 z-10 shadow-2xl flex flex-col flex-shrink-0 overflow-hidden"
          style={{ width: `${middleColumnWidth}%` }}
        >
          {/* Header Area in Middle Column */}
          <div className="flex-shrink-0">
            <DashboardNavbar />
          </div>
          
          <div className="flex-1 min-h-0 overflow-hidden">
            <MegaPopupContent />
          </div>
        </div>

        {/* Second Resizer (Middle -> Right) */}
        <ColumnResizer 
          onResize={(newMiddleWidthRaw) => {
            const remainingForMAndR = 100 - leftColumnWidth;
            // Left boundary for middle: must be at least 20%
            // Right boundary for middle: must leave enough room so Right column is at most 60%
            // But also Right column must be at least 15%
            const minM = Math.max(20, remainingForMAndR - 60);
            const maxM = remainingForMAndR - 15;
            
            const limitedM = Math.min(Math.max(minM, newMiddleWidthRaw), maxM);
            setMiddleColumnWidth(limitedM);
          }}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />

        {/* RIGHT COLUMN - Property List + Alternatives */}
        <div className="relative h-full bg-slate-50 z-20 shadow-xl flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Property List (Top) */}
          <div className="flex-1 min-h-0 relative overflow-hidden">
            <PropertyListContainer />
          </div>
          
          {/* Alternatives (Bottom) */}
          <div className="flex-shrink-0 h-[30%] bg-white border-t-2 border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                Smart Alternatives
              </h3>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <AlternativesSection />
            </div>
          </div>
        </div>

        {isWhatsAppModalOpen && <WhatsAppModal />}
      </div>
    </DashboardContext.Provider>
  );
}

import { MessageCircle, Check, X } from 'lucide-react';

function WhatsAppModal() {
  const { setWhatsAppModalOpen, selectedFullProject: property } = useDashboard();
  const [waName, setWaName] = useState('');
  const [waMobile, setWaMobile] = useState('');
  const [waCopied, setWaCopied] = useState(false);

  if (!property) return null;

  const handleCopyWhatsApp = () => {
    if (!waName || !waMobile) {
      alert("Please enter both Name and Mobile Number");
      return;
    }
    
    // TEMPLATE GENERATOR V7 (Premium Lead Capture)
    const template = `*PEN-TAGON Lead - Geostat App V7*%0A--------------------------------%0A*Name:* ${waName}%0A*Mobile:* ${waMobile}%0A--------------------------------%0A*Interested In:* ${property.project_name}%0A*Configuration:* ${property.configurations ? property.configurations.join(', ') : 'N/A'}%0A*Location:* ${property.region || 'Bengaluru'}%0A*Price:* ${property.pricedisplay}%0A--------------------------------%0A_Generated via Geostat Dashboard_`;
    
    const plainText = template.replace(/%0A/g, '\n').replace(/\*/g, '');
    navigator.clipboard.writeText(plainText);
    
    setWaCopied(true);
    setTimeout(() => {
      setWaCopied(false);
      setWhatsAppModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
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
            onClick={() => setWhatsAppModalOpen(false)}
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
          onClick={() => setWhatsAppModalOpen(false)}
          className="mt-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

// getDistanceKm is imported from @/lib/geo — no duplication needed.
