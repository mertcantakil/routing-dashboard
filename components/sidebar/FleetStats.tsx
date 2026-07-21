"use client";

import { useMemo } from "react";
import { Activity, Gauge, Package, TimerOff, Users } from "lucide-react";
import { useFleetStore } from "@/store/useFleetStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  alert = false,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  suffix?: string;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 transition-colors",
        alert
          ? "border-rose-500/30 bg-rose-500/10"
          : "border-hairline/5 bg-hairline/5"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          alert ? "text-rose-500 dark:text-rose-300" : "text-ink-muted"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span
          className={cn(
            "text-2xl font-semibold",
            alert ? "text-rose-600 dark:text-rose-200" : "text-ink"
          )}
        >
          {value}
        </span>
        {suffix && <span className="text-xs text-ink-subtle">{suffix}</span>}
      </div>
    </div>
  );
}

export function FleetStats() {
  const couriers = useFleetStore((s) => s.couriers);
  const selectedCourierId = useFleetStore((s) => s.selectedCourierId);
  const selectCourier = useFleetStore((s) => s.selectCourier);
  const searchQuery = useFleetStore((s) => s.searchQuery);

  const stats = useMemo(() => {
    const active = couriers.filter((c) => c.status !== "idle").length;
    const deliveries = couriers.reduce((sum, c) => sum + c.deliveries, 0);
    const delayed = couriers.filter((c) => c.punctuality === "delayed").length;
    const avgSpeed = couriers.length
      ? Math.round(
          couriers.reduce((sum, c) => sum + c.speed, 0) / couriers.length
        )
      : 0;
    return { active, deliveries, avgSpeed, delayed };
  }, [couriers]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return couriers;
    return couriers.filter((c) =>
      [c.name, c.callSign, c.orderId, c.id].some((field) =>
        field.toLowerCase().includes(q)
      )
    );
  }, [couriers, searchQuery]);

  return (
    <GlassPanel className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={Users} label="Active" value={stats.active} />
        <StatCard icon={Package} label="Drops" value={stats.deliveries} />
        <StatCard
          icon={Gauge}
          label="Avg"
          value={stats.avgSpeed}
          suffix="km/h"
        />
        <StatCard
          icon={TimerOff}
          label="Delayed"
          value={stats.delayed}
          alert={stats.delayed > 0}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
          <Activity className="h-3.5 w-3.5" />
          Fleet roster
        </div>
        <ul className="space-y-1.5">
          {filtered.length === 0 && (
            <li className="rounded-xl border border-hairline/5 bg-hairline/[0.03] px-3 py-4 text-center text-xs text-ink-subtle">
              No couriers match “{searchQuery}”.
            </li>
          )}
          {filtered.map((courier) => {
            const selected = courier.id === selectedCourierId;
            const delayed = courier.punctuality === "delayed";
            return (
              <li key={courier.id}>
                <button
                  type="button"
                  onClick={() => selectCourier(courier.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors",
                    selected
                      ? "border-accent/40 bg-accent-soft"
                      : "border-hairline/5 bg-hairline/[0.03] hover:bg-hairline/[0.07]"
                  )}
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium text-ink">
                      {courier.name}
                      {delayed && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      )}
                    </p>
                    <p className="truncate text-xs text-ink-subtle">
                      {courier.callSign} · {courier.orderId}
                    </p>
                  </div>
                  <StatusBadge status={courier.status} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </GlassPanel>
  );
}
