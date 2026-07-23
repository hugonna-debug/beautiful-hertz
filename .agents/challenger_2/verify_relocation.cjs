const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\hudso\\Desktop\\Game Assets\\min max standard';
const noRenderDir = path.join(baseDir, 'no render');
const verifiedDir = path.join(baseDir, 'verified');

function getAllFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllFiles(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function getPngDimensions(filePath) {
  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(24);
    fs.readSync(fd, buffer, 0, 24, 0);
    fs.closeSync(fd);

    if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4E || buffer[3] !== 0x47) {
      return { valid: false, reason: 'Invalid PNG header signature' };
    }

    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { valid: true, width, height };
  } catch (e) {
    return { valid: false, reason: e.message };
  }
}

// 1. Check weapon files in no render
const allNoRenderFiles = getAllFiles(noRenderDir);
const noRenderWeapons = allNoRenderFiles.filter(f => f.includes('no render weapons') || f.includes('weapon'));
const targetGridFileNames = [
  'Spritesheet - Base_Charas (1).png',
  'Spritesheet - Base_Charas (1)_mirrored.png',
  'dg_monster532.png',
  'dg_monster532_mirrored.png',
  'dg_monster732.png',
  'dg_monster732_mirrored.png'
];

const foundEnemyGrids = allNoRenderFiles.filter(f => {
  const baseName = path.basename(f);
  return targetGridFileNames.includes(baseName);
});

console.log(`=== 1. NO RENDER VERIFICATION ===`);
console.log(`Total files in 'no render': ${allNoRenderFiles.length}`);
console.log(`Weapons in 'no render weapons': ${noRenderWeapons.length}`);
console.log(`Target Enemy Grid files found in 'no render': ${foundEnemyGrids.length} / 6`);
foundEnemyGrids.forEach(f => console.log(`  - ${path.basename(f)} at ${f}`));

// 2. Check verified directories
console.log(`\n=== 2. VERIFIED FOLDERS CLEANLINESS & INTEGRITY ===`);

const verifiedEnemiesPath = path.join(verifiedDir, 'verified enemies');
const verifiedBodyPath = path.join(verifiedDir, 'verified body');
const verifiedBootsPath = path.join(verifiedDir, 'verified boots');
const verifiedWeaponsPath = path.join(verifiedDir, 'verified weapons');

function auditVerifiedFolder(folderName, folderPath, expectedDimsCheck) {
  if (!fs.existsSync(folderPath)) {
    console.log(`[${folderName}] Directory does not exist (0 files).`);
    return { total: 0, invalid: 0, nonConforming: 0 };
  }
  const files = getAllFiles(folderPath);
  let invalidCount = 0;
  let nonConformingCount = 0;
  const dimStats = {};

  for (const filePath of files) {
    const dim = getPngDimensions(filePath);
    if (!dim.valid) {
      invalidCount++;
      console.log(`  [INVALID FILE] ${filePath}: ${dim.reason}`);
    } else {
      const key = `${dim.width}x${dim.height}`;
      dimStats[key] = (dimStats[key] || 0) + 1;
      if (expectedDimsCheck && !expectedDimsCheck(dim.width, dim.height, filePath)) {
        nonConformingCount++;
        console.log(`  [NON-CONFORMING] ${filePath} (${key})`);
      }
    }
  }

  console.log(`[${folderName}] Total files: ${files.length}`);
  console.log(`  Invalid/Corrupt PNGs: ${invalidCount}`);
  console.log(`  Non-conforming Assets: ${nonConformingCount}`);
  console.log(`  Dimension distribution:`, dimStats);

  return { total: files.length, invalid: invalidCount, nonConforming: nonConformingCount, dimStats };
}

// Audit verified enemies (expected: clean 64x64 single sprites)
console.log('\n--- Auditing Verified Enemies ---');
const enemiesAudit = auditVerifiedFolder('verified enemies', verifiedEnemiesPath, (w, h) => w === 64 && h === 64);

// Audit verified body (expected: LPC valid dimensions, e.g., 832x1344 or 832x256/384 or standard 64px multiple LPC sheets)
console.log('\n--- Auditing Verified Body ---');
const bodyAudit = auditVerifiedFolder('verified body', verifiedBodyPath, (w, h) => w % 64 === 0 && h % 64 === 0);

// Audit verified boots (expected: LPC valid dimensions)
console.log('\n--- Auditing Verified Boots ---');
const bootsAudit = auditVerifiedFolder('verified boots', verifiedBootsPath, (w, h) => w % 64 === 0 && h % 64 === 0);

// Audit verified weapons (expected: 0 files)
console.log('\n--- Auditing Verified Weapons ---');
const weaponsAudit = auditVerifiedFolder('verified weapons', verifiedWeaponsPath, () => true);

console.log(`\n=== SUMMARY OF ASSET RELOCATION ===`);
console.log(`Relocated Weapon Files in 'no render': ${noRenderWeapons.length}`);
console.log(`Relocated Enemy Grids in 'no render': ${foundEnemyGrids.length} / 6`);
console.log(`Remaining Assets in 'verified weapons': ${weaponsAudit.total}`);
console.log(`Invalid/Broken Assets in verified enemies: ${enemiesAudit.invalid + enemiesAudit.nonConforming}`);
console.log(`Invalid/Broken Assets in verified body: ${bodyAudit.invalid + bodyAudit.nonConforming}`);
console.log(`Invalid/Broken Assets in verified boots: ${bootsAudit.invalid + bootsAudit.nonConforming}`);
