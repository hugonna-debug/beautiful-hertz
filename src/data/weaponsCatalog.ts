export interface AnchorData {
  baseX: number;
  baseY: number;
  tipX?: number;
  tipY?: number;
  angle?: number;
  distance?: number;
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

// Weapons catalog containing all anchored weapons with pivot metadata.
// Supports standalone client rendering without depending on Anchor Studio or Dev API endpoints.
export const WEAPONS_CATALOG: WeaponOption[] = [
  { id: 'none', name: 'Unarmed (None)', url: '', filename: '' },
  { id: '1', name: 'Novice Crusader Blade', url: '/assets/anchored_weapons/1.png', filename: '1.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 32, baseY: 51, tipX: 31, tipY: 8, angle: -91.33, distance: 43.01 } },
  { id: '10', name: 'Knight Broadsword', url: '/assets/anchored_weapons/10.png', filename: '10.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 32, baseY: 54, tipX: 32, tipY: 6, angle: -90, distance: 48 } },
  { id: '11', name: 'Curved Sabre', url: '/assets/anchored_weapons/11.png', filename: '11.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 32, baseY: 51, tipX: 31, tipY: 13, angle: -91.51, distance: 38.01 } },
  { id: '12', name: 'Heavy Flail', url: '/assets/anchored_weapons/12.png', filename: '12.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 32, baseY: 50, tipX: 32, tipY: 10, angle: -90, distance: 40 } },
  { id: '13', name: 'Mithril Dagger', url: '/assets/anchored_weapons/13.png', filename: '13.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 32, baseY: 49, tipX: 32, tipY: 9, angle: -90, distance: 40 } },
  { id: '14', name: 'Royal Greatsword', url: '/assets/anchored_weapons/14.png', filename: '14.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 32, baseY: 51, tipX: 32, tipY: 10, angle: -90, distance: 41 } },
  { id: '15', name: 'Reinforced Halberd', url: '/assets/anchored_weapons/15.png', filename: '15.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 31, baseY: 55, tipX: 29, tipY: 5, angle: -92.29, distance: 50.04 } },
  { id: '16', name: 'Huntsman Spear', url: '/assets/anchored_weapons/16.png', filename: '16.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 32, baseY: 46, tipX: 32, tipY: 11, angle: -90, distance: 35 } },
  { id: '17', name: 'Dual Claw', url: '/assets/anchored_weapons/17.png', filename: '17.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 31, baseY: 48, tipX: 32, tipY: 12, angle: -88.41, distance: 36.01 } },
  { id: '18', name: 'Barbarian Cleaver', url: '/assets/anchored_weapons/18.png', filename: '18.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 31, baseY: 49, tipX: 32, tipY: 11, angle: -88.49, distance: 38.01 } },
  { id: '19', name: 'Mystic Wand', url: '/assets/anchored_weapons/19.png', filename: '19.png', isCommonOrStarter: true, rarity: 'common', anchor: { baseX: 31, baseY: 50, tipX: 31, tipY: 18, angle: -90, distance: 32 } },
  { id: 'arcane_staff', name: 'Arcane Staff', url: '/assets/anchored_weapons/arcane_staff.png', filename: 'arcane_staff.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 23, baseY: 44, tipX: 40, tipY: 15, angle: -59.62, distance: 33.62 } },
  { id: 'arcane_star_mace', name: 'Arcane Star Mace', url: '/assets/anchored_weapons/arcane_star_mace.png', filename: 'arcane_star_mace.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 14, baseY: 49, tipX: 47, tipY: 17, angle: -44.12, distance: 45.97 } },
  { id: 'bloodfang_dagger', name: 'Bloodfang Dagger', url: '/assets/anchored_weapons/bloodfang_dagger.png', filename: 'bloodfang_dagger.png', isCommonOrStarter: false, rarity: 'rare', anchor: { baseX: 16, baseY: 47, tipX: 46, tipY: 15, angle: -46.85, distance: 43.86 } },
  { id: 'celestial_holy_mace', name: 'Celestial Holy Mace', url: '/assets/anchored_weapons/celestial_holy_mace.png', filename: 'celestial_holy_mace.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 44, baseY: 44, tipX: 24, tipY: 23, angle: -133.6, distance: 29 } },
  { id: 'celestial_paladin_hammer', name: 'Celestial Paladin Hammer', url: '/assets/anchored_weapons/celestial_paladin_hammer.png', filename: 'celestial_paladin_hammer.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 8, baseY: 54, tipX: 47, tipY: 17, angle: -43.49, distance: 53.76 } },
  { id: 'cosmic_void_katana', name: 'Cosmic Void Katana', url: '/assets/anchored_weapons/cosmic_void_katana.png', filename: 'cosmic_void_katana.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 12, baseY: 52, tipX: 51, tipY: 17, angle: -41.91, distance: 52.4 } },
  { id: 'crimson_claw_dagger', name: 'Crimson Claw Dagger', url: '/assets/anchored_weapons/crimson_claw_dagger.png', filename: 'crimson_claw_dagger.png', isCommonOrStarter: false, rarity: 'rare', anchor: { baseX: 16, baseY: 47, tipX: 54, tipY: 14, angle: -40.97, distance: 50.33 } },
  { id: 'crimson_greatsword', name: 'Crimson Greatsword', url: '/assets/anchored_weapons/crimson_greatsword.png', filename: 'crimson_greatsword.png', isCommonOrStarter: false, rarity: 'rare', anchor: { baseX: 17, baseY: 48, tipX: 51, tipY: 14, angle: -45, distance: 48.08 } },
  { id: 'crystal_shard_dagger', name: 'Crystal Shard Dagger', url: '/assets/anchored_weapons/crystal_shard_dagger.png', filename: 'crystal_shard_dagger.png', isCommonOrStarter: false, rarity: 'rare', anchor: { baseX: 20, baseY: 43, tipX: 50, tipY: 14, angle: -44.03, distance: 41.73 } },
  { id: 'demon_soul_scythe', name: 'Demon Soul Scythe', url: '/assets/anchored_weapons/demon_soul_scythe.png', filename: 'demon_soul_scythe.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 19, baseY: 42, tipX: 54, tipY: 27, angle: -23.2, distance: 38.08 } },
  { id: 'dragon_fire_blade', name: 'Dragon Fire Blade', url: '/assets/anchored_weapons/dragon_fire_blade.png', filename: 'dragon_fire_blade.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 11, baseY: 52, tipX: 46, tipY: 17, angle: -45, distance: 49.5 } },
  { id: 'dragon_tooth_dagger', name: 'Dragon Tooth Dagger', url: '/assets/anchored_weapons/dragon_tooth_dagger.png', filename: 'dragon_tooth_dagger.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 17, baseY: 45, tipX: 48, tipY: 20, angle: -38.88, distance: 39.82 } },
  { id: 'emerald_poison_dagger', name: 'Emerald Poison Dagger', url: '/assets/anchored_weapons/emerald_poison_dagger.png', filename: 'emerald_poison_dagger.png', isCommonOrStarter: false, rarity: 'rare', anchor: { baseX: 17, baseY: 47, tipX: 53, tipY: 14, angle: -42.51, distance: 48.84 } },
  { id: 'flaming_greatsword', name: 'Flaming Greatsword', url: '/assets/anchored_weapons/flaming_greatsword.png', filename: 'flaming_greatsword.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 13, baseY: 13, tipX: 48, tipY: 47, angle: 44.17, distance: 48.8 } },
  { id: 'frost_battleaxe', name: 'Frost Battleaxe', url: '/assets/anchored_weapons/frost_battleaxe.png', filename: 'frost_battleaxe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 18, baseY: 46, tipX: 49, tipY: 28, angle: -30.14, distance: 35.85 } },
  { id: 'frost_crescent_scythe', name: 'Frost Crescent Scythe', url: '/assets/anchored_weapons/frost_crescent_scythe.png', filename: 'frost_crescent_scythe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 11, baseY: 55, tipX: 59, tipY: 28, angle: -29.36, distance: 55.07 } },
  { id: 'frostbite_scythe', name: 'Frostbite Scythe', url: '/assets/anchored_weapons/frostbite_scythe.png', filename: 'frostbite_scythe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 19, baseY: 44, tipX: 44, tipY: 18, angle: -46.12, distance: 36.07 } },
  { id: 'infernal_war_axe', name: 'Infernal War Axe', url: '/assets/anchored_weapons/infernal_war_axe.png', filename: 'infernal_war_axe.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 15, baseY: 48, tipX: 46, tipY: 18, angle: -44.06, distance: 43.14 } },
  { id: 'obsidian_warhammer', name: 'Obsidian Warhammer', url: '/assets/anchored_weapons/obsidian_warhammer.png', filename: 'obsidian_warhammer.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 17, baseY: 46, tipX: 48, tipY: 17, angle: -43.09, distance: 42.45 } },
  { id: 'thunder_halberd', name: 'Thunder Halberd', url: '/assets/anchored_weapons/thunder_halberd.png', filename: 'thunder_halberd.png', isCommonOrStarter: false, rarity: 'epic', anchor: { baseX: 13, baseY: 49, tipX: 46, tipY: 23, angle: -38.23, distance: 42.01 } },
  { id: 'titan_destroyer_mace', name: 'Titan Destroyer Mace', url: '/assets/anchored_weapons/titan_destroyer_mace.png', filename: 'titan_destroyer_mace.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 16, baseY: 47, tipX: 46, tipY: 18, angle: -44.03, distance: 41.73 } },
  { id: 'valiant_crusader_blade', name: 'Valiant Crusader Blade', url: '/assets/anchored_weapons/valiant_crusader_blade.png', filename: 'valiant_crusader_blade.png', isCommonOrStarter: false, rarity: 'legendary', anchor: { baseX: 13, baseY: 50, tipX: 49, tipY: 15, angle: -44.19, distance: 50.21 } },
  { id: 'venom_claw_dagger', name: 'Venom Claw Dagger', url: '/assets/anchored_weapons/venom_claw_dagger.png', filename: 'venom_claw_dagger.png', isCommonOrStarter: false, rarity: 'rare', anchor: { baseX: 17, baseY: 45, tipX: 49, tipY: 20, angle: -38, distance: 40.61 } },
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

export function getWeaponAnchorData(weaponIdOrUrl: string = 'none'): AnchorData | null {
  if (!weaponIdOrUrl || weaponIdOrUrl === 'none') return null;

  const search = weaponIdOrUrl.toLowerCase();
  if (anchorCache.has(search)) return anchorCache.get(search)!;

  // Search catalog by filename or ID or name
  const item = WEAPONS_CATALOG.find(w => 
    w.id.toLowerCase() === search || 
    w.url.toLowerCase() === search || 
    w.filename.toLowerCase() === search ||
    w.name.toLowerCase() === search
  );

  if (item && item.anchor) {
    anchorCache.set(search, item.anchor);
    return item.anchor;
  }

  // Extract basename if path given
  const basename = weaponIdOrUrl.split('/').pop()?.replace(/\.(png|jpg|jpeg)$/i, '') || '';
  if (basename && anchorCache.has(basename.toLowerCase())) {
    return anchorCache.get(basename.toLowerCase())!;
  }

  return null;
}

export function getWeaponFgFileUrl(_weaponId: string = 'none'): string {
  return '';
}

export function getWeaponBgFileUrl(_weaponId: string = 'none'): string {
  return '';
}
