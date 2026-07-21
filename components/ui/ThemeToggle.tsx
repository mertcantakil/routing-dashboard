"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/useThemeStore";
import { cn } from "@/lib/cn";

/**
 * Sun/Moon switch that flips the dashboard between light and dark themes.
 * Renders a stable placeholder until mounted to avoid hydration mismatches.
 */
export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-hairline/10",
        "bg-hairline/5 text-ink-muted transition-colors hover:bg-hairline/10 hover:text-ink"
      )}
    >
      {mounted && isDark ? (
        <Sun className="h-4 w-4" strokeWidth={2.25} />
      ) : (
        <Moon className="h-4 w-4" strokeWidth={2.25} />
      )}
    </button>
  );
}
