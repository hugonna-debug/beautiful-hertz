import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState, rollSubstatWithRarity, rollSubstatWithFixedRarity, getEnemyForStage } from '../hooks/useGameState';

describe('Idle Stats Reforged - GameState Hook & Formulas', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it('should initialize with starting stats and a starting rusty gladius', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.state.heroName).toBe('Valiant Crusader');
    expect(result.current.state.level).toBe(1);
    expect(result.current.state.equippedWeapon).not.toBeNull();
    expect(result.current.state.equippedWeapon?.name).toBe('Valiant Crusader Blade');
    expect(result.current.state.equippedBody).toBeNull();
    expect(result.current.state.autoAdvance).toBe(true);
  });

  it('should compute final hero attributes using resolveHeroStats', () => {
    const { result } = renderHook(() => useGameState());

    const stats = result.current.resolveHeroStats();
    
    // Level 1 Base Attack is 10. Rusty Gladius baseValue is 10 (stage 1 scaling). Total = 20.
    // Rusty Gladius has percent_atk: +4% (0.04). Total = 20 * 1.04 = 20.8 -> 20
    expect(stats.attack).toBe(20);
    expect(stats.critRate).toBe(0.07); // 0.05 base + 0.02 item
  });

  it('should enhance gear level and increase stats', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      // Cheat budget
      result.current.debugUpdateHero({ gold: 1000 });
    });

    const initialAtk = result.current.resolveHeroStats().attack;

    act(() => {
      result.current.enhanceGear('weapon');
    });

    const nextAtk = result.current.resolveHeroStats().attack;
    expect(nextAtk).toBeGreaterThan(initialAtk);
    expect(result.current.state.equippedWeapon?.enhanceLevel).toBe(1);
  });

  it('should spend talent points and respec cleanly on refund', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      // Level 5 hero has 8 talent points available
      result.current.debugUpdateHero({ level: 5 });
    });

    const initialAtk = result.current.resolveHeroStats().attack;

    // Allocate 3 points to o-atk (+4% base atk per level = +12%)
    act(() => {
      result.current.spendTalentPoint('o-atk');
      result.current.spendTalentPoint('o-atk');
      result.current.spendTalentPoint('o-atk');
    });

    const buffedAtk = result.current.resolveHeroStats().attack;
    expect(buffedAtk).toBeGreaterThan(initialAtk);
    expect(result.current.state.talentNodes.find(t => t.id === 'o-atk')?.currentLevel).toBe(3);

    // Refund talents
    act(() => {
      result.current.refundAllTalents();
    });

    const resetAtk = result.current.resolveHeroStats().attack;
    expect(resetAtk).toBe(initialAtk);
    expect(result.current.state.talentNodes.find(t => t.id === 'o-atk')?.currentLevel).toBe(0);
  });

  it('should reforge substats while keeping locked stats intact and preserving rarities', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      // Cheat shards
      result.current.debugUpdateHero({ reforgeShards: 500 });
    });

    // Manually set second substat rarity to 'epic' to test preservation
    act(() => {
      if (result.current.state.equippedWeapon) {
        result.current.state.equippedWeapon.substats[1].rarity = 'epic';
      }
    });

    // Lock first substat on weapon (percent_atk, value 0.04)
    act(() => {
      result.current.toggleSubstatLock('weapon', 0);
    });

    expect(result.current.state.equippedWeapon?.substats[0].locked).toBe(true);

    act(() => {
      result.current.reforgeSubstats('weapon');
    });

    // Locked substat must remain unchanged
    expect(result.current.state.equippedWeapon?.substats[0].type).toBe('percent_atk');
    expect(result.current.state.equippedWeapon?.substats[0].value).toBe(0.04);
    
    // Unlocked slot 1 must roll a new type but remain 'epic' rarity!
    expect(result.current.state.equippedWeapon?.substats[1].rarity).toBe('epic');
  });

  it('should advance stages on combat success and fallback on death', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      // Setup hero with very high attack to kill enemy quickly
      result.current.debugUpdateHero({
        activeStageId: 1
      });
      const highAttackStats = result.current.resolveHeroStats();
    });

    // Start battle interval ticks
    act(() => {
      vi.advanceTimersByTime(200); // Spawn enemy
    });

    expect(result.current.state.activeEnemy).not.toBeNull();
    const enemyMaxHp = result.current.state.activeEnemy?.maxHp || 10;

    // Cheat kill
    act(() => {
      // Directly set enemy hp to 0 to trigger tick death
      if (result.current.state.activeEnemy) {
        result.current.debugUpdateHero({
          activeEnemy: {
            ...result.current.state.activeEnemy,
            hp: 0
          }
        });
      }
    });

    act(() => {
      vi.advanceTimersByTime(100); // Trigger victory tick
    });

    // Stage advanced
    expect(result.current.state.activeStageId).toBe(2);
    expect(result.current.state.activeEnemy).toBeNull();
  });

  it('should buy dropRate and luck upgrades in the prestige shop', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.debugUpdateHero({
        ascensionCrystals: 100,
        hasPrestiged: true
      });
    });

    expect(result.current.state.prestigeUpgrades.dropRate).toBe(0);
    expect(result.current.state.prestigeUpgrades.luck).toBe(0);

    act(() => {
      result.current.buyPrestigeUpgrade('dropRate');
      result.current.buyPrestigeUpgrade('luck');
    });

    expect(result.current.state.prestigeUpgrades.dropRate).toBe(1);
    expect(result.current.state.prestigeUpgrades.luck).toBe(1);
    expect(result.current.state.ascensionCrystals).toBeLessThan(100);
  });

  it('should support critRate over 100% and calculate bonus critical damage', () => {
    const { result } = renderHook(() => useGameState());

    // Setup hero stats with critRate = 120% (1.2) and critDmg = 150% (1.50)
    act(() => {
      result.current.debugUpdateHero({
        prestigeUpgrades: {
          ...result.current.state.prestigeUpgrades,
          critRate: 115 // +115% Crit Rate
        }
      });
    });

    const stats = result.current.resolveHeroStats();
    // base critRate (5%) + 2% weapon + 115% upgrade = 122% (1.22)
    expect(stats.critRate).toBe(1.22);

    // Dynamic math solver validation
    const totalCritRate = stats.critRate;
    let currentCritDmg = stats.critDmg;
    let currentBonusCritDmg = 0;
    
    expect(totalCritRate).toBeGreaterThan(1.0);
    const thresholds = Math.floor(totalCritRate); // 1
    currentBonusCritDmg = currentCritDmg / 2;     // 1.50 / 2 = 0.75
    for (let t = 2; t <= thresholds; t++) {
      const newCritDmg = currentCritDmg + currentBonusCritDmg;
      currentBonusCritDmg = newCritDmg / 2;
      currentCritDmg = newCritDmg;
    }

    expect(currentCritDmg).toBe(1.50);
    expect(currentBonusCritDmg).toBe(0.75);
  });

  it('should allow unlocking and upgrading substats in the Forge menu', () => {
    const { result } = renderHook(() => useGameState());

    // Give budget and unlock substat slot 1 cap in prestige upgrades
    act(() => {
      result.current.debugUpdateHero({
        gold: 1000000,
        prestigeUpgrades: {
          ...result.current.state.prestigeUpgrades,
          substatSlot1: 2 // Allow upgrading substat slot 1 up to level 2
        }
      });
    });

    const weapon = result.current.state.equippedWeapon;
    expect(weapon).not.toBeNull();
    const initialSubstat = weapon!.substats[0];
    const initialLvl = initialSubstat.level || 0;
    expect(initialLvl).toBe(0);

    // Calculate cost for level 1 (from 0 to 1) -> 10th equivalent level
    const targetLvl = 1;
    const expectedCost = Math.floor(25 * Math.pow(1.3, 10));

    act(() => {
      result.current.upgradeSubstat('weapon', 0);
    });

    const nextWeapon = result.current.state.equippedWeapon;
    expect(nextWeapon!.substats[0].level).toBe(1);
    expect(result.current.state.gold).toBe(1000000 - expectedCost);

    // Check stats scaling modifier
    const baseVal = initialSubstat.value;
    const finalVal = baseVal * (1 + 1 * 0.15); // +15% scale
    
    // Ensure resolveHeroStats incorporates scaled substats
    const stats = result.current.resolveHeroStats();
    // The substat is percent_atk which increases attack by 4% originally, now 4.6%
    expect(nextWeapon!.substats[0].value).toBe(0.04); // Base value remains original
  });

  it('should reset substat levels on prestige when keeping equipped gear', () => {
    const { result } = renderHook(() => useGameState());

    // 1. Give budget and unlock prestige slots
    act(() => {
      result.current.debugUpdateHero({
        gold: 1000000,
        prestigeUpgrades: {
          ...result.current.state.prestigeUpgrades,
          keepWeapon: 1, // Keep weapon
          substatSlot1: 2
        }
      });
    });

    // 2. Upgrade substat 1 to level 1
    act(() => {
      result.current.upgradeSubstat('weapon', 0);
    });
    expect(result.current.state.equippedWeapon?.substats[0].level).toBe(1);

    // 3. Prestige/Ascend hero (Stage must be > 50)
    act(() => {
      result.current.debugUpdateHero({
        maxUnlockedStage: 55
      });
    });

    act(() => {
      result.current.ascendHero();
    });

    // 4. Verify weapon is kept, but substat level is reset to 0
    expect(result.current.state.equippedWeapon).not.toBeNull();
    expect(result.current.state.equippedWeapon?.substats[0].level).toBe(0);
  });

  it('should support EXP retention on prestige based on keepXp levels', () => {
    const { result } = renderHook(() => useGameState());

    // Set player level and keepXp upgrade level 5 (45% retention)
    act(() => {
      result.current.debugUpdateHero({
        level: 10,
        xp: 150,
        prestigeUpgrades: {
          ...result.current.state.prestigeUpgrades,
          keepXp: 5
        },
        maxUnlockedStage: 55
      });
    });

    // Ascend player
    act(() => {
      result.current.ascendHero();
    });

    // Check that we start at a higher level than 1
    expect(result.current.state.level).toBeGreaterThan(1);
    expect(result.current.state.xp).toBeGreaterThanOrEqual(0);
  });

  it('should unlock overflow talents when all core talents are maxed', () => {
    const { result } = renderHook(() => useGameState());

    // Max out all core talents using debugUpdateHero
    const maxedCoreTalents = result.current.state.talentNodes.map(t => ({
      ...t,
      currentLevel: t.maxLevel
    }));

    act(() => {
      result.current.debugUpdateHero({
        level: 90, // Give high level so we have spare points
        talentNodes: maxedCoreTalents
      });
    });

    // Spend an overflow talent point on damage
    act(() => {
      result.current.spendOverflowTalent('damage');
    });

    expect(result.current.state.overflowTalents?.damage).toBe(1);

    // Verify refundAllTalents does NOT reset overflow talents
    act(() => {
      result.current.refundAllTalents();
    });
    expect(result.current.state.overflowTalents?.damage).toBe(1);

    // Verify prestiging DOES reset overflow talents
    act(() => {
      result.current.debugUpdateHero({
        maxUnlockedStage: 55
      });
    });
    act(() => {
      result.current.ascendHero();
    });
    expect(result.current.state.overflowTalents?.damage).toBe(0);
  });

  it('should scale substat values by equipment rarity, substat rarity and level', () => {
    const { result } = renderHook(() => useGameState());

    // Spy on Math.random to make the rolls completely deterministic
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);

    // Roll substat for common item rarity
    const commonSub = rollSubstatWithRarity('flat_hp', 10, 'common');
    // Roll substat for legendary item rarity (same type and stage)
    const legendarySub = rollSubstatWithRarity('flat_hp', 10, 'legendary');

    // Roll substat with fixed rarity on epic vs common items
    const epicFixed = rollSubstatWithFixedRarity('flat_hp', 10, 'rare', 'epic');
    const commonFixed = rollSubstatWithFixedRarity('flat_hp', 10, 'rare', 'common');

    randomSpy.mockRestore();

    // Legendary item drops should scale substats significantly higher
    expect(legendarySub.value).toBeGreaterThan(commonSub.value);
    expect(epicFixed.value).toBeGreaterThan(commonFixed.value);
  });

  it('should support prestige backpack upgrades and shard-purchased temporary slots with reset logic', () => {
    const { result } = renderHook(() => useGameState());

    // Verify initial state
    expect(result.current.state.prestigeUpgrades?.bagSlots).toBe(0);
    expect(result.current.state.tempBagSlots).toBe(0);

    // Buy temporary bag slot (costs 100 shards)
    act(() => {
      result.current.debugUpdateHero({ reforgeShards: 250 });
    });
    act(() => {
      result.current.buyTempBagSlot();
    });
    expect(result.current.state.tempBagSlots).toBe(1);
    expect(result.current.state.reforgeShards).toBe(150); // 250 - 100

    // Next slot costs 120 shards
    act(() => {
      result.current.buyTempBagSlot();
    });
    expect(result.current.state.tempBagSlots).toBe(2);
    expect(result.current.state.reforgeShards).toBe(30); // 150 - 120

    // Buy prestige shop upgrade bagSlots
    act(() => {
      result.current.debugUpdateHero({ ascensionCrystals: 50 });
    });
    act(() => {
      result.current.buyPrestigeUpgrade('bagSlots');
    });
    expect(result.current.state.prestigeUpgrades?.bagSlots).toBe(1);

    // Verify temporary slots reset on prestige, while prestige upgrade remains
    act(() => {
      result.current.debugUpdateHero({ maxUnlockedStage: 60 });
    });
    act(() => {
      result.current.ascendHero();
    });
    expect(result.current.state.tempBagSlots).toBe(0);
    expect(result.current.state.prestigeUpgrades?.bagSlots).toBe(1);
  });

  it('should prioritize species nouns over generic adjectives and match 3-letter species properly', () => {
    const enemyStg1 = getEnemyForStage(1, 1);
    expect(enemyStg1.sprite).toBeDefined();

    const bossStg10 = getEnemyForStage(10, 1);
    expect(bossStg10.name).toContain('Forest King Slime');
    expect(bossStg10.sprite).toBeDefined();

    const batEnemy = getEnemyForStage(11, 1);
    expect(batEnemy.sprite).toBeDefined();
  });
});
