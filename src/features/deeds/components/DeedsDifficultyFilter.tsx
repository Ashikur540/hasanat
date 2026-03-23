import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DIFFICULTY_INFO } from "@/data/deeds";
import {
	ALL_DIFFICULTIES,
	type DeedDifficultyFilter,
} from "@/features/deeds/constants";
import { useI18n } from "@/i18n/I18nProvider";

interface DeedsDifficultyFilterProps {
	value: DeedDifficultyFilter;
	onChange: (value: DeedDifficultyFilter) => void;
}

const DeedsDifficultyFilter = ({
	value,
	onChange,
}: DeedsDifficultyFilterProps) => {
	const { t } = useI18n();

	return (
		<div className="flex items-center gap-2 flex-wrap">
			<Filter className="h-4 w-4 text-muted-foreground" />
			<span className="text-xs text-muted-foreground mr-1">
				{t("deedDifficulty")}
			</span>
			{ALL_DIFFICULTIES.map((d) => (
				<Button
					key={d}
					variant={value === d ? "default" : "outline"}
					size="sm"
					className="h-7 text-xs"
					onClick={() => onChange(d)}
				>
					{d === "all" ? t("catAll") : DIFFICULTY_INFO[d].label}
					{d !== "all" && (
						<span className="ml-1 opacity-60">+{DIFFICULTY_INFO[d].points}</span>
					)}
				</Button>
			))}
		</div>
	);
};

export default DeedsDifficultyFilter;
