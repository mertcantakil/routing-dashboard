"use client";

import Image from "next/image";
import {
  BatteryCharging,
  Clock,
  MessageSquare,
  Navigation,
  Package,
  Phone,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import { useFleetStore, useSelectedCourier } from "@/store/useFleetStore";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";

function ActionButton({
  icon: Icon,
  label,
}: {
  icon: typeof Phone;
  label: string;
}) {
  return (
    <button
      type="button"
      className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-3 text-slate-300 transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
    >
      <Icon className="h-4 w-4" strokeWidth={2} />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

/**
 * Right-hand slide-in panel with rich detail for the selected courier.
 * Rendered persistently so the open/close translate animation can play.
 */
export function CourierDetailDrawer() {
  const courier = useSelectedCourier();
  const selectCourier = useFleetStore((s) => s.selectCourier);
  const open = Boolean(courier);
  const delayed = courier?.punctuality === "delayed";

  return (
    <>
      {/* Click-away backdrop (transparent, only active while open) */}
      <div
        aria-hidden={!open}
        onClick={() => selectCourier(null)}
        className={cn(
          "fixed inset-0 z-20 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <aside
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-30 flex w-[380px] max-w-[90vw] flex-col border-l border-white/10 bg-[#0a0a0a]/80 shadow-glass backdrop-blur-md transition-transform duration-500 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {courier && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0">
                  <Image
                    src={courier.avatarUrl}
                    alt={courier.name}
                    fill
                    sizes="56px"
                    className="rounded-2xl border border-white/10 object-cover"
                  />
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#0a0a0a]",
                      delayed ? "bg-rose-500" : "bg-emerald-400"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-white">
                    {courier.name}
                  </h2>
                  <p className="text-xs text-slate-400">{courier.callSign}</p>
                  <p className="mt-1 truncate text-[11px] text-slate-500">
                    {courier.vehicleModel} · {courier.plate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => selectCourier(null)}
                aria-label="Close panel"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <StatusBadge status={courier.status} />

              {/* Battery / charge */}
              <section className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <BatteryCharging className="h-3.5 w-3.5 text-accent" />
                    Battery / Charge
                  </span>
                  <span className="font-semibold tabular-nums text-white">
                    {Math.round(courier.batteryLevel)}%
                  </span>
                </div>
                <ProgressBar value={courier.batteryLevel} />
              </section>

              {/* Task details */}
              <section className="space-y-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <Package className="h-3.5 w-3.5" />
                    Active order
                  </span>
                  <span className="font-mono text-xs text-accent">
                    {courier.orderId}
                  </span>
                </div>

                <p className="text-sm font-medium text-white">
                  {courier.itemCount} Items · {courier.weightKg.toFixed(1)}kg
                </p>

                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <User className="h-3.5 w-3.5 text-slate-500" />
                  {courier.customerName}
                </div>

                <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                    Delivery note
                  </p>
                  <p className="mt-1 text-sm leading-snug text-slate-300">
                    “{courier.deliveryNote}”
                  </p>
                </div>
              </section>

              {/* ETA — glows amber/red when the courier is delayed */}
              <section
                className={cn(
                  "flex items-center justify-between rounded-2xl border p-4 transition-colors",
                  delayed
                    ? "border-rose-500/40 bg-rose-500/10 shadow-[0_0_24px_rgba(244,63,94,0.25)]"
                    : "border-white/5 bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      delayed
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-accent/15 text-accent"
                    )}
                  >
                    {delayed ? (
                      <TriangleAlert className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Estimated arrival
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        delayed ? "text-rose-200" : "text-white"
                      )}
                    >
                      {courier.etaMinutes} min
                      {delayed && (
                        <span className="ml-1.5 text-xs font-normal text-rose-300">
                          · Delayed
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-bold tabular-nums text-white">
                  {courier.etaMinutes}
                  <span className="ml-0.5 text-xs font-medium text-slate-500">
                    min
                  </span>
                </span>
              </section>
            </div>

            {/* Action bar */}
            <div className="flex gap-2.5 border-t border-white/10 p-4">
              <ActionButton icon={Phone} label="Call" />
              <ActionButton icon={MessageSquare} label="Message" />
              <ActionButton icon={Navigation} label="Reroute" />
            </div>
          </>
        )}
      </aside>
    </>
  );
}
