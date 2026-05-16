# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: AmalTrack

**"The GitHub for Good Deeds"** — A Muslim-first web app that transforms daily Islamic good deeds (amal) into a visible, living record of spiritual growth. Core metaphor: GitHub contribution graph × Islamic daily practice.

**Key design rules:**

- Leaderboard is always opt-in — users never appear publicly without choosing to
- Points disclaimer must appear on every points/leaderboard screen: _"Points are for your motivation only. The true reward of every deed is with Allah alone."_
- Tone is warm and encouraging, never judgmental or competitive
- Use Arabic terms naturally: Amal, Niyyah, Ajar, Barakah, etc.

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run lint         # ESLint check
npm run test         # Run tests once (Vitest)
npm run test:watch   # Run tests in watch mode
npm run preview      # Preview production build
```

## Stack

- **React 18** + **TypeScript** + **Vite** (SWC)
- **UI:** shadcn/ui (Radix primitives + Tailwind CSS) — components live in `src/components/ui/`
- **3D:** React Three Fiber (R3F) + Drei + Three.js + `@react-three/postprocessing`
- **Routing:** react-router-dom v6 — all authenticated routes wrapped in `AppLayout`
- **State/Data:** TanStack Query — **all data is currently hardcoded, no backend connected**
- **Animation:** Framer Motion
- **i18n:** custom `I18nProvider` at `src/i18n/I18nProvider.tsx` — all UI strings go through `useI18n()` → `t("key")`

## Architecture

### App shell

`src/App.tsx` wraps everything in `QueryClientProvider → I18nProvider → NotificationProvider → TooltipProvider`. All authenticated pages are children of `AppLayout`.

### Pages & Routes

| Route          | Page              | Feature                                                            |
| -------------- | ----------------- | ------------------------------------------------------------------ |
| `/dashboard`   | `Dashboard.tsx`   | Today's deed checklist, streak counter, mini Amal Graph, quick-log |
| `/amal-graph`  | `AmalGraph.tsx`   | 365-day GitHub-style heatmap (the core visual)                     |
| `/my-city`     | `MyCity.tsx`      | DeedCity — 3D city visualization                                   |
| `/deeds`       | `Deeds.tsx`       | Deed library (preset + custom)                                     |
| `/profile`     | `Profile.tsx`     | Public profile page with full Amal Graph and stats                 |
| `/circles`     | `Circles.tsx`     | Accountability groups (halaqah-style)                              |
| `/leaderboard` | `Leaderboard.tsx` | Global opt-in leaderboard                                          |
| `/ramadan`     | `Ramadan.tsx`     | Ramadan mode — seasonal deed tracking                              |
| `/settings`    | `Settings.tsx`    | Notifications, privacy, point preferences                          |

---

## Project Structure

```
src/
├── features/             # Feature-based modules  (Context, hooks, components)
│   ├── auth/            # Auth feature (Context, hooks, components)
│   ├── dashboard/       # Dashboard widgets
│   ├── amal-graph/      # Heatmap & charts
│   ├── city/           # City visualization (3D)
│   ├── deeds/          # Deed cards & dialogs
│   └── profile/        # Profile dialogs
    └── loaderboard/    # loaderboard related hooks, compoenents libs, types , constants
├── components/ui/       # shadcn-ui components
├── layout/              # AppLayout
├── pages/               # Route pages
├── hooks/               # Shared hooks
├── lib/                 # Utilities (firebase, utils)
├── i18n/                # Translations
└── routes/              # React Router config
```

### Feature Pattern

```
src/features/<feature>/
├── index.ts             # Barrel exports
├── *.tsx               # Context/Route files
├── hooks/
│   └── use*.ts         # Feature hooks
└── components/
    └── *.tsx           # Feature components
```

### Imports

```typescript
// From features (use barrel export)
import { useAuth, useAuthActions, GoogleSignInButton } from "@/features/auth";
import { DeedCard, CreateDeedDialog } from "@/features/deeds";
import { Heatmap, CategoryBreakdown } from "@/features/amal-graph";

// From UI components
import { Button } from "@/components/ui/button";
```

### Key Libraries

- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **State**: TanStack Query (server), React Context (client)
- **3D**: React Three Fiber + Drei + @react-three/postprocessing
- **Forms**: react-hook-form + Zod
- **Animation**: Framer Motion

---

### Feature: Amal Graph

The spiritual heart of the product. A 52-week contribution heatmap where each square = one day, color-coded by deed intensity:

- `#EBEDF0` = 0 deeds, `#9BE9A8` = 1–2, `#40C463` = 3–5, `#30A14E` = 6–9, `#1A7A4A` = 10+

### Feature: DeedCity (`/my-city`)

A living 3D city that grows from the user's deed history. Two systems run in parallel:

**Legacy (permanent):** Buildings that never disappear — represent the permanent record of past deeds.

**Vitality (daily):** Garden elements (trees, flowers, butterflies) that bloom or wilt based on last 7 days of activity. First deed after absence triggers a revival animation.

