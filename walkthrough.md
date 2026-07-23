# Idle Stats: Reforged - Walkthrough

The previous RPG game was scrapped and replaced with **Idle Stats: Reforged**, a math-heavy optimization Idle RPG. The design centers on substat re-rolling, refundable talent tree specs, endless stage climbing, and real-time DPS breakdowns.

---

## 1. Game Mechanics Details

### A. Core Mathematical Formulas
- **Net Damage Strike:**
  $$\text{Damage} = \max(1, (\text{Hero Attack} \times \text{Crit Multiplier}) - \text{Enemy Defense}) \times (1 - \text{Enemy Absorb \%}) \times \text{OverflowDamageMultiplier}$$
- **Armor Penetration:**
  $$\text{Effective Enemy Defense} = \max(0, \text{Enemy Defense} \times (1 - \text{Hero Armor Pen \%}))$$
- **Lifesteal Recovery:**
  $$\text{Heal Recovered} = \text{Damage Dealt} \times \text{Life Steal \%}$$
- **Prestige Crystals Modifier:**
  $$\text{Multiplier} = 1 + (\text{Total Crystals Earned Lifetime} \times 0.005)$$
  Applied multiplicatively to Attack, HP, Gold Booster, EXP Booster, and Shards Booster. This boost scales permanently based on all crystals earned over the life of the profile, and does **not** decrease when crystals are spent in the shop.

### B. Overcrit (Critical Rate multiples) & Bonus Critical Damage
- When Critical Rate goes over 100% (1.0), it becomes **Critical Rate multiples**:
  - `critRate <= 100%`: Displays normal `Critical Rate: X%`.
  - `critRate > 100%`: Displays `Critical Rate xN: Y%` where `N = Math.floor(critRate) + 1` and `Y = (critRate - Math.floor(critRate)) * 100`.
- **Guaranteed Critical Hit:** At 100% or higher critical rate, attacks crit 100% of the time.
- **Bonus Critical Damage Unlock:**
  - Upon reaching `Critical Rate x2` (meaning `critRate >= 1.0`), a new stat is unlocked and displayed in the Hero Diagnostics section just below Critical Damage: **Bonus Critical Damage**.
- **Threshold Mechanics & Multipliers:**
  - The starting value of `Bonus Critical Damage` is exactly **half** of your current `Critical Damage` multiplier.
  - Every time another 100% chance threshold is crossed (`critRate >= 2.0`, `critRate >= 3.0`, etc.), the previous Bonus Critical Damage is added to the base Critical Damage, and half of that new total is set as the new Bonus Critical Damage:
    $$\text{CD}_{\text{new}} = \text{CD}_{\text{old}} + \text{BonusCD}_{\text{old}}$$
    $$\text{BonusCD}_{\text{new}} = \frac{\text{CD}_{\text{new}}}{2}$$
  - **Damage Resolution:** In combat, base damage is first multiplied by the active `Critical Damage` multiplier. Then, a roll is made using the remainder percentage (e.g. `20%` if `critRate = 1.20`). If successful, the damage is multiplied *again* by the `Bonus Critical Damage` multiplier!
  - **Combat Log Messaging:** Displays the multiples details, e.g. `(CRIT! x2)` or `(CRIT! x2 + BONUS CRIT!)`, making the rolls highly readable and engaging.

