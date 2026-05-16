import { useSettingsApi } from "@/features/settings/hooks/useSettingsApi";
import { useTimezoneService } from "@/hooks/useTimezoneService";

const HIJRI_MONTHS = [
	"Muharram",
	"Safar",
	"Rabi al-Awwal",
	"Rabi al-Thani",
	"Jumada al-Ula",
	"Jumada al-Thani",
	"Rajab",
	"Sha'ban",
	"Ramadan",
	"Shawwal",
	"Dhul Qi'dah",
	"Dhul Hijjah",
];

const HIJRI_MONTHS_BN = [
	"মুহাররম",
	"সফর",
	"রবিউল আউয়াল",
	"রবিউস সানি",
	"জুমাদাল উলা",
	"জুমাদাস সানি",
	"রজব",
	"শাবান",
	"রমজান",
	"শাওয়াল",
	"জিলক্বদ",
	"জিলহজ্জ",
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface HijriDate {
	day: number;
	month: string;
	monthBn: string;
	year: number;
}

/**
 * Converts a Gregorian instant to a Hijri date using Umm al-Qura calendar
 * (Saudi Arabia's official tabular calendar). The offset shifts the result
 * by N days so users can match their local moon-sighting committee
 * (e.g. Bangladesh sightings are usually 1 day behind Saudi).
 */
export function getHijriDate(
	date: Date,
	timezone: string,
	offsetDays = 0,
): HijriDate {
	const shifted = new Date(date.getTime() + offsetDays * MS_PER_DAY);

	const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: timezone,
		numberingSystem: "latn",
	}).formatToParts(shifted);

	const getPart = (type: string) =>
		parts.find((p) => p.type === type)?.value ?? "";

	const day = parseInt(getPart("day"), 10);
	const monthNum = parseInt(getPart("month"), 10);
	const year = parseInt(getPart("year"), 10);

	const idx = Math.min(11, Math.max(0, monthNum - 1));

	return {
		day,
		month: HIJRI_MONTHS[idx],
		monthBn: HIJRI_MONTHS_BN[idx],
		year,
	};
}

/**
 * Returns today's Hijri date in the user's timezone, with any user-set
 * day offset applied. Default offset is 0 (matches Umm al-Qura exactly).
 */
export function useHijriDate(): HijriDate {
	const { timezone } = useTimezoneService();
	const { settings } = useSettingsApi();
	const offset = Number.isFinite(settings.hijriOffset)
		? settings.hijriOffset
		: 0;
	return getHijriDate(new Date(), timezone, offset);
}
