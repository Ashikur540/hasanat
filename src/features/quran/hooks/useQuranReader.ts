import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ReaderLanguage } from "@/features/quran/types";
import {
	fetchSurahAyahs,
	fetchSurahList,
} from "@/features/quran/services/quranApiService";
import { useReadingProgress } from "@/features/quran/hooks/useReadingProgress";
import { useAyahBookmarks } from "@/features/quran/hooks/useAyahBookmarks";

export function useQuranReader(uid?: string) {
	const [language, setLanguage] = useState<ReaderLanguage>("en");
	const [selectedSurah, setSelectedSurah] = useState<number>(1);
	const [resumeQueuedAyah, setResumeQueuedAyah] = useState<number | null>(null);

	const {
		progress,
		syncError: progressSyncError,
		saveProgress,
	} = useReadingProgress(uid);
	const {
		bookmarks,
		addBookmark,
		removeBookmark,
		findBookmark,
		syncError: bookmarkSyncError,
	} = useAyahBookmarks(uid);

	const surahQuery = useQuery({
		queryKey: ["quran", "surah-list"],
		queryFn: fetchSurahList,
		staleTime: Infinity,
	});

	const ayahQuery = useQuery({
		queryKey: ["quran", "ayahs", selectedSurah, language],
		queryFn: () => fetchSurahAyahs(selectedSurah, language),
		enabled: !!selectedSurah,
	});

	useEffect(() => {
		if (!progress) return;
		setLanguage(progress.language);
		setSelectedSurah(progress.surahNumber);
	}, [progress]);

	const resumeFromLastRead = () => {
		if (!progress) return;
		setSelectedSurah(progress.surahNumber);
		setLanguage(progress.language);
		setResumeQueuedAyah(progress.ayahNumber);
	};

	const markAyahRead = (ayahNumber: number) => {
		saveProgress(selectedSurah, ayahNumber, language);
	};

	const consumeResumeAyah = () => {
		const next = resumeQueuedAyah;
		setResumeQueuedAyah(null);
		return next;
	};

	const readerSyncError = progressSyncError ?? bookmarkSyncError;

	return {
		language,
		setLanguage,
		selectedSurah,
		setSelectedSurah,
		surahs: surahQuery.data ?? [],
		ayahs: ayahQuery.data ?? [],
		isLoading: surahQuery.isLoading || ayahQuery.isLoading,
		isError: surahQuery.isError || ayahQuery.isError,
		progress,
		resumeFromLastRead,
		markAyahRead,
		resumeQueuedAyah,
		consumeResumeAyah,
		bookmarks,
		addBookmark,
		removeBookmark,
		findBookmark,
		readerSyncError,
	};
}
