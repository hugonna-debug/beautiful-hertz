import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState';

describe('Dimensional Nexus Arena RPG Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it('should initialize with correct default state values', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.state.selectedClass).toBeNull();
    expect(result.current.state.hero).toBeNull();
    expect(result.current.state.inCombat).toBe(false);
    expect(result.current.state.combatMode).toBe('turn');
    expect(result.current.state.dungeons.length).toBe(4);
    expect(result.current.state.partyPool.length).toBe(5);
  });

  it('should compile Paladin hero correctly on class selection', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.selectHeroClass('paladin', 'Arthur');
    });

    expect(result.current.state.selectedClass).toBe('paladin');
    expect(result.current.state.heroName).toBe('Arthur');
    expect(result.current.state.hero).not.toBeNull();
    expect(result.current.state.hero?.maxHp).toBe(130);
    expect(result.current.state.hero?.skills.find(s => s.id === 'pl-1')?.unlocked).toBe(true);
    expect(result.current.state.hero?.skills.find(s => s.id === 'pl-3')?.unlocked).toBe(false);
  });

  it('should toggle combat style dynamically', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.toggleCombatMode('realtime');
    });

    expect(result.current.state.combatMode).toBe('realtime');
  });

  it('should start stage and spawn stage enemy', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.selectHeroClass('demigod', 'Zeus');
    });

    act(() => {
      result.current.startStage('colosseum', 'col-1');
    });

    expect(result.current.state.inCombat).toBe(true);
    expect(result.current.state.activeEnemy?.name).toBe('Siren Wraith');
    expect(result.current.state.activeEnemy?.hp).toBe(40);
  });

  it('should execute Turn-Based combat rounds', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.selectHeroClass('paladin', 'Arthur');
      result.current.startStage('colosseum', 'col-1');
    });

    // Player attacks
    act(() => {
      result.current.executeTurnAction('attack');
    });

    expect(result.current.state.activeEnemy?.hp).toBeLessThan(40);
    expect(result.current.playerTurn).toBe(false);

    // Run timers to let enemy hit back
    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.playerTurn).toBe(true);
  });

  it('should support Real-Time click damage and yield speed points', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.selectHeroClass('hacker', 'Neo');
      result.current.toggleCombatMode('realtime');
      result.current.startStage('colosseum', 'col-1');
    });

    const initialHp = result.current.state.activeEnemy?.hp || 40;

    act(() => {
      result.current.handleRealTimeClick();
    });

    expect(result.current.state.activeEnemy?.hp).toBeLessThan(initialHp);

    // Defeat enemy to check Speed points yield
    act(() => {
      result.current.debugUpdateHero({ baseAttack: 300 }); // massive attack cheat
    });

    act(() => {
      result.current.handleRealTimeClick();
    });

    // Combat auto-advanced
    expect(result.current.state.inCombat).toBe(true);
    expect(result.current.state.activeStageId).toBe('col-2');
    expect(result.current.state.hero?.combatPoints.speed).toBe(1);
  });

  it('should handle auto-cast loops in Auto-Idle mode', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.selectHeroClass('mech', 'Gundam');
      result.current.toggleCombatMode('auto');
      result.current.startStage('colosseum', 'col-1');
    });

    const preMana = result.current.state.hero?.mana || 0;

    // Advance ticks
    act(() => {
      vi.advanceTimersByTime(200); // Ticks run every 100ms
    });

    // Expect skill cast immediately (Plasma Gun Blast: cost 15 mana)
    expect(result.current.state.hero?.mana).toBe(preMana - 15);
  });

  it('should spend branching combat points to unlock skills', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.selectHeroClass('paladin', 'Arthur');
    });

    // Check Pl-3 is locked
    expect(result.current.state.hero?.skills.find(s => s.id === 'pl-3')?.unlocked).toBe(false);

    // Award point
    act(() => {
      result.current.debugUpdateHero({
        combatPoints: { tactical: 0, speed: 0, utility: 1 }
      });
    });

    // Spend point (Utility branch, cost 1, unlock skill)
    act(() => {
      result.current.spendCombatPoints('utility', 1, 'skill_unlock');
    });

    expect(result.current.state.hero?.skills.find(s => s.id === 'pl-3')?.unlocked).toBe(true);
    expect(result.current.state.hero?.combatPoints.utility).toBe(0);
  });
});
