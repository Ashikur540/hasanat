import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth";
import { useI18n } from "@/i18n/I18nProvider";
import AyahRow from "@/features/quran/components/AyahRow";
import BookmarksList from "@/features/quran/components/BookmarksList";
import OrnamentDivider from "@/features/quran/components/OrnamentDivider";
import ReaderSettingsSheet from "@/features/quran/components/ReaderSettingsSheet";
import ReaderToolbar from "@/features/quran/components/ReaderToolbar";
import ResumeCard from "@/features/quran/components/ResumeCard";
import ScrollToTopFab from "@/features/quran/components/ScrollToTopFab";
import StickyReaderHeader from "@/features/quran/components/StickyReaderHeader";
import SurahList from "@/features/quran/components/SurahList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark as BookmarkIcon, BookOpen } from "lucide-react";
import { useQuranReader } from "@/features/quran/hooks/useQuranReader";
import { useReaderPreferences } from "@/features/quran/hooks/useReaderPreferences";

const QuranReader = () => {
	const { user } = useAuth();
	const { toast } = useToast();
	const { t } = useI18n();
	const reader = useQuranReader(user?.uid);
	const {
		readerSyncError,
		resumeQueuedAyah,
		consumeResumeAyah,
		trackVisibleAyah,
		flushProgress,
	} = reader;
	const [searchQuery, setSearchQuery] = useState("");
	const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [scrollY, setScrollY] = useState(0);
	const [scrollProgress, setScrollProgress] = useState(0);
	const { prefs, update: updatePrefs, reset: resetPrefs } = useReaderPreferences();
	const ayahsContainerRef = useRef<HTMLDivElement | null>(null);
	const navigate = useNavigate();
	const location = useLocation();
	const { surahNumber: surahParam } = useParams<{ surahNumber?: string }>();
	const parsedSurah = surahParam ? Number.parseInt(surahParam, 10) : NaN;
	const routeSurah =
		Number.isInteger(parsedSurah) && parsedSurah >= 1 && parsedSurah <= 114
			? parsedSurah
			: null;
	const isReaderOpen = routeSurah !== null;
	const activeSurah = useMemo(
		() => reader.surahs.find((surah) => surah.number === reader.selectedSurah),
		[reader.surahs, reader.selectedSurah],
	);

	const bookmarkSet = useMemo(() => {
		const set = new Set<string>();
		for (const b of reader.bookmarks) {
			set.add(`${b.surahNumber}-${b.ayahNumber}`);
		}
		return set;
	}, [reader.bookmarks]);

	useEffect(() => {
		if (routeSurah && routeSurah !== reader.selectedSurah) {
			reader.setSelectedSurah(routeSurah);
		}
	}, [routeSurah, reader.selectedSurah, reader.setSelectedSurah]);

	useEffect(() => {
		if (surahParam && routeSurah === null) {
			navigate("/quran", { replace: true });
		}
	}, [surahParam, routeSurah, navigate]);

	const navResumeAyah =
		(location.state as { resumeAyah?: number } | null)?.resumeAyah ?? null;
	useEffect(() => {
		if (!navResumeAyah || !routeSurah) return;
		reader.jumpToAyah(routeSurah, navResumeAyah);
		navigate(location.pathname, { replace: true, state: null });
	}, [navResumeAyah, routeSurah, reader.jumpToAyah, navigate, location.pathname]);

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
		if (reader.ayahs.length === 0) return;
		const ayahNumber = resumeQueuedAyah;
		const hasAyah = reader.ayahs.some((a) => a.ayahNumber === ayahNumber);
		if (!hasAyah) {
			consumeResumeAyah();
			return;
		}
		let cancelled = false;
		let attempts = 0;
		const tryScroll = () => {
			if (cancelled) return;
			const target = document.getElementById(`ayah-${ayahNumber}`);
			if (target) {
				target.scrollIntoView({ behavior: "auto", block: "center" });
				setHighlightedAyah(ayahNumber);
				consumeResumeAyah();
				return;
			}
			if (attempts++ < 10) requestAnimationFrame(tryScroll);
			else consumeResumeAyah();
		};
		const raf = requestAnimationFrame(tryScroll);
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
		};
	}, [consumeResumeAyah, resumeQueuedAyah, reader.ayahs]);

	useEffect(() => {
		if (highlightedAyah === null) return;
		const timer = setTimeout(() => setHighlightedAyah(null), 4500);
		return () => clearTimeout(timer);
	}, [highlightedAyah]);

	const ayahCount = reader.ayahs.length;
	useEffect(() => {
		if (!isReaderOpen || ayahCount === 0) return;
		const container = ayahsContainerRef.current;
		if (!container) return;

		let topVisible: { ayah: number; top: number } | null = null;
		let scheduled: number | null = null;

		const flush = () => {
			scheduled = null;
			if (topVisible) trackVisibleAyah(topVisible.ayah);
		};

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const ayahAttr = (entry.target as HTMLElement).dataset.ayahNumber;
					if (!ayahAttr) continue;
					const ayahNumber = Number.parseInt(ayahAttr, 10);
					const top = entry.boundingClientRect.top;
					if (entry.isIntersecting) {
						if (!topVisible || top < topVisible.top) {
							topVisible = { ayah: ayahNumber, top };
						}
					} else if (topVisible?.ayah === ayahNumber) {
						topVisible = null;
					}
				}
				if (scheduled !== null) window.clearTimeout(scheduled);
				scheduled = window.setTimeout(flush, 800);
			},
			{ root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 },
		);

		const cards = container.querySelectorAll("[data-ayah-number]");
		cards.forEach((card) => observer.observe(card));

		return () => {
			if (scheduled !== null) window.clearTimeout(scheduled);
			observer.disconnect();
		};
	}, [isReaderOpen, ayahCount, trackVisibleAyah]);

	useEffect(() => {
		if (!isReaderOpen) flushProgress();
	}, [isReaderOpen, flushProgress]);

	useEffect(() => {
		if (!isReaderOpen) {
			setScrollY(0);
			setScrollProgress(0);
			return;
		}
		let ticking = false;
		const update = () => {
			ticking = false;
			const y = window.scrollY;
			const max = Math.max(
				1,
				document.documentElement.scrollHeight - window.innerHeight,
			);
			setScrollY(y);
			setScrollProgress(y / max);
		};
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		};
		update();
		window.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("resize", onScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", onScroll);
			window.removeEventListener("resize", onScroll);
		};
	}, [isReaderOpen]);

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
		navigate(`/quran/${surahNumber}`);
	};

	const handleResume = () => {
		const target = reader.progress?.surahNumber ?? reader.selectedSurah;
		const ayah = reader.progress?.ayahNumber ?? null;
		navigate(`/quran/${target}`, ayah ? { state: { resumeAyah: ayah } } : undefined);
	};

	const closeReader = () => {
		navigate("/quran");
	};

	const handleBookmarkJump = (surahNumber: number, ayahNumber: number) => {
		navigate(`/quran/${surahNumber}`, { state: { resumeAyah: ayahNumber } });
	};

	return (
		<div className="container mx-auto px-4 py-6 space-y-6">
			{!isReaderOpen ? (
				<div className="space-y-6">
					<div className="text-center space-y-2 pt-2">
						<p className="font-quran text-3xl text-primary/85 leading-none">
							ٱلْقُرْآن
						</p>
						<h1 className="text-2xl md:text-3xl font-bold tracking-tight">
							{t("quranReaderTitle")}
						</h1>
						<p className="text-sm text-muted-foreground max-w-md mx-auto">
							{t("quranReaderSubtitle")}
						</p>
						<OrnamentDivider className="max-w-[160px] mx-auto pt-1" />
					</div>

					<ResumeCard progress={reader.progress} onResume={handleResume} />

					<Tabs defaultValue="surahs" className="space-y-4">
						<TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
							<TabsTrigger value="surahs" className="gap-1.5">
								<BookOpen className="h-3.5 w-3.5" />
								{t("quranAllSurahs")}
								<span className="ml-1 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-medium tabular-nums">
									{reader.surahs.length || 114}
								</span>
							</TabsTrigger>
							<TabsTrigger value="bookmarks" className="gap-1.5">
								<BookmarkIcon className="h-3.5 w-3.5" />
								{t("quranBookmarks")}
								{reader.bookmarks.length > 0 && (
									<span className="ml-1 rounded-full bg-[hsl(var(--gold))]/20 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-[hsl(var(--gold-foreground))]">
										{reader.bookmarks.length}
									</span>
								)}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="surahs" className="m-0">
							<div className="rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/[0.04] to-background p-4 sm:p-6">
								<SurahList
									surahs={reader.surahs}
									selectedSurah={reader.selectedSurah}
									searchQuery={searchQuery}
									onSearchQueryChange={setSearchQuery}
									onOpenSurah={openSurah}
								/>
							</div>
						</TabsContent>

						<TabsContent value="bookmarks" className="m-0">
							<BookmarksList
								bookmarks={reader.bookmarks}
								surahs={reader.surahs}
								onJump={handleBookmarkJump}
								onRemove={reader.removeBookmark}
							/>
						</TabsContent>
					</Tabs>
				</div>
			) : (
				<>
				<StickyReaderHeader
					surah={activeSurah}
					visible={scrollY > 220 && !isSettingsOpen}
					onBack={closeReader}
					onOpenSettings={() => setIsSettingsOpen(true)}
				/>
				<div
					className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-primary/20 shadow-sm"
					style={
						{
							"--quran-arabic-size": `${prefs.arabicSize}px`,
							"--quran-translation-size": `${prefs.translationSize}px`,
						} as CSSProperties
					}
				>
					<div className="relative bg-gradient-to-br from-primary via-primary/85 to-primary/60 dark:from-[#05574C] dark:via-[#0a6b5c] dark:to-[#4EA77A] p-4 sm:p-5 text-white space-y-3 overflow-hidden">
						<div
							aria-hidden
							className="absolute inset-0 opacity-[0.07] pointer-events-none"
							style={{
								backgroundImage:
									"radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
								backgroundSize: "16px 16px",
							}}
						/>
						<div className="relative flex items-center justify-between gap-2">
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="h-9 w-9 text-white hover:bg-white/20 hover:text-white"
								onClick={closeReader}
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<div className="text-center">
								<p className="font-quran text-2xl leading-none drop-shadow-sm">
									{activeSurah?.nameArabic ?? ""}
								</p>
								<p className="text-[11px] uppercase tracking-[0.2em] text-white/85 mt-1.5 font-medium">
									{activeSurah?.nameEnglish ?? ""}
								</p>
							</div>
							<div className="w-9" />
						</div>
						<div className="relative">
							<ReaderToolbar
								surah={activeSurah}
								onOpenSettings={() => setIsSettingsOpen(true)}
							/>
						</div>
					</div>

					<div ref={ayahsContainerRef} className="bg-background p-4 sm:p-5 space-y-3">
						{activeSurah && activeSurah.number !== 9 && (
							<div className="rounded-xl border border-[hsl(var(--gold))]/25 bg-gradient-to-br from-[hsl(var(--gold))]/[0.06] to-primary/[0.03] px-4 py-5 text-center">
								<OrnamentDivider variant="compact" className="max-w-[120px] mx-auto mb-3" />
								<p
									dir="rtl"
									className="font-quran text-foreground/90"
									style={{ fontSize: "calc(var(--quran-arabic-size, 26px) * 0.95)", lineHeight: 1.9 }}
								>
									بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
								</p>
								<p className="text-xs text-muted-foreground italic mt-2">
									{t("quranBismillahMeaning")}
								</p>
							</div>
						)}

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
									isBookmarked={bookmarkSet.has(
										`${ayah.surahNumber}-${ayah.ayahNumber}`,
									)}
									isLastRead={highlightedAyah === ayah.ayahNumber}
									showTranslation={prefs.showTranslation}
									onBookmark={() =>
										toggleBookmark(ayah.surahNumber, ayah.ayahNumber)
									}
									onSetLastRead={() => reader.setLastReadAyah(ayah.ayahNumber)}
								/>
							))
						)}
					</div>
				</div>
				<ScrollToTopFab
					visible={scrollY > 600 && !isSettingsOpen}
					progress={scrollProgress}
					onClick={() =>
						window.scrollTo({ top: 0, behavior: "smooth" })
					}
				/>
				</>
			)}
			<ReaderSettingsSheet
				open={isSettingsOpen}
				onOpenChange={setIsSettingsOpen}
				prefs={prefs}
				onPrefsChange={updatePrefs}
				onReset={resetPrefs}
				language={reader.language}
				onLanguageChange={reader.setLanguage}
			/>
		</div>
	);
};

export default QuranReader;
