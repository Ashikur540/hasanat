import {
	CalculationMethod,
	Coordinates,
	Madhab,
	PrayerTimes as AdhanPrayerTimes,
} from "adhan";

export const PRAYER_IDS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type PrayerId = (typeof PRAYER_IDS)[number];

export const PRAYER_LABELS: Record<PrayerId, { en: string; bn: string }> = {
	fajr: { en: "Fajr", bn: "ফজর" },
	dhuhr: { en: "Dhuhr", bn: "যুহর" },
	asr: { en: "Asr", bn: "আসর" },
	maghrib: { en: "Maghrib", bn: "মাগরিব" },
	isha: { en: "Isha", bn: "ইশা" },
};

export interface PrayerWindow {
	start: Date;
	end: Date;
}

export type PrayerWindows = Record<PrayerId, PrayerWindow>;

/**
 * Computes raw Adhan prayer times for a single day using UmmAlQura + Shafi madhab.
 * Matches client-side config so server + client always agree on times.
 */
function computeTimes(
	lat: number,
	lng: number,
	date: Date,
): AdhanPrayerTimes {
	const coordinates = new Coordinates(lat, lng);
	const params = CalculationMethod.UmmAlQura();
	params.madhab = Madhab.Shafi;
	return new AdhanPrayerTimes(coordinates, date, params);
}

/**
 * Returns 5 prayer windows {start, end} as Date instants for the given location/day.
 * Isha's end uses tomorrow's Fajr so the window spans midnight cleanly.
 */
export function getPrayerWindows(
	lat: number,
	lng: number,
	date: Date = new Date(),
): PrayerWindows {
	const today = computeTimes(lat, lng, date);
	const tomorrowDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
	const tomorrow = computeTimes(lat, lng, tomorrowDate);

	return {
		fajr: { start: today.fajr, end: today.sunrise },
		dhuhr: { start: today.dhuhr, end: today.asr },
		asr: { start: today.asr, end: today.maghrib },
		maghrib: { start: today.maghrib, end: today.isha },
		isha: { start: today.isha, end: tomorrow.fajr },
	};
}

export interface NearCloseCandidate {
	id: PrayerId;
	minutesRemaining: number;
	end: Date;
}

/**
 * Returns prayers currently in their window AND ending within `bufferMinutes`.
 * Matches client-side `getNearClosePrayerCandidates` behaviour but operates on
 * Date instants (no HH:mm string round-trip).
 */
export function getNearClosePrayers(
	windows: PrayerWindows,
	now: Date,
	bufferMinutes: number,
): NearCloseCandidate[] {
	const out: NearCloseCandidate[] = [];
	const effectiveBuffer = Math.max(0, bufferMinutes);

	for (const id of PRAYER_IDS) {
		const w = windows[id];
		if (now < w.start || now > w.end) continue;
		const minutesRemaining = Math.floor(
			(w.end.getTime() - now.getTime()) / 60000,
		);
		if (minutesRemaining < 0 || minutesRemaining > effectiveBuffer) continue;
		out.push({ id, minutesRemaining, end: w.end });
	}

	return out.sort((a, b) => a.minutesRemaining - b.minutesRemaining);
}

/**
 * Builds the localized push-notification body for a near-close prayer reminder.
 * EN/BN templates only — extend the switch above to add more languages.
 */
export function prayerReminderBody(
	language: "en" | "bn",
	prayerLabel: string,
	minutesRemaining: number,
): string {
	if (language === "bn") {
		return `${prayerLabel} এর ওয়াক্ত শেষ হতে ${minutesRemaining} মিনিট বাকি। সালাত পড়ে থাকলে চেক করে দিন।`;
	}
	return `${prayerLabel} time is ending in ${minutesRemaining} minutes. If you prayed, mark it now.`;
}
