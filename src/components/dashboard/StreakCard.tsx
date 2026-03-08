import { Card, CardContent } from "@/components/ui/card";

const weekDots = [true, true, true, true, true, false, false];
const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

const StreakCard = () => {
  return (
    <Card className="border-0 bg-primary text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🔥</span>
          <div>
            <p className="text-3xl font-extrabold">12</p>
            <p className="text-sm opacity-80">Day Streak</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between opacity-80">
            <span>Best Streak</span>
            <span className="font-semibold">24 days</span>
          </div>
          <div className="flex justify-between opacity-80">
            <span>Freeze Available</span>
            <span className="font-semibold">1 ❄️</span>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          {dayLabels.map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className={`h-3 w-3 rounded-full ${weekDots[i] ? "bg-primary-foreground" : "bg-primary-foreground/30"}`} />
              <span className="text-[10px] opacity-60">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCard;