### C. Substat Forging & Reforger Panel
- Gear slots: Weapon, Body Armor, Boots, Ring.
- Items roll **4 random substats** (Crit Rate %, Crit Damage %, Attack Speed %, Armor Pen %, Evade %, Lifesteal %, HP Regen, percent ATK/DEF/HP, flat HP/DEF).
- **Rarity Preservation:** When reforging, the **rolled rarity quality of each substat slot is preserved**! The stat type will change randomly (e.g. from Evasion to Crit Rate), but it will retain its exact rarity level (Common, Rare, Epic, or Legendary). This allows players to lock in high-rarity slots and re-roll their stat types until they match their ideal setup.
- **Enhance Level:** Pay Gold to upgrade basic item base stats (+15% stats per level).
- **Substat Value Scaling:**
  - Substat values are scaled and determined by:
    1. **Substat Rarity:** Common ($1.0\times$), Rare ($1.25\times$), Epic ($1.6\times$), Legendary ($2.2\times$).
    2. **Equipment Rarity:** Common ($1.0\times$), Rare ($1.25\times$), Epic ($1.6\times$), Legendary ($2.2\times$).
    3. **Equipment level (Stage):** $\text{Scale Factor} = 1 + \text{stage} \times 0.015$.
  - Formula:
    $$\text{Substat Value} = \text{BaseValueRange} \times \text{SubstatRarityMult} \times \text{EquipmentRarityMult} \times \text{StageScaleFactor}$$
  - **Upgraded Substat Scaling:** Upgraded substats scale dynamically by $+15\%$ per level:
    $$\text{Effective Substat Value} = \text{Substat Value} \times (1 + \text{substatLevel} \times 0.15)$$
  - **Gold Cost for Substat Levels:**
    - Level 1 (from 0 to 1) costs equivalent to equipment enhance level 10:
      $$\text{Cost} = \text{Math.floor}(25 \times 1.3^{10}) = 344\text{ Gold}$$
    - Each level after that costs equivalent to equipment enhance level up at $10\times$ the target level (e.g. Level 2 costs same as enhance level 20, Level 3 same as enhance level 30, etc.):
      $$\text{Cost} = \text{Math.floor}(25 \times 1.3^{\text{targetLevel} \times 10})$$
  - Reforging preserves the substat's level, ensuring investments are never lost when changing stat types.
  - **Prestige Reset:** Substat levels reset back to `0` when performing a prestige reset (even if keeping equipped gear via QoL unlocks), identical to basic item gold enhancement levels.

### D. Equipment & Substat Rarity Tiers
- **Equipment Rarity:** Items drop in **4 distinct rarity tiers** which determine their base values and roll tables:
  - **Common (COM):** 55% normal chance. `1.0x` base stat multiplier. Substat roll odds: COM 70%, RARE 20%, EPC 8%, LGD 2%.
  - **Rare (RARE):** 30% normal chance (40% Boss chance). `1.25x` base stat multiplier. Substat roll odds: COM 40%, RARE 40%, EPC 15%, LGD 5%.
  - **Epic (EPC):** 12% normal chance (45% Boss chance). `1.6x` base stat multiplier. Substat roll odds: COM 15%, RARE 40%, EPC 35%, LGD 10%.
  - **Legendary (LGD):** 3% normal chance (15% Boss chance). `2.2x` massive base stat multiplier! Substat roll odds: COM 0%, RARE 20%, EPC 50%, LGD 30%.
- **Boss Drop Loot Scaling:** Bosses fought every 10 stages have a 100% chance to drop a piece of gear, and are heavily weighted to drop Rare, Epic, or Legendary equipment (Common items never drop on Boss fights).
- **Rarity UI Highlights:** Item card borders and name labels are color-coded in both the backpack grid and equipped slot card according to their item rarity:
  - Common: Green (`#22c55e`)
  - Rare: Blue (`#3b82f6`)
  - Epic: Purple (`#a855f7`)
  - Legendary: Orange (`#f97316`)

### E. Backpack Sorting & Organization
- **Sort Dropdown:**
  - **🆕 Newest:** Sorts by acquisition timestamp (most recent first, default).
  - **📈 Level:** Sorts by base `itemLevel` (descending).
  - **➕ Enhance:** Sorts by gold upgrade `enhanceLevel` (descending).
  - **🔶 Rarity:** Sorts by item rarity tier (Legendary > Epic > Rare > Common).
  - **💎 Substats:** Sorts by total substat quality rating (sum of substat rarity weights).

