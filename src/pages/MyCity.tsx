import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Share2, Camera } from "lucide-react";
import { motion } from "framer-motion";
import CityVisualization from "@/components/city/CityVisualization";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

// Mock data
const categoryData: Record<string, { count: number; vitality: number; emoji: string; element: string }> = {
  Salah:     { count: 156, vitality: 1.0, emoji: "🕌", element: "Masjid" },
  Quran:     { count: 89,  vitality: 0.85, emoji: "📚", element: "Library" },
  Sadaqah:   { count: 45,  vitality: 0.7,  emoji: "🌳", element: "Garden" },
  Dhikr:     { count: 120, vitality: 0.9,  emoji: "⛲", element: "Fountain" },
  Character: { count: 34,  vitality: 0.6,  emoji: "🤝", element: "Centre" },
  Family:    { count: 28,  vitality: 0.8,  emoji: "🏠", element: "Homes" },
  Fasting:   { count: 18,  vitality: 0.5,  emoji: "🌙", element: "Tower" },
  Knowledge: { count: 22,  vitality: 0.65, emoji: "🏫", element: "School" },
};

const milestones = [
  { name: "Al-Bidayah", req: 1, desc: "First seed planted" },
  { name: "Al-Qaryah", req: 7, desc: "Small village" },
  { name: "Al-Hay", req: 30, desc: "Neighborhood" },
  { name: "Al-Madinah", req: 100, desc: "Full city" },
  { name: "Al-Jannah", req: 365, desc: "Paradise garden" },
];

const totalDeeds = Object.values(categoryData).reduce((sum, c) => sum + c.count, 0);
const currentMilestone = milestones.filter(m => totalDeeds >= m.req).pop();
const nextMilestone = milestones.find(m => totalDeeds < m.req);

const vitalityLabel = (v: number) => v > 0.8 ? "Lush" : v > 0.6 ? "Healthy" : v > 0.4 ? "Fading" : v > 0.2 ? "Wilting" : "Dormant";
const vitalityColor = (v: number) => v > 0.8 ? "text-success" : v > 0.6 ? "text-primary" : v > 0.4 ? "text-gold" : "text-destructive";

const MyCity = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="container mx-auto px-4 py-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Ahmed's City 🏙️</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <Badge variant="outline" className="mr-2 text-primary">{currentMilestone?.name}</Badge>
            {totalDeeds} total deeds · {Object.keys(categoryData).length} districts active
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2"><Camera className="h-4 w-4" /> Snapshot</Button>
          <Button variant="outline" size="sm" className="gap-2"><Share2 className="h-4 w-4" /> Share</Button>
        </div>
      </motion.div>

      {/* City Visualization */}
      <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
        <Card className="border-border bg-card overflow-hidden">
          <CardContent className="p-4 md:p-6">
            <CityVisualization categoryData={categoryData} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Milestone Progress */}
      {nextMilestone && (
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Next Milestone: {nextMilestone.name}</span>
                <span className="text-xs text-muted-foreground">{totalDeeds}/{nextMilestone.req} deeds</span>
              </div>
              <Progress value={(totalDeeds / nextMilestone.req) * 100} className="h-2.5" />
              <p className="text-xs text-muted-foreground mt-2">{nextMilestone.desc}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* District Stats */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <h2 className="text-lg font-semibold text-foreground mb-4">City Districts</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(categoryData).map(([cat, data], i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <Card className="border-border bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{data.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{data.element}</p>
                      <p className="text-[10px] text-muted-foreground">{cat}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{data.count} deeds</span>
                    <span className={`font-medium ${vitalityColor(data.vitality)}`}>
                      {vitalityLabel(data.vitality)}
                    </span>
                  </div>
                  <Progress value={data.vitality * 100} className="h-1.5 mt-2" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Vitality Legend */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-foreground mb-2">🌿 Vitality System (based on last 7 days)</p>
            <div className="flex flex-wrap gap-3 text-[10px]">
              <span className="text-success font-medium">● Lush (7/7 days)</span>
              <span className="text-primary font-medium">● Healthy (5-6 days)</span>
              <span className="text-gold font-medium">● Fading (3-4 days)</span>
              <span className="text-destructive font-medium">● Wilting (1-2 days)</span>
              <span className="text-muted-foreground font-medium">● Dormant (0 days)</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default MyCity;
