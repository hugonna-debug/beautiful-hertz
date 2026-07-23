import React, { useEffect, useRef } from 'react';
import { LpcCharacterConfig, Equipment, FeatureKey } from '../types/game';
import { HEADS_CATALOG, getHeadFileUrl } from '../data/headsCatalog';
import { getHairFileUrl } from '../data/hairstylesCatalog';
import { HAIR_COLORS } from '../data/facialFeaturesCatalog';
import { HELMETS_CATALOG } from '../data/helmetsCatalog';
import { WINGS_CATALOG } from '../data/wingsCatalog';
import { TOPS_CATALOG } from '../data/topsCatalog';
import { CAPES_CATALOG } from '../data/capesCatalog';
import { getPantsFileUrl } from '../data/pantsCatalog';
import { getWeaponFileUrl, getWeaponAnchorData } from '../data/weaponsCatalog';
import { FABRIC_PALETTES, METAL_PALETTES } from '../data/colorPalettesCatalog';
import { getHandSocket } from '../utils/handSockets';

interface LpcCharacterCanvasProps {
  config?: Partial<LpcCharacterConfig>;
  equippedWeapon?: Equipment | null;
  equippedBody?: Equipment | null;
  equippedBoots?: Equipment | null;
  equippedHeadId?: string;
  hideWeapon?: boolean;
  hideArmor?: boolean;
  action?: 'walk' | 'slash' | 'spellcast';
  width?: number;
  height?: number;
  direction?: 'south' | 'west' | 'east' | 'north';
  frame?: number;
  studioSection?: 'face' | 'body' | 'both';
  manualOffsetX?: number;
  manualOffsetY?: number;
  padding?: number;
  marginRatio?: number;
  style?: React.CSSProperties;
  className?: string;
}

export interface LayerSpec {
  url: string;
  isBody?: boolean;
  isHead?: boolean;
  isHair?: boolean;
  isFacialHair?: boolean;
  isEars?: boolean;
  isAcc?: boolean;
  isLegs?: boolean;
  isHelmet?: boolean;
  isWing?: boolean;
  isTop?: boolean;
  isCape?: boolean;
  isWeapon?: boolean;
  isWeaponBg?: boolean;
  isWeaponFg?: boolean;
  paletteType?: 'metal' | 'fabric';
}

const SKIN_HEX_MAP: Record<string, string> = {
  light: '#f1c1a1',
  tanned: '#c47e4e',
  bronze: '#9b5e39',
  brown: '#8d5e3c',
  black: '#552f27',
  amber: '#f5bc6f',
  blue: '#94b1bb',
  bright_green: '#6aa11c',
  dark_green: '#3f7837',
  green: '#309a44',
  lavender: '#b8bfda',
  olive: '#c47e4e',
  pale_green: '#76a167',
  taupe: '#aa7950',
  zombie: '#b9a886',
  zombie_green: '#b3c17d',
  fur_white: '#a6abad',
  fur_black: '#182832',
  fur_brown: '#573d33',
  fur_copper: '#b95601',
  fur_gold: '#f1bb45',
  fur_grey: '#81868a',
  fur_tan: '#ab774b'
};

