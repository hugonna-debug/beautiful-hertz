import React, { useEffect, useState } from 'react';
import { GameState, WanderingBug } from './types';

interface ThemeWrapperProps {
  state: GameState;
  squashBug: (id: string) => void;
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ state, squashBug, children }) => {
  const { theme, settings, wanderingBugs } = state;
  const [wiggleToggle, setWiggleToggle] = useState(false);

  // Wiggle wandering bugs direction vector updates periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setWiggleToggle(prev => !prev);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const gravityStyle = {
    '--gravity-y': `${settings.gravity * 15}px`,
    '--chaos-rotation': settings.chaos ? `${(Math.random() - 0.5) * 8}deg` : '0deg',
  } as React.CSSProperties;

  // CSS class determination
  const themeClass = `theme-${theme}`;
  const isCrt = theme === 'terminal' || theme === 'arcade' || theme === 'vaporwave';

  return (
    <div 
      className={`main-wrapper ${themeClass} ${isCrt ? 'crt-effect scanline-flicker' : ''} ${settings.chaos ? 'chaos-shaker' : ''}`}
      style={gravityStyle}
    >
      {/* Wandering Bug Layer */}
      {wanderingBugs.map((bug: WanderingBug) => {
        const angle = Math.atan2(bug.vy, bug.vx) * (180 / Math.PI) + 90; // bug faces direction of travel
        return (
          <div
            key={bug.id}
            className="bug-container"
            style={{
              left: `${bug.x}%`,
              top: `${bug.y}%`,
              transform: `translate(-50%, -50%) rotate(${angle}deg) ${wiggleToggle ? 'scale(1.05)' : 'scale(0.95)'}`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              squashBug(bug.id);
            }}
          >
            {/* Tiny Bug Health Bar */}
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#374151',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '2px'
            }}>
              <div style={{
                width: `${(bug.hp / bug.maxHp) * 100}%`,
                height: '100%',
                backgroundColor: '#ef4444'
              }} />
            </div>

            {/* Beetle SVG */}
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              {/* Legs */}
              <line x1="20" y1="40" x2="10" y2="30" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
              <line x1="20" y1="50" x2="5" y2="50" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
              <line x1="20" y1="60" x2="10" y2="70" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
              
              <line x1="80" y1="40" x2="90" y2="30" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
              <line x1="80" y1="50" x2="95" y2="50" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
              <line x1="80" y1="60" x2="90" y2="70" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />

              {/* Antennae */}
              <path d="M 40 20 Q 30 10 20 12" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              <path d="M 60 20 Q 70 10 80 12" fill="none" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

              {/* Body */}
              <ellipse cx="50" cy="55" rx="28" ry="32" fill="#991b1b" stroke="#ef4444" strokeWidth="4" />
              {/* Head */}
              <circle cx="50" cy="28" r="16" fill="#7f1d1d" stroke="#ef4444" strokeWidth="4" />
              {/* Eyes */}
              <circle cx="44" cy="24" r="3" fill="#fff" />
              <circle cx="56" cy="24" r="3" fill="#fff" />
              {/* Back stripe */}
              <line x1="50" y1="28" x2="50" y2="87" stroke="#450a0a" strokeWidth="4" />
              {/* Spots */}
              <circle cx="38" cy="48" r="4" fill="#000" />
              <circle cx="62" cy="48" r="4" fill="#000" />
              <circle cx="36" cy="65" r="4" fill="#000" />
              <circle cx="64" cy="65" r="4" fill="#000" />
              <circle cx="48" cy="76" r="4" fill="#000" />
            </svg>
          </div>
        );
      })}

      {children}
    </div>
  );
};
export default ThemeWrapper;
