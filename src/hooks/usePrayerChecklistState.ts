import { useState, useEffect } from "react";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";

interface FarzPrayer {
	id: string;
	en: string;
	bn: string;
	emoji: string;
	time: string;
	points: number;
	completed: boolean;
}

const INITIAL_PRAYERS: FarzPrayer[] = [
	{
		id: "fajr",
		en: "Fajr",
		bn: "ফজর",
		emoji: "🌙",
		time: "04:59",
		points: 30,
		completed: false,
	},
	{
		id: "dhuhr",
		en: "Dhuhr",
		bn: "যুহর",
		emoji: "☀️",
		time: "12:10",
		points: 30,
		completed: false,
	},
	{
		id: "asr",
		en: "Asr",
		bn: "আসর",
		emoji: "🌤️",
		time: "15:33",
		points: 30,
		completed: false,
	},
	{
		id: "maghrib",
		en: "Maghrib",
		bn: "মাগরিব",
		emoji: "🌇",
		time: "18:05",
		points: 30,
		completed: false,
	},
	{
		id: "isha",
		en: "Isha",
		bn: "ইশা",
		emoji: "🌙",
		time: "19:20",
		points: 30,
		completed: false,
	},
];

function getTodayKey(): string {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `hasanat-prayers-state-${year}-${month}-${day}`;
}

function loadDayState(key: string): FarzPrayer[] {
	try {
		const stored = localStorage.getItem(key);
		if (stored) {
			const parsedState = JSON.parse(stored);
			return INITIAL_PRAYERS.map((p) => ({
				...p,
				completed: parsedState[p.id]?.completed ?? false,
			}));
		}
	} catch (error) {
		console.error("Failed to load day state from localStorage:", error);
	}
	return INITIAL_PRAYERS.map((p) => ({ ...p, completed: false }));
}

function saveDayState(key: string, prayers: FarzPrayer[]): void {
	try {
		const stateToSave: Record<string, { completed: boolean }> = {};
		prayers.forEach((p) => {
			stateToSave[p.id] = { completed: p.completed };
		});
		localStorage.setItem(key, JSON.stringify(stateToSave));
	} catch (error) {
		console.error("Failed to save day state to localStorage:", error);
	}
}

/**
 * Hook for managing prayer checklist state with localStorage persistence and daily reset.
 * Handles loading/saving prayer completion state, midnight resets, and prayer time updates.
 * @param onAllCompleted Optional callback fired when all prayers are completed
 * @returns Object with prayers state, toggle function, and computed stats
 */
export function usePrayerChecklistState(
	onAllCompleted?: (allCompleted: boolean) => void,
) {
	const [prayers, setPrayers] = useState<FarzPrayer[]>([]);
	const [currentDayKey, setCurrentDayKey] = useState<string>(getTodayKey());
	const { schedule, loading } = usePrayerTimes();

	useEffect(() => {
		const todayKey = getTodayKey();
		setCurrentDayKey(todayKey);
		const loadedPrayers = loadDayState(todayKey);
		setPrayers(loadedPrayers);
	}, []);

	useEffect(() => {
		const checkMidnight = () => {
			const newKey = getTodayKey();
			if (newKey !== currentDayKey) {
				setCurrentDayKey(newKey);
				const resetPrayers = loadDayState(newKey);
				setPrayers(resetPrayers);
			}
		};

		const now = new Date();
		const msUntilMidnight =
			new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
			now.getTime();

		const midnightTimer = setTimeout(() => {
			checkMidnight();
			const dailyInterval = setInterval(checkMidnight, 24 * 60 * 60 * 1000);
			return () => clearInterval(dailyInterval);
		}, msUntilMidnight);

		return () => clearTimeout(midnightTimer);
	}, [currentDayKey]);

	useEffect(() => {
		if (!loading && schedule.length > 0 && prayers.length > 0) {
			setPrayers((prev) =>
				prev.map((p) => {
					const scheduleMatch = schedule.find((s) => s.id === p.id);
					return scheduleMatch ? { ...p, time: scheduleMatch.start } : p;
				}),
			);
		}
	}, [schedule, loading, prayers.length]);

	const completed = prayers.filter((p) => p.completed).length;
	const totalPoints = prayers
		.filter((p) => p.completed)
		.reduce((sum, p) => sum + p.points, 0);
	const progressPct = (completed / prayers.length) * 100;

	const toggle = (id: string) => {
		setPrayers((prev) => {
			const updated = prev.map((p) =>
				p.id === id ? { ...p, completed: !p.completed } : p,
			);
			saveDayState(currentDayKey, updated);
			const allDone = updated.every((p) => p.completed);
			onAllCompleted?.(allDone);
			return updated;
		});
	};

	return {
		prayers,
		setPrayers,
		toggle,
		completed,
		totalPoints,
		progressPct,
		currentDayKey,
	};
}

export type { FarzPrayer };
