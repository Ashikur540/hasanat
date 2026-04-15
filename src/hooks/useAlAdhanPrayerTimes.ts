import { useEffect, useState } from "react";

export interface PrayerTimesData {
	fajr: string;
	dhuhr: string;
	asr: string;
	maghrib: string;
	isha: string;
	hijriDate: string;
	hijriMonth: string;
	hijriYear: string;
	loading: boolean;
	error: string | null;
	cachedAt: string | null;
}

interface AlAdhanResponse {
	code: number;
	status: string;
	data: {
		timings: {
			Fajr: string;
			Dhuhr: string;
			Asr: string;
			Maghrib: string;
			Isha: string;
		};
		date: {
			hijri: {
				date: string;
				month: {
					number: number;
					en: string;
					ar: string;
				};
				year: string;
			};
		};
	};
}

const getCacheKey = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `hasanat-prayer-times-${year}-${month}-${day}`;
};

const getCachedPrayerTimes = (): {
	times: Omit<PrayerTimesData, "loading" | "error"> | null;
	cachedAt: string | null;
} => {
	try {
		const today = new Date();
		const cacheKey = getCacheKey(today);
		const cached = localStorage.getItem(cacheKey);

		if (cached) {
			const parsed = JSON.parse(cached);
			return {
				times: parsed.times || null,
				cachedAt: parsed.cachedAt || null,
			};
		}
	} catch (e) {
		if (process.env.NODE_ENV === "development") {
			console.debug("[useAlAdhanPrayerTimes] Failed to parse cache:", e);
		}
	}

	return { times: null, cachedAt: null };
};

const setCachedPrayerTimes = (times: Omit<PrayerTimesData, "loading" | "error">): void => {
	try {
		const today = new Date();
		const cacheKey = getCacheKey(today);
		localStorage.setItem(
			cacheKey,
			JSON.stringify({
				times,
				cachedAt: new Date().toISOString(),
			}),
		);
	} catch (e) {
		if (process.env.NODE_ENV === "development") {
			console.debug("[useAlAdhanPrayerTimes] Failed to cache:", e);
		}
	}
};

const fetchPrayerTimesFromAPI = async (
	latitude: number,
	longitude: number,
): Promise<Omit<PrayerTimesData, "loading" | "error"> | null> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 10000);

	try {
		const url = `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=4`;
		const response = await fetch(url, { signal: controller.signal });

		clearTimeout(timeoutId);

		if (!response.ok) {
			throw new Error(`API returned status ${response.status}`);
		}

		const data = (await response.json()) as AlAdhanResponse;

		if (!data.data?.timings) {
			throw new Error("Invalid API response structure");
		}

		const timings = data.data.timings;
		const hijriData = data.data.date.hijri;

		return {
			fajr: timings.Fajr,
			dhuhr: timings.Dhuhr,
			asr: timings.Asr,
			maghrib: timings.Maghrib,
			isha: timings.Isha,
			hijriDate: hijriData.date,
			hijriMonth: hijriData.month.en,
			hijriYear: hijriData.year,
			cachedAt: new Date().toISOString(),
		};
	} catch (e) {
		if (process.env.NODE_ENV === "development") {
			const message = e instanceof Error ? e.message : "Unknown error";
			console.debug("[useAlAdhanPrayerTimes] API fetch failed:", message);
		}
		clearTimeout(timeoutId);
		return null;
	}
};

/**
 * @deprecated Primary dashboard flow now uses adhan-js local calculation.
 * Keep this hook only for legacy or explicit API-based scenarios.
 */
export const useAlAdhanPrayerTimes = (
	latitude: number | null,
	longitude: number | null,
): PrayerTimesData => {
	const [times, setTimes] = useState<Omit<PrayerTimesData, "loading" | "error"> | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cachedAt, setCachedAt] = useState<string | null>(null);

	useEffect(() => {
		if (!latitude || !longitude) {
			setLoading(false);
			setError("Location not available");
			return;
		}

		const fetchTimes = async () => {
			setLoading(true);
			setError(null);

			const { times: cached, cachedAt: cachedTime } = getCachedPrayerTimes();

			if (cached && cachedTime) {
				setTimes(cached);
				setCachedAt(cachedTime);
				setLoading(false);
				return;
			}

			const fetched = await fetchPrayerTimesFromAPI(latitude, longitude);

			if (fetched) {
				setTimes(fetched);
				setCachedPrayerTimes(fetched);
				setCachedAt(fetched.cachedAt);
				setError(null);
			} else {
				setError("Failed to fetch prayer times");
			}

			setLoading(false);
		};

		fetchTimes();
	}, [latitude, longitude]);

	return {
		fajr: times?.fajr || "",
		dhuhr: times?.dhuhr || "",
		asr: times?.asr || "",
		maghrib: times?.maghrib || "",
		isha: times?.isha || "",
		hijriDate: times?.hijriDate || "",
		hijriMonth: times?.hijriMonth || "",
		hijriYear: times?.hijriYear || "",
		loading,
		error,
		cachedAt,
	};
};
