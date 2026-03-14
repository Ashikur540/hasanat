import { formatInTimeZone } from "date-fns-tz";

/**
 * Convert HH:MM time string to minutes
 */
export function timeToMinutes(timeStr: string): number {
	const [h, m] = timeStr.split(":").map(Number);
	return h * 60 + m;
}

/**
 * Convert number to Bengali numerals
 */
export function toBanglaNum(n: number): string {
	const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
	return String(n).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
}

/**
 * Format remaining time in hours and minutes
 * @param mins - Remaining minutes
 * @param isBn - Whether to use Bengali
 */
export function formatTimeLeft(mins: number, isBn: boolean): string {
	const h = Math.floor(mins / 60);
	const m = mins % 60;

	if (isBn) {
		return h > 0
			? `${toBanglaNum(h)} ঘন্টা ${toBanglaNum(m)} মিনিট বাকি`
			: `${toBanglaNum(m)} মিনিট বাকি`;
	}

	return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

/**
 * Format prayer time in user's timezone using date-fns-tz
 * @param timeStr - Time in HH:MM format
 * @param timezone - IANA timezone string (e.g., 'Asia/Dhaka')
 */
export function formatTimeInTimezone(
	timeStr: string,
	timezone: string,
): string {
	try {
		const [hours, minutes] = timeStr.split(":").map(Number);
		const now = new Date();
		const dateInTimezone = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			hours,
			minutes,
			0,
		);

		// Use date-fns-tz to format time in the specified timezone
		const formatted = formatInTimeZone(dateInTimezone, timezone, "HH:mm");

		return formatted;
	} catch (error) {
		// Fallback to Intl API if date-fns-tz fails
		return formatTimeWithIntl(timeStr, timezone);
	}
}

/**
 * Format time with Intl API (fallback method)
 */
export function formatTimeWithIntl(timeStr: string, timezone: string): string {
	try {
		const [hours, minutes] = timeStr.split(":").map(Number);
		const now = new Date();
		const date = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			hours,
			minutes,
			0,
		);

		const formatter = new Intl.DateTimeFormat("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
			timeZone: timezone,
		});

		return formatter.format(date);
	} catch (error) {
		return timeStr;
	}
}

/**
 * Get current time in minutes since midnight
 */
export function getCurrentTimeInMinutes(): number {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
}

/**
 * Parse HH:MM format time and get hours and minutes
 */
export function parseTime(timeStr: string): { hours: number; minutes: number } {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return { hours, minutes };
}
