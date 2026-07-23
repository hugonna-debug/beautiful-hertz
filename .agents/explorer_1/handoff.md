# Handoff Report — Explorer 1

## 1. Observation
- `src/components/LpcCharacterCanvas.tsx`:
  - `LayerSpec` interface defined at lines 22–31 (`url`, `isBody`, `isHead`, `isHair`, `isAcc`, `isFacialHair`, `isLegs`, `isEars`).
  - Layer array construction at lines 102–175: Body (`isBody: true`), Head (`isHead: true`), Legs (`isLegs: true`), Long Ears (`isEars: true`), Horns (`isFacialHair: true`), Beard (`isFacialHair: true`), Mustache (`isFacialHair: true`), Hairstyle (`isHair: true`), Accessory (`isAcc: true`).
  - Classification check at line 210: `const isHeadAttachedFeature = spec.isHair || spec.isFacialHair || spec.isEars || spec.isAcc;`
  - Posture check at line 240: `const isHeadOrAttachedFeature = spec.isHead || spec.isHair || spec.isFacialHair || spec.isEars || spec.isAcc;`
  - Row index calculation at lines 212–224: `srcY = (dirIndex % totalRows) * 64` for head-attached features vs `(actionRowOffset + dirIndex) * 64` for full body sheets (`h >= 1344`).
  - Walk bobbing micro-offset at lines 244–248: `colIndex === 1 || colIndex === 5` (`alignOffsetY += 2`), `colIndex === 3 || colIndex === 7` (`alignOffsetY -= 1`).
  - Long ears canvas composite tinting at lines 266–282 (`multiply` composite mode, `destination-in` alpha clipping).
- `src/data/headsCatalog.ts`:
  - Lines 199–235: `getHeadFileUrl` dynamically swaps `/idle` to `/run` for animated actions (`walk`, `slash`, `spellcast`), returning `/run/${tone}.png`.
- `src/tests/lpcLayerSpec.test.ts`:
  - Lines 1–62: Contains unit tests validating head catalog entries, animated `/run` URL resolution, facial feature options, and frame bobbing relative Y-distance offset calculations (17px locking).
- Build and Test Execution:
  - `npx tsc -b` completed with 0 errors.
  - `npx vitest run` passed 7/7 test files (52 passed tests).

## 2. Logic Chain
1. *Observation*: Line 240 in `LpcCharacterCanvas.tsx` checks `spec.isHead || spec.isHair || spec.isFacialHair || spec.isEars || spec.isAcc` before applying posture offsets (`alignOffsetX`, `alignOffsetY`).
2. *Observation*: Line 210 checks `isHeadAttachedFeature` to enforce head direction row mapping `(dirIndex % totalRows) * 64`.
3. *Logic Step*: If any head-attached layer (beard, mustache, horns, long ears, hair, accessory) is added to `layers[]` without its corresponding boolean flag set, both checks evaluate to `false`.
4. *Logic Step*: Consequently, unflagged layers fall back to default body row offsets or omit micro-offsets (`alignOffsetX = 0`, `alignOffsetY = 0`). During walk bobbing (+2px / -1px) and posture shifts (slash lunge, spellcast lift), the head shifts while unflagged features stay fixed, creating visual detachment.
5. *Logic Step*: Implementing an explicit `auditLayerSpecs(layers: LayerSpec[])` utility function in `LpcCharacterCanvas.tsx` that scans every layer object and verifies at least one classification flag is `true` guarantees 100% flag coverage and catches unflagged specs before rendering.
6. *Logic Step*: Exporting `auditLayerSpecs` allows Vitest unit tests in `src/tests/lpcLayerSpec.test.ts` to automatically validate layer specification integrity across all character builder options.

## 3. Caveats
- No source code modifications were made during this investigation phase in compliance with read-only explorer constraints.
- Real-time DOM canvas rendering testing in a headless environment relies on offscreen canvas context mocks in Vitest.

## 4. Conclusion
- The core rendering engine in `LpcCharacterCanvas.tsx` correctly handles Tier 1 head resolution (`/run/${tone}.png`), 2-tier attachment row mapping `(dirIndex % totalRows) * 64`, walk frame bobbing (+2px / -1px), 17px relative Y-distance locking, posture alignment micro-offsets, and long ears multiply composite tinting.
- Implementers should export `auditLayerSpecs(layers: LayerSpec[])` from `LpcCharacterCanvas.tsx` and integrate it into the canvas `useEffect` pipeline and Vitest test suite (`src/tests/lpcLayerSpec.test.ts`).

## 5. Verification Method
1. Run `npx tsc -b` to verify TypeScript compilation.
2. Run `npx vitest run` to execute unit tests.
3. Inspect `LpcCharacterCanvas.tsx` lines 102–176, 210–224, 240–265, and 266–282 to confirm layer flag assignments and rendering pipeline logic.
