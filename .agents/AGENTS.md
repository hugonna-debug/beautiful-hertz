# Project Rules & Customizations

### LPC Multi-Layer Rendering & Weapon Mapping Rules

1. **Sprite Sheet Row Offset Boundaries & Universal Animation Synchronization**:
   - LPC full body sheets (`bodies/*.png`), Universal facial features (beards, mustaches, horns), and Universal head sheets (`heads/*`) have 21 to 46 rows (`naturalHeight >= 1344px`).
   - Universal sheets (`naturalHeight >= 1344px` or `totalRows >= 21`) MUST calculate action row offsets (`(actionRowOffset + dirIndex) * 64`) for `spellcast` (rows 0..3), `walk` (rows 8..11), and `slash` (rows 12..15) so all attached layers animate in 100% lockstep with the body.
   - Compact 4-row / 6-row sheets (`naturalHeight <= 384px`) MUST constrain row calculations to `(dirIndex % totalRows) * 64` (rows 0..3 / Y=0..256) to prevent out-of-bounds transparency clipping.

2. **Animated Head Model Resolution**:
   - Modular subfolder head models (e.g., `human_male`, `human_female`, `orc_male`, `orc_female`) store static views under `/idle/` (2 columns) and animated cycles under `/run/` (8 columns).
   - When an action animation (`walk`, `slash`, `spellcast`) is active, `getHeadFileUrl()` MUST dynamically resolve to `/run/${tone}.png` so the head model animates in lockstep with the body animation loop.

3. **3D Spatial Thinking & Dynamic Posture Alignment**:
   - When rendering 4-row subfolder heads (`h <= 384px`) and attached facial features across active actions (`slash`, `spellcast`), apply dynamic 3D posture micro-offsets (`alignOffsetX`, `alignOffsetY`) to match the torso's 3D momentum:
     - **Slash Attack (`slash`)**: Apply windup offset (`alignOffsetX = ±1px`) on frames 0..1, and lunge offset (`alignOffsetX = ±2px`, `alignOffsetY = +1px`) on impact frames 2..3 according to directional orientation (`east`/`west`/`south`/`north`).
     - **Spellcast (`spellcast`)**: Apply vertical lift (`alignOffsetY = -1px`) on invocation frames 2..4.
   - This ensures heads, hair, beards, mustaches, horns, ears, and accessories stay connected to the neck joint as a single unified 3D entity across all directions.

4. **Equipped Weapon Sprite Synchronization**:
   - The weapon sprite rendered in character hands MUST always resolve dynamically from `state.equippedWeapon` (e.g. `equippedWeapon.name` / `equippedWeapon.id`).
   - Dynamically match inventory item names (Iron Sword -> `Sword`, Steel Battleaxe -> `axe`, Mithril Dagger -> `long_knife`, Spartan Spear -> `spartan_male`, Crusader Blade -> `crusader_male`, Kite Shield -> `kite_shield`).

5. **Overlay Artifact Cleanliness**:
   - Avoid creating un-cleared DOM overlay elements for hit/slash graphics that leave black square artifacts at animation end. Use clean CSS filter drop-shadows or self-cleaning canvas overlays.

### Standalone Rule: generate-sword

1. **Category Enforcement (Melee Only)**:
   - NEVER generate ranged weapons (bows, crossbows, firearms, magic wands, staves).
   - ONLY generate melee weapons: *Swords, Greatswords, Katanas, Daggers, Battleaxes, Warhammers, Maces, Halberds, Spears, Scythes, Rapiers, Sabers, Claws, Flails*.

2. **Strict Weapon Orientation Rule**:
   - The **handle / grip** MUST always be positioned in the **bottom-left** corner of the sprite canvas.
   - The **main blade / hammer head / damage-dealing end** MUST point diagonally towards the **top-right / right side**.

3. **Format & Resolution Requirement**:
   - Target resolution: **256x256 pixels**.
   - Format: **`.png` with 100% transparent alpha channel**.

4. **Streamlined Single-Command Execution Loop**:
   - Generate raw sprite via `generate_image` tool with a solid bright white background prompt specifying bottom-left handle / top-right blade diagonal orientation.
   - Run Python background removal and resize script `scratch/process_weapon.py`:
     ```bash
     python scratch/process_weapon.py "<input_raw_jpg>" "public/assets/unverified_weapons/<weapon_name>.png"
     ```
   - Automatically outputs clean 256x256 PNGs directly into `public/assets/unverified_weapons/` for Anchor Studio verification.

