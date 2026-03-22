import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { useI18n } from "@/i18n/I18nProvider";

const weekData = [
	{ day: "Mon", deeds: 5 },
	{ day: "Tue", deeds: 8 },
	{ day: "Wed", deeds: 12 },
	{ day: "Thu", deeds: 10 },
	{ day: "Fri", deeds: 15 },
	{ day: "Sat", deeds: 18 },
	{ day: "Sun", deeds: 9 },
];

const StatsBar = () => {
	const { t } = useI18n();

	const stats = [
		{
			emoji: "⭐",
			label: t("statsPointsToday"),
			value: "45",
			sub: t("statsFromYesterday"),
			accent: false,
		},
		{
			emoji: "📋",
			label: t("statsDeedsToday"),
			value: "3/7",
			sub: t("statsRemaining"),
			accent: false,
		},
		{
			emoji: "🌍",
			label: t("statsGlobalRank"),
			value: "#142",
			sub: t("statsTop5"),
			accent: false,
		},
		{
			emoji: "🏙️",
			label: t("statsCityLevel"),
			value: "Al-Hay",
			sub: t("statsDeeds30"),
			accent: false,
		},
	];

	return (
		<Card className="border-border/60 bg-card shadow-sm overflow-hidden">
			<CardContent className="p-0">
				{/*
				 * "gap as border" trick:
				 * gap-px on a colored container creates 1px dividers between cells
				 * at every breakpoint with zero extra CSS.
				 */}
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
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
							<p className="text-2xl font-extrabold text-foreground tabular-nums leading-none">
								{s.value}
							</p>
							<p className="text-[10px] text-muted-foreground mt-1.5 leading-none">
								{s.sub}
							</p>
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
						<div className="flex items-end justify-between gap-1">
							<p className="text-2xl font-extrabold text-foreground tabular-nums leading-none">
								77
							</p>
							<div className="flex-1 h-[36px] ml-2">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={weekData}
										barSize={5}
										margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
									>
										<Bar
											dataKey="deeds"
											fill="hsl(var(--primary))"
											radius={[2, 2, 0, 0]}
											opacity={0.85}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

export default StatsBar;
