import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Bell, Send } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { fadeUp } from "./animations";
import type { SettingsFormValues, NotificationSettingsData } from "./types";

type ToggleKey = Exclude<keyof NotificationSettingsData, "reminderTime">;
const COMING_SOON_KEYS: ToggleKey[] = [
	"streakAlerts",
	"circleUpdates",
	"weeklyReport",
];

const NotificationSettings = () => {
	const { t } = useI18n();
	// Only used for test notification toasts — state is owned by the form
	const { sendTestNotification } = useNotifications();
	const { watch, setValue } = useFormContext<SettingsFormValues>();
	const notifications = watch("notifications");

	const items: Array<{
		key: ToggleKey;
		label: string;
		desc: string;
		test?: "reminder" | "streak" | "tip" | "weekly";
	}> = [
		{
			key: "dailyReminder",
			label: t("settingsDailyReminder"),
			desc: t("settingsDailyReminderDesc"),
			test: "reminder",
		},
		{
			key: "streakAlerts",
			label: t("settingsStreakAlerts"),
			desc: t("settingsStreakAlertsDesc"),
			test: "streak",
		},
		{
			key: "deedTips",
			label: t("settingsDeedTips"),
			desc: t("settingsDeedTipsDesc"),
			test: "tip",
		},
		{
			key: "circleUpdates",
			label: t("settingsCircleUpdates"),
			desc: t("settingsCircleUpdatesDesc"),
		},
		{
			key: "weeklyReport",
			label: t("settingsWeeklyReport"),
			desc: t("settingsWeeklyReportDesc"),
			test: "weekly",
		},
	];

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Bell className="h-4 w-4 text-primary" /> {t("settingsNotifications")}
					</CardTitle>
					<CardDescription>{t("settingsNotifDesc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{items.map(({ key, label, desc, test }) => (
						<div key={key} className="flex items-center justify-between">
							<div className="space-y-0.5 flex-1">
								<div className="flex items-center gap-2">
									<Label className="text-sm font-medium">{label}</Label>
									{COMING_SOON_KEYS.includes(key) && (
										<Badge variant="outline" className="text-[10px]">
											{t("settingsComingSoon")}
										</Badge>
									)}
								</div>
								<p className="text-xs text-muted-foreground">{desc}</p>
							</div>
							<div className="flex items-center gap-2">
								{test &&
									notifications[key] &&
									!COMING_SOON_KEYS.includes(key) && (
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										onClick={() => sendTestNotification(test)}
										title="Test notification"
									>
										<Send className="h-3 w-3" />
									</Button>
									)}
								<Switch
									checked={notifications[key]}
									disabled={COMING_SOON_KEYS.includes(key)}
									onCheckedChange={(v) =>
										setValue(`notifications.${key}`, v, { shouldDirty: true })
									}
								/>
							</div>
						</div>
					))}

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
