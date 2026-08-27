export type DeviceTier = "desktop" | "laptop" | "mobile";

export function getDeviceTier(width: number): DeviceTier {
  if (width < 768) return "mobile";
  if (width < 1280) return "laptop";
  return "desktop";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCoarsePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/** Layer 1 — distant ambient dust, rendered behind the neural network. */
export const FAR_FIELD_COUNT: Record<DeviceTier, number> = {
  desktop: 130,
  laptop: 80,
  mobile: 28,
};

/**
 * Layer 2/3 — organized neural network structure.
 * ring1 = inner hub nodes directly wired to the AI core.
 * ring2 = mid-distance nodes forming the visible "network" body.
 * edge  = sparse outer nodes, mostly decorative depth.
 */
export const RING_NODE_COUNT: Record<DeviceTier, { ring1: number; ring2: number; edge: number }> = {
  desktop: { ring1: 7, ring2: 22, edge: 18 },
  laptop: { ring1: 6, ring2: 16, edge: 12 },
  mobile: { ring1: 4, ring2: 9, edge: 6 },
};

/** Max concurrent signal-hop chains travelling through the network. */
export const MAX_SIGNAL_CHAINS: Record<DeviceTier, number> = {
  desktop: 3,
  laptop: 2,
  mobile: 0,
};

/** Smooth magnetic-field falloff used for cursor interaction (0 = no pull, 1 = strongest). */
export function magneticFalloff(dist: number, maxDist = 250): number {
  const clamped = Math.max(0, Math.min(1, 1 - dist / maxDist));
  return Math.pow(clamped, 1.4);
}

export const COLORS = {
  core: "154,255,199",
  cyan: "139,216,255",
  dim: "180,210,198",
};

/**
 * Footer — Pixel Field tuning.
 * Density is a per-cell probability (grid + jitter, never a rigid lattice).
 * Mobile disables mouse interaction entirely (idle breathing only).
 */
export interface PixelFieldTierConfig {
  cellSize: number;
  density: number;
  mouseRadius: number;
  trailRadius: number;
  displaceAmount: number;
  interactive: boolean;
}

export const PIXEL_FIELD_TIER: Record<DeviceTier, PixelFieldTierConfig> = {
  desktop: { cellSize: 15, density: 0.62, mouseRadius: 190, trailRadius: 130, displaceAmount: 26, interactive: true },
  laptop: { cellSize: 18, density: 0.5, mouseRadius: 165, trailRadius: 110, displaceAmount: 21, interactive: true },
  mobile: { cellSize: 26, density: 0.32, mouseRadius: 0, trailRadius: 0, displaceAmount: 0, interactive: false },
};
