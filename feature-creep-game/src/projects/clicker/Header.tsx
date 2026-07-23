import React from 'react';
import { GameState } from './types';

interface HeaderProps {
  state: GameState;
  resetGame: () => void;
  onExit?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ state, resetGame, onExit }) => {
  const { creep, clicks, stage, hero, portfolio, gachaCards, achievements, theme } = state;

  // Customized title and labels based on active aesthetic theme
  const getThemeText = () => {
    switch (theme) {
      case 'terminal':
        return {
          title: 'SYS://FEATURE_CREEP/CLICKER_V0.1',
          creepLabel: 'CREEP_COUNT:',
          clicksLabel: 'CLICK_INT:',
          resetLabel: 'SHUTDOWN -R NOW',
        };
      case 'arcade':
        return {
          title: '⚡ FEATURE CREEP: LEVEL UP ⚡',
          creepLabel: 'SCORE:',
          clicksLabel: 'INSERTED COINS:',
          resetLabel: 'RESET CONSOLE',
        };
      case 'vaporwave':
        return {
          title: 'Ｆｅａｔｕｒｅ Ｃｒｅｅｐ ░９５',
          creepLabel: '░ クリープ ░',
          clicksLabel: '░ クリック ░',
          resetLabel: 'FORMAT A:\\',
        };
      case 'glassmorphic':
      default:
        return {
          title: 'Feature Creep Enterprise™',
          creepLabel: 'Total Bloat (Creep):',
          clicksLabel: 'Direct Inputs:',
          resetLabel: 'Nuke Production',
        };
    }
  };

  const labels = getThemeText();
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  return (
    <header className="terminal-panel gravity-item" style={{ marginBottom: '1.5rem', width: '100%' }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        {/* Title */}
        <div>
          <h1 className="glitch-text" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
            {labels.title}
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', opacity: 0.7, fontSize: '0.85rem' }}>
            Active Feature Bloat Level: Tier {stage} ({theme.toUpperCase()} theme)
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onExit && (
            <button onClick={onExit} style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
              Main Menu
            </button>
          )}
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to revert all features, delete your codebase, and start fresh?')) {
                resetGame();
              }
            }}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
          >
            {labels.resetLabel}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
        borderTop: '1px dashed currentColor',
        paddingTop: '1rem'
      }}>
        {/* Main Creep */}
        <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{labels.creepLabel}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
            {Math.floor(creep).toLocaleString()}
          </div>
        </div>

        {/* Direct clicks */}
        <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{labels.clicksLabel}</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{clicks}</div>
        </div>

        {/* RPG Gold (Tier >= 2) */}
        {stage >= 2 && (
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>⚔️ Bug Loot (Gold):</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fbbf24' }}>
              {hero.gold}g
            </div>
          </div>
        )}

        {/* Stock Balance (Tier >= 3) */}
        {stage >= 3 && (
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>📈 Broker Cash:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>
              ${portfolio.balance.toFixed(2)}
            </div>
          </div>
        )}

        {/* Gacha Developers Summoned (Tier >= 4) */}
        {stage >= 4 && (
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>👥 Dev Team:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#a855f7' }}>
              {gachaCards.length} devs
            </div>
          </div>
        )}

        {/* Achievements unlocked */}
        <div>
          <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>🏆 Trophies:</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
            {unlockedAchievements}/{achievements.length}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
