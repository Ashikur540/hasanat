"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.streakDailyEvaluate = exports.userLocalHour = exports.userLocalDate = exports.shiftDate = void 0;
exports.evaluateStreakIncrement = evaluateStreakIncrement;
exports.runStreakEvaluateScan = runStreakEvaluateScan;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const time_js_1 = require("./lib/time.js");
Object.defineProperty(exports, "shiftDate", { enumerable: true, get: function () { return time_js_1.shiftDate; } });
Object.defineProperty(exports, "userLocalDate", { enumerable: true, get: function () { return time_js_1.userLocalDate; } });
Object.defineProperty(exports, "userLocalHour", { enumerable: true, get: function () { return time_js_1.userLocalHour; } });
if (!admin.apps.length)
    admin.initializeApp();
const REQUIRED_PRAYER_IDS = [
    "prayer_fajr",
    "prayer_dhuhr",
    "prayer_asr",
    "prayer_maghrib",
    "prayer_isha",
];
const db = () => admin.firestore();
/**
 * Pure decision function: given yesterday's totals + current streak state,
 * decides whether to increment / start / reset / skip the streak.
 * No Firestore IO — easy to unit-test boundary cases.
 */
function evaluateStreakIncrement(inputs) {
    const { yesterdayTotal, yesterdayCompleted, yesterdayPrayersLogged, currentStreak, lastStreakDate, yesterday, } = inputs;
    const todosOk = yesterdayTotal === 0 || yesterdayCompleted === yesterdayTotal;
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
        const dayBeforeYesterday = (0, time_js_1.shiftDate)(yesterday, -1);
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
    const dayBeforeYesterday = (0, time_js_1.shiftDate)(yesterday, -1);
    if (lastStreakDate === yesterday || lastStreakDate === dayBeforeYesterday) {
        return {
            action: "skip",
            newStreak: currentStreak,
            reason: "failed-keep",
        };
    }
    return { action: "reset", newStreak: 0, reason: "failed-stale-reset" };
}
/**
 * Per-user streak evaluation: only runs at the user's local midnight hour.
 * Reads yesterday's todos + prayer logs, applies pure eval, writes streak
 * + leaderboard updates, then carries incomplete todos forward to today.
 */
async function processUser(firestore, userDoc, now) {
    var _a;
    const uid = userDoc.id;
    const tz = userDoc.get("timezone");
    if (!tz)
        return { uid, processed: false, skippedReason: "no-timezone" };
    let localHour;
    let today;
    let yesterday;
    try {
        localHour = (0, time_js_1.userLocalHour)(tz, now);
        today = (0, time_js_1.userLocalDate)(tz, now);
        yesterday = (0, time_js_1.shiftDate)(today, -1);
    }
    catch (_b) {
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
    const yesterdayCompleted = todosSnap.docs.filter((d) => d.get("completed") === true).length;
    // Dedup deed_logs by deedId in case of duplicates
    const loggedPrayerIds = new Set(prayerLogsSnap.docs.map((d) => d.get("deedId")));
    const yesterdayPrayersLogged = loggedPrayerIds.size;
    const streakData = streakSnap.exists ? (_a = streakSnap.data()) !== null && _a !== void 0 ? _a : {} : {};
    const currentStreak = Number(streakData.currentStreak) || 0;
    const longestStreak = Number(streakData.longestStreak) || 0;
    const lastStreakDate = streakData.lastStreakDate;
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
        await firestore.collection("streaks").doc(uid).set({
            userId: uid,
            currentStreak: outcome.newStreak,
            longestStreak: newLongest,
            lastStreakDate: yesterday,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        await firestore.collection("leaderboard").doc(uid).set({
            currentStreak: outcome.newStreak,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    else if (outcome.action === "reset") {
        await firestore.collection("streaks").doc(uid).update({
            currentStreak: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await firestore.collection("leaderboard").doc(uid).set({
            currentStreak: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    // Carry-forward: incomplete yesterday todos → today (dedup by deedId)
    const incomplete = todosSnap.docs.filter((d) => d.get("completed") !== true);
    let carriedCount = 0;
    if (incomplete.length > 0) {
        const todayTodosSnap = await firestore
            .collection("todos")
            .where("userId", "==", uid)
            .where("date", "==", today)
            .get();
        const existingDeedIds = new Set(todayTodosSnap.docs.map((d) => d.get("deedId")));
        const toCarry = incomplete.filter((d) => !existingDeedIds.has(d.get("deedId")));
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
async function runStreakEvaluateScan(now = new Date(), concurrency = 25) {
    var _a;
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
        const results = await Promise.all(chunk.map((d) => processUser(firestore, d, now)));
        for (const r of results) {
            if (!r.processed)
                continue;
            processed++;
            if (r.streakAction === "increment")
                incremented++;
            if (r.streakAction === "start")
                started++;
            if (r.streakAction === "reset")
                resets++;
            totalCarried += (_a = r.carriedCount) !== null && _a !== void 0 ? _a : 0;
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
exports.streakDailyEvaluate = (0, scheduler_1.onSchedule)({
    schedule: "every 1 hours",
    region: "us-central1",
    timeZone: "UTC",
    maxInstances: 1,
    memory: "256MiB",
    timeoutSeconds: 540,
}, async () => {
    const result = await runStreakEvaluateScan(new Date());
    logger.info("streakDailyEvaluate complete", result);
});
//# sourceMappingURL=streakDailyEvaluate.js.map