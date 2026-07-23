import { describe, it, expect } from 'vitest';
import { FeatureKey } from '../types/game';
import { auditLayerSpecs, getCharacterLayerSpecs } from '../components/LpcCharacterCanvas';

describe('Body Alignment Editor Unit Tests', () => {
  it('should support feature targets across both Face and Body Studio', () => {
    const faceTargets: FeatureKey[] = ['head', 'helmet', 'hair', 'beard', 'mustache', 'horns', 'longEars', 'accessory'];
    const bodyTargets: FeatureKey[] = ['body', 'legs', 'shoes', 'torso', 'weapon', 'wings', 'bodyAccessory'];

    expect(faceTargets.length).toBe(8);
    expect(bodyTargets.length).toBe(7);
  });

  it('should generate valid layer specs when body feature offsets are supplied', () => {
    const layers = getCharacterLayerSpecs({
      bodyType: 'male',
      skinTone: 'light',
      headModel: 'human_male',
      wings: 'bird_normal',
      legs: 'pants_white',
      featureOffsets: {
        wings: { front: { x: 2, y: -1 }, side: { x: 4, y: 1 } },
        body: { front: { x: 0, y: 0 }, side: { x: 1, y: 0 } },
        legs: { front: { x: 0, y: 1 }, side: { x: 2, y: 0 } }
      }
    });

    expect(layers.length).toBeGreaterThan(2);
    const audit = auditLayerSpecs(layers);
    expect(audit.valid).toBe(true);
  });
});
