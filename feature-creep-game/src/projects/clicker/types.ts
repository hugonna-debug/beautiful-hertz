export type GameStage = 0 | 1 | 2 | 3 | 4 | 5;

export type AestheticTheme = 'terminal' | 'arcade' | 'vaporwave' | 'glassmorphic';

export interface AutoClicker {
  id: string;
  name: string;
  cost: number;
  baseCost: number;
  cps: number;
  count: number;
  description: string;
}

export interface RpgHero {
  level: number;
  xp: number;
  maxXp: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  gold: number; // premium currency from combat/stock conversions
  weapon: { name: string; cost: number; attackBonus: number };
  armor: { name: string; cost: number; defenseBonus: number };
}

export interface RpgEnemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  xpReward: number;
  goldReward: number;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  history: number[];
  volatility: number;
  drift: number;
}

export interface StockPortfolio {
  balance: number;
  shares: Record<string, number>;
}

export type GachaRarity = 'common' | 'rare' | 'legendary';

export interface DeveloperCard {
  id: string;
  name: string;
  rarity: GachaRarity;
  role: string;
  bonusText: string;
  clickMultiplier: number; // e.g. 1.2 (+20%)
  autoClickMultiplier: number; // e.g. 1.1 (+10%)
  rpgMultiplier: number; // e.g. 1.15 (+15%)
  color: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameSettings {
  gravity: number; // 0 to 10
  chaos: boolean; // HTML shaking/rotations
  volume: number; // 0 to 100
  bugSpawnerActive: boolean;
}

export interface WanderingBug {
  id: string;
  name: string;
  x: number; // percentage width
  y: number; // percentage height
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
}

export interface GameState {
  clicks: number; // Raw click count
  creep: number; // Main currency
  creepMultiplier: number; // Click multiplier
  stage: GameStage;
  theme: AestheticTheme;
  autoClickers: AutoClicker[];
  hero: RpgHero;
  activeEnemy: RpgEnemy | null;
  rpgLogs: string[];
  stocks: Stock[];
  portfolio: StockPortfolio;
  gachaCards: DeveloperCard[];
  achievements: Achievement[];
  settings: GameSettings;
  wanderingBugs: WanderingBug[];
  gachaPulls: number;
  gachaCost: number;
}
