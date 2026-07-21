import { create } from "zustand";
import type { Courier, LayerKey, LayerToggles, LogEvent } from "@/types";

interface FleetState {
  couriers: Courier[];
  logs: LogEvent[];
  selectedCourierId: string | null;
  /** Whether the mock socket connection is streaming. */
  connected: boolean;
  /** Roster search term (matches name, callsign, order or id). */
  searchQuery: string;
  /** Visibility of the optional Mapbox overlay layers. */
  layers: LayerToggles;

  setCouriers: (couriers: Courier[]) => void;
  updateCouriers: (couriers: Courier[]) => void;
  pushLog: (log: LogEvent) => void;
  selectCourier: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSearchQuery: (query: string) => void;
  toggleLayer: (key: LayerKey) => void;
}

/** Maximum number of log events retained in memory for the live feed. */
const MAX_LOGS = 40;

export const useFleetStore = create<FleetState>((set) => ({
  couriers: [],
  logs: [],
  selectedCourierId: null,
  connected: false,
  searchQuery: "",
  layers: {
    heatmap: true,
    geofence: true,
    traffic: false,
  },

  setCouriers: (couriers) => set({ couriers }),
  updateCouriers: (couriers) => set({ couriers }),
  pushLog: (log) =>
    set((state) => ({ logs: [log, ...state.logs].slice(0, MAX_LOGS) })),
  selectCourier: (id) =>
    set((state) => ({
      selectedCourierId: state.selectedCourierId === id ? null : id,
    })),
  setConnected: (connected) => set({ connected }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  toggleLayer: (key) =>
    set((state) => ({
      layers: { ...state.layers, [key]: !state.layers[key] },
    })),
}));

/**
 * Live snapshot of the currently selected courier. Derived from the roster so
 * the drawer always reflects the latest position/battery/ETA on every tick.
 */
export function useSelectedCourier(): Courier | null {
  return useFleetStore((state) =>
    state.selectedCourierId
      ? state.couriers.find((c) => c.id === state.selectedCourierId) ?? null
      : null
  );
}
