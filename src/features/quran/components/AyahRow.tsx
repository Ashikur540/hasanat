import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Copy, MapPin, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AyahNumberMedallion from "@/features/quran/components/AyahNumberMedallion";
import { useToast } from "@/hooks/use-toast";
import type { Ayah } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface AyahRowProps {
	ayah: Ayah;
	isBookmarked: boolean;
	isLastRead?: boolean;
	showTranslation?: boolean;
	onBookmark: () => void;
	onSetLastRead: () => void;
}

const AyahRow = ({
	ayah,
	isBookmarked,
	isLastRead = false,
	showTranslation = true,
	onBookmark,
	onSetLastRead,
}: AyahRowProps) => {
	const { t } = useI18n();
	const { toast } = useToast();
	const [showHighlight, setShowHighlight] = useState(isLastRead);

	useEffect(() => {
		if (!isLastRead) {
			setShowHighlight(false);
			return;
		}
		setShowHighlight(true);
		const timer = setTimeout(() => setShowHighlight(false), 4000);
		return () => clearTimeout(timer);
	}, [isLastRead]);

	const handleCopy = async () => {
		const text = `${ayah.textArabic}\n\n${ayah.translation}\n\n— Surah ${ayah.surahNumber}:${ayah.ayahNumber}`;
		try {
			await navigator.clipboard.writeText(text);
			toast({ title: t("quranCopied") });
		} catch {
			toast({
				title: t("quranCopyFailed"),
				variant: "destructive",
			});
		}
	};

	return (
		<Card
			id={`ayah-${ayah.ayahNumber}`}
			data-ayah-number={ayah.ayahNumber}
			className={cn(
				"group relative border-border/70 transition-all duration-500",
				showHighlight &&
					"border-l-4 border-l-primary bg-primary/5 shadow-sm ring-1 ring-primary/10",
			)}
		>
			<CardContent className="p-5 space-y-4">
				<div className="flex items-center justify-between gap-3">
					<div className="flex items-center gap-2.5">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									aria-label={t("quranAyahActions")}
									className="rounded-md transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
								>
									<AyahNumberMedallion
										value={ayah.ayahNumber}
										size="md"
										tone={isBookmarked ? "gold" : "primary"}
									/>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-52">
								<DropdownMenuItem onClick={onSetLastRead}>
									<MapPin className="mr-2 h-4 w-4" />
									{t("quranSetLastRead")}
								</DropdownMenuItem>
								<DropdownMenuItem onClick={onBookmark}>
									{isBookmarked ? (
										<BookmarkCheck className="mr-2 h-4 w-4" />
									) : (
										<Bookmark className="mr-2 h-4 w-4" />
									)}
									{isBookmarked
										? t("quranRemoveBookmark")
										: t("quranAddBookmark")}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={handleCopy}>
									<Copy className="mr-2 h-4 w-4" />
									{t("quranCopy")}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						{showHighlight && (
							<span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
								<MapPin className="h-3 w-3" />
								{t("quranContinueHere")}
							</span>
						)}
						{isBookmarked && !showHighlight && (
							<span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-[hsl(var(--gold))]/90">
								<BookmarkCheck className="h-3.5 w-3.5" />
								{t("quranSaved")}
							</span>
						)}
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="h-8 w-8 text-muted-foreground"
								aria-label={t("quranAyahActions")}
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52">
							<DropdownMenuItem onClick={onSetLastRead}>
								<MapPin className="mr-2 h-4 w-4" />
								{t("quranSetLastRead")}
							</DropdownMenuItem>
							<DropdownMenuItem onClick={onBookmark}>
								{isBookmarked ? (
									<BookmarkCheck className="mr-2 h-4 w-4" />
								) : (
									<Bookmark className="mr-2 h-4 w-4" />
								)}
								{isBookmarked
									? t("quranRemoveBookmark")
									: t("quranAddBookmark")}
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleCopy}>
								<Copy className="mr-2 h-4 w-4" />
								{t("quranCopy")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<p
					dir="rtl"
					className="font-quran leading-loose text-right font-normal"
					style={{
						fontSize: "var(--quran-arabic-size, 26px)",
						lineHeight: "var(--quran-arabic-line-height, 2)",
					}}
				>
					{ayah.textArabic}
				</p>
				{showTranslation && (
					<p
						className="leading-relaxed text-foreground/90"
						style={{
							fontSize: "var(--quran-translation-size, 14px)",
						}}
					>
						{ayah.translation}
					</p>
				)}
			</CardContent>
		</Card>
	);
};

export default AyahRow;
