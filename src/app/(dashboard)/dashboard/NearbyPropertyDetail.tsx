'use client';

import React from 'react';
import { X, MapPin, Star, ExternalLink, Navigation } from 'lucide-react';
import { useDashboard } from './page';
import { formatDistanceKm } from '@/lib/geo';
import Image from 'next/image';

export default function NearbyPropertyDetail() {
  const { selectedNearbyProperty, setSelectedNearbyProperty } = useDashboard();

  if (!selectedNearbyProperty) return null;

  const { name, address, rating, user_ratings_total, distance, lat, lng, photoUrl } = selectedNearbyProperty;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${selectedNearbyProperty.place_id}`;

  return (
    <div className="fixed bottom-4 left-4 z-[1000] w-96 bg-white/95 backdrop-blur-md rounded-[32px] shadow-2xl border border-slate-200/80 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
      {/* Property Photo */}
      {photoUrl ? (
        <div className="relative w-full h-48 bg-slate-100 overflow-hidden">
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <button
            onClick={() => setSelectedNearbyProperty(null)}
            className="absolute top-4 right-4 p-2 bg-slate-900/60 hover:bg-slate-900/80 rounded-full text-white transition-colors"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
            {formatDistanceKm(distance)} away
          </div>
        </div>
      ) : (
        <div className="p-6 pb-2 flex justify-between items-start">
          <div className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
            {formatDistanceKm(distance)} away
          </div>
          <button
            onClick={() => setSelectedNearbyProperty(null)}
            className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors bg-slate-50"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug mb-2">
          {name}
        </h3>

        <div className="flex items-center gap-1.5 mb-4">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold text-slate-700">
            {rating > 0 ? rating.toFixed(1) : 'No reviews'}
          </span>
          {user_ratings_total > 0 && (
            <span className="text-xs text-slate-400">
              ({user_ratings_total} Google reviews)
            </span>
          )}
        </div>

        <div className="flex gap-2 items-start text-xs text-slate-500 mb-6 leading-relaxed">
          <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <span>{address}</span>
        </div>

        <div className="flex gap-3">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
          >
            <Navigation size={14} />
            Directions
          </a>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(name + ' ' + address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-12 w-12 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl transition-all flex items-center justify-center"
            title="Google Search Property"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
