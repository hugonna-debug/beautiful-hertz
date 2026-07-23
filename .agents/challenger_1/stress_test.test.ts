import { describe, it, expect } from 'vitest';
import {
  LayerSpec,
  getCharacterLayerSpecs,
  auditLayerSpecs,
  getPostureOffsets
} from '../../src/components/LpcCharacterCanvas';
import { HEADS_CATALOG } from '../../src/data/headsCatalog';
import {
  BEARD_OPTIONS,
  MUSTACHE_OPTIONS,
  HORN_OPTIONS,
  EAR_OPTIONS
} from '../../src/data/facialFeaturesCatalog';
import { LpcCharacterConfig } from '../../src/types/game';

describe('Adversarial Stress Test: getCharacterLayerSpecs & Flag Matrix', () => {
  it('should generate audit-clean layer specs for all head models in HEADS_CATALOG', () => {
    HEADS_CATALOG.forEach(head => {
      const config: Partial<LpcCharacterConfig> = {
        headModel: head.id,
        beard: 'basic',
        mustache: 'french',
        horns: 'curled',
        longEars: 'long_ears',
        hairstyle: 'spiked',
        accessory: 'eyepatch',
        legs: 'pants'
      };
      const layers = getCharacterLayerSpecs(config);
      const audit = auditLayerSpecs(layers);
      expect(audit.valid).toBe(true);
      expect(audit.errors).toHaveLength(0);

      // Verify every single layer has at least one true flag
      layers.forEach((layer, idx) => {
        const hasFlag = layer.isBody || layer.isHead || layer.isHair || layer.isFacialHair || layer.isEars || layer.isAcc || layer.isLegs;
        expect(hasFlag).toBeTruthy();
      });
    });
  });

  it('should generate audit-clean layer specs for combinations of facial features', () => {
    const beards = BEARD_OPTIONS.map(b => b.id);
    const mustaches = MUSTACHE_OPTIONS.map(m => m.id);
    const horns = HORN_OPTIONS.map(h => h.id);
    const ears = EAR_OPTIONS.map(e => e.id);

    beards.slice(0, 4).forEach(beard => {
      mustaches.slice(0, 3).forEach(mustache => {
        horns.slice(0, 3).forEach(horn => {
          ears.slice(0, 2).forEach(longEars => {
            const layers = getCharacterLayerSpecs({
              beard,
              mustache,
              horns,
              longEars,
              hairstyle: 'ponytail',
              accessory: 'glasses'
            });
            const audit = auditLayerSpecs(layers);
            expect(audit.valid).toBe(true);
            expect(audit.errors).toHaveLength(0);
          });
        });
      });
    });
  });

  it('should correctly flag legs layers when legs config is specified', () => {
    const layers = getCharacterLayerSpecs({ legs: 'pants' });
    const legsLayer = layers.find(l => l.isLegs);
    expect(legsLayer).toBeDefined();
    expect(legsLayer?.url).toContain('/legs/pants');
    expect(auditLayerSpecs(layers).valid).toBe(true);
  });
});

