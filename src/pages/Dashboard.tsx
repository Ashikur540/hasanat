import StatsBar from "@/components/dashboard/StatsBar";
import TodaysDeeds from "@/components/dashboard/TodaysDeeds";
import StreakCard from "@/components/dashboard/StreakCard";
import CityPreview from "@/components/dashboard/CityPreview";
import DateCalendarWidget from "@/components/dashboard/DateCalendarWidget";
import PrayerTimeWidget from "@/components/dashboard/PrayerTimeWidget";
import FarzPrayerChecklist from "@/components/dashboard/FarzPrayerChecklist";
import HadithWidget from "@/components/dashboard/HadithWidget";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const Dashboard = () => {
  const { t } = useI18n();

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="container mx-auto px-4 py-6 space-y-6">
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <p className="font-arabic text-lg text-primary mb-1">﷽</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("dashGreeting")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("dashDateStreak")}</p>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-auto gap-4">
        {/* Date Calendar - spans 1 col */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="lg:col-span-1">
          <DateCalendarWidget />
        </motion.div>

        {/* Prayer Time - spans 1 col, taller */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="lg:col-span-1 lg:row-span-2">
          <PrayerTimeWidget />
        </motion.div>

        {/* Farz Prayers - spans 2 cols */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="md:col-span-2 lg:col-span-2 lg:row-span-2">
          <FarzPrayerChecklist />
        </motion.div>

        {/* Hadith - spans 1 col */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="lg:col-span-1">
          <HadithWidget />
        </motion.div>

        {/* Stats Bar - full width */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="md:col-span-2 lg:col-span-4">
          <StatsBar />
        </motion.div>

        {/* Today's Deeds - spans 2 cols */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="md:col-span-2 lg:col-span-2 lg:row-span-2">
          <TodaysDeeds />
        </motion.div>

        {/* Streak Card - spans 1 col */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="lg:col-span-1">
          <StreakCard />
        </motion.div>

        {/* City Preview - spans 1 col */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="lg:col-span-1">
          <CityPreview />
        </motion.div>

        {/* Disclaimer - spans 2 cols */}
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="md:col-span-2 lg:col-span-2">
          <Card className="border-border bg-muted/30">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground italic leading-relaxed whitespace-pre-line">
                "{t("dashPointsDisclaimer")}"
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
