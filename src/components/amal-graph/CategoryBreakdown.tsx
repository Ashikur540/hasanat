import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const categories = [
  { emoji: "🕌", name: "Salah", count: 156, total: 200, percent: 78, color: "bg-primary" },
  { emoji: "📖", name: "Quran", count: 89, total: 150, percent: 59, color: "bg-success" },
  { emoji: "📿", name: "Dhikr", count: 120, total: 180, percent: 67, color: "bg-accent" },
  { emoji: "💝", name: "Sadaqah", count: 45, total: 100, percent: 45, color: "bg-gold" },
  { emoji: "😇", name: "Character", count: 34, total: 80, percent: 43, color: "bg-primary/70" },
  { emoji: "👨‍👩‍👧", name: "Family", count: 28, total: 60, percent: 47, color: "bg-success/70" },
  { emoji: "🌙", name: "Fasting", count: 18, total: 40, percent: 45, color: "bg-accent/70" },
  { emoji: "📚", name: "Knowledge", count: 22, total: 50, percent: 44, color: "bg-gold/70" },
];

const CategoryBreakdown = () => {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {categories.map((cat) => (
        <Card key={cat.name} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{cat.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.count}/{cat.total}</span>
                </div>
                <Progress value={cat.percent} className="h-2 mt-1.5" />
              </div>
              <span className="text-sm font-bold text-primary">{cat.percent}%</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CategoryBreakdown;
