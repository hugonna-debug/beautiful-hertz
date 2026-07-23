import { GameState, Equipment, ItemSubstat, TalentNode, SubstatType } from '../types/game';

export const DEFAULT_TALENT_NODES: TalentNode[] = [
  // Obliteration (Offensive Tree)
  { id: 'o-atk', name: 'Primal Agility', description: 'Increases base Attack by +4% per level.', currentLevel: 0, maxLevel: 20, tree: 'obliteration', statType: 'percent_atk', valuePerLevel: 0.04 },
  { id: 'o-crit', name: 'Precision Strike', description: 'Increases Critical Hit Rate by +2% per level.', currentLevel: 0, maxLevel: 10, tree: 'obliteration', statType: 'crit_rate', valuePerLevel: 0.02 },
  { id: 'o-mult', name: 'Heavy Impact', description: 'Increases Critical Hit Damage by +10% per level.', currentLevel: 0, maxLevel: 15, tree: 'obliteration', statType: 'crit_dmg', valuePerLevel: 0.10 },
  { id: 'o-pen', name: 'Armor Breaker', description: 'Bypasses +3% enemy defense per level.', currentLevel: 0, maxLevel: 15, tree: 'obliteration', statType: 'armor_pen', valuePerLevel: 0.03 },

  // Bastion (Defensive Tree)
  { id: 'b-hp', name: 'Iron Constitution', description: 'Increases base Health by +6% per level.', currentLevel: 0, maxLevel: 20, tree: 'bastion', statType: 'percent_hp', valuePerLevel: 0.06 },
  { id: 'b-def', name: 'Steel Plating', description: 'Increases base Defense by +6% per level.', currentLevel: 0, maxLevel: 20, tree: 'bastion', statType: 'percent_def', valuePerLevel: 0.06 },
  { id: 'b-evade', name: 'Reflexive Dodge', description: 'Increases Dodge chance by +1.5% per level.', currentLevel: 0, maxLevel: 10, tree: 'bastion', statType: 'evade_rate', valuePerLevel: 0.015 },
  { id: 'b-regen', name: 'Vital Recup', description: 'Restores +0.5% max HP per second per level.', currentLevel: 0, maxLevel: 15, tree: 'bastion', statType: 'regen_hp', valuePerLevel: 0.005 },

  // Siphon (Utility / Elemental Tree)
  { id: 's-speed', name: 'Overcharge Core', description: 'Increases Action Attack Speed by +3% per level.', currentLevel: 0, maxLevel: 15, tree: 'siphon', statType: 'atk_speed', valuePerLevel: 0.03 },
  { id: 's-steal', name: 'Vampiric Touch', description: 'Restores Health equal to +1.5% damage dealt per level.', currentLevel: 0, maxLevel: 10, tree: 'siphon', statType: 'life_steal', valuePerLevel: 0.015 }
];

export const DEFAULT_PRESTIGE_UPGRADES: Record<string, number> = {
  atk: 0, def: 0, hp: 0, critDmg: 0, lifesteal: 0, hpRegen: 0, gold: 0, xp: 0, shards: 0,
  dropRate: 0, luck: 0,
  critRate: 0, atkSpeed: 0, armorPen: 0, evade: 0, absorb: 0,
  keepWeapon: 0, keepBody: 0, keepBoots: 0, keepRing: 0, multiScrap: 0, autoScrap: 0,
  substatSlot1: 0, substatSlot2: 0, substatSlot3: 0, substatSlot4: 0, keepXp: 0, bagSlots: 0
};

export const DEFAULT_AUTO_SCRAP_SETTINGS = {
  common: true,
  rare: false,
  epic: false,
  legendary: false,
  keepLegendarySubs: 0,
  slots: {
    weapon: true,
    body: true,
    boots: true,
    ring: true
  }
};

export const DEFAULT_OVERFLOW_TALENTS = {
  damage: 0,
  drops: 0,
  currency: 0,
  crystals: 0
};

export const DEFAULT_LPC_CHARACTER = {
  bodyType: 'none',
  skinTone: 'light',
  hairstyle: 'none',
  hairColor: 'black',
  torso: 'none',
  legs: 'none',
  pantsColor: 'default',
  shoes: 'none',
  headwear: 'none',
  feature: 'none',
  accessory: 'none',
  facialHair: 'none',
  expression: 'none',
  headModel: 'none',
  weapon: 'none'
};

