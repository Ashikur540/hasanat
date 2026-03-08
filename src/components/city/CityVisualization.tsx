import { useRef, useState, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";

export type TimeOfDay = "fajr" | "morning" | "noon" | "evening" | "night";

interface CityVisualizationProps {
  categoryData: Record<string, { count: number; vitality: number; emoji: string; element: string }>;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  timeOfDay: TimeOfDay;
}

// Theme colors per time of day
const skyColors: Record<TimeOfDay, { top: string; bottom: string; ambient: string; directional: string; fog: string; ground: string; road: string; windowLit: string; windowDark: string; litChance: number }> = {
  fajr:    { top: "#1a0a2e", bottom: "#c85a3a", ambient: "#553344", directional: "#ff9966", fog: "#2a1530", ground: "#1a1a2a", road: "#2a2a3a", windowLit: "#ffcc66", windowDark: "#0a0a15", litChance: 0.35 },
  morning: { top: "#5588cc", bottom: "#aaccee", ambient: "#8899aa", directional: "#ffffcc", fog: "#88aacc", ground: "#2a3a2a", road: "#555555", windowLit: "#ffffaa", windowDark: "#334455", litChance: 0.15 },
  noon:    { top: "#4488dd", bottom: "#99ccee", ambient: "#aabbcc", directional: "#ffffff", fog: "#88bbdd", ground: "#2a3a2a", road: "#666666", windowLit: "#ffffff", windowDark: "#445566", litChance: 0.1 },
  evening: { top: "#1a1535", bottom: "#cc6633", ambient: "#664433", directional: "#ff8844", fog: "#2a1a25", ground: "#1a1a22", road: "#333340", windowLit: "#ffaa44", windowDark: "#0c0c18", litChance: 0.55 },
  night:   { top: "#050510", bottom: "#0a0a20", ambient: "#111122", directional: "#334466", fog: "#060612", ground: "#0a0a15", road: "#151520", windowLit: "#4488ff", windowDark: "#050508", litChance: 0.7 },
};

const categories = ["Salah", "Quran", "Sadaqah", "Dhikr", "Character", "Family", "Fasting", "Knowledge"];

const catColors: Record<string, { base: string; accent: string; roofTop: string }> = {
  Salah:     { base: "#1a3a2a", accent: "#2a7a4a", roofTop: "#3a9a5a" },
  Quran:     { base: "#1a2a3a", accent: "#2a5a8a", roofTop: "#3a7aaa" },
  Sadaqah:   { base: "#1a3a1a", accent: "#2a8a3a", roofTop: "#4aaa5a" },
  Dhikr:     { base: "#1a3a3a", accent: "#2a7a8a", roofTop: "#3a9aaa" },
  Character: { base: "#2a1a3a", accent: "#5a3a8a", roofTop: "#7a5aaa" },
  Family:    { base: "#3a2a1a", accent: "#8a5a2a", roofTop: "#aa7a4a" },
  Fasting:   { base: "#2a1a3a", accent: "#6a3a9a", roofTop: "#8a5aba" },
  Knowledge: { base: "#3a3a1a", accent: "#8a8a2a", roofTop: "#aaaa4a" },
};

// Seeded random
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Single 3D building
const Building3D = ({
  position,
  width,
  depth,
  height,
  cat,
  theme,
  isSelected,
  isHovered,
  onHover,
  onClick,
  seed,
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  cat: string;
  theme: typeof skyColors.night;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (h: boolean) => void;
  onClick: () => void;
  seed: number;
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const cc = catColors[cat] || catColors.Salah;

  // Animate hover
  useFrame(() => {
    if (!meshRef.current) return;
    const targetY = isHovered ? 0.3 : 0;
    meshRef.current.position.y += (targetY - (meshRef.current.position.y - position[1])) * 0.1;
  });

  // Window texture via canvas
  const windowTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = Math.max(64, Math.floor(height * 16));
    const ctx = canvas.getContext("2d")!;

    // Base color
    ctx.fillStyle = cc.base;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Windows grid
    const wSize = 4;
    const gap = 6;
    const cols = Math.floor(canvas.width / (wSize + gap));
    const rows = Math.floor(canvas.height / (wSize + gap));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const s = seededRandom(seed + r * 17 + c * 31);
        const isLit = s < theme.litChance;
        ctx.fillStyle = isLit ? theme.windowLit : theme.windowDark;
        ctx.globalAlpha = isLit ? 0.7 + s * 0.3 : 0.3;
        ctx.fillRect(gap / 2 + c * (wSize + gap), gap / 2 + r * (wSize + gap), wSize, wSize);
      }
    }
    ctx.globalAlpha = 1;

    // Edge lines
    ctx.strokeStyle = cc.accent;
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [cc, theme, height, seed]);

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerEnter={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerLeave={(e) => { e.stopPropagation(); onHover(false); document.body.style.cursor = "grab"; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Main building */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial map={windowTexture} />
      </mesh>

      {/* Roof accent */}
      <mesh position={[0, height + 0.05, 0]}>
        <boxGeometry args={[width + 0.1, 0.1, depth + 0.1]} />
        <meshStandardMaterial color={cc.accent} />
      </mesh>

      {/* Rooftop feature per category */}
      {cat === "Salah" && (
        <>
          {/* Dome */}
          <mesh position={[0, height + 0.6, 0]}>
            <sphereGeometry args={[width * 0.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={cc.roofTop} />
          </mesh>
          {/* Minaret */}
          <mesh position={[width * 0.35, height + 1.2, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 2.4, 8]} />
            <meshStandardMaterial color={cc.accent} />
          </mesh>
          <mesh position={[width * 0.35, height + 2.5, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#ccaa44" emissive="#ccaa44" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
      {cat === "Fasting" && (
        <>
          <mesh position={[0, height + 1.5, 0]}>
            <cylinderGeometry args={[0.06, 0.1, 3, 8]} />
            <meshStandardMaterial color={cc.accent} />
          </mesh>
          <mesh position={[0, height + 3.1, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial color="#ccaa44" emissive="#ccaa44" emissiveIntensity={0.6} />
          </mesh>
        </>
      )}
      {cat === "Sadaqah" && (
        <>
          {[-0.3, 0, 0.3].map((xo, i) => (
            <group key={i} position={[xo, height + 0.1, (i - 1) * 0.3]}>
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.02, 0.03, 0.4, 6]} />
                <meshStandardMaterial color="#553322" />
              </mesh>
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshStandardMaterial color="#338833" />
              </mesh>
            </group>
          ))}
        </>
      )}
      {cat === "Knowledge" && (
        <mesh position={[0, height + 0.4, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.6, 0.6, 0.08]} />
          <meshStandardMaterial color={cc.accent} />
        </mesh>
      )}

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(width, depth) * 0.7, Math.max(width, depth) * 0.8, 32]} />
          <meshStandardMaterial color={cc.roofTop} emissive={cc.roofTop} emissiveIntensity={1} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover label */}
      {isHovered && (
        <Html position={[0, height + 2, 0]} center distanceFactor={15} style={{ pointerEvents: "none" }}>
          <div className="bg-card/95 border border-border rounded-lg px-3 py-1.5 shadow-lg backdrop-blur-sm whitespace-nowrap">
            <p className="text-xs font-semibold text-foreground">{catColors[cat] ? cat : ""}</p>
            <p className="text-[10px] text-muted-foreground">Click to inspect</p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Background buildings (small filler)
const BackgroundBuildings = ({ theme, count = 120 }: { theme: typeof skyColors.night; count?: number }) => {
  const buildings = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = seededRandom(i * 3) * Math.PI * 2;
      const dist = 8 + seededRandom(i * 7) * 25;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const h = 0.5 + seededRandom(i * 11) * 4;
      const w = 0.3 + seededRandom(i * 13) * 0.6;
      return { x, z, h, w };
    });
  }, [count]);

  const bgTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = theme.ground;
    ctx.fillRect(0, 0, 32, 64);
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 6; c++) {
        const s = seededRandom(r * 11 + c * 23);
        if (s < theme.litChance * 0.6) {
          ctx.fillStyle = theme.windowLit;
          ctx.globalAlpha = 0.3 + s * 0.4;
          ctx.fillRect(2 + c * 5, 2 + r * 5, 3, 3);
        }
      }
    }
    ctx.globalAlpha = 1;
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, [theme]);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]} castShadow>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial map={bgTexture} />
        </mesh>
      ))}
    </group>
  );
};

