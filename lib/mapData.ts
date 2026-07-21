import type {
  Feature,
  FeatureCollection,
  Point,
  Polygon,
} from "geojson";

/**
 * Static "order density" sample used to render the background heatmap. Points
 * cluster around Manhattan commercial hubs with a normalised `weight` (0..1).
 */
export const ORDER_DENSITY: FeatureCollection<Point, { weight: number }> = {
  type: "FeatureCollection",
  features: [
    [-73.9857, 40.7484, 0.9], // Midtown / Empire State
    [-73.9819, 40.7527, 0.75],
    [-73.9772, 40.7561, 0.85], // Times Square
    [-73.9735, 40.7614, 0.6],
    [-73.9803, 40.7648, 0.55],
    [-73.9969, 40.7414, 0.7], // Chelsea
    [-73.9924, 40.7444, 0.65],
    [-73.9887, 40.7401, 0.5],
    [-73.9911, 40.735, 0.45], // Flatiron
    [-74.011, 40.7069, 0.8], // FiDi
    [-74.0087, 40.7103, 0.7],
    [-74.0052, 40.7127, 0.6],
    [-74.0021, 40.7092, 0.5],
    [-73.9819, 40.7681, 0.55], // Upper West edge
    [-73.9769, 40.7721, 0.65],
    [-73.9737, 40.7768, 0.5],
    [-73.9857, 40.7549, 0.6],
    [-73.984, 40.7306, 0.4],
    [-73.9903, 40.7223, 0.55],
    [-73.9955, 40.7484, 0.5],
  ].map(([lng, lat, weight], index) => ({
    type: "Feature",
    id: index,
    properties: { weight },
    geometry: { type: "Point", coordinates: [lng, lat] },
  })),
};

/**
 * Rough operating boundary for the Manhattan service area. Rendered as a faint
 * translucent geofence so operators can see coverage at a glance.
 */
export const SERVICE_AREA: Feature<Polygon> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-74.0181, 40.7009],
        [-73.9723, 40.7038],
        [-73.9611, 40.7538],
        [-73.9686, 40.7861],
        [-73.9903, 40.7969],
        [-74.0106, 40.7566],
        [-74.0181, 40.7009],
      ],
    ],
  },
};
