import type { TranslationKey } from "@/i18n/translations";
import type { NotificationSettingsData } from "../types";

export type ToggleKey = Exclude<keyof NotificationSettingsData, "reminderTime">;
export type TestKind = "reminder" | "streak" | "tip" | "weekly";

export interface NotificationItem {
	key: ToggleKey;
	labelKey: TranslationKey;
	descKey: TranslationKey;
	test?: TestKind;
}

export const COMING_SOON_KEYS: ToggleKey[] = [
	"streakAlerts",
	"circleUpdates",
	"weeklyReport",
];

export const NOTIFICATION_ITEMS: NotificationItem[] = [
	{
		key: "dailyReminder",
		labelKey: "settingsDailyReminder",
		descKey: "settingsDailyReminderDesc",
		test: "reminder",
	},
	{
		key: "streakAlerts",
		labelKey: "settingsStreakAlerts",
		descKey: "settingsStreakAlertsDesc",
		test: "streak",
	},
	{
		key: "deedTips",
		labelKey: "settingsDeedTips",
		descKey: "settingsDeedTipsDesc",
		test: "tip",
	},
	{
		key: "circleUpdates",
		labelKey: "settingsCircleUpdates",
		descKey: "settingsCircleUpdatesDesc",
	},
	{
		key: "weeklyReport",
		labelKey: "settingsWeeklyReport",
		descKey: "settingsWeeklyReportDesc",
		test: "weekly",
	},
];
