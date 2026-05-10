import { act, renderHook, waitFor } from "@testing-library/react";
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

describe("useReadingProgress", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
		mockedSaveCloudProgress.mockResolvedValue();
	});

	it("hydrates progress from local storage first", async () => {
		localStorage.setItem(
			"quran.progress.current",
			JSON.stringify({
				surahNumber: 2,
				ayahNumber: 255,
				language: "en",
				updatedAt: 100,
			}),
		);
		mockedFetchCloudProgress.mockResolvedValueOnce(null);

		const { result } = renderHook(() => useReadingProgress("uid-1"));
		await waitFor(() => expect(result.current.progress?.ayahNumber).toBe(255));
	});

	it("writes local and cloud when saving progress", async () => {
		mockedFetchCloudProgress.mockResolvedValueOnce(null);
		const { result } = renderHook(() => useReadingProgress("uid-1"));
		act(() => {
			result.current.saveProgress(3, 18, "bn");
		});

		const raw = localStorage.getItem("quran.progress.current");
		expect(raw).toBeTruthy();
		expect(mockedSaveCloudProgress).toHaveBeenCalledWith(
			"uid-1",
			expect.objectContaining({
				surahNumber: 3,
				ayahNumber: 18,
				language: "bn",
			}),
		);
	});
});
