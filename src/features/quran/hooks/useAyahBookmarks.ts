import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { AyahBookmark } from "@/features/quran/types";
import {
	fetchCloudBookmarks,
	removeCloudBookmark,
	upsertCloudBookmark,
} from "@/features/quran/services/quranSyncService";

const STORAGE_KEY = "quran.bookmarks";

const readLocal = (): AyahBookmark[] => {
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as AyahBookmark[];
	} catch {
		return [];
	}
};

const writeLocal = (bookmarks: AyahBookmark[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
};

const sortByUpdated = (items: AyahBookmark[]) =>
	[...items].sort((a, b) => b.updatedAt - a.updatedAt);

const mergeBookmarks = (
	local: AyahBookmark[],
	cloud: AyahBookmark[],
): AyahBookmark[] => {
	const merged = new Map<string, AyahBookmark>();
	for (const item of local) merged.set(item.id, item);
	for (const item of cloud) {
		const existing = merged.get(item.id);
		if (!existing || item.updatedAt > existing.updatedAt) {
			merged.set(item.id, item);
		}
	}
	return sortByUpdated(Array.from(merged.values()));
};

const bookmarksKey = (uid?: string) =>
	["quran", "bookmarks", uid ?? "anon"] as const;

export function useAyahBookmarks(uid?: string) {
	const queryClient = useQueryClient();
	const [syncError, setSyncError] = useState<string | null>(null);

	const query = useQuery({
		queryKey: bookmarksKey(uid),
		queryFn: async () => {
			if (!uid) return readLocal();
			try {
				const cloud = await fetchCloudBookmarks(uid);
				const merged = mergeBookmarks(readLocal(), cloud);
				writeLocal(merged);
				setSyncError(null);
				return merged;
			} catch {
				setSyncError("cloud-bookmarks-read-failed");
				return readLocal();
			}
		},
		initialData: readLocal,
		initialDataUpdatedAt: 0,
		staleTime: 5 * 60 * 1000,
		refetchOnWindowFocus: false,
	});

	const bookmarks = query.data ?? [];

	const setCache = (next: AyahBookmark[]) => {
		const sorted = sortByUpdated(next);
		queryClient.setQueryData<AyahBookmark[]>(bookmarksKey(uid), sorted);
		writeLocal(sorted);
	};

	const addMutation = useMutation({
		mutationFn: async (bookmark: AyahBookmark) => {
			if (!uid) return;
			await upsertCloudBookmark(uid, bookmark);
		},
		onError: () => setSyncError("cloud-bookmarks-write-failed"),
	});

	const removeMutation = useMutation({
		mutationFn: async (bookmarkId: string) => {
			if (!uid) return;
			await removeCloudBookmark(uid, bookmarkId);
		},
		onError: () => setSyncError("cloud-bookmarks-delete-failed"),
	});

	const addBookmark = (
		surahNumber: number,
		ayahNumber: number,
		note?: string,
	): AyahBookmark => {
		const now = Date.now();
		const id = `${surahNumber}-${ayahNumber}`;
		const existing = bookmarks.find((item) => item.id === id);
		const bookmark: AyahBookmark = {
			id,
			surahNumber,
			ayahNumber,
			note: note?.trim() ? note.trim() : undefined,
			createdAt: existing?.createdAt ?? now,
			updatedAt: now,
		};
		setCache([bookmark, ...bookmarks.filter((item) => item.id !== id)]);
		addMutation.mutate(bookmark);
		return bookmark;
	};

	const removeBookmark = (bookmarkId: string) => {
		setCache(bookmarks.filter((item) => item.id !== bookmarkId));
		removeMutation.mutate(bookmarkId);
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
