import { useState, useEffect, useRef } from 'react';
import { GameState, RpgEnemy, Equipment, ItemSubstat, TalentNode, SubstatType, EquipmentSlot, DpsMeter } from '../types/game';
import { audioSynth } from '../utils/audio';
import { RING_CATALOG } from '../utils/ringCatalog';
import { sanitizeAndMigrateState } from '../utils/stateSanitizer.js';
import { safeJsonFetch } from '../utils/safeFetch';

// Constants for sub-stat rolling pools
export const SUBSTAT_RANGES: Record<SubstatType, { min: number; max: number; isPercent: boolean }> = {
  flat_hp: { min: 15, max: 100, isPercent: false },
  flat_def: { min: 2, max: 15, isPercent: false },
  percent_atk: { min: 0.03, max: 0.15, isPercent: true },
  percent_def: { min: 0.04, max: 0.15, isPercent: true },
  percent_hp: { min: 0.04, max: 0.18, isPercent: true },
  crit_rate: { min: 0.02, max: 0.10, isPercent: true },
  crit_dmg: { min: 0.10, max: 0.45, isPercent: true },
  atk_speed: { min: 0.03, max: 0.12, isPercent: true },
  armor_pen: { min: 0.02, max: 0.10, isPercent: true },
  evade_rate: { min: 0.02, max: 0.10, isPercent: true },
  life_steal: { min: 0.015, max: 0.08, isPercent: true },
  regen_hp: { min: 3, max: 20, isPercent: false }
};

import { ENEMY_SPECIES_MAP, FALLBACK_ENEMY_SPRITES, WEAPON_SPRITES, BODY_ARMOR_SPRITES, BOOTS_SPRITES } from '../data/minMaxLookup';

export const getEnemyForStage = (stage: number, tier: number): RpgEnemy => {
  const isBoss = stage % 10 === 0;

  // Base scaling
  const hpBase = 50 * Math.pow(1.14, stage - 1);
  const atkBase = 6 * Math.pow(1.09, stage - 1);
  const defBase = 2 * Math.pow(1.07, stage - 1);

  const tierHpMult = 1 + (tier - 1) * 0.5;
  const tierAtkMult = 1 + (tier - 1) * 0.4;

  let hp = Math.floor(hpBase * tierHpMult);
  let attack = Math.floor(atkBase * tierAtkMult);
  let defense = Math.floor(defBase);
  let absorb = Math.min(0.85, 0.05 + Math.floor(stage / 10) * 0.02);

  if (isBoss) {
    hp = Math.floor(hp * 1.6);
    attack = Math.floor(attack * 1.4);
    absorb = Math.min(0.85, absorb + 0.15);
  }

  hp = Math.max(10, Math.min(2000000000, hp));
  attack = Math.max(2, Math.min(50000000, attack));
  defense = Math.max(1, Math.min(20000000, defense));

  let name = '';
  if (isBoss) {
    const bossNames = [
      'Forest King Slime',
      'Mithril Mine Colossus',
      'Shadow Crypt Lich',
      'Solar Colosseum Champion',
      'Void City Architect',
      'Void Sovereign Devourer'
    ];
    const index = Math.min(bossNames.length - 1, Math.floor((stage - 1) / 10));
    name = bossNames[index] || `Nexus Overlord Tier ${Math.floor(stage / 10)}`;
  } else {
    const normalNames = [
      ['Forest Slime', 'Forest Wolf'],
      ['Cobalt Bat', 'Mithril Crawler'],
      ['Skeletal Knight', 'Ghost Spectre'],
      ['Solar Gladiator', 'Sun Griffin'],
      ['Cyber Drone', 'Mechatron Guard'],
      ['Astral Rift Eye', 'Void Sentinel']
    ];
    const groupIndex = Math.min(normalNames.length - 1, Math.floor((stage - 1) / 10));
    const pool = normalNames[groupIndex] || ['Cosmic Wyrm', 'Singularity Entity'];
    name = pool[Math.floor(Math.random() * pool.length)];
  }

  const xpReward = Math.floor((10 + stage * 3) * tierHpMult);
  const goldReward = Math.floor((6 + stage * 2) * tierHpMult);
  const shardsReward = isBoss ? 6 : Math.random() < 0.18 ? 2 : 0;

  // Instant O(1) Sprite Lookup from ENEMY_SPECIES_MAP
  let sprite: string | undefined = undefined;
  const nameKw = name.toLowerCase();
  for (const [kw, spriteUrl] of Object.entries(ENEMY_SPECIES_MAP)) {
    if (nameKw.includes(kw)) {
      sprite = spriteUrl;
      break;
    }
  }

  if (!sprite && FALLBACK_ENEMY_SPRITES.length > 0) {
    sprite = FALLBACK_ENEMY_SPRITES[(stage * 17) % FALLBACK_ENEMY_SPRITES.length];
  }

  return {
    name: `${name} (Stg ${stage})`,
    hp,
    maxHp: hp,
    attack,
    defense,
    absorb,
    xpReward,
    goldReward,
    shardsReward,
    isBoss,
    sprite
  };
};

