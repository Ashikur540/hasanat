import { useMemo } from "react";

const CELL_SIZE = 13;
const GAP = 3;
const WEEKS = 52;
const DAYS = 7;

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Generate mock data — random intensity 0-4 for each day
const generateMockData = () => {
  const data: number[] = [];
  for (let i = 0; i < WEEKS * DAYS; i++) {
    const rand = Math.random();
    if (rand < 0.2) data.push(0);
    else if (rand < 0.4) data.push(1);
    else if (rand < 0.65) data.push(2);
    else if (rand < 0.85) data.push(3);
    else data.push(4);
  }
  return data;
};

const colorClasses = [
  "fill-heatmap-0",
  "fill-heatmap-1",
  "fill-heatmap-2",
  "fill-heatmap-3",
  "fill-heatmap-4",
];

const Heatmap = () => {
  const data = useMemo(() => generateMockData(), []);
  const totalWidth = WEEKS * (CELL_SIZE + GAP) + 30;
  const totalHeight = DAYS * (CELL_SIZE + GAP) + 25;

  return (
    <div className="w-full overflow-x-auto">
      <svg width={totalWidth} height={totalHeight} className="block">
        {/* Month labels */}
        {monthLabels.map((m, i) => (
          <text
            key={m}
            x={30 + i * (WEEKS / 12) * (CELL_SIZE + GAP)}
            y={10}
            className="fill-muted-foreground text-[10px]"
          >
            {m}
          </text>
        ))}

        {/* Day labels */}
        {["M", "", "W", "", "F", "", "S"].map((d, i) => (
          <text
            key={i}
            x={0}
            y={25 + i * (CELL_SIZE + GAP) + CELL_SIZE / 2}
            className="fill-muted-foreground text-[10px]"
            dominantBaseline="central"
          >
            {d}
          </text>
        ))}

        {/* Cells */}
        {data.map((level, i) => {
          const week = Math.floor(i / DAYS);
          const day = i % DAYS;
          return (
            <rect
              key={i}
              x={30 + week * (CELL_SIZE + GAP)}
              y={18 + day * (CELL_SIZE + GAP)}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={3}
              className={`${colorClasses[level]} transition-colors hover:opacity-80`}
            />
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
        <span>Less</span>
        {colorClasses.map((c, i) => (
          <svg key={i} width={CELL_SIZE} height={CELL_SIZE}>
            <rect width={CELL_SIZE} height={CELL_SIZE} rx={3} className={c} />
          </svg>
        ))}
        <span>More</span>
      </div>
    </div>
  );
};

export default Heatmap;
