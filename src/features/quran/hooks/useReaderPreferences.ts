import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "quran.reader.prefs";

export const ARABIC_SIZE_MIN = 18;
export const ARABIC_SIZE_MAX = 44;
export const ARABIC_SIZE_DEFAULT = 26;
export const TRANSLATION_SIZE_MIN = 12;
export const TRANSLATION_SIZE_MAX = 24;
export const TRANSLATION_SIZE_DEFAULT = 14;

export interface ReaderPreferences {
	arabicSize: number;
	translationSize: number;
	showTranslation: boolean;
}

const DEFAULTS: ReaderPreferences = {
	arabicSize: ARABIC_SIZE_DEFAULT,
	translationSize: TRANSLATION_SIZE_DEFAULT,
	showTranslation: true,
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

const sanitize = (value: Partial<ReaderPreferences>): ReaderPreferences => ({
	arabicSize: clamp(
		Number.isFinite(value.arabicSize) ? Number(value.arabicSize) : DEFAULTS.arabicSize,
		ARABIC_SIZE_MIN,
		ARABIC_SIZE_MAX,
	),
	translationSize: clamp(
		Number.isFinite(value.translationSize)
			? Number(value.translationSize)
			: DEFAULTS.translationSize,
		TRANSLATION_SIZE_MIN,
		TRANSLATION_SIZE_MAX,
	),
	showTranslation:
		typeof value.showTranslation === "boolean"
			? value.showTranslation
			: DEFAULTS.showTranslation,
});

const readStored = (): ReaderPreferences => {
	if (typeof window === "undefined") return DEFAULTS;
	const raw = localStorage.getItem(STORAGE_KEY);
	if (!raw) return DEFAULTS;
	try {
		return sanitize(JSON.parse(raw) as Partial<ReaderPreferences>);
	} catch {
		return DEFAULTS;
	}
};

export function useReaderPreferences() {
	const [prefs, setPrefs] = useState<ReaderPreferences>(readStored);

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
	}, [prefs]);

	const update = useCallback((patch: Partial<ReaderPreferences>) => {
		setPrefs((prev) => sanitize({ ...prev, ...patch }));
	}, []);

	const reset = useCallback(() => setPrefs(DEFAULTS), []);

	return { prefs, update, reset };
}
