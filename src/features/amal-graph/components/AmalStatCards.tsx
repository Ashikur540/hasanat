import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n/I18nProvider";

interface Props {
  totalDeeds: number;
  activeDays: number;
  consistency: number;
  topCategory: string;
  longestStreak: number;
  totalPoints: number;
  loading: boolean;
  staticLoading: boolean;
}

const AmalStatCards = ({
  totalDeeds,
  activeDays,
  consistency,
  topCategory,
  longestStreak,
  totalPoints,
  loading,
  staticLoading,
}: Props) => {
  const { t } = useI18n();

  const dynamicCards = [
    {
      emoji: "📊",
      label: t("amalTotalDeeds"),
      value: String(totalDeeds),
      isLoading: loading,
    },
    {
      emoji: "📅",
      label: t("amalActiveDays"),
      value: String(activeDays),
      isLoading: loading,
    },
    {
      emoji: "📈",
      label: t("amalConsistency"),
      value: `${consistency}%`,
      isLoading: loading,
    },
    {
      emoji: "🕌",
      label: t("amalTopCategory"),
      value: topCategory,
      isLoading: loading,
    },
  ];

  const staticCards = [
    {
      emoji: "🔥",
      label: t("amalBestStreak"),
      value: String(longestStreak),
      isLoading: staticLoading,
      allTime: true,
    },
    {
      emoji: "⭐",
      label: t("amalPointsTotal"),
      value: totalPoints.toLocaleString(),
      isLoading: staticLoading,
      allTime: true,
    },
  ];

  const allCards = [...dynamicCards, ...staticCards];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {allCards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
        >
          <Card className="border-border bg-card hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 text-center">
              <span className="text-2xl">{card.emoji}</span>

              {card.isLoading ? (
                <Skeleton className="h-7 w-14 mx-auto mt-1 rounded-md" />
              ) : (
                <p className="text-xl font-bold text-foreground mt-1 truncate">
                  {card.value}
                </p>
              )}

              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                {card.label}
              </p>

              {"allTime" in card && (
                <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                  all time
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default AmalStatCards;
