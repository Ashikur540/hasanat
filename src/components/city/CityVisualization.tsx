import { motion } from "framer-motion";
import { useState } from "react";

interface CityVisualizationProps {
  categoryData: Record<string, { count: number; vitality: number; emoji: string; element: string }>;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

// Stars component
const Stars = () => {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: (i * 137.5) % 100,
    y: Math.random() * 45,
    r: Math.random() * 1.2 + 0.3,
    delay: Math.random() * 3,
  }));

  return (
    <g>
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={`${s.x}%`}
          cy={`${s.y}%`}
          r={s.r}
          fill="hsl(60 20% 95%)"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: s.delay }}
        />
      ))}
    </g>
  );
};

// Crescent moon
const Moon = () => (
  <g transform="translate(85, 35)">
    <circle cx={0} cy={0} r={18} fill="hsl(42 50% 56%)" opacity={0.9} />
    <circle cx={6} cy={-4} r={15} fill="hsl(220 30% 8%)" />
    <motion.circle
      cx={0} cy={0} r={24}
      fill="none"
      stroke="hsl(42 50% 56%)"
      strokeWidth={0.5}
      opacity={0.15}
      animate={{ r: [24, 30, 24], opacity: [0.15, 0.05, 0.15] }}
      transition={{ duration: 4, repeat: Infinity }}
    />
  </g>
);

