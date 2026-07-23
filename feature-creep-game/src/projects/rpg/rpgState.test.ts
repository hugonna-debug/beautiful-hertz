import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRpgState } from './useRpgState';

describe('useRpgState Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it('should initialize with correct default state values', () => {
    const { result } = renderHook(() => useRpgState());

    expect(result.current.state.selectedClass).toBeNull();
    expect(result.current.state.hero).toBeNull();
    expect(result.current.state.inCombat).toBe(false);
    expect(result.current.state.dungeons.length).toBe(4);
    expect(result.current.state.partyPool.length).toBe(5);
  });

  it('should create hero on class selection', () => {
    const { result } = renderHook(() => useRpgState());

    act(() => {
      result.current.selectHeroClass('wizard', 'Gandalf');
    });

    expect(result.current.state.selectedClass).toBe('wizard');
    expect(result.current.state.heroName).toBe('Gandalf');
    expect(result.current.state.hero).not.toBeNull();
    expect(result.current.state.hero?.class).toBe('wizard');
    expect(result.current.state.hero?.maxMana).toBe(140);
    expect(result.current.state.hero?.skills.length).toBe(2);
    expect(result.current.state.hero?.gold).toBe(50);
  });

  it('should start stage and trigger enemy spawn', () => {
    const { result } = renderHook(() => useRpgState());

    act(() => {
      result.current.selectHeroClass('guardian', 'ShieldDev');
    });

    act(() => {
      result.current.startStage('localhost', 'lh-1');
    });

    expect(result.current.state.inCombat).toBe(true);
    expect(result.current.state.activeEnemy).not.toBeNull();
    expect(result.current.state.activeEnemy?.name).toBe('SyntaxError');
    expect(result.current.state.activeEnemy?.hp).toBe(35);
  });

  it('should support casting skills and deduct mana', () => {
    const { result } = renderHook(() => useRpgState());

    act(() => {
      result.current.selectHeroClass('wizard', 'Mage');
      result.current.startStage('localhost', 'lh-1');
    });

    const preMana = result.current.state.hero?.mana || 0;
    const skillId = result.current.state.hero?.skills[0].id || '';

    act(() => {
      result.current.castSkill(skillId);
    });

    expect(result.current.state.hero?.mana).toBe(preMana - 15);
    expect(result.current.state.hero?.skills[0].currentCooldown).toBeGreaterThan(0);
    expect(result.current.state.activeEnemy?.hp).toBeLessThan(35);
  });

  it('should purchase and equip gear updating hero stats', () => {
    const { result } = renderHook(() => useRpgState());

    act(() => {
      result.current.selectHeroClass('rogue', 'Stealth');
    });
    act(() => {
      result.current.debugUpdateHero({ gold: 200 });
    });

    // Buy Mechanical Keyboard (id: w-key)
    act(() => {
      result.current.buyShopItem('w-key');
    });

    expect(result.current.state.hero?.gold).toBe(150);
    expect(result.current.state.hero?.inventory.find(i => i.id === 'w-key')?.count).toBe(1);

    // Equip Keyboard
    act(() => {
      result.current.equipItem('w-key');
    });

    expect(result.current.state.hero?.equippedWeapon?.id).toBe('w-key');
    expect(result.current.state.hero?.inventory.find(i => i.id === 'w-key')?.count).toBe(0);
  });

  it('should consume items to restore resources', () => {
    const { result } = renderHook(() => useRpgState());

    act(() => {
      result.current.selectHeroClass('warlock', 'Devops');
    });

    // Buy Pizza (id: c-pizza)
    act(() => {
      result.current.buyShopItem('c-pizza');
    });

    // Reduce HP
    act(() => {
      result.current.debugUpdateHero({ hp: 30 });
    });

    // Eat pizza
    act(() => {
      result.current.useConsumable('c-pizza');
    });

    expect(result.current.state.hero?.hp).toBe(80);
    expect(result.current.state.hero?.inventory.find(i => i.id === 'c-pizza')?.count).toBe(0);
  });

  it('should hire party members to augment DPS', () => {
    const { result } = renderHook(() => useRpgState());

    act(() => {
      result.current.selectHeroClass('guardian', 'Tough');
    });
    act(() => {
      result.current.debugUpdateHero({ gold: 500 });
    });

    // Hire Intern (id: p-intern)
    act(() => {
      result.current.hirePartyMember('p-intern');
    });

    expect(result.current.state.hero?.gold).toBe(420);
    expect(result.current.state.hero?.party.length).toBe(1);
    expect(result.current.state.hero?.party[0].id).toBe('p-intern');
  });
});
