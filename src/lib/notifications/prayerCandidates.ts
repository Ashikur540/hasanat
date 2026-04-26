import { parse } from "date-fns";

export type PrayerReminderId = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerScheduleLike {
	id: string;
	en: string;
	bn: string;
	start: string;
	end: string;
}

export interface PrayerReminderCandidate {
	id: PrayerReminderId;
	labelEn: string;
	labelBn: string;
	minutesRemaining: number;
}

const PRAYER_IDS: PrayerReminderId[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export function isPrayerReminderId(value: string): value is PrayerReminderId {
	return PRAYER_IDS.includes(value as PrayerReminderId);
}

export function readCompletedPrayersFromLocalStorage(
	dateKey: string,
): Set<PrayerReminderId> {
	const storageKey = `hasanat-prayers-state-${dateKey}`;
	const completed = new Set<PrayerReminderId>();
	const raw = localStorage.getItem(storageKey);
	if (!raw) return completed;

	try {
		const parsed = JSON.parse(raw) as Record<string, { completed?: boolean }>;
		for (const [prayerId, value] of Object.entries(parsed)) {
			if (isPrayerReminderId(prayerId) && value?.completed) {
				completed.add(prayerId);
			}
		}
	} catch (error) {
		console.error("Failed to read completed prayers from localStorage:", error);
	}
	return completed;
}

export function getNearClosePrayerCandidates(
	schedule: PrayerScheduleLike[],
	now: Date,
	bufferMinutes: number,
): PrayerReminderCandidate[] {
	const candidates: PrayerReminderCandidate[] = [];
	const effectiveBuffer = Math.max(0, bufferMinutes);

	for (const item of schedule) {
		if (!isPrayerReminderId(item.id)) continue;
		const startAt = parse(item.start, "HH:mm", now);
		const endAt = parse(item.end, "HH:mm", now);
		if (now < startAt || now > endAt) continue;

		const minutesRemaining = Math.floor((endAt.getTime() - now.getTime()) / 60000);
		if (minutesRemaining < 0 || minutesRemaining > effectiveBuffer) continue;

		candidates.push({
			id: item.id,
			labelEn: item.en,
			labelBn: item.bn,
			minutesRemaining,
		});
	}

	return candidates.sort((a, b) => a.minutesRemaining - b.minutesRemaining);
}
