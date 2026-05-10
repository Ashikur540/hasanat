import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth";
import { useI18n } from "@/i18n/I18nProvider";
import AyahRow from "@/features/quran/components/AyahRow";
import ReaderToolbar from "@/features/quran/components/ReaderToolbar";
import ResumeCard from "@/features/quran/components/ResumeCard";
import SurahList from "@/features/quran/components/SurahList";
import { useQuranReader } from "@/features/quran/hooks/useQuranReader";

const QuranReader = () => {
	const { user } = useAuth();
	const { toast } = useToast();
	const { t } = useI18n();
	const reader = useQuranReader(user?.uid);
	const { readerSyncError, resumeQueuedAyah, consumeResumeAyah } = reader;
	const [searchQuery, setSearchQuery] = useState("");
	const [isReaderOpen, setIsReaderOpen] = useState(false);
	const activeSurah = reader.surahs.find(
		(surah) => surah.number === reader.selectedSurah,
	);

	useEffect(() => {
		if (!readerSyncError) return;
		toast({
			title: t("quranSyncIssueTitle"),
			description: t("quranSyncIssueDesc"),
			variant: "destructive",
		});
	}, [readerSyncError, t, toast]);

	useEffect(() => {
		if (!resumeQueuedAyah) return;
		const target = document.getElementById(`ayah-${resumeQueuedAyah}`);
		if (target) {
			target.scrollIntoView({ behavior: "smooth", block: "center" });
		}
		consumeResumeAyah();
	}, [consumeResumeAyah, resumeQueuedAyah]);

	const toggleBookmark = (surahNumber: number, ayahNumber: number) => {
		const existing = reader.findBookmark(surahNumber, ayahNumber);
		if (existing) {
			reader.removeBookmark(existing.id);
			return;
		}
		const note = window.prompt(t("quranBookmarkNotePrompt")) ?? "";
		reader.addBookmark(surahNumber, ayahNumber, note);
	};

	const openSurah = (surahNumber: number) => {
		reader.setSelectedSurah(surahNumber);
		setIsReaderOpen(true);
	};

	const handleResume = () => {
		reader.resumeFromLastRead();
		setIsReaderOpen(true);
	};

	return (
		<div className="container mx-auto px-4 py-6 space-y-4">
			{!isReaderOpen ? (
				<div className="space-y-4">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold">
							{t("quranReaderTitle")}
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							{t("quranReaderSubtitle")}
						</p>
					</div>

					<ResumeCard progress={reader.progress} onResume={handleResume} />

					<div className="rounded-2xl border border-primary/20 bg-primary/10 dark:bg-[#073B33] p-4 sm:p-6">
						<SurahList
							surahs={reader.surahs}
							selectedSurah={reader.selectedSurah}
							searchQuery={searchQuery}
							onSearchQueryChange={setSearchQuery}
							onOpenSurah={openSurah}
						/>
					</div>
				</div>
			) : (
				<div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-primary/20">
					<div className="bg-gradient-to-r from-primary/80 to-primary/40 dark:from-[#05574C] dark:to-[#4EA77A] p-4 text-white dark:text-white space-y-3">
						<div className="flex items-center justify-between gap-2">
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
								onClick={() => setIsReaderOpen(false)}
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<div className="text-center">
								<p className="font-quran text-lg leading-none">
									{activeSurah?.nameArabic ?? ""}
								</p>
								<p className="text-xs text-white/90 mt-1">
									{activeSurah?.nameEnglish ?? ""}
								</p>
							</div>
							<div className="w-8" />
						</div>
						<ReaderToolbar
							language={reader.language}
							onLanguageChange={reader.setLanguage}
						/>
					</div>

					<div className="bg-background p-4 space-y-3">
						{reader.isError ? (
							<Card className="border-destructive/40 bg-destructive/5">
								<CardContent className="p-4 flex items-center gap-2 text-destructive">
									<AlertCircle className="h-4 w-4" />
									<span className="text-sm">{t("quranLoadError")}</span>
								</CardContent>
							</Card>
						) : reader.isLoading ? (
							<Card>
								<CardContent className="p-4 text-sm text-muted-foreground">
									{t("quranLoading")}
								</CardContent>
							</Card>
						) : (
							reader.ayahs.map((ayah) => (
								<AyahRow
									key={`${ayah.surahNumber}-${ayah.ayahNumber}`}
									ayah={ayah}
									isBookmarked={
										!!reader.findBookmark(ayah.surahNumber, ayah.ayahNumber)
									}
									onBookmark={() =>
										toggleBookmark(ayah.surahNumber, ayah.ayahNumber)
									}
									onRead={() => reader.markAyahRead(ayah.ayahNumber)}
								/>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default QuranReader;
