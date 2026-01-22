'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, label: string) => void;
}

export default function LocationSearch({ onLocationSelect }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setIsOpen(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 600);
  }, [query]);

  return (
    <div className="relative w-full max-w-md z-[1001]">
      <div className="relative">
        <input
          type="text"
          placeholder="Search location (e.g. Whitefield, Indiranagar)..."
          className="w-full pl-10 pr-4 py-3 rounded-xl shadow-lg border-0 ring-1 ring-slate-100 focus:ring-2 focus:ring-indigo-500 text-slate-800 text-sm font-medium transition-shadow"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
        {loading && <div className="absolute right-3.5 top-3.5"><Loader2 className="w-5 h-5 text-indigo-600 animate-spin" /></div>}
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
          {results.map((item) => (
            <button
              key={item.place_id}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
              onClick={() => {
                onLocationSelect(parseFloat(item.lat), parseFloat(item.lon), item.display_name.split(',')[0]);
                setQuery(item.display_name.split(',')[0]);
                setIsOpen(false);
              }}
            >
              <div className="mt-0.5 p-1.5 bg-slate-100 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"><MapPin className="w-3.5 h-3.5" /></div>
              <div>
                <p className="text-sm font-medium text-slate-800 line-clamp-1">{item.display_name.split(',')[0]}</p>
                <p className="text-xs text-slate-500 line-clamp-1 opacity-70">{item.display_name}</p>
              </div>
            </button>
          ))}
          <div className="px-3 py-1 bg-slate-50 text-[10px] text-slate-400 text-right">via OpenStreetMap</div>
        </div>
      )}
    </div>
  );
}
