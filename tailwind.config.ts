import type { Config } from "tailwindcss";

const config: Config = {
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
        surface: {
          DEFAULT: "rgba(10, 12, 18, 0.7)",
          muted: "rgba(148, 163, 184, 0.08)",
        },
        accent: {
          DEFAULT: "#38bdf8",
          soft: "rgba(56, 189, 248, 0.15)",
        },
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0, 0, 0, 0.45)",
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