export function getCharacterLayerSpecs(
  config?: Partial<LpcCharacterConfig>,
  action: 'walk' | 'slash' | 'spellcast' = 'walk',
  equippedWeapon?: Equipment | null,
  hideWeapon: boolean = false
): LayerSpec[] {
  const activeConfig: LpcCharacterConfig = {
    bodyType: 'none',
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
    headModel: 'none',
    weapon: 'none',
    ...config
  };

  const layers: LayerSpec[] = [];

  // Active Cape Evaluation
  const capeObj = CAPES_CATALOG.find(c => c.id === activeConfig.cape);
  const isCapeActive = Boolean(capeObj && capeObj.id !== 'none');
  const isWingsOverriddenByCape = Boolean(isCapeActive && capeObj?.overrideWings);

  // Active Top Evaluation
  const topObj = TOPS_CATALOG.find(t => t.id === activeConfig.top);
  const isTopActive = Boolean(topObj && topObj.id !== 'none');
  const isWingsOverriddenByTop = Boolean(isTopActive && topObj?.overrideWings);

  // Active Wing Evaluation
  const wingObj = WINGS_CATALOG.find(w => w.id === activeConfig.wings);
  const isWingActive = Boolean(!isWingsOverriddenByTop && !isWingsOverriddenByCape && wingObj && wingObj.id !== 'none');

  // 1. Wing BG Layer (renders behind body)
  if (isWingActive && wingObj?.bgUrl) {
    layers.push({ url: wingObj.bgUrl, isBody: true, isWing: true });
  }

  // Cape Layer (renders behind body)
  if (isCapeActive && capeObj?.url) {
    layers.push({ url: capeObj.url, isBody: true, isCape: true });
  }

  // 2. Modular Base Body Layer (Default: 'male' body type & 'light' skin tone)
  const currentBodyType = activeConfig.bodyType && activeConfig.bodyType !== 'none' ? activeConfig.bodyType : 'male';
  const currentSkinTone = activeConfig.skinTone || 'light';
  const bodyUrl = `/assets/character_creator/bodies/${currentBodyType}/universal/${currentSkinTone}.png`;
  layers.push({ url: bodyUrl, isBody: true });

  // 3. Wing FG Layer (renders in front of body)
  if (isWingActive && wingObj?.fgUrl) {
    layers.push({ url: wingObj.fgUrl, isBody: true, isWing: true });
  }

  // Modular Head Model Layer
  const defaultHeadId = currentBodyType === 'female' ? 'human_female' : 'human_male';
  const activeHeadId = activeConfig.headModel && activeConfig.headModel !== 'none' ? activeConfig.headModel : defaultHeadId;
  const headObj = HEADS_CATALOG.find(h => h.id === activeHeadId);
  const isOverrideHead = headObj ? headObj.isOverride : false;

  // Specific Head Restrictions
  const isSheepHead = activeHeadId === 'sheep';
  const isOrcHead = activeHeadId === 'orc_male' || activeHeadId === 'orc_female';

  const { primaryUrl: headUrl } = getHeadFileUrl(activeHeadId, currentSkinTone, action);
  layers.push({ url: headUrl, isHead: true });

  // Active Helmet Evaluation
  const helmetObj = HELMETS_CATALOG.find(h => h.id === activeConfig.helmet);
  const isHelmetActive = Boolean(helmetObj && helmetObj.id !== 'none');

  const isHairDisabled = isOverrideHead || isSheepHead || (isHelmetActive && helmetObj?.overrideHair);
  const isEarsDisabled = isOverrideHead || isSheepHead || isOrcHead || (isHelmetActive && helmetObj?.overrideEars);
  const isHornsDisabled = isOverrideHead || isSheepHead || isOrcHead || (isHelmetActive && helmetObj?.overrideHorns);
  const isFacialHairDisabled = isOverrideHead || isSheepHead || (isHelmetActive && helmetObj?.overrideFacialHair);
  const isGlassesDisabled = isOverrideHead || isSheepHead || (isHelmetActive && helmetObj?.overrideGlasses);

  if (activeConfig.legs && activeConfig.legs !== 'none') {
    const legsUrl = activeConfig.legs.startsWith('/')
      ? activeConfig.legs
      : getPantsFileUrl(activeConfig.legs, currentBodyType) || `/assets/lpc/legs/pants_everyone.png`;
    layers.push({ url: legsUrl, isLegs: true });
  }

  // Long Ears
  if (!isEarsDisabled) {
    const hasHorns = activeConfig.horns && activeConfig.horns !== 'none' && !isHornsDisabled;
    const hasEars = activeConfig.longEars && activeConfig.longEars !== 'none' && !hasHorns;

    if (hasEars) {
      const earsFile = currentBodyType === 'female' ? 'female.png' : 'male.png';
      layers.push({
        url: `/assets/character_creator/facial_features/long ears (uses skin palette, overrides helmets, horns)/${earsFile}`,
        isEars: true
      });
    }
  }

  // Horns
  if (!isHornsDisabled && activeConfig.horns && activeConfig.horns !== 'none') {
    const hColor = activeConfig.hornColor || 'black';
    if (activeConfig.horns === 'backwards') {
      layers.push({ url: `/assets/character_creator/facial_features/horns (overrides helmets, long ears)/backwards/background/${hColor}.png`, isFacialHair: true });
      layers.push({ url: `/assets/character_creator/facial_features/horns (overrides helmets, long ears)/backwards/foreground/${hColor}.png`, isFacialHair: true });
    } else if (activeConfig.horns === 'curled') {
      layers.push({ url: `/assets/character_creator/facial_features/horns (overrides helmets, long ears)/curled/${hColor}.png`, isFacialHair: true });
    }
  }

  // Beard Layer
  if (!isFacialHairDisabled && activeConfig.beard && activeConfig.beard !== 'none') {
    const hColor = activeConfig.hairColor || 'black';
    if (activeConfig.beard === 'winter') {
      const genderFolder = currentBodyType === 'female' ? 'female' : 'male';
      layers.push({ url: `/assets/character_creator/facial_features/beard/winter/${genderFolder}/${hColor}.png`, isFacialHair: true });
    } else {
      layers.push({ url: `/assets/character_creator/facial_features/beard/${activeConfig.beard}/${hColor}.png`, isFacialHair: true });
    }
  }

  // Mustache Layer
  if (!isFacialHairDisabled && activeConfig.mustache && activeConfig.mustache !== 'none') {
    const hColor = activeConfig.hairColor || 'black';
    layers.push({ url: `/assets/character_creator/facial_features/mustache/${activeConfig.mustache}/${hColor}.png`, isFacialHair: true });
  }

  // Hair Layer
  if (!isHairDisabled && activeConfig.hairstyle && activeConfig.hairstyle !== 'none') {
    const hairUrl = getHairFileUrl(activeConfig.hairstyle);
    if (hairUrl) {
      layers.push({ url: hairUrl, isHair: true });
    }
  }

  // Glasses / Accessory Layer
  if (!isGlassesDisabled && activeConfig.accessory && activeConfig.accessory !== 'none') {
    const accUrl = activeConfig.accessory.startsWith('/')
      ? activeConfig.accessory
      : activeConfig.accessory.startsWith('glasses_')
        ? `/assets/lpc/features/${activeConfig.accessory}.png`
        : `/assets/character_creator/features/${activeConfig.accessory}.png`;
    layers.push({ url: accUrl, isAcc: true });
  }

  // Helmet Layer (Renders on top of head base)
  if (isHelmetActive && helmetObj?.url) {
    layers.push({ url: helmetObj.url, isAcc: true, isHelmet: true, paletteType: helmetObj.paletteType });
  }

  // Top / Clothing Layer
  if (isTopActive && topObj?.url) {
    layers.push({ url: topObj.url, isBody: true, isTop: true, paletteType: topObj.paletteType });
  }

  if (activeConfig.bodyAccessory && activeConfig.bodyAccessory !== 'none') {
    const bodyAccUrl = activeConfig.bodyAccessory.startsWith('/')
      ? activeConfig.bodyAccessory
      : `/assets/lpc/body_accessories/${activeConfig.bodyAccessory}.png`;
    layers.push({ url: bodyAccUrl, isBody: true });
  }

  // Option 2 Hand Socket Weapon Layer Spec
  if (!hideWeapon) {
    const weaponSpriteUrl = equippedWeapon?.sprite || getWeaponFileUrl(equippedWeapon?.name || activeConfig.weapon || 'longsword');
    if (weaponSpriteUrl) {
      layers.push({ url: weaponSpriteUrl, isWeapon: true });
    }
  }

  return layers;
}

