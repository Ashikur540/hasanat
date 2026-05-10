import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AyahBookmark } from "@/features/quran/types";
import { useI18n } from "@/i18n/I18nProvider";

interface BookmarkPanelProps {
	bookmarks: AyahBookmark[];
	onJump: (surahNumber: number, ayahNumber: number) => void;
	onRemove: (bookmarkId: string) => void;
}

const BookmarkPanel = ({ bookmarks, onJump, onRemove }: BookmarkPanelProps) => {
	const { t } = useI18n();

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-base">{t("quranBookmarks")}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{bookmarks.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{t("quranNoBookmarks")}
					</p>
				) : (
					bookmarks.map((bookmark) => (
						<div
							key={bookmark.id}
							className="rounded-md border p-3 flex flex-col gap-2"
						>
							<p className="text-sm font-medium">
								{t("quranSurah")} {bookmark.surahNumber} · {t("quranAyah")}{" "}
								{bookmark.ayahNumber}
							</p>
							{bookmark.note && (
								<p className="text-xs text-muted-foreground">{bookmark.note}</p>
							)}
							<div className="flex items-center gap-2">
								<Button
									type="button"
									size="sm"
									variant="outline"
									onClick={() =>
										onJump(bookmark.surahNumber, bookmark.ayahNumber)
									}
								>
									{t("quranJumpToAyah")}
								</Button>
								<Button
									type="button"
									size="sm"
									variant="ghost"
									onClick={() => onRemove(bookmark.id)}
								>
									{t("quranRemoveBookmark")}
								</Button>
							</div>
						</div>
					))
				)}
			</CardContent>
		</Card>
	);
};

export default BookmarkPanel;

