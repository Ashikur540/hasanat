import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, ResponsiveContainer, Tooltip } from "recharts";
import { useI18n } from "@/i18n/I18nProvider";
import { useStreak } from "./hooks/useStreak";
import { useWeekGraph } from "./hooks/useWeekGraph";
import { useTodayTodos } from "./hooks/useTodayTodos";
import { usePrayerChecklistState } from "@/hooks/usePrayerChecklistState";

const StatsBar = () => {
	const { t } = useI18n();

	// Get prayer completion status first
	const { prayers } = usePrayerChecklistState();
	const allPrayersCompleted =
		prayers.length > 0 && prayers.every((p) => p.completed);

	const {
		todayPoints,
		completedCount,
		totalCount,
		loading: todosLoading,
	} = useTodayTodos(allPrayersCompleted); // Pass the prayer status!

	const { currentStreak, loading: streakLoading } = useStreak();
	const { data: weekData, weekTotal, loading: weekLoading } = useWeekGraph();

	const isLoading = todosLoading || streakLoading || weekLoading;

	const stats = [
		{
			emoji: "⭐",
			label: t("statsPointsToday"),
			value: isLoading ? null : String(todayPoints),
			// sub: t("statsFromYesterday"),
		},
		{
			emoji: "📋",
			label: t("statsDeedsToday"),
			value: isLoading ? null : `${completedCount}/${totalCount}`,
			// sub: t("statsRemaining"),
		},
		{
			emoji: "🔥",
			label: t("streakCurrent"),
			value: isLoading ? null : String(currentStreak),
			// sub: `${t("commonDays")} streak`,
		},
		// {
		// 	emoji: "🌍",
		// 	label: t("statsGlobalRank"),
		// 	value: "#142",
		// 	sub: t("statsTop5"),
		// 	accent: false,
		// },
		// {
		// 	emoji: "🏙️",
		// 	label: t("statsCityLevel"),
		// 	value: "Al-Hay",
		// 	sub: t("statsDeeds30"),
		// 	accent: false,
		// },
	];

	return (
		<Card className="border-border/60 bg-card shadow-sm overflow-hidden">
			<CardContent className="p-0">
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border">
					{stats.map((s) => (
						<div
							key={s.label}
							className="bg-card px-4 py-3.5 flex flex-col justify-between min-h-[82px] hover:bg-muted/30 transition-colors"
						>
							<div className="flex items-center gap-1.5 mb-1.5">
								<span className="text-sm leading-none">{s.emoji}</span>
								<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
									{s.label}
								</span>
							</div>
							{s.value === null ? (
								<Skeleton className="h-7 w-16 mb-1" />
							) : (
								<p className="text-2xl font-extrabold text-foreground tabular-nums leading-none">
									{s.value}
								</p>
							)}
							{/* <p className="text-[10px] text-muted-foreground mt-1.5 leading-none">
								{s.sub}
							</p> */}
						</div>
					))}

					{/* Weekly chart cell */}
					<div className="bg-card px-4 py-3.5 min-h-[82px] hover:bg-muted/30 transition-colors">
						<div className="flex items-center gap-1.5 mb-1.5">
							<span className="text-sm leading-none">📊</span>
							<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
								{t("statsThisWeek")}
							</span>
						</div>
						{weekLoading ? (
							<Skeleton className="h-7 w-16" />
						) : (
							<div className="flex items-end justify-between gap-1">
								<p className="text-2xl font-extrabold text-foreground tabular-nums leading-none">
									{weekTotal}
								</p>
								<div className="flex-1 h-[36px] ml-2">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={weekData}
											barSize={6}
											margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
										>
											<Tooltip
												cursor={{ fill: "hsl(var(--muted))", radius: 2 }}
												content={({ active, payload }) => {
													if (!active || !payload?.length) return null;
													const { date, count } = payload[0].payload;
													const day = new Date(
														date + "T00:00:00",
													).toLocaleDateString(undefined, {
														weekday: "short",
														month: "short",
														day: "numeric",
													});
													return (
														<div className="rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md">
															<p className="font-medium text-foreground">
																{day}
															</p>
															<p className="text-muted-foreground">
																{count} deed{count !== 1 ? "s" : ""}
															</p>
														</div>
													);
												}}
											/>
											<Bar
												dataKey="count"
												fill="hsl(var(--primary))"
												radius={[2, 2, 0, 0]}
												opacity={0.85}
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>
						)}
						{/* <p className="text-[10px] text-muted-foreground mt-1.5 leading-none">
							{t("statsFromYesterday")}
						</p> */}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default StatsBar;
