import type { Language } from "@/i18n/translations";

export interface NotificationSettingsData {
	dailyReminder: boolean;
	streakAlerts: boolean;
	circleUpdates: boolean;
	weeklyReport: boolean;
	deedTips: boolean;
	reminderTime: string;
}

export interface PrivacySettingsData {
	profileVisibility: "public" | "friends" | "private";
	leaderboardOptIn: boolean;
}

export interface SettingsFormValues {
	language: Language;
	appearance: "light" | "dark" | "system";
	soundEffects: boolean;
	timeZone: string;
	notifications: NotificationSettingsData;
	privacy: PrivacySettingsData;
}

export const DEFAULT_SETTINGS: SettingsFormValues = {
	language: "en",
	appearance: "system",
	soundEffects: true,
	timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
	notifications: {
		dailyReminder: true,
		streakAlerts: true,
		circleUpdates: false,
		weeklyReport: true,
		deedTips: true,
		reminderTime: "08:00",
	},
	privacy: {
		profileVisibility: "friends",
		leaderboardOptIn: true,
	},
};
