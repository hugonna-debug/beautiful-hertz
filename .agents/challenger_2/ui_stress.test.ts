// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCreator } from '../../src/components/CharacterCreator';
import { HEADS_CATALOG, getHeadFileUrl, getCompatibleHeads, isHeadCompatibleWithBody } from '../../src/data/headsCatalog';
import { getCharacterLayerSpecs, auditLayerSpecs } from '../../src/components/LpcCharacterCanvas';
import { GameState } from '../../src/types/game';

// Helper mock state for CharacterCreator component tests
const mockGameState: GameState = {
  gold: 1000,
  clickPower: 1,
  autoClickerCount: 0,
  autoClickerCost: 10,
  autoClickerPower: 1,
  totalClicks: 0,
  unlockedFeatures: [],
  featureFlags: {},
  lpcCharacter: {
    bodyType: 'male',
    skinTone: 'light',
    hairstyle: 'none',
    hairColor: 'black',
    beard: 'none',
    mustache: 'none',
    horns: 'none',
    hornColor: 'black',
    longEars: 'none',
    torso: 'none',
    legs: 'none',
    shoes: 'none',
    headwear: 'none',
    feature: 'none',
    accessory: 'none',
    facialHair: 'none',
    expression: 'none',
    headModel: 'human_male',
    weapon: 'none'
  },
  inventory: [],
  equippedWeapon: null,
  equippedBody: null,
  equippedBoots: null,
  equippedHeadId: undefined,
  heroName: 'Valiant Crusader',
  darkMode: true
};

describe('Challenger 2 UI Stress Test Suite - HEADS_CATALOG & Gender Matrix', () => {
  it('should verify all items in HEADS_CATALOG have valid schema, gender, and override flags', () => {
    expect(HEADS_CATALOG.length).toBe(23);
    HEADS_CATALOG.forEach(head => {
      expect(head.id).toBeTruthy();
      expect(head.name).toBeTruthy();
      expect(['male', 'female', 'unisex']).toContain(head.gender);
      expect(typeof head.isOverride).toBe('boolean');
      expect(head.relFolder).toBeTruthy();
    });
  });

  it('should verify gender compatibility across all 6 body models', () => {
    const bodyModels = ['male', 'female', 'muscular', 'teen', 'skeleton', 'zombie'];

    bodyModels.forEach(bodyType => {
      const compatibleHeads = getCompatibleHeads(bodyType);
      expect(compatibleHeads.length).toBeGreaterThan(0);

      compatibleHeads.forEach(head => {
        if (bodyType === 'female') {
          expect(['female', 'unisex']).toContain(head.gender);
        } else {
          expect(['male', 'unisex']).toContain(head.gender);
        }
        expect(isHeadCompatibleWithBody(head.id, bodyType)).toBe(true);
      });
    });
  });

  it('should reject gender-incompatible heads when tested against opposite body types', () => {
    const femaleHeads = HEADS_CATALOG.filter(h => h.gender === 'female');
    const maleHeads = HEADS_CATALOG.filter(h => h.gender === 'male');

    // Female heads must fail on non-female bodies
    const nonFemaleBodies = ['male', 'muscular', 'teen', 'skeleton', 'zombie'];
    femaleHeads.forEach(head => {
      nonFemaleBodies.forEach(bodyType => {
        expect(isHeadCompatibleWithBody(head.id, bodyType)).toBe(false);
      });
    });

    // Male heads must fail on female bodies
    maleHeads.forEach(head => {
      expect(isHeadCompatibleWithBody(head.id, 'female')).toBe(false);
    });
  });

  it('should resolve getHeadFileUrl cleanly for all head items across walk, slash, spellcast, and idle actions', () => {
    const actions = [undefined, 'walk', 'slash', 'spellcast'] as const;
    const skinTones = ['light', 'tanned', 'green', 'zombie'];

    HEADS_CATALOG.forEach(head => {
      skinTones.forEach(tone => {
        actions.forEach(action => {
          const urls = getHeadFileUrl(head.id, tone, action);
          expect(urls.primaryUrl).toContain('/assets/character_creator/heads/');
          expect(urls.fallbackUrl).toContain('/assets/character_creator/heads/');
          if (action && action !== 'idle') {
            if (head.relFolder.includes('/idle')) {
              expect(urls.primaryUrl).toContain('/run/');
            }
          }
        });
      });
    });
  });

  it('should pass layer audit for all head items across all body models', () => {
    const bodyModels = ['male', 'female', 'muscular', 'teen', 'skeleton', 'zombie'];

    bodyModels.forEach(bodyType => {
      const heads = getCompatibleHeads(bodyType);
      heads.forEach(head => {
        const layers = getCharacterLayerSpecs({ bodyType, headModel: head.id });
        const audit = auditLayerSpecs(layers);
        expect(audit.valid).toBe(true);
        expect(audit.errors).toHaveLength(0);
      });
    });
  });
});

