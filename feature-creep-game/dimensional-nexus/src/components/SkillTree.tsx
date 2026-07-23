import React from 'react';
import { RpgHero } from '../types/game';

interface SkillTreeProps {
  hero: RpgHero;
  spendCombatPoints: (branch: 'tactical' | 'speed' | 'utility', cost: number, actionType: 'skill_unlock' | 'stat_atk' | 'stat_hp') => void;
}

export const SkillTree: React.FC<SkillTreeProps> = ({ hero, spendCombatPoints }) => {
  const { combatPoints, skills } = hero;

  const branches: { id: 'tactical' | 'speed' | 'utility'; name: string; icon: string; clr: string; desc: string }[] = [
    { id: 'tactical', name: 'Tactical Branch', icon: '🛡️', clr: 'var(--gold-myth)', desc: 'Accumulated by fighting in Turn-Based mode. Focuses on shields and precise command blocks.' },
    { id: 'speed', name: 'Speed Branch', icon: '⚡', clr: 'var(--neon-pink)', desc: 'Accumulated by fighting in Real-Time mode. Focuses on attack speed, click damage, and critical rates.' },
    { id: 'utility', name: 'Utility Branch', icon: '⚙️', clr: 'var(--neon-cyan)', desc: 'Accumulated by fighting in Auto-Idle mode. Focuses on party automation, drone recovery, and continuous aura streams.' }
  ];

  return (
    <div className="terminal-panel" style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
        🌲 BRANCHING NEXUS SKILL TREE
      </h3>
      <p style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '1.5rem' }}>
        Earn Combat Points matching your playstyle (Turn-Based, Real-Time, Auto-Idle) when defeating dungeon enemies. Spend points to unlock Tier 3 skills or boost core combat attributes.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {branches.map(br => {
          const points = combatPoints[br.id];
          const hasLockedSkill = skills.some(s => s.branch === br.id && !s.unlocked);
          const branchSkill = skills.find(s => s.branch === br.id);

          return (
            <div
              key={br.id}
              style={{
                border: `2px solid rgba(255,255,255,0.06)`,
                borderRadius: '16px',
                padding: '1.2rem',
                backgroundColor: 'rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: br.clr }}>
                    {br.icon} {br.name}
                  </h4>
                  <strong style={{ fontSize: '1.1rem', fontFamily: 'monospace', color: br.clr }}>
                    {points} CP
                  </strong>
                </div>
                <p style={{ fontSize: '0.8rem', opacity: 0.8, margin: '8px 0 12px 0', lineHeight: '1.4' }}>
                  {br.desc}
                </p>

                {branchSkill && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.08)',
                    fontSize: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Spell: {branchSkill.name}</span>
                      <span style={{ color: branchSkill.unlocked ? '#06ffa1' : '#f87171' }}>
                        {branchSkill.unlocked ? 'UNLOCKED' : 'LOCKED (T3)'}
                      </span>
                    </div>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.8 }}>
                      {branchSkill.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  disabled={points < 1 || !hasLockedSkill}
                  onClick={() => spendCombatPoints(br.id, 1, 'skill_unlock')}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '0.75rem',
                    background: 'transparent',
                    borderColor: br.clr,
                    color: br.clr
                  }}
                >
                  Unlock Tier 3 Skill (Cost: 1 CP)
                </button>
                <button
                  disabled={points < 2}
                  onClick={() => spendCombatPoints(br.id, 2, 'stat_atk')}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '0.75rem',
                    background: 'transparent',
                    borderColor: 'rgba(255,255,255,0.15)'
                  }}
                >
                  Upgrade Weaponry (+5 ATK, +3% Crit) (Cost: 2 CP)
                </button>
                <button
                  disabled={points < 2}
                  onClick={() => spendCombatPoints(br.id, 2, 'stat_hp')}
                  style={{
                    width: '100%',
                    padding: '6px',
                    fontSize: '0.75rem',
                    background: 'transparent',
                    borderColor: 'rgba(255,255,255,0.15)'
                  }}
                >
                  Upgrade Vitality (+30 HP, +15 MP) (Cost: 2 CP)
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SkillTree;
