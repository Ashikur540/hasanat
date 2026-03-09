import { useRef, useEffect, useState, useCallback } from "react";
import * as PIXI from "pixi.js";

export type TimeOfDay = "fajr" | "morning" | "noon" | "evening" | "night";

interface CityVisualizationProps {
  categoryData: Record<string, { count: number; vitality: number; emoji: string; element: string }>;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  timeOfDay: TimeOfDay;
}

// ═══════════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════

const lerpColor = (a: number, b: number, t: number): number => {
  const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
  const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
  return (
    (Math.round(ar + (br - ar) * t) << 16) |
    (Math.round(ag + (bg - ag) * t) << 8) |
    Math.round(ab + (bb - ab) * t)
  );
};

const darken = (c: number, f: number): number => {
  return (
    (Math.round(((c >> 16) & 0xff) * f) << 16) |
    (Math.round(((c >> 8) & 0xff) * f) << 8) |
    Math.round((c & 0xff) * f)
  );
};

const lighten = (c: number, f: number): number => {
  const r = Math.min(255, Math.round(((c >> 16) & 0xff) + (255 - ((c >> 16) & 0xff)) * f));
  const g = Math.min(255, Math.round(((c >> 8) & 0xff) + (255 - ((c >> 8) & 0xff)) * f));
  const b = Math.min(255, Math.round((c & 0xff) + (255 - (c & 0xff)) * f));
  return (r << 16) | (g << 8) | b;
};

// Seeded random
const sr = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ═══════════════════════════════════════════════════════════════════
// THEME CONFIG
// ═══════════════════════════════════════════════════════════════════

interface ThemeConfig {
  skyTop: number; skyBot: number;
  ground: number; groundLight: number;
  fog: number;
  windowLit: number; windowDark: number; litChance: number;
  isDay: boolean;
  starAlpha: number; cloudAlpha: number;
  sunColor: number; sunY: number;
}

const themes: Record<TimeOfDay, ThemeConfig> = {
  fajr: {
    skyTop: 0x1a0a2e, skyBot: 0xcc7755,
    ground: 0x2a3a25, groundLight: 0x3a4a35,
    fog: 0x3a2035,
    windowLit: 0xffcc66, windowDark: 0x0e0e18, litChance: 0.4,
    isDay: false, starAlpha: 0.3, cloudAlpha: 0.3,
    sunColor: 0xff8844, sunY: 0.85,
  },
  morning: {
    skyTop: 0x78bbee, skyBot: 0xe8f0f0,
    ground: 0x7aaa55, groundLight: 0x8abb66,
    fog: 0xd8e8d0,
    windowLit: 0xffffff, windowDark: 0xc0b8a8, litChance: 0.05,
    isDay: true, starAlpha: 0, cloudAlpha: 0.8,
    sunColor: 0xffee88, sunY: 0.3,
  },
  noon: {
    skyTop: 0x5599dd, skyBot: 0xd8e8f0,
    ground: 0x8aaa60, groundLight: 0x9abb70,
    fog: 0xe5eed8,
    windowLit: 0xffffff, windowDark: 0xc8c0b0, litChance: 0.03,
    isDay: true, starAlpha: 0, cloudAlpha: 0.6,
    sunColor: 0xffffcc, sunY: 0.15,
  },
  evening: {
    skyTop: 0x150e25, skyBot: 0xcc5522,
    ground: 0x253020, groundLight: 0x354030,
    fog: 0x2a1820,
    windowLit: 0xffaa44, windowDark: 0x0c0c15, litChance: 0.6,
    isDay: false, starAlpha: 0.4, cloudAlpha: 0.2,
    sunColor: 0xff6633, sunY: 0.8,
  },
  night: {
    skyTop: 0x020208, skyBot: 0x0a0a22,
    ground: 0x0e1510, groundLight: 0x1a2520,
    fog: 0x060610,
    windowLit: 0x4488ff, windowDark: 0x050508, litChance: 0.75,
    isDay: false, starAlpha: 1.0, cloudAlpha: 0.15,
    sunColor: 0xccddff, sunY: 0.2,
  },
};

// ═══════════════════════════════════════════════════════════════════
// CATEGORY PALETTES
// ═══════════════════════════════════════════════════════════════════

