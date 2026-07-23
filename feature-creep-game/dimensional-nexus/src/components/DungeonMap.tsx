import React, { useState } from 'react';
import { Dungeon, DungeonStage } from '../types/game';

interface DungeonMapProps {
  dungeons: Dungeon[];
  activeStageId: string;
  inCombat: boolean;
  startStage: (dungeonId: string, stageId: string) => void;
}

export const DungeonMap: React.FC<DungeonMapProps> = ({
  dungeons,
  activeStageId,
  inCombat,
  startStage
}) => {
  const [selectedDungeonId, setSelectedDungeonId] = useState<string>('colosseum');
  
  const activeDungeon = dungeons.find(d => d.id === selectedDungeonId) || dungeons[0];

  return (
    <div className="terminal-panel" style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem', letterSpacing: '0.5px' }}>
        🌌 NEXUS DIMENSIONAL PORTALS
      </h3>

      {/* Portals Selector */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1.2rem'
      }}>
        {dungeons.map(d => {
          const isSelected = d.id === selectedDungeonId;
          const firstStageUnlocked = d.stages[0].unlocked;

          return (
            <button
              key={d.id}
              disabled={!firstStageUnlocked}
              onClick={() => setSelectedDungeonId(d.id)}
              className={isSelected ? 'active' : ''}
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                backgroundColor: isSelected ? 'currentColor' : 'transparent',
                color: isSelected ? '#000' : 'inherit'
              }}
            >
              {d.name} {d.completed ? '✓' : ''}
            </button>
          );
        })}
      </div>

      {/* Portal Details */}
      <div style={{ marginBottom: '1.5rem', backgroundColor: 'rgba(0,0,0,0.15)', padding: '0.8rem 1rem', borderRadius: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#a78bfa' }}>
          Portal: {activeDungeon.name}
        </h4>
        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.4' }}>
          {activeDungeon.description}
        </p>
      </div>

      {/* Stages list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {activeDungeon.stages.map((stage: DungeonStage) => {
          const isCurrentActive = activeStageId === stage.id && inCombat;
          const buttonLabel = isCurrentActive ? 'CLASH ACTIVE' : stage.completed ? 'RE-ENTER PORTAL' : 'ENTER PORTAL';

          return (
            <div
              key={stage.id}
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '0.8rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.8rem',
                opacity: stage.unlocked ? 1 : 0.45,
                backgroundColor: isCurrentActive ? 'rgba(255, 113, 206, 0.05)' : 'rgba(255,255,255,0.01)',
                transition: 'all 0.25s'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>⚔️ {stage.name}</span>
                  {stage.completed && (
                    <span style={{ color: '#06ffa1', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid #06ffa1', padding: '1px 4px', borderRadius: '3px' }}>
                      CLEARED
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '2px' }}>
                  Req: Lv {stage.levelRecommended} | Guardian: <code>{stage.bossName}</code>
                </div>
              </div>

              <div>
                <button
                  disabled={!stage.unlocked || inCombat}
                  onClick={() => startStage(activeDungeon.id, stage.id)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.4rem 0.8rem',
                    minWidth: '120px',
                    borderColor: isCurrentActive ? '#ff71ce' : 'rgba(255,255,255,0.15)'
                  }}
                >
                  {buttonLabel}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default DungeonMap;
