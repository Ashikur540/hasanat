import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AyahNumberMedallion from "@/features/quran/components/AyahNumberMedallion";
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
	const trimmedSearch = searchQuery.trim();
	const normalizedSearch = trimmedSearch.toLowerCase();

	const filteredSurahs = surahs.filter((surah) => {
		if (!normalizedSearch) return true;
		return (
			surah.nameEnglish.toLowerCase().includes(normalizedSearch) ||
			surah.nameArabic.includes(trimmedSearch) ||
			String(surah.number).includes(normalizedSearch)
		);
	});

	return (
		<div className="space-y-5">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					value={searchQuery}
					onChange={(event) => onSearchQueryChange(event.target.value)}
					placeholder={t("quranSearchSurah")}
					className="pl-9 h-11 rounded-full bg-background/70 border-border/70 focus-visible:ring-[hsl(var(--gold))]/40"
				/>
			</div>

			{filteredSurahs.length === 0 ? (
				<p className="text-sm text-muted-foreground text-center py-8">
					{t("quranNoSurahFound")}
				</p>
			) : (
				<div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3">
					{filteredSurahs.map((surah) => {
						const isActive = selectedSurah === surah.number;
						return (
							<button
								type="button"
								key={surah.number}
								onClick={() => onOpenSurah(surah.number)}
								className={cn(
									"group relative overflow-hidden rounded-xl border bg-card text-left transition-all",
									"hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40",
									isActive
										? "border-primary/50 ring-1 ring-primary/20"
										: "border-border/70",
								)}
							>
								<div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-[hsl(var(--gold))]/0 via-[hsl(var(--gold))] to-[hsl(var(--gold))]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
								<div className="flex items-center gap-3 p-3">
									<AyahNumberMedallion value={surah.number} size="md" />
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-sm leading-tight truncate">
											{surah.nameEnglish}
										</p>
										<p className="text-[11px] text-muted-foreground mt-0.5">
											{surah.ayahCount} {t("quranAyah")}
										</p>
									</div>
									<p
										dir="rtl"
										className="font-quran text-xl leading-none text-foreground/80 group-hover:text-primary transition-colors"
									>
										{surah.nameArabic}
									</p>
								</div>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default SurahList;
