import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Heatmap from "@/components/amal-graph/Heatmap";
import CategoryBreakdown from "@/components/amal-graph/CategoryBreakdown";
import { motion } from "framer-motion";

const stats = [
  { emoji: "📊", label: "Total Deeds", value: "512" },
  { emoji: "🔥", label: "Best Streak", value: "24 days" },
  { emoji: "📅", label: "Active Days", value: "187" },
  { emoji: "📈", label: "Consistency", value: "73%" },
  { emoji: "🕌", label: "Top Category", value: "Salah" },
  { emoji: "⭐", label: "Points Total", value: "4,280" },
];

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const AmalGraph = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="container mx-auto px-4 py-6 space-y-6"
    >
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Amal Graph 📊</h1>
        <p className="text-muted-foreground text-sm mt-1">Your spiritual journey at a glance</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.06 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <Card className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <span className="text-2xl">{s.emoji}</span>
                <p className="text-xl font-bold text-foreground mt-1">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Heatmap */}
      <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg font-semibold text-foreground">Activity Heatmap</h2>
              <Tabs defaultValue="year">
                <TabsList>
                  <TabsTrigger value="year">Year</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Heatmap />
            <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌙</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Ramadan Highlight</p>
                  <p className="text-xs text-muted-foreground">You logged deeds every day during Ramadan — Masha'Allah!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h2>
        <CategoryBreakdown />
      </motion.div>
    </motion.div>
  );
};

export default AmalGraph;
