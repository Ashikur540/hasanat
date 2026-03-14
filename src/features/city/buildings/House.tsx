const House = ({ level, warm }: { level: number; warm: boolean }) => {
  const houses = Math.min(level + 1, 3);
  
  return (
    <g>
      {Array.from({ length: houses }).map((_, i) => {
        const ox = (i - (houses - 1) / 2) * 22;
        const h = 22 + (i === 0 ? level * 4 : 0);
        return (
          <g key={i} transform={`translate(${ox}, 0)`}>
            {/* Wall */}
            <rect x={-10} y={-h + 20} width={20} height={h} rx={1.5} className="fill-secondary stroke-border" strokeWidth={0.8} />
            {/* Roof */}
            <polygon points={`-14,${-h + 20} 0,${-h + 8} 14,${-h + 20}`} className="fill-primary/20 stroke-primary/30" strokeWidth={0.8} />
            {/* Door */}
            <rect x={-3} y={12} width={6} height={8} rx={1} className="fill-primary/30" />
            {/* Window */}
            <rect x={-7} y={-h / 2 + 12} width={5} height={5} rx={0.5} className={warm ? "fill-gold/50" : "fill-muted/20"} />
            <rect x={2} y={-h / 2 + 12} width={5} height={5} rx={0.5} className={warm ? "fill-gold/50" : "fill-muted/20"} />
          </g>
        );
      })}
      
      {/* Chimney smoke at level 3 */}
      {level >= 3 && warm && (
        <g transform="translate(6, -28)">
          {[0, 1, 2].map(i => (
            <circle key={i} cx={i * 3} cy={-i * 5} r={1.5 + i * 0.5} className="fill-muted-foreground/10" />
          ))}
        </g>
      )}
    </g>
  );
};

export default House;
