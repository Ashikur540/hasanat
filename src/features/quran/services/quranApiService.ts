import type { Ayah, ReaderLanguage, SurahMeta } from "@/features/quran/types";

const API_BASE = "https://api.alquran.cloud/v1";

const TRANSLATION_EDITION: Record<ReaderLanguage, string> = {
	en: "en.asad",
	bn: "bn.bengali",
};

interface SurahListPayload {
	data?: Array<{
		number: number;
		name: string;
		englishName: string;
		numberOfAyahs: number;
	}>;
}

interface SurahAyahPayload {
	data?: {
		ayahs?: Array<{
			numberInSurah: number;
			text: string;
		}>;
	};
}

async function fetchJson<T>(url: string): Promise<T> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Quran API request failed with status ${response.status}`);
	}
	return (await response.json()) as T;
}

export async function fetchSurahList(): Promise<SurahMeta[]> {
	const payload = await fetchJson<SurahListPayload>(`${API_BASE}/surah`);
	const items = payload.data ?? [];
	return items.map((item) => ({
		number: item.number,
		nameArabic: item.name,
		nameEnglish: item.englishName,
		ayahCount: item.numberOfAyahs,
	}));
}

export async function fetchSurahAyahs(
	surahNumber: number,
	language: ReaderLanguage,
): Promise<Ayah[]> {
	const [arabicPayload, translationPayload] = await Promise.all([
		fetchJson<SurahAyahPayload>(`${API_BASE}/surah/${surahNumber}/quran-uthmani`),
		fetchJson<SurahAyahPayload>(
			`${API_BASE}/surah/${surahNumber}/${TRANSLATION_EDITION[language]}`,
		),
	]);

	const arabicAyahs = arabicPayload.data?.ayahs ?? [];
	const translatedAyahs = translationPayload.data?.ayahs ?? [];
	const translatedByNumber = new Map(
		translatedAyahs.map((item) => [item.numberInSurah, item.text]),
	);

	return arabicAyahs.map((item) => ({
		surahNumber,
		ayahNumber: item.numberInSurah,
		textArabic: item.text,
		translation: translatedByNumber.get(item.numberInSurah) ?? "",
	}));
}

