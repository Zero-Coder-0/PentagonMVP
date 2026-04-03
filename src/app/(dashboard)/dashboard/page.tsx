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

  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;

  selectedFullProject: ProjectFullV7 | null;
  setSelectedFullProject: (project: ProjectFullV7 | null) => void;
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
  const [leftColumnWidth, setLeftColumnWidth] = useState(25);
  const [middleColumnWidth, setMiddleColumnWidth] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
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

      setMapBounds([
        [minLat === maxLat ? minLat - 0.02 : minLat, minLng === maxLng ? minLng - 0.02 : minLng],
        [minLat === maxLat ? maxLat + 0.02 : maxLat, maxLng === maxLng ? maxLng + 0.02 : maxLng],
      ]);
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
  };

  return (
    <DashboardContext.Provider value={value}>
      <div className="h-screen w-full flex overflow-hidden bg-slate-50">
        
        {/* LEFT COLUMN - Dynamic width - 3 vertically stacked components */}
        <div 
          className="relative h-full bg-white border-r border-slate-200 z-0 min-h-0 flex flex-col flex-shrink-0"
          style={{ width: `${leftColumnWidth}%` }}
        >
          {/* MAP - Top section (Now starts from very top) */}
          <div className="flex-1 min-h-[200px] border-b border-slate-200">
            <MapContainer />
          </div>
          
          {/* IMAGE SECTION - Middle section */}
          <div className="flex-1 min-h-[150px] border-b border-slate-200 bg-slate-50">
            <ImageSection />
          </div>
          
          {/* ALTERNATIVES SECTION - Bottom section */}
          <div className="flex-1 min-h-[150px] bg-slate-100">
            <AlternativesSection />
          </div>
        </div>

        {/* First Resizer */}
        <ColumnResizer 
          onResize={(newWidth) => {
            const containerWidth = 100; // Total width percentage
            const remainingWidth = containerWidth - newWidth - 15; // 15% for right column
            setLeftColumnWidth(newWidth);
            setMiddleColumnWidth(Math.max(30, remainingWidth));
          }}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />

        {/* RIGHT SIDE CONTAINER (Navbar + Middle Column + Right Column) */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 h-full">
          
          {/* NAVBAR - Now only spans the right side */}
          <DashboardNavbar />

          <div className="flex-1 flex overflow-hidden relative min-h-0">
            {/* MIDDLE COLUMN - Dynamic width - Full MegaPopup */}
            <div 
              className="relative h-full bg-white border-r border-slate-200 z-10 shadow-lg min-h-0 flex-shrink-0"
              style={{ width: `${(middleColumnWidth / (100 - leftColumnWidth)) * 100}%` }}
            >
              <MegaPopupContent />
            </div>

            {/* Second Resizer */}
            <ColumnResizer 
              onResize={(newMiddleWidthRaw) => {
                // Calculate based on the total 100% width
                const maxMiddle = 100 - leftColumnWidth - 10; // Leave at least 10% for right col
                const constrainedWidth = Math.min(Math.max(20, newMiddleWidthRaw), maxMiddle);
                setMiddleColumnWidth(constrainedWidth);
              }}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />

            {/* RIGHT COLUMN - Property List */}
            <div 
              className="relative h-full bg-slate-50 z-20 shadow-xl min-h-0 flex-1 min-w-0"
            >
              <PropertyListContainer />
            </div>
          </div>
        </div>

      </div>
    </DashboardContext.Provider>
  );
}

// getDistanceKm is imported from @/lib/geo — no duplication needed.
