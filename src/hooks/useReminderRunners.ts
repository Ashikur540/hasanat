import { useCallback, useEffect, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";

import { format } from "date-fns";

import { db } from "@/lib/firebase";
import { useAuth } from "@/features/auth";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useI18n } from "@/i18n/I18nProvider";
import type { NotificationSettingsData } from "@/features/settings";
import {
	dispatchSystemNotification,
	type DispatchResult,
} from "@/lib/notifications/dispatch";

const getLocalDateKey = (date: Date = new Date()): string =>
	format(date, "yyyy-MM-dd");
import {
	getNearClosePrayerCandidates,
	readCompletedPrayersFromLocalStorage,
	type PrayerReminderId,
} from "@/lib/notifications/prayerCandidates";
import {
	getOrCreateTipScheduleForDate,
	isTipSlotDue,
} from "@/lib/notifications/tipSchedule";
import {
	makeNotificationSentKey,
	markNotificationSent,
	readNotificationSentState,
	type NotificationSentState,
	wasNotificationSent,
} from "@/lib/notifications/sentState";
import { getPrayerReminderBody, getRandomTip } from "@/lib/notifications/deedTips";

const PRAYER_DEED_IDS: Record<PrayerReminderId, string> = {
	fajr: "prayer_fajr",
	dhuhr: "prayer_dhuhr",
	asr: "prayer_asr",
	maghrib: "prayer_maghrib",
	isha: "prayer_isha",
};

type Permission = NotificationPermission | "unsupported";

interface UseReminderRunnersArgs {
	settings: NotificationSettingsData;
	permissionStatus: Permission;
}

export function useReminderRunners({
	settings,
	permissionStatus,
}: UseReminderRunnersArgs) {
	const { t, language } = useI18n();
	const { user } = useAuth();
	const { schedule } = usePrayerTimes();

	const sentStateRef = useRef<NotificationSentState>(readNotificationSentState());
	const firestoreCompletedRef = useRef<Set<PrayerReminderId>>(new Set());

	const refreshFirestoreCompleted = useCallback(async () => {
		if (!user?.uid) {
			firestoreCompletedRef.current = new Set();
			return;
		}
		const today = getLocalDateKey();
		const completed = new Set<PrayerReminderId>();
		try {
			const snapshot = await getDocs(
				query(
					collection(db, "deed_logs"),
					where("userId", "==", user.uid),
					where("date", "==", today),
					where("deedId", "in", Object.values(PRAYER_DEED_IDS)),
				),
			);
			snapshot.forEach((doc) => {
				const deedId = doc.data().deedId as string;
				const prayerId = deedId.replace("prayer_", "") as PrayerReminderId;
				if (Object.prototype.hasOwnProperty.call(PRAYER_DEED_IDS, prayerId)) {
					completed.add(prayerId);
				}
			});
		} catch (error) {
			console.error("Failed to refresh completed prayers from Firestore:", error);
		}
		firestoreCompletedRef.current = completed;
	}, [user?.uid]);

	const getMergedCompletedPrayers = useCallback((dateKey: string) => {
		const completed = readCompletedPrayersFromLocalStorage(dateKey);
		firestoreCompletedRef.current.forEach((id) => completed.add(id));
		return completed;
	}, []);

	const recordSentIfDispatched = useCallback(
		(result: DispatchResult, sentKey: string) => {
			if (!result.ok) return;
			sentStateRef.current = markNotificationSent(sentStateRef.current, sentKey);
		},
		[],
	);

	const runPrayerReminderChecks = useCallback(async () => {
		if (!user?.uid || permissionStatus !== "granted") return;
		if (!settings.dailyReminder) return;

		const now = new Date();
		const dateKey = getLocalDateKey(now);
		const completed = getMergedCompletedPrayers(dateKey);
		const candidates = getNearClosePrayerCandidates(schedule, now, 20);

		const next = candidates.find((c) => {
			if (completed.has(c.id)) return false;
			const key = makeNotificationSentKey(user.uid, dateKey, "prayer", c.id);
			return !wasNotificationSent(sentStateRef.current, key);
		});
		if (!next) return;

		const prayerName = language === "bn" ? next.labelBn : next.labelEn;
		const result = await dispatchSystemNotification({
			title: t("notifReminderTitle"),
			body: getPrayerReminderBody(
				language as "en" | "bn",
				prayerName,
				next.minutesRemaining,
			),
			tag: `prayer-${next.id}-${dateKey}`,
		});
		recordSentIfDispatched(
			result,
			makeNotificationSentKey(user.uid, dateKey, "prayer", next.id),
		);
	}, [
		getMergedCompletedPrayers,
		language,
		permissionStatus,
		recordSentIfDispatched,
		schedule,
		settings.dailyReminder,
		t,
		user?.uid,
	]);

	const runTipReminderChecks = useCallback(async () => {
		if (!user?.uid || permissionStatus !== "granted") return;
		if (!settings.deedTips) return;

		const now = new Date();
		const dateKey = getLocalDateKey(now);
		const tipSchedule = getOrCreateTipScheduleForDate(user.uid, dateKey);

		const due = tipSchedule.slots
			.filter((slot) => isTipSlotDue(slot, now))
			.find((slot) => {
				const key = makeNotificationSentKey(user.uid, dateKey, "tip", slot.id);
				return !wasNotificationSent(sentStateRef.current, key);
			});
		if (!due) return;

		const result = await dispatchSystemNotification({
			title: t("notifTipTitle"),
			body: getRandomTip(language as "en" | "bn"),
			tag: `tip-${due.id}-${dateKey}`,
		});
		recordSentIfDispatched(
			result,
			makeNotificationSentKey(user.uid, dateKey, "tip", due.id),
		);
	}, [
		language,
		permissionStatus,
		recordSentIfDispatched,
		settings.deedTips,
		t,
		user?.uid,
	]);

	const isEnabled = settings.dailyReminder || settings.deedTips;

	const runReminderChecks = useCallback(async () => {
		if (!isEnabled) return;
		await runPrayerReminderChecks();
		await runTipReminderChecks();
	}, [isEnabled, runPrayerReminderChecks, runTipReminderChecks]);

	useEffect(() => {
		if (!user?.uid) {
			firestoreCompletedRef.current = new Set();
			return;
		}
		void refreshFirestoreCompleted();
		const interval = window.setInterval(() => {
			void refreshFirestoreCompleted();
		}, 5 * 60 * 1000);
		return () => window.clearInterval(interval);
	}, [refreshFirestoreCompleted, user?.uid]);

	useEffect(() => {
		if (!user?.uid || !isEnabled) return;
		void runReminderChecks();
		const interval = window.setInterval(() => {
			void runReminderChecks();
		}, 60 * 1000);
		return () => window.clearInterval(interval);
	}, [isEnabled, runReminderChecks, user?.uid]);

	return { runReminderChecks, refreshFirestoreCompleted };
}
