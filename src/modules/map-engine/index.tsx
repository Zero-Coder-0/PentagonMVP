'use client'
import dynamic from 'next/dynamic'
import { MapViewProps } from './types'

const LeafletMap = dynamic(() => import('./components/LeafletMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>
})

export function MapWidget(props: MapViewProps) {
  return <LeafletMap {...props} />
}
