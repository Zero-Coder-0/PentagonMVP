import { CityZone } from '@/lib/project-constants';

export const getZoneFromCoordinates = (lat: number, lng: number): CityZone => {
  // Bangalore Center Point (approx)
  const CENTER_LAT = 12.9716;
  const CENTER_LNG = 77.5946;

  const dLat = lat - CENTER_LAT;
  const dLng = lng - CENTER_LNG;

  // Math.atan2 returns radians in the range [-PI, PI] (-180 to 180 degrees)
  // East is 0 degrees, North is 90 degrees, West is 180 degrees, South is -90 degrees.
  const angleRad = Math.atan2(dLat, dLng);
  const angleDeg = (angleRad * 180) / Math.PI;

  // Define 4-zone quadrants (90-degree slices)
  // -45 to 45 => East
  // 45 to 135 => North
  // -135 to -45 => South
  // Everything else => West
  if (angleDeg >= -45 && angleDeg < 45) {
    return 'East';
  } else if (angleDeg >= 45 && angleDeg < 135) {
    return 'North';
  } else if (angleDeg >= -135 && angleDeg < -45) {
    return 'South';
  } else {
    // This covers angles > 135 and < -135
    return 'West';
  }
};
