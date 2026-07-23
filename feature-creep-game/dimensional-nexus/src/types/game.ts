export type HeroClass = 'paladin' | 'mech' | 'demigod' | 'hacker';

export type CombatMode = 'turn' | 'realtime' | 'auto';

export interface RpgSkill {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number; // in seconds
  currentCooldown: number; // in seconds
  type: 'damage' | 'heal' | 'shield' | 'status';
  power: number;
  branch: 'tactical' | 'speed' | 'utility';
  unlocked: boolean;
}

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export interface RpgItem {
  id: string;
  name: string;
  description: string;
  type: EquipmentSlot | 'consumable';
  attackBonus?: number;
  defenseBonus?: number;
  hpBonus?: number;
  critBonus?: number; // e.g. 0.08 (+8%)
  evadeBonus?: number; // e.g. 0.05 (+5%)
  effectType?: 'heal_hp' | 'heal_mana' | 'buff_speed';
  effectValue?: number;
  cost: number;
  count: number;
}

export interface PartyMember {
  id: string;
  name: string;
  role: string;
  attackContribution: number;
  buffDescription: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export interface RpgHero {
  name: string;
  class: HeroClass;
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  baseAttack: number;
  baseDefense: number;
  critRate: number; // 0.0 to 1.0
  evadeRate: number; // 0.0 to 1.0
  gold: number;
  equippedWeapon: RpgItem | null;
  equippedArmor: RpgItem | null;
  equippedAccessory: RpgItem | null;
  skills: RpgSkill[];
  inventory: RpgItem[];
  party: PartyMember[];
  combatPoints: {
    tactical: number; // gained by Turn-Based play
    speed: number;    // gained by Real-Time play
    utility: number;  // gained by Auto play
  };
}

export interface RpgEnemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  xpReward: number;
  goldReward: number;
  isBoss: boolean;
}

export interface DungeonStage {
  id: string;
  name: string;
  levelRecommended: number;
  unlocked: boolean;
  completed: boolean;
  enemies: string[];
  bossName: string;
}

export interface Dungeon {
  id: string;
  name: string;
  description: string;
  stages: DungeonStage[];
  completed: boolean;
}

export interface GameState {
  selectedClass: HeroClass | null;
  heroName: string;
  hero: RpgHero | null;
  activeEnemy: RpgEnemy | null;
  activeDungeonId: string;
  activeStageId: string;
  inCombat: boolean;
  combatMode: CombatMode;
  combatLogs: string[];
  dungeons: Dungeon[];
  partyPool: PartyMember[];
  difficultyTier: number;
}
