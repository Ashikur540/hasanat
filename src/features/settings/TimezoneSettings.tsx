import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useTimezoneService, COMMON_TIMEZONES } from "@/hooks/useTimezoneService";
import { fadeUp } from "./animations";

const TimezoneSettings = () => {
	const { t } = useI18n();
	const { timezone, isAutoDetected, setTimezone } = useTimezoneService();

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Clock className="h-4 w-4 text-primary" /> {t("settingsTimezoneTitle")}
					</CardTitle>
					<CardDescription>Manage your timezone settings</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border">
						<div className="space-y-1">
							<Label className="text-sm font-medium">Current Timezone</Label>
							<p className="text-sm text-foreground">
								{isAutoDetected ? `${t("settingsTimezoneAuto")}: ` : `${t("settingsTimezoneManual")}: `}
								<span className="font-mono">{timezone}</span>
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="timezone-select" className="text-sm font-medium">
							Select Timezone
						</Label>
						<Select value={timezone} onValueChange={setTimezone}>
							<SelectTrigger id="timezone-select" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="max-h-[300px]">
								{COMMON_TIMEZONES.map((tz) => (
									<SelectItem key={tz.value} value={tz.value}>
										{tz.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default TimezoneSettings;
