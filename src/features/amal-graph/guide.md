# Amal Graph — Dynamic Implementation Plan

> All decisions finalized through interview.
> Stack: React + Firebase Firestore, client-side calculations only.
> No Cloud Functions needed for this feature.

---

## All Decisions Locked

| Decision              | Answer                                                     |
| --------------------- | ---------------------------------------------------------- |
| Time filter placement | Page-level segmented control in page header (Option A)     |
| Time filter options   | Week / Month / Year                                        |
| Filter controls       | Everything syncs with tab selection                        |
| Best Streak           | Always all-time — never changes with tab                   |
| Points Total          | Always all-time — never changes with tab                   |
| Category breakdown    | Both deed count + consistency % per category               |
| Consistency formula   | Days where category appeared / total active days in period |
| Calculation location  | Client-side from deed_logs (free, sufficient)              |
| Heatmap views         | Year / Month / Week — all three                            |
| Data source           | deed_logs collection only                                  |

---

## What Each Tab Shows

### Year tab (default)

```
Date range:  Jan 1 of current year → today
Heatmap:     52 weeks × 7 days grid (GitHub style)
Stats:
  - Total Deeds     = count of deed_logs in date range
  - Active Days     = count of distinct dates in deed_logs
  - Consistency     = activeDays / daysSinceJan1 × 100
  - Top Category    = category with most deed_logs in range
  - Best Streak     = streaks/{uid}.longestStreak (all-time, static)
  - Points Total    = users/{uid}.totalPoints (all-time, static)
Ramadan Highlight:  visible only on Year tab
Category Breakdown: deed_logs grouped by category, year range
```

### Month tab

```
Date range:  1st of current month → today
Heatmap:     Calendar grid view (week rows, day columns)
Stats:
  - Total Deeds     = deed_logs count this month
  - Active Days     = distinct dates this month
  - Consistency     = activeDays / daysPassedThisMonth × 100
  - Top Category    = category with most deed_logs this month
  - Best Streak     = all-time (unchanged)
  - Points Total    = all-time (unchanged)
Ramadan Highlight:  hidden
Category Breakdown: deed_logs this month only
```

### Week tab

```
Date range:  Last 7 days (today - 6 → today)
Heatmap:     7 columns, 1 row per day, bar chart style
Stats:
  - Total Deeds     = deed_logs count last 7 days
  - Active Days     = distinct dates last 7 days
  - Consistency     = activeDays / 7 × 100
  - Top Category    = category with most deed_logs last 7 days
  - Best Streak     = all-time (unchanged)
  - Points Total    = all-time (unchanged)
Ramadan Highlight:  hidden
Category Breakdown: deed_logs last 7 days only
```

---

## Firestore Query — Single Query Powers Everything

```typescript
// One query per tab selection — no extra queries needed
const getAmalGraphData = async (
	uid: string,
	range: "week" | "month" | "year",
) => {
	const today = getTodayString(); // "2026-03-26"
	const startDate = getStartDate(range); // "2026-01-01" | "2026-03-01" | "2026-03-20"

	const snap = await getDocs(
		query(
			collection(db, "deed_logs"),
			where("userId", "==", uid),
			where("date", ">=", startDate),
			where("date", "<=", today),
			orderBy("date", "asc"),
		),
	);

	return snap.docs.map((d) => d.data() as DeedLog);
	// All calculations happen client-side from this single array
};
```

All stats, heatmap data, and category breakdown are derived from this one array. No additional queries.

---

## Client-Side Calculations

