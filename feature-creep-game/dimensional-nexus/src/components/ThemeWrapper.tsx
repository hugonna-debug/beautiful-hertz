import React from 'react';
import { GameState } from '../types/game';

interface ThemeWrapperProps {
  state: GameState;
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ state, children }) => {
  const { activeDungeonId, inCombat } = state;

  const getDungeonClass = () => {
    if (!inCombat) return 'nexus-portal';
    switch (activeDungeonId) {
      case 'colosseum': return 'arena-colosseum';
      case 'megacity': return 'arena-megacity';
      case 'keep': return 'arena-keep';
      case 'void': return 'arena-void';
      default: return 'nexus-portal';
    }
  };

  const dungeonClass = getDungeonClass();

  return (
    <div className={`main-wrapper ${dungeonClass}`} style={{ position: 'relative' }}>
      {/* Background layer */}
      <div className="bg-portal" />
      <div className="bg-portal-grid" />
      
      {/* Content Area */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        {children}
      </div>

      <style>{`
        .bg-portal {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #12131a;
          z-index: 1;
        }

        .bg-portal-grid {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: 
            linear-gradient(rgba(0,0,0,0.15) 2px, transparent 2px),
            linear-gradient(90deg, rgba(0,0,0,0.15) 2px, transparent 2px);
          background-size: 40px 40px;
          z-index: 2;
          pointer-events: none;
        }

        /* Colosseum (Gold Brutalism) */
        .arena-colosseum .bg-portal {
          background-color: #2b1f0d !important;
        }
        .arena-colosseum .bg-portal-grid {
          background-image: 
            linear-gradient(rgba(251, 191, 36, 0.05) 2px, transparent 2px),
            linear-gradient(90deg, rgba(251, 191, 36, 0.05) 2px, transparent 2px) !important;
        }

        /* Megacity (Neon Cyan Brutalism) */
        .arena-megacity .bg-portal {
          background-color: #0b1a1f !important;
        }
        .arena-megacity .bg-portal-grid {
          background-image: 
            linear-gradient(rgba(6, 255, 161, 0.05) 2px, transparent 2px),
            linear-gradient(90deg, rgba(6, 255, 161, 0.05) 2px, transparent 2px) !important;
        }

        /* Keep (Steel Dark Brutalism) */
        .arena-keep .bg-portal {
          background-color: #16171d !important;
        }
        .arena-keep .bg-portal-grid {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 2px, transparent 2px) !important;
        }

        /* Void (Vibrant Violet Brutalism) */
        .arena-void .bg-portal {
          background-color: #200c2b !important;
        }
        .arena-void .bg-portal-grid {
          background-image: 
            linear-gradient(rgba(255, 113, 206, 0.05) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255, 113, 206, 0.05) 2px, transparent 2px) !important;
        }
      `}</style>
    </div>
  );
};
export default ThemeWrapper;
