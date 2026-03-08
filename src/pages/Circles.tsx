import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Plus, Copy, Trophy, Target, Clock, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

interface CircleMember { name: string; initials: string; streak: number; points: number; isAdmin?: boolean; }
interface Circle { id: string; name: string; description: string; members: CircleMember[]; inviteCode: string; groupStreak: number; isPrivate: boolean; challenge?: { name: string; targetDays: number; progress: number; daysLeft: number }; activity: { text: string; time: string }[]; }

const mockCircles: Circle[] = [
  {
    id: "1", name: "Iman Boosters", description: "Daily accountability for Salah and Quran habits",
    inviteCode: "IMAN-2024", groupStreak: 5, isPrivate: false,
    members: [
      { name: "Ahmed", initials: "AH", streak: 12, points: 1240, isAdmin: true },
      { name: "Fatima", initials: "FA", streak: 9, points: 980 },
      { name: "Omar", initials: "OM", streak: 7, points: 750 },
      { name: "Aisha", initials: "AI", streak: 5, points: 620 },
      { name: "Yusuf", initials: "YU", streak: 4, points: 510 },
      { name: "Khadijah", initials: "KH", streak: 3, points: 430 },
      { name: "Ibrahim", initials: "IB", streak: 2, points: 320 },
      { name: "Maryam", initials: "MA", streak: 1, points: 210 },
    ],
    challenge: { name: "Pray Tahajjud", targetDays: 7, progress: 5, daysLeft: 2 },
    activity: [
      { text: "A member completed 5 deeds today", time: "2h ago" },
      { text: "A member hit a 30-day streak! 🔥", time: "yesterday" },
      { text: "New challenge started: Pray Tahajjud", time: "3 days ago" },
      { text: "3 members completed today's goal", time: "4 days ago" },
    ],
  },
  {
    id: "2", name: "Quran Buddies", description: "Finish the Quran together this year",
    inviteCode: "QURAN-777", groupStreak: 12, isPrivate: true,
    members: [
      { name: "Ahmed", initials: "AH", streak: 12, points: 1240, isAdmin: true },
      { name: "Hassan", initials: "HA", streak: 15, points: 1100 },
      { name: "Noor", initials: "NO", streak: 8, points: 700 },
    ],
    challenge: { name: "Read 1 Juz Daily", targetDays: 30, progress: 18, daysLeft: 12 },
    activity: [
      { text: "All members active today — group streak continues!", time: "1h ago" },
      { text: "A member memorized Surah Yasin", time: "yesterday" },
    ],
  },
];

