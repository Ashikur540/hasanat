const School = ({ level }: { level: number }) => {
  const w = 28 + level * 6;
  const h = 22 + level * 5;
  
  return (
    <g>
      {/* Main building */}
      <rect x={-w / 2} y={-h + 20} width={w} height={h} rx={2} className="fill-gold/10 stroke-gold/35" strokeWidth={1} />
      
      {/* Cornice */}
      <rect x={-w / 2 - 3} y={-h + 17} width={w + 6} height={5} rx={1.5} className="fill-gold/20" />
      
      {/* Sign board */}
      <rect x={-9} y={-h + 22} width={18} height={7} rx={1.5} className="fill-primary/15" />
      <line x1={-5} y1={-h + 25} x2={5} y2={-h + 25} className="stroke-primary/30" strokeWidth={0.8} />
      
      {/* Door */}
      <rect x={-4} y={8} width={8} height={12} rx={1} className="fill-gold/30" />
      
      {/* Windows */}
      {level >= 1 && (
        <>
          <rect x={-w / 2 + 4} y={-h / 2 + 12} width={6} height={6} rx={1} className="fill-gold/25" />
          <rect x={w / 2 - 10} y={-h / 2 + 12} width={6} height={6} rx={1} className="fill-gold/25" />
        </>
      )}
      
      {/* Flag at level 2+ */}
      {level >= 2 && (
        <g transform={`translate(${w / 2 - 2}, ${-h + 10})`}>
          <line x1={0} y1={0} x2={0} y2={-12} className="stroke-muted-foreground/40" strokeWidth={0.8} />
          <polygon points="0,-12 8,-9 0,-6" className="fill-primary/30" />
        </g>
      )}
      
      {/* Extra wing at level 3 */}
      {level >= 3 && (
        <rect x={-w / 2 - 14} y={-h / 2 + 10} width={14} height={h / 2 + 10} rx={2} className="fill-gold/8 stroke-gold/25" strokeWidth={0.8} />
      )}
    </g>
  );
};

export default School;
