'use client'

import React, { useMemo } from 'react'
// Add Home, MapPin to imports
import { MessageCircle, Calendar, Share2, Copy, Home, MapPin } from 'lucide-react'
import { useDashboard, Property } from './page'
import styles from './Dashboard.module.css'

export default function DetailContainer() {
  const { selectedId, displayedProperties, properties, setHoveredRecId, setSelectedId } = useDashboard()
  
  const selectedProp = useMemo(() => 
    properties.find(p => p.id === selectedId), 
    [selectedId, properties]
  )

  // Smart Recommendation Algorithm
  const similarProperties = useMemo(() => {
    if (!selectedProp) return []
    return properties
      .filter(p => p.id !== selectedProp.id)
      .map(p => {
        let score = 0
        const reasons: string[] = []
        
        // 1. Price Similarity (30pts)
        const priceDiff = Math.abs(p.price_value - selectedProp.price_value)
        if ((priceDiff / selectedProp.price_value) < 0.15) {
          score += 30
          reasons.push('Similar Budget')
        }

        // 2. Zone Match (20pts)
        if (p.zone === selectedProp.zone) {
          score += 20
          reasons.push('Same Zone')
        }

        // 3. Config Match (30pts)
        if (p.configurations === selectedProp.configurations) {
          score += 30
          reasons.push('Same Config')
        }

        return { ...p, score, reasons }
      })
      .filter(p => p.score >= 40) // Minimum threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Top 3 only
  }, [selectedProp, properties])

  const copyToWhatsApp = () => {
    if (!selectedProp) return
    const text = `*Project:* ${selectedProp.name}\n*Location:* ${selectedProp.location_area}\n*Price:* ${selectedProp.price_display}\n*Configs:* ${selectedProp.configurations}\n*Status:* ${selectedProp.status}\n\nBook site visit?`
    navigator.clipboard.writeText(text)
    alert('✅ Summary copied to clipboard!')
  }

  if (!selectedProp) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
        <Home className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm font-medium">Select a property to view details</p>
      </div>
    )
  }

  return (
    <div className={styles.detailContainer}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
               <span className="text-[10px] font-bold tracking-wider text-blue-600 uppercase mb-1 block">
                 {selectedProp.zone} Zone
               </span>
               <h1 className="text-2xl font-bold text-slate-900 leading-tight mb-2">
                 {selectedProp.name}
               </h1>
               <p className="text-slate-500 text-sm flex items-center gap-1">
                 <MapPin className="w-4 h-4" /> {selectedProp.location_area}
               </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button 
            onClick={copyToWhatsApp}
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm shadow-emerald-200 shadow-lg transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm shadow-blue-200 shadow-lg transition-all active:scale-95">
            <Calendar className="w-4 h-4" />
            Book Visit
          </button>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Price</p>
            <p className="text-lg font-bold text-slate-900">{selectedProp.price_display}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Configuration</p>
            <p className="text-lg font-bold text-slate-900">{selectedProp.configurations}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
            <p className={`text-lg font-bold ${selectedProp.status === 'Ready' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {selectedProp.status === 'Ready' ? 'Ready' : 'Under Const.'}
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Possession</p>
            <p className="text-lg font-bold text-slate-900">{selectedProp.completion_duration || 'N/A'}</p>
          </div>
        </div>

        {/* Smart Suggestions */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Smart Alternatives
          </h3>
          
          <div className="space-y-3">
            {similarProperties.map(sim => (
              <div 
                key={sim.id}
                onClick={() => setSelectedId(sim.id)}
                onMouseEnter={() => setHoveredRecId(sim.id)}
                onMouseLeave={() => setHoveredRecId(null)}
                className="group border border-slate-200 rounded-xl p-3 hover:border-blue-400 cursor-pointer transition-all bg-white hover:shadow-md"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-sm">{sim.name}</span>
                  <span className="text-blue-600 font-bold text-xs">{sim.price_display}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sim.reasons.map(r => (
                    <span key={r} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium border border-emerald-100">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
