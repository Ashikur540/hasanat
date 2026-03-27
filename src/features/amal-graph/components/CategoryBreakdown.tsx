import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CATEGORY_INFO } from "@/data/deeds";
import type { CategoryBreakdownItem } from "@/lib/amalGraphCalculations";

interface Props {
	breakdown: CategoryBreakdownItem[];
	activeDays: number;
	loading: boolean;
	rangeLabel: string;
}

// Color the Progress indicator based on consistency %
function indicatorClass(pct: number): string {
	if (pct >= 50) return ""; // default bg-primary is correct
	if (pct >= 25) return "[&>div]:bg-amber-500";
	return "[&>div]:bg-rose-500";
}

const CategoryBreakdown = ({
	breakdown,
	activeDays,
	loading,
	rangeLabel,
}: Props) => {
	if (loading) {
		return (
			<div className="grid sm:grid-cols-2 gap-4">
				{Array.from({ length: 4 }).map((_, i) => (
					<Card key={i} className="border-border bg-card">
						<CardContent className="p-4">
							<Skeleton className="h-16 w-full rounded-md" />
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (breakdown.length === 0) {
		return (
			<Card className="border-border bg-card">
				<CardContent className="p-6 text-center text-muted-foreground text-sm">
					No deeds logged {rangeLabel}.
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid sm:grid-cols-2 gap-4">
			{breakdown.map((item) => {
				const info = CATEGORY_INFO[item.category];

				return (
					<Card key={item.category} className="border-border bg-card">
						<CardContent className="p-4">
							<div className="flex items-start gap-3">
								<span className="text-2xl mt-0.5 shrink-0">{info.emoji}</span>
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-1">
										<span className="text-sm font-semibold text-foreground">
											{item.category}
										</span>
										<span className="text-xs font-bold text-muted-foreground ml-2 shrink-0">
											{item.consistencyPct}%
										</span>
									</div>
									<p className="text-xs text-muted-foreground mb-2">
										{item.deedCount} deeds · {item.daysWithThisCat}/{activeDays}{" "}
										days {rangeLabel}
									</p>
									<Progress
										value={item.consistencyPct}
										className={cn("h-2", indicatorClass(item.consistencyPct))}
									/>
								</div>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
};

export default CategoryBreakdown;
