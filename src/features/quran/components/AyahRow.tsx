import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Ayah } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";

interface AyahRowProps {
	ayah: Ayah;
	isBookmarked: boolean;
	onBookmark: () => void;
	onRead: () => void;
}

const AyahRow = ({ ayah, isBookmarked, onBookmark, onRead }: AyahRowProps) => {
	const { t } = useI18n();

	return (
		<Card id={`ayah-${ayah.ayahNumber}`} className="border-border/80">
			<CardContent className="p-4 space-y-4">
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm font-medium text-muted-foreground">
						{t("quranAyah")} {ayah.ayahNumber}
					</p>
					<div className="flex items-center gap-2">
						<Button type="button" size="sm" variant="outline" onClick={onRead}>
							{t("quranMarkRead")}
						</Button>
						<Button type="button" size="sm" onClick={onBookmark}>
							{isBookmarked
								? t("quranRemoveBookmark")
								: t("quranAddBookmark")}
						</Button>
					</div>
				</div>
				<p
					dir="rtl"
					className="font-quran text-2xl leading-loose text-right font-normal"
				>
					{ayah.textArabic}
				</p>
				<p className="text-sm leading-relaxed text-foreground/90">
					{ayah.translation}
				</p>
			</CardContent>
		</Card>
	);
};

export default AyahRow;
