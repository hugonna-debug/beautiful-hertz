import React, { useState, useEffect } from 'react';
import { GameState, LpcCharacterConfig, FeatureKey, FeatureOffsetsMap } from '../types/game';
import { LpcCharacterCanvas } from './LpcCharacterCanvas';
import { HEADS_CATALOG, getCompatibleHeads, isHeadCompatibleWithBody } from '../data/headsCatalog';
import { HAIRSTYLES_CATALOG } from '../data/hairstylesCatalog';
import {
  BEARD_OPTIONS,
  MUSTACHE_OPTIONS,
  HORN_OPTIONS,
  EAR_OPTIONS,
  HAIR_COLORS,
  BEARD_MUSTACHE_COLORS,
  HORN_COLORS
} from '../data/facialFeaturesCatalog';
import { HELMETS_CATALOG, getCompatibleHelmets } from '../data/helmetsCatalog';
import { WINGS_CATALOG } from '../data/wingsCatalog';
import { TOPS_CATALOG, getCompatibleTops } from '../data/topsCatalog';
import { CAPES_CATALOG, getCompatibleCapes } from '../data/capesCatalog';
import { WEAPONS_CATALOG } from '../data/weaponsCatalog';
import { WeaponAnchorEditor } from './WeaponAnchorEditor';
import { FABRIC_PALETTES, METAL_PALETTES } from '../data/colorPalettesCatalog';

const GLASSES_CATALOG = [
  { id: 'none', name: 'None' },
  { id: 'glasses_nerd', name: 'Nerd Glasses' },
  { id: 'glasses_sun', name: 'Sunglasses' },
  { id: 'glasses_secretary', name: 'Secretary Glasses' },
  { id: 'glasses_monocle', name: 'Monocle' }
];

const BODY_ACCESSORIES_CATALOG = [
  { id: 'none', name: 'None' },
  { id: 'necklace_gold', name: 'Gold Necklace' },
  { id: 'necklace_silver', name: 'Silver Necklace' },
  { id: 'necklace_bronze', name: 'Bronze Necklace' },
  { id: 'necklace_brass', name: 'Brass Necklace' },
  { id: 'necklace_copper', name: 'Copper Necklace' },
  { id: 'necklace_iron', name: 'Iron Necklace' },
  { id: 'necklace_steel', name: 'Steel Necklace' },
  { id: 'necklace_ceramic', name: 'Ceramic Pendant' },
  { id: 'necklace_pirate', name: 'Pirate Amulet' }
];

const SKIN_SWATCHES = [
  { id: 'light', name: 'Light', hex: '#f1c1a1' },
  { id: 'tanned', name: 'Tanned', hex: '#cf8e67' },
  { id: 'brown', name: 'Brown', hex: '#774728' },
  { id: 'black', name: 'Black', hex: '#362114' },
  { id: 'bronze', name: 'Bronze', hex: '#9b5b31' },
  { id: 'amber', name: 'Amber', hex: '#cb6d38' },
  { id: 'blue', name: 'Blue Elf', hex: '#5e729a' },
  { id: 'green', name: 'Green Goblin', hex: '#639832' },
  { id: 'bright_green', name: 'Orc Green', hex: '#327c1f' },
  { id: 'dark_green', name: 'Dark Orc', hex: '#1b4d13' },
  { id: 'pale_green', name: 'Pale Green', hex: '#8ba673' },
  { id: 'zombie', name: 'Zombie Gray', hex: '#7a8571' },
  { id: 'zombie_green', name: 'Zombie Green', hex: '#52694b' },
  { id: 'lavender', name: 'Lavender Drow', hex: '#776b88' },
  { id: 'taupe', name: 'Taupe', hex: '#7c6d66' },
  { id: 'fur_black', name: 'Fur Black', hex: '#182832' },
  { id: 'fur_brown', name: 'Fur Brown', hex: '#573d33' },
  { id: 'fur_copper', name: 'Fur Copper', hex: '#b95601' },
  { id: 'fur_gold', name: 'Fur Gold', hex: '#f1bb45' },
  { id: 'fur_grey', name: 'Fur Grey', hex: '#81868a' },
  { id: 'fur_tan', name: 'Fur Tan', hex: '#ab774b' }
];

interface CharacterCreatorProps {
  state: GameState;
  onUpdateCharacter: (config: Partial<LpcCharacterConfig>) => void;
}

interface BodyModelOption {
  id: string;
  name: string;
}

interface SkinPaletteOption {
  id: string;
  name: string;
  hex: string;
}

const BODY_MODELS: BodyModelOption[] = [
  { id: 'male', name: 'Human Male' },
  { id: 'female', name: 'Human Female' },
  { id: 'muscular', name: 'Muscular Male' },
  { id: 'teen', name: 'Teen / Slim' },
  { id: 'skeleton', name: 'Skeleton' },
  { id: 'zombie', name: 'Zombie' }
];

