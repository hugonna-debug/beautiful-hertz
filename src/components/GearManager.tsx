import React, { useState } from 'react';
import { GameState, Equipment, EquipmentSlot, ItemSubstat, SubstatType } from '../types/game';
import { SUBSTAT_RANGES } from '../hooks/useGameState';
import { getRingSpriteInfo } from '../utils/ringCatalog';
import { BODY_ARMOR_MAP, BOOTS_MAP, BODY_ARMOR_SPRITES, BOOTS_SPRITES, WEAPON_SPRITES } from '../data/minMaxLookup';
import {
  SwordIcon,
  ShieldIcon,
  HeartIcon,
  TargetIcon,
  GearIcon,
  GoldIcon,
  ShardIcon,
  BagIcon,
  RecycleIcon,
  StarIcon
} from './Icons';

interface GearManagerProps {
  state: GameState;
  equipLoot: (id: string) => void;
  scrapLoot: (id: string) => void;
  enhanceGear: (slot: EquipmentSlot) => void;
  upgradeSubstat: (slot: EquipmentSlot, idx: number) => void;
  toggleSubstatLock: (slot: EquipmentSlot, idx: number) => void;
  reforgeSubstats: (slot: EquipmentSlot) => void;
  scrapAllLoot: (slot: EquipmentSlot) => void;
  toggleGearLock: (id: string) => void;
  buyTempBagSlot: () => void;
  isMobile?: boolean;
}

const SUBSTAT_NAMES: Record<SubstatType, string> = {
  flat_hp: 'Flat HP',
  flat_def: 'Flat DEF',
  percent_atk: 'Attack %',
  percent_def: 'Defense %',
  percent_hp: 'HP %',
  crit_rate: 'Crit Chance %',
  crit_dmg: 'Crit Damage %',
  atk_speed: 'Attack Speed %',
  armor_pen: 'Armor Penetration %',
  evade_rate: 'Evasion %',
  life_steal: 'Life Steal %',
  regen_hp: 'HP Regen/sec'
};

const getSubstatMobileName = (type: SubstatType) => {
  const shortNames: Record<SubstatType, string> = {
    flat_hp: 'HP',
    flat_def: 'DEF',
    percent_atk: 'ATK%',
    percent_def: 'DEF%',
    percent_hp: 'HP%',
    crit_rate: 'Crit%',
    crit_dmg: 'CritDmg',
    atk_speed: 'AtkSpd',
    armor_pen: 'Pen%',
    evade_rate: 'Evade%',
    life_steal: 'Vamp%',
    regen_hp: 'Regen/s'
  };
  return shortNames[type];
};

