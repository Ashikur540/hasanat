import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

export type TimeOfDay = "fajr" | "morning" | "noon" | "evening" | "night";

interface CityVisualizationProps {
  categoryData: Record<string, { count: number; vitality: number; emoji: string; element: string }>;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  timeOfDay: TimeOfDay;
}

const skyColors: Record<TimeOfDay, {
  ambient: string; ambientIntensity: number;
  directional: string; dirIntensity: number; dirPos: [number, number, number];
  fog: string; fogNear: number; fogFar: number;
  ground: string; grass: string; road: string; roadLine: string;
  windowLit: string; windowDark: string; litChance: number;
  skyTop: string; skyBot: string;
  exposure: number;
}> = {
  fajr: {
    ambient: "#aa6677", ambientIntensity: 0.7,
    directional: "#ffaa77", dirIntensity: 1.0, dirPos: [5, 8, -10],
    fog: "#3a2035", fogNear: 18, fogFar: 50,
    ground: "#1e2228", grass: "#2a3a25", road: "#2a2a35", roadLine: "#ffcc44",
    windowLit: "#ffcc66", windowDark: "#0e0e18", litChance: 0.4,
    skyTop: "#1a0a2e", skyBot: "#cc7755",
    exposure: 1.0,
  },
  morning: {
    ambient: "#e8ddd0", ambientIntensity: 1.2,
    directional: "#fff8e0", dirIntensity: 2.0, dirPos: [8, 20, 6],
    fog: "#d8e8d0", fogNear: 25, fogFar: 60,
    ground: "#6a8a4a", grass: "#7aaa55", road: "#a09080", roadLine: "#ffffff",
    windowLit: "#ffffff", windowDark: "#c0b8a8", litChance: 0.08,
    skyTop: "#78bbee", skyBot: "#e8f0f0",
    exposure: 1.8,
  },
  noon: {
    ambient: "#f0ece0", ambientIntensity: 1.5,
    directional: "#fffff0", dirIntensity: 2.5, dirPos: [2, 25, 2],
    fog: "#e5eed8", fogNear: 28, fogFar: 65,
    ground: "#7a9a5a", grass: "#8aaa60", road: "#b0a090", roadLine: "#ffffff",
    windowLit: "#ffffff", windowDark: "#c8c0b0", litChance: 0.05,
    skyTop: "#5599dd", skyBot: "#d8e8f0",
    exposure: 2.0,
  },
  evening: {
    ambient: "#885533", ambientIntensity: 0.8,
    directional: "#ff7733", dirIntensity: 1.2, dirPos: [-8, 6, -5],
    fog: "#2a1820", fogNear: 16, fogFar: 48,
    ground: "#1a1a20", grass: "#253020", road: "#333338", roadLine: "#cc9944",
    windowLit: "#ffaa44", windowDark: "#0c0c15", litChance: 0.6,
    skyTop: "#150e25", skyBot: "#cc5522",
    exposure: 1.1,
  },
  night: {
    ambient: "#112244", ambientIntensity: 0.35,
    directional: "#334466", dirIntensity: 0.5, dirPos: [5, 12, 5],
    fog: "#060610", fogNear: 14, fogFar: 42,
    ground: "#0a0a12", grass: "#0e1510", road: "#151518", roadLine: "#444455",
    windowLit: "#4488ff", windowDark: "#050508", litChance: 0.75,
    skyTop: "#020208", skyBot: "#0a0a22",
    exposure: 0.8,
  },
};

const categories = ["Salah", "Quran", "Sadaqah", "Dhikr", "Character", "Family", "Fasting", "Knowledge"];

// Vibrant distinct palettes per category
const catPalettes: Record<string, { walls: string; wallsLight: string; trim: string; roof: string; glow: string; emissive: string }> = {
  Salah:     { walls: "#2a4a3a", wallsLight: "#d8cbb8", trim: "#5a9a6a", roof: "#7ab888", glow: "#44ffaa", emissive: "#4a9a6a" },
  Quran:     { walls: "#2a3a4a", wallsLight: "#c8bba8", trim: "#5577aa", roof: "#7799bb", glow: "#44aaff", emissive: "#4477aa" },
  Sadaqah:   { walls: "#2a4a2a", wallsLight: "#d0c8b0", trim: "#6a9a5a", roof: "#88bb77", glow: "#66ff88", emissive: "#5a9a4a" },
  Dhikr:     { walls: "#2a4a4a", wallsLight: "#c8d0c0", trim: "#5a99aa", roof: "#77bbcc", glow: "#44eeff", emissive: "#4a99aa" },
  Character: { walls: "#3a2a4a", wallsLight: "#d8c8d0", trim: "#8866aa", roof: "#aa88bb", glow: "#cc88ff", emissive: "#7755aa" },
  Family:    { walls: "#4a3a2a", wallsLight: "#e0d0c0", trim: "#bb8855", roof: "#ccaa77", glow: "#ffbb55", emissive: "#aa7744" },
  Fasting:   { walls: "#4a2a3a", wallsLight: "#d8c0c8", trim: "#9966aa", roof: "#bb88cc", glow: "#dd88ff", emissive: "#8855aa" },
  Knowledge: { walls: "#4a4a2a", wallsLight: "#e0d8c0", trim: "#bbaa55", roof: "#ddcc77", glow: "#ffee55", emissive: "#aa9944" },
};

const sr = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ─── Unique building shapes per category ────────────────────────

