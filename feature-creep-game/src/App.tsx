import { useState } from 'react';
import ClickerApp from './projects/clicker/ClickerApp';
import RpgApp from './projects/rpg/RpgApp';

function App() {
  const [activeGame, setActiveGame] = useState<'launcher' | 'clicker' | 'rpg'>('launcher');

  if (activeGame === 'clicker') {
    return <ClickerApp onExit={() => setActiveGame('launcher')} />;
  }

  if (activeGame === 'rpg') {
    return <RpgApp onExit={() => setActiveGame('launcher')} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at center, #1b0e36 0%, #080313 100%)',
      color: '#e2e8f0',
      fontFamily: "'Outfit', sans-serif",
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 900,
          margin: 0,
          background: 'linear-gradient(45deg, #ff71ce, #01cdfe, #05ffa1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 0 20px rgba(255, 113, 206, 0.4)',
          letterSpacing: '1px'
        }} className="glitch-text">
          DEV SUITE ARCADE
        </h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, marginTop: '0.5rem', fontFamily: 'monospace' }}>
          &gt;_ Bootstrapping developer playgrounds...
        </p>
      </div>

      {/* Main Options Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        width: '100%',
        maxWidth: '850px'
      }}>
        {/* Game 1: Feature Creep Clicker */}
        <div
          onClick={() => setActiveGame('clicker')}
          style={{
            border: '2px solid #05ffa1',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            backgroundColor: 'rgba(5, 255, 161, 0.02)',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 15px rgba(5, 255, 161, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center'
          }}
          className="launcher-card"
        >
          <div>
            {/* Clicker Icon */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: '#000',
              border: '2px solid #05ffa1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 10px #05ffa1'
            }}>
              <svg viewBox="0 0 100 100" width="35" height="35" fill="none" stroke="#05ffa1" strokeWidth="6">
                <path d="M50 85 L50 20 M50 20 L35 35 M50 20 L65 35" strokeLinecap="round" />
                <circle cx="50" cy="85" r="5" fill="#05ffa1" />
              </svg>
            </div>

            <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.8rem 0', color: '#05ffa1' }}>
              Feature Creep Clicker
            </h2>
            
            <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              Deploy automated clickers, recruit gacha developers, trade stock portfolios, and merge critical PR feature bloats requested by corporate management.
            </p>
          </div>

          <button
            style={{
              borderColor: '#05ffa1',
              color: '#05ffa1',
              backgroundColor: 'transparent',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              padding: '0.6rem 2rem',
              textTransform: 'uppercase'
            }}
          >
            Launch System
          </button>
        </div>

        {/* Game 2: Standalone Bug Combat RPG */}
        <div
          onClick={() => setActiveGame('rpg')}
          style={{
            border: '2px solid #a855f7',
            borderRadius: '16px',
            padding: '2rem',
            cursor: 'pointer',
            backgroundColor: 'rgba(168, 85, 247, 0.02)',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 0 15px rgba(168, 85, 247, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            textAlign: 'center'
          }}
          className="launcher-card"
        >
          <div>
            {/* RPG Icon */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: '#000',
              border: '2px solid #a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto',
              boxShadow: '0 0 10px #a855f7'
            }}>
              <svg viewBox="0 0 100 100" width="35" height="35" fill="none" stroke="#a855f7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 80 L80 20 M70 15 L85 30 L80 35 L65 20 Z" />
                <line x1="30" y1="70" x2="20" y2="80" strokeWidth="10" />
              </svg>
            </div>

            <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.8rem 0', color: '#a855f7' }}>
              Bug Combat RPG Arena
            </h2>

            <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              Bootstrap your developer class (Wizard, Guardian, Rogue, Warlock), customize mechanical keyboards, summon taskforces, and cast advanced skills to squash outages.
            </p>
          </div>

          <button
            style={{
              borderColor: '#a855f7',
              color: '#a855f7',
              backgroundColor: 'transparent',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              padding: '0.6rem 2rem',
              textTransform: 'uppercase'
            }}
          >
            Launch System
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '4rem',
        fontSize: '0.8rem',
        opacity: 0.5,
        fontFamily: 'monospace',
        textAlign: 'center'
      }}>
        © 2026 Bloatware Corp. All bugs reserved. Produced under severe PM schedule pressures.
      </footer>

      {/* Launcher-specific hover scales and shadows styling */}
      <style>{`
        .launcher-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 45px 0 rgba(0,0,0,0.8), 0 0 25px currentColor !important;
        }
      `}</style>
    </div>
  );
}

export default App;
