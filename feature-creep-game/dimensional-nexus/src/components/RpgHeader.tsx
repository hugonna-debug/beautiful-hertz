import React from 'react';
import { RpgHero } from '../types/game';

interface RpgHeaderProps {
  hero: RpgHero;
  difficultyTier: number;
  resetGame: () => void;
}

export const RpgHeader: React.FC<RpgHeaderProps> = ({ hero, difficultyTier, resetGame }) => {
  const { name, class: heroClass, level, xp, maxXp, hp, maxHp, mana, maxMana, gold } = hero;

  const getClassColor = () => {
    switch (heroClass) {
      case 'paladin': return '#fbbf24';
      case 'mech': return '#06ffa1';
      case 'demigod': return '#8b5cf6';
      case 'hacker': return '#ff71ce';
      default: return '#fff';
    }
  };

  const classColor = getClassColor();
  const xpPercent = Math.min(100, (xp / maxXp) * 100);
  const hpPercent = Math.min(100, (hp / maxHp) * 100);
  const manaPercent = Math.min(100, (mana / maxMana) * 100);

  return (
    <header className="terminal-panel" style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {/* Left Column: Avatar & Level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Circular level indicator */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: `3px solid ${classColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            boxShadow: `0 0 12px ${classColor}`,
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '0.65rem', display: 'block', opacity: 0.7, fontWeight: 'bold' }}>LV</span>
              <strong style={{ fontSize: '1.25rem', lineHeight: '1' }}>{level}</strong>
            </div>
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{name}</h2>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              color: classColor,
              letterSpacing: '1px',
              backgroundColor: 'rgba(0,0,0,0.2)',
              padding: '2px 8px',
              borderRadius: '4px',
              display: 'inline-block',
              marginTop: '2px'
            }}>
              {heroClass}
            </span>
          </div>
        </div>

        {/* Center Column: HP, Mana, and XP Bars */}
        <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* HP Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', width: '35px', fontWeight: 'bold', color: '#f87171' }}>HP</span>
            <div style={{ flex: 1, height: '14px', backgroundColor: '#0d0e14', border: '2px solid #000', overflow: 'hidden' }}>
              <div style={{ width: `${hpPercent}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.2s ease-out' }} />
            </div>
            <span style={{ fontSize: '0.75rem', width: '70px', textAlign: 'right', fontFamily: 'monospace' }}>{hp}/{maxHp}</span>
          </div>

          {/* Mana Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', width: '35px', fontWeight: 'bold', color: '#60a5fa' }}>MANA</span>
            <div style={{ flex: 1, height: '14px', backgroundColor: '#0d0e14', border: '2px solid #000', overflow: 'hidden' }}>
              <div style={{ width: `${manaPercent}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.2s ease-out' }} />
            </div>
            <span style={{ fontSize: '0.75rem', width: '70px', textAlign: 'right', fontFamily: 'monospace' }}>{mana}/{maxMana}</span>
          </div>

          {/* XP Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', width: '35px', fontWeight: 'bold', color: '#a78bfa' }}>XP</span>
            <div style={{ flex: 1, height: '10px', backgroundColor: '#0d0e14', border: '2px solid #000', overflow: 'hidden' }}>
              <div style={{ width: `${xpPercent}%`, height: '100%', backgroundColor: '#a78bfa', transition: 'width 0.3s ease-out' }} />
            </div>
            <span style={{ fontSize: '0.75rem', width: '70px', textAlign: 'right', fontFamily: 'monospace' }}>{xpPercent.toFixed(0)}%</span>
          </div>
        </div>

        {/* Right Column: Credits & Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {/* Difficulty Tier */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.65rem', opacity: 0.6, display: 'block', textTransform: 'uppercase' }}>NEXUS PORTALS</span>
            <strong style={{ fontSize: '1rem', color: 'var(--neon-cyan)', fontFamily: 'monospace', display: 'block' }}>
              Tier {difficultyTier}
            </strong>
          </div>
          {/* Gold HUD */}
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.65rem', opacity: 0.6, display: 'block', textTransform: 'uppercase' }}>Nexus Gold</span>
            <strong style={{ fontSize: '1.2rem', color: '#f59e0b', fontFamily: 'monospace', display: 'block' }}>
              💰 {gold}g
            </strong>
          </div>

          {/* Reset System Button */}
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reboot the Nexus? All gear, character levels, and dungeon portals will reset!')) {
                resetGame();
              }
            }}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: 'rgba(239, 68, 68, 0.3)',
              color: '#ef4444'
            }}
          >
            Reboot Nexus
          </button>
        </div>

      </div>
    </header>
  );
};
export default RpgHeader;
