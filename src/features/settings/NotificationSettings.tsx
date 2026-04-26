import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Bell, Bug } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/i18n/I18nProvider";
import { useNotifications } from "@/hooks/useNotifications";

import { fadeUp } from "./animations";
import type { SettingsFormValues } from "./types";
import {
	NOTIFICATION_ITEMS,
	type TestKind,
	type ToggleKey,
} from "./notifications/notificationItems";
import NotificationToggleRow from "./notifications/NotificationToggleRow";
import PermissionRow from "./notifications/PermissionRow";
import PlatformHelp from "./notifications/PlatformHelp";

const NotificationSettings = () => {
	const { t } = useI18n();
	const {
		sendTestNotification,
		permissionStatus,
		requestPermission,
		runSchedulerCheck,
		platformHint,
		devicePlatform,
	} = useNotifications();
	const isDev = import.meta.env.DEV;

	const { watch, setValue } = useFormContext<SettingsFormValues>();
	const notifications = watch("notifications");

	const handleToggleChange = (key: ToggleKey, value: boolean) => {
		setValue(`notifications.${key}`, value, { shouldDirty: true });
		const needsPermission =
			value &&
			(key === "dailyReminder" || key === "deedTips") &&
			permissionStatus !== "granted";
		if (needsPermission) void requestPermission();
	};

	const handleTest = (kind: TestKind) => void sendTestNotification(kind);

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Bell className="h-4 w-4 text-primary" />
						{t("settingsNotifications")}
					</CardTitle>
					<CardDescription>{t("settingsNotifDesc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{NOTIFICATION_ITEMS.map((item) => (
						<NotificationToggleRow
							key={item.key}
							item={item}
							checked={notifications[item.key]}
							onToggle={(next) => handleToggleChange(item.key, next)}
							onTest={handleTest}
						/>
					))}

					<Separator />

					<PermissionRow
						permissionStatus={permissionStatus}
						onRequest={() => void requestPermission()}
					/>

					<PlatformHelp
						platform={devicePlatform}
						platformHint={platformHint}
						permissionSupported={permissionStatus !== "unsupported"}
					/>

					{isDev && (
						<>
							<Separator />
							<div className="flex items-center justify-between">
								<div className="space-y-0.5 flex-1">
									<Label className="text-sm font-medium">
										{t("settingsNotifDevDebug")}
									</Label>
									<p className="text-xs text-muted-foreground">
										{t("settingsNotifDevDebugDesc")}
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => void runSchedulerCheck()}
								>
									<Bug className="h-3 w-3 mr-1" /> Run
								</Button>
							</div>
						</>
					)}

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<div className="flex items-center gap-2">
								<Label className="text-sm font-medium">
									{t("settingsReminderTime")}
								</Label>
								<Badge variant="outline" className="text-[10px]">
									{t("settingsComingSoon")}
								</Badge>
							</div>
							<p className="text-xs text-muted-foreground">
								{t("settingsReminderTimeDesc")}
							</p>
						</div>
						<Input
							type="time"
							value={notifications.reminderTime}
							disabled
							onChange={(e) =>
								setValue("notifications.reminderTime", e.target.value, {
									shouldDirty: true,
								})
							}
							className="w-[120px]"
						/>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default NotificationSettings;
