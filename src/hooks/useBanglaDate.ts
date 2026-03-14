import { toZonedTime } from "date-fns-tz";

import { useTimezoneService } from "@/hooks/useTimezoneService";
import { toBanglaNum } from "@/lib/timeFormatting";

const BANGLA_MONTHS = [
	"বৈশাখ",
	"জ্যৈষ্ঠ",
	"আষাঢ়",
	"শ্রাবণ",
	"ভাদ্র",
	"আশ্বিন",
	"কার্তিক",
	"অগ্রহায়ণ",
	"পৌষ",
	"মাঘ",
	"ফাল্গুন",
	"চৈত্র",
];

function getBanglaDate(date: Date): string {
	const startOfYear = new Date(date.getFullYear(), 3, 14);
	if (date < startOfYear) startOfYear.setFullYear(date.getFullYear() - 1);
	const daysDiff = Math.floor(
		(date.getTime() - startOfYear.getTime()) / 86400000,
	);
	const monthLengths = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
	let remaining = daysDiff;
	let monthIdx = 0;
	for (let i = 0; i < monthLengths.length; i++) {
		if (remaining < monthLengths[i]) {
			monthIdx = i;
			break;
		}
		remaining -= monthLengths[i];
	}
	const banglaYear = date.getFullYear() - 593 + (date >= startOfYear ? 0 : -1);
	return `${toBanglaNum(remaining + 1)} ${BANGLA_MONTHS[monthIdx]} ${toBanglaNum(banglaYear)}`;
}

/**
 * Hook to get the current date in Bengali calendar format
 * @returns Formatted Bengali date string (e.g., "১৫ বৈশাখ ১৪৩৩")
 */
export function useBanglaDate(): string {
	const { timezone } = useTimezoneService();
	const utcDate = new Date();
	const zonedDate = toZonedTime(utcDate, timezone);
	return getBanglaDate(zonedDate);
}