```typescript
const calculateAmalGraphStats = (logs: DeedLog[], range: TimeRange) => {
	// ── Heatmap data ──────────────────────────────────────────────
	// Group by date → count per date
	const heatmapData: Record<string, number> = {};
	logs.forEach((log) => {
		heatmapData[log.date] = (heatmapData[log.date] || 0) + 1;
	});
	// Returns: { "2026-03-20": 3, "2026-03-21": 5, ... }

	// ── Total deeds ───────────────────────────────────────────────
	const totalDeeds = logs.length;

	// ── Active days ───────────────────────────────────────────────
	const activeDates = new Set(logs.map((l) => l.date));
	const activeDays = activeDates.size;

	// ── Consistency % ─────────────────────────────────────────────
	const totalDaysInPeriod = getTotalDaysInPeriod(range);
	const consistency = Math.round((activeDays / totalDaysInPeriod) * 100);

	// ── Top category ──────────────────────────────────────────────
	const categoryCounts: Record<string, number> = {};
	logs.forEach((log) => {
		categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
	});
	const topCategory =
		Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";

	// ── Category breakdown ────────────────────────────────────────
	const categories = [
		"Salah",
		"Quran",
		"Sadaqah",
		"Dhikr",
		"Character",
		"Family",
		"Fasting",
		"Knowledge",
	];

	const categoryBreakdown = categories
		.map((cat) => {
			const catLogs = logs.filter((l) => l.category === cat);

			// Deed count
			const deedCount = catLogs.length;

			// Consistency: days where this category appeared / active days
			const daysWithThisCat = new Set(catLogs.map((l) => l.date)).size;
			const consistencyPct =
				activeDays > 0 ? Math.round((daysWithThisCat / activeDays) * 100) : 0;

			return { category: cat, deedCount, consistencyPct, daysWithThisCat };
		})
		// Filter out categories with 0 deeds
		.filter((c) => c.deedCount > 0)
		// Sort by deed count descending
		.sort((a, b) => b.deedCount - a.deedCount);

	// ── Ramadan highlight (Year tab only) ─────────────────────────
	// Check if user logged deeds every day during Ramadan
	// Ramadan 1447: Feb 28 – Mar 29, 2026 (approximate, use Hijri calc)
	const ramadanDays = getRamadanDates(2026); // array of "YYYY-MM-DD" strings
	const loggedDuringRamadan = ramadanDays.filter((d) => activeDates.has(d));
	const ramadanHighlight =
		range === "year" && loggedDuringRamadan.length === ramadanDays.length
			? { show: true, streak: loggedDuringRamadan.length }
			: { show: false };

	return {
		heatmapData,
		totalDeeds,
		activeDays,
		consistency,
		topCategory,
		categoryBreakdown,
		ramadanHighlight,
	};
};
```

---

## Heatmap Rendering — 3 Views

### Year view — GitHub-style grid

```
52 columns (weeks) × 7 rows (Mon–Sun)
Each cell = one day
Color intensity = deed count that day:
  0 deeds  → #E4EDE7 (empty grey-green)
  1-2      → #9BDBB8 (light green)
  3-5      → #4DBF86 (medium green)
  6-9      → #2D9660 (rich green)
  10+      → #1A5C38 (deep forest green)

Hover tooltip: "March 26 · 5 deeds · +45 pts"
Future dates:  transparent / invisible
```

### Month view — Calendar grid

```
Rows = weeks of the month
Columns = Mon Tue Wed Thu Fri Sat Sun
Each cell shows: day number + color intensity
Today = highlighted with border
Empty cells for days before month start
```

### Week view — Bar chart

```
7 columns = last 7 days
Each column = vertical bar, height proportional to deed count
Day label below: "Mon", "Tue" etc
Today's bar = highlighted with forest green
Zero day = flat grey line (not invisible — shows the gap)
```

---

## Stat Cards — Static vs Dynamic

```typescript
// These read from deed_logs — update when tab changes
const DYNAMIC_STATS = [
	{ key: "totalDeeds", label: "TOTAL DEEDS", icon: "📊" },
	{ key: "activeDays", label: "ACTIVE DAYS", icon: "🗓" },
	{ key: "consistency", label: "CONSISTENCY", icon: "📈", suffix: "%" },
	{ key: "topCategory", label: "TOP CATEGORY", icon: "🕌" },
];

// These NEVER change with tab — always all-time
const STATIC_STATS = [
	{
		key: "longestStreak",
		label: "BEST STREAK",
		icon: "🔥",
		source: "streaks/{uid}",
	},
	{
		key: "totalPoints",
		label: "POINTS TOTAL",
		icon: "⭐",
		source: "users/{uid}",
	},
];
```

Show a subtle "all time" label under static stats so user understands why they don't change:

```
⭐
4,280
POINTS TOTAL
all time ←── subtle muted label
```

---

## Loading Strategy

```
1. Page mounts → show skeleton placeholders for all stats + heatmap
2. Fetch deed_logs for default tab (Year)
3. Simultaneously fetch streaks/{uid} + users/{uid} (static stats)
4. When deed_logs arrive → calculate all stats client-side → render
5. Tab switch → show loading shimmer on dynamic areas only
   (static stats don't shimmer — they don't change)
6. Cache results per tab: { week: [...], month: [...], year: [...] }
   → Switching back to a previous tab is instant (no refetch)
```

---

## useAmalGraph Hook

