export interface HandSocket {
  x: number;          // Hand X coordinate in 64x64 canvas frame space
  y: number;          // Hand Y coordinate in 64x64 canvas frame space
  angle: number;      // Weapon rotation angle in degrees relative to native 45° diagonal asset
  renderOrder?: 'front' | 'behind';
  pivotX?: number;    // Hilt pivot X in 64x64 asset space
  pivotY?: number;    // Hilt pivot Y in 64x64 asset space
}

// ── Slash East overrides from Anchor Studio ──────────────────────────
// These are loaded from /assets/handsockets_overrides.json (saved by the
// Anchor Studio animation editor). If the file exists and has data, it
// takes priority over the hardcoded defaults below.
let slashEastOverrides: HandSocket[] | null = null;
let overridesLoaded = false;

async function loadOverrides() {
  if (overridesLoaded) return;
  overridesLoaded = true;
  try {
    const res = await fetch('/assets/handsockets_overrides.json');
    if (res.ok) {
      const data = await res.json();
      if (data.slashEast && Array.isArray(data.slashEast) && data.slashEast.length > 0) {
        slashEastOverrides = data.slashEast;
        console.log(`[HandSockets] Loaded ${slashEastOverrides!.length} slash-east overrides from Anchor Studio`);
      }
    }
  } catch {
    // JSON doesn't exist yet — use defaults
  }
}

// Fire and forget — loads async on first import
loadOverrides();

const DEFAULT_PIVOT_X = 20;
const DEFAULT_PIVOT_Y = 44;

// ── Hardcoded defaults (fallback) ────────────────────────────────────
const SLASH_EAST_DEFAULTS: HandSocket[] = [
  { x: 24, y: 22, angle: -45, renderOrder: 'behind', pivotX: DEFAULT_PIVOT_X, pivotY: DEFAULT_PIVOT_Y },
  { x: 32, y: 18, angle: 0, renderOrder: 'front', pivotX: DEFAULT_PIVOT_X, pivotY: DEFAULT_PIVOT_Y },
  { x: 44, y: 24, angle: 45, renderOrder: 'front', pivotX: DEFAULT_PIVOT_X, pivotY: DEFAULT_PIVOT_Y },
  { x: 48, y: 32, angle: 90, renderOrder: 'front', pivotX: DEFAULT_PIVOT_X, pivotY: DEFAULT_PIVOT_Y },
  { x: 42, y: 36, angle: 75, renderOrder: 'front', pivotX: DEFAULT_PIVOT_X, pivotY: DEFAULT_PIVOT_Y },
  { x: 36, y: 30, angle: 15, renderOrder: 'front', pivotX: DEFAULT_PIVOT_X, pivotY: DEFAULT_PIVOT_Y },
];

export function getHandSocket(
  action: 'walk' | 'slash' | 'spellcast' = 'walk',
  direction: 'south' | 'west' | 'east' | 'north' = 'south',
  frame: number = 0
): HandSocket {
  const pivotX = DEFAULT_PIVOT_X;
  const pivotY = DEFAULT_PIVOT_Y;

  if (action === 'slash') {
    const f = frame % 6;
    if (direction === 'south') {
      const sockets: HandSocket[] = [
        { x: 18, y: 22, angle: -45, renderOrder: 'front', pivotX, pivotY },
        { x: 24, y: 20, angle: -15, renderOrder: 'front', pivotX, pivotY },
        { x: 36, y: 24, angle: 30, renderOrder: 'front', pivotX, pivotY },
        { x: 44, y: 30, angle: 75, renderOrder: 'front', pivotX, pivotY },
        { x: 40, y: 34, angle: 90, renderOrder: 'front', pivotX, pivotY },
        { x: 24, y: 30, angle: -15, renderOrder: 'front', pivotX, pivotY },
      ];
      return sockets[f] || sockets[0];
    }
    if (direction === 'west') {
      const sockets: HandSocket[] = [
        { x: 40, y: 22, angle: 45, renderOrder: 'behind', pivotX, pivotY },
        { x: 32, y: 18, angle: -15, renderOrder: 'front', pivotX, pivotY },
        { x: 20, y: 24, angle: -75, renderOrder: 'front', pivotX, pivotY },
        { x: 16, y: 32, angle: -120, renderOrder: 'front', pivotX, pivotY },
        { x: 22, y: 36, angle: -105, renderOrder: 'front', pivotX, pivotY },
        { x: 28, y: 30, angle: -45, renderOrder: 'behind', pivotX, pivotY },
      ];
      return sockets[f] || sockets[0];
    }
    if (direction === 'east') {
      // ── USE ANCHOR STUDIO OVERRIDES IF AVAILABLE ──
      const source = slashEastOverrides || SLASH_EAST_DEFAULTS;
      return source[f] || source[0];
    }
    if (direction === 'north') {
      const sockets: HandSocket[] = [
        { x: 44, y: 22, angle: -45, renderOrder: 'behind', pivotX, pivotY },
        { x: 36, y: 18, angle: -60, renderOrder: 'behind', pivotX, pivotY },
        { x: 22, y: 24, angle: -90, renderOrder: 'behind', pivotX, pivotY },
        { x: 18, y: 32, angle: -120, renderOrder: 'behind', pivotX, pivotY },
        { x: 24, y: 34, angle: -100, renderOrder: 'behind', pivotX, pivotY },
        { x: 36, y: 30, angle: -45, renderOrder: 'behind', pivotX, pivotY },
      ];
      return sockets[f] || sockets[0];
    }
  }

  if (action === 'spellcast') {
    const f = frame % 7;
    const yOff = (f >= 2 && f <= 5) ? -2 : 0;
    if (direction === 'south') {
      return { x: 42, y: 28 + yOff, angle: -15, renderOrder: 'front', pivotX, pivotY };
    }
    if (direction === 'west') {
      return { x: 20, y: 28 + yOff, angle: -45, renderOrder: 'front', pivotX, pivotY };
    }
    if (direction === 'east') {
      return { x: 44, y: 28 + yOff, angle: 15, renderOrder: 'front', pivotX, pivotY };
    }
    if (direction === 'north') {
      return { x: 22, y: 24 + yOff, angle: -30, renderOrder: 'behind', pivotX, pivotY };
    }
  }

  // Default: 'walk' action (8-frame loop)
  const f = frame % 8;
  const bob = (f === 1 || f === 5) ? 1 : (f === 3 || f === 7) ? -1 : 0;

  if (direction === 'south') {
    return { x: 18, y: 28 + bob, angle: -30, renderOrder: 'front', pivotX, pivotY };
  }
  if (direction === 'west') {
    return { x: 20, y: 28 + bob, angle: -60, renderOrder: 'behind', pivotX, pivotY };
  }
  if (direction === 'east') {
    return { x: 44, y: 28 + bob, angle: 30, renderOrder: 'front', pivotX, pivotY };
  }
  if (direction === 'north') {
    return { x: 46, y: 28 + bob, angle: -30, renderOrder: 'behind', pivotX, pivotY };
  }

  return { x: 18, y: 28, angle: -30, renderOrder: 'front', pivotX, pivotY };
}
