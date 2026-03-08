import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PRESET_DEEDS, CATEGORY_INFO, DIFFICULTY_INFO, type Deed, type DeedCategory } from "@/data/deeds";

interface TodayDeed {
  id: string;
  deedId: string;
  emoji: string;
  name: string;
  category: DeedCategory;
  difficulty: string;
  points: number;
  completed: boolean;
}

const initialDeeds: TodayDeed[] = [
  { id: "t1", deedId: "s1", emoji: "🕌", name: "Fajr Prayer", category: "Salah", difficulty: "EASY", points: 5, completed: true },
  { id: "t2", deedId: "d1", emoji: "🌅", name: "Morning Adhkar", category: "Dhikr", difficulty: "EASY", points: 5, completed: true },
  { id: "t3", deedId: "s2", emoji: "🕌", name: "Dhuhr Prayer", category: "Salah", difficulty: "EASY", points: 5, completed: false },
  { id: "t4", deedId: "q1", emoji: "📖", name: "Read 1 Page Quran", category: "Quran", difficulty: "MEDIUM", points: 15, completed: false },
  { id: "t5", deedId: "sa1", emoji: "💰", name: "Give Sadaqah", category: "Sadaqah", difficulty: "MEDIUM", points: 15, completed: false },
];

const difficultyColors: Record<string, string> = {
  EASY: "bg-secondary text-secondary-foreground",
  MEDIUM: "bg-primary/10 text-primary",
  HARD: "bg-accent/20 text-accent-foreground",
  EXCEPTIONAL: "bg-gold/20 text-gold",
};

const categories: DeedCategory[] = ["Salah", "Quran", "Sadaqah", "Dhikr", "Character", "Family", "Fasting", "Knowledge"];

const TodaysDeeds = () => {
  const [deeds, setDeeds] = useState<TodayDeed[]>(initialDeeds);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<DeedCategory | null>(null);

  const completed = deeds.filter((d) => d.completed).length;
  const totalPoints = deeds.filter(d => d.completed).reduce((s, d) => s + d.points, 0);
  const addedDeedIds = new Set(deeds.map(d => d.deedId));

  const filteredPresets = useMemo(() => {
    return PRESET_DEEDS.filter((d) => {
      if (addedDeedIds.has(d.id)) return false;
      if (filterCat && d.category !== filterCat) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, filterCat, addedDeedIds]);

  const toggle = (id: string) => {
    setDeeds((prev) => prev.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)));
  };

  const addDeed = (preset: Deed) => {
    const diffInfo = DIFFICULTY_INFO[preset.difficulty];
    const newDeed: TodayDeed = {
      id: `t-${Date.now()}-${preset.id}`,
      deedId: preset.id,
      emoji: preset.emoji,
      name: preset.name,
      category: preset.category,
      difficulty: diffInfo.label,
      points: preset.basePoints,
      completed: false,
    };
    setDeeds((prev) => [...prev, newDeed]);
  };

  const removeDeed = (id: string) => {
    setDeeds((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Today's Deeds</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completed}/{deeds.length} done · <span className="text-primary font-medium">+{totalPoints} pts</span>
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Deed
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Add Deeds to Today
                </DialogTitle>
              </DialogHeader>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deeds..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category filter chips */}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant={filterCat === null ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs rounded-full"
                  onClick={() => setFilterCat(null)}
                >
                  All
                </Button>
                {categories.map((cat) => {
                  const info = CATEGORY_INFO[cat];
                  return (
                    <Button
                      key={cat}
                      variant={filterCat === cat ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs rounded-full gap-1"
                      onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                    >
                      {info.emoji} {cat}
                    </Button>
                  );
                })}
              </div>

              {/* Deed list */}
              <ScrollArea className="flex-1 -mx-1 max-h-[400px]">
                <div className="space-y-1 px-1">
                  {filteredPresets.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {search ? "No matching deeds found" : "All deeds from this category are already added!"}
                    </p>
                  ) : (
                    filteredPresets.map((preset) => {
                      const diffInfo = DIFFICULTY_INFO[preset.difficulty];
                      return (
                        <motion.div
                          key={preset.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <span className="text-lg shrink-0">{preset.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{preset.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{preset.description}</p>
                          </div>
                          <Badge variant="outline" className={`text-[9px] px-1.5 py-0 shrink-0 ${diffInfo.color}`}>
                            {diffInfo.label}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 shrink-0 opacity-60 group-hover:opacity-100 hover:bg-primary/10"
                            onClick={() => addDeed(preset)}
                          >
                            <Plus className="h-4 w-4 text-primary" />
                          </Button>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-1.5 mt-2">
          <motion.div
            className="bg-primary h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${deeds.length > 0 ? (completed / deeds.length) * 100 : 0}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <AnimatePresence mode="popLayout">
          {deeds.map((d) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => toggle(d.id)}
            >
              <Checkbox checked={d.completed} onCheckedChange={() => toggle(d.id)} />
              <span className="text-lg">{d.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-colors ${d.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {d.name}
                </p>
                <p className="text-xs text-muted-foreground">{d.category}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] px-2 py-0 font-semibold ${difficultyColors[d.difficulty]}`}>
                {d.difficulty}
              </Badge>
              <span className={`text-sm font-semibold transition-colors ${d.completed ? "text-primary" : "text-muted-foreground"}`}>
                +{d.points}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:bg-destructive/10"
                onClick={(e) => { e.stopPropagation(); removeDeed(d.id); }}
              >
                <X className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {deeds.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No deeds for today yet</p>
            <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add your first deed
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysDeeds;
