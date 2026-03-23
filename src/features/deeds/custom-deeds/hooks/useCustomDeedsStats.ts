import { useMemo } from "react";
import type { CustomDeed } from "@/features/deeds/types";

interface UseDeedsStatsOptions {
	deeds: CustomDeed[];
}

export function useDeedsStats({ deeds }: UseDeedsStatsOptions) {
	return useMemo(() => {
		const publicCount = deeds.filter(
			(deed) => deed.visibility === "public",
		).length;
		const totalPicks = deeds
			.filter((deed) => deed.visibility === "public")
			.reduce((sum, deed) => sum + deed.pickCount, 0);

		return {
			totalDeeds: deeds.length,
			publicCount,
			totalPicks,
		};
	}, [deeds]);
}
