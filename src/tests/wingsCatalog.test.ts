import { describe, it, expect } from 'vitest';
import { WINGS_CATALOG } from '../data/wingsCatalog';
import { auditLayerSpecs, getCharacterLayerSpecs } from '../components/LpcCharacterCanvas';

describe('Wings Catalog Unit Tests', () => {
  it('should load WINGS_CATALOG with 5 wing options + none option', () => {
    expect(WINGS_CATALOG.length).toBe(6);
    const noneItem = WINGS_CATALOG.find(w => w.id === 'none');
    expect(noneItem).toBeDefined();

    const birdWings = WINGS_CATALOG.find(w => w.id === 'bird_normal');
    expect(birdWings).toBeDefined();
    expect(birdWings?.bgUrl).toContain('bird_normal_bg.png');
    expect(birdWings?.fgUrl).toContain('bird_normal_fg.png');
  });

  it('should push Wing BG before body and Wing FG after body in layer specs', () => {
    const layers = getCharacterLayerSpecs({
      bodyType: 'male',
      skinTone: 'light',
      headModel: 'human_male',
      wings: 'bird_normal'
    });

    const wingBgIdx = layers.findIndex(l => l.url.includes('bird_normal_bg.png'));
    const bodyIdx = layers.findIndex(l => l.isBody && l.url.includes('universal'));
    const wingFgIdx = layers.findIndex(l => l.url.includes('bird_normal_fg.png'));

    expect(wingBgIdx).toBeGreaterThan(-1);
    expect(bodyIdx).toBeGreaterThan(-1);
    expect(wingFgIdx).toBeGreaterThan(-1);

    expect(wingBgIdx).toBeLessThan(bodyIdx);
    expect(wingFgIdx).toBeGreaterThan(bodyIdx);

    const audit = auditLayerSpecs(layers);
    expect(audit.valid).toBe(true);
  });
});
