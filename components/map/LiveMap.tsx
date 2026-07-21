"use client";

import { useCallback, useMemo, useRef } from "react";
import Map, { Layer, NavigationControl, Source } from "react-map-gl";
import type { MapRef } from "react-map-gl";
import type { MapLayerMouseEvent } from "mapbox-gl";
import type { Feature, LineString } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";

import { useFleetStore } from "@/store/useFleetStore";
import { MAP_DEFAULTS } from "@/lib/fleetData";
import { ORDER_DENSITY, SERVICE_AREA } from "@/lib/mapData";
import { CourierMarker } from "./CourierMarker";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

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

  const selectedCourier = useMemo(
    () => couriers.find((c) => c.id === selectedCourierId) ?? null,
    [couriers, selectedCourierId]
  );

  /** LineString from the selected courier's position to its drop-off point. */
  const routeGeoJson = useMemo<Feature<LineString> | null>(() => {
    if (!selectedCourier) return null;
    return {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [selectedCourier.location.lng, selectedCourier.location.lat],
          [selectedCourier.destination.lng, selectedCourier.destination.lat],
        ],
      },
    };
  }, [selectedCourier]);

  /** Inject the 3D building extrusion layer once the style has loaded. */
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const styleLayers = map.getStyle().layers ?? [];
    const labelLayer = styleLayers.find(
      (layer) =>
        layer.type === "symbol" &&
        (layer.layout as { "text-field"?: unknown } | undefined)?.["text-field"]
    );

    if (map.getLayer("3d-buildings")) return;

    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 12,
        paint: {
          "fill-extrusion-color": "#1b2436",
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
          "fill-extrusion-opacity": 0.75,
        },
      },
      labelLayer?.id
    );
  }, []);

  const handleMapClick = useCallback(
    (_event: MapLayerMouseEvent) => {
      if (selectedCourierId) selectCourier(null);
    },
    [selectedCourierId, selectCourier]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 p-8 text-center">
        <div className="max-w-md rounded-2xl border border-white/10 bg-black/40 p-8 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-white">
            Mapbox token missing
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Add{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-accent">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            to your <code className="text-accent">.env.local</code> file (see
            <code className="text-accent"> .env.example</code>) and restart the
            dev server.
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
      mapStyle="mapbox://styles/mapbox/dark-v11"
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
              "heatmap-opacity": 0.6,
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
