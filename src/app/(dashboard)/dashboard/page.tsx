// FIXED page.tsx - All TypeScript/Build errors resolved
'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/core/db/client'  // ✅ FIXED: Use server client for browser
import styles from './Dashboard.module.css'
import MapContainer from './MapContainer'
import PropertyListContainer from './PropertyListContainer'
import DetailContainer from './DetailContainer'
import MegaPopup from './MegaPopup'

interface DashboardProps {
  properties: any[]
  selectedId: string | null
  hoveredId: string | null
  filters?: any
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
  onFiltersChange?: (filters: any) => void
}

export default function DashboardPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<any>({})

  useEffect(() => {
    createClient().then(supabase => 
      supabase
        .from('properties')
        .select('*')
        .then(({ data, error }) => {
          if (error) console.error(error)
          else setProperties(data || [])
          setLoading(false)
        })
    )
  }, [])

  if (loading) return <div className={styles.loading}>Loading properties...</div>

  const selectedProp = properties.find(p => p.id === selectedId)
  const hoveredProp = properties.find(p => p.id === hoveredId)

  return (
    <div className={styles.container}>
      <MapContainer properties={properties} />
      <PropertyListContainer 
        properties={properties}
        selectedId={selectedId}
        hoveredId={hoveredId}
        filters={filters}
        onSelect={setSelectedId}
        onHover={setHoveredId}
        onFiltersChange={setFilters}
      />
      <DetailContainer selectedProp={selectedProp} properties={properties} />
      {hoveredProp && (
        <MegaPopup 
          prop={hoveredProp} 
          onClose={() => setHoveredId(null)} 
        />
      )}
    </div>
  )
}
