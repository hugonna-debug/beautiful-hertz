import { describe, it, expect } from 'vitest';
import { sanitizeAndMigrateState, migrateItem, DEFAULT_TALENT_NODES } from '../utils/stateSanitizer';

describe('State Sanitizer & Legacy Account Repair Unit Tests', () => {
  it('should recover gracefully from null, undefined, invalid JSON, or non-object inputs', () => {
    const fromNull = sanitizeAndMigrateState(null);
    expect(fromNull.heroName).toBe('Valiant Crusader');
    expect(fromNull.level).toBe(1);
    expect(fromNull.gold).toBe(0);

    const fromBadString = sanitizeAndMigrateState('{"invalidJson": ...');
    expect(fromBadString.heroName).toBe('Valiant Crusader');
    expect(fromBadString.level).toBe(1);
  });

  it('should clean null, undefined, and NaN properties while preserving valid player stats', () => {
    const corruptInput = {
      heroName: 'Ancient Crusader',
      level: 42,
      gold: null,
      xp: NaN,
      reforgeShards: undefined,
      ascensionCrystals: 15,
      activeStageId: 10
    };

    const sanitized = sanitizeAndMigrateState(corruptInput);
    expect(sanitized.heroName).toBe('Ancient Crusader');
    expect(sanitized.level).toBe(42);
    expect(sanitized.gold).toBe(0);
    expect(sanitized.xp).toBe(0);
    expect(sanitized.reforgeShards).toBe(0);
    expect(sanitized.ascensionCrystals).toBe(15);
    expect(sanitized.activeStageId).toBe(10);
  });

  it('should repair stale JSON from Google accounts logged in prior to updates', () => {
    const preUpdateStaleSave = {
      heroName: 'PreUpdate Legend',
      level: 25,
      gold: 5000,
      // Legacy talent nodes missing new attributes or tree mappings
      talentNodes: [
        { id: 'o-atk', currentLevel: 5 }, // missing name, description, statType, tree
        { id: 'obsolete-id', currentLevel: 10 }
      ],
      // Legacy item format with 'level' instead of 'itemLevel'
      equippedWeapon: {
        id: 'old_wpn_1',
        name: 'Old Flame Blade',
        slot: 'weapon',
        level: 15,
        baseValue: 120,
        substats: [
          { type: 'percent_atk', value: 0.12, locked: false }
        ]
      },
      // Stale active enemy JSON that caused loading combat crashes
      activeEnemy: {
        name: 'Corrupt Slime (Stg 12)',
        hp: NaN,
        maxHp: null
      }
    };

    const repaired = sanitizeAndMigrateState(preUpdateStaleSave);

    expect(repaired.heroName).toBe('PreUpdate Legend');
    expect(repaired.level).toBe(25);
    expect(repaired.gold).toBe(5000);

    // Talent nodes must be mapped to DEFAULT_TALENT_NODES standard
    expect(repaired.talentNodes.length).toBe(DEFAULT_TALENT_NODES.length);
    const atkNode = repaired.talentNodes.find(t => t.id === 'o-atk');
    expect(atkNode?.currentLevel).toBe(5);
    expect(atkNode?.tree).toBe('obliteration');
    expect(atkNode?.statType).toBe('percent_atk');

    // Gear migration
    expect(repaired.equippedWeapon).not.toBeNull();
    expect(repaired.equippedWeapon?.itemLevel).toBe(15);
    expect(repaired.equippedWeapon?.rarity).toBe('common');

    // Active enemy reset
    expect(repaired.activeEnemy).toBeNull();
  });

  it('should migrate individual equipment items with missing attributes correctly', () => {
    const rawLegacyItem = {
      id: 'leg_gear_88',
      name: 'Legacy Boots',
      slot: 'boots',
      level: 8,
      baseValue: 45
    };

    const migrated = migrateItem(rawLegacyItem);
    expect(migrated).not.toBeNull();
    expect(migrated?.id).toBe('leg_gear_88');
    expect(migrated?.itemLevel).toBe(8);
    expect(migrated?.enhanceLevel).toBe(0);
    expect(migrated?.rarity).toBe('common');
    expect(migrated?.acquiredAt).toBeDefined();
    expect((migrated as any).level).toBeUndefined();
  });

  it('should ensure all prestige upgrade keys exist with non-negative numbers', () => {
    const partialPrestigeSave = {
      prestigeUpgrades: {
        atk: 10,
        dropRate: 5,
        invalidUpgradeKey: -99,
        corruptValue: NaN
      }
    };

    const sanitized = sanitizeAndMigrateState(partialPrestigeSave);
    expect(sanitized.prestigeUpgrades.atk).toBe(10);
    expect(sanitized.prestigeUpgrades.dropRate).toBe(5);
    expect(sanitized.prestigeUpgrades.def).toBe(0);
    expect(sanitized.prestigeUpgrades.luck).toBe(0);
  });
});
