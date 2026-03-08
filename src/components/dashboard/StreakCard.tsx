import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const weekDots = [true, true, true, true, true, true, false];
const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

const StreakCard = () => {
  const streakDays = 23;
  const bestStreak = 41;
  const freezeLeft = 1;
  const weekCompleted = weekDots.filter(Boolean).length;

  return (
    <Card className="border-0 overflow-hidden relative">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 dark:from-emerald-800 dark:via-emerald-700 dark:to-teal-600" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      
      <CardContent className="p-6 relative z-10 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Current Streak</p>
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🔥
          </motion.span>
        </div>

        {/* Big number */}
        <div className="flex items-baseline gap-2 mb-3">
          <motion.span
            className="text-5xl font-extrabold tracking-tight"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {streakDays}
          </motion.span>
          <span className="text-lg font-medium opacity-80">days</span>
        </div>

        {/* Sub stats */}
        <p className="text-sm opacity-75 mb-4">
          Best: {bestStreak} days · Freeze: {freezeLeft} left
        </p>

        {/* Week progress bar */}
        <div className="flex items-center gap-1.5 mb-1">
          {weekDots.map((done, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring" }}
              className={`flex-1 h-2.5 rounded-full transition-colors ${
                done ? "bg-white" : "bg-white/25"
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-right opacity-60 mt-1">{weekCompleted}/7 this week</p>
      </CardContent>
    </Card>
  );
};

export default StreakCard;
