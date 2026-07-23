import React, { useState } from 'react';
import { HeroClass } from '../types/game';

interface CharacterSelectProps {
  selectHeroClass: (heroClass: HeroClass, name: string) => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ selectHeroClass }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<HeroClass | null>(null);

  const classes: { id: HeroClass; name: string; genre: string; desc: string; stats: string; svg: React.ReactNode }[] = [
    {
      id: 'paladin',
      name: 'Holy Paladin',
      genre: 'Medieval Fantasy',
      desc: 'A heavy steel tank focusing on defensive shielding, regeneration, and radiant blade smites.',
      stats: 'HP: 130 | Mana: 70 | Attack: 11 | Defense: 8 | Crit: 5%',
      svg: (
        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke="#fbbf24" strokeWidth="4">
          <path d="M50 15 L80 30 L80 65 C80 80 50 90 50 90 C50 90 20 80 20 65 L20 30 Z" fill="rgba(251,191,36,0.05)" />
          <path d="M50 30 L50 75 M35 45 L65 45" strokeWidth="5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'mech',
      name: 'Cybernetic Mech',
      genre: 'Sci-Fi Future',
      desc: 'Deploy automated repair nanites and heavy plasma blast guns. High base damage.',
      stats: 'HP: 110 | Mana: 90 | Attack: 13 | Defense: 5 | Crit: 8%',
      svg: (
        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke="#06ffa1" strokeWidth="4">
          <rect x="25" y="25" width="50" height="50" rx="8" fill="rgba(6,255,161,0.05)" />
          <circle cx="50" cy="50" r="12" strokeWidth="5" />
          <line x1="15" y1="50" x2="25" y2="50" strokeWidth="4" />
          <line x1="75" y1="50" x2="85" y2="50" strokeWidth="4" />
          <line x1="50" y1="15" x2="50" y2="25" strokeWidth="4" />
          <line x1="50" y1="75" x2="50" y2="85" strokeWidth="4" />
        </svg>
      )
    },
    {
      id: 'demigod',
      name: 'Solar Demigod',
      genre: 'Ancient Mythology',
      desc: 'Harness divine solar flares and holy sunburst beams. High magic mana reserves.',
      stats: 'HP: 90 | Mana: 130 | Attack: 16 | Defense: 3 | Crit: 10%',
      svg: (
        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke="#8b5cf6" strokeWidth="4">
          <circle cx="50" cy="50" r="16" fill="rgba(139,92,246,0.05)" />
          <path d="M50 15 L50 5 M50 95 L50 85 M15 50 L5 50 M95 50 L85 50 M25 25 L18 18 M82 82 L75 75 M25 75 L18 82 M82 18 L75 25" strokeLinecap="round" strokeWidth="3" />
        </svg>
      )
    },
    {
      id: 'hacker',
      name: 'Cyber Hacker',
      genre: 'Digital Matrix',
      desc: 'Slip into target matrix streams. Boosts evasion and lands 100% critical subroutine hits.',
      stats: 'HP: 95 | Mana: 80 | Attack: 15 | Defense: 4 | Crit: 20%',
      svg: (
        <svg viewBox="0 0 100 100" width="70" height="70" fill="none" stroke="#ff71ce" strokeWidth="4">
          <rect x="20" y="25" width="60" height="50" rx="4" fill="rgba(255,113,206,0.05)" />
          <path d="M25 65 L45 45 L55 55 L75 35" strokeWidth="4" strokeLinecap="round" />
          <circle cx="75" cy="35" r="3" fill="#ff71ce" />
        </svg>
      )
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    selectHeroClass(selectedClass, name.trim() || 'Nexus Champion');
  };

  return (
    <div style={{
      maxWidth: '850px',
      margin: '2rem auto',
      width: '100%',
      padding: '0 1rem',
      boxSizing: 'border-box'
    }}>
      <div className="terminal-panel" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          margin: 0,
          background: 'linear-gradient(45deg, #ff71ce, #06ffa1, #8b5cf6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
        }}>
          DIMENSIONAL NEXUS ARENA
        </h1>
        <p style={{ fontSize: '1rem', opacity: 0.8, marginTop: '0.4rem', fontFamily: 'monospace' }}>
          Select a champion signature and manifest into the battle grid portals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="terminal-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Name input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
            MANIFEST CHAMPION NAME:
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter champion signature..."
            style={{ fontSize: '1.1rem', padding: '0.8rem 1.2rem', width: '100%' }}
          />
        </div>

        {/* Classes grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <label style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
            SELECT CHAMPION CLASS:
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.2rem'
          }}>
            {classes.map(cls => {
              const isSelected = selectedClass === cls.id;
              
              let accentColor = '#8b5cf6';
              if (cls.id === 'paladin') accentColor = '#fbbf24';
              else if (cls.id === 'mech') accentColor = '#06ffa1';
              else if (cls.id === 'hacker') accentColor = '#ff71ce';

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  style={{
                    border: isSelected ? `2.5px solid ${accentColor}` : '1.5px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    boxShadow: isSelected ? `0 0 15px rgba(${cls.id === 'paladin' ? '251,191,36' : cls.id === 'mech' ? '6,255,161' : '139,92,246'}, 0.25)` : 'none',
                    transition: 'all 0.25s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ marginBottom: '1rem' }}>{cls.svg}</div>
                  <strong style={{ fontSize: '1.2rem', color: isSelected ? accentColor : 'inherit' }}>
                    {cls.name}
                  </strong>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: accentColor, fontWeight: 'bold', margin: '3px 0 8px 0' }}>
                    {cls.genre}
                  </span>
                  <p style={{ fontSize: '0.8rem', opacity: 0.8, lineHeight: '1.5', margin: '0 0 1rem 0', minHeight: '60px' }}>
                    {cls.desc}
                  </p>
                  <div style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    width: '100%',
                    color: isSelected ? accentColor : 'rgba(255,255,255,0.7)'
                  }}>
                    {cls.stats}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedClass}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            fontSize: '1.1rem',
            letterSpacing: '1px'
          }}
        >
          MANIFEST IN NEXUS
        </button>
      </form>
    </div>
  );
};
export default CharacterSelect;
