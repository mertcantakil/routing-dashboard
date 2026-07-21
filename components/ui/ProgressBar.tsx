import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** Fill amount, 0-100. */
  value: number;
  /** Optional explicit tint; otherwise derived from the value. */
  tone?: "auto" | "accent";
  className?: string;
}

function toneClasses(value: number, tone: "auto" | "accent"): string {
  if (tone === "accent") return "from-sky-400 to-cyan-300";
  if (value >= 60) return "from-emerald-400 to-teal-300";
  if (value >= 25) return "from-amber-400 to-yellow-300";
  return "from-rose-500 to-red-400";
}

/**
 * Slim gradient progress bar used for battery/charge level and other metrics.
 */
export function ProgressBar({
  value,
  tone = "auto",
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-hairline/10",
        className
      )}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-gradient-to-r transition-all duration-700 ease-out",
          toneClasses(clamped, tone)
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
