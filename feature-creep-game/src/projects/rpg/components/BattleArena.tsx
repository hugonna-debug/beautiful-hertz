import React, { useState, useEffect } from 'react';
import { RpgHero, RpgEnemy } from '../types';

interface BattleArenaProps {
  hero: RpgHero;
  activeEnemy: RpgEnemy | null;
  combatLogs: string[];
  fleeCombat: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ hero, activeEnemy, combatLogs, fleeCombat }) => {
  const [flashHero, setFlashHero] = useState(false);
  const [flashEnemy, setFlashEnemy] = useState(false);

  // Trigger hits flashing based on logs change
  useEffect(() => {
    if (combatLogs.length > 0) {
      const lastLog = combatLogs[combatLogs.length - 1];
      if (lastLog.includes('attacks') || lastLog.includes('cast')) {
        setFlashEnemy(true);
        const t = setTimeout(() => setFlashEnemy(false), 200);
        return () => clearTimeout(t);
      } else if (lastLog.includes('strikes')) {
        setFlashHero(true);
        const t = setTimeout(() => setFlashHero(false), 200);
        return () => clearTimeout(t);
      }
    }
  }, [combatLogs]);

  const getClassColor = () => {
    switch (hero.class) {
      case 'wizard': return '#3b82f6';
      case 'guardian': return '#10b981';
      case 'warlock': return '#a855f7';
      case 'rogue': return '#f59e0b';
      default: return '#fff';
    }
  };

  const classColor = getClassColor();

  return (
    <div className="terminal-panel" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <h3 style={{ margin: 0 }}>🛡️ ENVIRONMENT RUNTIME ACTIVE DEBUGGER</h3>
        <button onClick={fleeCombat} style={{ padding: '2px 10px', fontSize: '0.75rem' }}>
          Terminate Thread (Flee)
        </button>
      </div>

      {/* Screen area */}
      <div style={{
        height: '240px',
        backgroundColor: '#05050b',
        border: '3px solid currentColor',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '1rem',
        boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.9)'
      }}>
        {/* Wireframe Perspective Lines */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }} />

        {/* Hero character side */}
        <div style={{
          textAlign: 'center',
          zIndex: 10,
          transition: 'transform 0.1s',
          transform: flashHero ? 'translateX(-12px) scale(0.92)' : 'none',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: flashHero ? '#ef4444' : '#0c0c16',
            border: `3px solid ${classColor}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.6rem auto',
            boxShadow: `0 0 15px ${classColor}`,
            transition: 'background-color 0.1s'
          }}>
            {/* SVG developer stickman with laptop */}
            <svg viewBox="0 0 100 100" width="55" height="55">
              <circle cx="50" cy="30" r="14" fill="none" stroke="#fff" strokeWidth="5" />
              <path d="M50 44 L50 80 M50 54 L25 50 M50 54 L75 50 M50 80 L30 100 M50 80 L70 100" fill="none" stroke="#fff" strokeWidth="5" />
              {/* Laptop computer */}
              <rect x="68" y="42" width="18" height="14" fill={classColor} rx="1" />
              <line x1="62" y1="56" x2="88" y2="56" stroke="#fff" strokeWidth="4" />
            </svg>
          </div>
          <strong style={{ fontSize: '0.9rem' }}>{hero.name}</strong>

          {/* HP and Mana metrics */}
          <div style={{ width: '100px', height: '6px', backgroundColor: '#374151', borderRadius: '3px', margin: '4px auto 0 auto', overflow: 'hidden' }}>
            <div style={{ width: `${(hero.hp / hero.maxHp) * 100}%`, height: '100%', backgroundColor: '#10b981' }} />
          </div>
          <div style={{ width: '100px', height: '6px', backgroundColor: '#374151', borderRadius: '3px', margin: '3px auto 0 auto', overflow: 'hidden' }}>
            <div style={{ width: `${(hero.mana / hero.maxMana) * 100}%`, height: '100%', backgroundColor: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
            HP: {hero.hp}/{hero.maxHp} | MP: {hero.mana}/{hero.maxMana}
          </div>
        </div>

        {/* VS emblem */}
        <div className="glitch-text" style={{ fontSize: '2.5rem', fontWeight: 900, opacity: 0.25, fontStyle: 'italic' }}>VS</div>

        {/* Enemy character side */}
        {activeEnemy ? (
          <div style={{
            textAlign: 'center',
            zIndex: 10,
            transition: 'transform 0.1s',
            transform: flashEnemy ? 'translateX(12px) scale(0.92)' : 'none',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: flashEnemy ? '#ef4444' : '#1e1022',
              border: `3px solid ${activeEnemy.isBoss ? '#ef4444' : '#ec4899'}`,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.6rem auto',
              boxShadow: activeEnemy.isBoss ? '0 0 25px #ef4444' : '0 0 15px rgba(236,72,153,0.4)',
              transition: 'background-color 0.1s',
              animation: 'bugWiggle 0.4s infinite alternate'
            }}>
              {/* Spider/Bug Enemy SVG */}
              <svg viewBox="0 0 100 100" width="55" height="55">
                <ellipse cx="50" cy="55" rx="18" ry="24" fill="rgba(255,255,255,0.05)" stroke={activeEnemy.isBoss ? '#ef4444' : '#ec4899'} strokeWidth="5" />
                <circle cx="50" cy="30" r="10" fill="none" stroke={activeEnemy.isBoss ? '#ef4444' : '#ec4899'} strokeWidth="5" />
                
                {/* Legs */}
                <line x1="25" y1="45" x2="5" y2="35" stroke={activeEnemy.isBoss ? '#ef4444' : '#ec4899'} strokeWidth="4" />
                <line x1="25" y1="55" x2="2" y2="55" stroke={activeEnemy.isBoss ? '#ef4444' : '#ec4899'} strokeWidth="4" />
                <line x1="25" y1="65" x2="5" y2="75" stroke={activeEnemy.isBoss ? '#ef4444' : '#ec4899'} strokeWidth="4" />
                
                <line x1="75" y1="45" x2="95" y2="35" stroke={activeEnemy.isBoss ? '#ef4444' : '#ec4899'} strokeWidth="4" />
                <line x1="75" y1="55" x2="98" y2="55" stroke={activeEnemy.isBoss ? '#ef4444' : '#ec4899'} strokeWidth="4" />
                <line x1="75" y1="65" x2="95" y2="75" stroke={activeEnemy.isBoss ? '#ef4444' : '#ec4899'} strokeWidth="4" />
                
                {/* Glowing Eyes */}
                <circle cx="44" cy="28" r="3" fill="#ef4444" />
                <circle cx="56" cy="28" r="3" fill="#ef4444" />
              </svg>
            </div>
            <strong style={{ fontSize: '0.9rem', color: activeEnemy.isBoss ? '#f87171' : 'inherit' }}>
              {activeEnemy.isBoss ? '⚠️ ' : ''}{activeEnemy.name}
            </strong>

            {/* HP Bar */}
            <div style={{ width: '100px', height: '8px', backgroundColor: '#374151', borderRadius: '4px', margin: '4px auto 0 auto', overflow: 'hidden' }}>
              <div style={{ width: `${(activeEnemy.hp / activeEnemy.maxHp) * 100}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.15s ease-out' }} />
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
              HP: {activeEnemy.hp}/{activeEnemy.maxHp}
            </div>
          </div>
        ) : (
          <div style={{ opacity: 0.5, fontSize: '0.95rem', width: '100px', textAlign: 'center' }}>
            Looking for bug threads...
          </div>
        )}
      </div>

      {/* Logs underneath */}
      <div style={{ marginTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.6rem' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.3rem' }}>CONSOLE_STDERR_STREAM:</div>
        <div className="scrollable-logs" style={{ height: '90px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column-reverse', gap: '0.2rem' }}>
          {combatLogs.slice().reverse().map((log, idx) => {
            let logColor = 'inherit';
            if (log.includes('LEVEL UP')) logColor = '#fbbf24';
            else if (log.includes('strikes')) logColor = '#f87171';
            else if (log.includes('cast')) logColor = '#60a5fa';
            else if (log.includes('Defeated')) logColor = '#10b981';

            return (
              <div key={idx} style={{ color: logColor }}>
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default BattleArena;
