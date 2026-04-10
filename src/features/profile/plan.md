# Plan: Dynamic Profile Page — Deed Categories + Shareable Card

## Context

The Profile page (`src/pages/Profile.tsx`) is entirely hardcoded — every stat, category count, streak, badge, and heatmap cell is static demo data. The backend (Firestore) already stores everything needed: `deed_logs`, `streaks`, `users`, and `leaderboard` documents are live. This plan wires the Profile to real data, starting with the **Overview tab → Deed Categories section**, and adds a **shareable WebGL-style card** (canvas-based PNG export) for social sharing.

The profile can also be viewed by other users via a share link, so the data layer must be parameterized by `userId`, not locked to the signed-in user.

---

## What to Show on the Profile (Data Ideation)

### Header

- Name, bio, location, joined date — from `users/{userId}` doc
- Level badge (Al-Bidayah → Al-Qaryah → Al-Hay → Al-Madinah → Al-Madina Al-Noor) — computed from `totalDeeds`
- Public/private indicator — from `users.isPublic`

### Stats Row

- **Total Deeds** — count of all `deed_logs` for user
- **Total Points** — from `users.totalPoints` (+ disclaimer tooltip per CLAUDE.md)
- **Current Streak** — from `streaks.currentStreak`
- **Rank** — from `leaderboard.allTimePoints` position (top-10 check)

### Overview Tab

- **Deed Categories** — all 8 categories with count + progress bar (relative to max) — from `deed_logs` grouped by category
  - Info icon (ⓘ) next to "Deed Categories" heading with tooltip: _"This shows how your deeds are distributed across categories — based on your full history. The bar reflects how each category compares to your strongest one."_
- **Streak cards** — currentStreak, longestStreak — from `streaks` doc
- **Highlights** — top category, consistency %, most logged specific deed

### Badges Tab

- **Coming Soon overlay** — semi-transparent overlay covering the entire tab content with a centered "Coming Soon" message. No badge logic implemented in this release.

### Activity Tab

- 7-week heatmap grid — **dynamic** from `heatmapData` derived from real `deed_logs` (last 7 weeks)

### Shareable Card (PNG export)

- Mini 7×7 heatmap, name + level, total deeds + streak, app URL
- Exported as PNG via `html-to-image` library

---

## Architecture

### New files to create

1. `src/features/profile/types.ts` — `ProfileData`, `AmalLevel` types
2. `src/features/profile/hooks/useProfileData.ts` — main data hook (3 TanStack Query queries)
3. `src/features/profile/components/ProfileCategoryList.tsx` — replaces hardcoded categories
4. `src/features/profile/components/ProfileShareCard.tsx` — off-screen card for PNG export

### Files to modify

5. `src/features/profile/index.ts` — add new exports
6. `src/routes/index.tsx` — add `/profile/:userId` route for public profiles
7. `src/pages/Profile.tsx` — replace all hardcoded values with hook data
8. `src/features/profile/EditProfileDialog.tsx` — write back to Firestore on save
9. `src/features/profile/ShareProfileDialog.tsx` — add "Download Card" button + ProfileShareCard

---

## Implementation Steps

### Step 1: `src/features/profile/types.ts`

```typescript
export type AmalLevel =
	| "Al-Bidayah"
	| "Al-Qaryah"
	| "Al-Hay"
	| "Al-Madinah"
	| "Al-Madina Al-Noor";

export interface ProfileData {
	// From users/{userId}
	name: string;
	bio: string;
	location: string;
	isPublic: boolean;
	totalPoints: number;
	createdAt: string; // formatted "MMM yyyy"
	// From streaks/{userId}
	currentStreak: number;
	longestStreak: number;
	// Computed from deed_logs
	totalDeeds: number;
	activeDays: number;
	consistency: number;
	topCategory: string;
	mostLoggedDeed: { name: string; emoji: string; count: number } | null;
	categoryBreakdown: CategoryBreakdownItem[]; // always 8 items, zero-padded
	heatmapData: Record<string, number>;
	// From leaderboard
	rank: number | null;
	// Computed
	level: AmalLevel;
}
```

### Step 2: `src/features/profile/hooks/useProfileData.ts`

Three parallel TanStack Query calls:

- **Q1** `["profile", "user", userId]` → `getDoc("users", userId)` + `getDoc("streaks", userId)` (Promise.all)
- **Q2** `["profile", "logs", userId]` → `getDocs(deed_logs where userId == userId)` → passed to `calculateAmalGraphStats("year")`
- **Q3** `["profile", "rank", userId]` → `fetchTopLeaderboard("allTime")` → find user's position

**Level computation:**

```typescript
function computeLevel(totalDeeds: number): AmalLevel {
	if (totalDeeds >= 365) return "Al-Madina Al-Noor";
	if (totalDeeds >= 100) return "Al-Madinah";
	if (totalDeeds >= 30) return "Al-Hay";
	if (totalDeeds >= 7) return "Al-Qaryah";
	return "Al-Bidayah";
}
```

**Key decision:** Do NOT reuse `useAmalGraph` — it is tied to `useAuth()` and can't fetch for another user. Write a new parameterized fetch.

