import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { dispatchToUserDevices } from "./lib/notify.js";
import {
	userLocalDate,
	userLocalHour,
	userLocalMinute,
} from "./lib/time.js";
import {
	TIP_TITLE,
	activeSlotForLocalTime,
	curatedTips,
	hashIndex,
	type TipLanguage,
} from "./lib/tips.js";

if (!admin.apps.length) admin.initializeApp();

interface UserOutcome {
	uid: string;
	processed: boolean;
	sentSlot?: string;
	skipReason?: string;
}

/**
 * Reads user's preferred language from settings; defaults to "en".
 */
function pickLanguage(settings: unknown): TipLanguage {
	const lang =
		(settings as { language?: string } | undefined)?.language ?? "en";
	return lang === "bn" ? "bn" : "en";
}

/**
 * Per-user tip decision: skips if tz / opt-in missing or no slot active.
 * Picks tip deterministically via hash(uid+date+slot) so all the user's devices
 * see the same tip. Writes dedup doc to prevent re-sending in next 30-min tick.
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
				notifications?: { deedTips?: boolean };
		  }
		| undefined;

	if (!tz) return { uid, processed: false, skipReason: "no-timezone" };
	if (!settings?.notifications?.deedTips) {
		return { uid, processed: false, skipReason: "tips-off" };
	}

	let todayDate: string;
	let localHour: number;
	let localMinute: number;
	try {
		todayDate = userLocalDate(tz, now);
		localHour = userLocalHour(tz, now);
		localMinute = userLocalMinute(tz, now);
	} catch {
		return { uid, processed: false, skipReason: "invalid-timezone" };
	}

	const slot = activeSlotForLocalTime(localHour, localMinute);
	if (!slot) {
		return { uid, processed: true, skipReason: "no-slot" };
	}

	const notifId = `tip_${todayDate}_${slot.id}`;
	const notifRef = firestore
		.collection("users")
		.doc(uid)
		.collection("notifications")
		.doc(notifId);
	const notifSnap = await notifRef.get();
	if (notifSnap.exists) {
		return { uid, processed: true, skipReason: "already-sent" };
	}

	const language = pickLanguage(settings);
	const pool = curatedTips[language];
	const idx = hashIndex(`${uid}|${todayDate}|${slot.id}`, pool.length);
	const tip = pool[idx];

	const result = await dispatchToUserDevices(
		uid,
		{ title: TIP_TITLE[language], body: tip },
		{
			type: "tip",
			slot: slot.id,
			date: todayDate,
		},
	);

	await notifRef.set({
		type: "tip",
		slot: slot.id,
		date: todayDate,
		language,
		tipIndex: idx,
		deliveredCount: result.sent,
		prunedCount: result.pruned,
		sentAt: admin.firestore.FieldValue.serverTimestamp(),
	});

	logger.info("tip sent", {
		uid,
		slot: slot.id,
		language,
		tipIndex: idx,
		delivered: result.sent,
		pruned: result.pruned,
	});

	return { uid, processed: true, sentSlot: slot.id };
}

/**
 * Orchestrator: loads all users, runs `processUser` in parallel chunks of 25.
 * Returns aggregate counts for logging / metrics.
 */
export async function runTipDispatchScan(
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
			if (r.sentSlot) totalSent++;
		}
	}

	return { scanned: docs.length, processed, totalSent };
}

/**
 * Cloud Scheduler entry point: runs every 30 minutes in UTC.
 * 30-min cadence fits the ±30-min slot windows (morning/evening/night anchors).
 */
export const tipDispatch = onSchedule(
	{
		schedule: "every 30 minutes",
		region: "us-central1",
		timeZone: "UTC",
		maxInstances: 1,
		memory: "256MiB",
		timeoutSeconds: 540,
	},
	async () => {
		const result = await runTipDispatchScan(new Date());
		logger.info("tipDispatch complete", result);
	},
);
