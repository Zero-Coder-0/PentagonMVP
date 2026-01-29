'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X, Crosshair } from 'lucide-react';

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, label: string) => void;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city_district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export default function LocationSearch({ onLocationSelect, className = '' }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [locating, setLocating] = useState(false); // State for geolocation

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Debouncing Logic
  useEffect(() => {
    if (query.length < 3) {
      if (query !== "Current Location") { // Don't clear if it's the GPS label
        setResults([]);
        setIsOpen(false);
      }
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // Skip API search if it's the magic "Current Location" string
    if (query === "Current Location") return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5&addressdetails=1&dedupe=1`
        );
        const data = await res.json();
        setResults(data);
        setIsOpen(true);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (item: NominatimResult) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    
    // Construct a cleaner label
    const mainName = item.address.suburb || item.address.road || item.address.city_district || item.display_name.split(',')[0];
    const subName = item.address.city || item.address.state || '';
    const label = subName ? `${mainName}, ${subName}` : mainName;

    setQuery(label);
    onLocationSelect(lat, lng, label);
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  // --- Handle Current Location ---
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onLocationSelect(latitude, longitude, "Current Location");
        setQuery("Current Location");
        setLocating(false);
        setIsOpen(false);
      },
      (error) => {
        console.error(error);
        alert("Unable to retrieve your location");
        setLocating(false);
      }
    );
  };

  return (
    <div ref={wrapperRef} className={`relative w-full z-[1001] ${className}`}>
      <div className="flex gap-2">
        {/* Main Search Input */}
        <div className="relative group flex-1">
          <input
            type="text"
            placeholder="Search location..."
            className="w-full pl-9 pr-8 py-2.5 rounded-lg shadow-md border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 text-sm font-medium transition-all outline-none bg-white/95 backdrop-blur-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if(results.length > 0) setIsOpen(true); }}
          />
          
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          
          <div className="absolute right-2.5 top-2.5 flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : query.length > 0 ? (
              <button onClick={clearSearch} className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>
        </div>

        {/* Current Location Button */}
        <button
          onClick={handleCurrentLocation}
          className="bg-white/95 backdrop-blur-sm p-2.5 rounded-lg shadow-md border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50"
          title="Use Current Location"
          type="button" 
          disabled={locating}
        >
          {locating ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <Crosshair className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((item) => {
             const mainName = item.address.suburb || item.address.road || item.address.city_district || item.display_name.split(',')[0];
             const context = [item.address.city, item.address.state].filter(Boolean).join(', ');

             return (
              <button
                key={item.place_id}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                onClick={() => handleSelect(item)}
                type="button"
              >
                <div className="mt-0.5 p-1.5 bg-slate-100 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{mainName}</p>
                  <p className="text-xs text-slate-500 truncate">{context || item.display_name}</p>
                </div>
              </button>
            );
          })}
          <div className="px-3 py-1 bg-slate-50 text-[10px] text-slate-400 text-right">
            via OpenStreetMap
          </div>
        </div>
      )}
    </div>
  );
}