```typescript
// hooks/useAmalGraph.ts

interface AmalGraphData {
	heatmapData: Record<string, number>;
	totalDeeds: number;
	activeDays: number;
	consistency: number;
	topCategory: string;
	categoryBreakdown: CategoryBreakdownItem[];
	ramadanHighlight: { show: boolean; streak?: number };
	longestStreak: number; // all-time, from streaks/{uid}
	totalPoints: number; // all-time, from users/{uid}
	loading: boolean;
}

export const useAmalGraph = (
	range: "week" | "month" | "year",
): AmalGraphData => {
	// Cache: store results per range to avoid refetching on tab switch
	const [cache, setCache] = useState<Record<string, DeedLog[]>>({});
	const [staticData, setStaticData] = useState({
		longestStreak: 0,
		totalPoints: 0,
	});
	const [loading, setLoading] = useState(true);

	// Fetch static data once on mount
	useEffect(() => {
		fetchStaticData(uid).then(setStaticData);
	}, [uid]);

	// Fetch deed_logs when range changes (use cache if available)
	useEffect(() => {
		if (cache[range]) {
			setLoading(false);
			return;
		}
		setLoading(true);
		fetchDeedLogs(uid, range).then((logs) => {
			setCache((prev) => ({ ...prev, [range]: logs }));
			setLoading(false);
		});
	}, [range, uid]);

	const logs = cache[range] || [];
	const stats = calculateAmalGraphStats(logs, range);

	return { ...stats, ...staticData, loading };
};
```

---

## Composite Index Needed

```
deed_logs:  userId ASC + date ASC
deed_logs:  userId ASC + date ASC + category ASC  (if filtering by category later)
```

The first index likely already exists from dashboard implementation. Verify in Firebase console before building.

---

## File Touch Map

```
[NEW]  src/hooks/useAmalGraph.ts
[NEW]  src/lib/amalGraphCalculations.ts   — all pure calculation functions
[NEW]  src/lib/dateUtils.ts               — getStartDate(), getRamadanDates() etc
[NEW]  src/components/graph/HeatmapYear.tsx
[NEW]  src/components/graph/HeatmapMonth.tsx
[NEW]  src/components/graph/HeatmapWeek.tsx
[NEW]  src/components/graph/CategoryBreakdown.tsx
[NEW]  src/components/graph/AmalStatCards.tsx
[MOD]  src/pages/AmalGraph.tsx
         - Add TimeRange state (default: "year")
         - Move segmented control to page header
         - Remove hardcoded mock data
         - Wire useAmalGraph hook
         - Pass range to all child components
```

---

## Build Order

```
Phase 1 — Pure calculation logic (no UI, easy to test)
  1. src/lib/dateUtils.ts
     - getTodayString()
     - getStartDate(range)
     - getTotalDaysInPeriod(range)
     - getRamadanDates(year)
     - getYesterdayString()

  2. src/lib/amalGraphCalculations.ts
     - calculateAmalGraphStats(logs, range)
     - All pure functions, no Firebase, easy to unit test

Phase 2 — Data hook
  3. useAmalGraph(range) hook
     - Firestore query
     - Cache logic
     - Static data fetch

Phase 3 — Heatmap components
  4. HeatmapYear.tsx  — 52×7 grid
  5. HeatmapMonth.tsx — calendar grid
  6. HeatmapWeek.tsx  — 7-bar chart

Phase 4 — Stats + breakdown
  7. AmalStatCards.tsx — dynamic + static cards with "all time" label
  8. CategoryBreakdown.tsx — deed count + consistency bars

Phase 5 — Page wiring
  9. AmalGraph.tsx
     - Segmented control in header (Week / Month / Year)
     - Wire all components
     - Remove all mock data
     - Loading skeletons
```

---

## Category Breakdown Card Design

```
Category Breakdown             ← section title

🕌 Salah
   156 deeds · 6/7 days this week        78% consistency
   ████████████████████░░░░░░░░░░░░░░    [78%]

📖 Quran
   89 deeds · 4/7 days this week         57% consistency
   ████████████░░░░░░░░░░░░░░░░░░░░░░    [57%]

📿 Dhikr
   45 deeds · 3/7 days this week         43% consistency
   ████████░░░░░░░░░░░░░░░░░░░░░░░░░░    [43%]
```

Progress bar fill = consistency % (0–100%)
Color: forest green (#1A5C38) for bars above 50%, amber for 25–50%, rose for below 25%
This gives instant visual feedback — green = healthy habit, amber = needs attention, rose = rarely practiced

---

## What is NOT in this phase

- [ ] Comparing current period vs previous period (e.g. "↑ 12% vs last month")
- [ ] Export graph as image / share screenshot
- [ ] Per-deed drill down (click a heatmap cell → see which deeds that day)
- [ ] Personal goals per category (Feeling 2)
- [ ] Filtering heatmap by category
- [ ] Streak visualization on heatmap (highlight streak days differently)

```

```