describe('Challenger 2 UI Stress Test Suite - Override Masks & Attached Feature Suppression', () => {
  const fullMaskHeads = [
    'jack_no_palette', // Jack Pumpkin
    'minotaur',       // Minotaur
    'lizard_male',    // Lizard Male
    'lizard_female',  // Lizard Female
    'boarman',        // Boarman
    'frankenstein',   // Frankenstein
    'pig',            // Pig
    'rabbit',         // Rabbit
    'wolf_male',      // Wolf Male
    'wolf_female',    // Wolf Female
    'sheep'           // Sheep
  ];

  it('should verify full-mask / override heads set isAllFeaturesDisabled and suppress 100% of attached feature layers', () => {
    fullMaskHeads.forEach(headId => {
      const layers = getCharacterLayerSpecs({
        bodyType: headId.includes('female') ? 'female' : 'male',
        headModel: headId,
        beard: 'basic',
        mustache: 'french',
        horns: 'curled',
        longEars: 'long_ears',
        hairstyle: 'spiked',
        accessory: 'eyepatch',
        weapon: 'none'
      }, 'walk', null, true);

      // Must ONLY contain Body and Head layers (length 2)
      expect(layers).toHaveLength(2);
      expect(layers[0].isBody).toBe(true);
      expect(layers[1].isHead).toBe(true);

      // Confirm zero attached feature layers exist
      const attachedLayers = layers.filter(l => l.isFacialHair || l.isEars || l.isHair || l.isAcc);
      expect(attachedLayers).toHaveLength(0);

      // Confirm layer audit passes
      const audit = auditLayerSpecs(layers);
      expect(audit.valid).toBe(true);
    });
  });

  it('should verify Orc heads set isEarsAndHornsDisabled, suppressing ears and horns while keeping beard, mustache, hair, and accessories', () => {
    const orcHeads = [
      { id: 'orc_male', body: 'male' },
      { id: 'orc_female', body: 'female' }
    ];

    orcHeads.forEach(({ id: headId, body: bodyType }) => {
      const layers = getCharacterLayerSpecs({
        bodyType,
        headModel: headId,
        beard: 'basic',
        mustache: 'french',
        horns: 'curled',
        longEars: 'long_ears',
        hairstyle: 'spiked',
        accessory: 'eyepatch'
      });

      // Ears and horns MUST be suppressed
      expect(layers.some(l => l.isEars)).toBe(false);
      expect(layers.some(l => l.isFacialHair && l.url.includes('horns'))).toBe(false);

      // Beard, mustache, hair, and accessory MUST be present
      expect(layers.some(l => l.isFacialHair && l.url.includes('beard'))).toBe(true);
      expect(layers.some(l => l.isFacialHair && l.url.includes('mustache'))).toBe(true);
      expect(layers.some(l => l.isHair)).toBe(true);
      expect(layers.some(l => l.isAcc)).toBe(true);

      // Confirm layer audit passes
      const audit = auditLayerSpecs(layers);
      expect(audit.valid).toBe(true);
    });
  });

  it('should verify standard heads allow all features and apply bracket overrides (horns override ears)', () => {
    const layers = getCharacterLayerSpecs({
      bodyType: 'male',
      headModel: 'human_male',
      horns: 'curled',
      longEars: 'long_ears',
      beard: 'basic',
      mustache: 'french'
    });

    // Horns override longEars
    expect(layers.some(l => l.isFacialHair && l.url.includes('horns'))).toBe(true);
    expect(layers.some(l => l.isEars)).toBe(false);

    // If horns are removed, longEars layer is present
    const layersWithEarsOnly = getCharacterLayerSpecs({
      bodyType: 'male',
      headModel: 'human_male',
      horns: 'none',
      longEars: 'long_ears'
    });
    expect(layersWithEarsOnly.some(l => l.isEars)).toBe(true);
  });
});