### F. Refundable Talent Trees (Respec) & Overflow Talents
- Spend points earned at level up (2 per level) on 3 unique trees:
  - **Obliteration (Offense):** Primal Agility (% Atk), Precision Strike (% Crit Rate), Heavy Impact (% Crit Damage), Armor Breaker (% Armor Pen).
  - **Bastion (Defense):** Iron Constitution (% HP), Steel Plating (% Defense), Reflexive Dodge (% Evade), Vital Recup (+0.5% max HP per second per level).
  - **Siphon (Utility/Speed):** Overcharge Core (% Attack Speed), Vampiric Touch (% Lifesteal).
- **Free Respec:** Refund all talent points for free at any time to try out different optimal builds.
- **Endgame Overflow Talents:**
  - When all 10 core talents are fully maxed out (total level 160), any extra talent points can be allocated into 4 unique ascended multipliers:
    - **Overall Damage:** +2% final damage scaling multiplier per level.
    - **Overall Drops:** +2% drop rate & luck rating per level.
    - **Overall Currency:** +2% gold & shards reward scaling per level.
    - **Crystal Booster:** +2% ascension crystals earned on prestige per level.
  - **Rules:** Overflow talents cannot be respeced using the core respec action, reset on prestige, and can be upgraded again once core talents are maxed.

### G. Live Diagnostics & DPS Monitor
- Left column displays base & calculated stats in real-time, alongside a running **DPS Calculator** (averages total damage inputs over a rolling 5-second window).
- **Console Readability:** Disables the CSS text shadow on the **Kills** and **Total Damage** numerical values inside the black console box (`text-shadow: none`). This renders the white numbers on the black background as razor-sharp pixels, eliminating all blurriness.
- Lists permanent prestige prestige metrics: Gold Booster (%), EXP Booster (%), Shards Booster (%), Drop Rate Multiplier (%), and Luck Rating (%).
- **Prestige Boost Breakdowns:**
  - The Ascension Prestige HUD displays the simplified overall multiplier percentage, e.g. `+X.X%`.
  - The **Attack Power**, **Max Vitality**, **Gold Booster**, **EXP Booster**, and **Shards Booster** stats display their final total on the right side of the list, aligned with other stats.
  - The base amount and the green prestige crystal bonus are displayed immediately to the left of the final total value using inline crystal SVGs (e.g. `+30% + +6.5% 💎`), matching layout conventions.

### H. Infinite Progression Stage Climber
- **Sequential Unlocks:** Stages must be unlocked sequentially. You can only advance to the next stage after beating the current highest unlocked stage.
- **Infinite Ascent:** Stages count up from Stage 1 to infinity! Enemy stats scale exponentially per stage:
  - $$\text{Enemy HP} = 50 \times 1.14^{\text{stage}-1} \times \text{tierHPScale}$$
  - $$\text{Enemy ATK} = 6 \times 1.09^{\text{stage}-1} \times \text{tierAtkScale}$$
  - $$\text{Enemy DEF} = 2 \times 1.07^{\text{stage}-1}$$
- **Dungeon Fallback Loop:** If you die, the game automatically drops back 1 stage to farm safely in the background (preventing the game from getting stuck).
- **Boss Fights:** Every 10 stages features a boss fight with +60% HP and +40% Attack. Bosses drop set items 100% of the time.

### I. Stage-Based Prestige (Ascension)
- **Prestige Requirement:** Prestige is gated by stage progress rather than character level. Players must **complete Stage 50** (meaning `maxUnlockedStage > 50`) to perform a Matrix Ascension.
- **Dynamic Crystal Rewards:** Claim permanent stats multipliers scaling directly with stages completed beyond Stage 50:
  $$\text{Ascension Crystals Reward} = \text{maxUnlockedStage} - 50$$
- **Prestige Reset Behavior:** Ascending resets Level to 1, Gold to 50, Reforge Shards to 15, current Stage to 1, and clears backpack gear and talent trees. It also resets `maxUnlockedStage` back to 1, requiring players to climb stages again.

### J. Permanent Prestige Shop
Ascending for the first time unlocks the **Prestige Shop** tab. Spend Ascension Crystals on permanent, profile-wide upgrades:
- **Cost Scaling Penalty:**
  $$\text{Upgrade Cost} = \text{Math.floor}(\text{BasePrice} \times 1.2^{\text{currentLevel}} \times (1 + \text{totalUpgradesPurchased} \times 0.10))$$
  Buying any upgrade slightly increases the cost of **all upgrades** by **+10%**, encouraging planning.
