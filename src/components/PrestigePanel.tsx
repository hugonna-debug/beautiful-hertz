import React from 'react';
import { GameState } from '../types/game';
import {
  ShopIcon,
  CrystalIcon,
  SwordIcon,
  ShieldIcon,
  HeartIcon,
  CritDmgIcon,
  BloodIcon,
  RegenIcon,
  GoldIcon,
  LevelIcon,
  ShardIcon,
  TargetIcon,
  ZapIcon,
  PenetrationIcon,
  WindIcon,
  RecycleIcon,
  GearIcon,
  BagIcon,
  StarIcon
} from './Icons';

interface PrestigePanelProps {
  state: GameState;
  buyPrestigeUpgrade: (key: string) => void;
  updateAutoScrapSettings: (settings: Partial<GameState['autoScrapSettings']>) => void;
  isMobile?: boolean;
}

export const PrestigePanel: React.FC<PrestigePanelProps> = ({
  state,
  buyPrestigeUpgrade,
  updateAutoScrapSettings,
  isMobile = false
}) => {
  const { prestigeUpgrades, autoScrapSettings, ascensionCrystals, totalUpgradesPurchased, darkMode } = state;

  const caps: Record<string, number> = {
    atkSpeed: 30,
    armorPen: 50,
    evade: 25,
    absorb: 40,
    keepWeapon: 1,
    keepBody: 1,
    keepBoots: 1,
    keepRing: 1,
    multiScrap: 1,
    autoScrap: 1,
    keepXp: 10
  };

  const getUpgradeCost = (key: string, currentLevel: number) => {
    const basePrices: Record<string, number> = {
      atk: 1, def: 1, hp: 1, critDmg: 2, lifesteal: 2, hpRegen: 1, gold: 2, xp: 2, shards: 2,
      critRate: 4, atkSpeed: 4, armorPen: 4, evade: 4, absorb: 4,
      keepWeapon: 15, keepBody: 15, keepBoots: 15, keepRing: 15, multiScrap: 10, autoScrap: 20,
      keepXp: 40, bagSlots: 2
    };
    const basePrice = basePrices[key] || 1;
    const levelMultiplier = Math.pow(1.2, currentLevel);
    const rawBaseCost = Math.floor(basePrice * levelMultiplier);
    return Math.floor(rawBaseCost * (1 + totalUpgradesPurchased * 0.10));
  };

  const getUpgradeIcon = (key: string) => {
    switch (key) {
      case 'atk':
      case 'keepWeapon':
        return <SwordIcon size={13} style={{ marginRight: '5px' }} />;
      case 'def':
      case 'keepBody':
        return <ShieldIcon size={13} style={{ marginRight: '5px' }} />;
      case 'hp':
      case 'keepBoots':
        return <HeartIcon size={13} style={{ marginRight: '5px' }} />;
      case 'keepRing':
        return <ShardIcon size={13} style={{ marginRight: '5px', transform: 'rotate(45deg)' }} />;
      case 'critDmg':
        return <CritDmgIcon size={13} style={{ marginRight: '5px' }} />;
      case 'lifesteal':
        return <BloodIcon size={13} style={{ marginRight: '5px' }} />;
      case 'hpRegen':
        return <RegenIcon size={13} style={{ marginRight: '5px' }} />;
      case 'gold':
        return <GoldIcon size={13} style={{ marginRight: '5px' }} />;
      case 'xp':
      case 'keepXp':
        return <LevelIcon size={13} style={{ marginRight: '5px' }} />;
      case 'shards':
        return <ShardIcon size={13} style={{ marginRight: '5px' }} />;
      case 'dropRate':
      case 'bagSlots':
        return <BagIcon size={13} style={{ marginRight: '5px' }} />;
      case 'luck':
        return <StarIcon size={13} style={{ marginRight: '5px' }} />;
      case 'critRate':
        return <TargetIcon size={13} style={{ marginRight: '5px' }} />;
      case 'atkSpeed':
        return <ZapIcon size={13} style={{ marginRight: '5px' }} />;
      case 'armorPen':
        return <PenetrationIcon size={13} style={{ marginRight: '5px' }} />;
      case 'evade':
        return <WindIcon size={13} style={{ marginRight: '5px' }} />;
      case 'absorb':
        return <ShieldIcon size={13} style={{ marginRight: '5px', strokeDasharray: '2 2' }} />;
      case 'multiScrap':
        return <RecycleIcon size={13} style={{ marginRight: '5px' }} />;
      case 'autoScrap':
      case 'substatSlot1':
      case 'substatSlot2':
      case 'substatSlot3':
      case 'substatSlot4':
        return <GearIcon size={13} style={{ marginRight: '5px' }} />;
      default:
        return null;
    }
  };

  const renderUpgradeCard = (key: string, label: string, desc: string) => {
    const currentLevel = prestigeUpgrades[key] || 0;
    const cap = caps[key];
    const isCapped = cap !== undefined && currentLevel >= cap;
    const cost = getUpgradeCost(key, currentLevel);
    const canAfford = ascensionCrystals >= cost && !isCapped;

    // Remove emoji prefix from label if present
    const cleanLabel = label.replace(/^[^\w]+/, '').trim();

    return (
      <div
        key={key}
        style={{
          background: darkMode ? '#1a1a1f' : '#fff',
          border: `2px solid ${darkMode ? '#fff' : '#000'}`,
          padding: '0.6rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.4rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.8rem', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {getUpgradeIcon(key)}
              {cleanLabel}
            </span>
            <span style={{ color: isCapped ? '#ef4444' : 'var(--neon-purple)' }}>
              Lvl {currentLevel}{cap !== undefined ? ` / ${cap}` : ''}
            </span>
          </div>
          <div style={{ fontSize: '0.65rem', color: darkMode ? '#aaa' : '#666', marginTop: '0.2rem' }}>
            {desc}
          </div>
        </div>
        <button
          onClick={() => buyPrestigeUpgrade(key)}
          disabled={!canAfford}
          className="game-btn"
          style={{
            padding: '0.45rem 0.6rem',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-sans), sans-serif',
            letterSpacing: '0.6px',
            lineHeight: 1.2,
            textTransform: 'uppercase',
            textShadow: 'none',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            textRendering: 'optimizeLegibility',
            background: isCapped 
              ? (darkMode ? '#334155' : '#94a3b8') 
              : canAfford 
                ? '#7c3aed' 
                : (darkMode ? '#1e1e24' : '#e2e8f0'),
            color: isCapped 
              ? (darkMode ? '#e2e8f0' : '#334155') 
              : canAfford 
                ? '#ffffff' 
                : (darkMode ? '#94a3b8' : '#64748b'),
            border: `2px solid ${canAfford ? '#000000' : (darkMode ? '#475569' : '#cbd5e1')}`,
            width: '100%',
            opacity: canAfford ? 1 : 0.85,
            cursor: canAfford ? 'pointer' : 'not-allowed',
            boxShadow: canAfford ? '0 2px 0 #000000' : 'none'
          }}
        >
          {isCapped ? 'MAXED' : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontWeight: 800 }}>
              <CrystalIcon size={13} color={canAfford ? '#ffffff' : (darkMode ? '#94a3b8' : '#64748b')} /> Buy (<span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{cost}</span> Crystals)
            </span>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="terminal-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* HEADER */}
      <div style={{ borderBottom: '3px solid #000', paddingBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShopIcon size={20} color="var(--neon-purple)" /> Prestige Shop
        </h2>
        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-purple)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <CrystalIcon size={16} color="var(--neon-purple)" /> {ascensionCrystals} Crystals
        </span>
      </div>

      <div style={{ fontSize: '0.7rem', background: darkMode ? '#222' : '#f3f4f6', padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <RegenIcon size={12} color="#b45309" /> <strong>Note on scaling:</strong> Each upgrade purchased across the shop increases the base cost of <strong>all upgrades</strong> by <strong>+10%</strong>. Plan your builds carefully!
      </div>

      {/* AUTO-SCRAP SETTINGS SECTION */}
      {(prestigeUpgrades.autoScrap || 0) > 0 && (
        <div style={{ background: darkMode ? '#27272a' : '#f0fdf4', border: `2px solid ${darkMode ? '#fff' : '#22c55e'}`, padding: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.8rem', color: darkMode ? '#fff' : '#15803d', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <GearIcon size={14} color={darkMode ? '#fff' : '#15803d'} /> Auto-Scrapper Configuration Control
            </strong>
            <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: darkMode ? '#10b981' : '#15803d', fontFamily: 'monospace' }}>
              Scrapped: {state.autoScrapsCount || 0} items (Reforge Shards: +{state.autoScrapsShardsEarned || 0})
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', fontSize: '0.7rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoScrapSettings.common}
                onChange={(e) => updateAutoScrapSettings({ common: e.target.checked })}
              />
              Auto-Scrap Common Gear
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoScrapSettings.rare}
                onChange={(e) => updateAutoScrapSettings({ rare: e.target.checked })}
              />
              Auto-Scrap Rare Gear
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoScrapSettings.epic}
                onChange={(e) => updateAutoScrapSettings({ epic: e.target.checked })}
              />
              Auto-Scrap Epic Gear
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoScrapSettings.legendary}
                onChange={(e) => updateAutoScrapSettings({ legendary: e.target.checked })}
              />
              Auto-Scrap Legendary Gear
            </label>
          </div>

          {/* ITEM TYPE SLOT TOGGLES */}
          <div style={{ borderTop: '1px dashed rgba(128,128,128,0.4)', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 'bold', marginBottom: '0.3rem', opacity: 0.85, textTransform: 'uppercase' }}>
              Target Item Types (Uncheck to protect/keep type):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem', fontSize: '0.7rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={autoScrapSettings.slots?.weapon !== false}
                  onChange={(e) => updateAutoScrapSettings({ slots: { weapon: e.target.checked } })}
                />
                ⚔️ Weapons
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={autoScrapSettings.slots?.body !== false}
                  onChange={(e) => updateAutoScrapSettings({ slots: { body: e.target.checked } })}
                />
                🛡️ Armor
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={autoScrapSettings.slots?.boots !== false}
                  onChange={(e) => updateAutoScrapSettings({ slots: { boots: e.target.checked } })}
                />
                👢 Boots
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontWeight: 'bold' }}>
                <input
                  type="checkbox"
                  checked={autoScrapSettings.slots?.ring !== false}
                  onChange={(e) => updateAutoScrapSettings({ slots: { ring: e.target.checked } })}
                />
                💍 Rings
              </label>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #ccc', paddingTop: '0.4rem', marginTop: '0.2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 'bold' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <ShieldIcon size={13} style={{ marginRight: '2px' }} />
                <span>Protect / Keep item if Legendary substats count is at least:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginLeft: '1.2rem', marginTop: '0.1rem' }}>
                {[1, 2, 3, 4].map(num => {
                  const isSelected = autoScrapSettings.keepLegendarySubs === num;
                  return (
                    <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontWeight: 'bold' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const newVal = isSelected ? 0 : num;
                          updateAutoScrapSettings({ keepLegendarySubs: newVal });
                        }}
                        style={{ cursor: 'pointer', width: '13px', height: '13px' }}
                      />
                      <span style={{ color: isSelected ? 'var(--neon-pink)' : 'inherit' }}>{num} {num === 1 ? 'Sub' : 'Subs'}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADES SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: isMobile ? 'none' : '500px', paddingRight: '0.2rem' }}>
        
        {/* SECTION 1: INFINITE STATS */}
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: '0.4rem' }}>
            🌟 Infinite Stackable Upgrades
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.4rem' }}>
            {renderUpgradeCard('atk', '🗡️ Attack Power', '+5% total damage scaling per level.')}
            {renderUpgradeCard('def', '🛡️ Defense Rating', '+5% total defense scaling per level.')}
            {renderUpgradeCard('hp', '❤️ Max Vitality', '+5% total maximum HP scaling per level.')}
            {renderUpgradeCard('critRate', '🎯 Critical Rate', '+1% Critical Hit Rate.')}
            {renderUpgradeCard('critDmg', '💥 Critical Damage', '+10% critical damage multiplier per level.')}
            {renderUpgradeCard('lifesteal', '🩸 Vampiric Life Steal', '+1% life recovered per attack hit.')}
            {renderUpgradeCard('hpRegen', '🍀 Health Regen/Sec', '+0.5% max HP regenerated per second.')}
            {renderUpgradeCard('gold', '💰 Gold Booster', '+10% gold earned from battle victories.')}
            {renderUpgradeCard('xp', '📈 EXP Booster', '+10% experience earned from battle victories.')}
            {renderUpgradeCard('shards', '💎 Shards Booster', '+10% reforge shards earned from battles.')}
            {renderUpgradeCard('dropRate', '🎒 Drop Rate Booster', '+1% drop rate multiplier (applied to base stage drop rate).')}
            {renderUpgradeCard('luck', '⭐ Luck Booster', 'Increases item (+0.2% absolute) and substat (+0.2% absolute) rarity roll chances.')}
            {renderUpgradeCard('bagSlots', '🎒 Expanded Backpack', '+1 inventory capacity slot.')}
          </div>
        </div>

        {/* SECTION 2: CAPPED STATS */}
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: '0.4rem' }}>
            ⚡ Capped Optimization Upgrades
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.4rem' }}>
            {renderUpgradeCard('atkSpeed', '⚡ Attack Speed', '+1% speed modifier (capped at +30%).')}
            {renderUpgradeCard('armorPen', '🏹 Armor Penetration', '+1% enemy defense ignore (capped at +50%).')}
            {renderUpgradeCard('evade', '💨 Evade/Dodge', '+1% absolute evade trigger rate (capped at +25%).')}
            {renderUpgradeCard('absorb', '🛡️ Damage Absorption', '+1% net incoming damage block (capped at +40%).')}
          </div>
        </div>

        {/* SECTION 3: SINGLE UNLOCKS */}
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: '0.4rem' }}>
            🔑 Permanent QoL Unlocks & Retention
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.4rem' }}>
            {renderUpgradeCard('keepWeapon', '🗡️ Keep Weapon', 'Retain Weapon on prestige. Resets enhancements but preserves level/substats.')}
            {renderUpgradeCard('keepBody', '🛡️ Keep Body', 'Retain Body on prestige. Resets enhancements but preserves level/substats.')}
            {renderUpgradeCard('keepBoots', '🥾 Keep Boots', 'Retain Boots on prestige. Resets enhancements but preserves level/substats.')}
            {renderUpgradeCard('keepRing', '💍 Keep Ring', 'Retain Ring on prestige. Resets enhancements but preserves level/substats.')}
            {renderUpgradeCard('multiScrap', '♻️ Multi-Scrapper', 'Unlocks tab-based mass scrapping buttons in Forge menu.')}
            {renderUpgradeCard('autoScrap', '🤖 Auto-Scrapper', 'Unlocks immediate scrap resolutions for incoming gear drops.')}
            {renderUpgradeCard('keepXp', '🧠 EXP Retention', 'Retains +9% of EXP earned when prestiging (capped at 90%).')}
          </div>
        </div>

        {/* SECTION 4: SUBSTAT SLOT LEVELS */}
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', display: 'block', marginBottom: '0.4rem' }}>
            🛠️ Substat Slot Level Limits
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.4rem' }}>
            {renderUpgradeCard('substatSlot1', '⚙️ Substat 1 Max Level', 'Allows Substat Slot 1 to be upgraded.')}
            {renderUpgradeCard('substatSlot2', '⚙️ Substat 2 Max Level', 'Allows Substat Slot 2 to be upgraded.')}
            {renderUpgradeCard('substatSlot3', '⚙️ Substat 3 Max Level', 'Allows Substat Slot 3 to be upgraded.')}
            {renderUpgradeCard('substatSlot4', '⚙️ Substat 4 Max Level', 'Allows Substat Slot 4 to be upgraded.')}
          </div>
        </div>

      </div>
    </div>
  );
};
