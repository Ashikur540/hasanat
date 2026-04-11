import { motion } from "framer-motion";
import { Download, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/I18nProvider";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { fadeUp } from "./animations";

const PwaInstallSettings = () => {
	const { t } = useI18n();
	const { isInstalled, canPromptInstall, isIosSafari, install } = usePwaInstall();

	const handleInstall = async () => {
		await install();
	};

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Smartphone className="h-4 w-4 text-primary" />
						{t("settingsInstallAppTitle")}
					</CardTitle>
					<CardDescription>{t("settingsInstallAppDesc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{isInstalled ? (
						<div className="flex items-center gap-2 text-sm text-primary">
							<CheckCircle2 className="h-4 w-4" />
							{t("settingsInstallAppInstalled")}
						</div>
					) : (
						<>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									size="sm"
									onClick={handleInstall}
									disabled={!canPromptInstall}
								>
									<Download className="h-4 w-4 mr-2" />
									{t("settingsInstallAppButton")}
								</Button>
								{!canPromptInstall && (
									<Badge variant="outline">{t("settingsInstallAppManual")}</Badge>
								)}
							</div>

							{isIosSafari ? (
								<p className="text-xs text-muted-foreground">
									{t("settingsInstallAppIos")}
								</p>
							) : (
								<p className="text-xs text-muted-foreground">
									{t("settingsInstallAppBrowser")}
								</p>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default PwaInstallSettings;
