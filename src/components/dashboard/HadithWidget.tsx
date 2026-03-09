import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { motion } from "framer-motion";

interface Hadith {
  arabic: string;
  en: string;
  bn: string;
  reference: string;
}

const hadiths: Hadith[] = [
  {
    arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
    en: "Actions are judged by intentions, and everyone will get what they intended.",
    bn: "প্রতিটি কাজ নিয়তের উপর নির্ভরশীল এবং প্রত্যেক ব্যক্তি তার নিয়ত অনুযায়ী ফল পাবে।",
    reference: "Sahih Bukhari 1"
  },
  {
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    en: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
    bn: "যে আল্লাহ ও পরকালে বিশ্বাস করে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।",
    reference: "Sahih Bukhari 6018"
  },
  {
    arabic: "الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا",
    en: "The believers, in their mutual love, mercy, and compassion, are like one body; if one part of it complains, the rest of the body joins it in staying awake and suffering fever.",
    bn: "একজন মুমিন অপর মুমিনের জন্য ইমারতের মতো, যার এক অংশ অপর অংশকে শক্তিশালী করে।",
    reference: "Sahih Bukhari 481"
  },
  {
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    en: "The best among you are those who learn the Quran and teach it.",
    bn: "তোমাদের মধ্যে সর্বোত্তম সেই ব্যক্তি যে কুরআন শিখে এবং শেখায়।",
    reference: "Sahih Bukhari 5027"
  },
  {
    arabic: "مَنْ صَلَّى عَلَيَّ صَلَاةً وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا",
    en: "Whoever sends blessings upon me once, Allah will send blessings upon him ten times.",
    bn: "যে ব্যক্তি আমার উপর একবার দরুদ পাঠ করে, আল্লাহ তার উপর দশবার রহমত নাজিল করেন।",
    reference: "Sahih Muslim 408"
  },
  {
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ",
    en: "Your smile in the face of your brother is charity.",
    bn: "তোমার ভাইয়ের সামনে হাসি দেওয়া একটি সদকা।",
    reference: "Jami at-Tirmidhi 1956"
  },
  {
    arabic: "الدِّينُ النَّصِيحَةُ",
    en: "Religion is sincere advice.",
    bn: "দ্বীন হল কল্যাণকামিতা।",
    reference: "Sahih Muslim 55"
  }
];

// Get daily hadith based on date
function getDailyHadith(): Hadith {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % hadiths.length;
  return hadiths[index];
}

const HadithWidget = () => {
  const { language } = useI18n();
  const isBn = language === "bn";
  const hadith = getDailyHadith();

  return (
    <Card className="border-border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-bold text-amber-900 dark:text-amber-100">
            {isBn ? "আজকের হাদিস" : "Hadith of the Day"}
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Arabic Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-right"
        >
          <p className="font-arabic text-xl leading-loose text-amber-900 dark:text-amber-100">
            {hadith.arabic}
          </p>
        </motion.div>

        {/* Translation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-t border-amber-200 dark:border-amber-800 pt-3"
        >
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
            {isBn ? hadith.bn : hadith.en}
          </p>
        </motion.div>

        {/* Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            — {hadith.reference}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default HadithWidget;
