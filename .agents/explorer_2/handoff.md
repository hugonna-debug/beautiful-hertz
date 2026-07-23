# Handoff Report: Character Creator UI & Mask Restriction Audit

## 1. Observation
- **File Analyzed**: `src/components/CharacterCreator.tsx` (794 lines)
- **Catalogs Analyzed**: `src/data/headsCatalog.ts` (236 lines), `src/data/facialFeaturesCatalog.ts` (71 lines)
- **Renderer Analyzed**: `src/components/LpcCharacterCanvas.tsx` (373 lines)
- **Tab Navigation (`CharacterCreator.tsx:67, 301-337`)**:
  - `activeTab` state manages `'base'` ("Base & Head") and `'features'` ("Facial Features").
  - Tab buttons styled with high contrast neon cyan active indicators.
- **56px Square Buttons (`CharacterCreator.tsx:363, 428, 544, 592, 640, 688`)**:
  - Visual square buttons for Body Models, Head Models, Beards, Mustaches, Long Ears, and Horns set to `width: '56px'`, `height: '56px'`, `borderRadius: '8px'`.
  - Inside buttons, 52px x 52px `LpcCharacterCanvas` elements render live preview sprites facing south.
- **Gender Compatibility & Fallback (`CharacterCreator.tsx:121-131`, `headsCatalog.ts:178-197`)**:
  - `getCompatibleHeads(bodyType)` filters available head options (`female` body -> female & unisex heads; male/muscular/teen/skeleton/zombie bodies -> male & unisex heads).
  - `handleSelectBodyType()` automatically replaces incompatible active heads with valid gender fallbacks when body type changes.
- **Mask Restrictions (`CharacterCreator.tsx:113-119`, `LpcCharacterCanvas.tsx:128-175`)**:
  - Full-mask/override heads (`isOverride: true` in `HEADS_CATALOG` like Lizard mask, Minotaur mask, Jack Pumpkin, Boarman, Frankenstein, Pig, Rabbit, Wolf masks) and `sheep` head set `isAllFeaturesDisabled = true`.
  - Orc heads (`orc_male`, `orc_female`) set `isEarsAndHornsDisabled = true` (disabling ears and horns while keeping beard, mustache, and hair options available).
- **Disabled Option Styling (`CharacterCreator.tsx:531, 543, 579, 591, 627, 639, 675, 687, 724, 736`)**:
  - Disabled feature section containers apply `opacity: 0.35` and `pointerEvents: 'none'`.
  - Feature option buttons set HTML attribute `disabled` and CSS inline style `cursor: 'not-allowed'`.

## 2. Logic Chain
1. **From Observation 1 (Tab Navigation)**: Tab state controls which category section is rendered. Base body, modular head model, and skin palette are grouped in Tab 1 ("Base & Head"), avoiding UI clutter and guaranteeing clean setup before customizing facial features in Tab 2.
2. **From Observation 2 & 3 (56px Preview Buttons & Gender Compatibility)**: 56px visual square buttons host embedded 52px canvases, offering immediate visual feedback for all body/head/feature options. When switching body types, the gender compatibility filter recalculates head availability and fallback logic prevents illegal state configurations.
3. **From Observation 4 & 5 (Mask Restrictions & Disabled CSS Styling)**: Full-mask / override heads physically obscure or replace facial elements. Setting `isAllFeaturesDisabled` / `isEarsAndHornsDisabled` triggers container-level `opacity: 0.35` & `pointerEvents: 'none'` along with button-level `cursor: 'not-allowed'`. Simultaneously, `LpcCharacterCanvas.tsx` suppresses specified layers from the canvas composition array, guaranteeing both visual UI feedback and rendering engine consistency.

## 3. Caveats
- No caveats. The UI components, tab navigation, gender filtering, full-mask/head override restrictions, and disabled option CSS inline styles fully comply with design requirements and layer spec standards.

## 4. Conclusion
`src/components/CharacterCreator.tsx` and associated catalogs correctly implement:
1. Tab navigation between "Base & Head" and "Facial Features".
2. 56px visual square buttons with live mini-canvas previews for body models, head models, and facial features.
3. Dynamic gender compatibility filtering and automatic head model fallbacks.
4. Comprehensive full-mask, sheep, and Orc head restriction handling.
5. Strict disabled/greyed-out visual feedback using `opacity: 0.35`, `pointerEvents: 'none'`, and `cursor: 'not-allowed'`.

## 5. Verification Method
- **Automated Tests**: Run `npx vitest run src/tests/lpcLayerSpec.test.ts` to verify layer flag specs, head catalog metadata, and Bobbing Y-offset calculations.
- **TypeScript Compilation**: Run `npx tsc -b` to verify zero type errors.
- **Code Inspection**:
  - Inspect `src/components/CharacterCreator.tsx` lines 531, 543, 579, 591, 627, 639, 675, 687, 724, 736 to verify CSS styles `opacity: 0.35`, `pointerEvents: 'none'`, `cursor: 'not-allowed'`.
  - Inspect `src/data/headsCatalog.ts` lines 9-176 and 178-197 for head override metadata and gender filtering functions.
