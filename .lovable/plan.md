

# Phase 1 Build Plan: Hasanat Hub Foundation + Landing Page

The uploaded mockups show polished dashboard and Amal Graph designs with a warm cream/green Islamic aesthetic, stat cards with emojis, a deed checklist with difficulty badges, streak cards, a DeedsCity preview widget, and a GitHub-style heatmap. These will guide all UI decisions.

## What we build now (Phase 1)

### 1. Design System Setup
- Update `index.css` with the Islamic color palette from the mockups: primary greens (`#1A7A4A`, `#2D9E63`), cream background (`#FAFAF8`), dark heading (`#1A3C2A`), gold accent (`#C5A55A`)
- Add Google Fonts: Inter + Noto Naskh Arabic
- Remove `App.css` (unused boilerplate)

### 2. Landing Page (`/`)
- Bismillah header in Arabic calligraphy font
- Hero section: "Track your good deeds. Grow your city." with Get Started / Learn More CTAs
- 3 feature highlight cards: Amal Graph, DeedsCity, Accountability Circles
- How It Works section (3 steps)
- Theological disclaimer footer
- Responsive layout matching the warm, spacious feel of the mockups

### 3. App Shell & Routing
- Top navbar matching mockup style: logo (crescent icon + "Hasanat"), nav links (Dashboard, Amal Graph, DeedsCity, Profile), avatar button
- Bottom tab bar for mobile (5 tabs)
- Sidebar layout component for authenticated pages
- Routes: `/`, `/auth`, `/dashboard`, `/amal-graph`, `/my-city`, `/deeds`, `/profile`, `/settings`, `/leaderboard`, `/circles`, `/ramadan`
- Placeholder pages for each route

### 4. Dashboard Page (`/dashboard`) — Static UI
Matching the uploaded mockup closely:
- Greeting header with Bismillah, user name, Hijri date, streak message
- Stats row: Day Streak, Points Today, Deeds Today (x/y), Global Rank, City Level, This Week mini bars
- Today's Deeds checklist with checkbox, emoji icon, deed name, category label, difficulty badge (EASY/MEDIUM/HARD), points
- Right sidebar: Current Streak card (green bg, fire icon, best streak, freeze count, weekly dots), DeedsCity preview card with "Visit" button, motivational quote card

### 5. Amal Graph Page (`/amal-graph`) — Static UI
Matching the second mockup:
- Stats row: Total Deeds, Best Streak, Active Days, Consistency %, Top Category, Points Total
- Year/Month/Week/Day toggle tabs
- 365-day SVG heatmap (52×7 grid) with green intensity scale and month labels
- Ramadan highlight banner
- Category breakdown cards (Salah, Quran, Dhikr, Sadaqah) with progress bars and percentages

All pages use **mock/hardcoded data** for now. Backend integration comes in Phase 2 after Lovable Cloud setup.

## Files to create/modify

| File | Action |
|---|---|
| `src/index.css` | Update CSS variables with Islamic palette |
| `src/App.css` | Delete |
| `src/App.tsx` | Add all routes |
| `src/components/layout/Navbar.tsx` | Top nav matching mockup |
| `src/components/layout/MobileNav.tsx` | Bottom tab bar |
| `src/components/layout/AppLayout.tsx` | Wrapper with nav + content |
| `src/pages/Index.tsx` | Landing page |
| `src/pages/Dashboard.tsx` | Full dashboard with mock data |
| `src/pages/AmalGraph.tsx` | Heatmap page with mock data |
| `src/pages/Auth.tsx` | Placeholder |
| `src/pages/MyCity.tsx` | Placeholder |
| `src/pages/Deeds.tsx` | Placeholder |
| `src/pages/Profile.tsx` | Placeholder |
| `src/pages/Settings.tsx` | Placeholder |
| `src/pages/Leaderboard.tsx` | Placeholder |
| `src/pages/Circles.tsx` | Placeholder |
| `src/components/dashboard/StatsBar.tsx` | Stat cards row |
| `src/components/dashboard/TodaysDeeds.tsx` | Deed checklist |
| `src/components/dashboard/StreakCard.tsx` | Streak sidebar card |
| `src/components/dashboard/CityPreview.tsx` | DeedsCity preview widget |
| `src/components/amal-graph/Heatmap.tsx` | SVG 365-day grid |
| `src/components/amal-graph/CategoryBreakdown.tsx` | Category cards |

## Tech used
- React + Vite + TypeScript (existing)
- Tailwind CSS + shadcn/ui components (existing)
- Recharts (existing, for weekly trend mini-chart)
- Lucide icons (existing)
- Google Fonts loaded via index.html

