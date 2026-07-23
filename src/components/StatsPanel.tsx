import React from 'react';
import { GameState } from '../types/game';
import {
  CrystalIcon,
  SwordIcon,
  ShieldIcon,
  HeartIcon,
  TargetIcon,
  CritDmgIcon,
  ZapIcon,
  PenetrationIcon,
  WindIcon,
  BloodIcon,
  RegenIcon,
  GoldIcon,
  ShardIcon,
  LevelIcon,
  BagIcon,
  StarIcon
} from './Icons';

interface StatsPanelProps {
  state: GameState;
  resolveHeroStats: () => Record<string, number>;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ state, resolveHeroStats }) => {
  const stats = resolveHeroStats();
  const { level, xp, maxXp, gold, reforgeShards, ascensionCrystals, dpsMeter } = state;

  const safeNumber = (val: any, fallback: number = 0) => {
    return typeof val === 'number' && !isNaN(val) ? val : fallback;
  };

  const safePercent = (val: any) => {
    const num = safeNumber(val, 0);
    return `${(num * 100).toFixed(1)}%`;
  };

  const xpPercent = maxXp > 0 ? Math.min(100, Math.floor((safeNumber(xp, 0) / safeNumber(maxXp, 100)) * 100)) : 0;

  // Dynamic overcrit calculations
  const totalCritRate = safeNumber(stats.critRate, 0.05);
  let displayCritRate = safePercent(totalCritRate);
  let critRateLabel = 'Critical Rate';
  
  if (totalCritRate > 1.0) {
    const multiple = Math.floor(totalCritRate) + 1;
    const remainder = totalCritRate - Math.floor(totalCritRate);
    critRateLabel = `Critical Rate x${multiple}`;
    displayCritRate = `${(remainder * 100).toFixed(1)}%`;
  }

  // Dynamic Crit Damage & Bonus Crit Damage calculation
  let currentCritDmg = safeNumber(stats.critDmg, 1.5);
  let currentBonusCritDmg = 0;
  
  if (totalCritRate >= 1.0) {
    const thresholds = Math.floor(totalCritRate);
    currentBonusCritDmg = currentCritDmg / 2;
    for (let t = 2; t <= thresholds; t++) {
      const newCritDmg = currentCritDmg + currentBonusCritDmg;
      currentBonusCritDmg = newCritDmg / 2;
      currentCritDmg = newCritDmg;
    }
  }

  const hasCrystals = (state.totalCrystalsEarned || 0) > 0;

  const getBoosterBreakdown = (baseMultiplier: number, finalMultiplier: number) => {
    if (!hasCrystals) return null;
    const basePct = (baseMultiplier - 1) * 100;
    const crystalPct = (finalMultiplier - baseMultiplier) * 100;
    return (
      <span style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '3px', marginRight: '6px' }}>
        +{basePct.toFixed(0)}% + <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '1px', fontWeight: 'bold' }}>+{crystalPct.toFixed(1)}% <CrystalIcon size={12} color="#059669" /></span>
      </span>
    );
  };

  // Math-heavy labels formatting with custom icons
  const statLabels = [
    { 
      label: 'Attack Power', 
      icon: <SwordIcon size={14} style={{ marginRight: '6px' }} />, 
      value: safeNumber(stats.attack),
      breakdown: stats.prestigeAttackBonus && stats.prestigeAttackBonus > 0 ? (
        <span style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '3px', marginRight: '6px' }}>
          {stats.baseAttack} + <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '1px', fontWeight: 'bold' }}>{stats.prestigeAttackBonus} <CrystalIcon size={12} color="#059669" /></span>
        </span>
      ) : null,
      desc: 'Flat damage multiplier before crit/pen' 
    },
    { label: 'Defense Rating', icon: <ShieldIcon size={14} style={{ marginRight: '6px' }} />, value: safeNumber(stats.defense), desc: 'Reduces flat incoming physical hits' },
    { 
      label: 'Max Vitality', 
      icon: <HeartIcon size={14} style={{ marginRight: '6px' }} />, 
      value: safeNumber(stats.maxHp),
      breakdown: stats.prestigeHpBonus && stats.prestigeHpBonus > 0 ? (
        <span style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '3px', marginRight: '6px' }}>
          {stats.baseMaxHp} + <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: '1px', fontWeight: 'bold' }}>{stats.prestigeHpBonus} <CrystalIcon size={12} color="#059669" /></span>
        </span>
      ) : null,
      desc: 'Maximum hit points threshold' 
    },
    { label: 'Attack Speed', icon: <ZapIcon size={14} style={{ marginRight: '6px' }} />, value: `${safeNumber(stats.atkSpeed, 1.0)} act/s`, desc: 'Hero action triggers per second' },
    { label: critRateLabel, icon: <TargetIcon size={14} style={{ marginRight: '6px' }} />, value: displayCritRate, desc: 'Probability to strike with critical hit' },
    { label: 'Critical Damage', icon: <CritDmgIcon size={14} style={{ marginRight: '6px' }} />, value: `${(currentCritDmg * 100).toFixed(1)}%`, desc: 'Multiplier for critical strike damage' },
    ...(totalCritRate >= 1.0 ? [
      { label: 'Bonus Crit Damage', icon: <CritDmgIcon size={14} style={{ marginRight: '6px', strokeDasharray: '2 2' }} />, value: `${(currentBonusCritDmg * 100).toFixed(1)}%`, desc: 'Additional critical hit damage scale' }
    ] : []),
    { label: 'Armor Penetration', icon: <PenetrationIcon size={14} style={{ marginRight: '6px' }} />, value: safePercent(stats.armorPen), desc: 'Percentage of enemy defense ignored' },
    { label: 'Evade/Dodge Chance', icon: <WindIcon size={14} style={{ marginRight: '6px' }} />, value: safePercent(stats.evadeRate), desc: 'Chance to completely evade strikes' },
    { label: 'Vampiric Life Steal', icon: <BloodIcon size={14} style={{ marginRight: '6px' }} />, value: safePercent(stats.lifeSteal), desc: 'Restores HP per damage hit dealt' },
    { label: 'Health Regen/Sec', icon: <RegenIcon size={14} style={{ marginRight: '6px' }} />, value: `+${safeNumber(stats.regenHp)}/s`, desc: 'Hit points recovered per second (flat and max HP % scale)' },
    { label: 'Damage Absorption', icon: <ShieldIcon size={14} style={{ marginRight: '6px', strokeDasharray: '2 2' }} />, value: safePercent(stats.damageAbsorb), desc: 'Final percentage damage reduction' },
    { 
      label: 'Gold Booster', 
      icon: <GoldIcon size={14} style={{ marginRight: '6px' }} />, 
      value: `+${(((stats.goldMultiplier || (1 + (state.prestigeUpgrades?.gold || 0) * 0.10)) - 1) * 100).toFixed(1)}%`, 
      breakdown: getBoosterBreakdown(1 + (state.prestigeUpgrades?.gold || 0) * 0.10, stats.goldMultiplier || (1 + (state.prestigeUpgrades?.gold || 0) * 0.10)),
      desc: 'Bonus Gold earned from victories' 
    },
    { 
      label: 'EXP Booster', 
      icon: <LevelIcon size={14} style={{ marginRight: '6px' }} />, 
      value: `+${(((stats.xpMultiplier || (1 + (state.prestigeUpgrades?.xp || 0) * 0.10)) - 1) * 100).toFixed(1)}%`, 
      breakdown: getBoosterBreakdown(1 + (state.prestigeUpgrades?.xp || 0) * 0.10, stats.xpMultiplier || (1 + (state.prestigeUpgrades?.xp || 0) * 0.10)),
      desc: 'Bonus EXP earned from victories' 
    },
    { 
      label: 'Shards Booster', 
      icon: <ShardIcon size={14} style={{ marginRight: '6px' }} />, 
      value: `+${(((stats.shardsMultiplier || (1 + (state.prestigeUpgrades?.shards || 0) * 0.10)) - 1) * 100).toFixed(1)}%`, 
      breakdown: getBoosterBreakdown(1 + (state.prestigeUpgrades?.shards || 0) * 0.10, stats.shardsMultiplier || (1 + (state.prestigeUpgrades?.shards || 0) * 0.10)),
      desc: 'Bonus Reforge Shards earned' 
    },
    { label: 'Drop Rate Multiplier', icon: <BagIcon size={14} style={{ marginRight: '6px' }} />, value: `${100 + (state.prestigeUpgrades?.dropRate || 0)}%`, desc: 'Stage drop rate scaling factor' },
    { label: 'Luck Rating', icon: <StarIcon size={14} style={{ marginRight: '6px' }} />, value: `+${state.prestigeUpgrades?.luck || 0}%`, desc: 'Boosts drop & substat rarity quality' }
  ];

  return (
    <div className="terminal-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: '0.6rem' }}>
        <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LevelIcon size={20} color="var(--neon-purple)" /> Hero Diagnostics
        </h2>
        <span style={{ fontSize: '0.8rem', background: '#000', color: '#fff', padding: '0.2rem 0.6rem', fontWeight: 'bold' }}>
          LEVEL {level}
        </span>
      </div>

      {/* Real-time DPS Calculator Board */}
      <div style={{ background: '#000', color: '#06ffa1', padding: '0.8rem', border: '3px solid #000', fontFamily: 'monospace' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#888' }}>
          <span>DPS WINDOW (5S)</span>
          <span>CALCULATING...</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.2rem 0' }}>
          {dpsMeter.currentDps.toLocaleString()} <span style={{ fontSize: '1rem', color: '#fff' }}>DPS</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem', borderTop: '1px solid #333', paddingTop: '0.4rem', color: '#aaa' }}>
          <div>Kills: <strong style={{ color: '#fff', textShadow: 'none' }}>{dpsMeter.totalKills}</strong></div>
          <div>Total Dmg: <strong style={{ color: '#fff', textShadow: 'none' }}>{dpsMeter.totalDamage.toLocaleString()}</strong></div>
        </div>
      </div>

      {/* Experience Progression Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
          <span>EXP PROGRESSION</span>
          <span>{xp} / {maxXp} XP</span>
        </div>
        <div style={{ height: '14px', background: '#e0e0e0', border: '3px solid #000', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: `${xpPercent}%`, height: '100%', background: 'var(--neon-yellow)', transition: 'width 0.15s ease' }} />
        </div>
      </div>

      {/* Currencies HUD */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', borderTop: '3px solid #000', borderBottom: '3px solid #000', padding: '0.6rem 0' }}>
        <div style={{ background: '#fffbeb', border: '2px solid #000', padding: '0.4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.65rem', display: 'block', color: '#666', fontWeight: 'bold' }}>GOLD BALANCE</span>
          <strong style={{ fontSize: '1.1rem', color: '#b45309', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <GoldIcon size={14} color="#b45309" /> {gold.toLocaleString()}g
          </strong>
        </div>
        <div style={{ background: '#f5f3ff', border: '2px solid #000', padding: '0.4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.65rem', display: 'block', color: '#666', fontWeight: 'bold' }}>REFORGE SHARDS</span>
          <strong style={{ fontSize: '1.1rem', color: '#6d28d9', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <ShardIcon size={14} color="#6d28d9" /> {reforgeShards}
          </strong>
        </div>
      </div>

      {/* Ascension Status */}
      {((state.totalCrystalsEarned || 0) > 0 || ascensionCrystals > 0) && (
        <div style={{ background: '#ecfdf5', border: '2px dashed #059669', padding: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.65rem', display: 'block', color: '#047857', fontWeight: 'bold' }}>ASCENSION PRESTIGE</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CrystalIcon size={14} color="#059669" /> {ascensionCrystals} Crystals ({state.totalCrystalsEarned || 0} Total)
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 'bold' }}>
            +{((state.totalCrystalsEarned || 0) * 0.5).toFixed(1)}%
          </span>
        </div>
      )}

      {/* Scrollable Detailed Stats Matrix */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '380px', paddingRight: '4px' }}>
        {statLabels.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', border: '2px solid #000', padding: '0.5rem 0.6rem', transition: 'transform 0.1s' }}>
            <div>
              <strong style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}>
                {item.icon} {item.label}
              </strong>
              <small style={{ fontSize: '0.65rem', color: '#666', display: 'block' }}>{item.desc}</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {(item as any).breakdown}
              <strong style={{ fontSize: '1.05rem', fontFamily: 'monospace' }}>{item.value}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default StatsPanel;
