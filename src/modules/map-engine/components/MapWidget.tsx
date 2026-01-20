'use client'

import dynamic from 'next/dynamic'
import { MapViewProps } from '../types'

// Dynamic import with SSR disabled - critical for Leaflet
const LeafletMap = dynamic(
  () => import('./LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
)

export function MapWidget(props: MapViewProps) {
  return <LeafletMap {...props} />
}
