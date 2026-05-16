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
exports.prayerReminderDispatch = void 0;
exports.runPrayerReminderScan = runPrayerReminderScan;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const prayerEngine_js_1 = require("./lib/prayerEngine.js");
const notify_js_1 = require("./lib/notify.js");
const time_js_1 = require("./lib/time.js");
if (!admin.apps.length)
    admin.initializeApp();
const BUFFER_MINUTES = 20;
/**
 * Reads user's preferred language from settings; defaults to "en".
 */
function pickLanguage(settings) {
    var _a;
    const lang = (_a = settings === null || settings === void 0 ? void 0 : settings.language) !== null && _a !== void 0 ? _a : "en";
    return lang === "bn" ? "bn" : "en";
}
/**
 * Per-user reminder decision: skips if tz/location/opt-in missing.
 * Finds prayers near window-close, skips already-prayed + already-sent ones,
 * dispatches FCM, writes dedup doc to prevent re-sending in next 5-min tick.
 */
async function processUser(firestore, userDoc, now) {
    var _a;
    const uid = userDoc.id;
    const tz = userDoc.get("timezone");
    const settings = userDoc.get("settings");
    const geo = userDoc.get("geo");
    if (!tz)
        return { uid, processed: false, skipReason: "no-timezone" };
    if (!((_a = settings === null || settings === void 0 ? void 0 : settings.notifications) === null || _a === void 0 ? void 0 : _a.dailyReminder)) {
        return { uid, processed: false, skipReason: "reminders-off" };
    }
    if (typeof (geo === null || geo === void 0 ? void 0 : geo.lat) !== "number" || typeof (geo === null || geo === void 0 ? void 0 : geo.lng) !== "number") {
        return { uid, processed: false, skipReason: "no-location" };
    }
    let todayDate;
    try {
        todayDate = (0, time_js_1.userLocalDate)(tz, now);
    }
    catch (_b) {
        return { uid, processed: false, skipReason: "invalid-timezone" };
    }
    const windows = (0, prayerEngine_js_1.getPrayerWindows)(geo.lat, geo.lng, now);
    const candidates = (0, prayerEngine_js_1.getNearClosePrayers)(windows, now, BUFFER_MINUTES);
    if (candidates.length === 0) {
        return { uid, processed: true, skipReason: "no-window", sentPrayers: [] };
    }
    // Read logs + sent docs in parallel
    const [prayerLogsSnap] = await Promise.all([
        firestore
            .collection("deed_logs")
            .where("userId", "==", uid)
            .where("date", "==", todayDate)
            .where("deedId", "in", prayerEngine_js_1.PRAYER_IDS.map((p) => `prayer_${p}`))
            .get(),
    ]);
    const loggedDeedIds = new Set(prayerLogsSnap.docs.map((d) => d.get("deedId")));
    const language = pickLanguage(settings);
    const sentPrayers = [];
    for (const candidate of candidates) {
        const deedId = `prayer_${candidate.id}`;
        if (loggedDeedIds.has(deedId))
            continue;
        const notifId = `prayer_${todayDate}_${candidate.id}`;
        const notifRef = firestore
            .collection("users")
            .doc(uid)
            .collection("notifications")
            .doc(notifId);
        const notifSnap = await notifRef.get();
        if (notifSnap.exists)
            continue;
        const label = prayerEngine_js_1.PRAYER_LABELS[candidate.id][language];
        const title = language === "bn" ? `${label} এর সময় শেষ হচ্ছে` : `${label} ending soon`;
        const body = (0, prayerEngine_js_1.prayerReminderBody)(language, label, candidate.minutesRemaining);
        const result = await (0, notify_js_1.dispatchToUserDevices)(uid, { title, body }, {
            type: "prayer_reminder",
            prayer: candidate.id,
            date: todayDate,
        });
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
async function runPrayerReminderScan(now = new Date(), concurrency = 25) {
    var _a, _b;
    const firestore = admin.firestore();
    const usersSnap = await firestore.collection("users").get();
    const docs = usersSnap.docs;
    let processed = 0;
    let totalSent = 0;
    for (let i = 0; i < docs.length; i += concurrency) {
        const chunk = docs.slice(i, i + concurrency);
        const results = await Promise.all(chunk.map((d) => processUser(firestore, d, now)));
        for (const r of results) {
            if (!r.processed)
                continue;
            processed++;
            totalSent += (_b = (_a = r.sentPrayers) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
        }
    }
    return { scanned: docs.length, processed, totalSent };
}
/**
 * Cloud Scheduler entry point: runs every 5 minutes in UTC.
 * 5-min cadence matches the 20-min near-close buffer (worst-case 5 min late).
 */
exports.prayerReminderDispatch = (0, scheduler_1.onSchedule)({
    schedule: "every 5 minutes",
    region: "us-central1",
    timeZone: "UTC",
    maxInstances: 1,
    memory: "256MiB",
    timeoutSeconds: 540,
}, async () => {
    const result = await runPrayerReminderScan(new Date());
    logger.info("prayerReminderDispatch complete", result);
});
//# sourceMappingURL=prayerReminderDispatch.js.map