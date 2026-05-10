import { Button } from "@/components/ui/button";
import type { ReaderLanguage } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";

interface ReaderToolbarProps {
	language: ReaderLanguage;
	onLanguageChange: (language: ReaderLanguage) => void;
}

const ReaderToolbar = ({ language, onLanguageChange }: ReaderToolbarProps) => {
	const { t } = useI18n();

	return (
		<div className="flex flex-wrap items-center gap-2">
			<span className="text-xs text-white/80">
				{t("quranTranslationLabel")}
			</span>
			<Button
				type="button"
				size="sm"
				className="h-8"
				variant={language === "en" ? "secondary" : "outline"}
				onClick={() => onLanguageChange("en")}
			>
				{t("quranTranslationEnglish")}
			</Button>
			<Button
				type="button"
				size="sm"
				className="h-8"
				variant={language === "bn" ? "secondary" : "outline"}
				onClick={() => onLanguageChange("bn")}
			>
				{t("quranTranslationBangla")}
			</Button>
		</div>
	);
};

export default ReaderToolbar;
