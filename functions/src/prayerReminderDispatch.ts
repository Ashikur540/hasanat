import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {
	PRAYER_IDS,
	PRAYER_LABELS,
	getNearClosePrayers,
	getPrayerWindows,
	prayerReminderBody,
} from "./lib/prayerEngine.js";
import { dispatchToUserDevices } from "./lib/notify.js";
import { userLocalDate } from "./lib/time.js";

if (!admin.apps.length) admin.initializeApp();

const BUFFER_MINUTES = 20;

interface UserOutcome {
	uid: string;
	processed: boolean;
	sentPrayers?: string[];
	skipReason?: string;
}

/**
 * Reads user's preferred language from settings; defaults to "en".
 */
function pickLanguage(settings: unknown): "en" | "bn" {
	const lang =
		(settings as { language?: string } | undefined)?.language ?? "en";
	return lang === "bn" ? "bn" : "en";
}

/**
 * Per-user reminder decision: skips if tz/location/opt-in missing.
 * Finds prayers near window-close, skips already-prayed + already-sent ones,
 * dispatches FCM, writes dedup doc to prevent re-sending in next 5-min tick.
 */
async function processUser(
	firestore: admin.firestore.Firestore,
	userDoc: admin.firestore.QueryDocumentSnapshot,
	now: Date,
): Promise<UserOutcome> {
	const uid = userDoc.id;
	const tz = userDoc.get("timezone") as string | undefined;
	const settings = userDoc.get("settings") as
		| {
				language?: string;
				notifications?: { dailyReminder?: boolean };
		  }
		| undefined;
	const geo = userDoc.get("geo") as
		| { lat?: number; lng?: number }
		| undefined;

	if (!tz) return { uid, processed: false, skipReason: "no-timezone" };
	if (!settings?.notifications?.dailyReminder) {
		return { uid, processed: false, skipReason: "reminders-off" };
	}
	if (typeof geo?.lat !== "number" || typeof geo?.lng !== "number") {
		return { uid, processed: false, skipReason: "no-location" };
	}

	let todayDate: string;
	try {
		todayDate = userLocalDate(tz, now);
	} catch {
		return { uid, processed: false, skipReason: "invalid-timezone" };
	}

	const windows = getPrayerWindows(geo.lat, geo.lng, now);
	const candidates = getNearClosePrayers(windows, now, BUFFER_MINUTES);
	if (candidates.length === 0) {
		return { uid, processed: true, skipReason: "no-window", sentPrayers: [] };
	}

	// Read logs + sent docs in parallel
	const [prayerLogsSnap] = await Promise.all([
		firestore
			.collection("deed_logs")
			.where("userId", "==", uid)
			.where("date", "==", todayDate)
			.where(
				"deedId",
				"in",
				PRAYER_IDS.map((p) => `prayer_${p}`),
			)
			.get(),
	]);
	const loggedDeedIds = new Set(
		prayerLogsSnap.docs.map((d) => d.get("deedId") as string),
	);

	const language = pickLanguage(settings);
	const sentPrayers: string[] = [];

	for (const candidate of candidates) {
		const deedId = `prayer_${candidate.id}`;
		if (loggedDeedIds.has(deedId)) continue;

		const notifId = `prayer_${todayDate}_${candidate.id}`;
		const notifRef = firestore
			.collection("users")
			.doc(uid)
			.collection("notifications")
			.doc(notifId);
		const notifSnap = await notifRef.get();
		if (notifSnap.exists) continue;

		const label = PRAYER_LABELS[candidate.id][language];
		const title =
			language === "bn" ? `${label} এর সময় শেষ হচ্ছে` : `${label} ending soon`;
		const body = prayerReminderBody(
			language,
			label,
			candidate.minutesRemaining,
		);

		const result = await dispatchToUserDevices(
			uid,
			{ title, body },
			{
				type: "prayer_reminder",
				prayer: candidate.id,
				date: todayDate,
			},
		);

		await notifRef.set({
			type: "prayer_reminder",
			prayer: candidate.id,
			date: todayDate,
			deliveredCount: result.sent,
			prunedCount: result.pruned,
			sentAt: admin.firestore.FieldValue.serverTimestamp(),
		});

		sentPrayers.push(candidate.id);
		logger.info("prayer reminder sent", {
			uid,
			prayer: candidate.id,
			minutesRemaining: candidate.minutesRemaining,
			delivered: result.sent,
			pruned: result.pruned,
		});
	}

	return { uid, processed: true, sentPrayers };
}

/**
 * Orchestrator: loads all users, runs `processUser` in parallel chunks of 25.
 * Returns aggregate counts for logging / metrics.
 */
export async function runPrayerReminderScan(
	now: Date = new Date(),
	concurrency = 25,
): Promise<{
	scanned: number;
	processed: number;
	totalSent: number;
}> {
	const firestore = admin.firestore();
	const usersSnap = await firestore.collection("users").get();
	const docs = usersSnap.docs;

	let processed = 0;
	let totalSent = 0;

	for (let i = 0; i < docs.length; i += concurrency) {
		const chunk = docs.slice(i, i + concurrency);
		const results = await Promise.all(
			chunk.map((d) => processUser(firestore, d, now)),
		);
		for (const r of results) {
			if (!r.processed) continue;
			processed++;
			totalSent += r.sentPrayers?.length ?? 0;
		}
	}

	return { scanned: docs.length, processed, totalSent };
}

/**
 * Cloud Scheduler entry point: runs every 5 minutes in UTC.
 * 5-min cadence matches the 20-min near-close buffer (worst-case 5 min late).
 */
export const prayerReminderDispatch = onSchedule(
	{
		schedule: "every 5 minutes",
		region: "us-central1",
		timeZone: "UTC",
		maxInstances: 1,
		memory: "256MiB",
		timeoutSeconds: 540,
	},
	async () => {
		const result = await runPrayerReminderScan(new Date());
		logger.info("prayerReminderDispatch complete", result);
	},
);
