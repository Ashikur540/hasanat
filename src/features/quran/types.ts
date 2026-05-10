export type ReaderLanguage = "en" | "bn";

export interface SurahMeta {
	number: number;
	nameArabic: string;
	nameEnglish: string;
	ayahCount: number;
}

export interface Ayah {
	surahNumber: number;
	ayahNumber: number;
	textArabic: string;
	translation: string;
}

export interface ReadingProgress {
	surahNumber: number;
	ayahNumber: number;
	language: ReaderLanguage;
	updatedAt: number;
}

export interface AyahBookmark {
	id: string;
	surahNumber: number;
	ayahNumber: number;
	note?: string;
	createdAt: number;
	updatedAt: number;
}

