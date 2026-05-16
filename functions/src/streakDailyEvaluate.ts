import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

import { shiftDate, userLocalDate, userLocalHour } from "./lib/time.js";

if (!admin.apps.length) admin.initializeApp();

const REQUIRED_PRAYER_IDS = [
	"prayer_fajr",
	"prayer_dhuhr",
	"prayer_asr",
	"prayer_maghrib",
	"prayer_isha",
];

const db = (): admin.firestore.Firestore => admin.firestore();

export { shiftDate, userLocalDate, userLocalHour };

// --- Streak evaluation (pure) ---

export interface IncrementInputs {
	yesterdayTotal: number;
	yesterdayCompleted: number;
	yesterdayPrayersLogged: number;
	currentStreak: number;
	lastStreakDate: string | null | undefined;
	yesterday: string;
}

export interface IncrementOutcome {
	action: "increment" | "start" | "reset" | "skip";
	newStreak: number;
	reason:
		| "passed-continuation"
		| "passed-fresh"
		| "failed-stale-reset"
		| "failed-keep"
		| "passed-already-recorded";
}

/**
 * Pure decision function: given yesterday's totals + current streak state,
 * decides whether to increment / start / reset / skip the streak.
 * No Firestore IO — easy to unit-test boundary cases.
 */
export function evaluateStreakIncrement(
	inputs: IncrementInputs,
): IncrementOutcome {
	const {
		yesterdayTotal,
		yesterdayCompleted,
		yesterdayPrayersLogged,
		currentStreak,
		lastStreakDate,
		yesterday,
	} = inputs;

	const todosOk =
		yesterdayTotal === 0 || yesterdayCompleted === yesterdayTotal;
	const prayersOk = yesterdayPrayersLogged === REQUIRED_PRAYER_IDS.length;
	const passed = todosOk && prayersOk;

	if (passed) {
		if (lastStreakDate === yesterday) {
			return {
				action: "skip",
				newStreak: currentStreak,
				reason: "passed-already-recorded",
			};
		}
		const dayBeforeYesterday = shiftDate(yesterday, -1);
		if (lastStreakDate === dayBeforeYesterday) {
			return {
				action: "increment",
				newStreak: currentStreak + 1,
				reason: "passed-continuation",
			};
		}
		return { action: "start", newStreak: 1, reason: "passed-fresh" };
	}

	// Failed
	if (currentStreak <= 0) {
		return { action: "skip", newStreak: 0, reason: "failed-keep" };
	}
	const dayBeforeYesterday = shiftDate(yesterday, -1);
	if (lastStreakDate === yesterday || lastStreakDate === dayBeforeYesterday) {
		return {
			action: "skip",
			newStreak: currentStreak,
			reason: "failed-keep",
		};
	}
	return { action: "reset", newStreak: 0, reason: "failed-stale-reset" };
}

// --- Per-user processing (Firestore IO) ---

interface UserResult {
	uid: string;
	processed: boolean;
	streakAction?: IncrementOutcome["action"];
	carriedCount?: number;
	skippedReason?: string;
}

/**
 * Per-user streak evaluation: only runs at the user's local midnight hour.
 * Reads yesterday's todos + prayer logs, applies pure eval, writes streak
 * + leaderboard updates, then carries incomplete todos forward to today.
 */
