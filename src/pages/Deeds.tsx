import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, BookOpen, Filter } from "lucide-react";
import { PRESET_DEEDS, CATEGORY_INFO, DIFFICULTY_INFO, type DeedCategory, type DeedDifficulty, type Deed } from "@/data/deeds";
import DeedCard from "@/components/deeds/DeedCard";
import CreateDeedDialog from "@/components/deeds/CreateDeedDialog";

const ALL_CATEGORIES: (DeedCategory | "All")[] = ["All", "Salah", "Quran", "Sadaqah", "Dhikr", "Character", "Family", "Fasting", "Knowledge"];
const ALL_DIFFICULTIES: (DeedDifficulty | "all")[] = ["all", "easy", "medium", "hard", "exceptional"];

const Deeds = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DeedCategory | "All">("All");
  const [difficulty, setDifficulty] = useState<DeedDifficulty | "all">("all");
  const [customDeeds, setCustomDeeds] = useState<Deed[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const allDeeds = useMemo(() => [...PRESET_DEEDS, ...customDeeds], [customDeeds]);

  const filtered = useMemo(() => {
    return allDeeds.filter((d) => {
      if (category !== "All" && d.category !== category) return false;
      if (difficulty !== "all" && d.difficulty !== difficulty) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase()) && !d.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allDeeds, category, difficulty, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allDeeds.length };
    allDeeds.forEach((d) => {
      counts[d.category] = (counts[d.category] || 0) + 1;
    });
    return counts;
  }, [allDeeds]);

  const handleCreate = (deed: Omit<Deed, "id" | "isPreset">) => {
    setCustomDeeds((prev) => [...prev, { ...deed, id: `custom-${Date.now()}`, isPreset: false }]);
    setCreateOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary" /> Deed Library
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {allDeeds.length} deeds across 8 categories — log them daily to earn hasanat
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create Custom Deed
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deeds by name or description..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto">
          <Tabs value={category} onValueChange={(v) => setCategory(v as DeedCategory | "All")}>
            <TabsList className="h-auto flex-wrap">
              {ALL_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="gap-1.5 text-xs">
                  {cat !== "All" && <span>{CATEGORY_INFO[cat].emoji}</span>}
                  {cat}
                  <span className="text-[10px] opacity-60">({categoryCounts[cat] || 0})</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground mr-1">Difficulty:</span>
          {ALL_DIFFICULTIES.map((d) => (
            <Button
              key={d}
              variant={difficulty === d ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setDifficulty(d)}
            >
              {d === "all" ? "All" : DIFFICULTY_INFO[d].label}
              {d !== "all" && <span className="ml-1 opacity-60">+{DIFFICULTY_INFO[d].points}</span>}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="text-sm text-muted-foreground">
        Showing {filtered.length} deed{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Deed Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((deed) => (
          <DeedCard key={deed.id} deed={deed} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">No deeds match your filters. Try adjusting your search.</p>
          </CardContent>
        </Card>
      )}

      <CreateDeedDialog open={createOpen} onOpenChange={setCreateOpen} onCreate={handleCreate} />
    </div>
  );
};

export default Deeds;
