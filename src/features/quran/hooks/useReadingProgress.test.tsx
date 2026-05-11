import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useReadingProgress } from "./useReadingProgress";
import {
	fetchCloudProgress,
	saveCloudProgress,
} from "@/features/quran/services/quranSyncService";

vi.mock("@/features/quran/services/quranSyncService", () => ({
	fetchCloudProgress: vi.fn(),
	saveCloudProgress: vi.fn(),
}));

const mockedFetchCloudProgress = vi.mocked(fetchCloudProgress);
const mockedSaveCloudProgress = vi.mocked(saveCloudProgress);

const STORAGE_KEY = "hasanat_quran.progress.current";

const createWrapper = () => {
	const client = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
};

describe("useReadingProgress", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
		mockedSaveCloudProgress.mockResolvedValue();
	});

	it("hydrates progress from local storage first", async () => {
		localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				surahNumber: 2,
				ayahNumber: 255,
				language: "en",
				updatedAt: 100,
			}),
		);
		mockedFetchCloudProgress.mockResolvedValueOnce(null);

		const { result } = renderHook(() => useReadingProgress("uid-1"), {
			wrapper: createWrapper(),
		});
		await waitFor(() => expect(result.current.progress?.ayahNumber).toBe(255));
	});

	it("writes local and cloud when saving progress", async () => {
		mockedFetchCloudProgress.mockResolvedValueOnce(null);
		const { result } = renderHook(() => useReadingProgress("uid-1"), {
			wrapper: createWrapper(),
		});
		await act(async () => {
			result.current.saveProgress(3, 18, "bn");
		});

		const raw = localStorage.getItem(STORAGE_KEY);
		expect(raw).toBeTruthy();
		await waitFor(() =>
			expect(mockedSaveCloudProgress).toHaveBeenCalledWith(
				"uid-1",
				expect.objectContaining({
					surahNumber: 3,
					ayahNumber: 18,
					language: "bn",
				}),
			),
		);
	});
});
