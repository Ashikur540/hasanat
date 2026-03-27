import { useState } from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { useAmalGraph } from "@/features/amal-graph/hooks/useAmalGraph";
import type { TimeRange } from "@/lib/dateUtils";
import AmalStatCards from "@/features/amal-graph/components/AmalStatCards";
import HeatmapYear from "@/features/amal-graph/components/HeatmapYear";
import HeatmapMonth from "@/features/amal-graph/components/HeatmapMonth";
import HeatmapWeek from "@/features/amal-graph/components/HeatmapWeek";
import CategoryBreakdown from "@/features/amal-graph/components/CategoryBreakdown";

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };
const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.08 } },
};

const RANGE_LABELS: Record<TimeRange, string> = {
	week: "this week",
	month: "this month",
	year: "this year",
};

const RANGES: TimeRange[] = ["week", "month", "year"];

const AmalGraph = () => {
	const { t } = useI18n();
	const [range, setRange] = useState<TimeRange>("year");
	const data = useAmalGraph(range);

	const rangeTabLabel: Record<TimeRange, string> = {
		week: t("amalWeek"),
		month: t("amalMonth"),
		year: t("amalYear"),
	};

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={stagger}
			className="container mx-auto px-4 py-6 space-y-6"
		>
			{/* Header + segmented control */}
			<motion.div
				variants={fadeUp}
				transition={{ duration: 0.4 }}
				className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
			>
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-foreground">
						{t("amalGraphTitle")} 📊
					</h1>
					<p className="text-muted-foreground text-sm mt-1">
						{t("amalGraphSub")}
					</p>
				</div>

				{/* Segmented control — drives all content on the page */}
				<div className="flex rounded-lg border border-border bg-muted p-1 gap-0.5 self-start shrink-0">
					{RANGES.map((r) => (
						<button
							key={r}
							onClick={() => setRange(r)}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
								range === r
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}
						>
							{rangeTabLabel[r]}
						</button>
					))}
				</div>
			</motion.div>

			{/* Stat cards */}
			<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
				<AmalStatCards
					totalDeeds={data.totalDeeds}
					activeDays={data.activeDays}
					consistency={data.consistency}
					topCategory={data.topCategory}
					longestStreak={data.longestStreak}
					totalPoints={data.totalPoints}
					loading={data.loading}
					staticLoading={data.staticLoading}
				/>
			</motion.div>

			{/* Heatmap card */}
			<motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
				<Card className="border-border bg-card">
					<CardContent className="p-6">
						<div className="flex items-center gap-2 mb-6">
							<h2 className="text-lg font-semibold text-foreground">
								{t("amalActivityHeatmap")}
							</h2>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										type="button"
										aria-label="Show help for activity heatmap"
										className="w-4 h-4 text-muted-foreground cursor-pointer shrink-0 flex items-center justify-center"
									>
										<Info aria-hidden="true" className="w-4 h-4" />
									</button>
								</TooltipTrigger>
								<TooltipContent side="right" className="max-w-64 text-xs p-3">
									<p className="text-muted-foreground">
										Log consistently to grow a dense, dark graph — your living
										record of spiritual effort.
									</p>
								</TooltipContent>
							</Tooltip>
						</div>

						{data.loading ? (
							<Skeleton className="h-36 w-full rounded-md" />
						) : (
							<>
								{range === "year" && (
									<HeatmapYear heatmapData={data.heatmapData} />
								)}
								{range === "month" && (
									<HeatmapMonth heatmapData={data.heatmapData} />
								)}
								{range === "week" && (
									<HeatmapWeek heatmapData={data.heatmapData} />
								)}
							</>
						)}

						{/* Ramadan highlight — year tab only, only when fully completed */}
						{range === "year" &&
							!data.loading &&
							data.ramadanHighlight.show && (
								<div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
									<div className="flex items-center gap-2">
										<span className="text-lg">🌙</span>
										<div>
											<p className="text-sm font-semibold text-foreground">
												{t("amalRamadanHighlight")}
											</p>
											<p className="text-xs text-muted-foreground">
												{t("amalRamadanDesc")}
											</p>
										</div>
									</div>
								</div>
							)}
					</CardContent>
				</Card>
			</motion.div>

			{/* Category breakdown */}
			<motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
				<div className="flex items-center gap-2 mb-4">
					<h2 className="text-lg font-semibold text-foreground">
						{t("amalCategoryBreakdown")}
					</h2>
					<Tooltip>
						<TooltipTrigger asChild>
							<Info className="w-4 h-4 text-muted-foreground cursor-pointer shrink-0" />
						</TooltipTrigger>
						<TooltipContent side="right" className="max-w-72 text-xs p-3">
							<p className="font-semibold text-foreground mb-1.5">
								What this shows
							</p>
							<p className="mb-1.5">
								For each deed category, you can see how often you practiced it
								on your active days.
							</p>
							<p className="mb-1.5 text-muted-foreground">
								<span className="text-foreground font-medium">Example:</span> if
								you logged deeds on 20 days and did Dhikr on 15 of them, your
								Dhikr consistency is 75% — shown in green.
							</p>
							<ul className="space-y-0.5 text-muted-foreground">
								<li>🟢 Green bar — 50 %+ consistency (strong habit)</li>
								<li>🟡 Amber bar — 25–49 % (building up)</li>
								<li>🔴 Red bar — below 25 % (needs attention)</li>
							</ul>
						</TooltipContent>
					</Tooltip>
				</div>
				<CategoryBreakdown
					breakdown={data.categoryBreakdown}
					activeDays={data.activeDays}
					loading={data.loading}
					rangeLabel={RANGE_LABELS[range]}
				/>
			</motion.div>
		</motion.div>
	);
};

export default AmalGraph;
