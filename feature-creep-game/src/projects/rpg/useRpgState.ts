import { useState, useEffect, useRef } from 'react';
import { RpgGameState, HeroClass, RpgHero, RpgEnemy, RpgSkill, RpgItem, PartyMember, Dungeon, DungeonStage } from './types';

const INITIAL_DUNGEONS: Dungeon[] = [
  {
    id: 'localhost',
    name: 'Local Host Server',
    description: 'A sandbox playground running on your local device. Easy debugging.',
    completed: false,
    stages: [
      { id: 'lh-1', name: 'Stage 1.1: Fix SyntaxError', levelRecommended: 1, unlocked: true, completed: false, enemies: ['SyntaxError'], bossName: 'Lint Warning' },
      { id: 'lh-2', name: 'Stage 1.2: Resolve Undefined Variable', levelRecommended: 2, unlocked: false, completed: false, enemies: ['UndefinedVar', 'NullRefException'], bossName: 'DeprecatedNotice' },
      { id: 'lh-3', name: 'Stage 1.3: TypoException (Boss)', levelRecommended: 3, unlocked: false, completed: false, enemies: ['SpellMistake'], bossName: 'TypoException' },
    ]
  },
  {
    id: 'git',
    name: 'Git Repository',
    description: 'A shared code directory under version control. Beware of merge conflicts.',
    completed: false,
    stages: [
      { id: 'git-1', name: 'Stage 2.1: Track Unstaged Changes', levelRecommended: 4, unlocked: false, completed: false, enemies: ['UntrackedFile'], bossName: 'Git Lockfile' },
      { id: 'git-2', name: 'Stage 2.2: Detached HEAD State', levelRecommended: 5, unlocked: false, completed: false, enemies: ['LostCommit', 'DanglingPointer'], bossName: 'BrokenSymlink' },
      { id: 'git-3', name: 'Stage 2.3: Merge Conflict (Boss)', levelRecommended: 6, unlocked: false, completed: false, enemies: ['DoubleDefine'], bossName: 'Merge Conflict' },
    ]
  },
  {
    id: 'staging',
    name: 'Staging Environment',
    description: 'A cloud replication cluster. Latency and load tests reside here.',
    completed: false,
    stages: [
      { id: 'stg-1', name: 'Stage 3.1: Locate Memory Leak', levelRecommended: 7, unlocked: false, completed: false, enemies: ['LeakHeap'], bossName: 'GarbageCollector Fail' },
      { id: 'stg-2', name: 'Stage 3.2: Solve Port Collision', levelRecommended: 8, unlocked: false, completed: false, enemies: ['PortBlocked', 'TimeoutException'], bossName: 'WebsocketCrash' },
      { id: 'stg-3', name: 'Stage 3.3: OutOfMemoryError (Boss)', levelRecommended: 9, unlocked: false, completed: false, enemies: ['StackOverflow'], bossName: 'OutOfMemoryError' },
    ]
  },
  {
    id: 'production',
    name: 'Production Cluster',
    description: 'THE REAL WORLD. Millions of concurrent active clients. Failure is critical.',
    completed: false,
    stages: [
      { id: 'prd-1', name: 'Stage 4.1: Counter DDoS Attack', levelRecommended: 10, unlocked: false, completed: false, enemies: ['BotnetRequest'], bossName: 'RateLimit Bypass' },
      { id: 'prd-2', name: 'Stage 4.2: Stop SQL Injection', levelRecommended: 11, unlocked: false, completed: false, enemies: ['MalformedQuery', 'EscapedString'], bossName: 'DataLeakage' },
      { id: 'prd-3', name: 'Stage 4.3: Production Outage (Boss)', levelRecommended: 12, unlocked: false, completed: false, enemies: ['HardwareFault'], bossName: 'Production Outage' },
    ]
  }
];

