"use client";

import { Flame, Layers, Shield, TrafficCone } from "lucide-react";
import type { LayerKey } from "@/types";
import { useFleetStore } from "@/store/useFleetStore";
import { Toggle } from "@/components/ui/Toggle";

const LAYER_ITEMS: { key: LayerKey; label: string; icon: typeof Flame }[] = [
  { key: "heatmap", label: "Order Heatmap", icon: Flame },
  { key: "geofence", label: "Service Area", icon: Shield },
  { key: "traffic", label: "Live Traffic", icon: TrafficCone },
];

/**
 * Glassmorphism layer-control menu pinned to the top-right of the map.
 */
export function LayerControl() {
  const layers = useFleetStore((s) => s.layers);
  const toggleLayer = useFleetStore((s) => s.toggleLayer);

  return (
    <div className="w-56 rounded-2xl border border-hairline/10 bg-glass/80 p-2 shadow-glass backdrop-blur-md dark:bg-glass/40">
      <div className="flex items-center gap-2 px-2.5 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
        <Layers className="h-3.5 w-3.5" />
        Map layers
      </div>
      <div className="space-y-0.5">
        {LAYER_ITEMS.map((item) => (
          <Toggle
            key={item.key}
            label={item.label}
            icon={item.icon}
            checked={layers[item.key]}
            onChange={() => toggleLayer(item.key)}
          />
        ))}
      </div>
    </div>
  );
}
