import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Flame, TrendingUp, ChevronUp, ChevronDown, Minus } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

type TimeFilter = "week" | "month" | "allTime";

interface LeaderEntry {
  rank: number; name: string; initials: string; points: number; streak: number; deeds: number; trend: "up" | "down" | "same"; badge?: string;
}

const mockData: Record<TimeFilter, LeaderEntry[]> = {
  week: [
    { rank: 1, name: "Fatima Al-Zahra", initials: "FA", points: 485, streak: 45, deeds: 38, trend: "up", badge: "🏅" },
    { rank: 2, name: "Omar Ibn Said", initials: "OS", points: 420, streak: 32, deeds: 34, trend: "up" },
    { rank: 3, name: "Aisha Rahman", initials: "AR", points: 395, streak: 28, deeds: 31, trend: "same" },
    { rank: 4, name: "You (Ahmed)", initials: "AH", points: 350, streak: 12, deeds: 27, trend: "up", badge: "⭐" },
    { rank: 5, name: "Yusuf Ali", initials: "YA", points: 310, streak: 19, deeds: 25, trend: "down" },
    { rank: 6, name: "Khadijah Bint", initials: "KB", points: 285, streak: 15, deeds: 22, trend: "up" },
    { rank: 7, name: "Ibrahim Hassan", initials: "IH", points: 260, streak: 10, deeds: 20, trend: "same" },
    { rank: 8, name: "Maryam Noor", initials: "MN", points: 240, streak: 8, deeds: 19, trend: "down" },
    { rank: 9, name: "Bilal Kareem", initials: "BK", points: 215, streak: 22, deeds: 17, trend: "up" },
    { rank: 10, name: "Zaynab Hussain", initials: "ZH", points: 190, streak: 6, deeds: 15, trend: "same" },
  ],
  month: [
    { rank: 1, name: "Omar Ibn Said", initials: "OS", points: 1820, streak: 32, deeds: 142, trend: "up", badge: "🏅" },
    { rank: 2, name: "Fatima Al-Zahra", initials: "FA", points: 1750, streak: 45, deeds: 135, trend: "same" },
    { rank: 3, name: "You (Ahmed)", initials: "AH", points: 1480, streak: 12, deeds: 112, trend: "up", badge: "⭐" },
    { rank: 4, name: "Aisha Rahman", initials: "AR", points: 1390, streak: 28, deeds: 105, trend: "down" },
    { rank: 5, name: "Bilal Kareem", initials: "BK", points: 1250, streak: 22, deeds: 98, trend: "up" },
    { rank: 6, name: "Khadijah Bint", initials: "KB", points: 1180, streak: 15, deeds: 91, trend: "same" },
    { rank: 7, name: "Yusuf Ali", initials: "YA", points: 1100, streak: 19, deeds: 85, trend: "down" },
    { rank: 8, name: "Ibrahim Hassan", initials: "IH", points: 1020, streak: 10, deeds: 79, trend: "up" },
    { rank: 9, name: "Maryam Noor", initials: "MN", points: 950, streak: 8, deeds: 72, trend: "same" },
    { rank: 10, name: "Zaynab Hussain", initials: "ZH", points: 880, streak: 6, deeds: 66, trend: "down" },
  ],
  allTime: [
    { rank: 1, name: "Fatima Al-Zahra", initials: "FA", points: 12450, streak: 45, deeds: 890, trend: "same", badge: "🏅" },
    { rank: 2, name: "Omar Ibn Said", initials: "OS", points: 11200, streak: 32, deeds: 810, trend: "up" },
    { rank: 3, name: "Bilal Kareem", initials: "BK", points: 9800, streak: 22, deeds: 720, trend: "up" },
    { rank: 4, name: "Aisha Rahman", initials: "AR", points: 8900, streak: 28, deeds: 650, trend: "same" },
    { rank: 5, name: "Khadijah Bint", initials: "KB", points: 7600, streak: 15, deeds: 560, trend: "up" },
    { rank: 6, name: "You (Ahmed)", initials: "AH", points: 6200, streak: 12, deeds: 480, trend: "up", badge: "⭐" },
    { rank: 7, name: "Yusuf Ali", initials: "YA", points: 5500, streak: 19, deeds: 410, trend: "down" },
    { rank: 8, name: "Ibrahim Hassan", initials: "IH", points: 4800, streak: 10, deeds: 350, trend: "same" },
    { rank: 9, name: "Maryam Noor", initials: "MN", points: 4200, streak: 8, deeds: 300, trend: "down" },
    { rank: 10, name: "Zaynab Hussain", initials: "ZH", points: 3600, streak: 6, deeds: 260, trend: "same" },
  ],
};

