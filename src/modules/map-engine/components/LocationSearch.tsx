'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

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

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // Debounce to 400ms for a "Google-like" snappy feel without spamming API
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Using addressdetails=1 to get cleaner city/state info
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
    
    // Construct a cleaner label (e.g., "Whitefield, Bengaluru")
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

  return (
    <div ref={wrapperRef} className={`relative w-full z-[1001] ${className}`}>
      <div className="relative group">
        <input
          type="text"
          placeholder="Search location (e.g. Indiranagar)"
          className="w-full pl-10 pr-10 py-3 rounded-xl shadow-sm border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 text-sm font-medium transition-all outline-none bg-white/90 backdrop-blur-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if(results.length > 0) setIsOpen(true); }}
        />
        
        {/* Search Icon */}
        <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        
        {/* Right Actions: Loader or Clear Button */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          {loading ? (
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
          ) : query.length > 0 ? (
            <button onClick={clearSearch} className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.map((item) => {
             // Formatting the display text to look like Google (Bold main name, lighter subtext)
             const mainName = item.address.suburb || item.address.road || item.address.city_district || item.display_name.split(',')[0];
             const context = [item.address.city, item.address.state].filter(Boolean).join(', ');

             return (
              <button
                key={item.place_id}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
                onClick={() => handleSelect(item)}
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
