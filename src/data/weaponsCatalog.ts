export interface AnchorData {
  baseX: number;
  baseY: number;
  tipX?: number;
  tipY?: number;
  angle?: number;
  distance?: number;
  scale?: number;
}

export interface WeaponOption {
  id: string;
  name: string;
  url: string;
  filename: string;
  isCommonOrStarter?: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  anchor?: AnchorData;
}

// Weapons catalog containing all 256x256 anchored weapons with pivot metadata.
// Supports standalone client rendering without depending on Anchor Studio or Dev API endpoints.
export const WEAPONS_CATALOG: WeaponOption[] = [
  { id: 'none', name: 'Unarmed (None)', url: '', filename: '' },
  { id: 'arcane_staff', name: 'Arcane Staff', url: '/assets/anchored_weapons/arcane_staff.png', filename: 'arcane_staff.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 23, baseY: 44, tipX: 40, tipY: 15, angle: -59.62, distance: 33.62 , scale: 1.0 } },
  { id: 'arcane_star_mace', name: 'Arcane Star Mace', url: '/assets/anchored_weapons/arcane_star_mace.png', filename: 'arcane_star_mace.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 14, baseY: 49, tipX: 47, tipY: 17, angle: -44.12, distance: 45.97 , scale: 1.0 } },
  { id: 'bloodfang_dagger', name: 'Bloodfang Dagger', url: '/assets/anchored_weapons/bloodfang_dagger.png', filename: 'bloodfang_dagger.png', isCommonOrStarter: true, rarity: 'rare', anchor: { baseX: 16, baseY: 47, tipX: 46, tipY: 15, angle: -46.85, distance: 43.86 , scale: 1.0 } },
  { id: 'celestial_holy_mace', name: 'Celestial Holy Mace', url: '/assets/anchored_weapons/celestial_holy_mace.png', filename: 'celestial_holy_mace.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 44, baseY: 44, tipX: 24, tipY: 23, angle: -133.6, distance: 29 , scale: 1.0 } },
  { id: 'celestial_paladin_hammer', name: 'Celestial Paladin Hammer', url: '/assets/anchored_weapons/celestial_paladin_hammer.png', filename: 'celestial_paladin_hammer.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 8, baseY: 54, tipX: 47, tipY: 17, angle: -43.49, distance: 53.76 , scale: 1.0 } },
  { id: 'cosmic_void_katana', name: 'Cosmic Void Katana', url: '/assets/anchored_weapons/cosmic_void_katana.png', filename: 'cosmic_void_katana.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 12, baseY: 52, tipX: 51, tipY: 17, angle: -41.91, distance: 52.4 , scale: 1.0 } },
  { id: 'crimson_claw_dagger', name: 'Crimson Claw Dagger', url: '/assets/anchored_weapons/crimson_claw_dagger.png', filename: 'crimson_claw_dagger.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 16, baseY: 47, tipX: 54, tipY: 14, angle: -40.97, distance: 50.33 , scale: 1.0 } },
  { id: 'crimson_greatsword', name: 'Crimson Greatsword', url: '/assets/anchored_weapons/crimson_greatsword.png', filename: 'crimson_greatsword.png', isCommonOrStarter: true, rarity: 'rare', anchor: { baseX: 17, baseY: 48, tipX: 51, tipY: 14, angle: -45, distance: 48.08 , scale: 1.0 } },
  { id: 'crystal_shard_dagger', name: 'Crystal Shard Dagger', url: '/assets/anchored_weapons/crystal_shard_dagger.png', filename: 'crystal_shard_dagger.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 20, baseY: 43, tipX: 50, tipY: 14, angle: -44.03, distance: 41.73 , scale: 1.0 } },
  { id: 'demon_soul_scythe', name: 'Demon Soul Scythe', url: '/assets/anchored_weapons/demon_soul_scythe.png', filename: 'demon_soul_scythe.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 19, baseY: 42, tipX: 54, tipY: 27, angle: -23.2, distance: 38.08 , scale: 1.0 } },
  { id: 'dragon_fire_blade', name: 'Dragon Fire Blade', url: '/assets/anchored_weapons/dragon_fire_blade.png', filename: 'dragon_fire_blade.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 11, baseY: 52, tipX: 46, tipY: 17, angle: -45, distance: 49.5 , scale: 1.0 } },
  { id: 'dragon_scale_halberd', name: 'Dragon Scale Halberd', url: '/assets/anchored_weapons/dragon_scale_halberd.png', filename: 'dragon_scale_halberd.png', isCommonOrStarter: false, rarity: 'rare', anchor: { baseX: 15, baseY: 49, tipX: 48, tipY: 16, angle: -45, distance: 46.67 , scale: 1.0 } },
  { id: 'dragon_tooth_dagger', name: 'Dragon Tooth Dagger', url: '/assets/anchored_weapons/dragon_tooth_dagger.png', filename: 'dragon_tooth_dagger.png', isCommonOrStarter: false, rarity: 'rare', anchor: { baseX: 17, baseY: 45, tipX: 48, tipY: 20, angle: -38.88, distance: 39.82 , scale: 1.0 } },
  { id: 'dread_flail', name: 'Dread Flail', url: '/assets/anchored_weapons/dread_flail.png', filename: 'dread_flail.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 11, baseY: 51, tipX: 49, tipY: 15, angle: -43.45, distance: 52.35 , scale: 1.0 } },
  { id: 'emerald_poison_dagger', name: 'Emerald Poison Dagger', url: '/assets/anchored_weapons/emerald_poison_dagger.png', filename: 'emerald_poison_dagger.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 17, baseY: 47, tipX: 53, tipY: 14, angle: -42.51, distance: 48.84 , scale: 1.0 } },
  { id: 'emerald_poison_scythe', name: 'Emerald Poison Scythe', url: '/assets/anchored_weapons/emerald_poison_scythe.png', filename: 'emerald_poison_scythe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 11, baseY: 53, tipX: 53, tipY: 18, angle: -39.81, distance: 54.67 , scale: 1.0 } },
  { id: 'flaming_greatsword', name: 'Flaming Greatsword', url: '/assets/anchored_weapons/flaming_greatsword.png', filename: 'flaming_greatsword.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 13, baseY: 13, tipX: 48, tipY: 47, angle: 44.17, distance: 48.8 , scale: 1.0 } },
  { id: 'frost_battleaxe', name: 'Frost Battleaxe', url: '/assets/anchored_weapons/frost_battleaxe.png', filename: 'frost_battleaxe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 18, baseY: 46, tipX: 49, tipY: 28, angle: -30.14, distance: 35.85 , scale: 1.0 } },
  { id: 'frost_crescent_scythe', name: 'Frost Crescent Scythe', url: '/assets/anchored_weapons/frost_crescent_scythe.png', filename: 'frost_crescent_scythe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 11, baseY: 55, tipX: 59, tipY: 28, angle: -29.36, distance: 55.07 , scale: 1.0 } },
  { id: 'frost_war_hammer', name: 'Frost War Hammer', url: '/assets/anchored_weapons/frost_war_hammer.png', filename: 'frost_war_hammer.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 15, baseY: 48, tipX: 45, tipY: 17, angle: -45.94, distance: 43.14 , scale: 1.0 } },
  { id: 'frostbite_scythe', name: 'Frostbite Scythe', url: '/assets/anchored_weapons/frostbite_scythe.png', filename: 'frostbite_scythe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 19, baseY: 44, tipX: 44, tipY: 18, angle: -46.12, distance: 36.07 , scale: 1.0 } },
  { id: 'infernal_war_axe', name: 'Infernal War Axe', url: '/assets/anchored_weapons/infernal_war_axe.png', filename: 'infernal_war_axe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 15, baseY: 48, tipX: 46, tipY: 18, angle: -44.06, distance: 43.14 , scale: 1.0 } },
  { id: 'obsidian_warhammer', name: 'Obsidian Warhammer', url: '/assets/anchored_weapons/obsidian_warhammer.png', filename: 'obsidian_warhammer.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 17, baseY: 46, tipX: 48, tipY: 17, angle: -43.09, distance: 42.45 , scale: 1.0 } },
  { id: 'thunder_halberd', name: 'Thunder Halberd', url: '/assets/anchored_weapons/thunder_halberd.png', filename: 'thunder_halberd.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 13, baseY: 49, tipX: 46, tipY: 23, angle: -38.23, distance: 42.01 , scale: 1.0 } },
  { id: 'titan_destroyer_mace', name: 'Titan Destroyer Mace', url: '/assets/anchored_weapons/titan_destroyer_mace.png', filename: 'titan_destroyer_mace.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 16, baseY: 47, tipX: 46, tipY: 18, angle: -44.03, distance: 41.73 , scale: 1.0 } },
  { id: 'valiant_crusader_blade', name: 'Valiant Crusader Blade', url: '/assets/anchored_weapons/valiant_crusader_blade.png', filename: 'valiant_crusader_blade.png', isCommonOrStarter: true, rarity: 'legendary', anchor: { baseX: 13, baseY: 50, tipX: 49, tipY: 15, angle: -44.19, distance: 50.21 , scale: 1.0 } },
  { id: 'venom_claw_dagger', name: 'Venom Claw Dagger', url: '/assets/anchored_weapons/venom_claw_dagger.png', filename: 'venom_claw_dagger.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 17, baseY: 45, tipX: 49, tipY: 20, angle: -38, distance: 40.61 , scale: 1.0 } },
];

// In-memory cache for dynamic or runtime registered weapon anchors
const anchorCache = new Map<string, AnchorData>();

// Initialize cache with catalog items
WEAPONS_CATALOG.forEach(w => {
  if (w.anchor) {
    anchorCache.set(w.id.toLowerCase(), w.anchor);
    anchorCache.set(w.filename.toLowerCase(), w.anchor);
    anchorCache.set(w.url.toLowerCase(), w.anchor);
  }
});

export function registerWeapon(option: WeaponOption): void {
  const existingIndex = WEAPONS_CATALOG.findIndex(w => w.id.toLowerCase() === option.id.toLowerCase());
  if (existingIndex >= 0) {
    WEAPONS_CATALOG[existingIndex] = option;
  } else {
    WEAPONS_CATALOG.push(option);
  }
  if (option.anchor) {
    anchorCache.set(option.id.toLowerCase(), option.anchor);
    anchorCache.set(option.filename.toLowerCase(), option.anchor);
    anchorCache.set(option.url.toLowerCase(), option.anchor);
  }
}

export function getWeaponFileUrl(weaponId: string = 'none'): string {
  if (!weaponId || weaponId === 'none') return '';
  if (weaponId.startsWith('/assets/')) return weaponId;

  const search = weaponId.toLowerCase();
  const exact = WEAPONS_CATALOG.find(w => 
    w.id.toLowerCase() === search || 
    w.name.toLowerCase() === search || 
    w.filename.toLowerCase() === search
  );
  if (exact) return exact.url;

  return `/assets/anchored_weapons/${weaponId}.png`;
}

export async function loadAnchorSidecar(weaponIdOrUrl: string): Promise<AnchorData | null> {
  if (!weaponIdOrUrl || weaponIdOrUrl === 'none') return null;
  const basename = weaponIdOrUrl.split('/').pop()?.replace(/\.(png|jpg|jpeg)$/i, '') || weaponIdOrUrl;
  const sidecarUrl = `/assets/anchored_weapons/${basename}.anchor.json`;

  try {
    const res = await fetch(sidecarUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.baseX === 'number') {
        const anchor: AnchorData = {
          baseX: data.baseX,
          baseY: data.baseY,
          tipX: data.tipX,
          tipY: data.tipY,
          angle: data.angle,
          distance: data.distance,
          scale: typeof data.scale === 'number' ? data.scale : 1.0,
        };
        const key = weaponIdOrUrl.toLowerCase();
        anchorCache.set(key, anchor);
        anchorCache.set(basename.toLowerCase(), anchor);

        // Sync catalog item if present
        const catalogItem = WEAPONS_CATALOG.find(w => w.id.toLowerCase() === basename.toLowerCase() || w.filename.toLowerCase() === `${basename.toLowerCase()}.png`);
        if (catalogItem) {
          catalogItem.anchor = anchor;
        }

        return anchor;
      }
    }
  } catch {
    // Ignore sidecar fetch errors
  }
  return null;
}

export function getWeaponAnchorData(weaponIdOrUrl: string = 'none'): AnchorData | null {
  if (!weaponIdOrUrl || weaponIdOrUrl === 'none') return null;

  const search = weaponIdOrUrl.toLowerCase();
  if (anchorCache.has(search)) return anchorCache.get(search)!;

  const basename = weaponIdOrUrl.split('/').pop()?.replace(/\.(png|jpg|jpeg)$/i, '').toLowerCase() || '';
  if (basename && anchorCache.has(basename)) return anchorCache.get(basename)!;

  // Search catalog by filename or ID or name
  const item = WEAPONS_CATALOG.find(w => 
    w.id.toLowerCase() === search || 
    w.url.toLowerCase() === search || 
    w.filename.toLowerCase() === search ||
    w.name.toLowerCase() === search ||
    (basename && (w.id.toLowerCase() === basename || w.filename.toLowerCase() === `${basename}.png`))
  );

  if (item && item.anchor) {
    anchorCache.set(search, item.anchor);
    if (basename) anchorCache.set(basename, item.anchor);
    return item.anchor;
  }

  // Trigger async fetch of sidecar JSON to populate cache dynamically
  if (typeof window !== 'undefined' && window.fetch) {
    loadAnchorSidecar(weaponIdOrUrl);
  }

  return null;
}

export function getWeaponFgFileUrl(_weaponId: string = 'none'): string {
  return '';
}

export function getWeaponBgFileUrl(_weaponId: string = 'none'): string {
  return '';
}
