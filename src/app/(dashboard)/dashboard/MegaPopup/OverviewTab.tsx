'use client';

import { CheckCircle2, AlertCircle, Star, ExternalLink } from 'lucide-react';
import type { ProjectFullV7, ProjectV7 } from '@/modules/inventory/types-v7';

interface Props {
  property: ProjectFullV7;
}

export function OverviewTab({ property }: Props) {
  // analysis and developer properties are now flattened on the `property` object

  return (
    <div className="space-y-6">
      {/* USP Section */}
      {property.usp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 font-bold mb-1 flex items-center gap-2">
            <Star className="text-blue-600" size={16} /> Unique Selling Proposition
          </h3>
          <p className="text-blue-800 text-sm">{property.usp}</p>
        </div>
      )}

      {/* Core Project Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Project Theme</p>
          <p className="font-bold text-slate-800">{property.project_theme || 'Standard'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Land Area</p>
          <p className="font-bold text-slate-800">{property.total_land_area || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Phases</p>
          <p className="font-bold text-slate-800">{property.total_phases || 1}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase">Selling Phase</p>
          <p className="font-bold text-slate-800">{property.current_phase_under_sale || 'Phase 1'}</p>
        </div>
      </div>

      {/* Developer Spotlight */}
      {property.developer_name && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-4 mb-3">
            {property.developer_logo_url && (
              <img src={property.developer_logo_url} alt={property.developer_name} className="w-12 h-12 object-contain rounded-md bg-white border border-slate-200 p-1" />
            )}
            <div>
              <h4 className="font-bold text-slate-800 text-lg">{property.developer_name}</h4>
              <div className="mt-1">
                {property.developer_website ? (
                  <a 
                    href={property.developer_website} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-colors border border-blue-100"
                  >
                    VISIT WEBSITE <ExternalLink size={10} />
                  </a>
                ) : (
                  <p className="text-xs text-slate-500 italic">Reputed Developer</p>
                )}
              </div>
            </div>
          </div>
          {property.developer_description && (
            <p className="text-sm text-slate-600 mb-4 bg-white p-3 rounded border border-slate-100 italic">"{property.developer_description}"</p>
          )}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-3 border-t border-slate-200 pt-3">
            <div>
              <p className="text-slate-500 text-xs">Years in Market</p>
              <p className="font-medium text-slate-800">{property.developer_years_in_market ? `${property.developer_years_in_market} Years` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Past Projects</p>
              <p className="font-medium text-slate-800">{property.developer_past_projects || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Reputation</p>
              <p className="font-medium text-slate-800">{property.developer_reputation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Financial Strength</p>
              <p className="font-medium text-slate-800">{property.developer_financial_strength || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pros & Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pros */}
        <div className="bg-green-50/50 border border-green-100 rounded-lg p-4">
          <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
            <CheckCircle2 size={16} /> Strengths
          </h4>
          <ul className="space-y-2">
            {property.pros?.map((pro, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-green-600">•</span> {pro}
              </li>
            )) || <p className="text-slate-400 text-sm italic">No data available</p>}
          </ul>
        </div>

        {/* Cons */}
        <div className="bg-red-50/50 border border-red-100 rounded-lg p-4">
          <h4 className="font-bold text-red-800 mb-3 flex items-center gap-2">
            <AlertCircle size={16} /> Drawbacks
          </h4>
          <ul className="space-y-2">
            {property.cons?.map((con, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-red-500">•</span> {con}
              </li>
            )) || <p className="text-slate-400 text-sm italic">No data available</p>}
          </ul>
        </div>
      </div>

      {/* Closing Pitch */}
      {property.closing_pitch && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-bold text-slate-700 mb-2">Sales Pitch</h4>
          <p className="text-sm text-slate-600 italic">"{property.closing_pitch}"</p>
        </div>
      )}

      {/* Target Audience & Rating */}
      {(property.target_customer || property.overall_rating) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {property.target_customer && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <h4 className="font-bold text-indigo-800 text-sm mb-1 uppercase tracking-wider">Target Audience</h4>
              <p className="text-indigo-900 text-sm">{property.target_customer}</p>
            </div>
          )}
          {property.overall_rating && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-amber-800 text-sm mb-1 uppercase tracking-wider">Overall Rating</h4>
                <p className="text-amber-900 text-sm">Our expert assessment</p>
              </div>
              <div className="text-3xl font-black text-amber-600 flex items-center gap-1">
                {property.overall_rating} <Star className="fill-amber-500 text-amber-500" size={24} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Risk Factors & Objections */}
      {(property.legal_notes || property.timeline_risk || property.objection_handling) && (
        <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 space-y-4">
          <h4 className="font-bold text-rose-800 flex items-center gap-2">
            <AlertCircle size={16} /> Risks & Considerations
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {property.timeline_risk && (
              <div>
                <p className="text-xs font-bold text-rose-700 uppercase mb-1">Timeline Risk</p>
                <p className="text-sm text-rose-900 bg-white p-2 border border-rose-200 rounded">{property.timeline_risk}</p>
              </div>
            )}
            {property.legal_notes && (
              <div>
                <p className="text-xs font-bold text-rose-700 uppercase mb-1">Legal & Title Notes</p>
                <p className="text-sm text-rose-900 bg-white p-2 border border-rose-200 rounded">{property.legal_notes}</p>
              </div>
            )}
          </div>

          {property.objection_handling && (
            <div className="mt-2">
              <p className="text-xs font-bold text-rose-700 uppercase mb-1">Objection Handling</p>
              <div className="text-sm text-rose-900 bg-white p-3 border border-rose-200 rounded italic">
                {typeof property.objection_handling === 'string' ? (
                  `"${property.objection_handling}"`
                ) : (
                  <div className="space-y-2 not-italic">
                    {Object.entries(property.objection_handling).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-bold shrink-0">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
