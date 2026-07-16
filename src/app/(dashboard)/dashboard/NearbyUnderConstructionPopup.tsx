'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Star, ArrowRight, Loader2 } from 'lucide-react';
import { useDashboard } from './page';
import { getDistanceKm, formatDistanceKm } from '@/lib/geo';

export default function NearbyUnderConstructionPopup() {
  const {
    userLocation,
    nearbySearchResults,
    setNearbySearchResults,
    nearbySearchQuery,
    setNearbySearchQuery,
    nearbySearchPopupOpen,
    setNearbySearchPopupOpen,
    selectedNearbyProperty,
    setSelectedNearbyProperty,
    nearbySearchPinPopupOpen,
    setNearbySearchPinPopupOpen,
    setMapBounds,
    properties,
    handlePinClick,
  } = useDashboard();

  const [localQuery, setLocalQuery] = useState(nearbySearchQuery);
  const [localRadius, setLocalRadius] = useState<number>(5); // Default 5km search radius
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Update local query state if parent changes
  useEffect(() => {
    setLocalQuery(nearbySearchQuery);
  }, [nearbySearchQuery]);

  // Close modals on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNearbySearchPinPopupOpen(false);
        setNearbySearchPopupOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setNearbySearchPinPopupOpen, setNearbySearchPopupOpen]);

  if (!userLocation) return null;

  const handleSearch = () => {
    const win = window as any;
    if (!win.google || !win.google.maps || !win.google.maps.places) {
      alert('Google Maps library is still loading. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setNearbySearchQuery(localQuery);

    const dummyEl = document.createElement('div');
    const service = new win.google.maps.places.PlacesService(dummyEl);

    // Optimize query for under-construction residential properties or support general search
    let searchQuery = localQuery.trim();
    const queryLower = searchQuery.toLowerCase();
    
    // Check if the user is searching for something residential/property related
    const isResidentialSearch = 
      queryLower === 'underconstruction' || 
      queryLower === 'uc' ||
      queryLower.includes('apartment') || 
      queryLower.includes('project') || 
      queryLower.includes('villa') || 
      queryLower.includes('homes') || 
      queryLower.includes('residency') ||
      queryLower.includes('flat') ||
      queryLower.includes('builder') ||
      queryLower.includes('society') ||
      queryLower.includes('property');

    if (queryLower === 'underconstruction' || queryLower === 'uc') {
      searchQuery = 'under construction apartments';
    }

    // Bias search around seed location
    const request = {
      location: new win.google.maps.LatLng(userLocation.lat, userLocation.lng),
      radius: localRadius * 1000, // Convert user-defined km to meters
      query: `${searchQuery} near ${userLocation.displayName}`,
    };

    // Find verified properties from local DB if search is residential/underconstruction related
    let localDbResults: any[] = [];
    if (isResidentialSearch) {
      const isUcSearch = queryLower === 'underconstruction' || queryLower === 'uc';
      
      localDbResults = properties
        .filter((p) => {
          // If searching for "underconstruction" or "uc", match only UnderConstruction or NewLaunch
          if (isUcSearch) {
            return p.projectstatus === 'UnderConstruction' || p.projectstatus === 'NewLaunch';
          }
          // Otherwise, match if project name, status, or configuration matches the query terms
          const pName = p.project_name.toLowerCase();
          const pStatus = (p.projectstatus || '').toLowerCase();
          return pName.includes(queryLower) || pStatus.includes(queryLower);
        })
        .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
        .map((p) => {
          const distance = getDistanceKm(userLocation.lat, userLocation.lng, p.lat!, p.lng!);
          return {
            id: p.id,
            isLocalDb: true,
            name: p.project_name,
            address: p.address_line || p.region || 'Verified Database Property',
            lat: p.lat,
            lng: p.lng,
            distance,
            rating: 5.0,
            user_ratings_total: 12,
            photoUrl: p.hero_image || null,
            projectstatus: p.projectstatus,
            possession_date: p.possession_date,
          };
        })
        .filter((p) => p.distance <= localRadius); // Filter by user-defined radius
    }

    service.textSearch(request, (results: any, status: any) => {
      setLoading(false);
      let googleResults: any[] = [];

      if (status === win.google.maps.places.PlacesServiceStatus.OK && results) {
        // Exclude commercial entities, contractors, and offices ONLY for residential searches
        const excludedTypes = [
          'real_estate_agency',
          'general_contractor',
          'contractor',
          'roofing_contractor',
          'moving_company',
          'local_government_office',
          'lawyer',
          'store',
          'office',
          'finance',
          'bank',
          'school',
          'doctor',
          'physiotherapist',
          'dentist',
          'accounting',
          'insurance_agency',
          'travel_agency'
        ];

        // Specific keywords to exclude hotels, resorts and commercial plazas from Google results
        const excludedKeywords = [
          'hotel', 'resort', 'motel', 'lodge', 'inn', 'stay', 'suites', 'guesthouse', 'pg', 'hostel',
          'office', 'corporate', 'commercial', 'mall', 'tech park', 'business', 'plaza', 'showroom', 
          'complex', 'hospital', 'clinic', 'restaurant', 'cafe', 'bank', 'atm', 'school', 'college'
        ];

        googleResults = results
          .filter((place: any) => {
            const nameLower = place.name.toLowerCase();

            // Exclude hotels/commercial keywords
            if (isResidentialSearch && excludedKeywords.some((keyword) => nameLower.includes(keyword))) {
              const hasPreserveKeyword = nameLower.includes('apartment') || nameLower.includes('residency') || nameLower.includes('homes');
              if (!hasPreserveKeyword) {
                return false;
              }
            }

            // Exclude by types
            if (isResidentialSearch && place.types && place.types.some((t: string) => excludedTypes.includes(t))) {
              const hasResidentialKeyword = 
                nameLower.includes('apartment') || 
                nameLower.includes('residency') || 
                nameLower.includes('homes') || 
                nameLower.includes('villas') || 
                nameLower.includes('heights') || 
                nameLower.includes('enclave') || 
                nameLower.includes('gardens') || 
                nameLower.includes('flats') || 
                nameLower.includes('township') || 
                nameLower.includes('society') ||
                nameLower.includes('project');
              
              if (!hasResidentialKeyword) {
                return false; // Filter out company/office
              }
            }
            return true;
          })
          .map((place: any) => {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            const distance = getDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
            
            return {
              id: place.place_id,
              place_id: place.place_id,
              name: place.name,
              address: place.formatted_address || place.vicinity,
              lat,
              lng,
              distance,
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
              photoUrl: place.photos && place.photos.length > 0 
                ? place.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })
                : null,
            };
          });
      }

      // Combine local DB verified results and Google Places results
      const combined = [...localDbResults];
      
      googleResults.forEach((g) => {
        // If a property in the local DB is already close to this Google Places result, prefer local DB
        const isDuplicate = localDbResults.some((l) => getDistanceKm(l.lat, l.lng, g.lat, g.lng) < 0.05); // within 50 meters
        if (!isDuplicate) {
          combined.push(g);
        }
      });

      // Sort by distance (ascending)
      combined.sort((a: any, b: any) => a.distance - b.distance);

      setNearbySearchResults(combined);
      setNearbySearchPinPopupOpen(false);
      setNearbySearchPopupOpen(true);

      // Adjust map bounds to include all search results and the seed location
      if (combined.length > 0) {
        const lats = [userLocation.lat, ...combined.map((p: any) => p.lat)];
        const lngs = [userLocation.lng, ...combined.map((p: any) => p.lng)];
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        setMapBounds([
          [minLat - 0.01, minLng - 0.01],
          [maxLat + 0.01, maxLng + 0.01]
        ]);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      {/* 1. SEARCH MODAL POPUP (Triggered by pin double-click/long-press) */}
      {nearbySearchPinPopupOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div 
            ref={modalRef}
            className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300 relative overflow-hidden"
          >
            {/* Background design elements */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/5 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl" />

            <div className="flex justify-between items-start mb-6 relative">
              <div>
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">
                  Nearby Finder
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-3">
                  Find Properties Near {userLocation.displayName.split(',')[0]}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Searching Google Places around your desired location coordinates
                </p>
              </div>
              <button
                onClick={() => setNearbySearchPinPopupOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Search Query Input */}
              <div className="relative col-span-3 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Search Query
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Search e.g. underconstruction or uc..."
                    className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-xs"
                    disabled={loading}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>

              {/* Radius Input */}
              <div className="relative col-span-1 group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                  Radius (km)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={localRadius}
                  onChange={(e) => setLocalRadius(Math.max(1, parseInt(e.target.value) || 1))}
                  onKeyDown={handleKeyPress}
                  placeholder="5"
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-3 font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-xs"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNearbySearchPinPopupOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSearch}
                disabled={loading || !localQuery.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-200 flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Search Places
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESULTS LIST POPUP (Centered Modal Dialog) */}
      {nearbySearchPopupOpen && nearbySearchResults.length > 0 && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-slate-100 flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex flex-col gap-4 bg-slate-50/50 rounded-t-[32px]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800">
                    Nearby Properties
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                    Sorted by distance • {nearbySearchResults.length} properties found
                  </p>
                </div>
                <button
                  onClick={() => setNearbySearchPopupOpen(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Dynamic In-Modal Search controls */}
              <div className="grid grid-cols-4 gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm items-center">
                {/* Query Input */}
                <div className="relative col-span-3">
                  <input
                    type="text"
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Search e.g. underconstruction..."
                    className="w-full h-9 pl-8 pr-2 bg-transparent text-slate-850 text-xs font-bold focus:outline-none placeholder:text-slate-400 border-none outline-none"
                    disabled={loading}
                  />
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                </div>

                {/* Radius Input */}
                <div className="relative col-span-1 flex items-center gap-1.5 border-l border-slate-150 pl-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                    KM
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={localRadius}
                    onChange={(e) => setLocalRadius(Math.max(1, parseInt(e.target.value) || 1))}
                    onKeyDown={handleKeyPress}
                    placeholder="5"
                    className="w-full h-9 bg-transparent font-bold text-slate-800 text-xs focus:outline-none border-none outline-none text-center"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {nearbySearchResults.map((item) => {
                const isSelected = selectedNearbyProperty?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.isLocalDb) {
                        handlePinClick(item.id);
                      } else {
                        setSelectedNearbyProperty(item);
                      }
                      setNearbySearchPopupOpen(false); // Close list to view details
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-md shadow-blue-50'
                        : 'bg-white hover:bg-slate-50/80 border-slate-100 hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-col gap-1 flex-1">
                        {item.isLocalDb && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full w-max uppercase tracking-wider">
                            Verified Project ({item.projectstatus === 'UnderConstruction' ? 'Under Development' : 'New Launch'})
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {item.name}
                        </h4>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0 mt-0.5">
                        {formatDistanceKm(item.distance)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.address}
                    </p>

                    {item.isLocalDb && item.possession_date && (
                      <div className="text-[10px] text-slate-500 font-bold bg-amber-50/50 border border-amber-100/80 px-2.5 py-1 rounded-lg w-max mt-1">
                        Possession: <span className="text-amber-700 font-extrabold">{item.possession_date}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-50">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-bold text-slate-600">
                          {item.rating > 0 ? item.rating.toFixed(1) : 'No reviews'}
                        </span>
                        {item.user_ratings_total > 0 && (
                          <span className="text-[9px] text-slate-400">
                            ({item.user_ratings_total})
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] font-bold text-blue-600 group-hover:underline flex items-center gap-0.5">
                        View Details &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
