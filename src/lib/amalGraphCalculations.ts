import type { DeedCategory } from "@/data/deeds";
import {
	getTotalDaysInPeriod,
	getRamadanDates,
	type TimeRange,
} from "@/lib/dateUtils";

export interface DeedLog {
	id: string;
	userId: string;
	date: string; // "YYYY-MM-DD"
	deedId: string;
	deedType: "preset" | "custom";
	todoId: string;
	name: string;
	emoji: string;
	category: DeedCategory;
	pointsAtLogTime: number;
}

export interface CategoryBreakdownItem {
	category: DeedCategory;
	deedCount: number;
	consistencyPct: number;
	daysWithThisCat: number;
}

export interface AmalGraphStats {
	heatmapData: Record<string, number>;
	totalDeeds: number;
	activeDays: number;
	consistency: number;
	topCategory: string;
	categoryBreakdown: CategoryBreakdownItem[];
	ramadanHighlight: { show: boolean; streak?: number };
}

export function countToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
	if (count === 0) return 0;
	if (count <= 2) return 1;
	if (count <= 5) return 2;
	if (count <= 9) return 3;
	return 4;
}

export function calculateAmalGraphStats(
	logs: DeedLog[],
	range: TimeRange,
): AmalGraphStats {
	// Heatmap: date → deed count
	const heatmapData: Record<string, number> = {};
	logs.forEach((log) => {
		heatmapData[log.date] = (heatmapData[log.date] || 0) + 1;
	});

	const totalDeeds = logs.length;
	const activeDates = new Set(logs.map((l) => l.date));
	const activeDays = activeDates.size;

	const totalDaysInPeriod = getTotalDaysInPeriod(range);
	const consistency =
		totalDaysInPeriod > 0
			? Math.round((activeDays / totalDaysInPeriod) * 100)
			: 0;

	const categoryCounts: Record<string, number> = {};
	logs.forEach((log) => {
		categoryCounts[log.category] = (categoryCounts[log.category] || 0) + 1;
	});
	const topCategory =
		Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "—";

	const deedcategories = [...new Set(logs.map((l) => l.category))];

	const categoryBreakdown: CategoryBreakdownItem[] = deedcategories
		.map((cat) => {
			const catLogs = logs.filter((l) => l.category === cat);
			const deedCount = catLogs.length;
			const daysWithThisCat = new Set(catLogs.map((l) => l.date)).size;
			const consistencyPct =
				activeDays > 0 ? Math.round((daysWithThisCat / activeDays) * 100) : 0;
			return { category: cat, deedCount, consistencyPct, daysWithThisCat };
		})
		.filter((c) => c.deedCount > 0)
		.sort((a, b) => b.deedCount - a.deedCount);

	// Ramadan highlight: year tab only, shown only when user logged every Ramadan day
	const ramadanDays =
		range === "year" ? getRamadanDates(new Date().getFullYear()) : [];
	const loggedDuringRamadan = ramadanDays.filter((d) => activeDates.has(d));
	const ramadanHighlight =
		range === "year" &&
		ramadanDays.length > 0 &&
		loggedDuringRamadan.length === ramadanDays.length
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
}
