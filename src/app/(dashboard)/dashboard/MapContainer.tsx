// FIXED MapContainer.tsx - Add missing LeafletMap props
'use client'
import dynamic from 'next/dynamic'
import styles from './Dashboard.module.css'

const LeafletMap = dynamic(() => import('@/modules/map-engine/components/LeafletMap'), { ssr: false })

const QUICK_AREAS = [
  { name: 'Hebbal', lat: 13.0384, lng: 77.5701 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7630 },
  { name: 'JP Nagar', lat: 12.9100, lng: 77.5833 },
  { name: 'Panathur', lat: 12.9018, lng: 77.7000 }
]

export default function MapContainer({ properties }: { properties: any[] }) {
  return (
    <div className={styles.mapContainer}>
      <div className={styles.searchPanel}>
        <input 
          className={styles.searchInput}
          placeholder="Search location (Yelahanka, etc)..."
        />
        <div className={styles.quickButtons}>
          {QUICK_AREAS.map(area => (
            <button 
              key={area.name}
              className={styles.quickButton}
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>
      {/* ✅ FIXED: Add required LeafletMap props */}
      <LeafletMap 
        items={properties} 
        selectedId={null}
        onSelect={() => {}}
      />
    </div>
  )
}
