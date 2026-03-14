import { motion } from "framer-motion";

interface MosqueProps {
  level: number; // 0-3
}

const Mosque = ({ level }: MosqueProps) => {
  const h = 20 + level * 12;
  const w = 30 + level * 6;
  
  return (
    <g transform="translate(0, 0)">
      {/* Main building */}
      <rect x={-w / 2} y={-h + 20} width={w} height={h} rx={2} className="fill-primary/20 stroke-primary/60" strokeWidth={1} />
      
      {/* Dome */}
      <ellipse cx={0} cy={-h + 18} rx={w / 2 - 2} ry={10 + level * 2} className="fill-primary/30 stroke-primary/50" strokeWidth={1} />
      
      {/* Crescent on top */}
      <g transform={`translate(0, ${-h - level * 2})`}>
        <circle cx={0} cy={0} r={3 + level * 0.5} className="fill-gold stroke-gold/70" strokeWidth={0.8} />
        <circle cx={1.2} cy={-0.8} r={2.5 + level * 0.4} className="fill-primary/20" />
      </g>
      
      {/* Door */}
      <rect x={-4} y={8} width={8} height={12} rx={4} className="fill-primary/40" />
      
      {/* Minarets - only at level 2+ */}
      {level >= 2 && (
        <>
          <rect x={-w / 2 - 5} y={-h + 5} width={4} height={h + 15} rx={1.5} className="fill-primary/15 stroke-primary/40" strokeWidth={0.8} />
          <rect x={w / 2 + 1} y={-h + 5} width={4} height={h + 15} rx={1.5} className="fill-primary/15 stroke-primary/40" strokeWidth={0.8} />
          <circle cx={-w / 2 - 3} cy={-h + 2} r={2.5} className="fill-gold/70" />
          <circle cx={w / 2 + 3} cy={-h + 2} r={2.5} className="fill-gold/70" />
        </>
      )}
      
      {/* Windows - more at higher levels */}
      {level >= 1 && (
        <>
          <circle cx={-8} cy={-h / 2 + 10} r={2.5} className="fill-gold/40" />
          <circle cx={8} cy={-h / 2 + 10} r={2.5} className="fill-gold/40" />
        </>
      )}
      {level >= 3 && (
        <>
          <circle cx={-8} cy={-h / 2 - 2} r={2} className="fill-gold/30" />
          <circle cx={8} cy={-h / 2 - 2} r={2} className="fill-gold/30" />
          {/* Glow effect */}
          <motion.circle
            cx={0} cy={-h - level * 2}
            r={8}
            className="fill-gold/10"
            animate={{ r: [8, 12, 8], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </>
      )}
    </g>
  );
};

export default Mosque;
