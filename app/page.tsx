"use client";

import dynamic from "next/dynamic";
import { Navigation } from "lucide-react";
import { useMockSocket } from "@/hooks/useMockSocket";
import { FleetStats } from "@/components/sidebar/FleetStats";
import { LiveFeed } from "@/components/sidebar/LiveFeed";
import { CourierSearch } from "@/components/sidebar/CourierSearch";
import { LayerControl } from "@/components/map/LayerControl";
import { CourierDetailDrawer } from "@/components/drawer/CourierDetailDrawer";

// Mapbox GL touches `window`, so the map is loaded client-side only.
const LiveMap = dynamic(
  () => import("@/components/map/LiveMap").then((m) => m.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-sm text-slate-500">
        Initialising map…
      </div>
    ),
  }
);

export default function DashboardPage() {
  // Kick off the mock real-time fleet stream.
  useMockSocket();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-slate-950">
      <LiveMap />

      {/* Top-right glassmorphism layer control */}
      <div className="pointer-events-auto absolute right-4 top-4 z-10">
        <LayerControl />
      </div>

      {/* Left sidebar — glassmorphism control panel */}
      <aside className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-[360px] max-w-[86vw] flex-col gap-3 p-4">
        <header className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-glass backdrop-blur-md">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15 text-accent shadow-glow">
            <Navigation className="h-4.5 w-4.5" strokeWidth={2.25} />
          </span>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white">
              FleetPulse
            </h1>
            <p className="text-[11px] text-slate-400">
              Manhattan · Live operations
            </p>
          </div>
        </header>

        <div className="pointer-events-auto">
          <CourierSearch />
        </div>

        <div className="pointer-events-auto">
          <FleetStats />
        </div>

        <div className="pointer-events-auto flex min-h-0 flex-1">
          <LiveFeed />
        </div>
      </aside>

      {/* Right slide-in courier detail drawer */}
      <CourierDetailDrawer />
    </main>
  );
}
