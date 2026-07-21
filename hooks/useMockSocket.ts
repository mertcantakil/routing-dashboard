"use client";

import { useEffect, useRef } from "react";
import { useFleetStore } from "@/store/useFleetStore";
import { COURIER_ROUTES, INITIAL_COURIERS } from "@/lib/fleetData";
import {
  fetchRoadLoop,
  locationAtDistance,
  nearestDistance,
  sliceRoute,
  bearingBetween,
  type RoadRoute,
} from "@/lib/directions";
import type {
  Courier,
  CourierStatus,
  LogEvent,
  LogLevel,
  Location,
} from "@/types";

/** Fallback fraction advanced per tick before real road geometry loads. */
const STEP = 0.06;
/** Movement tick cadence, per the spec (~1 update / second). */
const MOVE_INTERVAL_MS = 1000;
/**
 * Demo time-compression: couriers cover this many real-world seconds of travel
 * per tick, so a full patrol loop plays out in a lively ~1-2 minutes instead of
 * the true ~10. Movement still follows the actual road geometry and speed.
 */
const SIM_SPEED_FACTOR = 6;

interface RouteProgress {
  segment: number;
  t: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Great-circle distance between two coordinates, in kilometres. */
function distanceKm(from: Location, to: Location): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const STATUS_CYCLE: CourierStatus[] = [
  "on_route",
  "picking_up",
  "delivering",
  "idle",
];

const LOG_TEMPLATES: { level: LogLevel; render: (name: string) => string }[] = [
  { level: "success", render: (n) => `Order delivered by ${n}` },
  { level: "info", render: (n) => `${n} picked up parcel at hub` },
  { level: "info", render: (n) => `${n} rerouted to avoid traffic` },
  { level: "success", render: (n) => `${n} completed contactless drop-off` },
  { level: "warning", render: (n) => `${n} reported a short delay` },
  { level: "info", render: (n) => `${n} arriving at next stop` },
  { level: "warning", render: (n) => `Signal briefly lost for ${n}` },
  { level: "success", render: (n) => `${n} confirmed customer signature` },
];

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Simulates a real-time fleet WebSocket. Snaps each courier's patrol loop to the
 * real street network via the Mapbox Directions API, then glides couriers along
 * that road geometry (no more cutting through buildings) while emitting live
 * activity logs. Until the road geometry resolves — or if it fails — it falls
 * back to straight-line interpolation between the hand-authored waypoints.
 */
export function useMockSocket() {
  const setCouriers = useFleetStore((s) => s.setCouriers);
  const updateCouriers = useFleetStore((s) => s.updateCouriers);
  const pushLog = useFleetStore((s) => s.pushLog);
  const setConnected = useFleetStore((s) => s.setConnected);
  const setRouteLines = useFleetStore((s) => s.setRouteLines);

  const progressRef = useRef<RouteProgress[]>(
    INITIAL_COURIERS.map(() => ({ segment: 0, t: 0 }))
  );
  /** Road-snapped loop per courier (null until loaded / on failure). */
  const roadRef = useRef<(RoadRoute | null)[]>(
    INITIAL_COURIERS.map(() => null)
  );
  /** Distance travelled (metres) along each courier's road loop. */
  const distanceRef = useRef<number[]>(INITIAL_COURIERS.map(() => 0));
  /** Distance (metres) of each courier's drop-off along its road loop. */
  const destDistanceRef = useRef<number[]>(INITIAL_COURIERS.map(() => 0));

  useEffect(() => {
    setCouriers(INITIAL_COURIERS);
    setConnected(true);

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Resolve real road geometry for every courier loop in parallel.
    if (token) {
      INITIAL_COURIERS.forEach((courier, index) => {
        const waypoints = COURIER_ROUTES[index % COURIER_ROUTES.length];
        const profile = courier.vehicle === "van" ? "driving" : "cycling";
        fetchRoadLoop(waypoints, token, profile).then((road) => {
          if (!road) return;
          roadRef.current[index] = road;
          destDistanceRef.current[index] = nearestDistance(
            road,
            courier.destination
          );
        });
      });
    }

    const moveTimer = setInterval(() => {
      const current = useFleetStore.getState().couriers;
      if (current.length === 0) return;

      const lines: Record<string, Location[]> = {};

      const next: Courier[] = current.map((courier, index) => {
        // Small, plausible speed jitter around the courier's baseline.
        const speed = Math.max(
          8,
          Math.round(courier.speed + (Math.random() * 4 - 2))
        );

        // Batteries slowly drain; idle couriers sip a little less.
        const drain =
          courier.status === "idle" ? 0.05 : 0.15 + Math.random() * 0.2;
        const batteryLevel = Math.max(
          6,
          Math.round((courier.batteryLevel - drain) * 10) / 10
        );

        const road = roadRef.current[index];

        if (road && road.length > 0) {
          // Advance along the real road geometry by the distance actually
          // covered this tick (speed km/h → metres), time-compressed for demo.
          const metersPerTick =
            (speed * 1000) / 3600 * (MOVE_INTERVAL_MS / 1000) * SIM_SPEED_FACTOR;
          const travelled =
            (distanceRef.current[index] + metersPerTick) % road.length;
          distanceRef.current[index] = travelled;

          const { location, heading } = locationAtDistance(road, travelled);

          // Remaining road distance to the drop-off (wrapping around the loop).
          const destDist = destDistanceRef.current[index];
          const remaining =
            ((destDist - travelled) % road.length + road.length) % road.length;
          const etaMinutes = Math.max(
            1,
            Math.round((remaining / 1000 / speed) * 60)
          );

          lines[courier.id] = sliceRoute(road, travelled, destDist);

          return {
            ...courier,
            location,
            heading: Math.round(heading),
            speed,
            etaMinutes,
            batteryLevel,
          };
        }

        // Fallback: straight-line interpolation between waypoints.
        const route = COURIER_ROUTES[index % COURIER_ROUTES.length];
        const progress = progressRef.current[index];
        let { segment, t } = progress;
        t += STEP;
        if (t >= 1) {
          t = 0;
          segment = (segment + 1) % route.length;
        }
        progressRef.current[index] = { segment, t };

        const from = route[segment];
        const to = route[(segment + 1) % route.length];
        const location: Location = {
          lng: lerp(from.lng, to.lng, t),
          lat: lerp(from.lat, to.lat, t),
        };
        const remainingKm = distanceKm(location, courier.destination);
        const etaMinutes = Math.max(1, Math.round((remainingKm / speed) * 60));

        lines[courier.id] = [location, courier.destination];

        return {
          ...courier,
          location,
          heading: Math.round(bearingBetween(from, to)),
          speed,
          etaMinutes,
          batteryLevel,
        };
      });

      updateCouriers(next);
      setRouteLines(lines);
    }, MOVE_INTERVAL_MS);

    let logTimer: ReturnType<typeof setTimeout>;
    const scheduleLog = () => {
      // Random cadence between 3 and 5 seconds, per the spec.
      const delay = 3000 + Math.random() * 2000;
      logTimer = setTimeout(() => {
        const couriers = useFleetStore.getState().couriers;
        if (couriers.length > 0) {
          const courier = couriers[Math.floor(Math.random() * couriers.length)];
          const template =
            LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];

          const event: LogEvent = {
            id: makeId(),
            courierId: courier.id,
            courierName: courier.name,
            message: template.render(courier.name),
            level: template.level,
            timestamp: Date.now(),
          };
          pushLog(event);

          // Reflect activity on the courier: successes advance the delivery
          // count and mark it on time, warnings flag a delay.
          if (template.level === "success" || template.level === "warning") {
            updateCouriers(
              useFleetStore.getState().couriers.map((c) =>
                c.id === courier.id
                  ? {
                      ...c,
                      deliveries:
                        template.level === "success"
                          ? c.deliveries + 1
                          : c.deliveries,
                      punctuality:
                        template.level === "warning" ? "delayed" : "on_time",
                      status:
                        template.level === "success"
                          ? STATUS_CYCLE[
                              (STATUS_CYCLE.indexOf(c.status) + 1) %
                                STATUS_CYCLE.length
                            ]
                          : c.status,
                    }
                  : c
              )
            );
          }
        }
        scheduleLog();
      }, delay);
    };
    scheduleLog();

    return () => {
      clearInterval(moveTimer);
      clearTimeout(logTimer);
      setConnected(false);
    };
    // Store setters are stable; run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
