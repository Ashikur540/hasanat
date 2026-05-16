// Streak cron smoke test harness.
//
// Usage:
//   STREAK_TEST_UID=<uid> STREAK_TEST_PROJECT_ID=<project> \
//     node scripts/streak-test.mjs seed-pass | seed-fail | inspect | restore
//
// Recommended: point at the Firestore emulator (FIRESTORE_EMULATOR_HOST=localhost:8080)
// or a dedicated staging project. Running against the production project mutates
// a real user's docs and requires an explicit --allow-prod opt-in.
//
// All test docs use ID prefix `STREAK_TEST_` so they are easy to find + clean.

import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Project IDs treated as production — running against these requires --allow-prod.
const PROD_PROJECT_IDS = new Set(["hasanat-3375b"]);

const UID = process.env.STREAK_TEST_UID;
const PROJECT_ID = process.env.STREAK_TEST_PROJECT_ID;
const TEST_TZ = process.env.STREAK_TEST_TZ ?? "America/Adak";
const BACKUP_FILE = path.join(__dirname, "streak-test-backup.json");
const ALLOW_PROD = process.argv.includes("--allow-prod");
const USING_EMULATOR = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

if (!UID) {
	console.error("error: STREAK_TEST_UID env var is required.");
	console.error("       Use a throw-away test account, not your personal uid.");
	process.exit(1);
}
if (!PROJECT_ID) {
	console.error("error: STREAK_TEST_PROJECT_ID env var is required.");
	console.error(
		"       Point at a staging project or set FIRESTORE_EMULATOR_HOST.",
	);
	process.exit(1);
}
if (PROD_PROJECT_IDS.has(PROJECT_ID) && !USING_EMULATOR && !ALLOW_PROD) {
	console.error(
		`error: refusing to run against production project "${PROJECT_ID}".`,
	);
	console.error(
		"       Re-run with --allow-prod to override (mutates real user data).",
	);
	process.exit(1);
}
if (PROD_PROJECT_IDS.has(PROJECT_ID) && ALLOW_PROD && !USING_EMULATOR) {
	console.warn(
		`⚠  WARNING: mutating production project "${PROJECT_ID}" for uid ${UID}`,
	);
}

const TEST_DOC_PREFIX = "STREAK_TEST_";
const PRAYERS = [
	"prayer_fajr",
	"prayer_dhuhr",
	"prayer_asr",
	"prayer_maghrib",
	"prayer_isha",
];

initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
const db = getFirestore();

function userLocalDate(tz, instant) {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: tz,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(instant);
}

function shiftDate(yyyyMmDd, days) {
	const [y, m, d] = yyyyMmDd.split("-").map(Number);
	const dt = new Date(Date.UTC(y, m - 1, d));
	dt.setUTCDate(dt.getUTCDate() + days);
	return dt.toISOString().slice(0, 10);
}

async function saveBackup() {
	if (fs.existsSync(BACKUP_FILE)) {
		console.log(
			`backup file already exists at ${BACKUP_FILE} — skipping new backup (will reuse on restore)`,
		);
		return JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8"));
	}
	const userSnap = await db.collection("users").doc(UID).get();
	const streakSnap = await db.collection("streaks").doc(UID).get();
	const leaderboardSnap = await db.collection("leaderboard").doc(UID).get();
	const backup = {
		uid: UID,
		userTimezone: userSnap.exists ? userSnap.get("timezone") ?? null : null,
		streak: streakSnap.exists ? streakSnap.data() : null,
		leaderboard: leaderboardSnap.exists ? leaderboardSnap.data() : null,
		savedAt: new Date().toISOString(),
	};
	// Strip non-serializable Firestore timestamps.
	const stringify = (obj) =>
		JSON.parse(
			JSON.stringify(obj, (_, v) => {
				if (v && typeof v === "object" && typeof v.toDate === "function") {
					return { __ts: v.toDate().toISOString() };
				}
				return v;
			}),
		);
	fs.writeFileSync(
		BACKUP_FILE,
		JSON.stringify(
			{
				uid: backup.uid,
				userTimezone: backup.userTimezone,
				streak: stringify(backup.streak),
				leaderboard: stringify(backup.leaderboard),
				savedAt: backup.savedAt,
			},
			null,
			2,
		),
	);
	console.log(`backup saved to ${BACKUP_FILE}`);
	return backup;
}

