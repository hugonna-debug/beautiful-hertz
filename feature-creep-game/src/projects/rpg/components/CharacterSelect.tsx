import React, { useState } from 'react';
import { HeroClass } from '../types';

interface CharacterSelectProps {
  selectHeroClass: (heroClass: HeroClass, name: string) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ selectHeroClass }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<HeroClass>('wizard');

  const classes = [
    {
      id: 'wizard' as HeroClass,
      name: 'Frontend Wizard',
      role: 'UI Spellcaster',
      hp: 90,
      mana: 140,
      attack: 16,
      defense: 3,
      crit: '8%',
      skills: [
        { name: 'CSS Flex Constraint', desc: 'Slows and deals x1.5 attack damage.' },
        { name: 'React Re-render Spam', desc: 'Overloads DOM dealing x3.0 attack damage.' }
      ],
      color: '#3b82f6',
      // Wizard wand SVG
      avatar: (color: string) => (
        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke={color} strokeWidth="5">
          <circle cx="50" cy="30" r="14" fill="rgba(255,255,255,0.05)" />
          <path d="M50 44 L50 78 M50 54 L30 50 M50 54 L65 44" />
          <path d="M65 44 L85 24 M85 24 L80 18 M85 24 L91 29" strokeWidth="7" strokeLinecap="round" />
          {/* Sparkles */}
          <circle cx="85" cy="15" r="2" fill="#fff" />
          <circle cx="95" cy="24" r="3" fill="#fff" />
        </svg>
      )
    },
    {
      id: 'guardian' as HeroClass,
      name: 'Backend Guardian',
      role: 'Core Safety Tank',
      hp: 140,
      mana: 60,
      attack: 11,
      defense: 9,
      crit: '4%',
      skills: [
        { name: 'Try/Catch Safety Block', desc: 'Creates error-handling barrier healing 35 HP.' },
        { name: 'Atomic SQL Transaction', desc: 'Guarantees execution dealing x2.2 defense-pierce damage.' }
      ],
      color: '#10b981',
      // Guardian shield SVG
      avatar: (color: string) => (
        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke={color} strokeWidth="5">
          <circle cx="50" cy="30" r="14" fill="rgba(255,255,255,0.05)" />
          <path d="M50 44 L50 82 M50 54 L32 50 M50 54 L68 50" />
          <path d="M22 68 L50 58 L78 68 L78 85 C78 95 50 102 50 102 C50 102 22 95 22 85 Z" fill="rgba(16, 185, 129, 0.1)" strokeWidth="4" />
        </svg>
      )
    },
    {
      id: 'warlock' as HeroClass,
      name: 'DevOps Warlock',
      role: 'Cloud Daemon Summoner',
      hp: 110,
      mana: 90,
      attack: 13,
      defense: 6,
      crit: '6%',
      skills: [
        { name: 'Docker Health Check', desc: 'Restarts container. Regenerates 48 HP.' },
        { name: 'Kubernetes Cluster Nuke', desc: 'Destroys container pods dealing x2.5 attack damage.' }
      ],
      color: '#a855f7',
      // Warlock container cloud SVG
      avatar: (color: string) => (
        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke={color} strokeWidth="5">
          <circle cx="50" cy="30" r="14" fill="rgba(255,255,255,0.05)" />
          <path d="M50 44 L50 78 M50 54 L32 50 M50 54 L68 50" />
          {/* Cloud */}
          <path d="M30 75 A 12 12 0 0 1 45 65 A 15 15 0 0 1 70 65 A 12 12 0 0 1 85 75 Z" fill="rgba(168, 85, 247, 0.1)" />
        </svg>
      )
    },
    {
      id: 'rogue' as HeroClass,
      name: 'QA Rogue',
      role: 'Critical Hit Assailant',
      hp: 95,
      mana: 80,
      attack: 15,
      defense: 4,
      crit: '22%',
      skills: [
        { name: 'Boundary Value Test', desc: 'Strikes exact boundaries. Deals x1.8 guaranteed CRIT damage.' },
        { name: 'Chaos Monkey Script', desc: 'Spams random inputs. Deals x1.0 to x4.5 damage randomly.' }
      ],
      color: '#f59e0b',
      // Rogue dagger SVG
      avatar: (color: string) => (
        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke={color} strokeWidth="5">
          <circle cx="50" cy="30" r="14" fill="rgba(255,255,255,0.05)" />
          <path d="M50 44 L50 78 M50 54 L30 50 M50 54 L65 54" />
          <path d="M35 50 L20 20 L25 15 L35 35 Z" fill="rgba(245, 158, 11, 0.1)" strokeWidth="4" />
        </svg>
      )
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    selectHeroClass(selectedClass, name.trim() || 'Developer');
  };

  return (
    <div className="terminal-panel" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
      <h2 className="glitch-text" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        ⚙️ BUG_COMBAT_RPG: CHARACTER COMPILER
      </h2>
      <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '2rem' }}>
        Initialize your developer class and bootstrap your local environment before deployment.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Name input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '1rem', fontWeight: 'bold' }}>&gt;_ Enter Developer Name:</label>
          <input
            type="text"
            placeholder="e.g. Linus Torvalds"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={18}
            style={{ width: '100%', fontSize: '1.1rem', padding: '0.6rem 1rem' }}
            required
          />
        </div>

        {/* Classes grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={{ fontSize: '1rem', fontWeight: 'bold' }}>&gt;_ Choose Compiler Settings (Class):</label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {classes.map(cls => (
              <div
                key={cls.id}
                onClick={() => setSelectedClass(cls.id)}
                style={{
                  border: `2px solid ${selectedClass === cls.id ? cls.color : 'currentColor'}`,
                  borderRadius: '12px',
                  padding: '1.2rem',
                  cursor: 'pointer',
                  backgroundColor: selectedClass === cls.id ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  transform: selectedClass === cls.id ? 'scale(1.02)' : 'none',
                  boxShadow: selectedClass === cls.id ? `0 0 15px ${cls.color}` : 'none',
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: selectedClass === cls.id ? cls.color : 'inherit' }}>{cls.name}</h3>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{cls.role}</span>
                    </div>
                    {cls.avatar(selectedClass === cls.id ? cls.color : 'currentColor')}
                  </div>

                  {/* Stats list */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    fontSize: '0.8rem',
                    gap: '0.4rem',
                    marginBottom: '1rem',
                    borderTop: '1px dashed rgba(255,255,255,0.1)',
                    paddingTop: '0.6rem'
                  }}>
                    <div>❤️ HP: <strong>{cls.hp}</strong></div>
                    <div>🔮 Mana: <strong>{cls.mana}</strong></div>
                    <div>⚔️ Attack: <strong>{cls.attack}</strong></div>
                    <div>🛡️ Defense: <strong>{cls.defense}</strong></div>
                    <div>✨ Crit Rate: <strong>{cls.crit}</strong></div>
                  </div>
                </div>

                {/* Skills description */}
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.6rem', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '0.3rem', opacity: 0.8 }}>Starting Active Skills:</div>
                  {cls.skills.map((s, idx) => (
                    <div key={idx} style={{ marginBottom: '0.3rem' }}>
                      🔥 <strong>{s.name}</strong>: {s.desc}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action bootstrap button */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="submit"
            style={{ fontSize: '1.2rem', padding: '0.8rem 3rem', textTransform: 'uppercase' }}
          >
            Bootstrap Runtime Env
          </button>
        </div>
      </form>
    </div>
  );
};
export default CharacterSelect;
