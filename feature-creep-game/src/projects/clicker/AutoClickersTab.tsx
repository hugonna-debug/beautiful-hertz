import React from 'react';
import { GameState } from './types';

interface AutoClickersTabProps {
  state: GameState;
  buyAutoClicker: (id: string) => void;
}

export const AutoClickersTab: React.FC<AutoClickersTabProps> = ({ state, buyAutoClicker }) => {
  const { autoClickers, creep, gachaCards } = state;

  // Calculate global multipliers
  const autoMult = gachaCards.reduce((acc, card) => acc * card.autoClickMultiplier, 1);
  const baseCps = autoClickers.reduce((acc, c) => acc + (c.cps * c.count), 0);
  const finalCps = baseCps * autoMult;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Auto-clicker metrics */}
      <div className="terminal-panel gravity-item">
        <h3 style={{ margin: '0 0 0.8rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          🖥️ AUTOMATED CREEP BUFFER STATUS
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Base Operations: </span>
            <strong style={{ fontSize: '1.1rem' }}>{baseCps.toFixed(1)} creep/s</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Dev Bonuses (Multiplier): </span>
            <strong style={{ fontSize: '1.1rem', color: '#a855f7' }}>x{autoMult.toFixed(2)}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Effective Output: </span>
            <strong style={{ fontSize: '1.2rem', color: '#10b981' }}>{finalCps.toFixed(1)} creep/s</strong>
          </div>
        </div>
      </div>

      {/* Upgrades grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {autoClickers.map(clicker => {
          const canAfford = creep >= clicker.cost;
          const totalCpsContribution = clicker.cps * clicker.count * autoMult;

          return (
            <div 
              key={clicker.id} 
              className="card gravity-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                padding: '1.2rem',
                border: '1px solid currentColor'
              }}
            >
              <div style={{ flex: '1 1 250px' }}>
                <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>
                  {clicker.name} <span style={{ opacity: 0.6 }}>({clicker.count} Active)</span>
                </h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', opacity: 0.8 }}>
                  {clicker.description}
                </p>
                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  Individual yield: {clicker.cps} creep/s | Total yield: {totalCpsContribution.toFixed(1)} creep/s
                </div>
              </div>

              <div>
                <button
                  disabled={!canAfford}
                  onClick={() => buyAutoClicker(clicker.id)}
                  style={{
                    minWidth: '130px',
                    fontSize: '0.9rem'
                  }}
                >
                  Hire ({clicker.cost} creep)
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AutoClickersTab;
