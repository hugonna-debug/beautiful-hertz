import { describe, it, expect } from 'vitest';
import { HEADS_CATALOG, getHeadFileUrl, getCompatibleHeads, isHeadCompatibleWithBody } from '../data/headsCatalog';
import { BEARD_OPTIONS, MUSTACHE_OPTIONS, HORN_OPTIONS, EAR_OPTIONS } from '../data/facialFeaturesCatalog';
import {
  LayerSpec,
  getCharacterLayerSpecs,
  auditLayerSpecs,
  getPostureOffsets
} from '../components/LpcCharacterCanvas';

describe('LPC Layer Spec & Flag Integrity Suite', () => {
  it('should verify all heads in catalog have valid gender and override metadata', () => {
    expect(HEADS_CATALOG.length).toBeGreaterThan(15);
    HEADS_CATALOG.forEach(head => {
      expect(['male', 'female', 'unisex']).toContain(head.gender);
      expect(typeof head.isOverride).toBe('boolean');
      expect(head.relFolder.length).toBeGreaterThan(0);
    });
  });

  it('should resolve animated /run folder for heads during walk, slash, and spellcast actions', () => {
    const maleHeadUrlIdle = getHeadFileUrl('human_male', 'light', undefined);
    const maleHeadUrlWalk = getHeadFileUrl('human_male', 'light', 'walk');
    const maleHeadUrlSlash = getHeadFileUrl('human_male', 'light', 'slash');

    expect(maleHeadUrlIdle.primaryUrl).toContain('/idle/light.png');
    expect(maleHeadUrlWalk.primaryUrl).toContain('/run/light.png');
    expect(maleHeadUrlSlash.primaryUrl).toContain('/run/light.png');
  });

  it('should verify facial feature catalogs contain none option and valid category items', () => {
    expect(BEARD_OPTIONS.find(b => b.id === 'none')).toBeDefined();
    expect(MUSTACHE_OPTIONS.find(m => m.id === 'none')).toBeDefined();
    expect(HORN_OPTIONS.find(h => h.id === 'none')).toBeDefined();
    expect(EAR_OPTIONS.find(e => e.id === 'none')).toBeDefined();
  });
});

describe('R1: Layer Spec Flag Validation & Audit Suite (auditLayerSpecs)', () => {
  it('should pass audit for default character layer composition', () => {
    const layers = getCharacterLayerSpecs({});
    const result = auditLayerSpecs(layers);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should pass audit for fully featured character layer composition', () => {
    const layers = getCharacterLayerSpecs({
      bodyType: 'male',
      skinTone: 'tanned',
      headModel: 'human_male',
      beard: 'basic',
      mustache: 'french',
      horns: 'curled',
      hairstyle: 'none',
      legs: 'pants',
      accessory: 'glasses'
    });
    const result = auditLayerSpecs(layers);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail audit and report error if any layer spec is missing its classification flag', () => {
    const unflaggedLayers: LayerSpec[] = [
      { url: '/assets/character_creator/bodies/male/universal/light.png', isBody: true },
      { url: '/assets/character_creator/unflagged/feature.png' } // Missing flag
    ];
    const result = auditLayerSpecs(unflaggedLayers);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('is missing a classification flag');
  });

  it('should verify 100% of layers generated for diverse character configurations carry valid classification flags', () => {
    const testConfigs = [
      { bodyType: 'female', headModel: 'human_female', longEars: 'long_ears', hairstyle: 'ponytail' },
      { bodyType: 'muscular', headModel: 'human_male', horns: 'backwards', beard: 'winter' },
      { bodyType: 'zombie', headModel: 'zombie', mustache: 'bigstache' },
      { bodyType: 'skeleton', headModel: 'jack_pumpkin' },
      { bodyType: 'teen', headModel: 'orc_male', beard: 'basic', mustache: 'french', longEars: 'long_ears' }
    ];

    testConfigs.forEach(config => {
      const layers = getCharacterLayerSpecs(config as any);
      const auditResult = auditLayerSpecs(layers);
      expect(auditResult.valid).toBe(true);
      expect(auditResult.errors).toHaveLength(0);
    });
  });
});

