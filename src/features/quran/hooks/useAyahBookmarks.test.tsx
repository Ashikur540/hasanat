import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAyahBookmarks } from "./useAyahBookmarks";
import {
	fetchCloudBookmarks,
	removeCloudBookmark,
	upsertCloudBookmark,
} from "@/features/quran/services/quranSyncService";

vi.mock("@/features/quran/services/quranSyncService", () => ({
	fetchCloudBookmarks: vi.fn(),
	removeCloudBookmark: vi.fn(),
	upsertCloudBookmark: vi.fn(),
}));

const mockedFetchCloudBookmarks = vi.mocked(fetchCloudBookmarks);
const mockedRemoveCloudBookmark = vi.mocked(removeCloudBookmark);
const mockedUpsertCloudBookmark = vi.mocked(upsertCloudBookmark);

const createWrapper = () => {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
};

describe("useAyahBookmarks", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
		mockedFetchCloudBookmarks.mockResolvedValue([]);
		mockedUpsertCloudBookmark.mockResolvedValue();
		mockedRemoveCloudBookmark.mockResolvedValue();
	});

	it("adds bookmarks with optional note", async () => {
		const { result } = renderHook(() => useAyahBookmarks("uid-1"), {
			wrapper: createWrapper(),
		});
		await waitFor(() =>
			expect(mockedFetchCloudBookmarks).toHaveBeenCalledWith("uid-1"),
		);
		await act(async () => {
			result.current.addBookmark(2, 255, "Ayatul Kursi");
		});

		await waitFor(() =>
			expect(result.current.bookmarks[0]).toEqual(
				expect.objectContaining({
					surahNumber: 2,
					ayahNumber: 255,
					note: "Ayatul Kursi",
				}),
			),
		);
		await waitFor(() =>
			expect(mockedUpsertCloudBookmark).toHaveBeenCalledTimes(1),
		);
	});

	it("removes bookmark by id", async () => {
		const { result } = renderHook(() => useAyahBookmarks("uid-1"), {
			wrapper: createWrapper(),
		});
		await waitFor(() =>
			expect(mockedFetchCloudBookmarks).toHaveBeenCalledWith("uid-1"),
		);
		let addedId = "";
		act(() => {
			const added = result.current.addBookmark(1, 1, "");
			addedId = added.id;
		});
		act(() => {
			result.current.removeBookmark(addedId);
		});

		expect(result.current.bookmarks).toHaveLength(0);
		await waitFor(() =>
			expect(mockedRemoveCloudBookmark).toHaveBeenCalledWith("uid-1", addedId),
		);
	});
});
