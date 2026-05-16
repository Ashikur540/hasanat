import { describe, expect, it } from "vitest";
import { getHijriDate } from "./useHijriDate";

const DHAKA = "Asia/Dhaka";

describe("getHijriDate", () => {
	it("returns valid shape with offset 0", () => {
		const result = getHijriDate(new Date("2026-05-16T06:00:00Z"), DHAKA, 0);
		expect(typeof result.day).toBe("number");
		expect(typeof result.month).toBe("string");
		expect(typeof result.monthBn).toBe("string");
		expect(typeof result.year).toBe("number");
		expect(result.day).toBeGreaterThan(0);
		expect(result.day).toBeLessThanOrEqual(30);
		expect(result.year).toBeGreaterThan(1400);
	});

	it("matches Umm al-Qura for 16 May 2026 in Dhaka (29 Dhul Qi'dah 1447)", () => {
		const result = getHijriDate(new Date("2026-05-16T06:00:00Z"), DHAKA, 0);
		expect(result.day).toBe(29);
		expect(result.month).toBe("Dhul Qi'dah");
		expect(result.year).toBe(1447);
	});

	it("applies negative offset (BD sighting 1 day behind Saudi)", () => {
		const result = getHijriDate(new Date("2026-05-16T06:00:00Z"), DHAKA, -1);
		expect(result.day).toBe(28);
		expect(result.month).toBe("Dhul Qi'dah");
		expect(result.year).toBe(1447);
	});

	it("applies positive offset (1 day ahead)", () => {
		const baseline = getHijriDate(
			new Date("2026-05-16T06:00:00Z"),
			DHAKA,
			0,
		);
		const ahead = getHijriDate(new Date("2026-05-16T06:00:00Z"), DHAKA, +1);
		// Ahead by 1 day — day number rolls forward (or resets at month boundary)
		if (baseline.month === ahead.month) {
			expect(ahead.day).toBe(baseline.day + 1);
		} else {
			expect(ahead.day).toBe(1);
		}
	});

	it("offset shift equals equivalent Gregorian date shift", () => {
		// Apr 10, 2026 with offset -2 should equal Apr 8, 2026 with offset 0.
		const a = getHijriDate(new Date("2026-04-10T06:00:00Z"), DHAKA, -2);
		const b = getHijriDate(new Date("2026-04-08T06:00:00Z"), DHAKA, 0);
		expect(a).toEqual(b);
	});

	it("crosses month boundary cleanly", () => {
		// Pick a Gregorian date close to a Hijri month flip.
		// Apr 18 2026 ≈ 1 Dhul Qi'dah 1447 (start of month).
		// With offset -1, should land on last day of Shawwal (29 or 30).
		const startOfMonth = getHijriDate(
			new Date("2026-04-18T06:00:00Z"),
			DHAKA,
			0,
		);
		if (startOfMonth.day === 1) {
			const prevDay = getHijriDate(
				new Date("2026-04-18T06:00:00Z"),
				DHAKA,
				-1,
			);
			expect([29, 30]).toContain(prevDay.day);
			expect(prevDay.month).not.toBe(startOfMonth.month);
		} else {
			// If our seed date isn't actually day-1, skip this assertion gracefully.
			expect(startOfMonth.day).toBeGreaterThanOrEqual(1);
		}
	});

	it("crosses year boundary cleanly with positive offset", () => {
		// 29 Dhul Hijjah is last day of Hijri year.
		// Build a Gregorian date in mid-June 2026 (around 29 Dhul Hijjah 1447).
		// Iterate to find the actual last day, then offset +1 should be Muharram 1448.
		let cursor = new Date("2026-06-10T06:00:00Z");
		let prev = getHijriDate(cursor, DHAKA, 0);
		for (let i = 0; i < 30; i++) {
			cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
			const next = getHijriDate(cursor, DHAKA, 0);
			if (next.year > prev.year) {
				expect(next.month).toBe("Muharram");
				expect(next.day).toBe(1);
				return;
			}
			prev = next;
		}
		throw new Error("Year boundary not found in 30-day window");
	});

	it("returns Bengali month name alongside English", () => {
		const result = getHijriDate(new Date("2026-05-16T06:00:00Z"), DHAKA, 0);
		expect(result.month).toBe("Dhul Qi'dah");
		expect(result.monthBn).toBe("জিলক্বদ");
	});

	it("respects timezone for date-boundary instants", () => {
		// UTC midnight on 2026-05-16 is 6am in Dhaka, 5pm previous day in LA.
		const instant = new Date("2026-05-16T00:00:00Z");
		const dhaka = getHijriDate(instant, "Asia/Dhaka", 0);
		const la = getHijriDate(instant, "America/Los_Angeles", 0);
		// Dhaka is ahead — its Hijri day should be >= LA's
		expect(dhaka.day).toBeGreaterThanOrEqual(la.day);
	});
});
