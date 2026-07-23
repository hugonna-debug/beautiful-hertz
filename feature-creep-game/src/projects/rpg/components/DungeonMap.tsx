import React, { useState } from 'react';
import { Dungeon, DungeonStage } from '../types';

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
  const [selectedDungeonId, setSelectedDungeonId] = useState<string>('localhost');
  const activeDungeon = dungeons.find(d => d.id === selectedDungeonId) || dungeons[0];

  return (
    <div className="terminal-panel" style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
        📁 CODEBASE DIRECTORY EXPLORER
      </h3>

      {/* Directory buttons selector */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginBottom: '1.2rem',
        borderBottom: '1px dashed rgba(255,255,255,0.1)',
        paddingBottom: '0.8rem'
      }}>
        {dungeons.map(d => {
          const isSelected = d.id === selectedDungeonId;
          const isDungeonUnlocked = d.stages[0].unlocked;
          
          return (
            <button
              key={d.id}
              disabled={!isDungeonUnlocked}
              onClick={() => setSelectedDungeonId(d.id)}
              className={isSelected ? 'active' : ''}
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 1rem',
                backgroundColor: isSelected ? 'currentColor' : 'transparent',
                color: isSelected ? '#000' : 'inherit'
              }}
            >
              /{d.id}/
            </button>
          );
        })}
      </div>

      {/* Dungeon Details */}
      <div style={{ marginBottom: '1.2rem' }}>
        <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.1rem' }}>
          Directory: <code>/{activeDungeon.id}/</code> ({activeDungeon.name})
        </h4>
        <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
          {activeDungeon.description}
        </p>
      </div>

      {/* Stages list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {activeDungeon.stages.map((stage: DungeonStage) => {
          const isCurrentActive = activeStageId === stage.id && inCombat;
          const buttonLabel = isCurrentActive ? 'DEBUGGING ACTIVE...' : stage.completed ? 'RE-RUN DEBUG' : 'COMPILE & DEBUG';

          return (
            <div
              key={stage.id}
              style={{
                border: '1px solid currentColor',
                borderRadius: '8px',
                padding: '0.8rem 1.2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                opacity: stage.unlocked ? 1 : 0.4,
                backgroundColor: isCurrentActive ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                transition: 'all 0.25s'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>📄 {stage.name}</span>
                  {stage.completed && (
                    <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold' }}>✓ FIXED</span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.2rem' }}>
                  Recommended Level: Lv {stage.levelRecommended} | Boss: <code>{stage.bossName}</code>
                </div>
              </div>

              <div>
                <button
                  disabled={!stage.unlocked || inCombat}
                  onClick={() => startStage(activeDungeon.id, stage.id)}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.4rem 1rem',
                    minWidth: '150px',
                    borderColor: isCurrentActive ? '#ef4444' : 'currentColor'
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
