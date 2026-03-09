import { useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Sun, Moon, Monitor, Bell, Globe, Lock,
  Palette, Volume2, VolumeX, Shield, LogOut, Trash2, ChevronRight, Send, MapPin, Loader2,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import type { Language } from "@/i18n/translations";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { settings: notifSettings, updateSetting, sendTestNotification } = useNotifications();
  const { toast } = useToast();
  const [sounds, setSounds] = useState(true);
  const [profileVisibility, setProfileVisibility] = useState("friends");
  const [cityName, setCityName] = useState(() => localStorage.getItem("prayer-location-city") || "");
  const [locationMode, setLocationMode] = useState<"gps" | "manual">(() => localStorage.getItem("prayer-location") ? "manual" : "gps");
  const [searching, setSearching] = useState(false);

  const themeOptions = [
    { value: "light", label: t("settingsLight"), icon: Sun },
    { value: "dark", label: t("settingsDark"), icon: Moon },
    { value: "system", label: t("settingsSystem"), icon: Monitor },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="container mx-auto px-4 py-6 space-y-6 max-w-2xl"
    >
      {/* Header */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("settingsTitle")}</h1>
        <p className="text-muted-foreground text-sm mt-1">{t("settingsSubtitle")}</p>
      </motion.div>

      {/* Language - moved up for prominence */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" /> {t("settingsLanguage")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "en" as Language, label: "English", native: "English", flag: "🇺🇸" },
                { value: "bn" as Language, label: "বাংলা", native: "Bangla", flag: "🇧🇩" },
              ]).map((lang) => (
                <motion.button
                  key={lang.value}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setLanguage(lang.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    language === lang.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary/30 hover:border-primary/40"
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className={`text-sm font-medium ${language === lang.value ? "text-foreground" : "text-muted-foreground"}`}>
                      {lang.label}
                    </div>
                    <div className="text-xs text-muted-foreground">{lang.native}</div>
                  </div>
                  {language === lang.value && (
                    <Badge variant="outline" className="ml-auto text-[10px] border-primary text-primary">
                      {t("settingsActive")}
                    </Badge>
                  )}
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> {t("settingsAppearance")}
            </CardTitle>
            <CardDescription>{t("settingsAppearanceDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:border-primary/40"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {opt.label}
                    </span>
                    {isActive && (
                      <Badge variant="outline" className="text-[10px] border-primary text-primary">
                        {t("settingsActive")}
                      </Badge>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settingsSoundEffects")}</Label>
                <p className="text-xs text-muted-foreground">{t("settingsSoundDesc")}</p>
              </div>
              <div className="flex items-center gap-2">
                {sounds ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                <Switch checked={sounds} onCheckedChange={setSounds} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> {t("settingsNotifications")}
            </CardTitle>
            <CardDescription>{t("settingsNotifDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: "dailyReminder" as const, label: t("settingsDailyReminder"), desc: t("settingsDailyReminderDesc"), test: "reminder" as const },
              { key: "streakAlerts" as const, label: t("settingsStreakAlerts"), desc: t("settingsStreakAlertsDesc"), test: "streak" as const },
              { key: "deedTips" as const, label: t("settingsDeedTips"), desc: t("settingsDeedTipsDesc"), test: "tip" as const },
              { key: "circleUpdates" as const, label: t("settingsCircleUpdates"), desc: t("settingsCircleUpdatesDesc"), test: undefined },
              { key: "weeklyReport" as const, label: t("settingsWeeklyReport"), desc: t("settingsWeeklyReportDesc"), test: "weekly" as const },
            ].map(({ key, label, desc, test }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  {test && notifSettings[key] && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => sendTestNotification(test)}
                      title="Test notification"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                  )}
                  <Switch
                    checked={notifSettings[key] as boolean}
                    onCheckedChange={(v) => updateSetting(key, v)}
                  />
                </div>
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settingsReminderTime")}</Label>
                <p className="text-xs text-muted-foreground">{t("settingsReminderTimeDesc")}</p>
              </div>
              <Input
                type="time"
                value={notifSettings.reminderTime}
                onChange={(e) => updateSetting("reminderTime", e.target.value)}
                className="w-[120px]"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Privacy */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> {t("settingsPrivacy")}
            </CardTitle>
            <CardDescription>{t("settingsPrivacyDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settingsProfileVisibility")}</Label>
                <p className="text-xs text-muted-foreground">{t("settingsProfileVisDesc")}</p>
              </div>
              <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t("settingsPublic")}</SelectItem>
                  <SelectItem value="friends">{t("settingsFriendsOnly")}</SelectItem>
                  <SelectItem value="private">{t("settingsPrivate")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">{t("settingsLeaderboard")}</Label>
                <p className="text-xs text-muted-foreground">{t("settingsLeaderboardDesc")}</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
        <Card className="border-destructive/30 bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <Lock className="h-4 w-4" /> {t("settingsAccount")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-between" size="sm">
              <span className="flex items-center gap-2"><LogOut className="h-4 w-4" /> {t("settingsSignOut")}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive" size="sm">
              <span className="flex items-center gap-2"><Trash2 className="h-4 w-4" /> {t("settingsDeleteAccount")}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Settings;