async function processUser(
	firestore: admin.firestore.Firestore,
	userDoc: admin.firestore.QueryDocumentSnapshot,
	now: Date,
): Promise<UserResult> {
	const uid = userDoc.id;
	const tz = userDoc.get("timezone") as string | undefined;
	if (!tz) return { uid, processed: false, skippedReason: "no-timezone" };

	let localHour: number;
	let today: string;
	let yesterday: string;
	try {
		localHour = userLocalHour(tz, now);
		today = userLocalDate(tz, now);
		yesterday = shiftDate(today, -1);
	} catch {
		return { uid, processed: false, skippedReason: "invalid-timezone" };
	}

	if (localHour !== 0) {
		return { uid, processed: false, skippedReason: "not-midnight" };
	}

	// Read yesterday todos + prayer logs in parallel
	const [todosSnap, prayerLogsSnap, streakSnap] = await Promise.all([
		firestore
			.collection("todos")
			.where("userId", "==", uid)
			.where("date", "==", yesterday)
			.get(),
		firestore
			.collection("deed_logs")
			.where("userId", "==", uid)
			.where("date", "==", yesterday)
			.where("deedId", "in", REQUIRED_PRAYER_IDS)
			.get(),
		firestore.collection("streaks").doc(uid).get(),
	]);

	const yesterdayTotal = todosSnap.size;
	const yesterdayCompleted = todosSnap.docs.filter(
		(d) => d.get("completed") === true,
	).length;
	// Dedup deed_logs by deedId in case of duplicates
	const loggedPrayerIds = new Set(
		prayerLogsSnap.docs.map((d) => d.get("deedId") as string),
	);
	const yesterdayPrayersLogged = loggedPrayerIds.size;

	const streakData = streakSnap.exists ? streakSnap.data() ?? {} : {};
	const currentStreak = Number(streakData.currentStreak) || 0;
	const longestStreak = Number(streakData.longestStreak) || 0;
	const lastStreakDate = streakData.lastStreakDate as string | undefined;

	const outcome = evaluateStreakIncrement({
		yesterdayTotal,
		yesterdayCompleted,
		yesterdayPrayersLogged,
		currentStreak,
		lastStreakDate,
		yesterday,
	});

	// Apply streak change
	if (outcome.action === "increment" || outcome.action === "start") {
		const newLongest = Math.max(longestStreak, outcome.newStreak);
		await firestore.collection("streaks").doc(uid).set(
			{
				userId: uid,
				currentStreak: outcome.newStreak,
				longestStreak: newLongest,
				lastStreakDate: yesterday,
				updatedAt: admin.firestore.FieldValue.serverTimestamp(),
			},
			{ merge: true },
		);
		await firestore.collection("leaderboard").doc(uid).set(
			{
				currentStreak: outcome.newStreak,
				updatedAt: admin.firestore.FieldValue.serverTimestamp(),
			},
			{ merge: true },
		);
	} else if (outcome.action === "reset") {
		await firestore.collection("streaks").doc(uid).update({
			currentStreak: 0,
			updatedAt: admin.firestore.FieldValue.serverTimestamp(),
		});
		await firestore.collection("leaderboard").doc(uid).set(
			{
				currentStreak: 0,
				updatedAt: admin.firestore.FieldValue.serverTimestamp(),
			},
			{ merge: true },
		);
	}

	// Carry-forward: incomplete yesterday todos → today (dedup by deedId)
	const incomplete = todosSnap.docs.filter(
		(d) => d.get("completed") !== true,
	);
	let carriedCount = 0;
	if (incomplete.length > 0) {
		const todayTodosSnap = await firestore
			.collection("todos")
			.where("userId", "==", uid)
			.where("date", "==", today)
			.get();
		const existingDeedIds = new Set(
			todayTodosSnap.docs.map((d) => d.get("deedId") as string),
		);

		const toCarry = incomplete.filter(
			(d) => !existingDeedIds.has(d.get("deedId") as string),
		);

		// Batch in chunks of 500
		for (let i = 0; i < toCarry.length; i += 500) {
			const batch = firestore.batch();
			const chunk = toCarry.slice(i, i + 500);
			for (const src of chunk) {
				const data = src.data();
				const newRef = firestore.collection("todos").doc();
				batch.set(newRef, {
					userId: uid,
					date: today,
					deedId: data.deedId,
					deedType: data.deedType,
					name: data.name,
					emoji: data.emoji,
					category: data.category,
					difficulty: data.difficulty,
					points: data.points,
					completed: false,
					completedAt: null,
					addedAt: admin.firestore.FieldValue.serverTimestamp(),
					carriedFrom: src.id,
				});
				carriedCount++;
			}
			await batch.commit();
		}
	}

	logger.info("streak-eval user", {
		uid,
		tz,
		yesterday,
		yesterdayTotal,
		yesterdayCompleted,
		yesterdayPrayersLogged,
		streakAction: outcome.action,
		streakReason: outcome.reason,
		newStreak: outcome.newStreak,
		carriedCount,
	});

	return {
		uid,
		processed: true,
		streakAction: outcome.action,
		carriedCount,
	};
}

/**
 * Orchestrator: loads all users, runs `processUser` in parallel chunks of 25.
 * Returns aggregate counts for logging / metrics.
 */
export async function runStreakEvaluateScan(
	now: Date = new Date(),
	concurrency = 25,
): Promise<{
	scanned: number;
	processed: number;
	incremented: number;
	started: number;
	resets: number;
	totalCarried: number;
}> {
	const firestore = db();
	const usersSnap = await firestore.collection("users").get();
	const docs = usersSnap.docs;

	let processed = 0;
	let incremented = 0;
	let started = 0;
	let resets = 0;
	let totalCarried = 0;

	for (let i = 0; i < docs.length; i += concurrency) {
		const chunk = docs.slice(i, i + concurrency);
		const results = await Promise.all(
			chunk.map((d) => processUser(firestore, d, now)),
		);
		for (const r of results) {
			if (!r.processed) continue;
			processed++;
			if (r.streakAction === "increment") incremented++;
			if (r.streakAction === "start") started++;
			if (r.streakAction === "reset") resets++;
			totalCarried += r.carriedCount ?? 0;
		}
	}

	return {
		scanned: docs.length,
		processed,
		incremented,
		started,
		resets,
		totalCarried,
	};
}

/**
 * Cloud Scheduler entry point: runs hourly in UTC.
 * Inside, each user is only processed when their *local* hour is 0 (midnight).
 */
export const streakDailyEvaluate = onSchedule(
	{
		schedule: "every 1 hours",
		region: "us-central1",
		timeZone: "UTC",
		maxInstances: 1,
		memory: "256MiB",
		timeoutSeconds: 540,
	},
	async () => {
		const result = await runStreakEvaluateScan(new Date());
		logger.info("streakDailyEvaluate complete", result);
	},
);
