export const NOTIFICATION_SENT_STATE_KEY = "hasanat-notif-sent-v1";

export type NotificationSentState = Record<string, number>;

export function readNotificationSentState(): NotificationSentState {
	const raw = localStorage.getItem(NOTIFICATION_SENT_STATE_KEY);
	if (!raw) return {};
	try {
		const parsed = JSON.parse(raw) as NotificationSentState;
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch (error) {
		console.error("Failed to parse notification sent state:", error);
		return {};
	}
}

export function wasNotificationSent(
	state: NotificationSentState,
	sentKey: string,
): boolean {
	return Boolean(state[sentKey]);
}

export function makeNotificationSentKey(
	userId: string,
	dateKey: string,
	type: "prayer" | "tip",
	identifier: string,
): string {
	return `${userId}:${dateKey}:${type}:${identifier}`;
}

export function markNotificationSent(
	state: NotificationSentState,
	sentKey: string,
	now: number = Date.now(),
): NotificationSentState {
	const nextState: NotificationSentState = { ...state, [sentKey]: now };
	localStorage.setItem(NOTIFICATION_SENT_STATE_KEY, JSON.stringify(nextState));
	return nextState;
}
