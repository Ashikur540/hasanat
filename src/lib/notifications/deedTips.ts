import { PRESET_DEEDS } from "@/data/deeds";

type TipLanguage = "en" | "bn";

const curatedTips: Record<TipLanguage, string[]> = {
	en: [
		"Smile at someone today — it's a form of charity! 😊",
		"Recite Surah Al-Ikhlas 3 times — equal to reading the entire Quran!",
		"Say SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 34x after every salah.",
		"Make dua for your parents — their blessings are a path to Jannah.",
		"Forgive someone who wronged you — Allah loves those who forgive.",
		"If you missed a prayer, make it up as soon as you can — it's never too late to return to Allah.",
	],
	bn: [
		"আজ কাউকে হাসুন — এটি সাদাকাহর একটি রূপ! 😊",
		"সূরা আল-ইখলাস ৩ বার পড়ুন — পুরো কুরআন পড়ার সমান!",
		"প্রতি সালাতের পর সুবহানাল্লাহ ৩৩x, আলহামদুলিল্লাহ ৩৩x, আল্লাহু আকবার ৩৪x বলুন।",
		"তৃষ্ণার্তকে পানি দিন — সাদাকাহর সেরা রূপগুলোর একটি।",
		"আপনার বাবা-মায়ের জন্য দোয়া করুন — তাদের দোয়া জান্নাতের পথ।",
		"আজ কুরআনের মাত্র ১ পৃষ্ঠা পড়ুন — ধারাবাহিকতা পরিমাণের চেয়ে বেশি গুরুত্বপূর্ণ।",
		"যে আপনার ক্ষতি করেছে তাকে ক্ষমা করুন — আল্লাহ ক্ষমাশীলদের ভালোবাসেন।",
		"একজন প্রতিবেশীকে সাহায্য করুন — নবী ﷺ প্রতিবেশীর অধিকারের উপর জোর দিয়েছেন।",
		"সোমবার বা বৃহস্পতিবার নফল রোজা রাখুন — সুন্নাহ অনুসরণ।",
		"কাউকে উপকারী কিছু শেখান — এমন আমল যা আপনার পরেও চলতে থাকে।",
		"যদি আপনি কোনো সালাত মিস করেন, তাহলে যত তাড়াতাড়ি সম্ভব তত দ্রুত এটি কাজা আদায় করুন — আল্লাহর কাছে ফিরে আসা কখনই খুবই দেরি না!",
	],
};

function formatDeedTip(deed: (typeof PRESET_DEEDS)[number]): string {
	return `${deed.emoji} ${deed.name} — ${deed.description}`;
}

function getEnglishTipPool(): string[] {
	return [...curatedTips.en, ...PRESET_DEEDS.map(formatDeedTip)];
}

export function getRandomTip(language: TipLanguage): string {
	const pool = language === "bn" ? curatedTips.bn : getEnglishTipPool();
	return pool[Math.floor(Math.random() * pool.length)];
}

export function getPrayerReminderBody(
	language: TipLanguage,
	prayerName: string,
	minutesRemaining: number,
): string {
	if (language === "bn") {
		return `${prayerName} এর ওয়াক্ত শেষ হতে ${minutesRemaining} মিনিট বাকি। সালাত পড়ে থাকলে চেক করে দিন।`;
	}
	return `${prayerName} time is ending in ${minutesRemaining} minutes. If you prayed, mark it now.`;
}
