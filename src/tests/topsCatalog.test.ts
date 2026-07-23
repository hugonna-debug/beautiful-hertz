import { describe, it, expect } from 'vitest';
import { TOPS_CATALOG, getCompatibleTops } from '../data/topsCatalog';
import { auditLayerSpecs, getCharacterLayerSpecs } from '../components/LpcCharacterCanvas';

describe('Tops Catalog Unit Tests', () => {
  it('should load TOPS_CATALOG with 23 top options + none option', () => {
    expect(TOPS_CATALOG.length).toBe(24);
    const noneItem = TOPS_CATALOG.find(t => t.id === 'none');
    expect(noneItem).toBeDefined();
  });

  it('should filter tops by bodyType according to gender rules', () => {
    const femaleTops = getCompatibleTops('female');
    const teenTops = getCompatibleTops('teen');
    const maleTops = getCompatibleTops('male');
    const muscularTops = getCompatibleTops('muscular');

    // Female body type gets female and everyone tops
    expect(femaleTops.every(t => t.genderRule === 'everyone' || t.genderRule === 'female')).toBe(true);

    // Teen body type gets teen and everyone tops
    expect(teenTops.every(t => t.genderRule === 'everyone' || t.genderRule === 'teen')).toBe(true);

    // Male and Muscular body types get male and everyone tops
    expect(maleTops.every(t => t.genderRule === 'everyone' || t.genderRule === 'male')).toBe(true);
    expect(muscularTops.every(t => t.genderRule === 'everyone' || t.genderRule === 'male')).toBe(true);
  });

  it('should suppress wings when an equipped top overrides wings', () => {
    const layers = getCharacterLayerSpecs({
      bodyType: 'female',
      skinTone: 'light',
      headModel: 'human_female',
      wings: 'bird_normal',
      top: 'female_fabric_blouse'
    });

    const hasTop = layers.some(l => l.isTop);
    const hasWings = layers.some(l => l.isWing);

    expect(hasTop).toBe(true);
    expect(hasWings).toBe(false);

    const audit = auditLayerSpecs(layers);
    expect(audit.valid).toBe(true);
  });
});
