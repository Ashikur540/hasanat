import { format, subDays, isSameDay } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { countToLevel } from "@/lib/amalGraphCalculations";

// Matches the 5-level heatmap palette defined in the design system
const LEVEL_COLORS = ["#EBEDF0", "#9BE9A8", "#40C463", "#30A14E", "#1A7A4A"];
// Today uses accent green so it's distinct from level-4 bars
const TODAY_COLOR = "#2D9E63";

interface DayData {
  day: string;
  label: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
}

interface Props {
  heatmapData: Record<string, number>;
}

// Custom X-axis tick: shows day label + "today" dot indicator
const CustomTick = ({
  x,
  y,
  payload,
  days,
  index,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
  days: DayData[];
  index?: number;
}) => {
  const d = days[index ?? 0];
  if (!d) return null;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={14}
        textAnchor="middle"
        fontSize={10}
        fill={d.isToday ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        fontWeight={d.isToday ? 600 : 400}
      >
        {payload?.value}
      </text>
      {d.isToday && (
        <circle cx={0} cy={24} r={2} fill="hsl(var(--primary))" />
      )}
    </g>
  );
};

// Custom tooltip: only renders when count > 0
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DayData }[];
}) => {
  if (!active || !payload?.length) return null;
  const { label, count } = payload[0].payload;
  if (count === 0) return null;
  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium text-foreground">{label}</p>
      <p className="text-muted-foreground">
        {count} {count === 1 ? "deed" : "deeds"}
      </p>
    </div>
  );
};

const HeatmapWeek = ({ heatmapData }: Props) => {
  const today = new Date();

  const days: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const count = heatmapData[dateStr] ?? 0;
    return {
      day: format(date, "EEE"),
      label: format(date, "MMM d"),
      count,
      level: countToLevel(count),
      isToday: isSameDay(date, today),
    };
  });

  const avgCount = days.reduce((s, d) => s + d.count, 0) / 7;

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={148}>
        <BarChart
          data={days}
          barCategoryGap="40%"
          margin={{ top: 20, right: 4, bottom: 12, left: 4 }}
        >
          {/* X-axis doubles as the visible baseline */}
          <XAxis
            dataKey="day"
            axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
            tickLine={false}
            tick={(props) => <CustomTick {...props} days={days} />}
            interval={0}
          />
          {/* Y-axis is hidden but required for ReferenceLine to work */}
          <YAxis hide domain={[0, "auto"]} />

          {/* Weekly average dashed reference line */}
          {avgCount > 0 && (
            <ReferenceLine
              y={avgCount}
              stroke="hsl(var(--primary))"
              strokeDasharray="4 3"
              strokeOpacity={0.35}
              strokeWidth={1}
            />
          )}

          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", radius: 2 }}
            content={<CustomTooltip />}
          />

          <Bar dataKey="count" radius={[3, 3, 0, 0]} minPointSize={4}>
            {/* Per-cell color: today gets accent, others get heatmap level color */}
            {days.map((d, i) => (
              <Cell
                key={i}
                fill={d.isToday ? TODAY_COLOR : LEVEL_COLORS[d.level]}
              />
            ))}
            {/* Count label above each bar — hidden when count is 0 */}
            <LabelList
              dataKey="count"
              position="top"
              style={{ fontSize: 10, fill: "hsl(var(--foreground))" }}
              formatter={(v: number) => (v > 0 ? String(v) : "")}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HeatmapWeek;
