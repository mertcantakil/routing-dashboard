import type { Location } from "@/types";

const DIRECTIONS_BASE = "https://api.mapbox.com/directions/v5/mapbox";

/** A road-snapped route with precomputed cumulative distances for interpolation. */
export interface RoadRoute {
  /** Dense polyline coordinates that follow the actual street network. */
  path: Location[];
  /** Cumulative distance (metres) at each path point; same length as `path`. */
  cumulative: number[];
  /** Total length of the route in metres. */
  length: number;
}

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Great-circle distance between two coordinates, in metres. */
export function haversineMeters(from: Location, to: Location): number {
  const R = 6_371_000;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Compass bearing in degrees (0-360) from one coordinate to another. */
export function bearingBetween(from: Location, to: Location): number {
  const y = Math.sin(toRad(to.lng - from.lng)) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.cos(toRad(to.lng - from.lng));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Wraps a coordinate list into a `RoadRoute` with cumulative distances. */
export function buildRoadRoute(path: Location[]): RoadRoute {
  const cumulative: number[] = [0];
  for (let i = 1; i < path.length; i++) {
    cumulative[i] = cumulative[i - 1] + haversineMeters(path[i - 1], path[i]);
  }
  return { path, cumulative, length: cumulative[cumulative.length - 1] ?? 0 };
}

/**
 * Requests a road-following loop from the Mapbox Directions API that visits the
 * given waypoints in order and returns to the start. Falls back to `null` on any
 * failure so callers can degrade to straight-line interpolation.
 */
export async function fetchRoadLoop(
  waypoints: Location[],
  token: string,
  profile: "driving" | "cycling" | "walking" = "driving"
): Promise<RoadRoute | null> {
  if (waypoints.length < 2 || !token) return null;

  // Close the loop so couriers patrol continuously.
  const coords = [...waypoints, waypoints[0]]
    .map((w) => `${w.lng.toFixed(6)},${w.lat.toFixed(6)}`)
    .join(";");

  const url =
    `${DIRECTIONS_BASE}/${profile}/${coords}` +
    `?geometries=geojson&overview=full&steps=false&access_token=${token}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      routes?: { geometry: { coordinates: [number, number][] } }[];
    };
    const coordinates = data.routes?.[0]?.geometry?.coordinates;
    if (!coordinates || coordinates.length === 0) return null;

    const path: Location[] = coordinates.map(([lng, lat]) => ({ lng, lat }));
    return buildRoadRoute(path);
  } catch {
    return null;
  }
}

/** Interpolated position and heading at a given distance (metres) along the route. */
export function locationAtDistance(
  route: RoadRoute,
  distance: number
): { location: Location; heading: number } {
  const { path, cumulative, length } = route;
  if (path.length === 1 || length === 0) {
    return { location: path[0], heading: 0 };
  }

  // Loop the distance back into range.
  const d = ((distance % length) + length) % length;

  let hi = 1;
  while (hi < cumulative.length - 1 && cumulative[hi] < d) hi++;
  const lo = hi - 1;

  const segLength = cumulative[hi] - cumulative[lo] || 1;
  const t = (d - cumulative[lo]) / segLength;
  const from = path[lo];
  const to = path[hi];

  return {
    location: {
      lng: from.lng + (to.lng - from.lng) * t,
      lat: from.lat + (to.lat - from.lat) * t,
    },
    heading: bearingBetween(from, to),
  };
}

/** Finds the distance (metres) along the route nearest to a coordinate. */
export function nearestDistance(route: RoadRoute, target: Location): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < route.path.length; i++) {
    const dist = haversineMeters(route.path[i], target);
    if (dist < bestDist) {
      bestDist = dist;
      best = route.cumulative[i];
    }
  }
  return best;
}

/**
 * Returns the ordered coordinates of the route between two distances, wrapping
 * around the loop when the destination lies "behind" the current position.
 * Used to draw the road-following polyline from a courier to its drop-off.
 */
export function sliceRoute(
  route: RoadRoute,
  fromDistance: number,
  toDistance: number
): Location[] {
  const { length } = route;
  if (length === 0) return [];

  const start = ((fromDistance % length) + length) % length;
  let end = ((toDistance % length) + length) % length;
  // Ensure we always travel forward along the loop.
  if (end < start) end += length;

  const points: Location[] = [locationAtDistance(route, start).location];
  for (let i = 0; i < route.cumulative.length; i++) {
    const d = route.cumulative[i];
    if (d > start && d < end) points.push(route.path[i]);
    // Include the wrapped tail of the loop.
    if (end > length && d + length > start && d + length < end) {
      points.push(route.path[i]);
    }
  }
  points.push(locationAtDistance(route, end).location);
  return points;
}
