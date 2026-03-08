import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRESET_DEEDS, CATEGORY_INFO, DIFFICULTY_INFO, type Deed, type DeedCategory } from "@/data/deeds";
import { useI18n } from "@/i18n/I18nProvider";

interface TodayDeed {
  id: string; deedId: string; emoji: string; name: string; category: DeedCategory; difficulty: string; points: number; completed: boolean;
}

const initialDeeds: TodayDeed[] = [
  { id: "t1", deedId: "s1", emoji: "🕌", name: "Pray all 5 Salah on time", category: "Salah", difficulty: "HARD", points: 30, completed: true },
  { id: "t2", deedId: "q1", emoji: "📖", name: "Read 1 page of Quran", category: "Quran", difficulty: "MEDIUM", points: 15, completed: false },
  { id: "t3", deedId: "d1", emoji: "🤲", name: "Morning Adhkar", category: "Dhikr", difficulty: "MEDIUM", points: 15, completed: true },
  { id: "t4", deedId: "sa1", emoji: "🤲", name: "Give any sadaqah today", category: "Sadaqah", difficulty: "HARD", points: 30, completed: false },
  { id: "t5", deedId: "s5", emoji: "🌙", name: "Pray 2 rakat Sunnah after Isha", category: "Salah", difficulty: "MEDIUM", points: 15, completed: false },
  { id: "t6", deedId: "c1", emoji: "😊", name: "Smile at a fellow Muslim", category: "Character", difficulty: "EASY", points: 5, completed: true },
];

const difficultyColors: Record<string, string> = {
  EASY: "text-emerald-500 dark:text-emerald-400", MEDIUM: "text-primary", HARD: "text-orange-500 dark:text-orange-400", EXCEPTIONAL: "text-amber-500 dark:text-amber-400",
};

const categories: DeedCategory[] = ["Salah", "Quran", "Sadaqah", "Dhikr", "Character", "Family", "Fasting", "Knowledge"];

const TodaysDeeds = () => {
  const [deeds, setDeeds] = useState<TodayDeed[]>(initialDeeds);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<DeedCategory | null>(null);
  const { t } = useI18n();

  const completed = deeds.filter((d) => d.completed).length;
  const addedDeedIds = new Set(deeds.map(d => d.deedId));

  const filteredPresets = useMemo(() => {
    return PRESET_DEEDS.filter((d) => {
      if (addedDeedIds.has(d.id)) return false;
      if (filterCat && d.category !== filterCat) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, filterCat, addedDeedIds]);

  const toggle = (id: string) => setDeeds((prev) => prev.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)));
  const addDeed = (preset: Deed) => {
    const diffInfo = DIFFICULTY_INFO[preset.difficulty];
    setDeeds((prev) => [...prev, { id: `t-${Date.now()}-${preset.id}`, deedId: preset.id, emoji: preset.emoji, name: preset.name, category: preset.category, difficulty: diffInfo.label, points: preset.basePoints, completed: false }]);
  };
  const removeDeed = (id: string) => setDeeds((prev) => prev.filter((d) => d.id !== id));

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">{t("todaysDeedsTitle")}</CardTitle>
          <div className="flex items-center gap-3">
            <Progress value={deeds.length > 0 ? (completed / deeds.length) * 100 : 0} className="w-24 h-2" />
            <span className="text-sm font-semibold text-muted-foreground">{completed}/{deeds.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <AnimatePresence mode="popLayout">
          {deeds.map((d) => (
            <motion.div key={d.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20, height: 0 }} transition={{ duration: 0.25 }} onClick={() => toggle(d.id)} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${d.completed ? "border-primary/20 bg-primary/5" : "border-border bg-card hover:border-primary/30 hover:bg-muted/30"}`}>
              <Checkbox checked={d.completed} onCheckedChange={() => toggle(d.id)} className="h-5 w-5 rounded-full border-2" />
              <span className="text-xl shrink-0">{d.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-colors ${d.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.category}</p>
              </div>
              <span className={`text-xs font-bold uppercase ${difficultyColors[d.difficulty]}`}>{d.difficulty}</span>
              <span className={`text-sm font-bold min-w-[36px] text-right ${d.completed ? "text-primary" : "text-muted-foreground"}`}>+{d.points}</span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); removeDeed(d.id); }}><X className="h-3.5 w-3.5 text-destructive" /></Button>
            </motion.div>
          ))}
        </AnimatePresence>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full mt-2 gap-1.5 h-10 border-dashed"><Plus className="h-4 w-4" /> {t("todaysDeedsAddDeed")}</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> {t("todaysDeedsAddToToday")}</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("todaysDeedsSearch")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button variant={filterCat === null ? "default" : "outline"} size="sm" className="h-7 text-xs rounded-full" onClick={() => setFilterCat(null)}>{t("todaysDeedsAll")}</Button>
              {categories.map((cat) => {
                const info = CATEGORY_INFO[cat];
                return (
                  <Button key={cat} variant={filterCat === cat ? "default" : "outline"} size="sm" className="h-7 text-xs rounded-full gap-1" onClick={() => setFilterCat(filterCat === cat ? null : cat)}>
                    {info.emoji} {cat}
                  </Button>
                );
              })}
            </div>
            <ScrollArea className="flex-1 -mx-1 max-h-[400px]">
              <div className="space-y-1 px-1">
                {filteredPresets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {search ? t("todaysDeedsNoMatch") : t("todaysDeedsAllAdded")}
                  </p>
                ) : (
                  filteredPresets.map((preset) => {
                    const diffInfo = DIFFICULTY_INFO[preset.difficulty];
                    return (
                      <motion.div key={preset.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                        <span className="text-lg shrink-0">{preset.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{preset.name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{preset.description}</p>
                        </div>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 ${diffInfo.color}`}>{diffInfo.label}</Badge>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 shrink-0 opacity-60 group-hover:opacity-100 hover:bg-primary/10" onClick={() => addDeed(preset)}><Plus className="h-4 w-4 text-primary" /></Button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TodaysDeeds;
