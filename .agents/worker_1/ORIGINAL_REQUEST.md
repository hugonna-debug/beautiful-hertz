## 2026-07-23T03:50:27Z
You are Worker 1. Your working directory is C:\Users\hudso\.gemini\antigravity\worktrees\beautiful-hertz\feature-creep-clicker-game\.agents\worker_1.

DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Read PROJECT.md at C:\Users\hudso\.gemini\antigravity\worktrees\beautiful-hertz\feature-creep-clicker-game\.agents\orchestrator\PROJECT.md and handoff reports from Explorers at:
- `.agents/explorer_1/handoff.md`
- `.agents/explorer_2/handoff.md`
- `.agents/explorer_3/handoff.md`

Your Task:
Implement Requirements R1 through R4 across `src/components/LpcCharacterCanvas.tsx`, `src/components/CharacterCreator.tsx`, and `src/tests/lpcLayerSpec.test.ts`:

1. **R1: Comprehensive Layer Spec Flag Validation & Audit Suite (`LpcCharacterCanvas.tsx`)**:
   - Ensure `LayerSpec` interface in `LpcCharacterCanvas.tsx` has explicit flags: `isBody`, `isHead`, `isHair`, `isFacialHair`, `isEars`, `isAcc`, `isLegs`.
   - Export a pure layer spec builder function `getCharacterLayerSpecs(config)` (or similar) and export an `auditLayerSpecs(layers: LayerSpec[]): { valid: boolean; errors: string[] }` function that validates 100% of layers carry at least one valid boolean flag, returning errors if any layer spec is missing its classification flag.
   - Run `auditLayerSpecs` inside canvas rendering `useEffect` before rendering layers, throwing an error or logging a warning if invalid layer specs are detected.

2. **R2: Head-Centric Attachment & 3D Posture Alignment Engine (`LpcCharacterCanvas.tsx`)**:
   - Verify Tier 1 subfolder head resolution: head model uses `/run/${tone}.png` during animations (`walk`, `slash`, `spellcast`).
   - Verify Tier 2 feature attachments (hair, beard, mustache, horns, long ears, accessories) use direction row index `(dirIndex % totalRows) * 64`.
   - Inherit 100% of 3D posture micro-offsets (`alignOffsetX`, `alignOffsetY`) during slash attacks and spellcasts and walk frame bobbing (+2px on cols 1/5, -1px on cols 3/7) across head and all 7 attached sub-layers.
   - Lock relative Y-distance between head model top/face and attached face features at 17px across all 8 walk frames, 6 slash frames, and 7 spellcast frames across all 4 directions.
   - Ensure long ears dynamically tint using canvas `multiply` composite operations to match selected skin tone swatches.

3. **R3: Automated Vitest Suite for Layer Specs & Offset Integrity (`src/tests/lpcLayerSpec.test.ts`)**:
   - Add unit tests verifying:
     a. `auditLayerSpecs` passes for all character layer compositions and fails if any flag is missing.
     b. Facial features (beard, mustache, horns, ears, hair, accessories) correctly carry `isFacialHair: true`, `isEars: true`, `isHair: true`, or `isAcc: true`.
     c. Walk frame bobbing (+2px on cols 1/5, -1px on cols 3/7) and 3D posture micro-offsets (`alignOffsetX`, `alignOffsetY`) match between Head and attached features, locking relative Y-distance at 17px.
     d. Gender compatibility (`getCompatibleHeads`, `isHeadCompatibleWithBody`) and full-mask/head override flags (Sheep head, Orc heads, Lizard mask, Minotaur mask, etc.) correctly enable/disable layer specs.

4. **R4: Character Creator UI Visual Feedback & Verification (`CharacterCreator.tsx`)**:
   - Ensure disabled/greyed-out states (`opacity: 0.35`, `pointerEvents: 'none'`, `cursor: 'not-allowed'`) are correctly applied for feature selections restricted by active head models.
   - Ensure seamless tab navigation between Base & Head and Facial Features.
   - Ensure 56px visual square mini-canvas preview buttons for all options.

5. **Build and Verification**:
   - Execute `npx tsc -b` to verify 0 type compilation errors.
   - Execute `npx vitest run` to verify 100% unit tests pass.
   - Record exact commands, outputs, changes, and test results in `.agents/worker_1/handoff.md`.
   - Send a message back to the parent orchestrator when complete.
