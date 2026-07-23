export type SubstatType =
  | 'flat_hp'
  | 'flat_def'
  | 'percent_atk'
  | 'percent_def'
  | 'percent_hp'
  | 'crit_rate'       // e.g. 0.05 (+5%)
  | 'crit_dmg'        // e.g. 1.50 (150%)
  | 'atk_speed'       // e.g. 0.10 (+10% speed)
  | 'armor_pen'       // e.g. 0.08 (8% armor ignore)
  | 'evade_rate'      // e.g. 0.04 (4% evade chance)
  | 'life_steal'      // e.g. 0.03 (3% damage healed)
  | 'regen_hp';       // e.g. 5 (5 HP/sec)

export interface ItemSubstat {
  type: SubstatType;
  value: number;
  locked: boolean;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  level?: number;
}

export type EquipmentSlot = 'weapon' | 'body' | 'boots' | 'ring';

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  itemLevel: number;
  enhanceLevel: number;
  baseValue: number; // Attack for weapon, Defense for body, HP for boots, Crit for ring
  substats: ItemSubstat[];
  setName?: string; // Set gear: "Warlord", "Synthesizer", "Cosmic"
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  acquiredAt?: number;
  locked?: boolean;
  sprite?: string;
}

export interface TalentNode {
  id: string;
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  tree: 'obliteration' | 'bastion' | 'siphon';
  statType: SubstatType;
  valuePerLevel: number; // multiplier value added per talent level
}

export interface RpgEnemy {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  absorb: number; // percentage reduction (0.0 to 0.9)
  xpReward: number;
  goldReward: number;
  shardsReward: number;
  isBoss: boolean;
  sprite?: string;
}

export interface DpsMeter {
  dpsHistory: number[]; // damage inputs registered over the last 5 seconds (50 combat ticks)
  currentDps: number;
  totalDamage: number;
  totalKills: number;
}

export type FeatureKey = 'head' | 'hair' | 'beard' | 'mustache' | 'horns' | 'longEars' | 'accessory' | 'helmet' | 'body' | 'legs' | 'shoes' | 'torso' | 'weapon' | 'wings' | 'bodyAccessory';

export interface Offset2D { x: number; y: number }

export interface FeatureOffsetEntry {
  front?: Offset2D;
  side?: Offset2D;
  x?: number;
  y?: number;
}

export type FeatureOffsetsMap = Partial<Record<FeatureKey, FeatureOffsetEntry>>;

export interface LpcCharacterConfig {
  bodyType?: string;
  skinTone: string;
  hairstyle: string;
  hairColor: string;
  facialHairColor?: string;
  beard?: string;
  mustache?: string;
  horns?: string;
  hornColor?: string;
  longEars?: string;
  torso: string;
  legs: string;
  pantsColor?: string;
  shoes: string;
  headwear: string;
  feature: string;
  accessory?: string;
  bodyAccessory?: string;
  helmet?: string;
  helmetColor?: string;
  wings?: string;
  wingsColor?: string;
  top?: string;
  topColor?: string;
  cape?: string;
  capeColor?: string;
  capePaletteType?: 'fabric' | 'metal';
  facialHair?: string;
  expression?: string;
  headModel?: string;
  weapon: string;
  featureOffsets?: FeatureOffsetsMap;
}

export interface GameState {
  heroName: string;
  lpcCharacter?: LpcCharacterConfig;
  level: number;
  xp: number;
  maxXp: number;
  gold: number;
  reforgeShards: number;
  ascensionCrystals: number;
  totalCrystalsEarned: number;
  activeDungeonId: string; // 'forest', 'mines', 'crypt', 'temple', 'cyber', 'void'
  activeStageId: number; // 1 to 11 (stage 11 is Boss)
  inCombat: boolean;
  autoAdvance: boolean;
  equippedWeapon: Equipment | null;
  equippedBody: Equipment | null;
  equippedBoots: Equipment | null;
  equippedRing: Equipment | null;
  lootBackpack: Equipment[];
  talentNodes: TalentNode[];
  activeEnemy: RpgEnemy | null;
  combatLogs: string[];
  dpsMeter: DpsMeter;
  hero: { hp: number } | null;
  difficultyTier: number;
  maxUnlockedStage: number;
  darkMode: boolean;
  musicVolume: number;
  sfxVolume: number;
  hasPrestiged: boolean;
  totalUpgradesPurchased: number;
  prestigeUpgrades: Record<string, number>;
  autoScrapsCount: number;
  autoScrapsShardsEarned: number;
  autoScrapSettings: {
    common: boolean;
    rare: boolean;
    epic: boolean;
    legendary: boolean;
    keepLegendarySubs: number; // 0 = disabled, 1 to 4 = required count of legendary substats to protect
    slots?: {
      weapon?: boolean;
      body?: boolean;
      boots?: boolean;
      ring?: boolean;
    };
  };
  overflowTalents?: {
    damage: number;
    drops: number;
    currency: number;
    crystals: number;
  };
  tempBagSlots?: number;
  equippedHeadId?: string;
  selectedCharacterClass?: string; // 'Shieldmaiden' | 'Ninja' | 'Samurai' | 'Ranger' | 'Pirate' | 'Mechanic' | 'GentlemanSpy'
  cloudUser?: { email: string; name: string; username: string; token: string } | null;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
}
