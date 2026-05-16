import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import { Moon } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n/I18nProvider";
import { fadeUp } from "./animations";
import type { SettingsFormValues } from "./types";

const HijriOffsetSettings = () => {
	const { t } = useI18n();
	const { watch, setValue } = useFormContext<SettingsFormValues>();
	const offset = watch("hijriOffset") ?? 0;

	const offsetOptions = [
		{ value: -2, label: t("settingsHijriOffsetMinus2") },
		{ value: -1, label: t("settingsHijriOffsetMinus1") },
		{ value: 0, label: t("settingsHijriOffsetZero") },
		{ value: +1, label: t("settingsHijriOffsetPlus1") },
		{ value: +2, label: t("settingsHijriOffsetPlus2") },
	];

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Moon className="h-4 w-4 text-primary" />{" "}
						{t("settingsHijriOffsetTitle")}
					</CardTitle>
					<CardDescription>{t("settingsHijriOffsetDesc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-2">
						<Label
							htmlFor="hijri-offset-select"
							className="text-sm font-medium"
						>
							{t("settingsHijriOffsetLabel")}
						</Label>
						<Select
							value={String(offset)}
							onValueChange={(v) =>
								setValue("hijriOffset", Number(v), { shouldDirty: true })
							}
						>
							<SelectTrigger id="hijri-offset-select" className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{offsetOptions.map((opt) => (
									<SelectItem key={opt.value} value={String(opt.value)}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<p className="text-xs text-muted-foreground">
						{t("settingsHijriOffsetHint")}
					</p>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default HijriOffsetSettings;
