import { useState, useEffect, useRef } from 'react';
import { GameState, GameStage, AestheticTheme, AutoClicker, RpgHero, RpgEnemy, Stock, DeveloperCard, Achievement, GameSettings, WanderingBug } from './types';

const INITIAL_AUTO_CLICKERS: AutoClicker[] = [
  { id: 'intern', name: 'Underpaid Intern', cost: 10, baseCost: 10, cps: 0.2, count: 0, description: 'Generates 0.2 creep/sec. Spills coffee on the keyboard.' },
  { id: 'junior', name: 'Junior Developer', cost: 50, baseCost: 50, cps: 1.5, count: 0, description: 'Generates 1.5 creep/sec. Adds "TODO: fix this" comments.' },
  { id: 'senior', name: 'Senior Architect', cost: 250, baseCost: 250, cps: 10, count: 0, description: 'Generates 10 creep/sec. Refactors working code into a abstract factory.' },
  { id: 'manager', name: 'Product Manager', cost: 1000, baseCost: 1000, cps: 50, count: 0, description: 'Generates 50 creep/sec. Schedules daily standups about schedules.' },
];

const INITIAL_STOCKS: Stock[] = [
  { symbol: 'SaaS', name: 'SaaSify Inc.', price: 10, history: [10], volatility: 0.15, drift: 0.01 },
  { symbol: 'BLOT', name: 'BloatCo', price: 20, history: [20], volatility: 0.25, drift: -0.005 },
  { symbol: 'LEG', name: 'LegacyTech', price: 5, history: [5], volatility: 0.08, drift: 0.002 },
  { symbol: 'CRP', name: 'CreepSoft', price: 50, history: [50], volatility: 0.35, drift: 0.02 },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_click', name: 'Hello World', description: 'Click the Creep Generator button for the first time.', unlocked: false },
  { id: 'intern_hired', name: 'Exploitation', description: 'Hire your first Underpaid Intern.', unlocked: false },
  { id: 'rpg_unlocked', name: 'Bug Hunter', description: 'Unlock RPG Combat.', unlocked: false },
  { id: 'first_bug_squashed', name: 'Debugger', description: 'Defeat a software bug in RPG Combat.', unlocked: false },
  { id: 'stock_unlocked', name: 'Wall Street', description: 'Unlock the Stock Market.', unlocked: false },
  { id: 'gacha_unlocked', name: '10x Developer', description: 'Unlock Gacha summons.', unlocked: false },
  { id: 'legendary_dev', name: 'AI Overlord', description: 'Summon a Legendary developer.', unlocked: false },
  { id: 'gravity_max', name: 'Zero G-Force', description: 'Set game gravity to the absolute maximum.', unlocked: false },
];

const ENEMY_TEMPLATES = [
  { name: 'NullPointerException', baseHp: 30, baseAttack: 2, xpReward: 15, goldReward: 10 },
  { name: 'Merge Conflict', baseHp: 60, baseAttack: 5, xpReward: 30, goldReward: 25 },
  { name: 'Unintended Recursion', baseHp: 120, baseAttack: 12, xpReward: 65, goldReward: 60 },
  { name: 'Legacy Code Monster', baseHp: 300, baseAttack: 25, xpReward: 150, goldReward: 150 },
  { name: 'Production Outage', baseHp: 1000, baseAttack: 60, xpReward: 500, goldReward: 500 },
];

