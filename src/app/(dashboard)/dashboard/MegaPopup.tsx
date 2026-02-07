'use client'

import React from 'react';
import { useDashboard } from './page';
import { X, MapPin, FileText, MessageCircle, CalendarCheck, Star, Users, Building2, Home, TrendingUp, Target } from 'lucide-react';

export default function MegaPopup() {
  const { hoveredRecId, displayedProperties, setHoveredRecId, cancelHoverLeave, properties } = useDashboard();
  
  if (!hoveredRecId) return null;
  
  const property = displayedProperties.find(p => p.id === hoveredRecId);
  if (!property) return null;

  let analysis, costExtras, analysisString;
  try {
    const salesAnalysisData = property.specs?.sales_analysis;
    analysisString = typeof salesAnalysisData === 'string' ? salesAnalysisData : JSON.stringify(salesAnalysisData);
    analysis = salesAnalysisData ? JSON.parse(analysisString) : null;
    
    const costExtrasData = property.specs?.cost_extras;
    const costExtrasString = typeof costExtrasData === 'string' ? costExtrasData : JSON.stringify(costExtrasData);
    costExtras = costExtrasData ? JSON.parse(costExtrasString) : [];
  } catch (e) {
    analysis = null;
    costExtras = [];
    analysisString = undefined;
  }

  // Smart Alternatives: Find similar properties in same zone
  const alternatives = properties
    .filter(p => 
      p.id !== property.id && 
      p.zone === property.zone &&
      p.configurations?.some(config => property.configurations?.includes(config))
    )
    .slice(0, 3);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 z-[998] animate-in fade-in duration-200"
        onClick={() => setHoveredRecId(null)}
      />
      
      {/* Wide 2-Column Popup from LEFT */}
      <div 
        className="absolute left-4 top-4 bottom-4 w-[850px] bg-white rounded-2xl shadow-2xl z-[999] flex flex-col overflow-hidden animate-in slide-in-from-left duration-300 border border-slate-200"
        onMouseEnter={cancelHoverLeave}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex-shrink-0 flex justify-between items-start p-4 border-b border-slate-200 bg-white">
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2">
               <h2 className="text-lg font-bold text-slate-900 truncate">{property.name}</h2>
               <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                 property.status === 'Ready' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-amber-100 text-amber-700 border border-amber-300'
               }`}>
                 {property.status}
               </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
              <MapPin size={11} />
              <span className="truncate">{property.location_area}, {property.zone} Zone</span>
            </div>
            <div className="text-xs text-slate-500 mt-0.5">by {property.developer}</div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
               <div className="text-xl font-bold text-green-700">{property.price_display}</div>
               <div className="text-xs text-slate-500">Base Price</div>
            </div>
            <button 
              onClick={() => setHoveredRecId(null)}
              className="p-1.5 hover:bg-slate-100 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2-Column Body */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            
            {/* ========== LEFT COLUMN: Property Details (55%) ========== */}
            <div className="w-[55%] overflow-y-auto p-4 space-y-3 border-r border-slate-200 bg-slate-50">
              
              {/* 1. RERA ID */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <div className="text-xs text-slate-600 font-semibold mb-1">RERA ID</div>
                <div className="font-mono text-xs font-bold text-slate-900 break-all">{property.rera_id || 'Not Available'}</div>
              </div>

              {/* 2. Type of Development */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="text-xs text-blue-700 font-semibold mb-1">Type of Development</div>
                <div className="font-bold text-sm text-blue-900">{property.specs?.['Type of Development'] || property.property_type || 'Residential Apartments'}</div>
              </div>

              {/* 3. Configuration Table */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
                  <Building2 size={14} className="text-slate-600" /> Configuration
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="p-2 text-left font-bold border border-slate-200 text-slate-700">BHK</th>
                        <th className="p-2 text-left font-bold border border-slate-200 text-slate-700">WC</th>
                        <th className="p-2 text-left font-bold border border-slate-200 text-slate-700">BL</th>
                        <th className="p-2 text-left font-bold border border-slate-200 text-slate-700">SBA</th>
                        <th className="p-2 text-left font-bold border border-slate-200 text-slate-700">Facing</th>
                        <th className="p-2 text-left font-bold border border-slate-200 text-slate-700">UDS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {property.configurations?.map((config, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-semibold border border-slate-200">{config}</td>
                          <td className="p-2 border border-slate-200">{property.specs?.['WC'] || '2'}</td>
                          <td className="p-2 border border-slate-200">{property.specs?.['Balconies'] || '2'}</td>
                          <td className="p-2 border border-slate-200 font-medium">{property.sq_ft_range}</td>
                          <td className="p-2 border border-slate-200">{property.facing_direction || 'East, West'}</td>
                          <td className="p-2 border border-slate-200">{property.specs?.['UDS'] || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Maintenance & Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                  <div className="text-xs text-purple-700 font-semibold mb-1">Maintenance (per sq ft)</div>
                  <div className="font-bold text-sm text-purple-900">{property.specs?.Maintenance || 'Rs 3.5/sqft'}</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                  <div className="text-xs text-green-700 font-semibold mb-1">Price per sqft</div>
                  <div className="font-bold text-sm text-green-900">₹{property.price_per_sqft || 'N/A'}</div>
                </div>
              </div>

              {/* 5. Onwards Pricing */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                <div className="text-xs text-green-700 font-bold mb-1">Onwards Pricing</div>
                <div className="text-lg font-bold text-green-900">{property.price_display}</div>
                <div className="text-xs text-green-700 mt-1">Starting price for {property.configurations?.[0]}</div>
              </div>

              {/* 6. Society Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-xs text-amber-700 font-semibold mb-1">Land Parcel</div>
                  <div className="font-bold text-sm text-amber-900">{property.specs?.['Total Land Area'] || 'N/A'}</div>
                </div>
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                  <div className="text-xs text-indigo-700 font-semibold mb-1">Total Units</div>
                  <div className="font-bold text-sm text-indigo-900">{property.specs?.['Total Units'] || '558'}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="text-xs text-slate-600 font-semibold mb-1">Structure</div>
                  <div className="font-bold text-sm text-slate-900">{property.floor_levels || 'G+18'}</div>
                </div>
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                  <div className="text-xs text-teal-700 font-semibold mb-1">Clubhouse</div>
                  <div className="font-bold text-sm text-teal-900">{property.specs?.['Clubhouse Size'] || '17,760 Sq.Ft'}</div>
                </div>
              </div>

              {/* 7. Society Highlights */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-2">Society Highlights</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2 flex justify-between border border-slate-200">
                    <span className="text-slate-600 font-medium">Builder Grade:</span>
                    <span className="font-bold text-slate-900">{property.specs?.['Builder Grade'] || 'Premium'}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 flex justify-between border border-slate-200">
                    <span className="text-slate-600 font-medium">Open Space:</span>
                    <span className="font-bold text-slate-900">{property.specs?.['Open Space %'] || '76%'}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2 flex justify-between col-span-2 border border-slate-200">
                    <span className="text-slate-600 font-medium">Construction:</span>
                    <span className="font-bold text-slate-900">{property.specs?.['Construction Type'] || 'RCC Framed'}</span>
                  </div>
                </div>
              </div>

              {/* 8. Location Advantages */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <h3 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-600" /> Location Advantages
                </h3>
                <div className="space-y-2 text-xs">
                  {property.social_infra && Object.keys(property.social_infra).length > 0 ? (
                    Object.entries(property.social_infra).map(([key, value], idx) => (
                      <div key={key} className="flex items-start gap-2 bg-slate-50 rounded-lg p-2 border border-slate-200">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <span className="text-slate-700 font-semibold capitalize">{key}:</span>
                          <span className="ml-1 text-slate-900">{value as string}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-center py-2">No location data available</div>
                  )}
                </div>
              </div>

            </div>

            {/* ========== RIGHT COLUMN: Actions & Intelligence (45%) ========== */}
            <div className="w-[45%] overflow-y-auto bg-white p-4 space-y-3">
              
              {/* Action Buttons */}
              <div className="space-y-2">
                 <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition border border-green-700">
                   <MessageCircle size={18} /> WhatsApp
                 </button>
                 <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition border border-blue-700">
                   <CalendarCheck size={18} /> Book Visit
                 </button>
              </div>

              {/* Visitor Notes (Sales Intelligence) */}
              {analysis && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 shadow-sm">
                  <h3 className="font-bold text-sm text-amber-900 mb-3 flex items-center gap-1.5">
                    <Users size={14} /> Visitor Notes
                  </h3>
                  <div className="space-y-2 text-xs">
                    
                    {/* Target Customer */}
                    {analysis.whom_to_target && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-lg">🎯</span>
                          <span className="font-bold text-amber-800">Target Customer</span>
                        </div>
                        <p className="text-amber-900 leading-relaxed">{analysis.whom_to_target}</p>
                      </div>
                    )}

                    {/* Pitch Angle */}
                    {analysis.pitch_angle && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-lg">💬</span>
                          <span className="font-bold text-amber-800">Pitch Angle</span>
                        </div>
                        <p className="text-amber-900 leading-relaxed">{analysis.pitch_angle}</p>
                      </div>
                    )}

                    {/* USP */}
                    {analysis.usp && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-lg">⭐</span>
                          <span className="font-bold text-amber-800">Unique Selling Points</span>
                        </div>
                        <p className="text-amber-900 leading-relaxed">{analysis.usp}</p>
                      </div>
                    )}

                    {/* Objection Handling */}
                    {analysis.objection_handling && (
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-lg">🛡️</span>
                          <span className="font-bold text-amber-800">Objection Handling</span>
                        </div>
                        <p className="text-amber-900 leading-relaxed">{analysis.objection_handling}</p>
                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* Elevators */}
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3">
                <div className="text-xs text-cyan-700 font-semibold mb-1">Elevators Per Tower</div>
                <div className="font-bold text-sm text-cyan-900">{property.specs?.['Elevators per Tower'] || '2 Passenger + 1 Service'}</div>
              </div>

              {/* Pricing Section */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 shadow-sm">
                <h3 className="font-bold text-sm text-green-900 mb-2 flex items-center gap-1.5">
                  <FileText size={14} /> Pricing
                </h3>
                <div className="bg-white rounded-lg p-2.5 mb-2 border border-green-200">
                  <div className="text-xs text-green-700 font-semibold mb-1">Base</div>
                  <div className="font-bold text-base text-green-900">{property.price_display}</div>
                  <div className="text-xs text-green-700 mt-0.5">₹{property.price_per_sqft}/sqft</div>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-green-200">
                  <div className="text-xs text-green-700 font-semibold mb-1">Payment Plan</div>
                  <div className="text-xs text-green-900">{property.specs?.['Payment Plan'] || '10-90 Construction Linked'}</div>
                </div>
              </div>

              {/* Floor Plan */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                <h3 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-600" /> Floor Plan
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center hover:bg-slate-100 cursor-pointer transition">
                  {property.media?.floor_plan ? (
                     <img src={property.media.floor_plan} alt="Floor Plan" className="max-h-28 mx-auto rounded" />
                  ) : (
                     <>
                       <FileText size={32} className="text-slate-300 mx-auto mb-2" />
                       <div className="text-xs text-slate-600 font-medium">Request Floor Plans</div>
                     </>
                  )}
                </div>
              </div>

              {/* Smart Alternatives */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 shadow-sm">
                <h3 className="font-bold text-sm text-blue-900 mb-2 flex items-center gap-1.5">
                  <Star size={14} className="text-blue-700" /> Smart Alternatives
                </h3>
                {alternatives.length > 0 ? (
                  <div className="space-y-2">
                    {alternatives.map(alt => (
                      <div 
                        key={alt.id} 
                        onClick={() => setHoveredRecId(alt.id)}
                        className="flex items-center gap-2 p-2 bg-white rounded-lg hover:bg-blue-100 cursor-pointer transition border border-blue-200"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                          {alt.media?.images?.[0] ? (
                            <img src={alt.media.images[0]} alt={alt.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Home size={14} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-slate-900 truncate">{alt.name}</div>
                          <div className="text-xs text-slate-500 truncate">{alt.location_area}</div>
                        </div>
                        <div className="text-xs font-bold text-green-700 flex-shrink-0">{alt.price_display}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-2">Similar properties in zone</p>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}
