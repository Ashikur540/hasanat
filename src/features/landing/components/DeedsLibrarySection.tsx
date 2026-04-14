import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Heart, Coins, Sun, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stagger } from "../animations";
import LandingDeedCard from "./LandingDeedCard";

const DEEDS = [
  {
    icon: BookOpen,
    iconColorClass: "text-blue-400",
    iconBgClass: "bg-blue-900/40 dark:bg-blue-900/50",
    difficulty: "Hard" as const,
    title: "Read Surah Al-Kahf",
    description: "Read the entire Surah Al-Kahf on Friday to gain a light between the two Fridays.",
    points: 30,
    hadithQuote:
      "Whoever reads Surah Al-Kahf on Friday will be illuminated with light. (Muslim)",
  },
  {
    icon: Heart,
    iconColorClass: "text-rose-400",
    iconBgClass: "bg-rose-900/40 dark:bg-rose-900/50",
    difficulty: "Medium" as const,
    title: "Forgive Someone",
    description:
      "Let go of a grudge and sincerely forgive someone who has wronged you for the sake of Allah.",
    points: 15,
    hadithQuote:
      "Allah will forgive the one who forgives others. Show mercy and you will be shown mercy. (Bukhari)",
  },
  {
    icon: Coins,
    iconColorClass: "text-amber-400",
    iconBgClass: "bg-amber-900/40 dark:bg-amber-900/50",
    difficulty: "Easy" as const,
    title: "Hidden Sadaqah",
    description:
      "Give charity secretly so that your left hand does not know what your right hand has given.",
    points: 5,
    hadithQuote:
      "The best charity is that given in secret to a person in need. (Al-Tabarani)",
  },
  {
    icon: Sun,
    iconColorClass: "text-emerald-400",
    iconBgClass: "bg-emerald-900/40 dark:bg-emerald-900/50",
    difficulty: "Exceptional" as const,
    title: "Fajr in Congregation",
    description: "Pray the Fajr prayer in congregation at the Masjid.",
    points: 100,
    hadithQuote:
      "Whoever prays Fajr in congregation, it is as if he prayed the whole night. (Muslim)",
  },
];

const DeedsLibrarySection = () => {
  return (
    <section id="library" aria-label="Deeds Library" className="py-24 relative z-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="max-w-2xl">
            {/* Label */}
            <div className="flex items-center gap-2 mb-4">
              <Library className="w-4 h-4 text-primary dark:text-emerald-custom" />
              <span className="text-sm font-bold tracking-widest text-primary dark:text-emerald-custom uppercase">
                Verified Deeds
              </span>
            </div>

            {/* Section title — shiny in dark mode */}
            <h2 className="text-4xl md:text-5xl font-bold text-foreground dark:text-white leading-tight">
              80+ Verified Deeds from Quran & Sunnah
            </h2>
            <p className="text-muted-foreground dark:text-gray-400 mt-4 text-base md:text-lg leading-relaxed">
              Never wonder what to do next. Access a curated library of Sunnah prayers, Adhkar,
              and Sadaqah, all backed by authentic references.
            </p>
          </div>

          <Button
            variant="outline"
            size="lg"
            asChild
            className="shrink-0 dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10 rounded-full"
          >
            <Link to="/deeds">View Full Library</Link>
          </Button>
        </div>

        {/* Deed cards grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {DEEDS.map((deed) => (
            <LandingDeedCard key={deed.title} {...deed} />
          ))}
        </motion.div>

        {/* Category note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-muted-foreground dark:text-gray-500 mt-10"
        >
          Deeds span 8 categories: Salah · Quran · Sadaqah · Dhikr · Character · Family · Fasting · Knowledge
        </motion.p>
      </div>
    </section>
  );
};

export default DeedsLibrarySection;
