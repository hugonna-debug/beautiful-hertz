export interface WeaponOption {
  id: string;
  name: string;
  url: string;
}

// Weapons catalog — only contains anchored (verified) weapons.
// New weapons must go through the Anchor Studio pipeline before appearing here.
// Pipeline: unverified_weapons/ → Anchor Studio → anchored_weapons/ → added to catalog
export const WEAPONS_CATALOG: WeaponOption[] = [
  { id: 'none', name: 'Unarmed (None)', url: '' },
  // Weapons will be added here after they pass through the Anchor Studio.
  // The Anchor Studio in DEV_MODE_ONLY handles the pipeline:
  //   1. Sprite starts in public/assets/unverified_weapons/
  //   2. Dev sets anchor point + orientation in Anchor Studio
  //   3. Sprite moves to public/assets/anchored_weapons/ with sidecar .anchor.json
  //   4. Dev adds entry to this catalog to make it available in-game
];

export function getWeaponFileUrl(weaponId: string = 'none'): string {
  if (!weaponId || weaponId === 'none') return '';
  
  // If weaponId is already a full asset path
  if (weaponId.startsWith('/assets/')) return weaponId;

  const search = weaponId.toLowerCase();
  
  // Exact match from catalog
  const exact = WEAPONS_CATALOG.find(w => w.id === search || w.name.toLowerCase() === search);
  if (exact) return exact.url;

  // Fallback: try anchored_weapons folder directly by filename
  return `/assets/anchored_weapons/${weaponId}.png`;
}

export function getWeaponFgFileUrl(weaponId: string = 'none'): string {
  return '';
}

export function getWeaponBgFileUrl(weaponId: string = 'none'): string {
  return '';
}