interface CatPalette { main: number; light: number; dark: number; accent: number; glow: number; roof: number }

const catPalettes: Record<string, CatPalette> = {
  Salah:     { main: 0x2a6a4a, light: 0x5aaa7a, dark: 0x1a3a2a, accent: 0x44ffaa, glow: 0x22cc77, roof: 0x3a8a5a },
  Quran:     { main: 0x2a4a6a, light: 0x5a7aaa, dark: 0x1a2a3a, accent: 0x44aaff, glow: 0x2277cc, roof: 0x3a6a8a },
  Sadaqah:   { main: 0x3a6a3a, light: 0x6aaa6a, dark: 0x1a3a1a, accent: 0x66ff88, glow: 0x33cc55, roof: 0x4a8a4a },
  Dhikr:     { main: 0x2a5a5a, light: 0x5a9a9a, dark: 0x1a3a3a, accent: 0x44eeff, glow: 0x22aacc, roof: 0x3a7a7a },
  Character: { main: 0x5a3a6a, light: 0x8a6aaa, dark: 0x2a1a3a, accent: 0xcc88ff, glow: 0x8855cc, roof: 0x6a4a8a },
  Family:    { main: 0x6a4a2a, light: 0xaa8a5a, dark: 0x3a2a1a, accent: 0xffbb55, glow: 0xcc8822, roof: 0x8a6a3a },
  Fasting:   { main: 0x5a2a5a, light: 0x8a5a8a, dark: 0x2a1a2a, accent: 0xdd88ff, glow: 0x9955cc, roof: 0x7a3a7a },
  Knowledge: { main: 0x6a6a2a, light: 0xaaaa5a, dark: 0x3a3a1a, accent: 0xffee55, glow: 0xccaa22, roof: 0x8a8a3a },
};

const categories = ["Salah", "Quran", "Sadaqah", "Dhikr", "Character", "Family", "Fasting", "Knowledge"];

// ═══════════════════════════════════════════════════════════════════
// ISOMETRIC DRAWING HELPERS
// ═══════════════════════════════════════════════════════════════════

const TILE_W = 80;
const TILE_D = 40;

const drawIsoBox = (
  g: PIXI.Graphics, cx: number, cy: number,
  tw: number, td: number, h: number,
  topColor: number, leftColor: number, rightColor: number
) => {
  // Left face
  g.beginFill(leftColor);
  g.drawPolygon([cx - tw / 2, cy - h, cx, cy + td / 2 - h, cx, cy + td / 2, cx - tw / 2, cy]);
  g.endFill();
  // Right face
  g.beginFill(rightColor);
  g.drawPolygon([cx + tw / 2, cy - h, cx, cy + td / 2 - h, cx, cy + td / 2, cx + tw / 2, cy]);
  g.endFill();
  // Top face
  g.beginFill(topColor);
  g.drawPolygon([cx, cy - td / 2 - h, cx + tw / 2, cy - h, cx, cy + td / 2 - h, cx - tw / 2, cy - h]);
  g.endFill();
};

const drawIsoDome = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, color: number) => {
  g.beginFill(color, 0.9);
  g.drawEllipse(cx, cy - h - td / 4, tw * 0.35, td * 0.5 + 4);
  g.endFill();
};

// ═══════════════════════════════════════════════════════════════════
// BUILDING DRAW FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

const drawWindows = (g: PIXI.Graphics, cx: number, cy: number, tw: number, h: number, count: number, color: number) => {
  const rows = Math.min(Math.ceil(h / 20), 4);
  const cols = Math.min(count, 3);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = cx - (cols - 1) * 6 / 2 + c * 6 - tw * 0.15;
      const wy = cy - h + 10 + r * (h / (rows + 1));
      g.beginFill(color, 0.8);
      g.drawRect(wx, wy, 4, 5);
      g.endFill();
    }
  }
};

