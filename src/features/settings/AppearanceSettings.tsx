import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Palette, Volume2, VolumeX } from "lucide-react";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nProvider";
import { fadeUp } from "./animations";

const themeOptions = [
	{ value: "light", labelKey: "settingsLight" as const, icon: Sun },
	{ value: "dark", labelKey: "settingsDark" as const, icon: Moon },
	{ value: "system", labelKey: "settingsSystem" as const, icon: Monitor },
];

const AppearanceSettings = () => {
	const { theme, setTheme } = useTheme();
	const { t } = useI18n();
	const [sounds, setSounds] = useState(true);

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Palette className="h-4 w-4 text-primary" />{" "}
						{t("settingsAppearance")}
					</CardTitle>
					<CardDescription>{t("settingsAppearanceDesc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-3 gap-3">
						{themeOptions.map((opt) => {
							const Icon = opt.icon;
							const isActive = theme === opt.value;
							return (
								<motion.button
									key={opt.value}
									whileHover={{ scale: 1.03 }}
									whileTap={{ scale: 0.97 }}
									onClick={() => setTheme(opt.value)}
									className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
										isActive
											? "border-primary bg-primary/10"
											: "border-border bg-secondary/30 hover:border-primary/40"
									}`}
								>
									<Icon
										className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
									/>
									<span
										className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}
									>
										{t(opt.labelKey)}
									</span>
									{isActive && (
										<Badge
											variant="outline"
											className="text-[10px] border-primary text-primary"
										>
											{t("settingsActive")}
										</Badge>
									)}
								</motion.button>
							);
						})}
					</div>

					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<Label className="text-sm font-medium">
								{t("settingsSoundEffects")}
							</Label>
							<p className="text-xs text-muted-foreground">
								{t("settingsSoundDesc")}
							</p>
						</div>
						<div className="flex items-center gap-2">
							{sounds ? (
								<Volume2 className="h-4 w-4 text-primary" />
							) : (
								<VolumeX className="h-4 w-4 text-muted-foreground" />
							)}
							<Switch checked={sounds} onCheckedChange={setSounds} />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default AppearanceSettings;
