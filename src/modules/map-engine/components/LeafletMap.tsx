'use client'

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ProjectV7, CityZone as Zone } from '../../inventory/types-v7'; // Using your correct types
import { getZoneFromCoordinates } from '../utils/geo-zone';
import { useDashboard } from '@/app/(dashboard)/dashboard/page';

// ==========================================
// 1. ICONS
// ==========================================
const getIconForZone = (zone: ProjectV7['city_zone'], isSelected: boolean) => {
  let color = 'blue';
  switch (zone) {
    case 'North': color = 'blue'; break;
    case 'South': color = 'green'; break;
    case 'East': color = 'gold'; break;
    case 'West': color = 'red'; break;
    default: color = 'violet';
  }

  // Use a slightly larger icon if selected
  const size = isSelected ? [35, 56] : [25, 41];
  const anchor = isSelected ? [17, 56] : [12, 41];

  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: size as L.PointTuple,
    iconAnchor: anchor as L.PointTuple,
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

const SearchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom Pentagon Icon for Nearby Searches
const createPentagonIcon = (isSelected: boolean) => {
  const size = isSelected ? 36 : 28;
  const color = isSelected ? '#2563EB' : 'black'; // Blue when selected, black otherwise
  const svgHtml = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" style="filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.35)); cursor: pointer;">
      <path d="M12 2L22 9.27L18.18 21H5.82L2 9.27L12 2Z" fill="${color}" stroke="white" stroke-width="1.5" />
      <circle cx="12" cy="12" r="3" fill="white" />
    </svg>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-pentagon-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

// ==========================================
// 2. CONTROLLER (Supports Bounds, Center, & FlyTo)
// ==========================================
const InteractionController = ({
  selectedId,
  items,
  center,
  zoom,
  bounds
}: {
  selectedId: string | null,
  items: ProjectV7[],
  center: [number, number] | null,
  zoom: number,
  bounds?: [[number, number], [number, number]] | undefined
}) => {
  const map = useMap();
  const { selectedNearbyProperty } = useDashboard();

  // Handle "Fly To Selected" (Single Click behavior)
  useEffect(() => {
    if (selectedId && items) {
      const selectedItem = items.find((i) => i.id === selectedId);
      if (selectedItem) {
        map.flyTo([selectedItem.lat ?? 0, selectedItem.lng ?? 0], 16, {
          animate: true,
          duration: 1.0 // Smooth fly
        });
      }
    }
  }, [selectedId, items, map]);

  // Handle Fly To Nearby Property Selected
  useEffect(() => {
    if (selectedNearbyProperty) {
      map.flyTo([selectedNearbyProperty.lat, selectedNearbyProperty.lng], 16, {
        animate: true,
        duration: 1.0
      });
    }
  }, [selectedNearbyProperty, map]);

  // Handle Initial Center / Bounds Update
  useEffect(() => {
    // Priority 1: Fit Bounds (e.g., when a search location is selected)
    if (bounds) {
      map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
      return;
    }

    // Priority 2: Fly to Center
    if (center) {
      map.flyTo(center, zoom, { animate: true, duration: 0.5 });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
function ResizeMap() {
  const map = useMap();
  
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;

    // Watch the map container element for any size changes (drag, flex resize, screen size)
    const resizeObserver = new ResizeObserver(() => {
      // Force Leaflet to recalculate container boundaries instantly
      map.invalidateSize();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

interface LeafletMapProps {
  items: ProjectV7[]; // Using Property type
  selectedId: string | null;
  onSelect: (id: string) => void;
  // NEW Prop for Double Click
  onMarkerDbClick?: (latitude: number, longitude: number, name: string) => void;
  onSeedReset?: () => void; // Restored Right-Click Reset
  center?: [number, number];
  bounds?: [[number, number], [number, number]];
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  items,
  selectedId,
  onSelect,
  onMarkerDbClick,
  onSeedReset,
  center,
  bounds
}) => {
  const mapCenter: [number, number] = center || [12.9716, 77.5946];
  const {
    nearbySearchResults,
    selectedNearbyProperty,
    setSelectedNearbyProperty,
    setNearbySearchPinPopupOpen,
  } = useDashboard();

  return (
    <MapContainer
      center={mapCenter}
      zoom={11}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false} // Disable default top-left controls if you want
    >
      <ResizeMap />

      {/* Logic for FlyTo and Bounds */}
      <InteractionController
        selectedId={selectedId}
        items={items}
        center={center ? mapCenter : null}
        zoom={12}
        bounds={bounds}
      />

      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User Search Location Marker */}
      {center && (
        <>
          <Marker
            position={center}
            icon={SearchIcon}
            eventHandlers={{
              // Double click opens search modal
              dblclick: () => {
                setNearbySearchPinPopupOpen(true);
              },
              // Right click (or mobile touch hold) opens search modal
              contextmenu: () => {
                setNearbySearchPinPopupOpen(true);
              }
            }}
          >
            <Popup>
              <div className="p-2 flex flex-col gap-1 text-slate-700 select-none max-w-[200px]">
                <div className="font-bold text-xs text-slate-800">📍 Desired Location</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  Search Nearby
                </div>
                <div className="text-[10px] text-slate-500 leading-normal">
                  Double-click or Right-click (long press) to find under-construction properties around here.
                </div>
                <button
                  onClick={() => setNearbySearchPinPopupOpen(true)}
                  className="mt-2.5 text-[10px] font-black text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-all text-center w-full uppercase tracking-wider"
                >
                  Search Nearby
                </button>
              </div>
            </Popup>
          </Marker>
          <Circle
            center={center}
            radius={3000}
            pathOptions={{ color: 'black', fillColor: 'black', fillOpacity: 0.1, weight: 1, dashArray: '5, 10' }}
          />
        </>
      )}

      {/* Nearby Google Places Search Result Markers (Black Pentagons) */}
      {nearbySearchResults && nearbySearchResults
        .filter((place: any) => !place.isLocalDb)
        .map((place: any) => {
          const isSelected = selectedNearbyProperty?.id === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createPentagonIcon(isSelected)}
              zIndexOffset={isSelected ? 2000 : 1000}
              eventHandlers={{
                click: () => {
                  setSelectedNearbyProperty(place);
                }
              }}
            />
          );
        })}

      {/* Property Markers */}
      {items
        .filter(item =>
          typeof item.lat === 'number' &&
          typeof item.lng === 'number' &&
          !isNaN(item.lat) &&
          !isNaN(item.lng)
        )
        .map((item) => {
          const isSelected = selectedId === item.id;
          
          // Use DB zone, or calculate on the fly if missing or "Unknown"
          const effectiveZone = (!item.city_zone || (item.city_zone as string) === 'Unknown') 
            ? getZoneFromCoordinates(item.lat as number, item.lng as number) 
            : item.city_zone;

          return (
            <Marker
              key={item.id}
              position={[item.lat as number, item.lng as number]}
              icon={getIconForZone(effectiveZone, isSelected)}
              zIndexOffset={isSelected ? 1000 : 0} // Selected pin always on top
              opacity={selectedId === item.id ? 1.0 : 0.8}
              eventHandlers={{
                click: () => {
                  // Just Select (Controller handles the zoom)
                  onSelect(item.id);
                },
                dblclick: () => {
                  // Set as Seed Location
                  if (onMarkerDbClick) {
                    onMarkerDbClick(item.lat as number, item.lng as number, item.project_name);
                  }
                }
              }}
            >
              {/* Popup removed to rely on sidebar/flyto */}
            </Marker>
          )
        })}
    </MapContainer>
  )
}

export default LeafletMap;