const GACHA_POOL: Omit<DeveloperCard, 'id'>[] = [
  // Commons
  { name: 'Junior Front-End', rarity: 'common', role: 'UI Developer', bonusText: '+20% Click Power', clickMultiplier: 1.2, autoClickMultiplier: 1.0, rpgMultiplier: 1.0, color: '#3b82f6' },
  { name: 'DevOps Intern', rarity: 'common', role: 'Pipeline Destroyer', bonusText: '+15% Auto-click Speed', clickMultiplier: 1.0, autoClickMultiplier: 1.15, rpgMultiplier: 1.0, color: '#10b981' },
  { name: 'QA Analyst', rarity: 'common', role: 'Bug Finder', bonusText: '+15% Hero Defense', clickMultiplier: 1.0, autoClickMultiplier: 1.0, rpgMultiplier: 1.15, color: '#f59e0b' },
  // Rares
  { name: 'Senior Fullstack', rarity: 'rare', role: 'Fire Fighter', bonusText: '+40% Click, +20% Auto', clickMultiplier: 1.4, autoClickMultiplier: 1.2, rpgMultiplier: 1.0, color: '#a855f7' },
  { name: 'DBA Wizard', rarity: 'rare', role: 'Index Creator', bonusText: '+30% Auto, +20% Hero Attack', clickMultiplier: 1.0, autoClickMultiplier: 1.3, rpgMultiplier: 1.2, color: '#ec4899' },
  // Legendaries
  { name: '10x Developer', rarity: 'legendary', role: 'Mythical Beast', bonusText: '+100% Clicks, +50% Auto, +50% RPG', clickMultiplier: 2.0, autoClickMultiplier: 1.5, rpgMultiplier: 1.5, color: '#ef4444' },
  { name: 'AGI Assistant', rarity: 'legendary', role: 'Code Generator', bonusText: 'Triples Clicks, Double Auto-click Speed', clickMultiplier: 3.0, autoClickMultiplier: 2.0, rpgMultiplier: 1.2, color: '#14b8a6' },
];

const LOCAL_STORAGE_KEY = 'feature_creep_game_state';