describe('Challenger 2 UI Stress Test Suite - CharacterCreator.tsx Component UI & Navigation', () => {
  it('should render CharacterCreator and support tab navigation between Base & Head and Facial Features', () => {
    const handleUpdate = vi.fn();
    render(React.createElement(CharacterCreator, { state: mockGameState, onUpdateCharacter: handleUpdate }));

    // Starts on Face Studio ('Head Model' tab)
    expect(screen.getByText(/SELECT HEAD MODEL:/i)).toBeInTheDocument();

    // Click 'Facial Hair' tab
    const facialHairTabBtn = screen.getByRole('button', { name: /FACIAL HAIR/i });
    fireEvent.click(facialHairTabBtn);

    // Verify Facial Hair tab content is rendered
    expect(screen.getByText(/SELECT BEARD:/i)).toBeInTheDocument();
    expect(screen.getByText(/SELECT MUSTACHE:/i)).toBeInTheDocument();
    expect(screen.getByText(/BEARD & MUSTACHE COLOR PALETTE:/i)).toBeInTheDocument();

    // Click 'Head Model' tab back
    const headTabBtn = screen.getByRole('button', { name: /HEAD MODEL/i });
    fireEvent.click(headTabBtn);

    expect(screen.getByText(/SELECT HEAD MODEL:/i)).toBeInTheDocument();
  });

  it('should render gameplay pose selector buttons (Static Front, Right Walk, Right Slash)', () => {
    const handleUpdate = vi.fn();
    render(React.createElement(CharacterCreator, { state: mockGameState, onUpdateCharacter: handleUpdate }));

    // 3 Gameplay Pose Buttons
    expect(screen.getByTitle('Static Front View')).toBeInTheDocument();
    expect(screen.getByTitle('Right Walk Animation')).toBeInTheDocument();
    expect(screen.getByTitle('Right Slash Attack')).toBeInTheDocument();
  });

  it('should display red notice banner and disable feature buttons when full-mask head is active', () => {
    const maskState: GameState = {
      ...mockGameState,
      lpcCharacter: {
        ...mockGameState.lpcCharacter!,
        headModel: 'minotaur' // Full Mask Head
      }
    };

    const handleUpdate = vi.fn();
    render(React.createElement(CharacterCreator, { state: maskState, onUpdateCharacter: handleUpdate }));

    // Switch to Facial Hair tab
    fireEvent.click(screen.getByRole('button', { name: /FACIAL HAIR/i }));

    // Red notice banner present
    expect(screen.getByText(/Facial features and hair are disabled for the active head model/i)).toBeInTheDocument();

    // Feature buttons should be disabled
    const beardButton = screen.getByTitle('Basic Beard');
    expect(beardButton).toBeDisabled();
    expect(beardButton.style.cursor).toBe('not-allowed');
  });

  it('should display yellow notice banner and disable ears/horns while keeping beard/mustache enabled when Orc head is active', () => {
    const orcState: GameState = {
      ...mockGameState,
      lpcCharacter: {
        ...mockGameState.lpcCharacter!,
        headModel: 'orc_male'
      }
    };

    const handleUpdate = vi.fn();
    render(React.createElement(CharacterCreator, { state: orcState, onUpdateCharacter: handleUpdate }));

    // Switch to Side Features tab
    fireEvent.click(screen.getByText(/SIDE FEATURES/i));

    // Yellow notice banner present
    expect(screen.getByText(/Long Ears and Horns are disabled for Orc head models/i)).toBeInTheDocument();

    // Ears & Horns buttons disabled
    const earButton = screen.getByTitle('Elven Long Ears');
    expect(earButton).toBeDisabled();
    expect(earButton.style.cursor).toBe('not-allowed');

    const hornButton = screen.getByTitle('Curled Horns');
    expect(hornButton).toBeDisabled();
    expect(hornButton.style.cursor).toBe('not-allowed');

    // Switch to Facial Hair tab & verify Beard button ENABLED
    fireEvent.click(screen.getByRole('button', { name: /FACIAL HAIR/i }));
    const beardButton = screen.getByTitle('Basic Beard');
    expect(beardButton).not.toBeDisabled();
  });

  it('should automatically fall back to female head model when switching body type from male to female', () => {
    const handleUpdate = vi.fn();
    render(React.createElement(CharacterCreator, { state: mockGameState, onUpdateCharacter: handleUpdate }));

    // Click Body Studio button
    const bodyStudioBtn = screen.getByRole('button', { name: /BODY STUDIO/i });
    fireEvent.click(bodyStudioBtn);

    // Click 'Human Female' body model button
    const femaleBodyButton = screen.getByTitle('Human Female');
    fireEvent.click(femaleBodyButton);

    expect(handleUpdate).toHaveBeenCalledWith({
      bodyType: 'female',
      headModel: 'human_female'
    });
  });
});
