import type { TranslationKey } from "@/i18n/translations";
import type { DevicePlatform } from "@/lib/notifications/platform";

export interface PlatformHelp {
	title: TranslationKey;
	items: [TranslationKey, TranslationKey, TranslationKey];
}

export const PLATFORM_HELP_KEYS: Record<DevicePlatform, PlatformHelp> = {
	macos: {
		title: "settingsNotifMacHelp",
		items: [
			"settingsNotifMacHelpItem1",
			"settingsNotifMacHelpItem2",
			"settingsNotifMacHelpItem3",
		],
	},
	windows: {
		title: "settingsNotifWindowsHelp",
		items: [
			"settingsNotifWindowsHelpItem1",
			"settingsNotifWindowsHelpItem2",
			"settingsNotifWindowsHelpItem3",
		],
	},
	android: {
		title: "settingsNotifAndroidHelp",
		items: [
			"settingsNotifAndroidHelpItem1",
			"settingsNotifAndroidHelpItem2",
			"settingsNotifAndroidHelpItem3",
		],
	},
	ios: {
		title: "settingsNotifIosHelp",
		items: [
			"settingsNotifIosHelpItem1",
			"settingsNotifIosHelpItem2",
			"settingsNotifIosHelpItem3",
		],
	},
	linux: {
		title: "settingsNotifLinuxHelp",
		items: [
			"settingsNotifLinuxHelpItem1",
			"settingsNotifLinuxHelpItem2",
			"settingsNotifLinuxHelpItem3",
		],
	},
	unknown: {
		title: "settingsNotifGenericHelp",
		items: [
			"settingsNotifGenericHelpItem1",
			"settingsNotifGenericHelpItem2",
			"settingsNotifGenericHelpItem3",
		],
	},
};
