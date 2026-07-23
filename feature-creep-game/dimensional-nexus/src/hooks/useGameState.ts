import { useState, useEffect, useRef } from 'react';
import { GameState, HeroClass, RpgHero, RpgEnemy, RpgSkill, RpgItem, PartyMember, Dungeon, DungeonStage, CombatMode } from '../types/game';

const INITIAL_DUNGEONS: Dungeon[] = [
  {
    id: 'colosseum',
    name: 'Astral Colosseum',
    description: 'A grand mythological arena where ancient demigods and mythical beasts duel under the stars.',
    completed: false,
    stages: [
      { id: 'col-1', name: 'Stage 1.1: Siren Wraith', levelRecommended: 1, unlocked: true, completed: false, enemies: ['Siren Wraith'], bossName: 'Centaur Gladiator' },
      { id: 'col-2', name: 'Stage 1.2: Fallen Demigod', levelRecommended: 2, unlocked: false, completed: false, enemies: ['Fallen Demigod', 'Harpy Rogue'], bossName: 'Chimera Beast' },
      { id: 'col-3', name: 'Stage 1.3: Minotaur Chieftain (Boss)', levelRecommended: 3, unlocked: false, completed: false, enemies: ['Satyr Archer'], bossName: 'Minotaur Chieftain' },
    ]
  },
  {
    id: 'megacity',
    name: 'Neon Megacity',
    description: 'A cyberpunk cityscape ruled by security AI drones and cyber-augmented mercenaries.',
    completed: false,
    stages: [
      { id: 'cty-1', name: 'Stage 2.1: Hack Security Drone', levelRecommended: 4, unlocked: false, completed: false, enemies: ['Security Drone v2'], bossName: 'Cyber Sentry' },
      { id: 'cty-2', name: 'Stage 2.2: Defeat Augmented Assassin', levelRecommended: 5, unlocked: false, completed: false, enemies: ['Augmented Assassin', 'Nanite Swarm'], bossName: 'Plasma Mech' },
      { id: 'cty-3', name: 'Stage 2.3: Synth Goliath (Boss)', levelRecommended: 6, unlocked: false, completed: false, enemies: ['Robo-Hound'], bossName: 'Synth Goliath' },
    ]
  },
  {
    id: 'keep',
    name: 'The Ancient Keep',
    description: 'A traditional dark fantasy dungeon filled with crypt skeletons and high-tier wyverns.',
    completed: false,
    stages: [
      { id: 'kep-1', name: 'Stage 3.1: Clear Crypt Skeletons', levelRecommended: 7, unlocked: false, completed: false, enemies: ['Crypt Skeleton'], bossName: 'Necromancer Apprentice' },
      { id: 'kep-2', name: 'Stage 3.2: Fight Wyvern Hatchling', levelRecommended: 8, unlocked: false, completed: false, enemies: ['Wyvern Hatchling', 'Gargoyle Stone'], bossName: 'Fire Wyrm' },
      { id: 'kep-3', name: 'Stage 3.3: Undead Warlord (Boss)', levelRecommended: 9, unlocked: false, completed: false, enemies: ['Grave Ghoul'], bossName: 'Undead Warlord' },
    ]
  },
  {
    id: 'void',
    name: 'The Void Sector',
    description: 'A cosmic rift where fantasy, sci-fi, and myth clash. Home to the Sovereign of Void.',
    completed: false,
    stages: [
      { id: 'vod-1', name: 'Stage 4.1: Close Void Crevice', levelRecommended: 10, unlocked: false, completed: false, enemies: ['Void Specter'], bossName: 'Dimensional Rift' },
      { id: 'vod-2', name: 'Stage 4.2: Tame Nebula Chimera', levelRecommended: 11, unlocked: false, completed: false, enemies: ['Nebula Chimera', 'Singularity Core'], bossName: 'Event Horizon' },
      { id: 'vod-3', name: 'Stage 4.3: The Void Sovereign (Boss)', levelRecommended: 12, unlocked: false, completed: false, enemies: ['Antimatter Golem'], bossName: 'Void Sovereign' },
    ]
  }
];

const SHOP_ITEMS: RpgItem[] = [
  // Weapons
  { id: 'w-sword', name: 'Astral Gladius', description: 'Ancient mythological shortsword. Adds +10 Attack.', type: 'weapon', attackBonus: 10, cost: 50, count: 0 },
  { id: 'w-rifle', name: 'Laser Plasma Rifle', description: 'High-tech sci-fi energy rifle. Adds +18 Attack, +6% Crit.', type: 'weapon', attackBonus: 18, critBonus: 0.06, cost: 110, count: 0 },
  { id: 'w-hammer', name: 'Mjolnir Lightning Replica', description: 'Crushes void sectors. Adds +30 Attack, +10% Crit.', type: 'weapon', attackBonus: 30, critBonus: 0.10, cost: 250, count: 0 },
  
  // Armors
  { id: 'a-chain', name: 'Mythril Chainmail Plate', description: 'Classic lightweight medieval armor. Adds +6 Defense, +30 HP.', type: 'armor', defenseBonus: 6, hpBonus: 30, cost: 45, count: 0 },
  { id: 'a-suit', name: 'Carbon Nanofiber Cyber Suit', description: 'Absorbs plasma shots. Adds +12 Defense, +6% Evade.', type: 'armor', defenseBonus: 12, evadeBonus: 0.06, cost: 100, count: 0 },
  { id: 'a-shield', name: 'Aegis Energy Power Shield', description: 'Absolute mythological barrier. Adds +24 Defense, +80 HP.', type: 'armor', defenseBonus: 24, hpBonus: 80, cost: 220, count: 0 },

  // Accessories
  { id: 'x-boots', name: 'Hermes Winged Boots', description: 'Allows quick dashes. Adds +10% Evade.', type: 'accessory', evadeBonus: 0.10, cost: 60, count: 0 },
  { id: 'x-eye', name: 'Cybernetic Targeting Eye', description: 'Projects hit trajectories. Adds +12% Crit Rate.', type: 'accessory', critBonus: 0.12, cost: 90, count: 0 },
  { id: 'x-ring', name: 'Void Cosmic Loop Ring', description: 'Taps void energy. Adds +25 Max Mana, +5 Attack.', type: 'accessory', hpBonus: 10, attackBonus: 5, cost: 150, count: 0 },

  // Consumables
  { id: 'c-potion', name: 'Healing Mana Elixir', description: 'Restores 50 HP and 50 Mana.', type: 'consumable', effectType: 'heal_hp', effectValue: 50, cost: 15, count: 0 },
  { id: 'c-ambrosia', name: 'Mythical Ambrosia Cup', description: 'Restores 100 HP. Food of the Demigods.', type: 'consumable', effectType: 'heal_hp', effectValue: 100, cost: 25, count: 0 },
  { id: 'c-battery', name: 'High-Density Fusion Battery', description: 'Instantly restores 120 Mana.', type: 'consumable', effectType: 'heal_mana', effectValue: 120, cost: 20, count: 0 }
];

