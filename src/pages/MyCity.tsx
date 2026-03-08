import { Card, CardContent } from "@/components/ui/card";

const MyCity = () => (
  <div className="container mx-auto px-4 py-6 space-y-6">
    <h1 className="text-2xl md:text-3xl font-bold text-foreground">DeedsCity 🏙️</h1>
    <p className="text-muted-foreground">Watch your virtual city grow as you log good deeds.</p>
    <Card className="border-border bg-card">
      <CardContent className="p-10 text-center">
        <div className="text-6xl leading-relaxed mb-6 space-y-2">
          <div>☁️ &nbsp; ☁️ &nbsp; 🕊️ &nbsp; ☁️</div>
          <div>🕌 &nbsp; 🌳🌳🌳 &nbsp; 📚 &nbsp; 🏫</div>
          <div>🏠🏠 &nbsp; ⛲ &nbsp; 🌲🌲 &nbsp; 🏠</div>
          <div>🌺🌸 &nbsp; 🌻 &nbsp; 🦋 &nbsp; 🐝</div>
        </div>
        <p className="text-sm text-muted-foreground">Ahmed's City · Al-Hay Level · 30 Total Deeds</p>
        <p className="text-xs text-muted-foreground mt-2">Full SVG city visualization coming in Phase 5!</p>
      </CardContent>
    </Card>
  </div>
);

export default MyCity;
