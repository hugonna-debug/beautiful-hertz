import React, { useState, useEffect } from 'react';
import { RpgHero, RpgEnemy, CombatMode, RpgSkill } from '../types/game';

interface BattleArenaProps {
  hero: RpgHero;
  activeEnemy: RpgEnemy | null;
  combatMode: CombatMode;
  combatLogs: string[];
  playerTurn: boolean;
  inCombat: boolean;
  executeTurnAction: (action: 'attack' | 'pass') => void;
  handleRealTimeClick: () => void;
  fleeCombat: () => void;
  castSkill: (skillId: string) => void;
  toggleCombatMode: (mode: CombatMode) => void;
}

interface FloatingNum {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  hero,
  activeEnemy,
  combatMode,
  combatLogs,
  playerTurn,
  inCombat,
  executeTurnAction,
  handleRealTimeClick,
  fleeCombat,
  castSkill,
  toggleCombatMode
}) => {
  const [flashHero, setFlashHero] = useState(false);
  const [flashEnemy, setFlashEnemy] = useState(false);
  const [floatings, setFloatings] = useState<FloatingNum[]>([]);

  // Monitor logs to trigger visual flashes and floating damage numbers
  useEffect(() => {
    if (combatLogs.length > 0) {
      const lastLog = combatLogs[combatLogs.length - 1];
      const id = Date.now() + Math.random();

      if (lastLog.includes('dealt') || lastLog.includes('cast') || lastLog.includes('Attack dealt') || lastLog.includes('Direct Click!')) {
        // Hero hit Enemy
        setFlashEnemy(true);
        const t = setTimeout(() => setFlashEnemy(false), 200);
        
        // Extract damage number
        const numMatch = lastLog.match(/\b\d+\b/);
        if (numMatch) {
          const val = numMatch[0];
          setFloatings(prev => [...prev, {
            id,
            text: `-${val}`,
            x: 65 + (Math.random() * 15 - 7.5),
            y: 35 + (Math.random() * 10 - 5),
            color: lastLog.includes('CRIT') || lastLog.includes('CRITICAL') ? '#f59e0b' : '#ef4444'
          }]);
        }
        return () => clearTimeout(t);
      } else if (lastLog.includes('strikes') || lastLog.includes('damage to Hero') || lastLog.includes('strikes Hero')) {
        // Enemy hit Hero
        setFlashHero(true);
        const t = setTimeout(() => setFlashHero(false), 200);

        // Extract damage number
        const numMatch = lastLog.match(/\b\d+\b/);
        if (numMatch) {
          const val = numMatch[0];
          setFloatings(prev => [...prev, {
            id,
            text: `-${val}`,
            x: 25 + (Math.random() * 15 - 7.5),
            y: 35 + (Math.random() * 10 - 5),
            color: '#f87171'
          }]);
        }
        return () => clearTimeout(t);
      } else if (lastLog.includes('EVADED') || lastLog.includes('Evaded')) {
        // Evaded
        setFloatings(prev => [...prev, {
          id,
          text: 'EVADE!',
          x: 25,
          y: 25,
          color: '#3b82f6'
        }]);
      } else if (lastLog.includes('Restored')) {
        // Heal
        const numMatch = lastLog.match(/\b\d+\b/);
        if (numMatch) {
          const val = numMatch[0];
          setFloatings(prev => [...prev, {
            id,
            text: `+${val} HP`,
            x: 25,
            y: 25,
            color: '#10b981'
          }]);
        }
      }
    }
  }, [combatLogs]);

  // Clean up floating numbers after animation completes
  useEffect(() => {
    if (floatings.length > 0) {
      const t = setTimeout(() => {
        setFloatings(prev => prev.slice(1));
      }, 800);
      return () => clearTimeout(t);
    }
  }, [floatings]);

  const getClassColor = () => {
    switch (hero.class) {
      case 'paladin': return '#fbbf24';
      case 'mech': return '#06ffa1';
      case 'demigod': return '#8b5cf6';
      case 'hacker': return '#ff71ce';
      default: return '#fff';
    }
  };

  const classColor = getClassColor();

  return (
    <div className="terminal-panel" style={{ width: '100%' }}>
      
      {/* Top action header: combat mode selector + exit */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.8rem',
        marginBottom: '0.8rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        paddingBottom: '0.6rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>STYLE:</span>
          <div style={{ display: 'flex', gap: '2px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
            <button
              onClick={() => toggleCombatMode('turn')}
              disabled={inCombat}
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                background: combatMode === 'turn' ? 'var(--cosmic-purple)' : 'transparent',
                boxShadow: 'none',
                borderRadius: 0,
                border: 0
              }}
            >
              Turn-Based
            </button>
            <button
              onClick={() => toggleCombatMode('realtime')}
              disabled={inCombat}
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                background: combatMode === 'realtime' ? 'var(--cosmic-purple)' : 'transparent',
                boxShadow: 'none',
                borderRadius: 0,
                border: 0
              }}
            >
              Real-Time
            </button>
            <button
              onClick={() => toggleCombatMode('auto')}
              disabled={inCombat}
              style={{
                fontSize: '0.7rem',
                padding: '2px 8px',
                background: combatMode === 'auto' ? 'var(--cosmic-purple)' : 'transparent',
                boxShadow: 'none',
                borderRadius: 0,
                border: 0
              }}
            >
              Auto-Idle
            </button>
          </div>
        </div>

        {inCombat && (
          <button
            onClick={fleeCombat}
            style={{
              padding: '2px 10px',
              fontSize: '0.7rem',
              background: 'rgba(239,68,68,0.15)',
              borderColor: 'rgba(239,68,68,0.3)',
              color: '#ef4444',
              boxShadow: 'none'
            }}
          >
            Flee Arena (Sever)
          </button>
        )}
      </div>

      {/* Battle Viewport */}
      <div style={{
        height: '240px',
        backgroundColor: '#0a0515',
        border: '3px solid rgba(139, 92, 246, 0.4)',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '1rem',
        boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.9)'
      }}>
        
        {/* Perspectival grid background lines */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }} />

        {/* Floating Numbers rendering */}
        {floatings.map(f => (
          <div
            key={f.id}
            className="floating-num"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              color: f.color,
              fontSize: f.text.includes('EVADE') ? '1.1rem' : '1.4rem'
            }}
          >
            {f.text}
          </div>
        ))}

        {/* Hero sprite container */}
        <div style={{
          textAlign: 'center',
          zIndex: 10,
          transition: 'transform 0.1s',
          transform: flashHero ? 'translateX(-12px) scale(0.9)' : 'none',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: flashHero ? '#ef4444' : '#170e2b',
            border: `3px solid ${classColor}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.6rem auto',
            boxShadow: `0 0 15px ${classColor}`,
            transition: 'background-color 0.1s'
          }}>
            {/* Custom Champion SVGs based on Class */}
            {hero.class === 'paladin' && (
              <svg viewBox="0 0 100 100" width="55" height="55" fill="none" stroke="#fff" strokeWidth="5">
                <path d="M25 25 L75 25 L75 60 C75 75 50 85 50 85 C50 85 25 75 25 60 Z" />
              </svg>
            )}
            {hero.class === 'mech' && (
              <svg viewBox="0 0 100 100" width="55" height="55" fill="none" stroke="#fff" strokeWidth="5">
                <rect x="25" y="25" width="50" height="50" rx="6" />
                <circle cx="50" cy="50" r="10" />
              </svg>
            )}
            {hero.class === 'demigod' && (
              <svg viewBox="0 0 100 100" width="55" height="55" fill="none" stroke="#fff" strokeWidth="5">
                <circle cx="50" cy="50" r="15" />
                <path d="M50 15 L50 25 M50 85 L50 75 M15 50 L25 50 M85 50 L75 50" />
              </svg>
            )}
            {hero.class === 'hacker' && (
              <svg viewBox="0 0 100 100" width="55" height="55" fill="none" stroke="#fff" strokeWidth="5">
                <rect x="20" y="30" width="60" height="40" rx="3" />
                <line x1="30" y1="40" x2="45" y2="40" />
                <line x1="30" y1="50" x2="60" y2="50" />
              </svg>
            )}
          </div>
          <strong style={{ fontSize: '0.85rem' }}>{hero.name}</strong>
          
          {/* Health Bar */}
          <div style={{ width: '90px', height: '10px', backgroundColor: '#0d0e14', border: '2px solid #000', overflow: 'hidden', margin: '4px auto 0 auto' }}>
            <div style={{ width: `${(hero.hp / hero.maxHp) * 100}%`, height: '100%', backgroundColor: '#ef4444' }} />
          </div>
        </div>

        {/* Central Combat Mode Indicator */}
        <div style={{ textAlign: 'center', opacity: 0.15 }}>
          {combatMode === 'turn' && <span style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>TACTICAL_MODE</span>}
          {combatMode === 'realtime' && <span style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>SPEED_CLICK_MODE</span>}
          {combatMode === 'auto' && <span style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>AUTO_IDLE_MODE</span>}
        </div>

        {/* Enemy Sprite container */}
        {activeEnemy ? (
          <div
            onClick={combatMode === 'realtime' ? handleRealTimeClick : undefined}
            style={{
              textAlign: 'center',
              zIndex: 10,
              cursor: combatMode === 'realtime' ? 'pointer' : 'default',
              transition: 'transform 0.1s',
              transform: flashEnemy ? 'translateX(12px) scale(0.9)' : 'none'
            }}
          >
            <div
              className={combatMode === 'realtime' ? 'pulse-enemy' : 'bug-wiggle'}
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: flashEnemy ? '#ef4444' : 'rgba(255, 113, 206, 0.05)',
                border: `3px solid ${activeEnemy.isBoss ? '#f59e0b' : '#ff71ce'}`,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.6rem auto',
                boxShadow: activeEnemy.isBoss ? '0 0 25px rgba(245, 158, 11, 0.3)' : '0 0 15px rgba(255, 113, 206, 0.2)',
                transition: 'background-color 0.1s'
              }}
            >
              {/* Monster Custom SVGs */}
              <svg viewBox="0 0 100 100" width="55" height="55" fill="none" stroke={activeEnemy.isBoss ? '#f59e0b' : '#ff71ce'} strokeWidth="5">
                {activeEnemy.isBoss ? (
                  // Dragon/Boss symbol
                  <path d="M50 15 L75 35 L60 55 L75 85 L25 85 L40 55 L25 35 Z" fill="rgba(245,158,11,0.05)" />
                ) : (
                  // Void Beast Slime shape
                  <ellipse cx="50" cy="55" rx="30" ry="25" fill="rgba(255,113,206,0.05)" />
                )}
                {/* Eyes */}
                <circle cx="40" cy="48" r="3" fill="#fff" />
                <circle cx="60" cy="48" r="3" fill="#fff" />
              </svg>
            </div>
            
            <strong style={{ fontSize: '0.85rem', color: activeEnemy.isBoss ? '#f59e0b' : 'inherit' }}>
              {activeEnemy.isBoss ? '👑 ' : ''}{activeEnemy.name}
            </strong>

            {/* Health Bar */}
            {/* Health Bar */}
            <div style={{ width: '90px', height: '10px', backgroundColor: '#0d0e14', border: '2px solid #000', overflow: 'hidden', margin: '4px auto 0 auto' }}>
              <div style={{ width: `${(activeEnemy.hp / activeEnemy.maxHp) * 100}%`, height: '100%', backgroundColor: '#ff71ce', transition: 'width 0.15s ease-out' }} />
            </div>
          </div>
        ) : (
          <div style={{ opacity: 0.4, fontSize: '0.9rem', textAlign: 'center', width: '150px' }}>
            Portal clear. Enter a dungeon stage.
          </div>
        )}
      </div>

      {/* Combat Mode controls */}
      {inCombat && activeEnemy && (
        <div style={{ marginTop: '0.8rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {combatMode === 'turn' ? (
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                disabled={!playerTurn}
                onClick={() => executeTurnAction('attack')}
                style={{ padding: '0.4rem 1.5rem', fontSize: '0.85rem' }}
              >
                Attack Action
              </button>
              <button
                disabled={!playerTurn}
                onClick={() => executeTurnAction('pass')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'transparent' }}
              >
                Pass Turn
              </button>
            </div>
          ) : combatMode === 'realtime' ? (
            <div style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--neon-cyan)', animation: 'pulse 1s infinite alternate' }}>
              💥 SPAM CLICK THE MONSTER TO DEAL EXTRA HIT DAMAGE!
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--neon-pink)' }}>
              ⚙️ Hero is auto-swinging and auto-casting unlocked skills...
            </div>
          )}
        </div>
      )}

      {/* Cooldown Skill bar inside Battle panel */}
      {inCombat && activeEnemy && (
        <div style={{ marginTop: '1.2rem', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.4rem' }}>ACTIVE SKILL CODEX:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {hero.skills.filter(s => s.unlocked).map(skill => {
              const hasMana = hero.mana >= skill.manaCost;
              const onCooldown = skill.currentCooldown > 0;
              const canCast = inCombat && hasMana && !onCooldown && (combatMode !== 'turn' || playerTurn);

              return (
                <button
                  key={skill.id}
                  disabled={!canCast}
                  onClick={() => castSkill(skill.id)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.8rem',
                    background: onCooldown ? '#000' : 'rgba(139,92,246,0.1)',
                    borderColor: onCooldown ? 'rgba(255,255,255,0.05)' : 'rgba(139,92,246,0.3)',
                    color: onCooldown ? '#777' : 'inherit',
                    position: 'relative'
                  }}
                >
                  {skill.name} ({skill.manaCost} MP)
                  {onCooldown && (
                    <span style={{ marginLeft: '4px', color: 'var(--neon-pink)', fontWeight: 'bold' }}>
                      {Math.ceil(skill.currentCooldown)}s
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stderr Logs underneath */}
      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '0.2rem', fontFamily: 'monospace' }}>NEXUS_BATTLE_STDOUT:</div>
        <div className="scrollable-logs" style={{ height: '90px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column-reverse', gap: '0.2rem' }}>
          {combatLogs.slice().reverse().map((log, idx) => {
            let logColor = 'inherit';
            if (log.includes('LEVEL UP')) logColor = 'var(--gold-myth)';
            else if (log.includes('Hero Turn:')) logColor = 'var(--neon-cyan)';
            else if (log.includes('Enemy Turn:') || log.includes('strikes:')) logColor = '#f87171';
            else if (log.includes('SUCCESS') || log.includes('Banished')) logColor = '#06ffa1';
            else if (log.includes('cast')) logColor = 'var(--cosmic-purple)';

            return (
              <div key={idx} style={{ color: logColor }}>
                &gt;_ {log}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
export default BattleArena;
