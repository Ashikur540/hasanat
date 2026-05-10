import { useEffect, useState } from "react";
import type { AyahBookmark } from "@/features/quran/types";
import {
	fetchCloudBookmarks,
	removeCloudBookmark,
	upsertCloudBookmark,
} from "@/features/quran/services/quranSyncService";

const STORAGE_KEY = "quran.bookmarks";

const readLocalBookmarks = (): AyahBookmark[] => {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as AyahBookmark[];
	} catch {
		return [];
	}
};

const mergeBookmarks = (
	localBookmarks: AyahBookmark[],
	cloudBookmarks: AyahBookmark[],
): AyahBookmark[] => {
	const merged = new Map<string, AyahBookmark>();

	for (const item of localBookmarks) merged.set(item.id, item);

	for (const item of cloudBookmarks) {
		const local = merged.get(item.id);
		if (!local || item.updatedAt > local.updatedAt) {
			merged.set(item.id, item);
		}
	}

	return Array.from(merged.values()).sort((a, b) => b.updatedAt - a.updatedAt);
};

export function useAyahBookmarks(uid?: string) {
	const [bookmarks, setBookmarks] = useState<AyahBookmark[]>(readLocalBookmarks);
	const [syncError, setSyncError] = useState<string | null>(null);

	useEffect(() => {
		if (!uid) return;
		void fetchCloudBookmarks(uid)
			.then((cloudBookmarks) => {
				setBookmarks((localBookmarks) => {
					const next = mergeBookmarks(localBookmarks, cloudBookmarks);
					localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
					return next;
				});
			})
			.catch(() => {
				setSyncError("cloud-bookmarks-read-failed");
			});
	}, [uid]);

	const persist = (next: AyahBookmark[]) => {
		setBookmarks(next);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	};

	const addBookmark = (
		surahNumber: number,
		ayahNumber: number,
		note?: string,
	): AyahBookmark => {
		const now = Date.now();
		const bookmark: AyahBookmark = {
			id: `${surahNumber}-${ayahNumber}-${now}`,
			surahNumber,
			ayahNumber,
			note: note?.trim() ? note.trim() : undefined,
			createdAt: now,
			updatedAt: now,
		};
		const next = [bookmark, ...bookmarks];
		persist(next);
		if (uid) {
			void upsertCloudBookmark(uid, bookmark).catch(() => {
				setSyncError("cloud-bookmarks-write-failed");
			});
		}
		return bookmark;
	};

	const removeBookmark = (bookmarkId: string) => {
		const next = bookmarks.filter((item) => item.id !== bookmarkId);
		persist(next);
		if (uid) {
			void removeCloudBookmark(uid, bookmarkId).catch(() => {
				setSyncError("cloud-bookmarks-delete-failed");
			});
		}
	};

	const findBookmark = (surahNumber: number, ayahNumber: number) =>
		bookmarks.find(
			(item) =>
				item.surahNumber === surahNumber && item.ayahNumber === ayahNumber,
		);

	return {
		bookmarks,
		syncError,
		addBookmark,
		removeBookmark,
		findBookmark,
	};
}