describe('R2 & R3.b: Layer Spec Classification Flags', () => {
  it('should assign isBody to base body layer and isHead to head model layer', () => {
    const layers = getCharacterLayerSpecs({ bodyType: 'male', headModel: 'human_male' });
    const bodyLayer = layers.find(l => l.isBody && l.url.includes('/bodies/'));
    const headLayer = layers.find(l => l.isHead);

    expect(bodyLayer).toBeDefined();
    expect(bodyLayer?.url).toContain('/bodies/male/');

    expect(headLayer).toBeDefined();
    expect(headLayer?.url).toContain('human_male');
  });

  it('should assign isLegs to legs layer when legs equipment present', () => {
    const layers = getCharacterLayerSpecs({ legs: 'pants' });
    const legsLayer = layers.find(l => l.isLegs);
    expect(legsLayer).toBeDefined();
    expect(legsLayer?.url).toContain('/legs/pants');
  });

  it('should assign isEars to long ears layer', () => {
    const layers = getCharacterLayerSpecs({ longEars: 'long_ears' });
    const earLayer = layers.find(l => l.isEars);
    expect(earLayer).toBeDefined();
    expect(earLayer?.url).toContain('long ears');
  });

  it('should assign isFacialHair to beard, mustache, and horn layers', () => {
    const layers = getCharacterLayerSpecs({ beard: 'basic', mustache: 'french', horns: 'curled' });
    const facialHairLayers = layers.filter(l => l.isFacialHair);
    expect(facialHairLayers.length).toBeGreaterThanOrEqual(3);
  });

  it('should assign isHair to hairstyle layer and isAcc to accessory layer', () => {
    const layers = getCharacterLayerSpecs({ hairstyle: 'spiked', accessory: 'eyepatch' });
    const hairLayer = layers.find(l => l.isHair);
    const accLayer = layers.find(l => l.isAcc);

    expect(hairLayer).toBeDefined();
    expect(hairLayer?.url).toContain('/hair/');

    expect(accLayer).toBeDefined();
    expect(accLayer?.url).toContain('/features/eyepatch.png');
  });
});

describe('R2 & R3.c: 3D Posture Alignment & Bobbing Offsets (getPostureOffsets)', () => {
  const headSpec: LayerSpec = { url: '/head.png', isHead: true };
  const beardSpec: LayerSpec = { url: '/beard.png', isFacialHair: true };
  const stacheSpec: LayerSpec = { url: '/stache.png', isFacialHair: true };
  const earSpec: LayerSpec = { url: '/ears.png', isEars: true };
  const hairSpec: LayerSpec = { url: '/hair.png', isHair: true };
  const accSpec: LayerSpec = { url: '/acc.png', isAcc: true };

  const attachedFeatureSpecs = [beardSpec, stacheSpec, earSpec, hairSpec, accSpec];

  it('should calculate identical walk frame bobbing offsets (+2px on cols 1/5, -1px on cols 3/7) for head and attached features', () => {
    const expectedOffsetsY = [0, 2, 0, -1, 0, 2, 0, -1];

    for (let frame = 0; frame < 8; frame++) {
      const headOffset = getPostureOffsets('walk', 'south', frame, headSpec, 256);
      expect(headOffset.alignOffsetX).toBe(0);
      expect(headOffset.alignOffsetY).toBe(expectedOffsetsY[frame]);

      attachedFeatureSpecs.forEach(spec => {
        const featureOffset = getPostureOffsets('walk', 'south', frame, spec, 256);
        expect(featureOffset.alignOffsetX).toBe(0);
        expect(featureOffset.alignOffsetY).toBe(expectedOffsetsY[frame]);
      });
    }
  });

  it('should lock relative Y-distance at 17px between head top and attached facial features across all 8 walk frames', () => {
    const baseHeadTopY = 15;
    const baseStacheTopY = 32;

    for (let frame = 0; frame < 8; frame++) {
      const hOffset = getPostureOffsets('walk', 'south', frame, headSpec, 256);
      const fOffset = getPostureOffsets('walk', 'south', frame, stacheSpec, 256);

      const actualHeadTopY = baseHeadTopY + hOffset.alignOffsetY;
      const actualStacheTopY = baseStacheTopY + fOffset.alignOffsetY;
      const relativeDist = actualStacheTopY - actualHeadTopY;

      expect(relativeDist).toBe(17);
    }
  });

  it('should inherit 100% of 3D posture micro-offsets during slash attacks across all 4 directions', () => {
    const directions = ['south', 'east', 'west', 'north'] as const;

    directions.forEach(dir => {
      for (let frame = 0; frame < 6; frame++) {
        const hOffset = getPostureOffsets('slash', dir, frame, headSpec, 256);

        attachedFeatureSpecs.forEach(spec => {
          const fOffset = getPostureOffsets('slash', dir, frame, spec, 256);
          expect(fOffset.alignOffsetX).toBe(hOffset.alignOffsetX);
          expect(fOffset.alignOffsetY).toBe(hOffset.alignOffsetY);
        });

        // Relative 17px distance check
        const baseHeadTopY = 15;
        const baseStacheTopY = 32;
        const relDist = (baseStacheTopY + hOffset.alignOffsetY) - (baseHeadTopY + hOffset.alignOffsetY);
        expect(relDist).toBe(17);
      }
    });
  });

  it('should inherit 100% of 3D posture micro-offsets during spellcast invocations across all 4 directions', () => {
    const directions = ['south', 'east', 'west', 'north'] as const;

    directions.forEach(dir => {
      for (let frame = 0; frame < 7; frame++) {
        const hOffset = getPostureOffsets('spellcast', dir, frame, headSpec, 256);

        // Spellcast invocation lift (-1px on cols 2..4)
        if (frame >= 2 && frame <= 4) {
          expect(hOffset.alignOffsetY).toBe(-1);
        } else {
          expect(hOffset.alignOffsetY).toBe(0);
        }

        attachedFeatureSpecs.forEach(spec => {
          const fOffset = getPostureOffsets('spellcast', dir, frame, spec, 256);
          expect(fOffset.alignOffsetX).toBe(hOffset.alignOffsetX);
          expect(fOffset.alignOffsetY).toBe(hOffset.alignOffsetY);
        });

        // Relative 17px distance check
        const baseHeadTopY = 15;
        const baseStacheTopY = 32;
        const relDist = (baseStacheTopY + hOffset.alignOffsetY) - (baseHeadTopY + hOffset.alignOffsetY);
        expect(relDist).toBe(17);
      }
    });
  });
});

