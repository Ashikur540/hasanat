import { Outlet, Link, useLocation } from "react-router-dom";
import { BarChart3, Building2, BookOpen, Users, User, Home, Settings, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nProvider";

const AppLayout = () => {
  const location = useLocation();
  const { t } = useI18n();
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: "/dashboard", label: t("navDashboard"), icon: Home },
    { to: "/amal-graph", label: t("navAmalGraph"), icon: BarChart3 },
    { to: "/my-city", label: t("navDeedsCity"), icon: Building2 },
    { to: "/deeds", label: t("navDeeds"), icon: BookOpen },
    { to: "/circles", label: t("navCircles"), icon: Users },
  ];

  const mobileLinks = [
    { to: "/dashboard", label: t("navHome"), icon: Home },
    { to: "/amal-graph", label: t("navGraph"), icon: BarChart3 },
    { to: "/my-city", label: t("navCity"), icon: Building2 },
    { to: "/circles", label: t("navCircles"), icon: Users },
    { to: "/profile", label: t("navProfile"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-background bg-gradient-mesh flex flex-col">
      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 bg-dot-pattern pointer-events-none z-0 opacity-50" />
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <span className="text-lg font-bold text-foreground">{t("appName")}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Button
                key={link.to}
                variant={isActive(link.to) ? "secondary" : "ghost"}
                size="sm"
                className={cn("gap-2", isActive(link.to) && "font-semibold text-primary")}
                asChild
              >
                <Link to={link.to}>
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
              <Link to="/leaderboard"><Trophy className="h-4 w-4" /></Link>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:inline-flex" asChild>
              <Link to="/settings"><Settings className="h-4 w-4" /></Link>
            </Button>
            <Link to="/profile">
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">AH</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-14 pb-20 md:pb-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                isActive(link.to) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
