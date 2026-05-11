import { ArrowLeft, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SurahMeta } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface StickyReaderHeaderProps {
	surah?: SurahMeta;
	visible: boolean;
	onBack: () => void;
	onOpenSettings: () => void;
}

const StickyReaderHeader = ({
	surah,
	visible,
	onBack,
	onOpenSettings,
}: StickyReaderHeaderProps) => {
	const { t } = useI18n();

	return (
		<div
			className={cn(
				"fixed inset-x-0 top-14 z-40 transition-all duration-300",
				visible
					? "opacity-100 translate-y-0 pointer-events-auto"
					: "opacity-0 -translate-y-3 pointer-events-none",
			)}
			aria-hidden={!visible}
		>
			<div className="container mx-auto px-4">
				<div className="mx-auto max-w-3xl flex items-center justify-between gap-3 rounded-b-xl border-b border-x border-primary/20 bg-background/85 px-3 py-2 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/70">
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="h-8 w-8"
					onClick={onBack}
					aria-label={t("quranBack")}
				>
					<ArrowLeft className="h-4 w-4" />
				</Button>
				<div className="min-w-0 flex-1 text-center">
					<p className="font-quran text-base leading-none truncate">
						{surah?.nameArabic ?? ""}
					</p>
					<p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 truncate">
						{surah?.nameEnglish ?? ""}
					</p>
				</div>
				<Button
					type="button"
					size="icon"
					variant="ghost"
					className="h-8 w-8"
					onClick={onOpenSettings}
					aria-label={t("quranSettings")}
				>
					<Settings2 className="h-4 w-4" />
				</Button>
				</div>
			</div>
		</div>
	);
};

export default StickyReaderHeader;
