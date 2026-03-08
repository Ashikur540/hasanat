import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const weekData = [
  { day: "Mon", deeds: 5 },
  { day: "Tue", deeds: 8 },
  { day: "Wed", deeds: 12 },
  { day: "Thu", deeds: 10 },
  { day: "Fri", deeds: 15 },
  { day: "Sat", deeds: 18 },
  { day: "Sun", deeds: 9 },
];

const stats = [
  { emoji: "⭐", label: "Points Today", value: "45", sub: "+15 from yesterday" },
  { emoji: "📋", label: "Deeds Today", value: "3/7", sub: "4 remaining" },
  { emoji: "🌍", label: "Global Rank", value: "#142", sub: "Top 5%" },
  { emoji: "🏙️", label: "City Level", value: "Al-Hay", sub: "30/100 deeds" },
];

const StatsBar = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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

      {/* This Week chart card */}
      <Card className="border-border bg-card hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📊</span>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Week</span>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">77</p>
          <div className="h-[40px] -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={6}>
                <Bar dataKey="deeds" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsBar;
