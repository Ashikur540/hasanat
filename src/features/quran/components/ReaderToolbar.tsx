import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SurahMeta } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";

interface ReaderToolbarProps {
	surah?: SurahMeta;
	onOpenSettings: () => void;
}

const ReaderToolbar = ({ surah, onOpenSettings }: ReaderToolbarProps) => {
	const { t } = useI18n();

	return (
		<div className="flex items-center justify-between gap-3">
			<div className="text-xs text-white/85">
				{surah
					? `${surah.ayahCount} ${surah.ayahCount === 1 ? t("quranAyah") : t("quranAyahs")}`
					: ""}
			</div>
			<Button
				type="button"
				size="sm"
				variant="secondary"
				onClick={onOpenSettings}
				className="h-8 gap-1.5 bg-white/15 text-white hover:bg-white/25 border-0"
				aria-label={t("quranSettings")}
			>
				<Settings2 className="h-4 w-4" />
				<span className="hidden sm:inline text-xs">{t("quranSettings")}</span>
			</Button>
		</div>
	);
};

export default ReaderToolbar;