- **Stackable Upgrades (No Level Cap):**
  - **Attack Power:** +5% total Attack per level.
  - **Defense Rating:** +5% total Defense per level.
  - **Max Vitality:** +5% total HP per level.
  - **Critical Rate:** +1% Critical Hit Rate per level (no maximum cap).
  - **Critical Damage:** +10% Crit Damage per level.
  - **Vampiric Life Steal:** +1% life recovered per attack hit.
  - **Health Regen/Sec:** +0.5% max HP regenerated per second per level.
  - **Gold Booster:** +10% gold rewards per level.
  - **EXP Booster:** +10% experience rewards per level.
  - **Shards Booster:** +10% reforge shards rewards per level.
  - **Drop Rate Booster:** +1% item drop rate multiplier per level. Evaluated as:
    $$\text{Final Drop Chance} = 0.15 \times (1 + \text{dropRateUpgrade} \times 0.01)$$
  - **Luck Booster:** +1% Luck rating per level. Increases absolute chance of rolling higher item rarity by +0.2% per level, and absolute chance of rolling higher substat rarity slots by +0.2% per level (yielding 1% total rarity benefit per level).
  - **Expanded Backpack:** +1 maximum backpack inventory capacity slot per level (infinite).
  - **Substat Slot Max Levels (Slots 1-4):** Each level bought unlocks +1 maximum upgrade level cap for the corresponding substat slot index on all items.
- **Capped Upgrades:**
  - **Attack Speed:** +1% per level (capped at +30%).
  - **Armor Penetration:** +1% per level (capped at +50%).
  - **Evade/Dodge:** +1% absolute evasion chance per level (capped at +25%).
  - **Damage Absorption:** +1% direct damage reduction per level (capped at +40%).
- **Permanent QoL Unlocks & Retention:**
  - **EXP Retention:** Retains +9% of cumulative EXP earned per level on prestige reset, capped at level 10 (+90% EXP retention). Re-calculates and levels up the character instantly upon prestige. Base price is 40 crystals.
  - **Keep Weapon/Body/Boots/Ring on Prestige:** Preserves the corresponding equipped slot items across prestiges. Resets their gold `enhanceLevel` to 0, but retains base `itemLevel`, `baseValue`, and all rolled substat rarity slots.
  - **Multi-Scrapper:** Unlocks a red `♻️ SCRAP ALL` button in the backpack interface to instantly scrap all non-equipped items matching the active slot filter tab.
  - **Auto-Scrapper:** Automatically scraps gear drops instantly in the background. Unlocks a configuration panel to filter auto-scrapping by rarities (Common, Rare, Epic, Legendary).
  - **Auto-Scrapper Substats Threshold Filter:** Replaced the simple protect checkbox with **4 exclusive checkboxes (labeled 1 through 4)** next to the substats keep filter. Selecting a checkbox (e.g. `2`) protects drops from being auto-scrapped if they possess at least that count of Legendary substats. Clicking an active selection unselects it (setting value to `0`), allowing players to scrap items regardless of substat quality.

### K. Dynamic Backpack Slots Expansion & Temporary Shard Upgrades
- **Max Backpack Size Calculation:**
  $$\text{Max Capacity} = 30 + \text{PrestigeBagSlots} + \text{TemporaryBagSlots}$$
- **Temporary Shard Upgrades:**
  - Placed directly below the backpack grid layout in the Forge/Refit manager tab.
  - Buy extra capacity slots for Reforge Shards:
    $$\text{Shard Cost} = \text{Math.floor}(100 \times 1.2^{\text{TemporaryBagSlots}})$$
  - **Ascension Reset:** Both the temporary slots count and their shard purchase cost reset back to base levels (`0` slots and `100` shards) upon Ascension Prestige.

