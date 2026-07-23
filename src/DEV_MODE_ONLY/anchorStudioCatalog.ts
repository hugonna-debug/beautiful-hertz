export interface Vector2D {
  x: number;
  y: number;
}

export interface AnchorPointSpec {
  id: string;
  label: string;
  category: 'weapon' | 'helmet' | 'armor' | 'cape' | 'wings' | 'body_part';
  base: Vector2D;       // Handle / base anchor point (px, py)
  tip?: Vector2D;        // Secondary vector tip (tx, ty)
  angle?: number;        // Computed orientation angle in degrees
  distance?: number;     // Distance between base and tip
}

export interface FrameAnchorData {
  frameIndex: number;
  action: string;
  direction: string;
  anchors: Record<string, AnchorPointSpec>;
}

export interface SpriteBatchItem {
  id: string;
  name: string;
  url: string;
  category: 'weapon' | 'helmet' | 'armor' | 'cape' | 'wings' | 'body_part';
  baseAnchor?: Vector2D;
  tipAnchor?: Vector2D;
  angle?: number;
  distance?: number;
  isMarked?: boolean;
}

export const PRESET_ANCHOR_LABELS = [
  { id: 'handle_1h', name: '1H Weapon Handle', category: 'weapon' },
  { id: 'handle_2h', name: '2H Heavy Handle', category: 'weapon' },
  { id: 'shield_grip', name: 'Shield Arm Grip', category: 'weapon' },
  { id: 'helmet_crest', name: 'Helmet Head Crest', category: 'helmet' },
  { id: 'cape_shoulder', name: 'Cape Shoulder Clasp', category: 'cape' },
  { id: 'wings_mount', name: 'Wings Back Mount', category: 'wings' },
  { id: 'body_joint', name: 'Body Joint Attachment', category: 'body_part' },
];

// No longer hardcoded — batch sprites now fetched from dev-api/weapons/unverified
export const INITIAL_BATCH_SPRITES: SpriteBatchItem[] = [];

export function computeAnchorVector(base: Vector2D, tip: Vector2D): { angle: number; distance: number } {
  const dx = tip.x - base.x;
  const dy = tip.y - base.y;
  const distance = Math.round(Math.sqrt(dx * dx + dy * dy) * 100) / 100;
  const angleRad = Math.atan2(dy, dx);
  let angleDeg = Math.round((angleRad * 180 / Math.PI) * 100) / 100;
  return { angle: angleDeg, distance };
}

export function exportAnchorsToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

export function downloadJSONFile(filename: string, text: string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// ── Dev API helpers for the weapon pipeline ────────────────────────────

export interface WeaponPipelineStats {
  unverified: number;
  anchored: number;
  skipped: number;
  total: number;
}

export interface UnverifiedWeapon {
  name: string;
  url: string;
}

export async function fetchPipelineStats(): Promise<WeaponPipelineStats> {
  const res = await fetch('/dev-api/weapons/stats');
  return res.json();
}

export async function fetchUnverifiedWeapons(): Promise<UnverifiedWeapon[]> {
  const res = await fetch('/dev-api/weapons/unverified');
  const data = await res.json();
  return data.weapons;
}

export async function anchorWeapon(
  filename: string,
  anchor: { baseX: number; baseY: number; tipX: number; tipY: number; angle: number; distance: number }
): Promise<{ success: boolean; message: string; newUrl?: string }> {
  const res = await fetch('/dev-api/weapons/anchor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, anchor }),
  });
  return res.json();
}

export async function skipWeapon(filename: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/dev-api/weapons/skip', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  });
  return res.json();
}
