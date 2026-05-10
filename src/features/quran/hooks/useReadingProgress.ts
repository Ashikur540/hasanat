import { useEffect, useState } from "react";
import type { ReaderLanguage, ReadingProgress } from "@/features/quran/types";
import {
	fetchCloudProgress,
	saveCloudProgress,
} from "@/features/quran/services/quranSyncService";

const STORAGE_KEY = "quran.progress.current";

const readLocalProgress = (): ReadingProgress | null => {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as ReadingProgress;
	} catch {
		return null;
	}
};

export function useReadingProgress(uid?: string) {
	const [progress, setProgress] = useState<ReadingProgress | null>(
		readLocalProgress,
	);
	const [syncError, setSyncError] = useState<string | null>(null);

	useEffect(() => {
		if (!uid) return;
		void fetchCloudProgress(uid)
			.then((cloudProgress) => {
				if (!cloudProgress) return;
				setProgress((localProgress) => {
					if (
						localProgress &&
						localProgress.updatedAt > cloudProgress.updatedAt
					) {
						return localProgress;
					}
					localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudProgress));
					return cloudProgress;
				});
			})
			.catch(() => {
				setSyncError("cloud-read-failed");
			});
	}, [uid]);

	const saveProgress = (
		surahNumber: number,
		ayahNumber: number,
		language: ReaderLanguage,
	) => {
		const nextProgress: ReadingProgress = {
			surahNumber,
			ayahNumber,
			language,
			updatedAt: Date.now(),
		};
		setProgress(nextProgress);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
		if (!uid) return;
		void saveCloudProgress(uid, nextProgress).catch(() => {
			setSyncError("cloud-write-failed");
		});
	};

	return {
		progress,
		syncError,
		saveProgress,
	};
}
