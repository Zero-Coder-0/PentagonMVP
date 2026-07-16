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
  } = useDashboard();

  const [localQuery, setLocalQuery] = useState(nearbySearchQuery);
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
      radius: 5000, // 5km radius
      query: `${searchQuery} near ${userLocation.displayName}`,
    };

    service.textSearch(request, (results: any, status: any) => {
      setLoading(false);
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

        const processed = results
          .filter((place: any) => {
            if (isResidentialSearch && place.types && place.types.some((t: string) => excludedTypes.includes(t))) {
              // Keep only if name contains residential keywords
              const nameLower = place.name.toLowerCase();
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

        // Sort by distance (ascending)
        processed.sort((a: any, b: any) => a.distance - b.distance);

        setNearbySearchResults(processed);
        setNearbySearchPinPopupOpen(false);
        setNearbySearchPopupOpen(true);

        // Adjust map bounds to include all search results and the seed location
        if (processed.length > 0) {
          const lats = [userLocation.lat, ...processed.map((p: any) => p.lat)];
          const lngs = [userLocation.lng, ...processed.map((p: any) => p.lng)];
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          
          setMapBounds([
            [minLat - 0.01, minLng - 0.01],
            [maxLat + 0.01, maxLng + 0.01]
          ]);
        }
      } else {
        alert(`Google Places search did not find any results: ${status}`);
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

            <div className="relative mb-6">
              <input
                type="text"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Search e.g. underconstruction or uc..."
                className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-16 font-bold text-slate-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                disabled={loading}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              
              <button
                onClick={handleSearch}
                disabled={loading || !localQuery.trim()}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              </button>
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
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[32px]">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  Nearby: &quot;{nearbySearchQuery}&quot;
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Sorted by distance • {nearbySearchResults.length} properties
                </p>
              </div>
              <button
                onClick={() => setNearbySearchPopupOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {nearbySearchResults.map((item) => {
                const isSelected = selectedNearbyProperty?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedNearbyProperty(item);
                      setNearbySearchPopupOpen(false); // Close list to view details
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 shadow-md shadow-blue-50'
                        : 'bg-white hover:bg-slate-50/80 border-slate-100 hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 flex-1">
                        {item.name}
                      </h4>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                        {formatDistanceKm(item.distance)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.address}
                    </p>

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