// Exact sampled RGB colors from LPC sprite sheet body pixels
const SKIN_PALETTES: SkinPaletteOption[] = [
  { id: 'light', name: 'Fair Ivory', hex: '#f1c1a1' },
  { id: 'tanned', name: 'Golden Tan', hex: '#c47e4e' },
  { id: 'bronze', name: 'Warm Bronze', hex: '#9b5e39' },
  { id: 'brown', name: 'Deep Brown', hex: '#8d5e3c' },
  { id: 'black', name: 'Ebony Black', hex: '#552f27' },
  { id: 'amber', name: 'Amber Gold', hex: '#f5bc6f' },
  { id: 'blue', name: 'Arcane Blue', hex: '#94b1bb' },
  { id: 'bright_green', name: 'Vibrant Green', hex: '#6aa11c' },
  { id: 'dark_green', name: 'Forest Green', hex: '#3f7837' },
  { id: 'green', name: 'Orc Green', hex: '#309a44' },
  { id: 'lavender', name: 'Mystic Purple', hex: '#b8bfda' },
  { id: 'olive', name: 'Olive Tint', hex: '#c47e4e' },
  { id: 'pale_green', name: 'Jade Green', hex: '#76a167' },
  { id: 'taupe', name: 'Ashen Taupe', hex: '#aa7950' },
  { id: 'zombie', name: 'Undead Rot', hex: '#b9a886' },
  { id: 'zombie_green', name: 'Toxic Zombie', hex: '#b3c17d' },
  { id: 'fur_white', name: 'Fur White', hex: '#a6abad' },
  { id: 'fur_black', name: 'Fur Black', hex: '#182832' },
  { id: 'fur_brown', name: 'Fur Brown', hex: '#573d33' },
  { id: 'fur_copper', name: 'Fur Copper', hex: '#b95601' },
  { id: 'fur_gold', name: 'Fur Gold', hex: '#f1bb45' },
  { id: 'fur_grey', name: 'Fur Grey', hex: '#81868a' },
  { id: 'fur_tan', name: 'Fur Tan', hex: '#ab774b' }
];

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({ state, onUpdateCharacter }) => {
  const [studioSection, setStudioSection] = useState<'face' | 'body'>('face');
  const [activeTab, setActiveTab] = useState<'head' | 'hairstyles' | 'facial_hair' | 'side_features' | 'glasses' | 'body_base' | 'equipment' | 'tops' | 'capes' | 'weapons' | 'wings' | 'helmets' | 'accessories' | 'base' | 'features'>('head');
  const [showAnchorEditor, setShowAnchorEditor] = useState(false);
  const [poseMode, setPoseMode] = useState<'idle_front' | 'walk_right' | 'slash_right'>('idle_front');
  const [previewFrame, setPreviewFrame] = useState<number>(0);
  const [selectedFeatureTarget, setSelectedFeatureTarget] = useState<FeatureKey>('head');
  const [manualOffsetX, setManualOffsetX] = useState<number>(0);
  const [manualOffsetY, setManualOffsetY] = useState<number>(0);

  // Derive preview action & direction from active pose mode
  const previewAction: 'walk' | 'slash' = poseMode === 'slash_right' ? 'slash' : 'walk';
  const previewDirection: 'south' | 'east' = poseMode === 'idle_front' ? 'south' : 'east';

  // Auto-switch tab when toggling studio section
  useEffect(() => {
    if (studioSection === 'face') {
      setActiveTab('head' as any);
    } else {
      setActiveTab('body_base' as any);
    }
  }, [studioSection]);

  // Animation frame loop (ONLY runs in Body Studio; PAUSED in Face Studio for still alignment)
  useEffect(() => {
    if (studioSection === 'face' || poseMode === 'idle_front') {
      setPreviewFrame(0);
      return;
    }
    const maxFrames = poseMode === 'slash_right' ? 6 : 8;
    const speed = poseMode === 'slash_right' ? 100 : 110;
    const interval = setInterval(() => {
      setPreviewFrame(f => (f + 1) % maxFrames);
    }, speed);
    return () => clearInterval(interval);
  }, [poseMode, studioSection]);

  const currentConfig: LpcCharacterConfig = state.lpcCharacter || {
    bodyType: 'male',
    skinTone: 'light',
    hairstyle: 'none',
    hairColor: 'black',
    beard: 'none',
    mustache: 'none',
    horns: 'none',
    hornColor: 'black',
    longEars: 'none',
    torso: 'none',
    legs: 'none',
    shoes: 'none',
    headwear: 'none',
    feature: 'none',
    accessory: 'none',
    facialHair: 'none',
    expression: 'none',
    headModel: 'human_male',
    weapon: 'none'
  };

  const selectedBodyType = currentConfig.bodyType && currentConfig.bodyType !== 'none' ? currentConfig.bodyType : 'male';
  const selectedSkinTone = currentConfig.skinTone || 'light';
  
  const defaultHeadId = selectedBodyType === 'female' ? 'human_female' : 'human_male';
  const activeHeadId = currentConfig.headModel && currentConfig.headModel !== 'none' ? currentConfig.headModel : defaultHeadId;

  const compatibleHeads = getCompatibleHeads(selectedBodyType);

  // Head & Helmet restriction & override flags
  const activeHeadObj = HEADS_CATALOG.find(h => h.id === activeHeadId);
  const isOverrideHead = activeHeadObj ? activeHeadObj.isOverride : false;
  const isSheepHead = activeHeadId === 'sheep';
  const isOrcHead = activeHeadId === 'orc_male' || activeHeadId === 'orc_female';

  const activeHelmetObj = HELMETS_CATALOG.find(h => h.id === currentConfig.helmet);
  const isHelmetActive = Boolean(activeHelmetObj && activeHelmetObj.id !== 'none');

  const isAllFeaturesDisabled = isOverrideHead || isSheepHead;
  const isEarsAndHornsDisabled = isAllFeaturesDisabled || isOrcHead;

  const isHairDisabled = isAllFeaturesDisabled || Boolean(isHelmetActive && activeHelmetObj?.overrideHair);
  const isEarsDisabled = isEarsAndHornsDisabled || Boolean(isHelmetActive && activeHelmetObj?.overrideEars);
  const isHornsDisabled = isEarsAndHornsDisabled || Boolean(isHelmetActive && activeHelmetObj?.overrideHorns);
  const isFacialHairDisabled = isAllFeaturesDisabled || Boolean(isHelmetActive && activeHelmetObj?.overrideFacialHair);
  const isGlassesDisabled = isAllFeaturesDisabled || Boolean(isHelmetActive && activeHelmetObj?.overrideGlasses);

  const handleSelectBodyType = (newBodyType: string) => {
    const isCurrentHeadCompatible = isHeadCompatibleWithBody(activeHeadId, newBodyType);

    if (!isCurrentHeadCompatible) {
      const newCompatibleHeads = getCompatibleHeads(newBodyType);
      const fallbackHeadId = newCompatibleHeads.length > 0 ? newCompatibleHeads[0].id : (newBodyType === 'female' ? 'human_female' : 'human_male');
      onUpdateCharacter({ bodyType: newBodyType, headModel: fallbackHeadId });
    } else {
      onUpdateCharacter({ bodyType: newBodyType });
    }
  };

  // Bracket Override handlers for Horns & Long Ears
  const handleSelectHorns = (hornId: string) => {
    if (isEarsAndHornsDisabled) return;
    if (hornId !== 'none') {
      onUpdateCharacter({ horns: hornId, longEars: 'none' });
    } else {
      onUpdateCharacter({ horns: 'none' });
    }
  };

  const handleSelectEars = (earId: string) => {
    if (isEarsAndHornsDisabled) return;
    if (earId !== 'none') {
      onUpdateCharacter({ longEars: earId, horns: 'none' });
    } else {
      onUpdateCharacter({ longEars: 'none' });
    }
  };

  const featureOffsets = currentConfig.featureOffsets || {};
  const currentEntry = featureOffsets[selectedFeatureTarget] || {};
  const isFrontPose = poseMode === 'idle_front';
  const poseCategoryKey: 'front' | 'side' = isFrontPose ? 'front' : 'side';

  const currentPoseOffset = isFrontPose
    ? (currentEntry.front || { x: currentEntry.x || 0, y: currentEntry.y || 0 })
    : (currentEntry.side || { x: currentEntry.x || 0, y: currentEntry.y || 0 });

  const handleNudgeFeature = (dx: number, dy: number) => {
    const newOffset = { x: currentPoseOffset.x + dx, y: currentPoseOffset.y + dy };
    const updatedEntry = {
      ...currentEntry,
      [poseCategoryKey]: newOffset
    };
    const updatedOffsets: FeatureOffsetsMap = {
      ...featureOffsets,
      [selectedFeatureTarget]: updatedEntry
    };
    onUpdateCharacter({ featureOffsets: updatedOffsets });
  };

  const handleResetFeatureOffset = () => {
    const updatedEntry = {
      ...currentEntry,
      [poseCategoryKey]: { x: 0, y: 0 }
    };
    const updatedOffsets: FeatureOffsetsMap = {
      ...featureOffsets,
      [selectedFeatureTarget]: updatedEntry
    };
    onUpdateCharacter({ featureOffsets: updatedOffsets });
  };

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: '0.4rem' }}>
      {/* TOP MASTER SECTION SELECTOR: FACE STUDIO vs BODY STUDIO */}
      <div style={{
        display: 'flex',
        gap: '0.6rem',
        background: state.darkMode ? '#18181b' : '#e4e4e7',
        padding: '0.4rem',
        borderRadius: '8px',
        border: `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`
      }}>
        <button
          onClick={() => {
            setStudioSection('face');
            setActiveTab('head');
            setSelectedFeatureTarget('head');
          }}
          style={{
            flex: 1,
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            background: studioSection === 'face' ? 'var(--neon-cyan)' : 'transparent',
            color: studioSection === 'face' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#52525b'),
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: studioSection === 'face' ? '0 0 10px var(--neon-cyan)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          🧑 Face Studio (Head & Features)
        </button>

        <button
          onClick={() => {
            setStudioSection('body');
            setActiveTab('body_base');
            setSelectedFeatureTarget('body');
          }}
          style={{
            flex: 1,
            padding: '0.5rem 1rem',
            fontSize: '0.85rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            background: studioSection === 'body' ? 'var(--neon-cyan)' : 'transparent',
            color: studioSection === 'body' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#52525b'),
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            boxShadow: studioSection === 'body' ? '0 0 10px var(--neon-cyan)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          🛡️ Body Studio (Body & Equipment)
        </button>
      </div>

      {/* Main Studio Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1rem' }}>
        {/* LEFT COLUMN: PREVIEW STAGE & ACTION CONTROLS */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            color: state.darkMode ? 'var(--neon-cyan)' : '#0f766e'
          }}>
            {studioSection === 'face' ? 'Head Assembly Stage' : (state.heroName || 'Valiant Crusader')}
          </div>

          {/* MAIN STAGE PREVIEW */}
          <div style={{
            position: 'relative',
            width: '150px',
            height: '150px',
            background: state.darkMode ? 'radial-gradient(circle, #27272a 0%, #09090b 100%)' : 'radial-gradient(circle, #ffffff 0%, #e4e4e7 100%)',
            border: `2px solid ${studioSection === 'face' ? 'var(--neon-cyan)' : (state.darkMode ? '#a855f7' : '#000')}`,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
            overflow: 'hidden'
          }}>
            <LpcCharacterCanvas
              config={{
                ...currentConfig,
                bodyType: selectedBodyType,
                headModel: activeHeadId
              }}
              action={previewAction}
              direction={previewDirection}
              frame={previewFrame}
              studioSection={studioSection}
              manualOffsetX={manualOffsetX}
              manualOffsetY={manualOffsetY}
              hideWeapon={true}
              hideArmor={true}
              width={132}
              height={132}
            />

            {/* PEDESTAL RING SHADOW */}
            <div style={{
              position: 'absolute',
              bottom: '6px',
              width: '90px',
              height: '16px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.35)',
              filter: 'blur(3px)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* POSE SELECTOR (3 GAMEPLAY POSES: STATIC FRONT, RIGHT WALK, RIGHT SLASH) */}
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
            {[
              { id: 'idle_front', label: 'Front', title: 'Static Front View' },
              { id: 'walk_right', label: 'Walk →', title: 'Right Walk Animation' },
              { id: 'slash_right', label: 'Slash →', title: 'Right Slash Attack' }
            ].map(pose => {
              const selected = poseMode === pose.id;
              return (
                <button
                  key={pose.id}
                  onClick={() => setPoseMode(pose.id as any)}
                  title={pose.title}
                  style={{
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                    color: selected ? '#000000' : (state.darkMode ? '#ffffff' : '#18181b'),
                    border: selected ? '2px solid var(--neon-cyan)' : `1px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {pose.label}
                </button>
              );
            })}
          </div>

          {/* FEATURE-SPECIFIC ALIGNMENT CONTROLLER (AVAILABLE IN BOTH FACE & BODY STUDIO) */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.4rem',
            width: '100%',
            background: state.darkMode ? '#18181b' : '#f4f4f5',
            padding: '0.5rem 0.6rem',
            borderRadius: '6px',
            border: `1px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: '#a1a1aa' }}>
              {studioSection === 'face' ? 'FACE ALIGNMENT TARGET' : 'BODY ALIGNMENT TARGET'}
            </div>

            {/* FEATURE SELECTOR PILLS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', justifyContent: 'center' }}>
              {(studioSection === 'face' ? [
                { id: 'head', label: '👤 Head' },
                { id: 'helmet', label: '🛡️ Helmet' },
                { id: 'hair', label: '💇 Hair' },
                { id: 'beard', label: '🧔 Beard' },
                { id: 'mustache', label: '👨 Stache' },
                { id: 'horns', label: '😈 Horns' },
                { id: 'longEars', label: '🧝 Ears' },
                { id: 'accessory', label: '👓 Glasses' }
              ] : [
                { id: 'body', label: '👤 Body' },
                { id: 'legs', label: '👖 Legs' },
                { id: 'shoes', label: '🥾 Shoes' },
                { id: 'torso', label: '🦺 Torso' },
                { id: 'weapon', label: '🗡️ Weapon' },
                { id: 'wings', label: '🪽 Wings' },
                { id: 'bodyAccessory', label: '📿 Acc' }
              ]).map(f => {
                const active = selectedFeatureTarget === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFeatureTarget(f.id as any)}
                    style={{
                      padding: '0.2rem 0.4rem',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: active ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                      color: active ? '#000000' : (state.darkMode ? '#a1a1aa' : '#52525b'),
                      border: active ? '1px solid var(--neon-cyan)' : `1px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

              <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--neon-cyan)' }}>
                {isFrontPose ? 'FRONT' : 'SIDE PROFILE'} ({selectedFeatureTarget.toUpperCase()}): ({currentPoseOffset.x >= 0 ? `+${currentPoseOffset.x}` : currentPoseOffset.x}, {currentPoseOffset.y >= 0 ? `+${currentPoseOffset.y}` : currentPoseOffset.y}px)
              </div>

              <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                <button onClick={() => handleNudgeFeature(-1, 0)} title="Nudge Left" style={{ width: '24px', height: '24px', fontSize: '0.75rem', fontWeight: 900 }}>←</button>
                <button onClick={() => handleNudgeFeature(0, -1)} title="Nudge Up" style={{ width: '24px', height: '24px', fontSize: '0.75rem', fontWeight: 900 }}>↑</button>
                <button onClick={() => handleNudgeFeature(0, 1)} title="Nudge Down" style={{ width: '24px', height: '24px', fontSize: '0.75rem', fontWeight: 900 }}>↓</button>
                <button onClick={() => handleNudgeFeature(1, 0)} title="Nudge Right" style={{ width: '24px', height: '24px', fontSize: '0.75rem', fontWeight: 900 }}>→</button>
                <button onClick={handleResetFeatureOffset} title="Reset to (0,0)" style={{ padding: '0.1rem 0.4rem', fontSize: '0.6rem', fontWeight: 700 }}>RST</button>
              </div>

              <div style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                marginTop: '0.2rem'
              }}>
                🔒 Position Locked & Pre-Composited!
              </div>
            </div>
          </div>

        {/* RIGHT COLUMN: TABBED CONTROLS */}
        <div style={{
          background: state.darkMode ? '#18181b' : '#fafafa',
          border: `2px solid ${state.darkMode ? '#3f3f46' : '#e4e4e7'}`,
          padding: '0.8rem 1rem',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          {/* CATEGORY TABS BAR */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', borderBottom: `2px solid ${state.darkMode ? '#27272a' : '#e4e4e7'}`, paddingBottom: '0.4rem' }}>
            {studioSection === 'face' ? (
              <>
                <button
                  onClick={() => setActiveTab('head' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: (activeTab === 'head' || activeTab === 'base') ? 'var(--neon-cyan)' : 'transparent',
                    color: (activeTab === 'head' || activeTab === 'base') ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Head Model
                </button>

                <button
                  onClick={() => setActiveTab('helmets' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: activeTab === 'helmets' ? 'var(--neon-cyan)' : 'transparent',
                    color: activeTab === 'helmets' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Helmets
                </button>

                <button
                  onClick={() => setActiveTab('hairstyles' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: activeTab === 'hairstyles' ? 'var(--neon-cyan)' : 'transparent',
                    color: activeTab === 'hairstyles' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Hairstyles
                </button>

                <button
                  onClick={() => setActiveTab('facial_hair' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: (activeTab === 'facial_hair' || activeTab === 'features') ? 'var(--neon-cyan)' : 'transparent',
                    color: (activeTab === 'facial_hair' || activeTab === 'features') ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Facial Hair
                </button>

                <button
                  onClick={() => setActiveTab('side_features' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: activeTab === 'side_features' ? 'var(--neon-cyan)' : 'transparent',
                    color: activeTab === 'side_features' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Side Features
                </button>

                <button
                  onClick={() => setActiveTab('glasses' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: activeTab === 'glasses' ? 'var(--neon-cyan)' : 'transparent',
                    color: activeTab === 'glasses' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Glasses
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('body_base' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: (activeTab === 'body_base' || activeTab === 'base') ? 'var(--neon-cyan)' : 'transparent',
                    color: (activeTab === 'body_base' || activeTab === 'base') ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Body & Skin
                </button>

                <button
                  onClick={() => setActiveTab('tops' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: activeTab === 'tops' ? 'var(--neon-cyan)' : 'transparent',
                    color: activeTab === 'tops' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Tops
                </button>

                <button
                  onClick={() => setActiveTab('capes' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: activeTab === 'capes' ? 'var(--neon-cyan)' : 'transparent',
                    color: activeTab === 'capes' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Capes
                </button>

                <button
                  onClick={() => setActiveTab('wings' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: activeTab === 'wings' ? 'var(--neon-cyan)' : 'transparent',
                    color: activeTab === 'wings' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Wings
                </button>

                <button
                  onClick={() => setShowAnchorEditor(true)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: 'transparent',
                    color: state.darkMode ? '#f59e0b' : '#d97706',
                    border: `1px solid ${state.darkMode ? '#f59e0b' : '#d97706'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🎯 Anchor Editor
                </button>

                <button
                  onClick={() => setActiveTab('accessories' as any)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    background: activeTab === 'accessories' ? 'var(--neon-cyan)' : 'transparent',
                    color: activeTab === 'accessories' ? '#000000' : (state.darkMode ? '#a1a1aa' : '#71717a'),
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Accessories
                </button>
              </>
            )}
          </div>

          {/* FACE STUDIO TABS */}
          {studioSection === 'face' && (
            <>
              {/* TAB: HEAD MODEL */}
              {(activeTab === 'head' || activeTab === 'base') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                      color: state.darkMode ? '#f4f4f5' : '#18181b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}>
                      <span>SELECT HEAD MODEL:</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#a1a1aa', textTransform: 'none' }}>
                        ({compatibleHeads.length} available)
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      maxHeight: '260px',
                      overflowY: 'auto',
                      paddingRight: '0.2rem'
                    }}>
                      {compatibleHeads.map(head => {
                        const selected = activeHeadId === head.id;
                        return (
                          <button
                            key={head.id}
                            onClick={() => onUpdateCharacter({ headModel: head.id })}
                            title={`${head.name}${head.isOverride ? ' (Full Mask)' : ''}`}
                            style={{
                              position: 'relative',
                              width: '56px',
                              height: '56px',
                              padding: 0,
                              background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                              border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                              boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              outline: 'none'
                            }}
                          >
                            <LpcCharacterCanvas
                              config={{
                                bodyType: selectedBodyType,
                                skinTone: selectedSkinTone,
                                headModel: head.id,
                                featureOffsets: currentConfig.featureOffsets
                              }}
                              studioSection="face"
                              width={52}
                              height={52}
                              direction="south"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* BODY STUDIO TABS */}
          {studioSection === 'body' && (
            <>
              {/* TAB: BODY & SKIN */}
              {(activeTab === 'body_base' || activeTab === 'base') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* 1. BODY MODEL SELECTION */}
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                      color: state.darkMode ? '#f4f4f5' : '#18181b'
                    }}>
                      SELECT BODY MODEL:
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {BODY_MODELS.map(bm => {
                        const selected = selectedBodyType === bm.id;
                        return (
                          <button
                            key={bm.id}
                            onClick={() => handleSelectBodyType(bm.id)}
                            title={bm.name}
                            style={{
                              width: '56px',
                              height: '56px',
                              padding: 0,
                              background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                              border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                              boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              outline: 'none'
                            }}
                          >
                            <LpcCharacterCanvas
                              config={{
                                bodyType: bm.id,
                                skinTone: selectedSkinTone,
                                headModel: activeHeadId
                              }}
                              width={52}
                              height={52}
                              direction="south"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. COLOR PALETTE SWATCH SELECTION */}
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                      color: state.darkMode ? '#f4f4f5' : '#18181b'
                    }}>
                      SELECT SKIN PALETTE:
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      {SKIN_PALETTES.map(sp => {
                        const selected = selectedSkinTone === sp.id;
                        return (
                          <button
                            key={sp.id}
                            onClick={() => onUpdateCharacter({ skinTone: sp.id })}
                            title={sp.name}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: sp.hex,
                              border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                              boxShadow: selected ? '0 0 10px var(--neon-cyan), inset 0 0 4px rgba(255,255,255,0.8)' : '0 2px 4px rgba(0,0,0,0.4)',
                              cursor: 'pointer',
                              transform: selected ? 'scale(1.2)' : 'scale(1)',
                              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                              outline: 'none'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. PANTS FABRIC COLOR PALETTE */}
                  <div>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      marginBottom: '0.5rem',
                      color: state.darkMode ? '#f4f4f5' : '#18181b'
                    }}>
                      PANTS FABRIC COLOR PALETTE:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                      {FABRIC_PALETTES.map(c => {
                        const selected = (currentConfig.pantsColor || 'white') === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => onUpdateCharacter({ legs: 'pants_standard', pantsColor: c.id })}
                            title={c.name}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: c.hex,
                              border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                              boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.3)',
                              cursor: 'pointer',
                              transform: selected ? 'scale(1.2)' : 'scale(1)',
                              transition: 'transform 0.15s ease',
                              outline: 'none'
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB: FACIAL HAIR (BEARDS & MUSTACHES + BEARD COLOR PALETTE) */}
          {studioSection === 'face' && (activeTab === 'facial_hair' || activeTab === 'features') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {isAllFeaturesDisabled && (
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#ef4444'
                }}>
                  🚫 Facial features and hair are disabled for the active head model ({activeHeadObj?.name || activeHeadId}).
                </div>
              )}
              {(!isAllFeaturesDisabled && isHelmetActive && activeHelmetObj?.overrideFacialHair) && (
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid #eab308',
                  color: '#eab308'
                }}>
                  🛡️ Facial hair is disabled because the equipped helmet ({activeHelmetObj.name}) overrides facial features.
                </div>
              )}

              {/* 1. BEARD SELECTION */}
              <div style={{ opacity: isFacialHairDisabled ? 0.35 : 1, pointerEvents: isFacialHairDisabled ? 'none' : 'auto' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                  SELECT BEARD:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {BEARD_OPTIONS.map(beard => {
                    const selected = (currentConfig.beard || 'none') === beard.id;
                    return (
                      <button
                        key={beard.id}
                        onClick={() => onUpdateCharacter({ beard: beard.id })}
                        title={beard.name}
                        disabled={isFacialHairDisabled}
                        style={{
                          width: '56px',
                          height: '56px',
                          padding: 0,
                          background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                          border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                          boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isFacialHairDisabled ? 'not-allowed' : 'pointer',
                          overflow: 'hidden',
                          outline: 'none'
                        }}
                      >
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            beard: beard.id,
                            facialHairColor: currentConfig.facialHairColor || currentConfig.hairColor || 'black',
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          studioSection="face"
                          width={52}
                          height={52}
                          direction="south"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. MUSTACHE SELECTION */}
              <div style={{ opacity: isFacialHairDisabled ? 0.35 : 1, pointerEvents: isFacialHairDisabled ? 'none' : 'auto' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                  SELECT MUSTACHE:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {MUSTACHE_OPTIONS.map(stache => {
                    const selected = (currentConfig.mustache || 'none') === stache.id;
                    return (
                      <button
                        key={stache.id}
                        onClick={() => onUpdateCharacter({ mustache: stache.id })}
                        title={stache.name}
                        disabled={isFacialHairDisabled}
                        style={{
                          width: '56px',
                          height: '56px',
                          padding: 0,
                          background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                          border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                          boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isFacialHairDisabled ? 'not-allowed' : 'pointer',
                          overflow: 'hidden',
                          outline: 'none'
                        }}
                      >
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            mustache: stache.id,
                            facialHairColor: currentConfig.facialHairColor || currentConfig.hairColor || 'black',
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          studioSection="face"
                          width={52}
                          height={52}
                          direction="south"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. BEARD & MUSTACHE COLOR PALETTE */}
              <div style={{ opacity: isAllFeaturesDisabled ? 0.35 : 1, pointerEvents: isAllFeaturesDisabled ? 'none' : 'auto' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                  BEARD & MUSTACHE COLOR PALETTE:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                  {BEARD_MUSTACHE_COLORS.map(fhc => {
                    const selected = (currentConfig.facialHairColor || currentConfig.hairColor || 'black') === fhc.id;
                    return (
                      <button
                        key={fhc.id}
                        onClick={() => onUpdateCharacter({ facialHairColor: fhc.id })}
                        title={fhc.name}
                        disabled={isAllFeaturesDisabled}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: fhc.hex,
                          border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                          boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.3)',
                          cursor: isAllFeaturesDisabled ? 'not-allowed' : 'pointer',
                          transform: selected ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                          outline: 'none'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SIDE FEATURES (HORNS & EARS + HORN COLOR PALETTE) */}
          {studioSection === 'face' && activeTab === 'side_features' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {isOrcHead && (
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid #eab308',
                  color: '#eab308'
                }}>
                  ⚠️ Long Ears and Horns are disabled for Orc head models.
                </div>
              )}

              {/* 1. EARS */}
              <div style={{ opacity: isEarsAndHornsDisabled ? 0.35 : 1, pointerEvents: isEarsAndHornsDisabled ? 'none' : 'auto' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                  SELECT EARS (MATCHES SKIN PALETTE):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {EAR_OPTIONS.map(ear => {
                    const selected = (currentConfig.longEars || 'none') === ear.id;
                    return (
                      <button
                        key={ear.id}
                        onClick={() => handleSelectEars(ear.id)}
                        title={ear.name}
                        disabled={isEarsAndHornsDisabled}
                        style={{
                          width: '56px',
                          height: '56px',
                          padding: 0,
                          background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                          border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                          boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isEarsAndHornsDisabled ? 'not-allowed' : 'pointer',
                          overflow: 'hidden',
                          outline: 'none'
                        }}
                      >
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            longEars: ear.id,
                            horns: 'none',
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          studioSection="face"
                          width={52}
                          height={52}
                          direction="south"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. HORNS */}
              <div style={{ opacity: isEarsAndHornsDisabled ? 0.35 : 1, pointerEvents: isEarsAndHornsDisabled ? 'none' : 'auto' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                  SELECT HORNS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {HORN_OPTIONS.map(horn => {
                    const selected = (currentConfig.horns || 'none') === horn.id;
                    return (
                      <button
                        key={horn.id}
                        onClick={() => handleSelectHorns(horn.id)}
                        title={horn.name}
                        disabled={isEarsAndHornsDisabled}
                        style={{
                          width: '56px',
                          height: '56px',
                          padding: 0,
                          background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                          border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                          boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isEarsAndHornsDisabled ? 'not-allowed' : 'pointer',
                          overflow: 'hidden',
                          outline: 'none'
                        }}
                      >
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            horns: horn.id,
                            hornColor: currentConfig.hornColor || 'black',
                            longEars: 'none',
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          studioSection="face"
                          width={52}
                          height={52}
                          direction="south"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. HORN COLOR PALETTE */}
              {(currentConfig.horns && currentConfig.horns !== 'none' && !isEarsAndHornsDisabled) && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                    HORN COLOR PALETTE:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    {HORN_COLORS.map(hoc => {
                      const selected = (currentConfig.hornColor || 'black') === hoc.id;
                      return (
                        <button
                          key={hoc.id}
                          onClick={() => onUpdateCharacter({ hornColor: hoc.id })}
                          title={hoc.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: hoc.hex,
                            border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                            boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            transform: selected ? 'scale(1.2)' : 'scale(1)',
                            transition: 'transform 0.15s ease',
                            outline: 'none'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GLASSES */}
          {studioSection === 'face' && activeTab === 'glasses' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                SELECT EYEWEAR / GLASSES:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {GLASSES_CATALOG.map(g => {
                  const selected = (currentConfig.accessory || 'none') === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => onUpdateCharacter({ accessory: g.id })}
                      title={g.name}
                      style={{
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                        border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                        boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        outline: 'none'
                      }}
                    >
                      {g.id === 'none' ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selected ? '#000' : '#888' }}>NONE</span>
                      ) : (
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            accessory: g.id,
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          studioSection="face"
                          width={52}
                          height={52}
                          direction="south"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: BODY ACCESSORIES (IN BODY STUDIO) */}
          {studioSection === 'body' && activeTab === 'accessories' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                SELECT BODY ACCESSORY / NECKLACE:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {BODY_ACCESSORIES_CATALOG.map(acc => {
                  const selected = (currentConfig.bodyAccessory || 'none') === acc.id;
                  return (
                    <button
                      key={acc.id}
                      onClick={() => onUpdateCharacter({ bodyAccessory: acc.id })}
                      title={acc.name}
                      style={{
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                        border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                        boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        outline: 'none'
                      }}
                    >
                      {acc.id === 'none' ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selected ? '#000' : '#888' }}>NONE</span>
                      ) : (
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            bodyAccessory: acc.id
                          }}
                          width={52}
                          height={52}
                          direction="south"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: HELMETS (IN FACE STUDIO) */}
          {studioSection === 'face' && activeTab === 'helmets' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                SELECT HELMET / HEADWEAR:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {getCompatibleHelmets(selectedBodyType).map(h => {
                  const selected = (currentConfig.helmet || 'none') === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => onUpdateCharacter({ helmet: h.id })}
                      title={`${h.name}${h.overrideHair ? ' (Overrides Hair, Ears, Horns)' : ''}`}
                      style={{
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                        border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                        boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        outline: 'none'
                      }}
                    >
                      {h.id === 'none' ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selected ? '#000' : '#888' }}>NONE</span>
                      ) : (
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            helmet: h.id,
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          width={52}
                          height={52}
                          direction="south"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* HELMET COLOR PALETTE */}
              {(currentConfig.helmet && currentConfig.helmet !== 'none') && (
                <div>
                  {(() => {
                    const activeHelm = HELMETS_CATALOG.find(h => h.id === currentConfig.helmet);
                    const isFabric = activeHelm?.paletteType === 'fabric';
                    const paletteList = isFabric ? FABRIC_PALETTES : METAL_PALETTES;
                    const defaultColor = isFabric ? 'brown' : 'iron';
                    const titleText = isFabric ? 'FABRIC HELMET COLOR PALETTE:' : 'METAL HELMET COLOR PALETTE:';

                    return (
                      <>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                          {titleText}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                          {paletteList.map(c => {
                            const selected = (currentConfig.helmetColor || defaultColor) === c.id;
                            return (
                              <button
                                key={c.id}
                                onClick={() => onUpdateCharacter({ helmetColor: c.id })}
                                title={c.name}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: c.hex,
                                  border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                                  boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.3)',
                                  cursor: 'pointer',
                                  transform: selected ? 'scale(1.2)' : 'scale(1)',
                                  transition: 'transform 0.15s ease',
                                  outline: 'none'
                                }}
                              />
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB: TOPS (IN BODY STUDIO) */}
          {studioSection === 'body' && activeTab === 'tops' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                SELECT TOP / ARMOR (OVERRIDES WINGS):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {getCompatibleTops(selectedBodyType).map(t => {
                  const selected = (currentConfig.top || 'none') === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onUpdateCharacter({ top: t.id })}
                      title={`${t.name}${t.overrideWings ? ' (Overrides Wings)' : ''}`}
                      style={{
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                        border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                        boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        outline: 'none'
                      }}
                    >
                      {t.id === 'none' ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selected ? '#000' : '#888' }}>NONE</span>
                      ) : (
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            top: t.id,
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          width={52}
                          height={52}
                          direction="south"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* TOP COLOR PALETTE */}
              {(currentConfig.top && currentConfig.top !== 'none') && (
                <div>
                  {(() => {
                    const activeTop = TOPS_CATALOG.find(t => t.id === currentConfig.top);
                    const isFabric = activeTop?.paletteType === 'fabric';
                    const paletteList = isFabric ? FABRIC_PALETTES : METAL_PALETTES;
                    const defaultColor = isFabric ? 'brown' : 'iron';
                    const titleText = isFabric ? 'FABRIC TOP COLOR PALETTE:' : 'METAL TOP COLOR PALETTE:';

                    return (
                      <>
                        <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                          {titleText}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                          {paletteList.map(c => {
                            const selected = (currentConfig.topColor || defaultColor) === c.id;
                            return (
                              <button
                                key={c.id}
                                onClick={() => onUpdateCharacter({ topColor: c.id })}
                                title={c.name}
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  background: c.hex,
                                  border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                                  boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.3)',
                                  cursor: 'pointer',
                                  transform: selected ? 'scale(1.2)' : 'scale(1)',
                                  transition: 'transform 0.15s ease',
                                  outline: 'none'
                                }}
                              />
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* TAB: CAPES (IN BODY STUDIO) */}
          {studioSection === 'body' && activeTab === 'capes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                SELECT CAPE (OVERRIDES WINGS):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {getCompatibleCapes(selectedBodyType).map(c => {
                  const selected = (currentConfig.cape || 'none') === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => onUpdateCharacter({ cape: c.id })}
                      title={`${c.name}${c.overrideWings ? ' (Overrides Wings)' : ''}`}
                      style={{
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                        border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                        boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        outline: 'none'
                      }}
                    >
                      {c.id === 'none' ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selected ? '#000' : '#888' }}>NONE</span>
                      ) : (
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            cape: c.id,
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          width={52}
                          height={52}
                          direction="south"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* CAPE PALETTE MODE & SWATCHES */}
              {(currentConfig.cape && currentConfig.cape !== 'none') && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                      CAPE PALETTE:
                    </div>
                    <button
                      onClick={() => onUpdateCharacter({ capePaletteType: 'fabric', capeColor: 'red' })}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        borderRadius: '4px',
                        border: 'none',
                        background: (currentConfig.capePaletteType || 'fabric') === 'fabric' ? 'var(--neon-cyan)' : '#3f3f46',
                        color: (currentConfig.capePaletteType || 'fabric') === 'fabric' ? '#000' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      FABRIC
                    </button>
                    <button
                      onClick={() => onUpdateCharacter({ capePaletteType: 'metal', capeColor: 'iron' })}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        borderRadius: '4px',
                        border: 'none',
                        background: currentConfig.capePaletteType === 'metal' ? 'var(--neon-cyan)' : '#3f3f46',
                        color: currentConfig.capePaletteType === 'metal' ? '#000' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      METAL
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    {((currentConfig.capePaletteType || 'fabric') === 'metal' ? METAL_PALETTES : FABRIC_PALETTES).map(col => {
                      const defaultCol = (currentConfig.capePaletteType || 'fabric') === 'metal' ? 'iron' : 'red';
                      const selected = (currentConfig.capeColor || defaultCol) === col.id;
                      return (
                        <button
                          key={col.id}
                          onClick={() => onUpdateCharacter({ capeColor: col.id })}
                          title={col.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: col.hex,
                            border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                            boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            transform: selected ? 'scale(1.2)' : 'scale(1)',
                            transition: 'transform 0.15s ease',
                            outline: 'none'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: WINGS (IN BODY STUDIO) */}
          {studioSection === 'body' && activeTab === 'wings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {(() => {
                const activeTopObj = TOPS_CATALOG.find(t => t.id === currentConfig.top);
                const activeCapeObj = CAPES_CATALOG.find(c => c.id === currentConfig.cape);
                const isWingsDisabledByTop = Boolean(activeTopObj && activeTopObj.id !== 'none' && activeTopObj.overrideWings);
                const isWingsDisabledByCape = Boolean(activeCapeObj && activeCapeObj.id !== 'none' && activeCapeObj.overrideWings);
                const overrideItemName = isWingsDisabledByTop ? activeTopObj?.name : isWingsDisabledByCape ? activeCapeObj?.name : null;

                return overrideItemName ? (
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '0.5rem 0.8rem',
                    borderRadius: '6px',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid #eab308',
                    color: '#eab308'
                  }}>
                    🛡️ Wings are disabled because the equipped equipment ({overrideItemName}) overrides wings.
                  </div>
                ) : null;
              })()}
              <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                SELECT WINGS (OVERRIDES TOPS & CAPES):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {WINGS_CATALOG.map(w => {
                  const selected = (currentConfig.wings || 'none') === w.id;
                  return (
                    <button
                      key={w.id}
                      onClick={() => onUpdateCharacter({ wings: w.id })}
                      title={`${w.name}${w.overrideTops ? ' (Overrides Tops & Capes)' : ''}`}
                      style={{
                        width: '56px',
                        height: '56px',
                        padding: 0,
                        background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                        border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                        boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        outline: 'none'
                      }}
                    >
                      {w.id === 'none' ? (
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selected ? '#000' : '#888' }}>NONE</span>
                      ) : (
                        <LpcCharacterCanvas
                          config={{
                            bodyType: selectedBodyType,
                            skinTone: selectedSkinTone,
                            headModel: activeHeadId,
                            wings: w.id,
                            featureOffsets: currentConfig.featureOffsets
                          }}
                          width={52}
                          height={52}
                          direction="south"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* WING COLOR PALETTE */}
              {(currentConfig.wings && currentConfig.wings !== 'none') && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                    WING COLOR PALETTE:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                    {FABRIC_PALETTES.map(c => {
                      const selected = (currentConfig.wingsColor || 'white') === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => onUpdateCharacter({ wingsColor: c.id })}
                          title={c.name}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: c.hex,
                            border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                            boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.3)',
                            cursor: 'pointer',
                            transform: selected ? 'scale(1.2)' : 'scale(1)',
                            transition: 'transform 0.15s ease',
                            outline: 'none'
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HAIRSTYLES (SHOWN ONLY IN FACE STUDIO) */}
          {studioSection === 'face' && activeTab === 'hairstyles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', opacity: isHairDisabled ? 0.35 : 1, pointerEvents: isHairDisabled ? 'none' : 'auto' }}>
              {isAllFeaturesDisabled && (
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #ef4444',
                  color: '#ef4444'
                }}>
                  🚫 Hairstyles are disabled for the active head model ({activeHeadObj?.name || activeHeadId}).
                </div>
              )}
              {(!isAllFeaturesDisabled && isHelmetActive && activeHelmetObj?.overrideHair) && (
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.5rem 0.8rem',
                  borderRadius: '6px',
                  background: 'rgba(234, 179, 8, 0.15)',
                  border: '1px solid #eab308',
                  color: '#eab308'
                }}>
                  🛡️ Hairstyles are disabled because the equipped helmet ({activeHelmetObj.name}) overrides hair.
                </div>
              )}

              {/* HAIRSTYLE SELECTION */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>SELECT HAIRSTYLE:</span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#a1a1aa', textTransform: 'none' }}>
                    ({HAIRSTYLES_CATALOG.length - 1} styles)
                  </span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                  {HAIRSTYLES_CATALOG.map(hair => {
                    const selected = (currentConfig.hairstyle || 'none') === hair.id;
                    return (
                      <button
                        key={hair.id}
                        onClick={() => onUpdateCharacter({ hairstyle: hair.id })}
                        title={hair.name}
                        disabled={isAllFeaturesDisabled}
                        style={{
                          width: '56px',
                          height: '56px',
                          padding: 0,
                          background: selected ? 'var(--neon-cyan)' : (state.darkMode ? '#27272a' : '#ffffff'),
                          border: selected ? '3px solid var(--neon-cyan)' : `2px solid ${state.darkMode ? '#3f3f46' : '#d4d4d8'}`,
                          boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.2)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isAllFeaturesDisabled ? 'not-allowed' : 'pointer',
                          overflow: 'hidden',
                          outline: 'none'
                        }}
                      >
                        {hair.id === 'none' ? (
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selected ? '#000' : '#888' }}>NONE</span>
                        ) : (
                            <LpcCharacterCanvas
                              config={{
                                bodyType: selectedBodyType,
                                skinTone: selectedSkinTone,
                                headModel: activeHeadId,
                                hairstyle: hair.id,
                                hairColor: currentConfig.hairColor || 'black',
                                featureOffsets: currentConfig.featureOffsets
                              }}
                              studioSection="face"
                              width={52}
                              height={52}
                              direction="south"
                            />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HAIR COLOR PALETTE */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', color: state.darkMode ? '#f4f4f5' : '#18181b' }}>
                  HAIR COLOR PALETTE:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                  {HAIR_COLORS.map(hc => {
                    const selected = (currentConfig.hairColor || 'black') === hc.id;
                    return (
                      <button
                        key={hc.id}
                        onClick={() => onUpdateCharacter({ hairColor: hc.id })}
                        title={hc.name}
                        disabled={isAllFeaturesDisabled}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: hc.hex,
                          border: selected ? '3px solid var(--neon-cyan)' : '2px solid #000',
                          boxShadow: selected ? '0 0 10px var(--neon-cyan)' : '0 2px 4px rgba(0,0,0,0.3)',
                          cursor: isAllFeaturesDisabled ? 'not-allowed' : 'pointer',
                          transform: selected ? 'scale(1.2)' : 'scale(1)',
                          transition: 'transform 0.15s ease',
                          outline: 'none'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    {showAnchorEditor && (
      <WeaponAnchorEditor
        config={currentConfig}
        darkMode={state.darkMode}
        onClose={() => setShowAnchorEditor(false)}
      />
    )}
    </>
  );
};