async function seedCommon() {
	const now = new Date();
	const today = userLocalDate(TEST_TZ, now);
	const yesterday = shiftDate(today, -1);
	console.log(`tz=${TEST_TZ} today=${today} yesterday=${yesterday}`);

	await saveBackup();

	// Set user timezone
	await db.collection("users").doc(UID).set(
		{ timezone: TEST_TZ },
		{ merge: true },
	);

	// Reset streak to clean baseline (currentStreak=0, no lastStreakDate)
	await db.collection("streaks").doc(UID).set({
		userId: UID,
		currentStreak: 0,
		longestStreak: 0,
		lastStreakDate: null,
		updatedAt: FieldValue.serverTimestamp(),
	});
	await db.collection("leaderboard").doc(UID).set(
		{
			currentStreak: 0,
			updatedAt: FieldValue.serverTimestamp(),
		},
		{ merge: true },
	);

	// Seed 5 prayer deed_logs (yesterday)
	for (const prayerId of PRAYERS) {
		const id = `${TEST_DOC_PREFIX}log_${prayerId}`;
		await db.collection("deed_logs").doc(id).set({
			userId: UID,
			date: yesterday,
			deedId: prayerId,
			deedType: "preset",
			todoId: "mandatory_5_prayers",
			name: prayerId,
			emoji: "🕌",
			category: "Salah",
			pointsAtLogTime: 12,
			loggedAt: FieldValue.serverTimestamp(),
		});
	}

	return { today, yesterday };
}

async function seedPass() {
	const { today, yesterday } = await seedCommon();

	// Two completed todos
	await db.collection("todos").doc(`${TEST_DOC_PREFIX}todo_a`).set({
		userId: UID,
		date: yesterday,
		deedId: "test_zikr",
		deedType: "preset",
		name: "Test zikr",
		emoji: "📿",
		category: "Dhikr",
		difficulty: "easy",
		points: 5,
		completed: true,
		completedAt: FieldValue.serverTimestamp(),
		addedAt: FieldValue.serverTimestamp(),
	});
	await db.collection("todos").doc(`${TEST_DOC_PREFIX}todo_b`).set({
		userId: UID,
		date: yesterday,
		deedId: "test_quran",
		deedType: "preset",
		name: "Test Quran",
		emoji: "📖",
		category: "Quran",
		difficulty: "easy",
		points: 5,
		completed: true,
		completedAt: FieldValue.serverTimestamp(),
		addedAt: FieldValue.serverTimestamp(),
	});

	console.log("✓ seed-pass complete. Expect: streak=1 after cron run, no carry-forward.");
	console.log(`   today=${today} yesterday=${yesterday}`);
}

async function seedFail() {
	const { today, yesterday } = await seedCommon();

	// One completed, one incomplete
	await db.collection("todos").doc(`${TEST_DOC_PREFIX}todo_a`).set({
		userId: UID,
		date: yesterday,
		deedId: "test_zikr",
		deedType: "preset",
		name: "Test zikr",
		emoji: "📿",
		category: "Dhikr",
		difficulty: "easy",
		points: 5,
		completed: true,
		completedAt: FieldValue.serverTimestamp(),
		addedAt: FieldValue.serverTimestamp(),
	});
	await db.collection("todos").doc(`${TEST_DOC_PREFIX}todo_b`).set({
		userId: UID,
		date: yesterday,
		deedId: "test_quran",
		deedType: "preset",
		name: "Test Quran",
		emoji: "📖",
		category: "Quran",
		difficulty: "easy",
		points: 5,
		completed: false,
		completedAt: null,
		addedAt: FieldValue.serverTimestamp(),
	});

	console.log("✓ seed-fail complete. Expect: streak stays 0, 1 carry-forward doc (test_quran) appears in today's todos.");
	console.log(`   today=${today} yesterday=${yesterday}`);
}

