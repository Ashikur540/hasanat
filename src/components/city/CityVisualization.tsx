import { motion } from "framer-motion";
import { useState, useMemo } from "react";

export type TimeOfDay = "fajr" | "morning" | "noon" | "evening" | "night";

interface CityVisualizationProps {
  categoryData: Record<string, { count: number; vitality: number; emoji: string; element: string }>;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  timeOfDay: TimeOfDay;
}

// Sky themes per time of day
const skyThemes: Record<TimeOfDay, {
  sky: [string, string, string];
  ground: string;
  road: string;
  roadMark: string;
  sidewalk: string;
  windowLit: number;
  windowDark: string;
  shadowOpacity: number;
  starOpacity: number;
  ambient: string;
  labelColor: string;
}> = {
  fajr: {
    sky: ["hsl(270 30% 15%)", "hsl(340 40% 35%)", "hsl(30 60% 60%)"],
    ground: "hsl(220 15% 14%)", road: "hsl(220 10% 18%)", roadMark: "hsl(42 40% 50%)", sidewalk: "hsl(220 10% 22%)",
    windowLit: 0.3, windowDark: "hsl(220 20% 15%)", shadowOpacity: 0.2, starOpacity: 0.3,
    ambient: "hsl(340 30% 50%)", labelColor: "hsl(30 40% 70%)",
  },
  morning: {
    sky: ["hsl(200 60% 70%)", "hsl(200 50% 80%)", "hsl(40 70% 85%)"],
    ground: "hsl(140 15% 25%)", road: "hsl(30 8% 40%)", roadMark: "hsl(42 50% 65%)", sidewalk: "hsl(30 10% 50%)",
    windowLit: 0.15, windowDark: "hsl(200 15% 35%)", shadowOpacity: 0.15, starOpacity: 0,
    ambient: "hsl(40 70% 70%)", labelColor: "hsl(220 20% 30%)",
  },
  noon: {
    sky: ["hsl(210 70% 60%)", "hsl(200 60% 75%)", "hsl(190 40% 85%)"],
    ground: "hsl(140 12% 28%)", road: "hsl(30 8% 45%)", roadMark: "hsl(0 0% 90%)", sidewalk: "hsl(30 10% 55%)",
    windowLit: 0.1, windowDark: "hsl(200 10% 45%)", shadowOpacity: 0.1, starOpacity: 0,
    ambient: "hsl(50 80% 75%)", labelColor: "hsl(220 20% 25%)",
  },
  evening: {
    sky: ["hsl(250 35% 20%)", "hsl(20 50% 40%)", "hsl(35 60% 55%)"],
    ground: "hsl(220 15% 15%)", road: "hsl(220 10% 20%)", roadMark: "hsl(42 40% 50%)", sidewalk: "hsl(220 10% 25%)",
    windowLit: 0.55, windowDark: "hsl(220 20% 14%)", shadowOpacity: 0.25, starOpacity: 0.15,
    ambient: "hsl(30 60% 50%)", labelColor: "hsl(30 40% 65%)",
  },
  night: {
    sky: ["hsl(230 30% 5%)", "hsl(220 25% 8%)", "hsl(220 20% 12%)"],
    ground: "hsl(220 20% 10%)", road: "hsl(220 10% 15%)", roadMark: "hsl(42 50% 56%)", sidewalk: "hsl(220 10% 20%)",
    windowLit: 0.75, windowDark: "hsl(220 20% 12%)", shadowOpacity: 0.35, starOpacity: 1,
    ambient: "hsl(42 50% 56%)", labelColor: "hsl(60 10% 40%)",
  },
};

// Deterministic stars
const starData = Array.from({ length: 80 }, (_, i) => ({
  x: ((i * 137.508) % 1200),
  y: ((i * 97.3 + 13) % 300) * 0.5,
  r: ((i * 31) % 100) / 100 * 1.2 + 0.3,
  twinkleDelay: ((i * 53) % 100) / 30,
}));

