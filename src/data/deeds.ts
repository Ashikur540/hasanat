export type DeedCategory = "Salah" | "Quran" | "Sadaqah" | "Dhikr" | "Character" | "Family" | "Fasting" | "Knowledge";
export type DeedDifficulty = "easy" | "medium" | "hard" | "exceptional";

export interface Deed {
  id: string;
  name: string;
  category: DeedCategory;
  difficulty: DeedDifficulty;
  basePoints: number;
  emoji: string;
  hadithReference: string;
  description: string;
  isPreset: boolean;
}

export const CATEGORY_INFO: Record<DeedCategory, { emoji: string; color: string; label: string }> = {
  Salah:     { emoji: "🕌", color: "bg-primary/10 text-primary", label: "Salah" },
  Quran:     { emoji: "📖", color: "bg-success/10 text-success", label: "Quran" },
  Sadaqah:   { emoji: "💝", color: "bg-gold/10 text-gold", label: "Sadaqah" },
  Dhikr:     { emoji: "📿", color: "bg-accent/10 text-accent-foreground", label: "Dhikr" },
  Character: { emoji: "😇", color: "bg-primary/10 text-primary", label: "Character" },
  Family:    { emoji: "👨‍👩‍👧", color: "bg-success/10 text-success", label: "Family" },
  Fasting:   { emoji: "🌙", color: "bg-accent/10 text-accent-foreground", label: "Fasting" },
  Knowledge: { emoji: "📚", color: "bg-gold/10 text-gold", label: "Knowledge" },
};

export const DIFFICULTY_INFO: Record<DeedDifficulty, { label: string; points: number; color: string }> = {
  easy:        { label: "EASY", points: 5, color: "bg-secondary text-secondary-foreground" },
  medium:      { label: "MEDIUM", points: 15, color: "bg-primary/10 text-primary" },
  hard:        { label: "HARD", points: 30, color: "bg-accent/20 text-accent-foreground" },
  exceptional: { label: "EXCEPTIONAL", points: 100, color: "bg-gold/20 text-gold" },
};

