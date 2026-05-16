"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const streakDailyReset_1 = require("./streakDailyReset");
const NOW_UTC = new Date("2026-05-14T18:30:00Z");
(0, vitest_1.describe)("userLocalDate", () => {
    (0, vitest_1.it)("converts UTC instant to Asia/Dhaka local date", () => {
        (0, vitest_1.expect)((0, streakDailyReset_1.userLocalDate)("Asia/Dhaka", NOW_UTC)).toBe("2026-05-15");
    });
    (0, vitest_1.it)("converts UTC instant to America/Los_Angeles local date", () => {
        (0, vitest_1.expect)((0, streakDailyReset_1.userLocalDate)("America/Los_Angeles", NOW_UTC)).toBe("2026-05-14");
    });
    (0, vitest_1.it)("converts UTC instant to Pacific/Auckland local date", () => {
        (0, vitest_1.expect)((0, streakDailyReset_1.userLocalDate)("Pacific/Auckland", NOW_UTC)).toBe("2026-05-15");
    });
});
(0, vitest_1.describe)("shiftDate", () => {
    (0, vitest_1.it)("subtracts 1 day", () => {
        (0, vitest_1.expect)((0, streakDailyReset_1.shiftDate)("2026-05-15", -1)).toBe("2026-05-14");
    });
    (0, vitest_1.it)("handles month boundary", () => {
        (0, vitest_1.expect)((0, streakDailyReset_1.shiftDate)("2026-06-01", -1)).toBe("2026-05-31");
    });
    (0, vitest_1.it)("handles year boundary", () => {
        (0, vitest_1.expect)((0, streakDailyReset_1.shiftDate)("2026-01-01", -1)).toBe("2025-12-31");
    });
    (0, vitest_1.it)("handles leap year February", () => {
        (0, vitest_1.expect)((0, streakDailyReset_1.shiftDate)("2024-03-01", -1)).toBe("2024-02-29");
    });
});
(0, vitest_1.describe)("evaluateStreakReset", () => {
    (0, vitest_1.it)("skips when currentStreak is already zero", () => {
        const result = (0, streakDailyReset_1.evaluateStreakReset)("Asia/Dhaka", NOW_UTC, 0, "2026-05-10");
        (0, vitest_1.expect)(result.shouldReset).toBe(false);
        (0, vitest_1.expect)(result.reason).toBe("already-zero");
    });
    (0, vitest_1.it)("resets when lastStreakDate is missing and streak is positive", () => {
        const result = (0, streakDailyReset_1.evaluateStreakReset)("Asia/Dhaka", NOW_UTC, 5, undefined);
        (0, vitest_1.expect)(result.shouldReset).toBe(true);
        (0, vitest_1.expect)(result.reason).toBe("no-last-date");
    });
    (0, vitest_1.it)("keeps streak alive when lastStreakDate is today (user-local)", () => {
        const result = (0, streakDailyReset_1.evaluateStreakReset)("Asia/Dhaka", NOW_UTC, 5, "2026-05-15");
        (0, vitest_1.expect)(result.shouldReset).toBe(false);
        (0, vitest_1.expect)(result.reason).toBe("streak-still-alive");
    });
    (0, vitest_1.it)("keeps streak alive when lastStreakDate is yesterday (user-local)", () => {
        const result = (0, streakDailyReset_1.evaluateStreakReset)("Asia/Dhaka", NOW_UTC, 5, "2026-05-14");
        (0, vitest_1.expect)(result.shouldReset).toBe(false);
        (0, vitest_1.expect)(result.reason).toBe("streak-still-alive");
    });
    (0, vitest_1.it)("resets when lastStreakDate is 2 days old", () => {
        const result = (0, streakDailyReset_1.evaluateStreakReset)("Asia/Dhaka", NOW_UTC, 5, "2026-05-13");
        (0, vitest_1.expect)(result.shouldReset).toBe(true);
        (0, vitest_1.expect)(result.reason).toBe("missed-day");
    });
    (0, vitest_1.it)("treats LA user differently — same UTC, different local date", () => {
        // In LA, NOW_UTC=18:30 UTC -> 11:30 local on 2026-05-14
        const result = (0, streakDailyReset_1.evaluateStreakReset)("America/Los_Angeles", NOW_UTC, 5, "2026-05-14");
        (0, vitest_1.expect)(result.shouldReset).toBe(false);
        (0, vitest_1.expect)(result.reason).toBe("streak-still-alive");
    });
    (0, vitest_1.it)("resets when LA user's lastStreakDate is older than LA-yesterday", () => {
        const result = (0, streakDailyReset_1.evaluateStreakReset)("America/Los_Angeles", NOW_UTC, 5, "2026-05-12");
        (0, vitest_1.expect)(result.shouldReset).toBe(true);
        (0, vitest_1.expect)(result.reason).toBe("missed-day");
    });
    (0, vitest_1.it)("returns invalid-timezone for bogus tz strings", () => {
        const result = (0, streakDailyReset_1.evaluateStreakReset)("Not/A_Real_Zone", NOW_UTC, 5, "2026-05-10");
        (0, vitest_1.expect)(result.shouldReset).toBe(false);
        (0, vitest_1.expect)(result.reason).toBe("invalid-timezone");
    });
    (0, vitest_1.it)("handles month-boundary correctly (lastStreakDate = previous month)", () => {
        // Today (user-local) = 2026-05-01, yesterday = 2026-04-30
        const result = (0, streakDailyReset_1.evaluateStreakReset)("Asia/Dhaka", new Date("2026-05-01T00:30:00+06:00"), 5, "2026-04-30");
        (0, vitest_1.expect)(result.shouldReset).toBe(false);
        (0, vitest_1.expect)(result.reason).toBe("streak-still-alive");
    });
    (0, vitest_1.it)("resets across month boundary when lastStreakDate is 2 days back", () => {
        const result = (0, streakDailyReset_1.evaluateStreakReset)("Asia/Dhaka", new Date("2026-05-01T00:30:00+06:00"), 5, "2026-04-29");
        (0, vitest_1.expect)(result.shouldReset).toBe(true);
        (0, vitest_1.expect)(result.reason).toBe("missed-day");
    });
});
//# sourceMappingURL=streakDailyReset.test.js.map