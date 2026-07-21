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
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search couriers, ID or order…"
        className="w-full rounded-xl border border-hairline/10 bg-hairline/5 py-2.5 pl-9 pr-9 text-sm text-ink placeholder:text-ink-subtle outline-none transition-colors focus:border-accent/50 focus:bg-hairline/[0.08]"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-hairline/10 hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
