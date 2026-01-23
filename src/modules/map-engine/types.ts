export type ZoneColor = 'red' | 'blue' | 'green' | 'yellow';
export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  color: ZoneColor;
  title: string;
}
export interface MapViewProps {
  points?: MapPoint[];
  center?: [number, number];
  zoom?: number;
}
