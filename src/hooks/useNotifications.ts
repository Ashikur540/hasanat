import { createContext, useContext } from "react";

import type { NotificationSettingsData } from "@/features/settings";
import type { DevicePlatform } from "@/lib/notifications/platform";

export type { DevicePlatform } from "@/lib/notifications/platform";

export type NotificationPermissionStatus = NotificationPermission | "unsupported";

export interface NotificationContextType {
	settings: NotificationSettingsData;
	permissionStatus: NotificationPermissionStatus;
	requestPermission: () => Promise<NotificationPermissionStatus>;
	sendTestNotification: (
		type: "reminder" | "streak" | "tip" | "weekly",
	) => Promise<void>;
	runSchedulerCheck: () => Promise<void>;
	platformHint: "safari-needs-pwa" | "macos-blocked" | null;
	devicePlatform: DevicePlatform;
}

export const NotificationContext = createContext<NotificationContextType | null>(
	null,
);

export const useNotifications = () => {
	const ctx = useContext(NotificationContext);
	if (!ctx)
		throw new Error("useNotifications must be used within NotificationProvider");
	return ctx;
};