const SHOP_ITEMS: RpgItem[] = [
  // Weapons
  { id: 'w-key', name: 'Mechanical Keyboard (Blue Switches)', description: 'Clicks loudly. Adds +12 Attack.', type: 'weapon', attackBonus: 12, cost: 50, count: 0 },
  { id: 'w-mouse', name: 'Optical Gaming Mouse (RGB)', description: 'DPI settings over 9000. Adds +8 Attack, +8% Crit Rate.', type: 'weapon', attackBonus: 8, critBonus: 0.08, cost: 80, count: 0 },
  { id: 'w-monitor', name: '4K Ultra-Wide Monitor', description: 'See bugs before they compile. Adds +25 Attack, +5% Crit Rate.', type: 'weapon', attackBonus: 25, critBonus: 0.05, cost: 220, count: 0 },
  
  // Armors
  { id: 'a-hood', name: 'Corporate Branded Hoodie', description: 'Gives maximum comfort. Adds +5 Defense, +30 Max HP.', type: 'armor', defenseBonus: 5, hpBonus: 30, cost: 40, count: 0 },
  { id: 'a-phones', name: 'Active Noise-Cancelling Headphones', description: 'Blocks manager complaints. Adds +10 Defense, +20 Max Mana.', type: 'armor', defenseBonus: 10, cost: 90, count: 0 },
  { id: 'a-glasses', name: 'Blue-Light Filtering Glasses', description: 'Blocks harmful radiation. Adds +18 Defense, +50 Max HP.', type: 'armor', defenseBonus: 18, hpBonus: 50, cost: 180, count: 0 },

  // Consumables
  { id: 'c-coffee', name: 'Double Shot Espresso', description: 'Restores 45 Mana. Speeds up brain ticks.', type: 'consumable', effectType: 'heal_mana', effectValue: 45, cost: 10, count: 0 },
  { id: 'c-pizza', name: 'Cold leftover Pizza', description: 'Heals 50 HP. Classic programmer fuel.', type: 'consumable', effectType: 'heal_hp', effectValue: 50, cost: 15, count: 0 },
  { id: 'c-energy', name: 'RedBull of Stamina', description: 'Heals 100 HP, Restores 100 Mana.', type: 'consumable', effectType: 'heal_hp', effectValue: 100, cost: 35, count: 0 }
];

const PARTY_POOL: PartyMember[] = [
  { id: 'p-intern', name: 'QA Intern', role: 'Manual Tester', attackContribution: 4, buffDescription: '+4 Auto Attack DPS', rarity: 'common' },
  { id: 'p-junior', name: 'Junior Backend', role: 'Node.js Novice', attackContribution: 10, buffDescription: '+10 Auto Attack DPS', rarity: 'common' },
  { id: 'p-dba', name: 'DBA Arch-Mage', role: 'SQL Query Optimizer', attackContribution: 28, buffDescription: '+28 Auto Attack DPS', rarity: 'rare' },
  { id: 'p-architect', name: 'Cloud Architect', role: 'Kubernetes Guru', attackContribution: 65, buffDescription: '+65 Auto Attack DPS', rarity: 'rare' },
  { id: 'p-ninja', name: '10x Ninja Developer', role: 'Legacy Stack Crusher', attackContribution: 180, buffDescription: '+180 Auto Attack DPS', rarity: 'legendary' }
];

