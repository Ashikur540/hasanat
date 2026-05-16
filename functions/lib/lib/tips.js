"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIP_SLOTS = exports.TIP_TITLE = exports.curatedTips = void 0;
exports.hashIndex = hashIndex;
exports.activeSlotForLocalTime = activeSlotForLocalTime;
exports.curatedTips = {
    en: [
        "Smile at someone today — it's a form of charity! 😊",
        "Recite Surah Al-Ikhlas 3 times — equal to reading the entire Quran!",
        "Say SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 34x after every salah.",
        "Make dua for your parents — their blessings are a path to Jannah.",
        "Forgive someone who wronged you — Allah loves those who forgive.",
        "If you missed a prayer, make it up as soon as you can — it's never too late to return to Allah.",
        "Read just 1 page of Quran today — consistency matters more than quantity.",
        "Help a neighbour today — the Prophet ﷺ emphasized neighbours' rights.",
        "Give water to someone thirsty — one of the best forms of sadaqah.",
        "Teach someone something beneficial — an amal that continues after you.",
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
        "যদি আপনি কোনো সালাত মিস করেন, তাহলে যত তাড়াতাড়ি সম্ভব তত দ্রুত এটি কাজা আদায় করুন।",
    ],
};
exports.TIP_TITLE = {
    en: "Today's Tip",
    bn: "আজকের পরামর্শ",
};
/**
 * Deterministic index — same `seed` always maps to same value in [0, mod).
 * djb2-style hash; sufficient for picking a tip slot.
 */
function hashIndex(seed, mod) {
    if (mod <= 0)
        return 0;
    let h = 5381;
    for (let i = 0; i < seed.length; i++) {
        h = ((h << 5) + h) ^ seed.charCodeAt(i);
    }
    return Math.abs(h) % mod;
}
exports.TIP_SLOTS = [
    { id: "morning", hour: 8, windowMinutes: 30 },
    { id: "evening", hour: 16, windowMinutes: 30 },
    { id: "night", hour: 20, windowMinutes: 30 },
];
/**
 * Returns the active slot if `localHour:localMinute` falls within ±windowMinutes
 * of the slot's anchor hour, else null.
 */
function activeSlotForLocalTime(localHour, localMinute) {
    const nowMinutes = localHour * 60 + localMinute;
    for (const slot of exports.TIP_SLOTS) {
        const anchorMinutes = slot.hour * 60;
        if (Math.abs(nowMinutes - anchorMinutes) <= slot.windowMinutes) {
            return slot;
        }
    }
    return null;
}
//# sourceMappingURL=tips.js.map