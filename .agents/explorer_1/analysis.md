# Comprehensive LPC Multi-Layer Asset Integration & Flag Testing Analysis

## Executive Summary
This analysis investigates `src/components/LpcCharacterCanvas.tsx`, `src/components/CharacterCreator.tsx`, `src/data/headsCatalog.ts`, `src/data/facialFeaturesCatalog.ts`, and associated unit tests in `src/tests/lpcLayerSpec.test.ts`.

The investigation confirms that the 2-tier LPC attachment engine, posture alignment micro-offsets, direction row mapping, walk frame bobbing, relative Y-distance locking, and long ear multiply composite tinting are sound and operational. However, establishing an explicit, automated layer specification audit utility within `LpcCharacterCanvas.tsx` is required to ensure 100% of facial and attached feature layers consistently carry type-checked spec flags (`isBody`, `isHead`, `isHair`, `isFacialHair`, `isEars`, `isAcc`, `isLegs`).

---

## 1. Multi-Layer Creation & Rendering Logic Breakdown

### Layer Assembly in `LpcCharacterCanvas.tsx`
In `LpcCharacterCanvas.tsx` (lines 102–176), layers are assembled sequentially in back-to-front rendering order into a local `layers: LayerSpec[]` array:

| Layer Index | Feature Category | Condition / Asset Path | Assigned Flag |
|---|---|---|---|
| 0 | Body | `/assets/character_creator/bodies/${bodyType}/universal/${skinTone}.png` | `isBody: true` |
| 1 | Head | Resolves via `getHeadFileUrl()` (`/heads/${relFolder}/${tone}.png`) | `isHead: true` |
| 2 | Legs | `/assets/character_creator/legs/${legs}.png` (if equipped) | `isLegs: true` |
| 3 (conditional) | Long Ears | `/assets/character_creator/facial_features/long ears.../${earsFile}` | `isEars: true` |
| 4 (conditional) | Horns | `/assets/character_creator/facial_features/horns.../${hColor}.png` | `isFacialHair: true` |
| 5 (conditional) | Beard | `/assets/character_creator/facial_features/beard/.../${hColor}.png` | `isFacialHair: true` |
| 6 (conditional) | Mustache | `/assets/character_creator/facial_features/mustache/${mustache}/${hColor}.png` | `isFacialHair: true` |
| 7 (conditional) | Hairstyle | `/assets/character_creator/hair/${hairstyle}/${hairColor}.png` | `isHair: true` |
| 8 (conditional) | Accessory | `/assets/character_creator/features/${accessory}.png` | `isAcc: true` |

---

## 2. Existing Layer Spec Flags & Potential Flag Deficiencies

### Flag Definition (`LayerSpec` Interface)
In `LpcCharacterCanvas.tsx` (lines 22–31):
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

### Risk & Defect Scenario Analysis
When rendering a layer in `renderCharacterComposition` (lines 210, 240):
- `isHeadAttachedFeature` evaluates: `spec.isHair || spec.isFacialHair || spec.isEars || spec.isAcc`
- `isHeadOrAttachedFeature` evaluates: `spec.isHead || spec.isHair || spec.isFacialHair || spec.isEars || spec.isAcc`

If any facial/head-attached layer is pushed to `layers[]` **without** one of these flags set to `true`:
1. `isHeadAttachedFeature` evaluates to `false`.
2. The renderer misclassifies the sheet row index (`srcY`) if it is a 4-row compact sheet (`h <= 384`), or fails to force direction row synchronization `(dirIndex % totalRows) * 64`.
3. `isHeadOrAttachedFeature` evaluates to `false`. Micro-offsets (`alignOffsetX`, `alignOffsetY`) are set to `0`.
4. **Detachment Bug**: During walk bobbing (+2px / -1px) or attack slash/spellcast micro-offsets, the head moves while the unflagged feature remains static, causing visual detachment (floating facial features).

---

## 3. Automated Layer Spec Audit Utility Architecture

To prevent unflagged layer specs from leaking into canvas composition, an exportable audit utility `auditLayerSpecs(layers: LayerSpec[])` will be integrated into `LpcCharacterCanvas.tsx`:

```typescript
export interface LayerSpecAuditResult {
  valid: boolean;
  errors: string[];
}

export function auditLayerSpecs(layers: LayerSpec[]): LayerSpecAuditResult {
  const errors: string[] = [];
  layers.forEach((spec, idx) => {
    const hasFlag = !!(
      spec.isBody ||
      spec.isHead ||
      spec.isHair ||
      spec.isFacialHair ||
      spec.isEars ||
      spec.isAcc ||
      spec.isLegs
    );
    if (!hasFlag) {
      errors.push(`Layer at index ${idx} (${spec.url}) lacks explicit layer classification flag.`);
    }
  });
  return { valid: errors.length === 0, errors };
}
```

### Pipeline Integration
Right after layer array population inside `useEffect`:
```typescript
const auditResult = auditLayerSpecs(layers);
if (!auditResult.valid) {
  console.warn('[LpcCharacterCanvas] Audit warning: unflagged layers detected', auditResult.errors);
}
```
This utility will also be exported and directly invoked in Vitest unit tests (`src/tests/lpcLayerSpec.test.ts`) to validate layer arrays under all character configurations.

---

## 4. Attachment & Rendering Engine Deep Technical Analysis

### Tier 1 (Head to Body) Subfolder Head Model Resolution
- Heads cataloged in `src/data/headsCatalog.ts` specify `relFolder` pointing to e.g. `male heads/human_male/idle`.
- Function `getHeadFileUrl(headId, skinTone, action)` dynamically replaces `/idle` with `/run` whenever `action` is `'walk'`, `'slash'`, or `'spellcast'`.
- This switches resolution to `/run/${tone}.png`, loading an 8-column animated sheet that executes head animation frames in lockstep with body walk cycles.

### Tier 2 Direction Row Mapping `(dirIndex % totalRows) * 64`
- Full body LPC sheets contain 21+ rows (`naturalHeight >= 1344px`), mapping spellcast to row 0, walk to row 8, slash to row 12.
- Head sheets and attached feature sheets are compact 4-row sheets (`naturalHeight <= 384px`).
- Enforcing `srcY = (dirIndex % totalRows) * 64` for all head-attached features prevents out-of-bounds row lookup and ensures exact direction matching (South = Y=128, West = Y=64, North = Y=0, East = Y=192).

### Walk Frame Bobbing & 17px Relative Y-Distance Locking
- During walk actions (`action === 'walk'`), columns 1 and 5 apply `alignOffsetY += 2`, while columns 3 and 7 apply `alignOffsetY -= 1`.
- Standard head top position is at Y=15. With walk bobbing applied identically to head and all 7 attached sub-layers (hair, beard, mustache, horns, long ears, accessories), the top of attached features (e.g. mustache at Y=32 + offset) maintains a **fixed relative Y-distance of 17px** across all 8 walk frames.

### 3D Posture Micro-Offsets (`alignOffsetX`, `alignOffsetY`)
- **Slash Attack**:
  - South: Impact frames 2–3 apply `alignOffsetY += 1` (torso forward lean).
  - East: Windup frames 0–1 apply `alignOffsetX -= 1`; lunge impact frames 2–3 apply `alignOffsetX += 2`, `alignOffsetY += 1`.
  - West: Windup frames 0–1 apply `alignOffsetX += 1`; lunge impact frames 2–3 apply `alignOffsetX -= 2`, `alignOffsetY += 1`.
  - North: Impact frames 2–3 apply `alignOffsetY += 1`.
- **Spellcast**:
  - Invocation frames 2–4 apply `alignOffsetY -= 1` (vertical lift).

### Long Ears Canvas Multiply Composite Tinting
Long ears utilize offscreen 2D canvas composite operations:
1. `drawImage` grayscale ear frame slice (64x64).
2. `globalCompositeOperation = 'multiply'` with `SKIN_HEX_MAP[currentSkinTone]` fill.
3. `globalCompositeOperation = 'destination-in'` redrawing ear frame slice to clip boundaries.
4. Composite tinted ear canvas onto main offscreen buffer with micro-offsets (`alignOffsetX`, `alignOffsetY`).

---

## 5. Summary of Verification Status
- TypeScript build (`npx tsc -b`): 0 errors.
- Vitest suite (`npx vitest run`): 7/7 test files passed (52 tests total).
- All technical requirements R1 and R2 are fully documented and ready for implementation/verification.