const drawMosque = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => {
  drawIsoBox(g, cx, cy, tw, td, h, pal.light, pal.main, pal.dark);
  // Dome
  drawIsoDome(g, cx, cy, tw, td, h, pal.roof);
  // Crescent on dome
  g.beginFill(0xffcc44);
  g.drawCircle(cx, cy - h - td / 2 - 8, 4);
  g.endFill();
  g.beginFill(pal.roof);
  g.drawCircle(cx + 2, cy - h - td / 2 - 9, 3.5);
  g.endFill();
  // Minarets
  const mh = h + 15;
  g.beginFill(pal.light, 0.85);
  g.drawRect(cx - tw / 2 - 3, cy - mh, 4, mh);
  g.drawRect(cx + tw / 2 - 1, cy - mh, 4, mh);
  g.endFill();
  g.beginFill(0xffcc44);
  g.drawCircle(cx - tw / 2 - 1, cy - mh - 4, 3);
  g.drawCircle(cx + tw / 2 + 1, cy - mh - 4, 3);
  g.endFill();
  // Door
  g.beginFill(darken(pal.main, 0.5));
  g.drawRoundedRect(cx - 4, cy + td / 2 - 14, 8, 14, 4);
  g.endFill();
  // Windows
  if (!theme.isDay) drawWindows(g, cx, cy, tw, h, 2, theme.windowLit);
};

const drawLibrary = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => {
  drawIsoBox(g, cx, cy, tw, td, h, pal.light, pal.main, pal.dark);
  // Triangular roof
  g.beginFill(pal.roof);
  g.drawPolygon([cx - tw / 2 - 3, cy - h, cx, cy - h - 18, cx + tw / 2 + 3, cy - h]);
  g.endFill();
  // Columns
  for (let i = -1; i <= 1; i++) {
    g.beginFill(lighten(pal.main, 0.3));
    g.drawRect(cx + i * 10 - 1.5, cy + td / 2 - h * 0.7, 3, h * 0.7);
    g.endFill();
  }
  // Books on top
  g.beginFill(0xcc4444); g.drawRect(cx - 12, cy - h - 4, 6, 3); g.endFill();
  g.beginFill(0x4466cc); g.drawRect(cx - 5, cy - h - 5, 6, 4); g.endFill();
  g.beginFill(0x44aa44); g.drawRect(cx + 2, cy - h - 3, 5, 3); g.endFill();
  if (!theme.isDay) drawWindows(g, cx, cy, tw, h, 3, theme.windowLit);
};

const drawGarden = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => {
  // Low pavilion
  drawIsoBox(g, cx, cy, tw * 1.1, td * 1.1, h * 0.4, lighten(pal.light, 0.2), pal.main, pal.dark);
  // Trees
  const treePositions = [[-20, -5], [18, -3], [-8, 8], [12, -10]];
  for (const [tx, ty] of treePositions) {
    g.beginFill(0x664422);
    g.drawRect(cx + tx - 1.5, cy + ty - 20, 3, 12);
    g.endFill();
    const lc = theme.isDay ? 0x44aa55 : 0x1a4422;
    g.beginFill(lc, 0.9);
    g.drawCircle(cx + tx, cy + ty - 24, 8);
    g.drawCircle(cx + tx - 4, cy + ty - 21, 6);
    g.drawCircle(cx + tx + 4, cy + ty - 21, 6);
    g.endFill();
  }
  // Flowers
  g.beginFill(0xee4466, 0.8); g.drawCircle(cx - 14, cy + 2, 2.5); g.endFill();
  g.beginFill(0xffaa33, 0.8); g.drawCircle(cx + 8, cy + 5, 2); g.endFill();
  g.beginFill(0xff88aa, 0.8); g.drawCircle(cx + 20, cy - 1, 2.5); g.endFill();
  // Pond
  g.beginFill(0x3388cc, 0.6);
  g.drawEllipse(cx, cy + td / 2 - 5, 12, 5);
  g.endFill();
};

