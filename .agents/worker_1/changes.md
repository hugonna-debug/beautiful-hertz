# Detailed Code & Asset Changes

## 1. Asset Relocation & Manifest Clean Up
- **Desktop Assets**:
  - Moved non-rendering/multi-sprite enemy PNG files (`Spritesheet - Base_Charas (1).png`, `Spritesheet - Base_Charas (1)_mirrored.png`, `dg_monster532.png`, `dg_monster532_mirrored.png`, `dg_monster732.png`, `dg_monster732_mirrored.png`) from `C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified enemies` to `C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render enemies`.
  - Moved all 13,083 64x64 weapon PNG files from `C:\Users\hudso\Desktop\Game Assets\min max standard\verified\verified weapons` to `C:\Users\hudso\Desktop\Game Assets\min max standard\no render\no render weapons`.
- **Active Public Assets & Manifest**:
  - Removed moved non-rendering enemy PNG files from `public/assets/min_max/enemies` and updated `public/assets/min_max/min_max_manifest.json` to omit them.
  - Omitted moved weapon assets from `public/assets/min_max/weapons`.

## 2. R1 Code Implementation (`src/hooks/useGameState.ts`)
- Refactored `getEnemyForStage` to implement species-priority keyword matching:
  - Priority list of species nouns: `slime`, `wolf`, `bat`, `skeleton`, `goblin`, `orc`, `demon`, `dragon`, `zombie`, `lich`, `abomination`, `spider`, `golem`, `drone`, `eye`, `rat`, `ent`, `imp`, `crawler`, `spectre`, `gladiator`, `griffin`, `sentinel`, `colossus`, `champion`, `architect`, `devourer`, `overlord`, `wyrm`, `entity`, `guard`.
  - 3-letter species keywords (`bat`, `orc`, `rat`, `ent`, `imp`, `eye`) match accurately.
  - Species nouns take priority over generic adjectives ("forest", "king", "shadow", "cyber", "solar", "void").
- Verified `BattleConsole.tsx` displays `activeEnemy.sprite` in 2D Arena View with hit flash / death animations.

## 3. R2 & R3 Code Implementation (`src/components/LpcCharacterCanvas.tsx` & `lpc_manifest.json`)
- **`public/assets/lpc/lpc_manifest.json`**:
  - Populated `"shoes"` array with valid LPC shoe/boot layers (`plate_boots`, `shoe_basic_male`, `shoe_plate_toe_male`, `shoe_socks_shoes_black`).
- **`src/components/LpcCharacterCanvas.tsx`**:
  - Updated `equippedBody` armor matching logic so equipped body armor (Chainmail, Leather, Plate, Golden, Mithril) matches dynamically by `equippedBody.name` or `id`.
  - Updated `equippedBoots` rendering logic so equipped boots (Leather Shoes, Iron Boots) resolve to a valid boots LPC layer (`/assets/lpc/torso/lpcfemaleplateboots.png` or manifest fallback) instead of evaluating to `undefined` when `manifest.shoes` is empty.
  - Preserved LPC height boundary constraint rule: `naturalHeight <= 384px` -> `(dirIndex % totalRows) * 64` (`dirIndex * 64`), preventing torso/boots/pants/hair/accessories from vanishing during slash attack cycles (`action === 'slash'`).
  - Updated weapon sprite resolution from `state.equippedWeapon` so weapon sprite dynamically resolves and renders in character hands during walk and attack animations without clipping, flickering, or floating.

## 4. Testing & Build Fixes
- **`src/tests/gameState.test.ts`**:
  - Added unit test `should prioritize species nouns over generic adjectives and match 3-letter species properly`.
- **`vite.config.ts`**:
  - Added `build: { emptyOutDir: false }` to fix Windows filesystem locking ENOTEMPTY build errors.
