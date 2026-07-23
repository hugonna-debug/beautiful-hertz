# Detailed Analysis of CharacterCreator.tsx & Associated UI Components

## Overview
This analysis investigates `src/components/CharacterCreator.tsx` and related data catalogs (`src/data/headsCatalog.ts`, `src/data/facialFeaturesCatalog.ts`) and rendering components (`src/components/LpcCharacterCanvas.tsx`). The objective is to audit tab navigation, feature option selectors, head model choices, gender selection/fallbacks, 56px visual square buttons, full-mask/head override restrictions, and disabled option CSS styling.

---

## 1. Component Architecture & File Mapping

| File Path | Role | Key Exports / Functions |
|-----------|------|-------------------------|
| `src/components/CharacterCreator.tsx` | Main Character Customization UI Component | `CharacterCreator` React FC |
| `src/data/headsCatalog.ts` | Head models catalog, gender compatibility & file path resolver | `HEADS_CATALOG`, `getCompatibleHeads()`, `isHeadCompatibleWithBody()`, `getHeadFileUrl()` |
| `src/data/facialFeaturesCatalog.ts` | Catalogs for facial features and color palettes | `BEARD_OPTIONS`, `MUSTACHE_OPTIONS`, `HORN_OPTIONS`, `EAR_OPTIONS`, `HAIR_COLORS`, `HORN_COLORS` |
| `src/components/LpcCharacterCanvas.tsx` | Multi-layer Canvas renderer for previews | `LpcCharacterCanvas` |
| `src/types/game.ts` | Type definitions | `LpcCharacterConfig`, `GameState`, `Equipment` |

---

## 2. Detailed Findings by Investigation Requirement

### Finding 1: Tab Navigation ("Base & Head" vs "Facial Features")
- **State Management**: Controlled by React state `const [activeTab, setActiveTab] = useState<'base' | 'features'>('base')` (`CharacterCreator.tsx:67`).
- **Tab Header Bar**: Rendered in `CharacterCreator.tsx:301-337`. Switches between `base` and `features`.
- **Tab Header Styling**: Active tab receives `background: 'var(--neon-cyan)'`, `color: '#000000'`, `fontWeight: 900`, `textTransform: 'uppercase'`. Inactive tab uses `background: 'transparent'`, `color: state.darkMode ? '#a1a1aa' : '#71717a'`.
- **Tab 1 ("Base & Head", lines 340-498)** contains:
  1. Body Model Selector (6 body types: `male`, `female`, `muscular`, `teen`, `skeleton`, `zombie`).
  2. Modular Head Model Selector (filtered by gender compatibility).
  3. Skin Palette Swatch Selector (23 skin tones with hex samples).
- **Tab 2 ("Facial Features", lines 501-788)** contains:
  1. Restriction Notice Banners (Red notice banner for full-mask/sheep heads; Yellow notice banner for Orc heads).
  2. Beard Selector (`BEARD_OPTIONS`).
  3. Mustache Selector (`MUSTACHE_OPTIONS`).
  4. Long Ears Selector (`EAR_OPTIONS`, matches skin palette).
  5. Horns Selector (`HORN_OPTIONS`, overrides long ears).
  6. Hair & Beard Color Palette (`HAIR_COLORS`, 16 swatches).
  7. Horn Color Palette (`HORN_COLORS`, 11 swatches; conditionally displayed when horns are equipped).

### Finding 2: Option Selectors, Gender Compatibility & 56px Visual Square Buttons
- **56px Visual Square Buttons**:
  - Body Model buttons (`CharacterCreator.tsx:363-364`): `width: '56px'`, `height: '56px'`, `borderRadius: '8px'`. Contains `<LpcCharacterCanvas width={52} height={52} direction="south" />`.
  - Head Model buttons (`CharacterCreator.tsx:428-429`): `width: '56px'`, `height: '56px'`, `borderRadius: '8px'`. Contains `<LpcCharacterCanvas width={52} height={52} direction="south" />`.
  - Beard buttons (`CharacterCreator.tsx:544-545`): `width: '56px'`, `height: '56px'`, `borderRadius: '8px'`. Contains `<LpcCharacterCanvas width={52} height={52} direction="south" />`.
  - Mustache buttons (`CharacterCreator.tsx:592-593`): `width: '56px'`, `height: '56px'`, `borderRadius: '8px'`. Contains `<LpcCharacterCanvas width={52} height={52} direction="south" />`.
  - Long Ears buttons (`CharacterCreator.tsx:640-641`): `width: '56px'`, `height: '56px'`, `borderRadius: '8px'`. Contains `<LpcCharacterCanvas width={52} height={52} direction="south" />`.
  - Horns buttons (`CharacterCreator.tsx:688-689`): `width: '56px'`, `height: '56px'`, `borderRadius: '8px'`. Contains `<LpcCharacterCanvas width={52} height={52} direction="south" />`.
