// Haversine formula to calculate distance in Kilometers
export const GeoCalc = {
  getDistanceKm: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
      lat1 === null || lon1 === null || lat2 === null || lon2 === null) return 0;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1)); // Returns distance to 1 decimal place (e.g. 12.5)
  }
};

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
