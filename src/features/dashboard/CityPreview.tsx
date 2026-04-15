import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";

const CityPreview = () => {
  const { t } = useI18n();
  return (
    <Card className="border-border bg-card overflow-hidden h-full flex flex-col opacity-70 pointer-events-none">
      <CardContent className="p-0 flex flex-col flex-1">
        {/* City scene — grows to fill available card height */}
        <div className="relative bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-400 dark:from-sky-900 dark:via-sky-800 dark:to-emerald-900 flex-1 min-h-[160px] overflow-hidden">
          {/* Sky elements */}
          <div className="absolute top-2 right-4 flex gap-1 opacity-60">
            <span className="text-sm">☁️</span>
            <span className="text-xs mt-1">☁️</span>
          </div>
          <div className="absolute top-2 left-3">
            <span className="text-lg">🌤️</span>
          </div>

          {/* Cityscape */}
          <div className="absolute bottom-5 left-0 right-0 flex items-end justify-center gap-1.5 px-3">
            <div className="flex flex-col items-center"><span className="text-3xl">🕌</span></div>
            <div className="flex flex-col items-center"><span className="text-2xl">🌳</span></div>
            <div className="flex flex-col items-center"><span className="text-xl">🏠</span></div>
            <div className="flex flex-col items-center"><span className="text-xl">🌲</span></div>
            <div className="flex flex-col items-center"><span className="text-lg">🏠</span></div>
          </div>

          {/* Ground strip */}
          <div className="absolute bottom-0 left-0 right-0 h-5 bg-emerald-500/40 dark:bg-emerald-800/40" />

          {/* District badge */}
          <div className="absolute bottom-2.5 right-3 bg-white/85 dark:bg-black/50 text-[10px] font-semibold px-2.5 py-1 rounded-full text-foreground backdrop-blur-sm shadow-sm">
            Al-Qaryah
          </div>
        </div>

        {/* Bottom info row */}
        <div className="p-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("cityPreviewTitle")}</p>
            <p className="text-xs text-muted-foreground">{t("cityPreviewSub")}</p>
          </div>
          <Button
            variant="default"
            size="sm"
            className="gap-1.5 rounded-full h-8 px-4 text-xs shrink-0"
            disabled
          >
            <>
              {t("cityPreviewComingSoon")} <ArrowRight className="h-3.5 w-3.5" />
            </>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CityPreview;
