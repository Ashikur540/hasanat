import { Bookmark, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AyahNumberMedallion from "@/features/quran/components/AyahNumberMedallion";
import OrnamentDivider from "@/features/quran/components/OrnamentDivider";
import type { AyahBookmark, SurahMeta } from "@/features/quran/types";
import { formatRelativeTime } from "@/features/quran/lib/formatRelativeTime";
import { useI18n } from "@/i18n/I18nProvider";

interface BookmarksListProps {
	bookmarks: AyahBookmark[];
	surahs: SurahMeta[];
	onJump: (surahNumber: number, ayahNumber: number) => void;
	onRemove: (bookmarkId: string) => void;
}

const BookmarksList = ({
	bookmarks,
	surahs,
	onJump,
	onRemove,
}: BookmarksListProps) => {
	const { t } = useI18n();

	if (bookmarks.length === 0) {
		return (
			<div className="rounded-2xl border border-dashed border-primary/25 bg-gradient-to-b from-primary/[0.04] to-transparent p-10 text-center">
				<div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--gold))]/15 text-[hsl(var(--gold))] mb-4">
					<Bookmark className="h-7 w-7" />
				</div>
				<h3 className="text-lg font-semibold">{t("quranNoBookmarksTitle")}</h3>
				<p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
					{t("quranNoBookmarksDesc")}
				</p>
				<OrnamentDivider className="mt-6 max-w-[180px] mx-auto" />
			</div>
		);
	}

	const surahByNumber = new Map(surahs.map((s) => [s.number, s]));

	return (
		<ul className="space-y-3">
			{bookmarks.map((bookmark) => {
				const surah = surahByNumber.get(bookmark.surahNumber);
				return (
					<li
						key={bookmark.id}
						className="group relative overflow-hidden rounded-xl border border-border/70 bg-card transition-all hover:border-primary/40 hover:shadow-md"
					>
						<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[hsl(var(--gold))] to-primary/60 opacity-70 group-hover:opacity-100 transition-opacity" />
						<div className="p-4 pl-5 flex flex-col sm:flex-row sm:items-center gap-3">
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<AyahNumberMedallion
									value={bookmark.ayahNumber}
									size="md"
									tone="gold"
								/>
								<div className="min-w-0 flex-1">
									<div className="flex items-baseline gap-2 flex-wrap">
										<p className="font-semibold text-sm">
											{surah?.nameEnglish ??
												`${t("quranSurah")} ${bookmark.surahNumber}`}
										</p>
										{surah?.nameArabic && (
											<p className="font-quran text-base text-foreground/70">
												{surah.nameArabic}
											</p>
										)}
									</div>
									<p className="text-xs text-muted-foreground mt-0.5">
										{t("quranAyah")} {bookmark.ayahNumber} ·{" "}
										{formatRelativeTime(bookmark.updatedAt)}
									</p>
									{bookmark.note && (
										<p className="text-sm italic text-foreground/80 mt-2 border-l-2 border-primary/30 pl-2">
											{bookmark.note}
										</p>
									)}
								</div>
							</div>
							<div className="flex items-center gap-1.5 sm:flex-col sm:items-end shrink-0">
								<Button
									type="button"
									size="sm"
									onClick={() =>
										onJump(bookmark.surahNumber, bookmark.ayahNumber)
									}
									className="gap-1.5"
								>
									<BookOpen className="h-3.5 w-3.5" />
									{t("quranOpen")}
								</Button>
								<Button
									type="button"
									size="sm"
									variant="ghost"
									onClick={() => onRemove(bookmark.id)}
									className="text-muted-foreground hover:text-destructive gap-1.5"
								>
									<Trash2 className="h-3.5 w-3.5" />
									<span className="sr-only sm:not-sr-only">
										{t("quranRemove")}
									</span>
								</Button>
							</div>
						</div>
					</li>
				);
			})}
		</ul>
	);
};

export default BookmarksList;
