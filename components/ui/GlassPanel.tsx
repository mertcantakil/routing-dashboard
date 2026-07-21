import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes inner padding when the panel wraps its own scroll area. */
  flush?: boolean;
}

/**
 * Frosted-glass surface used across the dashboard. Combines a translucent dark
 * background, backdrop blur, hairline border and soft shadow for a premium feel.
 */
export function GlassPanel({
  className,
  flush = false,
  children,
  ...rest
}: GlassPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-black/40 shadow-glass backdrop-blur-md",
        !flush && "p-4",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
