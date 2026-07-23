import { describe, it, expect } from 'vitest';
import { HELMETS_CATALOG, getCompatibleHelmets } from '../data/helmetsCatalog';
import { FABRIC_PALETTES, METAL_PALETTES, SKIN_PALETTES_EXPANDED } from '../data/colorPalettesCatalog';
import { auditLayerSpecs, getCharacterLayerSpecs } from '../components/LpcCharacterCanvas';

describe('Helmets & Color Palettes Unit Tests', () => {
  it('should load HELMETS_CATALOG with 30 helmet models + none option', () => {
    expect(HELMETS_CATALOG.length).toBe(31);
    const noneItem = HELMETS_CATALOG.find(h => h.id === 'none');
    expect(noneItem).toBeDefined();
  });

  it('should filter compatible helmets based on bodyType', () => {
    const maleHelmets = getCompatibleHelmets('male');
    const femaleHelmets = getCompatibleHelmets('female');

    expect(maleHelmets.every(h => h.gender === 'unisex' || h.gender === 'male')).toBe(true);
    expect(femaleHelmets.every(h => h.gender === 'unisex' || h.gender === 'female')).toBe(true);
  });

  it('should verify helmet override rules suppress hair, ears, horns, facial hair, and glasses in layer specs', () => {
    // Barbarian helmet overrides facial hair & glasses
    const barbarianHelmLayers = getCharacterLayerSpecs({
      bodyType: 'male',
      skinTone: 'light',
      headModel: 'human_male',
      hairstyle: 'spiky',
      beard: 'winter',
      mustache: 'handlebar',
      accessory: 'glasses_sun',
      helmet: 'male_barbarian-male'
    });

    const hasHair = barbarianHelmLayers.some(l => l.isHair);
    const hasFacialHair = barbarianHelmLayers.some(l => l.isFacialHair);
    const hasGlasses = barbarianHelmLayers.some(l => l.isAcc && !l.isHelmet);
    const hasHelmet = barbarianHelmLayers.some(l => l.isHelmet);

    expect(hasHair).toBe(false);
    expect(hasFacialHair).toBe(false);
    expect(hasGlasses).toBe(false);
    expect(hasHelmet).toBe(true);

    const audit = auditLayerSpecs(barbarianHelmLayers);
    expect(audit.valid).toBe(true);
  });

  it('should verify helmet layer specs have isHelmet set so offsets resolve independently of accessory/glasses', () => {
    const layers = getCharacterLayerSpecs({
      bodyType: 'male',
      skinTone: 'light',
      headModel: 'human_male',
      helmet: 'baseball_cap',
      accessory: 'glasses_sun',
      featureOffsets: {
        helmet: { front: { x: 3, y: -2 } },
        accessory: { front: { x: 0, y: 5 } }
      }
    });

    const helmetLayer = layers.find(l => l.isHelmet);
    const glassesLayer = layers.find(l => l.isAcc && !l.isHelmet);

    expect(helmetLayer).toBeDefined();
    expect(helmetLayer?.isHelmet).toBe(true);
    expect(glassesLayer).toBeDefined();
    expect(glassesLayer?.isAcc).toBe(true);
  });

  it('should verify FABRIC_PALETTES, METAL_PALETTES, and SKIN_PALETTES_EXPANDED color ramps', () => {
    expect(FABRIC_PALETTES.length).toBeGreaterThan(20);
    expect(METAL_PALETTES.length).toBe(8);
    expect(SKIN_PALETTES_EXPANDED.length).toBeGreaterThan(20);

    const goldMetal = METAL_PALETTES.find(m => m.id === 'gold');
    expect(goldMetal).toBeDefined();
    expect(goldMetal?.colors.length).toBeGreaterThan(4);
  });
});