// Ground plane
const Ground = ({ theme }: { theme: typeof skyColors.night }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
    <planeGeometry args={[80, 80]} />
    <meshStandardMaterial color={theme.ground} />
  </mesh>
);

// Roads grid
const Roads = ({ theme }: { theme: typeof skyColors.night }) => {
  const roadColor = theme.road;
  return (
    <group>
      {/* Main roads */}
      {[-6, 0, 6].map((x) => (
        <mesh key={`rx${x}`} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.8, 40]} />
          <meshStandardMaterial color={roadColor} />
        </mesh>
      ))}
      {[-4, 4].map((z) => (
        <mesh key={`rz${z}`} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[40, 0.6]} />
          <meshStandardMaterial color={roadColor} />
        </mesh>
      ))}
    </group>
  );
};

// Scene with all buildings
const CityScene = ({
  categoryData, selectedCategory, onSelectCategory, timeOfDay,
}: CityVisualizationProps) => {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const theme = skyColors[timeOfDay];
  const maxCount = Math.max(...Object.values(categoryData).map(d => d.count), 1);

  // Layout: 2 rows of 4
  const positions: [number, number][] = [
    [-4.5, -2], [-1.5, -2], [1.5, -2], [4.5, -2],
    [-4.5, 2],  [-1.5, 2],  [1.5, 2],  [4.5, 2],
  ];

  return (
    <>
      {/* Lighting */}
      <ambientLight color={theme.ambient} intensity={0.6} />
      <directionalLight
        color={theme.directional}
        intensity={1.2}
        position={[10, 15, 8]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 10, 0]} color={theme.windowLit} intensity={0.15} />

      {/* Fog */}
      <fog attach="fog" args={[theme.fog, 15, 45]} />

      {/* Ground & roads */}
      <Ground theme={theme} />
      <Roads theme={theme} />

      {/* Background filler buildings */}
      <BackgroundBuildings theme={theme} />

      {/* Main category buildings */}
      {categories.map((cat, i) => {
        const data = categoryData[cat];
        if (!data) return null;
        const [px, pz] = positions[i];
        const height = 1 + (data.count / maxCount) * 8;
        const width = 1.8;
        const depth = 1.8;

        return (
          <Building3D
            key={cat}
            position={[px, 0, pz]}
            width={width}
            depth={depth}
            height={height}
            cat={cat}
            theme={theme}
            isSelected={selectedCategory === cat}
            isHovered={hoveredCat === cat}
            onHover={(h) => setHoveredCat(h ? cat : null)}
            onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
            seed={i * 100 + cat.charCodeAt(0)}
          />
        );
      })}

      {/* Category labels on ground */}
      {categories.map((cat, i) => {
        const data = categoryData[cat];
        if (!data) return null;
        const [px, pz] = positions[i];
        return (
          <Text
            key={`label-${cat}`}
            position={[px, 0.02, pz + 1.5]}
            rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.25}
            color={theme.windowLit}
            anchorX="center"
            anchorY="middle"
            font={undefined}
          >
            {data.emoji} {data.element}
          </Text>
        );
      })}

      {/* Orbit controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.2}
        target={[0, 0, 0]}
      />
    </>
  );
};

const CityVisualization = (props: CityVisualizationProps) => {
  const theme = skyColors[props.timeOfDay];

  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-xl overflow-hidden" style={{ cursor: "grab" }}>
      <Canvas
        shadows
        camera={{ position: [12, 14, 12], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setClearColor(theme.fog);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
        style={{ background: theme.fog }}
      >
        <CityScene {...props} />
      </Canvas>
    </div>
  );
};

export default CityVisualization;
