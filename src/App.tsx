import React, { useState, useEffect } from 'react';
import useGameState from './hooks/useGameState';
import ThemeWrapper from './components/ThemeWrapper';
import { audioSynth } from './utils/audio';
import StatsPanel from './components/StatsPanel';
import BattleConsole from './components/BattleConsole';
import GearManager from './components/GearManager';
import TalentsManager from './components/TalentsManager';
import SettingsPanel from './components/SettingsPanel';
import { PrestigePanel } from './components/PrestigePanel';
import { CharacterCreator } from './components/CharacterCreator';
import { AuthManager } from './components/AuthManager';
import { SessionConflictModal } from './components/SessionConflictModal';
import { AssetDownloaderModal } from './components/AssetDownloaderModal';
import { LauncherDownloadModal } from './components/LauncherDownloadModal';
import { AnchorStudio } from './DEV_MODE_ONLY/AnchorStudio';
import { ShopIcon, CrystalIcon, SwordIcon, RecycleIcon, StarIcon, GearIcon, GameLogoIcon } from './components/Icons';

export const App: React.FC = () => {
  const {
    state,
    updateLpcCharacter,
    resetGame,
    selectStage,
    toggleAutoAdvance,
    equipLoot,
    scrapLoot,
    enhanceGear,
    upgradeSubstat,
    toggleSubstatLock,
    reforgeSubstats,
    spendTalentPoint,
    spendOverflowTalent,
    buyTempBagSlot,
    refundAllTalents,
    ascendHero,
    debugUpdateHero,
    resolveHeroStats,
    updateSettings,
    buyPrestigeUpgrade,
    updateAutoScrapSettings,
    scrapAllLoot,
    toggleGearLock,
    equipCustomHead,
    selectCharacterClass,
    loginCloudUser,
    logoutCloudUser,
    repairCloudAccount,
    sessionConflict,
    claimActiveSession,
    cancelSessionPrompt
  } = useGameState();

  const [activeTab, setActiveTab] = useState<'combat' | 'forge' | 'talents' | 'character' | 'settings' | 'prestige' | 'stats' | 'anchorStudio'>('combat');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLauncherModal, setShowLauncherModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle dark mode class on document body
  useEffect(() => {
    if (state.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [state.darkMode]);

  // Start retro music sequencer on first user click/interaction
  useEffect(() => {
    const handleInteraction = () => {
      audioSynth.setVolume(state.musicVolume, state.sfxVolume);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [state.musicVolume, state.sfxVolume]);

  return (
    <ThemeWrapper state={state}>
      <div className="main-wrapper">
        {/* SWISS HEADER HUD */}
        <header className="game-header">
          <div>
            <h1 className="game-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <GameLogoIcon size={36} />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.05rem', letterSpacing: '0.05rem' }}>
                M
                <svg className="title-arrow-down" width="14" height="28" viewBox="0 0 14 28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--neon-cyan)', marginLeft: '2px', marginRight: '2px' }}>
                  <line x1="7" y1="3" x2="7" y2="25" />
                  <line x1="7" y1="25" x2="2" y2="19" />
                  <line x1="7" y1="25" x2="12" y2="19" />
                </svg>
                N-M
                <svg className="title-arrow-up" width="20" height="28" viewBox="0 0 20 28" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" style={{ display: 'inline-block', verticalAlign: 'middle', color: 'var(--neon-pink)', marginLeft: '2px', marginRight: '2px' }}>
                  <line x1="10" y1="3" x2="3" y2="25" />
                  <line x1="10" y1="3" x2="17" y2="25" />
                  <line x1="6.5" y1="14" x2="13.5" y2="14" />
                  <line x1="10" y1="3" x2="5" y2="10" />
                  <line x1="10" y1="3" x2="15" y2="10" />
                </svg>
                XXED
              </span>
            </h1>
            <span style={{ 
              fontSize: '0.78rem', 
              fontWeight: '900', 
              textTransform: 'uppercase', 
              letterSpacing: '1.5px',
              color: state.darkMode ? '#fb923c' : '#4f46e5',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              marginTop: '4px',
              textShadow: state.darkMode ? '1px 1px 0px #1a1a1f' : '1px 1px 0px #ffffff'
            }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" style={{ display: 'inline-block' }}>
                <line x1="2" y1="6" x2="10" y2="6" />
              </svg>
              <span>The Min-Maxer's Optimization Playground</span>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" style={{ display: 'inline-block' }}>
                <line x1="6" y1="2" x2="6" y2="10" />
                <line x1="2" y1="6" x2="10" y2="6" />
              </svg>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setShowLauncherModal(true)}
              className="game-btn"
              title="Download Standalone Launcher App"
              style={{
                padding: '6px 12px',
                fontSize: '0.72rem',
                fontWeight: '900',
                border: '2px solid #000',
                background: 'var(--neon-cyan)',
                color: '#000000',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                cursor: 'pointer'
              }}
            >
              💻 Download Launcher
            </button>

            <AuthManager
              state={state}
              onLoginSuccess={loginCloudUser}
              onLogout={logoutCloudUser}
            />
            <button
              onClick={() => setActiveTab('settings')}
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
            >
              <GearIcon size={14} /> Settings
            </button>
          </div>
        </header>

        {/* TAB CONTROLS */}
        <div className="tabs-row">
          {isMobile && (
            <button
              onClick={() => setActiveTab('stats')}
              className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
            >
              📊 Stats
            </button>
          )}
          <button
            onClick={() => setActiveTab('combat')}
            className={`tab-btn ${activeTab === 'combat' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
          >
            <SwordIcon size={14} /> Combat Arena
          </button>
          <button
            onClick={() => setActiveTab('forge')}
            className={`tab-btn ${activeTab === 'forge' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
          >
            <RecycleIcon size={14} /> Forge & Refit
          </button>
          <button
            onClick={() => setActiveTab('talents')}
            className={`tab-btn ${activeTab === 'talents' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
          >
            <StarIcon size={14} /> Core Talents
          </button>
          <button
            onClick={() => setActiveTab('anchorStudio')}
            className={`tab-btn ${activeTab === 'anchorStudio' ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', borderColor: '#06b6d4', color: activeTab === 'anchorStudio' ? '#090d16' : '#06b6d4', backgroundColor: activeTab === 'anchorStudio' ? '#06b6d4' : undefined }}
          >
            ⚓ Anchor Studio
          </button>
          {state.hasPrestiged && (
            <button
              onClick={() => setActiveTab('prestige')}
              className={`tab-btn ${activeTab === 'prestige' ? 'active' : ''}`}
              style={{
                borderColor: 'var(--neon-purple)',
                color: activeTab === 'prestige' ? '#000000' : 'var(--neon-purple)',
                background: activeTab === 'prestige' ? 'var(--neon-yellow)' : undefined
              }}
            >
              <ShopIcon size={14} style={{ marginRight: '6px' }} /> Prestige Shop
            </button>
          )}
        </div>

        {/* MAIN PANEL LAYOUT */}
        <div style={
          activeTab === 'anchorStudio' 
            ? { display: 'block', width: '100%' }
            : isMobile 
              ? { display: 'flex', flexDirection: 'column', gap: '1rem' } 
              : { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }
        }>
          
          {/* Diagnostic Stats panel (Always present on desktop except in Anchor Studio, stats tab on mobile) */}
          {!isMobile && activeTab !== 'anchorStudio' && (
            <StatsPanel state={state} resolveHeroStats={resolveHeroStats} />
          )}

          {isMobile && activeTab === 'stats' && (
            <StatsPanel state={state} resolveHeroStats={resolveHeroStats} />
          )}

          {/* Active Tab Panel */}
          {activeTab === 'combat' && (
            <BattleConsole
              state={state}
              selectStage={selectStage}
              toggleAutoAdvance={toggleAutoAdvance}
              ascendHero={ascendHero}
              resolveHeroStats={resolveHeroStats}
              onUpdateCharacter={updateLpcCharacter}
              isMobile={isMobile}
            />
          )}

          {activeTab === 'forge' && (
            <GearManager
              state={state}
              equipLoot={equipLoot}
              scrapLoot={scrapLoot}
              enhanceGear={enhanceGear}
              upgradeSubstat={upgradeSubstat}
              toggleSubstatLock={toggleSubstatLock}
              reforgeSubstats={reforgeSubstats}
              scrapAllLoot={scrapAllLoot}
              toggleGearLock={toggleGearLock}
              buyTempBagSlot={buyTempBagSlot}
              isMobile={isMobile}
            />
          )}

          {activeTab === 'talents' && (
            <TalentsManager
              state={state}
              spendTalentPoint={spendTalentPoint}
              spendOverflowTalent={spendOverflowTalent}
              refundAllTalents={refundAllTalents}
              isMobile={isMobile}
            />
          )}

          {activeTab === 'character' && (
            <CharacterCreator
              state={state}
              onUpdateCharacter={updateLpcCharacter}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPanel
              state={state}
              updateSettings={updateSettings}
              resetGame={resetGame}
              repairCloudAccount={repairCloudAccount}
            />
          )}

          {activeTab === 'prestige' && (
            <PrestigePanel
              state={state}
              buyPrestigeUpgrade={buyPrestigeUpgrade}
              updateAutoScrapSettings={updateAutoScrapSettings}
              isMobile={isMobile}
            />
          )}

          {activeTab === 'anchorStudio' && (
            <div style={{ gridColumn: isMobile ? undefined : '1 / -1' }}>
              <AnchorStudio state={state} onClose={() => setActiveTab('combat')} />
            </div>
          )}

        </div>

        {/* DEBUG CHEAT TOOLS FOR TESTING (Only visible if logged in via DEV bypass login) */}
        {state.cloudUser?.token?.includes('mock') && (
          <div className="terminal-panel" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', background: '#fafafa', borderStyle: 'dashed' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666' }}>🔧 OPTIMIZER CHEAT PANEL:</span>
            <button
              onClick={() => debugUpdateHero({ gold: state.gold + 500 })}
              className="game-btn"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: '#fff' }}
            >
              💰 +500 Gold
            </button>
            <button
              onClick={() => debugUpdateHero({ reforgeShards: state.reforgeShards + 50 })}
              className="game-btn"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: '#fff' }}
            >
              💎 +50 Shards
            </button>
            <button
              onClick={() => debugUpdateHero({ level: state.level + 5 })}
              className="game-btn"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: '#fff' }}
            >
              📈 +5 Levels
            </button>
            <button
              onClick={() => debugUpdateHero({ ascensionCrystals: state.ascensionCrystals + 10, totalCrystalsEarned: state.totalCrystalsEarned + 10, hasPrestiged: true })}
              className="game-btn"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <CrystalIcon size={12} color="#6d28d9" /> +10 Crystals
            </button>
          </div>
        )}

        {/* FIRST-LOAD ASSET DOWNLOADER MODAL */}
        <AssetDownloaderModal darkMode={state.darkMode} />

        {/* STANDALONE LAUNCHER DOWNLOAD MODAL */}
        <LauncherDownloadModal
          isOpen={showLauncherModal}
          onClose={() => setShowLauncherModal(false)}
          darkMode={state.darkMode}
        />

        {/* SINGLE-ACTIVE SESSION CONFLICT & PROMPT MODAL */}
        {sessionConflict && (
          <SessionConflictModal
            mode={sessionConflict.mode}
            accountEmail={state.cloudUser?.email}
            otherDeviceName={sessionConflict.otherDeviceName}
            darkMode={state.darkMode}
            onClaimSession={() => claimActiveSession()}
            onCancelPrompt={() => logoutCloudUser()}
          />
        )}

      </div>
    </ThemeWrapper>
  );
};
export default App;
