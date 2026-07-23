import React from 'react';
import { GameState, TalentNode } from '../types/game';
import { StarIcon, RecycleIcon, SwordIcon, ShieldIcon, BloodIcon } from './Icons';

interface TalentsManagerProps {
  state: GameState;
  spendTalentPoint: (id: string) => void;
  refundAllTalents: (id?: string) => void;
  spendOverflowTalent: (key: 'damage' | 'drops' | 'currency' | 'crystals') => void;
  isMobile?: boolean;
}

export const TalentsManager: React.FC<TalentsManagerProps> = ({
  state,
  spendTalentPoint,
  refundAllTalents,
  spendOverflowTalent,
  isMobile = false
}) => {
  const { talentNodes, level } = state;

  // Calculate spent points
  const totalSpent = talentNodes.reduce((acc, t) => acc + t.currentLevel, 0);
  const totalAvailable = (level - 1) * 2; // 2 talent points per level
  const currentOverflow = state.overflowTalents || { damage: 0, drops: 0, currency: 0, crystals: 0 };
  const overflowSpent = currentOverflow.damage + currentOverflow.drops + currentOverflow.currency + currentOverflow.crystals;
  const remainingPoints = totalAvailable - (totalSpent + overflowSpent);

  // Group nodes by tree
  const oblNodes = talentNodes.filter(t => t.tree === 'obliteration');
  const basNodes = talentNodes.filter(t => t.tree === 'bastion');
  const sipNodes = talentNodes.filter(t => t.tree === 'siphon');

  const renderTreeNode = (node: TalentNode) => {
    const isMax = node.currentLevel >= node.maxLevel;
    const formatValue = (node: TalentNode) => {
      const isPercent = node.statType !== 'regen_hp';
      const val = node.currentLevel * node.valuePerLevel;
      if (isPercent) {
        return `+${(val * 100).toFixed(1)}%`;
      }
      return `+${val}`;
    };

    return (
      <div
        key={node.id}
        style={{
          border: '2px solid #000',
          background: '#fff',
          padding: '0.6rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '0.4rem',
          position: 'relative'
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.85rem' }}>{node.name}</strong>
            <span style={{ fontSize: '0.7rem', background: '#000', color: '#fff', padding: '1px 4px', fontWeight: 'bold' }}>
              {node.currentLevel} / {node.maxLevel}
            </span>
          </div>
          <p style={{ margin: '0.2rem 0', fontSize: '0.65rem', color: '#666', lineHeight: '1.2' }}>
            {node.description}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', borderTop: '1px solid #eee', paddingTop: '0.4rem' }}>
          <div>
            <span style={{ fontSize: '0.6rem', color: '#666', display: 'block' }}>CURRENT EFFECT</span>
            <strong style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#047857' }}>{formatValue(node)}</strong>
          </div>
          <button
            onClick={() => spendTalentPoint(node.id)}
            disabled={remainingPoints <= 0 || isMax}
            className="game-btn"
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.7rem',
              background: 'var(--neon-cyan)',
              color: '#000',
              fontWeight: 'bold',
              border: '2px solid #000',
              cursor: 'pointer',
              opacity: (remainingPoints <= 0 || isMax) ? 0.5 : 1
            }}
          >
            {isMax ? 'MAXED' : 'ADD +1'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="terminal-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #000', paddingBottom: '0.6rem' }}>
        <div>
          <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <StarIcon size={20} color="var(--neon-purple)" /> Core Talents
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#666' }}>Spend points to customize and optimize stats.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--neon-yellow)', border: '2px solid #000', padding: '0.2rem 0.6rem', fontWeight: 'bold', fontSize: '0.85rem' }}>
            Available Points: {remainingPoints}
          </div>
          <button
            onClick={() => refundAllTalents()}
            className="game-btn"
            style={{
              padding: '0.3rem 0.6rem',
              fontSize: '0.75rem',
              background: '#fca5a5',
              fontWeight: 'bold',
              border: '2px solid #000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RecycleIcon size={12} color="#000" /> FREE RESPEC
          </button>
        </div>
      </div>

      {/* THREE TREE COLUMNS */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '1rem', flex: 1, overflowY: 'auto', maxHeight: isMobile ? 'none' : '430px' }}>
        
        {/* COLUMN 1: OBLITERATION (OFFENSE) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ background: '#fef2f2', border: '2px solid #000', padding: '0.4rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#991b1b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <SwordIcon size={13} color="#991b1b" /> Obliteration
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {oblNodes.map(renderTreeNode)}
          </div>
        </div>

        {/* COLUMN 2: BASTION (DEFENSE) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ background: '#f0fdf4', border: '2px solid #000', padding: '0.4rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#166534', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <ShieldIcon size={13} color="#166534" /> Bastion
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {basNodes.map(renderTreeNode)}
          </div>
        </div>

        {/* COLUMN 3: SIPHON (UTILITY / ELEMENTAL) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ background: '#f5f3ff', border: '2px solid #000', padding: '0.4rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#5b21b6', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <BloodIcon size={13} color="#5b21b6" /> Siphon & Speed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {sipNodes.map(renderTreeNode)}
          </div>
        </div>

      </div>

      {/* OVERFLOW ENDGAME TALENTS */}
      {(() => {
        const coreTalentsMaxed = talentNodes.every(t => t.currentLevel === t.maxLevel);
        if (!coreTalentsMaxed) {
          return (
            <div style={{ border: '2px dashed #999', padding: '0.8rem', textAlign: 'center', background: '#f5f5f5', color: '#666', fontSize: '0.8rem', fontWeight: 'bold' }}>
              🔒 Ascended Overflow Talents: Max out all core talents to unlock endgame scaling multipliers.
            </div>
          );
        }

        return (
          <div style={{ border: '3px solid #000', padding: '0.8rem', background: '#fdf4ff', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '0.4rem' }}>
              <strong style={{ fontSize: '0.9rem', color: '#86198f', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <StarIcon size={14} color="#86198f" /> Ascended Overflow Talents (Endgame Multipliers)
              </strong>
              <span style={{ fontSize: '0.75rem', background: '#86198f', color: '#fff', padding: '2px 6px', fontWeight: 'bold' }}>
                UNLOCKED
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '0.6rem' }}>
              {[
                { key: 'damage', label: '💥 Overall Damage', multiplier: 1 + currentOverflow.damage * 0.02, desc: '+2% final damage scaling multiplier per level.' },
                { key: 'drops', label: '🎒 Overall Drops', multiplier: 1 + currentOverflow.drops * 0.02, desc: '+2% drop rate and luck multiplier per level.' },
                { key: 'currency', label: '💰 Overall Currency', multiplier: 1 + currentOverflow.currency * 0.02, desc: '+2% gold and shards multiplier per level.' },
                { key: 'crystals', label: '💎 Crystal Booster', multiplier: 1 + currentOverflow.crystals * 0.02, desc: '+2% ascension crystals earned per level.' }
              ].map(overflow => (
                <div key={overflow.key} style={{ border: '2px solid #000', background: '#fff', padding: '0.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.4rem' }}>
                  <div>
                    <strong style={{ fontSize: '0.8rem', display: 'block' }}>{overflow.label}</strong>
                    <span style={{ fontSize: '0.65rem', color: '#666', display: 'block', lineHeight: '1.2', margin: '2px 0' }}>
                      {overflow.desc}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem', borderTop: '1px solid #eee', paddingTop: '0.4rem' }}>
                    <div>
                      <span style={{ fontSize: '0.55rem', color: '#666', display: 'block' }}>MULT / LVL</span>
                      <strong style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#86198f' }}>
                        x{overflow.multiplier.toFixed(2)} ({currentOverflow[overflow.key as keyof typeof currentOverflow]} Lvl)
                      </strong>
                    </div>
                    <button
                      onClick={() => spendOverflowTalent(overflow.key as any)}
                      disabled={remainingPoints <= 0}
                      className="game-btn"
                      style={{
                        padding: '2px 6px',
                        fontSize: '0.65rem',
                        background: '#e9d5ff',
                        fontWeight: 'bold',
                        border: '2px solid #000',
                        cursor: 'pointer',
                        opacity: remainingPoints <= 0 ? 0.5 : 1
                      }}
                    >
                      ADD +1
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

    </div>
  );
};
export default TalentsManager;