const ENEMY_STATS: Record<string, { hp: number, attack: number, defense: number, xp: number, gold: number }> = {
  'SyntaxError': { hp: 35, attack: 4, defense: 1, xp: 12, gold: 10 },
  'UndefinedVar': { hp: 55, attack: 6, defense: 2, xp: 20, gold: 18 },
  'NullRefException': { hp: 60, attack: 8, defense: 2, xp: 22, gold: 20 },
  'SpellMistake': { hp: 45, attack: 5, defense: 1, xp: 15, gold: 12 },
  'TypoException': { hp: 140, attack: 12, defense: 4, xp: 60, gold: 50 },

  'UntrackedFile': { hp: 110, attack: 14, defense: 5, xp: 50, gold: 40 },
  'LostCommit': { hp: 140, attack: 16, defense: 6, xp: 65, gold: 55 },
  'DanglingPointer': { hp: 150, attack: 18, defense: 5, xp: 70, gold: 60 },
  'BrokenSymlink': { hp: 130, attack: 15, defense: 8, xp: 60, gold: 50 },
  'Merge Conflict': { hp: 400, attack: 28, defense: 12, xp: 220, gold: 150 },

  'LeakHeap': { hp: 280, attack: 30, defense: 15, xp: 150, gold: 100 },
  'PortBlocked': { hp: 320, attack: 34, defense: 18, xp: 180, gold: 120 },
  'TimeoutException': { hp: 340, attack: 36, defense: 15, xp: 190, gold: 130 },
  'GarbageCollector Fail': { hp: 300, attack: 32, defense: 20, xp: 170, gold: 110 },
  'OutOfMemoryError': { hp: 900, attack: 58, defense: 25, xp: 600, gold: 450 },

  'BotnetRequest': { hp: 650, attack: 62, defense: 30, xp: 450, gold: 300 },
  'MalformedQuery': { hp: 800, attack: 70, defense: 35, xp: 550, gold: 400 },
  'EscapedString': { hp: 750, attack: 65, defense: 40, xp: 500, gold: 350 },
  'RateLimit Bypass': { hp: 700, attack: 68, defense: 32, xp: 480, gold: 320 },
  'DataLeakage': { hp: 900, attack: 80, defense: 45, xp: 700, gold: 500 },
  'HardwareFault': { hp: 1000, attack: 90, defense: 50, xp: 800, gold: 600 },
  'Production Outage': { hp: 2800, attack: 135, defense: 75, xp: 2500, gold: 2000 }
};

const LOCAL_STORAGE_KEY = 'bug_combat_rpg_game_state';

