import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from './useGameState';

describe('useGameState Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  it('should initialize with correct default state values', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.state.clicks).toBe(0);
    expect(result.current.state.creep).toBe(0);
    expect(result.current.state.stage).toBe(0);
    expect(result.current.state.theme).toBe('terminal');
    expect(result.current.state.autoClickers.length).toBeGreaterThan(0);
    expect(result.current.state.portfolio.balance).toBe(100);
    expect(result.current.state.gachaCards).toEqual([]);
  });

  it('should increment creep and clicks on click action', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.handleGenerateCreep();
    });

    expect(result.current.state.clicks).toBe(1);
    expect(result.current.state.creep).toBe(1);
    expect(result.current.state.achievements.find(a => a.id === 'first_click')?.unlocked).toBe(true);
  });

  it('should allow purchasing auto-clickers and update tick state', () => {
    const { result } = renderHook(() => useGameState());

    // Force add creep to afford Auto-Clicker
    act(() => {
      for (let i = 0; i < 20; i++) result.current.handleGenerateCreep();
    });

    expect(result.current.state.creep).toBe(20);

    const internClicker = result.current.state.autoClickers.find(c => c.id === 'intern')!;
    const cost = internClicker.cost;

    act(() => {
      result.current.buyAutoClicker('intern');
    });

    expect(result.current.state.creep).toBe(20 - cost);
    expect(result.current.state.autoClickers.find(c => c.id === 'intern')?.count).toBe(1);
    
    // Test auto-ticks: intern generates 0.2 creep per second (0.02 per 100ms)
    act(() => {
      vi.advanceTimersByTime(1000); // 1 second
    });

    // Expect ~0.2 creep added
    expect(result.current.state.creep).toBeCloseTo(20 - cost + 0.2, 1);
  });

  it('should manage RPG hero upgrades and combat flow', () => {
    const { result } = renderHook(() => useGameState());

    // Advance state to Tier 2 (RPG Combat)
    act(() => {
      // Manually set stage to 2 to enable RPG loops
      // We simulate by adding creep, but wait, the engine transitions automatically.
      // Let's add creep and advance timers to trigger pending feature
      for (let i = 0; i < 160; i++) result.current.handleGenerateCreep();
    });
    
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.pendingFeature?.stage).toBe(1);
    act(() => {
      result.current.acceptFeature(); // Level up to 1
    });

    // Speed up creep to get to stage 2
    act(() => {
      for (let i = 0; i < 150; i++) result.current.handleGenerateCreep();
      vi.advanceTimersByTime(100);
    });
    
    expect(result.current.pendingFeature?.stage).toBe(2);
    act(() => {
      result.current.acceptFeature(); // Level up to 2
    });

    expect(result.current.state.stage).toBe(2);

    // Initial battle start checking
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current.state.activeEnemy).not.toBeNull();

    // Give gold and buy items
    act(() => {
      result.current.state.hero.gold = 100;
    });

    const weaponCost = result.current.state.hero.weapon.cost;
    const initialAttack = result.current.state.hero.attack;

    act(() => {
      result.current.buyWeapon();
    });

    expect(result.current.state.hero.gold).toBe(100 - weaponCost);
    expect(result.current.state.hero.attack).toBeGreaterThan(initialAttack);
  });

  it('should handle stock market trades and conversions', () => {
    const { result } = renderHook(() => useGameState());

    // Buy Stock
    const initialBalance = result.current.state.portfolio.balance;
    const saasPrice = result.current.state.stocks.find(s => s.symbol === 'SaaS')?.price || 10;

    act(() => {
      result.current.buyStock('SaaS', 2);
    });

    expect(result.current.state.portfolio.shares['SaaS']).toBe(2);
    expect(result.current.state.portfolio.balance).toBe(initialBalance - (saasPrice * 2));

    // Sell Stock
    act(() => {
      result.current.sellStock('SaaS', 1);
    });

    expect(result.current.state.portfolio.shares['SaaS']).toBe(1);

    // Convert creep to cash
    act(() => {
      for (let i = 0; i < 100; i++) result.current.handleGenerateCreep();
    });
    const preCreep = result.current.state.creep;
    const preBalance = result.current.state.portfolio.balance;

    act(() => {
      result.current.convertCreepToCash(50);
    });

    expect(result.current.state.creep).toBe(preCreep - 50);
    expect(result.current.state.portfolio.balance).toBe(preBalance + 5);
  });

  it('should support Gacha Summon mechanics and bonuses', () => {
    const { result } = renderHook(() => useGameState());

    // Force add creep to afford Gacha
    act(() => {
      // Need 100 creep
      for (let i = 0; i < 110; i++) result.current.handleGenerateCreep();
    });

    expect(result.current.state.creep).toBeGreaterThanOrEqual(100);

    act(() => {
      result.current.summonGacha();
    });

    expect(result.current.state.gachaCards.length).toBe(1);
    expect(result.current.state.gachaPulls).toBe(1);
    expect(result.current.state.gachaCost).toBeGreaterThan(100);
  });

  it('should adjust settings and trigger glitches', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.updateSettings({ gravity: 10 });
    });

    expect(result.current.state.settings.gravity).toBe(10);
    expect(result.current.state.achievements.find(a => a.id === 'gravity_max')?.unlocked).toBe(true);
  });
});