const MosqueBuilding = ({ h, w, d, pal, theme, seed }: { h: number; w: number; d: number; pal: typeof catPalettes.Salah; theme: typeof skyColors.night; seed: number }) => {
  const isDay = theme.ambientIntensity > 1;
  const wallColor = isDay ? pal.wallsLight : pal.walls;
  return (
    <group>
      {/* Main body - wider base */}
      <mesh position={[0, h * 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 1.1, h * 0.8, d * 1.1]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Central dome */}
      <mesh position={[0, h * 0.8 + 0.3, 0]}>
        <sphereGeometry args={[w * 0.45, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={pal.roof} metalness={0.3} roughness={0.4} />
      </mesh>
      {/* 4 Minarets at corners */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([mx, mz], i) => (
        <group key={i} position={[mx * w * 0.5, 0, mz * d * 0.5]}>
          <mesh position={[0, h * 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, h * 1.1, 8]} />
            <meshStandardMaterial color={pal.trim} />
          </mesh>
          {/* Minaret top */}
          <mesh position={[0, h * 1.15, 0]}>
            <coneGeometry args={[0.12, 0.3, 8]} />
            <meshStandardMaterial color={pal.roof} />
          </mesh>
          <mesh position={[0, h * 1.35, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={isDay ? 0.2 : 0.8} />
          </mesh>
        </group>
      ))}
      {/* Entrance arch */}
      <mesh position={[0, h * 0.2, d * 0.56]}>
        <boxGeometry args={[w * 0.4, h * 0.4, 0.15]} />
        <meshStandardMaterial color={pal.trim} />
      </mesh>
      {/* Green glow at night */}
      {!isDay && <pointLight position={[0, h * 0.5, 0]} color={pal.glow} intensity={0.4} distance={4} />}
    </group>
  );
};

const LibraryBuilding = ({ h, w, d, pal, theme }: { h: number; w: number; d: number; pal: typeof catPalettes.Quran; theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  const wallColor = isDay ? pal.wallsLight : pal.walls;
  return (
    <group>
      {/* Main building - L-shape */}
      <mesh position={[0, h * 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.8, d]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Triangular roof */}
      <mesh position={[0, h * 0.85, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[w * 0.65, h * 0.35, 4]} />
        <meshStandardMaterial color={pal.roof} flatShading />
      </mesh>
      {/* Side wing */}
      <mesh position={[w * 0.5, h * 0.2, 0]} castShadow>
        <boxGeometry args={[w * 0.4, h * 0.4, d * 0.7]} />
        <meshStandardMaterial color={isDay ? "#d8e4f0" : "#152535"} />
      </mesh>
      {/* Columns at front */}
      {[-0.35, -0.12, 0.12, 0.35].map((cx, i) => (
        <mesh key={i} position={[cx * w, h * 0.25, d * 0.52]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, h * 0.5, 8]} />
          <meshStandardMaterial color={pal.trim} />
        </mesh>
      ))}
      {/* Book stack on roof */}
      {[0, 0.15, 0.3].map((y, i) => (
        <mesh key={i} position={[-w * 0.3, h * 0.82 + y, -d * 0.3]}>
          <boxGeometry args={[0.25, 0.12, 0.18]} />
          <meshStandardMaterial color={["#cc4444", "#4466cc", "#44aa44"][i]} />
        </mesh>
      ))}
    </group>
  );
};

const GardenBuilding = ({ h, w, d, pal, theme }: { h: number; w: number; d: number; pal: typeof catPalettes.Sadaqah; theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  return (
    <group>
      {/* Low pavilion */}
      <mesh position={[0, h * 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 1.2, h * 0.3, d * 1.2]} />
        <meshStandardMaterial color={isDay ? "#f0ece0" : "#2a2a1a"} />
      </mesh>
      {/* Garden arch roof */}
      <mesh position={[0, h * 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[w * 0.5, w * 0.5, d * 1.2, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={pal.roof} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Trees - variety of sizes and colors */}
      {[
        [-0.6, 0, -0.5, 0.8, "#228833"], [-0.3, 0, 0.6, 0.6, "#33aa44"],
        [0.5, 0, -0.4, 1.0, "#1a7733"], [0.7, 0, 0.5, 0.5, "#44bb55"],
        [-0.7, 0, 0.2, 0.7, "#2a9940"], [0.2, 0, -0.7, 0.9, "#338844"],
      ].map(([x, _, z, scale, color], i) => (
        <group key={i} position={[x as number * w, h * 0.3, z as number * d]}>
          <mesh position={[0, 0.15 * (scale as number), 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.3 * (scale as number), 6]} />
            <meshStandardMaterial color="#664422" />
          </mesh>
          <mesh position={[0, 0.4 * (scale as number), 0]}>
            <sphereGeometry args={[0.22 * (scale as number), 8, 8]} />
            <meshStandardMaterial color={color as string} />
          </mesh>
          {(scale as number) > 0.7 && (
            <mesh position={[0.08, 0.55 * (scale as number), 0.05]}>
              <sphereGeometry args={[0.15 * (scale as number), 8, 8]} />
              <meshStandardMaterial color={color as string} />
            </mesh>
          )}
        </group>
      ))}
      {/* Flower beds */}
      {[[-0.4, 0.3], [0.3, -0.3], [0, 0.5]].map(([x, z], i) => (
        <mesh key={`f${i}`} position={[x * w, h * 0.31, z * d]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.15, 8]} />
          <meshStandardMaterial color={["#ee4466", "#ff88aa", "#ffaa33"][i]} />
        </mesh>
      ))}
      {/* Pond */}
      <mesh position={[0, h * 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshStandardMaterial color="#3388cc" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
};

const FountainBuilding = ({ h, w, d, pal, theme }: { h: number; w: number; d: number; pal: typeof catPalettes.Dhikr; theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.15;
  });
  return (
    <group>
      {/* Octagonal base */}
      <mesh position={[0, h * 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[w * 0.6, w * 0.65, h * 0.4, 8]} />
        <meshStandardMaterial color={isDay ? "#dde8ee" : pal.walls} />
      </mesh>
      {/* Second tier */}
      <mesh position={[0, h * 0.5, 0]}>
        <cylinderGeometry args={[w * 0.4, w * 0.45, h * 0.25, 8]} />
        <meshStandardMaterial color={isDay ? "#ccdde8" : "#1a3040"} />
      </mesh>
      {/* Central column */}
      <mesh position={[0, h * 0.7, 0]}>
        <cylinderGeometry args={[0.06, 0.1, h * 0.5, 8]} />
        <meshStandardMaterial color={pal.trim} />
      </mesh>
      {/* Top bowl */}
      <mesh position={[0, h * 0.95, 0]}>
        <sphereGeometry args={[0.25, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={pal.roof} side={THREE.DoubleSide} />
      </mesh>
      {/* Water surface */}
      <mesh position={[0, h * 0.41, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[w * 0.5, 16]} />
        <meshStandardMaterial color="#2299cc" metalness={0.7} roughness={0.15} transparent opacity={0.8} />
      </mesh>
      {/* Rotating sparkle particles */}
      <group ref={ref} position={[0, h * 0.6, 0]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 0.3, Math.sin(i * 0.5) * 0.2, Math.sin(i * Math.PI / 3) * 0.3]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshStandardMaterial color={pal.glow} emissive={pal.glow} emissiveIntensity={isDay ? 0.3 : 1} />
          </mesh>
        ))}
      </group>
      {!isDay && <pointLight position={[0, h * 0.5, 0]} color={pal.glow} intensity={0.5} distance={4} />}
    </group>
  );
};

const CommunityBuilding = ({ h, w, d, pal, theme }: { h: number; w: number; d: number; pal: typeof catPalettes.Character; theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  return (
    <group>
      {/* Circular amphitheater base */}
      <mesh position={[0, h * 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[w * 0.7, w * 0.8, h * 0.3, 16]} />
        <meshStandardMaterial color={isDay ? pal.wallsLight : pal.walls} />
      </mesh>
      {/* Main tower */}
      <mesh position={[0, h * 0.55, 0]} castShadow>
        <cylinderGeometry args={[w * 0.35, w * 0.4, h * 0.7, 12]} />
        <meshStandardMaterial color={isDay ? "#e8ddf0" : "#2a1a3a"} />
      </mesh>
      {/* Pointed dome */}
      <mesh position={[0, h * 0.95, 0]}>
        <coneGeometry args={[w * 0.38, h * 0.3, 12]} />
        <meshStandardMaterial color={pal.roof} />
      </mesh>
      {/* Heart emblem */}
      <mesh position={[0, h * 1.15, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ff4477" emissive="#ff4477" emissiveIntensity={isDay ? 0.3 : 0.8} />
      </mesh>
      {/* Benches around */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * w * 0.65, 0.08, Math.sin(a) * d * 0.65]}>
            <boxGeometry args={[0.2, 0.08, 0.1]} />
            <meshStandardMaterial color="#664422" />
          </mesh>
        );
      })}
    </group>
  );
};

const HouseBuilding = ({ h, w, d, pal, theme }: { h: number; w: number; d: number; pal: typeof catPalettes.Family; theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  return (
    <group>
      {/* Main house */}
      <mesh position={[0, h * 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h * 0.6, d]} />
        <meshStandardMaterial color={isDay ? pal.wallsLight : pal.walls} />
      </mesh>
      {/* Sloped roof */}
      <mesh position={[0, h * 0.65, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[w * 0.8, h * 0.35, 4]} />
        <meshStandardMaterial color={pal.roof} flatShading />
      </mesh>
      {/* Chimney */}
      <mesh position={[w * 0.3, h * 0.8, -d * 0.2]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color="#884433" />
      </mesh>
      {/* Side extension */}
      <mesh position={[-w * 0.45, h * 0.15, 0]} castShadow>
        <boxGeometry args={[w * 0.35, h * 0.3, d * 0.7]} />
        <meshStandardMaterial color={isDay ? "#f0e8dd" : "#3a2515"} />
      </mesh>
      {/* Garage door */}
      <mesh position={[-w * 0.45, h * 0.1, d * 0.36]}>
        <boxGeometry args={[w * 0.3, h * 0.2, 0.05]} />
        <meshStandardMaterial color={isDay ? "#bbb" : "#333"} />
      </mesh>
      {/* Front door */}
      <mesh position={[0, h * 0.12, d * 0.51]}>
        <boxGeometry args={[0.18, 0.3, 0.05]} />
        <meshStandardMaterial color={pal.trim} />
      </mesh>
      {/* Windows with warm glow */}
      {[[0.25, 0.35], [-0.15, 0.35], [0.25, 0.15]].map(([x, y], i) => (
        <mesh key={i} position={[x * w, y * h, d * 0.51]}>
          <boxGeometry args={[0.15, 0.12, 0.02]} />
          <meshStandardMaterial
            color={isDay ? "#aaddff" : "#ffaa44"}
            emissive={isDay ? "#aaddff" : "#ffaa44"}
            emissiveIntensity={isDay ? 0.1 : 0.6}
          />
        </mesh>
      ))}
      {/* Garden fence */}
      <mesh position={[0, 0.06, d * 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 1.5, 0.3]} />
        <meshStandardMaterial color="#886644" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

const TowerBuilding = ({ h, w, d, pal, theme }: { h: number; w: number; d: number; pal: typeof catPalettes.Fasting; theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  const glowRef = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glowRef.current) glowRef.current.intensity = 0.3 + Math.sin(clock.elapsedTime * 2) * 0.2;
  });
  return (
    <group>
      {/* Base */}
      <mesh position={[0, h * 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[w * 0.5, w * 0.6, h * 0.2, 6]} />
        <meshStandardMaterial color={isDay ? pal.wallsLight : pal.walls} />
      </mesh>
      {/* Main tower - tapers */}
      <mesh position={[0, h * 0.55, 0]} castShadow>
        <cylinderGeometry args={[w * 0.2, w * 0.35, h * 0.9, 8]} />
        <meshStandardMaterial color={isDay ? "#e8ddf5" : "#2a1540"} />
      </mesh>
      {/* Observation deck */}
      <mesh position={[0, h * 0.85, 0]}>
        <cylinderGeometry args={[w * 0.35, w * 0.25, h * 0.08, 12]} />
        <meshStandardMaterial color={pal.trim} />
      </mesh>
      {/* Spire */}
      <mesh position={[0, h * 1.15, 0]}>
        <coneGeometry args={[0.06, h * 0.4, 8]} />
        <meshStandardMaterial color={pal.roof} />
      </mesh>
      {/* Crescent moon on top */}
      <mesh position={[0, h * 1.4, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 16, Math.PI * 1.2]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ffcc44" emissiveIntensity={isDay ? 0.2 : 1.0} />
      </mesh>
      {/* Pulsing glow */}
      {!isDay && <pointLight ref={glowRef} position={[0, h * 1.0, 0]} color={pal.glow} intensity={0.4} distance={5} />}
      {/* Balcony rings */}
      {[0.35, 0.55, 0.75].map((yf, i) => (
        <mesh key={i} position={[0, h * yf, 0]}>
          <torusGeometry args={[w * (0.35 - i * 0.04), 0.02, 6, 16]} />
          <meshStandardMaterial color={pal.trim} />
        </mesh>
      ))}
    </group>
  );
};

const SchoolBuilding = ({ h, w, d, pal, theme }: { h: number; w: number; d: number; pal: typeof catPalettes.Knowledge; theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  return (
    <group>
      {/* Main building - wide */}
      <mesh position={[0, h * 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 1.3, h * 0.6, d]} />
        <meshStandardMaterial color={isDay ? pal.wallsLight : pal.walls} />
      </mesh>
      {/* Flat roof with parapet */}
      <mesh position={[0, h * 0.61, 0]}>
        <boxGeometry args={[w * 1.35, 0.06, d * 1.05]} />
        <meshStandardMaterial color={pal.trim} />
      </mesh>
      {/* Clock tower center */}
      <mesh position={[0, h * 0.8, 0]} castShadow>
        <boxGeometry args={[w * 0.35, h * 0.4, d * 0.35]} />
        <meshStandardMaterial color={isDay ? "#f0ece0" : "#3a3520"} />
      </mesh>
      {/* Clock face */}
      <mesh position={[0, h * 0.85, d * 0.18]}>
        <circleGeometry args={[0.15, 16]} />
        <meshStandardMaterial color="#ffffee" emissive={pal.glow} emissiveIntensity={isDay ? 0.1 : 0.5} />
      </mesh>
      {/* Pyramid top */}
      <mesh position={[0, h * 1.05, 0]}>
        <coneGeometry args={[w * 0.22, 0.3, 4]} />
        <meshStandardMaterial color={pal.roof} flatShading />
      </mesh>
      {/* Flag */}
      <mesh position={[w * 0.55, h * 0.8, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[w * 0.55 + 0.1, h * 1.05, 0]}>
        <boxGeometry args={[0.2, 0.1, 0.01]} />
        <meshStandardMaterial color={pal.roof} side={THREE.DoubleSide} />
      </mesh>
      {/* Windows row */}
      {[-0.45, -0.25, -0.05, 0.15, 0.35].map((xf, i) => (
        <mesh key={i} position={[xf * w, h * 0.35, d * 0.51]}>
          <boxGeometry args={[0.12, 0.15, 0.02]} />
          <meshStandardMaterial
            color={isDay ? "#aaddff" : pal.glow}
            emissive={isDay ? "#88bbee" : pal.glow}
            emissiveIntensity={isDay ? 0.05 : 0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

// ─── Building wrapper ────────────────────────────────────────────

const BuildingWrapper = ({ position, cat, data, theme, isSelected, isHovered, onHover, onClick, seed }: {
  position: [number, number, number]; cat: string;
  data: { count: number; vitality: number; emoji: string; element: string };
  theme: typeof skyColors.night; isSelected: boolean; isHovered: boolean;
  onHover: (h: boolean) => void; onClick: () => void; seed: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const maxCount = 156;
  const h = 1.5 + (data.count / maxCount) * 7;
  const w = 1.8;
  const d = 1.8;
  const pal = catPalettes[cat] || catPalettes.Salah;

  useFrame(() => {
    if (!ref.current) return;
    const targetY = isHovered ? 0.25 : 0;
    ref.current.position.y += (targetY - ref.current.position.y + position[1]) * 0.12 - position[1] * 0.12;
  });

  const BuildingComp = useMemo(() => {
    switch (cat) {
      case "Salah": return <MosqueBuilding h={h} w={w} d={d} pal={pal} theme={theme} seed={seed} />;
      case "Quran": return <LibraryBuilding h={h} w={w} d={d} pal={pal} theme={theme} />;
      case "Sadaqah": return <GardenBuilding h={h} w={w} d={d} pal={pal} theme={theme} />;
      case "Dhikr": return <FountainBuilding h={h} w={w} d={d} pal={pal} theme={theme} />;
      case "Character": return <CommunityBuilding h={h} w={w} d={d} pal={pal} theme={theme} />;
      case "Family": return <HouseBuilding h={h} w={w} d={d} pal={pal} theme={theme} />;
      case "Fasting": return <TowerBuilding h={h} w={w} d={d} pal={pal} theme={theme} />;
      case "Knowledge": return <SchoolBuilding h={h} w={w} d={d} pal={pal} theme={theme} />;
      default: return null;
    }
  }, [cat, h, w, d, pal, theme, seed]);

  return (
    <group
      ref={ref}
      position={position}
      onPointerEnter={(e) => { e.stopPropagation(); onHover(true); document.body.style.cursor = "pointer"; }}
      onPointerLeave={(e) => { e.stopPropagation(); onHover(false); document.body.style.cursor = "grab"; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {BuildingComp}

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.35, 32]} />
          <meshStandardMaterial color={pal.glow} emissive={pal.glow} emissiveIntensity={1.5} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hover label */}
      {isHovered && (
        <Html position={[0, h + 1.5, 0]} center distanceFactor={15} style={{ pointerEvents: "none" }}>
          <div className="bg-card/95 border border-border rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm whitespace-nowrap">
            <p className="text-sm font-bold text-foreground">{data.emoji} {data.element}</p>
            <p className="text-[11px] text-muted-foreground">{data.count} deeds · Level {data.count > 50 ? 3 : data.count > 20 ? 2 : 1}</p>
          </div>
        </Html>
      )}
    </group>
  );
};

// ─── Background buildings - varied ───────────────────────────────

const BackgroundCity = ({ theme }: { theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  const buildings = useMemo(() => {
    return Array.from({ length: 200 }, (_, i) => {
      const angle = sr(i * 3.7) * Math.PI * 2;
      const dist = 7 + sr(i * 7.3) * 28;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const h = 0.3 + sr(i * 11.1) * (2 + sr(i * 5) * 3);
      const w = 0.25 + sr(i * 13.3) * 0.55;
      const d = 0.25 + sr(i * 17.7) * 0.55;
      const type = Math.floor(sr(i * 23) * 4); // 0=box, 1=cylinder, 2=box+roof, 3=thin tower
      const shade = sr(i * 29);
      return { x, z, h, w, d, type, shade };
    });
  }, []);

  return (
    <group>
      {buildings.map((b, i) => {
        const baseColor = isDay
          ? `hsl(${200 + b.shade * 40}, ${15 + b.shade * 15}%, ${75 + b.shade * 15}%)`
          : `hsl(${220 + b.shade * 30}, ${15 + b.shade * 10}%, ${8 + b.shade * 10}%)`;

        return (
          <group key={i} position={[b.x, 0, b.z]}>
            {b.type === 0 && (
              <mesh position={[0, b.h / 2, 0]} castShadow>
                <boxGeometry args={[b.w, b.h, b.d]} />
                <meshStandardMaterial color={baseColor} />
              </mesh>
            )}
            {b.type === 1 && (
              <mesh position={[0, b.h / 2, 0]} castShadow>
                <cylinderGeometry args={[b.w * 0.4, b.w * 0.5, b.h, 8]} />
                <meshStandardMaterial color={baseColor} />
              </mesh>
            )}
            {b.type === 2 && (
              <>
                <mesh position={[0, b.h * 0.4, 0]} castShadow>
                  <boxGeometry args={[b.w, b.h * 0.8, b.d]} />
                  <meshStandardMaterial color={baseColor} />
                </mesh>
                <mesh position={[0, b.h * 0.85, 0]}>
                  <coneGeometry args={[b.w * 0.6, b.h * 0.2, 4]} />
                  <meshStandardMaterial color={isDay ? "#bbaa88" : "#222215"} flatShading />
                </mesh>
              </>
            )}
            {b.type === 3 && (
              <mesh position={[0, b.h * 0.7, 0]} castShadow>
                <boxGeometry args={[b.w * 0.5, b.h * 1.4, b.d * 0.5]} />
                <meshStandardMaterial color={baseColor} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

// ─── Animated Tree ───────────────────────────────────────────────

const TreeMesh = ({ position, scale = 1, trunkColor = "#664422", leafColor = "#33aa44", type = 0 }: {
  position: [number, number, number]; scale?: number; trunkColor?: string; leafColor?: string; type?: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      // Gentle sway
      ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.5 + position[0] * 3) * 0.03 * scale;
    }
  });
  const h = 0.6 * scale;
  return (
    <group ref={ref} position={position}>
      {/* Trunk */}
      <mesh position={[0, h * 0.4, 0]}>
        <cylinderGeometry args={[0.03 * scale, 0.06 * scale, h * 0.8, 6]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>
      {type === 0 && (
        <>
          {/* Round tree */}
          <mesh position={[0, h * 0.85, 0]}>
            <sphereGeometry args={[0.25 * scale, 8, 8]} />
            <meshStandardMaterial color={leafColor} />
          </mesh>
          <mesh position={[0.08 * scale, h * 1.0, 0.05 * scale]}>
            <sphereGeometry args={[0.18 * scale, 8, 8]} />
            <meshStandardMaterial color={leafColor} />
          </mesh>
        </>
      )}
      {type === 1 && (
        <>
          {/* Pine / cone tree */}
          <mesh position={[0, h * 0.75, 0]}>
            <coneGeometry args={[0.22 * scale, 0.5 * scale, 8]} />
            <meshStandardMaterial color={leafColor} />
          </mesh>
          <mesh position={[0, h * 1.05, 0]}>
            <coneGeometry args={[0.16 * scale, 0.35 * scale, 8]} />
            <meshStandardMaterial color={leafColor} />
          </mesh>
        </>
      )}
      {type === 2 && (
        <>
          {/* Bushy / wide tree */}
          <mesh position={[0, h * 0.8, 0]}>
            <sphereGeometry args={[0.3 * scale, 8, 6]} />
            <meshStandardMaterial color={leafColor} />
          </mesh>
          <mesh position={[-0.12 * scale, h * 0.7, 0.1 * scale]}>
            <sphereGeometry args={[0.2 * scale, 8, 6]} />
            <meshStandardMaterial color={leafColor} />
          </mesh>
          <mesh position={[0.14 * scale, h * 0.7, -0.08 * scale]}>
            <sphereGeometry args={[0.2 * scale, 8, 6]} />
            <meshStandardMaterial color={leafColor} />
          </mesh>
        </>
      )}
    </group>
  );
};

// ─── Flower Bed ─────────────────────────────────────────────────

const FlowerBed = ({ position, theme }: { position: [number, number, number]; theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;
  const seed = position[0] * 7 + position[2] * 13;
  const colors = ["#ee4466", "#ff88cc", "#ffaa33", "#ff6644", "#cc44ff", "#44aaff"];
  return (
    <group position={position}>
      {/* Grass patch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.6, 12]} />
        <meshStandardMaterial color={isDay ? "#55aa35" : "#1a3015"} />
      </mesh>
      {/* Flowers */}
      {Array.from({ length: 7 }).map((_, i) => {
        const a = (i / 7) * Math.PI * 2 + sr(seed + i) * 0.5;
        const r = 0.15 + sr(seed + i * 3) * 0.3;
        const fx = Math.cos(a) * r;
        const fz = Math.sin(a) * r;
        const fColor = colors[Math.floor(sr(seed + i * 5) * colors.length)];
        return (
          <group key={i} position={[fx, 0, fz]}>
            {/* Stem */}
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.16, 4]} />
              <meshStandardMaterial color="#44882a" />
            </mesh>
            {/* Petals */}
            <mesh position={[0, 0.17, 0]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color={fColor} emissive={fColor} emissiveIntensity={isDay ? 0.1 : 0.3} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ─── Butterfly ──────────────────────────────────────────────────

const Butterfly = ({ startPos, color1, color2, speed }: {
  startPos: [number, number, number]; color1: string; color2: string; speed: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    // Figure-8 flight path
    ref.current.position.x = startPos[0] + Math.sin(t * 0.7) * 3;
    ref.current.position.z = startPos[2] + Math.sin(t * 1.1) * 2.5;
    ref.current.position.y = startPos[1] + Math.sin(t * 1.5) * 0.5 + 0.3;
    // Face direction of travel
    ref.current.rotation.y = Math.atan2(Math.cos(t * 0.7) * 0.7 * 3, Math.cos(t * 1.1) * 1.1 * 2.5);
    // Wing flap
    const flap = Math.sin(clock.elapsedTime * 12) * 0.7;
    if (wingL.current) wingL.current.rotation.z = flap;
    if (wingR.current) wingR.current.rotation.z = -flap;
  });

  return (
    <group ref={ref} position={startPos}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.015, 0.06, 4, 6]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Left wing */}
      <mesh ref={wingL} position={[-0.04, 0, 0]}>
        <planeGeometry args={[0.1, 0.07]} />
        <meshStandardMaterial color={color1} emissive={color1} emissiveIntensity={0.3} side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
      {/* Right wing */}
      <mesh ref={wingR} position={[0.04, 0, 0]}>
        <planeGeometry args={[0.1, 0.07]} />
        <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.3} side={THREE.DoubleSide} transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

// ─── Bee ─────────────────────────────────────────────────────────

const Bee = ({ startPos, speed }: { startPos: [number, number, number]; speed: number }) => {
  const ref = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * speed;
    // Erratic buzzing path
    ref.current.position.x = startPos[0] + Math.sin(t * 1.3) * 1.5 + Math.sin(t * 3) * 0.2;
    ref.current.position.z = startPos[2] + Math.cos(t * 0.9) * 1.8 + Math.cos(t * 2.7) * 0.15;
    ref.current.position.y = startPos[1] + Math.sin(t * 2) * 0.3 + 0.15;
    ref.current.rotation.y = Math.atan2(
      Math.cos(t * 1.3) * 1.3 * 1.5 + Math.cos(t * 3) * 3 * 0.2,
      -Math.sin(t * 0.9) * 0.9 * 1.8 - Math.sin(t * 2.7) * 2.7 * 0.15
    );
    // Fast wing buzz
    const buzz = Math.sin(clock.elapsedTime * 40) * 0.5;
    if (wingL.current) wingL.current.rotation.z = buzz;
    if (wingR.current) wingR.current.rotation.z = -buzz;
  });

  return (
    <group ref={ref} position={startPos}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.02, 0.04, 4, 6]} />
        <meshStandardMaterial color="#ddaa00" />
      </mesh>
      {/* Stripes */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.022, 0.006, 4, 8]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* Wings */}
      <mesh ref={wingL} position={[-0.03, 0.015, 0]}>
        <planeGeometry args={[0.05, 0.03]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={wingR} position={[0.03, 0.015, 0]}>
        <planeGeometry args={[0.05, 0.03]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ─── Vehicle ─────────────────────────────────────────────────────

const Vehicle = ({ road, roadPos, startZ, speed, color, type, seed }: {
  road: "x" | "z"; roadPos: number; startZ: number; speed: number; color: string; type: "car" | "sedan" | "bus"; seed: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const headlightL = useRef<THREE.Mesh>(null);
  const headlightR = useRef<THREE.Mesh>(null);

  const dims = useMemo(() => {
    if (type === "bus") return { l: 1.2, w: 0.35, h: 0.35, wheelR: 0.06, windowH: 0.15 };
    if (type === "sedan") return { l: 0.6, w: 0.28, h: 0.18, wheelR: 0.05, windowH: 0.1 };
    return { l: 0.5, w: 0.26, h: 0.16, wheelR: 0.045, windowH: 0.09 };
  }, [type]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + startZ;
    const range = 22;
    const pos = ((t % (range * 2)) + range * 2) % (range * 2) - range;
    if (road === "x") {
      ref.current.position.set(roadPos + (speed > 0 ? 0.2 : -0.2), dims.h / 2 + dims.wheelR, pos);
      ref.current.rotation.y = speed > 0 ? 0 : Math.PI;
    } else {
      ref.current.position.set(pos, dims.h / 2 + dims.wheelR, roadPos + (speed > 0 ? 0.15 : -0.15));
      ref.current.rotation.y = speed > 0 ? Math.PI / 2 : -Math.PI / 2;
    }
  });

  const roofColor = useMemo(() => {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `#${Math.min(255, r + 30).toString(16).padStart(2, "0")}${Math.min(255, g + 30).toString(16).padStart(2, "0")}${Math.min(255, b + 30).toString(16).padStart(2, "0")}`;
  }, [color]);

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[dims.w, dims.h, dims.l]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Roof / cabin */}
      {type === "bus" ? (
        <mesh position={[0, dims.h * 0.45, 0]} castShadow>
          <boxGeometry args={[dims.w - 0.02, dims.windowH, dims.l - 0.1]} />
          <meshStandardMaterial color={roofColor} metalness={0.2} roughness={0.4} />
        </mesh>
      ) : (
        <mesh position={[0, dims.h * 0.45, -dims.l * 0.1]} castShadow>
          <boxGeometry args={[dims.w - 0.04, dims.windowH, dims.l * 0.5]} />
          <meshStandardMaterial color={roofColor} metalness={0.3} roughness={0.3} />
        </mesh>
      )}

      {/* Windows */}
      {type === "bus" && [-0.3, -0.1, 0.1, 0.3].map((zOff, i) => (
        <mesh key={i} position={[dims.w / 2 + 0.001, dims.h * 0.35, zOff]}>
          <planeGeometry args={[0.001, dims.windowH * 0.7, 0.12]} />
          <meshStandardMaterial color="#88ccff" emissive="#88ccff" emissiveIntensity={0.15} />
        </mesh>
      ))}

      {/* Wheels */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * dims.w * 0.45, -dims.h / 2 + dims.wheelR * 0.5, sz * dims.l * 0.35]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[dims.wheelR, dims.wheelR, 0.04, 8]} />
          <meshStandardMaterial color="#222222" />
        </mesh>
      ))}

      {/* Headlights */}
      <mesh ref={headlightL} position={[-dims.w * 0.3, 0, dims.l / 2 + 0.01]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#ffee88" emissive="#ffee88" emissiveIntensity={0.8} />
      </mesh>
      <mesh ref={headlightR} position={[dims.w * 0.3, 0, dims.l / 2 + 0.01]}>
        <sphereGeometry args={[0.025, 6, 6]} />
        <meshStandardMaterial color="#ffee88" emissive="#ffee88" emissiveIntensity={0.8} />
      </mesh>

      {/* Tail lights */}
      <mesh position={[-dims.w * 0.3, 0, -dims.l / 2 - 0.01]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[dims.w * 0.3, 0, -dims.l / 2 - 0.01]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#ff2222" emissive="#ff2222" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
};

// ─── Pond ─────────────────────────────────────────────────────────

const makeEllipseShape = (rx: number, rz: number, segs = 32) => {
  const s = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    if (i === 0) s.moveTo(Math.cos(a) * rx, Math.sin(a) * rz);
    else s.lineTo(Math.cos(a) * rx, Math.sin(a) * rz);
  }
  return s;
};

const Pond = ({ position, radiusX, radiusZ, theme, seed }: {
  position: [number, number, number]; radiusX: number; radiusZ: number; theme: typeof skyColors.night; seed: number;
}) => {
  const waterRef = useRef<THREE.Mesh>(null);
  const isDay = theme.ambientIntensity > 1;
  const waterColor = isDay ? "#4499cc" : "#112244";
  const waterEmissive = isDay ? "#2288bb" : "#0a1a33";

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    const mat = waterRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.7 + Math.sin(clock.getElapsedTime() * 0.8 + seed) * 0.1;
  });

  const bankShape = useMemo(() => makeEllipseShape(radiusX + 0.15, radiusZ + 0.15), [radiusX, radiusZ]);
  const waterShape = useMemo(() => makeEllipseShape(radiusX, radiusZ), [radiusX, radiusZ]);

  const lilies = useMemo(() =>
    Array.from({ length: 3 + Math.floor(sr(seed * 17) * 4) }, (_, i) => ({
      x: (sr(seed * 31 + i * 7) - 0.5) * radiusX * 1.2,
      z: (sr(seed * 43 + i * 11) - 0.5) * radiusZ * 1.2,
      s: 0.08 + sr(seed * 53 + i) * 0.12,
      hasFlower: sr(seed * 67 + i) > 0.5,
    })), [seed, radiusX, radiusZ]);

  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <shapeGeometry args={[bankShape]} />
        <meshStandardMaterial color={isDay ? "#8a7a5a" : "#2a2a1a"} />
      </mesh>
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <shapeGeometry args={[waterShape]} />
        <meshStandardMaterial
          color={waterColor}
          emissive={waterEmissive}
          emissiveIntensity={isDay ? 0.2 : 0.4}
          transparent
          opacity={0.75}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      {[0.4, 0.7, 1.0].map((s, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(sr(seed + i * 3) - 0.5) * radiusX * 0.6, 0.005, (sr(seed + i * 5) - 0.5) * radiusZ * 0.6]}>
          <ringGeometry args={[s * 0.15, s * 0.18, 24]} />
          <meshStandardMaterial color={isDay ? "#88ccee" : "#223355"} transparent opacity={0.3} />
        </mesh>
      ))}
      {lilies.map((l, i) => (
        <group key={i} position={[l.x, 0.01, l.z]}>
          <mesh rotation={[-Math.PI / 2, sr(seed + i * 9) * Math.PI * 2, 0]}>
            <circleGeometry args={[l.s, 12]} />
            <meshStandardMaterial color={isDay ? "#33aa44" : "#1a4422"} />
          </mesh>
          {l.hasFlower && (
            <mesh position={[0, 0.03, 0]}>
              <sphereGeometry args={[l.s * 0.35, 8, 6]} />
              <meshStandardMaterial color={isDay ? "#ff88aa" : "#882244"} emissive={isDay ? "#ff88aa" : "#551133"} emissiveIntensity={0.3} />
            </mesh>
          )}
        </group>
      ))}
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + sr(seed + i * 20) * 0.5;
        return (
          <mesh key={i} position={[Math.cos(a) * radiusX * 0.95, 0.03, Math.sin(a) * radiusZ * 0.95]}>
            <sphereGeometry args={[0.06 + sr(seed + i * 30) * 0.06, 6, 5]} />
            <meshStandardMaterial color={isDay ? "#888877" : "#333330"} roughness={0.9} />
          </mesh>
        );
      })}
    </group>
  );
};





// ─── River ────────────────────────────────────────────────────────

const River = ({ theme }: { theme: typeof skyColors.night }) => {
  const waterRef = useRef<THREE.Mesh>(null);
  const isDay = theme.ambientIntensity > 1;
  const waterColor = isDay ? "#3388bb" : "#0a1a33";

  useFrame(({ clock }) => {
    if (!waterRef.current) return;
    const mat = waterRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.7 + Math.sin(clock.getElapsedTime() * 0.5) * 0.08;
  });

  const riverShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points: [number, number][] = [
      [-25, 12], [-18, 13], [-12, 11.5], [-6, 12.5], [0, 11], [6, 12], [12, 11.5], [18, 13], [25, 12],
    ];
    const pointsB: [number, number][] = [
      [25, 13.2], [18, 14.2], [12, 12.8], [6, 13.5], [0, 12.3], [-6, 13.8], [-12, 12.8], [-18, 14.3], [-25, 13.2],
    ];
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      const cp = [(points[i - 1][0] + points[i][0]) / 2, points[i][1] + (i % 2 === 0 ? 0.3 : -0.3)] as [number, number];
      shape.quadraticCurveTo(cp[0], cp[1], points[i][0], points[i][1]);
    }
    for (let i = 0; i < pointsB.length; i++) {
      if (i === 0) shape.lineTo(pointsB[0][0], pointsB[0][1]);
      else {
        const cp = [(pointsB[i - 1][0] + pointsB[i][0]) / 2, pointsB[i][1] + (i % 2 === 0 ? -0.3 : 0.3)] as [number, number];
        shape.quadraticCurveTo(cp[0], cp[1], pointsB[i][0], pointsB[i][1]);
      }
    }
    shape.closePath();
    return shape;
  }, []);

  return (
    <group>
      {/* River bank */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <shapeGeometry args={[(() => {
          const s = riverShape.clone();
          // Slightly larger for bank effect handled by separate mesh
          return s;
        })()]} />
        <meshStandardMaterial color={isDay ? "#7a6a4a" : "#221a10"} />
      </mesh>
      {/* Water */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <shapeGeometry args={[riverShape]} />
        <meshStandardMaterial
          color={waterColor}
          emissive={isDay ? "#2277aa" : "#061522"}
          emissiveIntensity={isDay ? 0.25 : 0.5}
          transparent
          opacity={0.75}
          metalness={0.5}
          roughness={0.15}
        />
      </mesh>
      {/* River sparkles */}
      {Array.from({ length: 12 }, (_, i) => {
        const x = -20 + i * 3.5 + sr(i * 7) * 2;
        const z = 12 + sr(i * 11) * 1.2;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
            <circleGeometry args={[0.04, 6]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={isDay ? 0.6 : 0.15}
              transparent
              opacity={0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ─── Firefly ───────────────────────────────────────────────────────

const Firefly = ({ center, seed }: { center: [number, number, number]; seed: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const offset = useMemo(() => sr(seed * 73) * 100, [seed]);
  const color = useMemo(() => {
    const colors = ["#aaff44", "#ccff66", "#88ee33", "#ddff88", "#66dd22"];
    return colors[Math.floor(sr(seed * 41) * colors.length)];
  }, [seed]);

  useFrame(({ clock }) => {
    if (!ref.current || !matRef.current) return;
    const t = clock.getElapsedTime() + offset;
    const speed = 0.3 + sr(seed * 19) * 0.4;
    const radius = 1.0 + sr(seed * 29) * 2.0;
    ref.current.position.set(
      center[0] + Math.sin(t * speed * 0.7) * radius + Math.cos(t * speed * 1.3) * radius * 0.4,
      center[1] + 0.3 + Math.sin(t * speed * 1.1) * 0.8 + Math.abs(Math.sin(t * speed * 0.5)) * 0.5,
      center[2] + Math.cos(t * speed * 0.9) * radius + Math.sin(t * speed * 1.7) * radius * 0.3
    );
    // Pulsing glow
    const pulse = 0.5 + Math.sin(t * 3 + sr(seed * 53) * 10) * 0.5;
    matRef.current.emissiveIntensity = 1.5 + pulse * 3;
    matRef.current.opacity = 0.4 + pulse * 0.6;
    ref.current.scale.setScalar(0.03 + pulse * 0.03);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={3}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const FireflySwarm = () => {
  // Cluster fireflies around ponds and garden areas
  const fireflies = useMemo(() => {
    const spots: [number, number, number][] = [
      // Around ponds
      [10, 0.5, 8], [-12, 0.5, -7], [8, 0.5, -12], [-9, 0.5, 10],
      // Along river
      [-15, 0.5, 12.5], [-5, 0.5, 12], [5, 0.5, 12], [15, 0.5, 12.5],
      // Garden/tree areas
      [-3, 0.5, -1], [3, 0.5, 1], [-5, 0.5, 5], [5, 0.5, -5],
      [0, 0.5, 6], [0, 0.5, -6], [-7, 0.5, 2], [7, 0.5, -2],
    ];
    return spots.flatMap((center, ci) =>
      Array.from({ length: 4 + Math.floor(sr(ci * 7) * 4) }, (_, i) => ({
        center,
        seed: ci * 100 + i,
      }))
    );
  }, []);

  return (
    <group>
      {fireflies.map((f, i) => (
        <Firefly key={i} center={f.center} seed={f.seed} />
      ))}
      {/* Ambient glow point lights near ponds */}
      {[[10, 0.8, 8], [-12, 0.8, -7], [8, 0.8, -12], [-9, 0.8, 10]].map((pos, i) => (
        <pointLight key={i} position={pos as [number, number, number]} color="#aaff44" intensity={0.15} distance={4} />
      ))}
    </group>
  );
};

// ─── Bird ──────────────────────────────────────────────────────────

const Bird = ({ startPos, speed, color, wingSpan }: {
  startPos: [number, number, number]; speed: number; color: string; wingSpan: number;
}) => {
  const ref = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Mesh>(null);
  const wingR = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => sr(startPos[0] * 100 + startPos[2] * 37) * 100, [startPos]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + offset;
    // Circular flight path with variation
    const radius = 8 + sr(offset) * 10;
    const wobble = Math.sin(t * 2.3) * 0.3;
    ref.current.position.set(
      startPos[0] + Math.cos(t * 0.3) * radius,
      startPos[1] + Math.sin(t * 0.5) * 1.5 + wobble,
      startPos[2] + Math.sin(t * 0.3) * radius
    );
    // Face movement direction
    ref.current.rotation.y = -t * 0.3 + Math.PI / 2;
    ref.current.rotation.z = Math.sin(t * 0.5) * 0.1;
    // Flap wings
    if (wingL.current && wingR.current) {
      const flap = Math.sin(t * 8) * 0.6;
      wingL.current.rotation.z = flap;
      wingR.current.rotation.z = -flap;
    }
  });

  return (
    <group ref={ref}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.04, 0.12, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.02, 0.08]}>
        <sphereGeometry args={[0.035, 6, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Beak */}
      <mesh position={[0, 0.01, 0.12]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.012, 0.04, 4]} />
        <meshStandardMaterial color="#ee8822" />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.02, -0.1]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.04, 0.005, 0.06]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Left wing */}
      <mesh ref={wingL} position={[wingSpan * 0.3, 0.01, 0]}>
        <boxGeometry args={[wingSpan, 0.006, 0.08]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wing */}
      <mesh ref={wingR} position={[-wingSpan * 0.3, 0.01, 0]}>
        <boxGeometry args={[wingSpan, 0.006, 0.08]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// ─── Bird Flock ────────────────────────────────────────────────────

const BirdFlock = ({ center, count, baseColor }: {
  center: [number, number, number]; count: number; baseColor: string;
}) => {
  const birds = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      pos: [
        center[0] + (sr(i * 13 + 7) - 0.5) * 4,
        center[1] + (sr(i * 17 + 3) - 0.5) * 1.5,
        center[2] + (sr(i * 23 + 11) - 0.5) * 4,
      ] as [number, number, number],
      speed: 0.15 + sr(i * 31) * 0.15,
      wingSpan: 0.08 + sr(i * 41) * 0.06,
    })), [center, count]);

  return (
    <group>
      {birds.map((b, i) => (
        <Bird key={i} startPos={b.pos} speed={b.speed} color={baseColor} wingSpan={b.wingSpan} />
      ))}
    </group>
  );
};

// ─── Environment (ground, roads, streetlights, trees, gardens) ───

const Environment = ({ theme }: { theme: typeof skyColors.night }) => {
  const isDay = theme.ambientIntensity > 1;

  const scatteredTrees = useMemo(() => {
    const leafColors = ["#228833", "#33aa44", "#1a7733", "#44bb55", "#2a9940", "#558833", "#339944", "#66aa55"];
    return Array.from({ length: 60 }, (_, i) => {
      const angle = sr(i * 5.3) * Math.PI * 2;
      const dist = 3 + sr(i * 9.1) * 22;
      return {
        pos: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist] as [number, number, number],
        scale: 0.5 + sr(i * 7.7) * 1.5,
        type: Math.floor(sr(i * 11) * 3) as 0 | 1 | 2,
        leafColor: leafColors[Math.floor(sr(i * 13) * leafColors.length)],
      };
    });
  }, []);

  const flowerPositions = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const angle = sr(i * 4.1 + 50) * Math.PI * 2;
      const dist = 2.5 + sr(i * 6.3 + 50) * 18;
      return [Math.cos(angle) * dist, 0, Math.sin(angle) * dist] as [number, number, number];
    });
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={theme.ground} />
      </mesh>
      {/* Grass patches */}
      {[[-3, -0.5], [3, 0.5], [-2, 3.5], [2, -3.5], [-5, 5], [5, -5], [0, 6], [0, -6], [-7, 2], [7, -2]].map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, z]}>
          <circleGeometry args={[0.6 + sr(i * 3) * 0.6, 12]} />
          <meshStandardMaterial color={theme.grass} />
        </mesh>
      ))}

      {/* Ponds */}
      {[
        { pos: [10, 0.02, 8] as [number, number, number], rx: 2.2, rz: 1.6 },
        { pos: [-12, 0.02, -7] as [number, number, number], rx: 1.8, rz: 1.3 },
        { pos: [8, 0.02, -12] as [number, number, number], rx: 1.4, rz: 1.0 },
        { pos: [-9, 0.02, 10] as [number, number, number], rx: 1.6, rz: 2.0 },
      ].map((pond, i) => (
        <Pond key={`pond${i}`} position={pond.pos} radiusX={pond.rx} radiusZ={pond.rz} theme={theme} seed={i} />
      ))}

      {/* River */}
      <River theme={theme} />
      {/* Roads */}
      {[-6, 0, 6].map((x) => (
        <group key={`rx${x}`}>
          <mesh position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.0, 45]} />
            <meshStandardMaterial color={theme.road} />
          </mesh>
          {Array.from({ length: 20 }).map((_, j) => (
            <mesh key={j} position={[x, 0.015, -20 + j * 2.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.06, 0.8]} />
              <meshStandardMaterial color={theme.roadLine} />
            </mesh>
          ))}
        </group>
      ))}
      {[-4, 4].map((z) => (
        <mesh key={`rz${z}`} position={[0, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[45, 0.8]} />
          <meshStandardMaterial color={theme.road} />
        </mesh>
      ))}
      {/* Streetlights */}
      {[[-3, -4], [3, -4], [-3, 4], [3, 4], [-6, 0], [6, 0]].map(([x, z], i) => (
        <group key={`sl${i}`} position={[x, 0, z]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 1.2, 6]} />
            <meshStandardMaterial color="#555555" />
          </mesh>
          <mesh position={[0, 1.22, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial
              color={isDay ? "#eee" : "#ffee88"}
              emissive={isDay ? "#eee" : "#ffee88"}
              emissiveIntensity={isDay ? 0.1 : 1.2}
            />
          </mesh>
          {!isDay && <pointLight position={[0, 1.2, 0]} color="#ffee88" intensity={0.3} distance={3} />}
        </group>
      ))}

      {/* Scattered trees */}
      {scatteredTrees.map((t, i) => (
        <TreeMesh
          key={`tree${i}`}
          position={t.pos}
          scale={t.scale}
          leafColor={isDay ? t.leafColor : t.leafColor.replace(/[3-9a-f]/gi, (c) => Math.max(0, parseInt(c, 16) - 4).toString(16))}
          type={t.type}
        />
      ))}

      {/* Flower beds */}
      {flowerPositions.map((pos, i) => (
        <FlowerBed key={`fb${i}`} position={pos} theme={theme} />
      ))}

      {/* Butterflies - only during day/fajr/evening */}
      {theme.ambientIntensity > 0.5 && (
        <>
          <Butterfly startPos={[-2, 1.5, -1]} color1="#ff66aa" color2="#ff88cc" speed={0.4} />
          <Butterfly startPos={[3, 1.8, 2]} color1="#44aaff" color2="#66ccff" speed={0.35} />
          <Butterfly startPos={[-5, 1.3, 4]} color1="#ffaa33" color2="#ffcc66" speed={0.45} />
          <Butterfly startPos={[1, 2.0, -4]} color1="#aa44ff" color2="#cc88ff" speed={0.38} />
          <Butterfly startPos={[6, 1.6, -2]} color1="#ff4466" color2="#ff6688" speed={0.42} />
          <Butterfly startPos={[-4, 1.4, -5]} color1="#44ff88" color2="#88ffaa" speed={0.37} />
        </>
      )}

      {/* Bees - active during daytime */}
      {theme.ambientIntensity > 0.8 && (
        <>
          <Bee startPos={[-1, 0.8, 2]} speed={0.6} />
          <Bee startPos={[4, 0.9, -1]} speed={0.55} />
          <Bee startPos={[-3, 0.7, -3]} speed={0.65} />
          <Bee startPos={[2, 1.0, 5]} speed={0.5} />
          <Bee startPos={[6, 0.8, 3]} speed={0.58} />
          <Bee startPos={[-5, 0.9, 1]} speed={0.52} />
          <Bee startPos={[0, 0.85, -5]} speed={0.62} />
        </>
      )}

      {/* Birds - flocks during day, solo at fajr/evening */}
      {theme.ambientIntensity > 0.5 && (
        <>
          <BirdFlock center={[0, 8, 0]} count={theme.ambientIntensity > 1 ? 7 : 3} baseColor="#333344" />
          <BirdFlock center={[-10, 10, 5]} count={theme.ambientIntensity > 1 ? 5 : 2} baseColor="#554433" />
          <BirdFlock center={[8, 9, -8]} count={theme.ambientIntensity > 1 ? 6 : 2} baseColor="#224455" />
          {theme.ambientIntensity > 1 && (
            <>
              <BirdFlock center={[5, 12, 10]} count={4} baseColor="#665544" />
              <Bird startPos={[-5, 6, -3]} speed={0.2} color="#cc4422" wingSpan={0.1} />
              <Bird startPos={[12, 7, 6]} speed={0.18} color="#2266aa" wingSpan={0.12} />
            </>
          )}
        </>
      )}

      {/* Fireflies - night and evening only */}
      {theme.ambientIntensity < 0.8 && (
        <FireflySwarm />
      )}


      <Vehicle road="x" roadPos={-6} startZ={5} speed={-1.8} color="#3366ee" type="sedan" seed={2} />
      <Vehicle road="x" roadPos={0} startZ={-12} speed={2.5} color="#eeaa22" type="bus" seed={3} />
      <Vehicle road="x" roadPos={0} startZ={10} speed={-1.6} color="#22cc66" type="car" seed={4} />
      <Vehicle road="x" roadPos={6} startZ={-8} speed={2.0} color="#cc44ee" type="sedan" seed={5} />
      <Vehicle road="x" roadPos={6} startZ={15} speed={-2.3} color="#ff6633" type="bus" seed={6} />
      <Vehicle road="z" roadPos={-4} startZ={-18} speed={1.9} color="#44bbcc" type="car" seed={7} />
      <Vehicle road="z" roadPos={-4} startZ={8} speed={-2.1} color="#cc3377" type="sedan" seed={8} />
      <Vehicle road="z" roadPos={4} startZ={-5} speed={2.4} color="#88cc22" type="bus" seed={9} />
      <Vehicle road="z" roadPos={4} startZ={12} speed={-1.7} color="#ff8844" type="car" seed={10} />
      <Vehicle road="x" roadPos={-6} startZ={-2} speed={1.5} color="#ffffff" type="sedan" seed={11} />
      <Vehicle road="z" roadPos={4} startZ={-15} speed={2.6} color="#2255cc" type="car" seed={12} />
    </group>
  );
};

// ─── Main scene ──────────────────────────────────────────────────

const CityScene = ({ categoryData, selectedCategory, onSelectCategory, timeOfDay }: CityVisualizationProps) => {
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const theme = skyColors[timeOfDay];

  const positions: [number, number][] = [
    [-4.5, -2], [-1.5, -2], [1.5, -2], [4.5, -2],
    [-4.5, 2],  [-1.5, 2],  [1.5, 2],  [4.5, 2],
  ];

  return (
    <>
      <ambientLight color={theme.ambient} intensity={theme.ambientIntensity} />
      <directionalLight
        color={theme.directional}
        intensity={theme.dirIntensity}
        position={theme.dirPos}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {/* Fill lights for daytime */}
      {theme.ambientIntensity > 1 && (
        <>
          <hemisphereLight args={[theme.directional, theme.ground, 0.6]} />
          <directionalLight color="#ffffee" intensity={0.5} position={[-5, 10, -5]} />
        </>
      )}

      <fog attach="fog" args={[theme.fog, theme.fogNear, theme.fogFar]} />

      <Environment theme={theme} />
      <BackgroundCity theme={theme} />

      {categories.map((cat, i) => {
        const data = categoryData[cat];
        if (!data) return null;
        const [px, pz] = positions[i];
        return (
          <BuildingWrapper
            key={cat}
            position={[px, 0, pz]}
            cat={cat}
            data={data}
            theme={theme}
            isSelected={selectedCategory === cat}
            isHovered={hoveredCat === cat}
            onHover={(h) => setHoveredCat(h ? cat : null)}
            onClick={() => onSelectCategory(selectedCategory === cat ? null : cat)}
            seed={i * 100 + cat.charCodeAt(0)}
          />
        );
      })}

      <OrbitControls
        makeDefault
        enablePan enableZoom enableRotate
        minDistance={5} maxDistance={40}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={0.15}
        target={[0, 1, 0]}
        panSpeed={0.8}
        rotateSpeed={0.6}
      />
    </>
  );
};

const CityVisualization = (props: CityVisualizationProps) => {
  const theme = skyColors[props.timeOfDay];

  return (
    <div className="w-full h-[500px] md:h-[620px] rounded-xl overflow-hidden" style={{ cursor: "grab" }}>
      <Canvas
        shadows
        camera={{ position: [12, 14, 12], fov: 45 }}
        onCreated={({ gl }) => {
          gl.setClearColor(theme.fog);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = theme.exposure;
        }}
        style={{ background: theme.fog }}
      >
        <CityScene {...props} />
      </Canvas>
    </div>
  );
};

export default CityVisualization;
