import StatsBar from "@/components/dashboard/StatsBar";
import TodaysDeeds from "@/components/dashboard/TodaysDeeds";
import StreakCard from "@/components/dashboard/StreakCard";
import CityPreview from "@/components/dashboard/CityPreview";
import { Card, CardContent } from "@/components/ui/card";

const Dashboard = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <p className="font-arabic text-lg text-primary mb-1">﷽</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Assalamu Alaikum, Ahmed! 🌿
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          15 Sha'ban 1447 · Keep going, you're on a 12-day streak!
        </p>
      </div>

      {/* Stats */}
      <StatsBar />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Today's Deeds */}
        <div className="lg:col-span-2">
          <TodaysDeeds />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <StreakCard />
          <CityPreview />
          {/* Motivational Quote */}
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <p className="text-sm text-foreground italic leading-relaxed">
                "The most beloved of deeds to Allah are those that are most consistent, even if they are small."
              </p>
              <p className="text-xs text-muted-foreground mt-2">— Prophet Muhammad ﷺ (Bukhari & Muslim)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
