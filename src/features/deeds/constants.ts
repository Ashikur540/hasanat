import type { DeedCategory, DeedDifficulty } from "@/data/deeds";
import type { TranslationKey } from "@/i18n/translations";

export type DeedCategoryFilter = DeedCategory | "All";
export type DeedDifficultyFilter = DeedDifficulty | "all";

export const ALL_CATEGORIES: DeedCategoryFilter[] = [
	"All",
	"Salah",
	"Quran",
	"Sadaqah",
	"Dhikr",
	"Character",
	"Family",
	"Fasting",
	"Knowledge",
];

export const ALL_DIFFICULTIES: DeedDifficultyFilter[] = [
	"all",
	"easy",
	"medium",
	"hard",
	"exceptional",
];

export const PAGE_SIZE = 18;

export const categoryTranslationKeyMap: Record<
	DeedCategoryFilter,
	TranslationKey
> = {
	All: "catAll",
	Salah: "catSalah",
	Quran: "catQuran",
	Sadaqah: "catSadaqah",
	Dhikr: "catDhikr",
	Character: "catCharacter",
	Family: "catFamily",
	Fasting: "catFasting",
	Knowledge: "catKnowledge",
};