export const GearManager: React.FC<GearManagerProps> = ({
  state,
  equipLoot,
  scrapLoot,
  enhanceGear,
  upgradeSubstat,
  toggleSubstatLock,
  reforgeSubstats,
  scrapAllLoot,
  toggleGearLock,
  buyTempBagSlot,
  isMobile = false
}) => {
  const { equippedWeapon, equippedBody, equippedBoots, equippedRing, lootBackpack, gold, reforgeShards } = state;
  const [selectedLoot, setSelectedLoot] = useState<Equipment | null>(null);
  const [activeSlotTab, setActiveSlotTab] = useState<EquipmentSlot>('weapon');
  const [sortBy, setSortBy] = useState<'newest' | 'level' | 'enhance' | 'rarity' | 'substats'>('newest');
  const [showScrapConfirm, setShowScrapConfirm] = useState(false);

  const getSortedBackpack = () => {
    const filtered = lootBackpack.filter(item => item.slot === activeSlotTab);
    return [...filtered].sort((a, b) => {
      if (sortBy === 'level') {
        return (b.itemLevel || 0) - (a.itemLevel || 0);
      }
      if (sortBy === 'enhance') {
        return (b.enhanceLevel || 0) - (a.enhanceLevel || 0);
      }
      if (sortBy === 'rarity') {
        const rarityWeights = { legendary: 4, epic: 3, rare: 2, common: 1 };
        const weightA = rarityWeights[a.rarity || 'common'] || 1;
        const weightB = rarityWeights[b.rarity || 'common'] || 1;
        return weightB - weightA;
      }
      if (sortBy === 'substats') {
        const rarityWeights = { legendary: 4, epic: 3, rare: 2, common: 1 };
        const sumA = a.substats.reduce((acc, sub) => acc + (rarityWeights[sub.rarity || 'common'] || 1), 0);
        const sumB = b.substats.reduce((acc, sub) => acc + (rarityWeights[sub.rarity || 'common'] || 1), 0);
        return sumB - sumA;
      }
      return (b.acquiredAt || 0) - (a.acquiredAt || 0);
    });
  };

  const getEquippedInSlot = (slot: EquipmentSlot): Equipment | null => {
    if (slot === 'weapon') return equippedWeapon;
    if (slot === 'body') return equippedBody;
    if (slot === 'boots') return equippedBoots;
    return equippedRing;
  };

  const activeEquipped = getEquippedInSlot(activeSlotTab);

  // Math-heavy set bonuses info
  const setBonuses = [
    { name: 'Warlord Set', count: 0, b2: '+20% Critical Damage', b4: '+15% Attack Speed' },
    { name: 'Synthesizer Set', count: 0, b2: '+15% Armor Penetration', b4: '+8% Evasion Rate' },
    { name: 'Cosmic Set', count: 0, b2: '+8% Vampiric Lifesteal', b4: '+15% Damage Absorption' }
  ];

  // Scan counts
  const equippedList = [equippedWeapon, equippedBody, equippedBoots, equippedRing].filter(Boolean) as Equipment[];
  equippedList.forEach(eq => {
    if (eq.setName) {
      const target = setBonuses.find(s => s.name === eq.setName);
      if (target) target.count += 1;
    }
  });

  const getFormatValue = (sub: ItemSubstat) => {
    const isPercent = sub.type !== 'flat_hp' && sub.type !== 'flat_def' && sub.type !== 'regen_hp';
    const lvl = sub.level || 0;
    const scaleFactor = 1 + lvl * 0.15;
    const finalVal = sub.value * scaleFactor;
    if (isPercent) {
      return `+${(finalVal * 100).toFixed(1)}%`;
    }
    return `+${Math.floor(finalVal)}`;
  };

  const getSlotIcon = (slot: EquipmentSlot, size = 12, style?: React.CSSProperties) => {
    switch (slot) {
      case 'weapon': return <SwordIcon size={size} style={style} />;
      case 'body': return <ShieldIcon size={size} style={style} />;
      case 'boots': return <HeartIcon size={size} style={style} />;
      case 'ring': return <TargetIcon size={size} style={style} />;
      default: return null;
    }
  };

  const renderEquipmentSprite = (item: Equipment, size = 42) => {
    const rarityColor = getRarityStyle(item.rarity).color;
    const nameLower = item.name.toLowerCase();
    const isSet = !!item.setName;

    // Resolve sprite URL from item property or minMaxLookup maps
    let spriteUrl: string | undefined = (item as any).sprite;
    const cleanId = item.id.toLowerCase();

    if (!spriteUrl) {
      if (item.slot === 'body') {
        spriteUrl = BODY_ARMOR_MAP[cleanId];
        if (!spriteUrl && BODY_ARMOR_SPRITES.length > 0) {
          const hash = Math.abs(item.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
          spriteUrl = BODY_ARMOR_SPRITES[hash % BODY_ARMOR_SPRITES.length];
        }
      } else if (item.slot === 'boots') {
        spriteUrl = BOOTS_MAP[cleanId];
        if (!spriteUrl && BOOTS_SPRITES.length > 0) {
          const hash = Math.abs(item.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
          spriteUrl = BOOTS_SPRITES[hash % BOOTS_SPRITES.length];
        }
      } else if (item.slot === 'weapon' && WEAPON_SPRITES.length > 0) {
        const hash = Math.abs(item.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0));
        spriteUrl = WEAPON_SPRITES[hash % WEAPON_SPRITES.length];
      }
    }

    if (spriteUrl) {
      return (
        <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src={spriteUrl}
            alt={item.name}
            style={{
              width: `${size * 0.9}px`,
              height: `${size * 0.9}px`,
              objectFit: 'contain',
              imageRendering: 'pixelated',
              filter: `drop-shadow(0 0 3px ${rarityColor})`
            }}
          />
        </div>
      );
    }

    // Glowing filter definition to give weapons/armor that cyber pop
    const filterId = `glow-${item.id}-${size}`;

    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 50 50" 
        style={{ overflow: 'visible', filter: `drop-shadow(0 0 2px ${rarityColor})` }}
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Aura Ring base for Rare/Epic/Legendary */}
        {item.rarity !== 'common' && (
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
      </svg>
    );
  };

  const getBaseValueLabel = (item: Equipment) => {
    const multiplier = 1 + item.enhanceLevel * 0.15;
    const finalVal = item.baseValue * multiplier;
    const icon = getSlotIcon(item.slot, 14, { marginRight: '5px' });
    
    if (item.slot === 'weapon') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', textShadow: 'none' }}>
          {icon} +{Math.floor(finalVal)} Attack (Base: {item.baseValue} +{item.enhanceLevel * 15}%)
        </span>
      );
    }
    if (item.slot === 'body') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', textShadow: 'none' }}>
          {icon} +{Math.floor(finalVal)} Defense (Base: {item.baseValue} +{item.enhanceLevel * 15}%)
        </span>
      );
    }
    if (item.slot === 'boots') {
      return (
        <span style={{ display: 'flex', alignItems: 'center', textShadow: 'none' }}>
          {icon} +{Math.floor(finalVal)} HP (Base: {item.baseValue} +{item.enhanceLevel * 15}%)
        </span>
      );
    }
    const basePct = (item.baseValue * 100).toFixed(1);
    const finalPct = (finalVal * 100).toFixed(1);
    return (
      <span style={{ display: 'flex', alignItems: 'center', textShadow: 'none' }}>
        {icon} +{finalPct}% Crit Rate (Base: +{basePct}% +{item.enhanceLevel * 15}%)
      </span>
    );
  };

  const getRarityStyle = (rarity?: string) => {
    switch (rarity) {
      case 'legendary': return { color: '#f97316', label: 'LGD' };
      case 'epic': return { color: '#a855f7', label: 'EPC' };
      case 'rare': return { color: '#3b82f6', label: 'RARE' };
      default: return { color: '#22c55e', label: 'COM' };
    }
  };

  const getEnhanceCost = (lvl: number) => Math.floor(25 * Math.pow(1.3, lvl));
  const getReforgeCost = (item: Equipment) => {
    const lockedCount = item.substats.filter(s => s.locked).length;
    return 15 + lockedCount * 20;
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
            <span>💰 {gold.toLocaleString()}g</span>
          </div>
          <div style={{ background: '#f5f3ff', border: '1px solid #000', padding: '0.2rem 0.4rem', textAlign: 'center', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem' }}>
            <span>💎 {reforgeShards}</span>
          </div>
        </div>
      )}
      <div style={{ borderBottom: '3px solid #000', paddingBottom: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><RecycleIcon size={20} color="var(--neon-purple)" /> Forge & Refit</h2>
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <BagIcon size={14} /> Backpack Space: {lootBackpack.length} / {30 + (state.prestigeUpgrades?.bagSlots || 0) + (state.tempBagSlots || 0)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: '1.2rem', minHeight: isMobile ? 'auto' : '420px' }}>
        
        {/* LEFT COLUMN: ACTIVE FORGING PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', borderRight: isMobile ? 'none' : '3px solid #000', paddingRight: isMobile ? '0' : '1rem', borderBottom: isMobile ? '3px solid #000' : 'none', paddingBottom: isMobile ? '1rem' : '0' }}>
          {/* Slot Selection Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
            {(['weapon', 'body', 'boots', 'ring'] as EquipmentSlot[]).map(slot => {
              const eq = getEquippedInSlot(slot);
              const isActive = activeSlotTab === slot;
              return (
                <button
                  key={slot}
                  onClick={() => {
                    setActiveSlotTab(slot);
                    setSelectedLoot(null);
                  }}
                  className="game-btn"
                  style={{
                    padding: '0.4rem',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    background: isActive ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#fff'),
                    color: isActive ? '#000000' : (state.darkMode ? '#ffffff' : '#000000'),
                    border: `2px solid ${state.darkMode ? '#fff' : '#000'}`,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.2rem'
                  }}
                >
                  {getSlotIcon(slot, 12)}
                  {isMobile ? (slot === 'weapon' ? 'WEAP' : slot === 'boots' ? 'BOOT' : slot.toUpperCase()) : slot}
                  {eq ? '✓' : ''}
                </button>
              );
            })}
          </div>

          {/* Active Equipped Slot View */}
          {activeEquipped ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
              <div style={{ background: state.darkMode ? '#27272a' : '#f5f5f5', border: `2px solid ${state.darkMode ? '#fff' : '#000'}`, padding: '0.6rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <div style={{ background: state.darkMode ? '#121214' : '#fff', padding: '0.2rem', border: `1px solid ${getRarityStyle(activeEquipped.rarity).color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderEquipmentSprite(activeEquipped, 36)}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.9rem', color: getRarityStyle(activeEquipped.rarity).color }}>
                      {activeEquipped.name} {activeEquipped.setName ? `[${activeEquipped.setName.split(' ')[0]}]` : ''}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span style={{ fontSize: '0.55rem', fontWeight: 'bold', padding: '1px 3px', background: getRarityStyle(activeEquipped.rarity).color, color: '#000', borderRadius: '2px', textTransform: 'uppercase' }}>
                        {getRarityStyle(activeEquipped.rarity).label}
                      </span>
                      <span style={{ fontSize: '0.75rem', background: '#000', color: '#fff', padding: '0.1rem 0.4rem', fontWeight: 'bold', textShadow: 'none' }}>
                        Lvl {activeEquipped.itemLevel} {activeEquipped.enhanceLevel > 0 ? `+${activeEquipped.enhanceLevel}` : ''}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: state.darkMode ? '#fb923c' : '#c2410c' }}>
                    {getBaseValueLabel(activeEquipped)}
                  </div>
                </div>
              </div>

              {/* Substats Re-roll List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#555', textTransform: 'uppercase' }}>Substats (Lock to preserve)</span>
                {activeEquipped.substats.map((sub, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: state.darkMode ? '#1a1a1f' : '#fff', border: `2px solid ${state.darkMode ? '#fff' : '#000'}`, padding: '0.4rem 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => toggleSubstatLock(activeSlotTab, idx)}
                        style={{
                          background: sub.locked ? 'var(--neon-yellow)' : (state.darkMode ? '#444' : '#ddd'),
                          color: sub.locked ? '#000000' : (state.darkMode ? '#ffffff' : '#000000'),
                          border: `1px solid ${state.darkMode ? '#fff' : '#000'}`,
                          fontSize: '0.65rem',
                          cursor: 'pointer',
                          padding: '0.1rem 0.3rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {isMobile ? (sub.locked ? '🔒' : '🔓') : (sub.locked ? '🔒 LOCKED' : '🔓 LOCK')}
                      </button>
                      <span style={{ 
                        fontSize: '0.55rem', 
                        fontWeight: 'bold', 
                        padding: '1px 3px', 
                        background: getRarityStyle(sub.rarity).color, 
                        color: '#000', 
                        borderRadius: '2px',
                        textTransform: 'uppercase'
                      }}>
                        {getRarityStyle(sub.rarity).label}
                      </span>
                      <span style={{ fontSize: isMobile ? '0.7rem' : '0.8rem', fontFamily: 'monospace', color: state.darkMode ? '#fff' : '#000' }}>{isMobile ? getSubstatMobileName(sub.type) : SUBSTAT_NAMES[sub.type]}</span>
                      {(() => {
                        const capKey = `substatSlot${idx + 1}`;
                        const maxLvl = state.prestigeUpgrades[capKey] || 0;
                        const subLvl = sub.level || 0;
                        const targetLvl = subLvl + 1;
                        const equivEnhanceLevel = targetLvl * 10;
                        const upgradeCost = Math.floor(25 * Math.pow(1.3, equivEnhanceLevel));
                        
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.4rem' }}>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              fontFamily: 'monospace', 
                              color: '#888',
                              border: '1px solid #555',
                              padding: '0px 3px',
                              borderRadius: '2px'
                            }}>
                              Lv. {subLvl}
                            </span>
                            {maxLvl > 0 && subLvl < maxLvl && (
                              <button
                                onClick={() => upgradeSubstat(activeSlotTab, idx)}
                                disabled={gold < upgradeCost}
                                title={`Upgrade this substat to Level ${targetLvl} for ${upgradeCost} gold`}
                                style={{
                                  background: 'var(--neon-green)',
                                  color: '#000',
                                  border: '1px solid #000',
                                  fontSize: '0.6rem',
                                  padding: '0.05rem 0.25rem',
                                  cursor: gold >= upgradeCost ? 'pointer' : 'not-allowed',
                                  fontWeight: 'bold',
                                  opacity: gold >= upgradeCost ? 1 : 0.5,
                                  borderRadius: '2px'
                                }}
                              >
                                🔼 {upgradeCost >= 1000 ? `${(upgradeCost / 1000).toFixed(1)}k` : upgradeCost}g
                              </button>
                            )}
                            {maxLvl > 0 && subLvl >= maxLvl && (
                              <span style={{ fontSize: '0.6rem', color: '#555', fontStyle: 'italic' }}>MAX</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                    <strong style={{ 
                      fontSize: '0.85rem', 
                      fontFamily: 'monospace', 
                      color: getRarityStyle(sub.rarity).color 
                    }}>
                      {getFormatValue(sub)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Upgrade Actions */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.5rem', borderTop: '2px solid #000', paddingTop: '0.8rem' }}>
                {/* Level up button */}
                <button
                  onClick={() => enhanceGear(activeSlotTab)}
                  disabled={gold < getEnhanceCost(activeEquipped.enhanceLevel)}
                  className="game-btn"
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.4rem',
                    fontSize: '0.75rem',
                    background: 'var(--neon-cyan)',
                    fontWeight: 'bold',
                    opacity: gold < getEnhanceCost(activeEquipped.enhanceLevel) ? 0.5 : 1
                  }}
                >
                  Enhance Gear<br />
                  <span style={{ fontSize: '0.65rem', opacity: 0.8, display: 'inline-flex', alignItems: 'center', gap: '2px' }}><GoldIcon size={11} /> {getEnhanceCost(activeEquipped.enhanceLevel)}g</span>
                </button>

                {/* Reforge Substats button */}
                <button
                  onClick={() => reforgeSubstats(activeSlotTab)}
                  disabled={reforgeShards < getReforgeCost(activeEquipped)}
                  className="game-btn"
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.4rem',
                    fontSize: '0.75rem',
                    background: 'var(--neon-yellow)',
                    fontWeight: 'bold',
                    opacity: reforgeShards < getReforgeCost(activeEquipped) ? 0.5 : 1
                  }}
                >
                  Reforge Stats<br />
                  <span style={{ fontSize: '0.65rem', opacity: 0.8, display: 'inline-flex', alignItems: 'center', gap: '2px' }}><ShardIcon size={11} /> {getReforgeCost(activeEquipped)} Shards</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ border: '2px dashed #ccc', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
              No equipment active in this slot.<br />Select a drop in your backpack to equip.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LOOT BACKPACK COMPARATOR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BagIcon size={14} /> Backpack ({activeSlotTab}s)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {state.prestigeUpgrades?.multiScrap === 1 && lootBackpack.filter(item => item.slot === activeSlotTab).length > 0 && (
                <button
                  onClick={() => setShowScrapConfirm(true)}
                  className="game-btn scrap-all-btn"
                  style={{
                    fontSize: '0.55rem',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    cursor: 'pointer'
                  }}
                >
                  ♻️ SCRAP ALL
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.70rem' }}>
                <span style={{ fontWeight: 'bold', color: state.darkMode ? '#fff' : '#000' }}>SORT:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                style={{
                  background: state.darkMode ? '#1a1a1f' : '#fff',
                  color: state.darkMode ? '#fff' : '#000',
                  border: `2px solid ${state.darkMode ? '#fff' : '#000'}`,
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  padding: '1px 3px',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">🆕 Newest</option>
                <option value="level">📈 Level</option>
                <option value="enhance">➕ Enhance</option>
                <option value="rarity">🔶 Rarity</option>
                <option value="substats">💎 Substats</option>
              </select>
            </div>
            </div>
          </div>
          
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            border: `3px solid ${state.darkMode ? '#fff' : '#000'}`,
            background: state.darkMode ? '#121214' : '#fcfcfc',
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(70px, 1fr))' : 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '0.35rem',
            padding: '0.4rem',
            maxHeight: '290px',
            alignContent: 'start',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            {getSortedBackpack().map(item => {
              const isSelected = selectedLoot?.id === item.id;
              const rarityColor = getRarityStyle(item.rarity).color;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedLoot(item)}
                  style={{
                    width: '100%',
                    minHeight: '84px',
                    height: 'auto',
                    background: isSelected 
                      ? 'var(--neon-cyan)' 
                      : item.setName 
                        ? (state.darkMode ? '#2e1a47' : '#f5f3ff') 
                        : (state.darkMode ? '#27272a' : '#fff'),
                    border: isSelected 
                      ? `3px solid ${state.darkMode ? '#fff' : '#000'}` 
                      : `2px solid ${rarityColor}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '4px 3px',
                    cursor: 'pointer',
                    position: 'relative',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    color: isSelected 
                      ? '#000000' 
                      : (state.darkMode ? '#ffffff' : '#000000')
                  }}
                >
                  {/* TOP ROW: SET BADGE & LVL STACK ON LEFT, UP-RIGHT SPRITE */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', minHeight: '40px' }}>
                    {/* LEFT COLUMN: SET BADGE + LVL STACK */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1px' }}>
                      {item.setName && (
                        <span style={{ 
                          background: '#fbbf24', 
                          color: '#000000', 
                          fontSize: '0.45rem', 
                          fontWeight: '900', 
                          padding: '0px 2px', 
                          border: '1px solid #000',
                          borderRadius: '1px',
                          lineHeight: 1
                        }}>
                          SET
                        </span>
                      )}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.05, marginTop: item.setName ? '1px' : '0px' }}>
                        <span style={{ 
                          fontSize: '0.46rem', 
                          fontWeight: '900', 
                          textTransform: 'uppercase', 
                          color: isSelected ? '#000000' : (state.darkMode ? '#a1a1aa' : '#52525b') 
                        }}>
                          LVL
                        </span>
                        <span style={{ 
                          fontSize: '0.62rem', 
                          fontWeight: '900',
                          color: isSelected ? '#000000' : (state.darkMode ? '#ffffff' : '#000000')
                        }}>
                          {item.itemLevel}{item.enhanceLevel > 0 ? `+${item.enhanceLevel}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: LOCK ICON & UP-RIGHT SPRITE */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '2px' }}>
                      {item.locked && (
                        <span style={{ fontSize: '0.6rem', lineHeight: 1 }}>🔒</span>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '38px', height: '38px', flexShrink: 0 }}>
                        {renderEquipmentSprite(item, 36)}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ROW: RAISED NAME & STAT VALUE */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: 'auto', gap: '1px' }}>
                    <span style={{ 
                      textAlign: 'center', 
                      display: 'block', 
                      fontSize: 'clamp(0.58rem, 1.8vw, 0.66rem)', 
                      fontWeight: 'bold',
                      lineHeight: '1.1',
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap', 
                      maxWidth: '98%', 
                      color: isSelected ? '#000000' : rarityColor 
                    }} title={item.name}>
                      {item.name}
                    </span>
                    <span style={{ 
                      fontSize: 'clamp(0.55rem, 1.6vw, 0.62rem)',
                      fontWeight: 'bold',
                      color: isSelected ? '#000000' : (state.darkMode ? '#38bdf8' : '#1d4ed8'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      lineHeight: 1
                    }}>
                      {getSlotIcon(item.slot, 10)} +{item.baseValue}
                    </span>
                  </div>
                </button>
              );
            })}
            {lootBackpack.filter(item => item.slot === activeSlotTab).length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#888', fontSize: '0.75rem', padding: '2rem 0' }}>
                No {activeSlotTab}s in backpack.<br />Defeat monsters to secure {activeSlotTab} drops.
              </div>
            )}
          </div>

          {/* Option to buy extra temporary bag slots with reforge shards */}
          {(() => {
            const tempSlotCost = Math.floor(100 * Math.pow(1.2, state.tempBagSlots || 0));
            return (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.4rem 0.6rem',
                background: state.darkMode ? '#27272a' : '#f4f4f5',
                border: `2px solid ${state.darkMode ? '#fff' : '#000'}`,
                fontSize: '0.7rem'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <BagIcon size={12} /> Buy +1 Bag Slot
                  </span>
                  <span style={{ fontSize: '0.55rem', color: '#666' }}>
                    Resets on Ascension Prestige
                  </span>
                </div>
                <button
                  onClick={buyTempBagSlot}
                  disabled={state.reforgeShards < tempSlotCost}
                  className="game-btn"
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    background: state.reforgeShards >= tempSlotCost ? 'var(--neon-yellow)' : (state.darkMode ? '#1e1b4b' : '#e5e7eb'),
                    color: state.reforgeShards >= tempSlotCost ? '#000000' : (state.darkMode ? '#777' : '#999'),
                    cursor: state.reforgeShards >= tempSlotCost ? 'pointer' : 'not-allowed',
                    border: `2px solid ${state.darkMode ? '#fff' : '#000'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <ShardIcon size={12} color={state.reforgeShards >= tempSlotCost ? '#000' : '#888'} />
                  {tempSlotCost} Shards
                </button>
              </div>
            );
          })()}

          {/* Selected Backpack Item Inspector Card */}
          {selectedLoot && (
            <div style={{ background: state.darkMode ? '#1a1a1f' : '#fffbeb', border: `2px solid ${state.darkMode ? '#fff' : '#000'}`, padding: '0.6rem', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.4rem', borderBottom: '1px solid #555', paddingBottom: '0.4rem' }}>
                <div style={{ background: state.darkMode ? '#121214' : '#fff', padding: '0.2rem', border: `1px solid ${getRarityStyle(selectedLoot.rarity).color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderEquipmentSprite(selectedLoot, 38)}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                    <span style={{ color: getRarityStyle(selectedLoot.rarity).color, fontWeight: 'bold', fontSize: '0.95rem' }}>
                      {selectedLoot.name}
                    </span>
                    <span style={{ fontSize: '0.55rem', fontWeight: 'bold', padding: '1px 3px', background: getRarityStyle(selectedLoot.rarity).color, color: '#000', borderRadius: '2px', textTransform: 'uppercase' }}>
                      {getRarityStyle(selectedLoot.rarity).label}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: selectedLoot.setName ? (state.darkMode ? '#c084fc' : '#6d28d9') : (state.darkMode ? '#aaa' : '#666') }}>
                    {selectedLoot.setName || 'No Set'}
                  </span>
                </div>
              </div>

              {/* Enhance level, Item level and Base stat value details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', margin: '0.4rem 0', paddingBottom: '0.4rem', borderBottom: '1px dashed #555', fontSize: '0.68rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: state.darkMode ? '#aaa' : '#666' }}>Item Level: <strong>{selectedLoot.itemLevel || 1}</strong></span>
                  <span style={{ color: state.darkMode ? 'var(--neon-cyan)' : '#1d4ed8', fontWeight: 'bold', textShadow: 'none' }}>Enhance Lvl: +{selectedLoot.enhanceLevel || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1px' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {selectedLoot.slot === 'weapon' ? '🗡️ Base Attack:' :
                     selectedLoot.slot === 'body' ? '🛡️ Base Defense:' :
                     selectedLoot.slot === 'boots' ? '❤️ Base HP:' : '🎯 Base Crit:'}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {selectedLoot.enhanceLevel && selectedLoot.enhanceLevel > 0 ? (
                      <>
                        {selectedLoot.slot === 'ring' ? `${(selectedLoot.baseValue * 100).toFixed(1)}%` : selectedLoot.baseValue}
                        {' '}→{' '}
                        <span style={{ color: '#059669' }}>
                          {selectedLoot.slot === 'ring' 
                            ? `${(selectedLoot.baseValue * (1 + selectedLoot.enhanceLevel * 0.15) * 100).toFixed(1)}%` 
                            : Math.floor(selectedLoot.baseValue * (1 + selectedLoot.enhanceLevel * 0.15))}
                        </span>
                      </>
                    ) : (
                      selectedLoot.slot === 'ring' ? `${(selectedLoot.baseValue * 100).toFixed(1)}%` : selectedLoot.baseValue
                    )}
                  </span>
                </div>
              </div>

              {/* Substats Header */}
              <div style={{ fontSize: '0.62rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#888', marginBottom: '2px' }}>
                Substats Properties:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.2rem', marginBottom: '0.4rem', fontFamily: 'monospace', fontSize: '0.65rem' }}>
                {selectedLoot.substats.map((sub, idx) => (
                  <div key={idx} style={{ color: state.darkMode ? '#fff' : '#000' }}>
                    • {isMobile ? getSubstatMobileName(sub.type) : SUBSTAT_NAMES[sub.type]}:{' '}
                    <span style={{ color: getRarityStyle(sub.rarity).color, fontWeight: 'bold' }}>
                      {getFormatValue(sub)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '0.4rem', borderTop: '1px solid #ccc', paddingTop: '0.4rem' }}>
                <button
                  onClick={() => {
                    equipLoot(selectedLoot.id);
                    setSelectedLoot(null);
                  }}
                  className="game-btn"
                  style={{ flex: 1, padding: '0.3rem', fontSize: '0.7rem', background: '#06ffa1', color: '#000000', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}
                >
                  <ShieldIcon size={12} color="#000" /> EQUIP GEAR
                </button>

                {(state.prestigeUpgrades?.multiScrap === 1 || state.prestigeUpgrades?.autoScrap === 1) && (
                  <button
                    onClick={() => {
                      toggleGearLock(selectedLoot.id);
                      setSelectedLoot(prev => prev ? { ...prev, locked: !prev.locked } : null);
                    }}
                    className="game-btn"
                    style={{
                      flex: 1,
                      padding: '0.3rem',
                      fontSize: '0.7rem',
                      background: selectedLoot.locked ? 'var(--neon-yellow)' : (state.darkMode ? '#444' : '#ddd'),
                      color: selectedLoot.locked ? '#000' : (state.darkMode ? '#fff' : '#000'),
                      fontWeight: 'bold',
                      border: `2px solid ${state.darkMode ? '#fff' : '#000'}`
                    }}
                  >
                    {selectedLoot.locked ? '🔒 LOCKED' : '🔓 LOCK GEAR'}
                  </button>
                )}

                <button
                  onClick={() => {
                    scrapLoot(selectedLoot.id);
                    setSelectedLoot(null);
                  }}
                  disabled={selectedLoot.locked}
                  className="game-btn"
                  style={{ 
                    flex: 1, 
                    padding: '0.3rem', 
                    fontSize: '0.7rem', 
                    background: '#fca5a5', 
                    color: '#000000', 
                    fontWeight: 'bold',
                    opacity: selectedLoot.locked ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px'
                  }}
                >
                  <RecycleIcon size={12} color="#000" /> SCRAP ITEM
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER SET GEAR SYNERGIES CHECK */}
      <div style={{ borderTop: '3px solid #000', paddingTop: '0.8rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#555', display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.4rem' }}>
          <StarIcon size={12} /> Active Set Set Bonuses
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '0.6rem' }}>
          {setBonuses.map(set => {
            const has2 = set.count >= 2;
            const has4 = set.count >= 4;
            return (
              <div
                key={set.name}
                style={{
                  border: '2px solid #000',
                  padding: '0.4rem',
                  background: set.count > 0 ? '#fafafa' : '#f0f0f0',
                  opacity: set.count > 0 ? 1 : 0.6
                }}
              >
                <strong style={{ fontSize: '0.75rem', display: 'block', color: set.count >= 2 ? '#6d28d9' : '#000' }}>
                  {set.name} ({set.count}/4)
                </strong>
                <div style={{ fontSize: '0.6rem', marginTop: '0.2rem', textDecoration: has2 ? 'none' : 'line-through', color: has2 ? '#047857' : '#777', fontWeight: has2 ? 'bold' : 'normal' }}>
                  [2 Pcs] {set.b2}
                </div>
                <div style={{ fontSize: '0.6rem', textDecoration: has4 ? 'none' : 'line-through', color: has4 ? '#047857' : '#777', fontWeight: has4 ? 'bold' : 'normal' }}>
                  [4 Pcs] {set.b4}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IN-GAME SCRAP ALL CONFIRMATION MODAL OVERLAY */}
      {showScrapConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: state.darkMode ? '#1c1917' : '#ffffff',
            border: `3px solid ${state.darkMode ? '#fff' : '#000'}`,
            padding: '1.5rem',
            maxWidth: '360px',
            width: '90%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ fontSize: '1.8rem' }}>♻️</div>
            <strong style={{
              fontSize: '1rem',
              color: state.darkMode ? '#f43f5e' : '#e11d48',
              textTransform: 'uppercase',
              textShadow: 'none'
            }}>
              Confirm Scrap All
            </strong>
            <span style={{ fontSize: '0.8rem', color: state.darkMode ? '#ccc' : '#333', lineHeight: '1.4' }}>
              Are you sure you want to scrap all non-equipped <strong style={{ color: 'var(--neon-pink)', textTransform: 'uppercase' }}>{activeSlotTab}s</strong> from your backpack? This action is irreversible.
            </span>
            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', marginTop: '0.4rem' }}>
              <button
                onClick={() => {
                  scrapAllLoot(activeSlotTab);
                  setSelectedLoot(null);
                  setShowScrapConfirm(false);
                }}
                className="game-btn scrap-all-btn"
                style={{
                  background: '#e11d48',
                  color: '#fff',
                  border: '2px solid #000',
                  padding: '0.4rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textShadow: 'none'
                }}
              >
                CONFIRM SCRAP
              </button>
              <button
                onClick={() => setShowScrapConfirm(false)}
                className="game-btn"
                style={{
                  background: state.darkMode ? '#2e2a24' : '#e5e5e5',
                  color: state.darkMode ? '#fff' : '#000',
                  border: `2px solid ${state.darkMode ? '#fff' : '#000'}`,
                  padding: '0.4rem 1rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textShadow: 'none'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default GearManager;
