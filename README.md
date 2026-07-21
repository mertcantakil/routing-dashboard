# FleetPulse — Live Fleet Tracking Dashboard

A premium, dark-mode real-time courier & vehicle tracking dashboard built around a
full-screen Mapbox 3D map and a glassmorphism control panel. Designed with a
production-grade, "Premium template" aesthetic: subtle glows, blur, thin fonts
and smooth micro-interactions.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![Mapbox](https://img.shields.io/badge/Mapbox-GL%203D-38bdf8) ![State](https://img.shields.io/badge/State-Zustand-8b5cf6) ![Styling](https://img.shields.io/badge/Tailwind-CSS-06b6d4) ![Language](https://img.shields.io/badge/TypeScript-strict-3178c6)

## Overview

FleetPulse simulates a live logistics operations center. Four virtual couriers
patrol Manhattan on bikes, scooters and vans while their positions, battery,
speed, ETA and order details stream into the UI in real time. Everything runs
client-side through a mock socket, so you can explore the full experience with
nothing more than a Mapbox token.

## Features

- **Full-screen 3D map** — `mapbox://styles/mapbox/dark-v11` at `pitch: 60` /
  `bearing: -20` with live 3D building extrusions.
- **Smooth courier movement** — markers glide between per-second position
  updates via CSS transitions (no jumping), rotated to match live heading.
- **Live data simulation** — a mock socket (`useMockSocket`) moves couriers and
  emits activity-log events every few seconds.
- **Toggleable map overlays** — a top-right Layer Control switches an order
  **heatmap**, the service-area **geofence** and a **traffic** layer on/off.
- **Courier roster + search** — filter the fleet by name, callsign, order or id
  straight from the sidebar.
- **Slide-in detail drawer** — click any courier (marker or roster) to open a
  live drawer with vehicle, plate, battery, ETA, current order and delivery notes.
- **Glassmorphism UI** — `backdrop-blur` + `bg-black/40` panels for fleet stats,
  an animated live activity feed and status badges.
- **Lightweight** — Zustand for state, Lucide for icons, no heavy UI libraries.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- `mapbox-gl` + `react-map-gl`
- Zustand (state management)
- Lucide React (icons)

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Add your Mapbox token. Create a `.env.local` file in the project root and set
   your key:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_access_token_here
```

Get a free token at <https://account.mapbox.com/access-tokens/>.

3. Run the dev server:

```bash
npm run dev
```

Open <http://localhost:3000>.

### Available scripts

| Script          | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the Next.js dev server      |
| `npm run build` | Create a production build         |
| `npm run start` | Serve the production build        |
| `npm run lint`  | Run ESLint (`eslint-config-next`) |

## Project structure

```
app/                     Full-screen dashboard page + layout & global styles
components/
  map/                   LiveMap.tsx, CourierMarker.tsx, LayerControl.tsx
  sidebar/               FleetStats.tsx, LiveFeed.tsx, CourierSearch.tsx
  drawer/                CourierDetailDrawer.tsx (slide-in courier detail)
  ui/                    GlassPanel, StatusBadge, Toggle, ProgressBar (primitives)
hooks/                   useMockSocket.ts (real-time simulation)
store/                   useFleetStore.ts (Zustand state + selectors)
lib/                     fleetData.ts (routes & seed), mapData.ts (heatmap/geofence), cn.ts
types/                   Courier, LogEvent, Location, LayerToggles interfaces
```

## Architecture notes

- **State** lives in a single Zustand store (`useFleetStore`) holding the
  courier roster, activity logs, selected courier, connection status, the search
  query and overlay layer toggles. A derived `useSelectedCourier` selector keeps
  the detail drawer in sync with every position tick.
- **Simulation** is entirely client-side. Swapping `useMockSocket` for a real
  WebSocket only requires feeding `updateCouriers` / `pushLog` from live data —
  no component changes needed.
- **Map overlays** (`lib/mapData.ts`) ship as static GeoJSON: an order-density
  heatmap and the Manhattan service-area geofence polygon.

## License

Private / proprietary template. Not for redistribution.