export const PRESET_DEEDS: Deed[] = [
  // ── Salah (12) ──
  { id: "s1",  name: "Fajr Prayer", category: "Salah", difficulty: "easy", basePoints: 5, emoji: "🕌", hadithReference: "Bukhari 574", description: "Perform the Fajr (dawn) prayer on time.", isPreset: true },
  { id: "s2",  name: "Dhuhr Prayer", category: "Salah", difficulty: "easy", basePoints: 5, emoji: "🕌", hadithReference: "Muslim 612", description: "Perform the Dhuhr (noon) prayer on time.", isPreset: true },
  { id: "s3",  name: "Asr Prayer", category: "Salah", difficulty: "easy", basePoints: 5, emoji: "🕌", hadithReference: "Bukhari 555", description: "Perform the Asr (afternoon) prayer on time.", isPreset: true },
  { id: "s4",  name: "Maghrib Prayer", category: "Salah", difficulty: "easy", basePoints: 5, emoji: "🕌", hadithReference: "Muslim 626", description: "Perform the Maghrib (sunset) prayer on time.", isPreset: true },
  { id: "s5",  name: "Isha Prayer", category: "Salah", difficulty: "easy", basePoints: 5, emoji: "🕌", hadithReference: "Bukhari 566", description: "Perform the Isha (night) prayer on time.", isPreset: true },
  { id: "s6",  name: "Pray in Congregation", category: "Salah", difficulty: "medium", basePoints: 15, emoji: "🕌", hadithReference: "Bukhari 645 — 27× reward", description: "Perform any obligatory prayer in congregation at the mosque.", isPreset: true },
  { id: "s7",  name: "Tahajjud (Night Prayer)", category: "Salah", difficulty: "hard", basePoints: 30, emoji: "🌙", hadithReference: "Muslim 1163", description: "Wake up in the last third of the night to pray voluntary prayers.", isPreset: true },
  { id: "s8",  name: "Duha Prayer", category: "Salah", difficulty: "medium", basePoints: 15, emoji: "☀️", hadithReference: "Muslim 720", description: "Pray 2-8 rak'ah after sunrise (forenoon prayer).", isPreset: true },
  { id: "s9",  name: "Sunnah Rawatib (12 rak'ah)", category: "Salah", difficulty: "medium", basePoints: 15, emoji: "🕌", hadithReference: "Muslim 728 — A house in Jannah", description: "Pray the 12 regular sunnah prayers throughout the day.", isPreset: true },
  { id: "s10", name: "Salatul Istikhara", category: "Salah", difficulty: "medium", basePoints: 15, emoji: "🤲", hadithReference: "Bukhari 1162", description: "Pray the guidance prayer when making an important decision.", isPreset: true },
  { id: "s11", name: "Pray Witr", category: "Salah", difficulty: "easy", basePoints: 5, emoji: "🌙", hadithReference: "Abu Dawud 1416", description: "Pray the Witr prayer before sleeping or after Tahajjud.", isPreset: true },
  { id: "s12", name: "Pray at the Mosque", category: "Salah", difficulty: "medium", basePoints: 15, emoji: "🕌", hadithReference: "Bukhari 647", description: "Walk to the mosque for any prayer.", isPreset: true },

  // ── Quran (10) ──
  { id: "q1",  name: "Read 1 Page of Quran", category: "Quran", difficulty: "easy", basePoints: 5, emoji: "📖", hadithReference: "Tirmidhi 2910 — 10 rewards per letter", description: "Read one page of the Quran with focus and reflection.", isPreset: true },
  { id: "q2",  name: "Read 1 Juz of Quran", category: "Quran", difficulty: "hard", basePoints: 30, emoji: "📖", hadithReference: "Tirmidhi 2910", description: "Complete reading one full juz (chapter) of the Quran.", isPreset: true },
  { id: "q3",  name: "Memorize 1 Ayah", category: "Quran", difficulty: "medium", basePoints: 15, emoji: "🧠", hadithReference: "Abu Dawud 1452", description: "Commit one new verse of the Quran to memory.", isPreset: true },
  { id: "q4",  name: "Memorize 1 Page", category: "Quran", difficulty: "exceptional", basePoints: 100, emoji: "🧠", hadithReference: "Bukhari 5027", description: "Memorize an entire page of the Quran.", isPreset: true },
  { id: "q5",  name: "Listen to Tafsir", category: "Quran", difficulty: "medium", basePoints: 15, emoji: "🎧", hadithReference: "Al-Qur'an 47:24", description: "Listen to a tafsir (explanation) of Quran verses.", isPreset: true },
  { id: "q6",  name: "Recite Surah Al-Kahf (Friday)", category: "Quran", difficulty: "medium", basePoints: 15, emoji: "📖", hadithReference: "Muslim — Light between two Fridays", description: "Recite Surah Al-Kahf on Friday.", isPreset: true },
  { id: "q7",  name: "Recite Surah Al-Mulk", category: "Quran", difficulty: "easy", basePoints: 5, emoji: "📖", hadithReference: "Tirmidhi 2891 — Protection from grave punishment", description: "Recite Surah Al-Mulk before sleeping.", isPreset: true },
  { id: "q8",  name: "Recite Ayatul Kursi", category: "Quran", difficulty: "easy", basePoints: 5, emoji: "📖", hadithReference: "Bukhari — Protection until morning", description: "Recite Ayatul Kursi after each obligatory prayer.", isPreset: true },
  { id: "q9",  name: "Read with Tajweed", category: "Quran", difficulty: "medium", basePoints: 15, emoji: "📖", hadithReference: "Bukhari 5027", description: "Practice reading Quran with proper tajweed rules.", isPreset: true },
  { id: "q10", name: "Teach Someone Quran", category: "Quran", difficulty: "hard", basePoints: 30, emoji: "📖", hadithReference: "Bukhari 5027 — Best of you teaches Quran", description: "Teach a verse or surah of Quran to someone else.", isPreset: true },

  // ── Sadaqah (12) ──
  { id: "sa1",  name: "Give Money in Charity", category: "Sadaqah", difficulty: "medium", basePoints: 15, emoji: "💰", hadithReference: "Bukhari 1410", description: "Donate money to those in need or a charitable cause.", isPreset: true },
  { id: "sa2",  name: "Feed Someone", category: "Sadaqah", difficulty: "medium", basePoints: 15, emoji: "🍽️", hadithReference: "Bukhari 12", description: "Provide food to someone who is hungry.", isPreset: true },
  { id: "sa3",  name: "Smile at Someone", category: "Sadaqah", difficulty: "easy", basePoints: 5, emoji: "😊", hadithReference: "Tirmidhi 1956 — Smiling is charity", description: "Greet someone with a genuine smile.", isPreset: true },
  { id: "sa4",  name: "Remove Harm from Path", category: "Sadaqah", difficulty: "easy", basePoints: 5, emoji: "🧹", hadithReference: "Muslim 1914", description: "Remove an obstacle or litter from a public path.", isPreset: true },
  { id: "sa5",  name: "Help a Neighbor", category: "Sadaqah", difficulty: "medium", basePoints: 15, emoji: "🏘️", hadithReference: "Bukhari 6014", description: "Assist your neighbor with a task or gift them something.", isPreset: true },
  { id: "sa6",  name: "Give Water to Someone", category: "Sadaqah", difficulty: "easy", basePoints: 5, emoji: "💧", hadithReference: "Bukhari 2466", description: "Provide water to a person or animal in need.", isPreset: true },
  { id: "sa7",  name: "Plant a Tree or Plant", category: "Sadaqah", difficulty: "hard", basePoints: 30, emoji: "🌱", hadithReference: "Bukhari 2320 — Ongoing charity", description: "Plant a tree, shrub, or any beneficial plant.", isPreset: true },
  { id: "sa8",  name: "Donate Clothes", category: "Sadaqah", difficulty: "medium", basePoints: 15, emoji: "👕", hadithReference: "Tirmidhi 2449", description: "Give away clothes you no longer need to those who need them.", isPreset: true },
  { id: "sa9",  name: "Sponsor an Orphan", category: "Sadaqah", difficulty: "exceptional", basePoints: 100, emoji: "🤲", hadithReference: "Bukhari 5304 — Close to Prophet ﷺ in Jannah", description: "Contribute to sponsoring an orphan's needs.", isPreset: true },
  { id: "sa10", name: "Give a Thoughtful Gift", category: "Sadaqah", difficulty: "easy", basePoints: 5, emoji: "🎁", hadithReference: "Bukhari — Exchange gifts, increase love", description: "Give someone a meaningful gift to strengthen bonds.", isPreset: true },
  { id: "sa11", name: "Share Knowledge", category: "Sadaqah", difficulty: "medium", basePoints: 15, emoji: "📢", hadithReference: "Muslim 1631 — Ongoing reward", description: "Share beneficial Islamic knowledge with others.", isPreset: true },
  { id: "sa12", name: "Make Dua for Others", category: "Sadaqah", difficulty: "easy", basePoints: 5, emoji: "🤲", hadithReference: "Muslim 2733 — Angel says 'And for you too'", description: "Sincerely pray for the wellbeing of another Muslim.", isPreset: true },

  // ── Dhikr (10) ──
  { id: "d1",  name: "Morning Adhkar", category: "Dhikr", difficulty: "easy", basePoints: 5, emoji: "🌅", hadithReference: "Abu Dawud 5068", description: "Recite the morning remembrances after Fajr.", isPreset: true },
  { id: "d2",  name: "Evening Adhkar", category: "Dhikr", difficulty: "easy", basePoints: 5, emoji: "🌇", hadithReference: "Abu Dawud 5068", description: "Recite the evening remembrances before Maghrib.", isPreset: true },
  { id: "d3",  name: "100× SubhanAllah", category: "Dhikr", difficulty: "easy", basePoints: 5, emoji: "📿", hadithReference: "Muslim 2692 — 1000 hasanat", description: "Say SubhanAllah 100 times throughout the day.", isPreset: true },
  { id: "d4",  name: "100× Alhamdulillah", category: "Dhikr", difficulty: "easy", basePoints: 5, emoji: "📿", hadithReference: "Bukhari 6405", description: "Say Alhamdulillah 100 times throughout the day.", isPreset: true },
  { id: "d5",  name: "100× La ilaha illAllah", category: "Dhikr", difficulty: "medium", basePoints: 15, emoji: "📿", hadithReference: "Bukhari 6403 — Best of dhikr", description: "Say La ilaha illAllah 100 times.", isPreset: true },
  { id: "d6",  name: "100× Salawat on Prophet ﷺ", category: "Dhikr", difficulty: "medium", basePoints: 15, emoji: "💚", hadithReference: "Muslim 408 — 10 blessings per salawat", description: "Send 100 salutations upon the Prophet Muhammad ﷺ.", isPreset: true },
  { id: "d7",  name: "Istighfar (100×)", category: "Dhikr", difficulty: "easy", basePoints: 5, emoji: "🤲", hadithReference: "Bukhari — Prophet ﷺ did 100× daily", description: "Seek forgiveness from Allah 100 times.", isPreset: true },
  { id: "d8",  name: "Dhikr After Salah", category: "Dhikr", difficulty: "easy", basePoints: 5, emoji: "📿", hadithReference: "Muslim 597", description: "Recite the post-prayer adhkar (33×33×34).", isPreset: true },
  { id: "d9",  name: "Recite Sayyidul Istighfar", category: "Dhikr", difficulty: "medium", basePoints: 15, emoji: "🤲", hadithReference: "Bukhari 6306 — Master of seeking forgiveness", description: "Recite the master supplication for forgiveness.", isPreset: true },
  { id: "d10", name: "Say Bismillah Before Eating", category: "Dhikr", difficulty: "easy", basePoints: 5, emoji: "🍽️", hadithReference: "Muslim 2017", description: "Remember to say Bismillah before every meal.", isPreset: true },

  // ── Character (10) ──
  { id: "c1",  name: "Forgive Someone", category: "Character", difficulty: "hard", basePoints: 30, emoji: "🕊️", hadithReference: "Muslim 2588 — Allah increases honor", description: "Let go of a grudge and forgive someone who wronged you.", isPreset: true },
  { id: "c2",  name: "Control Your Anger", category: "Character", difficulty: "medium", basePoints: 15, emoji: "😌", hadithReference: "Bukhari 6114", description: "Practice restraint when feeling angry.", isPreset: true },
  { id: "c3",  name: "Be Patient in Difficulty", category: "Character", difficulty: "hard", basePoints: 30, emoji: "💪", hadithReference: "Muslim 2999", description: "Remain patient and grateful during a hardship.", isPreset: true },
  { id: "c4",  name: "Keep a Promise", category: "Character", difficulty: "medium", basePoints: 15, emoji: "🤝", hadithReference: "Bukhari 33 — Signs of hypocrisy include broken promises", description: "Follow through on a commitment you made.", isPreset: true },
  { id: "c5",  name: "Speak Kindly", category: "Character", difficulty: "easy", basePoints: 5, emoji: "💬", hadithReference: "Bukhari 6018 — A good word is charity", description: "Choose gentle and uplifting words in conversations.", isPreset: true },
  { id: "c6",  name: "Avoid Backbiting", category: "Character", difficulty: "medium", basePoints: 15, emoji: "🤐", hadithReference: "Al-Hujurat 49:12", description: "Consciously avoid speaking ill of others behind their backs.", isPreset: true },
  { id: "c7",  name: "Be Truthful", category: "Character", difficulty: "easy", basePoints: 5, emoji: "✅", hadithReference: "Muslim 2607 — Truthfulness leads to Jannah", description: "Be honest in all dealings throughout the day.", isPreset: true },
  { id: "c8",  name: "Show Gratitude", category: "Character", difficulty: "easy", basePoints: 5, emoji: "🙏", hadithReference: "Tirmidhi 1954", description: "Express thankfulness to Allah and to people around you.", isPreset: true },
  { id: "c9",  name: "Be Humble", category: "Character", difficulty: "medium", basePoints: 15, emoji: "😇", hadithReference: "Muslim 2865", description: "Practice humility and avoid arrogance.", isPreset: true },
  { id: "c10", name: "Reconcile Between People", category: "Character", difficulty: "exceptional", basePoints: 100, emoji: "🤝", hadithReference: "Bukhari 2693 — Better than prayer & fasting", description: "Help resolve a conflict between two parties.", isPreset: true },

  // ── Family (10) ──
  { id: "f1",  name: "Call Your Parents", category: "Family", difficulty: "easy", basePoints: 5, emoji: "📞", hadithReference: "Al-Isra 17:23-24", description: "Call or visit your parents to check on them.", isPreset: true },
  { id: "f2",  name: "Play With Your Children", category: "Family", difficulty: "easy", basePoints: 5, emoji: "🎮", hadithReference: "Tirmidhi 1919", description: "Spend quality playtime with your children.", isPreset: true },
  { id: "f3",  name: "Visit a Relative", category: "Family", difficulty: "medium", basePoints: 15, emoji: "🏠", hadithReference: "Bukhari 5985 — Maintain ties of kinship", description: "Visit a family member to maintain ties of kinship.", isPreset: true },
  { id: "f4",  name: "Help With Housework", category: "Family", difficulty: "easy", basePoints: 5, emoji: "🧹", hadithReference: "Bukhari 676 — Prophet ﷺ helped at home", description: "Assist with household chores and tasks.", isPreset: true },
  { id: "f5",  name: "Teach Family Something Islamic", category: "Family", difficulty: "medium", basePoints: 15, emoji: "📖", hadithReference: "At-Tahrim 66:6", description: "Share an Islamic lesson, hadith, or story with your family.", isPreset: true },
  { id: "f6",  name: "Express Love to Spouse", category: "Family", difficulty: "easy", basePoints: 5, emoji: "❤️", hadithReference: "Muslim 2328", description: "Show affection and express love to your spouse.", isPreset: true },
  { id: "f7",  name: "Make Dua for Parents", category: "Family", difficulty: "easy", basePoints: 5, emoji: "🤲", hadithReference: "Al-Isra 17:24", description: "Pray for your parents' health, guidance, and forgiveness.", isPreset: true },
  { id: "f8",  name: "Eat Together as Family", category: "Family", difficulty: "easy", basePoints: 5, emoji: "🍽️", hadithReference: "Muslim 2052", description: "Share a meal together as a family.", isPreset: true },
  { id: "f9",  name: "Resolve a Family Disagreement", category: "Family", difficulty: "hard", basePoints: 30, emoji: "🕊️", hadithReference: "Bukhari 2693", description: "Help resolve a disagreement within the family peacefully.", isPreset: true },
  { id: "f10", name: "Visit the Sick", category: "Family", difficulty: "medium", basePoints: 15, emoji: "🏥", hadithReference: "Muslim 2568 — 70,000 angels make dua", description: "Visit a sick family member or friend.", isPreset: true },

  // ── Fasting (8) ──
  { id: "fa1", name: "Fast Monday", category: "Fasting", difficulty: "hard", basePoints: 30, emoji: "🌙", hadithReference: "Muslim 1162", description: "Observe a voluntary fast on Monday.", isPreset: true },
  { id: "fa2", name: "Fast Thursday", category: "Fasting", difficulty: "hard", basePoints: 30, emoji: "🌙", hadithReference: "Tirmidhi 745", description: "Observe a voluntary fast on Thursday.", isPreset: true },
  { id: "fa3", name: "Fast Ayyam al-Beedh (13-15th)", category: "Fasting", difficulty: "hard", basePoints: 30, emoji: "🌕", hadithReference: "Nasa'i 2346 — Like fasting the whole month", description: "Fast the 13th, 14th, and 15th of the Islamic month.", isPreset: true },
  { id: "fa4", name: "Fast Day of Arafah", category: "Fasting", difficulty: "exceptional", basePoints: 100, emoji: "🕋", hadithReference: "Muslim 1162 — Forgives 2 years of sins", description: "Fast on the 9th of Dhul Hijjah (Day of Arafah).", isPreset: true },
  { id: "fa5", name: "Fast Day of Ashura", category: "Fasting", difficulty: "hard", basePoints: 30, emoji: "🌙", hadithReference: "Muslim 1162 — Forgives previous year", description: "Fast on the 10th of Muharram.", isPreset: true },
  { id: "fa6", name: "Make Up Missed Fast", category: "Fasting", difficulty: "hard", basePoints: 30, emoji: "📅", hadithReference: "Bukhari 1950", description: "Make up a missed obligatory fast from Ramadan.", isPreset: true },
  { id: "fa7", name: "Have Suhoor", category: "Fasting", difficulty: "easy", basePoints: 5, emoji: "🌅", hadithReference: "Bukhari 1923 — Blessing in suhoor", description: "Wake up for the pre-dawn meal before fasting.", isPreset: true },
  { id: "fa8", name: "Break Someone's Fast (Iftar)", category: "Fasting", difficulty: "medium", basePoints: 15, emoji: "🍽️", hadithReference: "Tirmidhi 807 — Same reward as the fasting person", description: "Provide iftar for someone who is fasting.", isPreset: true },

  // ── Knowledge (10) ──
  { id: "k1",  name: "Attend an Islamic Lecture", category: "Knowledge", difficulty: "medium", basePoints: 15, emoji: "🎓", hadithReference: "Muslim 2699 — Angels surround gatherings of knowledge", description: "Attend a lecture, khutbah, or halaqa.", isPreset: true },
  { id: "k2",  name: "Read an Islamic Book", category: "Knowledge", difficulty: "medium", basePoints: 15, emoji: "📚", hadithReference: "Tirmidhi 2682", description: "Read from a book about Islamic knowledge.", isPreset: true },
  { id: "k3",  name: "Teach Someone", category: "Knowledge", difficulty: "hard", basePoints: 30, emoji: "👨‍🏫", hadithReference: "Tirmidhi 2685 — Superiority of knowledge over worship", description: "Teach an Islamic concept or skill to someone.", isPreset: true },
  { id: "k4",  name: "Learn a New Dua", category: "Knowledge", difficulty: "easy", basePoints: 5, emoji: "🤲", hadithReference: "Tirmidhi 3479", description: "Memorize a new supplication from the Sunnah.", isPreset: true },
  { id: "k5",  name: "Study Arabic", category: "Knowledge", difficulty: "medium", basePoints: 15, emoji: "🔤", hadithReference: "Umar ibn al-Khattab", description: "Spend time studying Arabic to understand the Quran better.", isPreset: true },
  { id: "k6",  name: "Listen to Islamic Podcast", category: "Knowledge", difficulty: "easy", basePoints: 5, emoji: "🎧", hadithReference: "Az-Zumar 39:9", description: "Listen to an educational Islamic podcast or audio.", isPreset: true },
  { id: "k7",  name: "Study Fiqh", category: "Knowledge", difficulty: "medium", basePoints: 15, emoji: "⚖️", hadithReference: "Bukhari 71 — Understanding in religion", description: "Study Islamic jurisprudence (fiqh) on a topic.", isPreset: true },
  { id: "k8",  name: "Learn a Hadith", category: "Knowledge", difficulty: "easy", basePoints: 5, emoji: "📜", hadithReference: "Tirmidhi 2656 — May Allah brighten their face", description: "Learn and understand a new hadith of the Prophet ﷺ.", isPreset: true },
  { id: "k9",  name: "Attend Friday Khutbah", category: "Knowledge", difficulty: "medium", basePoints: 15, emoji: "🕌", hadithReference: "Muslim 857", description: "Listen attentively to the Friday sermon.", isPreset: true },
  { id: "k10", name: "Write Islamic Notes", category: "Knowledge", difficulty: "medium", basePoints: 15, emoji: "✍️", hadithReference: "Tirmidhi 2682", description: "Take notes from an Islamic lecture or reading session.", isPreset: true },
];
