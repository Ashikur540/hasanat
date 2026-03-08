import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Building2, Users, ArrowRight, BookOpen, Heart, Star } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Amal Graph",
    description: "A beautiful 365-day heatmap that visualizes your spiritual journey — like GitHub, but for good deeds.",
  },
  {
    icon: Building2,
    title: "DeedsCity",
    description: "Watch your virtual city grow as you log deeds. Mosques, gardens, and libraries bloom with your consistency.",
  },
  {
    icon: Users,
    title: "Accountability Circles",
    description: "Stay on track with friends and family. Join circles, set group challenges, and grow together.",
  },
];

const steps = [
  { number: "01", icon: BookOpen, title: "Log Your Deeds", description: "Choose from 80+ preset good deeds or create your own. Track salah, Quran, sadaqah, and more." },
  { number: "02", icon: Star, title: "Watch Your Graph Glow", description: "Your Amal Graph fills with color as you build consistency. Earn points, unlock levels, and collect badges." },
  { number: "03", icon: Heart, title: "Grow With Your Ummah", description: "Join accountability circles, participate in challenges, and inspire each other on the path of ihsan." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-foreground">Hasanat</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="container mx-auto px-4 text-center">
          <p className="font-arabic text-2xl md:text-3xl text-primary mb-6">﷽</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground leading-tight mb-6 max-w-4xl mx-auto">
            Track Your Good Deeds.{" "}
            <span className="text-primary">Grow Your Garden.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            A beautiful app to log your daily hasanat, visualize your spiritual growth, 
            build a virtual city, and stay consistent with your ummah.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 py-6" asChild>
              <Link to="/auth">
                Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 py-6" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Your Spiritual Toolkit
          </h2>
          <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">
            Everything you need to build consistent, meaningful habits rooted in faith.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <Card key={f.title} className="border-border bg-card hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-5">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-14">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {steps.map((s) => (
              <div key={s.number} className="text-center">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mb-5">
                  <s.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold text-primary tracking-wider">STEP {s.number}</span>
                <h3 className="text-xl font-semibold text-foreground mt-2 mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto bg-primary rounded-3xl p-10 md:p-14">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Begin Your Journey Today
            </h2>
            <p className="text-primary-foreground/80 mb-8 text-lg">
              Every good deed, no matter how small, is never lost. Start tracking and watch your spiritual garden grow.
            </p>
            <Button size="lg" variant="secondary" className="text-base px-8 py-6 font-semibold" asChild>
              <Link to="/auth">
                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌿</span>
              <span className="font-bold text-foreground">Hasanat</span>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-lg">
              This app is a tool for self-improvement and is not a substitute for scholarly guidance. 
              Always consult knowledgeable scholars for religious rulings.
            </p>
            <p className="text-sm text-muted-foreground">© 2026 Hasanat Hub</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
