import {
	format,
	startOfMonth,
	endOfMonth,
	getISODay,
	addDays,
	isAfter,
	isSameDay,
} from "date-fns";
import { countToLevel } from "@/lib/amalGraphCalculations";

const BG_CLASSES = [
	"bg-heatmap-0",
	"bg-heatmap-1",
	"bg-heatmap-2",
	"bg-heatmap-3",
	"bg-heatmap-4",
] as const;

const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
	heatmapData: Record<string, number>;
}

const HeatmapMonth = ({ heatmapData }: Props) => {
	const today = new Date();
	const monthStart = startOfMonth(today);
	const monthEnd = endOfMonth(today);
	const daysInMonth = monthEnd.getDate();

	// Offset: ISO day of month start, 0-indexed (0=Mon, 6=Sun)
	const startOffset = getISODay(monthStart) - 1;

	// Build flat slots array: null for empty, Date for actual days
	const totalSlots = startOffset + daysInMonth;
	const numWeeks = Math.ceil(totalSlots / 7);
	const slots: (Date | null)[] = Array(numWeeks * 7).fill(null);
	for (let i = 0; i < daysInMonth; i++) {
		slots[startOffset + i] = addDays(monthStart, i);
	}

	// Chunk into week rows
	const weeks: (Date | null)[][] = Array.from({ length: numWeeks }, (_, w) =>
		slots.slice(w * 7, w * 7 + 7),
	);

	return (
		<div className="w-full max-w-[520px]">
			{/* Day headers */}
			<div className="grid grid-cols-7 gap-1 mb-1">
				{DAY_HEADERS.map((d) => (
					<div
						key={d}
						className="text-center text-[10px] text-muted-foreground font-medium py-1"
					>
						{d}
					</div>
				))}
			</div>

			{/* Week rows */}
			<div className="space-y-1">
				{weeks.map((week, wi) => (
					<div key={wi} className="grid grid-cols-7 gap-1">
						{week.map((date, di) => {
							if (!date) {
								return <div key={di} className="aspect-square" />;
							}
							const isFuture = isAfter(date, today);
							const isToday = isSameDay(date, today);
							const dateStr = format(date, "yyyy-MM-dd");
							const count = isFuture ? 0 : (heatmapData[dateStr] ?? 0);
							const level = isFuture ? 0 : countToLevel(count);

							return (
								<div
									key={di}
									title={
										isFuture || count === 0
											? undefined
											: `${format(date, "MMM d")} · ${count} deeds`
									}
									className={[
										"aspect-square rounded-md flex flex-col items-center justify-center",
										"select-none",
										BG_CLASSES[level],
										isToday ? "ring-2 ring-primary ring-offset-1" : "",
										isFuture ? "opacity-30 cursor-default" : "cursor-default",
									]
										.filter(Boolean)
										.join(" ")}
								>
									{/* Day number */}
									<span
										className={`text-[11px] font-medium leading-none ${
											level > 0 ? "text-white" : "text-muted-foreground"
										}`}
									>
										{date.getDate()}
									</span>
									{/* Deed count — only shown when > 0 */}
									{!isFuture && count > 0 && (
										<span className="text-[9px] leading-none mt-0.5 text-white/80 tabular-nums">
											{count}
										</span>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
};

export default HeatmapMonth;
