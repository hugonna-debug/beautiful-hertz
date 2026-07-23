import React from 'react';
import { GameState, DeveloperCard } from './types';

interface GachaTabProps {
  state: GameState;
  summonGacha: () => void;
  buyGachaTicket: () => void;
  fireDeveloper: (id: string) => void;
}

// Avatar rendering helper based on developer name/rarity
const DevAvatar: React.FC<{ card: DeveloperCard }> = ({ card }) => {
  const isLegendary = card.rarity === 'legendary';
  const isRare = card.rarity === 'rare';
  const strokeColor = card.color;

  return (
    <div style={{
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: '#0c0c16',
      border: `3px solid ${strokeColor}`,
      margin: '0 auto 0.8rem auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: `0 0 10px ${strokeColor}`,
      position: 'relative'
    }}>
      {isLegendary && (
        <span style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#ef4444',
          color: '#fff',
          fontSize: '0.6rem',
          padding: '2px 4px',
          borderRadius: '4px',
          fontWeight: 'bold',
          boxShadow: '0 0 5px #ef4444'
        }}>
          10x
        </span>
      )}

      {/* SVG Avatars based on Card Role */}
      <svg viewBox="0 0 100 100" width="55" height="55">
        {card.role.includes('UI') && (
          // Paint palette and brush
          <g fill="none" stroke={strokeColor} strokeWidth="5">
            <path d="M70 40 C70 65 30 80 20 60 C10 40 20 20 40 20 C60 20 70 20 70 40 Z" fill="rgba(255,255,255,0.05)" />
            <circle cx="32" cy="35" r="4" fill={strokeColor} />
            <circle cx="48" cy="40" r="4" fill={strokeColor} />
            <circle cx="35" cy="55" r="4" fill={strokeColor} />
            <line x1="60" y1="20" x2="80" y2="40" strokeWidth="8" strokeLinecap="round" />
          </g>
        )}
        {card.role.includes('Pipeline') && (
          // Devops Gears and pipelines
          <g fill="none" stroke={strokeColor} strokeWidth="5" strokeLinecap="round">
            <circle cx="50" cy="50" r="20" fill="rgba(255,255,255,0.05)" />
            {/* Gear teeth */}
            <line x1="50" y1="20" x2="50" y2="30" />
            <line x1="50" y1="70" x2="50" y2="80" />
            <line x1="20" y1="50" x2="30" y2="50" />
            <line x1="70" y1="50" x2="80" y2="50" />
            <line x1="29" y1="29" x2="36" y2="36" />
            <line x1="64" y1="64" x2="71" y2="71" />
            <line x1="29" y1="71" x2="36" y2="64" />
            <line x1="64" y1="29" x2="71" y2="36" />
          </g>
        )}
        {card.role.includes('Bug') && (
          // QA Magnifying glass looking at bug
          <g fill="none" stroke={strokeColor} strokeWidth="5">
            <circle cx="40" cy="40" r="18" fill="rgba(255,255,255,0.05)" />
            <line x1="53" y1="53" x2="80" y2="80" strokeWidth="8" strokeLinecap="round" />
            {/* Little bug inside glass */}
            <circle cx="40" cy="40" r="4" fill={strokeColor} />
            <line x1="34" y1="40" x2="46" y2="40" />
            <line x1="40" y1="34" x2="40" y2="46" />
          </g>
        )}
        {card.role.includes('Fire') && (
          // Fire Fighter Shield & Flame
          <g fill="none" stroke={strokeColor} strokeWidth="5" strokeLinejoin="round">
            <path d="M20 20 L50 10 L80 20 L80 50 C80 70 50 90 50 90 C50 90 20 70 20 50 Z" fill="rgba(255,255,255,0.05)" />
            {/* Flame */}
            <path d="M50 35 Q35 55 50 70 Q65 55 50 35 Z" fill={strokeColor} stroke="none" />
          </g>
        )}
        {card.role.includes('Index') && (
          // DBA database cylinders
          <g fill="none" stroke={strokeColor} strokeWidth="5" strokeLinejoin="round">
            <ellipse cx="50" cy="30" rx="20" ry="8" fill="rgba(255,255,255,0.05)" />
            <path d="M30 30 L30 50 A20 8 0 0 0 70 50 L70 30" />
            <path d="M30 50 L30 70 A20 8 0 0 0 70 70 L70 50" />
          </g>
        )}
        {card.role.includes('Mythical') && (
          // 10x Developer Crown / Ninja
          <g fill="none" stroke={strokeColor} strokeWidth="5" strokeLinejoin="round">
            {/* Crown */}
            <path d="M20 70 L25 35 L40 55 L50 30 L60 55 L75 35 L80 70 Z" fill="rgba(255,255,255,0.05)" />
            <line x1="15" y1="75" x2="85" y2="75" strokeWidth="8" />
          </g>
        )}
        {card.role.includes('Code') && (
          // AGI Neural Nodes
          <g fill="none" stroke={strokeColor} strokeWidth="4">
            <circle cx="50" cy="20" r="8" fill={strokeColor} />
            <circle cx="25" cy="65" r="8" fill={strokeColor} />
            <circle cx="75" cy="65" r="8" fill={strokeColor} />
            <line x1="50" y1="28" x2="25" y2="57" />
            <line x1="50" y1="28" x2="75" y2="57" />
            <line x1="33" y1="65" x2="67" y2="65" />
            {/* Outer ring */}
            <circle cx="50" cy="50" r="38" strokeDasharray="5,5" />
          </g>
        )}
      </svg>
    </div>
  );
};

