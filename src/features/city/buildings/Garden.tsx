import { motion } from "framer-motion";

const Garden = ({ level, vitality }: { level: number; vitality: number }) => {
  const leafClass = vitality > 0.7 ? "fill-success" : vitality > 0.4 ? "fill-success/60" : "fill-muted-foreground/30";
  const treeCount = Math.min(level + 1, 4);
  
  return (
    <g>
      {/* Ground patch */}
      <ellipse cx={0} cy={20} rx={28 + level * 4} ry={8} className={vitality > 0.4 ? "fill-success/15" : "fill-muted/20"} />
      
      {/* Trees */}
      {Array.from({ length: treeCount }).map((_, i) => {
        const tx = (i - (treeCount - 1) / 2) * 16;
        const treeH = 10 + level * 3 + (i % 2) * 4;
        return (
          <g key={i} transform={`translate(${tx}, 0)`}>
            <rect x={-1.5} y={-treeH + 20} width={3} height={treeH} rx={1} className="fill-gold/40" />
            <circle cx={0} cy={-treeH + 15} r={6 + level} className={leafClass} opacity={0.7} />
          </g>
        );
      })}
      
      {/* Flowers at level 2+ */}
      {level >= 2 && vitality > 0.5 && (
        <>
          <circle cx={-12} cy={16} r={2.5} className="fill-destructive/40" />
          <circle cx={8} cy={18} r={2} className="fill-gold/50" />
          <circle cx={18} cy={15} r={2.5} className="fill-primary/40" />
        </>
      )}
      
      {/* Fountain at level 3 */}
      {level >= 3 && (
        <g transform="translate(0, 5)">
          <ellipse cx={0} cy={15} rx={8} ry={3} className="fill-primary/15 stroke-primary/30" strokeWidth={0.5} />
          <rect x={-2} y={5} width={4} height={10} rx={1.5} className="fill-muted/40" />
          <motion.g animate={{ y: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <circle cx={0} cy={3} r={1.5} className="fill-primary/30" />
            <circle cx={-3} cy={5} r={1} className="fill-primary/20" />
            <circle cx={3} cy={5} r={1} className="fill-primary/20" />
          </motion.g>
        </g>
      )}
      
      {/* Butterfly at high vitality */}
      {vitality > 0.8 && (
        <motion.g
          animate={{ x: [0, 8, -4, 0], y: [0, -6, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx={-18} cy={-5} r={1.5} className="fill-accent" />
          <circle cx={-20} cy={-6.5} r={2.5} className="fill-accent/40" />
          <circle cx={-16} cy={-6.5} r={2.5} className="fill-accent/40" />
        </motion.g>
      )}
    </g>
  );
};

export default Garden;
