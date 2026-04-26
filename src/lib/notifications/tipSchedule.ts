import { parse } from "date-fns";

export type TipSlotId = "morning" | "evening" | "night";

export interface TipSlot {
	id: TipSlotId;
	time: string;
}

export interface StoredTipSchedule {
	userId: string;
	date: string;
	slots: TipSlot[];
}

const TIP_WINDOWS: Record<TipSlotId, { hour: number; durationMinutes: number }> = {
	morning: { hour: 8, durationMinutes: 180 },
	evening: { hour: 16, durationMinutes: 180 },
	night: { hour: 20, durationMinutes: 180 },
};

export const NOTIFICATION_TIP_SCHEDULE_KEY = "hasanat-notif-tip-schedule-v1";

function randomInt(maxExclusive: number, rng: () => number): number {
	const value = Math.floor(rng() * maxExclusive);
	return Number.isFinite(value) && value >= 0 ? value : 0;
}

export function buildTipSlots(rng: () => number = Math.random): TipSlot[] {
	return (Object.keys(TIP_WINDOWS) as TipSlotId[]).map((slotId) => {
		const { hour, durationMinutes } = TIP_WINDOWS[slotId];
		const minuteOffset = randomInt(durationMinutes, rng);
		const slotHour = hour + Math.floor(minuteOffset / 60);
		const slotMinute = minuteOffset % 60;
		return {
			id: slotId,
			time: `${String(slotHour).padStart(2, "0")}:${String(slotMinute).padStart(2, "0")}`,
		};
	});
}

export function readStoredTipSchedule(): StoredTipSchedule | null {
	const raw = localStorage.getItem(NOTIFICATION_TIP_SCHEDULE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as StoredTipSchedule;
		if (!parsed?.userId || !parsed?.date || !Array.isArray(parsed?.slots)) {
			return null;
		}
		return parsed;
	} catch (error) {
		console.error("Failed to parse stored tip schedule:", error);
		return null;
	}
}

export function getOrCreateTipScheduleForDate(
	userId: string,
	dateKey: string,
	rng: () => number = Math.random,
): StoredTipSchedule {
	const existing = readStoredTipSchedule();
	if (existing && existing.userId === userId && existing.date === dateKey) {
		return existing;
	}
	const nextSchedule: StoredTipSchedule = {
		userId,
		date: dateKey,
		slots: buildTipSlots(rng),
	};
	localStorage.setItem(NOTIFICATION_TIP_SCHEDULE_KEY, JSON.stringify(nextSchedule));
	return nextSchedule;
}

export function isTipSlotDue(slot: TipSlot, now: Date): boolean {
	const slotDate = parse(slot.time, "HH:mm", now);
	return now.getTime() >= slotDate.getTime();
}
