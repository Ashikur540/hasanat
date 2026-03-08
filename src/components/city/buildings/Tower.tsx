import { motion } from "framer-motion";

const Tower = ({ level }: { level: number }) => {
  const h = 30 + level * 14;
  
  return (
    <g>
      {/* Main tower */}
      <rect x={-7} y={-h + 20} width={14} height={h} rx={2} className="fill-accent/15 stroke-accent/40" strokeWidth={1} />
      
      {/* Base */}
      <rect x={-12} y={10} width={24} height={10} rx={2} className="fill-accent/10 stroke-accent/25" strokeWidth={0.8} />
      
      {/* Windows - more with level */}
      {Array.from({ length: Math.min(level + 1, 4) }).map((_, i) => (
        <rect key={i} x={-3.5} y={-h + 25 + i * 12} width={7} height={5} rx={2.5} className="fill-gold/30" />
      ))}
      
      {/* Crescent moon on top */}
      <g transform={`translate(0, ${-h + 12})`}>
        <circle cx={0} cy={0} r={5 + level * 0.5} className="fill-gold stroke-gold/60" strokeWidth={0.8} />
        <circle cx={1.5} cy={-1} r={4 + level * 0.4} className="fill-accent/15" />
      </g>
      
      {/* Glow at level 3 */}
      {level >= 3 && (
        <motion.circle
          cx={0} cy={-h + 12}
          r={10}
          className="fill-gold/5"
          animate={{ r: [10, 15, 10], opacity: [0.05, 0.15, 0.05] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      )}
    </g>
  );
};

export default Tower;
