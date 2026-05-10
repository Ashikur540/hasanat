import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SurahMeta } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";

interface SurahListProps {
	surahs: SurahMeta[];
	selectedSurah: number;
	searchQuery: string;
	onSearchQueryChange: (value: string) => void;
	onOpenSurah: (surahNumber: number) => void;
}

const SurahList = ({
	surahs,
	selectedSurah,
	searchQuery,
	onSearchQueryChange,
	onOpenSurah,
}: SurahListProps) => {
	const { t } = useI18n();
	const normalizedSearch = searchQuery.trim().toLowerCase();

	const filteredSurahs = surahs.filter((surah) => {
		if (!normalizedSearch) return true;
		return (
			surah.nameEnglish.toLowerCase().includes(normalizedSearch) ||
			surah.nameArabic.includes(searchQuery) ||
			String(surah.number).includes(normalizedSearch)
		);
	});

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<h2 className="text-xl font-semibold">{t("quranStartReading")}</h2>
				<Input
					value={searchQuery}
					onChange={(event) => onSearchQueryChange(event.target.value)}
					placeholder={t("quranSearchSurah")}
					className="sm:max-w-xs"
				/>
			</div>

			{filteredSurahs.length === 0 ? (
				<p className="text-sm text-muted-foreground">{t("quranNoSurahFound")}</p>
			) : (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{filteredSurahs.map((surah) => (
						<button
							type="button"
							key={surah.number}
							onClick={() => onOpenSurah(surah.number)}
							className={cn(
								"rounded-xl border border-primary/20 bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10",
								selectedSurah === surah.number &&
									"border-primary/40 bg-primary/15",
							)}
						>
							<div className="flex items-start justify-between gap-3">
								<div className="space-y-1">
									<p className="font-semibold">
										{surah.number}. {surah.nameEnglish}
									</p>
									<p className="text-xs text-muted-foreground">
										{surah.ayahCount} {t("quranAyah")}
									</p>
								</div>
								<p className="font-quran text-xl leading-none" dir="rtl">
									{surah.nameArabic}
								</p>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
};

export default SurahList;