const PARTY_POOL: PartyMember[] = [
  { id: 'p-squire', name: 'Medieval Shield Squire', role: 'Frontline Buffer', attackContribution: 5, buffDescription: '+5 Auto Attack DPS', rarity: 'common' },
  { id: 'p-android', name: 'Cyber Android Model 3', role: 'Heavy Gunner', attackContribution: 12, buffDescription: '+12 Auto Attack DPS', rarity: 'common' },
  { id: 'p-nymph', name: 'Mythic Forest Nymph', role: 'Stat Augmentor', attackContribution: 30, buffDescription: '+30 Auto Attack DPS', rarity: 'rare' },
  { id: 'p-pilot', name: 'Mech Dreadnought Pilot', role: 'Dreadnought Tank', attackContribution: 70, buffDescription: '+70 Auto Attack DPS', rarity: 'rare' },
  { id: 'p-valkyrie', name: 'Mythological Valkyrie', role: 'Divine Striker', attackContribution: 200, buffDescription: '+200 Auto Attack DPS', rarity: 'legendary' }
];

const ENEMY_STATS: Record<string, { hp: number, attack: number, defense: number, xp: number, gold: number }> = {
  'Siren Wraith': { hp: 40, attack: 4, defense: 1, xp: 15, gold: 12 },
  'Fallen Demigod': { hp: 60, attack: 7, defense: 2, xp: 22, gold: 18 },
  'Harpy Rogue': { hp: 50, attack: 6, defense: 1, xp: 18, gold: 15 },
  'Satyr Archer': { hp: 55, attack: 6, defense: 2, xp: 20, gold: 16 },
  'Centaur Gladiator': { hp: 110, attack: 10, defense: 4, xp: 55, gold: 40 },
  'Minotaur Chieftain': { hp: 200, attack: 14, defense: 5, xp: 120, gold: 80 },

  'Security Drone v2': { hp: 120, attack: 15, defense: 5, xp: 60, gold: 50 },
  'Augmented Assassin': { hp: 150, attack: 18, defense: 6, xp: 75, gold: 60 },
  'Nanite Swarm': { hp: 110, attack: 13, defense: 8, xp: 65, gold: 55 },
  'Robo-Hound': { hp: 100, attack: 14, defense: 4, xp: 55, gold: 45 },
  'Cyber Sentry': { hp: 240, attack: 22, defense: 10, xp: 180, gold: 120 },
  'Synth Goliath': { hp: 600, attack: 32, defense: 15, xp: 400, gold: 250 },

  'Crypt Skeleton': { hp: 300, attack: 28, defense: 12, xp: 200, gold: 140 },
  'Wyvern Hatchling': { hp: 380, attack: 34, defense: 15, xp: 250, gold: 180 },
  'Gargoyle Stone': { hp: 420, attack: 32, defense: 24, xp: 270, gold: 200 },
  'Grave Ghoul': { hp: 280, attack: 30, defense: 10, xp: 180, gold: 130 },
  'Necromancer Apprentice': { hp: 500, attack: 40, defense: 18, xp: 380, gold: 280 },
  'Undead Warlord': { hp: 1300, attack: 65, defense: 28, xp: 1000, gold: 700 },

  'Void Specter': { hp: 750, attack: 68, defense: 25, xp: 600, gold: 450 },
  'Nebula Chimera': { hp: 950, attack: 85, defense: 30, xp: 800, gold: 600 },
  'Singularity Core': { hp: 800, attack: 90, defense: 40, xp: 750, gold: 550 },
  'Antimatter Golem': { hp: 1100, attack: 95, defense: 35, xp: 900, gold: 700 },
  'Dimensional Rift': { hp: 1200, attack: 80, defense: 50, xp: 1000, gold: 800 },
  'Event Horizon': { hp: 1400, attack: 110, defense: 45, xp: 1200, gold: 900 },
  'Void Sovereign': { hp: 3200, attack: 160, defense: 80, xp: 3500, gold: 2500 }
};

const LOCAL_STORAGE_KEY = 'dimensional_nexus_rpg_state';

