export const getZoneFromCoordinates = (lat: number, lng: number): 'North' | 'South' | 'East' | 'West' => {
  const CENTER_LAT = 12.9716;
  const CENTER_LNG = 77.5946;

  const dLat = lat - CENTER_LAT;
  const dLng = lng - CENTER_LNG;

  // Divide map into 4 quadrants (X shape)
  if (Math.abs(dLat) > Math.abs(dLng)) {
    return dLat > 0 ? 'North' : 'South';
  } else {
    return dLng > 0 ? 'East' : 'West';
  }
};