const Stars = ({ opacity }: { opacity: number }) => {
  if (opacity <= 0) return null;
  return (
    <g opacity={opacity}>
      {starData.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="hsl(60 20% 95%)"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: s.twinkleDelay }}
        />
      ))}
    </g>
  );
};

const CelestialBody = ({ timeOfDay }: { timeOfDay: TimeOfDay }) => {
  if (timeOfDay === "night" || timeOfDay === "fajr" || timeOfDay === "evening") {
    // Crescent moon
    return (
      <g transform="translate(1050, 50)">
        <circle cx={0} cy={0} r={22} fill="hsl(42 50% 56%)" opacity={timeOfDay === "night" ? 0.9 : 0.5} />
        <circle cx={7} cy={-5} r={18} fill={skyThemes[timeOfDay].sky[0]} />
        <motion.circle
          cx={0} cy={0} r={30}
          fill="none"
          stroke="hsl(42 50% 56%)"
          strokeWidth={0.5}
          opacity={0.12}
          animate={{ r: [30, 38, 30], opacity: [0.12, 0.04, 0.12] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </g>
    );
  }
  // Sun
  return (
    <g transform={`translate(${timeOfDay === "morning" ? 200 : timeOfDay === "noon" ? 600 : 900}, ${timeOfDay === "noon" ? 40 : 65})`}>
      <motion.circle
        cx={0} cy={0} r={35}
        fill="hsl(42 80% 70%)"
        opacity={0.15}
        animate={{ r: [35, 45, 35] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <circle cx={0} cy={0} r={18} fill="hsl(42 90% 70%)" opacity={0.9} />
    </g>
  );
};

// Building component
const Building = ({
  x, width, height, cat, data, isSelected, isHovered, onHover, onClick, index, theme,
}: {
  x: number; width: number; height: number; cat: string;
  data: { count: number; vitality: number; emoji: string; element: string };
  isSelected: boolean; isHovered: boolean;
  onHover: (h: boolean) => void; onClick: () => void; index: number;
  theme: typeof skyThemes.night;
}) => {
  const groundY = 380;
  const buildingY = groundY - height;
  const windowRows = Math.floor(height / 16);
  const windowCols = Math.max(2, Math.floor(width / 16));

  const colors: Record<string, { base: string; baseDark: string; lit: string; accent: string }> = {
    Salah:     { base: "hsl(150 30% 25%)", baseDark: "hsl(150 30% 18%)", lit: "hsl(42 60% 60%)",  accent: "hsl(150 66% 40%)" },
    Quran:     { base: "hsl(200 25% 28%)", baseDark: "hsl(200 25% 20%)", lit: "hsl(42 50% 55%)",  accent: "hsl(200 50% 45%)" },
    Sadaqah:   { base: "hsl(145 25% 24%)", baseDark: "hsl(145 25% 16%)", lit: "hsl(145 50% 50%)", accent: "hsl(145 52% 45%)" },
    Dhikr:     { base: "hsl(180 20% 26%)", baseDark: "hsl(180 20% 18%)", lit: "hsl(180 40% 55%)", accent: "hsl(180 40% 40%)" },
    Character: { base: "hsl(260 18% 28%)", baseDark: "hsl(260 18% 20%)", lit: "hsl(42 50% 58%)",  accent: "hsl(260 30% 45%)" },
    Family:    { base: "hsl(20 20% 28%)",  baseDark: "hsl(20 20% 20%)",  lit: "hsl(30 60% 55%)",  accent: "hsl(20 40% 40%)" },
    Fasting:   { base: "hsl(270 18% 26%)", baseDark: "hsl(270 18% 18%)", lit: "hsl(270 40% 55%)", accent: "hsl(270 30% 45%)" },
    Knowledge: { base: "hsl(45 20% 26%)",  baseDark: "hsl(45 20% 18%)",  lit: "hsl(42 55% 55%)",  accent: "hsl(45 40% 40%)" },
  };

  const c = colors[cat] || colors.Salah;
  const litProbability = theme.windowLit + data.vitality * 0.3;

  return (
    <motion.g
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      style={{ cursor: "pointer" }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {/* Shadow */}
      <rect x={x + 5} y={buildingY + 5} width={width} height={height} rx={2} fill="black" opacity={theme.shadowOpacity} />

      {/* 3D side face */}
      <polygon
        points={`${x + width},${buildingY} ${x + width + 8},${buildingY - 5} ${x + width + 8},${groundY - 5} ${x + width},${groundY}`}
        fill={c.baseDark}
        opacity={0.7}
      />

      {/* Main body */}
      <motion.rect
        x={x} y={buildingY} width={width} height={height} rx={1}
        fill={c.base}
        stroke={isSelected ? c.accent : "transparent"}
        strokeWidth={isSelected ? 2.5 : 0}
        animate={isHovered ? { y: buildingY - 6 } : { y: buildingY }}
        transition={{ duration: 0.2 }}
      />

      {/* Top accent */}
      <motion.rect
        x={x} y={buildingY} width={width} height={5} rx={1}
        fill={c.accent} opacity={0.8}
        animate={isHovered ? { y: buildingY - 6 } : { y: buildingY }}
        transition={{ duration: 0.2 }}
      />

      {/* 3D top face */}
      <motion.polygon
        points={`${x},${buildingY} ${x + 8},${buildingY - 5} ${x + width + 8},${buildingY - 5} ${x + width},${buildingY}`}
        fill={c.accent} opacity={0.3}
        animate={isHovered ? { transform: `translate(0, -6)` } : { transform: `translate(0, 0)` }}
        transition={{ duration: 0.2 }}
      />

      {/* Windows */}
      <motion.g animate={isHovered ? { y: -6 } : { y: 0 }} transition={{ duration: 0.2 }}>
        {Array.from({ length: windowRows }).map((_, row) =>
          Array.from({ length: windowCols }).map((_, col) => {
            const wx = x + 7 + col * ((width - 14) / Math.max(windowCols - 1, 1)) - 2.5;
            const wy = buildingY + 12 + row * 16;
            const seed = (row * 7 + col * 13 + cat.charCodeAt(0)) % 100;
            const isLit = seed < litProbability * 100;
            return (
              <motion.rect
                key={`${row}-${col}`}
                x={wx} y={wy} width={5} height={7} rx={0.5}
                fill={isLit ? c.lit : theme.windowDark}
                opacity={isLit ? 0.9 : 0.35}
                animate={isLit ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={isLit ? { duration: 2 + (seed % 3), repeat: Infinity, delay: (seed % 15) * 0.15 } : {}}
              />
            );
          })
        )}
      </motion.g>

      {/* Rooftop elements */}
      <motion.g animate={isHovered ? { y: -6 } : { y: 0 }} transition={{ duration: 0.2 }}>
        {cat === "Salah" && (
          <>
            <ellipse cx={x + width / 2} cy={buildingY - 2} rx={width / 3} ry={7} fill={c.accent} opacity={0.5} />
            <rect x={x + width / 2 - 2} y={buildingY - 22} width={4} height={18} fill={c.accent} opacity={0.7} rx={1} />
            <circle cx={x + width / 2} cy={buildingY - 24} r={4} fill={theme.ambient} opacity={0.85} />
          </>
        )}
        {cat === "Quran" && (
          <polygon points={`${x},${buildingY} ${x + width / 2},${buildingY - 14} ${x + width},${buildingY}`} fill={c.accent} opacity={0.45} />
        )}
        {cat === "Fasting" && (
          <>
            <rect x={x + width / 2 - 2} y={buildingY - 24} width={4} height={20} fill={c.accent} opacity={0.6} rx={1} />
            <circle cx={x + width / 2} cy={buildingY - 26} r={5} fill={theme.ambient} opacity={0.7} />
            <circle cx={x + width / 2 + 3} cy={buildingY - 27} r={4} fill={skyThemes.night.sky[0]} />
          </>
        )}
        {cat === "Sadaqah" && (
          [0.2, 0.5, 0.8].map((p, i) => (
            <g key={i} transform={`translate(${x + width * p}, ${buildingY - 2})`}>
              <rect x={-1} y={-7} width={2} height={7} fill="hsl(30 30% 30%)" rx={0.5} />
              <circle cx={0} cy={-10} r={5} fill="hsl(145 50% 35%)" opacity={0.65} />
            </g>
          ))
        )}
        {cat === "Knowledge" && (
          <>
            <rect x={x + width - 10} y={buildingY - 16} width={2} height={14} fill={c.accent} opacity={0.6} rx={0.5} />
            <polygon points={`${x + width - 10},${buildingY - 16} ${x + width},${buildingY - 11} ${x + width - 10},${buildingY - 6}`} fill={c.accent} opacity={0.45} />
          </>
        )}
        {cat === "Dhikr" && (
          <motion.circle
            cx={x + width / 2} cy={buildingY - 8} r={6}
            fill={theme.ambient} opacity={0.2}
            animate={{ r: [6, 10, 6], opacity: [0.2, 0.08, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
        {cat === "Character" && (
          <>
            <rect x={x + width / 2 - 8} y={buildingY - 4} width={16} height={3} rx={1.5} fill={c.accent} opacity={0.5} />
            <circle cx={x + width / 2} cy={buildingY - 8} r={3} fill={theme.ambient} opacity={0.5} />
          </>
        )}
        {cat === "Family" && (
          <>
            <polygon points={`${x - 2},${buildingY} ${x + width / 2},${buildingY - 10} ${x + width + 2},${buildingY}`} fill={c.accent} opacity={0.35} />
            <rect x={x + width / 2 - 2} y={buildingY - 4} width={4} height={6} rx={0.5} fill={theme.ambient} opacity={0.4} />
          </>
        )}
      </motion.g>

      {/* Category label under building */}
      <text
        x={x + width / 2} y={groundY + 14}
        textAnchor="middle" fill={theme.labelColor}
        fontSize={9} fontWeight={600} fontFamily="Inter, sans-serif"
      >
        {data.emoji} {data.element}
      </text>
      <text
        x={x + width / 2} y={groundY + 25}
        textAnchor="middle" fill={theme.labelColor}
        fontSize={7} fontFamily="Inter, sans-serif" opacity={0.6}
      >
        {data.count} deeds
      </text>

      {/* Selection glow */}
      {isSelected && (
        <motion.rect
          x={x - 3} y={buildingY - 3} width={width + 6} height={height + 6} rx={3}
          fill="none" stroke={c.accent} strokeWidth={2}
          animate={{ opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}>
          <rect x={x + width / 2 - 48} y={buildingY - 48} width={96} height={32} rx={8} fill="hsl(220 20% 10%)" stroke="hsl(220 15% 22%)" strokeWidth={1} />
          <text x={x + width / 2} y={buildingY - 36} textAnchor="middle" fill="hsl(60 20% 92%)" fontSize={9} fontWeight={600} fontFamily="Inter, sans-serif">
            {data.emoji} {data.element}
          </text>
          <text x={x + width / 2} y={buildingY - 23} textAnchor="middle" fill="hsl(60 10% 55%)" fontSize={8} fontFamily="Inter, sans-serif">
            {data.count} deeds · Lvl {data.count > 50 ? 3 : data.count > 20 ? 2 : data.count > 0 ? 1 : 0}
          </text>
        </motion.g>
      )}
    </motion.g>
  );
};

const categories = ["Salah", "Quran", "Sadaqah", "Dhikr", "Character", "Family", "Fasting", "Knowledge"];

// Wider canvas for panning
const CANVAS_W = 1200;
const CANVAS_H = 440;

const CityVisualization = ({ categoryData, selectedCategory, onSelectCategory, timeOfDay }: CityVisualizationProps) => {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  const theme = skyThemes[timeOfDay];

  const gap = 18;
  const totalGap = gap * (categories.length + 1);
  const buildingWidth = (CANVAS_W - totalGap) / categories.length;
  const maxCount = Math.max(...Object.values(categoryData).map(d => d.count), 1);

  // Animated cars on road
  const cars = useMemo(() => [
    { y: 395, speed: 25, delay: 0, dir: 1, color: "hsl(0 60% 50%)" },
    { y: 400, speed: 35, delay: 5, dir: -1, color: "hsl(200 60% 50%)" },
    { y: 395, speed: 20, delay: 12, dir: 1, color: "hsl(42 60% 55%)" },
  ], []);

  return (
    <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="w-full h-auto select-none">
      <defs>
        <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={theme.sky[0]} />
          <stop offset="50%" stopColor={theme.sky[1]} />
          <stop offset="100%" stopColor={theme.sky[2]} />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width={CANVAS_W} height={CANVAS_H} fill="url(#skyGrad)" />

      {/* Stars */}
      <Stars opacity={theme.starOpacity} />

      {/* Sun or Moon */}
      <CelestialBody timeOfDay={timeOfDay} />

      {/* Distant background buildings silhouette */}
      <g opacity={0.12}>
        {Array.from({ length: 16 }).map((_, i) => {
          const bx = i * 80 - 10;
          const bh = 40 + ((i * 47) % 80);
          return <rect key={i} x={bx} y={380 - bh} width={60} height={bh} rx={1} fill={theme.labelColor} />;
        })}
      </g>

      {/* Ground */}
      <rect x={0} y={380} width={CANVAS_W} height={60} fill={theme.ground} />
      {/* Road */}
      <rect x={0} y={388} width={CANVAS_W} height={16} fill={theme.road} />
      {/* Road markings */}
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={10 + i * 42} y={395} width={22} height={2.5} rx={1.25} fill={theme.roadMark} opacity={0.35} />
      ))}
      {/* Sidewalk */}
      <rect x={0} y={404} width={CANVAS_W} height={4} fill={theme.sidewalk} />

      {/* Animated cars */}
      {cars.map((car, i) => (
        <motion.g
          key={i}
          animate={{ x: car.dir > 0 ? [- 30, CANVAS_W + 30] : [CANVAS_W + 30, -30] }}
          transition={{ duration: car.speed, repeat: Infinity, delay: car.delay, ease: "linear" }}
        >
          <rect x={0} y={car.y - 3} width={18} height={6} rx={2} fill={car.color} opacity={0.7} />
          {/* Headlights */}
          <circle cx={car.dir > 0 ? 18 : 0} cy={car.y} r={1.5} fill="hsl(42 80% 80%)" opacity={timeOfDay === "night" || timeOfDay === "evening" ? 0.8 : 0.3} />
        </motion.g>
      ))}

      {/* Buildings */}
      {categories.map((cat, i) => {
        const data = categoryData[cat];
        if (!data) return null;
        const x = gap + i * (buildingWidth + gap);
        const minH = 50;
        const maxH = 300;
        const height = minH + (data.count / maxCount) * (maxH - minH);
        return (
          <Building
            key={cat} x={x} width={buildingWidth} height={height}
            cat={cat} data={data}
            isSelected={selectedCategory === cat}
            isHovered={hoveredCat === cat}
            onHover={(h) => setHoveredCat(h ? cat : null)}
            onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
            index={i} theme={theme}
          />
        );
      })}

      {/* City name */}
      <text x={CANVAS_W / 2} y={CANVAS_H - 5} textAnchor="middle" fill={theme.labelColor} fontSize={10} fontFamily="Inter, sans-serif" letterSpacing={5} opacity={0.5}>
        YOUR DEED CITY
      </text>
    </svg>
  );
};

export default CityVisualization;
