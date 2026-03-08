import { motion } from "framer-motion";
import IsometricTile, { gridToIso } from "./IsometricTile";
import Mosque from "./buildings/Mosque";
import Library from "./buildings/Library";
import Garden from "./buildings/Garden";
import Fountain from "./buildings/Fountain";
import House from "./buildings/House";
import Tower from "./buildings/Tower";
import School from "./buildings/School";
import CommunityCentre from "./buildings/CommunityCentre";

interface CityVisualizationProps {
  categoryData: Record<string, { count: number; vitality: number; emoji: string; element: string }>;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

const getLevel = (count: number) => (count > 50 ? 3 : count > 20 ? 2 : count > 0 ? 1 : 0);

// Grid layout: 2 rows x 4 cols isometric
const layout: { cat: string; gx: number; gy: number }[] = [
  { cat: "Salah", gx: 0, gy: 0 },
  { cat: "Quran", gx: 1, gy: 0 },
  { cat: "Sadaqah", gx: 2, gy: 0 },
  { cat: "Dhikr", gx: 3, gy: 0 },
  { cat: "Character", gx: 0, gy: 1 },
  { cat: "Family", gx: 1, gy: 1 },
  { cat: "Fasting", gx: 2, gy: 1 },
  { cat: "Knowledge", gx: 3, gy: 1 },
];

// Isometric road paths between adjacent tiles
const getRoadPaths = () => {
  const roads: string[] = [];
  // Horizontal connections in each row
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const a = gridToIso(col, row);
      const b = gridToIso(col + 1, row);
      roads.push(`M${a.x + 30},${a.y} L${b.x - 30},${b.y}`);
    }
  }
  // Vertical connections
  for (let col = 0; col < 4; col++) {
    const a = gridToIso(col, 0);
    const b = gridToIso(col, 1);
    roads.push(`M${a.x},${a.y + 20} L${b.x},${b.y - 20}`);
  }
  return roads;
};

const BuildingRenderer = ({ cat, data }: { cat: string; data: { count: number; vitality: number } }) => {
  const level = getLevel(data.count);
  switch (cat) {
    case "Salah": return <Mosque level={level} />;
    case "Quran": return <Library level={level} />;
    case "Sadaqah": return <Garden level={level} vitality={data.vitality} />;
    case "Dhikr": return <Fountain level={level} />;
    case "Character": return <CommunityCentre level={level} />;
    case "Family": return <House level={level} warm={data.vitality > 0.5} />;
    case "Fasting": return <Tower level={level} />;
    case "Knowledge": return <School level={level} />;
    default: return null;
  }
};

const CityVisualization = ({ categoryData, selectedCategory, onSelectCategory }: CityVisualizationProps) => {
  const roads = getRoadPaths();

  return (
    <svg viewBox="0 0 800 380" className="w-full h-auto select-none">
      {/* Background */}
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.04} />
          <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.15} />
        </linearGradient>
      </defs>
      <rect width="800" height="380" fill="url(#sky)" rx={12} />

      {/* Clouds */}
      <motion.g animate={{ x: [0, 20, 0] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
        <ellipse cx={150} cy={35} rx={30} ry={10} className="fill-foreground/4" />
        <ellipse cx={450} cy={25} rx={40} ry={12} className="fill-foreground/3" />
        <ellipse cx={680} cy={40} rx={25} ry={8} className="fill-foreground/4" />
      </motion.g>

      {/* Roads */}
      {roads.map((d, i) => (
        <path key={i} d={d} className="stroke-border" strokeWidth={2} fill="none" strokeDasharray="5 4" opacity={0.5} />
      ))}

      {/* Buildings on isometric grid */}
      {layout.map(({ cat, gx, gy }, i) => {
        const data = categoryData[cat];
        if (!data) return null;
        return (
          <IsometricTile
            key={cat}
            gridX={gx}
            gridY={gy}
            label={data.element}
            category={cat}
            count={data.count}
            vitality={data.vitality}
            emoji={data.emoji}
            delay={i * 0.08}
            isSelected={selectedCategory === cat}
            onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
          >
            <BuildingRenderer cat={cat} data={data} />
          </IsometricTile>
        );
      })}
    </svg>
  );
};

export default CityVisualization;
