import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Share2, Camera, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CityVisualization, { type TimeOfDay } from "@/components/city/CityVisualization";
import BuildingDetail from "@/components/city/BuildingDetail";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

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

const timeOptions: { value: TimeOfDay; label: string; emoji: string }[] = [
  { value: "fajr", label: "Fajr", emoji: "🌅" },
  { value: "morning", label: "Morning", emoji: "☀️" },
  { value: "noon", label: "Noon", emoji: "🌤️" },
  { value: "evening", label: "Evening", emoji: "🌇" },
  { value: "night", label: "Night", emoji: "🌙" },
];

const MyCity = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("night");

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="container mx-auto px-4 py-6 space-y-5"
    >
      {/* Header */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Deed City 🏙️</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <Badge variant="outline" className="mr-2 text-primary">{currentMilestone?.name}</Badge>
            {totalDeeds} deeds · {Object.keys(categoryData).length} districts
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedCategory(null)}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button variant="outline" size="sm" className="gap-2"><Camera className="h-4 w-4" /> Snapshot</Button>
          <Button variant="outline" size="sm" className="gap-2"><Share2 className="h-4 w-4" /> Share</Button>
        </div>
      </motion.div>

      {/* Time of day toggle */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex gap-1.5 justify-center flex-wrap">
          {timeOptions.map((t) => (
            <Button
              key={t.value}
              variant={timeOfDay === t.value ? "default" : "outline"}
              size="sm"
              className="gap-1.5 h-8 text-xs rounded-full px-3"
              onClick={() => setTimeOfDay(t.value)}
            >
              {t.emoji} {t.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* 3D City */}
      <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
        <Card className="border-border bg-card overflow-hidden rounded-xl relative">
          <CardContent className="p-0">
            {/* Controls hint */}
            <div className="absolute bottom-3 left-3 z-10">
              <Badge variant="secondary" className="text-[10px] opacity-70 backdrop-blur-sm">
                🖱️ Drag to rotate · Right-drag to pan · Scroll to zoom
              </Badge>
            </div>
            <CityVisualization
              categoryData={categoryData}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              timeOfDay={timeOfDay}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Building detail panel */}
      <AnimatePresence>
        <BuildingDetail
          category={selectedCategory}
          data={selectedCategory ? categoryData[selectedCategory] : null}
          onClose={() => setSelectedCategory(null)}
        />
      </AnimatePresence>

      {/* Quick district selector */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {Object.entries(categoryData).map(([cat, data]) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-colors ${
                selectedCategory === cat
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <span className="text-lg">{data.emoji}</span>
              <span className="text-[10px] font-medium text-foreground">{data.element}</span>
              <span className="text-[9px] text-muted-foreground">{data.count}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Milestone Progress */}
      {nextMilestone && (
        <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">Next: {nextMilestone.name}</span>
                <span className="text-xs text-muted-foreground">{totalDeeds}/{nextMilestone.req}</span>
              </div>
              <Progress value={(totalDeeds / nextMilestone.req) * 100} className="h-2.5" />
              <p className="text-xs text-muted-foreground mt-2">{nextMilestone.desc}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MyCity;
