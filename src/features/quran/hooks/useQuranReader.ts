import { useAyahBookmarks } from "@/features/quran/hooks/useAyahBookmarks";
import { useReadingProgress } from "@/features/quran/hooks/useReadingProgress";
import {
  fetchSurahAyahs,
  fetchSurahList,
} from "@/features/quran/services/quranApiService";
import type { Ayah, ReaderLanguage } from "@/features/quran/types";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PREVIEW_MAX = 120;

const buildPreview = (ayah: Ayah | undefined): string | undefined => {
  if (!ayah) return undefined;
  const source = ayah.translation || ayah.textArabic;
  if (!source) return undefined;
  return source.length > PREVIEW_MAX
    ? `${source.slice(0, PREVIEW_MAX).trim()}…`
    : source;
};

export function useQuranReader(uid?: string) {
  const [language, setLanguage] = useState<ReaderLanguage>("en");
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [resumeQueuedAyah, setResumeQueuedAyah] = useState<number | null>(null);

  const {
    progress,
    syncError: progressSyncError,
    saveProgress,
    saveProgressThrottled,
    flushProgress,
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
    gcTime: Infinity,
  });

  const ayahQuery = useQuery({
    queryKey: ["quran", "ayahs", selectedSurah, language],
    queryFn: () => fetchSurahAyahs(selectedSurah, language),
    enabled: !!selectedSurah,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30,
  });

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current) return;
    if (!progress) return;
    hydratedRef.current = true;
    setLanguage(progress.language);
    setSelectedSurah(progress.surahNumber);
  }, [progress]);

  const surahs = useMemo(() => surahQuery.data ?? [], [surahQuery.data]);
  const ayahs = useMemo(() => ayahQuery.data ?? [], [ayahQuery.data]);

  const currentSurahMeta = useMemo(
    () => surahs.find((s) => s.number === selectedSurah),
    [surahs, selectedSurah],
  );

  const ayahByNumber = useMemo(() => {
    const map = new Map<number, Ayah>();
    for (const a of ayahs) map.set(a.ayahNumber, a);
    return map;
  }, [ayahs]);

  const resumeFromLastRead = useCallback(() => {
    if (!progress) return;
    setSelectedSurah(progress.surahNumber);
    setLanguage(progress.language);
    setResumeQueuedAyah(progress.ayahNumber);
  }, [progress]);

  const jumpToAyah = useCallback((surahNumber: number, ayahNumber: number) => {
    setSelectedSurah(surahNumber);
    setResumeQueuedAyah(ayahNumber);
  }, []);

  const stateRef = useRef({
    selectedSurah,
    language,
    ayahByNumber,
    currentSurahMeta,
  });
  useEffect(() => {
    stateRef.current = {
      selectedSurah,
      language,
      ayahByNumber,
      currentSurahMeta,
    };
  }, [selectedSurah, language, ayahByNumber, currentSurahMeta]);

  const buildMeta = useCallback((ayahNumber: number) => {
    const { ayahByNumber, currentSurahMeta } = stateRef.current;
    const ayah = ayahByNumber.get(ayahNumber);
    return {
      surahNameArabic: currentSurahMeta?.nameArabic,
      surahNameEnglish: currentSurahMeta?.nameEnglish,
      ayahPreview: buildPreview(ayah),
    };
  }, []);

  const setLastReadAyah = useCallback(
    (ayahNumber: number) => {
      const { selectedSurah, language } = stateRef.current;
      saveProgress(selectedSurah, ayahNumber, language, buildMeta(ayahNumber));
    },
    [buildMeta, saveProgress],
  );

  const trackVisibleAyah = useCallback(
    (ayahNumber: number) => {
      const { selectedSurah, language } = stateRef.current;
      saveProgressThrottled(
        selectedSurah,
        ayahNumber,
        language,
        buildMeta(ayahNumber),
      );
    },
    [buildMeta, saveProgressThrottled],
  );

  const consumeResumeAyah = useCallback(() => {
    setResumeQueuedAyah((prev) => {
      void prev;
      return null;
    });
  }, []);

  const readerSyncError = progressSyncError ?? bookmarkSyncError;

  return {
    language,
    setLanguage,
    selectedSurah,
    setSelectedSurah,
    surahs,
    ayahs,
    isLoading: surahQuery.isLoading || ayahQuery.isLoading,
    isError: surahQuery.isError || ayahQuery.isError,
    progress,
    resumeFromLastRead,
    jumpToAyah,
    setLastReadAyah,
    trackVisibleAyah,
    flushProgress,
    resumeQueuedAyah,
    consumeResumeAyah,
    bookmarks,
    addBookmark,
    removeBookmark,
    findBookmark,
    readerSyncError,
  };
}