const podiumColors = [
  "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30",
  "from-gray-400/15 to-gray-500/5 border-gray-400/25",
  "from-amber-700/15 to-amber-800/5 border-amber-700/20",
];
const podiumIcons = [Crown, Medal, Medal];

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <ChevronUp className="h-3.5 w-3.5 text-green-500" />;
  if (trend === "down") return <ChevronDown className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

const Leaderboard = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const { t } = useI18n();
  const data = mockData[timeFilter];
  const top3 = data.slice(0, 3);
  const userEntry = data.find(e => e.name.includes("You"));

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("leaderboardTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("leaderboardSub")}</p>
      </motion.div>

      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex justify-center">
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
          <TabsList>
            <TabsTrigger value="week">{t("leaderboardThisWeek")}</TabsTrigger>
            <TabsTrigger value="month">{t("leaderboardThisMonth")}</TabsTrigger>
            <TabsTrigger value="allTime">{t("leaderboardAllTime")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
        <div className="flex items-end justify-center gap-3 pt-4 pb-2">
          {[1, 0, 2].map((idx) => {
            const entry = top3[idx];
            if (!entry) return null;
            const isFirst = idx === 0;
            return (
              <motion.div key={entry.rank} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx === 0 ? 0.2 : idx === 1 ? 0.1 : 0.3 }} className="flex flex-col items-center">
                <div className="relative mb-2">
                  <Avatar className={`${isFirst ? "h-16 w-16" : "h-12 w-12"} border-2 ${isFirst ? "border-yellow-500" : idx === 1 ? "border-gray-400" : "border-amber-700"}`}>
                    <AvatarFallback className={`text-sm font-bold ${isFirst ? "bg-yellow-500/20 text-yellow-700" : "bg-muted text-muted-foreground"}`}>{entry.initials}</AvatarFallback>
                  </Avatar>
                  {isFirst && (
                    <motion.div className="absolute -top-3 left-1/2 -translate-x-1/2" animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500/30" />
                    </motion.div>
                  )}
                </div>
                <p className={`font-semibold text-foreground ${isFirst ? "text-sm" : "text-xs"}`}>{entry.name.split(" ")[0]}</p>
                <p className="text-primary font-bold text-sm">{entry.points.toLocaleString()}</p>
                <div className={`mt-2 w-20 ${isFirst ? "h-24" : idx === 1 ? "h-16" : "h-12"} rounded-t-lg bg-gradient-to-b ${podiumColors[idx]} border border-b-0 flex items-center justify-center`}>
                  <span className="text-2xl font-black text-foreground/60">#{entry.rank}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {userEntry && (
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 flex items-center gap-4">
              <span className="text-lg font-black text-primary w-8 text-center">#{userEntry.rank}</span>
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarFallback className="bg-primary/15 text-primary text-sm font-bold">{userEntry.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">You (Ahmed) {userEntry.badge}</p>
                <div className="flex gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-accent" />{userEntry.streak}d {t("leaderboardStreak")}</span>
                  <span>{userEntry.deeds} {t("leaderboardDeeds")}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{userEntry.points.toLocaleString()} {t("leaderboardPts")}</p>
                <TrendIcon trend={userEntry.trend} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> {t("leaderboardFullRankings")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pb-3">
            {data.map((entry, i) => {
              const isUser = entry.name.includes("You");
              return (
                <motion.div key={entry.rank} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${isUser ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}`}>
                  <span className={`w-7 text-center font-bold text-sm ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : entry.rank === 3 ? "text-amber-700" : "text-muted-foreground"}`}>
                    {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={`text-[11px] font-semibold ${isUser ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{entry.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isUser ? "text-primary" : "text-foreground"}`}>{entry.name} {entry.badge || ""}</p>
                    <div className="flex gap-2 text-[11px] text-muted-foreground">
                      <span>{entry.deeds} {t("leaderboardDeeds")}</span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5"><Flame className="h-2.5 w-2.5 text-accent" />{entry.streak}d</span>
                    </div>
                  </div>
                  <TrendIcon trend={entry.trend} />
                  <span className="text-sm font-semibold text-foreground w-16 text-right">{entry.points.toLocaleString()}</span>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-foreground italic leading-relaxed">"{t("leaderboardQuote")}"</p>
            <p className="text-xs text-muted-foreground mt-2">{t("leaderboardQuoteRef")}</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;
