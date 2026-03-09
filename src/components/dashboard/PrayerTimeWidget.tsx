import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/i18n/I18nProvider";
import { Sunrise, Sunset, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

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
  const { schedule, sunrise, sunset, loading } = usePrayerTimes();
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

  if (loading) {
    return (
      <Card className="border-border bg-card overflow-hidden h-[180px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  // Find current prayer
  let currentIdx = 0;
  for (let i = schedule.length - 1; i >= 0; i--) {
    if (nowMins >= timeToMinutes(schedule[i].start)) {
      currentIdx = i;
      break;
    }
  }
  const current = schedule[currentIdx];
  const startMins = timeToMinutes(current.start);
  const endMins = timeToMinutes(current.end);
  const totalDuration = endMins - startMins;
  const elapsed = nowMins - startMins;
  const remaining = Math.max(0, endMins - nowMins);
  const progressPct = totalDuration > 0 ? Math.min(100, (elapsed / totalDuration) * 100) : 0;

  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Current prayer hero */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-accent" />
              <span className="text-xs text-muted-foreground">{sunrise}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{sunset}</span>
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