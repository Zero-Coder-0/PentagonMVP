'use client'

import React, { useMemo } from 'react'
import { MessageCircle, Calendar, Home, MapPin } from 'lucide-react'
import { useDashboard } from './page'
import styles from './Dashboard.module.css'

// 1. Reusable Card Component to reduce HTML clutter
const StatCard = ({ label, value, valueClass = '' }: { label: string, value: string | number, valueClass?: string }) => (
  <div className={styles.statCard}>
    <p className={styles.statLabel}>{label}</p>
    <p className={valueClass || styles.statValue}>{value}</p>
  </div>
)

export default function DetailContainer() {
  const { selectedId, properties, setHoveredRecId, setSelectedId } = useDashboard()
  
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
        
        // Scoring Logic
        const priceDiff = Math.abs(p.price_value - selectedProp.price_value)
        if ((priceDiff / selectedProp.price_value) < 0.15) { score += 30; reasons.push('Similar Budget') }
        if (p.zone === selectedProp.zone) { score += 20; reasons.push('Same Zone') }
        if (p.configurations === selectedProp.configurations) { score += 30; reasons.push('Same Config') }

        return { ...p, score, reasons }
      })
      .filter(p => p.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
  }, [selectedProp, properties])

  const copyToWhatsApp = () => {
    if (!selectedProp) return
    const text = `*Project:* ${selectedProp.name}\n*Location:* ${selectedProp.location_area}\n*Price:* ${selectedProp.price_display}\n*Configs:* ${selectedProp.configurations}\n*Status:* ${selectedProp.status}\n\nBook site visit?`
    navigator.clipboard.writeText(text)
    alert('✅ Summary copied to clipboard!')
  }

  if (!selectedProp) {
    return (
      <div className={styles.detailEmptyState}>
        <Home className="w-12 h-12 mb-2 opacity-20" />
        <p className="text-sm font-medium">Select a property to view details</p>
      </div>
    )
  }

  // 2. Data Preparation: Define stats here to auto-populate the grid
  const statsList = [
    { label: 'Price', value: selectedProp.price_display },
    { label: 'Configuration', value: selectedProp.configurations },
    { 
      label: 'Status', 
      value: selectedProp.status === 'Ready' ? 'Ready' : 'Under Const.',
      valueClass: `text-lg font-bold ${selectedProp.status === 'Ready' ? styles.statValueReady : styles.statValueConstruction}`
    },
    { label: 'Possession', value: selectedProp.completion_duration || 'N/A' }
  ]

  return (
    <div className={styles.detailContainer}>
      <div className="p-6">
        
        {/* Header */}
        <div className="mb-6">
          <span className={styles.zoneBadge}>{selectedProp.zone} Zone</span>
          <h1 className={styles.propertyMainTitle}>{selectedProp.name}</h1>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {selectedProp.location_area}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button onClick={copyToWhatsApp} className={styles.whatsappBtn}>
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button className={styles.bookVisitBtn}>
            <Calendar className="w-4 h-4" /> Book Visit
          </button>
        </div>

        {/* Key Stats Grid - Refactored to Loop */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {statsList.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
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
                className={styles.suggestionCard}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800 text-sm">{sim.name}</span>
                  <span className="text-blue-600 font-bold text-xs">{sim.price_display}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sim.reasons.map(r => (
                    <span key={r} className={styles.suggestionTag}>{r}</span>
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
