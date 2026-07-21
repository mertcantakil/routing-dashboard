"use client";

import { CheckCircle2, Info, Radio, TriangleAlert } from "lucide-react";
import { useFleetStore } from "@/store/useFleetStore";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/cn";
import type { LogLevel } from "@/types";

const LEVEL_META: Record<
  LogLevel,
  { icon: typeof Info; color: string; bg: string }
> = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-300",
    bg: "bg-emerald-400/10",
  },
  info: { icon: Info, color: "text-sky-300", bg: "bg-sky-400/10" },
  warning: {
    icon: TriangleAlert,
    color: "text-amber-300",
    bg: "bg-amber-400/10",
  },
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function LiveFeed() {
  const logs = useFleetStore((s) => s.logs);
  const connected = useFleetStore((s) => s.connected);

  return (
    <GlassPanel flush className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-hairline/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold text-ink">Live activity</h3>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              connected ? "bg-emerald-400" : "bg-ink-subtle"
            )}
          />
          {connected ? "Streaming" : "Offline"}
        </span>
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {logs.length === 0 && (
          <li className="px-1 py-6 text-center text-xs text-ink-subtle">
            Waiting for fleet activity…
          </li>
        )}
        {logs.map((log) => {
          const meta = LEVEL_META[log.level];
          const Icon = meta.icon;
          return (
            <li
              key={log.id}
              className="flex animate-fade-slide-in items-start gap-2.5 rounded-xl border border-hairline/5 bg-hairline/[0.03] px-3 py-2.5"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                  meta.bg,
                  meta.color
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug text-ink/90">
                  {log.message}
                </p>
                <p className="mt-0.5 text-[11px] tabular-nums text-ink-subtle">
                  {formatTime(log.timestamp)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassPanel>
  );
}
