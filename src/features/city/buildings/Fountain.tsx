import { motion } from "framer-motion";

const Fountain = ({ level }: { level: number }) => {
  const baseR = 14 + level * 3;
  
  return (
    <g>
      {/* Basin */}
      <ellipse cx={0} cy={18} rx={baseR} ry={6} className="fill-primary/10 stroke-primary/30" strokeWidth={0.8} />
      
      {/* Center pillar */}
      <rect x={-2.5} y={-5 - level * 4} width={5} height={23 + level * 4} rx={2} className="fill-muted/50 stroke-border" strokeWidth={0.5} />
      
      {/* Bowl */}
      <ellipse cx={0} cy={-5 - level * 4} rx={8 + level} ry={3} className="fill-primary/15 stroke-primary/30" strokeWidth={0.8} />
      
      {/* Water animation */}
      <motion.g animate={{ y: [0, 2, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
        {Array.from({ length: 2 + level }).map((_, i) => (
          <motion.circle
            key={i}
            cx={(i - (1 + level) / 2) * 4}
            cy={-8 - level * 4}
            r={1.5}
            className="fill-primary/30"
            animate={{ y: [0, 8 + level * 2, 12 + level * 2], opacity: [0.5, 0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.g>
      
      {/* Decorative rim at level 2+ */}
      {level >= 2 && (
        <ellipse cx={0} cy={18} rx={baseR + 3} ry={7} fill="none" className="stroke-primary/20" strokeWidth={1.5} strokeDasharray="3 2" />
      )}
      
      {/* Second tier at level 3 */}
      {level >= 3 && (
        <>
          <rect x={-1.5} y={-18 - level * 2} width={3} height={10} rx={1} className="fill-muted/40" />
          <ellipse cx={0} cy={-18 - level * 2} rx={5} ry={2} className="fill-primary/15 stroke-primary/25" strokeWidth={0.5} />
        </>
      )}
    </g>
  );
};

export default Fountain;
