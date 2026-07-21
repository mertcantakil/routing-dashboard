"use client";

import { useEffect, useRef } from "react";
import { useFleetStore } from "@/store/useFleetStore";
import { COURIER_ROUTES, INITIAL_COURIERS } from "@/lib/fleetData";
import type { Courier, CourierStatus, LogEvent, LogLevel, Location } from "@/types";

/** How far (in fraction of a segment) a courier advances each tick. */
const STEP = 0.06;
/** Movement tick cadence, per the spec (~1 update / second). */
const MOVE_INTERVAL_MS = 1000;

interface RouteProgress {
  /** Index of the current waypoint the courier is heading away from. */
  segment: number;
  /** Interpolation position (0..1) within the current segment. */
  t: number;
}

/** Compass bearing in degrees between two coordinates. */
function bearingBetween(from: Location, to: Location): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const y = Math.sin(toRad(to.lng - from.lng)) * Math.cos(toRad(to.lat));
  const x =
    Math.cos(toRad(from.lat)) * Math.sin(toRad(to.lat)) -
    Math.sin(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.cos(toRad(to.lng - from.lng));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
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
 * Simulates a real-time fleet WebSocket. Drives smooth courier movement along
 * predefined Manhattan routes and emits live activity logs into the store.
 */
export function useMockSocket() {
  const setCouriers = useFleetStore((s) => s.setCouriers);
  const updateCouriers = useFleetStore((s) => s.updateCouriers);
  const pushLog = useFleetStore((s) => s.pushLog);
  const setConnected = useFleetStore((s) => s.setConnected);

  const progressRef = useRef<RouteProgress[]>(
    INITIAL_COURIERS.map(() => ({ segment: 0, t: 0 }))
  );

  useEffect(() => {
    setCouriers(INITIAL_COURIERS);
    setConnected(true);

    const moveTimer = setInterval(() => {
      const current = useFleetStore.getState().couriers;
      if (current.length === 0) return;

      const next: Courier[] = current.map((courier, index) => {
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

        // Small, plausible speed jitter around the courier's baseline.
        const speed = Math.max(
          8,
          Math.round(courier.speed + (Math.random() * 4 - 2))
        );

        // Recompute ETA from the remaining distance to the drop-off point.
        const remainingKm = distanceKm(location, courier.destination);
        const etaMinutes = Math.max(1, Math.round((remainingKm / speed) * 60));

        // Batteries slowly drain; idle couriers sip a little less.
        const drain = courier.status === "idle" ? 0.05 : 0.15 + Math.random() * 0.2;
        const batteryLevel = Math.max(
          6,
          Math.round((courier.batteryLevel - drain) * 10) / 10
        );

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