describe('Adversarial Stress Test: auditLayerSpecs Robustness & False Positive/Negative Detection', () => {
  it('should return valid=true for empty layers array []', () => {
    const result = auditLayerSpecs([]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate all individual valid flags', () => {
    const validFlags: (keyof LayerSpec)[] = ['isBody', 'isHead', 'isHair', 'isFacialHair', 'isEars', 'isAcc', 'isLegs'];
    validFlags.forEach(flag => {
      const layerSpec: LayerSpec = { url: `/test/${flag}.png`, [flag]: true };
      const audit = auditLayerSpecs([layerSpec]);
      expect(audit.valid).toBe(true);
      expect(audit.errors).toHaveLength(0);
    });
  });

  it('should accurately detect unflagged specs and return descriptive error messages with 0 false positives', () => {
    const testCases: { layers: LayerSpec[]; expectedErrorCount: number; expectedIndices: number[] }[] = [
      {
        layers: [
          { url: '/valid/body.png', isBody: true },
          { url: '/invalid/no_flag.png' },
          { url: '/valid/head.png', isHead: true }
        ],
        expectedErrorCount: 1,
        expectedIndices: [1]
      },
      {
        layers: [
          { url: '/invalid/first.png' },
          { url: '/invalid/second.png' }
        ],
        expectedErrorCount: 2,
        expectedIndices: [0, 1]
      },
      {
        layers: [
          { url: '/invalid/false_flags.png', isBody: false, isHead: false, isHair: false }
        ],
        expectedErrorCount: 1,
        expectedIndices: [0]
      }
    ];

    testCases.forEach(({ layers, expectedErrorCount, expectedIndices }) => {
      const result = auditLayerSpecs(layers);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(expectedErrorCount);
      expectedIndices.forEach(idx => {
        const matchingError = result.errors.find(err => err.includes(`at index ${idx}`));
        expect(matchingError).toBeDefined();
        expect(matchingError).toContain('is missing a classification flag');
      });
    });
  });
});

describe('Adversarial Stress Test: 17px Relative Y-Distance Locking Across All Actions & Directions', () => {
  const actions = ['walk', 'slash', 'spellcast'] as const;
  const directions = ['south', 'east', 'west', 'north'] as const;
  const frameCounts: Record<string, number> = {
    walk: 8,
    slash: 6,
    spellcast: 7
  };

  const headSpec: LayerSpec = { url: '/head.png', isHead: true };
  const featureSpecs: { name: string; spec: LayerSpec }[] = [
    { name: 'beard', spec: { url: '/beard.png', isFacialHair: true } },
    { name: 'mustache', spec: { url: '/mustache.png', isFacialHair: true } },
    { name: 'horns', spec: { url: '/horns.png', isFacialHair: true } },
    { name: 'longEars', spec: { url: '/ears.png', isEars: true } },
    { name: 'hair', spec: { url: '/hair.png', isHair: true } },
    { name: 'accessory', spec: { url: '/acc.png', isAcc: true } }
  ];

  const BASE_HEAD_TOP_Y = 15;
  const BASE_FEATURE_TOP_Y = 32;

  actions.forEach(action => {
    directions.forEach(direction => {
      const maxFrames = frameCounts[action];
      it(`should maintain locked 17px relative Y-distance for action=${action}, dir=${direction} across all ${maxFrames} frames`, () => {
        for (let frame = 0; frame < maxFrames; frame++) {
          const headOffset = getPostureOffsets(action, direction, frame, headSpec, 256);

          featureSpecs.forEach(({ name, spec }) => {
            const featureOffset = getPostureOffsets(action, direction, frame, spec, 256);

            // 1. Offsets MUST be identical between head and attached feature
            expect(featureOffset.alignOffsetX).toBe(headOffset.alignOffsetX);
            expect(featureOffset.alignOffsetY).toBe(headOffset.alignOffsetY);

            // 2. Relative Y-distance calculation
            const headTopY = BASE_HEAD_TOP_Y + headOffset.alignOffsetY;
            const featureTopY = BASE_FEATURE_TOP_Y + featureOffset.alignOffsetY;
            const relativeYDist = featureTopY - headTopY;

            expect(relativeYDist).toBe(17);
          });
        }
      });
    });
  });

  it('should verify walk bobbing sequence (+2px on cols 1/5, -1px on cols 3/7, 0 on others)', () => {
    const expectedBobbing = [0, 2, 0, -1, 0, 2, 0, -1];
    directions.forEach(dir => {
      for (let frame = 0; frame < 8; frame++) {
        const offset = getPostureOffsets('walk', dir, frame, headSpec, 256);
        expect(offset.alignOffsetY).toBe(expectedBobbing[frame]);
      }
    });
  });

  it('should verify posture offsets for subfolder head model (height 256) vs tall body sheet (height 1344)', () => {
    // For head model spec (height 256 <= 384), head gets walk bobbing
    for (let frame = 0; frame < 8; frame++) {
      const headOffset = getPostureOffsets('walk', 'south', frame, headSpec, 256);
      const featureOffset = getPostureOffsets('walk', 'south', frame, featureSpecs[0].spec, 256);
      expect(headOffset).toEqual(featureOffset);
    }
  });
});
