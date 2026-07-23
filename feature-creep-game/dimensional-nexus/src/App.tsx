import { useState } from 'react';
import { useGameState } from './hooks/useGameState';
import ThemeWrapper from './components/ThemeWrapper';
import CharacterSelect from './components/CharacterSelect';
import RpgHeader from './components/RpgHeader';
import DungeonMap from './components/DungeonMap';
import BattleArena from './components/BattleArena';
import SkillTree from './components/SkillTree';
import InventoryShop from './components/InventoryShop';

function App() {
  const {
    state,
    playerTurn,
    selectHeroClass,
    toggleCombatMode,
    startStage,
    executeTurnAction,
    handleRealTimeClick,
    fleeCombat,
    castSkill,
    spendCombatPoints,
    buyShopItem,
    equipItem,
    useConsumable,
    hirePartyMember,
    resetGame
  } = useGameState();

  const [activeTab, setActiveTab] = useState<'combat' | 'skills' | 'inventory' | 'party'>('combat');

  const { selectedClass, hero, activeEnemy, combatMode, combatLogs, dungeons, partyPool, inCombat, activeStageId } = state;

  // Character selection phase
  if (!selectedClass || !hero) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080313' }}>
        <CharacterSelect selectHeroClass={selectHeroClass} />
      </div>
    );
  }

  return (
    <ThemeWrapper state={state}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        
        {/* Rpg Head Bar */}
        <RpgHeader hero={hero} difficultyTier={state.difficultyTier} resetGame={resetGame} />

        {/* Tab Navigation header */}
        <div className="terminal-panel" style={{ padding: '0.6rem 1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
            <button
              className={`tab-btn ${activeTab === 'combat' ? 'active' : ''}`}
              onClick={() => setActiveTab('combat')}
            >
              ⚔️ COMBAT PORTALS & ARENA
            </button>
            <button
              className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              🌲 NEXUS SKILL TREES
            </button>
            <button
              className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              🎒 INVENTORY & MERCHANTS
            </button>
            <button
              className={`tab-btn ${activeTab === 'party' ? 'active' : ''}`}
              onClick={() => setActiveTab('party')}
            >
              👥 RECRUIT COMPANIONS
            </button>
          </div>
        </div>

        {/* Active Tab Screen */}
        <div style={{ minHeight: '450px' }}>
          {activeTab === 'combat' && (
            <div className="game-grid">
              
              {/* Left Column: Dungeon Portals Explorer */}
              <DungeonMap
                dungeons={dungeons}
                activeStageId={activeStageId}
                inCombat={inCombat}
                startStage={startStage}
              />

              {/* Right Column: Active Combat board */}
              <BattleArena
                hero={hero}
                activeEnemy={activeEnemy}
                combatMode={combatMode}
                combatLogs={combatLogs}
                playerTurn={playerTurn}
                inCombat={inCombat}
                executeTurnAction={executeTurnAction}
                handleRealTimeClick={handleRealTimeClick}
                fleeCombat={fleeCombat}
                castSkill={castSkill}
                toggleCombatMode={toggleCombatMode}
              />

            </div>
          )}

          {activeTab === 'skills' && (
            <SkillTree
              hero={hero}
              spendCombatPoints={spendCombatPoints}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryShop
              hero={hero}
              buyShopItem={buyShopItem}
              equipItem={equipItem}
              useConsumable={useConsumable}
            />
          )}

          {activeTab === 'party' && (
            <div className="terminal-panel">
              <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
                👥 RECRUIT PORTAL COMPANIONS (AUTO DPS ATTACKERS)
              </h3>
              <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                Hire warriors and mechs using Nexus Credits (Gold) to join your roster. Companions deal continuous auto-attack damage to enemies during active Real-Time and Auto combat stages.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.2rem'
              }}>
                {partyPool.map(member => {
                  const isHired = hero.party.some(p => p.id === member.id);
                  const cost = member.rarity === 'legendary' ? 500 : member.rarity === 'rare' ? 200 : 80;
                  const canAfford = hero.gold >= cost;

                  const colors = { common: 'var(--neon-cyan)', rare: 'var(--cosmic-purple)', legendary: 'var(--gold-myth)' };
                  const borderClr = colors[member.rarity] || '#fff';

                  return (
                    <div
                      key={member.id}
                      className="card"
                      style={{
                        border: `2px solid ${borderClr}`,
                        borderRadius: '12px',
                        padding: '1.2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        backgroundColor: isHired ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                        opacity: isHired ? 0.7 : 1
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem' }}>{member.name}</h4>
                          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: borderClr }}>
                            {member.rarity}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.6rem' }}>Role: {member.role}</div>
                        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', border: '1px dashed rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                          {member.buffDescription}
                        </p>
                      </div>

                      <button
                        disabled={isHired || !canAfford}
                        onClick={() => hirePartyMember(member.id)}
                        style={{
                          width: '100%',
                          padding: '0.4rem 1rem',
                          fontSize: '0.8rem',
                          borderColor: isHired ? '#555' : borderClr,
                          color: isHired ? '#777' : '#fff',
                          background: isHired ? 'transparent' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        {isHired ? 'JOINED PARTY' : `RECRUIT (${cost}g)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </ThemeWrapper>
  );
}

export default App;