export function migrateItem(item: any): Equipment | null {
  if (!item || typeof item !== 'object') return null;

  const itemLevel = Math.max(1, Number(item.itemLevel ?? item.level ?? 1) || 1);
  const enhanceLevel = Math.max(0, Number(item.enhanceLevel) || 0);
  const baseValue = Number.isFinite(Number(item.baseValue)) ? Number(item.baseValue) : 10;
  const slot = ['weapon', 'body', 'boots', 'ring'].includes(item.slot) ? item.slot : 'weapon';
  const rarity = ['common', 'rare', 'epic', 'legendary'].includes(item.rarity) ? item.rarity : 'common';
  const acquiredAt = Number.isFinite(Number(item.acquiredAt)) ? Number(item.acquiredAt) : Date.now();

  const validTypes: SubstatType[] = [
    'flat_hp', 'flat_def', 'percent_atk', 'percent_def', 'percent_hp',
    'crit_rate', 'crit_dmg', 'atk_speed', 'armor_pen', 'evade_rate',
    'life_steal', 'regen_hp'
  ];

  const cleanSubstats: ItemSubstat[] = [];
  if (Array.isArray(item.substats)) {
    for (const sub of item.substats) {
      if (sub && typeof sub === 'object') {
        const type: SubstatType = validTypes.includes(sub.type) ? sub.type : 'percent_atk';
        const val = Number.isFinite(Number(sub.value)) ? Number(sub.value) : 0.01;
        const locked = Boolean(sub.locked);
        const subRarity = ['common', 'rare', 'epic', 'legendary'].includes(sub.rarity) ? sub.rarity : rarity;
        cleanSubstats.push({ type, value: val, locked, rarity: subRarity });
      }
    }
  }

  delete item.level;

  return {
    id: item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: item.name || 'Unknown Relic',
    slot,
    itemLevel,
    enhanceLevel,
    baseValue,
    substats: cleanSubstats,
    setName: item.setName || undefined,
    rarity,
    acquiredAt,
    locked: Boolean(item.locked),
    sprite: typeof item.sprite === 'string' ? item.sprite : undefined
  };
}

