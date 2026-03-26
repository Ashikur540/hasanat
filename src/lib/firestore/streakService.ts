import {
	doc,
	getDoc,
	setDoc,
	updateDoc,
	serverTimestamp,
	increment,
	writeBatch,
	collection,
	query,
	where,
	getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, subDays, parseISO } from "date-fns";

/**
 * Client-side streak management service
 * Replaces Firebase Functions for streak calculation
 */

interface StreakData {
	userId: string;
	currentStreak: number;
	longestStreak: number;
	lastStreakDate: string;
	updatedAt: any;
}

function getYesterdayDate(): string {
	return format(subDays(new Date(), 1), "yyyy-MM-dd");
}

function getPreviousDate(dateStr: string): string {
	return format(subDays(parseISO(dateStr), 1), "yyyy-MM-dd");
}

/**
 * Check if streak should be reset (client-side midnight check)
 * Call this on app mount
 */
export async function checkStreakReset(userId: string): Promise<void> {
	const streakRef = doc(db, "streaks", userId);
	const streakSnap = await getDoc(streakRef);

	if (!streakSnap.exists()) return;

	const streak = streakSnap.data() as StreakData;
	const today = format(new Date(), "yyyy-MM-dd");
	const yesterday = getYesterdayDate();

	// If lastStreakDate is not yesterday or today → streak is broken
	if (
		streak.lastStreakDate !== today &&
		streak.lastStreakDate !== yesterday
	) {
		await updateDoc(streakRef, {
			currentStreak: 0,
			updatedAt: serverTimestamp(),
		});
	}
}

/**
 * Check if all conditions are met for streak increment
 */
async function checkStreakConditions(
	userId: string,
	date: string,
): Promise<boolean> {
	// 1. Check if all todos are complete
	const todosSnap = await getDocs(
		query(
			collection(db, "todos"),
			where("userId", "==", userId),
			where("date", "==", date),
		),
	);

	const total = todosSnap.size;
	if (total === 0) return false; // No todos = no streak

	const completed = todosSnap.docs.filter((d) => d.data().completed === true)
		.length;
	if (completed < total) return false; // Not all todos complete

	// 2. Check if all 5 prayers are logged
	const requiredPrayers = [
		"prayer_fajr",
		"prayer_dhuhr",
		"prayer_asr",
		"prayer_maghrib",
		"prayer_isha",
	];

	const prayerLogsSnap = await getDocs(
		query(
			collection(db, "deed_logs"),
			where("userId", "==", userId),
			where("date", "==", date),
			where("deedId", "in", requiredPrayers),
		),
	);

	const allPrayersLogged = prayerLogsSnap.size === requiredPrayers.length;

	return allPrayersLogged;
}

/**
 * Update streak if conditions are met
 * Call this after completing a todo or prayer
 */
export async function checkAndUpdateStreak(userId: string): Promise<void> {
	const today = format(new Date(), "yyyy-MM-dd");

	// Check if conditions are met
	const conditionsMet = await checkStreakConditions(userId, today);
	if (!conditionsMet) return;

	const streakRef = doc(db, "streaks", userId);
	const streakSnap = await getDoc(streakRef);

	if (!streakSnap.exists()) {
		// First-ever streak
		await setDoc(streakRef, {
			userId,
			currentStreak: 1,
			longestStreak: 1,
			lastStreakDate: today,
			updatedAt: serverTimestamp(),
		});
		return;
	}

	const streak = streakSnap.data() as StreakData;

	// Already counted today — do nothing
	if (streak.lastStreakDate === today) return;

	const yesterday = getPreviousDate(today);
	const newCurrent =
		streak.lastStreakDate === yesterday ? streak.currentStreak + 1 : 1;
	const newLongest = Math.max(newCurrent, streak.longestStreak);

	await updateDoc(streakRef, {
		currentStreak: newCurrent,
		longestStreak: newLongest,
		lastStreakDate: today,
		updatedAt: serverTimestamp(),
	});
}

/**
 * Update user points (replaces Firebase Function)
 */
export async function updateUserPoints(
	userId: string,
	points: number,
): Promise<void> {
	const userRef = doc(db, "users", userId);
	await setDoc(
		userRef,
		{
			totalPoints: increment(points),
		},
		{ merge: true },
	);
}

/**
 * Complete deed with all side effects (points + streak check)
 * Use this as a single call for completing deeds
 */
export async function completeDeedWithEffects(
	userId: string,
	points: number,
): Promise<void> {
	// 1. Update user points
	await updateUserPoints(userId, points);

	// 2. Check and update streak if conditions met
	await checkAndUpdateStreak(userId);
}

/**
 * Uncomplete deed (subtract points, don't revert streak)
 */
export async function uncompleteDeedWithEffects(
	userId: string,
	points: number,
): Promise<void> {
	// Only subtract points, don't revert streak (once earned, stays until midnight)
	await updateUserPoints(userId, -points);
}
