import { useState } from 'react';
import { useGameState } from './useGameState';
import ThemeWrapper from './ThemeWrapper';
import Header from './Header';
import RetroTerminal from './RetroTerminal';
import AutoClickersTab from './AutoClickersTab';
import RpgCombatTab from './RpgCombatTab';
import StockMarketTab from './StockMarketTab';
import GachaTab from './GachaTab';
import SettingsGlitchesTab from './SettingsGlitchesTab';

function App({ onExit }: { onExit?: () => void }) {
  const {
    state,
    pendingFeature,
    handleGenerateCreep,
    buyAutoClicker,
    buyWeapon,
    buyArmor,
    buyStock,
    sellStock,
    convertCreepToCash,
    convertCashToCreep,
    buyGachaTicket,
    summonGacha,
    fireDeveloper,
    updateSettings,
    spawnWanderingBug,
    squashBug,
    acceptFeature,
    resetGame,
  } = useGameState();

  const [activeTab, setActiveTab] = useState<'clicker' | 'autoclickers' | 'rpg' | 'stocks' | 'gacha' | 'settings'>('clicker');

  const { stage } = state;

  return (
    <ThemeWrapper state={state} squashBug={squashBug}>
      {/* Game Header */}
      <Header state={state} resetGame={resetGame} onExit={onExit} />

      {/* Feature Request Popup Overlay */}
      {pendingFeature && (
        <div className="feature-popup-overlay">
          <div className="feature-popup terminal-panel" style={{ border: '3px solid #ff00ff' }}>
            <h2 className="glitch-text" style={{ color: '#ef4444', margin: '0 0 1rem 0' }}>
              ⚠️ CRITICAL FEATURE REQUEST
            </h2>
            <div style={{ border: '1px dashed currentColor', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.4rem' }}><strong>Ticket ID:</strong> BLOAT-{(stage + 1) * 110}</div>
              <div style={{ marginBottom: '0.4rem' }}><strong>Feature Requested:</strong> {pendingFeature.name}</div>
              <div style={{ marginBottom: '0.4rem' }}><strong>Assignee:</strong> Player (Lead Developer)</div>
              <div>
                <strong>Description:</strong> Competitors are launching similar functionality. 
                Management mandates immediate integration into the production repository. 
                Refusal to accept will delay scheduling future status meetings.
              </div>
            </div>
            <button
              onClick={() => {
                acceptFeature();
                // Set active tab to new feature
                if (pendingFeature.stage === 1) setActiveTab('autoclickers');
                if (pendingFeature.stage === 2) setActiveTab('rpg');
                if (pendingFeature.stage === 3) setActiveTab('stocks');
                if (pendingFeature.stage === 4) setActiveTab('gacha');
                if (pendingFeature.stage === 5) setActiveTab('settings');
              }}
              style={{ fontSize: '1rem', padding: '0.6rem 2rem' }}
            >
              APPROVE & MERGE PR
            </button>
          </div>
        </div>
      )}

      {/* Game Content Grid */}
      <div className="game-grid">
        {/* Left Column: Core Clicker Terminal (Always visible on desktop if stage >= 1, else clicker takes full page) */}
        {stage === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <RetroTerminal state={state} handleGenerateCreep={handleGenerateCreep} />
          </div>
        ) : (
          <>
            {/* Desktop Left-Panel (Clicks) */}
            <div className="gravity-item" style={{ display: 'flex', flexDirection: 'column' }}>
              <RetroTerminal state={state} handleGenerateCreep={handleGenerateCreep} />
            </div>

            {/* Desktop Right-Panel (Tabs of Creeps) */}
            <div className="gravity-item">
              <div className="tab-container" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Tab Navigation header */}
                <div className="tabs-header">
                  <button
                    className={`tab-btn ${activeTab === 'clicker' ? 'active' : ''}`}
                    onClick={() => setActiveTab('clicker')}
                  >
                    Console Output
                  </button>

                  {stage >= 1 && (
                    <button
                      className={`tab-btn ${activeTab === 'autoclickers' ? 'active' : ''}`}
                      onClick={() => setActiveTab('autoclickers')}
                    >
                      Auto Creep Upgrades
                    </button>
                  )}

                  {stage >= 2 && (
                    <button
                      className={`tab-btn ${activeTab === 'rpg' ? 'active' : ''}`}
                      onClick={() => setActiveTab('rpg')}
                    >
                      RPG Bug Combat
                    </button>
                  )}

                  {stage >= 3 && (
                    <button
                      className={`tab-btn ${activeTab === 'stocks' ? 'active' : ''}`}
                      onClick={() => setActiveTab('stocks')}
                    >
                      Broker Stock Exchange
                    </button>
                  )}

                  {stage >= 4 && (
                    <button
                      className={`tab-btn ${activeTab === 'gacha' ? 'active' : ''}`}
                      onClick={() => setActiveTab('gacha')}
                    >
                      Dev Portal Summons
                    </button>
                  )}

                  {stage >= 5 && (
                    <button
                      className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
                      onClick={() => setActiveTab('settings')}
                    >
                      System Glitches
                    </button>
                  )}
                </div>

                {/* Tab Contents */}
                <div style={{ flex: 1 }}>
                  {activeTab === 'clicker' && (
                    <div style={{ opacity: 0.8, fontSize: '0.9rem', lineHeight: '1.6' }}>
                      <h3 style={{ margin: '0 0 1rem 0' }}>📋 CORPORATE REPOSITORY STATUS</h3>
                      <p>
                        Your click inputs directly generate line-of-code counts (Creep).
                        As codebase volume hits critical thresholds, management auto-schedules new features to deploy.
                      </p>
                      <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <li><strong>Feature Tier 0:</strong> Bare Clicker (Monochrome Terminal Theme)</li>
                        <li><strong>Feature Tier 1:</strong> Automated Creep Upgrades (8-Bit Arcade Theme)</li>
                        <li><strong>Feature Tier 2:</strong> RPG combat fighting repository Bugs (8-Bit Arcade Theme)</li>
                        <li><strong>Feature Tier 3:</strong> Stock Market investment exchange (Vaporwave Theme)</li>
                        <li><strong>Feature Tier 4:</strong> Developer Gacha pulls multiplying speeds (Vaporwave Theme)</li>
                        <li><strong>Feature Tier 5:</strong> Settings panel warpers (Modern Glowing Glassmorphic Theme)</li>
                      </ul>
                      <p style={{ marginTop: '1.5rem', fontStyle: 'italic', opacity: 0.7 }}>
                        * Tip: Summon developers in Gacha to heavily multiply click multipliers and combat damage. Purchase gacha tickets on the Stock Market to fund recruitments!
                      </p>
                    </div>
                  )}

                  {activeTab === 'autoclickers' && stage >= 1 && (
                    <AutoClickersTab state={state} buyAutoClicker={buyAutoClicker} />
                  )}

                  {activeTab === 'rpg' && stage >= 2 && (
                    <RpgCombatTab state={state} buyWeapon={buyWeapon} buyArmor={buyArmor} />
                  )}

                  {activeTab === 'stocks' && stage >= 3 && (
                    <StockMarketTab
                      state={state}
                      buyStock={buyStock}
                      sellStock={sellStock}
                      convertCreepToCash={convertCreepToCash}
                      convertCashToCreep={convertCashToCreep}
                    />
                  )}

                  {activeTab === 'gacha' && stage >= 4 && (
                    <GachaTab
                      state={state}
                      summonGacha={summonGacha}
                      buyGachaTicket={buyGachaTicket}
                      fireDeveloper={fireDeveloper}
                    />
                  )}

                  {activeTab === 'settings' && stage >= 5 && (
                    <SettingsGlitchesTab
                      state={state}
                      updateSettings={updateSettings}
                      spawnWanderingBug={spawnWanderingBug}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ThemeWrapper>
  );
}

export default App;
