import { motion } from "framer-motion";
import { useState } from "react";

interface IsometricTileProps {
  gridX: number;
  gridY: number;
  children: React.ReactNode;
  label: string;
  category: string;
  count: number;
  vitality: number;
  emoji: string;
  delay?: number;
  isSelected: boolean;
  onClick: () => void;
}

// Convert grid coords to isometric screen coords
export const gridToIso = (gx: number, gy: number, tileW = 120, tileH = 60) => ({
  x: (gx - gy) * (tileW / 2) + 400,
  y: (gx + gy) * (tileH / 2) + 60,
});

const IsometricTile = ({
  gridX,
  gridY,
  children,
  label,
  category,
  count,
  vitality,
  emoji,
  delay = 0,
  isSelected,
  onClick,
}: IsometricTileProps) => {
  const [hovered, setHovered] = useState(false);
  const { x, y } = gridToIso(gridX, gridY);

  return (
    <motion.g
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <g transform={`translate(${x}, ${y})`}>
        {/* Isometric ground tile */}
        <motion.polygon
          points="0,-30 60,0 0,30 -60,0"
          className={
            isSelected
              ? "fill-primary/25 stroke-primary"
              : hovered
              ? "fill-primary/15 stroke-primary/60"
              : "fill-secondary/40 stroke-border"
          }
          strokeWidth={isSelected ? 2 : 1}
          animate={hovered ? { y: -3 } : { y: 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Building content - shifted up */}
        <motion.g
          animate={hovered ? { y: -6 } : { y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <g transform="translate(0, -55)">{children}</g>
        </motion.g>

        {/* Label below tile */}
        <text
          y={42}
          textAnchor="middle"
          className="fill-foreground text-[9px] font-semibold"
          style={{ pointerEvents: "none" }}
        >
          {label}
        </text>

        {/* Deed count badge */}
        <g transform="translate(0, 50)">
          <rect x={-16} y={0} width={32} height={14} rx={7} className="fill-card stroke-border" strokeWidth={0.5} />
          <text y={10} textAnchor="middle" className="fill-muted-foreground text-[7px] font-medium" style={{ pointerEvents: "none" }}>
            {count} deeds
          </text>
        </g>

        {/* Selection glow */}
        {isSelected && (
          <motion.polygon
            points="0,-30 60,0 0,30 -60,0"
            fill="none"
            className="stroke-primary"
            strokeWidth={2.5}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Hover tooltip */}
        {hovered && !isSelected && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
            <rect x={-45} y={-95} width={90} height={24} rx={6} className="fill-card stroke-border" strokeWidth={0.5} />
            <text y={-80} textAnchor="middle" className="fill-foreground text-[8px] font-medium" style={{ pointerEvents: "none" }}>
              {emoji} {category}
            </text>
          </motion.g>
        )}
      </g>
    </motion.g>
  );
};

export default IsometricTile;
