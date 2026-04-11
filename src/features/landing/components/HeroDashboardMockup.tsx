import { motion } from "framer-motion";
import { Heart, BookOpen, Coins, Activity } from "lucide-react";

const MINI_HEATMAP: number[] = [
  0, 1, 2, 3, 4, 2, 1, 3, 4, 3,
  2, 4, 3, 4, 4, 3, 2, 4, 4, 4,
  3, 4, 4, 3, 4, 4, 2, 3, 4, 4,
];

const LEVEL_CLASSES: Record<number, string> = {
  0: "bg-heatmap-0",
  1: "bg-heatmap-1",
  2: "bg-heatmap-2",
  3: "bg-heatmap-3",
  4: "bg-heatmap-4 dark:shadow-[0_0_5px_rgba(80,200,120,0.5)]",
};

const DEEDS = [
  {
    label: "Fajr on Time",
    points: 20,
    iconBg: "bg-emerald-900/60",
    icon: <span className="text-base">☀️</span>,
  },
  {
    label: "Read Quran",
    points: 15,
    iconBg: "bg-blue-900/60",
    icon: <span className="text-base">📖</span>,
  },
];

const HeroDashboardMockup = () => {
  return (
    // Outer wrapper — relative so floating elements can overflow
    <div className="relative w-full">
      {/* ── Floating heart card ── top-right, outside the card */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="hero-float-icon absolute -top-6 -right-4 z-30 w-14 h-14 rounded-2xl bg-white/18 dark:bg-white/12 border border-white/35 dark:border-white/25 backdrop-blur-md flex items-center justify-center shadow-2xl"
      >
        <Heart className="w-6 h-6 text-rose-400" fill="currentColor" />
      </motion.div>

      {/* ── Floating book icon ── left side, mid-height */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="hero-float-icon hero-float-icon-delay-1 absolute left-0 top-[42%] -translate-x-1/2 z-30 w-12 h-12 rounded-2xl bg-white/18 dark:bg-white/12 border border-white/35 dark:border-white/25 backdrop-blur-md flex items-center justify-center shadow-2xl"
      >
        <BookOpen className="w-5 h-5 text-blue-400" />
      </motion.div>

      {/* ── Floating coins badge ── bottom-right */}
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="hero-float-icon hero-float-icon-delay-2 absolute -bottom-4 right-6 z-30 w-12 h-12 rounded-full bg-white/18 dark:bg-white/12 border border-white/35 dark:border-white/25 backdrop-blur-md flex items-center justify-center shadow-2xl"
      >
        <Coins className="w-5 h-5 text-amber-400" />
      </motion.div>

      {/* ── Main dashboard card ── */}
      <div
        style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
        className="ml-10 mr-2"
      >
        <div
          className="bg-white/80 dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-border dark:border-white/10 overflow-hidden shadow-[-20px_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[-20px_20px_60px_rgba(0,0,0,0.6)]"
          style={{ transform: "rotateX(8deg) rotateY(-8deg) rotateZ(2deg)" }}
        >
          {/* Emerald glow orb — dark mode only */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 opacity-0 dark:opacity-100 bg-emerald-custom/20 rounded-full blur-[60px] transition-opacity" />
          </div>

          <div className="relative z-10 p-5 space-y-4">
            {/* Profile row */}
            <div className="flex items-start justify-between pb-4 border-b border-border dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-emerald-custom/20 border border-primary/20 dark:border-emerald-custom/30 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary dark:text-emerald-custom text-sm">AR</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground dark:text-white text-sm leading-tight">
                    Ashikur Rahman
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400 flex items-center gap-1 mt-0.5">
                    @ashikur • 15 Day Streak 🔥
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-[10px] text-muted-foreground dark:text-gray-400 leading-tight">
                  Total Points
                </p>
                <p className="font-bold text-accent dark:text-gold-custom text-xl leading-tight">
                  2,450
                </p>
              </div>
            </div>

            {/* Amal Graph mini */}
            <div className="pb-4 border-b border-border dark:border-white/[0.08]">
              <p className="text-xs font-medium text-muted-foreground dark:text-gray-300 flex items-center gap-1.5 mb-2.5">
                <Activity className="w-3.5 h-3.5 text-primary dark:text-emerald-custom" />
                Amal Graph
              </p>
              <div className="flex flex-wrap gap-1">
                {MINI_HEATMAP.map((level, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-[3px] ${LEVEL_CLASSES[level]}`}
                  />
                ))}
              </div>
            </div>

            {/* Deed rows */}
            <div className="space-y-2.5">
              {DEEDS.map((deed) => (
                <div
                  key={deed.label}
                  className="flex items-center justify-between bg-secondary/40 dark:bg-black/40 rounded-xl px-3 py-3 border border-border dark:border-white/[0.05]"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full ${deed.iconBg} flex items-center justify-center shrink-0`}
                    >
                      {deed.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground dark:text-white">
                      {deed.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono text-primary dark:text-emerald-custom">
                    +{deed.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroDashboardMockup;
