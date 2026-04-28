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

function getHijriDate(
	date: Date,
	timezone: string,
): {
	day: number;
	month: string;
	monthBn: string;
	year: number;
} {
	const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: timezone,
		numberingSystem: "latn",
	}).formatToParts(date);

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
 * Hook to get the current Hijri date (Umm al-Qura calendar).
 * @returns { day, month (English), monthBn (Bengali), year }
 */
export function useHijriDate() {
	const { timezone } = useTimezoneService();
	return getHijriDate(new Date(), timezone);
}
