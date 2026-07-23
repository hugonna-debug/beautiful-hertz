import React, { useState } from 'react';
import useRpgState from './useRpgState';
import CharacterSelect from './components/CharacterSelect';
import RpgHeader from './components/RpgHeader';
import BattleArena from './components/BattleArena';
import DungeonMap from './components/DungeonMap';
import SkillBar from './components/SkillBar';
import RpgInventory from './components/RpgInventory';

interface RpgAppProps {
  onExit: () => void;
}

export const RpgApp: React.FC<RpgAppProps> = ({ onExit }) => {
  const {
    state,
    selectHeroClass,
    startStage,
    fleeCombat,
    castSkill,
    buyShopItem,
    equipItem,
    useConsumable,
    hirePartyMember,
    resetRpg
  } = useRpgState();

  const [activeSubTab, setActiveSubTab] = useState<'combat' | 'inventory' | 'party'>('combat');

  const { selectedClass, hero, activeEnemy, combatLogs, dungeons, partyPool, inCombat, activeDungeonId, activeStageId } = state;

  // Character selection phase
  if (!selectedClass || !hero) {
    return <CharacterSelect selectHeroClass={selectHeroClass} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', minHeight: '100vh', padding: '1rem', boxSizing: 'border-box' }}>
      
      {/* RPG HUD Top bar */}
      <RpgHeader hero={hero} resetRpg={resetRpg} onExit={onExit} />

      {/* Main navigation tabs */}
      <div className="terminal-panel" style={{ padding: '0.6rem 1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
          <button
            className={`tab-btn ${activeSubTab === 'combat' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('combat')}
            style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}
          >
            🖥️ CODE COMPILER & DEBUGGING
          </button>
          
          <button
            className={`tab-btn ${activeSubTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('inventory')}
            style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}
          >
            🛒 HARDWARE ARMORY SHOP
          </button>
          
          <button
            className={`tab-btn ${activeSubTab === 'party' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('party')}
            style={{ padding: '0.4rem 1.2rem', fontSize: '0.9rem' }}
          >
            👥 SUMMON TASKFORCE
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div style={{ flex: 1 }}>
        {/* Combat tab */}
        {activeSubTab === 'combat' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1.5rem'
          }}>
            {/* Split layout: Dungeons Explorer on left, Active Battle details on right */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.5rem',
              alignItems: 'start'
            }} className="game-grid-rpg">
              
              {/* Dungeon Explorer */}
              <DungeonMap
                dungeons={dungeons}
                activeStageId={activeStageId}
                inCombat={inCombat}
                startStage={startStage}
              />

              {/* Battle Arena */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <BattleArena
                  hero={hero}
                  activeEnemy={activeEnemy}
                  combatLogs={combatLogs}
                  fleeCombat={fleeCombat}
                />
                
                {/* Active Skill cast buttons */}
                <SkillBar
                  hero={hero}
                  inCombat={inCombat}
                  castSkill={castSkill}
                />
              </div>

            </div>
          </div>
        )}

        {/* Inventory tab */}
        {activeSubTab === 'inventory' && (
          <RpgInventory
            hero={hero}
            buyShopItem={buyShopItem}
            equipItem={equipItem}
            useConsumable={useConsumable}
          />
        )}

        {/* Summon Taskforce Party tab */}
        {activeSubTab === 'party' && (
          <div className="terminal-panel">
            <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
              👥 RECRUIT DEBUGGING TASKFORCE (HIRE TEAM MEMBERS)
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.5rem' }}>
              Spend your budget to hire developers and architects into your party. Hired devs provide continuous auto-attack damage in all compiled stages.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.2rem'
            }}>
              {partyPool.map(member => {
                const isHired = hero.party.some(p => p.id === member.id);
                
                // Pricing rates based on rarity
                const cost = member.rarity === 'legendary' ? 500 : member.rarity === 'rare' ? 200 : 80;
                const canAfford = hero.gold >= cost;

                const colors = { common: '#3b82f6', rare: '#a855f7', legendary: '#ef4444' };
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
                      opacity: isHired ? 0.75 : 1
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{member.name}</h4>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: borderClr }}>
                          {member.rarity}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.6rem' }}>{member.role}</div>
                      <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', border: '1px dashed currentColor', padding: '6px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        {member.buffDescription}
                      </p>
                    </div>

                    <button
                      disabled={isHired || !canAfford}
                      onClick={() => hirePartyMember(member.id)}
                      style={{
                        width: '100%',
                        padding: '0.4rem 1rem',
                        fontSize: '0.85rem',
                        borderColor: isHired ? '#555' : borderClr,
                        color: isHired ? '#777' : '#fff',
                        backgroundColor: isHired ? 'transparent' : 'rgba(255,255,255,0.02)'
                      }}
                    >
                      {isHired ? 'CURRENTLY HIRED' : `HIRE DEV (${cost}g)`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CSS adjustments selector style inject for RPG-specific responsive layout */}
      <style>{`
        @media(min-width: 1024px) {
          .game-grid-rpg {
            grid-template-columns: 320px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
export default RpgApp;
