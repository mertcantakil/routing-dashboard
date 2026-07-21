import type { CourierStatus } from "@/types";
import { cn } from "@/lib/cn";

const STATUS_META: Record<
  CourierStatus,
  { label: string; dot: string; text: string; ring: string }
> = {
  on_route: {
    label: "On route",
    dot: "bg-sky-400",
    text: "text-sky-300",
    ring: "ring-sky-400/30",
  },
  picking_up: {
    label: "Picking up",
    dot: "bg-amber-400",
    text: "text-amber-300",
    ring: "ring-amber-400/30",
  },
  delivering: {
    label: "Delivering",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    ring: "ring-emerald-400/30",
  },
  idle: {
    label: "Idle",
    dot: "bg-slate-400",
    text: "text-slate-300",
    ring: "ring-slate-400/30",
  },
};

export function StatusBadge({ status }: { status: CourierStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium ring-1",
        meta.text,
        meta.ring
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
