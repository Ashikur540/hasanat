import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface BuildingDetailProps {
  category: string | null;
  data: { count: number; vitality: number; emoji: string; element: string } | null;
  onClose: () => void;
}

const levelNames = ["Empty Lot", "Foundation", "Built", "Flourishing"];
const vitalityLabel = (v: number) =>
  v > 0.8 ? "Lush" : v > 0.6 ? "Healthy" : v > 0.4 ? "Fading" : v > 0.2 ? "Wilting" : "Dormant";
const vitalityColor = (v: number) =>
  v > 0.8 ? "text-success" : v > 0.6 ? "text-primary" : v > 0.4 ? "text-gold" : "text-destructive";

const getLevel = (count: number) => (count > 50 ? 3 : count > 20 ? 2 : count > 0 ? 1 : 0);

const tips: Record<string, string> = {
  Salah: "Pray on time to grow your Masjid!",
  Quran: "Read more Quran to expand the Library.",
  Sadaqah: "Give charity to make the Garden bloom.",
  Dhikr: "Remember Allah to keep the Fountain flowing.",
  Character: "Good character builds community.",
  Family: "Family ties light up the Homes.",
  Fasting: "Fast regularly to raise the Tower higher.",
  Knowledge: "Seek knowledge to grow the School.",
};

const BuildingDetail = ({ category, data, onClose }: BuildingDetailProps) => (
  <AnimatePresence>
    {category && data && (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.25 }}
      >
        <Card className="border-border bg-card relative overflow-hidden">
          <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{data.emoji}</span>
              <div>
                <h3 className="font-bold text-foreground">{data.element}</h3>
                <p className="text-xs text-muted-foreground">{category} District</p>
              </div>
              <Badge variant="outline" className="ml-auto text-primary">
                {levelNames[getLevel(data.count)]}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Deeds Logged</p>
                <p className="text-xl font-bold text-foreground">{data.count}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Vitality</p>
                <p className={`text-xl font-bold ${vitalityColor(data.vitality)}`}>
                  {vitalityLabel(data.vitality)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Level Progress</span>
                <span>
                  {getLevel(data.count) < 3
                    ? `${data.count}/${getLevel(data.count) === 0 ? 1 : getLevel(data.count) === 1 ? 20 : 50} to next`
                    : "Max level!"}
                </span>
              </div>
              <Progress value={Math.min((data.count / 50) * 100, 100)} className="h-2" />
            </div>

            <p className="text-xs text-muted-foreground mt-3 italic">💡 {tips[category] || "Keep going!"}</p>
          </CardContent>
        </Card>
      </motion.div>
    )}
  </AnimatePresence>
);

export default BuildingDetail;
