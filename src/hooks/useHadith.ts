import { useEffect, useState } from "react";

export interface Hadith {
	arabic: string;
	en: string;
	bn: string;
	reference: string;
	source: string;
}

interface UseHadithReturn {
	hadith: Hadith | null;
	loading: boolean;
	error: string | null;
	cachedAt: string | null;
}

const FALLBACK_HADITHS: Hadith[] = [
	{
		arabic:
			"عن أبي موسى الأشعري قال: قال رسول الله صلى الله عليه وسلم: مثل المؤمن الذي يقرأ القرآن مثل الأترجة، ريحها طيب وطعمها طيب",
		en: "The Prophet (peace be upon him) said: The example of the believer who recites the Quran is like that of a citron, its smell is pleasant and its taste is pleasant.",
		bn: "নবী (সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম) বলেছেন: যে মুমিন কুরআন তিলাওয়াত করে তার উদাহরণ হল নারঙ্গির মতো, যার সুগন্ধ সুন্দর এবং স্বাদও সুন্দর।",
		reference: "Sahih Al-Bukhari 5427",
		source: "Fallback",
	},
	{
		arabic:
			"عن أبي هريرة قال: قال رسول الله صلى الله عليه وسلم: خير الناس من طال عمره وحسن عمله",
		en: "The Prophet (peace be upon him) said: The best of people are those with the longest lives and the best deeds.",
		bn: "নবী (সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম) বলেছেন: সবচেয়ে ভালো মানুষ হল যারা দীর্ঘজীবী এবং তাদের কাজ ভালো।",
		reference: "Sunan At-Tirmidhi 3640",
		source: "Fallback",
	},
	{
		arabic:
			"عن عائشة رضي الله عنها قالت: قال رسول الله صلى الله عليه وسلم: الراحمون يرحمهم الله، ارحموا أهل الأرض يرحمكم أهل السماء",
		en: "The Prophet (peace be upon him) said: The merciful will be shown mercy by the Most Merciful. Be merciful to those on the earth, and the One in the heavens will have mercy upon you.",
		bn: "নবী (সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম) বলেছেন: দয়াবান মানুষদের উপর আল্লাহ দয়া করবেন। পৃথিবীর প্রাণীদের প্রতি দয়া কর, আকাশের প্রাণী তোমাদের প্রতি দয়া করবে।",
		reference: "Sunan At-Tirmidhi 1924",
		source: "Fallback",
	},
	{
		arabic:
			"عن ابن عباس قال: قال رسول الله صلى الله عليه وسلم: من عامل الناس فلم يظلمهم، وحدثهم فلم يكذبهم، ووعدهم فلم يخلفهم، فهو ممن كملت مروءته وظهرت عدالته وحرمت غيبته",
		en: "Whoever deals with people without wronging them, speaks to them without lying, and fulfills his promises to them, is one whose dignity is complete and whose justice is evident.",
		bn: "যে ব্যক্তি মানুষের সাথে লেনদেন করে তাদের অত্যাচার না করে, তাদের সাথে কথা বলে মিথ্যা না বলে এবং তাদের প্রতি তার প্রতিশ্রুতি রক্ষা করে, তার মর্যাদা সম্পূর্ণ।",
		reference: "Hadith Sahih",
		source: "Fallback",
	},
	{
		arabic:
			"عن أبي سعيد الخدري قال: قال رسول الله صلى الله عليه وسلم: لا تحقرن من المعروف شيئا، ولو أن تلقى أخاك بوجه طليق",
		en: "The Prophet (peace be upon him) said: Do not dismiss any act of goodness, even if it is meeting your brother with a cheerful face.",
		bn: "নবী (সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম) বলেছেন: কোনো ভালো কাজকে ছোট মনে করো না, এমনকি তোমার ভাইয়ের সাথে হাসি মুখে দেখা করাও।",
		reference: "Sahih Muslim 2626",
		source: "Fallback",
	},
	{
		arabic:
			"عن أنس بن مالك قال: قال رسول الله صلى الله عليه وسلم: من أحب أن يسره الله فليكثر استغفاره",
		en: "Whoever wishes to be granted ease by Allah should frequently seek forgiveness.",
		bn: "যে ব্যক্তি চায় আল্লাহ তাকে সহজ করুন, তাকে বেশি বেশি ক্ষমা প্রার্থনা করতে হবে।",
		reference: "Sunan At-Tirmidhi 3392",
		source: "Fallback",
	},
	{
		arabic:
			"عن أبي هريرة قال: قال رسول الله صلى الله عليه وسلم: بينما رجل يمشي فاشتد عليه العطش، فوجد بئرا فنزل فشرب، فخرج فإذا هو بكلب يلهث يأكل الثرى من العطش، فقال: لقد بلغ هذا الكلب من العطش مثل الذي بلغ مني، فملأ خفه ماء، ثم أمسكه بفيه حتى رقي، فسقى الكلب، فشكر الله له فغفر له",
		en: "A man quenching his thirst gave water to a thirsty dog. The Prophet (peace be upon him) said: Allah forgave him for that deed of compassion.",
		bn: "একজন ব্যক্তি তার পিপাসা মেটাল এবং একটি পিপাসার্ত কুকুরকে পানি দিল। নবী (সাল্লাল্লাহু আলাইহি ওয়াসাল্লাম) বলেছেন: আল্লাহ এই দয়ার কাজের জন্য তাকে ক্ষমা করে দিয়েছেন।",
		reference: "Sahih Al-Bukhari 3467",
		source: "Fallback",
	},
];

