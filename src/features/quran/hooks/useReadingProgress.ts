import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	fetchCloudProgress,
	saveCloudProgress,
} from "@/features/quran/services/quranSyncService";
import type { ReaderLanguage, ReadingProgress } from "@/features/quran/types";

const STORAGE_KEY = "hasanat_quran.progress.current";
const THROTTLE_MS = 1500;

export interface ProgressMeta {
	surahNameArabic?: string;
	surahNameEnglish?: string;
	ayahPreview?: string;
}

const readLocalProgress = (): ReadingProgress | null => {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as ReadingProgress;
	} catch {
		return null;
	}
};

const writeLocalProgress = (progress: ReadingProgress) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
};

const progressKey = (uid?: string) =>
	["quran", "progress", uid ?? "anon"] as const;

const buildNext = (
	surahNumber: number,
	ayahNumber: number,
	language: ReaderLanguage,
	meta?: ProgressMeta,
): ReadingProgress => ({
	surahNumber,
	ayahNumber,
	language,
	updatedAt: Date.now(),
	...(meta?.surahNameArabic && { surahNameArabic: meta.surahNameArabic }),
	...(meta?.surahNameEnglish && { surahNameEnglish: meta.surahNameEnglish }),
	...(meta?.ayahPreview && { ayahPreview: meta.ayahPreview }),
});

export function useReadingProgress(uid?: string) {
	const queryClient = useQueryClient();
	const [syncError, setSyncError] = useState<string | null>(null);
	const pendingRef = useRef<ReadingProgress | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const query = useQuery<ReadingProgress | null>({
		queryKey: progressKey(uid),
		queryFn: async () => {
			if (!uid) return readLocalProgress();
			try {
				const cloud = await fetchCloudProgress(uid);
				const local = readLocalProgress();
				if (!cloud) return local;
				if (local && local.updatedAt > cloud.updatedAt) return local;
				writeLocalProgress(cloud);
				setSyncError(null);
				return cloud;
			} catch {
				setSyncError("cloud-read-failed");
				return readLocalProgress();
			}
		},
		initialData: readLocalProgress,
		initialDataUpdatedAt: 0,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	const saveMutation = useMutation({
		mutationFn: async (next: ReadingProgress) => {
			if (!uid) return;
			await saveCloudProgress(uid, next);
		},
		onError: () => setSyncError("cloud-write-failed"),
	});

	const writeProgress = useCallback(
		(next: ReadingProgress) => {
			queryClient.setQueryData(progressKey(uid), next);
			writeLocalProgress(next);
			saveMutation.mutate(next);
		},
		[queryClient, saveMutation, uid],
	);

	const flushProgress = useCallback(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
		const pending = pendingRef.current;
		pendingRef.current = null;
		if (pending) writeProgress(pending);
	}, [writeProgress]);

	const saveProgress = useCallback(
		(
			surahNumber: number,
			ayahNumber: number,
			language: ReaderLanguage,
			meta?: ProgressMeta,
		) => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
			pendingRef.current = null;
			writeProgress(buildNext(surahNumber, ayahNumber, language, meta));
		},
		[writeProgress],
	);

	const saveProgressThrottled = useCallback(
		(
			surahNumber: number,
			ayahNumber: number,
			language: ReaderLanguage,
			meta?: ProgressMeta,
		) => {
			pendingRef.current = buildNext(surahNumber, ayahNumber, language, meta);
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => {
				timerRef.current = null;
				const pending = pendingRef.current;
				pendingRef.current = null;
				if (pending) writeProgress(pending);
			}, THROTTLE_MS);
		},
		[writeProgress],
	);

	useEffect(() => {
		const handleVisibility = () => {
			if (document.visibilityState === "hidden") flushProgress();
		};
		document.addEventListener("visibilitychange", handleVisibility);
		window.addEventListener("pagehide", flushProgress);
		return () => {
			document.removeEventListener("visibilitychange", handleVisibility);
			window.removeEventListener("pagehide", flushProgress);
			flushProgress();
		};
	}, [flushProgress]);

	return {
		progress: query.data ?? null,
		syncError,
		saveProgress,
		saveProgressThrottled,
		flushProgress,
	};
}
