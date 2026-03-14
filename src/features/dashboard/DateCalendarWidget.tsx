import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";
import { Calendar, Moon } from "lucide-react";

// Simple Hijri date approximation (for demo — real apps use a proper Hijri library)
function getHijriDate(): { day: number; month: string; monthBn: string; year: number } {
  // Approximate: Hijri epoch offset. This is a simplified calculation.
  const now = new Date();
  const gregorianDays = Math.floor((now.getTime() - new Date(622, 6, 16).getTime()) / 86400000);
  const hijriYear = Math.floor((30 * gregorianDays + 10646) / 10631);
  const daysInYear = gregorianDays - Math.floor((10631 * hijriYear - 10617) / 30);
  const hijriMonth = Math.min(12, Math.ceil((daysInYear - 0.5) / 29.5));
  const hijriDay = Math.max(1, Math.ceil(daysInYear - 29.5 * (hijriMonth - 1)));

  const months = ["Muharram", "Safar", "Rabi al-Awwal", "Rabi al-Thani", "Jumada al-Ula", "Jumada al-Thani", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhul Qi'dah", "Dhul Hijjah"];
  const monthsBn = ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জুমাদাল উলা", "জুমাদাস সানি", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলক্বদ", "জিলহজ্জ"];

  return { day: hijriDay, month: months[hijriMonth - 1] || "Ramadan", monthBn: monthsBn[hijriMonth - 1] || "রমজান", year: hijriYear };
}

function getBanglaDate(): string {
  const now = new Date();
  const banglaMonths = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
  // Approximate Bangla calendar (starts ~April 14)
  const startOfYear = new Date(now.getFullYear(), 3, 14); // April 14
  if (now < startOfYear) startOfYear.setFullYear(now.getFullYear() - 1);
  const daysDiff = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const monthLengths = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
  let remaining = daysDiff;
  let monthIdx = 0;
  for (let i = 0; i < monthLengths.length; i++) {
    if (remaining < monthLengths[i]) { monthIdx = i; break; }
    remaining -= monthLengths[i];
  }
  const banglaYear = now.getFullYear() - 593 + (now >= startOfYear ? 0 : -1);
  return `${toBanglaNum(remaining + 1)} ${banglaMonths[monthIdx]} ${toBanglaNum(banglaYear)}`;
}

function toBanglaNum(n: number): string {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => digits[parseInt(d)]);
}

const DateCalendarWidget = () => {
  const { language } = useI18n();
  const now = new Date();
  const hijri = getHijriDate();

  const weekdaysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdaysBn = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

  const gregorianEn = now.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  const gregorianBn = `${toBanglaNum(now.getDate())} ${now.toLocaleDateString("bn-BD", { month: "long" })} ${toBanglaNum(now.getFullYear())}`;

  const isBn = language === "bn";

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Hijri header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-5 w-5 opacity-80" />
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                {isBn ? "হিজরি তারিখ" : "Hijri Date"}
              </span>
            </div>
            <span className="text-xs opacity-70 font-arabic">﷽</span>
          </div>
          <p className="text-2xl font-bold mt-2 font-arabic">
            {isBn ? `${toBanglaNum(hijri.day)} ${hijri.monthBn} ${toBanglaNum(hijri.year)}` : `${hijri.day} ${hijri.month} ${hijri.year}`}
          </p>
        </div>

        {/* Gregorian + Bangla */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {isBn ? weekdaysBn[now.getDay()] : weekdaysEn[now.getDay()]}
              </p>
              <p className="text-xs text-muted-foreground">{isBn ? gregorianBn : gregorianEn}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-base">🇧🇩</span>
            <div>
              <p className="text-xs text-muted-foreground">{isBn ? "বাংলা" : "Bangla"}</p>
              <p className="text-sm font-semibold text-foreground">{getBanglaDate()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DateCalendarWidget;
