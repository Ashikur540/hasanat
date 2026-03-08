import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
  Flame, Trophy, BookOpen, Heart, Star, Calendar,
  MapPin, Edit3, Share2, Eye, EyeOff, TrendingUp,
} from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const user = {
  name: "Ahmed Al-Rashid",
  initials: "AR",
  bio: "Striving for consistency in deen. One deed at a time. 🌿",
  location: "Riyadh, SA",
  joined: "Jan 2025",
  isPublic: true,
};

const stats = {
  totalDeeds: 512,
  totalPoints: 6200,
  currentStreak: 12,
  longestStreak: 28,
  rank: 4,
  level: "Al-Madinah",
  categoryCounts: {
    Salah: { count: 156, emoji: "🕌", color: "bg-primary/15 text-primary" },
    Quran: { count: 89, emoji: "📖", color: "bg-green-500/15 text-green-600" },
    Sadaqah: { count: 45, emoji: "💝", color: "bg-pink-500/15 text-pink-600" },
    Dhikr: { count: 120, emoji: "📿", color: "bg-blue-500/15 text-blue-600" },
    Character: { count: 34, emoji: "😇", color: "bg-purple-500/15 text-purple-600" },
    Family: { count: 28, emoji: "👨‍👩‍👧", color: "bg-orange-500/15 text-orange-600" },
    Fasting: { count: 18, emoji: "🌙", color: "bg-indigo-500/15 text-indigo-600" },
    Knowledge: { count: 22, emoji: "📚", color: "bg-yellow-600/15 text-yellow-700" },
  } as Record<string, { count: number; emoji: string; color: string }>,
};

const badges = [
  { name: "First Light", emoji: "🌅", desc: "Complete your first deed", earned: true },
  { name: "Week Warrior", emoji: "⚔️", desc: "7-day streak", earned: true },
  { name: "Quran Companion", emoji: "📖", desc: "Read Quran 30 days", earned: true },
  { name: "Generous Soul", emoji: "💎", desc: "50 Sadaqah deeds", earned: false },
  { name: "Night Owl", emoji: "🦉", desc: "20 Tahajjud prayers", earned: false },
  { name: "Community Builder", emoji: "🏗️", desc: "Join 3 circles", earned: true },
  { name: "Ramadan Champion", emoji: "🌙", desc: "Complete Ramadan challenge", earned: false },
  { name: "Century Club", emoji: "💯", desc: "100-day streak", earned: false },
];

// Mini heatmap: 7 weeks of daily activity
const heatmapWeeks = 7;
const heatmapDays = heatmapWeeks * 7;
const activityData = Array.from({ length: heatmapDays }, (_, i) => {
  if (i > heatmapDays - 5) return 0; // last few days less
  const seed = (i * 31 + 7) % 100;
  if (seed < 15) return 0;
  if (seed < 40) return 1;
  if (seed < 70) return 2;
  if (seed < 90) return 3;
  return 4;
});

const heatmapColors = [
  "bg-muted",
  "bg-primary/20",
  "bg-primary/40",
  "bg-primary/60",
  "bg-primary",
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const maxCat = Math.max(...Object.values(stats.categoryCounts).map(c => c.count));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="container mx-auto px-4 py-6 space-y-6 max-w-2xl"
    >
      {/* Profile header */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card overflow-hidden">
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/15" />
          <CardContent className="pt-0 pb-5 px-5 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
                <AvatarFallback className="bg-primary/15 text-primary text-xl font-bold">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 sm:pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
                  <Badge variant="outline" className="text-primary text-[10px]">{stats.level}</Badge>
                  {user.isPublic ? (
                    <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{user.bio}</p>
                <div className="flex gap-3 text-xs text-muted-foreground mt-1.5">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{user.location}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Joined {user.joined}</span>
                </div>
              </div>
              <div className="flex gap-2 sm:pb-1">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"><Edit3 className="h-3.5 w-3.5" /> Edit</Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs"><Share2 className="h-3.5 w-3.5" /> Share</Button>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3 mt-5">
              {[
                { label: "Total Deeds", value: stats.totalDeeds, icon: Star, color: "text-primary" },
                { label: "Points", value: stats.totalPoints.toLocaleString(), icon: Trophy, color: "text-accent" },
                { label: "Streak", value: `${stats.currentStreak}d`, icon: Flame, color: "text-orange-500" },
                { label: "Rank", value: `#${stats.rank}`, icon: TrendingUp, color: "text-primary" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center p-2.5 rounded-lg bg-muted/50">
                  <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Category breakdown */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4" /> Deed Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats.categoryCounts).map(([cat, data]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-lg w-7 text-center">{data.emoji}</span>
                    <span className="text-sm font-medium text-foreground w-20">{cat}</span>
                    <div className="flex-1">
                      <Progress value={(data.count / maxCat) * 100} className="h-2" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{data.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Streaks */}
            <Card className="border-border bg-card">
              <CardContent className="p-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-accent/10">
                    <Flame className="h-6 w-6 mx-auto text-accent mb-1" />
                    <p className="text-2xl font-bold text-foreground">{stats.currentStreak}</p>
                    <p className="text-xs text-muted-foreground">Current Streak</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <Trophy className="h-6 w-6 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold text-foreground">{stats.longestStreak}</p>
                    <p className="text-xs text-muted-foreground">Longest Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges" className="mt-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {badges.filter(b => b.earned).length}/{badges.length} Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {badges.map((badge) => (
                    <motion.div
                      key={badge.name}
                      whileHover={{ scale: 1.05 }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-colors ${
                        badge.earned
                          ? "border-primary/30 bg-primary/5"
                          : "border-border bg-muted/30 opacity-50"
                      }`}
                    >
                      <span className={`text-2xl ${!badge.earned && "grayscale"}`}>{badge.emoji}</span>
                      <p className="text-[11px] font-semibold text-foreground text-center leading-tight">{badge.name}</p>
                      <p className="text-[9px] text-muted-foreground text-center">{badge.desc}</p>
                      {badge.earned && (
                        <Badge variant="outline" className="text-[8px] border-primary/40 text-primary px-1.5">Earned</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity heatmap */}
          <TabsContent value="activity" className="mt-4">
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Activity (Last {heatmapWeeks} Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 justify-center">
                  {Array.from({ length: heatmapWeeks }).map((_, week) => (
                    <div key={week} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, day) => {
                        const idx = week * 7 + day;
                        const level = activityData[idx] || 0;
                        return (
                          <motion.div
                            key={day}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.008 }}
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm ${heatmapColors[level]}`}
                            title={`${level} deeds`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <span className="text-[10px] text-muted-foreground">Less</span>
                  {heatmapColors.map((c, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                  ))}
                  <span className="text-[10px] text-muted-foreground">More</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Motivation */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-foreground italic leading-relaxed">
              "Whoever believes in Allah and the Last Day, let him speak good or remain silent."
            </p>
            <p className="text-xs text-muted-foreground mt-2">— Prophet Muhammad ﷺ (Bukhari & Muslim)</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Profile;