// Single building/skyscraper
const Building = ({
  x,
  width,
  height,
  cat,
  data,
  isSelected,
  isHovered,
  onHover,
  onClick,
  index,
}: {
  x: number;
  width: number;
  height: number;
  cat: string;
  data: { count: number; vitality: number; emoji: string; element: string };
  isSelected: boolean;
  isHovered: boolean;
  onHover: (h: boolean) => void;
  onClick: () => void;
  index: number;
}) => {
  const groundY = 340;
  const buildingY = groundY - height;
  const windowRows = Math.floor(height / 14);
  const windowCols = Math.max(2, Math.floor(width / 14));

  // Building color based on category
  const colors: Record<string, { base: string; lit: string; accent: string }> = {
    Salah:     { base: "hsl(150 40% 18%)", lit: "hsl(42 60% 60%)",  accent: "hsl(150 66% 35%)" },
    Quran:     { base: "hsl(200 30% 20%)", lit: "hsl(42 50% 55%)",  accent: "hsl(200 50% 40%)" },
    Sadaqah:   { base: "hsl(145 35% 16%)", lit: "hsl(145 50% 50%)", accent: "hsl(145 52% 40%)" },
    Dhikr:     { base: "hsl(180 25% 18%)", lit: "hsl(180 40% 55%)", accent: "hsl(180 40% 35%)" },
    Character: { base: "hsl(260 20% 20%)", lit: "hsl(42 50% 58%)",  accent: "hsl(260 30% 40%)" },
    Family:    { base: "hsl(20 25% 20%)",  lit: "hsl(30 60% 55%)",  accent: "hsl(20 40% 35%)" },
    Fasting:   { base: "hsl(270 20% 18%)", lit: "hsl(270 40% 55%)", accent: "hsl(270 30% 40%)" },
    Knowledge: { base: "hsl(45 25% 18%)",  lit: "hsl(42 55% 55%)",  accent: "hsl(45 40% 35%)" },
  };

  const c = colors[cat] || colors.Salah;

  // Determine which windows are lit (based on vitality)
  const litProbability = 0.3 + data.vitality * 0.5;

  return (
    <motion.g
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      style={{ cursor: "pointer" }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onClick={onClick}
    >
      {/* Building shadow */}
      <rect
        x={x + 4}
        y={buildingY + 4}
        width={width}
        height={height}
        rx={2}
        fill="black"
        opacity={0.3}
      />

      {/* Main building body */}
      <motion.rect
        x={x}
        y={buildingY}
        width={width}
        height={height}
        rx={2}
        fill={c.base}
        stroke={isSelected ? c.accent : "transparent"}
        strokeWidth={isSelected ? 2.5 : 0}
        animate={isHovered ? { y: buildingY - 4 } : { y: buildingY }}
        transition={{ duration: 0.2 }}
      />

      {/* Building top accent strip */}
      <motion.rect
        x={x}
        y={buildingY}
        width={width}
        height={4}
        rx={2}
        fill={c.accent}
        opacity={0.8}
        animate={isHovered ? { y: buildingY - 4 } : { y: buildingY }}
        transition={{ duration: 0.2 }}
      />

      {/* Windows grid */}
      <motion.g animate={isHovered ? { y: -4 } : { y: 0 }} transition={{ duration: 0.2 }}>
        {Array.from({ length: windowRows }).map((_, row) =>
          Array.from({ length: windowCols }).map((_, col) => {
            const wx = x + 6 + col * ((width - 12) / (windowCols - 1 || 1)) - 2;
            const wy = buildingY + 10 + row * 14;
            // Deterministic "random" lit state
            const seed = (row * 7 + col * 13 + cat.charCodeAt(0)) % 100;
            const isLit = seed < litProbability * 100;

            return (
              <motion.rect
                key={`${row}-${col}`}
                x={wx}
                y={wy}
                width={4}
                height={6}
                rx={0.5}
                fill={isLit ? c.lit : "hsl(220 20% 12%)"}
                opacity={isLit ? 0.9 : 0.4}
                animate={
                  isLit
                    ? { opacity: [0.7, 1, 0.7] }
                    : {}
                }
                transition={
                  isLit
                    ? { duration: 2 + (seed % 3), repeat: Infinity, delay: (seed % 20) * 0.1 }
                    : {}
                }
              />
            );
          })
        )}
      </motion.g>

      {/* Rooftop element based on category */}
      <motion.g animate={isHovered ? { y: -4 } : { y: 0 }} transition={{ duration: 0.2 }}>
        {cat === "Salah" && (
          <>
            {/* Minaret / dome */}
            <ellipse cx={x + width / 2} cy={buildingY - 2} rx={width / 3} ry={6} fill={c.accent} opacity={0.6} />
            <rect x={x + width / 2 - 1.5} y={buildingY - 18} width={3} height={14} fill={c.accent} opacity={0.7} />
            <circle cx={x + width / 2} cy={buildingY - 20} r={3} fill="hsl(42 50% 56%)" opacity={0.8} />
          </>
        )}
        {cat === "Quran" && (
          <polygon
            points={`${x},${buildingY} ${x + width / 2},${buildingY - 12} ${x + width},${buildingY}`}
            fill={c.accent}
            opacity={0.5}
          />
        )}
        {cat === "Fasting" && (
          <>
            <rect x={x + width / 2 - 2} y={buildingY - 20} width={4} height={18} fill={c.accent} opacity={0.6} />
            <circle cx={x + width / 2} cy={buildingY - 22} r={4} fill="hsl(42 50% 56%)" opacity={0.7} />
            <circle cx={x + width / 2 + 2} cy={buildingY - 23} r={3.2} fill="hsl(220 30% 8%)" />
          </>
        )}
        {cat === "Sadaqah" && (
          <g>
            {/* Trees on roof */}
            {[0.25, 0.5, 0.75].map((p, i) => (
              <g key={i} transform={`translate(${x + width * p}, ${buildingY - 2})`}>
                <rect x={-1} y={-6} width={2} height={6} fill="hsl(30 30% 30%)" />
                <circle cx={0} cy={-8} r={4} fill="hsl(145 50% 35%)" opacity={0.7} />
              </g>
            ))}
          </g>
        )}
        {cat === "Knowledge" && (
          <>
            <rect x={x + width - 8} y={buildingY - 14} width={2} height={12} fill={c.accent} opacity={0.6} />
            <polygon
              points={`${x + width - 8},${buildingY - 14} ${x + width},${buildingY - 10} ${x + width - 8},${buildingY - 6}`}
              fill={c.accent}
              opacity={0.5}
            />
          </>
        )}
      </motion.g>

      {/* Selection glow */}
      {isSelected && (
        <motion.rect
          x={x - 2}
          y={buildingY - 2}
          width={width + 4}
          height={height + 4}
          rx={3}
          fill="none"
          stroke={c.accent}
          strokeWidth={2}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Hover tooltip */}
      {isHovered && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
          <rect
            x={x + width / 2 - 40}
            y={buildingY - 38}
            width={80}
            height={26}
            rx={6}
            fill="hsl(220 20% 12%)"
            stroke="hsl(220 15% 25%)"
            strokeWidth={1}
          />
          <text
            x={x + width / 2}
            y={buildingY - 28}
            textAnchor="middle"
            fill="hsl(60 20% 90%)"
            fontSize={8}
            fontWeight={600}
            fontFamily="Inter, sans-serif"
          >
            {data.emoji} {data.element}
          </text>
          <text
            x={x + width / 2}
            y={buildingY - 17}
            textAnchor="middle"
            fill="hsl(60 10% 60%)"
            fontSize={7}
            fontFamily="Inter, sans-serif"
          >
            {data.count} deeds
          </text>
        </motion.g>
      )}
    </motion.g>
  );
};

// Ground with road
const Ground = () => (
  <g>
    {/* Ground */}
    <rect x={0} y={340} width={800} height={60} fill="hsl(220 20% 10%)" />
    {/* Road */}
    <rect x={0} y={345} width={800} height={12} fill="hsl(220 10% 15%)" />
    {/* Road markings */}
    {Array.from({ length: 20 }).map((_, i) => (
      <rect
        key={i}
        x={10 + i * 42}
        y={350}
        width={20}
        height={2}
        rx={1}
        fill="hsl(42 50% 56%)"
        opacity={0.4}
      />
    ))}
    {/* Sidewalk */}
    <rect x={0} y={357} width={800} height={3} fill="hsl(220 10% 20%)" />
  </g>
);

const categories = ["Salah", "Quran", "Sadaqah", "Dhikr", "Character", "Family", "Fasting", "Knowledge"];

const CityVisualization = ({ categoryData, selectedCategory, onSelectCategory }: CityVisualizationProps) => {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);

  // Calculate building dimensions
  const gap = 12;
  const totalGap = gap * (categories.length + 1);
  const buildingWidth = (800 - totalGap) / categories.length;

  const maxCount = Math.max(...Object.values(categoryData).map(d => d.count), 1);

  return (
    <svg viewBox="0 0 800 400" className="w-full h-auto select-none" style={{ background: "hsl(220 30% 6%)" }}>
      <defs>
        {/* Night sky gradient */}
        <linearGradient id="nightSky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(230 30% 5%)" />
          <stop offset="50%" stopColor="hsl(220 25% 8%)" />
          <stop offset="100%" stopColor="hsl(220 20% 12%)" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="800" height="400" fill="url(#nightSky)" />

      {/* Stars */}
      <Stars />

      {/* Moon */}
      <Moon />

      {/* Ground & road */}
      <Ground />

      {/* Buildings */}
      {categories.map((cat, i) => {
        const data = categoryData[cat];
        if (!data) return null;

        const x = gap + i * (buildingWidth + gap);
        const minH = 40;
        const maxH = 260;
        const height = minH + (data.count / maxCount) * (maxH - minH);

        return (
          <Building
            key={cat}
            x={x}
            width={buildingWidth}
            height={height}
            cat={cat}
            data={data}
            isSelected={selectedCategory === cat}
            isHovered={hoveredCat === cat}
            onHover={(h) => setHoveredCat(h ? cat : null)}
            onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
            index={i}
          />
        );
      })}

      {/* City name */}
      <text
        x={400}
        y={385}
        textAnchor="middle"
        fill="hsl(60 10% 40%)"
        fontSize={9}
        fontFamily="Inter, sans-serif"
        letterSpacing={4}
      >
        YOUR DEED CITY
      </text>
    </svg>
  );
};

export default CityVisualization;
