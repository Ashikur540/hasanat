import { Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/i18n/I18nProvider";
import { COMING_SOON_KEYS, type NotificationItem, type TestKind } from "./notificationItems";

interface Props {
	item: NotificationItem;
	checked: boolean;
	onToggle: (next: boolean) => void;
	onTest: (kind: TestKind) => void;
}

const NotificationToggleRow = ({ item, checked, onToggle, onTest }: Props) => {
	const { t } = useI18n();
	const isComingSoon = COMING_SOON_KEYS.includes(item.key);
	const showTest = item.test && checked && !isComingSoon;

	return (
		<div className="flex items-center justify-between">
			<div className="space-y-0.5 flex-1">
				<div className="flex items-center gap-2">
					<Label className="text-sm font-medium">{t(item.labelKey)}</Label>
					{isComingSoon && (
						<Badge variant="outline" className="text-[10px]">
							{t("settingsComingSoon")}
						</Badge>
					)}
				</div>
				<p className="text-xs text-muted-foreground">{t(item.descKey)}</p>
			</div>
			<div className="flex items-center gap-2">
				{showTest && item.test && (
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={() => onTest(item.test as TestKind)}
						title={t("settingsNotifTestButton")}
					>
						<Send className="h-3 w-3" />
					</Button>
				)}
				<Switch
					checked={checked}
					disabled={isComingSoon}
					onCheckedChange={onToggle}
				/>
			</div>
		</div>
	);
};

export default NotificationToggleRow;
