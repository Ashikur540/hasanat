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
exports.streakDailyReset = void 0;
exports.userLocalDate = userLocalDate;
exports.shiftDate = shiftDate;
exports.evaluateStreakReset = evaluateStreakReset;
exports.runStreakResetScan = runStreakResetScan;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
if (!admin.apps.length)
    admin.initializeApp();
const db = () => admin.firestore();
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
function evaluateStreakReset(tz, now, currentStreak, lastStreakDate) {
    if (currentStreak <= 0)
        return { shouldReset: false, reason: "already-zero" };
    let today;
    try {
        today = userLocalDate(tz, now);
    }
    catch (_a) {
        return { shouldReset: false, reason: "invalid-timezone" };
    }
    if (!lastStreakDate)
        return { shouldReset: true, reason: "no-last-date" };
    const yesterday = shiftDate(today, -1);
    if (lastStreakDate === today || lastStreakDate === yesterday) {
        return { shouldReset: false, reason: "streak-still-alive" };
    }
    return { shouldReset: true, reason: "missed-day" };
}
async function runStreakResetScan(now = new Date()) {
    var _a;
    const firestore = db();
    const users = await firestore.collection("users").get();
    let scanned = 0;
    let reset = 0;
    for (const userDoc of users.docs) {
        scanned++;
        const tz = userDoc.get("timezone");
        if (!tz)
            continue;
        const streakRef = firestore.collection("streaks").doc(userDoc.id);
        const streakSnap = await streakRef.get();
        if (!streakSnap.exists)
            continue;
        const data = (_a = streakSnap.data()) !== null && _a !== void 0 ? _a : {};
        const evaluation = evaluateStreakReset(tz, now, Number(data.currentStreak) || 0, data.lastStreakDate);
        if (!evaluation.shouldReset)
            continue;
        await streakRef.update({
            currentStreak: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        await firestore.collection("leaderboard").doc(userDoc.id).set({
            currentStreak: 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        reset++;
        logger.info("streak reset", {
            uid: userDoc.id,
            reason: evaluation.reason,
            prevStreak: data.currentStreak,
            lastStreakDate: data.lastStreakDate,
            tz,
        });
    }
    return { scanned, reset };
}
exports.streakDailyReset = (0, scheduler_1.onSchedule)({
    schedule: "every 1 hours",
    region: "us-central1",
    timeZone: "UTC",
    maxInstances: 1,
    memory: "256MiB",
}, async () => {
    const result = await runStreakResetScan(new Date());
    logger.info("streakDailyReset complete", result);
});
//# sourceMappingURL=streakDailyReset.js.map