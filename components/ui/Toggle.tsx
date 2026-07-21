import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  icon?: LucideIcon;
}

/**
 * Compact glassmorphism switch row used inside the Layer Control menu.
 */
export function Toggle({ checked, onChange, label, icon: Icon }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-hairline/5"
    >
      <span className="flex items-center gap-2.5">
        {Icon && (
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              checked ? "bg-accent/15 text-accent" : "bg-hairline/5 text-ink-muted"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <span className="text-sm font-medium text-ink/90">{label}</span>
      </span>

      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent" : "bg-hairline/20"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}
