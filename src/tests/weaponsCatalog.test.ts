import { describe, it, expect } from 'vitest';
import { WEAPONS_CATALOG, getWeaponFileUrl } from '../data/weaponsCatalog';
import { auditLayerSpecs, getCharacterLayerSpecs } from '../components/LpcCharacterCanvas';

describe('Weapons Catalog & Stance Unit Tests', () => {
  it('should load WEAPONS_CATALOG with none option by default', () => {
    expect(WEAPONS_CATALOG.length).toBe(1);
    expect(WEAPONS_CATALOG[0].id).toBe('none');
  });

  it('should resolve correct weapon file URL by ID or Name', () => {
    expect(getWeaponFileUrl('longsword')).toBe('/assets/anchored_weapons/longsword.png');
    expect(getWeaponFileUrl('axe')).toBe('/assets/anchored_weapons/axe.png');
    expect(getWeaponFileUrl('none')).toBe('');
  });

  it('should include weapon layer in layer specs when weapon is selected and hideWeapon is false', () => {
    const layers = getCharacterLayerSpecs(
      {
        bodyType: 'male',
        skinTone: 'light',
        headModel: 'human_male',
        weapon: 'longsword'
      },
      'slash',
      null,
      false
    );

    const hasWeapon = layers.some(l => l.url.includes('longsword.png'));
    expect(hasWeapon).toBe(true);

    const audit = auditLayerSpecs(layers);
    expect(audit.valid).toBe(true);
  });
});
