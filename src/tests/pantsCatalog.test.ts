import { describe, it, expect } from 'vitest';
import { PANTS_CATALOG, getPantsFileUrl } from '../data/pantsCatalog';
import { auditLayerSpecs, getCharacterLayerSpecs } from '../components/LpcCharacterCanvas';

describe('Pants Catalog Unit Tests', () => {
  it('should load PANTS_CATALOG options', () => {
    expect(PANTS_CATALOG.length).toBeGreaterThanOrEqual(2);
    const standardPants = PANTS_CATALOG.find(p => p.id === 'pants_standard');
    expect(standardPants).toBeDefined();
  });

  it('should resolve correct pants file URL according to body type', () => {
    expect(getPantsFileUrl('pants_standard', 'male')).toBe('/assets/lpc/legs/pants_everyone.png');
    expect(getPantsFileUrl('pants_standard', 'female')).toBe('/assets/lpc/legs/pants_everyone.png');
    expect(getPantsFileUrl('pants_standard', 'muscular')).toBe('/assets/lpc/legs/pants_muscular.png');
    expect(getPantsFileUrl('none', 'male')).toBe('');
  });

  it('should include leg layer in layer specs and pass layer audit', () => {
    const layers = getCharacterLayerSpecs({
      bodyType: 'male',
      skinTone: 'light',
      headModel: 'human_male',
      legs: 'pants_standard',
      pantsColor: 'blue'
    });

    const hasLegs = layers.some(l => l.isLegs);
    expect(hasLegs).toBe(true);

    const audit = auditLayerSpecs(layers);
    expect(audit.valid).toBe(true);
  });
});
