import React, { useState, useEffect, useRef } from 'react';
import { GameState, RpgEnemy, Equipment, LpcCharacterConfig } from '../types/game';
import { AscensionIcon, SwordIcon, ShieldIcon, LevelIcon, BagIcon, RegenIcon, ShardIcon } from './Icons';
import { getRingSpriteInfo } from '../utils/ringCatalog';
import { CharacterCreator } from './CharacterCreator';
import { LpcCharacterCanvas } from './LpcCharacterCanvas';

interface BattleConsoleProps {
  state: GameState;
  selectStage: (zoneId: string, stageId: number) => void;
  toggleAutoAdvance: () => void;
  ascendHero: () => void;
  resolveHeroStats: () => Record<string, number>;
  onUpdateCharacter?: (config: Partial<LpcCharacterConfig>) => void;
  isMobile?: boolean;
}

export const BattleConsole: React.FC<BattleConsoleProps> = ({
  state,
  selectStage,
  toggleAutoAdvance,
  ascendHero,
  resolveHeroStats,
  onUpdateCharacter,
  isMobile = false
}) => {
  const { activeStageId, maxUnlockedStage, activeEnemy, combatLogs, autoAdvance, level } = state;
  const heroStats = resolveHeroStats();

  const heroHp = state.hero?.hp ?? heroStats.maxHp;
  const hpPercent = Math.min(100, Math.floor((heroHp / heroStats.maxHp) * 100));
  const enemyHpPercent = activeEnemy ? Math.min(100, Math.floor((activeEnemy.hp / activeEnemy.maxHp) * 100)) : 0;

  // Toggle state between Animated Arena (default), text Logs, and Character Customizer
  const [battleTab, setBattleTab] = useState<'arena' | 'logs' | 'character'>('arena');
  const [spriteFrame, setSpriteFrame] = useState(0);

  // Dynamic sprite animation tick interval scaled 1-to-1 to exact hero attack speed (8 steps per attack cycle)
  useEffect(() => {
    const speedMult = Math.max(0.1, heroStats.atkSpeed || 1.0);
    // 8 frames per attack cycle -> step frame every (1000ms / (atkSpeed * 8))
    const frameIntervalMs = Math.max(10, Math.floor(1000 / (speedMult * 8)));
    const timer = setInterval(() => {
      setSpriteFrame(prev => (prev + 1) % 8);
    }, frameIntervalMs);
    return () => clearInterval(timer);
  }, [heroStats.atkSpeed]);

  // Animation states
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [attackTriggerId, setAttackTriggerId] = useState(0);
  const [enemyAttacking, setEnemyAttacking] = useState(false);
  const [enemyAttackTriggerId, setEnemyAttackTriggerId] = useState(0);
  const [playerSlashed, setPlayerSlashed] = useState(false);
  const [enemySlashed, setEnemySlashed] = useState(false);
  const [enemyDying, setEnemyDying] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; text: string; isCrit: boolean; isPlayer: boolean }[]>([]);

  const lastLogsCountRef = useRef(combatLogs.length);

  // Parse combat logs in real-time to trigger visual events and numbers
  useEffect(() => {
    if (combatLogs.length > lastLogsCountRef.current) {
      const newLogs = combatLogs.slice(lastLogsCountRef.current);
      lastLogsCountRef.current = combatLogs.length;

      newLogs.forEach(log => {
        if (log.includes('Hero strikes')) {
          // Dynamic duration scaling 1-to-1 with exact hero attack speed (1 / atkSpeed seconds)
          const speedMult = Math.max(0.1, heroStats.atkSpeed || 1.0);
          const animMs = Math.max(80, Math.floor(1000 / speedMult));
          // Frame 200 is step 4 of 8 (50% into attack cycle)
          const slashDelay = Math.floor(animMs * 0.5);
          const slashDur = Math.max(40, Math.floor(animMs * 0.35));

          setSpriteFrame(0);
          setPlayerAttacking(true);
          setAttackTriggerId(prev => prev + 1);
          setTimeout(() => setPlayerAttacking(false), animMs);

          // Trigger hit flash / slash on enemy AND damage number at frame 200 impact (slashDelay)
          const dmgMatch = log.match(/for (\d+)/);
          setTimeout(() => {
            setEnemySlashed(true);
            setTimeout(() => setEnemySlashed(false), slashDur);

            if (dmgMatch) {
              const dmg = parseInt(dmgMatch[1], 10);
              const isCrit = log.includes('CRITICAL');
              const isBonus = log.includes('BONUS CRIT');
              const prefix = isBonus ? '🔥 ' : (isCrit ? '💥 ' : '🗡️ ');
              const suffix = isBonus ? ' BONUS!' : (isCrit ? ' CRIT!' : '');
              spawnDamageNumber(`${prefix}${dmg}${suffix}`, 'enemy', isCrit);
            }
          }, slashDelay);
        } else if (log.includes('strikes Hero')) {
          // Trigger enemy lunge attack
          setEnemyAttacking(true);
          setEnemyAttackTriggerId(prev => prev + 1);
          setTimeout(() => setEnemyAttacking(false), 300);

          // Trigger hit flash / slash on player after slight delay
          setTimeout(() => {
            setPlayerSlashed(true);
            setTimeout(() => setPlayerSlashed(false), 300);
          }, 100);

          // Parse damage number
          const dmgMatch = log.match(/for (\d+)/);
          if (dmgMatch) {
            const dmg = parseInt(dmgMatch[1], 10);
            spawnDamageNumber(`🩸 ${dmg}`, 'player', false);
          }
        } else if (log.includes('Evaded')) {
          spawnDamageNumber('💨 EVADED', 'player', false);
        } else if (log.includes('DEFEATED')) {
          spawnDamageNumber('💀 DEFEATED', 'player', false);
        } else if (log.includes('Banished')) {
          // Trigger enemy death animation
          setEnemyDying(true);
          setTimeout(() => setEnemyDying(false), 300);
        }
      });
    } else {
      lastLogsCountRef.current = combatLogs.length;
    }
  }, [combatLogs]);

  const spawnDamageNumber = (text: string, side: 'player' | 'enemy', isCrit: boolean) => {
    const id = Date.now() + Math.random();
    setDamageNumbers(prev => [...prev, { id, text, isCrit, isPlayer: side === 'player' }]);
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(n => n.id !== id));
    }, 800);
  };

  // EQUIPMENT COLOR ASSIGNMENT
  const getGearColor = (item: any, fallback: string) => {
    if (!item) return fallback;
    switch (item.rarity) {
      case 'legendary': return '#f97316'; // Legendary orange
      case 'epic': return '#a855f7';      // Epic purple
      case 'rare': return '#3b82f6';      // Rare blue
      case 'common': return '#22c55e';    // Common green
      default: return fallback;
    }
  };

  const renderCustomHeadDetails = () => {
    const heroHash = (() => {
      let hash = 0;
      const name = state.heroName || 'Hero';
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(hash);
    })();

    const hairStyle = heroHash % 4;
    const faceDetail = (heroHash >> 2) % 4;

    // 1. Hair styles
    let hair = null;
    if (hairStyle === 0) {
      // Neon Cyan Spiky Hair
      hair = (
        <path d="M 35,20 L 32,12 L 37,15 L 42,10 L 45,15 L 48,10 L 53,15 L 58,12 L 55,20" fill="var(--neon-cyan)" stroke="#000" strokeWidth="1" />
      );
    } else if (hairStyle === 1) {
      // Neon Pink Flowing Hair
      hair = (
        <path d="M 35,22 C 32,15 36,8 45,8 C 54,8 58,15 55,22 C 57,26 56,32 54,34 C 52,28 50,22 45,22 C 40,22 38,28 36,34" fill="var(--neon-pink)" stroke="#000" strokeWidth="1" />
      );
    } else if (hairStyle === 2) {
      // Neon Gold Mohawk
      hair = (
        <path d="M 43,22 L 43,10 Q 45,6 47,10 L 47,22 Z" fill="#fbbf24" stroke="#000" strokeWidth="1" />
      );
    } else {
      // Cyber Horns
      hair = (
        <g>
          <path d="M 37,16 Q 33,8 30,12 Q 35,16 38,18" fill="#ef4444" stroke="#000" strokeWidth="1" />
          <path d="M 53,16 Q 57,8 60,12 Q 55,16 52,18" fill="#ef4444" stroke="#000" strokeWidth="1" />
        </g>
      );
    }

    // 2. Face details
    let detail = null;
    if (faceDetail === 0) {
      // Cyber Visor goggles
      detail = (
        <rect x="40" y="19" width="10" height="4" rx="1" fill="var(--neon-cyan)" stroke="#000" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 3px var(--neon-cyan))' }} />
      );
    } else if (faceDetail === 1) {
      // Dual Battle Scar
      detail = (
        <g>
          <line x1="39" y1="18" x2="42" y2="24" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="41" y1="18" x2="44" y2="24" stroke="#ef4444" strokeWidth="1.5" />
        </g>
      );
    } else if (faceDetail === 2) {
      // Glowing third eye forehead gem
      detail = (
        <polygon points="45,14 43,17 45,20 47,17" fill="var(--neon-pink)" stroke="#000" strokeWidth="0.5" style={{ filter: 'drop-shadow(0 0 3px var(--neon-pink))' }} />
      );
    } else {
      // Cyber Face Paint
      detail = (
        <path d="M 38,24 L 41,20 L 45,24 L 49,20 L 52,24" fill="none" stroke="#eab308" strokeWidth="1.5" />
      );
    }

    return (
      <g>
        {hair}
        {detail}
      </g>
    );
  };

  const CUSTOM_HEADS = [
    {
      id: 'default',
      name: 'Novice Skin',
      theme: 'normal',
      description: 'Your standard starting skin. Shows your custom profile hair.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="8.5" fill="#fca5a5" stroke="#000" strokeWidth="1.5" />
          <circle cx="42" cy="21" r="1.5" fill="#000" />
          <circle cx="48" cy="21" r="1.5" fill="#000" />
          <path d="M 42,25 Q 45,28 48,25" fill="none" stroke="#000" strokeWidth="1" strokeLinecap="round" />
          {renderCustomHeadDetails()}
          {renderHelmetVisual()}
        </g>
      )
    },
    {
      id: 'neon_visor',
      name: 'Cyber Goggles',
      theme: 'cool',
      description: 'Sleek cybernetic visor with active neon data overlays.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="8.5" fill="#1f2937" stroke="var(--neon-cyan)" strokeWidth="1.5" />
          <rect x="38" y="19" width="14" height="5" rx="1.5" fill="var(--neon-cyan)" stroke="#000" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 3px var(--neon-cyan))' }} />
          <line x1="40" y1="21" x2="50" y2="21" stroke="#fff" strokeWidth="1" />
        </g>
      )
    },
    {
      id: 'ghost_hood',
      name: 'Ghost Hood',
      theme: 'cool',
      description: 'Shrouded in shadows. Only glowing eyes are visible.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <path d="M 35,28 C 33,18 36,12 45,12 C 54,12 57,18 55,28 Z" fill="#000" stroke="var(--neon-pink)" strokeWidth="1.5" style={{ filter: 'drop-shadow(0 0 4px var(--neon-pink))' }} />
          <circle cx="41" cy="22" r="2.2" fill="var(--neon-pink)" style={{ filter: 'drop-shadow(0 0 3px var(--neon-pink))' }} />
          <circle cx="49" cy="22" r="2.2" fill="var(--neon-pink)" style={{ filter: 'drop-shadow(0 0 3px var(--neon-pink))' }} />
        </g>
      )
    },
    {
      id: 'pumpkin',
      name: 'Spooky Pumpkin',
      theme: 'funny',
      description: 'A carved Jack-o\'-lantern that glows from within.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="9.5" fill="#f97316" stroke="#000" strokeWidth="1.5" />
          <polygon points="41,19 39,22 43,22" fill="#fff" />
          <polygon points="49,19 47,22 51,22" fill="#fff" />
          <path d="M 40,24 Q 45,28 50,24 L 48,24 Q 45,26 42,24 Z" fill="#fff" stroke="#000" strokeWidth="0.8" />
          <rect x="44" y="11" width="2" height="3" rx="0.5" fill="#15803d" />
        </g>
      )
    },
    {
      id: 'slime',
      name: 'Slime Blobby',
      theme: 'funny',
      description: 'A cute, wobbly green slime ball.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <path d="M 36,25 C 34,14 56,14 54,25 C 55,28 53,30 45,30 C 37,30 35,28 36,25 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" opacity="0.9" />
          <circle cx="42" cy="21" r="1.5" fill="#000" />
          <circle cx="48" cy="21" r="1.5" fill="#000" />
          <path d="M 43,24 Q 45,26 47,24" fill="none" stroke="#000" strokeWidth="1" strokeLinecap="round" />
        </g>
      )
    },
    {
      id: 'knight',
      name: 'Vanguard Helm',
      theme: 'strong',
      description: 'Heavy steel helmet with a bright red plume.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="9" fill="#71717a" stroke="#000" strokeWidth="1.5" />
          <path d="M 45,13 Q 36,3 41,1 Q 45,3 45,13" fill="#ef4444" />
          <path d="M 39,21 H 51 V 24 H 46 V 30 H 44 V 24 H 39 Z" fill="#27272a" />
          <line x1="41" y1="22" x2="49" y2="22" stroke="#eab308" strokeWidth="1" />
        </g>
      )
    },
    {
      id: 'demon',
      name: 'Dread Horns',
      theme: 'strong',
      description: 'Fiendish red skull with volcanic obsidian horns.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="8.5" fill="#dc2626" stroke="#000" strokeWidth="1.5" />
          <path d="M 37,16 Q 32,7 28,11 Q 34,15 38,18" fill="#18181b" stroke="#000" strokeWidth="1" />
          <path d="M 53,16 Q 58,7 62,11 Q 56,15 52,18" fill="#18181b" stroke="#000" strokeWidth="1" />
          <polygon points="38,20 42,22 39,23" fill="#fbbf24" />
          <polygon points="52,20 48,22 51,23" fill="#fbbf24" />
        </g>
      )
    },
    {
      id: 'void_eye',
      name: 'Void Beholder',
      theme: 'weird',
      description: 'A magical cosmic eye that gazes into the void.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="9.5" fill="#3b0764" stroke="#a855f7" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px #a855f7)' }} />
          <circle cx="45" cy="22" r="5" fill="#fff" />
          <circle cx="45" cy="22" r="2.5" fill="#a855f7" />
          <circle cx="46.5" cy="20.5" r="0.8" fill="#fff" />
        </g>
      )
    },
    {
      id: 'robo',
      name: 'Robo-Core',
      theme: 'weird',
      description: 'Square monitor displaying green electronic waves.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <rect x="36" y="13" width="18" height="17" rx="2" fill="#374151" stroke="#000" strokeWidth="1.5" />
          <rect x="39" y="16" width="12" height="11" fill="#022c22" />
          <path d="M 40,22 Q 42,18 45,22 Q 48,26 50,22" fill="none" stroke="var(--neon-cyan)" strokeWidth="1.2" style={{ filter: 'drop-shadow(0 0 2px var(--neon-cyan))' }} />
          <line x1="45" y1="13" x2="42" y2="7" stroke="#000" strokeWidth="1.5" />
          <line x1="45" y1="13" x2="48" y2="7" stroke="#000" strokeWidth="1.5" />
          <circle cx="42" cy="7" r="1.2" fill="#ef4444" />
          <circle cx="48" cy="7" r="1.2" fill="#ef4444" />
        </g>
      )
    },
    {
      id: 'wizard',
      name: 'Star Caster',
      theme: 'weird',
      description: 'Pointy blue hat decorated with gold stars.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="8" fill="#18181b" stroke="#000" strokeWidth="1.5" />
          <circle cx="42" cy="22" r="1.5" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 2px #fbbf24)' }} />
          <circle cx="48" cy="22" r="1.5" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 2px #fbbf24)' }} />
          <path d="M 33,21 L 45,5 L 57,21 Z" fill="#1d4ed8" stroke="#172554" strokeWidth="1.5" />
          <ellipse cx="45" cy="21" rx="14" ry="3" fill="#1e40af" stroke="#000" strokeWidth="1" />
        </g>
      )
    },
    {
      id: 'boxy',
      name: 'Boxy',
      theme: 'funny',
      description: 'A cardboard box with hand-drawn marker eyes.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <rect x="36" y="13" width="18" height="17" rx="1" fill="#d97706" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="41" cy="20" r="1.8" fill="#000" />
          <circle cx="49" cy="20" r="1.8" fill="#000" />
          <path d="M 42,24 Q 45,26 48,24" fill="none" stroke="#000" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      )
    },
    {
      id: 'cosmo',
      name: 'Space Visor',
      theme: 'cool',
      description: 'Space helmet with light blue glass reflection.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="9.5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
          <path d="M 37,22 C 37,15 53,15 53,22 C 53,27 49,30 45,30 C 41,30 37,27 37,22 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.2" style={{ filter: 'drop-shadow(0 0 3px #38bdf8)' }} />
          <path d="M 40,19 Q 45,16 50,19" fill="none" stroke="#fff" strokeWidth="1" opacity="0.6" />
        </g>
      )
    },
    {
      id: 'monarch',
      name: 'Crown Royal',
      theme: 'strong',
      description: 'A crown fit for an optimization king.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="8.5" fill="#fca5a5" stroke="#000" strokeWidth="1.5" />
          <path d="M 36,22 C 34,26 34,30 45,30 C 56,30 56,26 54,22" fill="#7c2d12" />
          <path d="M 34,17 L 36,9 L 41,13 L 45,8 L 49,13 L 54,9 L 56,17 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <circle cx="41" cy="14" r="1" fill="#ef4444" />
          <circle cx="45" cy="12" r="1" fill="#10b981" />
          <circle cx="49" cy="14" r="1" fill="#ef4444" />
        </g>
      )
    },
    {
      id: 'plague',
      name: 'Doctor Beak',
      theme: 'weird',
      description: 'Ancient beak mask for void filtration.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <path d="M 35,28 C 33,18 36,12 45,12 C 54,12 57,18 55,28 Z" fill="#27272a" stroke="#000" strokeWidth="1" />
          <circle cx="42" cy="21" r="2.2" fill="#ef4444" stroke="#000" strokeWidth="1" />
          <circle cx="48" cy="21" r="2.2" fill="#ef4444" stroke="#000" strokeWidth="1" />
          <path d="M 45,22 Q 45,29 42,32 Q 45,25 47,22 Z" fill="#d97706" stroke="#000" strokeWidth="1" />
        </g>
      )
    },
    {
      id: 'neko',
      name: 'Neko Ears',
      theme: 'funny',
      description: 'Cat ear transceivers for audio enhancements.',
      render: (_rarityColor: string, _armorColor: string) => (
        <g>
          <circle cx="45" cy="22" r="8.5" fill="#fca5a5" stroke="#000" strokeWidth="1.5" />
          <polygon points="34,16 32,8 39,13" fill="#fca5a5" stroke="#000" strokeWidth="1" />
          <polygon points="35,14 34,9 38,12" fill="#f43f5e" />
          <polygon points="56,16 58,8 51,13" fill="#fca5a5" stroke="#000" strokeWidth="1" />
          <polygon points="55,14 56,9 52,12" fill="#f43f5e" />
          <line x1="36" y1="23" x2="31" y2="22" stroke="#000" strokeWidth="0.8" />
          <line x1="36" y1="24" x2="31" y2="25" stroke="#000" strokeWidth="0.8" />
          <line x1="54" y1="23" x2="59" y2="22" stroke="#000" strokeWidth="0.8" />
          <line x1="54" y1="24" x2="59" y2="25" stroke="#000" strokeWidth="0.8" />
          <circle cx="42" cy="21" r="1.2" fill="#000" />
          <circle cx="48" cy="21" r="1.2" fill="#000" />
          <path d="M 43,23 Q 45,25 47,23" fill="none" stroke="#000" strokeWidth="0.8" />
        </g>
      )
    }
  ];

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return '#f97316';
      case 'epic': return '#a855f7';
      case 'rare': return '#3b82f6';
      case 'common': return '#22c55e';
      default: return '#71717a';
    }
  };

  const renderEquipmentSpriteInner = (item: Equipment | null, hideAuraRing: boolean = false) => {
    if (!item) return null;
    const rarityColor = getRarityColor(item.rarity);
    const nameLower = item.name.toLowerCase();
    const isSet = !!item.setName;

    // Glowing filter definition to give weapons/armor that cyber pop
    const filterId = `glow-arena-${item.id}`;

    return (
      <g>
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Aura Ring base for Rare/Epic/Legendary */}
        {!hideAuraRing && item.rarity !== 'common' && (
          <circle 
            cx="25" 
            cy="25" 
            r="20" 
            fill="none" 
            stroke={rarityColor} 
            strokeWidth="0.5" 
            strokeDasharray="2,2" 
            opacity="0.6" 
          />
        )}

        {/* 1. WEAPONS SLOTS */}
        {item.slot === 'weapon' && (() => {
          if (nameLower.includes('staff') || nameLower.includes('wand')) {
            return (
              <g>
                {/* Staff shaft */}
                <line x1="12" y1="38" x2="33" y2="17" stroke="#854d0e" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="12" y1="38" x2="33" y2="17" stroke={rarityColor} strokeWidth="1" strokeLinecap="round" opacity="0.5" />
                {/* Staff head casing */}
                <circle cx="36" cy="14" r="5" fill="none" stroke="#eab308" strokeWidth="1.5" />
                {/* Orbiting magic stone */}
                <circle cx="36" cy="14" r="3" fill={rarityColor} filter={`url(#${filterId})`} />
                {/* Core sparkle */}
                <path d="M 36 9 L 36 19 M 31 14 L 41 14" stroke="#fff" strokeWidth="0.8" />
              </g>
            );
          }
          if (nameLower.includes('bow')) {
            return (
              <g>
                {/* Bow Limbs */}
                <path d="M 12 14 C 18 10, 32 10, 38 14 C 36 24, 36 26, 38 36 C 32 40, 18 40, 12 36" fill="none" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
                {/* String */}
                <line x1="12" y1="14" x2="12" y2="36" stroke="#e2e8f0" strokeWidth="0.8" />
                {/* Nocked Arrow */}
                <line x1="10" y1="25" x2="34" y2="25" stroke="#475569" strokeWidth="1.5" />
                <polygon points="34,25 30,22 30,28" fill={rarityColor} />
                {/* Arrow fletching */}
                <line x1="10" y1="22" x2="12" y2="25" stroke="#f43f5e" strokeWidth="1.5" />
                <line x1="10" y1="28" x2="12" y2="25" stroke="#f43f5e" strokeWidth="1.5" />
              </g>
            );
          }
          if (nameLower.includes('dagger') || nameLower.includes('dirk') || nameLower.includes('knife') || nameLower.includes('shank')) {
            return (
              <g transform="rotate(-15 25 25)">
                {/* Handle / Hilt */}
                <rect x="23" y="32" width="4" height="10" rx="1.5" fill="#475569" stroke="#000" strokeWidth="1" />
                <line x1="18" y1="32" x2="32" y2="32" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                {/* Short sharp blade */}
                <path d="M 21 32 L 21 16 L 25 8 L 29 16 L 29 32 Z" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
                {/* Core elemental line */}
                <line x1="25" y1="30" x2="25" y2="12" stroke={rarityColor} strokeWidth="1.2" filter={`url(#${filterId})`} />
              </g>
            );
          }
          if (nameLower.includes('axe') || nameLower.includes('cleaver') || nameLower.includes('hammer') || nameLower.includes('mace') || nameLower.includes('maul')) {
            const isHammer = nameLower.includes('hammer') || nameLower.includes('mace') || nameLower.includes('maul');
            return (
              <g>
                {/* Wooden Shaft */}
                <line x1="15" y1="38" x2="30" y2="23" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                {/* Head */}
                {isHammer ? (
                  // Warhammer head block
                  <g>
                    <rect x="22" y="10" width="16" height="10" rx="1" fill="#475569" stroke="#000" strokeWidth="1.5" />
                    <rect x="20" y="12" width="2" height="6" fill={rarityColor} />
                    <rect x="38" y="12" width="2" height="6" fill={rarityColor} />
                    {/* Spike */}
                    <polygon points="30,10 30,5 32,10" fill="#e2e8f0" stroke="#000" strokeWidth="0.8" />
                  </g>
                ) : (
                  // Battleaxe head
                  <g>
                    {/* Left blade */}
                    <path d="M 22 15 C 16 11, 10 10, 10 20 C 10 30, 16 29, 22 25 Z" fill="#64748b" stroke="#000" strokeWidth="1" />
                    {/* Right blade */}
                    <path d="M 23 15 C 29 11, 35 10, 35 20 C 35 30, 29 29, 23 25 Z" fill="#64748b" stroke="#000" strokeWidth="1" />
                    {/* Glowing blade edges */}
                    <path d="M 11 16 C 11 20, 11 25, 12 28" stroke={rarityColor} strokeWidth="1.5" fill="none" filter={`url(#${filterId})`} />
                    <path d="M 34 16 C 34 20, 34 25, 33 28" stroke={rarityColor} strokeWidth="1.5" fill="none" filter={`url(#${filterId})`} />
                  </g>
                )}
              </g>
            );
          }
          if (nameLower.includes('spear') || nameLower.includes('glaive') || nameLower.includes('halberd') || nameLower.includes('lance') || nameLower.includes('pike')) {
            const isHalberd = nameLower.includes('halberd') || nameLower.includes('glaive');
            return (
              <g>
                {/* Shaft */}
                <line x1="10" y1="40" x2="35" y2="15" stroke="#7c2d12" strokeWidth="2" />
                {/* Halberd crescent hook */}
                {isHalberd && (
                  <path d="M 33 13 C 27 15, 27 23, 31 23" fill="none" stroke="#64748b" strokeWidth="2" />
                )}
                {/* Spear tip */}
                <polygon points="35,15 42,8 38,19" fill="#94a3b8" stroke="#1e293b" strokeWidth="1" />
                {/* Spear glowing core */}
                <polygon points="36,14 40,10 38,16" fill={rarityColor} filter={`url(#${filterId})`} />
              </g>
            );
          }
          // Default: Broadsword / Saber / Cyberblade
          return (
            <g transform="rotate(45 25 25)">
              {/* Grip / Leather wrap */}
              <rect x="23" y="32" width="4" height="12" rx="1" fill="#451a03" stroke="#000" strokeWidth="1" />
              {/* Crossguard */}
              <rect x="15" y="30" width="20" height="3" rx="1.5" fill="#eab308" stroke="#1e293b" strokeWidth="1" />
              {/* Blade */}
              <path d="M 21 30 L 21 6 L 25 2 L 29 6 L 29 30 Z" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
              {/* Central glowing channel */}
              <line x1="25" y1="28" x2="25" y2="8" stroke={rarityColor} strokeWidth="1.5" strokeLinecap="round" filter={`url(#${filterId})`} />
            </g>
          );
        })()}

        {/* 2. BODY ARMOR SLOTS */}
        {item.slot === 'body' && (() => {
          if (nameLower.includes('robe') || nameLower.includes('cloak') || nameLower.includes('vestment')) {
            return (
              <g>
                {/* Flowing cape/cloak */}
                <path d="M 12 18 L 8 42 L 42 42 L 38 18 Z" fill="#4c1d95" stroke="#1e1b4b" strokeWidth="1.5" opacity="0.85" />
                <path d="M 12 18 L 8 42" stroke={rarityColor} strokeWidth="1.5" />
                <path d="M 38 18 L 42 42" stroke={rarityColor} strokeWidth="1.5" />
                {/* Robe chest plate */}
                <path d="M 18 16 Q 25 22 32 16 L 32 30 Q 25 35 18 30 Z" fill="#2e1065" stroke={rarityColor} strokeWidth="1.5" />
                {/* Golden cloth collar */}
                <path d="M 18 16 Q 25 22 32 16 Q 25 12 18 16" fill="#eab308" />
              </g>
            );
          }
          if (isSet || nameLower.includes('reactor') || nameLower.includes('cyber') || nameLower.includes('matrix')) {
            return (
              <g>
                {/* Cyber shoulder pauldrons */}
                <rect x="10" y="14" width="8" height="6" rx="1.5" fill="#0f172a" stroke={rarityColor} strokeWidth="1" />
                <rect x="32" y="14" width="8" height="6" rx="1.5" fill="#0f172a" stroke={rarityColor} strokeWidth="1" />
                {/* Cyber armor core */}
                <path d="M 15 16 L 35 16 L 33 36 L 17 36 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
                {/* Glowing Reactor central core */}
                <circle cx="25" cy="25" r="5" fill="#000" stroke={rarityColor} strokeWidth="1.5" />
                <circle cx="25" cy="25" r="3" fill={rarityColor} filter={`url(#${filterId})`} />
                {/* Power lines */}
                <line x1="17" y1="20" x2="21" y2="23" stroke={rarityColor} strokeWidth="1" opacity="0.7" />
                <line x1="33" y1="20" x2="29" y2="23" stroke={rarityColor} strokeWidth="1" opacity="0.7" />
              </g>
            );
          }
          // Default: Plate Armor / Breastplate
          return (
            <g>
              {/* Pauldrons (Shoulders) */}
              <path d="M 9 14 C 9 8, 17 10, 18 16" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
              <path d="M 41 14 C 41 8, 33 10, 32 16" fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
              {/* Chest plate layout */}
              <path d="M 16 16 L 34 16 L 32 36 C 25 40, 25 40, 18 36 Z" fill="#94a3b8" stroke="#1e293b" strokeWidth="2" />
              {/* Steel abdominal lines */}
              <path d="M 19 23 L 31 23 M 18 29 L 32 29" stroke="#475569" strokeWidth="1.5" />
              {/* Rarity crest */}
              <polygon points="25,16 22,21 28,21" fill={rarityColor} stroke="#000" strokeWidth="0.5" />
            </g>
          );
        })()}

        {/* 3. BOOTS SLOTS */}
        {item.slot === 'boots' && (() => {
          if (nameLower.includes('wing') || nameLower.includes('breeze') || nameLower.includes('cosmic') || nameLower.includes('warlock')) {
            return (
              <g>
                {/* Left Winged Boot */}
                <path d="M 14 18 L 19 18 L 19 32 L 13 32 Z" fill="#6d28d9" stroke="#000" strokeWidth="1" />
                <path d="M 13 32 L 23 32 L 23 36 L 12 36 Z" fill="#8b5cf6" stroke="#000" strokeWidth="1" />
                {/* Left wings */}
                <path d="M 11 20 Q 5 22 8 26 Q 13 25 14 22" fill={rarityColor} stroke="#000" strokeWidth="0.8" />
                <path d="M 11 24 Q 6 26 9 29 Q 13 28 14 25" fill={rarityColor} stroke="#000" strokeWidth="0.8" />

                {/* Right Winged Boot */}
                <path d="M 28 18 L 33 18 L 33 32 L 27 32 Z" fill="#6d28d9" stroke="#000" strokeWidth="1" />
                <path d="M 27 32 L 37 32 L 37 36 L 26 36 Z" fill="#8b5cf6" stroke="#000" strokeWidth="1" />
                {/* Right wings */}
                <path d="M 36 20 Q 42 22 39 26 Q 34 25 33 22" fill={rarityColor} stroke="#000" strokeWidth="0.8" />
                <path d="M 36 24 Q 42 26 39 29 Q 34 28 33 25" fill={rarityColor} stroke="#000" strokeWidth="0.8" />
              </g>
            );
          }
          if (nameLower.includes('jet') || nameLower.includes('cyber') || nameLower.includes('synthesizer') || nameLower.includes('overcharge')) {
            return (
              <g>
                {/* Cyber Boots */}
                <rect x="14" y="16" width="6" height="18" fill="#1e293b" stroke={rarityColor} strokeWidth="1" />
                <path d="M 14 30 L 22 30 L 22 34 L 12 34 Z" fill="#0f172a" stroke={rarityColor} strokeWidth="1" />
                <rect x="28" y="16" width="6" height="18" fill="#1e293b" stroke={rarityColor} strokeWidth="1" />
                <path d="M 28 30 L 36 30 L 36 34 L 26 34 Z" fill="#0f172a" stroke={rarityColor} strokeWidth="1" />
                {/* Glowing jet thrusters underneath */}
                <polygon points="14,34 16,39 18,34" fill={rarityColor} filter={`url(#${filterId})`} />
                <polygon points="28,34 30,39 32,34" fill={rarityColor} filter={`url(#${filterId})`} />
              </g>
            );
          }
          // Default: Iron Greaves / Boots
          return (
            <g>
              {/* Left Boot */}
              <path d="M 13 18 L 19 18 L 19 32 L 13 32 Z" fill="#78899a" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 13 32 L 23 32 L 23 36 L 11 36 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
              <rect x="15" y="22" width="2" height="6" fill={rarityColor} />

              {/* Right Boot */}
              <path d="M 27 18 L 33 18 L 33 32 L 27 32 Z" fill="#78899a" stroke="#1e293b" strokeWidth="1.5" />
              <path d="M 27 32 L 37 32 L 37 36 L 25 36 Z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
              <rect x="29" y="22" width="2" height="6" fill={rarityColor} />
            </g>
          );
        })()}

        {/* 4. RING SLOTS (RENDERED FROM RINGS SPRITESHEET) */}
        {item.slot === 'ring' && (() => {
          const { col, row } = getRingSpriteInfo(item.name);
          return (
            <foreignObject x="0" y="0" width="50" height="50">
              <div style={{
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundImage: `url('/assets/min_max/rings/Rings_icons32x32_.png')`,
                  backgroundPosition: `-${col * 32}px -${row * 32}px`,
                  backgroundRepeat: 'no-repeat',
                  imageRendering: 'pixelated',
                  filter: `drop-shadow(0 0 3px ${rarityColor})`
                }} />
              </div>
            </foreignObject>
          );
        })()}
      </g>
    );
  };

  const armorColor = getGearColor(state.equippedBody, '#3f3f46');
  const bootsColor = getGearColor(state.equippedBoots, '#52525b');
  const weaponColor = getGearColor(state.equippedWeapon, '#71717a');
  const ringColor = state.equippedRing ? getGearColor(state.equippedRing, '#a855f7') : null;

  const getWeaponOffsets = (weapon: Equipment) => {
    const nameLower = (weapon.name || '').toLowerCase();
    if (nameLower.includes('staff') || nameLower.includes('wand')) {
      return { x: 53.2, y: 28.8 };
    }
    if (nameLower.includes('bow')) {
      return { x: 50, y: 32 };
    }
    if (nameLower.includes('dagger') || nameLower.includes('dirk') || nameLower.includes('knife') || nameLower.includes('shank')) {
      return { x: 50, y: 24.3 };
    }
    if (nameLower.includes('axe') || nameLower.includes('cleaver') || nameLower.includes('hammer') || nameLower.includes('mace') || nameLower.includes('maul')) {
      return { x: 53.2, y: 26.9 };
    }
    if (nameLower.includes('spear') || nameLower.includes('glaive') || nameLower.includes('halberd') || nameLower.includes('lance') || nameLower.includes('pike')) {
      return { x: 53.2, y: 28.8 };
    }
    return { x: 50, y: 23.7 };
  };

  // RENDER DYNAMIC SVG WEAPONS BASED ON TYPE/NAME
  const renderWeaponVisual = () => {
    if (!state.equippedWeapon) {
      return <circle cx="65" cy="48" r="3.5" fill="#fca5a5" stroke="#000" strokeWidth="1" />;
    }
    const name = state.equippedWeapon.name || '';
    
    // Saber / Katana / Blade
    if (name.includes('Saber') || name.includes('Katana') || name.includes('Blade')) {
      return (
        <g style={{ transform: 'rotate(-40deg)', transformOrigin: '65px 48px' }}>
          <line x1="65" y1="48" x2="88" y2="15" stroke={weaponColor} strokeWidth="2.2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${weaponColor})` }} />
          <line x1="65" y1="48" x2="88" y2="15" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />
          <rect x="63" y="47" width="4" height="2.5" fill="#d97706" />
        </g>
      );
    }
    
    // Staff / Wand
    if (name.includes('Staff') || name.includes('Wand')) {
      return (
        <g style={{ transform: 'rotate(25deg)', transformOrigin: '65px 48px' }}>
          <line x1="65" y1="48" x2="82" y2="18" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="82" cy="18" r="5" fill={weaponColor} stroke="#fff" strokeWidth="1.2" style={{ filter: `drop-shadow(0 0 6px ${weaponColor})` }} />
          <path d="M 79,15 L 85,15 M 82,12 L 82,24" stroke={weaponColor} strokeWidth="1" />
        </g>
      );
    }
    
    // Bow
    if (name.includes('Bow')) {
      return (
        <g style={{ transform: 'rotate(-15deg)', transformOrigin: '65px 48px' }}>
          <path d="M 60,35 Q 78,48 60,61" fill="none" stroke="#78350f" strokeWidth="2.5" />
          <line x1="60" y1="35" x2="60" y2="61" stroke="#e2e8f0" strokeWidth="0.8" />
          {/* Arrow */}
          <line x1="55" y1="48" x2="78" y2="48" stroke="#cbd5e1" strokeWidth="1.5" />
          <polygon points="78,46 83,48 78,50" fill={weaponColor} />
        </g>
      );
    }

    // Dagger
    if (name.includes('Dagger') || name.includes('Dirk') || name.includes('Shank') || name.includes('Knife')) {
      return (
        <g>
          {/* Main Hand Dagger */}
          <g style={{ transform: 'rotate(-25deg)', transformOrigin: '65px 48px' }}>
            <line x1="65" y1="48" x2="77" y2="30" stroke={weaponColor} strokeWidth="2" strokeLinecap="round" />
            <line x1="63" y1="46" x2="67" y2="46" stroke="#d97706" strokeWidth="1.5" />
          </g>
          {/* Off Hand Dagger */}
          <g style={{ transform: 'rotate(45deg)', transformOrigin: '27px 48px' }}>
            <line x1="27" y1="48" x2="15" y2="30" stroke={weaponColor} strokeWidth="2" strokeLinecap="round" />
            <line x1="25" y1="46" x2="29" y2="46" stroke="#d97706" strokeWidth="1.5" />
          </g>
        </g>
      );
    }

    // Heavy Warhammer / Battleaxe / Mace
    if (name.includes('Axe') || name.includes('Cleaver') || name.includes('Hammer') || name.includes('Mace') || name.includes('Maul')) {
      const isHammer = name.includes('Hammer') || name.includes('Maul') || name.includes('Mace');
      return (
        <g style={{ transform: 'rotate(-30deg)', transformOrigin: '65px 48px' }}>
          <line x1="65" y1="48" x2="80" y2="18" stroke="#451a03" strokeWidth="3" strokeLinecap="round" />
          {isHammer ? (
            // Hammer head block
            <rect x="73" y="12" width="14" height="9" rx="1.5" fill="#4b5563" stroke={weaponColor} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 4px ${weaponColor})` }} />
          ) : (
            // Axe blades
            <g>
              <path d="M 76,14 C 84,8 86,22 76,22 Z" fill="#9ca3af" stroke={weaponColor} strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 4px ${weaponColor})` }} />
              <path d="M 76,14 C 68,8 66,22 76,22 Z" fill="#9ca3af" stroke={weaponColor} strokeWidth="1.5" />
            </g>
          )}
        </g>
      );
    }

    // Spear / Halberd / Polearm
    if (name.includes('Spear') || name.includes('Glaive') || name.includes('Halberd') || name.includes('Lance') || name.includes('Pike')) {
      const isHalberd = name.includes('Halberd') || name.includes('Glaive');
      return (
        <g style={{ transform: 'rotate(-35deg)', transformOrigin: '65px 48px' }}>
          <line x1="65" y1="52" x2="88" y2="10" stroke="#78350f" strokeWidth="2" />
          {/* Spear Point */}
          <polygon points="88,10 85,3 82,10" fill="#d1d5db" stroke={weaponColor} strokeWidth="1" style={{ filter: `drop-shadow(0 0 4px ${weaponColor})` }} />
          {isHalberd && (
            // Halberd side crescent blade
            <path d="M 83,12 Q 74,15 81,18" fill="none" stroke={weaponColor} strokeWidth="2.5" />
          )}
        </g>
      );
    }

    // Default: Broadsword / Claymore
    return (
      <g style={{ transform: 'rotate(-45deg)', transformOrigin: '65px 48px' }}>
        <line x1="65" y1="48" x2="85" y2="20" stroke="#d1d5db" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="65" y1="48" x2="85" y2="20" stroke={weaponColor} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="61" y1="44" x2="71" y2="40" stroke="#b45309" strokeWidth="2.2" />
      </g>
    );
  };

  const renderArmorVisual = () => {
    if (!state.equippedBody) {
      return <rect x="35" y="32" width="20" height="28" rx="4" fill="#fca5a5" stroke="#000" strokeWidth="2" />;
    }
    const name = state.equippedBody.name || '';
    if (name.includes('Robe') || name.includes('Cloak') || name.includes('Vestments') || name.includes('Shroud')) {
      return (
        <g>
          <path d="M 33,32 L 28,60 L 62,60 L 57,32 Z" fill="#4c1d95" opacity="0.8" stroke="#000" strokeWidth="1.5" />
          <rect x="35" y="32" width="20" height="28" rx="4" fill={armorColor} stroke="#000" strokeWidth="2.5" />
          <line x1="35" y1="44" x2="55" y2="46" stroke="#fbbf24" strokeWidth="2" />
          <line x1="45" y1="45" x2="43" y2="58" stroke="#fbbf24" strokeWidth="1.5" />
        </g>
      );
    }
    if (name.includes('Plate') || name.includes('Iron') || name.includes('Vanguard') || name.includes('Bulwark') || name.includes('Mail')) {
      return (
        <g>
          <rect x="35" y="32" width="20" height="28" rx="4" fill={armorColor} stroke="#000" strokeWidth="2.5" />
          <path d="M 33,32 Q 35,26 39,32" fill="#71717a" stroke="#000" strokeWidth="2" />
          <path d="M 57,32 Q 55,26 51,32" fill="#71717a" stroke="#000" strokeWidth="2" />
          <line x1="45" y1="32" x2="45" y2="60" stroke="#d1d5db" strokeWidth="1.5" />
          <line x1="35" y1="42" x2="55" y2="42" stroke="#d1d5db" strokeWidth="1.5" />
        </g>
      );
    }
    return (
      <g>
        <rect x="35" y="32" width="20" height="28" rx="4" fill={armorColor} stroke="#000" strokeWidth="2.5" />
        <line x1="35" y1="34" x2="55" y2="58" stroke="#27272a" strokeWidth="2" />
        <line x1="55" y1="34" x2="35" y2="58" stroke="#27272a" strokeWidth="2" />
        <circle cx="45" cy="46" r="4.5" fill="var(--neon-cyan)" stroke="#000" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 4px var(--neon-cyan))' }} />
      </g>
    );
  };

  const renderHelmetVisual = () => {
    if (!state.equippedBody) {
      return <circle cx="45" cy="22" r="10" fill="#fca5a5" stroke="#000" strokeWidth="2" />;
    }
    const name = state.equippedBody.name || '';
    if (name.includes('Robe') || name.includes('Shroud') || name.includes('Vestments')) {
      return (
        <g>
          <path d="M 33,28 Q 45,8 57,28 Z" fill="#4c1d95" stroke="#000" strokeWidth="2" />
          <circle cx="45" cy="22" r="8" fill="#fca5a5" />
          <path d="M 35,26 Q 45,18 55,26 Z" fill="#000" />
          <circle cx="41" cy="23" r="1.5" fill="var(--neon-cyan)" style={{ filter: 'drop-shadow(0 0 2px var(--neon-cyan))' }} />
          <circle cx="49" cy="23" r="1.5" fill="var(--neon-cyan)" style={{ filter: 'drop-shadow(0 0 2px var(--neon-cyan))' }} />
        </g>
      );
    }
    if (name.includes('Plate') || name.includes('Iron') || name.includes('Vanguard') || name.includes('Mail')) {
      return (
        <g>
          <circle cx="45" cy="22" r="10" fill={armorColor} stroke="#000" strokeWidth="2.5" />
          <path d="M 45,12 Q 35,3 41,1 Q 45,3 45,12" fill="#ef4444" />
          <path d="M 39,22 H 51 V 24 H 46 V 32 H 44 V 24 H 39 Z" fill="#1f2937" />
          <line x1="41" y1="23" x2="49" y2="23" stroke="#fbbf24" strokeWidth="1.5" />
        </g>
      );
    }
    return (
      <g>
        <circle cx="45" cy="22" r="10" fill={armorColor} stroke="#000" strokeWidth="2.5" />
        <rect x="37" y="18" width="16" height="5" rx="1.5" fill="var(--neon-pink)" stroke="#000" strokeWidth="1" style={{ filter: 'drop-shadow(0 0 4px var(--neon-pink))' }} />
        <line x1="39" y1="20" x2="51" y2="20" stroke="#fff" strokeWidth="1" />
      </g>
    );
  };

  const renderBootsVisual = () => {
    if (!state.equippedBoots) {
      return (
        <g>
          <rect x="34" y="60" width="8" height="8" rx="1" fill="#fca5a5" stroke="#000" strokeWidth="2" />
          <rect x="48" y="60" width="8" height="8" rx="1" fill="#fca5a5" stroke="#000" strokeWidth="2" />
        </g>
      );
    }
    const name = state.equippedBoots.name || '';
    if (name.includes('Greaves') || name.includes('Treads') || name.includes('Swift') || name.includes('Speed')) {
      return (
        <g>
          <rect x="34" y="60" width="8" height="8" rx="1" fill={bootsColor} stroke="#000" strokeWidth="2" />
          <path d="M 33,62 L 28,59 L 32,66 Z" fill="#fff" stroke="#000" strokeWidth="1" />
          <rect x="48" y="60" width="8" height="8" rx="1" fill={bootsColor} stroke="#000" strokeWidth="2" />
          <path d="M 57,62 L 62,59 L 58,66 Z" fill="#fff" stroke="#000" strokeWidth="1" />
        </g>
      );
    }
    return (
      <g>
        <rect x="34" y="60" width="8" height="8" rx="1" fill={bootsColor} stroke="#000" strokeWidth="2" />
        <circle cx="34" cy="65" r="2.2" fill="var(--neon-pink)" style={{ filter: 'drop-shadow(0 0 3px var(--neon-pink))' }} />
        <rect x="48" y="60" width="8" height="8" rx="1" fill={bootsColor} stroke="#000" strokeWidth="2" />
        <circle cx="56" cy="65" r="2.2" fill="var(--neon-pink)" style={{ filter: 'drop-shadow(0 0 3px var(--neon-pink))' }} />
      </g>
    );
  };

  // ENEMY CATEGORIZED STYLING BY NAME
  const renderEnemyVisual = (enemy: RpgEnemy) => {
    const name = enemy.name || '';
    const isBoss = enemy.isBoss;

    let body = null;
    if (name.includes('Golem') || name.includes('Sentinel') || name.includes('Stone')) {
      // Mines Rock / Golem theme
      body = (
        <g>
          <rect x="25" y="25" width="40" height="40" rx="3" fill="#4b5563" stroke="#fff" strokeWidth="2" />
          <line x1="25" y1="35" x2="65" y2="55" stroke="var(--neon-cyan)" strokeWidth="2" />
          <line x1="45" y1="25" x2="35" y2="65" stroke="var(--neon-cyan)" strokeWidth="1.5" />
          <rect x="33" y="32" width="6" height="6" fill="var(--neon-cyan)" style={{ filter: 'drop-shadow(0 0 3px var(--neon-cyan))' }} />
          <rect x="51" y="32" width="6" height="6" fill="var(--neon-cyan)" style={{ filter: 'drop-shadow(0 0 3px var(--neon-cyan))' }} />
        </g>
      );
    } else if (name.includes('Bear') || name.includes('Wolf') || name.includes('Beast') || name.includes('Boar')) {
      // Forest Beast theme
      body = (
        <g>
          <path d="M 25,48 L 45,26 L 65,48 L 52,65 L 38,65 Z" fill="#b91c1c" stroke="#fff" strokeWidth="2" />
          <polygon points="45,24 35,42 55,42" fill="#15803d" />
          <circle cx="38" cy="38" r="2.5" fill="#fff" />
          <circle cx="52" cy="38" r="2.5" fill="#fff" />
          <path d="M 33,48 L 36,54 L 39,48 L 42,54 L 45,48 L 48,54 L 51,48 L 54,54 L 57,48" fill="none" stroke="#fff" strokeWidth="1.5" />
        </g>
      );
    } else if (name.includes('Shadow') || name.includes('Specter') || name.includes('Stalker') || name.includes('Ghost')) {
      // Crypt shadowy wraith theme
      body = (
        <g>
          <path d="M 45,15 C 25,15 25,55 30,75 C 38,70 42,75 45,70 C 48,75 52,70 60,75 C 65,55 65,15 45,15 Z" fill="#1e1b4b" stroke="#a78bfa" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 6px #1e1b4b)' }} />
          <circle cx="38" cy="32" r="3" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />
          <circle cx="52" cy="32" r="3" fill="#ef4444" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />
        </g>
      );
    } else if (name.includes('Void') || name.includes('Abyss') || name.includes('Horror') || name.includes('Eye')) {
      // Void magical horror theme
      body = (
        <g>
          <circle cx="45" cy="45" r="21" fill="#3b0764" stroke="#a855f7" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 7px #a855f7)' }} />
          <circle cx="45" cy="45" r="10" fill="#fff" />
          <circle cx="45" cy="45" r="5" fill="#f43f5e" />
          <path d="M 45,23 L 45,6 M 45,67 L 45,84 M 23,45 L 6,45 M 67,45 L 84,45" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 29,29 L 16,16 M 61,61 L 74,74 M 29,61 L 16,74 M 61,29 L 74,16" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    } else if (name.includes('Cyber') || name.includes('Drone') || name.includes('Mech') || name.includes('Sentinel')) {
      // Cyber futuristic robot theme
      body = (
        <g>
          <polygon points="45,15 70,35 60,70 30,70 20,35" fill="#64748b" stroke="#e2e8f0" strokeWidth="2" />
          <line x1="20" y1="35" x2="70" y2="35" stroke="#e2e8f0" strokeWidth="1" />
          <rect x="30" y="42" width="30" height="6.5" fill="#eab308" style={{ filter: 'drop-shadow(0 0 4px #eab308)' }} />
        </g>
      );
    } else {
      // Default Portal Matrix core shape
      body = (
        <g>
          <polygon points="45,15 75,45 45,75 15,45" fill="#881337" stroke="#ef4444" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 5px #ef4444)' }} />
          <circle cx="45" cy="45" r="11" fill="#000" stroke="#ef4444" strokeWidth="1.5" />
          <circle cx="45" cy="45" r="4" fill="#ef4444" />
        </g>
      );
    }

    return (
      <svg width="90" height="90" viewBox="0 0 90 90" style={{ overflow: 'visible' }}>
        {body}
        {isBoss && (
          // Shiny golden boss crown overlay
          <polygon points="34,14 38,6 45,13 52,6 56,14" fill="#fbbf24" stroke="#000" strokeWidth="1.2" style={{ filter: 'drop-shadow(0 0 3px #fbbf24)' }} />
        )}
      </svg>
    );
  };

  return (
    <div className="terminal-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Mobile Currency Bar */}
      {isMobile && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.4rem',
          background: '#000',
          border: '3px solid #000',
          color: '#fff',
          padding: '0.3rem',
          fontSize: '0.75rem',
          fontFamily: 'monospace',
          fontWeight: 'black'
        }}>
          <div style={{ background: '#fffbeb', border: '1px solid #000', padding: '0.2rem 0.4rem', textAlign: 'center', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <span>💰 {state.gold.toLocaleString()}g</span>
          </div>
          <div style={{ background: '#f5f3ff', border: '1px solid #000', padding: '0.2rem 0.4rem', textAlign: 'center', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <span>💎 {state.reforgeShards}</span>
          </div>
        </div>
      )}


      {/* 1. INFINITE STAGE CLIMBER CONTROL MODULE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <SwordIcon size={12} /> Infinite Progression Climber
          </span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={toggleAutoAdvance}
              style={{ width: '16px', height: '16px', border: '2px solid #000', cursor: 'pointer' }}
            />
            AUTO ADVANCE
          </label>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem', alignItems: 'center' }}>
          <button
            onClick={() => selectStage('infinite', Math.max(1, activeStageId - 10))}
            disabled={activeStageId <= 1}
            className="game-btn"
            style={{ padding: '0.6rem 0.2rem', fontSize: '0.75rem', fontWeight: 'bold', border: '2px solid #000', background: '#fff', opacity: activeStageId <= 1 ? 0.5 : 1 }}
          >
            ⏮️ -10
          </button>
          
          <button
            onClick={() => selectStage('infinite', Math.max(1, activeStageId - 1))}
            disabled={activeStageId <= 1}
            className="game-btn"
            style={{ padding: '0.6rem 0.2rem', fontSize: '0.75rem', fontWeight: 'bold', border: '2px solid #000', background: '#fff', opacity: activeStageId <= 1 ? 0.5 : 1 }}
          >
            ◀️ -1
          </button>

          <div style={{ border: '3px solid #000', padding: '0.5rem 0.2rem', background: 'var(--neon-cyan)', textAlign: 'center', fontWeight: 'bold' }}>
            <span style={{ fontSize: '0.6rem', display: 'block', color: '#333' }}>STAGE</span>
            <span style={{ fontSize: '1.1rem', fontFamily: 'monospace' }}>{activeStageId}</span>
          </div>

          <button
            onClick={() => selectStage('infinite', Math.min(state.maxUnlockedStage, activeStageId + 1))}
            disabled={activeStageId >= state.maxUnlockedStage}
            className="game-btn"
            style={{ padding: '0.6rem 0.2rem', fontSize: '0.75rem', fontWeight: 'bold', border: '2px solid #000', background: '#fff', opacity: activeStageId >= state.maxUnlockedStage ? 0.5 : 1 }}
          >
            +1 ▶️
          </button>

          <button
            onClick={() => selectStage('infinite', Math.min(state.maxUnlockedStage, activeStageId + 10))}
            disabled={activeStageId >= state.maxUnlockedStage}
            className="game-btn"
            style={{ padding: '0.6rem 0.2rem', fontSize: '0.75rem', fontWeight: 'bold', border: '2px solid #000', background: '#fff', opacity: activeStageId >= state.maxUnlockedStage ? 0.5 : 1 }}
          >
            +10 ⏭️
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.2rem 0.5rem', background: '#fafafa', border: '2px solid #000' }}>
          <span>Highest Stage Cleared: <strong style={{ color: '#047857' }}>Stage {state.maxUnlockedStage - 1}</strong></span>
          <span>Highest Unlocked: <strong style={{ color: 'var(--neon-pink)' }}>Stage {state.maxUnlockedStage}</strong></span>
        </div>
      </div>

      {/* 3. COMBAT CLASH SCREEN */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '0.6rem' : '1.2rem', padding: '1rem', border: '3px solid #000', background: '#080313', color: '#fff', position: 'relative' }}>
        {/* HERO COMBAT STATUS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
            <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <ShieldIcon size={12} color="#fff" /> Valiant Crusader
            </span>
            <span style={{ color: '#a78bfa' }}>Lvl {level}</span>
          </div>
          <div style={{ height: '20px', background: '#1e1b4b', border: '2px solid #fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ width: `${hpPercent}%`, height: '100%', background: '#ef4444', transition: 'width 0.1s ease' }} />
            <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#fff', textShadow: '1px 1px #000' }}>
              {Math.floor(heroHp)} / {heroStats.maxHp} HP
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: '#aaa', fontFamily: 'monospace' }}>
            <span>Atk: {heroStats.attack}</span>
            <span>Def: {heroStats.defense}</span>
            <span>Regen: +{heroStats.regenHp}/s</span>
          </div>
        </div>

        {/* ENEMY COMBAT STATUS */}
        {activeEnemy ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold' }}>
              <span style={{ color: activeEnemy.isBoss ? 'var(--neon-pink)' : '#06ffa1' }}>
                {activeEnemy.isBoss ? '💀 ' : '👾 '}{activeEnemy.name}
              </span>
              <span style={{ color: '#aaa' }}>{activeEnemy.isBoss ? 'BOSS' : 'NORMAL'}</span>
            </div>
            <div style={{ height: '20px', background: '#1e1b4b', border: '2px solid #fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: `${enemyHpPercent}%`, height: '100%', background: '#06ffa1', transition: 'width 0.1s ease' }} />
              <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#000', textShadow: '0 0 2px #fff' }}>
                {activeEnemy.hp} / {activeEnemy.maxHp} HP
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: '#aaa', fontFamily: 'monospace' }}>
              <span>Atk: {activeEnemy.attack}</span>
              <span>Def: {activeEnemy.defense}</span>
              <span>Absorb: {(activeEnemy.absorb * 100).toFixed(0)}%</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #444', height: '60px', color: '#888', fontSize: '0.8rem' }}>
            SCANNING FOR MATRIX THREATS...
          </div>
        )}
      </div>

      {/* 4. ARENA / LOGS TOGGLE CONTROL HEADER */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <LevelIcon size={12} /> Combat Core Hub
          </span>
          {/* TAB SEGMENTS TOGGLE */}
          <div style={{ display: 'flex', border: '2px solid #000', borderRadius: '4px', overflow: 'hidden' }}>
            <button
              onClick={() => setBattleTab('arena')}
              style={{
                border: 'none',
                padding: '2px 8px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                background: battleTab === 'arena' ? 'var(--neon-cyan)' : '#f3f4f6',
                color: '#000',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              🎭 ARENA
            </button>
            <button
              onClick={() => setBattleTab('logs')}
              style={{
                border: 'none',
                padding: '2px 8px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                background: battleTab === 'logs' ? 'var(--neon-cyan)' : '#f3f4f6',
                color: '#000',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              📜 LOGS
            </button>
            <button
              onClick={() => setBattleTab('character')}
              style={{
                border: 'none',
                padding: '2px 8px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                background: battleTab === 'character' ? 'var(--neon-cyan)' : '#f3f4f6',
                color: '#000',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              👤 CHARACTER
            </button>
          </div>
        </div>

        {/* TOGGLE CONTENTS CONTAINER */}
        {battleTab === 'logs' ? (
          /* TEXT LOGS VIEW */
          <div style={{ flex: 1, background: '#000', color: '#f8fafc', padding: '0.6rem', border: '3px solid #000', overflowY: 'auto', maxHeight: '180px', minHeight: '180px', fontFamily: 'monospace', fontSize: '0.7rem', display: 'flex', flexDirection: 'column-reverse', gap: '2px' }}>
            {combatLogs.slice().reverse().map((log, idx) => {
              const isCrit = log.includes('CRIT');
              const isHeroHit = log.includes('strikes Hero') || log.includes('DEFEATED');
              const isEvade = log.includes('Evaded');

              let color = '#fff';
              if (isCrit) color = 'var(--neon-yellow)';
              else if (isHeroHit) color = '#f87171';
              else if (isEvade) color = 'var(--neon-cyan)';
              else if (log.includes('Banished') || log.includes('Loot')) color = '#4ade80';

              return (
                <div key={idx} style={{ color, borderBottom: '1px solid #111', paddingBottom: '2px' }}>
                  {log}
                </div>
              );
            })}
          </div>
        ) : battleTab === 'character' ? (
          /* CHARACTER CUSTOMIZATION VIEW */
          <div style={{ flex: 1, background: state.darkMode ? '#121214' : '#f4f4f5', border: '3px solid #000', padding: '0.5rem', overflowY: 'auto', minHeight: '260px' }}>
            <CharacterCreator state={state} onUpdateCharacter={onUpdateCharacter || (() => {})} />
          </div>
        ) : (
          /* ANIMATED 2D COMBAT ARENA VIEW */
          <div style={{
            position: 'relative',
            height: '220px',
            background: state.darkMode ? '#09090b' : '#111827',
            border: '3px solid #000',
            overflow: 'visible',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2.5rem',
            backgroundImage: state.darkMode 
              ? 'radial-gradient(circle at 50% 50%, #1e1e28 0%, #09090b 100%)' 
              : 'radial-gradient(circle at 50% 50%, #1f2937 0%, #111827 100%)'
          }}>
            
            {/* STAGE DESCRIPTION SIGNBOARD */}
            <div style={{
              position: 'absolute',
              top: '5px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '2px 8px',
              background: 'rgba(0, 0, 0, 0.85)',
              border: '1.5px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              fontSize: '0.55rem',
              fontWeight: 'bold',
              letterSpacing: '1px',
              fontFamily: 'monospace',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.8)'
            }}>
              ARENA CLASH // STAGE {activeStageId}
            </div>

            {/* PLAYER AVATAR CONTAINER */}
            <div 
              key={`player-anim-${attackTriggerId}`}
              style={{
                position: 'relative',
                width: '260px',
                height: '210px',
                overflow: 'visible',
                animation: playerAttacking 
                  ? `playerLungeAttack ${Number((0.60 / Math.max(0.5, heroStats.atkSpeed || 1.0)).toFixed(3))}s cubic-bezier(0.25, 0.8, 0.25, 1.2)` 
                  : 'playerIdle 2s ease-in-out infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: playerSlashed ? 'brightness(1.8) drop-shadow(0 0 10px rgba(239, 68, 68, 0.9))' : undefined,
                zIndex: 10
              }}
            >
              <LpcCharacterCanvas
                config={state.lpcCharacter}
                equippedWeapon={state.equippedWeapon}
                hideWeapon={false}
                hideArmor={false}
                action="slash"
                width={260}
                height={210}
                marginRatio={0.18}
                direction="east"
                frame={[1, 2, 3, 4, 5, 4, 3, 2][spriteFrame % 8]}
                style={{ overflow: 'visible' }}
              />
              {playerSlashed && <div className="arena-slash-overlay-player" />}
            </div>

            {/* VS CENTER LOGO GRAPHIC */}
            <div style={{
              fontSize: '1rem',
              fontWeight: 'black',
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.15)',
              fontFamily: 'monospace'
            }}>
              VS
            </div>

            {/* ENEMY AVATAR CONTAINER */}
            <div
              key={`${activeEnemy?.name || 'none'}-${enemyAttackTriggerId}`}
              style={{
                position: 'relative',
                width: '90px',
                height: '90px',
                animation: enemyDying
                  ? 'enemyDeathAnim 0.3s ease-in forwards'
                  : (enemyAttacking ? 'enemyLungeAttack 0.3s cubic-bezier(0.25, 0.8, 0.25, 1.2)' : 'enemyIdle 2.5s ease-in-out infinite'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: enemySlashed ? 'brightness(1.8) drop-shadow(0 0 12px rgba(255, 0, 80, 0.9))' : undefined
              }}
            >
              {activeEnemy?.sprite ? (
                <img
                  src={activeEnemy.sprite}
                  alt={activeEnemy.name}
                  style={{
                    width: '85px',
                    height: '85px',
                    objectFit: 'contain',
                    filter: enemySlashed
                      ? 'brightness(2) drop-shadow(0 0 12px rgba(255, 0, 80, 0.9))'
                      : (activeEnemy.isBoss
                        ? 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.95)) drop-shadow(0 0 20px rgba(220, 38, 38, 0.6))'
                        : 'drop-shadow(0 0 8px rgba(255, 0, 80, 0.6))'),
                    imageRendering: 'pixelated'
                  }}
                />
              ) : (
                <div style={{ fontSize: '3rem' }}>
                  {activeEnemy?.isBoss ? '💀' : '👾'}
                </div>
              )}
              {enemySlashed && <div className="arena-slash-overlay-enemy" />}
            </div>

            {/* FLOAT DAMAGE NUMBERS LAYER */}
            {damageNumbers.map(n => (
              <div
                key={n.id}
                style={{
                  position: 'absolute',
                  left: n.isPlayer ? '70px' : 'calc(100% - 130px)',
                  top: '65px',
                  color: n.isCrit ? 'var(--neon-yellow)' : '#fff',
                  fontFamily: 'monospace',
                  fontSize: n.isCrit ? '0.9rem' : '0.75rem',
                  fontWeight: 'bold',
                  textShadow: '0 0 6px #000, 1px 1px 1px #000',
                  animation: 'floatingDamage 0.8s ease-out forwards',
                  pointerEvents: 'none',
                  zIndex: 20
                }}
              >
                {n.text}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. PRESTIGE ASCENSION BUTTON */}
      {maxUnlockedStage > 50 ? (
        <div style={{ background: '#f5f3ff', border: '3px solid #000', padding: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#6d28d9' }}>
              <AscensionIcon size={16} color="#6d28d9" /> Matrix Ascension Ready
            </strong>
            <span style={{ fontSize: '0.65rem', color: '#666' }}>Reset level/gold progress to claim permanent stats multipliers.</span>
          </div>
          <button
            onClick={ascendHero}
            className="game-btn"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              background: '#8b5cf6',
              color: '#fff',
              fontWeight: 'bold',
              border: '2px solid #000',
              cursor: 'pointer',
              textShadow: 'none'
            }}
          >
            Ascend (+{maxUnlockedStage - 50} Crystals)
          </button>
        </div>
      ) : (
        <div style={{ background: '#fcfcfc', border: '2px dashed #ccc', padding: '0.6rem', textAlign: 'center', fontSize: '0.7rem', color: '#999' }}>
          Complete Stage 50 to unlock permanent Ascension Prestige. (Progress: Stage {maxUnlockedStage}/50)
        </div>
      )}
    </div>
  );
};
export default BattleConsole;