const getCacheKey = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `hasanat-hadith-${year}-${month}-${day}`;
};

const getCachedHadith = (): {
	hadith: Hadith | null;
	cachedAt: string | null;
} => {
	try {
		const today = new Date();
		const cacheKey = getCacheKey(today);
		const cached = localStorage.getItem(cacheKey);

		if (cached) {
			const parsed = JSON.parse(cached);
			return {
				hadith: parsed.hadith || null,
				cachedAt: parsed.cachedAt || null,
			};
		}
	} catch (e) {
		if (process.env.NODE_ENV === "development") {
			console.debug("[useHadith] Failed to parse cache:", e);
		}
	}

	return { hadith: null, cachedAt: null };
};

const setCachedHadith = (hadith: Hadith): void => {
	try {
		const today = new Date();
		const cacheKey = getCacheKey(today);
		localStorage.setItem(
			cacheKey,
			JSON.stringify({
				hadith,
				cachedAt: new Date().toISOString(),
			}),
		);
	} catch (e) {
		if (process.env.NODE_ENV === "development") {
			console.debug("[useHadith] Failed to cache hadith:", e);
		}
	}
};

const HADITH_BOOKS = [
	{ edition: "eng-bukhari", max: 7563, name: "Sahih Al-Bukhari" },
	{ edition: "eng-muslim", max: 7453, name: "Sahih Muslim" },
	{ edition: "eng-tirmidhi", max: 3956, name: "Sunan At-Tirmidhi" },
	{ edition: "eng-abudawud", max: 5274, name: "Sunan Abu Dawud" },
];

interface FawazHadithResponse {
	hadiths?: Array<{
		hadithnumber: number;
		text: string;
		grades?: Array<{ grade: string }>;
		reference?: { book: number; hadith: number };
	}>;
	[key: string]: unknown;
}

const fetchHadithFromCDN = async (
	edition: string,
	number: number,
): Promise<string | null> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 8000);

	try {
		// Try .json first, then fallback to .min.json as per API docs
		let url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}/${number}.json`;
		let response = await fetch(url, { signal: controller.signal });

		// Fallback to minified version if main fails
		if (!response.ok) {
			url = `https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}/${number}.min.json`;
			response = await fetch(url, { signal: controller.signal });
		}

		clearTimeout(timeoutId);

		if (!response.ok) return null;

		const data = (await response.json()) as FawazHadithResponse;

		// Extract hadith text from response
		const hadith = data.hadiths?.[0];
		if (hadith?.text) {
			return hadith.text;
		}

		return null;
	} catch (e) {
		clearTimeout(timeoutId);
		const errorMsg = e instanceof Error ? e.message : "Unknown error";
		console.error(
			`[useHadith] Fetch error for ${edition}/${number}:`,
			errorMsg,
		);
		return null;
	}
};

const fetchHadithFromAPI = async (): Promise<Hadith | null> => {
	try {
		const book = HADITH_BOOKS[Math.floor(Math.random() * HADITH_BOOKS.length)];
		const hadithNumber = Math.floor(Math.random() * book.max) + 1;

		// Fetch English, Arabic, and Bengali simultaneously
		const [engText, araText, bnText] = await Promise.all([
			fetchHadithFromCDN(book.edition, hadithNumber),
			// Arabic edition (if available)
			fetchHadithFromCDN(
				book.edition.replace("eng-", "ara-"),
				hadithNumber,
			).catch(() => null),
			// Bengali edition (if available)
			fetchHadithFromCDN(
				book.edition.replace("eng-", "ben-"),
				hadithNumber,
			).catch(() => null),
		]);

		if (!engText && !araText) {
			console.warn(
				`[useHadith] ⚠️ No text found for ${book.name} #${hadithNumber}`,
			);
			return null;
		}

		const hadith: Hadith = {
			arabic: araText || "",
			en: engText || "Translation not available",
			bn: bnText || engText || "অনুবাদ উপলব্ধ নয়",
			reference: `${book.name} ${hadithNumber}`,
			source: "fawazahmed0/hadith-api (CDN)",
		};
		return hadith;
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		console.error("[useHadith] ❌ CDN fetch failed:", message);
		return null;
	}
};

export const useHadith = (): UseHadithReturn => {
	const [hadith, setHadith] = useState<Hadith | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cachedAt, setCachedAt] = useState<string | null>(null);

	useEffect(() => {
		const fetchHadith = async () => {
			setLoading(true);
			setError(null);

			const { hadith: cached, cachedAt: cachedTime } = getCachedHadith();

			if (cached) {
				console.log("[useHadith] 📦 Using cached hadith from:", cachedTime);
				setHadith(cached);
				setCachedAt(cachedTime);
				setLoading(false);
				return;
			}
			const fetched = await fetchHadithFromAPI();

			if (fetched) {
				setHadith(fetched);
				setCachedHadith(fetched);
				setCachedAt(new Date().toISOString());
				setError(null);
			} else {
				const fallback =
					FALLBACK_HADITHS[Math.floor(Math.random() * FALLBACK_HADITHS.length)];
				setHadith(fallback);
				setCachedHadith(fallback);
				setCachedAt(new Date().toISOString());
				setError(null);
			}

			setLoading(false);
		};

		fetchHadith();
	}, []);

	return { hadith, loading, error, cachedAt };
};
