import type { Courier, Location } from "@/types";

/**
 * Manhattan-centred map defaults. Couriers patrol the Midtown / Financial
 * District corridor so the 3D building extrusions read well at pitch 60.
 */
export const MAP_DEFAULTS = {
  longitude: -73.9857,
  latitude: 40.7484,
  zoom: 13.2,
  pitch: 60,
  bearing: -20,
} as const;

/**
 * Hand-authored waypoint loops that roughly follow the Manhattan street grid.
 * Each courier cycles through its route so movement stays plausible.
 */
export const COURIER_ROUTES: Location[][] = [
  // Courier A — Midtown loop (around Times Square / Bryant Park)
  [
    { lng: -73.9857, lat: 40.7484 },
    { lng: -73.9819, lat: 40.7527 },
    { lng: -73.9776, lat: 40.7566 },
    { lng: -73.9735, lat: 40.7614 },
    { lng: -73.9803, lat: 40.7648 },
    { lng: -73.9847, lat: 40.759 },
    { lng: -73.9878, lat: 40.7538 },
  ],
  // Courier B — Financial District loop (Wall St / Battery)
  [
    { lng: -74.011, lat: 40.7069 },
    { lng: -74.0087, lat: 40.7103 },
    { lng: -74.0052, lat: 40.7127 },
    { lng: -74.0021, lat: 40.7092 },
    { lng: -74.0047, lat: 40.7051 },
    { lng: -74.0089, lat: 40.7038 },
  ],
  // Courier C — Chelsea / Flatiron loop
  [
    { lng: -73.9969, lat: 40.7414 },
    { lng: -73.9924, lat: 40.7444 },
    { lng: -73.9887, lat: 40.7401 },
    { lng: -73.9931, lat: 40.7358 },
    { lng: -73.9987, lat: 40.7371 },
  ],
  // Courier D — Upper West / Columbus Circle loop
  [
    { lng: -73.9819, lat: 40.7681 },
    { lng: -73.9769, lat: 40.7721 },
    { lng: -73.9737, lat: 40.7768 },
    { lng: -73.9808, lat: 40.7799 },
    { lng: -73.9861, lat: 40.7745 },
    { lng: -73.9847, lat: 40.7702 },
  ],
];

export const INITIAL_COURIERS: Courier[] = [
  {
    id: "courier-a",
    name: "Marcus Rivera",
    callSign: "Courier A",
    avatarUrl: "https://i.pravatar.cc/160?img=12",
    vehicle: "scooter",
    vehicleModel: "Vespa Primavera 150",
    plate: "NYC-4821",
    status: "on_route",
    punctuality: "on_time",
    location: COURIER_ROUTES[0][0],
    destination: { lng: -73.9735, lat: 40.7614 },
    heading: 45,
    speed: 24,
    batteryLevel: 82,
    etaMinutes: 9,
    deliveries: 7,
    orderId: "ORD-4821",
    customerName: "Hannah Whitfield",
    deliveryNote: "Leave at the front desk, ask for building security.",
    itemCount: 3,
    weightKg: 1.2,
  },
  {
    id: "courier-b",
    name: "Elena Petrova",
    callSign: "Courier B",
    avatarUrl: "https://i.pravatar.cc/160?img=32",
    vehicle: "bike",
    vehicleModel: "Trek FX 3 Disc",
    plate: "NYC-4802",
    status: "delivering",
    punctuality: "delayed",
    location: COURIER_ROUTES[1][0],
    destination: { lng: -74.0052, lat: 40.7127 },
    heading: 120,
    speed: 18,
    batteryLevel: 46,
    etaMinutes: 21,
    deliveries: 12,
    orderId: "ORD-4802",
    customerName: "Daniel Brooks",
    deliveryNote: "Ring the intercom twice — apartment 4C.",
    itemCount: 1,
    weightKg: 0.4,
  },
  {
    id: "courier-c",
    name: "David Okafor",
    callSign: "Courier C",
    avatarUrl: "https://i.pravatar.cc/160?img=15",
    vehicle: "van",
    vehicleModel: "Ford Transit 350",
    plate: "NYC-4835",
    status: "picking_up",
    punctuality: "on_time",
    location: COURIER_ROUTES[2][0],
    destination: { lng: -73.9887, lat: 40.7401 },
    heading: 210,
    speed: 31,
    batteryLevel: 91,
    etaMinutes: 6,
    deliveries: 5,
    orderId: "ORD-4835",
    customerName: "Priya Kapoor",
    deliveryNote: "Fragile — handle glassware with care.",
    itemCount: 8,
    weightKg: 6.7,
  },
  {
    id: "courier-d",
    name: "Sofia Nguyen",
    callSign: "Courier D",
    avatarUrl: "https://i.pravatar.cc/160?img=45",
    vehicle: "scooter",
    vehicleModel: "NIU NQi GTS",
    plate: "NYC-4790",
    status: "on_route",
    punctuality: "delayed",
    location: COURIER_ROUTES[3][0],
    destination: { lng: -73.9737, lat: 40.7768 },
    heading: 300,
    speed: 27,
    batteryLevel: 23,
    etaMinutes: 17,
    deliveries: 9,
    orderId: "ORD-4790",
    customerName: "Liam Walsh",
    deliveryNote: "Contactless drop-off, photo confirmation required.",
    itemCount: 2,
    weightKg: 0.9,
  },
];