const DEFAULT_TALENTS: TalentNode[] = [
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

const LOCAL_STORAGE_KEY = 'idle_stats_reforged_state';

// Helper to roll substats with rarities, influenced by item rarity
export const rollSubstatWithRarity = (
  type: SubstatType, 
  stage: number, 
  itemRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common',
  luckLevel = 0
): ItemSubstat => {
  const range = SUBSTAT_RANGES[type];
  const scaleFactor = 1 + Math.max(0, stage - 1) * 0.015;
  const rawBaseVal = (Math.random() * (range.max - range.min) + range.min) * scaleFactor;

  const rarityRoll = Math.random();
  let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
  let multiplier = 1.0;

  if (itemRarity === 'legendary') {
    const legThresh = Math.min(0.999, 0.30 + luckLevel * 0.002);
    const epicThresh = Math.min(0.999, 0.80 + luckLevel * 0.004);

    if (rarityRoll < legThresh) {
      rarity = 'legendary';
      multiplier = 2.2;
    } else if (rarityRoll < epicThresh) {
      rarity = 'epic';
      multiplier = 1.6;
    } else {
      rarity = 'rare';
      multiplier = 1.25;
    }
  } else if (itemRarity === 'epic') {
    const legThresh = Math.min(0.999, 0.10 + luckLevel * 0.002);
    const epicThresh = Math.min(0.999, 0.45 + luckLevel * 0.004);
    const rareThresh = Math.min(0.999, 0.85 + luckLevel * 0.006);

    if (rarityRoll < legThresh) {
      rarity = 'legendary';
      multiplier = 2.2;
    } else if (rarityRoll < epicThresh) {
      rarity = 'epic';
      multiplier = 1.6;
    } else if (rarityRoll < rareThresh) {
      rarity = 'rare';
      multiplier = 1.25;
    } else {
      rarity = 'common';
      multiplier = 1.0;
    }
  } else if (itemRarity === 'rare') {
    const legThresh = Math.min(0.999, 0.05 + luckLevel * 0.002);
    const epicThresh = Math.min(0.999, 0.20 + luckLevel * 0.004);
    const rareThresh = Math.min(0.999, 0.60 + luckLevel * 0.006);

    if (rarityRoll < legThresh) {
      rarity = 'legendary';
      multiplier = 2.2;
    } else if (rarityRoll < epicThresh) {
      rarity = 'epic';
      multiplier = 1.6;
    } else if (rarityRoll < rareThresh) {
      rarity = 'rare';
      multiplier = 1.25;
    } else {
      rarity = 'common';
      multiplier = 1.0;
    }
  } else {
    // Common item
    const legThresh = Math.min(0.999, 0.02 + luckLevel * 0.002);
    const epicThresh = Math.min(0.999, 0.10 + luckLevel * 0.004);
    const rareThresh = Math.min(0.999, 0.30 + luckLevel * 0.006);

    if (rarityRoll < legThresh) {
      rarity = 'legendary';
      multiplier = 2.2;
    } else if (rarityRoll < epicThresh) {
      rarity = 'epic';
      multiplier = 1.6;
    } else if (rarityRoll < rareThresh) {
      rarity = 'rare';
      multiplier = 1.25;
    } else {
      rarity = 'common';
      multiplier = 1.0;
    }
  }

  const getRarityMultiplier = (rar: 'common' | 'rare' | 'epic' | 'legendary') => {
    if (rar === 'legendary') return 2.2;
    if (rar === 'epic') return 1.6;
    if (rar === 'rare') return 1.25;
    return 1.0;
  };

  const substatMultiplier = multiplier;
  const equipMultiplier = getRarityMultiplier(itemRarity);

  const finalRawVal = rawBaseVal * substatMultiplier * equipMultiplier;
  const value = range.isPercent ? Number(finalRawVal.toFixed(3)) : Math.floor(finalRawVal);

  return { type, value, locked: false, rarity };
};

// Helper to roll substats with a fixed pre-existing rarity
export const rollSubstatWithFixedRarity = (
  type: SubstatType,
  stage: number,
  fixedRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common',
  itemRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common'
): ItemSubstat => {
  const range = SUBSTAT_RANGES[type];
  const scaleFactor = 1 + Math.max(0, stage - 1) * 0.015;
  const rawBaseVal = (Math.random() * (range.max - range.min) + range.min) * scaleFactor;

  const getRarityMultiplier = (rar: 'common' | 'rare' | 'epic' | 'legendary') => {
    if (rar === 'legendary') return 2.2;
    if (rar === 'epic') return 1.6;
    if (rar === 'rare') return 1.25;
    return 1.0;
  };

  const substatMultiplier = getRarityMultiplier(fixedRarity);
  const equipMultiplier = getRarityMultiplier(itemRarity);

  const finalRawVal = rawBaseVal * substatMultiplier * equipMultiplier;
  const value = range.isPercent ? Number(finalRawVal.toFixed(3)) : Math.floor(finalRawVal);

  return { type, value, locked: false, rarity: fixedRarity };
};

// Helper to roll random items scaling infinitely with Stage number
export const generateRandomLoot = (stage: number, slot?: EquipmentSlot, luckLevel = 0): Equipment => {
  const slots: EquipmentSlot[] = ['weapon', 'body', 'boots', 'ring'];
  const chosenSlot = slot || slots[Math.floor(Math.random() * slots.length)];

  const sets = [undefined, 'Warlord Set', 'Synthesizer Set', 'Cosmic Set'];
  const chosenSet = sets[Math.floor(Math.random() * sets.length)];

  // Determine Item Rarity
  // Every 10 stages is a boss fight (which spawns strictly superior items)
  const isBossFight = stage > 0 && stage % 10 === 0;
  const itemRarityRoll = Math.random();
  let itemRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
  let statMultiplier = 1.0;

  if (isBossFight) {
    const legThresh = Math.min(0.999, 0.15 + luckLevel * 0.002);
    const epicThresh = Math.min(0.999, 0.60 + luckLevel * 0.004);

    if (itemRarityRoll < legThresh) {
      itemRarity = 'legendary';
      statMultiplier = 2.2;
    } else if (itemRarityRoll < epicThresh) {
      itemRarity = 'epic';
      statMultiplier = 1.6;
    } else {
      itemRarity = 'rare';
      statMultiplier = 1.25;
    }
  } else {
    const legThresh = Math.min(0.999, 0.03 + luckLevel * 0.002);
    const epicThresh = Math.min(0.999, 0.15 + luckLevel * 0.004);
    const rareThresh = Math.min(0.999, 0.45 + luckLevel * 0.006);

    if (itemRarityRoll < legThresh) {
      itemRarity = 'legendary';
      statMultiplier = 2.2;
    } else if (itemRarityRoll < epicThresh) {
      itemRarity = 'epic';
      statMultiplier = 1.6;
    } else if (itemRarityRoll < rareThresh) {
      itemRarity = 'rare';
      statMultiplier = 1.25;
    }
  }

  // Scale baseValue with stage and item rarity multiplier
  let baseValue = 5;
  if (chosenSlot === 'weapon') baseValue = Math.floor((8 + stage * 2.5) * statMultiplier);
  else if (chosenSlot === 'body') baseValue = Math.floor((3 + stage * 1.2) * statMultiplier);
  else if (chosenSlot === 'boots') baseValue = Math.floor((25 + stage * 15) * statMultiplier);
  else baseValue = Number(((0.02 + stage * 0.0015) * statMultiplier).toFixed(4));

  const rolledSubstats: ItemSubstat[] = [];
  const statKeys = Object.keys(SUBSTAT_RANGES) as SubstatType[];
  const selectedTypes = new Set<SubstatType>();

  while (selectedTypes.size < 4) {
    const randomKey = statKeys[Math.floor(Math.random() * statKeys.length)];
    selectedTypes.add(randomKey);
  }

  selectedTypes.forEach(type => {
    rolledSubstats.push(rollSubstatWithRarity(type, stage, itemRarity, luckLevel));
  });

  const prefixes = ['Sharp', 'Sturdy', 'Mythic', 'Holographic', 'Hyper', 'Voided', 'Cosmic', 'Refined'];
  let name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${chosenSlot.charAt(0).toUpperCase() + chosenSlot.slice(1)}`;

  if (chosenSlot === 'ring') {
    const matchingRings = RING_CATALOG.filter(r => !r.rarity || r.rarity === itemRarity);
    const pool = matchingRings.length > 0 ? matchingRings : RING_CATALOG;
    const ringEntry = pool[Math.floor(Math.random() * pool.length)];
    name = ringEntry.name;
  }

  let sprite: string | undefined = undefined;
  if (chosenSlot === 'weapon' && WEAPON_SPRITES.length > 0) {
    const idx = Math.floor(Math.random() * WEAPON_SPRITES.length);
    sprite = WEAPON_SPRITES[idx];
  } else if (chosenSlot === 'body' && BODY_ARMOR_SPRITES.length > 0) {
    const idx = Math.floor(Math.random() * BODY_ARMOR_SPRITES.length);
    sprite = BODY_ARMOR_SPRITES[idx];
  } else if (chosenSlot === 'boots' && BOOTS_SPRITES.length > 0) {
    const idx = Math.floor(Math.random() * BOOTS_SPRITES.length);
    sprite = BOOTS_SPRITES[idx];
  }

  return {
    id: `loot-${Date.now()}-${Math.random()}`,
    name,
    slot: chosenSlot,
    itemLevel: stage,
    enhanceLevel: 0,
    baseValue,
    substats: rolledSubstats,
    setName: chosenSet,
    rarity: itemRarity,
    acquiredAt: Date.now() + Math.random(),
    sprite
  };
};

const getSessionId = () => {
  if (typeof window === 'undefined') return 'server_session';
  let id = sessionStorage.getItem('min_maxxed_session_id');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
    sessionStorage.setItem('min_maxxed_session_id', id);
  }
  return id;
};

const getDeviceName = () => {
  if (typeof navigator === 'undefined') return 'Web Device';
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'Mobile Device';
  if (/tablet|ipad/i.test(ua)) return 'Tablet Device';
  return 'Desktop Browser';
};

export const useGameState = () => {
  const [currentSessionId] = useState<string>(getSessionId);
  const [gameSuspended, setIsGameSuspended] = useState<boolean>(false);
  const [sessionConflict, setSessionConflict] = useState<{ mode: 'prompt' | 'suspended'; otherDeviceName?: string } | null>(null);

  const isSuspendedRef = useRef(gameSuspended);
  useEffect(() => {
    isSuspendedRef.current = gameSuspended;
  }, [gameSuspended]);

  const [state, setState] = useState<GameState>(() => {
    // Default state template helper
    const startWeapon = generateRandomLoot(1, 'weapon');
    startWeapon.id = 'wpn_starter_crusader_blade';
    startWeapon.name = 'Novice Crusader Blade';
    startWeapon.rarity = 'common';
    startWeapon.baseValue = 10;
    startWeapon.sprite = WEAPON_SPRITES[0];
    startWeapon.substats = [
      { type: 'percent_atk', value: 0.04, locked: false, rarity: 'common' },
      { type: 'crit_rate', value: 0.02, locked: false, rarity: 'common' },
      { type: 'flat_hp', value: 20, locked: false, rarity: 'common' },
      { type: 'flat_def', value: 1, locked: false, rarity: 'common' }
    ];

    const defaultState: GameState = {
      heroName: 'Valiant Crusader',
      lpcCharacter: {
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
      },
      level: 1,
      xp: 0,
      maxXp: 100,
      gold: 15,
      reforgeShards: 5,
      ascensionCrystals: 0,
      totalCrystalsEarned: 0,
      activeDungeonId: 'infinite',
      activeStageId: 1,
      maxUnlockedStage: 1,
      inCombat: true,
      autoAdvance: true,
      equippedWeapon: startWeapon,
      equippedBody: null,
      equippedBoots: null,
      equippedRing: null,
      equippedHeadId: 'default',
      lootBackpack: [],
      talentNodes: DEFAULT_TALENTS,
      activeEnemy: null,
      combatLogs: ['Portal matrix initialized. Auto-clashing active.'],
      dpsMeter: { dpsHistory: [], currentDps: 0, totalDamage: 0, totalKills: 0 },
      difficultyTier: 1,
      hero: null,
      darkMode: false,
      musicVolume: 50,
      sfxVolume: 50,
      hasPrestiged: false,
      totalUpgradesPurchased: 0,
      prestigeUpgrades: {
        atk: 0, def: 0, hp: 0, critDmg: 0, lifesteal: 0, hpRegen: 0, gold: 0, xp: 0, shards: 0,
        dropRate: 0, luck: 0,
        critRate: 0, atkSpeed: 0, armorPen: 0, evade: 0, absorb: 0,
        keepWeapon: 0, keepBody: 0, keepBoots: 0, keepRing: 0, multiScrap: 0, autoScrap: 0,
        substatSlot1: 0, substatSlot2: 0, substatSlot3: 0, substatSlot4: 0, keepXp: 0, bagSlots: 0
      },
      autoScrapsCount: 0,
      autoScrapsShardsEarned: 0,
      autoScrapSettings: {
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
      },
      overflowTalents: {
        damage: 0,
        drops: 0,
        currency: 0,
        crystals: 0
      },
      tempBagSlots: 0,
      cloudUser: null,
      syncStatus: 'idle'
    };

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return sanitizeAndMigrateState(saved, defaultState);
      }
    } catch (e) {
      console.error('Failed to load local state:', e);
    }

    return defaultState;
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Auto save
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const saveCloudData = async (currentState: GameState) => {
    if (!currentState.cloudUser || isSuspendedRef.current) return;
    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' as const }));
      const cleanState = sanitizeAndMigrateState(currentState);
      delete cleanState.cloudUser;
      
      const { ok, data, error } = await safeJsonFetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentState.cloudUser.token}`
        },
        body: JSON.stringify({ 
          email: currentState.cloudUser.email, 
          state: cleanState,
          sessionId: currentSessionId
        })
      });
      if (ok && data?.success) {
        setState(prev => ({ ...prev, syncStatus: 'synced' as const }));
      } else if (data?.conflict) {
        setIsGameSuspended(true);
        setSessionConflict({
          mode: 'suspended',
          otherDeviceName: data.otherDeviceName
        });
        setState(prev => ({ ...prev, syncStatus: 'error' as const }));
      } else {
        throw new Error(error || 'Save call failed');
      }
    } catch (e) {
      console.warn('Cloud save failed:', e);
      setState(prev => ({ ...prev, syncStatus: 'error' as const }));
    }
  };

  const claimActiveSession = async (userOverride?: { email: string; name: string; username: string; token: string }) => {
    const user = userOverride || stateRef.current.cloudUser;
    if (!user) return;

    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' as const }));
      const { ok, data } = await safeJsonFetch('/api/session/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          email: user.email,
          sessionId: currentSessionId,
          deviceName: getDeviceName()
        })
      });

      if (ok && data) {
        setIsGameSuspended(false);
        setSessionConflict(null);

        if (data.state) {
          const sanitizedCloudState = sanitizeAndMigrateState(data.state, stateRef.current);
          setState({
            ...sanitizedCloudState,
            cloudUser: user,
            syncStatus: 'synced' as const
          });
        } else {
          setState(prev => ({
            ...prev,
            cloudUser: user,
            syncStatus: 'synced' as const
          }));
        }
      }
    } catch (e) {
      console.error('Failed to claim active session:', e);
    }
  };

  const repairCloudAccount = async () => {
    // 1. Always repair local storage and current state
    const currentCleanState = sanitizeAndMigrateState(stateRef.current);
    setState(currentCleanState);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentCleanState));

    const user = stateRef.current.cloudUser;
    if (!user) {
      return { success: true, message: 'Local save data successfully cleaned, repaired, and updated!' };
    }

    try {
      setState(prev => ({ ...prev, syncStatus: 'syncing' as const }));
      const { ok, data, error } = await safeJsonFetch('/api/account/repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ email: user.email })
      });

      if (ok && data?.success) {
        const repairedState = sanitizeAndMigrateState(data.state || currentCleanState);
        setState({
          ...repairedState,
          cloudUser: user,
          syncStatus: 'synced' as const
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(repairedState));
        return { success: true, message: 'Google account & local save data successfully repaired and updated!' };
      } else {
        return { success: true, message: `Local save repaired. Cloud notice: ${error || data?.message || 'Sync offline'}` };
      }
    } catch (e: any) {
      console.error('Failed to repair cloud account:', e);
      return { success: true, message: 'Local save repaired. Network error syncing cloud.' };
    }
  };

  const loginCloudUser = async (user: { email: string; name: string; username: string; token: string }) => {
    setState(prev => ({ ...prev, cloudUser: user, syncStatus: 'syncing' as const }));
    
    try {
      const { ok, data } = await safeJsonFetch(`/api/load?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (ok && data) {
        if (data.activeSessionId && data.activeSessionId !== currentSessionId) {
          setSessionConflict({
            mode: 'prompt',
            otherDeviceName: data.activeSessionDevice || 'Another Device'
          });
          return;
        }

        await claimActiveSession(user);
        return;
      }
      
      await claimActiveSession(user);
    } catch (e) {
      console.warn('Cloud load failed, keeping local progress:', e);
      setState(prev => ({ ...prev, cloudUser: user, syncStatus: 'error' as const }));
    }
  };

  const cancelSessionPrompt = () => {
    setSessionConflict(null);
  };

  const logoutCloudUser = () => {
    setIsGameSuspended(false);
    setSessionConflict(null);
    setState(prev => ({
      ...prev,
      cloudUser: null,
      syncStatus: 'idle' as const
    }));
  };

  // Periodic cloud autosave
  useEffect(() => {
    if (!state.cloudUser || gameSuspended) return;
    
    const interval = setInterval(() => {
      saveCloudData(stateRef.current);
    }, 10000);

    return () => clearInterval(interval);
  }, [state.cloudUser, gameSuspended]);

  // Session Heartbeat polling
  useEffect(() => {
    if (!state.cloudUser || gameSuspended) return;

    const interval = setInterval(async () => {
      try {
        const { ok, data } = await safeJsonFetch('/api/session/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${stateRef.current.cloudUser?.token}`
          },
          body: JSON.stringify({
            email: stateRef.current.cloudUser?.email,
            sessionId: currentSessionId
          })
        });
        if (ok && data) {
          if (data.active === false) {
            setIsGameSuspended(true);
            setSessionConflict({
              mode: 'suspended',
              otherDeviceName: data.otherDeviceName
            });
          }
        }
      } catch (e) {
        // Silently ignore transient heartbeat failure
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [state.cloudUser, gameSuspended, currentSessionId]);

  // Reset Game
  const resetGame = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const startWeapon = generateRandomLoot(1, 'weapon');
    startWeapon.name = 'Rusty Gladius';
    startWeapon.rarity = 'common';
    startWeapon.baseValue = 10;
    startWeapon.substats = [
      { type: 'percent_atk', value: 0.04, locked: false, rarity: 'common' },
      { type: 'crit_rate', value: 0.02, locked: false, rarity: 'common' },
      { type: 'flat_hp', value: 20, locked: false, rarity: 'common' },
      { type: 'flat_def', value: 1, locked: false, rarity: 'common' }
    ];
    setState({
      heroName: 'Valiant Crusader',
      level: 1,
      xp: 0,
      maxXp: 100,
      gold: 15,
      reforgeShards: 5,
      ascensionCrystals: 0,
      totalCrystalsEarned: 0,
      activeDungeonId: 'infinite',
      activeStageId: 1,
      maxUnlockedStage: 1,
      inCombat: true,
      autoAdvance: true,
      equippedWeapon: startWeapon,
      equippedBody: null,
      equippedBoots: null,
      equippedRing: null,
      lootBackpack: [],
      talentNodes: DEFAULT_TALENTS,
      activeEnemy: null,
      combatLogs: ['Nexus rebooted.'],
      dpsMeter: { dpsHistory: [], currentDps: 0, totalDamage: 0, totalKills: 0 },
      hero: null,
      difficultyTier: 1,
      darkMode: false,
      musicVolume: 50,
      sfxVolume: 50,
      hasPrestiged: false,
      totalUpgradesPurchased: 0,
      prestigeUpgrades: {
        atk: 0, def: 0, hp: 0, critDmg: 0, lifesteal: 0, hpRegen: 0, gold: 0, xp: 0, shards: 0,
        dropRate: 0, luck: 0,
        critRate: 0, atkSpeed: 0, armorPen: 0, evade: 0, absorb: 0,
        keepWeapon: 0, keepBody: 0, keepBoots: 0, keepRing: 0, multiScrap: 0, autoScrap: 0,
        substatSlot1: 0, substatSlot2: 0, substatSlot3: 0, substatSlot4: 0, keepXp: 0
      },
      autoScrapsCount: 0,
      autoScrapsShardsEarned: 0,
      autoScrapSettings: {
        common: false,
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
      },
      overflowTalents: {
        damage: 0,
        drops: 0,
        currency: 0,
        crystals: 0
      }
    });
  };

  // Switch Stage
  const selectStage = (_zoneId: string, stageId: number) => {
    setState(prev => {
      if (stageId < 1 || stageId > prev.maxUnlockedStage) return prev;
      return {
        ...prev,
        activeStageId: stageId,
        activeEnemy: null,
        combatLogs: [...prev.combatLogs, `Navigated to Stage ${stageId}.`].slice(-30)
      };
    });
  };

  // Toggle Auto-Advance
  const toggleAutoAdvance = () => {
    setState(prev => ({
      ...prev,
      autoAdvance: !prev.autoAdvance
    }));
  };

  // Equip Gear
  const equipLoot = (lootId: string) => {
    setState(prev => {
      const itemIndex = prev.lootBackpack.findIndex(i => i.id === lootId);
      if (itemIndex === -1) return prev;

      const item = prev.lootBackpack[itemIndex];
      let nextBackpack = prev.lootBackpack.filter(i => i.id !== lootId);
      let nextWeapon = prev.equippedWeapon;
      let nextBody = prev.equippedBody;
      let nextBoots = prev.equippedBoots;
      let nextRing = prev.equippedRing;

      if (item.slot === 'weapon') {
        if (nextWeapon) nextBackpack.push(nextWeapon);
        nextWeapon = item;
      } else if (item.slot === 'body') {
        if (nextBody) nextBackpack.push(nextBody);
        nextBody = item;
      } else if (item.slot === 'boots') {
        if (nextBoots) nextBackpack.push(nextBoots);
        nextBoots = item;
      } else if (item.slot === 'ring') {
        if (nextRing) nextBackpack.push(nextRing);
        nextRing = item;
      }

      return {
        ...prev,
        equippedWeapon: nextWeapon,
        equippedBody: nextBody,
        equippedBoots: nextBoots,
        equippedRing: nextRing,
        lootBackpack: nextBackpack,
        combatLogs: [...prev.combatLogs, `Equipped ${item.name} into ${item.slot.toUpperCase()} slot.`].slice(-30)
      };
    });
  };

  // Scrap Loot for Gold/Shards
  const scrapLoot = (lootId: string) => {
    setState(prev => {
      const item = prev.lootBackpack.find(i => i.id === lootId);
      if (!item || item.locked) return prev;

      const scrapGold = 10 + item.itemLevel * 2;
      const scrapShards = item.setName ? 3 : 1;

      audioSynth.playScrap();
      return {
        ...prev,
        gold: prev.gold + scrapGold,
        reforgeShards: prev.reforgeShards + scrapShards,
        lootBackpack: prev.lootBackpack.filter(i => i.id !== lootId),
        combatLogs: [...prev.combatLogs, `Scrapped ${item.name} for ${scrapGold}g, ${scrapShards} reforge shards.`].slice(-30)
      };
    });
  };

  const toggleGearLock = (lootId: string) => {
    setState(prev => ({
      ...prev,
      lootBackpack: prev.lootBackpack.map(item => 
        item.id === lootId ? { ...item, locked: !item.locked } : item
      )
    }));
  };

  // Enhance Gear Level
  const enhanceGear = (slot: EquipmentSlot) => {
    setState(prev => {
      let item: Equipment | null = null;
      if (slot === 'weapon') item = prev.equippedWeapon;
      else if (slot === 'body') item = prev.equippedBody;
      else if (slot === 'boots') item = prev.equippedBoots;
      else if (slot === 'ring') item = prev.equippedRing;

      if (!item) return prev;

      // Enhance Gold cost formula
      const cost = Math.floor(25 * Math.pow(1.3, item.enhanceLevel));
      if (prev.gold < cost) return prev;

      audioSynth.playReforge();

      const upgraded: Equipment = {
        ...item,
        enhanceLevel: item.enhanceLevel + 1
      };

      return {
        ...prev,
        gold: prev.gold - cost,
        equippedWeapon: slot === 'weapon' ? upgraded : prev.equippedWeapon,
        equippedBody: slot === 'body' ? upgraded : prev.equippedBody,
        equippedBoots: slot === 'boots' ? upgraded : prev.equippedBoots,
        equippedRing: slot === 'ring' ? upgraded : prev.equippedRing,
        combatLogs: [...prev.combatLogs, `Enhanced equipped ${slot.toUpperCase()} to +${upgraded.enhanceLevel}.`].slice(-30)
      };
    });
  };

  const upgradeSubstat = (slot: EquipmentSlot, substatIndex: number) => {
    setState(prev => {
      let item: Equipment | null = null;
      if (slot === 'weapon') item = prev.equippedWeapon;
      else if (slot === 'body') item = prev.equippedBody;
      else if (slot === 'boots') item = prev.equippedBoots;
      else if (slot === 'ring') item = prev.equippedRing;

      if (!item) return prev;

      const sub = item.substats[substatIndex];
      if (!sub) return prev;

      const currentLvl = sub.level || 0;
      const capKey = `substatSlot${substatIndex + 1}`;
      const maxLvl = prev.prestigeUpgrades[capKey] || 0;

      if (currentLvl >= maxLvl) return prev;

      // Cost calculation: targetLevel * 10 equivalent enhance cost
      const targetLvl = currentLvl + 1;
      const equivEnhanceLevel = targetLvl * 10;
      const cost = Math.floor(25 * Math.pow(1.3, equivEnhanceLevel));

      if (prev.gold < cost) return prev;

      audioSynth.playReforge();

      const nextSubstats = item.substats.map((s, idx) => {
        if (idx === substatIndex) {
          return { ...s, level: targetLvl };
        }
        return s;
      });

      const updated: Equipment = { ...item, substats: nextSubstats };

      return {
        ...prev,
        gold: prev.gold - cost,
        equippedWeapon: slot === 'weapon' ? upgradedItem(prev.equippedWeapon, updated) : prev.equippedWeapon,
        equippedBody: slot === 'body' ? upgradedItem(prev.equippedBody, updated) : prev.equippedBody,
        equippedBoots: slot === 'boots' ? upgradedItem(prev.equippedBoots, updated) : prev.equippedBoots,
        equippedRing: slot === 'ring' ? upgradedItem(prev.equippedRing, updated) : prev.equippedRing,
        combatLogs: [...prev.combatLogs, `Upgraded substat slot ${substatIndex + 1} on ${slot.toUpperCase()} to Lv. ${targetLvl}.`].slice(-30)
      };
    });
  };

  // Toggle Substat Lock
  const toggleSubstatLock = (slot: EquipmentSlot, subIndex: number) => {
    setState(prev => {
      let item: Equipment | null = null;
      if (slot === 'weapon') item = prev.equippedWeapon;
      else if (slot === 'body') item = prev.equippedBody;
      else if (slot === 'boots') item = prev.equippedBoots;
      else if (slot === 'ring') item = prev.equippedRing;

      if (!item) return prev;

      const substats = item.substats.map((s, idx) => {
        if (idx === subIndex) return { ...s, locked: !s.locked };
        return s;
      });

      const updated: Equipment = { ...item, substats };

      return {
        ...prev,
        equippedWeapon: slot === 'weapon' ? updated : prev.equippedWeapon,
        equippedBody: slot === 'body' ? upgradedItem(prev.equippedBody, updated) : prev.equippedBody,
        equippedBoots: slot === 'boots' ? upgradedItem(prev.equippedBoots, updated) : prev.equippedBoots,
        equippedRing: slot === 'ring' ? upgradedItem(prev.equippedRing, updated) : prev.equippedRing
      };
    });
  };

  const upgradedItem = (cur: Equipment | null, target: Equipment) => {
    return cur?.id === target.id ? target : cur;
  };

  // Reforge Substats (Substat Rerolls)
  const reforgeSubstats = (slot: EquipmentSlot) => {
    setState(prev => {
      let item: Equipment | null = null;
      if (slot === 'weapon') item = prev.equippedWeapon;
      else if (slot === 'body') item = prev.equippedBody;
      else if (slot === 'boots') item = prev.equippedBoots;
      else if (slot === 'ring') item = prev.equippedRing;

      if (!item) return prev;

      // Cost calculation: 15 base reforge shards + 20 shards per locked substat
      const lockedCount = item.substats.filter(s => s.locked).length;
      const reforgeCost = 15 + lockedCount * 20;

      if (prev.reforgeShards < reforgeCost) return prev;

      // Compile a list of rolled types to avoid duplicates
      const lockedTypes = new Set<SubstatType>(
        item.substats.filter(s => s.locked).map(s => s.type)
      );

       const statKeys = Object.keys(SUBSTAT_RANGES) as SubstatType[];
      const reRolled = item.substats.map(s => {
        if (s.locked) return s;

        // Roll a unique substat type
        let selectedType = statKeys[Math.floor(Math.random() * statKeys.length)];
        while (lockedTypes.has(selectedType)) {
          selectedType = statKeys[Math.floor(Math.random() * statKeys.length)];
        }
        lockedTypes.add(selectedType);

        const rolled = rollSubstatWithFixedRarity(selectedType, item.itemLevel, s.rarity || 'common', item.rarity || 'common');
        return { ...rolled, level: s.level || 0 };
      });

      const updated: Equipment = { ...item, substats: reRolled };

      audioSynth.playReforge();

      return {
        ...prev,
        reforgeShards: prev.reforgeShards - reforgeCost,
        equippedWeapon: slot === 'weapon' ? upgradedItem(prev.equippedWeapon, updated) : prev.equippedWeapon,
        equippedBody: slot === 'body' ? upgradedItem(prev.equippedBody, updated) : prev.equippedBody,
        equippedBoots: slot === 'boots' ? upgradedItem(prev.equippedBoots, updated) : prev.equippedBoots,
        equippedRing: slot === 'ring' ? upgradedItem(prev.equippedRing, updated) : prev.equippedRing,
        combatLogs: [...prev.combatLogs, `Reforged substats on ${item.slot.toUpperCase()} for ${reforgeCost} shards.`].slice(-30)
      };
    });
  };

  // Allocate Talent Points
  const spendTalentPoint = (talentId: string) => {
    setState(prev => {
      const activeNode = prev.talentNodes.find(t => t.id === talentId);
      if (!activeNode) return prev;

      // Calculate total talent points spent vs level
      const totalSpent = prev.talentNodes.reduce((acc, t) => acc + t.currentLevel, 0);
      const currentOverflow = prev.overflowTalents || { damage: 0, drops: 0, currency: 0, crystals: 0 };
      const overflowSpent = currentOverflow.damage + currentOverflow.drops + currentOverflow.currency + currentOverflow.crystals;
      const availablePoints = (prev.level - 1) * 2 - (totalSpent + overflowSpent);

      if (availablePoints <= 0 || activeNode.currentLevel >= activeNode.maxLevel) return prev;

      const talentNodes = prev.talentNodes.map(t => {
        if (t.id === talentId) return { ...t, currentLevel: t.currentLevel + 1 };
        return t;
      });

      return {
        ...prev,
        talentNodes
      };
    });
  };

  const spendOverflowTalent = (key: 'damage' | 'drops' | 'currency' | 'crystals') => {
    setState(prev => {
      // Check if all core talents are maxed
      const coreTalentsMaxed = prev.talentNodes.every(t => t.currentLevel === t.maxLevel);
      if (!coreTalentsMaxed) return prev;

      const totalSpent = prev.talentNodes.reduce((acc, t) => acc + t.currentLevel, 0);
      const currentOverflow = prev.overflowTalents || { damage: 0, drops: 0, currency: 0, crystals: 0 };
      const overflowSpent = currentOverflow.damage + currentOverflow.drops + currentOverflow.currency + currentOverflow.crystals;
      const availablePoints = (prev.level - 1) * 2 - (totalSpent + overflowSpent);

      if (availablePoints <= 0) return prev;

      return {
        ...prev,
        overflowTalents: {
          ...currentOverflow,
          [key]: currentOverflow[key] + 1
        }
      };
    });
  };

  const buyTempBagSlot = () => {
    setState(prev => {
      const currentLevel = prev.tempBagSlots || 0;
      const cost = Math.floor(100 * Math.pow(1.2, currentLevel));
      if (prev.reforgeShards < cost) return prev;

      return {
        ...prev,
        reforgeShards: prev.reforgeShards - cost,
        tempBagSlots: currentLevel + 1,
        combatLogs: [...prev.combatLogs, `Purchased temporary inventory slot for ${cost} shards. Capacity is now ${30 + (prev.prestigeUpgrades?.bagSlots || 0) + currentLevel + 1}.`].slice(-30)
      };
    });
  };

  // Refund all Talent Points (Free Respec!)
  const refundAllTalents = () => {
    setState(prev => {
      const talentNodes = prev.talentNodes.map(t => ({ ...t, currentLevel: 0 }));
      return {
        ...prev,
        talentNodes,
        combatLogs: [...prev.combatLogs, 'Refunded all talent points. Talents respec completed.'].slice(-30)
      };
    });
  };

  // Ascension (Prestige Reset)
  const ascendHero = () => {
    const cur = stateRef.current;
    if (cur.maxUnlockedStage <= 50) return;

    // Yield Crystals: stage 50 completed = maxUnlockedStage >= 51
    const overflowCrystalsLevel = cur.overflowTalents?.crystals || 0;
    const crystalsMultiplier = 1 + overflowCrystalsLevel * 0.02;
    const crystalsReward = Math.floor((cur.maxUnlockedStage - 50) * crystalsMultiplier);
    const nextCrystals = cur.ascensionCrystals + crystalsReward;

    const resetGearPrestige = (item: Equipment | null): Equipment | null => {
      if (!item) return null;
      const resetSubstats = item.substats.map(sub => ({ ...sub, level: 0 }));
      return { ...item, enhanceLevel: 0, substats: resetSubstats };
    };

    // Calculate EXP Retention:
    const keepXpLvl = cur.prestigeUpgrades.keepXp || 0;
    const calculateCumulativeXp = (lvl: number, currentXp: number): number => {
      let total = currentXp;
      let maxXpForLvl = 100;
      for (let l = 1; l < lvl; l++) {
        total += maxXpForLvl;
        maxXpForLvl = Math.floor(maxXpForLvl * 1.5);
      }
      return total;
    };

    const totalCurrentXp = calculateCumulativeXp(cur.level, cur.xp);
    const retainedXp = Math.floor(totalCurrentXp * (keepXpLvl * 0.09));

    let startLvl = 1;
    let startXp = retainedXp;
    let startMaxXp = 100;
    while (startXp >= startMaxXp) {
      startXp -= startMaxXp;
      startLvl += 1;
      startMaxXp = Math.floor(startMaxXp * 1.5);
    }

    setState(prev => {
      const startWeapon = generateRandomLoot(1, 'weapon');
      startWeapon.name = 'Rusty Gladius';
      startWeapon.rarity = 'common';
      startWeapon.baseValue = 10;
      startWeapon.substats = [
        { type: 'percent_atk', value: 0.04, locked: false, rarity: 'common' },
        { type: 'crit_rate', value: 0.02, locked: false, rarity: 'common' },
        { type: 'flat_hp', value: 20, locked: false, rarity: 'common' },
        { type: 'flat_def', value: 1, locked: false, rarity: 'common' }
      ];

      return {
        ...prev,
        level: startLvl,
        xp: startXp,
        maxXp: startMaxXp,
        gold: 50,
        reforgeShards: 15,
        ascensionCrystals: nextCrystals,
        totalCrystalsEarned: prev.totalCrystalsEarned + crystalsReward,
        activeStageId: 1,
        maxUnlockedStage: 1,
        activeEnemy: null,
        talentNodes: DEFAULT_TALENTS, // resets spent talent points
        overflowTalents: { damage: 0, drops: 0, currency: 0, crystals: 0 },
        tempBagSlots: 0,
        lootBackpack: [], // clears backpack drops
        hasPrestiged: true, // Unlock the prestige tab permanent upgrades!
        equippedWeapon: prev.prestigeUpgrades.keepWeapon === 1 ? resetGearPrestige(prev.equippedWeapon) : startWeapon,
        equippedBody: prev.prestigeUpgrades.keepBody === 1 ? resetGearPrestige(prev.equippedBody) : null,
        equippedBoots: prev.prestigeUpgrades.keepBoots === 1 ? resetGearPrestige(prev.equippedBoots) : null,
        equippedRing: prev.prestigeUpgrades.keepRing === 1 ? resetGearPrestige(prev.equippedRing) : null,
        combatLogs: [...prev.combatLogs, `ASCENDED! Gained ${crystalsReward} Ascension Crystals. Permanent multipliers applied.`].slice(-30)
      };
    });
  };

  // Cheat Update hero
  const debugUpdateHero = (updates: Partial<GameState>) => {
    setState(prev => ({
      ...prev,
      ...updates
    }));
  };

  // ==========================================================================
  // MATHEMATICAL STATS SOLVER
  // ==========================================================================
  const resolveHeroStats = (): Record<string, number> => {
    const cur = stateRef.current;
    
    // Level scaling base stats
    const lvlMultiplier = 1 + (cur.level - 1) * 0.15;
    let baseHp = 100 * lvlMultiplier;
    let baseDef = 5 * lvlMultiplier;
    let baseAtk = 10 * lvlMultiplier;
    let critRate = 0.05;
    let critDmg = 1.50;
    let atkSpeed = 1.0;
    let armorPen = 0.0;
    let evadeRate = 0.04;
    let lifeSteal = 0.0;
    let flatRegen = 2.0;
    let percentRegen = 0.0;

    // 1. Accumulate Base stats from equipped gear with enhancement scaling
    if (cur.equippedWeapon) baseAtk += cur.equippedWeapon.baseValue * (1 + cur.equippedWeapon.enhanceLevel * 0.15);
    if (cur.equippedBody) baseDef += cur.equippedBody.baseValue * (1 + cur.equippedBody.enhanceLevel * 0.15);
    if (cur.equippedBoots) baseHp += cur.equippedBoots.baseValue * (1 + cur.equippedBoots.enhanceLevel * 0.15);
    if (cur.equippedRing) critRate += cur.equippedRing.baseValue * (1 + cur.equippedRing.enhanceLevel * 0.15);

    // 2. Accumulate Substats & Talents
    let sumFlatHp = 0;
    let sumFlatDef = 0;
    let sumPercentAtk = 0;
    let sumPercentDef = 0;
    let sumPercentHp = 0;
    
    const collectSubstat = (item: Equipment | null) => {
      if (!item) return;
      item.substats.forEach(sub => {
        const lvl = sub.level || 0;
        const scaleFactor = 1 + lvl * 0.15;
        const val = sub.value * scaleFactor;

        if (sub.type === 'flat_hp') sumFlatHp += val;
        else if (sub.type === 'flat_def') sumFlatDef += val;
        else if (sub.type === 'percent_atk') sumPercentAtk += val;
        else if (sub.type === 'percent_def') sumPercentDef += val;
        else if (sub.type === 'percent_hp') sumPercentHp += val;
        else if (sub.type === 'crit_rate') critRate += val;
        else if (sub.type === 'crit_dmg') critDmg += val;
        else if (sub.type === 'atk_speed') atkSpeed += val;
        else if (sub.type === 'armor_pen') armorPen += val;
        else if (sub.type === 'evade_rate') evadeRate += val;
        else if (sub.type === 'life_steal') lifeSteal += val;
        else if (sub.type === 'regen_hp') flatRegen += val;
      });
    };

    collectSubstat(cur.equippedWeapon);
    collectSubstat(cur.equippedBody);
    collectSubstat(cur.equippedBoots);
    collectSubstat(cur.equippedRing);

    // Apply spent Talents node modifiers
    cur.talentNodes.forEach(node => {
      const nodeValue = node.currentLevel * node.valuePerLevel;
      if (node.statType === 'percent_atk') sumPercentAtk += nodeValue;
      else if (node.statType === 'percent_hp') sumPercentHp += nodeValue;
      else if (node.statType === 'percent_def') sumPercentDef += nodeValue;
      else if (node.statType === 'crit_rate') critRate += nodeValue;
      else if (node.statType === 'crit_dmg') critDmg += nodeValue;
      else if (node.statType === 'armor_pen') armorPen += nodeValue;
      else if (node.statType === 'evade_rate') evadeRate += nodeValue;
      else if (node.statType === 'regen_hp') percentRegen += nodeValue;
      else if (node.statType === 'atk_speed') atkSpeed += nodeValue;
      else if (node.statType === 'life_steal') lifeSteal += nodeValue;
    });

    // Prestige Upgrades calculations
    const pUp = cur.prestigeUpgrades || {};
    sumPercentAtk += (pUp.atk || 0) * 0.05;
    sumPercentDef += (pUp.def || 0) * 0.05;
    sumPercentHp += (pUp.hp || 0) * 0.05;
    critDmg += (pUp.critDmg || 0) * 0.10;
    lifeSteal += (pUp.lifesteal || 0) * 0.01;
    percentRegen += (pUp.hpRegen || 0) * 0.005;

    critRate += (pUp.critRate || 0) * 0.01;
    atkSpeed += (pUp.atkSpeed || 0) * 0.01;
    armorPen += (pUp.armorPen || 0) * 0.01;
    evadeRate += (pUp.evade || 0) * 0.01;

    // 3. Set Gear Sets bonuses checks
    const equipped = [cur.equippedWeapon, cur.equippedBody, cur.equippedBoots, cur.equippedRing].filter(Boolean) as Equipment[];
    const setCounts: Record<string, number> = {};
    equipped.forEach(eq => {
      if (eq.setName) setCounts[eq.setName] = (setCounts[eq.setName] || 0) + 1;
    });

    let damageAbsorb = 0.0;

    Object.entries(setCounts).forEach(([setName, count]) => {
      if (setName === 'Warlord Set') {
        if (count >= 2) critDmg += 0.20; // +20% Crit Dmg
        if (count >= 4) atkSpeed += 0.15; // +15% Speed
      } else if (setName === 'Synthesizer Set') {
        if (count >= 2) armorPen += 0.15; // +15% Pen
        if (count >= 4) evadeRate += 0.08; // +8% Evade
      } else if (setName === 'Cosmic Set') {
        if (count >= 2) lifeSteal += 0.08; // +8% Lifesteal
        if (count >= 4) damageAbsorb += 0.15; // +15% Damage Absorb
      }
    });

    damageAbsorb += (pUp.absorb || 0) * 0.01;

    // 4. Resolve crystal prestige multipliers
    const prestigeMultiplier = 1 + (cur.totalCrystalsEarned || 0) * 0.005;

    const finalHp = Math.floor((baseHp + sumFlatHp) * (1 + sumPercentHp) * prestigeMultiplier);
    const finalRegen = flatRegen + finalHp * percentRegen;
    const finalDef = Math.floor((baseDef + sumFlatDef) * (1 + sumPercentDef));
    const finalAtk = Math.floor(baseAtk * (1 + sumPercentAtk) * prestigeMultiplier);

    const baseAttackVal = Math.floor(baseAtk * (1 + sumPercentAtk));
    const prestigeAttackBonusVal = finalAtk - baseAttackVal;

    const baseHpVal = Math.floor((baseHp + sumFlatHp) * (1 + sumPercentHp));
    const prestigeHpBonusVal = finalHp - baseHpVal;

    const finalGoldMult = (1 + (pUp.gold || 0) * 0.10) * prestigeMultiplier;
    const baseGoldMult = 1 + (pUp.gold || 0) * 0.10;

    const finalXpMult = (1 + (pUp.xp || 0) * 0.10) * prestigeMultiplier;
    const baseXpMult = 1 + (pUp.xp || 0) * 0.10;

    const finalShardsMult = (1 + (pUp.shards || 0) * 0.10) * prestigeMultiplier;
    const baseShardsMult = 1 + (pUp.shards || 0) * 0.10;

    return {
      attack: finalAtk,
      baseAttack: baseAttackVal,
      prestigeAttackBonus: prestigeAttackBonusVal,
      defense: finalDef,
      maxHp: finalHp,
      baseMaxHp: baseHpVal,
      prestigeHpBonus: prestigeHpBonusVal,
      goldMultiplier: finalGoldMult,
      baseGoldMultiplier: baseGoldMult,
      xpMultiplier: finalXpMult,
      baseXpMultiplier: baseXpMult,
      shardsMultiplier: finalShardsMult,
      baseShardsMultiplier: baseShardsMult,
      critRate: Number(critRate.toFixed(3)),
      critDmg: Number(critDmg.toFixed(3)),
      atkSpeed: Number(Math.min(3.5, atkSpeed).toFixed(3)),
      armorPen: Number(Math.min(0.95, armorPen).toFixed(3)),
      evadeRate: Number(Math.min(0.75, evadeRate).toFixed(3)),
      lifeSteal: Number(Math.min(0.8, lifeSteal).toFixed(3)),
      regenHp: Number(finalRegen.toFixed(1)),
      damageAbsorb: Number(damageAbsorb.toFixed(3))
    };
  };

  // --- INTERVAL TICKS FOR COMBAT CORE ENGINE ---
  useEffect(() => {
    let tickCounter = 0;

    const interval = setInterval(() => {
      const cur = stateRef.current;
      if (!cur.inCombat || isSuspendedRef.current) return;

      const heroStats = resolveHeroStats();

      // Ensure active enemy exists, else spawn
      let nextEnemy = cur.activeEnemy;
      const stage = cur.activeStageId;

      if (!nextEnemy) {
        nextEnemy = getEnemyForStage(stage, cur.difficultyTier);

        setState(prev => ({
          ...prev,
          activeEnemy: nextEnemy,
          combatLogs: [...prev.combatLogs, `Manifested combat threat: ${nextEnemy?.name}.`].slice(-30)
        }));
        return;
      }

      // Track tick triggers
      tickCounter++;

      let nextHero = cur.hero || { hp: heroStats.maxHp };
      // Sync hero current HP if level up or stats exceed max
      if (nextHero.hp > heroStats.maxHp) nextHero.hp = heroStats.maxHp;

      let nextLogs = [...cur.combatLogs];
      let endCombat = false;
      let nextDpsHistory = [...cur.dpsMeter.dpsHistory];
      let totalKills = cur.dpsMeter.totalKills;
      let totalDamage = cur.dpsMeter.totalDamage;

      // 1. Passive Health Regeneration (triggers once per second = every 10 ticks)
      if (tickCounter % 10 === 0 && nextHero.hp < heroStats.maxHp) {
        nextHero.hp = Math.min(heroStats.maxHp, nextHero.hp + heroStats.regenHp);
      }

      // 2. Hero Action swing Ticks
      // actions speed interval triggers: e.g. speed = 1.0 Action/s means swing every 10 ticks (1s)
      const ticksPerAction = Math.max(3, Math.floor(10 / heroStats.atkSpeed));
      if (tickCounter % ticksPerAction === 0) {
        let baseDamage = heroStats.attack;
        let isCrit = false;
        let isBonusCrit = false;
        let thresholds = 0;

        if (heroStats.critRate < 1.0) {
          isCrit = Math.random() < heroStats.critRate;
          if (isCrit) {
            baseDamage = Math.floor(baseDamage * heroStats.critDmg);
          }
        } else {
          isCrit = true; // 100% guaranteed crit
          thresholds = Math.floor(heroStats.critRate);

          let currentCritDmg = heroStats.critDmg;
          let currentBonusCritDmg = currentCritDmg / 2;

          for (let t = 2; t <= thresholds; t++) {
            const newCritDmg = currentCritDmg + currentBonusCritDmg;
            currentBonusCritDmg = newCritDmg / 2;
            currentCritDmg = newCritDmg;
          }

          // Apply primary critical damage multiplier
          baseDamage = Math.floor(baseDamage * currentCritDmg);

          // Chance for bonus crit damage is the remainder percentage
          const remainderChance = heroStats.critRate - thresholds;
          isBonusCrit = Math.random() < remainderChance;

          if (isBonusCrit) {
            baseDamage = Math.floor(baseDamage * currentBonusCritDmg);
          }
        }

        if (isCrit) {
          audioSynth.playCrit();
        } else {
          audioSynth.playHit();
        }

        // Armor Penetration check: ignores flat defense
        const effectiveDefense = Math.max(0, Math.floor(nextEnemy.defense * (1 - heroStats.armorPen)));
        const flatDamage = Math.max(1, baseDamage - effectiveDefense);
        
        // Damage absorption check
        const damageMultiplier = 1 + (cur.overflowTalents?.damage || 0) * 0.02;
        const finalDamage = Math.max(1, Math.floor(flatDamage * (1 - nextEnemy.absorb) * damageMultiplier));
        nextEnemy.hp = Math.max(0, nextEnemy.hp - finalDamage);

        // Lifesteal calculation
        const heal = Math.floor(finalDamage * heroStats.lifeSteal);
        if (heal > 0) {
          nextHero.hp = Math.min(heroStats.maxHp, nextHero.hp + heal);
        }

        // Register in DPS history
        nextDpsHistory.push(finalDamage);
        totalDamage += finalDamage;

        if (Math.random() < 0.3 || isCrit) {
          let critSuffix = '';
          if (isCrit) {
            if (thresholds >= 1) {
              critSuffix = ` (CRIT! x${thresholds + 1}${isBonusCrit ? ' + BONUS CRIT!' : ''})`;
            } else {
              critSuffix = ' (CRIT!)';
            }
          }
          nextLogs.push(`Hero attacks: Dealt ${finalDamage} damage to ${nextEnemy.name}.${critSuffix} ${heal > 0 ? `+${heal} HP stolen.` : ''}`);
        }
      }

      // 3. Enemy Action swing Ticks (Enemy swings once per 1.2s = every 12 ticks)
      if (tickCounter % 12 === 0 && nextEnemy.hp > 0) {
        const isEvaded = Math.random() < heroStats.evadeRate;

        if (isEvaded) {
          audioSynth.playEvade();
          nextLogs.push(`💨 Evaded attack from ${nextEnemy.name}!`);
        } else {
          audioSynth.playHit();
          // Flat defense reduction
          const flatDamage = Math.max(1, nextEnemy.attack - heroStats.defense);
          // Hero damage absorption reduction
          const finalDamage = Math.max(1, Math.floor(flatDamage * (1 - heroStats.damageAbsorb)));

          nextHero.hp = Math.max(0, nextHero.hp - finalDamage);
          nextLogs.push(`💥 ${nextEnemy.name} strikes Hero for ${finalDamage} damage.`);
        }
      }

      // 4. Clean up DPS history older than 5 seconds (50 ticks)
      if (nextDpsHistory.length > 50) {
        nextDpsHistory = nextDpsHistory.slice(-50);
      }

      const sumDps = nextDpsHistory.reduce((acc, v) => acc + v, 0);
      const currentDps = Math.floor(sumDps / 5);

      // Check success / defeat resolutions
      let nextGold = cur.gold;
      let nextShards = cur.reforgeShards;
      let nextXp = cur.xp;
      let nextLvl = cur.level;
      let nextMaxXp = cur.maxXp;
      let nextStageId = cur.activeStageId;
      let nextZoneId = cur.activeDungeonId;
      let lootBackpack = [...cur.lootBackpack];
      let difficultyTier = cur.difficultyTier;

      if (nextHero.hp <= 0) {
        // Defeat fallback farming loop!
        const fallbackStage = Math.max(1, nextStageId - 1);
        nextLogs.push(`💀 DEFEATED! Restoring stats and falling back to Stage ${fallbackStage}.`);
        nextHero.hp = heroStats.maxHp;
        nextEnemy = null;
        nextStageId = fallbackStage;

        setState(prev => ({
          ...prev,
          activeStageId: nextStageId,
          hero: { hp: nextHero.hp },
          activeEnemy: nextEnemy,
          combatLogs: nextLogs.slice(-30),
          dpsMeter: {
            dpsHistory: nextDpsHistory,
            currentDps,
            totalDamage,
            totalKills
          }
        }));
        return;
      } else if (nextEnemy.hp <= 0) {
        // Victory!
        totalKills += 1;
        nextLogs.push(`🏆 Banished ${nextEnemy.name}!`);
        
        const prestigeMultiplier = 1 + (cur.totalCrystalsEarned || 0) * 0.005;
        const overflowCurrencyLvl = cur.overflowTalents?.currency || 0;
        const currencyMultiplier = 1 + overflowCurrencyLvl * 0.02;

        const goldMultiplier = (1 + (cur.prestigeUpgrades?.gold || 0) * 0.10) * prestigeMultiplier * currencyMultiplier;
        const shardsMultiplier = (1 + (cur.prestigeUpgrades?.shards || 0) * 0.10) * prestigeMultiplier * currencyMultiplier;
        const xpMultiplier = (1 + (cur.prestigeUpgrades?.xp || 0) * 0.10) * prestigeMultiplier;

        nextGold += Math.floor(nextEnemy.goldReward * goldMultiplier);
        nextShards += Math.floor(nextEnemy.shardsReward * shardsMultiplier);
        nextXp += Math.floor(nextEnemy.xpReward * xpMultiplier);

        let addedAutoScrapsCount = 0;
        let addedAutoScrapsShardsEarned = 0;

        // Loot drop chance (15% normal monster, 100% Boss)
        const overflowDropsLvl = cur.overflowTalents?.drops || 0;
        const dropsMultiplier = 1 + overflowDropsLvl * 0.02;

        const dropRateUpgrade = cur.prestigeUpgrades?.dropRate || 0;
        const dropRateMultiplier = 1 + dropRateUpgrade * 0.01;
        const finalDropChance = 0.15 * dropRateMultiplier * dropsMultiplier;

        const dropRoll = Math.random() < finalDropChance || nextEnemy.isBoss;
        const maxBagSlots = 30 + (cur.prestigeUpgrades?.bagSlots || 0) + (cur.tempBagSlots || 0);
        if (dropRoll && lootBackpack.length < maxBagSlots) {
          const luckUpgrade = cur.prestigeUpgrades?.luck || 0;
          const effectiveLuck = Math.floor((luckUpgrade + overflowDropsLvl * 2) * dropsMultiplier);
          const loot = generateRandomLoot(nextStageId, undefined, effectiveLuck);
          
          const hasAutoScrap = cur.prestigeUpgrades?.autoScrap === 1;
          let shouldAutoScrap = false;
          if (hasAutoScrap) {
            const settings = cur.autoScrapSettings || {};
            const itemRarity = loot.rarity || 'common';
            const rarityMatch = 
              (itemRarity === 'common' && settings.common) ||
              (itemRarity === 'rare' && settings.rare) ||
              (itemRarity === 'epic' && settings.epic) ||
              (itemRarity === 'legendary' && settings.legendary);

            const itemSlots = settings.slots || { weapon: true, body: true, boots: true, ring: true };
            const slotMatch = itemSlots[loot.slot] !== false;

            const filterMatch = rarityMatch && slotMatch;

            const legendarySubstatsCount = loot.substats.filter(s => s.rarity === 'legendary').length;
            const requiredCount = settings.keepLegendarySubs || 0;
            const skipScrap = requiredCount > 0 && legendarySubstatsCount >= requiredCount;

            if (filterMatch && !skipScrap) {
              shouldAutoScrap = true;
            }
          }

          if (shouldAutoScrap) {
            const scrapGold = 10 + loot.itemLevel * 2;
            const scrapShards = loot.setName ? 3 : 1;
            const finalGoldReward = Math.floor(scrapGold * goldMultiplier);
            const finalShardsReward = Math.floor(scrapShards * shardsMultiplier);

            nextGold += finalGoldReward;
            nextShards += finalShardsReward;
            addedAutoScrapsCount = 1;
            addedAutoScrapsShardsEarned = finalShardsReward;

            audioSynth.playScrap();
            nextLogs.push(`🤖 Auto-Scrapped ${loot.name} for ${finalGoldReward}g, ${finalShardsReward} shards.`);
          } else {
            lootBackpack.push(loot);
            audioSynth.playLoot();
            nextLogs.push(`🎁 Loot Drop: Secured ${loot.name}!`);
          }
        }

        // Level up checks
        if (nextXp >= nextMaxXp) {
          nextLvl += 1;
          nextXp = nextXp - nextMaxXp;
          nextMaxXp = Math.floor(nextMaxXp * 1.5);
          nextHero.hp = heroStats.maxHp; // full heals
          audioSynth.playLevelUp();
          nextLogs.push(`📈 LEVEL UP! Valiant Crusader reached Level ${nextLvl}!`);
        }

        nextEnemy = null;

        // Auto-advance checks and max stage unlocks
        let maxUnlockedStage = cur.maxUnlockedStage;
        if (nextStageId === maxUnlockedStage) {
          maxUnlockedStage += 1;
          nextLogs.push(`🔓 Stage ${maxUnlockedStage} unlocked!`);
        }

        if (cur.autoAdvance) {
          nextStageId += 1;
        }

        setState(prev => ({
          ...prev,
          gold: nextGold,
          reforgeShards: nextShards,
          xp: nextXp,
          level: nextLvl,
          maxXp: nextMaxXp,
          activeStageId: nextStageId,
          maxUnlockedStage,
          lootBackpack,
          difficultyTier,
          autoScrapsCount: prev.autoScrapsCount + addedAutoScrapsCount,
          autoScrapsShardsEarned: prev.autoScrapsShardsEarned + addedAutoScrapsShardsEarned,
          hero: { hp: nextHero.hp },
          activeEnemy: nextEnemy,
          combatLogs: nextLogs.slice(-30),
          dpsMeter: {
            dpsHistory: nextDpsHistory,
            currentDps,
            totalDamage,
            totalKills
          }
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        hero: { hp: nextHero.hp },
        activeEnemy: nextEnemy,
        combatLogs: nextLogs.slice(-30),
        dpsMeter: {
          dpsHistory: nextDpsHistory,
          currentDps,
          totalDamage,
          totalKills
        }
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Initial audio volume sync on startup
    audioSynth.setVolume(stateRef.current.musicVolume, stateRef.current.sfxVolume);
  }, []);

  const buyPrestigeUpgrade = (key: string) => {
    setState(prev => {
      const currentLevel = prev.prestigeUpgrades[key] || 0;
      
      // Check cap limit rules
      const caps: Record<string, number> = {
        atkSpeed: 30, armorPen: 50, evade: 25, absorb: 40,
        keepWeapon: 1, keepBody: 1, keepBoots: 1, keepRing: 1, multiScrap: 1, autoScrap: 1,
        keepXp: 10
      };
      const cap = caps[key];
      if (cap !== undefined && currentLevel >= cap) return prev;

      // Calculate purchase price
      const basePrices: Record<string, number> = {
        atk: 1, def: 1, hp: 1, critDmg: 2, lifesteal: 2, hpRegen: 1, gold: 2, xp: 2, shards: 2,
        dropRate: 2, luck: 2,
        critRate: 4, atkSpeed: 4, armorPen: 4, evade: 4, absorb: 4,
        keepWeapon: 15, keepBody: 15, keepBoots: 15, keepRing: 15, multiScrap: 10, autoScrap: 20,
        substatSlot1: 5, substatSlot2: 5, substatSlot3: 5, substatSlot4: 5, keepXp: 40, bagSlots: 2
      };
      const basePrice = basePrices[key] || 1;
      const levelMultiplier = Math.pow(1.2, currentLevel);
      const rawBaseCost = Math.floor(basePrice * levelMultiplier);
      const cost = Math.floor(rawBaseCost * (1 + prev.totalUpgradesPurchased * 0.10));

      if (prev.ascensionCrystals < cost) return prev;

      audioSynth.playReforge();
      
      return {
        ...prev,
        ascensionCrystals: prev.ascensionCrystals - cost,
        totalUpgradesPurchased: prev.totalUpgradesPurchased + 1,
        prestigeUpgrades: {
          ...prev.prestigeUpgrades,
          [key]: currentLevel + 1
        },
        combatLogs: [...prev.combatLogs, `Purchased Prestige Upgrade: ${key.toUpperCase()} Lvl ${currentLevel + 1} for ${cost} crystals.`].slice(-30)
      };
    });
  };

  const updateAutoScrapSettings = (settings: Partial<GameState['autoScrapSettings']>) => {
    setState(prev => ({
      ...prev,
      autoScrapSettings: {
        ...prev.autoScrapSettings,
        ...settings,
        slots: {
          ...(prev.autoScrapSettings?.slots || { weapon: true, body: true, boots: true, ring: true }),
          ...(settings.slots || {})
        }
      }
    }));
  };

  const scrapAllLoot = (slot: EquipmentSlot) => {
    setState(prev => {
      if (prev.prestigeUpgrades.multiScrap !== 1) return prev;
      
      const filteredBackpack = prev.lootBackpack.filter(item => item.slot === slot && !item.locked);
      if (filteredBackpack.length === 0) return prev;

      let gainedGold = 0;
      let gainedShards = 0;

      filteredBackpack.forEach(item => {
        gainedGold += 10 + item.itemLevel * 2;
        gainedShards += item.setName ? 3 : 1;
      });

      const prestigeMultiplier = 1 + (prev.totalCrystalsEarned || 0) * 0.005;
      const goldMultiplier = (1 + (prev.prestigeUpgrades?.gold || 0) * 0.10) * prestigeMultiplier;
      const shardsMultiplier = (1 + (prev.prestigeUpgrades?.shards || 0) * 0.10) * prestigeMultiplier;

      const finalGoldGained = Math.floor(gainedGold * goldMultiplier);
      const finalShardsGained = Math.floor(gainedShards * shardsMultiplier);

      audioSynth.playScrap();

      return {
        ...prev,
        gold: prev.gold + finalGoldGained,
        reforgeShards: prev.reforgeShards + finalShardsGained,
        lootBackpack: prev.lootBackpack.filter(item => item.slot !== slot || item.locked),
        combatLogs: [...prev.combatLogs, `Scrapped ALL ${filteredBackpack.length} unlocked ${slot.toUpperCase()}s for ${finalGoldGained}g, ${finalShardsGained} shards.`].slice(-30)
      };
    });
  };

  const updateSettings = (settings: { darkMode?: boolean; musicVolume?: number; sfxVolume?: number }) => {
    setState(prev => {
      const merged = { ...prev, ...settings };
      audioSynth.setVolume(merged.musicVolume, merged.sfxVolume);
      return merged;
    });
  };

  const equipCustomHead = (headId: string) => {
    setState(prev => ({
      ...prev,
      equippedHeadId: headId
    }));
    audioSynth.playClick();
  };

  const selectCharacterClass = (clsName: string) => {
    setState(prev => ({
      ...prev,
      selectedCharacterClass: clsName
    }));
    audioSynth.playClick();
  };

  const updateLpcCharacter = (config: Partial<import('../types/game').LpcCharacterConfig>) => {
    setState(prev => {
      const current = prev.lpcCharacter || {
        bodyType: 'none',
        skinTone: 'light',
        hairstyle: 'none',
        hairColor: 'black',
        torso: 'none',
        legs: 'none',
        shoes: 'none',
        headwear: 'none',
        feature: 'none',
        accessory: 'none',
        facialHair: 'none',
        expression: 'none',
        weapon: 'none'
      };
      return {
        ...prev,
        equippedHeadId: (config.headwear === 'none' || config.headwear) ? 'default' : prev.equippedHeadId,
        lpcCharacter: {
          ...current,
          ...config
        }
      };
    });
    audioSynth.playClick();
  };

  return {
    state,
    updateLpcCharacter,
    resetGame,
    selectStage,
    toggleAutoAdvance,
    equipLoot,
    scrapLoot,
    enhanceGear,
    upgradeSubstat,
    toggleSubstatLock,
    reforgeSubstats,
    spendTalentPoint,
    spendOverflowTalent,
    buyTempBagSlot,
    refundAllTalents,
    ascendHero,
    debugUpdateHero,
    resolveHeroStats,
    updateSettings,
    buyPrestigeUpgrade,
    updateAutoScrapSettings,
    scrapAllLoot,
    toggleGearLock,
    equipCustomHead,
    selectCharacterClass,
    loginCloudUser,
    logoutCloudUser,
    repairCloudAccount,
    gameSuspended,
    sessionConflict,
    claimActiveSession,
    cancelSessionPrompt
  };
};
export default useGameState;
