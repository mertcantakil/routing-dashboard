# FleetPulse — Live Fleet Tracking Dashboard

A premium, dark-mode real-time courier/vehicle tracking dashboard built with a
full-screen Mapbox 3D map and a glassmorphism control panel.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Mapbox](https://img.shields.io/badge/Mapbox-GL%203D-38bdf8) ![State](https://img.shields.io/badge/State-Zustand-8b5cf6)

## Features

- **Full-screen 3D map** — `mapbox://styles/mapbox/dark-v11` at `pitch: 60`,
  `bearing: -20` with live 3D building extrusions.
- **Smooth courier movement** — markers glide between per-second position
  updates via `transition: all 1s linear` (no jumping).
- **Live data simulation** — 4 virtual couriers patrol Manhattan routes; a mock
  socket emits activity logs every 3–5 seconds.
- **Glassmorphism sidebar** — `backdrop-blur` + `bg-black/40` panels with fleet
  stats, an interactive roster, and an animated live activity feed.
- **Lightweight** — Zustand for state, Lucide for icons, no heavy UI libraries.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- `mapbox-gl` + `react-map-gl`
- Zustand
- Lucide React

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Add your Mapbox token. Copy `.env.example` to `.env.local` and set your key:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_access_token_here
```

Get a free token at <https://account.mapbox.com/access-tokens/>.

3. Run the dev server:

```bash
npm run dev
```

Open <http://localhost:3000>.

## Project structure

```
app/                     Full-screen map page + layout & global styles
components/
  map/                   LiveMap.tsx, CourierMarker.tsx
  sidebar/               FleetStats.tsx, LiveFeed.tsx
  ui/                    GlassPanel, StatusBadge (glassmorphism primitives)
hooks/                   useMockSocket.ts (real-time simulation)
store/                   useFleetStore.ts (Zustand state)
lib/                     fleetData.ts (routes & seed), cn.ts
types/                   Courier, LogEvent, Location interfaces
```

## Notes

- The simulation is entirely client-side; swapping `useMockSocket` for a real
  WebSocket only requires feeding `updateCouriers`/`pushLog` from live data.
