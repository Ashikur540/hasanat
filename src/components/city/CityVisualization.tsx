import { motion } from "framer-motion";

interface CityElementProps {
  x: number;
  y: number;
  children: React.ReactNode;
  label: string;
  level: number;
  delay?: number;
}

const CityElement = ({ x, y, children, label, level, delay = 0 }: CityElementProps) => (
  <motion.g
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <g transform={`translate(${x}, ${y})`}>
      {children}
      <text x={0} y={60} textAnchor="middle" className="fill-muted-foreground text-[8px] font-medium">{label}</text>
      {/* Level dots */}
      <g transform="translate(-8, 65)">
        {Array.from({ length: 3 }).map((_, i) => (
          <circle key={i} cx={i * 8} cy={0} r={2.5} className={i < level ? "fill-primary" : "fill-muted"} />
        ))}
      </g>
    </g>
  </motion.g>
);

// Mosque SVG
const Mosque = ({ scale = 1 }: { scale?: number }) => (
  <g transform={`scale(${scale})`}>
    {/* Base */}
    <rect x={-25} y={10} width={50} height={35} rx={3} className="fill-primary/20 stroke-primary" strokeWidth={1.5} />
    {/* Door */}
    <rect x={-6} y={25} width={12} height={20} rx={6} className="fill-primary/40" />
    {/* Dome */}
    <ellipse cx={0} cy={10} rx={20} ry={14} className="fill-primary/30 stroke-primary" strokeWidth={1.5} />
    {/* Crescent */}
    <circle cx={0} cy={-6} r={4} className="fill-gold stroke-gold" strokeWidth={1} />
    <circle cx={1.5} cy={-7} r={3} className="fill-primary/20" />
    {/* Minarets */}
    <rect x={-30} y={-5} width={6} height={50} rx={2} className="fill-primary/15 stroke-primary" strokeWidth={1} />
    <rect x={24} y={-5} width={6} height={50} rx={2} className="fill-primary/15 stroke-primary" strokeWidth={1} />
    <circle cx={-27} cy={-8} r={3} className="fill-gold" />
    <circle cx={27} cy={-8} r={3} className="fill-gold" />
    {/* Windows */}
    <circle cx={-12} cy={25} r={3} className="fill-gold/50" />
    <circle cx={12} cy={25} r={3} className="fill-gold/50" />
  </g>
);

// Library SVG
const Library = ({ scale = 1 }: { scale?: number }) => (
  <g transform={`scale(${scale})`}>
    <rect x={-22} y={5} width={44} height={40} rx={2} className="fill-gold/15 stroke-gold" strokeWidth={1.5} />
    {/* Roof */}
    <polygon points="-28,5 0,-12 28,5" className="fill-gold/25 stroke-gold" strokeWidth={1.5} />
    {/* Columns */}
    <rect x={-18} y={15} width={4} height={30} rx={1} className="fill-gold/30" />
    <rect x={14} y={15} width={4} height={30} rx={1} className="fill-gold/30" />
    {/* Books */}
    <rect x={-8} y={18} width={4} height={12} rx={1} className="fill-primary/40" />
    <rect x={-3} y={20} width={4} height={10} rx={1} className="fill-destructive/30" />
    <rect x={2} y={17} width={4} height={13} rx={1} className="fill-gold/50" />
    <rect x={7} y={19} width={4} height={11} rx={1} className="fill-primary/30" />
    {/* Lantern */}
    <circle cx={0} cy={0} r={4} className="fill-gold/40 stroke-gold" strokeWidth={1} />
    <line x1={0} y1={-12} x2={0} y2={-4} className="stroke-gold" strokeWidth={1} />
    {/* Door */}
    <rect x={-5} y={33} width={10} height={12} rx={5} className="fill-gold/30" />
  </g>
);

