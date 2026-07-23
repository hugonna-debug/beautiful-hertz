# Original User Request

## 2026-07-23T03:46:11Z

<USER_REQUEST>
Implement a comprehensive, battle-tested LPC Multi-Layer Asset Integration & Flag Testing Standard for the Character Creator system in feature-creep-clicker-game.

Working directory: C:\Users\hudso\.gemini\antigravity\worktrees\beautiful-hertz\feature-creep-clicker-game
Integrity mode: development

## Requirements

### R1. Comprehensive Layer Spec Flag Validation & Audit Suite
Establish a strict, automated layer specification audit mechanism in LpcCharacterCanvas.tsx:
1. Every layer added to layers[] (Body, Head, Legs, Long Ears, Horns, Beard, Mustache, Hair, Accessories) MUST carry explicit, type-checked layer flags (isBody, isHead, isHair, isFacialHair, isEars, isAcc, isLegs).
2. An automated audit utility must verify that no layer spec omits its corresponding flag, preventing detachment bugs where features fail to qualify for 3D posture alignment or head bobbing offsets.

### R2. Head-Centric Attachment & 3D Posture Alignment Engine
Enforce a strict 2-tier attachment hierarchy in multi-layer canvas rendering:
1. Tier 1 (Head to Body): Subfolder head models (human_male, human_female, orc_male, orc_female) map to /run/${tone}.png during animations, executing posture offsets (alignOffsetX, alignOffsetY) during slash attacks and spellcasts.
2. Tier 2 (Features to Head): Hair, Beards, Mustaches, Horns, Long Ears, and Accessories evaluate (dirIndex % totalRows) * 64 (Head's direction row) and inherit 100% of the head's 3D posture micro-offsets (alignOffsetX, alignOffsetY) and frame bobbing (+2px on cols 1/5, -1px on cols 3/7).
3. Relative Distance Locking: Relative Y-distance between facial features and face/head top MUST remain fixed (17px) across all 8 walk frames, 6 slash frames, and 7 spellcast frames across all 4 directions (Front, Right, Back, Left).

### R3. Automated Vitest Suite for Layer Specs & Offset Integrity
Add unit tests in src/tests/ verifying:
1. Every facial feature (Beard, Mustache, Horns, Ears, Hair, Accessories) correctly resolves with isFacialHair: true, isEars: true, isHair: true, or isAcc: true.
2. Offset calculations for walk frame bobbing (+2px on cols 1/5, -1px on cols 3/7) match between Head and all attached features.
3. Gender compatibility and full-mask/head override flags (Sheep head, Orc heads, Lizard mask, Minotaur mask) correctly enable/disable layer specs.

### R4. Character Creator UI Visual Feedback & Tab Smoothness
Ensure the CharacterCreator.tsx UI clearly reflects:
1. Disabled/greyed-out states (opacity: 0.35, pointerEvents: 'none', cursor: 'not-allowed') for feature selections restricted by active head models.
2. Seamless tab navigation between Base & Head and Facial Features.
3. 56px visual square mini-canvas preview buttons for all options.

## Acceptance Criteria

### Layer Specs & Rendering Engine
- [ ] 100% of facial feature layers (beard, mustache, horns, long ears, hair, accessories) carry valid spec flags in LpcCharacterCanvas.tsx.
- [ ] Relative Y-distance between head model and attached face features stays locked at 17px across all 8 walk frames.
- [ ] 3D posture alignment offsets (alignOffsetX, alignOffsetY) apply identically to head and all 7 attached sub-layers during Slash attacks and Spellcasts.
- [ ] Long ears dynamically tint using canvas multiply composite operations to match selected skin tone swatches.

### Automated Testing & Compilation
- [ ] npx tsc -b compiles with 0 errors.
- [ ] npx vitest run passes 100% of unit tests including new layer spec and offset integrity tests.
- [ ] Local dev server (npm run dev) runs at http://localhost:5174/ with HMR active and 0 console errors.
</USER_REQUEST>
