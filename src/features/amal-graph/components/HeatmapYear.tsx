import { useMemo } from "react";
import { format, addDays, isAfter, isBefore, subDays } from "date-fns";
import { countToLevel } from "@/lib/amalGraphCalculations";
import { getGridStart, ROLLING_YEAR_WEEKS } from "@/lib/dateUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const CELL_SIZE = 13;
const GAP = 3;
const STEP = CELL_SIZE + GAP;
const DAY_LABEL_WIDTH = 26;
const HEADER_HEIGHT = 20;

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", "Sun"];

const FILL_CLASSES = [
  "fill-heatmap-0",
  "fill-heatmap-1",
  "fill-heatmap-2",
  "fill-heatmap-3",
  "fill-heatmap-4",
] as const;

interface CellData {
  week: number;
  day: number;
  dateStr: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inRange: boolean;
}

interface Props {
  heatmapData: Record<string, number>;
}

const HeatmapYear = ({ heatmapData }: Props) => {
  const { cells, monthPositions, numWeeks } = useMemo(() => {
    const today = new Date();
    const dataStart = subDays(today, ROLLING_YEAR_WEEKS * 7 - 1);
    const gridStart = getGridStart(dataStart);

    const daysFromGridStart = Math.floor(
      (today.getTime() - gridStart.getTime()) / 86400000,
    );
    const numWeeks = Math.floor(daysFromGridStart / 7) + 1;

    const cells: CellData[] = [];
    for (let week = 0; week < numWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        const date = addDays(gridStart, week * 7 + day);
        const beforeStart = isBefore(date, dataStart);
        const afterToday = isAfter(date, today);
        const inRange = !beforeStart && !afterToday;
        const dateStr = format(date, "yyyy-MM-dd");
        const count = inRange ? (heatmapData[dateStr] ?? 0) : 0;
        cells.push({
          week,
          day,
          dateStr,
          count,
          level: inRange ? countToLevel(count) : 0,
          inRange,
        });
      }
    }

    const monthDayCount: Record<string, number> = {};
    cells.forEach((cell) => {
      if (!cell.inRange) return;
      const d = new Date(cell.dateStr + "T00:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      monthDayCount[key] = (monthDayCount[key] ?? 0) + 1;
    });

    const seenYearMonths = new Set<string>();
    const monthPositions: { month: string; week: number }[] = [];
    let lastLabelWeek = -4;

    cells.forEach((cell) => {
      if (!cell.inRange) return;
      const d = new Date(cell.dateStr + "T00:00:00");
      const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
      if (seenYearMonths.has(yearMonth)) return;
      seenYearMonths.add(yearMonth);

      const dayCount = monthDayCount[yearMonth] ?? 0;
      if (dayCount >= 6 && cell.week - lastLabelWeek >= 3) {
        monthPositions.push({ month: MONTH_NAMES[d.getMonth()], week: cell.week });
        lastLabelWeek = cell.week;
      }
    });

    return { cells, monthPositions, numWeeks };
  }, [heatmapData]);

  const svgWidth = DAY_LABEL_WIDTH + numWeeks * STEP;
  const svgHeight = HEADER_HEIGHT + 7 * STEP;

  return (
    <div className="w-full overflow-x-auto">
      {/* Wrapper is relative so the HTML overlay aligns with the SVG */}
      <div className="relative" style={{ width: svgWidth, height: svgHeight }}>

        {/* SVG — purely visual, pointer-events disabled so the overlay handles hover */}
        <svg
          width={svgWidth}
          height={svgHeight}
          className="block"
          style={{ pointerEvents: "none" }}
        >
          {/* Month labels */}
          {monthPositions.map(({ month, week }) => (
            <text
              key={`${month}-${week}`}
              x={DAY_LABEL_WIDTH + week * STEP}
              y={12}
              fontSize={10}
              className="fill-muted-foreground"
            >
              {month}
            </text>
          ))}

          {/* Day-of-week labels */}
          {DAY_LABELS.map((label, i) => (
            <text
              key={i}
              x={0}
              y={HEADER_HEIGHT + i * STEP + CELL_SIZE - 1}
              fontSize={9}
              className="fill-muted-foreground"
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          {cells.map((cell) => (
            <rect
              key={`${cell.week}-${cell.day}`}
              x={DAY_LABEL_WIDTH + cell.week * STEP}
              y={HEADER_HEIGHT + cell.day * STEP}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={3}
              className={FILL_CLASSES[cell.level]}
            />
          ))}
        </svg>

        {/* HTML overlay — one <div> per active cell, acts as Radix TooltipTrigger */}
        {cells
          .filter((cell) => cell.inRange && cell.count > 0)
          .map((cell) => (
            <Tooltip key={`tip-${cell.week}-${cell.day}`}>
              <TooltipTrigger asChild>
                <div
                  className="absolute cursor-pointer"
                  style={{
                    left: DAY_LABEL_WIDTH + cell.week * STEP,
                    top: HEADER_HEIGHT + cell.day * STEP,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRadius: 3,
                  }}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                <span className="font-medium">
                  {format(new Date(cell.dateStr + "T00:00:00"), "MMM d, yyyy")}
                </span>
                <span className="text-muted-foreground ml-1.5">
                  · {cell.count} {cell.count === 1 ? "deed" : "deeds"}
                </span>
              </TooltipContent>
            </Tooltip>
          ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        {FILL_CLASSES.map((cls, i) => (
          <svg key={i} width={CELL_SIZE} height={CELL_SIZE}>
            <rect width={CELL_SIZE} height={CELL_SIZE} rx={3} className={cls} />
          </svg>
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default HeatmapYear;
