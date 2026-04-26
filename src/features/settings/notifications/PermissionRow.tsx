import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/i18n/I18nProvider";

interface Props {
	permissionStatus: NotificationPermission | "unsupported";
	onRequest: () => void;
}

const PermissionRow = ({ permissionStatus, onRequest }: Props) => {
	const { t } = useI18n();
	const label =
		permissionStatus === "granted"
			? t("settingsNotifPermissionGranted")
			: permissionStatus === "denied"
				? t("settingsNotifPermissionDenied")
				: permissionStatus === "unsupported"
					? t("settingsNotifPermissionUnsupported")
					: t("settingsNotifPermissionDefault");

	const showEnable =
		permissionStatus !== "granted" && permissionStatus !== "unsupported";

	return (
		<div className="flex items-center justify-between">
			<div className="space-y-0.5 flex-1">
				<Label className="text-sm font-medium">
					{t("settingsNotifPermissionTitle")}
				</Label>
				<p className="text-xs text-muted-foreground">
					{t("settingsNotifPermissionDesc")}
				</p>
			</div>
			<div className="flex items-center gap-2">
				<Badge variant="outline">{label}</Badge>
				{showEnable && (
					<Button variant="outline" size="sm" onClick={onRequest}>
						{t("settingsNotifEnablePermission")}
					</Button>
				)}
			</div>
		</div>
	);
};

export default PermissionRow;