export function sanitizeAndMigrateState(parsedInput: any, defaultStateTemplate?: GameState): GameState {
  let parsed = parsedInput;

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      parsed = null;
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    if (defaultStateTemplate) return defaultStateTemplate;
    parsed = {};
  }

  // Deep clone to avoid mutating input reference
  parsed = JSON.parse(JSON.stringify(parsed));

  // Clean null, undefined, NaN keys
  for (const key in parsed) {
    if (parsed[key] === null || parsed[key] === undefined || Number.isNaN(parsed[key])) {
      delete parsed[key];
    }
  }

  const level = Math.max(1, Math.floor(Number(parsed.level) || 1));
  const xp = Math.max(0, Math.floor(Number(parsed.xp) || 0));
  const maxXp = Math.max(100, Math.floor(Number(parsed.maxXp) || 100));
  const gold = Math.max(0, Math.floor(Number(parsed.gold) || 0));
  const reforgeShards = Math.max(0, Math.floor(Number(parsed.reforgeShards) || 0));
  const ascensionCrystals = Math.max(0, Math.floor(Number(parsed.ascensionCrystals) || 0));
  const totalCrystalsEarned = parsed.totalCrystalsEarned !== undefined
    ? Math.max(0, Math.floor(Number(parsed.totalCrystalsEarned) || 0))
    : ascensionCrystals;

  const activeStageId = Math.max(1, Math.floor(Number(parsed.activeStageId) || 1));
  const maxUnlockedStage = Math.max(activeStageId, Math.floor(Number(parsed.maxUnlockedStage) || 1));
  const difficultyTier = Math.max(1, Math.floor(Number(parsed.difficultyTier) || 1));

  // Prestige upgrades migration
  const mergedPrestigeUpgrades = { ...DEFAULT_PRESTIGE_UPGRADES };
  if (parsed.prestigeUpgrades && typeof parsed.prestigeUpgrades === 'object') {
    for (const k in parsed.prestigeUpgrades) {
      const val = Number(parsed.prestigeUpgrades[k]);
      if (Number.isFinite(val) && val >= 0) {
        mergedPrestigeUpgrades[k] = Math.floor(val);
      }
    }
  }

  // Talent nodes migration
  let migratedTalents: TalentNode[] = [];
  const parsedTalents = Array.isArray(parsed.talentNodes) ? parsed.talentNodes : [];
  migratedTalents = DEFAULT_TALENT_NODES.map(defNode => {
    const existing = parsedTalents.find((t: any) => t && t.id === defNode.id);
    const lvl = existing ? Math.max(0, Math.min(defNode.maxLevel, Math.floor(Number(existing.currentLevel) || 0))) : 0;
    return {
      ...defNode,
      currentLevel: lvl
    };
  });

  // Gear migration
  const equippedWeapon = migrateItem(parsed.equippedWeapon);
  const equippedBody = migrateItem(parsed.equippedBody);
  const equippedBoots = migrateItem(parsed.equippedBoots);
  const equippedRing = migrateItem(parsed.equippedRing);

  const rawBackpack = Array.isArray(parsed.lootBackpack) ? parsed.lootBackpack : [];
  const lootBackpack: Equipment[] = rawBackpack
    .map((item: any) => migrateItem(item))
    .filter((item: Equipment | null): item is Equipment => item !== null);

  // Auto scrap settings migration
  const mergedAutoScrap = {
    ...DEFAULT_AUTO_SCRAP_SETTINGS,
    ...(parsed.autoScrapSettings || {}),
    slots: {
      ...DEFAULT_AUTO_SCRAP_SETTINGS.slots,
      ...((parsed.autoScrapSettings && parsed.autoScrapSettings.slots) || {})
    }
  };

  // Overflow talents migration
  const mergedOverflow = {
    ...DEFAULT_OVERFLOW_TALENTS,
    ...(parsed.overflowTalents || {})
  };

  // LPC Character config migration - Clean slate (no legacy pants/body assets rendering)
  const mergedLpc = {
    ...DEFAULT_LPC_CHARACTER,
    ...(parsed.lpcCharacter || {}),
    legs: 'none',
    torso: 'none',
    shoes: 'none',
    bodyType: 'none',
    headModel: 'none',
    hairstyle: 'none',
    headwear: 'none',
    feature: 'none',
    accessory: 'none',
    facialHair: 'none',
    expression: 'none',
    weapon: 'none'
  };

  // DPS meter
  const dpsMeter = {
    dpsHistory: Array.isArray(parsed.dpsMeter?.dpsHistory) ? parsed.dpsMeter.dpsHistory.filter(Number.isFinite) : [],
    currentDps: Math.max(0, Number(parsed.dpsMeter?.currentDps) || 0),
    totalDamage: Math.max(0, Number(parsed.dpsMeter?.totalDamage) || 0),
    totalKills: Math.max(0, Number(parsed.dpsMeter?.totalKills) || 0)
  };

  const sanitizedState: GameState = {
    heroName: typeof parsed.heroName === 'string' && parsed.heroName.trim() ? parsed.heroName : 'Valiant Crusader',
    lpcCharacter: mergedLpc,
    level,
    xp,
    maxXp,
    gold,
    reforgeShards,
    ascensionCrystals,
    totalCrystalsEarned,
    activeDungeonId: typeof parsed.activeDungeonId === 'string' ? parsed.activeDungeonId : 'infinite',
    activeStageId,
    maxUnlockedStage,
    inCombat: true,
    autoAdvance: parsed.autoAdvance !== undefined ? Boolean(parsed.autoAdvance) : true,
    equippedWeapon,
    equippedBody,
    equippedBoots,
    equippedRing,
    equippedHeadId: typeof parsed.equippedHeadId === 'string' ? parsed.equippedHeadId : 'default',
    lootBackpack,
    talentNodes: migratedTalents,
    activeEnemy: null, // Always reset activeEnemy to null so combat safely spawns fresh enemy
    combatLogs: Array.isArray(parsed.combatLogs) ? parsed.combatLogs.filter((l: any) => typeof l === 'string') : ['Portal matrix initialized. Auto-clashing active.'],
    dpsMeter,
    difficultyTier,
    hero: null,
    darkMode: Boolean(parsed.darkMode),
    musicVolume: typeof parsed.musicVolume === 'number' ? Math.max(0, Math.min(100, parsed.musicVolume)) : 50,
    sfxVolume: typeof parsed.sfxVolume === 'number' ? Math.max(0, Math.min(100, parsed.sfxVolume)) : 50,
    hasPrestiged: Boolean(parsed.hasPrestiged),
    totalUpgradesPurchased: Math.max(0, Number(parsed.totalUpgradesPurchased) || 0),
    prestigeUpgrades: mergedPrestigeUpgrades,
    autoScrapsCount: Math.max(0, Number(parsed.autoScrapsCount) || 0),
    autoScrapsShardsEarned: Math.max(0, Number(parsed.autoScrapsShardsEarned) || 0),
    autoScrapSettings: mergedAutoScrap,
    overflowTalents: mergedOverflow,
    tempBagSlots: Math.max(0, Number(parsed.tempBagSlots) || 0),
    selectedCharacterClass: typeof parsed.selectedCharacterClass === 'string' ? parsed.selectedCharacterClass : undefined,
    cloudUser: parsed.cloudUser || null,
    syncStatus: parsed.syncStatus || 'idle'
  };

  return sanitizedState;
}