**Pitfall:** `calculateAmalGraphStats("year")` only includes the last 52 weeks in its consistency calc, but since we pass ALL logs unfiltered, the `categoryBreakdown` correctly reflects all-time data.

### Step 3: `src/features/profile/components/ProfileCategoryList.tsx`

- Takes `categoryBreakdown: CategoryBreakdownItem[]`
- Zero-pads all 8 categories using `ALL_CATEGORIES` constant
- Progress bar = `(count / maxCount) * 100`
- Emojis/colors from `CATEGORY_INFO` in `src/data/deeds.ts`
- **Info icon** next to "Deed Categories" heading using `<TooltipProvider>` + `<Tooltip>` from `src/components/ui/tooltip.tsx`
  - Tooltip text: _"This shows how your deeds are distributed across categories — based on your full history. The bar reflects how each category compares to your strongest one."_
  - Use a small `Info` icon from `lucide-react` (already used elsewhere in the project)

### Step 4: Update `src/routes/index.tsx`

Add: `{ path: "/profile/:userId", element: <Profile /> }` alongside existing `/profile` route.

### Step 4b: Badges Tab — "Coming Soon" overlay

- Keep existing badge card markup as-is (no changes to the badge UI structure)
- Wrap the tab content in a `relative` container
- Add an absolute overlay `div` covering 100% width/height with:
  - Semi-transparent background (`bg-background/80 backdrop-blur-sm`)
  - Centered text: a lock or sparkle icon + **"Coming Soon"** heading + short line _"Badges are being crafted. Check back soon!"_
  - Use `z-10` so it sits above the existing content

### Step 4c: Activity Tab — dynamic heatmap

- Last 7 weeks (49 days) of data from `data.heatmapData`
- Convert date counts to 0–4 levels using `countToLevel` from `src/lib/amalGraphCalculations.ts`:
  - 0 deeds → level 0, 1–2 → 1, 3–5 → 2, 6–9 → 3, 10+ → 4
- Map levels to colors: `["#EBEDF0", "#9BE9A8", "#40C463", "#30A14E", "#1A7A4A"]`
- Replace the existing `activityData` pseudorandom array with:

```typescript
const activityData = Array.from({ length: 49 }, (_, i) => {
	const date = format(subDays(today, 48 - i), "yyyy-MM-dd");
	return countToLevel(data.heatmapData[date] ?? 0);
});
```

### Step 5: Rewrite `src/pages/Profile.tsx`

```typescript
const { userId: paramUserId } = useParams();
const { user } = useAuth();
const targetUserId = paramUserId ?? user?.uid ?? "";
const isOwner = !paramUserId || paramUserId === user?.uid;
const { data, loading, error } = useProfileData(targetUserId);
```

- Replace all `defaultUser.*` and `stats.*` with `data.*`
- Render `<ProfileCategoryList breakdown={data.categoryBreakdown} />` in Overview tab
- Render heatmap from `data.heatmapData` (convert counts to levels 0-4 using `countToLevel`)
- Show "This profile is private" guard if `!data.isPublic && !isOwner`
- Add loading skeletons via `<Skeleton />` for each section

### Step 6: Upgrade `EditProfileDialog.tsx`

On save, call `updateDoc(doc(db, "users", uid), { name, bio, location, isPublic })` then invalidate `["profile", "user", uid]` query key.

### Step 7: `src/features/profile/components/ProfileShareCard.tsx`

- Fixed 480×240px off-screen `div` (positioned at `-9999px`, NOT `display:none`)
- Renders: app logo text, avatar initials, name + level, 7×7 inline heatmap (plain divs), key stats, URL
- Heatmap uses inline styles with 5 hardcoded colors (no external components — html2canvas friendly)

### Step 8: Upgrade `ShareProfileDialog.tsx`

- Accept `heatmapData` + `username` props
- Render `<ProfileShareCard ref={cardRef} ... />` inside dialog
- Add "Download Card" button:

```typescript
import { toPng } from "html-to-image";
const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
```

---

## Reusable Functions to Leverage

| Function                  | File                                                 | Usage                                       |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| `calculateAmalGraphStats` | `src/lib/amalGraphCalculations.ts`                   | Category breakdown + heatmap data           |
| `countToLevel`            | `src/lib/amalGraphCalculations.ts`                   | Convert deed count to 0-4 level for heatmap |
| `fetchTopLeaderboard`     | `src/features/leaderboard/lib/leaderboardService.ts` | Get rank from top-10 list                   |
| `CATEGORY_INFO`           | `src/data/deeds.ts`                                  | Emoji + color per category                  |
| `Skeleton`                | `src/components/ui/skeleton.tsx`                     | Loading states                              |

---

## Verification

1. `npm run dev` — visit `/profile` as logged-in user → real deed counts appear in categories
2. Log a new deed → refresh profile → count increases
3. Visit `/profile/:anotherUserId` → shows that user's public data without edit button
4. Click "Share" → "Download Card" → PNG file downloads with real heatmap
5. Private profile: set `isPublic: false` → visiting via share link shows private message
6. `npm run lint` — no new TypeScript errors
