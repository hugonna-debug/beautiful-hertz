# Project: LPC Multi-Layer Asset Integration & Flag Testing Standard

## Architecture
- `LpcCharacterCanvas.tsx`: Multi-layer HTML5 Canvas renderer executing 2-tier LPC attachment hierarchy, 3D posture alignment micro-offsets (`alignOffsetX`, `alignOffsetY`), direction row mapping `(dirIndex % totalRows) * 64`, walk bobbing, long ears composite multiply tinting, and exportable pure audit function `auditLayerSpecs(layers)`.
- `CharacterCreator.tsx`: UI component for character customization with tab navigation, 56px square mini-canvas previews, disabled states for restricted options (head overrides/masks/gender), and live preview updates.
- `src/tests/lpcLayerSpec.test.ts`: Automated unit test suite using Vitest verifying layer spec flags, offset calculations, bobbing matching, head overrides, and gender restrictions.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | R1: Comprehensive Layer Spec Flag Validation & Audit Suite | Add explicit type-checked flags (`isBody`, `isHead`, `isHair`, `isFacialHair`, `isEars`, `isAcc`, `isLegs`) to `layers[]` and automated layer spec audit utility in `LpcCharacterCanvas.tsx` | none | DONE |
| 2 | R2: Head-Centric Attachment & 3D Posture Alignment Engine | Enforce 2-tier hierarchy, dynamic subfolder `/run/${tone}.png` resolution during animations, row calculation `(dirIndex % totalRows) * 64`, posture micro-offsets (`alignOffsetX`, `alignOffsetY`), 17px relative Y-distance locking, and long ears multiply composite tinting | M1 | DONE |
| 3 | R3: Automated Vitest Suite for Layer Specs & Offset Integrity | Create/expand unit tests in `src/tests/` verifying layer flags, bobbing micro-offsets (+2px / -1px), gender compatibility, and mask/head overrides | M1, M2 | DONE |
| 4 | R4: Character Creator UI Visual Feedback & Tab Smoothness | Implement disabled/greyed-out states (opacity 0.35, pointerEvents 'none', cursor 'not-allowed'), tab navigation, 56px mini-canvas buttons, and complete E2E/TypeScript build validation | M1, M2, M3 | DONE |

## Code Layout
- `src/components/character/LpcCharacterCanvas.tsx` (or `src/components/LpcCharacterCanvas.tsx`)
- `src/components/CharacterCreator.tsx`
- `src/data/headsCatalog.ts`
- `src/data/hairstylesCatalog.ts`
- `src/data/facialFeaturesCatalog.ts`
- `src/tests/lpcLayerSpec.test.ts`
