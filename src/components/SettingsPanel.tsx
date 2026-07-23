import React, { useState } from 'react';
import { GameState } from '../types/game';
import { GearIcon } from './Icons';

interface SettingsPanelProps {
  state: GameState;
  updateSettings: (settings: { darkMode?: boolean; musicVolume?: number; sfxVolume?: number }) => void;
  resetGame: () => void;
  repairCloudAccount?: () => Promise<{ success: boolean; message: string }>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  state,
  updateSettings,
  resetGame,
  repairCloudAccount
}) => {
  const { darkMode, musicVolume, sfxVolume } = state;
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <div className="terminal-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
      <div style={{ borderBottom: '3px solid #000', paddingBottom: '0.6rem' }}>
        <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <GearIcon size={20} color="var(--neon-purple)" /> System Settings
        </h2>
        <span style={{ fontSize: '0.75rem', color: '#666' }}>Adjust visual and audio parameters.</span>
      </div>

      {/* 1. VISUAL SETTINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: '#333' }}>Visuals</h3>
        
        <label style={{ display: 'flex', alignItems: 'center', justifySelf: 'start', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => updateSettings({ darkMode: e.target.checked })}
            style={{ width: '18px', height: '18px', border: '2px solid #000', cursor: 'pointer' }}
          />
          🌙 Enable Dark Theme Mode
        </label>
      </div>

      {/* 2. AUDIO VOLUME SETTINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderBottom: '2px solid #eee', paddingBottom: '1.2rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: '#333' }}>Audio Synthesizer</h3>
        
        {/* Music volume slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
            <span>🎵 Music Volume</span>
            <span style={{ fontFamily: 'monospace' }}>{musicVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={musicVolume}
            onChange={(e) => updateSettings({ musicVolume: parseInt(e.target.value) })}
            style={{
              width: '100%',
              height: '10px',
              background: '#e2e8f0',
              border: '2px solid #000',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* SFX volume slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
            <span>🔊 Sound Effects (SFX) Volume</span>
            <span style={{ fontFamily: 'monospace' }}>{sfxVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={sfxVolume}
            onChange={(e) => updateSettings({ sfxVolume: parseInt(e.target.value) })}
            style={{
              width: '100%',
              height: '10px',
              background: '#e2e8f0',
              border: '2px solid #000',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      {/* 3. SAVE DATA DIAGNOSTICS & STALE REPAIR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderBottom: '2px solid #eee', paddingBottom: '1.2rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: '#333' }}>☁️ Save Data Diagnostics & Repair</h3>
        <p style={{ fontSize: '0.7rem', color: '#666', margin: 0, lineHeight: '1.3' }}>
          Clean and repair any stale, legacy, or corrupt save JSON data from previous updates.
        </p>
        
        <button
          onClick={async () => {
            if (repairCloudAccount) {
              const res = await repairCloudAccount();
              alert(res.message);
            }
          }}
          className="game-btn"
          style={{
            padding: '0.55rem 0.9rem',
            fontSize: '0.75rem',
            background: 'var(--neon-cyan)',
            color: '#000',
            fontWeight: 'bold',
            border: '2px solid #000',
            cursor: 'pointer'
          }}
        >
          {state.cloudUser ? '🛠️ REPAIR GOOGLE CLOUD & LOCAL JSON DATA' : '🛠️ REPAIR LOCAL SAVE JSON DATA'}
        </button>
      </div>

      {/* 3. DANGER ZONE RESET */}
      <div style={{ background: '#fef2f2', border: '2px dashed #ef4444', padding: '1rem', marginTop: 'auto' }}>
        <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', textTransform: 'uppercase', color: '#991b1b' }}>⚠️ Danger Zone</h3>
        <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.6rem', lineHeight: '1.3' }}>
          Performing a hard reset wipes all stats, equipped gear, talent choices, and ascension progress forever. This action is irreversible.
        </p>

        {showConfirmReset ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#b91c1c' }}>Are you absolutely sure you want to delete all data?</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  resetGame();
                  setShowConfirmReset(false);
                }}
                className="game-btn"
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  background: '#ef4444',
                  color: '#fff',
                  fontWeight: 'bold'
                }}
              >
                🔴 CONFIRM ERASE ALL DATA
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="game-btn"
                style={{
                  flex: 1,
                  padding: '0.4rem',
                  fontSize: '0.75rem',
                  background: '#fff',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="game-btn"
            style={{
              width: '100%',
              padding: '0.5rem',
              fontSize: '0.75rem',
              background: '#fee2e2',
              color: '#991b1b',
              fontWeight: 'bold'
            }}
          >
            ☣️ TRIGGER SYSTEM HARD RESET
          </button>
        )}
      </div>
    </div>
  );
};
export default SettingsPanel;
