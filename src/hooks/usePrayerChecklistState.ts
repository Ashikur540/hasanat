import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";

import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useAuth } from "@/features/auth";
import {
	createDeedLog,
	deleteDeedLogByTodoId,
} from "@/lib/firestore/deedLogService";
import { format } from "date-fns";
import { db } from "@/lib/firebase";

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
		points: 20,
		completed: false,
	},
	{
		id: "dhuhr",
		en: "Dhuhr",
		bn: "যুহর",
		emoji: "☀️",
		time: "12:10",
		points: 10,
		completed: false,
	},
	{
		id: "asr",
		en: "Asr",
		bn: "আসর",
		emoji: "🌤️",
		time: "15:33",
		points: 10,
		completed: false,
	},
	{
		id: "maghrib",
		en: "Maghrib",
		bn: "মাগরিব",
		emoji: "🌇",
		time: "18:05",
		points: 10,
		completed: false,
	},
	{
		id: "isha",
		en: "Isha",
		bn: "ইশা",
		emoji: "🌙",
		time: "19:20",
		points: 20,
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
	const { user } = useAuth();
	const [prayers, setPrayers] = useState<FarzPrayer[]>([]);
	const [currentDayKey, setCurrentDayKey] = useState<string>(getTodayKey());
	const { schedule, loading } = usePrayerTimes();
	const today = format(new Date(), "yyyy-MM-dd");

	// MOUNT: Load from localStorage first (instant UI), then sync from Firestore
	useEffect(() => {
		const todayKey = getTodayKey();
		setCurrentDayKey(todayKey);

		// 1. Load from localStorage immediately (cache)
		const loadedPrayers = loadDayState(todayKey);
		setPrayers(loadedPrayers);

		// 2. Sync from Firestore deed_logs in background (cross-device sync)
		if (user?.uid) {
			const syncFromFirestore = async () => {
				try {
					const todaysPrayerLogs = await getDocs(
						query(
							collection(db, "deed_logs"),
							where("userId", "==", user.uid),
							where("date", "==", today),
							where("deedId", "in", [
								"prayer_fajr",
								"prayer_dhuhr",
								"prayer_asr",
								"prayer_maghrib",
								"prayer_isha",
							]),
						),
					);

					// Build completed set from Firestore
					const completedPrayers = new Set(
						todaysPrayerLogs.docs.map((doc) => doc.data().deedId),
					);

					// Update state based on Firestore truth
					setPrayers((prev) => {
						const synced = prev.map((p) => ({
							...p,
							completed: completedPrayers.has(`prayer_${p.id}`),
						}));

						// Save synced state back to localStorage (cache update)
						saveDayState(todayKey, synced);

						return synced;
					});
				} catch (error) {
					console.error("Failed to sync prayer state from Firestore:", error);
				}
			};

			syncFromFirestore();
		}
	}, [user?.uid, today]);

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

	const toggle = async (id: string) => {
		if (!user) return;

		const prayer = prayers.find((p) => p.id === id);
		if (!prayer) return;

		const todoId = `prayer_${id}_${today}`;
		const wasCompleted = prayer.completed;

		// 1. Update local state IMMEDIATELY (instant UI feedback)
		setPrayers((prev) => {
			const updated = prev.map((p) =>
				p.id === id ? { ...p, completed: !p.completed } : p,
			);
			saveDayState(currentDayKey, updated);
			return updated;
		});

		// 2. Sync to Firestore in background (don't await - fire and forget)
		try {
			if (!wasCompleted) {
				// Was unchecked, now checking → create deed_log
				await createDeedLog({
					userId: user.uid,
					date: today,
					deedId: `prayer_${id}`,
					deedType: "preset",
					todoId,
					name: `${prayer.en} Prayer`,
					emoji: prayer.emoji,
					category: "Salah",
					pointsAtLogTime: prayer.points,
				});
			} else {
				// Was checked, now unchecking → delete deed_log
				await deleteDeedLogByTodoId(user.uid, todoId);
			}
		} catch (error) {
			console.error(`❌ Failed to sync ${id} to Firestore:`, error);
			// Revert local state on error
			setPrayers((prev) => {
				const reverted = prev.map((p) =>
					p.id === id ? { ...p, completed: wasCompleted } : p,
				);
				saveDayState(currentDayKey, reverted);
				return reverted;
			});
		}
	};

	// Notify parent of completion status changes via useEffect (not during render)
	useEffect(() => {
		if (prayers.length === 0) return;

		const allDone = prayers.every((p) => p.completed);
		onAllCompleted?.(allDone);
	}, [prayers, onAllCompleted]);

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
