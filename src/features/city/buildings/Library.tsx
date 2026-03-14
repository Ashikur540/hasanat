const Library = ({ level }: { level: number }) => {
  const h = 18 + level * 10;
  const w = 28 + level * 5;

  return (
    <g>
      {/* Main structure */}
      <rect x={-w / 2} y={-h + 20} width={w} height={h} rx={2} className="fill-gold/15 stroke-gold/50" strokeWidth={1} />
      
      {/* Roof - triangle */}
      <polygon points={`${-w / 2 - 4},${-h + 20} 0,${-h + 5 - level * 3} ${w / 2 + 4},${-h + 20}`} className="fill-gold/25 stroke-gold/40" strokeWidth={1} />
      
      {/* Columns */}
      <rect x={-w / 2 + 3} y={-h + 22} width={3} height={h - 4} rx={1} className="fill-gold/30" />
      <rect x={w / 2 - 6} y={-h + 22} width={3} height={h - 4} rx={1} className="fill-gold/30" />
      
      {/* Books - more with level */}
      {Array.from({ length: Math.min(level + 2, 5) }).map((_, i) => (
        <rect
          key={i}
          x={-6 + i * 4}
          y={-h / 2 + 8 + (i % 2) * 2}
          width={3}
          height={8 + (i % 3)}
          rx={0.5}
          className={["fill-primary/40", "fill-destructive/25", "fill-gold/50", "fill-primary/30", "fill-accent/30"][i]}
        />
      ))}
      
      {/* Door */}
      <rect x={-4} y={8} width={8} height={12} rx={4} className="fill-gold/30" />
      
      {/* Lantern at level 2+ */}
      {level >= 2 && (
        <>
          <circle cx={0} cy={-h + 2 - level * 3} r={3} className="fill-gold/40 stroke-gold/50" strokeWidth={0.8} />
          <line x1={0} y1={-h + 5 - level * 3} x2={0} y2={-h - 2 - level * 3} className="stroke-gold/40" strokeWidth={0.8} />
        </>
      )}
      
      {/* Extra wing at level 3 */}
      {level >= 3 && (
        <rect x={w / 2} y={-h / 2 + 10} width={12} height={h / 2 + 10} rx={2} className="fill-gold/10 stroke-gold/30" strokeWidth={0.8} />
      )}
    </g>
  );
};

export default Library;
