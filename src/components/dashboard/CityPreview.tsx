import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CityPreview = () => {
  return (
    <Card className="border-border bg-card overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-secondary/50 p-6 text-center">
          {/* Simple city illustration using emoji */}
          <div className="text-4xl leading-relaxed mb-1">
            <div>☁️ &nbsp; ☁️ &nbsp; 🕊️</div>
            <div>🕌 &nbsp; 🌳🌳 &nbsp; 📚</div>
            <div>🏠🏠 &nbsp; ⛲ &nbsp; 🌲🌲</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Ahmed's City · Al-Hay Level</p>
        </div>
        <div className="p-4">
          <Button variant="outline" size="sm" className="w-full gap-2" asChild>
            <Link to="/my-city">
              Visit Your City <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CityPreview;
