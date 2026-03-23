import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import DeedsSearchBar from "@/features/deeds/components/DeedsSearchBar";
import DeedsCategoryFilter from "@/features/deeds/components/DeedsCategoryFilter";
import type { DeedCategoryFilter } from "@/features/deeds/constants";

export const SORT_OPTIONS = [
	{ value: "newest", label: "Newest" },
	{ value: "oldest", label: "Oldest" },
	{ value: "az", label: "A → Z" },
	{ value: "za", label: "Z → A" },
	{ value: "picked", label: "Most picked" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

interface MyDeedsToolbarProps {
	search: string;
	onSearchChange: (v: string) => void;
	sort: SortOption;
	onSortChange: (v: SortOption) => void;
	visFilter: "all" | "public" | "private";
	onVisFilterChange: (v: "all" | "public" | "private") => void;
	category: DeedCategoryFilter;
	onCategoryChange: (v: DeedCategoryFilter) => void;
}

const MyDeedsToolbar = ({
	search,
	onSearchChange,
	sort,
	onSortChange,
	visFilter,
	onVisFilterChange,
	category,
	onCategoryChange,
}: MyDeedsToolbarProps) => {
	const currentSortLabel =
		SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Sort";

	return (
		<div className="space-y-3">
			{/* Row 1: search + sort + visibility */}
			<div className="flex gap-2 flex-wrap">
				<div className="flex-1 min-w-48">
					<DeedsSearchBar
						value={search}
						onChange={onSearchChange}
						placeholder="Search your deeds..."
					/>
				</div>

				{/* Sort dropdown — styled like screenshot */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="gap-2 font-medium">
							<ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
							{currentSortLabel}
							<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-40">
						{SORT_OPTIONS.map((o) => (
							<DropdownMenuItem
								key={o.value}
								onClick={() => onSortChange(o.value)}
								className="flex items-center justify-between"
							>
								{o.label}
								{sort === o.value && (
									<Check className="h-3.5 w-3.5 text-primary" />
								)}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Visibility toggle */}
				<div className="flex items-center gap-1 bg-muted rounded-lg p-1">
					{(
						[
							["all", "All"],
							["public", "🌍 Public"],
							["private", "🔒 Private"],
						] as const
					).map(([v, label]) => (
						<button
							key={v}
							type="button"
							onClick={() => onVisFilterChange(v)}
							className={cn(
								"px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150",
								visFilter === v
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			{/* Row 2: category pills */}
			<DeedsCategoryFilter
				value={category}
				onChange={onCategoryChange}
				variant="pills"
			/>
		</div>
	);
};

export default MyDeedsToolbar;
