import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

// 💎 Sci-Fi Geometric Cosmic Crystal representing Prestige Crystals / Ascension Crystals
export const CrystalIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M12 2 L2 12 L12 22 L22 12 Z" fill={color} fillOpacity="0.2" />
    <path d="M12 2 L7 12 L12 22 L17 12 Z" fill={color} fillOpacity="0.1" />
    <path d="M2 12 H22" />
  </svg>
);

// 🏛️ Quantum Portal Merchant Gateway representing the Prestige Shop
export const ShopIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" fill={color} fillOpacity="0.1" />
    <path d="M3 9l3-4h12l3 4" />
    <path d="M12 12l2 3-2 3-2-3z" fill={color} fillOpacity="0.3" strokeWidth="1.5" />
  </svg>
);

// 🚀 Quantum Ascension Arrow / Energy Lift representing Matrix Ascension Ready
export const AscensionIcon: React.FC<IconProps> = ({
  size = 18,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M12 21V3M12 3l-7 7M12 3l7 7" />
    <path d="M2 21h20M5 16h14" strokeWidth="1.5" strokeOpacity="0.6" />
  </svg>
);

// 🗡️ Geometric Sword representing Attack Power / Damage / Combat
export const SwordIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l-2-2" />
    <path d="M19 13l-2-2" />
    <path d="M19 5l-2.5 2.5" />
    <path d="M5 19l-2 2 1-1Z" fill={color} fillOpacity="0.3" />
  </svg>
);

// 🛡️ Faceted Shield representing Defense Rating / Armor
export const ShieldIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color} fillOpacity="0.2" />
    <path d="M12 2v20M12 22s4-3 6-8H6c2 5 6 8 6 8z" fill={color} fillOpacity="0.1" strokeWidth="1" />
  </svg>
);

// ❤️ Faceted Heart representing HP / Vitality / Health pool
export const HeartIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} fillOpacity="0.2" />
    <path d="M12 5.67v15.56" strokeOpacity="0.4" />
  </svg>
);

// 🎯 Concentric Crosshair representing Critical Rate / Accuracy
export const TargetIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <circle cx="12" cy="12" r="10" fill={color} fillOpacity="0.1" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1" fill={color} />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);

// 💥 Geometric Starburst representing Critical Damage multiplier
export const CritDmgIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M12 2l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill={color} fillOpacity="0.2" />
    <path d="M19 5l-2.2 2.2M5 19l-2.2 2.2M19 19l-2.2-2.2M5 5l2.2 2.2" />
  </svg>
);

// ⚡ Geometric Lightning Bolt representing Attack Speed modifier
export const ZapIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color} fillOpacity="0.2" />
  </svg>
);

// 🏹 Piercing arrow representing Armor Penetration / Defense Bypass
export const PenetrationIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M5 12h14M14 7l5 5-5 5" />
    <path d="M10 3v18" strokeDasharray="3 3" />
  </svg>
);

// 💨 Wind swoosh lines representing Evade / Dodge trigger chance
export const WindIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M2 8h15a3 3 0 0 1 0 6H15M2 12h11a3 3 0 0 1 0 6H11M2 16h7" />
  </svg>
);

// 🩸 Geometric Blood Teardrop representing Vampiric Life Steal %
export const BloodIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M12 2C12 2 6 9 6 14A6 6 0 0 0 18 14C18 9 12 2 12 2Z" fill={color} fillOpacity="0.25" />
    <path d="M12 3v16" strokeOpacity="0.3" strokeWidth="1" />
  </svg>
);

// ➕ Diamond Recovery Cross representing Health Regeneration per second
export const RegenIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M12 2 L22 12 L12 22 L2 12 Z" fill={color} fillOpacity="0.15" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

// 🪙 Hexagonal Faceted Gold Coin representing Gold balance / Gold Booster
export const GoldIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" fill={color} fillOpacity="0.2" />
    <circle cx="12" cy="12" r="5" fill={color} fillOpacity="0.1" />
    <path d="M12 8v8M9 10h5M9 14h5" />
  </svg>
);

// 💎 Sharp Geometric Gem representing Reforge Shards balance
export const ShardIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M12 3 L17 12 L12 21 L7 12 Z" fill={color} fillOpacity="0.2" />
    <path d="M12 3v18" strokeWidth="1" strokeOpacity="0.4" />
  </svg>
);

// ⭐ Faceted Star representing Talent Nodes / Talent Points
export const StarIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={color} fillOpacity="0.2" />
  </svg>
);

// ⚙️ Technical Gear Sprocket representing Settings tab
export const GearIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.2" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

// 🎒 Geometric Briefcase outline representing Loot Backpack
export const BagIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <rect x="3" y="7" width="18" height="13" rx="2" ry="2" fill={color} fillOpacity="0.1" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

// ♻️ Geometric Recycle loops representing Scrapping actions
export const RecycleIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);

// 📈 Ascending Level bar chart representing Level / EXP Booster / Growth progress
export const LevelIcon: React.FC<IconProps> = ({
  size = 16,
  color = 'currentColor',
  style
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
  >
    <path d="M18 20V10M12 20V4M6 20v-6" strokeWidth="2.5" />
    <path d="M3 20h18" strokeWidth="2" />
  </svg>
);

// ⚔️ Official MIN-MAXXED Game Logo (Crossed Neon Swords on Dark Shield)
export const GameLogoIcon: React.FC<IconProps> = ({
  size = 32,
  style
}) => (
  <div className="game-logo-container" style={style}>
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ display: 'block' }}>
      <rect width="64" height="64" rx="14" fill="#080313"/>
      <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#a855f7" strokeWidth="2"/>
      <polygon points="32,8 52,16 52,38 32,54 12,38 12,16" fill="#180b2d" stroke="#06ffa1" strokeWidth="2.5"/>
      <polygon points="32,13 46,19 46,36 32,48 18,36 18,19" fill="#2e1065" stroke="#38bdf8" strokeWidth="1.5"/>
      <line x1="16" y1="46" x2="48" y2="14" stroke="#06ffa1" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="16" y1="46" x2="48" y2="14" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="18" y1="40" x2="24" y2="46" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <line x1="48" y1="46" x2="16" y2="14" stroke="#ec4899" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="48" y1="46" x2="16" y2="14" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="46" y1="40" x2="40" y2="46" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <polygon points="32,24 38,30 32,36 26,30" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" className="gem-pulse" />
    </svg>
  </div>
);
