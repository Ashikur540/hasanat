const CommunityCentre = ({ level }: { level: number }) => {
  const w = 26 + level * 5;
  const h = 20 + level * 6;
  
  return (
    <g>
      {/* Main building */}
      <rect x={-w / 2} y={-h + 20} width={w} height={h} rx={2.5} className="fill-primary/10 stroke-primary/30" strokeWidth={1} />
      
      {/* Roof */}
      <polygon points={`${-w / 2 - 3},${-h + 20} 0,${-h + 10} ${w / 2 + 3},${-h + 20}`} className="fill-primary/15 stroke-primary/25" strokeWidth={0.8} />
      
      {/* Heart symbol */}
      <g transform={`translate(0, ${-h + 6}) scale(0.45)`}>
        <path d="M0 8 C-5 -2 -15 -2 -15 5 C-15 12 0 20 0 20 C0 20 15 12 15 5 C15 -2 5 -2 0 8Z" className="fill-destructive/30" />
      </g>
      
      {/* Double doors */}
      <rect x={-7} y={8} width={6} height={12} rx={3} className="fill-primary/20" />
      <rect x={1} y={8} width={6} height={12} rx={3} className="fill-primary/20" />
      
      {/* Round windows */}
      {level >= 1 && (
        <>
          <circle cx={-w / 2 + 6} cy={-h / 2 + 14} r={3} className="fill-gold/25" />
          <circle cx={w / 2 - 6} cy={-h / 2 + 14} r={3} className="fill-gold/25" />
        </>
      )}
      
      {/* Gathering area at level 3 */}
      {level >= 3 && (
        <g transform="translate(0, 22)">
          <ellipse cx={0} cy={0} rx={w / 2 + 6} ry={4} className="fill-primary/5 stroke-primary/15" strokeWidth={0.5} />
          {/* Tiny people silhouettes */}
          {[-10, -4, 3, 9].map((px, i) => (
            <circle key={i} cx={px} cy={-3} r={1.5} className="fill-muted-foreground/20" />
          ))}
        </g>
      )}
    </g>
  );
};

export default CommunityCentre;
