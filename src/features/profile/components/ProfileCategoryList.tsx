import { BookOpen, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useI18n } from "@/i18n/I18nProvider";
import { CATEGORY_INFO } from "@/data/deeds";
import { categoryTranslationKeyMap } from "@/features/deeds/constants";
import type { CategoryBreakdownItem } from "@/lib/amalGraphCalculations";

interface ProfileCategoryListProps {
	categoryBreakdown: CategoryBreakdownItem[];
}

export function ProfileCategoryList({
	categoryBreakdown,
}: ProfileCategoryListProps) {
	const { t } = useI18n();

	const maxCount = Math.max(...categoryBreakdown.map((c) => c.deedCount), 1);

	return (
		<Card className="border-border bg-card">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
					<BookOpen className="h-4 w-4" /> {t("profileDeedCategories")}
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Info className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
							</TooltipTrigger>
							<TooltipContent className="max-w-xs">
								<p className="text-xs">{t("profileCategoryTooltip")}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{categoryBreakdown.map((item) => {
					const catInfo = CATEGORY_INFO[item.category];
					const translationKey = categoryTranslationKeyMap[item.category];
					return (
						<div key={item.category} className="flex items-center gap-3">
							<span className="text-lg w-7 text-center">{catInfo.emoji}</span>
							<span className="text-sm font-medium text-foreground w-20">
								{t(translationKey)}
							</span>
							<div className="flex-1">
								<Progress
									value={(item.deedCount / maxCount) * 100}
									className="h-2"
								/>
							</div>
							<span className="text-xs font-semibold text-muted-foreground w-8 text-right">
								{item.deedCount}
							</span>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
