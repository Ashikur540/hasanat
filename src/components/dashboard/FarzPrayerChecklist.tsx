import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n } from "@/i18n/I18nProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

interface FarzPrayer {
  id: string;
  en: string;
  bn: string;
  emoji: string;
  time: string;
  points: number;
  completed: boolean;
}

const initialPrayers: FarzPrayer[] = [
  { id: "fajr", en: "Fajr", bn: "ফজর", emoji: "🌙", time: "04:59", points: 30, completed: false },
  { id: "dhuhr", en: "Dhuhr", bn: "যুহর", emoji: "☀️", time: "12:10", points: 30, completed: false },
  { id: "asr", en: "Asr", bn: "আসর", emoji: "🌤️", time: "15:33", points: 30, completed: false },
  { id: "maghrib", en: "Maghrib", bn: "মাগরিব", emoji: "🌇", time: "18:05", points: 30, completed: false },
  { id: "isha", en: "Isha", bn: "ইশা", emoji: "🌙", time: "19:20", points: 30, completed: false },
];

function toBanglaNum(n: number): string {
  const digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => digits[parseInt(d)]);
}

const FarzPrayerChecklist = () => {
  const { language } = useI18n();
  const isBn = language === "bn";
  const [prayers, setPrayers] = useState<FarzPrayer[]>(initialPrayers);

  const completed = prayers.filter((p) => p.completed).length;
  const totalPoints = prayers.filter((p) => p.completed).reduce((sum, p) => sum + p.points, 0);
  const progressPct = (completed / prayers.length) * 100;

  const toggle = (id: string) => {
    setPrayers((prev) => prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p)));
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            🕌 {isBn ? "ফরজ নামায সমূহ" : "Farz Prayers"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Progress value={progressPct} className="w-16 h-2" />
            <span className="text-xs font-bold text-muted-foreground">
              {isBn ? `${toBanglaNum(completed)}/${toBanglaNum(5)}` : `${completed}/5`}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-1.5">
        <AnimatePresence mode="popLayout">
          {prayers.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                p.completed
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
              }`}
              onClick={() => toggle(p.id)}
            >
              <Checkbox
                checked={p.completed}
                onCheckedChange={() => toggle(p.id)}
                className="h-5 w-5 rounded-full border-2"
              />
              <span className="text-lg shrink-0">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold transition-colors ${p.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {isBn ? p.bn : p.en}
                </p>
                <p className="text-xs text-muted-foreground">{p.time}</p>
              </div>
              <span className={`text-xs font-bold ${p.completed ? "text-primary" : "text-muted-foreground"}`}>
                +{isBn ? toBanglaNum(p.points) : p.points}
              </span>
              {p.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-primary"
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Total points earned */}
        {completed > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between pt-2 border-t border-border mt-2"
          >
            <span className="text-xs text-muted-foreground">
              {isBn ? "শহরে যোগ হচ্ছে" : "Contributing to city"}
            </span>
            <span className="text-sm font-bold text-primary">
              +{isBn ? toBanglaNum(totalPoints) : totalPoints} {isBn ? "পয়েন্ট" : "pts"}
            </span>
          </motion.div>
        )}

        {completed === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          >
            <p className="text-sm font-bold text-primary">
              🎉 {isBn ? "সব ফরজ নামায সম্পন্ন! মাশাআল্লাহ!" : "All Farz prayers complete! MashaAllah!"}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default FarzPrayerChecklist;
