/**
 * Domain types for the Live Fleet Tracking Dashboard.
 */

export interface Location {
  /** Longitude in decimal degrees (Mapbox lng/lat order). */
  lng: number;
  /** Latitude in decimal degrees. */
  lat: number;
}

/** Operational state shown on the roster/marker badge. */
export type CourierStatus = "on_route" | "picking_up" | "delivering" | "idle";

/** Delivery punctuality — drives the "Delayed" stat and the ETA warning glow. */
export type Punctuality = "on_time" | "delayed";

export type Vehicle = "bike" | "scooter" | "van";

export interface Courier {
  id: string;
  /** Full name, e.g. "Marcus Rivera". */
  name: string;
  /** Fleet callsign, e.g. "Courier A". */
  callSign: string;
  /** Portrait avatar URL. */
  avatarUrl: string;

  vehicle: Vehicle;
  /** Marketing model name, e.g. "Vespa Primavera 150". */
  vehicleModel: string;
  /** License plate. */
  plate: string;

  status: CourierStatus;
  punctuality: Punctuality;

  location: Location;
  /** Drop-off target used to render the route polyline. */
  destination: Location;

  /** Heading in degrees (0-360), used to rotate the marker. */
  heading: number;
  /** Current speed in km/h. */
  speed: number;
  /** Remaining battery / charge level as a percentage (0-100). */
  batteryLevel: number;
  /** Estimated minutes until arrival at the destination. */
  etaMinutes: number;

  /** Number of parcels completed in this shift. */
  deliveries: number;

  /** Active order details. */
  orderId: string;
  customerName: string;
  deliveryNote: string;
  itemCount: number;
  weightKg: number;
}

export type LogLevel = "info" | "success" | "warning";

export interface LogEvent {
  id: string;
  courierId: string;
  courierName: string;
  message: string;
  level: LogLevel;
  timestamp: number;
}

/** Toggleable Mapbox overlay layers controlled from the Layer Control menu. */
export interface LayerToggles {
  heatmap: boolean;
  geofence: boolean;
  traffic: boolean;
}

export type LayerKey = keyof LayerToggles;
