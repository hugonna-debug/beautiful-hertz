# LPC Character Builder Multi-Layer Asset Integration & Flag Testing Skill

## Overview
This skill provides the comprehensive integration, rendering, and testing workflow for LPC (Liberated Pixel Art) character assets in multi-layer canvas character builders.

---

## Core Technical Invariants

### 1. 2-Tier Attachment Hierarchy
- **Tier 1 (Head to Body)**:
  Subfolder head models (`human_male`, `human_female`, `orc_male`, `orc_female`) resolve to `/run/${tone}.png` (8-column animated sheet) during active actions (`walk`, `slash`, `spellcast`).
- **Tier 2 (Features to Head)**:
  Hair, Beards, Mustaches, Horns, Long Ears, and Accessories are attached directly to the **Head**. They render using the Head's direction row (`dirIndex % totalRows`) and inherit 100% of the head's 3D posture micro-offsets and frame bobbing.

### 2. Required Layer Spec Flags (`LayerSpec`)
When building `layers[]` in canvas composition, every layer object MUST explicitly set its target flag:
- `isBody`: Base body layer (`bodies/...`)
- `isHead`: Modular head layer (`heads/...`)
- `isHair`: Hairstyle layer (`hair/...`)
- `isFacialHair`: Beards, Mustaches, and Horns (`facial_features/...`)
- `isEars`: Long Ears (`long ears/...`)
- `isAcc`: Glasses, Eyepatch, Face paint (`features/...`)
- `isLegs`: Legs / Pants layer (`legs/...`)

> ⚠️ **CRITICAL RULE**: Never omit `isFacialHair`, `isEars`, `isHair`, or `isAcc` on head-attached layers. Omitting the flag causes features to skip posture offsets and float above the face.

---

## 3. Frame Bobbing & 3D Posture Micro-Offsets

```typescript
// Dynamic 3D Head & Attached Features Posture Alignment Engine
let alignOffsetX = 0;
let alignOffsetY = 0;

const isHeadOrAttachedFeature = spec.isHead || spec.isHair || spec.isFacialHair || spec.isEars || spec.isAcc;

if (isHeadOrAttachedFeature) {
  if (action === 'walk' && (isHeadAttachedFeature || h <= 384)) {
    // 100% Locked 17px Relative Distance Frame Bobbing
    if (colIndex === 1 || colIndex === 5) {
      alignOffsetY += 2;
    } else if (colIndex === 3 || colIndex === 7) {
      alignOffsetY -= 1;
    }
  } else if (action === 'slash') {
    if (direction === 'south') {
      if (colIndex === 2 || colIndex === 3) alignOffsetY += 1;
    } else if (direction === 'east') {
      if (colIndex === 0 || colIndex === 1) alignOffsetX -= 1;
      else if (colIndex === 2 || colIndex === 3) { alignOffsetX += 2; alignOffsetY += 1; }
    } else if (direction === 'west') {
      if (colIndex === 0 || colIndex === 1) alignOffsetX += 1;
      else if (colIndex === 2 || colIndex === 3) { alignOffsetX -= 2; alignOffsetY += 1; }
    } else if (direction === 'north') {
      if (colIndex === 2 || colIndex === 3) alignOffsetY += 1;
    }
  } else if (action === 'spellcast') {
    if (colIndex >= 2 && colIndex <= 4) alignOffsetY -= 1;
  }
}
```

---

## 4. Ear Skin Palette Canvas Composite Tinting
Long ears use base grayscale/outline sheets (`female.png`, `male.png`). Render using offscreen canvas `multiply` composite tinting with the active skin palette hex code.

---

## 5. Verification Checklist for New Assets
- [ ] Asset copied into `public/assets/character_creator/{category}/`
- [ ] Layer spec includes explicit flag (`isFacialHair`, `isEars`, `isHair`, `isAcc`)
- [ ] Bracket override rules enforced (e.g. `horns` overrides `longEars`, `head` overrides `features`)
- [ ] Unit test in `src/tests/lpcLayerSpec.test.ts` passes
- [ ] Dev server visual check with HMR at `http://localhost:5174/`
