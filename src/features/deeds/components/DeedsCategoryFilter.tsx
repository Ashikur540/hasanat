import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { CATEGORY_INFO } from "@/data/deeds";
import {
	ALL_CATEGORIES,
	categoryTranslationKeyMap,
	type DeedCategoryFilter,
} from "@/features/deeds/constants";
import { useI18n } from "@/i18n/I18nProvider";

interface DeedsCategoryFilterProps {
	value: DeedCategoryFilter;
	onChange: (value: DeedCategoryFilter) => void;
	/** "tabs" uses shadcn Tabs (Deed Library), "pills" uses pill buttons (My Deeds) */
	variant?: "tabs" | "pills";
}

const DeedsCategoryFilter = ({
	value,
	onChange,
	variant = "tabs",
}: DeedsCategoryFilterProps) => {
	const { t } = useI18n();

	if (variant === "pills") {
		return (
			<div className="flex gap-2 flex-wrap">
				{ALL_CATEGORIES.map((cat) => (
					<button
						key={cat}
						type="button"
						onClick={() => onChange(cat)}
						className={cn(
							"px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
							value === cat
								? "bg-primary text-primary-foreground border-primary"
								: "bg-background text-muted-foreground border-border hover:border-primary/50",
						)}
					>
						{cat !== "All" && <span className="mr-1">{CATEGORY_INFO[cat].emoji}</span>}
						{t(categoryTranslationKeyMap[cat])}
					</button>
				))}
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<Tabs
				value={value}
				onValueChange={(v) => onChange(v as DeedCategoryFilter)}
			>
				<TabsList className="h-auto flex-wrap">
					{ALL_CATEGORIES.map((cat) => (
						<TabsTrigger key={cat} value={cat} className="gap-1.5 text-xs">
							{cat !== "All" && <span>{CATEGORY_INFO[cat].emoji}</span>}
							{t(categoryTranslationKeyMap[cat])}
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
		</div>
	);
};

export default DeedsCategoryFilter;