const drawFountain = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => {
  // Base tiers
  drawIsoBox(g, cx, cy, tw * 0.9, td * 0.9, h * 0.35, lighten(pal.light, 0.2), pal.main, pal.dark);
  drawIsoBox(g, cx, cy - h * 0.35, tw * 0.6, td * 0.6, h * 0.25, lighten(pal.light, 0.3), lighten(pal.main, 0.1), pal.dark);
  // Central column
  g.beginFill(pal.light);
  g.drawRect(cx - 2, cy - h, 4, h * 0.4);
  g.endFill();
  // Top bowl
  g.beginFill(pal.roof, 0.8);
  g.drawEllipse(cx, cy - h - 2, 10, 5);
  g.endFill();
  // Water
  g.beginFill(0x2299cc, 0.7);
  g.drawEllipse(cx, cy - h * 0.35 + 2, tw * 0.35, td * 0.25);
  g.endFill();
  // Sparkle dots
  if (!theme.isDay) {
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      g.beginFill(pal.glow, 0.6);
      g.drawCircle(cx + Math.cos(angle) * 8, cy - h * 0.5 + Math.sin(angle) * 4, 1.5);
      g.endFill();
    }
  }
};

const drawCommunity = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => {
  // Circular base (drawn as octagonal iso)
  drawIsoBox(g, cx, cy, tw, td, h * 0.6, pal.light, pal.main, pal.dark);
  // Dome roof
  g.beginFill(pal.roof, 0.85);
  g.drawEllipse(cx, cy - h * 0.6 - 6, tw * 0.4, 12);
  g.endFill();
  // Heart emblem
  g.beginFill(0xff4477);
  g.drawCircle(cx, cy - h * 0.6 - 18, 4);
  g.endFill();
  // Benches
  for (let i = 0; i < 4; i++) {
    const bx = cx + (i - 1.5) * 14;
    g.beginFill(0x664422);
    g.drawRect(bx, cy + td / 2 - 3, 8, 3);
    g.endFill();
  }
  if (!theme.isDay) drawWindows(g, cx, cy, tw, h * 0.6, 2, theme.windowLit);
};

const drawHouse = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => {
  drawIsoBox(g, cx, cy, tw, td, h, pal.light, pal.main, pal.dark);
  // Pitched roof
  g.beginFill(pal.roof);
  g.drawPolygon([cx - tw / 2 - 2, cy - h, cx, cy - h - 16, cx + tw / 2 + 2, cy - h]);
  g.endFill();
  // Chimney
  g.beginFill(0x884433);
  g.drawRect(cx + tw / 4, cy - h - 20, 5, 12);
  g.endFill();
  // Door
  g.beginFill(pal.dark);
  g.drawRoundedRect(cx - 4, cy + td / 2 - 12, 8, 12, 3);
  g.endFill();
  // Windows with glow
  const wc = theme.isDay ? 0xaaddff : theme.windowLit;
  g.beginFill(wc, 0.8);
  g.drawRect(cx - 14, cy - h * 0.5, 6, 5);
  g.drawRect(cx + 8, cy - h * 0.5, 6, 5);
  g.endFill();
  // Fence
  g.lineStyle(1, 0x886644, 0.6);
  g.moveTo(cx - tw / 2 - 5, cy + td / 2 + 2);
  g.lineTo(cx + tw / 2 + 5, cy + td / 2 + 2);
  g.lineStyle(0);
};

const drawTower = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => {
  // Base
  drawIsoBox(g, cx, cy, tw * 0.8, td * 0.8, h * 0.25, pal.light, pal.main, pal.dark);
  // Main tower (narrow, tall)
  drawIsoBox(g, cx, cy - h * 0.25, tw * 0.4, td * 0.4, h * 0.75, lighten(pal.light, 0.1), lighten(pal.main, 0.05), pal.dark);
  // Observation deck
  drawIsoBox(g, cx, cy - h, tw * 0.55, td * 0.55, 4, lighten(pal.light, 0.2), pal.main, pal.dark);
  // Spire
  g.beginFill(pal.roof);
  g.drawPolygon([cx - 3, cy - h - 4, cx, cy - h - 25, cx + 3, cy - h - 4]);
  g.endFill();
  // Crescent
  g.beginFill(0xffcc44);
  g.drawCircle(cx, cy - h - 28, 4);
  g.endFill();
  g.beginFill(darken(pal.roof, 0.8));
  g.drawCircle(cx + 2, cy - h - 29, 3.5);
  g.endFill();
  // Balcony rings
  g.lineStyle(1.5, pal.accent, 0.5);
  g.drawEllipse(cx, cy - h * 0.5, tw * 0.3, td * 0.15);
  g.drawEllipse(cx, cy - h * 0.7, tw * 0.25, td * 0.12);
  g.lineStyle(0);
  // Glow
  if (!theme.isDay) {
    g.beginFill(pal.glow, 0.15);
    g.drawCircle(cx, cy - h - 28, 12);
    g.endFill();
  }
};

