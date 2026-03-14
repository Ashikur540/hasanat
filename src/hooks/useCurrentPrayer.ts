import { timeToMinutes } from "@/lib/timeFormatting";
import { PrayerTime } from "./usePrayerTimes";

/**
 * Helper function to find the current prayer index based on current time.
 * Iterates backwards through the schedule to find the most recent prayer that has started.
 */
function getCurrentPrayerIndex(
	schedule: PrayerTime[],
	nowMins: number,
): number {
	let currentIdx = 0;
	for (let i = schedule.length - 1; i >= 0; i--) {
		if (nowMins >= timeToMinutes(schedule[i].start)) {
			currentIdx = i;
			break;
		}
	}
	return currentIdx;
}

/**
 * Hook to calculate the current prayer and its progress.
 * Returns the current prayer, its timing details, and progress percentage.
 *
 * @param schedule - Array of prayer times
 * @param nowMins - Current time in minutes since midnight
 * @returns Object containing current prayer, timing info, and progress percentage
 */
export const useCurrentPrayer = (schedule: PrayerTime[], nowMins: number) => {
	const currentIdx = getCurrentPrayerIndex(schedule, nowMins);
	const current = schedule[currentIdx];

	const startMins = timeToMinutes(current.start);
	const endMins = timeToMinutes(current.end);
	const totalDuration = endMins - startMins;
	const elapsed = nowMins - startMins;
	const remaining = Math.max(0, endMins - nowMins);
	const progressPct =
		totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;

	return {
		current,
		currentIdx,
		startMins,
		endMins,
		elapsed,
		remaining,
		progressPct,
	};
};
