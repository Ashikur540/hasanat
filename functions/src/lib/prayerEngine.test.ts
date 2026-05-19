import { describe, expect, it } from "vitest";
import {
	getNearClosePrayers,
	getPrayerWindows,
	prayerReminderBody,
	PRAYER_IDS,
	type PrayerWindows,
} from "./prayerEngine.js";

describe("getPrayerWindows", () => {
	it("returns 5 prayer windows for Dhaka (BD) on a fixed date", () => {
		// 23.81°N, 90.41°E (Dhaka), 2026-05-15 12:00 UTC = ~18:00 local
		const windows = getPrayerWindows(23.81, 90.41, new Date("2026-05-15T12:00:00Z"));
		for (const id of PRAYER_IDS) {
			expect(windows[id].start).toBeInstanceOf(Date);
			expect(windows[id].end).toBeInstanceOf(Date);
			// end is after start
			expect(windows[id].end.getTime()).toBeGreaterThan(
				windows[id].start.getTime(),
			);
		}
	});

	it("isha window ends in the next day (uses tomorrow's fajr)", () => {
		const windows = getPrayerWindows(23.81, 90.41, new Date("2026-05-15T12:00:00Z"));
		// isha ends close to tomorrow's pre-dawn
		const ishaEndsAfterIshaStartsBy = windows.isha.end.getTime() - windows.isha.start.getTime();
		expect(ishaEndsAfterIshaStartsBy).toBeGreaterThan(60 * 60 * 1000); // > 1h
	});

	it("returns upcoming fajr window when near local pre-sunrise (UTC+6 day boundary)", () => {
		// Bogura ~24.85°N, 89.37°E. now = 23:10 UTC May 17 = ~5:10 AM BDT May 18.
		// User-local fajr May 18 starts before now and ends at sunrise ~5:25 AM BDT.
		// Bug-mode would have returned May 17's fajr (24h past). Fix returns the
		// fajr window containing `now`.
		const now = new Date("2026-05-17T23:10:00Z");
		const windows = getPrayerWindows(24.85, 89.37, now);
		expect(windows.fajr.start.getTime()).toBeLessThanOrEqual(now.getTime());
		expect(windows.fajr.end.getTime()).toBeGreaterThan(now.getTime());
	});

	it("returns upcoming isha window after local midnight (UTC+6)", () => {
		// Bogura, now = 19:00 UTC May 17 = 1:00 AM BDT May 18. Still inside the
		// May-17-night isha window which ends at fajr ~5:00 AM BDT May 18.
		const now = new Date("2026-05-17T19:00:00Z");
		const windows = getPrayerWindows(24.85, 89.37, now);
		expect(windows.isha.start.getTime()).toBeLessThanOrEqual(now.getTime());
		expect(windows.isha.end.getTime()).toBeGreaterThan(now.getTime());
	});
});

describe("getNearClosePrayers", () => {
	function fixedWindows(): PrayerWindows {
		const base = new Date("2026-05-15T00:00:00Z").getTime();
		const min = (m: number) => new Date(base + m * 60_000);
		return {
			fajr: { start: min(0), end: min(60) },
			dhuhr: { start: min(120), end: min(240) },
			asr: { start: min(240), end: min(360) },
			maghrib: { start: min(360), end: min(420) },
			isha: { start: min(420), end: min(720) },
		};
	}

	it("returns empty when outside all windows", () => {
		const w = fixedWindows();
		const now = new Date("2026-05-15T01:30:00Z"); // 90 min in — gap between fajr-end and dhuhr-start
		expect(getNearClosePrayers(w, now, 20)).toEqual([]);
	});

	it("returns prayer when within window and within buffer", () => {
		const w = fixedWindows();
		// fajr ends at min 60. now = min 45 → 15 min left, within 20-min buffer
		const now = new Date("2026-05-15T00:45:00Z");
		const result = getNearClosePrayers(w, now, 20);
		expect(result.length).toBe(1);
		expect(result[0].id).toBe("fajr");
		expect(result[0].minutesRemaining).toBe(15);
	});

	it("excludes prayer when within window but past buffer", () => {
		const w = fixedWindows();
		// dhuhr ends at min 240. now = min 130 → 110 min left, > 20-min buffer
		const now = new Date("2026-05-15T02:10:00Z");
		expect(getNearClosePrayers(w, now, 20)).toEqual([]);
	});

	it("sorts by minutesRemaining ascending", () => {
		const w = fixedWindows();
		// Two overlapping windows (asr ends at 360 = same as maghrib start)
		// Use a now that fits in a single window with two near-close at different buffers — synthetic test
		// Actually our shape has no overlaps, so re-craft an overlapping fixture
		const overlap: PrayerWindows = {
			...w,
			asr: {
				start: new Date("2026-05-15T03:00:00Z"),
				end: new Date("2026-05-15T03:50:00Z"),
			},
			maghrib: {
				start: new Date("2026-05-15T03:00:00Z"),
				end: new Date("2026-05-15T03:30:00Z"),
			},
		};
		const now = new Date("2026-05-15T03:25:00Z");
		const result = getNearClosePrayers(overlap, now, 30);
		expect(result.map((c) => c.id)).toEqual(["maghrib", "asr"]);
	});
});

describe("prayerReminderBody", () => {
	it("English template includes prayer name + minutes", () => {
		const out = prayerReminderBody("en", "Asr", 12);
		expect(out).toContain("Asr");
		expect(out).toContain("12");
	});

	it("Bengali template includes prayer name + minutes", () => {
		const out = prayerReminderBody("bn", "আসর", 7);
		expect(out).toContain("আসর");
		expect(out).toContain("7");
	});
});
