import React, { useState, useEffect, useRef } from 'react';
import { GameState } from './types';

interface RetroTerminalProps {
  state: GameState;
  handleGenerateCreep: () => void;
}

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  value: string;
  color: string;
}

export const RetroTerminal: React.FC<RetroTerminalProps> = ({ state, handleGenerateCreep }) => {
  const { achievements, theme, gachaCards, hero } = state;
  const [logs, setLogs] = useState<string[]>([]);
  const [floatingNums, setFloatingNums] = useState<FloatingNumber[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);

  // Scroll logs to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Log automated creep additions
  useEffect(() => {
    const activeAutoCount = state.autoClickers.reduce((acc, c) => acc + c.count, 0);
    if (activeAutoCount > 0) {
      const interval = setInterval(() => {
        const timestamp = new Date().toLocaleTimeString();
        const baseCps = state.autoClickers.reduce((acc, c) => acc + (c.cps * c.count), 0);
        const autoMult = gachaCards.reduce((acc, c) => acc * c.autoClickMultiplier, 1);
        const finalCps = (baseCps * autoMult).toFixed(1);
        
        setLogs(prev => {
          const next = [...prev, `[${timestamp}] AUTO: Added ${finalCps} Creep to buffer.`];
          return next.slice(-20); // Keep last 20 logs
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [state.autoClickers, gachaCards]);

  // Add click to logs
  const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    handleGenerateCreep();

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const devClickMult = gachaCards.reduce((acc, card) => acc * card.clickMultiplier, 1);
    const rpgLevelBonus = 1 + (hero.level - 1) * 0.1;
    const finalMult = (state.creepMultiplier * devClickMult * rpgLevelBonus).toFixed(1);

    const colors = {
      terminal: '#33ff33',
      arcade: '#00ffff',
      vaporwave: '#ff71ce',
      glassmorphic: '#8b5cf6',
    };

    const newNum: FloatingNumber = {
      id: Date.now() + Math.random(),
      x,
      y,
      value: `+${finalMult}`,
      color: colors[theme] || '#fff',
    };

    setFloatingNums(prev => [...prev, newNum]);
    clickCountRef.current += 1;

    // Log the click
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => {
      const next = [...prev, `[${timestamp}] INPUT: Register click #${clickCountRef.current} (+${finalMult})`];
      return next.slice(-20);
    });

    // Cleanup floating numbers
    setTimeout(() => {
      setFloatingNums(prev => prev.filter(n => n.id !== newNum.id));
    }, 8000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Clicker Card */}
      <div className="terminal-panel gravity-item" style={{ position: 'relative', textAlign: 'center', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <button
          onClick={onButtonClick}
          style={{
            fontSize: '1.2rem',
            padding: '1.5rem 3rem',
            fontWeight: 'bold',
            position: 'relative',
            outline: 'none',
          }}
        >
          GENERATE CREEP
          
          {/* Floating numbers inside button relative area */}
          {floatingNums.map(num => (
            <span
              key={num.id}
              className="floating-num"
              style={{
                left: `${num.x}px`,
                top: `${num.y}px`,
                color: num.color
              }}
            >
              {num.value}
            </span>
          ))}
        </button>
        <p style={{ marginTop: '1rem', opacity: 0.8, fontSize: '0.9rem' }}>
          Clicks amplify codebase size. Features unlock automatically.
        </p>
      </div>

      {/* Terminal Log Console */}
      <div className="terminal-panel gravity-item">
        <h3 style={{ margin: '0 0 0.8rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          &gt;_ CONSOLE OUTPUT LOGS
        </h3>
        <div className="scrollable-logs" style={{ height: '180px', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
          {logs.length === 0 ? (
            <div style={{ opacity: 0.5 }}>System idle. Ready for input...</div>
          ) : (
            logs.map((log, idx) => <div key={idx}>{log}</div>)
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Achievements Section */}
      <div className="terminal-panel gravity-item">
        <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          🏆 SYSTEM MILESTONES (ACHIEVEMENTS)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem' }}>
          {achievements.map(ach => (
            <div
              key={ach.id}
              style={{
                border: '1px solid currentColor',
                padding: '0.6rem',
                opacity: ach.unlocked ? 1 : 0.35,
                backgroundColor: ach.unlocked ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                transform: ach.unlocked ? 'scale(1)' : 'scale(0.95)'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{ach.name}</div>
              <div style={{ fontSize: '0.7rem', marginTop: '0.2rem', opacity: 0.8 }}>{ach.description}</div>
              {ach.unlocked && <div style={{ fontSize: '0.65rem', marginTop: '0.4rem', color: '#10b981' }}>✓ UNLOCKED</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default RetroTerminal;
