import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { useStreak } from "./hooks/useStreak";
import { useWeekGraph } from "./hooks/useWeekGraph";
import { format } from "date-fns";

const StreakCard = () => {
  const { t } = useI18n();
  const { currentStreak, longestStreak, lastStreakDate, loading: streakLoading } = useStreak();
  const { data: weekData, loading: weekLoading } = useWeekGraph();

  const loading = streakLoading || weekLoading;
  const today = format(new Date(), "yyyy-MM-dd");

  // Build 7-day dot array from weekData
  const weekDots = weekData.map((d) => ({
    date: d.date,
    active: d.count > 0,
    isToday: d.date === today,
  }));

  const weekCompleted = weekDots.filter((d) => d.active).length;

  if (loading) {
    return (
      <Card className="border-0 overflow-hidden relative h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 dark:from-emerald-800 dark:via-emerald-700 dark:to-teal-600" />
        <CardContent className="p-6 relative z-10">
          <Skeleton className="h-4 w-24 bg-white/20 mb-3" />
          <Skeleton className="h-12 w-16 bg-white/20 mb-3" />
          <Skeleton className="h-3 w-48 bg-white/20 mb-4" />
          <div className="flex gap-1.5">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="flex-1 h-2.5 rounded-full bg-white/20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 overflow-hidden relative h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 dark:from-emerald-800 dark:via-emerald-700 dark:to-teal-600" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      <CardContent className="p-6 relative z-10 text-white">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            {t("streakCurrent")}
          </p>
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🔥
          </motion.span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <motion.span
            className="text-5xl font-extrabold tracking-tight"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {currentStreak}
          </motion.span>
          <span className="text-lg font-medium opacity-80">{t("commonDays")}</span>
        </div>

        <p className="text-sm opacity-75 mb-4">
          {t("streakBest")}: {longestStreak} {t("commonDays")}
          {lastStreakDate && (
            <span className="ml-2 text-xs opacity-60">
              · Last: {lastStreakDate}
            </span>
          )}
        </p>

        <div className="flex items-center gap-1.5 mb-1">
          {weekDots.length > 0
            ? weekDots.map((dot, i) => (
                <motion.div
                  key={dot.date}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05, type: "spring" }}
                  className={`flex-1 h-2.5 rounded-full transition-colors ${
                    dot.active
                      ? "bg-white"
                      : dot.isToday
                        ? "bg-white/50 ring-1 ring-white/70"
                        : "bg-white/25"
                  }`}
                />
              ))
            : [...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2.5 rounded-full bg-white/25"
                />
              ))}
        </div>
        <p className="text-[11px] text-right opacity-60 mt-1">
          {weekCompleted}/7 {t("streakThisWeek")}
        </p>
      </CardContent>
    </Card>
  );
};

export default StreakCard;
