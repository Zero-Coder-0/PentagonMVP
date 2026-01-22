'use client'

import React from 'react';
import dynamic from 'next/dynamic';
import { MapViewProps } from '../types';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      Loading Map...
    </div>
  )
});

interface MapWidgetProps extends MapViewProps {
  items?: any[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function MapWidget(props: MapWidgetProps) {
  // Provide default values for required LeafletMap props
  const {
    items = [],
    selectedId = null,
    onSelect = () => {},
    points,
    center,
    zoom
  } = props;

  return (
    <LeafletMap
      items={items}
      selectedId={selectedId}
      onSelect={onSelect}
      center={center}
      bounds={undefined}
    />
  );
}

export default MapWidget;
