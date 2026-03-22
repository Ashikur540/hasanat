import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { fadeUp } from "./animations";
import type { Language } from "@/i18n/translations";
import type { SettingsFormValues } from "./types";

const languages: Array<{
	value: Language;
	label: string;
	native: string;
	flag: string;
}> = [
	{ value: "en", label: "English", native: "English", flag: "🇺🇸" },
	{ value: "bn", label: "বাংলা", native: "Bangla", flag: "🇧🇩" },
];

const LanguageSettings = () => {
	const { t } = useI18n();
	const { watch, setValue } = useFormContext<SettingsFormValues>();
	const language = watch("language");

	return (
		<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
			<Card className="border-border bg-card">
				<CardHeader className="pb-3">
					<CardTitle className="text-base flex items-center gap-2">
						<Globe className="h-4 w-4 text-primary" /> {t("settingsLanguage")}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 gap-3">
						{languages.map((lang) => (
							<motion.button
								key={lang.value}
								whileHover={{ scale: 1.03 }}
								whileTap={{ scale: 0.97 }}
								onClick={() =>
									setValue("language", lang.value, { shouldDirty: true })
								}
								className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
									language === lang.value
										? "border-primary bg-primary/10"
										: "border-border bg-secondary/30 hover:border-primary/40"
								}`}
							>
								<span className="text-2xl">{lang.flag}</span>
								<div className="text-left">
									<div
										className={`text-sm font-medium ${language === lang.value ? "text-foreground" : "text-muted-foreground"}`}
									>
										{lang.label}
									</div>
									<div className="text-xs text-muted-foreground">
										{lang.native}
									</div>
								</div>
								{language === lang.value && (
									<Badge
										variant="outline"
										className="ml-auto text-[10px] border-primary text-primary"
									>
										{t("settingsActive")}
									</Badge>
								)}
							</motion.button>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
};

export default LanguageSettings;
