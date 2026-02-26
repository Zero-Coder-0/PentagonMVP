// ============================================================================
// geo.ts — Shared geography utilities
// Import from here instead of copy-pasting the Haversine formula.
// ============================================================================

/**
 * Haversine formula — returns straight-line distance in kilometres
 * between two lat/lng points on the Earth's surface.
 */
export function getDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

/** Format a distance in km to a user-readable string, e.g. "3.2 km" */
export function formatDistanceKm(km: number): string {
    return `${km.toFixed(1)} km`;
}
