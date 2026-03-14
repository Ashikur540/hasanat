import { toZonedTime } from "date-fns-tz";

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

function getHijriDate(date: Date): {
	day: number;
	month: string;
	monthBn: string;
	year: number;
} {
	const gregorianDays = Math.floor(
		(date.getTime() - new Date(622, 6, 16).getTime()) / 86400000,
	);
	const hijriYear = Math.floor((30 * gregorianDays + 10646) / 10631);
	const daysInYear =
		gregorianDays - Math.floor((10631 * hijriYear - 10617) / 30);
	const hijriMonth = Math.min(12, Math.ceil((daysInYear - 0.5) / 29.5));
	const hijriDay = Math.max(1, Math.ceil(daysInYear - 29.5 * (hijriMonth - 1)));

	return {
		day: hijriDay,
		month: HIJRI_MONTHS[hijriMonth - 1] || "Ramadan",
		monthBn: HIJRI_MONTHS_BN[hijriMonth - 1] || "রমজান",
		year: hijriYear,
	};
}

/**
 * Hook to get the current Hijri date
 * Retrieves the current date in the user's timezone and converts it to Hijri calendar
 * @returns Object containing day, month (English), monthBn (Bengali), and year
 */
export function useHijriDate() {
	const { timezone } = useTimezoneService();
	const now = new Date();
	const zonedDate = toZonedTime(now, timezone);

	return getHijriDate(zonedDate);
}
