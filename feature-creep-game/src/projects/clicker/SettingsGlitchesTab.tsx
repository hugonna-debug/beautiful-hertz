import React, { useState } from 'react';
import { GameState, GameSettings } from './types';

interface SettingsGlitchesTabProps {
  state: GameState;
  updateSettings: (updates: Partial<GameSettings>) => void;
  spawnWanderingBug: () => void;
}

export const SettingsGlitchesTab: React.FC<SettingsGlitchesTabProps> = ({
  state,
  updateSettings,
  spawnWanderingBug
}) => {
  const { settings, wanderingBugs } = state;
  const [bsodActive, setBsodActive] = useState(false);

  const handleBsod = () => {
    setBsodActive(true);
    setTimeout(() => {
      setBsodActive(false);
    }, 4000);
  };

  if (bsodActive) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: '#0000aa',
        color: '#ffffff',
        fontFamily: 'monospace',
        padding: '3rem',
        zIndex: 1000000,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box',
        textAlign: 'left'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          color: '#0000aa',
          padding: '0.2rem 1rem',
          display: 'inline-block',
          fontWeight: 'bold',
          marginBottom: '2rem'
        }}>
          Windows
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>A fatal exception 0E has occurred at 0028:C0011A3D.</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>
          The current application "Feature Creep" has exceeded its maximum allowed complexity limits.
          Management demands more features, but the CPU has run out of index space.
        </p>
        <ul style={{ fontSize: '1.1rem', margin: '1.5rem 0', paddingLeft: '2rem' }}>
          <li>* Press any key to accept more features.</li>
          <li>* Press CTRL+ALT+DEL to schedule a 3-hour scrum meeting.</li>
          <li>* Press clicks to generate budget approvals.</li>
        </ul>
        <p style={{ fontSize: '1.2rem', marginTop: '2rem', opacity: 0.8 }}>
          Restoring state in 4 seconds... Please stand by.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* settings controls */}
      <div className="terminal-panel gravity-item">
        <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          ⚙️ SYSTEM CONFIGURATION PANEL
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          
          {/* Gravity slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <strong>UI Gravity Coefficient: {settings.gravity}g</strong>
              <span style={{ opacity: 0.7 }}>Warp layout gravity</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={settings.gravity}
              onChange={(e) => updateSettings({ gravity: parseInt(e.target.value) })}
              style={{ width: '100%', cursor: 'ew-resize' }}
            />
            <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>
              Applying physical gravity constraints pulling layout columns downward.
            </p>
          </div>

          {/* Volume slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <strong>Sound Volume: {settings.volume}%</strong>
              <span style={{ opacity: 0.7 }}>Useless slider</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.volume}
              onChange={(e) => updateSettings({ volume: parseInt(e.target.value) })}
              style={{ width: '100%', cursor: 'ew-resize' }}
            />
          </div>

          {/* Chaos Mode Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Activate Glitch CSS Chaos Mode</strong>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Shakes the screen and tilts visual components</div>
            </div>
            <input
              type="checkbox"
              checked={settings.chaos}
              onChange={(e) => updateSettings({ chaos: e.target.checked })}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

          {/* Bug Spawner Active Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
            <div>
              <strong style={{ fontSize: '0.9rem' }}>Automated Wandering Bug Spawner</strong>
              <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Crawling bugs eat code logic (causes stock drops!)</div>
            </div>
            <input
              type="checkbox"
              checked={settings.bugSpawnerActive}
              onChange={(e) => updateSettings({ bugSpawnerActive: e.target.checked })}
              style={{ width: '20px', height: '20px' }}
            />
          </div>

        </div>
      </div>

      {/* Experimental Dev Controls */}
      <div className="terminal-panel gravity-item">
        <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          🧪 EXPERIMENTAL BUG DEVELOPMENT TOOLS
        </h3>
        <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.2rem' }}>
          Direct injections into running runtime context. Use at own discretion.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          <button 
            onClick={spawnWanderingBug}
            disabled={wanderingBugs.length >= 8}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          >
            Spawn Wandering Bug (+1)
          </button>
          
          <button 
            onClick={handleBsod}
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', borderColor: '#ef4444', color: '#f87171' }}
          >
            Trigger Kernel Panic (BSOD)
          </button>
        </div>
      </div>
    </div>
  );
};
export default SettingsGlitchesTab;
