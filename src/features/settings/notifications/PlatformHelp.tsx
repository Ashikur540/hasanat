import { Info } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { DevicePlatform } from "@/lib/notifications/platform";
import { PLATFORM_HELP_KEYS } from "./platformHelpKeys";

interface Props {
	platform: DevicePlatform;
	platformHint: "safari-needs-pwa" | "macos-blocked" | null;
	permissionSupported: boolean;
}

const PlatformHelp = ({ platform, platformHint, permissionSupported }: Props) => {
	const { t } = useI18n();
	const help = PLATFORM_HELP_KEYS[platform];

	return (
		<>
			{platformHint === "safari-needs-pwa" && (
				<div className="rounded-md border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
					<div className="flex items-start gap-2">
						<Info className="h-4 w-4 mt-0.5" />
						<div>
							<div className="font-medium">{t("settingsNotifSafariNeedsPwa")}</div>
							<p>{t("settingsNotifSafariNeedsPwaDesc")}</p>
						</div>
					</div>
				</div>
			)}

			{permissionSupported && (
				<details className="rounded-md border border-border bg-muted/30 p-3 text-xs">
					<summary className="cursor-pointer font-medium">{t(help.title)}</summary>
					<ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
						{help.items.map((key) => (
							<li key={key}>{t(key)}</li>
						))}
					</ul>
				</details>
			)}
		</>
	);
};

export default PlatformHelp;
