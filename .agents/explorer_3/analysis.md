# Analysis Report: LPC Multi-Layer Asset Integration & Test/Build Setup Audit

**Author**: Explorer 3  
**Working Directory**: `C:\Users\hudso\.gemini\antigravity\worktrees\beautiful-hertz\feature-creep-clicker-game\.agents\explorer_3`  
**Date**: 2026-07-23  

---

## Executive Summary
This investigation audits the existing unit testing suite (`src/tests/`), build compilation setup, and LPC (Universal Character Generator) rendering engine spec definitions in `src/components/LpcCharacterCanvas.tsx`. 

- **TypeScript Compilation (`npx tsc -b`)**: **PASSED** (0 errors).
- **Vitest Unit Test Suite (`npx vitest run`)**: **PASSED** (7 test suites, 52 total tests passing).
- **Current LPC Test Coverage**: `src/tests/lpcLayerSpec.test.ts` exists but only tests high-level catalog metadata (`HEADS_CATALOG`), basic head URL resolution (`getHeadFileUrl`), facial feature catalogs, and an inline pure math formula for walk bobbing.
- **Key Test Coverage Gaps**:
  1. `LpcCharacterCanvas.tsx` constructs `layers: LayerSpec[]` internally inside a React `useEffect` without exporting layer spec generation or auditing logic.
  2. Missing automated validation for explicit layer spec flags (`isBody`, `isHead`, `isHair`, `isFacialHair`, `isEars`, `isAcc`, `isLegs`).
  3. Missing automated tests for 3D posture alignment micro-offsets (`alignOffsetX`, `alignOffsetY`) during `slash` attacks and `spellcast` actions across all 4 directions (`south`, `east`, `west`, `north`).
  4. Missing comprehensive test coverage for head override / full-mask feature suppression (Sheep, Minotaur, Lizard, Wolf, Jack Pumpkin, Boarman, Frankenstein, Pig, Rabbit) and Orc head restrictions (suppressing horns and long ears).
  5. Missing tests for gender compatibility filtering (`getCompatibleHeads` and `isHeadCompatibleWithBody`).

---

## 1. Existing Unit Test Suite Inspection (`src/tests/`)

The project contains 4 files in `src/tests/`:

| File | Purpose | Test Cases |
|------|---------|------------|
| `src/tests/setup.ts` | Test environment setup | Imports `@testing-library/jest-dom` |
| `src/tests/gameState.test.ts` | Game state, equipment, talents, reforging, combat, prestige | 15 unit tests |
| `src/tests/stateSanitizer.test.ts` | State migration & corruption recovery | 5 unit tests |
| `src/tests/lpcLayerSpec.test.ts` | LPC Catalog & Bobbing Math verification | 4 unit tests |

### Detailed Breakdown of `src/tests/lpcLayerSpec.test.ts`
Existing tests in `src/tests/lpcLayerSpec.test.ts`:
1. `should verify all heads in catalog have valid gender and override metadata`: Validates `HEADS_CATALOG` length > 15, `gender` in `['male', 'female', 'unisex']`, `isOverride` is boolean, and `relFolder` is non-empty.
2. `should resolve animated /run folder for heads during walk, slash, and spellcast actions`: Verifies `getHeadFileUrl` returns `/idle/` for idle action and `/run/` for walk and slash actions.
3. `should verify facial feature catalogs contain none option and valid category items`: Checks `BEARD_OPTIONS`, `MUSTACHE_OPTIONS`, `HORN_OPTIONS`, and `EAR_OPTIONS` have `{ id: 'none' }`.
4. `should calculate identical Y-offset for head-attached features across walk frames`: Tests an inline function `getWalkBobbingOffset(colIndex)` for columns 0..7 and asserts relative Y-distance lock of 17px.

---

## 2. Analysis of `LpcCharacterCanvas.tsx` Layer Specs & Offset Engine