**Deed category → city element mapping:**
| Category | Element |
|----------|---------|
| Salah | Mosque/Masjid |
| Quran | Library |
| Sadaqah | Garden/Market |
| Dhikr | Fountain |
| Character | Community Centre |
| Family | Houses |
| Fasting | Crescent Tower |
| Knowledge | School |

**City milestones** (named Arabic districts): Al-Bidayah (1st deed) → Al-Qaryah (7 deeds) → Al-Hay (30 deeds) → Al-Madinah (100 deeds) → Al-Madina Al-Noor (365 deeds).

#### DeedCity implementation details

- **`MyCity.tsx`** — page shell; holds hardcoded `categoryData` (8 categories with `count`, `vitality`, `emoji`, `element`) and `timeOfDay` state
- **`CityVisualization.tsx`** — the R3F `<Canvas>` scene; all sub-components (`CityScene`, `Environment`, `River`, `TreeMesh`, `BackgroundCity`, `Butterfly`, `BuildingWrapper`, per-building 3D meshes) are **inlined in this one file** — not in separate files
- **`src/components/city/buildings/`** — contains the 2D/isometric building components; the **3D equivalents are in `CityVisualization.tsx`**
- **`BuildingDetail.tsx`** — slide-up panel on building select
- `TimeOfDay` type (`"fajr" | "morning" | "noon" | "evening" | "night"`) is exported from `CityVisualization.tsx` and drives sky colors, lighting, window emissives, and ambient sound

**Active visual upgrade plan:** `DEEDCITY_PLAN.md` — full rendering roadmap (Phases 1–5). Priority order: remove global flatShading patch → add Bloom/SSAO → hemisphere lighting rig → clustered trees → river water material. `@react-three/postprocessing` is already installed.

**Future data hookup (Phase 5 only):** When real data is wired:

- Replace hardcoded `categoryData` in `MyCity.tsx` with API/store data
- `maxCount` in `BuildingWrapper` (currently hardcoded as 156) should come from the user's personal max
- `timeOfDay` can be auto-set from `new Date().getHours()`

### Feature: Deed System

- **80+ preset deeds** across 8 categories, each with hadith reference and base points
- Point tiers: Easy (5pts), Medium (15pts), Hard (30pts), Exceptional (100pts)
- Streak multipliers: 7-day = 1.1×, 30-day = 1.25×, 90-day = 1.5×
- Users can create custom deeds and edit point values of preset deeds

### Feature: Accountability Circles

Private groups of 2–50 (halaqah model). Join by invite link/code only — no open public joining. Circle content is never visible outside the group.

### Hooks

- `useAmbientSounds(timeOfDay)` — plays time-appropriate ambient audio in DeedCity
- `usePrayerTimes` — client-side prayer time calculation (no API — uses Adhan.js model)
- `useNotifications` — notification context
- `use-mobile` — breakpoint detection

## Design System

**Brand colors:**

- Primary Green: `#1A7A4A` (deep forest green)
- Accent Green: `#2D9E63`
- Light Green: `#E8F5EE`
- Dark: `#1A3C2A`
- Background: `#FAFAF8` (warm off-white)

**Typography:** Inter/Plus Jakarta Sans for Latin; Noto Naskh Arabic for Arabic text (deed names, hadith, bismillah).

---

## Comment style

Default: write **no comment**. Code + names should explain "what".

When the "why" isn't obvious (workaround, hidden constraint, subtle invariant), add a JSDoc-style block comment:

- Use `/** … */` blocks, never single `//` runs longer than one line.
- 2–3 lines max. Tight, plain English.
- Explain WHY, never WHAT. The code shows what.
- No jargon (`setDoc merge:true`, "ISP gateway leaks"). Frame in user/business terms ("when the user moves", "ISP, not the user").
- No call-site references ("used by X.tsx") or task references ("added for ticket #123"). Those rot — put them in PR descriptions.
- Never narrate parameters or flags inside the body comment. Trust TypeScript types.

### Good vs Bad

**Bad** (jargon, dense):
```ts
// IP-sourced cache treated as stale — force re-attempt of GPS each session.
// IP geo often returns ISP gateway, not user's real location.
if (parsed.source === "ip") return null;
```

**Good** (plain English, multiline block):
```ts
/**
 * We don't trust IP-based locations — they usually point to the user's
 * internet provider, not where the user actually is. So we ignore any
 * old IP entry and let the browser ask for GPS again.
 */
if (parsed.source === "ip") return null;
```

**Bad** (states what code already shows):
```ts
// Set timezone state to detected value
setTimezoneState(detectedTz);
```

**Good** (no comment — code is self-explanatory):
```ts
setTimezoneState(detectedTz);
```

**Bad** (lists implementation + flags):
```ts
// Apply a resolved location: update state, cache locally, optionally mirror remote.
// `syncRemote=false` avoids the redundant write when we just READ from Firestore.
const applyLocation = useCallback(...)
```

**Good** (purpose + non-obvious edge case):
```ts
/**
 * Saves a freshly resolved location everywhere it needs to live: React
 * state, the local cache, and (if signed in) Firestore. We skip Firestore
 * for IP-based guesses since they're unreliable.
 */
const applyLocation = useCallback(...)
```