// Garden SVG
const Garden = ({ vitality = 1 }: { vitality?: number }) => {
  const leafColor = vitality > 0.7 ? "fill-success" : vitality > 0.4 ? "fill-success/60" : "fill-muted-foreground/40";
  const flowerShow = vitality > 0.5;
  return (
    <g>
      {/* Ground */}
      <ellipse cx={0} cy={42} rx={30} ry={8} className={vitality > 0.4 ? "fill-success/15" : "fill-muted/30"} />
      {/* Trees */}
      <rect x={-2} y={15} width={4} height={27} rx={2} className="fill-gold/40" />
      <circle cx={0} cy={10} r={12} className={leafColor} opacity={0.7} />
      <circle cx={-7} cy={15} r={8} className={leafColor} opacity={0.5} />
      <circle cx={7} cy={15} r={8} className={leafColor} opacity={0.5} />
      {/* Small tree */}
      <rect x={18} y={25} width={3} height={17} rx={1} className="fill-gold/30" />
      <circle cx={19.5} cy={22} r={7} className={leafColor} opacity={0.6} />
      {/* Flowers */}
      {flowerShow && (
        <>
          <circle cx={-15} cy={38} r={3} className="fill-destructive/50" />
          <circle cx={-8} cy={40} r={2.5} className="fill-gold/60" />
          <circle cx={12} cy={39} r={3} className="fill-primary/40" />
          <circle cx={22} cy={37} r={2} className="fill-destructive/40" />
        </>
      )}
      {/* Butterfly */}
      {vitality > 0.8 && (
        <motion.g
          animate={{ x: [0, 5, -3, 0], y: [0, -4, -2, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx={-20} cy={5} r={2} className="fill-accent" />
          <circle cx={-23} cy={3} r={3} className="fill-accent/50" />
          <circle cx={-17} cy={3} r={3} className="fill-accent/50" />
        </motion.g>
      )}
    </g>
  );
};

// House SVG
const House = ({ warm = true }: { warm?: boolean }) => (
  <g>
    <rect x={-18} y={10} width={36} height={35} rx={2} className="fill-secondary stroke-border" strokeWidth={1.5} />
    <polygon points="-24,10 0,-8 24,10" className="fill-primary/20 stroke-primary/40" strokeWidth={1.5} />
    <rect x={-5} y={27} width={10} height={18} rx={1} className="fill-primary/30" />
    {/* Windows */}
    <rect x={-14} y={16} width={7} height={7} rx={1} className={warm ? "fill-gold/50" : "fill-muted/30"} />
    <rect x={7} y={16} width={7} height={7} rx={1} className={warm ? "fill-gold/50" : "fill-muted/30"} />
    {/* Chimney */}
    <rect x={10} y={-4} width={6} height={14} rx={1} className="fill-muted-foreground/20" />
  </g>
);

// Fountain SVG
const Fountain = () => (
  <g>
    <ellipse cx={0} cy={38} rx={22} ry={8} className="fill-primary/10 stroke-primary/30" strokeWidth={1} />
    <rect x={-3} y={10} width={6} height={28} rx={2} className="fill-muted/50" />
    <ellipse cx={0} cy={10} rx={10} ry={5} className="fill-primary/15 stroke-primary/30" strokeWidth={1} />
    {/* Water drops */}
    <motion.g animate={{ y: [0, 3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
      <circle cx={-4} cy={6} r={1.5} className="fill-primary/30" />
      <circle cx={4} cy={4} r={1.5} className="fill-primary/30" />
      <circle cx={0} cy={3} r={2} className="fill-primary/40" />
    </motion.g>
  </g>
);

// Crescent Tower
const CrescentTower = () => (
  <g>
    <rect x={-8} y={-5} width={16} height={50} rx={3} className="fill-accent/15 stroke-accent/40" strokeWidth={1.5} />
    <rect x={-12} y={35} width={24} height={10} rx={2} className="fill-accent/10 stroke-accent/30" strokeWidth={1} />
    {/* Moon */}
    <circle cx={0} cy={-10} r={7} className="fill-gold stroke-gold" strokeWidth={1} />
    <circle cx={2} cy={-11} r={5.5} className="fill-accent/15" />
    {/* Windows */}
    <rect x={-4} y={5} width={8} height={6} rx={3} className="fill-gold/30" />
    <rect x={-4} y={16} width={8} height={6} rx={3} className="fill-gold/30" />
    <rect x={-4} y={27} width={8} height={6} rx={3} className="fill-gold/30" />
  </g>
);

// School SVG
const School = () => (
  <g>
    <rect x={-24} y={8} width={48} height={37} rx={2} className="fill-gold/10 stroke-gold/40" strokeWidth={1.5} />
    <rect x={-28} y={5} width={56} height={6} rx={2} className="fill-gold/20" />
    {/* Sign */}
    <rect x={-10} y={12} width={20} height={8} rx={2} className="fill-primary/15" />
    <line x1={-6} y1={15} x2={6} y2={15} className="stroke-primary/30" strokeWidth={1} />
    <line x1={-4} y1={18} x2={4} y2={18} className="stroke-primary/20" strokeWidth={1} />
    {/* Door */}
    <rect x={-5} y={28} width={10} height={17} rx={1} className="fill-gold/30" />
    {/* Windows */}
    <rect x={-20} y={18} width={8} height={8} rx={1} className="fill-gold/25" />
    <rect x={12} y={18} width={8} height={8} rx={1} className="fill-gold/25" />
  </g>
);

// Community Centre
const CommunityCentre = () => (
  <g>
    <rect x={-22} y={8} width={44} height={37} rx={3} className="fill-primary/10 stroke-primary/30" strokeWidth={1.5} />
    <polygon points="-26,8 0,-6 26,8" className="fill-primary/15 stroke-primary/30" strokeWidth={1} />
    {/* Heart */}
    <g transform="translate(0, -2) scale(0.6)">
      <path d="M0 8 C-5 -2 -15 -2 -15 5 C-15 12 0 20 0 20 C0 20 15 12 15 5 C15 -2 5 -2 0 8Z" className="fill-destructive/30" />
    </g>
    {/* Doors */}
    <rect x={-12} y={28} width={10} height={17} rx={5} className="fill-primary/20" />
    <rect x={2} y={28} width={10} height={17} rx={5} className="fill-primary/20" />
    {/* Windows */}
    <circle cx={-12} cy={18} r={4} className="fill-gold/30" />
    <circle cx={12} cy={18} r={4} className="fill-gold/30" />
  </g>
);

interface CityVisualizationProps {
  categoryData: Record<string, { count: number; vitality: number }>;
}

const CityVisualization = ({ categoryData }: CityVisualizationProps) => {
  const getLevel = (count: number) => count > 50 ? 3 : count > 20 ? 2 : count > 0 ? 1 : 0;

  return (
    <svg viewBox="0 0 700 420" className="w-full h-auto">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
          <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.2} />
        </linearGradient>
      </defs>
      <rect width="700" height="420" fill="url(#sky)" rx={12} />

      {/* Ground */}
      <ellipse cx={350} cy={390} rx={340} ry={40} className="fill-success/10" />
      <ellipse cx={350} cy={385} rx={300} ry={30} className="fill-success/8" />

      {/* Clouds */}
      <motion.g animate={{ x: [0, 15, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
        <ellipse cx={120} cy={50} rx={35} ry={12} className="fill-foreground/5" />
        <ellipse cx={400} cy={35} rx={45} ry={14} className="fill-foreground/4" />
        <ellipse cx={580} cy={60} rx={30} ry={10} className="fill-foreground/5" />
      </motion.g>

      {/* Birds */}
      {categoryData.Dhikr?.vitality > 0.6 && (
        <motion.g
          animate={{ x: [0, 80, 160], y: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M90 75 Q95 70 100 75" className="stroke-foreground/20" fill="none" strokeWidth={1.5} />
          <path d="M105 80 Q110 75 115 80" className="stroke-foreground/15" fill="none" strokeWidth={1.5} />
        </motion.g>
      )}

      {/* City Elements positioned on grid */}
      <CityElement x={120} y={200} label="Masjid" level={getLevel(categoryData.Salah?.count || 0)} delay={0.1}>
        <Mosque scale={getLevel(categoryData.Salah?.count || 0) > 1 ? 1.1 : 0.85} />
      </CityElement>

      <CityElement x={280} y={180} label="Library" level={getLevel(categoryData.Quran?.count || 0)} delay={0.2}>
        <Library scale={getLevel(categoryData.Quran?.count || 0) > 1 ? 1 : 0.8} />
      </CityElement>

      <CityElement x={470} y={200} label="Garden" level={getLevel(categoryData.Sadaqah?.count || 0)} delay={0.3}>
        <Garden vitality={categoryData.Sadaqah?.vitality || 0.8} />
      </CityElement>

      <CityElement x={600} y={210} label="Fountain" level={getLevel(categoryData.Dhikr?.count || 0)} delay={0.4}>
        <Fountain />
      </CityElement>

      <CityElement x={80} y={320} label="Centre" level={getLevel(categoryData.Character?.count || 0)} delay={0.5}>
        <CommunityCentre />
      </CityElement>

      <CityElement x={230} y={310} label="Homes" level={getLevel(categoryData.Family?.count || 0)} delay={0.6}>
        <House warm={(categoryData.Family?.vitality || 0) > 0.5} />
      </CityElement>

      <CityElement x={410} y={320} label="Tower" level={getLevel(categoryData.Fasting?.count || 0)} delay={0.7}>
        <CrescentTower />
      </CityElement>

      <CityElement x={570} y={310} label="School" level={getLevel(categoryData.Knowledge?.count || 0)} delay={0.8}>
        <School />
      </CityElement>

      {/* Paths connecting buildings */}
      <path d="M155 280 Q200 275 245 275" className="stroke-border" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
      <path d="M315 260 Q380 265 435 270" className="stroke-border" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
      <path d="M120 340 Q175 345 230 340" className="stroke-border" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
      <path d="M280 340 Q345 345 410 340" className="stroke-border" strokeWidth={1.5} fill="none" strokeDasharray="4 3" />
    </svg>
  );
};

export default CityVisualization;
