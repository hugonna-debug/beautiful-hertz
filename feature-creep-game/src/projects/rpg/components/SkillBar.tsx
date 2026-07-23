import React from 'react';
import { RpgHero } from '../types';

interface SkillBarProps {
  hero: RpgHero;
  inCombat: boolean;
  castSkill: (skillId: string) => void;
}

export const SkillBar: React.FC<SkillBarProps> = ({ hero, inCombat, castSkill }) => {
  const { skills, mana } = hero;

  return (
    <div className="terminal-panel" style={{ width: '100%' }}>
      <h3 style={{ margin: '0 0 0.8rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
        🔥 ACTIVE DEPLOYMENT SCRIPTS (SKILLS)
      </h3>

      {!inCombat ? (
        <div style={{ opacity: 0.5, fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
          Combat offline. Deploy code to spawn bugs and execute scripts.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginTop: '0.5rem'
        }}>
          {skills.map(skill => {
            const hasMana = mana >= skill.manaCost;
            const onCooldown = skill.currentCooldown > 0;
            const canCast = inCombat && hasMana && !onCooldown;

            // Cooldown percentage calculation
            const cooldownPercent = onCooldown ? (skill.currentCooldown / skill.cooldown) * 100 : 0;

            return (
              <div
                key={skill.id}
                style={{
                  border: '1px solid currentColor',
                  borderRadius: '10px',
                  padding: '1rem',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)'
                }}
              >
                {/* Cooldown shading Overlay */}
                {onCooldown && (
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, bottom: 0, right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    pointerEvents: 'none'
                  }}>
                    <strong style={{ fontSize: '1.2rem', color: '#ff00ff' }}>
                      {skill.currentCooldown}s
                    </strong>
                    {/* Linear cooldown bar at bottom */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0, left: 0, right: 0,
                      height: '4px',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }}>
                      <div style={{
                        width: `${cooldownPercent}%`,
                        height: '100%',
                        backgroundColor: '#ff00ff'
                      }} />
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{skill.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold' }}>
                      {skill.manaCost} MP
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.8rem 0', fontSize: '0.75rem', opacity: 0.8, lineHeight: '1.4' }}>
                    {skill.description}
                  </p>
                </div>

                <button
                  disabled={!canCast}
                  onClick={() => castSkill(skill.id)}
                  style={{
                    width: '100%',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.8rem',
                    borderColor: onCooldown ? '#555' : 'currentColor'
                  }}
                >
                  {onCooldown ? `COOLDOWN (${skill.currentCooldown}s)` : !hasMana ? 'INSUFFICIENT MP' : 'RUN SCRIPT'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default SkillBar;
