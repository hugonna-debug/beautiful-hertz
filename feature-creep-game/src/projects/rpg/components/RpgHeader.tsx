import React from 'react';
import { RpgHero } from '../types';

interface RpgHeaderProps {
  hero: RpgHero;
  resetRpg: () => void;
  onExit: () => void;
}

export const RpgHeader: React.FC<RpgHeaderProps> = ({ hero, resetRpg, onExit }) => {
  const hpPercent = (hero.hp / hero.maxHp) * 100;
  const manaPercent = (hero.mana / hero.maxMana) * 100;
  const xpPercent = (hero.xp / hero.maxXp) * 100;

  const getClassColor = () => {
    switch (hero.class) {
      case 'wizard': return '#3b82f6';
      case 'guardian': return '#10b981';
      case 'warlock': return '#a855f7';
      case 'rogue': return '#f59e0b';
      default: return 'inherit';
    }
  };

  const classColor = getClassColor();

  return (
    <div className="terminal-panel" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top Title Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💻</span>
            <span>{hero.name}</span>
            <span style={{ fontSize: '0.85rem', padding: '2px 8px', borderRadius: '4px', border: `1px solid ${classColor}`, color: classColor, fontWeight: 'bold' }}>
              Level {hero.level} {hero.class.toUpperCase()}
            </span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={onExit} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
            Main Menu
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Delete this developer environment? You will lose all levels and shop equipment!')) {
                resetRpg();
              }
            }}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderColor: '#ef4444', color: '#f87171' }}
          >
            Nuke RPG
          </button>
        </div>
      </div>

      {/* Main HP/Mana/XP bars row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        borderTop: '1px dashed rgba(255,255,255,0.1)',
        paddingTop: '1rem'
      }}>
        {/* HP & Mana Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* HP Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>❤️ Health Points (HP)</span>
              <strong>{hero.hp}/{hero.maxHp}</strong>
            </div>
            <div style={{ width: '100%', height: '14px', backgroundColor: '#111827', borderRadius: '7px', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ width: `${hpPercent}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.2s ease-out' }} />
            </div>
          </div>

          {/* Mana Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>🔮 Mana Buffer (MP)</span>
              <strong>{hero.mana}/{hero.maxMana}</strong>
            </div>
            <div style={{ width: '100%', height: '14px', backgroundColor: '#111827', borderRadius: '7px', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ width: `${manaPercent}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.2s ease-out' }} />
            </div>
          </div>
        </div>

        {/* XP and Gold */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.6rem' }}>
          {/* XP Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '2px' }}>
              <span>📖 Compiled Code (XP)</span>
              <strong>{hero.xp}/{hero.maxXp} ({Math.floor(xpPercent)}%)</strong>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: '#111827', borderRadius: '5px', border: '1px solid #374151', overflow: 'hidden' }}>
              <div style={{ width: `${xpPercent}%`, height: '100%', backgroundColor: '#fbbf24', transition: 'width 0.3s' }} />
            </div>
          </div>

          {/* Gold */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>💰 Remaining Budget (Gold):</span>
            <strong style={{ fontSize: '1.4rem', color: '#fbbf24' }}>{hero.gold}g</strong>
          </div>
        </div>
      </div>

      {/* Party list row (if hero has party members) */}
      {hero.party.length > 0 && (
        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.8rem', fontSize: '0.85rem' }}>
          <strong>👥 Debugging Taskforce Party ({hero.party.length}/3 Devs hired):</strong>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
            {hero.party.map(p => {
              const borderColors = { common: '#3b82f6', rare: '#a855f7', legendary: '#ef4444' };
              return (
                <div
                  key={p.id}
                  style={{
                    border: `1px solid ${borderColors[p.rarity] || '#fff'}`,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    fontSize: '0.75rem'
                  }}
                >
                  ⚙️ <strong>{p.name}</strong> ({p.role}): <span style={{ opacity: 0.7 }}>{p.buffDescription}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
export default RpgHeader;
