"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import type { MapLayerMouseEvent, Map as MapboxMap } from "mapbox-gl";
import type { Feature, LineString, Position } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

import { useFleetStore } from "@/store/useFleetStore";
import { useThemeStore } from "@/store/useThemeStore";
import { MAP_DEFAULTS } from "@/lib/fleetData";
import { ORDER_DENSITY, SERVICE_AREA } from "@/lib/mapData";
import { CourierMarker } from "./CourierMarker";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MAP_STYLES = {
  dark: "mapbox://styles/mapbox/dark-v11",
  light: "mapbox://styles/mapbox/light-v11",
} as const;

/** 3D building extrusion colour per theme. */
const BUILDING_COLOR = { dark: "#1b2436", light: "#cbd4e2" } as const;

/**
 * Full-screen Mapbox GL map (dark-v11) tilted into a 3D perspective with
 * building extrusions, hosting live courier markers and optional pro overlays
 * (order-density heatmap, service-area geofence, live traffic, selected route).
 */
export function LiveMap() {
  const mapRef = useRef<MapRef | null>(null);
  const couriers = useFleetStore((s) => s.couriers);
  const selectedCourierId = useFleetStore((s) => s.selectedCourierId);
  const selectCourier = useFleetStore((s) => s.selectCourier);
  const layers = useFleetStore((s) => s.layers);
  const routeLines = useFleetStore((s) => s.routeLines);
  const theme = useThemeStore((s) => s.theme);

  // Keep the latest theme available to imperative Mapbox callbacks.
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  const selectedCourier = useMemo(
    () => couriers.find((c) => c.id === selectedCourierId) ?? null,
    [couriers, selectedCourierId]
  );

  /**
   * Road-following polyline from the selected courier to its drop-off, produced
   * by the routing simulation. Falls back to a straight line if unavailable.
   */
  const routeGeoJson = useMemo<Feature<LineString> | null>(() => {
    if (!selectedCourier) return null;
    const line = routeLines[selectedCourier.id];
    const coordinates: Position[] =
      line && line.length >= 2
        ? line.map((p) => [p.lng, p.lat])
        : [
            [selectedCourier.location.lng, selectedCourier.location.lat],
            [selectedCourier.destination.lng, selectedCourier.destination.lat],
          ];
    return {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates },
    };
  }, [selectedCourier, routeLines]);

  /** Injects (or recolours) the 3D building extrusion layer for the theme. */
  const addBuildings = useCallback((map: MapboxMap) => {
    const color = BUILDING_COLOR[themeRef.current];

    if (map.getLayer("3d-buildings")) {
      map.setPaintProperty("3d-buildings", "fill-extrusion-color", color);
      return;
    }

    const styleLayers = map.getStyle().layers ?? [];
    const labelLayer = styleLayers.find(
      (layer) =>
        layer.type === "symbol" &&
        (layer.layout as { "text-field"?: unknown } | undefined)?.["text-field"]
    );

    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 12,
        paint: {
          "fill-extrusion-color": color,
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            0,
            13.5,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            0,
            13.5,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": themeRef.current === "dark" ? 0.75 : 0.9,
        },
      },
      labelLayer?.id
    );
  }, []);

  /** Add buildings on first load and re-add them whenever the style reloads. */
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    addBuildings(map);
    map.on("style.load", () => addBuildings(map));
  }, [addBuildings]);

  const handleMapClick = useCallback(
    (_event: MapLayerMouseEvent) => {
      if (selectedCourierId) selectCourier(null);
    },
    [selectedCourierId, selectCourier]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-canvas p-8 text-center">
        <div className="max-w-md rounded-2xl border border-hairline/10 bg-glass/80 p-8 shadow-glass backdrop-blur-md dark:bg-glass/40">
          <h2 className="text-lg font-semibold text-ink">
            Mapbox token missing
          </h2>
          <p className="mt-2 text-sm text-ink-muted">
            Add{" "}
            <code className="rounded bg-hairline/10 px-1.5 py-0.5 text-accent">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            to your <code className="text-accent">.env.local</code> file and
            restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={MAP_DEFAULTS}
      mapStyle={MAP_STYLES[theme]}
      onLoad={handleLoad}
      onClick={handleMapClick}
      antialias
      attributionControl={false}
      style={{ position: "absolute", inset: 0, width: "100vw", height: "100vh" }}
    >
      <NavigationControl position="bottom-right" visualizePitch showCompass />

      {/* Order-density heatmap */}
      {layers.heatmap && (
        <Source id="order-density" type="geojson" data={ORDER_DENSITY}>
          <Layer
            id="order-density-heat"
            type="heatmap"
            maxzoom={16}
            paint={{
              "heatmap-weight": [
                "interpolate",
                ["linear"],
                ["get", "weight"],
                0,
                0,
                1,
                1,
              ],
              "heatmap-intensity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                11,
                1,
                15,
                2.4,
              ],
              "heatmap-color": [
                "interpolate",
                ["linear"],
                ["heatmap-density"],
                0,
                "rgba(2,6,23,0)",
                0.2,
                "rgba(56,189,248,0.5)",
                0.4,
                "rgba(34,211,238,0.65)",
                0.6,
                "rgba(250,204,21,0.75)",
                0.8,
                "rgba(251,146,60,0.85)",
                1,
                "rgba(239,68,68,0.9)",
              ],
              "heatmap-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                11,
                18,
                15,
                50,
              ],
              // Dial the intense heatmap back on the bright light basemap.
              "heatmap-opacity": theme === "dark" ? 0.6 : 0.35,
            }}
          />
        </Source>
      )}

      {/* Service-area geofence */}
      {layers.geofence && (
        <Source id="service-area" type="geojson" data={SERVICE_AREA}>
          <Layer
            id="service-area-fill"
            type="fill"
            paint={{ "fill-color": "#38bdf8", "fill-opacity": 0.06 }}
          />
          <Layer
            id="service-area-outline"
            type="line"
            paint={{
              "line-color": "#38bdf8",
              "line-width": 1.5,
              "line-opacity": 0.4,
              "line-dasharray": [3, 2],
            }}
          />
        </Source>
      )}

      {/* Live traffic congestion */}
      {layers.traffic && (
        <Source
          id="traffic"
          type="vector"
          url="mapbox://mapbox.mapbox-traffic-v1"
        >
          <Layer
            id="traffic-flow"
            type="line"
            source-layer="traffic"
            paint={{
              "line-width": 2,
              "line-color": [
                "match",
                ["get", "congestion"],
                "low",
                "#22c55e",
                "moderate",
                "#facc15",
                "heavy",
                "#fb923c",
                "severe",
                "#ef4444",
                "#64748b",
              ],
            }}
          />
        </Source>
      )}

      {/* Route polyline for the selected courier */}
      {routeGeoJson && (
        <Source id="selected-route" type="geojson" lineMetrics data={routeGeoJson}>
          <Layer
            id="selected-route-glow"
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color": "#38bdf8",
              "line-width": 9,
              "line-opacity": 0.15,
              "line-blur": 6,
            }}
          />
          <Layer
            id="selected-route-line"
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-width": 3,
              "line-gradient": [
                "interpolate",
                ["linear"],
                ["line-progress"],
                0,
                "#38bdf8",
                1,
                "#f59e0b",
              ],
            }}
          />
        </Source>
      )}

      {couriers.map((courier) => (
        <CourierMarker
          key={courier.id}
          courier={courier}
          selected={courier.id === selectedCourierId}
          onSelect={selectCourier}
        />
      ))}
    </Map>
  );
}
