import { describe, it, expect } from 'vitest';
import { CAPES_CATALOG, getCompatibleCapes } from '../data/capesCatalog';
import { auditLayerSpecs, getCharacterLayerSpecs } from '../components/LpcCharacterCanvas';

describe('Capes Catalog Unit Tests', () => {
  it('should load CAPES_CATALOG with 3 cape options + none option', () => {
    expect(CAPES_CATALOG.length).toBe(4);
    const standardCape = CAPES_CATALOG.find(c => c.id === 'cape_everyone');
    expect(standardCape).toBeDefined();
  });

  it('should filter capes by bodyType according to gender rules', () => {
    const femaleCapes = getCompatibleCapes('female');
    const maleCapes = getCompatibleCapes('male');

    // Female gets female and everyone capes
    expect(femaleCapes.some(c => c.id === 'cape_female')).toBe(true);
    expect(femaleCapes.some(c => c.id === 'cape_everyone')).toBe(true);

    // Male gets only everyone capes
    expect(maleCapes.some(c => c.id === 'cape_female')).toBe(false);
    expect(maleCapes.some(c => c.id === 'cape_everyone')).toBe(true);
  });

  it('should suppress wings when an equipped cape overrides wings', () => {
    const layers = getCharacterLayerSpecs({
      bodyType: 'male',
      skinTone: 'light',
      headModel: 'human_male',
      wings: 'bird_normal',
      cape: 'cape_everyone',
      capePaletteType: 'fabric',
      capeColor: 'red'
    });

    const hasCape = layers.some(l => l.isCape);
    const hasWings = layers.some(l => l.isWing);

    expect(hasCape).toBe(true);
    expect(hasWings).toBe(false);

    const audit = auditLayerSpecs(layers);
    expect(audit.valid).toBe(true);
  });
});
