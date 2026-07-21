"use client";

import { Marker } from "react-map-gl";
import { Bike, Truck, Zap } from "lucide-react";
import type { Courier, Vehicle } from "@/types";
import { cn } from "@/lib/cn";

const VEHICLE_ICON: Record<Vehicle, typeof Bike> = {
  bike: Bike,
  scooter: Zap,
  van: Truck,
};

interface CourierMarkerProps {
  courier: Courier;
  selected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Animated map marker for a single courier.
 *
 * The `transition: all 1s linear` on the Marker wrapper is what makes the pin
 * glide smoothly between the per-second coordinate updates instead of jumping.
 */
export function CourierMarker({ courier, selected, onSelect }: CourierMarkerProps) {
  const Icon = VEHICLE_ICON[courier.vehicle];
  const delayed = courier.punctuality === "delayed";

  return (
    <Marker
      longitude={courier.location.lng}
      latitude={courier.location.lat}
      anchor="center"
      style={{ transition: "all 1s linear" }}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onSelect(courier.id);
      }}
    >
      <div className="group relative flex h-10 w-10 cursor-pointer items-center justify-center">
        {/* Pulsing radar ring */}
        <span
          className={cn(
            "absolute inline-flex h-6 w-6 rounded-full animate-pulse-ring",
            delayed
              ? "bg-rose-500/30"
              : selected
                ? "bg-accent/40"
                : "bg-sky-400/25"
          )}
        />

        {/* Heading cone rotates with the courier's bearing */}
        <span
          className="absolute -top-1 h-0 w-0 border-x-[6px] border-b-[10px] border-x-transparent border-b-accent/80 transition-transform duration-1000 ease-linear"
          style={{ transform: `rotate(${courier.heading}deg) translateY(-10px)` }}
        />

        {/* Pin body */}
        <span
          className={cn(
            "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-glow transition-all",
            selected
              ? "border-accent bg-accent text-slate-950 scale-110"
              : delayed
                ? "border-rose-400/40 bg-slate-900/90 text-rose-300"
                : "border-white/20 bg-slate-900/90 text-accent"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>

        {/* Hover / selected label */}
        <span
          className={cn(
            "pointer-events-none absolute -bottom-7 whitespace-nowrap rounded-md border border-white/10 bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm transition-opacity",
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {courier.name} · {courier.speed} km/h
        </span>
      </div>
    </Marker>
  );
}
