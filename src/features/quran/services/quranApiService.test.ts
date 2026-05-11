import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchSurahAyahs, fetchSurahList } from "./quranApiService";

describe("quranApiService", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("normalizes surah list payload", async () => {
		vi.spyOn(global, "fetch").mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					data: [
						{
							number: 1,
							name: "الفاتحة",
							englishName: "Al-Faatiha",
							numberOfAyahs: 7,
						},
					],
				}),
			),
		);

		const result = await fetchSurahList();
		expect(result).toEqual([
			{
				number: 1,
				nameArabic: "الفاتحة",
				nameEnglish: "Al-Faatiha",
				ayahCount: 7,
			},
		]);
	});

	it("merges arabic and translation ayahs by ayah number", async () => {
		vi.spyOn(global, "fetch")
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						data: { ayahs: [{ numberInSurah: 1, text: "بِسْمِ اللَّهِ" }] },
					}),
				),
			)
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						data: { ayahs: [{ numberInSurah: 1, text: "In the name of Allah" }] },
					}),
				),
			);

		const result = await fetchSurahAyahs(1, "en");
		expect(result).toEqual([
			{
				surahNumber: 1,
				ayahNumber: 1,
				textArabic: "بِسْمِ اللَّهِ",
				translation: "In the name of Allah",
			},
		]);
	});
});

