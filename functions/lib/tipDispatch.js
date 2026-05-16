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
exports.tipDispatch = void 0;
exports.runTipDispatchScan = runTipDispatchScan;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const notify_js_1 = require("./lib/notify.js");
const time_js_1 = require("./lib/time.js");
const tips_js_1 = require("./lib/tips.js");
if (!admin.apps.length)
    admin.initializeApp();
/**
 * Reads user's preferred language from settings; defaults to "en".
 */
function pickLanguage(settings) {
    var _a;
    const lang = (_a = settings === null || settings === void 0 ? void 0 : settings.language) !== null && _a !== void 0 ? _a : "en";
    return lang === "bn" ? "bn" : "en";
}
/**
 * Per-user tip decision: skips if tz / opt-in missing or no slot active.
 * Picks tip deterministically via hash(uid+date+slot) so all the user's devices
 * see the same tip. Writes dedup doc to prevent re-sending in next 30-min tick.
 */
async function processUser(firestore, userDoc, now) {
    var _a;
    const uid = userDoc.id;
    const tz = userDoc.get("timezone");
    const settings = userDoc.get("settings");
    if (!tz)
        return { uid, processed: false, skipReason: "no-timezone" };
    if (!((_a = settings === null || settings === void 0 ? void 0 : settings.notifications) === null || _a === void 0 ? void 0 : _a.deedTips)) {
        return { uid, processed: false, skipReason: "tips-off" };
    }
    let todayDate;
    let localHour;
    let localMinute;
    try {
        todayDate = (0, time_js_1.userLocalDate)(tz, now);
        localHour = (0, time_js_1.userLocalHour)(tz, now);
        localMinute = (0, time_js_1.userLocalMinute)(tz, now);
    }
    catch (_b) {
        return { uid, processed: false, skipReason: "invalid-timezone" };
    }
    const slot = (0, tips_js_1.activeSlotForLocalTime)(localHour, localMinute);
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
    const pool = tips_js_1.curatedTips[language];
    const idx = (0, tips_js_1.hashIndex)(`${uid}|${todayDate}|${slot.id}`, pool.length);
    const tip = pool[idx];
    const result = await (0, notify_js_1.dispatchToUserDevices)(uid, { title: tips_js_1.TIP_TITLE[language], body: tip }, {
        type: "tip",
        slot: slot.id,
        date: todayDate,
    });
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
async function runTipDispatchScan(now = new Date(), concurrency = 25) {
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
            if (r.sentSlot)
                totalSent++;
        }
    }
    return { scanned: docs.length, processed, totalSent };
}
/**
 * Cloud Scheduler entry point: runs every 30 minutes in UTC.
 * 30-min cadence fits the ±30-min slot windows (morning/evening/night anchors).
 */
exports.tipDispatch = (0, scheduler_1.onSchedule)({
    schedule: "every 30 minutes",
    region: "us-central1",
    timeZone: "UTC",
    maxInstances: 1,
    memory: "256MiB",
    timeoutSeconds: 540,
}, async () => {
    const result = await runTipDispatchScan(new Date());
    logger.info("tipDispatch complete", result);
});
//# sourceMappingURL=tipDispatch.js.map