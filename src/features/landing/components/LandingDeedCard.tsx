import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeUp } from "../animations";

interface LandingDeedCardProps {
  icon: LucideIcon;
  iconColorClass: string;
  iconBgClass: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Exceptional";
  title: string;
  description: string;
  points: number;
  hadithQuote?: string;
}

const DIFFICULTY_BADGE: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-white/10 dark:text-gray-300",
  Medium: "bg-blue-100 text-blue-700 dark:bg-white/10 dark:text-gray-300",
  Hard: "bg-amber-100 text-amber-700 dark:bg-white/10 dark:text-gray-300",
  Exceptional: "bg-purple-100 text-purple-700 dark:bg-white/10 dark:text-gray-300",
};

const LandingDeedCard = ({
  icon: Icon,
  iconColorClass,
  iconBgClass,
  difficulty,
  title,
  description,
  points,
  hadithQuote,
}: LandingDeedCardProps) => {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5 }}
      // landing-deed-card class triggers the dark-mode glass CSS from index.css
      className="landing-deed-card group bg-card dark:bg-transparent border border-border rounded-2xl p-6 flex flex-col gap-4 cursor-default transition-colors duration-300 hover:border-primary/30"
    >
      {/* Icon + difficulty */}
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-2xl ${iconBgClass} flex items-center justify-center border border-white/10`}
        >
          <Icon className={`w-5 h-5 ${iconColorClass}`} />
        </div>
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${DIFFICULTY_BADGE[difficulty]}`}
        >
          {difficulty}
        </span>
      </div>

      {/* Title + description */}
      <div className="flex-1">
        <h3 className="font-bold text-foreground dark:text-white text-lg mb-2 leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground dark:text-gray-400 leading-relaxed">{description}</p>
      </div>

      {/* Hadith quote */}
      {hadithQuote && (
        <p className="text-xs text-muted-foreground/70 dark:text-gray-500 italic border-l-2 border-primary/30 dark:border-emerald-custom/30 pl-3 leading-relaxed">
          {hadithQuote}
        </p>
      )}

      {/* Points */}
      <div className="flex items-center justify-between pt-3 border-t border-border dark:border-white/[0.06]">
        <span className="text-xs text-muted-foreground dark:text-gray-500">Base reward</span>
        <span className="text-lg font-bold font-mono text-primary dark:text-emerald-custom dark:drop-shadow-[0_0_8px_rgba(80,200,120,0.5)]">
          +{points} pts
        </span>
      </div>
    </motion.div>
  );
};

export default LandingDeedCard;