const createEnemy = (level: number): RpgEnemy => {
  const template = ENEMY_TEMPLATES[Math.min(level - 1, ENEMY_TEMPLATES.length - 1)];
  const scale = 1 + (level - 1) * 0.45;
  return {
    id: `bug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: `${template.name} v${level}.0`,
    hp: Math.floor(template.baseHp * scale),
    maxHp: Math.floor(template.baseHp * scale),
    attack: Math.floor(template.baseAttack * scale),
    xpReward: Math.floor(template.xpReward * scale),
    goldReward: Math.floor(template.goldReward * scale),
  };
};

export const useGameState = () => {
  const [state, setState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure lists and references exist
        if (parsed.stocks && parsed.stocks.length === 0) parsed.stocks = INITIAL_STOCKS;
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load save state:', e);
    }
    return {
      clicks: 0,
      creep: 0,
      creepMultiplier: 1,
      stage: 0,
      theme: 'terminal',
      autoClickers: INITIAL_AUTO_CLICKERS,
      hero: {
        level: 1,
        xp: 0,
        maxXp: 100,
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 2,
        gold: 0,
        weapon: { name: 'Rusty Keyboard', cost: 50, attackBonus: 5 },
        armor: { name: 'Hoodie of Comfort', cost: 50, defenseBonus: 2 }
      },
      activeEnemy: null,
      rpgLogs: ['Combat interface initialized.'],
      stocks: INITIAL_STOCKS,
      portfolio: { balance: 100, shares: { SaaS: 0, BLOT: 0, LEG: 0, CRP: 0 } },
      gachaCards: [],
      achievements: INITIAL_ACHIEVEMENTS,
      settings: { gravity: 0, chaos: false, volume: 50, bugSpawnerActive: false },
      wanderingBugs: [],
      gachaPulls: 0,
      gachaCost: 100
    };
  });

  const [pendingFeature, setPendingFeature] = useState<{ stage: GameStage; name: string } | null>(null);

  // Keep ref to latest state for setinterval hooks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Reset Game
  const resetGame = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setState({
      clicks: 0,
      creep: 0,
      creepMultiplier: 1,
      stage: 0,
      theme: 'terminal',
      autoClickers: INITIAL_AUTO_CLICKERS.map(c => ({ ...c, count: 0, cost: c.baseCost })),
      hero: {
        level: 1,
        xp: 0,
        maxXp: 100,
        hp: 100,
        maxHp: 100,
        attack: 10,
        defense: 2,
        gold: 0,
        weapon: { name: 'Rusty Keyboard', cost: 50, attackBonus: 5 },
        armor: { name: 'Hoodie of Comfort', cost: 50, defenseBonus: 2 }
      },
      activeEnemy: null,
      rpgLogs: ['Game reset.'],
      stocks: INITIAL_STOCKS,
      portfolio: { balance: 100, shares: { SaaS: 0, BLOT: 0, LEG: 0, CRP: 0 } },
      gachaCards: [],
      achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false })),
      settings: { gravity: 0, chaos: false, volume: 50, bugSpawnerActive: false },
      wanderingBugs: [],
      gachaPulls: 0,
      gachaCost: 100
    });
    setPendingFeature(null);
  };

  // Helper: Trigger Achievement
  const triggerAchievement = (id: string) => {
    setState(prev => {
      const achievements = prev.achievements.map(a => {
        if (a.id === id && !a.unlocked) {
          return { ...a, unlocked: true, unlockedAt: Date.now() };
        }
        return a;
      });
      return { ...prev, achievements };
    });
  };

  // Click handler
  const handleGenerateCreep = () => {
    const devClickMult = state.gachaCards.reduce((acc, card) => acc * card.clickMultiplier, 1);
    const rpgLevelBonus = 1 + (state.hero.level - 1) * 0.1;
    const finalMultiplier = state.creepMultiplier * devClickMult * rpgLevelBonus;

    setState(prev => {
      const nextCreep = prev.creep + finalMultiplier;
      const nextClicks = prev.clicks + 1;
      return { ...prev, creep: nextCreep, clicks: nextClicks };
    });

    triggerAchievement('first_click');
  };

  // Purchase Auto Clicker
  const buyAutoClicker = (id: string) => {
    setState(prev => {
      const target = prev.autoClickers.find(c => c.id === id);
      if (!target || prev.creep < target.cost) return prev;

      const updatedClickers = prev.autoClickers.map(c => {
        if (c.id === id) {
          const nextCount = c.count + 1;
          const nextCost = Math.ceil(c.baseCost * Math.pow(1.15, nextCount));
          return { ...c, count: nextCount, cost: nextCost };
        }
        return c;
      });

      return {
        ...prev,
        creep: prev.creep - target.cost,
        autoClickers: updatedClickers
      };
    });

    if (id === 'intern') triggerAchievement('intern_hired');
  };

  // RPG Equipment Upgrades
  const buyWeapon = () => {
    setState(prev => {
      const cost = prev.hero.weapon.cost;
      if (prev.hero.gold < cost) return prev;
      const currentBonus = prev.hero.weapon.attackBonus;
      const nextBonus = Math.floor(currentBonus * 1.5) + 3;
      const nextCost = Math.ceil(cost * 1.8);
      const nextWeapon = {
        name: `Keyboard of Power +${prev.hero.level}`,
        cost: nextCost,
        attackBonus: nextBonus
      };

      const hero = {
        ...prev.hero,
        gold: prev.hero.gold - cost,
        weapon: nextWeapon,
        attack: prev.hero.attack + (nextBonus - currentBonus)
      };

      return { ...prev, hero };
    });
  };

  const buyArmor = () => {
    setState(prev => {
      const cost = prev.hero.armor.cost;
      if (prev.hero.gold < cost) return prev;
      const currentBonus = prev.hero.armor.defenseBonus;
      const nextBonus = Math.floor(currentBonus * 1.5) + 1;
      const nextCost = Math.ceil(cost * 1.8);
      const nextArmor = {
        name: `Hoodie of Comfort +${prev.hero.level}`,
        cost: nextCost,
        defenseBonus: nextBonus
      };

      const hero = {
        ...prev.hero,
        gold: prev.hero.gold - cost,
        armor: nextArmor,
        defense: prev.hero.defense + (nextBonus - currentBonus)
      };

      return { ...prev, hero };
    });
  };

  // Stock Market Transactions
  const buyStock = (symbol: string, sharesCount: number) => {
    setState(prev => {
      const stock = prev.stocks.find(s => s.symbol === symbol);
      if (!stock) return prev;
      const totalCost = stock.price * sharesCount;
      if (prev.portfolio.balance < totalCost) return prev;

      const currentShares = prev.portfolio.shares[symbol] || 0;
      const portfolio = {
        ...prev.portfolio,
        balance: prev.portfolio.balance - totalCost,
        shares: {
          ...prev.portfolio.shares,
          [symbol]: currentShares + sharesCount
        }
      };

      return { ...prev, portfolio };
    });
  };

  const sellStock = (symbol: string, sharesCount: number) => {
    setState(prev => {
      const stock = prev.stocks.find(s => s.symbol === symbol);
      const currentShares = prev.portfolio.shares[symbol] || 0;
      if (!stock || currentShares < sharesCount) return prev;

      const totalRevenue = stock.price * sharesCount;
      const portfolio = {
        ...prev.portfolio,
        balance: prev.portfolio.balance + totalRevenue,
        shares: {
          ...prev.portfolio.shares,
          [symbol]: currentShares - sharesCount
        }
      };

      return { ...prev, portfolio };
    });
  };

  // Convert Creep to Stock Cash and vice-versa
  const convertCreepToCash = (amount: number) => {
    setState(prev => {
      if (prev.creep < amount) return prev;
      const cashGained = amount * 0.1; // 10 creeps = $1
      const portfolio = {
        ...prev.portfolio,
        balance: prev.portfolio.balance + cashGained
      };
      return {
        ...prev,
        creep: prev.creep - amount,
        portfolio
      };
    });
  };

  const convertCashToCreep = (amount: number) => {
    setState(prev => {
      if (prev.portfolio.balance < amount) return prev;
      const creepGained = amount * 10;
      const portfolio = {
        ...prev.portfolio,
        balance: prev.portfolio.balance - amount
      };
      return {
        ...prev,
        creep: prev.creep + creepGained,
        portfolio
      };
    });
  };

  // Convert Stock Balance or RPG Gold to Gacha Tickets
  const buyGachaTicket = () => {
    setState(prev => {
      const cost = 25; // $25 in portfolio
      if (prev.portfolio.balance < cost) return prev;
      const portfolio = {
        ...prev.portfolio,
        balance: prev.portfolio.balance - cost
      };
      return {
        ...prev,
        portfolio,
        // Awarding some creep to pull gacha
        creep: prev.creep + 100
      };
    });
  };

  // Summon Gacha Dev Card
  const summonGacha = () => {
    setState(prev => {
      if (prev.creep < prev.gachaCost) return prev;

      // Drop rate percentages: Common 60%, Rare 30%, Legendary 10%
      const rand = Math.random() * 100;
      let rarity: 'common' | 'rare' | 'legendary' = 'common';
      if (rand >= 90) rarity = 'legendary';
      else if (rand >= 60) rarity = 'rare';

      const pool = GACHA_POOL.filter(card => card.rarity === rarity);
      const chosenTemplate = pool[Math.floor(Math.random() * pool.length)];

      const newCard: DeveloperCard = {
        ...chosenTemplate,
        id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      };

      const gachaPulls = prev.gachaPulls + 1;
      const gachaCost = Math.ceil(prev.gachaCost * 1.1); // Cost increases per pull

      return {
        ...prev,
        creep: prev.creep - prev.gachaCost,
        gachaPulls,
        gachaCost,
        gachaCards: [...prev.gachaCards, newCard]
      };
    });

    // Check achievement triggers
    setTimeout(() => {
      const latestState = stateRef.current;
      const lastPulled = latestState.gachaCards[latestState.gachaCards.length - 1];
      if (lastPulled && lastPulled.rarity === 'legendary') {
        triggerAchievement('legendary_dev');
      }
    }, 100);
  };

  // Fire Developer
  const fireDeveloper = (id: string) => {
    setState(prev => ({
      ...prev,
      gachaCards: prev.gachaCards.filter(card => card.id !== id)
    }));
  };

  // Update Settings
  const updateSettings = (updates: Partial<GameSettings>) => {
    setState(prev => {
      const settings = { ...prev.settings, ...updates };
      return { ...prev, settings };
    });

    if (updates.gravity && updates.gravity >= 10) {
      triggerAchievement('gravity_max');
    }
  };

  // Wandering Bug Mechanics
  const spawnWanderingBug = () => {
    setState(prev => {
      if (prev.wanderingBugs.length >= 8) return prev;
      const names = ['NullPtrException', 'InfiniteLoop', 'DivByZero', 'MergeConflict', 'MemoryLeak'];
      const newBug: WanderingBug = {
        id: `wbug-${Date.now()}`,
        name: names[Math.floor(Math.random() * names.length)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        hp: 3,
        maxHp: 3
      };
      return { ...prev, wanderingBugs: [...prev.wanderingBugs, newBug] };
    });
  };

  const squashBug = (id: string) => {
    setState(prev => {
      const bug = prev.wanderingBugs.find(b => b.id === id);
      if (!bug) return prev;
      
      const newBugs = prev.wanderingBugs.map(b => {
        if (b.id === id) {
          return { ...b, hp: b.hp - 1 };
        }
        return b;
      }).filter(b => b.hp > 0);

      const gotKill = newBugs.length < prev.wanderingBugs.length;
      
      return {
        ...prev,
        wanderingBugs: newBugs,
        creep: gotKill ? prev.creep + 50 : prev.creep,
        hero: gotKill ? { ...prev.hero, gold: prev.hero.gold + 5 } : prev.hero
      };
    });
  };

  // Accept Feature Request
  const acceptFeature = () => {
    if (!pendingFeature) return;
    const targetStage = pendingFeature.stage;
    
    let targetTheme: AestheticTheme = 'terminal';
    if (targetStage === 1 || targetStage === 2) targetTheme = 'arcade';
    else if (targetStage === 3 || targetStage === 4) targetTheme = 'vaporwave';
    else if (targetStage >= 5) targetTheme = 'glassmorphic';

    setState(prev => ({
      ...prev,
      stage: targetStage,
      theme: targetTheme
    }));

    if (targetStage === 2) triggerAchievement('rpg_unlocked');
    if (targetStage === 3) triggerAchievement('stock_unlocked');
    if (targetStage === 4) triggerAchievement('gacha_unlocked');
    if (targetStage === 5) triggerAchievement('settings_unlocked');

    setPendingFeature(null);
  };

  // --- ENGINE TICKS ---
  useEffect(() => {
    const interval = setInterval(() => {
      const curState = stateRef.current;
      const devAutoMult = curState.gachaCards.reduce((acc, card) => acc * card.autoClickMultiplier, 1);
      
      // 1. Generate Creep from Auto-Clickers
      const baseCps = curState.autoClickers.reduce((acc, clicker) => acc + (clicker.cps * clicker.count), 0);
      const finalCps = baseCps * devAutoMult;
      const creepToAdd = finalCps * 0.1; // interval is 100ms
      
      // 2. RPG Combat Tick (runs every 100ms, but actions happen on timers)
      let nextHero = { ...curState.hero };
      let nextEnemy = curState.activeEnemy ? { ...curState.activeEnemy } : null;
      let nextLogs = [...curState.rpgLogs];

      if (curState.stage >= 2) {
        // Auto-spawn enemy if none
        if (!nextEnemy) {
          nextEnemy = createEnemy(nextHero.level);
          nextLogs.push(`A wild ${nextEnemy.name} appeared!`);
          if (nextLogs.length > 30) nextLogs.shift();
        } else {
          // Combat round (Hero attacks every 1.5s, Enemy attacks every 2.0s)
          // Simple tick counters stored in ref or using date timestamps
          const now = Date.now();
          const devRpgMult = curState.gachaCards.reduce((acc, card) => acc * card.rpgMultiplier, 1);

          // Hero auto-attack (ticks are 100ms, so we can use random chance or timestamps. Let's do random chance for simplicity, 1.5s attack period -> 1/15 chance per 100ms)
          if (Math.random() < 0.08) {
            const damage = Math.max(1, Math.floor(nextHero.attack * devRpgMult - (nextEnemy.name.includes('Production') ? 10 : 0)));
            nextEnemy.hp = Math.max(0, nextEnemy.hp - damage);
            nextLogs.push(`Hero attacks ${nextEnemy.name} for ${damage} damage!`);
            if (nextLogs.length > 30) nextLogs.shift();
          }

          // Enemy auto-attack (2s attack period -> 1/20 chance per 100ms)
          if (nextEnemy.hp > 0 && Math.random() < 0.05) {
            const damage = Math.max(1, nextEnemy.attack - nextHero.defense);
            nextHero.hp = Math.max(0, nextHero.hp - damage);
            nextLogs.push(`${nextEnemy.name} strikes Hero for ${damage} damage!`);
            if (nextLogs.length > 30) nextLogs.shift();
          }

          // Hero Defeated
          if (nextHero.hp <= 0) {
            nextLogs.push(`Hero was defeated by ${nextEnemy.name}! Resetting HP...`);
            if (nextLogs.length > 30) nextLogs.shift();
            nextHero.hp = nextHero.maxHp;
            nextEnemy = null;
          }
          // Enemy Defeated
          else if (nextEnemy.hp <= 0) {
            nextLogs.push(`Defeated ${nextEnemy.name}! Gained ${nextEnemy.xpReward} XP and ${nextEnemy.goldReward} Gold.`);
            if (nextLogs.length > 30) nextLogs.shift();
            
            nextHero.xp += nextEnemy.xpReward;
            nextHero.gold += nextEnemy.goldReward;
            
            // Level Up
            if (nextHero.xp >= nextHero.maxXp) {
              nextHero.level += 1;
              nextHero.xp = nextHero.xp - nextHero.maxXp;
              nextHero.maxXp = Math.floor(nextHero.maxXp * 1.5);
              nextHero.maxHp = Math.floor(nextHero.maxHp * 1.25);
              nextHero.hp = nextHero.maxHp;
              nextHero.attack = Math.floor(nextHero.attack * 1.25) + 2;
              nextHero.defense = Math.floor(nextHero.defense * 1.2) + 1;
              nextLogs.push(`LEVEL UP! Hero is now Level ${nextHero.level}!`);
              if (nextLogs.length > 30) nextLogs.shift();
            }

            nextEnemy = null;
            // Delaying achievement trigger to check
            setTimeout(() => triggerAchievement('first_bug_squashed'), 50);
          }
        }
      }

      // 3. Stock Market Tick (Fluctuates prices using random walk, drift)
      let nextStocks = curState.stocks.map(stock => {
        if (curState.stage < 3) return stock;
        
        // Random walk: next price = price * (1 + drift + volatility * random_normal)
        // Adjust drift based on bugs (more wandering bugs lowers prices)
        const bugPenalty = curState.wanderingBugs.length * -0.005;
        const randNormal = (Math.random() - 0.5) * 2; // approximation
        const priceChange = stock.price * (stock.drift + bugPenalty + stock.volatility * randNormal * 0.1);
        const newPrice = Math.max(0.1, Number((stock.price + priceChange).toFixed(2)));
        
        const history = [...stock.history, newPrice];
        if (history.length > 15) history.shift();
        
        return { ...stock, price: newPrice, history };
      });

      // 4. Wandering Bugs Move
      let nextWanderingBugs = curState.wanderingBugs.map(bug => {
        let nx = bug.x + bug.vx;
        let ny = bug.y + bug.vy;
        let nvx = bug.vx;
        let nvy = bug.vy;

        // Boundary bounce
        if (nx < 5 || nx > 95) nvx = -nvx;
        if (ny < 5 || ny > 95) nvy = -nvy;

        return { ...bug, x: nx, y: ny, vx: nvx, vy: nvy };
      });

      // Trigger automatic bug spawn in Stage 5 settings if active
      if (curState.stage >= 5 && curState.settings.bugSpawnerActive && Math.random() < 0.05 && nextWanderingBugs.length < 8) {
        const names = ['Bug', 'Glitch', 'Exception', 'Leak'];
        const newBug: WanderingBug = {
          id: `wbug-${Date.now()}`,
          name: names[Math.floor(Math.random() * names.length)],
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          hp: 3,
          maxHp: 3
        };
        nextWanderingBugs.push(newBug);
      }

      // Check Feature Requests thresholds (only if no pending requests)
      if (!pendingFeature) {
        const nextCreep = curState.creep + creepToAdd;
        if (curState.stage === 0 && nextCreep >= 10) {
          setPendingFeature({ stage: 1, name: 'Automated Creepers Tab' });
        } else if (curState.stage === 1 && nextCreep >= 150) {
          setPendingFeature({ stage: 2, name: 'RPG Software Bug Combat Tab' });
        } else if (curState.stage === 2 && nextCreep >= 500) {
          setPendingFeature({ stage: 3, name: 'Stock Market Exchange Simulator' });
        } else if (curState.stage === 3 && nextCreep >= 1500) {
          setPendingFeature({ stage: 4, name: 'Gacha Developer Summit Portal' });
        } else if (curState.stage === 4 && nextCreep >= 5000) {
          setPendingFeature({ stage: 5, name: 'Warp Settings & Wander Bug Spawner' });
        }
      }

      // 5. Update State
      setState(prev => ({
        ...prev,
        creep: prev.creep + creepToAdd,
        hero: nextHero,
        activeEnemy: nextEnemy,
        rpgLogs: nextLogs,
        stocks: nextStocks,
        wanderingBugs: nextWanderingBugs
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [pendingFeature]);

  return {
    state,
    pendingFeature,
    handleGenerateCreep,
    buyAutoClicker,
    buyWeapon,
    buyArmor,
    buyStock,
    sellStock,
    convertCreepToCash,
    convertCashToCreep,
    buyGachaTicket,
    summonGacha,
    fireDeveloper,
    updateSettings,
    spawnWanderingBug,
    squashBug,
    acceptFeature,
    resetGame,
  };
};