### L. Animated 2D Combat Arena & Custom Vector Gear
- **Arena Toggle:** Added a Tab segmented selector (ARENA vs LOGS) inside the Battle Console. Defaults to the beautiful Animated Arena view.
- **Dynamic Avatar Render:** The player's SVG avatar dynamically wears equipped item slots:
  - **Weapon:** Renders specialized SVGs based on name keywords. Holds the custom weapon sprite in the main hand (or both hands for daggers), scaled and rotated.
  - **Body Armor:** Draws distinct chest armor panels. Wears the custom chestplate or robe sprite overlaid perfectly on the torso.
  - **Helmets / Helmet Visors:** Draws full wizard hoods, knight visor helmets with crest feathers, or neon cyber goggles matching the armor's theme.
  - **Boots:** Renders light winged speed boots or heavy iron plate boots with neon jet boosters on the heels. Wears the custom foot sprites aligned with the feet bones.
  - **Ring:** Draws a glowing neon energy ring orbiting around the player.
- **Combat Animations:**
  - **Idle Bobbing/Breathing:** Continuous vertical breathing bob and rotational lean animations (`playerIdle` and `enemyIdle`) for both character models, preventing static sprites.
  - **Unified Attacking Lunge:** The player performs a single clean forward-upward lunge (`playerLungeAttack`) for all attacks: projects `130px` forward and `22px` upward at a high angle, then snaps back to starting position.
  - **Snap-Back Trajectory:** Programmed quick recovery curves into all keyframe tracks to return the character to their base coordinates immediately after impact, preparing them for the next hit.
  - **Animation State Key Resets:** Employs a dynamic keying mechanism (`key={attackTriggerId}`) on the player and enemy avatar containers. This forces a DOM unmount/re-mount on every combat strike, guaranteeing the browser triggers the CSS attack transforms instantly even under rapid consecutive hit rates.
  - **Two-Attack Spanning System:** Doubles the player's attack animation speed scaling ratio so that each animation plays over the duration of two full attack intervals. This ensures high-velocity attacks still enjoy highly visible, fluid, and readable animations.
  - **Attack Speed Scaling System:** Dynamically computes and adjusts animation speed in real-time. The active animation duration scales inversely with `heroStats.atkSpeed`, keeping visuals synchronized with statistical attack ticks.
  - Dynamic slash particle overlay effects corresponding to damage hits.
  - Floating scrolling damage numbers colored green (normal hit), yellow/pink (Critical strikes), or red (incoming hero damage).
  - Instantly unmounts and mounts elements using key transitions so monster spawns are clean.
  - Enemy appearances correspond to their naming patterns (Rock Golems, Green Beasts, Wraiths, Void Eyes, metallic drones).
  - Boss monsters display shining golden crown decorations.
  - **Sprites-on-Avatar Integration:** Configured the player's 2D character avatar inside the Battle Arena to overlay the exact same custom equipment vector sprites (`renderEquipmentSpriteInner`) as the inventory, replacing generic placeholder rectangles:
    - **Weapon:** Holds the custom weapon sprite in the main hand (or both hands for daggers), scaled and rotated.
    - **Body Armor:** Wears the custom chestplate or robe sprite overlaid perfectly on the torso.
    - **Boots:** Wears the custom foot sprites (winged, plated, or rocket boosted) aligned with the feet bones.
    - **Ring:** The custom glowing energy ring SVG orbits the character body continuously.
  - **Fleshed Out Character Avatar Model:** Replaced simple generic lines/shapes with a comprehensive anatomical vector layout under the gear:
    - **Anatomical Base:** Added a skin-colored neck (`#fca5a5`), full base skin chestplate torso, double leg blocks, and detailed forearm skin paths with thick retro border outlines underneath the armor.
    - **Precise Gear Connects:** Torso armor is sized `50px` wide, boots overlap the leg columns perfectly, and weapons hilt is held precisely in the player's hands.
    - **Custom Head Personalization Options:** Programmed a character customization engine (`renderCustomHeadDetails`) that hashes the user's Profile Name to grant 1 of 4 spiky hairstyles (Neon Cyan Spike, Pink Warlock Cape, Gold Mohawk, or Cyber Horns) and 1 of 4 face details (Cyber Visor goggles, Dual scars, Forehead gem, or Paint lines) completely independent of equipment slots, keeping their hero unique.
    - **Background Orbiting Ring Spinner:** Relocated the equipped Ring rendering layer to the back of the character model to prevent overlap glitches. The orbit circle has been scaled down (to `54px` / radius `46px`) to surround the character model cleanly, and runs a rapid `1.2s` rotation that spins the ring itself around its own axis once per orbit (`360deg`).
    - **Dotted Aura Circle Removal on Avatar:** Enabled an optional boolean flag `hideAuraRing` inside the vector sprites drawing engine. Setting this to `true` disables the dotted rarity aura rings on equipped slots when rendered on the combat character model, preventing visual clutter while preserving the rings inside the inventory grid.

