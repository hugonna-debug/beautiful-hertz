import React, { useState, useEffect } from 'react';
import { GameState } from './types';

interface RpgCombatTabProps {
  state: GameState;
  buyWeapon: () => void;
  buyArmor: () => void;
}

export const RpgCombatTab: React.FC<RpgCombatTabProps> = ({ state, buyWeapon, buyArmor }) => {
  const { hero, activeEnemy, rpgLogs, gachaCards } = state;
  const [flashHero, setFlashHero] = useState(false);
  const [flashEnemy, setFlashEnemy] = useState(false);

  // Trigger hits flashing based on logs change
  useEffect(() => {
    if (rpgLogs.length > 0) {
      const lastLog = rpgLogs[rpgLogs.length - 1];
      if (lastLog.includes('attacks')) {
        setFlashEnemy(true);
        const t = setTimeout(() => setFlashEnemy(false), 200);
        return () => clearTimeout(t);
      } else if (lastLog.includes('strikes')) {
        setFlashHero(true);
        const t = setTimeout(() => setFlashHero(false), 200);
        return () => clearTimeout(t);
      }
    }
  }, [rpgLogs]);

  const devRpgMult = gachaCards.reduce((acc, card) => acc * card.rpgMultiplier, 1);
  const effectiveAttack = Math.floor(hero.attack * devRpgMult);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '0.5rem' }}>
      {/* Visual Arena Card */}
      <div className="terminal-panel gravity-item" style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          ⚔️ ACTIVE CODE REPOSITORY ARENA
        </h3>
        
        {/* Arena Screen */}
        <div style={{
          height: '180px',
          backgroundColor: '#000',
          border: '2px solid currentColor',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: '1rem'
        }}>
          {/* Grid Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            pointerEvents: 'none'
          }} />

          {/* Hero Side */}
          <div style={{
            textAlign: 'center',
            zIndex: 10,
            transition: 'transform 0.1s',
            transform: flashHero ? 'translateX(-10px) scale(0.95)' : 'none',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: flashHero ? '#ef4444' : '#1e3a8a',
              border: '2px solid #3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.5rem auto',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
            }}>
              {/* Hero SVG Icon */}
              <svg viewBox="0 0 100 100" width="40" height="40" fill="none" stroke="#60a5fa" strokeWidth="6">
                <circle cx="50" cy="30" r="15" />
                <path d="M50 45 L50 80 M50 55 L30 50 M50 55 L70 50 M50 80 L35 95 M50 80 L65 95" />
                {/* Sword */}
                <line x1="70" y1="50" x2="85" y2="25" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
            <strong style={{ fontSize: '0.85rem' }}>QA Hero (Lv {hero.level})</strong>
            
            {/* HP Bar */}
            <div style={{ width: '80px', height: '8px', backgroundColor: '#374151', borderRadius: '4px', margin: '4px auto 0 auto', overflow: 'hidden' }}>
              <div style={{ width: `${(hero.hp / hero.maxHp) * 100}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 0.2s' }} />
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>HP: {hero.hp}/{hero.maxHp}</div>
          </div>

          {/* VS Divider */}
          <div style={{ fontSize: '1.5rem', fontWeight: 'extrabold', opacity: 0.5 }}>VS</div>

          {/* Enemy Side */}
          {activeEnemy ? (
            <div style={{
              textAlign: 'center',
              zIndex: 10,
              transition: 'transform 0.1s',
              transform: flashEnemy ? 'translateX(10px) scale(0.95)' : 'none',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: flashEnemy ? '#ef4444' : '#7f1d1d',
                border: '2px solid #f87171',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.5rem auto',
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
                animation: 'pulseEnemy 1s infinite alternate'
              }}>
                {/* Bug SVG */}
                <svg viewBox="0 0 100 100" width="40" height="40" fill="none" stroke="#f87171" strokeWidth="6">
                  <ellipse cx="50" cy="55" rx="20" ry="25" />
                  <circle cx="50" cy="30" r="10" />
                  <line x1="25" y1="45" x2="10" y2="40" />
                  <line x1="25" y1="55" x2="5" y2="55" />
                  <line x1="25" y1="65" x2="10" y2="70" />
                  <line x1="75" y1="45" x2="90" y2="40" />
                  <line x1="75" y1="55" x2="95" y2="55" />
                  <line x1="75" y1="65" x2="90" y2="70" />
                </svg>
              </div>
              <strong style={{ fontSize: '0.85rem' }}>{activeEnemy.name}</strong>
              
              {/* HP Bar */}
              <div style={{ width: '80px', height: '8px', backgroundColor: '#374151', borderRadius: '4px', margin: '4px auto 0 auto', overflow: 'hidden' }}>
                <div style={{ width: `${(activeEnemy.hp / activeEnemy.maxHp) * 100}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.1s' }} />
              </div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>HP: {activeEnemy.hp}/{activeEnemy.maxHp}</div>
            </div>
          ) : (
            <div style={{ opacity: 0.5, fontSize: '0.9rem' }}>Searching for bugs...</div>
          )}
        </div>
      </div>

      {/* Hero Stats and Store */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Stats */}
        <div className="terminal-panel gravity-item">
          <h4 style={{ margin: '0 0 0.8rem 0', borderBottom: '1px dashed currentColor', paddingBottom: '0.2rem' }}>
            📊 HERO ATTRIBUTES
          </h4>
          <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>⚔️ <strong>Base Attack:</strong> {hero.attack} (Effective: {effectiveAttack})</li>
            <li>🛡️ <strong>Defense:</strong> {hero.defense}</li>
            <li>💼 <strong>Gold Loot:</strong> {hero.gold}g</li>
            <li>
              📖 <strong>Experience (XP):</strong> {hero.xp}/{hero.maxXp}
              <div style={{ width: '100%', height: '6px', backgroundColor: '#374151', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(hero.xp / hero.maxXp) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }} />
              </div>
            </li>
          </ul>
        </div>

        {/* Upgrade store */}
        <div className="terminal-panel gravity-item">
          <h4 style={{ margin: '0 0 0.8rem 0', borderBottom: '1px dashed currentColor', paddingBottom: '0.2rem' }}>
            🛒 ARMORY UPGRADES STORE
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {/* Weapon */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <div>
                <strong>{hero.weapon.name}</strong>
                <div style={{ opacity: 0.7 }}>Next upgrade attack bonus: +{Math.floor(hero.weapon.attackBonus * 0.5) + 3}</div>
              </div>
              <button
                disabled={hero.gold < hero.weapon.cost}
                onClick={buyWeapon}
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
              >
                Buy ({hero.weapon.cost}g)
              </button>
            </div>
            {/* Armor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
              <div>
                <strong>{hero.armor.name}</strong>
                <div style={{ opacity: 0.7 }}>Next upgrade defense bonus: +{Math.floor(hero.armor.defenseBonus * 0.5) + 1}</div>
              </div>
              <button
                disabled={hero.gold < hero.armor.cost}
                onClick={buyArmor}
                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
              >
                Buy ({hero.armor.cost}g)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Console logs */}
      <div className="terminal-panel gravity-item">
        <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          📝 COMBAT EVENT LOGS
        </h4>
        <div className="scrollable-logs" style={{ height: '120px', fontSize: '0.85rem' }}>
          {rpgLogs.slice().reverse().map((log, idx) => (
            <div 
              key={idx} 
              style={{ 
                color: log.includes('LEVEL UP') ? '#fbbf24' : log.includes('Strikes Hero') ? '#f87171' : log.includes('Defeated') ? '#10b981' : 'inherit'
              }}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default RpgCombatTab;