const Circles = () => {
  const [selectedCircle, setSelectedCircle] = useState<Circle | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const { t } = useI18n();

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="container mx-auto px-4 py-6 space-y-6">
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" /> {t("circlesTitle")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t("circlesSub")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setJoinOpen(true)}><UserPlus className="h-4 w-4" /> {t("circlesJoin")}</Button>
          <Button className="gap-2" onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" /> {t("circlesCreate")}</Button>
        </div>
      </motion.div>

      {!selectedCircle ? (
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="grid md:grid-cols-2 gap-4">
          {mockCircles.map((circle, i) => (
            <motion.div key={circle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.1 }} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCircle(circle)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{circle.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{circle.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{circle.isPrivate ? t("circlesPrivate") : t("circlesPublic")}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {circle.members.length}/15</span>
                    <span className="flex items-center gap-1">🔥 {circle.groupStreak} {t("circlesDayGroupStreak")}</span>
                  </div>
                  <div className="flex -space-x-2">
                    {circle.members.slice(0, 5).map((m, j) => (
                      <Avatar key={j} className="h-7 w-7 border-2 border-card">
                        <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">{m.initials}</AvatarFallback>
                      </Avatar>
                    ))}
                    {circle.members.length > 5 && (
                      <div className="h-7 w-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] text-muted-foreground font-medium">+{circle.members.length - 5}</div>
                    )}
                  </div>
                  {circle.challenge && (
                    <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-2 text-xs">
                        <Target className="h-3 w-3 text-primary" />
                        <span className="font-medium text-foreground">{circle.challenge.name}</span>
                        <span className="ml-auto text-muted-foreground">{circle.challenge.daysLeft}{t("circlesDLeft")}</span>
                      </div>
                      <Progress value={(circle.challenge.progress / circle.challenge.targetDays) * 100} className="h-1.5 mt-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <CircleDetail circle={selectedCircle} onBack={() => setSelectedCircle(null)} />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("circlesCreateTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>{t("circlesCircleName")}</Label><Input placeholder={t("circlesCircleNamePlaceholder")} maxLength={40} /></div>
            <div className="space-y-1.5"><Label>{t("circlesDescription")}</Label><Input placeholder={t("circlesDescPlaceholder")} maxLength={100} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>{t("circlesCancel")}</Button>
            <Button onClick={() => setCreateOpen(false)}>{t("circlesCreate")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("circlesJoinTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-1.5"><Label>{t("circlesInviteCode")}</Label><Input placeholder={t("circlesInviteCodePlaceholder")} maxLength={20} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinOpen(false)}>{t("circlesCancel")}</Button>
            <Button onClick={() => setJoinOpen(false)}>{t("circlesJoinBtn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const CircleDetail = ({ circle, onBack }: { circle: Circle; onBack: () => void }) => {
  const { t } = useI18n();
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-xs" onClick={onBack}>{t("circlesBackToCircles")}</Button>
          <h2 className="text-xl font-bold text-foreground">{circle.name}</h2>
          <p className="text-xs text-muted-foreground">{circle.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-xs"><Copy className="h-3 w-3" /> {circle.inviteCode}</Badge>
          <Badge className="text-xs">🔥 {circle.groupStreak} {t("circlesDayGroupStreak")}</Badge>
        </div>
      </motion.div>

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">{t("circlesMembers")}</TabsTrigger>
          <TabsTrigger value="challenge">{t("circlesChallenge")}</TabsTrigger>
          <TabsTrigger value="activity">{t("circlesActivity")}</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <Card className="border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{t("circlesLeaderboard")} ({circle.members.length}/15)</span>
                  <Trophy className="h-4 w-4 text-gold" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {circle.members.map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className={`text-sm font-bold w-6 ${i < 3 ? "text-gold" : "text-muted-foreground"}`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{m.initials}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {m.name} {m.isAdmin && <Badge variant="outline" className="text-[8px] px-1 py-0 ml-1">{t("circlesAdmin")}</Badge>}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">🔥 {m.streak}</span>
                    <span className="text-xs font-semibold text-primary">⭐ {m.points}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="challenge">
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            {circle.challenge ? (
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center"><Target className="h-5 w-5 text-primary-foreground" /></div>
                    <div>
                      <h3 className="font-semibold text-foreground">{circle.challenge.name}</h3>
                      <p className="text-xs text-muted-foreground">{circle.challenge.targetDays}{t("circlesDayChallenge")}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("circlesProgress")}</span>
                      <span className="font-semibold text-foreground">{circle.challenge.progress}/{circle.challenge.targetDays} {t("commonDays")}</span>
                    </div>
                    <Progress value={(circle.challenge.progress / circle.challenge.targetDays) * 100} className="h-3" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {circle.challenge.daysLeft} {t("circlesDaysRemaining")}</div>
                  <div className="mt-4 flex items-center gap-2 text-sm"><span className="text-muted-foreground">{circle.members.filter((_, i) => i < 5).length}/{circle.members.length} {t("circlesMembersParticipating")}</span></div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="p-10 text-center">
                  <p className="text-muted-foreground text-sm mb-3">{t("circlesNoChallenge")}</p>
                  <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> {t("circlesCreateChallenge")}</Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="activity">
          <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
            <Card className="border-border bg-card">
              <CardContent className="p-4 space-y-1">
                {circle.activity.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-2 w-2 rounded-full bg-primary/50 shrink-0" />
                    <p className="text-sm text-foreground flex-1">{a.text}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Circles;
