import { useEffect, useMemo, useState } from "react";
import type { Deed } from "@/data/deeds";
import {
	PAGE_SIZE,
	type DeedCategoryFilter,
	type DeedDifficultyFilter,
} from "@/features/deeds/constants";

interface UseDeedFiltersParams {
	deeds: Deed[];
}

export function useDeedFilters({ deeds }: UseDeedFiltersParams) {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<DeedCategoryFilter>("All");
	const [difficulty, setDifficulty] = useState<DeedDifficultyFilter>("all");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	useEffect(() => {
		setVisibleCount(PAGE_SIZE);
	}, [category, difficulty, search]);

	const filtered = useMemo(() => {
		const searchText = search.trim().toLowerCase();
		return deeds.filter((deed) => {
			if (category !== "All" && deed.category !== category) return false;
			if (difficulty !== "all" && deed.difficulty !== difficulty) return false;
			if (
				searchText &&
				!deed.name.toLowerCase().includes(searchText) &&
				!deed.description.toLowerCase().includes(searchText)
			) {
				return false;
			}
			return true;
		});
	}, [deeds, category, difficulty, search]);

	const visible = useMemo(
		() => filtered.slice(0, visibleCount),
		[filtered, visibleCount],
	);
	const hasMore = filtered.length > visibleCount;
	const remainingCount = Math.max(filtered.length - visibleCount, 0);
	const filterKey = `${category}-${difficulty}-${search}`;

	const loadMore = () => {
		setVisibleCount((count) => count + PAGE_SIZE);
	};

	return {
		search,
		setSearch,
		category,
		setCategory,
		difficulty,
		setDifficulty,
		filtered,
		visible,
		hasMore,
		remainingCount,
		filterKey,
		loadMore,
	};
}