export function auditLayerSpecs(layers: LayerSpec[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  layers.forEach((layer, idx) => {
    const hasFlag = Boolean(
      layer.isBody ||
      layer.isHead ||
      layer.isHair ||
      layer.isFacialHair ||
      layer.isEars ||
      layer.isAcc ||
      layer.isLegs ||
      layer.isHelmet ||
      layer.isWing ||
      layer.isTop ||
      layer.isCape ||
      layer.isWeapon
    );
    if (!hasFlag) {
      errors.push(`Layer spec at index ${idx} (${layer.url || 'unknown'}) is missing a classification flag.`);
    }
  });
  return {
    valid: errors.length === 0,
    errors
  };
}

export function getPostureOffsets(
  action: 'walk' | 'slash' | 'spellcast',
  direction: 'south' | 'west' | 'east' | 'north',
  frame: number,
  spec: LayerSpec,
  imageHeight: number = 256
): { alignOffsetX: number; alignOffsetY: number } {
  let alignOffsetX = 0;
  let alignOffsetY = 0;

  const isHeadAttachedFeature = Boolean(spec.isHair || spec.isFacialHair || spec.isEars || spec.isAcc);
  const isHeadOrAttachedFeature = Boolean(spec.isHead || isHeadAttachedFeature);

  if (isHeadOrAttachedFeature) {
    let maxColsAllowed = 6;
    if (action === 'spellcast') maxColsAllowed = 7;
    else if (action === 'walk') maxColsAllowed = 8;
    else if (action === 'slash') maxColsAllowed = 6;

    const colIndex = frame % maxColsAllowed;

    if (action === 'walk' && (isHeadAttachedFeature || imageHeight <= 384)) {
      if (colIndex === 1 || colIndex === 5) {
        alignOffsetY += 2;
      } else if (colIndex === 3 || colIndex === 7) {
        alignOffsetY -= 1;
      }
    } else if (action === 'slash') {
      if (direction === 'south') {
        if (colIndex === 2 || colIndex === 3) alignOffsetY += 1;
      } else if (direction === 'east') {
        if (colIndex === 0 || colIndex === 1) alignOffsetX -= 1;
        else if (colIndex === 2 || colIndex === 3) { alignOffsetX += 2; alignOffsetY += 1; }
      } else if (direction === 'west') {
        if (colIndex === 0 || colIndex === 1) alignOffsetX += 1;
        else if (colIndex === 2 || colIndex === 3) { alignOffsetX -= 2; alignOffsetY += 1; }
      } else if (direction === 'north') {
        if (colIndex === 2 || colIndex === 3) alignOffsetY += 1;
      }
    } else if (action === 'spellcast') {
      if (colIndex >= 2 && colIndex <= 4) alignOffsetY -= 1;
    }
  }

  return { alignOffsetX, alignOffsetY };
}

export const LpcCharacterCanvas: React.FC<LpcCharacterCanvasProps> = ({
  config,
  equippedWeapon,
  hideWeapon = false,
  action = 'walk',
  width = 90,
  height = 90,
  direction = 'south',
  frame = 0,
  studioSection = 'both',
  manualOffsetX = 0,
  manualOffsetY = 0,
  padding,
  marginRatio,
  style,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const activeConfig: LpcCharacterConfig = {
    bodyType: 'none',
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
    headModel: 'none',
    weapon: 'none',
    ...config
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isCancelled = false;
    const cache = imageCacheRef.current;

    const layers = getCharacterLayerSpecs(activeConfig, action, equippedWeapon, hideWeapon);
    const auditResult = auditLayerSpecs(layers);
    if (!auditResult.valid) {
      console.warn('LPC Layer Spec Audit Warning/Error:', auditResult.errors);
    }

    if (layers.length === 0) return;

    // Offscreen Canvas Double-Buffering helper to render completely before swapping to screen
    const renderCharacterComposition = (validImages: { img: HTMLImageElement; spec: LayerSpec }[]) => {
      if (isCancelled || !canvasRef.current) return;
      const targetCanvas = canvasRef.current;
      const targetCtx = targetCanvas.getContext('2d');
      if (!targetCtx) return;

      // Offscreen canvas buffer
      const offscreen = document.createElement('canvas');
      offscreen.width = targetCanvas.width;
      offscreen.height = targetCanvas.height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      offCtx.imageSmoothingEnabled = false;

      const marginX = typeof padding === 'number'
        ? padding
        : typeof marginRatio === 'number'
          ? Math.floor(offscreen.width * marginRatio)
          : 0;
      const marginY = typeof padding === 'number'
        ? padding
        : typeof marginRatio === 'number'
          ? Math.floor(offscreen.height * marginRatio)
          : 0;

      const bodyWidth = Math.max(1, offscreen.width - marginX * 2);
      const bodyHeight = Math.max(1, offscreen.height - marginY * 2);
      const padX = marginX;
      const padY = marginY;

      const scaleX = bodyWidth / 64;
      const scaleY = bodyHeight / 64;

      // 1. Construct Pre-Composited Unified Head Entity (Head + Ears + Horns + Beard + Mustache + Hair + Accessories)
      const unifiedHeadCanvas = document.createElement('canvas');
      unifiedHeadCanvas.width = 64;
      unifiedHeadCanvas.height = 64;
      const headCtx = unifiedHeadCanvas.getContext('2d');
      if (headCtx) {
        headCtx.imageSmoothingEnabled = false;

        const headAttachedImages = validImages.filter(({ spec }) =>
          spec.isHead || spec.isHair || spec.isFacialHair || spec.isEars || spec.isAcc
        );

        headAttachedImages.forEach(({ img: loadedImg, spec }) => {
          if (loadedImg.complete && loadedImg.naturalWidth > 0) {
            const w = loadedImg.naturalWidth;
            const h = loadedImg.naturalHeight;
            const totalCols = Math.max(1, Math.floor(w / 64));
            const totalRows = Math.max(1, Math.floor(h / 64));

            let dirIndex = 2; // South
            if (direction === 'north') dirIndex = 0;
            else if (direction === 'west') dirIndex = 1;
            else if (direction === 'south') dirIndex = 2;
            else if (direction === 'east') dirIndex = 3;

            let frameW = 64;
            let frameH = 64;
            let srcY = (dirIndex % totalRows) * 64;
            let offsetX = 0;

            if (w <= 120 && h <= 40) {
              frameW = 40;
              frameH = 40;
              srcY = 0;
              if (direction === 'south') offsetX = 0; // Front view tile
              else if (direction === 'north') offsetX = 40; // Back view tile
              else offsetX = 80; // Side profile tile for East / West!
            }

            const currentSkinTone = activeConfig.skinTone || 'light';

            const fOffsets = activeConfig.featureOffsets || {};
            let fKey: FeatureKey = 'head';
            if (spec.isHelmet) fKey = 'helmet';
            else if (spec.isHair) fKey = 'hair';
            else if (spec.isEars) fKey = 'longEars';
            else if (spec.isAcc) fKey = 'accessory';
            else if (spec.isFacialHair) {
              if (spec.url.includes('beard')) fKey = 'beard';
              else if (spec.url.includes('mustache')) fKey = 'mustache';
              else if (spec.url.includes('horns')) fKey = 'horns';
            } else if (spec.isHead) fKey = 'head';

            const fEntry = fOffsets[fKey];
            const isFrontPose = direction === 'south';
            let drawX = 0;
            let drawY = 0;
            if (fEntry) {
              if (isFrontPose && fEntry.front) {
                drawX = fEntry.front.x;
                drawY = fEntry.front.y;
              } else if (!isFrontPose && fEntry.side) {
                drawX = fEntry.side.x;
                drawY = fEntry.side.y;
              } else {
                drawX = fEntry.x || 0;
                drawY = fEntry.y || 0;
              }
            }

            if (spec.isEars) {
              const earCanvas = document.createElement('canvas');
              earCanvas.width = 64; earCanvas.height = 64;
              const earCtx = earCanvas.getContext('2d');
              if (earCtx) {
                earCtx.imageSmoothingEnabled = false;
                earCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                earCtx.globalCompositeOperation = 'multiply';
                earCtx.fillStyle = SKIN_HEX_MAP[currentSkinTone] || '#f1c1a1';
                earCtx.fillRect(0, 0, 64, 64);
                earCtx.globalCompositeOperation = 'destination-in';
                earCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                headCtx.drawImage(earCanvas, drawX, drawY);
              }
            } else if (spec.isHair || (spec.isFacialHair && !spec.url.includes('horns'))) {
              const featCanvas = document.createElement('canvas');
              featCanvas.width = 64; featCanvas.height = 64;
              const featCtx = featCanvas.getContext('2d');
              if (featCtx) {
                featCtx.imageSmoothingEnabled = false;
                featCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                featCtx.globalCompositeOperation = 'multiply';
                const colorId = spec.isHair
                  ? (activeConfig.hairColor || 'black')
                  : (activeConfig.facialHairColor || activeConfig.hairColor || 'black');
                const colorObj = HAIR_COLORS.find(c => c.id === colorId);
                featCtx.fillStyle = colorObj ? colorObj.hex : '#18181b';
                featCtx.fillRect(0, 0, 64, 64);
                featCtx.globalCompositeOperation = 'destination-in';
                featCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                headCtx.drawImage(featCanvas, drawX, drawY);
              }
            } else if (spec.isHelmet) {
              const helmCanvas = document.createElement('canvas');
              helmCanvas.width = 64; helmCanvas.height = 64;
              const helmCtx = helmCanvas.getContext('2d');
              if (helmCtx) {
                helmCtx.imageSmoothingEnabled = false;
                helmCtx.drawImage(loadedImg, offsetX, srcY, frameW, frameH, 0, 0, frameW, frameH);
                helmCtx.globalCompositeOperation = 'multiply';
                const colorId = activeConfig.helmetColor || (spec.paletteType === 'fabric' ? 'brown' : 'iron');
                const colorList = spec.paletteType === 'fabric' ? FABRIC_PALETTES : METAL_PALETTES;
                const colorObj = colorList.find(c => c.id === colorId);
                helmCtx.fillStyle = colorObj ? colorObj.hex : (spec.paletteType === 'fabric' ? '#744b30' : '#888888');
                helmCtx.fillRect(0, 0, 64, 64);
                helmCtx.globalCompositeOperation = 'destination-in';
                helmCtx.drawImage(loadedImg, offsetX, srcY, frameW, frameH, 0, 0, frameW, frameH);
                headCtx.drawImage(helmCanvas, drawX, drawY);
              }
            } else {
              headCtx.drawImage(loadedImg, offsetX, srcY, frameW, frameH, drawX, drawY, frameW, frameH);
            }
          }
        });
      }

      if (studioSection === 'face') {
        // Render ONLY the pre-composited unified head entity centered on canvas
        const dummyHeadSpec: LayerSpec = { url: '', isHead: true };
        const { alignOffsetX, alignOffsetY } = getPostureOffsets(action, direction, frame, dummyHeadSpec, 256);
        const finalX = padX + (alignOffsetX + manualOffsetX) * scaleX;
        const finalY = padY + (alignOffsetY + manualOffsetY) * scaleY;
        offCtx.drawImage(unifiedHeadCanvas, 0, 0, 64, 64, finalX, finalY, bodyWidth, bodyHeight);
      } else {
        // 2. Render Body Layers and draw Unified Head Entity as single object
        const bodyImages = validImages.filter(({ spec }) => !spec.isHead && !spec.isHair && !spec.isFacialHair && !spec.isEars && !spec.isAcc && !spec.isWeapon);

        const drawEquippedWeaponSocket = (targetOrder: 'front' | 'behind') => {
          const weaponEntry = validImages.find(({ spec }) => spec.isWeapon);
          if (!weaponEntry) return;
          const { img: wImg } = weaponEntry;
          if (!wImg || !wImg.complete || wImg.naturalWidth === 0) return;

          const socket = getHandSocket(action, direction, frame);
          const order = socket.renderOrder || 'front';
          if (order !== targetOrder) return;

          const handX = padX + (socket.x + manualOffsetX) * scaleX;
          const handY = padY + (socket.y + manualOffsetY) * scaleY;

          const anchorData = getWeaponAnchorData(equippedWeapon?.sprite || equippedWeapon?.id || activeConfig.weapon || weaponEntry.spec.url);
          const weaponScale = (equippedWeapon as any)?.scale ?? (equippedWeapon as any)?.anchor?.scale ?? anchorData?.scale ?? 1.0;
          const drawW = bodyWidth * weaponScale;
          const drawH = bodyHeight * weaponScale;

          const customPivotX = (equippedWeapon as any)?.baseX ?? (equippedWeapon as any)?.pivotX ?? (equippedWeapon as any)?.anchor?.baseX ?? anchorData?.baseX ?? socket.pivotX ?? 20;
          const customPivotY = (equippedWeapon as any)?.baseY ?? (equippedWeapon as any)?.pivotY ?? (equippedWeapon as any)?.anchor?.baseY ?? anchorData?.baseY ?? socket.pivotY ?? 44;
          const pX = customPivotX * scaleX * weaponScale;
          const pY = customPivotY * scaleY * weaponScale;

          offCtx.save();
          offCtx.translate(handX, handY);
          offCtx.rotate((socket.angle * Math.PI) / 180);
          offCtx.translate(-pX, -pY);
          offCtx.drawImage(wImg, 0, 0, drawW, drawH);
          offCtx.restore();
        };

        // Draw weapon behind character if socket specifies 'behind'
        drawEquippedWeaponSocket('behind');

        let headDrawn = false;

        bodyImages.forEach(({ img: loadedImg, spec }) => {
          if (loadedImg.complete && loadedImg.naturalWidth > 0) {
            try {
              const w = loadedImg.naturalWidth;
              const h = loadedImg.naturalHeight;
              const totalCols = Math.max(1, Math.floor(w / 64));
              const totalRows = Math.max(1, Math.floor(h / 64));

              let dirIndex = 2; // South
              if (direction === 'north') dirIndex = 0;
              else if (direction === 'west') dirIndex = 1;
              else if (direction === 'south') dirIndex = 2;
              else if (direction === 'east') dirIndex = 3;

              let srcY = 0;
              if (h >= 1344 || totalRows >= 21) {
                let actionRowOffset = 8;
                if (action === 'spellcast') actionRowOffset = 0;
                else if (action === 'walk') actionRowOffset = 8;
                else if (action === 'slash') actionRowOffset = 12;

                srcY = (actionRowOffset + dirIndex) * 64;
              } else {
                srcY = (dirIndex % totalRows) * 64;
              }

              let maxColsAllowed = 6;
              if (action === 'spellcast') maxColsAllowed = 7;
              else if (action === 'walk') maxColsAllowed = 8;
              else if (action === 'slash') maxColsAllowed = 6;

              const animFrameCount = Math.min(maxColsAllowed, totalCols);
              const colIndex = frame % animFrameCount;
              const offsetX = colIndex * 64;

              const fOffsets = activeConfig.featureOffsets || {};
              let bKey: FeatureKey = 'body';
              if (spec.isWing) bKey = 'wings';
              else if (spec.isTop) bKey = 'torso';
              else if (spec.isCape) bKey = 'torso';
              else if (spec.isLegs) bKey = 'legs';
              else if (spec.url.includes('body_accessories')) bKey = 'bodyAccessory';
              else if (spec.url.includes('shoes') || spec.url.includes('feet')) bKey = 'shoes';
              else if (spec.url.includes('torso') || spec.url.includes('armor')) bKey = 'torso';
              else if (spec.url.includes('weapon')) bKey = 'weapon';
              else if (spec.isBody) bKey = 'body';

              const bEntry = fOffsets[bKey];
              const isFrontPose = direction === 'south';
              let bodyDrawX = 0;
              let bodyDrawY = 0;
              if (bEntry) {
                if (isFrontPose && bEntry.front) {
                  bodyDrawX = bEntry.front.x;
                  bodyDrawY = bEntry.front.y;
                } else if (!isFrontPose && bEntry.side) {
                  bodyDrawX = bEntry.side.x;
                  bodyDrawY = bEntry.side.y;
                } else {
                  bodyDrawX = bEntry.x || 0;
                  bodyDrawY = bEntry.y || 0;
                }
              }

              // Draw body layer, wing layer, top layer, or cape layer
              if (spec.isWing) {
                const wingCanvas = document.createElement('canvas');
                wingCanvas.width = 64; wingCanvas.height = 64;
                const wingCtx = wingCanvas.getContext('2d');
                if (wingCtx) {
                  wingCtx.imageSmoothingEnabled = false;
                  wingCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                  wingCtx.globalCompositeOperation = 'multiply';
                  const colorId = activeConfig.wingsColor || 'white';
                  const colorObj = FABRIC_PALETTES.find(c => c.id === colorId);
                  wingCtx.fillStyle = colorObj ? colorObj.hex : '#ffffff';
                  wingCtx.fillRect(0, 0, 64, 64);
                  wingCtx.globalCompositeOperation = 'destination-in';
                  wingCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                  offCtx.drawImage(wingCanvas, padX + bodyDrawX * scaleX, padY + bodyDrawY * scaleY, bodyWidth, bodyHeight);
                }
              } else if (spec.isCape) {
                const capeCanvas = document.createElement('canvas');
                capeCanvas.width = 64; capeCanvas.height = 64;
                const capeCtx = capeCanvas.getContext('2d');
                if (capeCtx) {
                  capeCtx.imageSmoothingEnabled = false;
                  capeCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                  capeCtx.globalCompositeOperation = 'multiply';
                  const isMetal = activeConfig.capePaletteType === 'metal';
                  const paletteList = isMetal ? METAL_PALETTES : FABRIC_PALETTES;
                  const defaultColor = isMetal ? 'iron' : 'red';
                  const colorId = activeConfig.capeColor || defaultColor;
                  const colorObj = paletteList.find(c => c.id === colorId);
                  capeCtx.fillStyle = colorObj ? colorObj.hex : '#ffffff';
                  capeCtx.fillRect(0, 0, 64, 64);
                  capeCtx.globalCompositeOperation = 'destination-in';
                  capeCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                  offCtx.drawImage(capeCanvas, padX + bodyDrawX * scaleX, padY + bodyDrawY * scaleY, bodyWidth, bodyHeight);
                }
              } else if (spec.isTop) {
                const topCanvas = document.createElement('canvas');
                topCanvas.width = 64; topCanvas.height = 64;
                const topCtx = topCanvas.getContext('2d');
                if (topCtx) {
                  topCtx.imageSmoothingEnabled = false;
                  topCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                  topCtx.globalCompositeOperation = 'multiply';
                  const isFabric = spec.paletteType === 'fabric';
                  const paletteList = isFabric ? FABRIC_PALETTES : METAL_PALETTES;
                  const defaultColor = isFabric ? 'brown' : 'iron';
                  const colorId = activeConfig.topColor || defaultColor;
                  const colorObj = paletteList.find(c => c.id === colorId);
                  topCtx.fillStyle = colorObj ? colorObj.hex : '#ffffff';
                  topCtx.fillRect(0, 0, 64, 64);
                  topCtx.globalCompositeOperation = 'destination-in';
                  topCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                  offCtx.drawImage(topCanvas, padX + bodyDrawX * scaleX, padY + bodyDrawY * scaleY, bodyWidth, bodyHeight);
                }
              } else if (spec.isLegs) {
                const legsCanvas = document.createElement('canvas');
                legsCanvas.width = 64; legsCanvas.height = 64;
                const legsCtx = legsCanvas.getContext('2d');
                if (legsCtx) {
                  legsCtx.imageSmoothingEnabled = false;
                  legsCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                  legsCtx.globalCompositeOperation = 'multiply';
                  const colorId = activeConfig.pantsColor || 'white';
                  const colorObj = FABRIC_PALETTES.find(c => c.id === colorId);
                  legsCtx.fillStyle = colorObj ? colorObj.hex : '#ffffff';
                  legsCtx.fillRect(0, 0, 64, 64);
                  legsCtx.globalCompositeOperation = 'destination-in';
                  legsCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, 0, 0, 64, 64);
                  offCtx.drawImage(legsCanvas, padX + bodyDrawX * scaleX, padY + bodyDrawY * scaleY, bodyWidth, bodyHeight);
                }
              } else {
                offCtx.drawImage(loadedImg, offsetX, srcY, 64, 64, padX + bodyDrawX * scaleX, padY + bodyDrawY * scaleY, bodyWidth, bodyHeight);
              }

              // Draw Unified Head Entity on top of base body (or legs)
              if (spec.isBody && !headDrawn) {
                headDrawn = true;
                const dummyHeadSpec: LayerSpec = { url: '', isHead: true };
                const { alignOffsetX, alignOffsetY } = getPostureOffsets(action, direction, frame, dummyHeadSpec, 256);
                const finalX = padX + (alignOffsetX + manualOffsetX) * scaleX;
                const finalY = padY + (alignOffsetY + manualOffsetY) * scaleY;
                offCtx.drawImage(unifiedHeadCanvas, 0, 0, 64, 64, finalX, finalY, bodyWidth, bodyHeight);
              }
            } catch (err) {
              // Ignore layer render error
            }
          }
        });

        if (!headDrawn) {
          const dummyHeadSpec: LayerSpec = { url: '', isHead: true };
          const { alignOffsetX, alignOffsetY } = getPostureOffsets(action, direction, frame, dummyHeadSpec, 256);
          const finalX = padX + (alignOffsetX + manualOffsetX) * scaleX;
          const finalY = padY + (alignOffsetY + manualOffsetY) * scaleY;
          offCtx.drawImage(unifiedHeadCanvas, 0, 0, 64, 64, finalX, finalY, bodyWidth, bodyHeight);
        }

        // Draw weapon in front of character if socket specifies 'front'
        drawEquippedWeaponSocket('front');
      }

      // Single atomic swap from offscreen buffer to visible screen canvas
      targetCtx.imageSmoothingEnabled = false;
      targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
      targetCtx.drawImage(offscreen, 0, 0);
    };

    // Check if all images are already cached for synchronous flicker-free render
    const allCached = layers.every(lSpec => {
      if (!cache.has(lSpec.url)) return false;
      const cached = cache.get(lSpec.url);
      return cached && cached.complete && cached.naturalWidth > 0;
    });

    if (allCached) {
      const cachedImages = layers.map(lSpec => ({
        img: cache.get(lSpec.url)!,
        spec: lSpec
      }));
      renderCharacterComposition(cachedImages);
      return;
    }

    // Asynchronous loader for uncached images
    const loadImages = layers.map(lSpec => {
      return new Promise<{ img: HTMLImageElement; spec: LayerSpec } | null>((resolve) => {
        if (cache.has(lSpec.url)) {
          const cachedImg = cache.get(lSpec.url)!;
          if (cachedImg.complete && cachedImg.naturalWidth > 0) {
            return resolve({ img: cachedImg, spec: lSpec });
          }
        }
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          cache.set(lSpec.url, img);
          resolve({ img, spec: lSpec });
        };
        img.onerror = () => {
          if ((lSpec.isBody || lSpec.isHead) && !lSpec.url.endsWith('light.png')) {
            const fallbackUrl = lSpec.url.replace(/[^/]+\.png$/, 'light.png');
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              cache.set(lSpec.url, fallbackImg);
              resolve({ img: fallbackImg, spec: lSpec });
            };
            fallbackImg.onerror = () => resolve(null);
            fallbackImg.src = fallbackUrl;
          } else {
            resolve(null);
          }
        };
        img.src = lSpec.url;
      });
    });

    Promise.all(loadImages).then(results => {
      if (isCancelled) return;
      const validImages = results.filter(Boolean) as { img: HTMLImageElement; spec: LayerSpec }[];
      renderCharacterComposition(validImages);
    });

    return () => {
      isCancelled = true;
    };
  }, [activeConfig, action, direction, frame, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        imageRendering: 'pixelated',
        overflow: 'visible',
        ...style
      }}
      className={className}
    />
  );
};
