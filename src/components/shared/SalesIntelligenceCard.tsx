import React from 'react';
import { Target, Lightbulb, MessageCircle, AlertTriangle } from 'lucide-react';

interface SalesIntelligenceCardProps {
  analysisJson?: string; // We pass the raw JSON string from the adapter
}

export default function SalesIntelligenceCard({ analysisJson }: SalesIntelligenceCardProps) {
  if (!analysisJson) return null;

  let data;
  try {
    data = JSON.parse(analysisJson);
  } catch (e) {
    return null; // Fail silently if JSON is bad
  }

  // If data exists but is empty
  if (!data.target_customer_profile && !data.closing_pitch) return null;

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-4 mb-6">
      <h3 className="font-bold text-indigo-900 flex items-center gap-2 border-b border-indigo-200 pb-2">
        <Lightbulb size={18} className="text-amber-500" />
        Sales Intelligence
      </h3>

      {/* 1. Whom to Target */}
      {data.target_customer_profile && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wide">
            <Target size={14} /> Whom to Target
          </div>
          <p className="text-sm text-indigo-900 leading-relaxed font-medium">
            {data.target_customer_profile}
          </p>
        </div>
      )}

      {/* 2. The Pitch (Benefits) */}
      {data.closing_pitch && (
        <div className="space-y-1 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 uppercase tracking-wide">
            <MessageCircle size={14} /> The Pitch
          </div>
          <p className="text-sm text-slate-700 leading-relaxed italic">
            "{data.closing_pitch}"
          </p>
        </div>
      )}

      {/* 3. Objection Handling (Visitor Notes) */}
      {data.objection_handling && (
        <div className="space-y-1 pt-2 bg-white/60 p-3 rounded-lg border border-indigo-100/50">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wide">
            <AlertTriangle size={14} /> Objection Killer
          </div>
          <p className="text-xs text-slate-600">
            {data.objection_handling}
          </p>
        </div>
      )}
    </div>
  );
}
