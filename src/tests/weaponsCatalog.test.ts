import { describe, it, expect } from 'vitest';
import { WEAPONS_CATALOG, getWeaponFileUrl, getWeaponAnchorData } from '../data/weaponsCatalog';
import { auditLayerSpecs, getCharacterLayerSpecs } from '../components/LpcCharacterCanvas';

describe('Weapons Catalog & Stance Unit Tests', () => {
  it('should load WEAPONS_CATALOG with all anchored weapons including none', () => {
    expect(WEAPONS_CATALOG.length).toBeGreaterThanOrEqual(30);
    expect(WEAPONS_CATALOG[0].id).toBe('none');
  });

  it('should include numbered starter/common gear weapons in the catalog', () => {
    const starterBlade = WEAPONS_CATALOG.find(w => w.id === '1');
    expect(starterBlade).toBeDefined();
    expect(starterBlade?.name).toBe('Novice Crusader Blade');
    expect(starterBlade?.isCommonOrStarter).toBe(true);
    expect(starterBlade?.anchor?.baseX).toBe(32);
    expect(starterBlade?.anchor?.baseY).toBe(51);
  });

  it('should include named legendary and epic weapons in the catalog', () => {
    const katana = WEAPONS_CATALOG.find(w => w.id === 'cosmic_void_katana');
    expect(katana).toBeDefined();
    expect(katana?.name).toBe('Cosmic Void Katana');
    expect(katana?.anchor?.baseX).toBe(12);
    expect(katana?.anchor?.baseY).toBe(52);
  });

  it('should resolve correct weapon file URL by ID or Name', () => {
    expect(getWeaponFileUrl('1')).toBe('/assets/anchored_weapons/1.png');
    expect(getWeaponFileUrl('cosmic_void_katana')).toBe('/assets/anchored_weapons/cosmic_void_katana.png');
    expect(getWeaponFileUrl('none')).toBe('');
  });

  it('should resolve anchor JSON data via getWeaponAnchorData', () => {
    const anchor1 = getWeaponAnchorData('1');
    expect(anchor1).not.toBeNull();
    expect(anchor1?.baseX).toBe(32);
    expect(anchor1?.baseY).toBe(51);

    const anchorKatana = getWeaponAnchorData('/assets/anchored_weapons/cosmic_void_katana.png');
    expect(anchorKatana).not.toBeNull();
    expect(anchorKatana?.baseX).toBe(12);
    expect(anchorKatana?.baseY).toBe(52);
  });

  it('should include weapon layer in layer specs when weapon is selected and hideWeapon is false', () => {
    const layers = getCharacterLayerSpecs(
      {
        bodyType: 'male',
        skinTone: 'light',
        headModel: 'human_male',
        weapon: '1'
      },
      'slash',
      null,
      false
    );

    const hasWeapon = layers.some(l => l.url.includes('1.png'));
    expect(hasWeapon).toBe(true);

    const audit = auditLayerSpecs(layers);
    expect(audit.valid).toBe(true);
  });
});
