import { describe, expect, it } from "vitest";
import { getPrayerTimes } from "@/lib/prayer/prayerEngine";

const HHMM_REGEX = /^\d{2}:\d{2}$/;

function toMins(time: string): number {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
}

describe("getPrayerTimes", () => {
	it("returns HH:mm formatted prayer times using Umm Al-Qura engine", () => {
		const times = getPrayerTimes(23.8103, 90.4125, new Date("2026-04-15T12:00:00Z"));

		expect(times.fajr).toMatch(HHMM_REGEX);
		expect(times.sunrise).toMatch(HHMM_REGEX);
		expect(times.sunset).toMatch(HHMM_REGEX);
		expect(times.dhuhr).toMatch(HHMM_REGEX);
		expect(times.asr).toMatch(HHMM_REGEX);
		expect(times.maghrib).toMatch(HHMM_REGEX);
		expect(times.isha).toMatch(HHMM_REGEX);
	});

	it("returns a chronologically valid day schedule", () => {
		const times = getPrayerTimes(24.8607, 67.0011, new Date("2026-01-15T12:00:00Z"));

		expect(toMins(times.fajr)).toBeLessThan(toMins(times.sunrise));
		expect(toMins(times.sunrise)).toBeLessThan(toMins(times.dhuhr));
		expect(toMins(times.dhuhr)).toBeLessThan(toMins(times.asr));
		expect(toMins(times.asr)).toBeLessThan(toMins(times.maghrib));
		expect(toMins(times.maghrib)).toBeLessThanOrEqual(toMins(times.sunset) + 5);
		expect(toMins(times.maghrib)).toBeLessThan(toMins(times.isha));
	});
});
