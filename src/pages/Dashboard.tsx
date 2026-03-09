import StatsBar from "@/components/dashboard/StatsBar";
import TodaysDeeds from "@/components/dashboard/TodaysDeeds";
import StreakCard from "@/components/dashboard/StreakCard";
import CityPreview from "@/components/dashboard/CityPreview";
import DateCalendarWidget from "@/components/dashboard/DateCalendarWidget";
import PrayerTimeWidget from "@/components/dashboard/PrayerTimeWidget";
import FarzPrayerChecklist from "@/components/dashboard/FarzPrayerChecklist";
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

      {/* 3 Top Widgets */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <DateCalendarWidget />
        </motion.div>
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <PrayerTimeWidget />
        </motion.div>
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="md:col-span-2 lg:col-span-1">
          <FarzPrayerChecklist />
        </motion.div>
      </div>

      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <StatsBar />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="lg:col-span-2">
          <TodaysDeeds />
        </motion.div>
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-4">
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}><StreakCard /></motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}><CityPreview /></motion.div>
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <Card className="border-border bg-muted/30">
              <CardContent className="p-5 text-center">
                <p className="text-sm text-muted-foreground italic leading-relaxed whitespace-pre-line">
                  "{t("dashPointsDisclaimer")}"
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
