import { useState } from "react";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { fadeUp } from "./animations";

const PrivacySettings = () => {
	const { t } = useI18n();
	const [profileVisibility, setProfileVisibility] = useState("friends");

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Shield className="h-4 w-4 text-primary" /> {t("settingsPrivacy")}
					</CardTitle>
					<CardDescription>{t("settingsPrivacyDesc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label className="text-sm font-medium">{t("settingsProfileVisibility")}</Label>
							<p className="text-xs text-muted-foreground">{t("settingsProfileVisDesc")}</p>
						</div>
						<Select value={profileVisibility} onValueChange={setProfileVisibility}>
							<SelectTrigger className="w-[130px]">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="public">{t("settingsPublic")}</SelectItem>
								<SelectItem value="friends">{t("settingsFriendsOnly")}</SelectItem>
								<SelectItem value="private">{t("settingsPrivate")}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<Separator />

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label className="text-sm font-medium">{t("settingsLeaderboard")}</Label>
							<p className="text-xs text-muted-foreground">{t("settingsLeaderboardDesc")}</p>
						</div>
						<Switch defaultChecked />
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default PrivacySettings;