- **Gender Selection & Auto-Fallback**:
  - `getCompatibleHeads(bodyType)` (`headsCatalog.ts:178-187`):
    - `female` body type -> filters to `gender === 'female' || gender === 'unisex'`.
    - `male`, `muscular`, `teen`, `skeleton`, `zombie` body types -> filters to `gender === 'male' || gender === 'unisex'`.
  - `handleSelectBodyType(newBodyType)` (`CharacterCreator.tsx:121-131`):
    - Verifies compatibility via `isHeadCompatibleWithBody(activeHeadId, newBodyType)`.
    - If current head is incompatible (e.g. switching from female to male while `human_female` is selected), automatically switches `headModel` to `newCompatibleHeads[0].id` or fallback (`human_male`/`human_female`).
- **Stage Preview & Action Buttons**:
  - Main stage (`CharacterCreator.tsx:168-207`): 140px x 140px canvas box with pedestal shadow ring and 4 directional rotation buttons (Front, Right, Back, Left).
  - Action preview buttons (`CharacterCreator.tsx:244-287`): 36px x 36px buttons with live animating mini-canvases for Walk, Slash, and Spellcast.

### Finding 3: Restrictions for Full-Mask / Override Head Models & Orc Heads
- **Head Catalog Classification (`headsCatalog.ts:9-176`)**:
  - **Override / Mask Heads (`isOverride: true`)**: `lizard_male`, `wolf_male`, `lizard_female`, `wolf_female`, `jack_no_palette`, `boarman`, `frankenstein`, `minotaur`, `pig`, `rabbit`.
  - **Special Animal Head**: `sheep`.
  - **Orc Heads**: `orc_male`, `orc_female`.
- **Restriction Logic (`CharacterCreator.tsx:113-119`)**:
  ```typescript
  const activeHeadObj = HEADS_CATALOG.find(h => h.id === activeHeadId);
  const isOverrideHead = activeHeadObj ? activeHeadObj.isOverride : false;
  const isSheepHead = activeHeadId === 'sheep';
  const isOrcHead = activeHeadId === 'orc_male' || activeHeadId === 'orc_female';

  const isAllFeaturesDisabled = isOverrideHead || isSheepHead;
  const isEarsAndHornsDisabled = isAllFeaturesDisabled || isOrcHead;
  ```
- **Behavior**:
  1. Full-Mask / Override / Sheep Heads: All facial feature options (Beard, Mustache, Long Ears, Horns, Hair & Beard Color Palette) are disabled (`isAllFeaturesDisabled = true`). Displays red notice banner.
  2. Orc Heads: Beards, Mustaches, and Hair Colors remain active. Long Ears and Horns are disabled (`isEarsAndHornsDisabled = true`). Displays yellow notice banner.

### Finding 4: CSS Inline & Class Style Compliance for Disabled Options
- Target style criteria: `opacity: 0.35`, `pointerEvents: 'none'`, `cursor: 'not-allowed'`.
- Code Verification in `CharacterCreator.tsx`:

| Section | Container Wrapper Style (`opacity` & `pointerEvents`) | Item Button Attribute (`disabled` & `cursor`) | Status |
|---------|-------------------------------------------------------|-----------------------------------------------|--------|
| **Beard Selector** | Line 531: `opacity: isAllFeaturesDisabled ? 0.35 : 1, pointerEvents: isAllFeaturesDisabled ? 'none' : 'auto'` | Lines 543, 555: `disabled={isAllFeaturesDisabled}`, `cursor: isAllFeaturesDisabled ? 'not-allowed' : 'pointer'` | VERIFIED PASS |
| **Mustache Selector** | Line 579: `opacity: isAllFeaturesDisabled ? 0.35 : 1, pointerEvents: isAllFeaturesDisabled ? 'none' : 'auto'` | Lines 591, 603: `disabled={isAllFeaturesDisabled}`, `cursor: isAllFeaturesDisabled ? 'not-allowed' : 'pointer'` | VERIFIED PASS |
| **Long Ears Selector** | Line 627: `opacity: isEarsAndHornsDisabled ? 0.35 : 1, pointerEvents: isEarsAndHornsDisabled ? 'none' : 'auto'` | Lines 639, 651: `disabled={isEarsAndHornsDisabled}`, `cursor: isEarsAndHornsDisabled ? 'not-allowed' : 'pointer'` | VERIFIED PASS |
| **Horns Selector** | Line 675: `opacity: isEarsAndHornsDisabled ? 0.35 : 1, pointerEvents: isEarsAndHornsDisabled ? 'none' : 'auto'` | Lines 687, 700: `disabled={isEarsAndHornsDisabled}`, `cursor: isEarsAndHornsDisabled ? 'not-allowed' : 'pointer'` | VERIFIED PASS |
| **Hair & Beard Color Palette** | Line 724: `opacity: isAllFeaturesDisabled ? 0.35 : 1, pointerEvents: isAllFeaturesDisabled ? 'none' : 'auto'` | Lines 736, 744: `disabled={isAllFeaturesDisabled}`, `cursor: isAllFeaturesDisabled ? 'not-allowed' : 'pointer'` | VERIFIED PASS |

All three required CSS properties (`opacity: 0.35`, `pointerEvents: 'none'`, `cursor: 'not-allowed'`) are correctly applied across all feature sections when restricted.
