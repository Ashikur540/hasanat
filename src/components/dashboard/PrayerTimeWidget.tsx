import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";
import { Sunrise, Sunset } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Static prayer times for Dhaka (demo data — real app would use an API)
const PRAYER_SCHEDULE = [
  { id: "fajr", en: "Fajr", bn: "ফজর", emoji: "🌙", start: "04:59", end: "06:14" },
  { id: "duha", en: "Duha", bn: "ইশরাক/চাশত", emoji: "🌅", start: "06:14", end: "12:10" },
  { id: "dhuhr", en: "Dhuhr", bn: "যুহর", emoji: "☀️", start: "12:10", end: "15:33" },
  { id: "asr", en: "Asr", bn: "আসর", emoji: "🌤️", start: "15:33", end: "18:05" },
  { id: "maghrib", en: "Maghrib", bn: "মাগরিব", emoji: "🌇", start: "18:05", end: "19:20" },
  { id: "isha", en: "Isha", bn: "ইশা", emoji: "🌙", start: "19:20", end: "23:59" },
];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toBanglaNum(n: number): string {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => digits[parseInt(d)]);
}

function formatTimeLeft(mins: number, isBn: boolean): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (isBn) {
    return h > 0 ? `${toBanglaNum(h)} ঘন্টা ${toBanglaNum(m)} মিনিট বাকি` : `${toBanglaNum(m)} মিনিট বাকি`;
  }
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}

const PrayerTimeWidget = () => {
  const { language } = useI18n();
  const isBn = language === "bn";
  const [nowMins, setNowMins] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const n = new Date();
      setNowMins(n.getHours() * 60 + n.getMinutes());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Find current prayer
  let currentIdx = 0;
  for (let i = PRAYER_SCHEDULE.length - 1; i >= 0; i--) {
    if (nowMins >= timeToMinutes(PRAYER_SCHEDULE[i].start)) {
      currentIdx = i;
      break;
    }
  }
  const current = PRAYER_SCHEDULE[currentIdx];
  const startMins = timeToMinutes(current.start);
  const endMins = timeToMinutes(current.end);
  const totalDuration = endMins - startMins;
  const elapsed = nowMins - startMins;
  const remaining = Math.max(0, endMins - nowMins);
  const progressPct = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;

  const sunriseTime = "06:14";
  const sunsetTime = "18:05";

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Current prayer hero */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">{sunriseTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{sunsetTime}</span>
              <Sunset className="h-4 w-4 text-accent" />
            </div>
          </div>

          <div className="text-center mb-3">
            <span className="text-3xl mb-1 block">{current.emoji}</span>
            <p className="text-lg font-bold text-foreground">
              {isBn ? current.bn : current.en}
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-success">
                {isBn ? "চলমান" : "Active"}
              </span>
            </div>
          </div>

          <Progress value={progressPct} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{current.start}</span>
            <span className="font-semibold text-foreground">{formatTimeLeft(remaining, isBn)}</span>
            <span>{current.end}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrayerTimeWidget;