export const GachaTab: React.FC<GachaTabProps> = ({
  state,
  summonGacha,
  buyGachaTicket,
  fireDeveloper
}) => {
  const { gachaCards, creep, portfolio, gachaCost, gachaPulls } = state;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Gacha Portal card */}
      <div className="terminal-panel gravity-item" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          🌀 TALENT ACQUISITION DIMENSIONAL PORTAL
        </h3>
        <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', opacity: 0.8 }}>
          Pull developers from alternate workspaces. Costs increase per recruitment.
        </p>

        {/* Portal graphic */}
        <div className="portal-glow" />

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          <button
            disabled={creep < gachaCost}
            onClick={summonGacha}
            style={{ fontSize: '1.1rem', padding: '0.8rem 2rem' }}
          >
            Summon Dev ({gachaCost} creep)
          </button>
        </div>

        {/* Funding portal tickets */}
        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', borderTop: '1px dashed currentColor', paddingTop: '1rem' }}>
          <span>Budget Low? </span>
          <button
            disabled={portfolio.balance < 25}
            onClick={buyGachaTicket}
            style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', marginLeft: '0.5rem' }}
          >
            Buy Corporate Budget Pack ($25.00 cash → 100 creep)
          </button>
          <span style={{ marginLeft: '1rem', opacity: 0.7 }}>Total Recruits Summoned: {gachaPulls}</span>
        </div>
      </div>

      {/* Developers roster */}
      <div className="terminal-panel gravity-item">
        <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          💼 ACTIVE ENGINEERING WORKFORCE ROSTER ({gachaCards.length} Devs)
        </h3>

        {gachaCards.length === 0 ? (
          <div style={{ opacity: 0.5, textAlign: 'center', padding: '2rem' }}>
            No developers summoned yet. Deploy recruiters to fill slots!
          </div>
        ) : (
          <div className="gacha-grid">
            {gachaCards.map((card: DeveloperCard) => (
              <div 
                key={card.id} 
                className={`gacha-card ${card.rarity}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}
              >
                {/* Header */}
                <div>
                  <span style={{
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: card.color,
                    fontWeight: 'bold'
                  }}>
                    {card.rarity}
                  </span>
                  <h4 style={{ margin: '0.2rem 0', fontSize: '1rem' }}>{card.name}</h4>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{card.role}</span>
                </div>

                {/* Avatar */}
                <DevAvatar card={card} />

                {/* Benefits */}
                <div>
                  <div style={{
                    fontSize: '0.8rem',
                    border: '1px dashed currentColor',
                    padding: '4px',
                    borderRadius: '4px',
                    margin: '0.5rem 0',
                    backgroundColor: 'rgba(255,255,255,0.02)'
                  }}>
                    {card.bonusText}
                  </div>

                  {/* Corporate Fire Button */}
                  <button
                    onClick={() => fireDeveloper(card.id)}
                    style={{
                      width: '100%',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.75rem',
                      backgroundColor: 'transparent',
                      borderColor: '#ef4444',
                      color: '#f87171'
                    }}
                  >
                    Lay Off Dev
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default GachaTab;