### M. Backpack Item Inspector Upgrades
- When clicking on any item in the backpack grid, the **Backpack Item Inspector Card** renders additional statistics details:
  - **Item Level:** Displays base drop level of the gear.
  - **Enhancement Level:** Displays current gold upgrade level (e.g. `+X`).
  - **Base Stat Value Scaling:** Visualizes current base attribute (Attack Power, Defense Rating, Max Vitality, or Critical Rate) alongside its upgraded value (e.g., `X → Y` where `Y` is the final value scaled by $+15\%$ per enhancement level).

### N. High Contrast Text Outlines & Theme Legibility
- Installed global retro-stylized `text-shadow` outline styles across both light and dark modes:
  - **Light Mode:** High contrast outlines using `#ffffff` offsets, ensuring black text elements popped vividly against colorful backgrounds.
  - **Dark Mode:** High contrast outlines using `#1a1a1f` (dark slate grey), which matches panel backgrounds and eliminates the blurry, harsh black halo outlines, offering clean, text reading.
  - **Active State Override:** Disables the shadow outline on active tabs, selected backpack slots, and bright neon active buttons (`text-shadow: none !important`) so the pure black text reads perfectly sharp and crisp on their high-contrast neon backgrounds.
  - **Ascension & Enhancement Text Sharpening:** Disabled the CSS outline shadows (`text-shadow: none`) on the Matrix Ascension trigger button, equipped slot enhancement level tags, backpack item grid cards level indicators, and the stats breakdown panel's enhancement scaling readouts. This renders the labels and numbers with sharp, crystal-clear pixel borders, enhancing legibility.
  - **Enhance Level Contrast Color:** Changed the text color of the **Enhance Lvl** parameter inside the inspector card to use `#1d4ed8` (vibrant dark royal blue) in light mode and `var(--neon-cyan)` in dark mode, ensuring solid readability on light panels.
  - **Item Card Layout Spacing & Text Contrast:** Updated the item buttons inside the backpack grid:
    - Added vertical padding (`paddingTop: '16px'`, `paddingBottom: '4px'`) and shifted contents to align from the bottom (`justifyContent: 'flex-end'`), preventing overlaps with top-anchored badges.
    - Set the **Lvl** label color to pure high-contrast black (`#000000`) in light mode and pure white (`#ffffff`) in dark mode.
    - Redesigned the **SET** badge with a gold background (`#fbbf24`), black text (`#000000`), a solid outline border, and larger bold font sizing for clear legibility.

### O. Forge & Refit Color Schemes
- Removed the bright neon pink highlight background from active/selected slots tabs and active clicked-on inventory slots inside the Forge & Refit manager.
- Replaced with bright neon cyan (`var(--neon-cyan)`) highlights to provide a cleaner, unified color scheme across both light and dark interface configurations.
- **Scrap All Action:** Customized the `♻️ SCRAP ALL` button with a specialized class `.scrap-all-btn` that overrides standard button properties. Forces a high-contrast crimson-red background and bright neon yellow warning text with a thick black outline shadow for maximum pop.
- **In-Game Scrap All Confirmation Modal:** Replaced the browser native `window.confirm` dialog popup with a highly stylized, retro cyberpunk in-game overlay modal. Features responsive blur backdrops, a dark-slate/white border layout, warning color schemes, and sharp buttons.