async function inspect() {
	const now = new Date();
	const today = userLocalDate(TEST_TZ, now);
	const yesterday = shiftDate(today, -1);

	const userSnap = await db.collection("users").doc(UID).get();
	const streakSnap = await db.collection("streaks").doc(UID).get();
	const leaderboardSnap = await db.collection("leaderboard").doc(UID).get();

	console.log("\n=== users/" + UID + " ===");
	console.log("timezone:", userSnap.get("timezone"));

	console.log("\n=== streaks/" + UID + " ===");
	if (streakSnap.exists) {
		const s = streakSnap.data();
		console.log({
			currentStreak: s.currentStreak,
			longestStreak: s.longestStreak,
			lastStreakDate: s.lastStreakDate,
		});
	} else {
		console.log("(no streak doc)");
	}

	console.log("\n=== leaderboard/" + UID + " ===");
	if (leaderboardSnap.exists) {
		console.log({ currentStreak: leaderboardSnap.get("currentStreak") });
	} else {
		console.log("(no leaderboard doc)");
	}

	console.log(`\n=== todos for ${yesterday} (yesterday) ===`);
	const yesterdayTodos = await db
		.collection("todos")
		.where("userId", "==", UID)
		.where("date", "==", yesterday)
		.get();
	yesterdayTodos.forEach((d) => {
		console.log(d.id, {
			deedId: d.get("deedId"),
			completed: d.get("completed"),
			carriedFrom: d.get("carriedFrom") ?? null,
		});
	});

	console.log(`\n=== todos for ${today} (today) ===`);
	const todayTodos = await db
		.collection("todos")
		.where("userId", "==", UID)
		.where("date", "==", today)
		.get();
	todayTodos.forEach((d) => {
		console.log(d.id, {
			deedId: d.get("deedId"),
			completed: d.get("completed"),
			carriedFrom: d.get("carriedFrom") ?? null,
		});
	});

	console.log(`\n=== deed_logs (prayers) for ${yesterday} ===`);
	const prayerLogs = await db
		.collection("deed_logs")
		.where("userId", "==", UID)
		.where("date", "==", yesterday)
		.where("deedId", "in", PRAYERS)
		.get();
	console.log(`count: ${prayerLogs.size} / 5`);
	prayerLogs.forEach((d) => console.log(" -", d.id, d.get("deedId")));
}

async function restore() {
	const now = new Date();
	const today = userLocalDate(TEST_TZ, now);
	const yesterday = shiftDate(today, -1);

	if (!fs.existsSync(BACKUP_FILE)) {
		console.log("no backup file — skipping user/streak restore");
	} else {
		const backup = JSON.parse(fs.readFileSync(BACKUP_FILE, "utf8"));
		// Restore user timezone
		if (backup.userTimezone === null) {
			await db.collection("users").doc(UID).update({
				timezone: FieldValue.delete(),
			});
			console.log("removed users/{uid}.timezone");
		} else {
			await db.collection("users").doc(UID).set(
				{ timezone: backup.userTimezone },
				{ merge: true },
			);
			console.log("restored users/{uid}.timezone =", backup.userTimezone);
		}
		// Rehydrate __ts markers back to Date objects (Admin SDK converts Date → Timestamp).
		const rehydrate = (obj) => {
			if (obj && typeof obj === "object") {
				if (typeof obj.__ts === "string") return new Date(obj.__ts);
				for (const k of Object.keys(obj)) obj[k] = rehydrate(obj[k]);
			}
			return obj;
		};
		// Restore streak
		if (backup.streak === null) {
			await db.collection("streaks").doc(UID).delete();
			console.log("deleted streaks/{uid}");
		} else {
			await db.collection("streaks").doc(UID).set(rehydrate(backup.streak));
			console.log("restored streaks/{uid}");
		}
		// Restore leaderboard
		if (backup.leaderboard === null) {
			await db.collection("leaderboard").doc(UID).delete();
			console.log("deleted leaderboard/{uid}");
		} else {
			await db.collection("leaderboard")
				.doc(UID)
				.set(rehydrate(backup.leaderboard));
			console.log("restored leaderboard/{uid}");
		}
	}

	// Delete all STREAK_TEST_* docs
	const collections = ["todos", "deed_logs"];
	for (const col of collections) {
		const snap = await db.collection(col).get();
		const toDelete = snap.docs.filter((d) => d.id.startsWith(TEST_DOC_PREFIX));
		for (const d of toDelete) {
			await d.ref.delete();
		}
		console.log(`deleted ${toDelete.length} test docs from ${col}`);
	}

	// Delete any carry-forward todos created by the cron during testing
	const todayTodos = await db
		.collection("todos")
		.where("userId", "==", UID)
		.where("date", "==", today)
		.get();
	const carried = todayTodos.docs.filter((d) =>
		(d.get("carriedFrom") ?? "").startsWith(TEST_DOC_PREFIX),
	);
	for (const d of carried) await d.ref.delete();
	console.log(`deleted ${carried.length} carry-forward todos in today (${today})`);

	console.log("\n✓ restore complete.");
}

const cmd = process.argv[2];
const run = async () => {
	if (cmd === "seed-pass") await seedPass();
	else if (cmd === "seed-fail") await seedFail();
	else if (cmd === "inspect") await inspect();
	else if (cmd === "restore") await restore();
	else {
		console.error("unknown command:", cmd);
		console.error("usage: node scripts/streak-test.mjs [seed-pass|seed-fail|inspect|restore]");
		process.exit(1);
	}
};

run().then(
	() => process.exit(0),
	(err) => {
		console.error(err);
		process.exit(1);
	},
);