export const useGameState = () => {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load RPG state:', e);
    }
    return {
      selectedClass: null,
      heroName: 'Hero',
      hero: null,
      activeEnemy: null,
      activeDungeonId: 'colosseum',
      activeStageId: 'col-1',
      inCombat: false,
      combatMode: 'turn',
      combatLogs: ['Dimensional portals online. Select a champion class to manifest in the Nexus.'],
      dungeons: INITIAL_DUNGEONS,
      partyPool: PARTY_POOL,
      difficultyTier: 1
    };
  });

  const [playerTurn, setPlayerTurn] = useState<boolean>(true);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Auto-save state
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const resetGame = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({
      selectedClass: null,
      heroName: 'Hero',
      hero: null,
      activeEnemy: null,
      activeDungeonId: 'colosseum',
      activeStageId: 'col-1',
      inCombat: false,
      combatMode: 'turn',
      combatLogs: ['Environments rebooted. Select class.'],
      dungeons: INITIAL_DUNGEONS,
      partyPool: PARTY_POOL,
      difficultyTier: 1
    });
    setPlayerTurn(true);
  };

  const createHero = (heroClass: HeroClass, name: string): RpgHero => {
    let baseHp = 100;
    let baseMana = 100;
    let baseAttack = 10;
    let baseDefense = 5;
    let critRate = 0.05;
    let evadeRate = 0.03;
    let skills: RpgSkill[] = [];

    switch (heroClass) {
      case 'paladin': // Fantasy Paladin
        baseHp = 130;
        baseMana = 70;
        baseAttack = 11;
        baseDefense = 8;
        critRate = 0.05;
        evadeRate = 0.03;
        skills = [
          { id: 'pl-1', name: 'Holy Aegis Shield', description: 'Deploys a barrier of starlight. Absorbs incoming hits, heals 40 HP.', manaCost: 15, cooldown: 5, currentCooldown: 0, type: 'heal', power: 40, branch: 'tactical', unlocked: true },
          { id: 'pl-2', name: 'Smite the Wicked', description: 'Infuses blade with solar fire. Deals x2.0 attack damage.', manaCost: 20, cooldown: 8, currentCooldown: 0, type: 'damage', power: 2.0, branch: 'speed', unlocked: true },
          { id: 'pl-3', name: 'Guardian Healing Aura', description: 'Unleashes defensive aura. Heals 80 HP, +15 Defense for 10s.', manaCost: 35, cooldown: 15, currentCooldown: 0, type: 'heal', power: 80, branch: 'utility', unlocked: false }
        ];
        break;
      case 'mech': // Sci-Fi Mech
        baseHp = 110;
        baseMana = 90;
        baseAttack = 13;
        baseDefense = 5;
        critRate = 0.08;
        evadeRate = 0.04;
        skills = [
          { id: 'mc-1', name: 'Plasma Gun Blast', description: 'Fires hot superheated plasma gas. Deals x1.8 attack damage.', manaCost: 15, cooldown: 4, currentCooldown: 0, type: 'damage', power: 1.8, branch: 'speed', unlocked: true },
          { id: 'mc-2', name: 'Deploy Repair Drone', description: 'Launches localized repair drone. Restores 50 HP.', manaCost: 22, cooldown: 10, currentCooldown: 0, type: 'heal', power: 50, branch: 'utility', unlocked: true },
          { id: 'mc-3', name: 'Dreadnought Fusion Cannon', description: 'Overcharges nuclear cores. Deals x3.2 attack damage.', manaCost: 45, cooldown: 18, currentCooldown: 0, type: 'damage', power: 3.2, branch: 'tactical', unlocked: false }
        ];
        break;
      case 'demigod': // Mythological Demigod
        baseHp = 90;
        baseMana = 130;
        baseAttack = 16;
        baseDefense = 3;
        critRate = 0.10;
        evadeRate = 0.05;
        skills = [
          { id: 'dg-1', name: 'Solar Heat Flare', description: 'Unleashes mythological sky fires. Deals x2.0 attack damage.', manaCost: 18, cooldown: 5, currentCooldown: 0, type: 'damage', power: 2.0, branch: 'tactical', unlocked: true },
          { id: 'dg-2', name: 'Sunburst Ray Beam', description: 'Beams continuous divine rays. Deals x3.0 attack damage.', manaCost: 35, cooldown: 12, currentCooldown: 0, type: 'damage', power: 3.0, branch: 'speed', unlocked: true },
          { id: 'dg-3', name: 'Blessing of Olympus', description: 'Invokes ancient demigods. Heals 90 HP, restores 30 Mana.', manaCost: 30, cooldown: 15, currentCooldown: 0, type: 'heal', power: 90, branch: 'utility', unlocked: false }
        ];
        break;
      case 'hacker': // Cyber Hacker
        baseHp = 95;
        baseMana = 80;
        baseAttack = 15;
        baseDefense = 4;
        critRate = 0.20;
        evadeRate = 0.12;
        skills = [
          { id: 'hk-1', name: 'Subroutine Cloak', description: 'Fires cyber cloaking codes. Deals x1.6 damage (100% crit chance).', manaCost: 20, cooldown: 4, currentCooldown: 0, type: 'damage', power: 1.6, branch: 'speed', unlocked: true },
          { id: 'hk-2', name: 'Manifest Decoy Matrix', description: 'Flashes digital holograms. Boosts Evasion by +20% for 8s.', manaCost: 15, cooldown: 8, currentCooldown: 0, type: 'shield', power: 20, branch: 'tactical', unlocked: true },
          { id: 'hk-3', name: 'Cyber Void Overload', description: 'Spams matrix logic spikes. Deals random 30 to 130 damage.', manaCost: 30, cooldown: 12, currentCooldown: 0, type: 'damage', power: 1.0, branch: 'utility', unlocked: false }
        ];
        break;
    }

    return {
      name: name || 'Nexus Champion',
      class: heroClass,
      level: 1,
      xp: 0,
      maxXp: 100,
      hp: baseHp,
      maxHp: baseHp,
      mana: baseMana,
      maxMana: baseMana,
      baseAttack,
      baseDefense,
      critRate,
      evadeRate,
      gold: 50,
      equippedWeapon: null,
      equippedArmor: null,
      equippedAccessory: null,
      skills,
      inventory: SHOP_ITEMS.map(i => ({ ...i, count: 0 })),
      party: [],
      combatPoints: { tactical: 0, speed: 0, utility: 0 }
    };
  };

  const selectHeroClass = (heroClass: HeroClass, name: string) => {
    const hero = createHero(heroClass, name);
    setState(prev => ({
      ...prev,
      selectedClass: heroClass,
      heroName: name || 'Nexus Champion',
      hero,
      combatLogs: [` manifested in the Nexus as ${heroClass.toUpperCase()}. Ready to clash.`]
    }));
  };

  // Toggle combat style
  const toggleCombatMode = (mode: CombatMode) => {
    setState(prev => ({
      ...prev,
      combatMode: mode,
      combatLogs: [...prev.combatLogs, `Combat Engine changed to ${mode.toUpperCase()} mode.`].slice(-30)
    }));
  };

  // Start Dungeon Stage
  const startStage = (dungeonId: string, stageId: string) => {
    setState(prev => {
      const dungeon = prev.dungeons.find(d => d.id === dungeonId);
      const stage = dungeon?.stages.find(s => s.id === stageId);
      if (!dungeon || !stage || !stage.unlocked || !prev.hero) return prev;

      const enemyName = stage.enemies[0];
      const stats = ENEMY_STATS[enemyName] || { hp: 50, attack: 5, defense: 2, xp: 10, gold: 10 };

      const scaledHp = Math.floor(stats.hp * (1 + (prev.difficultyTier - 1) * 0.5));
      const scaledAttack = Math.floor(stats.attack * (1 + (prev.difficultyTier - 1) * 0.4));

      const activeEnemy: RpgEnemy = {
        id: `enemy-${Date.now()}`,
        name: enemyName,
        hp: scaledHp,
        maxHp: scaledHp,
        attack: scaledAttack,
        defense: stats.defense,
        xpReward: stats.xp,
        goldReward: stats.gold,
        isBoss: stageId.includes('-3') // Boss is always stage 3
      };

      const combatLogs = [
        ...prev.combatLogs,
        `Portal opened. Entering Stage: ${stage.name}.`,
        `A fierce ${activeEnemy.name} manifest blocks your way!`
      ].slice(-30);

      // Reset skill cooldowns
      const hero = {
        ...prev.hero,
        skills: prev.hero.skills.map(s => ({ ...s, currentCooldown: 0 }))
      };

      return {
        ...prev,
        activeDungeonId: dungeonId,
        activeStageId: stageId,
        inCombat: true,
        activeEnemy,
        combatLogs,
        hero
      };
    });

    setPlayerTurn(true);
  };

  // Turn-Based actions
  const executeTurnAction = (action: 'attack' | 'pass') => {
    if (state.combatMode !== 'turn' || !playerTurn || !state.inCombat || !state.hero || !state.activeEnemy) return;

    // 1. Player Turn
    let nextHero = { ...state.hero };
    let nextEnemy = { ...state.activeEnemy };
    let nextLogs = [...state.combatLogs];
    let endCombat = false;
    let newDungeons = [...state.dungeons];

    const weaponBonus = nextHero.equippedWeapon?.attackBonus || 0;
    const accessoryWeapon = nextHero.equippedAccessory?.attackBonus || 0;
    const totalAttack = nextHero.baseAttack + weaponBonus + accessoryWeapon;

    const weaponCrit = nextHero.equippedWeapon?.critBonus || 0;
    const accessoryCrit = nextHero.equippedAccessory?.critBonus || 0;
    const finalCrit = nextHero.critRate + weaponCrit + accessoryCrit;

    if (action === 'attack') {
      const isCrit = Math.random() < finalCrit;
      let damage = totalAttack;
      if (isCrit) damage = Math.floor(damage * 1.5);
      
      const finalDamage = Math.max(1, damage - nextEnemy.defense);
      nextEnemy.hp = Math.max(0, nextEnemy.hp - finalDamage);

      nextLogs.push(`Hero Turn: Attack dealt ${finalDamage} damage to ${nextEnemy.name}.${isCrit ? ' (CRIT!)' : ''}`);
    } else {
      nextLogs.push(`Hero Turn: Passed.`);
    }

    // Check if enemy dead
    if (nextEnemy.hp <= 0) {
      const outcome = resolveCombatSuccess(nextHero, nextEnemy, nextLogs, newDungeons, state.difficultyTier);
      setState(prev => ({
        ...prev,
        hero: nextHero,
        activeEnemy: outcome.nextEnemy,
        activeDungeonId: outcome.nextDungeonId,
        activeStageId: outcome.nextStageId,
        difficultyTier: outcome.nextDifficultyTier,
        inCombat: !outcome.combatEnded,
        combatLogs: nextLogs.slice(-30),
        dungeons: newDungeons
      }));
      return;
    }

    // Set to enemy turn
    setPlayerTurn(false);
      
      // Trigger enemy turn action after 800ms delay for visual feedback
      setTimeout(() => {
        const curState = stateRef.current;
        if (!curState.inCombat || !curState.hero || !curState.activeEnemy) return;

        let enemyHero = { ...curState.hero };
        let enemyEnemy = { ...curState.activeEnemy };
        let enemyLogs = [...curState.combatLogs];
        let enemyEnd = false;
        let enemyDungeons = [...curState.dungeons];

        const armorBonus = enemyHero.equippedArmor?.defenseBonus || 0;
        const totalDefense = enemyHero.baseDefense + armorBonus;

        const armorEvade = enemyHero.equippedArmor?.evadeBonus || 0;
        const accessoryEvade = enemyHero.equippedAccessory?.evadeBonus || 0;
        const finalEvade = enemyHero.evadeRate + armorEvade + accessoryEvade;

        const isEvade = Math.random() < finalEvade;

        if (isEvade) {
          enemyLogs.push(`💨 Enemy Turn: ${enemyEnemy.name} attacks but Hero EVADED!`);
        } else {
          const enemyDamage = Math.max(1, enemyEnemy.attack - totalDefense);
          enemyHero.hp = Math.max(0, enemyHero.hp - enemyDamage);
          enemyLogs.push(`💥 Enemy Turn: ${enemyEnemy.name} strikes Hero for ${enemyDamage} damage.`);
        }

        if (enemyHero.hp <= 0) {
          enemyEnd = true;
          resolveCombatDefeat(enemyHero, enemyLogs);
        }

        setState(prev => ({
          ...prev,
          hero: enemyHero,
          activeEnemy: enemyEnd ? null : enemyEnemy,
          inCombat: !enemyEnd,
          combatLogs: enemyLogs.slice(-30),
          dungeons: enemyDungeons
        }));

        setPlayerTurn(true);
      }, 700);
    setState(prev => ({
      ...prev,
      hero: nextHero,
      activeEnemy: nextEnemy,
      inCombat: true,
      combatLogs: nextLogs.slice(-30),
      dungeons: newDungeons
    }));
  };

  // Real-Time Clicks direct attacks
  const handleRealTimeClick = () => {
    if (state.combatMode !== 'realtime' || !state.inCombat || !state.hero || !state.activeEnemy) return;

    setState(prev => {
      const hero = prev.hero;
      const enemy = prev.activeEnemy;
      if (!hero || !enemy) return prev;

      let nextHero = { ...hero };
      let nextEnemy = { ...enemy };
      let nextLogs = [...prev.combatLogs];
      let endCombat = false;
      let newDungeons = [...prev.dungeons];

      // Deal direct click damage (20% of total attack power)
      const weaponBonus = hero.equippedWeapon?.attackBonus || 0;
      const accessoryWeapon = hero.equippedAccessory?.attackBonus || 0;
      const totalAttack = hero.baseAttack + weaponBonus + accessoryWeapon;

      const clickDamage = Math.max(1, Math.floor(totalAttack * 0.2));
      nextEnemy.hp = Math.max(0, nextEnemy.hp - clickDamage);

      // Random logs occasionally to prevent spam
      if (Math.random() < 0.25) {
        nextLogs.push(`Direct Click! Dealt ${clickDamage} strike damage to ${enemy.name}.`);
      }

      if (nextEnemy.hp <= 0) {
        const outcome = resolveCombatSuccess(nextHero, nextEnemy, nextLogs, newDungeons, prev.difficultyTier);
        return {
          ...prev,
          hero: nextHero,
          activeEnemy: outcome.nextEnemy,
          activeDungeonId: outcome.nextDungeonId,
          activeStageId: outcome.nextStageId,
          difficultyTier: outcome.nextDifficultyTier,
          inCombat: !outcome.combatEnded,
          combatLogs: nextLogs.slice(-30),
          dungeons: newDungeons
        };
      }

      return {
        ...prev,
        hero: nextHero,
        activeEnemy: nextEnemy,
        inCombat: true,
        combatLogs: nextLogs.slice(-30),
        dungeons: newDungeons
      };
    });
  };

  // Flee
  const fleeCombat = () => {
    setState(prev => ({
      ...prev,
      inCombat: false,
      activeEnemy: null,
      combatLogs: [...prev.combatLogs, 'Thread severed. Escaped back to portal nexus.'].slice(-30)
    }));
  };

  // Cast Active Skill
  const castSkill = (skillId: string) => {
    setState(prev => {
      const hero = prev.hero;
      const enemy = prev.activeEnemy;
      if (!hero || !prev.inCombat) return prev;

      const skillIndex = hero.skills.findIndex(s => s.id === skillId);
      if (skillIndex === -1) return prev;

      const skill = hero.skills[skillIndex];
      if (hero.mana < skill.manaCost || skill.currentCooldown > 0) return prev;

      let nextHero = { ...hero };
      let nextEnemy = enemy ? { ...enemy } : null;
      let nextLogs = [...prev.combatLogs];
      let endCombat = false;
      let newDungeons = [...prev.dungeons];

      // Deduct Mana, set Cooldown
      nextHero.mana -= skill.manaCost;
      nextHero.skills = hero.skills.map(s => {
        if (s.id === skillId) {
          return { ...s, currentCooldown: s.cooldown };
        }
        return s;
      });

      const weaponBonus = hero.equippedWeapon?.attackBonus || 0;
      const accessoryWeapon = hero.equippedAccessory?.attackBonus || 0;
      const totalAttack = hero.baseAttack + weaponBonus + accessoryWeapon;

      const weaponCrit = hero.equippedWeapon?.critBonus || 0;
      const accessoryCrit = hero.equippedAccessory?.critBonus || 0;
      const finalCrit = hero.critRate + weaponCrit + accessoryCrit;

      if (skill.type === 'damage' && nextEnemy) {
        let isCrit = Math.random() < finalCrit;
        let skillPower = skill.power;

        if (skill.id === 'hk-1') {
          isCrit = true; // guaranteed crit
        } else if (skill.id === 'hk-3') {
          // System Overload is random damage
          skillPower = 1.0 + Math.random() * 4.0;
        }

        let damage = Math.floor(totalAttack * skillPower);
        if (isCrit) damage = Math.floor(damage * 1.5);

        const finalDamage = Math.max(1, damage - nextEnemy.defense);
        nextEnemy.hp = Math.max(0, nextEnemy.hp - finalDamage);

        nextLogs.push(`Hero cast ${skill.name}! Dealt ${finalDamage} damage to ${nextEnemy.name}${isCrit ? ' (CRITICAL!)' : ''}.`);

        if (nextEnemy.hp <= 0) {
          const outcome = resolveCombatSuccess(nextHero, nextEnemy, nextLogs, newDungeons, prev.difficultyTier);
          return {
            ...prev,
            hero: nextHero,
            activeEnemy: outcome.nextEnemy,
            activeDungeonId: outcome.nextDungeonId,
            activeStageId: outcome.nextStageId,
            difficultyTier: outcome.nextDifficultyTier,
            inCombat: !outcome.combatEnded,
            combatLogs: nextLogs.slice(-30),
            dungeons: newDungeons
          };
        }
      } else if (skill.type === 'heal') {
        const heal = skill.power;
        nextHero.hp = Math.min(nextHero.maxHp, nextHero.hp + heal);
        nextLogs.push(`Hero cast ${skill.name}! Restored ${heal} HP.`);
      } else if (skill.type === 'shield') {
        const val = skill.power;
        // Hacker evade buff
        if (skill.id === 'hk-2') {
          nextHero.evadeRate += 0.2;
          // Evasion buff ends after 8 seconds (we trigger reset later or keep it simple)
          setTimeout(() => {
            setState(p => {
              if (!p.hero) return p;
              return { ...p, hero: { ...p.hero, evadeRate: Math.max(0.12, p.hero.evadeRate - 0.2) } };
            });
          }, 8000);
        }
        nextLogs.push(`Hero cast ${skill.name}! Evasion buff active (+20%).`);
      }

      return {
        ...prev,
        hero: nextHero,
        activeEnemy: nextEnemy,
        inCombat: true,
        combatLogs: nextLogs.slice(-30),
        dungeons: newDungeons
      };
    });
  };

  // Upgrade / Spend Skill Points
  const spendCombatPoints = (branch: 'tactical' | 'speed' | 'utility', cost: number, actionType: 'skill_unlock' | 'stat_atk' | 'stat_hp') => {
    setState(prev => {
      const hero = prev.hero;
      if (!hero) return prev;

      const points = hero.combatPoints[branch];
      if (points < cost) return prev;

      let nextHero = { ...hero };
      nextHero.combatPoints = {
        ...hero.combatPoints,
        [branch]: points - cost
      };

      let nextLogs = [...prev.combatLogs];

      if (actionType === 'skill_unlock') {
        // Unlock tier 3 skill
        nextHero.skills = hero.skills.map(s => {
          if (s.branch === branch && !s.unlocked) {
            return { ...s, unlocked: true };
          }
          return s;
        });
        nextLogs.push(`Unlocked Tier 3 branch skill for ${branch.toUpperCase()}.`);
      } else if (actionType === 'stat_atk') {
        nextHero.baseAttack += 5;
        nextHero.critRate = Math.min(0.8, nextHero.critRate + 0.03);
        nextLogs.push(`Upgraded Weaponry stats: +5 Attack, +3% Crit Rate.`);
      } else if (actionType === 'stat_hp') {
        nextHero.maxHp += 30;
        nextHero.hp = nextHero.maxHp;
        nextHero.maxMana += 15;
        nextHero.mana = nextHero.maxMana;
        nextLogs.push(`Upgraded Vitality stats: +30 Max HP, +15 Max Mana.`);
      }

      return { ...prev, hero: nextHero, combatLogs: nextLogs.slice(-30) };
    });
  };

  // Shop purchase
  const buyShopItem = (itemId: string) => {
    setState(prev => {
      const hero = prev.hero;
      if (!hero) return prev;

      const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
      if (!shopItem || hero.gold < shopItem.cost) return prev;

      const inventory = hero.inventory.map(item => {
        if (item.id === itemId) return { ...item, count: item.count + 1 };
        return item;
      });

      return {
        ...prev,
        hero: {
          ...hero,
          gold: hero.gold - shopItem.cost,
          inventory
        },
        combatLogs: [...prev.combatLogs, `Purchased ${shopItem.name} for ${shopItem.cost}g.`].slice(-30)
      };
    });
  };

  // Equip Item
  const equipItem = (itemId: string) => {
    setState(prev => {
      const hero = prev.hero;
      if (!hero) return prev;

      const itemIndex = hero.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1 || hero.inventory[itemIndex].count <= 0) return prev;

      const targetItem = hero.inventory[itemIndex];
      let nextHero = { ...hero };
      let nextLogs = [...prev.combatLogs];

      nextHero.inventory = hero.inventory.map(i => {
        if (i.id === itemId) return { ...i, count: i.count - 1 };
        return i;
      });

      if (targetItem.type === 'weapon') {
        if (hero.equippedWeapon) {
          const old = hero.equippedWeapon;
          nextHero.inventory = nextHero.inventory.map(i => i.id === old.id ? { ...i, count: i.count + 1 } : i);
        }
        nextHero.equippedWeapon = targetItem;
        nextLogs.push(`Equipped Weapon: ${targetItem.name}`);
      } else if (targetItem.type === 'armor') {
        if (hero.equippedArmor) {
          const old = hero.equippedArmor;
          nextHero.inventory = nextHero.inventory.map(i => i.id === old.id ? { ...i, count: i.count + 1 } : i);
        }
        nextHero.equippedArmor = targetItem;
        nextLogs.push(`Equipped Armor: ${targetItem.name}`);
      } else if (targetItem.type === 'accessory') {
        if (hero.equippedAccessory) {
          const old = hero.equippedAccessory;
          nextHero.inventory = nextHero.inventory.map(i => i.id === old.id ? { ...i, count: i.count + 1 } : i);
        }
        nextHero.equippedAccessory = targetItem;
        nextLogs.push(`Equipped Accessory: ${targetItem.name}`);
      }

      return {
        ...prev,
        hero: nextHero,
        combatLogs: nextLogs.slice(-30)
      };
    });
  };

  // Consumable
  const useConsumable = (itemId: string) => {
    setState(prev => {
      const hero = prev.hero;
      if (!hero) return prev;

      const itemIndex = hero.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1 || hero.inventory[itemIndex].count <= 0) return prev;

      const targetItem = hero.inventory[itemIndex];
      let nextHero = { ...hero };
      let nextLogs = [...prev.combatLogs];

      nextHero.inventory = hero.inventory.map(i => i.id === itemId ? { ...i, count: i.count - 1 } : i);

      const val = targetItem.effectValue || 0;
      if (targetItem.effectType === 'heal_hp') {
        nextHero.hp = Math.min(nextHero.maxHp, nextHero.hp + val);
        nextLogs.push(`Consumed ${targetItem.name}. Restored ${val} HP.`);
      } else if (targetItem.effectType === 'heal_mana') {
        nextHero.mana = Math.min(nextHero.maxMana, nextHero.mana + val);
        nextLogs.push(`Consumed ${targetItem.name}. Restored ${val} Mana.`);
      }

      return {
        ...prev,
        hero: nextHero,
        combatLogs: nextLogs.slice(-30)
      };
    });
  };

  // Hire Party Squire
  const hirePartyMember = (memberId: string) => {
    setState(prev => {
      const hero = prev.hero;
      if (!hero) return prev;

      const poolMember = prev.partyPool.find(p => p.id === memberId);
      if (!poolMember) return prev;

      const cost = poolMember.rarity === 'legendary' ? 500 : poolMember.rarity === 'rare' ? 200 : 80;
      if (hero.gold < cost || hero.party.some(p => p.id === memberId)) return prev;

      const party = [...hero.party, poolMember];
      const nextHero = {
        ...hero,
        gold: hero.gold - cost,
        party
      };

      return {
        ...prev,
        hero: nextHero,
        combatLogs: [...prev.combatLogs, `Recruited party member: ${poolMember.name}.`].slice(-30)
      };
    });
  };

  // Debugger cheat helper
  const debugUpdateHero = (updates: Partial<RpgHero>) => {
    setState(prev => {
      if (!prev.hero) return prev;
      return {
        ...prev,
        hero: {
          ...prev.hero,
          ...updates
        }
      };
    });
  };

  // Internal Helper combat resolutions
  const resolveCombatDefeat = (hero: RpgHero, logs: string[]) => {
    const goldLoss = Math.floor(hero.gold * 0.15);
    hero.hp = Math.floor(hero.maxHp * 0.5);
    hero.mana = hero.maxMana;
    hero.gold = Math.max(0, hero.gold - goldLoss);
    logs.push(`💀 DEFEATED! Restoring vitals at portal hub. Lost ${goldLoss}g budget.`);
  };

  const resolveCombatSuccess = (
    hero: RpgHero,
    enemy: RpgEnemy,
    logs: string[],
    dungeonsList: Dungeon[],
    currentTier: number
  ): {
    nextEnemy: RpgEnemy | null;
    nextDungeonId: string;
    nextStageId: string;
    nextDifficultyTier: number;
    combatEnded: boolean;
  } => {
    // Scaling gold/XP rewards
    const scaledGold = Math.floor(enemy.goldReward * (1 + (currentTier - 1) * 0.5));
    const scaledXp = Math.floor(enemy.xpReward * (1 + (currentTier - 1) * 0.3));

    hero.gold += scaledGold;
    hero.xp += scaledXp;
    logs.push(`🏆 SUCCESS! Banished ${enemy.name}. Gained ${scaledXp} XP, ${scaledGold}g.`);

    // Distribute Branching points based on Combat Style
    const activeMode = stateRef.current.combatMode;
    if (activeMode === 'turn') {
      hero.combatPoints.tactical += 1;
      logs.push(`🛡️ Gained +1 Tactical Point.`);
    } else if (activeMode === 'realtime') {
      hero.combatPoints.speed += 1;
      logs.push(`⚡ Gained +1 Speed Point.`);
    } else {
      hero.combatPoints.utility += 1;
      logs.push(`⚙️ Gained +1 Utility Point.`);
    }

    // Level up check
    if (hero.xp >= hero.maxXp) {
      hero.level += 1;
      hero.xp = hero.xp - hero.maxXp;
      hero.maxXp = Math.floor(hero.maxXp * 1.5);
      hero.maxHp = Math.floor(hero.maxHp * 1.15) + 12;
      hero.maxMana = Math.floor(hero.maxMana * 1.1) + 6;
      hero.hp = hero.maxHp;
      hero.mana = hero.maxMana;
      hero.baseAttack = Math.floor(hero.baseAttack * 1.14) + 2;
      hero.baseDefense = Math.floor(hero.baseDefense * 1.1) + 1;
      logs.push(`📈 LEVEL UP! Hero reached Level ${hero.level}!`);
    }

    // Dungeon unlocking sequence
    const dungId = stateRef.current.activeDungeonId;
    const stgId = stateRef.current.activeStageId;

    const activeDungIndex = dungeonsList.findIndex(d => d.id === dungId);
    
    // Complete stage
    const nextDungeons = dungeonsList.map(d => {
      if (d.id === dungId) {
        const updatedStages = d.stages.map((stg, sIdx) => {
          if (stg.id === stgId) {
            return { ...stg, completed: true };
          }
          const prevStg = d.stages[sIdx - 1];
          if (prevStg && prevStg.id === stgId) {
            return { ...stg, unlocked: true };
          }
          return stg;
        });
        const allCompleted = updatedStages.every(s => s.completed);
        return {
          ...d,
          stages: updatedStages,
          completed: allCompleted
        };
      }
      return d;
    });

    // Check if next dungeon can be unlocked
    const currentCompleted = nextDungeons[activeDungIndex].completed;
    const nextDung = dungeonsList[activeDungIndex + 1];

    let fullyUpdated = nextDungeons;
    if (currentCompleted && nextDung) {
      const targetNextDungId = nextDung.id;
      // Unlock first stage of next dungeon
      fullyUpdated = nextDungeons.map(d => {
        if (d.id === targetNextDungId) {
          const stages = d.stages.map((s, idx) => idx === 0 ? { ...s, unlocked: true } : s);
          return { ...d, stages };
        }
        return d;
      });
      logs.push(`📂 NEW NEXUS PORTAL SECURED: ${nextDung.name}!`);
    }

    dungeonsList.length = 0;
    dungeonsList.push(...fullyUpdated);

    // Auto-advance logic
    const curStageIndex = fullyUpdated[activeDungIndex].stages.findIndex(s => s.id === stgId);
    if (curStageIndex < fullyUpdated[activeDungIndex].stages.length - 1) {
      // 1. Advance to next stage of same dungeon
      const nextStage = fullyUpdated[activeDungIndex].stages[curStageIndex + 1];
      const nextEnemyName = nextStage.enemies[0];
      const stats = ENEMY_STATS[nextEnemyName] || { hp: 50, attack: 5, defense: 2, xp: 10, gold: 10 };
      
      const scaledHp = Math.floor(stats.hp * (1 + (currentTier - 1) * 0.5));
      const scaledAttack = Math.floor(stats.attack * (1 + (currentTier - 1) * 0.4));

      const nextEnemy: RpgEnemy = {
        id: `enemy-${Date.now()}`,
        name: nextEnemyName,
        hp: scaledHp,
        maxHp: scaledHp,
        attack: scaledAttack,
        defense: stats.defense,
        xpReward: stats.xp,
        goldReward: stats.gold,
        isBoss: nextStage.id.includes('-3')
      };

      logs.push(`⏩ Auto-Advancing to stage: ${nextStage.name}.`);
      return {
        nextEnemy,
        nextDungeonId: dungId,
        nextStageId: nextStage.id,
        nextDifficultyTier: currentTier,
        combatEnded: false
      };
    } else if (activeDungIndex < dungeonsList.length - 1) {
      // 2. Advance to first stage of next dungeon
      const nextDungeon = dungeonsList[activeDungIndex + 1];
      const nextStage = nextDungeon.stages[0];
      const nextEnemyName = nextStage.enemies[0];
      const stats = ENEMY_STATS[nextEnemyName] || { hp: 50, attack: 5, defense: 2, xp: 10, gold: 10 };

      const scaledHp = Math.floor(stats.hp * (1 + (currentTier - 1) * 0.5));
      const scaledAttack = Math.floor(stats.attack * (1 + (currentTier - 1) * 0.4));

      const nextEnemy: RpgEnemy = {
        id: `enemy-${Date.now()}`,
        name: nextEnemyName,
        hp: scaledHp,
        maxHp: scaledHp,
        attack: scaledAttack,
        defense: stats.defense,
        xpReward: stats.xp,
        goldReward: stats.gold,
        isBoss: false
      };

      logs.push(`⏩ Auto-Advancing to next dungeon: ${nextDungeon.name}.`);
      return {
        nextEnemy,
        nextDungeonId: nextDungeon.id,
        nextStageId: nextStage.id,
        nextDifficultyTier: currentTier,
        combatEnded: false
      };
    } else {
      // 3. Looped all dungeons! Prestige / loop back to colosseum first stage under next tier difficulty!
      const nextTier = currentTier + 1;
      const resetDungeons = INITIAL_DUNGEONS.map((d, dIdx) => {
        const stages = d.stages.map((s, sIdx) => ({
          ...s,
          completed: false,
          unlocked: dIdx === 0 && sIdx === 0
        }));
        return {
          ...d,
          stages,
          completed: false
        };
      });

      dungeonsList.length = 0;
      dungeonsList.push(...resetDungeons);

      const nextStage = resetDungeons[0].stages[0];
      const nextEnemyName = nextStage.enemies[0];
      const stats = ENEMY_STATS[nextEnemyName] || { hp: 50, attack: 5, defense: 2, xp: 10, gold: 10 };

      const scaledHp = Math.floor(stats.hp * (1 + (nextTier - 1) * 0.5));
      const scaledAttack = Math.floor(stats.attack * (1 + (nextTier - 1) * 0.4));

      const nextEnemy: RpgEnemy = {
        id: `enemy-${Date.now()}`,
        name: nextEnemyName,
        hp: scaledHp,
        maxHp: scaledHp,
        attack: scaledAttack,
        defense: stats.defense,
        xpReward: stats.xp,
        goldReward: stats.gold,
        isBoss: false
      };

      logs.push(`👑 NEXUS SECURED! Initiating Difficulty Tier ${nextTier}.`);
      return {
        nextEnemy,
        nextDungeonId: 'colosseum',
        nextStageId: 'col-1',
        nextDifficultyTier: nextTier,
        combatEnded: false
      };
    }
  };

  // --- INTERVAL TICKS FOR ACTIVE COMBAT MODES ---
  useEffect(() => {
    const interval = setInterval(() => {
      const curState = stateRef.current;
      if (!curState.inCombat || !curState.hero || !curState.activeEnemy) return;

      let nextHero = { ...curState.hero };
      let nextEnemy = { ...curState.activeEnemy };
      let nextLogs = [...curState.combatLogs];
      let endCombat = false;
      let newDungeons = [...curState.dungeons];

      // Skill Cooldown Ticks
      nextHero.skills = curState.hero.skills.map(s => {
        if (s.currentCooldown > 0) {
          return { ...s, currentCooldown: Math.max(0, Number((s.currentCooldown - 0.1).toFixed(1))) };
        }
        return s;
      });

      const mode = curState.combatMode;

      // 1. AUTO-IDLE AUTO-CAST & TICKS
      if (mode === 'auto') {
        // Auto cast first available skill
        const castable = nextHero.skills.find(s => s.unlocked && s.currentCooldown === 0 && nextHero.mana >= s.manaCost);
        if (castable) {
          // Deduct mana, set cooldown
          nextHero.mana -= castable.manaCost;
          nextHero.skills = nextHero.skills.map(s => s.id === castable.id ? { ...s, currentCooldown: s.cooldown } : s);

          const weaponBonus = nextHero.equippedWeapon?.attackBonus || 0;
          const accessoryWeapon = nextHero.equippedAccessory?.attackBonus || 0;
          const totalAttack = nextHero.baseAttack + weaponBonus + accessoryWeapon;

          if (castable.type === 'damage') {
            const damage = Math.floor(totalAttack * castable.power);
            const finalDmg = Math.max(1, damage - nextEnemy.defense);
            nextEnemy.hp = Math.max(0, nextEnemy.hp - finalDmg);
            nextLogs.push(`Auto-Cast ${castable.name}: Dealt ${finalDmg} damage to ${nextEnemy.name}.`);
          } else if (castable.type === 'heal') {
            nextHero.hp = Math.min(nextHero.maxHp, nextHero.hp + castable.power);
            nextLogs.push(`Auto-Cast ${castable.name}: Restored ${castable.power} HP.`);
          }
        }
      }

      // 2. HERO AUTO ATTACKS (Runs in Realtime and Auto modes, Turn-Based handles manually)
      if (mode === 'realtime' || mode === 'auto') {
        // 1/15 chance (~1.5s auto swing)
        if (Math.random() < 0.07) {
          const weaponBonus = nextHero.equippedWeapon?.attackBonus || 0;
          const accessoryWeapon = nextHero.equippedAccessory?.attackBonus || 0;
          const totalAttack = nextHero.baseAttack + weaponBonus + accessoryWeapon;

          const weaponCrit = nextHero.equippedWeapon?.critBonus || 0;
          const accessoryCrit = nextHero.equippedAccessory?.critBonus || 0;
          const finalCrit = nextHero.critRate + weaponCrit + accessoryCrit;

          const isCrit = Math.random() < finalCrit;
          let damage = totalAttack;
          if (isCrit) damage = Math.floor(damage * 1.5);

          // Hired Party contributions
          const partyDps = nextHero.party.reduce((acc, p) => acc + p.attackContribution, 0);
          const partyTick = Math.max(0, Math.floor(partyDps * 0.15));

          const finalDamage = Math.max(1, damage - nextEnemy.defense) + partyTick;
          nextEnemy.hp = Math.max(0, nextEnemy.hp - finalDamage);

          nextLogs.push(`Hero swing: Dealt ${finalDamage} damage to ${nextEnemy.name}.${isCrit ? ' (CRIT!)' : ''}`);
        }
      }

      // 3. ENEMY ATTACKS (Runs in Realtime and Auto modes, Turn-Based handles manually)
      if (mode === 'realtime' || mode === 'auto') {
        if (nextEnemy.hp > 0 && Math.random() < 0.05) {
          const armorBonus = nextHero.equippedArmor?.defenseBonus || 0;
          const totalDefense = nextHero.baseDefense + armorBonus;

          const armorEvade = nextHero.equippedArmor?.evadeBonus || 0;
          const accessoryEvade = nextHero.equippedAccessory?.evadeBonus || 0;
          const finalEvade = nextHero.evadeRate + armorEvade + accessoryEvade;

          const isEvade = Math.random() < finalEvade;

          if (isEvade) {
            nextLogs.push(`💨 Evaded attack from ${nextEnemy.name}!`);
          } else {
            const damage = Math.max(1, nextEnemy.attack - totalDefense);
            nextHero.hp = Math.max(0, nextHero.hp - damage);
            nextLogs.push(`💥 ${nextEnemy.name} strikes: Dealt ${damage} damage to Hero.`);
          }
        }
      }

      // Check combat end conditions
      if (nextHero.hp <= 0) {
        resolveCombatDefeat(nextHero, nextLogs);
        setState(prev => ({
          ...prev,
          hero: nextHero,
          activeEnemy: null,
          inCombat: false,
          combatLogs: nextLogs.slice(-30),
          dungeons: newDungeons
        }));
      } else if (nextEnemy.hp <= 0) {
        const outcome = resolveCombatSuccess(nextHero, nextEnemy, nextLogs, newDungeons, curState.difficultyTier);
        setState(prev => ({
          ...prev,
          hero: nextHero,
          activeEnemy: outcome.nextEnemy,
          activeDungeonId: outcome.nextDungeonId,
          activeStageId: outcome.nextStageId,
          difficultyTier: outcome.nextDifficultyTier,
          inCombat: !outcome.combatEnded,
          combatLogs: nextLogs.slice(-30),
          dungeons: newDungeons
        }));
      } else {
        setState(prev => ({
          ...prev,
          hero: nextHero,
          activeEnemy: nextEnemy,
          inCombat: true,
          combatLogs: nextLogs.slice(-30),
          dungeons: newDungeons
        }));
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return {
    state,
    playerTurn,
    selectHeroClass,
    toggleCombatMode,
    startStage,
    executeTurnAction,
    handleRealTimeClick,
    fleeCombat,
    castSkill,
    spendCombatPoints,
    buyShopItem,
    equipItem,
    useConsumable,
    hirePartyMember,
    debugUpdateHero,
    resetGame
  };
};
export default useGameState;
