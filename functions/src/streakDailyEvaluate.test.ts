import { describe, expect, it } from "vitest";
import {
	evaluateStreakIncrement,
	shiftDate,
	userLocalDate,
	userLocalHour,
} from "./streakDailyEvaluate";

const NOW_UTC = new Date("2026-05-14T18:30:00Z");

describe("userLocalDate", () => {
	it("converts UTC instant to Asia/Dhaka local date", () => {
		expect(userLocalDate("Asia/Dhaka", NOW_UTC)).toBe("2026-05-15");
	});

	it("converts UTC instant to America/Los_Angeles local date", () => {
		expect(userLocalDate("America/Los_Angeles", NOW_UTC)).toBe("2026-05-14");
	});

	it("converts UTC instant to Pacific/Auckland local date", () => {
		expect(userLocalDate("Pacific/Auckland", NOW_UTC)).toBe("2026-05-15");
	});
});

describe("userLocalHour", () => {
	it("returns BD hour at UTC 18:00 (BD midnight)", () => {
		expect(userLocalHour("Asia/Dhaka", new Date("2026-05-14T18:05:00Z"))).toBe(
			0,
		);
	});

	it("returns BD hour at UTC 12:00 (BD 18:00)", () => {
		expect(userLocalHour("Asia/Dhaka", new Date("2026-05-14T12:00:00Z"))).toBe(
			18,
		);
	});

	it("returns LA hour at UTC 07:00 (LA midnight in PDT)", () => {
		expect(
			userLocalHour("America/Los_Angeles", new Date("2026-05-14T07:30:00Z")),
		).toBe(0);
	});

	it("returns Auckland hour at UTC 12:00 (NZ midnight in NZST)", () => {
		// NZ is UTC+12 in standard time (May = NZST, no DST)
		expect(
			userLocalHour("Pacific/Auckland", new Date("2026-05-14T12:15:00Z")),
		).toBe(0);
	});
});

describe("shiftDate", () => {
	it("subtracts 1 day", () => {
		expect(shiftDate("2026-05-15", -1)).toBe("2026-05-14");
	});

	it("handles month boundary", () => {
		expect(shiftDate("2026-06-01", -1)).toBe("2026-05-31");
	});

	it("handles year boundary", () => {
		expect(shiftDate("2026-01-01", -1)).toBe("2025-12-31");
	});

	it("handles leap year February", () => {
		expect(shiftDate("2024-03-01", -1)).toBe("2024-02-29");
	});
});

describe("evaluateStreakIncrement", () => {
	const yesterday = "2026-05-14";
	const dayBefore = "2026-05-13";

	describe("pass cases", () => {
		it("increments when prior streak ended day-before-yesterday", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 3,
				yesterdayCompleted: 3,
				yesterdayPrayersLogged: 5,
				currentStreak: 7,
				lastStreakDate: dayBefore,
				yesterday,
			});
			expect(out.action).toBe("increment");
			expect(out.newStreak).toBe(8);
			expect(out.reason).toBe("passed-continuation");
		});

		it("starts fresh when no prior streak doc", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 2,
				yesterdayCompleted: 2,
				yesterdayPrayersLogged: 5,
				currentStreak: 0,
				lastStreakDate: undefined,
				yesterday,
			});
			expect(out.action).toBe("start");
			expect(out.newStreak).toBe(1);
			expect(out.reason).toBe("passed-fresh");
		});

		it("starts fresh when prior streak too old (gap)", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 1,
				yesterdayCompleted: 1,
				yesterdayPrayersLogged: 5,
				currentStreak: 3,
				lastStreakDate: "2026-05-01",
				yesterday,
			});
			expect(out.action).toBe("start");
			expect(out.newStreak).toBe(1);
		});

		it("skips re-recording if already evaluated for yesterday", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 3,
				yesterdayCompleted: 3,
				yesterdayPrayersLogged: 5,
				currentStreak: 8,
				lastStreakDate: yesterday,
				yesterday,
			});
			expect(out.action).toBe("skip");
			expect(out.newStreak).toBe(8);
			expect(out.reason).toBe("passed-already-recorded");
		});

		it("passes empty-day with all 5 prayers logged", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 0,
				yesterdayCompleted: 0,
				yesterdayPrayersLogged: 5,
				currentStreak: 4,
				lastStreakDate: dayBefore,
				yesterday,
			});
			expect(out.action).toBe("increment");
			expect(out.newStreak).toBe(5);
		});
	});

	describe("fail cases", () => {
		it("keeps streak when failed but lastStreakDate is yesterday (already counted today's predecessor)", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 3,
				yesterdayCompleted: 2,
				yesterdayPrayersLogged: 5,
				currentStreak: 5,
				lastStreakDate: yesterday,
				yesterday,
			});
			expect(out.action).toBe("skip");
			expect(out.newStreak).toBe(5);
		});

		it("keeps streak when failed but lastStreakDate is day-before-yesterday (1 missed day grace)", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 3,
				yesterdayCompleted: 1,
				yesterdayPrayersLogged: 4,
				currentStreak: 9,
				lastStreakDate: dayBefore,
				yesterday,
			});
			expect(out.action).toBe("skip");
			expect(out.newStreak).toBe(9);
			expect(out.reason).toBe("failed-keep");
		});

		it("resets when failed and lastStreakDate is older than day-before-yesterday", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 2,
				yesterdayCompleted: 1,
				yesterdayPrayersLogged: 5,
				currentStreak: 6,
				lastStreakDate: "2026-05-10",
				yesterday,
			});
			expect(out.action).toBe("reset");
			expect(out.newStreak).toBe(0);
			expect(out.reason).toBe("failed-stale-reset");
		});

		it("skips when failed and currentStreak is already 0", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 1,
				yesterdayCompleted: 0,
				yesterdayPrayersLogged: 0,
				currentStreak: 0,
				lastStreakDate: undefined,
				yesterday,
			});
			expect(out.action).toBe("skip");
			expect(out.newStreak).toBe(0);
		});

		it("fails when prayers missing even if todos all complete", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 3,
				yesterdayCompleted: 3,
				yesterdayPrayersLogged: 4,
				currentStreak: 2,
				lastStreakDate: dayBefore,
				yesterday,
			});
			expect(out.action).toBe("skip");
			expect(out.newStreak).toBe(2);
		});

		it("fails on empty day with missing prayers", () => {
			const out = evaluateStreakIncrement({
				yesterdayTotal: 0,
				yesterdayCompleted: 0,
				yesterdayPrayersLogged: 3,
				currentStreak: 2,
				lastStreakDate: dayBefore,
				yesterday,
			});
			expect(out.action).toBe("skip");
			expect(out.newStreak).toBe(2);
		});
	});
});
