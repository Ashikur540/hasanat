import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Flame, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "../animations";

const LEADERBOARD = [
  { rank: 1, name: "Ashikur Rahman", location: "Dhaka, BD", streak: 45, points: 2450, isAnon: false },
  { rank: 2, name: "Anonymous Believer", location: "—", streak: 38, points: 2180, isAnon: true },
  { rank: 3, name: "Fatima Al-Zahra", location: "Cairo, EG", streak: 30, points: 1960, isAnon: false },
  { rank: 4, name: "Muhammad Ibrahim", location: "London, UK", streak: 25, points: 1740, isAnon: false },
  { rank: 5, name: "Anonymous Believer", location: "—", streak: 22, points: 1520, isAnon: true },
];

const RANK_STYLES: Record<number, { rowBg: string; badge: string }> = {
  1: { rowBg: "bg-amber-50 dark:bg-gold/[0.08]", badge: "🥇" },
  2: { rowBg: "hover:bg-secondary/30 dark:hover:bg-white/[0.02]", badge: "🥈" },
  3: { rowBg: "hover:bg-secondary/30 dark:hover:bg-white/[0.02]", badge: "🥉" },
  4: { rowBg: "hover:bg-secondary/30 dark:hover:bg-white/[0.02]", badge: "" },
  5: { rowBg: "hover:bg-secondary/30 dark:hover:bg-white/[0.02]", badge: "" },
};

const LeaderboardSection = () => {
  return (
    <section id="leaderboard" aria-label="Leaderboard" className="py-24 relative z-20">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="inline-flex w-16 h-16 rounded-2xl bg-amber-100 dark:bg-gold-custom/10 border border-amber-200 dark:border-gold-custom/20 items-center justify-center mb-5"
          >
            <Trophy className="w-7 h-7 text-amber-600 dark:text-gold-custom" />
          </motion.div>

          {/* Shiny title */}
          <motion.h2
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground dark:text-white mb-4"
          >
            Compete in{" "}
            <span className="text-primary dark:text-emerald-custom dark:drop-shadow-[0_0_10px_rgba(80,200,120,0.4)]">
              Goodness
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            className="text-muted-foreground dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto"
          >
            <em className="not-italic font-medium text-foreground dark:text-white">
              "So race to all that is good."
            </em>{" "}
            — Quran 2:148
            <br />
            Join the global ranking or stay anonymous. Your choice, always.
          </motion.p>
        </motion.div>

        {/* Leaderboard table card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border border-border dark:border-white/[0.08] rounded-2xl overflow-hidden shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]"
        >
          {/* Table header */}
          <div className="px-4 sm:px-6 py-4 border-b border-border dark:border-white/[0.08] flex justify-between items-center bg-secondary/20 dark:bg-black/30">
            <h3 className="font-semibold text-foreground dark:text-white text-sm">
              Global Rankings — This Week
            </h3>
            <span className="text-xs text-muted-foreground dark:text-gray-400 bg-secondary dark:bg-white/[0.08] px-2.5 py-1 rounded-full">
              Opt-in only
            </span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[2rem_1fr_4.5rem_4.5rem] sm:grid-cols-[2.5rem_1fr_5rem_5rem] gap-2 sm:gap-4 px-4 sm:px-6 py-2 border-b border-border dark:border-white/[0.05]">
            <span className="text-xs font-medium text-muted-foreground dark:text-gray-500">#</span>
            <span className="text-xs font-medium text-muted-foreground dark:text-gray-500">Believer</span>
            <span className="text-xs font-medium text-muted-foreground dark:text-gray-500 text-right">Streak</span>
            <span className="text-xs font-medium text-muted-foreground dark:text-gray-500 text-right">Pts</span>
          </div>

          {/* Rows */}
          {LEADERBOARD.map((entry) => {
            const style = RANK_STYLES[entry.rank];
            return (
              <div
                key={entry.rank}
                className={`grid grid-cols-[2rem_1fr_4.5rem_4.5rem] sm:grid-cols-[2.5rem_1fr_5rem_5rem] gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-border dark:border-white/[0.05] last:border-b-0 transition-colors ${style.rowBg}`}
              >
                <div className="flex items-center">
                  {style.badge ? (
                    <span className="text-base leading-none">{style.badge}</span>
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground dark:text-gray-500">
                      {entry.rank}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      entry.isAnon
                        ? "bg-secondary dark:bg-white/[0.08] text-muted-foreground dark:text-gray-400"
                        : "bg-primary/10 dark:bg-emerald-custom/10 text-primary dark:text-emerald-custom"
                    }`}
                  >
                    {entry.isAnon ? "?" : entry.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        entry.isAnon
                          ? "text-muted-foreground dark:text-gray-500 italic"
                          : "text-foreground dark:text-white"
                      }`}
                    >
                      {entry.name}
                    </p>
                    {!entry.isAnon && (
                      <p className="text-xs text-muted-foreground dark:text-gray-500 hidden sm:block">
                        {entry.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-gold shrink-0" />
                  <span className="text-sm font-semibold text-foreground dark:text-white">
                    {entry.streak}d
                  </span>
                </div>

                <div className="flex items-center justify-end">
                  <span
                    className={`text-sm font-bold font-mono ${
                      entry.rank === 1
                        ? "text-amber-600 dark:text-gold-custom"
                        : "text-primary dark:text-emerald-custom"
                    }`}
                  >
                    {entry.points.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Privacy note */}
        <p className="text-center text-sm text-muted-foreground dark:text-gray-400 mt-6 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Leaderboard is always opt-in. You are private by default.
        </p>

        {/* Required points disclaimer */}
        <p className="text-center text-xs text-muted-foreground/60 dark:text-gray-600 mt-3 italic max-w-md mx-auto">
          Points are for your motivation only. The true reward of every deed is with Allah alone.
        </p>

        {/* CTA */}
        <div className="text-center mt-8">
          <Button
            variant="outline"
            asChild
            className="dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 rounded-full"
          >
            <Link to="/leaderboard">
              View Full Rankings <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardSection;
