import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Deed {
  id: string;
  emoji: string;
  name: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXCEPTIONAL";
  points: number;
  completed: boolean;
}

const initialDeeds: Deed[] = [
  { id: "1", emoji: "🕌", name: "Fajr Prayer", category: "Salah", difficulty: "EASY", points: 5, completed: true },
  { id: "2", emoji: "📿", name: "Morning Adhkar", category: "Dhikr", difficulty: "EASY", points: 5, completed: true },
  { id: "3", emoji: "🕌", name: "Dhuhr Prayer", category: "Salah", difficulty: "EASY", points: 5, completed: false },
  { id: "4", emoji: "📖", name: "Read 1 Page Quran", category: "Quran", difficulty: "MEDIUM", points: 15, completed: false },
  { id: "5", emoji: "💝", name: "Give Sadaqah", category: "Sadaqah", difficulty: "MEDIUM", points: 15, completed: false },
  { id: "6", emoji: "🕌", name: "Asr Prayer", category: "Salah", difficulty: "EASY", points: 5, completed: false },
  { id: "7", emoji: "🌙", name: "Tahajjud", category: "Salah", difficulty: "HARD", points: 30, completed: false },
];

const difficultyColors: Record<string, string> = {
  EASY: "bg-secondary text-secondary-foreground",
  MEDIUM: "bg-primary/10 text-primary",
  HARD: "bg-accent/20 text-accent-foreground",
  EXCEPTIONAL: "bg-gold/20 text-gold",
};

const TodaysDeeds = () => {
  const [deeds, setDeeds] = useState(initialDeeds);
  const completed = deeds.filter((d) => d.completed).length;

  const toggle = (id: string) => {
    setDeeds((prev) => prev.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)));
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Today's Deeds</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{completed}/{deeds.length}</span>
            <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
              <Plus className="h-3 w-3" /> Add
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {deeds.map((d) => (
          <div
            key={d.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => toggle(d.id)}
          >
            <Checkbox checked={d.completed} onCheckedChange={() => toggle(d.id)} />
            <span className="text-lg">{d.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${d.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {d.name}
              </p>
              <p className="text-xs text-muted-foreground">{d.category}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] px-2 py-0 font-semibold ${difficultyColors[d.difficulty]}`}>
              {d.difficulty}
            </Badge>
            <span className="text-sm font-semibold text-primary">+{d.points}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TodaysDeeds;