### P. Liquid Rainbow Game Title & Rotating Crystal Banner
- The top header title has been rebranded to **MIN-MAXXED** with custom vector-crafted letterforms:
  - The **I** in MIN is styled as a downwards-pointing arrow and runs a bouncy slide animation (`arrowSlideDown`) styled with a glowing cyan drop-shadow.
  - The **A** in MAXXED is styled as an upwards-pointing arrow and runs a bouncy slide animation (`arrowSlideUp`) styled with a glowing pink drop-shadow.
  - **Flowing Color Gradient:** The text runs a dynamic shifting background gradient (`gradientShift`) cycling through neon pink, violet, and neon cyan like light fluid.
  - **Micro-Elastic Hover:** Hovering over the title scales it up (+4% elastic cubic-bezier) and expands its letter-spacing dynamically.
  - **Rotating Crystal Spinner:** The Crystal Icon next to the title runs a slow continuous 360-degree rotation and scaling pulse animation (`crystalSpin`).
  - **Subtitle Redesign:** Replaced the subtitle with a colorful and gamified banner: `The Min-Maxer's Optimization Playground`, framed by a custom `-` (minus) SVG vector icon on the left, and a `+` (plus) SVG vector icon on the right, matching the math optimization design motif.

### Q. Custom Vector Equipment Sprites System
- Programmed a comprehensive vector sprite engine (`renderEquipmentSprite`) to construct detailed, dynamic SVGs for all equipment:
  - **Weapons:** Custom drawings for Katanas/Sabers (slender blade), Staves/Wands (orbiting orb heads), Bows (bowstring + arrow), Daggers (short double blade), Axes/Hammers (heavy heads), and Spears/Halberds (long pointed tips).
  - **Body Armor:** Flowing cloaks/robes, solid plates with Pauldrons, or cybernetic cores.
  - **Boots:** Winged boots, plate greaves, or rocket jet boosters with thrust particle overlays.
  - **Rings:** Thick gold bands with ruby jewels, loop bands with celestial orbit paths, or digital grid circuits.
  - **Rarity Highlights:** Colors the outline aura and elements based on item quality (Green for Common, Blue for Rare, Purple for Epic, Orange/Gold for Legendary).
  - **Set/Name Adaptations:** Reads naming tokens and set settings to adjust vector details, colors, and shapes in real-time.
  - **Integrations:** Embeds these sprites inside:
    - **Backpack Card Grid:** Renders a 28px icon in each cell.
    - **Equipped Slot Cards:** Renders a 36px icon in each equipped panel.
    - **Inspector Details Card:** Renders a 38px icon in a dedicated display border at the top-left of the card.

### R. Custom Head Selection System
- **Combat Core Hub Tabs:** Upgraded the battle console toggle headers into a three-way Segment Tab: `ARENA`, `LOGS`, and `HEADS`.
- **Heads Selection Grid:** Clicking the `HEADS` tab renders a beautiful grid of 15 custom head styles spanning various categories:
  - **Normal:** Novice Skin (default skin showing custom name-hashed hair options).
  - **Cool:** Cyber Goggles (glowing neon cyber bands), Cosmo Visor (astronaut helmet reflection map), Ghost Hood (shadow assassin hood with glowing cyan eyes).
  - **Funny:** Spooky Pumpkin (flaming Jack-o'-lantern), Slime Blobby (wobbly green slime), Boxy (marker-drawn cardboard box), Neko Ears (high-fidelity cat ears).
  - **Strong:** Vanguard Helm (steel knight armor with red plume), Dread Horns (red skull with obsidian demon horns), Crown Royal (gold monarch crown).
  - **Weird:** Void Beholder (floating cosmic eyeball), Robo-Core (retro green sine wave monitor), Star Caster (cosmic blue wizard hat), Doctor Beak (plague doctor respirator).
- **Persistent Cosmetics:** Saves the selected head ID inside the persistent LocalStorage game profile. The custom head selection is preserved across prestige matrix resets, keeping user visuals consistent.