### Layer Spec Construction (Lines 22–31 & 102–175)
In `src/components/LpcCharacterCanvas.tsx`:
```typescript
interface LayerSpec {
  url: string;
  isBody?: boolean;
  isHead?: boolean;
  isHair?: boolean;
  isAcc?: boolean;
  isFacialHair?: boolean;
  isLegs?: boolean;
  isEars?: boolean;
}
```
Currently, `layers: LayerSpec[]` is created inline inside `useEffect`:
- Body layer: `{ url: bodyUrl, isBody: true }`
- Head layer: `{ url: headUrl, isHead: true }`
- Legs layer: `{ url: ..., isLegs: true }`
- Long Ears: `{ url: ..., isEars: true }`
- Horns: `{ url: ..., isFacialHair: true }`
- Beard: `{ url: ..., isFacialHair: true }`
- Mustache: `{ url: ..., isFacialHair: true }`
- Hair: `{ url: ..., isHair: true }`
- Accessory: `{ url: ..., isAcc: true }`

**Problem**: Because this logic is embedded directly inside a React `useEffect`, unit test files cannot import or run layer resolution without rendering the full React component in JSDOM (which lacks canvas element 2D context drawing methods).

**Recommendation**: Refactor or extract a pure helper function (e.g. `export function getCharacterLayerSpecs(config: Partial<LpcCharacterConfig>, action?: string): LayerSpec[]` or an audit utility in `src/utils/lpcLayerAudit.ts`) so Vitest can execute 100% pure unit tests against layer specs.

### Posture Alignment & Bobbing Engine (Lines 235–265)
In `LpcCharacterCanvas.tsx`:
- **Walk Bobbing**:
  - `colIndex === 1 || colIndex === 5` -> `alignOffsetY += 2`
  - `colIndex === 3 || colIndex === 7` -> `alignOffsetY -= 1`
- **Slash Attack 3D Posture Alignments**:
  - `south`: frames 2..3 -> `alignOffsetY += 1`
  - `east`: frames 0..1 -> `alignOffsetX -= 1`; frames 2..3 -> `alignOffsetX += 2`, `alignOffsetY += 1`
  - `west`: frames 0..1 -> `alignOffsetX += 1`; frames 2..3 -> `alignOffsetX -= 2`, `alignOffsetY += 1`
  - `north`: frames 2..3 -> `alignOffsetY += 1`
- **Spellcast 3D Posture Alignments**:
  - frames 2..4 -> `alignOffsetY -= 1`
- **Ear Color Tinting (Lines 266–284)**:
  - Uses `globalCompositeOperation = 'multiply'` with `SKIN_HEX_MAP[currentSkinTone]` and `'destination-in'` alpha masking.

---

## 3. Missing Test Cases Specification

To achieve full compliance with Requirements R1, R2, and R3, the following new test suites and test cases must be implemented in `src/tests/lpcLayerSpec.test.ts` (or `src/tests/lpcLayerAudit.test.ts`):

### Category A: Layer Spec Flag Validation Audit (R1 & R3.1)
- [ ] **Test A1**: Verify every layer generated in `layers[]` (Body, Head, Legs, Long Ears, Horns, Beard, Mustache, Hair, Accessories) carries exactly one explicit boolean flag (`isBody`, `isHead`, `isLegs`, `isEars`, `isFacialHair`, `isHair`, or `isAcc`).
- [ ] **Test A2**: Verify an automated audit utility rejects any layer spec missing a flag or containing multiple conflicting primary layer flags.
- [ ] **Test A3**: Verify that `isFacialHair: true` is assigned to Beard, Mustache, and Horn layers.
- [ ] **Test A4**: Verify that `isEars: true` is assigned to Elven Long Ears layers.
- [ ] **Test A5**: Verify that `isHair: true` is assigned to Hairstyle layers.
- [ ] **Test A6**: Verify that `isAcc: true` is assigned to Accessory layers.