const drawSchool = (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => {
  // Wide main building
  drawIsoBox(g, cx, cy, tw * 1.2, td * 1.2, h * 0.6, pal.light, pal.main, pal.dark);
  // Clock tower
  drawIsoBox(g, cx, cy - h * 0.6, tw * 0.35, td * 0.35, h * 0.45, lighten(pal.light, 0.15), lighten(pal.main, 0.05), pal.dark);
  // Clock face
  g.beginFill(0xffffee);
  g.drawCircle(cx, cy - h * 0.85, 5);
  g.endFill();
  g.lineStyle(1, 0x333333, 0.8);
  g.moveTo(cx, cy - h * 0.85);
  g.lineTo(cx, cy - h * 0.85 - 3);
  g.moveTo(cx, cy - h * 0.85);
  g.lineTo(cx + 2, cy - h * 0.85);
  g.lineStyle(0);
  // Pyramid top
  g.beginFill(pal.roof);
  g.drawPolygon([cx - 8, cy - h * 1.05, cx, cy - h * 1.05 - 10, cx + 8, cy - h * 1.05]);
  g.endFill();
  // Flag
  g.beginFill(0x666666);
  g.drawRect(cx + tw * 0.5, cy - h * 0.9, 2, 25);
  g.endFill();
  g.beginFill(pal.roof);
  g.drawRect(cx + tw * 0.5 + 2, cy - h * 0.9, 10, 6);
  g.endFill();
  // Window row
  const wc = theme.isDay ? 0xaaddff : theme.windowLit;
  for (let i = -2; i <= 2; i++) {
    g.beginFill(wc, 0.7);
    g.drawRect(cx + i * 9 - 3, cy - h * 0.35, 5, 6);
    g.endFill();
  }
};

// ═══════════════════════════════════════════════════════════════════
// SCENE BUILDER
// ═══════════════════════════════════════════════════════════════════

const buildingDrawFns: Record<string, (g: PIXI.Graphics, cx: number, cy: number, tw: number, td: number, h: number, pal: CatPalette, theme: ThemeConfig) => void> = {
  Salah: drawMosque, Quran: drawLibrary, Sadaqah: drawGarden, Dhikr: drawFountain,
  Character: drawCommunity, Family: drawHouse, Fasting: drawTower, Knowledge: drawSchool,
};

function buildScene(
  app: PIXI.Application,
  w: number, h: number,
  categoryData: CityVisualizationProps["categoryData"],
  timeOfDay: TimeOfDay,
  selectedCategory: string | null,
  onSelectCategory: (cat: string | null) => void,
  setHoverCat: (cat: string | null) => void,
) {
  const theme = themes[timeOfDay];
  const centerX = w / 2;
  const centerY = h * 0.48;

  // ─── Sky gradient ───
  const sky = new PIXI.Graphics();
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    sky.beginFill(lerpColor(theme.skyTop, theme.skyBot, t));
    sky.drawRect(0, (h / steps) * i, w, h / steps + 1);
    sky.endFill();
  }
  app.stage.addChild(sky);

  // ─── Stars ───
  if (theme.starAlpha > 0) {
    const stars = new PIXI.Graphics();
    for (let i = 0; i < 100; i++) {
      const sx = sr(i * 7.3) * w;
      const sy = sr(i * 13.7) * h * 0.55;
      const radius = 0.5 + sr(i * 3.1) * 1.5;
      const alpha = theme.starAlpha * (0.3 + sr(i * 5.7) * 0.7);
      stars.beginFill(0xffffff, alpha);
      stars.drawCircle(sx, sy, radius);
      stars.endFill();
    }
    app.stage.addChild(stars);

    // Twinkle animation
    let twinkleTime = 0;
    app.ticker.add((delta) => {
      twinkleTime += delta * 0.02;
      stars.alpha = 0.7 + Math.sin(twinkleTime) * 0.3;
    });
  }

  // ─── Sun/Moon ───
  const celestial = new PIXI.Graphics();
  const sunX = w * 0.8;
  const sunY = h * theme.sunY;
  const sunR = theme.isDay ? 20 : 14;
  // Glow
  celestial.beginFill(theme.sunColor, 0.1);
  celestial.drawCircle(sunX, sunY, sunR * 3);
  celestial.endFill();
  celestial.beginFill(theme.sunColor, 0.2);
  celestial.drawCircle(sunX, sunY, sunR * 2);
  celestial.endFill();
  celestial.beginFill(theme.sunColor, 0.9);
  celestial.drawCircle(sunX, sunY, sunR);
  celestial.endFill();
  // Moon crescent effect at night
  if (!theme.isDay && timeOfDay === "night") {
    celestial.beginFill(theme.skyTop);
    celestial.drawCircle(sunX + 5, sunY - 3, sunR * 0.85);
    celestial.endFill();
  }
  app.stage.addChild(celestial);

  // ─── Clouds ───
  const cloudsContainer = new PIXI.Container();
  if (theme.cloudAlpha > 0) {
    for (let i = 0; i < 6; i++) {
      const cloud = new PIXI.Graphics();
      const cx = sr(i * 37) * w;
      const cy = 30 + sr(i * 53) * h * 0.2;
      const s = 0.6 + sr(i * 17) * 0.8;
      cloud.beginFill(0xffffff, theme.cloudAlpha * 0.5);
      cloud.drawEllipse(0, 0, 45 * s, 14 * s);
      cloud.drawEllipse(-22 * s, 3, 28 * s, 11 * s);
      cloud.drawEllipse(28 * s, 2, 32 * s, 12 * s);
      cloud.drawEllipse(10 * s, -5, 20 * s, 9 * s);
      cloud.endFill();
      cloud.position.set(cx, cy);
      cloudsContainer.addChild(cloud);
    }
    app.stage.addChild(cloudsContainer);

    // Drift animation
    app.ticker.add((delta) => {
      for (const cloud of cloudsContainer.children) {
        cloud.x += delta * (0.15 + cloudsContainer.children.indexOf(cloud) * 0.04);
        if (cloud.x > w + 150) cloud.x = -200;
      }
    });
  }

  // ─── Ground ───
  const ground = new PIXI.Graphics();
  ground.beginFill(theme.ground);
  ground.drawRect(0, h * 0.55, w, h * 0.45);
  ground.endFill();
  // Gradient transition
  for (let i = 0; i < 15; i++) {
    const t = i / 15;
    ground.beginFill(lerpColor(theme.skyBot, theme.ground, t), 0.8);
    ground.drawRect(0, h * 0.5 + i * (h * 0.08 / 15), w, h * 0.08 / 15 + 1);
    ground.endFill();
  }
  // Ground texture (subtle grid)
  ground.lineStyle(0.5, theme.groundLight, 0.15);
  for (let i = -20; i < 40; i++) {
    const y = h * 0.55 + i * 12;
    ground.moveTo(0, y);
    ground.lineTo(w, y + w * 0.1);
    ground.moveTo(i * 40, h * 0.55);
    ground.lineTo(i * 40 + w * 0.2, h);
  }
  ground.lineStyle(0);
  app.stage.addChild(ground);

  // ─── Background city silhouettes ───
  const bgCity = new PIXI.Graphics();
  for (let i = 0; i < 50; i++) {
    const bx = sr(i * 3.7) * w;
    const bh = 8 + sr(i * 11.1) * 35;
    const bw = 6 + sr(i * 13.3) * 14;
    const by = h * 0.54 - bh;
    const shade = sr(i * 29);
    const color = lerpColor(theme.fog, theme.ground, 0.2 + shade * 0.3);
    bgCity.beginFill(color, 0.35 + shade * 0.15);
    bgCity.drawRect(bx - bw / 2, by, bw, bh);
    bgCity.endFill();
    // Some with pointed roofs
    if (sr(i * 41) > 0.6) {
      bgCity.beginFill(color, 0.25);
      bgCity.drawPolygon([bx - bw / 2, by, bx, by - 6, bx + bw / 2, by]);
      bgCity.endFill();
    }
  }
  app.stage.addChild(bgCity);

  // ─── Trees ───
  const trees = new PIXI.Graphics();
  const treeSpots = [
    [-180, 15], [-120, 25], [130, 20], [190, 10], [-60, 40],
    [70, 35], [160, 40], [-150, 35], [100, -10], [-90, -5],
  ];
  for (const [tx, ty] of treeSpots) {
    const x = centerX + tx;
    const y = centerY + ty + 30;
    const s = 0.6 + Math.abs(sr(tx * 7)) * 0.6;
    // Trunk
    trees.beginFill(0x664422);
    trees.drawRect(x - 1.5 * s, y - 10 * s, 3 * s, 10 * s);
    trees.endFill();
    // Foliage
    const leafC = theme.isDay ? 0x44aa55 : 0x1a4422;
    trees.beginFill(leafC, 0.85);
    trees.drawCircle(x, y - 14 * s, 7 * s);
    trees.drawCircle(x - 4 * s, y - 11 * s, 5 * s);
    trees.drawCircle(x + 4 * s, y - 11 * s, 5 * s);
    trees.endFill();
  }
  app.stage.addChild(trees);

  // ─── Buildings ───
  const gridPositions: [number, number][] = [
    [-1.5, -0.5], [-0.5, -0.5], [0.5, -0.5], [1.5, -0.5],
    [-1.5, 0.5], [-0.5, 0.5], [0.5, 0.5], [1.5, 0.5],
  ];

  // Sort by y position for depth ordering
  const sortedIndices = [...Array(8).keys()].sort((a, b) => {
    const [ax, ay] = gridPositions[a];
    const [bx, by] = gridPositions[b];
    return (ax + ay) - (bx + by);
  });

  const buildingContainers: PIXI.Container[] = [];

  for (const idx of sortedIndices) {
    const cat = categories[idx];
    const data = categoryData[cat];
    if (!data) continue;

    const [gx, gy] = gridPositions[idx];
    const isoX = centerX + (gx - gy) * TILE_W * 0.65;
    const isoY = centerY + (gx + gy) * TILE_D * 0.65;

    const maxCount = 156;
    const buildingH = 25 + (data.count / maxCount) * 55;
    const pal = catPalettes[cat];
    const isSelected = selectedCategory === cat;
    const drawFn = buildingDrawFns[cat];

    const container = new PIXI.Container();
    container.position.set(0, 0);

    // Shadow
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.15);
    shadow.drawEllipse(isoX, isoY + TILE_D / 2 + 2, TILE_W * 0.4, TILE_D * 0.2);
    shadow.endFill();
    container.addChild(shadow);

    // Selection glow ring
    if (isSelected) {
      const selRing = new PIXI.Graphics();
      selRing.lineStyle(3, pal.accent, 0.7);
      selRing.drawEllipse(isoX, isoY + TILE_D / 2, TILE_W * 0.5, TILE_D * 0.25);
      selRing.lineStyle(0);
      selRing.beginFill(pal.accent, 0.08);
      selRing.drawEllipse(isoX, isoY + TILE_D / 2, TILE_W * 0.5, TILE_D * 0.25);
      selRing.endFill();
      container.addChild(selRing);
    }

    // Building graphics
    const buildingGfx = new PIXI.Graphics();
    if (drawFn) {
      drawFn(buildingGfx, isoX, isoY, TILE_W * 0.7, TILE_D * 0.7, buildingH, pal, theme);
    }
    container.addChild(buildingGfx);

    // Label
    const label = new PIXI.Text(data.element, {
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: 10,
      fontWeight: "600",
      fill: theme.isDay ? 0x333333 : 0xcccccc,
      align: "center",
    });
    label.anchor.set(0.5, 0);
    label.position.set(isoX, isoY + TILE_D / 2 + 6);
    container.addChild(label);

    // Count badge
    const badge = new PIXI.Text(`${data.count}`, {
      fontFamily: "system-ui, sans-serif",
      fontSize: 8,
      fill: theme.isDay ? 0x666666 : 0x999999,
      align: "center",
    });
    badge.anchor.set(0.5, 0);
    badge.position.set(isoX, isoY + TILE_D / 2 + 18);
    container.addChild(badge);

    // Interaction hit area
    const hitArea = new PIXI.Graphics();
    hitArea.beginFill(0x000000, 0.001); // nearly invisible
    hitArea.drawRect(isoX - TILE_W * 0.45, isoY - buildingH - 30, TILE_W * 0.9, buildingH + TILE_D + 40);
    hitArea.endFill();
    hitArea.eventMode = "static";
    hitArea.cursor = "pointer";
    hitArea.on("pointerover", () => setHoverCat(cat));
    hitArea.on("pointerout", () => setHoverCat(null));
    hitArea.on("pointertap", () => onSelectCategory(isSelected ? null : cat));
    container.addChild(hitArea);

    app.stage.addChild(container);
    buildingContainers.push(container);
  }

  // ─── Fireflies at night ───
  if (theme.starAlpha > 0.5) {
    const fireflies = new PIXI.Graphics();
    let ffTime = 0;
    const ffData = Array.from({ length: 15 }, (_, i) => ({
      x: centerX + (sr(i * 31) - 0.5) * w * 0.7,
      y: centerY + (sr(i * 47) - 0.3) * h * 0.3,
      speed: 0.3 + sr(i * 13) * 0.5,
      phase: sr(i * 71) * Math.PI * 2,
    }));

    app.ticker.add((delta) => {
      ffTime += delta * 0.03;
      fireflies.clear();
      for (const ff of ffData) {
        const x = ff.x + Math.sin(ffTime * ff.speed + ff.phase) * 20;
        const y = ff.y + Math.cos(ffTime * ff.speed * 0.7 + ff.phase) * 12;
        const alpha = 0.3 + Math.sin(ffTime * 2 + ff.phase) * 0.4;
        fireflies.beginFill(0xaaff44, Math.max(0, alpha));
        fireflies.drawCircle(x, y, 2);
        fireflies.endFill();
        fireflies.beginFill(0xaaff44, Math.max(0, alpha * 0.2));
        fireflies.drawCircle(x, y, 6);
        fireflies.endFill();
      }
    });
    app.stage.addChild(fireflies);
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const CityVisualization = ({ categoryData, selectedCategory, onSelectCategory, timeOfDay }: CityVisualizationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [hoverCat, setHoverCat] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  // Initialize PIXI app
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Clean up previous app
    if (appRef.current) {
      appRef.current.destroy(true, { children: true });
      appRef.current = null;
    }

    const w = el.clientWidth;
    const h = el.clientHeight;

    const app = new PIXI.Application({
      width: w,
      height: h,
      antialias: true,
      backgroundColor: themes[timeOfDay].fog,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    el.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    buildScene(app, w, h, categoryData, timeOfDay, selectedCategory, onSelectCategory, setHoverCat);

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [timeOfDay, selectedCategory, categoryData, onSelectCategory]);

  // Handle resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const app = appRef.current;
      if (!app) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      app.renderer.resize(w, h);
      app.stage.removeChildren();
      buildScene(app, w, h, categoryData, timeOfDay, selectedCategory, onSelectCategory, setHoverCat);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [timeOfDay, selectedCategory, categoryData, onSelectCategory]);

  const hoveredData = hoverCat ? categoryData[hoverCat] : null;

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] md:h-[620px] rounded-xl overflow-hidden relative"
      onMouseMove={handleMouseMove}
      style={{ cursor: hoverCat ? "pointer" : "grab" }}
    >
      {/* Tooltip overlay */}
      {hoverCat && hoveredData && (
        <div
          className="absolute pointer-events-none z-10 bg-card/95 border border-border rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm whitespace-nowrap"
          style={{
            left: mousePos.x,
            top: mousePos.y - 65,
            transform: "translateX(-50%)",
          }}
        >
          <p className="text-sm font-bold text-foreground">
            {hoveredData.emoji} {hoveredData.element}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {hoveredData.count} deeds · Level {hoveredData.count > 50 ? 3 : hoveredData.count > 20 ? 2 : 1}
          </p>
        </div>
      )}
    </div>
  );
};

export default CityVisualization;
