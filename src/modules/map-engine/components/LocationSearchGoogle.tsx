'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';

interface LocationSearchGoogleProps {
  onLocationSelect: (lat: number, lng: number, label: string) => void;
  className?: string;
}

// Global script loading state
let googleMapsScriptLoaded = false;
let googleMapsScriptLoading = false;
const scriptLoadCallbacks = new Set<() => void>();

function loadGoogleMapsScript(apiKey: string, callback: () => void) {
  if (googleMapsScriptLoaded) {
    callback();
    return;
  }
  scriptLoadCallbacks.add(callback);
  if (googleMapsScriptLoading) return;

  googleMapsScriptLoading = true;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    googleMapsScriptLoaded = true;
    googleMapsScriptLoading = false;
    scriptLoadCallbacks.forEach((cb) => cb());
    scriptLoadCallbacks.clear();
  };
  script.onerror = () => {
    googleMapsScriptLoading = false;
    console.error('Failed to load Google Maps API script.');
  };
  document.head.appendChild(script);
}

export default function LocationSearchGoogle({ onLocationSelect, className = '' }: LocationSearchGoogleProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(googleMapsScriptLoaded);

  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dynamically load Google Maps script
  useEffect(() => {
    if (!apiKey) return;
    loadGoogleMapsScript(apiKey, () => {
      setIsScriptLoaded(true);
      const win = window as any;
      if (typeof window !== 'undefined' && win.google) {
        autocompleteServiceRef.current = new win.google.maps.places.AutocompleteService();
        // PlaceService requires an HTML Element to initialize
        placesServiceRef.current = new win.google.maps.places.PlacesService(document.createElement('div'));
      }
    });
  }, [apiKey]);

  // Handle autocomplete predictions fetch
  useEffect(() => {
    if (!isScriptLoaded || !autocompleteServiceRef.current || query.length < 3 || query === 'Current Location') {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' },
        },
        (results: any, status: any) => {
          setLoading(false);
          if (status === 'OK' && results) {
            setPredictions(results);
            setIsOpen(true);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        }
      );
    }, 300);
  }, [query, isScriptLoaded]);

  // Handle suggestion selection and geocoding
  const handleSelect = (prediction: any) => {
    if (!placesServiceRef.current) return;

    setLoading(true);
    placesServiceRef.current.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address', 'name'],
      },
      (place: any, status: any) => {
        setLoading(false);
        if (status === 'OK' && place && place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const label = place.formatted_address || place.name || prediction.description;

          setQuery(label);
          onLocationSelect(lat, lng, label);
          setIsOpen(false);
        } else {
          console.error('Failed to get place details:', status);
        }
      }
    );
  };

  const clearSearch = () => {
    setQuery('');
    setPredictions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={`relative w-full z-[1001] ${className}`}>
      <div className="relative group w-full">
        <input
          type="text"
          placeholder="Search locations via Google..."
          className="w-full pl-9 pr-8 py-2.5 rounded-lg shadow-md border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-slate-800 text-sm font-medium transition-all outline-none bg-white/95 backdrop-blur-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
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

      {/* Suggestion Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
              onClick={() => handleSelect(prediction)}
              type="button"
            >
              <div className="mt-0.5 p-1.5 bg-slate-100 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {prediction.structured_formatting.main_text}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {prediction.structured_formatting.secondary_text || prediction.description}
                </p>
              </div>
            </button>
          ))}
          <div className="px-3 py-1 bg-slate-50 text-[10px] text-slate-400 text-right">
            via Google Places
          </div>
        </div>
      )}
    </div>
  );
}
