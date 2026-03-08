import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { emoji: "🔥", label: "Day Streak", value: "12", sub: "Best: 24" },
  { emoji: "⭐", label: "Points Today", value: "45", sub: "+15 from yesterday" },
  { emoji: "📋", label: "Deeds Today", value: "3/7", sub: "4 remaining" },
  { emoji: "🌍", label: "Global Rank", value: "#142", sub: "Top 5%" },
  { emoji: "🏙️", label: "City Level", value: "Al-Hay", sub: "30/100 deeds" },
  { emoji: "📊", label: "This Week", value: "28", sub: "▁▃▅▆▇█▅" },
];

const StatsBar = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="border-border bg-card hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{s.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsBar;
