"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const streakDailyEvaluate_1 = require("./streakDailyEvaluate");
const NOW_UTC = new Date("2026-05-14T18:30:00Z");
(0, vitest_1.describe)("userLocalDate", () => {
    (0, vitest_1.it)("converts UTC instant to Asia/Dhaka local date", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.userLocalDate)("Asia/Dhaka", NOW_UTC)).toBe("2026-05-15");
    });
    (0, vitest_1.it)("converts UTC instant to America/Los_Angeles local date", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.userLocalDate)("America/Los_Angeles", NOW_UTC)).toBe("2026-05-14");
    });
    (0, vitest_1.it)("converts UTC instant to Pacific/Auckland local date", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.userLocalDate)("Pacific/Auckland", NOW_UTC)).toBe("2026-05-15");
    });
});
(0, vitest_1.describe)("userLocalHour", () => {
    (0, vitest_1.it)("returns BD hour at UTC 18:00 (BD midnight)", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.userLocalHour)("Asia/Dhaka", new Date("2026-05-14T18:05:00Z"))).toBe(0);
    });
    (0, vitest_1.it)("returns BD hour at UTC 12:00 (BD 18:00)", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.userLocalHour)("Asia/Dhaka", new Date("2026-05-14T12:00:00Z"))).toBe(18);
    });
    (0, vitest_1.it)("returns LA hour at UTC 07:00 (LA midnight in PDT)", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.userLocalHour)("America/Los_Angeles", new Date("2026-05-14T07:30:00Z"))).toBe(0);
    });
    (0, vitest_1.it)("returns Auckland hour at UTC 12:00 (NZ midnight in NZST)", () => {
        // NZ is UTC+12 in standard time (May = NZST, no DST)
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.userLocalHour)("Pacific/Auckland", new Date("2026-05-14T12:15:00Z"))).toBe(0);
    });
});
(0, vitest_1.describe)("shiftDate", () => {
    (0, vitest_1.it)("subtracts 1 day", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.shiftDate)("2026-05-15", -1)).toBe("2026-05-14");
    });
    (0, vitest_1.it)("handles month boundary", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.shiftDate)("2026-06-01", -1)).toBe("2026-05-31");
    });
    (0, vitest_1.it)("handles year boundary", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.shiftDate)("2026-01-01", -1)).toBe("2025-12-31");
    });
    (0, vitest_1.it)("handles leap year February", () => {
        (0, vitest_1.expect)((0, streakDailyEvaluate_1.shiftDate)("2024-03-01", -1)).toBe("2024-02-29");
    });
});
(0, vitest_1.describe)("evaluateStreakIncrement", () => {
    const yesterday = "2026-05-14";
    const dayBefore = "2026-05-13";
    (0, vitest_1.describe)("pass cases", () => {
        (0, vitest_1.it)("increments when prior streak ended day-before-yesterday", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 3,
                yesterdayCompleted: 3,
                yesterdayPrayersLogged: 5,
                currentStreak: 7,
                lastStreakDate: dayBefore,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("increment");
            (0, vitest_1.expect)(out.newStreak).toBe(8);
            (0, vitest_1.expect)(out.reason).toBe("passed-continuation");
        });
        (0, vitest_1.it)("starts fresh when no prior streak doc", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 2,
                yesterdayCompleted: 2,
                yesterdayPrayersLogged: 5,
                currentStreak: 0,
                lastStreakDate: undefined,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("start");
            (0, vitest_1.expect)(out.newStreak).toBe(1);
            (0, vitest_1.expect)(out.reason).toBe("passed-fresh");
        });
        (0, vitest_1.it)("starts fresh when prior streak too old (gap)", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 1,
                yesterdayCompleted: 1,
                yesterdayPrayersLogged: 5,
                currentStreak: 3,
                lastStreakDate: "2026-05-01",
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("start");
            (0, vitest_1.expect)(out.newStreak).toBe(1);
        });
        (0, vitest_1.it)("skips re-recording if already evaluated for yesterday", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 3,
                yesterdayCompleted: 3,
                yesterdayPrayersLogged: 5,
                currentStreak: 8,
                lastStreakDate: yesterday,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("skip");
            (0, vitest_1.expect)(out.newStreak).toBe(8);
            (0, vitest_1.expect)(out.reason).toBe("passed-already-recorded");
        });
        (0, vitest_1.it)("passes empty-day with all 5 prayers logged", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 0,
                yesterdayCompleted: 0,
                yesterdayPrayersLogged: 5,
                currentStreak: 4,
                lastStreakDate: dayBefore,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("increment");
            (0, vitest_1.expect)(out.newStreak).toBe(5);
        });
    });
    (0, vitest_1.describe)("fail cases", () => {
        (0, vitest_1.it)("keeps streak when failed but lastStreakDate is yesterday (already counted today's predecessor)", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 3,
                yesterdayCompleted: 2,
                yesterdayPrayersLogged: 5,
                currentStreak: 5,
                lastStreakDate: yesterday,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("skip");
            (0, vitest_1.expect)(out.newStreak).toBe(5);
        });
        (0, vitest_1.it)("keeps streak when failed but lastStreakDate is day-before-yesterday (1 missed day grace)", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 3,
                yesterdayCompleted: 1,
                yesterdayPrayersLogged: 4,
                currentStreak: 9,
                lastStreakDate: dayBefore,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("skip");
            (0, vitest_1.expect)(out.newStreak).toBe(9);
            (0, vitest_1.expect)(out.reason).toBe("failed-keep");
        });
        (0, vitest_1.it)("resets when failed and lastStreakDate is older than day-before-yesterday", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 2,
                yesterdayCompleted: 1,
                yesterdayPrayersLogged: 5,
                currentStreak: 6,
                lastStreakDate: "2026-05-10",
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("reset");
            (0, vitest_1.expect)(out.newStreak).toBe(0);
            (0, vitest_1.expect)(out.reason).toBe("failed-stale-reset");
        });
        (0, vitest_1.it)("skips when failed and currentStreak is already 0", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 1,
                yesterdayCompleted: 0,
                yesterdayPrayersLogged: 0,
                currentStreak: 0,
                lastStreakDate: undefined,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("skip");
            (0, vitest_1.expect)(out.newStreak).toBe(0);
        });
        (0, vitest_1.it)("fails when prayers missing even if todos all complete", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 3,
                yesterdayCompleted: 3,
                yesterdayPrayersLogged: 4,
                currentStreak: 2,
                lastStreakDate: dayBefore,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("skip");
            (0, vitest_1.expect)(out.newStreak).toBe(2);
        });
        (0, vitest_1.it)("fails on empty day with missing prayers", () => {
            const out = (0, streakDailyEvaluate_1.evaluateStreakIncrement)({
                yesterdayTotal: 0,
                yesterdayCompleted: 0,
                yesterdayPrayersLogged: 3,
                currentStreak: 2,
                lastStreakDate: dayBefore,
                yesterday,
            });
            (0, vitest_1.expect)(out.action).toBe("skip");
            (0, vitest_1.expect)(out.newStreak).toBe(2);
        });
    });
});
//# sourceMappingURL=streakDailyEvaluate.test.js.map