import type { DeedCategory } from "@/data/deeds";
import type { CategoryBreakdownItem } from "@/lib/amalGraphCalculations";

export type AmalLevel =
	| "Al-Bidayah"
	| "Al-Qaryah"
	| "Al-Hay"
	| "Al-Madinah"
	| "Al-Madina Al-Noor";

export interface ProfileData {
	name: string;
	bio: string;
	location: string;
	isPublic: boolean;
	totalPoints: number;
	createdAt: string;
	photoURL: string | null;
	currentStreak: number;
	longestStreak: number;
	totalDeeds: number;
	activeDays: number;
	consistency: number;
	topCategory: string;
	mostLoggedDeed: { name: string; emoji: string; count: number } | null;
	categoryBreakdown: CategoryBreakdownItem[];
	heatmapData: Record<string, number>;
	rank: number | null;
	level: AmalLevel;
}

export const ALL_CATEGORIES: DeedCategory[] = [
	"Salah",
	"Quran",
	"Sadaqah",
	"Dhikr",
	"Character",
	"Family",
	"Fasting",
	"Knowledge",
];

export function computeLevel(totalDeeds: number): AmalLevel {
	if (totalDeeds >= 365) return "Al-Madina Al-Noor";
	if (totalDeeds >= 100) return "Al-Madinah";
	if (totalDeeds >= 30) return "Al-Hay";
	if (totalDeeds >= 7) return "Al-Qaryah";
	return "Al-Bidayah";
}
