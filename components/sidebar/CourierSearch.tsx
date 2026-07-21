"use client";

import { Search, X } from "lucide-react";
import { useFleetStore } from "@/store/useFleetStore";

/**
 * Roster search box. Filters the fleet list by name, callsign or order id.
 */
export function CourierSearch() {
  const searchQuery = useFleetStore((s) => s.searchQuery);
  const setSearchQuery = useFleetStore((s) => s.setSearchQuery);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search couriers, ID or order…"
        className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-9 pr-9 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-accent/50 focus:bg-white/[0.07]"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