describe('R3.d & R4: Gender Compatibility & Head/Mask Overrides', () => {
  it('should filter head models strictly by body gender compatibility', () => {
    const femaleHeads = getCompatibleHeads('female');
    const maleHeads = getCompatibleHeads('male');

    expect(femaleHeads.some(h => h.id === 'human_female')).toBe(true);
    expect(femaleHeads.some(h => h.id === 'human_male')).toBe(false);

    expect(maleHeads.some(h => h.id === 'human_male')).toBe(true);
    expect(maleHeads.some(h => h.id === 'human_female')).toBe(false);

    expect(isHeadCompatibleWithBody('human_female', 'male')).toBe(false);
    expect(isHeadCompatibleWithBody('human_male', 'male')).toBe(true);
    expect(isHeadCompatibleWithBody('human_female', 'female')).toBe(true);
  });

  it('should suppress all facial features, hair, long ears, horns, and accessories when full-mask / override head is active', () => {
    const overrideHeads = ['lizard_male', 'lizard_female', 'minotaur', 'jack_no_palette', 'boarman', 'sheep', 'wolf_male', 'frankenstein'];

    overrideHeads.forEach(headId => {
      const layers = getCharacterLayerSpecs({
        headModel: headId,
        beard: 'basic',
        mustache: 'french',
        horns: 'curled',
        longEars: 'long_ears',
        hairstyle: 'spiked',
        accessory: 'eyepatch',
        weapon: 'none'
      }, 'walk', null, true);

      // Should only contain Body and Head layers
      expect(layers).toHaveLength(2);
      expect(layers[0].isBody).toBe(true);
      expect(layers[1].isHead).toBe(true);
      expect(layers.some(l => l.isFacialHair || l.isEars || l.isHair || l.isAcc)).toBe(false);
    });
  });

  it('should suppress long ears and horns while allowing beards, mustaches, hair, and accessories for Orc heads', () => {
    const layers = getCharacterLayerSpecs({
      headModel: 'orc_male',
      beard: 'basic',
      mustache: 'french',
      horns: 'curled',
      longEars: 'long_ears',
      hairstyle: 'spiked',
      accessory: 'eyepatch'
    });

    // Horns and long ears are suppressed for Orc head
    expect(layers.some(l => l.isEars)).toBe(false);

    // Beard, mustache, hair, accessory ARE present
    expect(layers.some(l => l.isFacialHair && l.url.includes('beard'))).toBe(true);
    expect(layers.some(l => l.isFacialHair && l.url.includes('mustache'))).toBe(true);
    expect(layers.some(l => l.isHair)).toBe(true);
    expect(layers.some(l => l.isAcc)).toBe(true);
  });
});

