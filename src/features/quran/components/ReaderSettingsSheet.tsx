import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	ARABIC_SIZE_MAX,
	ARABIC_SIZE_MIN,
	TRANSLATION_SIZE_MAX,
	TRANSLATION_SIZE_MIN,
	type ReaderPreferences,
} from "@/features/quran/hooks/useReaderPreferences";
import type { ReaderLanguage } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface ReaderSettingsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	prefs: ReaderPreferences;
	onPrefsChange: (patch: Partial<ReaderPreferences>) => void;
	onReset: () => void;
	language: ReaderLanguage;
	onLanguageChange: (language: ReaderLanguage) => void;
}

const ReaderSettingsSheet = ({
	open,
	onOpenChange,
	prefs,
	onPrefsChange,
	onReset,
	language,
	onLanguageChange,
}: ReaderSettingsSheetProps) => {
	const { t } = useI18n();
	const isMobile = useIsMobile();
	const side = isMobile ? "bottom" : "right";

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side={side}
				className={cn(
					"flex flex-col gap-0 p-0",
					isMobile
						? "h-[80vh] rounded-t-2xl"
						: "w-full sm:max-w-md",
				)}
			>
				<SheetHeader className="px-5 py-4 border-b">
					<SheetTitle>{t("quranSettings")}</SheetTitle>
					<SheetDescription className="text-xs">
						{t("quranSettingsDesc")}
					</SheetDescription>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
					<section className="space-y-4">
						<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
							{t("quranDisplay")}
						</h3>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="quran-arabic-size" className="text-sm">
									{t("quranArabicSize")}
								</Label>
								<span className="text-xs tabular-nums text-muted-foreground">
									{prefs.arabicSize}px
								</span>
							</div>
							<div className="flex items-center gap-3">
								<span className="font-quran text-sm text-muted-foreground">ا</span>
								<Slider
									id="quran-arabic-size"
									min={ARABIC_SIZE_MIN}
									max={ARABIC_SIZE_MAX}
									step={1}
									value={[prefs.arabicSize]}
									onValueChange={([value]) =>
										onPrefsChange({ arabicSize: value })
									}
								/>
								<span className="font-quran text-2xl text-muted-foreground">ا</span>
							</div>
							<p
								dir="rtl"
								className="font-quran text-right text-foreground/90 px-2 py-3 rounded-md bg-muted/40"
								style={{ fontSize: `${prefs.arabicSize}px`, lineHeight: 1.9 }}
							>
								بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
							</p>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label htmlFor="quran-translation-size" className="text-sm">
									{t("quranTranslationSize")}
								</Label>
								<span className="text-xs tabular-nums text-muted-foreground">
									{prefs.translationSize}px
								</span>
							</div>
							<div className="flex items-center gap-3">
								<span className="text-xs text-muted-foreground">A</span>
								<Slider
									id="quran-translation-size"
									min={TRANSLATION_SIZE_MIN}
									max={TRANSLATION_SIZE_MAX}
									step={1}
									value={[prefs.translationSize]}
									onValueChange={([value]) =>
										onPrefsChange({ translationSize: value })
									}
								/>
								<span className="text-lg text-muted-foreground">A</span>
							</div>
							<p
								className="text-foreground/90 px-2 py-2 rounded-md bg-muted/40"
								style={{ fontSize: `${prefs.translationSize}px`, lineHeight: 1.6 }}
							>
								In the name of Allah, the Most Gracious, the Most Merciful.
							</p>
						</div>

						<div className="flex items-center justify-between gap-4 pt-1">
							<div className="space-y-0.5">
								<Label htmlFor="quran-show-translation" className="text-sm">
									{t("quranShowTranslation")}
								</Label>
								<p className="text-xs text-muted-foreground">
									{t("quranShowTranslationDesc")}
								</p>
							</div>
							<Switch
								id="quran-show-translation"
								checked={prefs.showTranslation}
								onCheckedChange={(value) =>
									onPrefsChange({ showTranslation: value })
								}
							/>
						</div>
					</section>

					<section className="space-y-3">
						<h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
							{t("quranTranslation")}
						</h3>
						<div className="grid grid-cols-2 gap-2">
							<Button
								type="button"
								variant={language === "en" ? "default" : "outline"}
								onClick={() => onLanguageChange("en")}
								className="justify-start"
							>
								{t("quranTranslationEnglish")}
							</Button>
							<Button
								type="button"
								variant={language === "bn" ? "default" : "outline"}
								onClick={() => onLanguageChange("bn")}
								className="justify-start"
							>
								{t("quranTranslationBangla")}
							</Button>
						</div>
					</section>
				</div>

				<div className="border-t px-5 py-3 flex items-center justify-between gap-2">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onReset}
						className="gap-1.5 text-muted-foreground"
					>
						<RotateCcw className="h-3.5 w-3.5" />
						{t("quranResetDefaults")}
					</Button>
					<Button
						type="button"
						size="sm"
						onClick={() => onOpenChange(false)}
					>
						{t("quranDone")}
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default ReaderSettingsSheet;