### Category B: Bobbing & 3D Posture Micro-Offset Calculations (R2 & R3.2)
- [ ] **Test B1**: Verify walk frame bobbing micro-offsets (`+2px` on frames 1 & 5, `-1px` on frames 3 & 7, `0px` on frames 0, 2, 4, 6) apply identically to Head and attached sub-layers (`isHair`, `isFacialHair`, `isEars`, `isAcc`).
- [ ] **Test B2**: Verify relative Y-distance locking between Head top (base 15px) and facial feature top (base 32px) stays constant at 17px across all 8 walk frames.
- [ ] **Test B3**: Verify Slash Attack 3D posture alignment micro-offsets across all 4 directions:
  - `south`: frame 2 & 3 -> `alignOffsetY = +1`
  - `east`: frame 0 & 1 -> `alignOffsetX = -1`; frame 2 & 3 -> `alignOffsetX = +2, alignOffsetY = +1`
  - `west`: frame 0 & 1 -> `alignOffsetX = +1`; frame 2 & 3 -> `alignOffsetX = -2, alignOffsetY = +1`
  - `north`: frame 2 & 3 -> `alignOffsetY = +1`
- [ ] **Test B4**: Verify Spellcast posture alignment micro-offsets (frames 2, 3, 4 -> `alignOffsetY = -1`) apply identically across head and attached features.

### Category C: Gender Compatibility & Head/Mask Override Flags (R3.3)
- [ ] **Test C1**: Gender filtering compliance (`getCompatibleHeads` & `isHeadCompatibleWithBody`):
  - Female body configuration returns only female (`human_female`, `human_female_elderly`, `orc_female`, `lizard_female`, `wolf_female`) and unisex heads (`alien`, `goblin`, `sheep`, `skeleton`, `vampire`, `zombie`, `minotaur`, `boarman`, etc.), excluding all male heads.
  - Male body configuration returns only male and unisex heads, excluding female heads.
- [ ] **Test C2**: Full Mask Overrides (`isOverride: true`):
  - When a mask head (e.g. `minotaur`, `lizard_male`, `lizard_female`, `wolf_male`, `wolf_female`, `jack_no_palette`, `boarman`, `frankenstein`, `pig`, `rabbit`) is equipped, all facial features (beard, mustache, horns, long ears) and hair layers MUST be suppressed from `layers[]`.
- [ ] **Test C3**: Sheep Head Override (`sheep`):
  - When `headModel === 'sheep'`, all facial features, hair, and accessories MUST be suppressed from `layers[]`.
- [ ] **Test C4**: Orc Head Rules (`orc_male`, `orc_female`):
  - When an Orc head is active, long ears and horns MUST be suppressed from `layers[]`, but beard, mustache, and hair are permitted.
- [ ] **Test C5**: Priority Bracket Override (Horns vs Long Ears):
  - When horns are equipped (`curled` or `backwards`), long ears MUST be suppressed from `layers[]` even if `longEars` is set in config.

---

## 4. Build & Environment Verification Results

Command executions performed in the repository environment:

1. **TypeScript Build Verification**:
   ```bash
   npx tsc -b
   ```
   **Result**: Exit Code 0 (Success). All TypeScript files compile cleanly with zero errors.

2. **Vitest Unit Test Execution**:
   ```bash
   npx vitest run
   ```
   **Result**: Exit Code 0 (Success).
   - Test Files: 7 passed out of 7.
   - Tests: 52 passed out of 52.
   - Duration: 2.83s.

---

## 5. Architectural Recommendations for Next Steps

1. **Layer Spec Helper Extraction**:
   Export a pure function `getCharacterLayerSpecs(config: Partial<LpcCharacterConfig>, action?: string): LayerSpec[]` from `LpcCharacterCanvas.tsx` or a helper module. This will allow unit tests to directly invoke `getCharacterLayerSpecs` without needing DOM/Canvas rendering mocks.

2. **Expand `src/tests/lpcLayerSpec.test.ts`**:
   Add comprehensive test blocks for Categories A, B, and C as detailed above.

3. **UI Synchronization**:
   Ensure `CharacterCreator.tsx` disabled state logic matches the layer spec suppression rules 1:1 so the UI visual feedback (opacity 0.35, pointerEvents 'none', cursor 'not-allowed') accurately reflects what the canvas engine renders.
