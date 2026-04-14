import { useMemo } from "react";

// Deterministic fake 52-week heatmap data (level 0–4)
// Pattern: sparse early weeks → denser recent weeks with streaks
const generateHeatmapData = (): number[][] => {
  const weeks = 52;
  const days = 7;
  const data: number[][] = [];

  for (let w = 0; w < weeks; w++) {
    const col: number[] = [];
    const progress = w / weeks; // 0 → 1 (older → recent)

    for (let d = 0; d < days; d++) {
      const seed = (w * 7 + d) % 17;
      const streak = w > 30 && d % 3 !== 2;
      const skip = seed === 0 || seed === 8;

      if (skip && !streak) {
        col.push(0);
      } else if (progress < 0.2) {
        col.push(seed % 3 === 0 ? 0 : 1);
      } else if (progress < 0.5) {
        col.push([0, 1, 1, 2, 2, 1, 0, 2, 1, 3, 1, 2, 0, 1, 2, 1, 3][seed] || 1);
      } else if (progress < 0.8) {
        col.push([1, 2, 3, 2, 3, 4, 2, 3, 2, 4, 3, 2, 1, 3, 4, 3, 2][seed] || 2);
      } else {
        col.push([2, 3, 4, 3, 4, 4, 3, 4, 3, 4, 4, 3, 2, 4, 4, 3, 4][seed] || 3);
      }
    }
    data.push(col);
  }
  return data;
};

const LEVEL_CLASSES: Record<number, string> = {
  0: "bg-heatmap-0",
  1: "bg-heatmap-1",
  2: "bg-heatmap-2",
  3: "bg-heatmap-3",
  4: "bg-heatmap-4",
};

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

const AmalGraphDemo = () => {
  const HEATMAP_DATA = useMemo(() => generateHeatmapData(), []);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {/* Day labels column */}
        <div className="flex flex-col gap-1 pr-1">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="w-8 h-3.5 flex items-center">
              <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
            </div>
          ))}
        </div>

        {/* Week columns — plain dots, no tooltip overhead */}
        {HEATMAP_DATA.map((week, weekIdx) => (
          <div key={weekIdx} className="flex flex-col gap-1">
            {week.map((level, dayIdx) => (
              <div
                key={dayIdx}
                className={`w-3.5 h-3.5 rounded-[3px] ${LEVEL_CLASSES[level]} ${
                  level === 4 ? "dark:shadow-[0_0_6px_hsl(var(--heatmap-4)/0.7)]" : ""
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmalGraphDemo;
