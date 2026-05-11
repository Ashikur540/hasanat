import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp, stagger } from "../animations";
import HeroDashboardMockup from "./HeroDashboardMockup";
import { useAuth } from "@/features/auth";
import { useI18n } from "@/i18n/I18nProvider";

const AVATAR_INITIALS = [
  { initials: "A", bg: "bg-slate-500 dark:bg-slate-700" },
  { initials: "F", bg: "bg-primary/70" },
  { initials: "M", bg: "bg-accent/70" },
  { initials: "Z", bg: "bg-purple-500 dark:bg-purple-700" },
  { initials: "K", bg: "bg-rose-500 dark:bg-rose-700" },
];

const HeroSection = () => {
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden landing-hero-mesh">
      {/* Background circuit pattern */}
      <div className="absolute inset-0 bg-circuit-pattern pattern-fade-bottom pointer-events-none opacity-20 dark:opacity-40" />

      {/* Radial glow — opacity-only animation avoids expensive scale+blur repaints */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 dark:bg-emerald-custom/10 blur-3xl -z-10 pointer-events-none"
      />

      {/* Decorative Islamic star — top left */}
      <div className="absolute top-1/4 left-8 w-24 h-24 opacity-10 dark:opacity-20 pointer-events-none animate-float-slow">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path
            d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"
            stroke="currentColor"
            strokeWidth="1"
            className="text-primary dark:text-emerald-custom"
          />
        </svg>
      </div>
      {/* Decorative Islamic star — bottom right */}
      <div className="absolute bottom-1/4 right-12 w-36 h-36 opacity-[0.07] dark:opacity-10 pointer-events-none animate-float">
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <path
            d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z"
            stroke="currentColor"
            strokeWidth="0.8"
            className="text-primary dark:text-emerald-custom"
          />
          <path
            d="M15 15 L50 25 L85 15 L75 50 L85 85 L50 75 L15 85 L25 50 Z"
            stroke="currentColor"
            strokeWidth="0.6"
            className="text-primary dark:text-emerald-custom"
          />
        </svg>
      </div>
      {/* Pulsing orb */}
      <div className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-primary/10 dark:bg-emerald-custom/20 blur-xl animate-pulse-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 w-full" style={{ overflow: "visible" }}>
        {/* Left column */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-start space-y-6 md:space-y-8"
        >
          {/* Bismillah */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="font-arabic text-2xl md:text-3xl text-accent opacity-90"
            aria-label="Bismillah ir-Rahman ir-Rahim"
          >
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم
          </motion.p>

          {/* Main heading */}
          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-sans text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight"
          >
            <span className="text-foreground dark:text-white">{t("heroTitle")}</span>
            <br />
            <span className="text-primary dark:text-emerald-custom dark:drop-shadow-[0_0_15px_rgba(80,200,120,0.5)]">
              {t("heroTitleHighlight")}
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-xl"
          >
            {t("heroDesc")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col sm:flex-row gap-4 pt-2 w-full sm:w-auto"
          >
            <Button
              size="lg"
              className="rounded-full px-8 py-6 text-base font-semibold w-full sm:w-auto"
              asChild
            >
              <Link to={user ? "/dashboard" : "/auth"}>
                {user ? t("heroCTADashboard") : t("heroCTAPrimary")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-base w-full sm:w-auto dark:bg-white/5 dark:border-white/10 dark:text-white dark:hover:bg-white/10"
              asChild
            >
              <a href="#features">
                <PlayCircle className="mr-2 h-5 w-5" />
                {t("heroCTADemo")}
              </a>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-4 pt-4 border-t border-border dark:border-white/10 w-full"
          >
            <div className="flex -space-x-2.5">
              {AVATAR_INITIALS.map(({ initials, bg }) => (
                <div
                  key={initials}
                  className={`w-9 h-9 rounded-full border-2 border-background dark:border-[#040d09] ${bg} flex items-center justify-center text-xs font-bold text-white`}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              {t("heroSocialProofBefore")}{" "}
              <span className="text-foreground dark:text-white font-semibold">5,000+</span>{" "}
              {t("heroSocialProofAfter")}
            </p>
          </motion.div>
        </motion.div>

        {/* Right column — dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:block relative"
          style={{ overflow: "visible" }}
        >
          <HeroDashboardMockup />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
