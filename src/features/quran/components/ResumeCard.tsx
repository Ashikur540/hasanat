import { ArrowRight, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ReadingProgress } from "@/features/quran/types";
import { formatRelativeTime } from "@/features/quran/lib/formatRelativeTime";
import { useI18n } from "@/i18n/I18nProvider";

interface ResumeCardProps {
	progress: ReadingProgress | null;
	onResume: () => void;
}

const ResumeCard = ({ progress, onResume }: ResumeCardProps) => {
	const { t } = useI18n();

	if (!progress) return null;

	const englishName = progress.surahNameEnglish ?? `${t("quranSurah")} ${progress.surahNumber}`;
	const arabicName = progress.surahNameArabic;

	return (
		<Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-[hsl(var(--gold))]/5">
			<div
				aria-hidden
				className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-[hsl(var(--gold))]/10 blur-3xl"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[hsl(var(--gold))] via-primary to-[hsl(var(--gold))]/40"
			/>
			<CardContent className="relative p-4 sm:p-5">
				<div className="flex items-start gap-3">
					<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/20">
						<BookOpen className="h-5 w-5" />
					</div>
					<div className="min-w-0 flex-1 space-y-2">
						<div>
							<p className="text-[10px] uppercase tracking-[0.18em] text-primary/80 font-semibold">
								{t("quranContinueReading")}
							</p>
							<div className="flex items-baseline gap-2 flex-wrap mt-1">
								<p className="font-semibold text-base">{englishName}</p>
								{arabicName && (
									<p className="font-quran text-xl text-foreground/85">
										{arabicName}
									</p>
								)}
							</div>
							<p className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
								<span>
									{t("quranAyah")} {progress.ayahNumber}
								</span>
								<span aria-hidden>·</span>
								<span className="inline-flex items-center gap-1">
									<Clock className="h-3 w-3" />
									{formatRelativeTime(progress.updatedAt)}
								</span>
							</p>
						</div>
						{progress.ayahPreview && (
							<p className="text-sm text-foreground/75 italic line-clamp-2 border-l-2 border-[hsl(var(--gold))]/40 pl-3">
								"{progress.ayahPreview}"
							</p>
						)}
						<Button
							type="button"
							onClick={onResume}
							size="sm"
							className="mt-2 gap-1.5"
						>
							{t("quranResumeAction")}
							<ArrowRight className="h-3.5 w-3.5" />
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default ResumeCard;
