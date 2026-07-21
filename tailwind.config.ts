import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
      },
      colors: {
        // Semantic, theme-aware tokens driven by CSS variables in globals.css.
        // `<alpha-value>` keeps Tailwind opacity modifiers (e.g. bg-glass/60) working.
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        glass: "rgb(var(--glass) / <alpha-value>)",
        hairline: "rgb(var(--hairline) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--ink-subtle) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "#38bdf8",
          soft: "rgba(56, 189, 248, 0.15)",
        },
      },
      boxShadow: {
        // Theme-aware via --glass-shadow (softer in light, deep in dark).
        glass: "var(--glass-shadow)",
        glow: "0 0 20px rgba(56, 189, 248, 0.35)",
      },
      keyframes: {
        "fade-slide-in": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
      animation: {
        "fade-slide-in": "fade-slide-in 0.4s ease-out",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
