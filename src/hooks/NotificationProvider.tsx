import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";

import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/i18n/I18nProvider";
import { useSettingsApi } from "@/features/settings/hooks/useSettingsApi";
import { useAuth } from "@/features/auth";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { LOCATION_CACHE_KEY } from "@/hooks/useLocationService";
import {
	dispatchSystemNotification,
	type SystemNotificationPayload,
} from "@/lib/notifications/dispatch";
import {
	detectDevicePlatform,
	isMacOS,
	isSafari,
	isStandalonePwa,
	type DevicePlatform,
} from "@/lib/notifications/platform";
import { getRandomTip } from "@/lib/notifications/deedTips";
import {
	registerFcmToken,
	setupForegroundMessageListener,
} from "@/lib/notifications/fcmToken";
import { useReminderRunners } from "@/hooks/useReminderRunners";
import type { TranslationKey } from "@/i18n/translations";
import {
	NotificationContext,
	type NotificationContextType,
	type NotificationPermissionStatus,
} from "@/hooks/useNotifications";

function getInitialPermissionStatus(): NotificationPermissionStatus {
	if (typeof window === "undefined" || !("Notification" in window)) {
		return "unsupported";
	}
	return Notification.permission;
}

function buildTestPayload(
	type: "reminder" | "streak" | "tip" | "weekly",
	t: (k: TranslationKey) => string,
	language: "en" | "bn",
): SystemNotificationPayload {
	switch (type) {
		case "reminder":
			return { title: t("notifReminderTitle"), body: t("notifReminderBody"), tag: "test-prayer-reminder" };
		case "streak":
			return { title: t("notifStreakTitle"), body: t("notifStreakBody"), tag: "test-streak" };
		case "tip":
			return { title: t("notifTipTitle"), body: getRandomTip(language), tag: "test-tip" };
		case "weekly":
			return { title: t("notifWeeklyTitle"), body: t("notifWeeklyBody"), tag: "test-weekly" };
	}
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
	const { toast } = useToast();
	const { t, language } = useI18n();
	const { user } = useAuth();
	const { settings: appSettings } = useSettingsApi();
	const { schedule } = usePrayerTimes();

	const [permissionStatus, setPermissionStatus] =
		useState<NotificationPermissionStatus>(getInitialPermissionStatus);

	const notificationSettings = appSettings.notifications;

	const { runReminderChecks, refreshFirestoreCompleted } = useReminderRunners({
		settings: notificationSettings,
		permissionStatus,
	});

	const requestPermission = useCallback(async (): Promise<NotificationPermissionStatus> => {
		if (typeof window === "undefined" || !("Notification" in window)) {
			setPermissionStatus("unsupported");
			toast({
				title: t("settingsNotifPermissionUnsupported"),
				description: t("settingsNotifPermissionUnsupportedDesc"),
				variant: "destructive",
			});
			return "unsupported";
		}
		if (Notification.permission === "granted") {
			setPermissionStatus("granted");
			return "granted";
		}
		if (Notification.permission === "denied") {
			setPermissionStatus("denied");
			toast({
				title: t("settingsNotifPermissionDenied"),
				description: t("settingsNotifPermissionDeniedDesc"),
				variant: "destructive",
			});
			return "denied";
		}
		const permission = await Notification.requestPermission();
		setPermissionStatus(permission);
		return permission;
	}, [toast, t]);

	const sendTestNotification = useCallback(
		async (type: "reminder" | "streak" | "tip" | "weekly") => {
			const permission =
				permissionStatus === "default" ? await requestPermission() : permissionStatus;

			if (permission !== "granted") {
				toast({
					title: t("settingsNotifPermissionRequired"),
					description: t("settingsNotifPermissionRequiredDesc"),
					variant: "destructive",
				});
				return;
			}

			const payload = buildTestPayload(type, t, language as "en" | "bn");
			const result = await dispatchSystemNotification(payload);
			if (result.ok) return;

			if (result.reason === "permission") {
				toast({
					title: t("settingsNotifPermissionRequired"),
					description: t("settingsNotifPermissionRequiredDesc"),
					variant: "destructive",
				});
				return;
			}
			if (result.reason === "unsupported") {
				toast({
					title: t("settingsNotifPermissionUnsupported"),
					description: t("settingsNotifPermissionUnsupportedDesc"),
					variant: "destructive",
				});
				return;
			}
			if (result.reason === "platform" && result.detail === "safari-needs-pwa") {
				toast({
					title: t("settingsNotifSafariNeedsPwa"),
					description: t("settingsNotifSafariNeedsPwaDesc"),
					variant: "destructive",
				});
				return;
			}
			if (result.reason === "error" && isMacOS()) {
				toast({
					title: t("settingsNotifBlockedByOS"),
					description: t("settingsNotifBlockedByOSDesc"),
					variant: "destructive",
				});
				return;
			}
			toast({
				title: t("settingsNotifBlockedByBrowser"),
				description: t("settingsNotifBlockedByBrowserDesc"),
				variant: "destructive",
			});
		},
		[language, permissionStatus, requestPermission, t, toast],
	);

	useEffect(() => {
		const sync = () => setPermissionStatus(getInitialPermissionStatus());
		sync();
		window.addEventListener("focus", sync);
		document.addEventListener("visibilitychange", sync);
		return () => {
			window.removeEventListener("focus", sync);
			document.removeEventListener("visibilitychange", sync);
		};
	}, []);

	useEffect(() => {
		if (!user?.uid || permissionStatus !== "granted") return;
		void registerFcmToken(user.uid);
	}, [user?.uid, permissionStatus]);

	useEffect(() => {
		void setupForegroundMessageListener(({ title, body }) => {
			if (!title && !body) return;
			toast({ title: title ?? "Hasanat", description: body });
		});
	}, [toast]);

	useEffect(() => {
		if (!user?.uid) return;
		void runReminderChecks();
	}, [appSettings.timeZone, runReminderChecks, schedule, user?.uid]);

	useEffect(() => {
		const handleVisibility = () => {
			if (document.visibilityState !== "visible") return;
			void refreshFirestoreCompleted();
			void runReminderChecks();
		};
		const handleFocus = () => {
			void refreshFirestoreCompleted();
			void runReminderChecks();
		};
		const handleStorage = (event: StorageEvent) => {
			if (
				event.key === LOCATION_CACHE_KEY ||
				event.key?.startsWith("hasanat-prayers-state-")
			) {
				void refreshFirestoreCompleted();
				void runReminderChecks();
			}
		};

		document.addEventListener("visibilitychange", handleVisibility);
		window.addEventListener("focus", handleFocus);
		window.addEventListener("storage", handleStorage);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibility);
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("storage", handleStorage);
		};
	}, [refreshFirestoreCompleted, runReminderChecks]);

	const platformHint = useMemo<NotificationContextType["platformHint"]>(() => {
		if (typeof window === "undefined") return null;
		if (isSafari() && isMacOS() && !isStandalonePwa()) return "safari-needs-pwa";
		return null;
	}, []);

	const devicePlatform = useMemo<DevicePlatform>(() => detectDevicePlatform(), []);

	const value = useMemo<NotificationContextType>(
		() => ({
			settings: notificationSettings,
			permissionStatus,
			requestPermission,
			sendTestNotification,
			runSchedulerCheck: runReminderChecks,
			platformHint,
			devicePlatform,
		}),
		[
			notificationSettings,
			permissionStatus,
			requestPermission,
			sendTestNotification,
			runReminderChecks,
			platformHint,
			devicePlatform,
		],
	);

	return (
		<NotificationContext.Provider value={value}>
			{children}
		</NotificationContext.Provider>
	);
};
