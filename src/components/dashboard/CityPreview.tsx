import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CityPreview = () => {
  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* City scene illustration */}
        <div className="relative bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-400 dark:from-sky-900 dark:via-sky-800 dark:to-emerald-900 p-4 pt-3 overflow-hidden min-h-[140px]">
          {/* Clouds */}
          <div className="absolute top-2 right-4 flex gap-1 opacity-60">
            <span className="text-sm">☁️</span>
            <span className="text-xs mt-1">☁️</span>
          </div>
          {/* Weather icon */}
          <div className="absolute top-2 left-3">
            <span className="text-lg">🌤️</span>
          </div>
          
          {/* City buildings */}
          <div className="flex items-end justify-center gap-1 pt-6 pb-1">
            {/* Mosque */}
            <div className="flex flex-col items-center">
              <span className="text-2xl">🕌</span>
            </div>
            {/* Tree */}
            <div className="flex flex-col items-center">
              <span className="text-xl">🌳</span>
            </div>
            {/* Houses */}
            <div className="flex flex-col items-center">
              <span className="text-xl">🏠</span>
            </div>
            {/* Garden */}
            <div className="flex flex-col items-center">
              <span className="text-lg">🌲</span>
            </div>
          </div>
          
          {/* Ground */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-emerald-500/40 dark:bg-emerald-800/40" />
          
          {/* Level badge */}
          <div className="absolute bottom-2 right-3 bg-white/80 dark:bg-black/40 text-[10px] font-medium px-2 py-0.5 rounded-full text-foreground backdrop-blur-sm">
            Al-Qaryah
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Your DeedCity</p>
            <p className="text-xs text-muted-foreground">Village · Garden: Healthy 🌿</p>
          </div>
          <Button variant="default" size="sm" className="gap-1.5 rounded-full h-8 px-4 text-xs" asChild>
            <Link to="/my-city">
              Visit <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CityPreview;