export const useRpgState = () => {
  const [state, setState] = useState<RpgGameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load RPG save state:', e);
    }
    return {
      selectedClass: null,
      heroName: 'Developer',
      hero: null,
      activeEnemy: null,
      activeDungeonId: 'localhost',
      activeStageId: 'lh-1',
      inCombat: false,
      combatLogs: ['Select a class to begin your debugging adventure.'],
      dungeons: INITIAL_DUNGEONS,
      partyPool: PARTY_POOL
    };
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Auto-save state
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // RESET RPG Game
  const resetRpg = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({
      selectedClass: null,
      heroName: 'Developer',
      hero: null,
      activeEnemy: null,
      activeDungeonId: 'localhost',
      activeStageId: 'lh-1',
      inCombat: false,
      combatLogs: ['Game reset. Select class.'],
      dungeons: INITIAL_DUNGEONS,
      partyPool: PARTY_POOL
    });
  };

  // Debug Update Hero Stats (cheats and testing)
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

  // Helper: Create Class Stats
  const createHero = (heroClass: HeroClass, name: string): RpgHero => {
    let baseHp = 100;
    let baseMana = 100;
    let baseAttack = 10;
    let baseDefense = 5;
    let critRate = 0.05;
    let skills: RpgSkill[] = [];

    switch (heroClass) {
      case 'wizard': // Frontend Dev
        baseHp = 90;
        baseMana = 140;
        baseAttack = 16;
        baseDefense = 3;
        critRate = 0.08;
        skills = [
          { id: 'wz-1', name: 'CSS Flex Constraint', description: 'Tethers the bug layout. Deals x1.5 attack and slows enemy.', manaCost: 15, cooldown: 4, currentCooldown: 0, type: 'status', power: 1.5 },
          { id: 'wz-2', name: 'React Re-render Spam', description: 'Overloads DOM. Multi-hit strike dealing x3.0 attack.', manaCost: 40, cooldown: 12, currentCooldown: 0, type: 'damage', power: 3.0 }
        ];
        break;
      case 'guardian': // Backend Dev
        baseHp = 140;
        baseMana = 60;
        baseAttack = 11;
        baseDefense = 9;
        critRate = 0.04;
        skills = [
          { id: 'gd-1', name: 'Try/Catch Safety Block', description: 'Surrounds hero in an error handling shield. Heals 35 HP.', manaCost: 15, cooldown: 6, currentCooldown: 0, type: 'heal', power: 35 },
          { id: 'gd-2', name: 'Atomic SQL Transaction', description: 'Guarantees execution. Deals x2.2 attack bypassing 50% defense.', manaCost: 25, cooldown: 8, currentCooldown: 0, type: 'damage', power: 2.2 }
        ];
        break;
      case 'warlock': // DevOps Dev
        baseHp = 110;
        baseMana = 90;
        baseAttack = 13;
        baseDefense = 6;
        critRate = 0.06;
        skills = [
          { id: 'wl-1', name: 'Docker Health Check', description: 'Trigger container restart. Regenerates 8 HP/sec for 6 seconds.', manaCost: 20, cooldown: 10, currentCooldown: 0, type: 'shield', power: 8 },
          { id: 'wl-2', name: 'Kubernetes Cluster Nuke', description: 'Recreates the cluster. Deals x2.5 attack AoE.', manaCost: 35, cooldown: 15, currentCooldown: 0, type: 'damage', power: 2.5 }
        ];
        break;
      case 'rogue': // QA Tester
        baseHp = 95;
        baseMana = 80;
        baseAttack = 15;
        baseDefense = 4;
        critRate = 0.22;
        skills = [
          { id: 'rg-1', name: 'Boundary Value Test', description: 'Strikes exact edge coordinates. Deals x1.8 damage (100% crit chance).', manaCost: 20, cooldown: 5, currentCooldown: 0, type: 'damage', power: 1.8 },
          { id: 'rg-2', name: 'Chaos Monkey Script', description: 'Fires random user actions. Deals x1.0 to x4.5 damage randomly.', manaCost: 30, cooldown: 9, currentCooldown: 0, type: 'damage', power: 1.0 }
        ];
        break;
    }

    return {
      name: name || 'Developer',
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
      gold: 50, // Starting budget
      equippedWeapon: null,
      equippedArmor: null,
      skills,
      inventory: SHOP_ITEMS.map(item => ({ ...item, count: 0 })),
      party: []
    };
  };

  const selectHeroClass = (heroClass: HeroClass, name: string) => {
    const hero = createHero(heroClass, name);
    setState(prev => ({
      ...prev,
      selectedClass: heroClass,
      heroName: name || 'Developer',
      hero,
      combatLogs: [`Character ${name} initialized as ${heroClass.toUpperCase()}. Ready to debug.`]
    }));
  };

  // Start Dungeon Stage
  const startStage = (dungeonId: string, stageId: string) => {
    setState(prev => {
      const dungeon = prev.dungeons.find(d => d.id === dungeonId);
      const stage = dungeon?.stages.find(s => s.id === stageId);
      if (!dungeon || !stage || !stage.unlocked || !prev.hero) return prev;

      // Spawn first enemy in stage list
      const enemyName = stage.enemies[0];
      const stats = ENEMY_STATS[enemyName] || { hp: 50, attack: 5, defense: 2, xp: 10, gold: 10 };
      
      const activeEnemy: RpgEnemy = {
        id: `enemy-${Date.now()}`,
        name: enemyName,
        hp: stats.hp,
        maxHp: stats.hp,
        attack: stats.attack,
        defense: stats.defense,
        xpReward: stats.xp,
        goldReward: stats.gold,
        isBoss: false
      };

      const combatLogs = [
        ...prev.combatLogs,
        `Entering ${dungeon.name}: ${stage.name}.`,
        `A wild ${activeEnemy.name} block emerged! Prepare for battle.`
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
  };

  // Flee combat
  const fleeCombat = () => {
    setState(prev => ({
      ...prev,
      inCombat: false,
      activeEnemy: null,
      combatLogs: [...prev.combatLogs, 'Fled combat. Process terminated.'].slice(-30)
    }));
  };

  // Cast Active Skill
  const castSkill = (skillId: string) => {
    setState(prev => {
      const hero = prev.hero;
      const enemy = prev.activeEnemy;
      if (!hero || !enemy || !prev.inCombat) return prev;

      const skillIndex = hero.skills.findIndex(s => s.id === skillId);
      if (skillIndex === -1) return prev;
      
      const skill = hero.skills[skillIndex];
      if (hero.mana < skill.manaCost || skill.currentCooldown > 0) return prev;

      let nextHero = { ...hero };
      let nextEnemy = { ...enemy };
      let nextLogs = [...prev.combatLogs];

      // Deduct Mana, set Cooldown
      nextHero.mana -= skill.manaCost;
      nextHero.skills = hero.skills.map(s => {
        if (s.id === skillId) {
          return { ...s, currentCooldown: s.cooldown };
        }
        return s;
      });

      // Calculate base damage parameters
      const weaponBonus = hero.equippedWeapon?.attackBonus || 0;
      const weaponCrit = hero.equippedWeapon?.critBonus || 0;
      const totalAttack = hero.baseAttack + weaponBonus;
      const finalCrit = hero.critRate + weaponCrit;

      if (skill.type === 'damage' || skill.type === 'status') {
        let isCrit = Math.random() < finalCrit;
        let skillPower = skill.power;

        // Skill specific overrides
        if (skill.id === 'rg-1') {
          // Boundary value test is 100% crit
          isCrit = true;
        } else if (skill.id === 'rg-2') {
          // Chaos Monkey is random damage
          skillPower = 1.0 + Math.random() * 3.5;
        }

        let damage = Math.floor(totalAttack * skillPower);
        if (isCrit) {
          damage = Math.floor(damage * 1.6);
        }
        
        // Subtract defense
        const finalDamage = Math.max(1, damage - enemy.defense);
        nextEnemy.hp = Math.max(0, nextEnemy.hp - finalDamage);

        nextLogs.push(`Hero cast ${skill.name}! Dealt ${finalDamage} damage to ${enemy.name}${isCrit ? ' (CRITICAL!)' : ''}.`);
      } else if (skill.type === 'heal') {
        // Healing skill
        const heal = skill.power;
        nextHero.hp = Math.min(nextHero.maxHp, nextHero.hp + heal);
        nextLogs.push(`Hero cast ${skill.name}! Healed ${heal} HP.`);
      } else if (skill.type === 'shield') {
        // Shield / Regen
        // In Docker health check, we heal HP over time. We can just add instant flat heal or trigger regeneration logs
        const heal = skill.power * 5; // simplified instant effect for base loop
        nextHero.hp = Math.min(nextHero.maxHp, nextHero.hp + heal);
        nextLogs.push(`Hero cast ${skill.name}! Repaired container, restored ${heal} HP.`);
      }

      return {
        ...prev,
        hero: nextHero,
        activeEnemy: nextEnemy,
        combatLogs: nextLogs.slice(-30)
      };
    });
  };

  // Buy Shop Item
  const buyShopItem = (itemId: string) => {
    setState(prev => {
      const hero = prev.hero;
      if (!hero) return prev;

      const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
      if (!shopItem || hero.gold < shopItem.cost) return prev;

      const inventory = hero.inventory.map(item => {
        if (item.id === itemId) {
          return { ...item, count: item.count + 1 };
        }
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

      // Deduct 1 count from inventory
      nextHero.inventory = hero.inventory.map(i => {
        if (i.id === itemId) return { ...i, count: i.count - 1 };
        return i;
      });

      if (targetItem.type === 'weapon') {
        // Unequip current weapon if any
        if (hero.equippedWeapon) {
          const oldWeapon = hero.equippedWeapon;
          nextHero.inventory = nextHero.inventory.map(i => {
            if (i.id === oldWeapon.id) return { ...i, count: i.count + 1 };
            return i;
          });
        }
        nextHero.equippedWeapon = targetItem;
        nextLogs.push(`Equipped Weapon: ${targetItem.name}`);
      } else if (targetItem.type === 'armor') {
        // Unequip current armor if any
        if (hero.equippedArmor) {
          const oldArmor = hero.equippedArmor;
          nextHero.inventory = nextHero.inventory.map(i => {
            if (i.id === oldArmor.id) return { ...i, count: i.count + 1 };
            return i;
          });
        }
        nextHero.equippedArmor = targetItem;
        nextLogs.push(`Equipped Armor: ${targetItem.name}`);
      }

      return {
        ...prev,
        hero: nextHero,
        combatLogs: nextLogs.slice(-30)
      };
    });
  };

  // Use Consumable Item
  const useConsumable = (itemId: string) => {
    setState(prev => {
      const hero = prev.hero;
      if (!hero) return prev;

      const itemIndex = hero.inventory.findIndex(i => i.id === itemId);
      if (itemIndex === -1 || hero.inventory[itemIndex].count <= 0) return prev;

      const targetItem = hero.inventory[itemIndex];
      let nextHero = { ...hero };
      let nextLogs = [...prev.combatLogs];

      // Deduct 1 count
      nextHero.inventory = hero.inventory.map(i => {
        if (i.id === itemId) return { ...i, count: i.count - 1 };
        return i;
      });

      if (targetItem.effectType === 'heal_hp') {
        const val = targetItem.effectValue || 0;
        nextHero.hp = Math.min(nextHero.maxHp, nextHero.hp + val);
        nextLogs.push(`Consumed ${targetItem.name}. Restored ${val} HP.`);
      } else if (targetItem.effectType === 'heal_mana') {
        const val = targetItem.effectValue || 0;
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

  // Hire Party Member
  const hirePartyMember = (memberId: string) => {
    setState(prev => {
      const hero = prev.hero;
      if (!hero) return prev;

      const poolMember = prev.partyPool.find(p => p.id === memberId);
      if (!poolMember) return prev;

      // Hiring fee
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
        combatLogs: [...prev.combatLogs, `Hired ${poolMember.name} (${poolMember.role}) to party.`].slice(-30)
      };
    });
  };

  // --- RPG GAME LOOP TICK ---
  // Ticks handle active real-time combat cooling down skills and auto attacks
  useEffect(() => {
    const interval = setInterval(() => {
      const curState = stateRef.current;
      if (!curState.inCombat || !curState.hero || !curState.activeEnemy) return;

      let nextHero = { ...curState.hero };
      let nextEnemy = { ...curState.activeEnemy };
      let nextLogs = [...curState.combatLogs];
      let endCombat = false;
      let newDungeons = [...curState.dungeons];

      // 1. Decrement skill cooldowns (100ms ticks -> decrement by 0.1s)
      nextHero.skills = curState.hero.skills.map(s => {
        if (s.currentCooldown > 0) {
          return { ...s, currentCooldown: Math.max(0, Number((s.currentCooldown - 0.1).toFixed(1))) };
        }
        return s;
      });

      // 2. Hero and Party Auto Attack (ticks are 100ms)
      // Base attack occurs on chance: 1/15 chance (~1.5s interval)
      if (Math.random() < 0.07) {
        const weaponBonus = nextHero.equippedWeapon?.attackBonus || 0;
        const weaponCrit = nextHero.equippedWeapon?.critBonus || 0;
        const totalAttack = nextHero.baseAttack + weaponBonus;
        const finalCrit = nextHero.critRate + weaponCrit;

        const isCrit = Math.random() < finalCrit;
        let damage = totalAttack;
        if (isCrit) damage = Math.floor(damage * 1.5);

        // Add party contributions
        const partyDps = nextHero.party.reduce((acc, p) => acc + p.attackContribution, 0);
        const finalDpsTick = Math.max(0, Math.floor(partyDps * 0.15));

        const finalDamage = Math.max(1, damage - nextEnemy.defense) + finalDpsTick;
        nextEnemy.hp = Math.max(0, nextEnemy.hp - finalDamage);

        nextLogs.push(`Hero attacks: Dealt ${finalDamage} damage to ${nextEnemy.name}.${isCrit ? ' (CRIT!)' : ''}`);
      }

      // 3. Enemy attacks Hero: 1/20 chance (~2.0s interval)
      if (nextEnemy.hp > 0 && Math.random() < 0.05) {
        const armorBonus = nextHero.equippedArmor?.defenseBonus || 0;
        const totalDefense = nextHero.baseDefense + armorBonus;

        const damage = Math.max(1, nextEnemy.attack - totalDefense);
        nextHero.hp = Math.max(0, nextHero.hp - damage);

        nextLogs.push(`💥 ${nextEnemy.name} strikes: Dealt ${damage} damage to Hero.`);
      }

      // 4. Check Defeated Statuses
      if (nextHero.hp <= 0) {
        // Hero Defeated
        endCombat = true;
        const goldLoss = Math.floor(nextHero.gold * 0.1); // Lose 10% gold
        nextHero.hp = Math.floor(nextHero.maxHp * 0.5); // Revive at 50% HP
        nextHero.mana = nextHero.maxMana;
        nextHero.gold = Math.max(0, nextHero.gold - goldLoss);
        nextLogs.push(`💀 DEFEATED! Process Terminated. Lost ${goldLoss}g budget. HP restored to 50%.`);
      } else if (nextEnemy.hp <= 0) {
        // Enemy Defeated
        endCombat = true;
        nextHero.gold += nextEnemy.goldReward;
        nextHero.xp += nextEnemy.xpReward;
        nextLogs.push(`🏆 SUCCESS! Defeated ${nextEnemy.name}. Gained ${nextEnemy.xpReward} XP and ${nextEnemy.goldReward}g.`);

        // Level Up Checking
        if (nextHero.xp >= nextHero.maxXp) {
          nextHero.level += 1;
          nextHero.xp = nextHero.xp - nextHero.maxXp;
          nextHero.maxXp = Math.floor(nextHero.maxXp * 1.5);
          nextHero.maxHp = Math.floor(nextHero.maxHp * 1.15) + 10;
          nextHero.maxMana = Math.floor(nextHero.maxMana * 1.1) + 5;
          nextHero.hp = nextHero.maxHp;
          nextHero.mana = nextHero.maxMana;
          nextHero.baseAttack = Math.floor(nextHero.baseAttack * 1.15) + 2;
          nextHero.baseDefense = Math.floor(nextHero.baseDefense * 1.12) + 1;
          nextLogs.push(`📈 LEVEL UP! Hero reached Level ${nextHero.level}! Attack and Defense increased.`);
        }

        // Dungeon Stage Completion Logic
        const dungId = curState.activeDungeonId;
        const stgId = curState.activeStageId;

        newDungeons = curState.dungeons.map(d => {
          if (d.id === dungId) {
            const updatedStages = d.stages.map((stg, index) => {
              if (stg.id === stgId) {
                // If it is the boss/last enemy, complete stage
                return { ...stg, completed: true };
              }
              // Unlock next stage if previous completed
              const prev = d.stages[index - 1];
              if (prev && prev.id === stgId) {
                return { ...stg, unlocked: true };
              }
              return stg;
            });

            // Unlock next dungeon if last stage is completed
            const isLastStageCompleted = updatedStages[updatedStages.length - 1].completed;
            return {
              ...d,
              stages: updatedStages,
              completed: isLastStageCompleted
            };
          }

          return d;
        });

        // Let's resolve the next dungeon unlocking sequence correctly
        const activeDungIndex = curState.dungeons.findIndex(d => d.id === dungId);
        const nextDung = curState.dungeons[activeDungIndex + 1];

        // If the current dungeon is marked completed, unlock the first stage of the next dungeon
        const currentDungCompleted = newDungeons[activeDungIndex].completed;
        if (currentDungCompleted && nextDung) {
          newDungeons = newDungeons.map((d, idx) => {
            if (idx === activeDungIndex + 1) {
              const updatedStages = d.stages.map((s, sIdx) => sIdx === 0 ? { ...s, unlocked: true } : s);
              return { ...d, stages: updatedStages };
            }
            return d;
          });
          nextLogs.push(`📂 NEW SERVER DIRECTORY UNLOCKED: ${nextDung.name}!`);
        }
      }

      setState(prev => ({
        ...prev,
        hero: nextHero,
        activeEnemy: endCombat ? null : nextEnemy,
        inCombat: !endCombat,
        combatLogs: nextLogs.slice(-30),
        dungeons: newDungeons
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return {
    state,
    selectHeroClass,
    startStage,
    fleeCombat,
    castSkill,
    buyShopItem,
    equipItem,
    useConsumable,
    hirePartyMember,
    resetRpg,
    debugUpdateHero,
  };
};
export default useRpgState;
