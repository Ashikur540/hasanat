import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ReadingProgress } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";

interface ResumeCardProps {
	progress: ReadingProgress | null;
	onResume: () => void;
}

const ResumeCard = ({ progress, onResume }: ResumeCardProps) => {
	const { t } = useI18n();

	if (!progress) return null;

	return (
		<Card className="border-primary/20 bg-primary/5">
			<CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-sm">
					<p className="font-medium">{t("quranResumeLastAyah")}</p>
					<p className="text-muted-foreground">
						{t("quranSurah")} {progress.surahNumber} · {t("quranAyah")}{" "}
						{progress.ayahNumber}
					</p>
				</div>
				<Button type="button" onClick={onResume} className="w-full sm:w-auto">
					{t("quranResumeAction")}
				</Button>
			</CardContent>
		</Card>
	);
};

export default ResumeCard;

